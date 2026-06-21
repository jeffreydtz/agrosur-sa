// ============================================================
// engine.js — Lógica del juego (puro, sin React)
// ============================================================
import {
  ARQUETIPOS, AFIN_BY_ARQ, FINALES, MISIONES, CRISIS_MOTIN, CRISIS_OFERTA,
  EVENTO_DOLAR, eventoSeVa,
} from "./data.js";
import { POOL, POOL_BY_ID } from "./dataPool.js";
import { sortearEventosMenores, EVENTOS_MENORES } from "./dataEventos.js";

export const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));

const VISIBLES = ["caja", "confianza", "adopcion", "motivacion"];

// Cantidad de cartas del cuerpo (sorteadas) + crisis + balance = 13 round-steps
export const DECK_BODY_LEN = 11;
export const TOTAL_RONDAS = DECK_BODY_LEN + 2; // = 13 (cuerpo + crisis + balance)

// Fisher-Yates: copia barajada
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ¿La categoría de la opción está FUERA del perfil del arquetipo?
// Sin `cat` -> se trata como en perfil (neutral).
export function esOffProfile(estado, opcion) {
  if (!opcion || !opcion.cat) return false;
  const afin = AFIN_BY_ARQ[estado.arquetipo] || [];
  return !afin.includes(opcion.cat);
}

// Bonus de puntaje cuando una jugada fuera de perfil sale bien
const OFF_PROFILE_BONUS_MULT = 1.6;

// --- Apuesta fuera de perfil ---------------------------------------------
// Una opción FUERA de perfil, SIN dado y con efecto neto positivo deja de ser
// un bonus gratis: el motor la convierte en una tirada 2d6 (umbral 8+ por el
// +1 off-profile). Sale bien (~42%) -> el efecto base ×1.15 + el ×1.6 de
// puntos (ahora ganado). Rebota -> sólo los positivos se invierten ×-0.6,
// con un piso de castigo al indicador líder y un poco de resistencia oculta.
const OFF_GAMBLE_EXITO_SCALE = 1.15;   // amplifica el efecto base al ganar
const OFF_GAMBLE_FRACASO_SCALE = -0.6; // invierte sólo los positivos al perder
const OFF_GAMBLE_FRACASO_FLOOR = -4;   // castigo extra al indicador líder
const OFF_GAMBLE_FRACASO_RESIST = 4;   // sube resistencia oculta al rebotar

// Estado inicial de una empresa según arquetipo
export function nuevoEstado(arqId, nombreJugador) {
  const a = ARQUETIPOS.find((x) => x.id === arqId) || ARQUETIPOS[0];
  return {
    nombreJugador: nombreJugador || a.nombre,
    arquetipo: a.id,
    arqNombre: a.nombre,
    arqEmoji: a.emoji,
    caja: a.caja,
    confianza: a.confianza,
    adopcion: a.adopcion,
    motivacion: a.motivacion,
    resistencia: a.resistencia, // OCULTO
    flags: [],
    log: [],          // historial de decisiones
    resistHist: [a.resistencia],
    terminado: false,
    motivoFin: null,  // 'quiebra' | 'exodo' | null
    // --- progresión lúdica ---
    rondasJugadas: 0,
    racha: 0,
    mejorRacha: 0,
    offWins: 0,        // decisiones FUERA de perfil ganadas
    onWins: 0,         // decisiones EN perfil ganadas
    puntaje: 0,
    ptsMisiones: 0,
    minCaja: a.caja,
    minIndicador: Math.min(a.caja, a.confianza, a.adopcion, a.motivacion),
    misiones: {},     // { misionId: true }
  };
}

// Aplica un objeto de efectos {caja, confianza, adopcion, motivacion} al estado (inmutable)
export function aplicarEfectos(estado, ef) {
  const n = { ...estado };
  if (!ef) return n;
  for (const k of VISIBLES) {
    if (ef[k] != null) n[k] = clamp(n[k] + ef[k]);
  }
  return n;
}

export function aplicarResistencia(estado, delta) {
  if (!delta) return estado;
  const n = { ...estado };
  n.resistencia = clamp(n.resistencia + delta);
  n.resistHist = [...n.resistHist, n.resistencia];
  return n;
}

export function agregarFlags(estado, flagStr) {
  if (!flagStr) return estado;
  const nuevos = flagStr.split("|").map((f) => f.trim()).filter(Boolean);
  return { ...estado, flags: [...estado.flags, ...nuevos] };
}

// Chequea fin anticipado
export function chequearFin(estado) {
  const n = { ...estado };
  if (n.caja <= 0) { n.terminado = true; n.motivoFin = "quiebra"; }
  else if (n.confianza <= 10) { n.terminado = true; n.motivoFin = "exodo"; }
  return n;
}

// Umbral de los dados (2d6): 7+ normal (~58%); 9+ si el indicador relacionado
// está en rojo (<30) (~28%). mod: ajuste por variante de carta.
export function umbralDado(estado, rel, mod = 0) {
  const base = rel && estado[rel] != null && estado[rel] < 30 ? 9 : 7;
  return Math.max(3, Math.min(11, base + mod));
}

// Tira 2d6
export function tirarDados() {
  const d1 = 1 + Math.floor(Math.random() * 6);
  const d2 = 1 + Math.floor(Math.random() * 6);
  return { d1, d2, total: d1 + d2 };
}

// --- helpers internos ---

function snapshot(s) {
  const o = {};
  for (const k of VISIBLES) o[k] = s[k];
  return o;
}

function calcDeltas(antes, despues) {
  const d = {};
  for (const k of VISIBLES) {
    const v = despues[k] - antes[k];
    if (v !== 0) d[k] = v;
  }
  return d;
}

function actualizarTrackers(s) {
  const n = { ...s };
  n.minCaja = Math.min(n.minCaja, n.caja);
  n.minIndicador = Math.min(n.minIndicador, n.caja, n.confianza, n.adopcion, n.motivacion);
  return n;
}

// Escala una rama de dado ×factor (redondeo alejándose de cero)
function escalarRama(rama, factor) {
  const out = { ...rama };
  if (rama.ef) {
    out.ef = {};
    for (const k of Object.keys(rama.ef)) {
      const v = rama.ef[k] * factor;
      out.ef[k] = v >= 0 ? Math.ceil(v) : Math.floor(v);
    }
  }
  if (rama.resist) {
    const r = rama.resist * factor;
    out.resist = r >= 0 ? Math.ceil(r) : Math.floor(r);
  }
  return out;
}

// ¿La suma de los 4 visibles de un ef es positiva?
function netoPositivo(ef) {
  if (!ef) return false;
  return VISIBLES.reduce((a, k) => a + (ef[k] || 0), 0) > 0;
}

// Indicador líder de un ef: el visible de mayor magnitud absoluta.
function relInferido(ef) {
  if (!ef) return null;
  let best = null, mag = 0;
  for (const k of VISIBLES) {
    const v = Math.abs(ef[k] || 0);
    if (v > mag) { mag = v; best = k; }
  }
  return best;
}

// Convierte un {exito, fracaso} de ef plano (offEf autorado) en un dado normal.
function normalizarOffEf(offEf) {
  if (!offEf) return null;
  return { exito: { ef: { ...offEf.exito } }, fracaso: { ef: { ...offEf.fracaso } } };
}

// Dado sintético para una apuesta fuera de perfil a partir de un ef positivo.
// exito = ef ×1.15. fracaso = sólo los positivos ×-0.6, +piso al líder, +resist.
// critico/pifia quedan undefined: el motor ya sintetiza las colas (escalarRama).
function sinteticoDado(opcion) {
  const ef = opcion.ef || {};
  const exito = escalarRama({ ef }, OFF_GAMBLE_EXITO_SCALE);
  const fracaso = { ef: {} };
  for (const k of VISIBLES) {
    if ((ef[k] || 0) > 0) fracaso.ef[k] = Math.floor(ef[k] * OFF_GAMBLE_FRACASO_SCALE);
  }
  const lider = relInferido(ef);
  if (lider) fracaso.ef[lider] = (fracaso.ef[lider] || 0) + OFF_GAMBLE_FRACASO_FLOOR;
  fracaso.resist = OFF_GAMBLE_FRACASO_RESIST;
  return { exito, fracaso };
}

// El dado (autorado o sintético) que usaría una apuesta de esta opción.
function dadoApuesta(opcion) {
  return opcion.offDado || normalizarOffEf(opcion.offEf) || sinteticoDado(opcion);
}

// ¿Esta opción se resuelve como apuesta? (off-profile, sin dado propio, ef
// neto positivo, no exenta). Las apuestas exigen tirar dados en la UI.
export function esApuesta(estado, opcion) {
  return !!opcion && !opcion.dado && !opcion.noApuesta &&
    esOffProfile(estado, opcion) && netoPositivo(opcion.ef);
}

// Previsualización para la UI: ramas y umbral de una apuesta (sin tirar).
// off-profile siempre suma +1 al umbral (la apuesta exige off-profile).
export function previsualizarApuesta(estado, opcion) {
  const dado = dadoApuesta(opcion);
  const rel = opcion.rel || relInferido(opcion.ef);
  const umbral = umbralDado(estado, rel, (opcion.umbralMod || 0) + 1);
  return { exito: dado.exito.ef, fracaso: dado.fracaso.ef, umbral, rel };
}

// Misiones: chequea las del arquetipo y devuelve {estado, nuevas}
// finalCtx: null durante la partida; {valor} al cierre (evalúa las `final: true`)
export function chequearMisiones(estado, finalCtx = null) {
  const defs = MISIONES[estado.arquetipo] || [];
  let s = estado;
  const nuevas = [];
  for (const def of defs) {
    if (s.misiones[def.id]) continue;
    if (!!def.final !== !!finalCtx) continue;
    if (def.test(s, finalCtx || {})) {
      s = {
        ...s,
        misiones: { ...s.misiones, [def.id]: true },
        puntaje: s.puntaje + 40,
        ptsMisiones: s.ptsMisiones + 40,
      };
      nuevas.push(def);
    }
  }
  return { estado: s, nuevas };
}

// Resuelve una opción elegida. Para opciones con dado, se le pasa el roll de tirarDados().
// Devuelve { estado, resultado } donde resultado describe lo ocurrido (para animar/loguear)
export function resolverOpcion(estado, carta, opcion, roll) {
  const antes = snapshot(estado);
  let s = { ...estado };
  const offProfile = esOffProfile(estado, opcion); // fuera de perfil del arquetipo
  const apuesta = esApuesta(estado, opcion);       // off-profile sin dado y con ef+ => se vuelve tirada
  // En una apuesta el efecto determinista deja de aplicarse fijo: pasa a ser la
  // rama de éxito de un dado (autorado vía offDado/offEf, o sintético).
  const op = apuesta
    ? { ...opcion, dado: dadoApuesta(opcion), rel: opcion.rel || relInferido(opcion.ef), ef: undefined }
    : opcion;
  const detalle = {
    cartaId: carta.id, cartaTitulo: carta.titulo, ronda: carta.ronda,
    opcionId: opcion.id, opcionTexto: opcion.texto, cat: opcion.cat,
  };

  // 1) costo / efecto base siempre se aplica (en una apuesta, op.ef es undefined: no aplica fijo)
  s = aplicarEfectos(s, op.ef);
  if (op.resist) s = aplicarResistencia(s, op.resist);
  if (op.flag) s = agregarFlags(s, op.flag);

  // 2) dado (con críticos y pifias). En una apuesta, op.dado es el dado sintético/autorado.
  if (op.dado) {
    const { d1, d2, total } = roll;
    // Fuera de perfil => +1 al umbral (más difícil). Stackea con umbralMod de variantes.
    const umbral = umbralDado(estado, op.rel, (op.umbralMod || 0) + (offProfile ? 1 : 0));
    const critico = total === 12; // doble 6
    const pifia = total === 2;    // doble 1
    const exito = critico ? true : pifia ? false : total >= umbral;
    let rama;
    if (critico) {
      rama = op.dado.critico || escalarRama(op.dado.exito, 1.5);
    } else if (pifia) {
      rama = op.dado.pifia ||
        { ...escalarRama(op.dado.fracaso, 1.5), resist: (escalarRama(op.dado.fracaso, 1.5).resist || 0) + 5 };
    } else {
      rama = exito ? op.dado.exito : op.dado.fracaso;
    }
    s = aplicarEfectos(s, rama.ef);
    if (rama.resist) s = aplicarResistencia(s, rama.resist);
    if (rama.flag) s = agregarFlags(s, rama.flag);
    detalle.dado = {
      roll: total, d1, d2, umbral, exito, critico, pifia,
      casiExito: !exito && !pifia && total === umbral - 1,
      justo: exito && !critico && total === umbral,
      rel: op.rel, nota: rama.nota,
    };
  }

  // 3) deltas + trackers
  detalle.deltas = calcDeltas(antes, snapshot(s));
  s = actualizarTrackers(s);
  s.rondasJugadas = estado.rondasJugadas + 1;

  // 4) racha (solo decisiones de ronda; eventos no la tocan)
  const netDelta = Object.values(detalle.deltas).reduce((a, b) => a + b, 0);
  detalle.rachaRota = false;
  if (netDelta > 0) {
    s.racha = estado.racha + 1;
    s.mejorRacha = Math.max(estado.mejorRacha, s.racha);
  } else if (netDelta < 0) {
    detalle.rachaRota = estado.racha >= 3;
    s.racha = 0;
  } else {
    s.racha = estado.racha;
  }

  // 5) puntaje: deltas positivos + bonus de dado, × bonus afinidad × racha
  // "salió bien": con dado = éxito/crítico; sin dado = deltas netos positivos.
  const exitoEfectivo = detalle.dado
    ? (detalle.dado.critico || detalle.dado.exito)
    : netDelta > 0;
  let base = Object.values(detalle.deltas).filter((v) => v > 0).reduce((a, b) => a + b, 0);
  if (detalle.dado) {
    if (detalle.dado.critico) base += 25;
    else if (detalle.dado.exito) base += 10;
  }
  // Fuera de perfil que sale bien => suma más (riesgo recompensado)
  const offBonus = offProfile && exitoEfectivo ? OFF_PROFILE_BONUS_MULT : 1;
  const pts = Math.round(base * offBonus * (1 + 0.1 * Math.min(s.racha, 5)));
  s.puntaje = estado.puntaje + pts;
  s.ptsMisiones = estado.ptsMisiones;
  detalle.puntos = pts;
  detalle.racha = s.racha;
  detalle.offProfile = offProfile;
  detalle.offProfileExito = offProfile && exitoEfectivo;
  detalle.apuesta = apuesta;
  detalle.offBackfire = apuesta && !!detalle.dado && !(detalle.dado.critico || detalle.dado.exito);
  // contadores de afinidad (sólo cuentan opciones categorizadas que salieron bien)
  if (opcion.cat && exitoEfectivo) {
    if (offProfile) s.offWins = (estado.offWins || 0) + 1;
    else s.onWins = (estado.onWins || 0) + 1;
  } else {
    s.offWins = estado.offWins || 0;
    s.onWins = estado.onWins || 0;
  }

  // 6) misiones de partida
  const m = chequearMisiones(s);
  s = m.estado;
  detalle.misionesNuevas = m.nuevas;

  s = chequearFin(s);
  s.log = [...s.log, detalle];
  return { estado: s, resultado: detalle };
}

// Aplica un evento fijo (sin opciones). No afecta la racha.
export function resolverEvento(estado, evento) {
  const antes = snapshot(estado);
  let s = aplicarEfectos(estado, evento.ef);
  s = actualizarTrackers(s);
  const detalle = { evento: evento.titulo, eventoId: evento.id, ef: evento.ef, deltas: calcDeltas(antes, snapshot(s)) };
  const m = chequearMisiones(s);
  s = m.estado;
  detalle.misionesNuevas = m.nuevas;
  s = chequearFin(s);
  s.log = [...s.log, detalle];
  return { estado: s, resultado: detalle };
}

// Resuelve un evento menor (reactivo al estado; opcional opción binaria)
export function resolverEventoMenor(estado, evento, opcionId = null) {
  const antes = snapshot(estado);
  const out = evento.resolver(estado, opcionId);
  let s = aplicarEfectos(estado, out.ef);
  if (out.resist) s = aplicarResistencia(s, out.resist);
  s = actualizarTrackers(s);
  const detalle = {
    evento: evento.titulo, eventoId: evento.id, menor: true,
    opcionId, nota: out.nota, deltas: calcDeltas(antes, snapshot(s)),
  };
  const m = chequearMisiones(s);
  s = m.estado;
  detalle.misionesNuevas = m.nuevas;
  s = chequearFin(s);
  s.log = [...s.log, detalle];
  return { estado: s, resultado: detalle };
}

// Aplica el golpe de entrada de una variante (consecuencia encadenada)
export function aplicarGolpe(estado, ef) {
  const antes = snapshot(estado);
  let s = aplicarEfectos(estado, ef);
  s = actualizarTrackers(s);
  s = chequearFin(s);
  return { estado: s, deltas: calcDeltas(antes, snapshot(s)) };
}

// Variantes de carta: consecuencias encadenadas según flags previas.
// Devuelve la carta (con varianteActiva y opciones parcheadas) o la original.
export function aplicarVariante(carta, flags) {
  if (!carta.variantes) return carta;
  const v = carta.variantes.find((x) =>
    typeof x.cuando === "function" ? x.cuando(flags) : flags.includes(x.cuando)
  );
  if (!v) return carta;
  const opciones = v.opcionesPatch
    ? carta.opciones.map((o) => (v.opcionesPatch[o.id] ? { ...o, ...v.opcionesPatch[o.id] } : o))
    : carta.opciones;
  return { ...carta, opciones, varianteActiva: v };
}

// Valor de empresa = promedio de los 4 visibles
export function valorEmpresa(estado) {
  return Math.round((estado.caja + estado.confianza + estado.adopcion + estado.motivacion) / 4);
}

// Determina el final
export function calcularFinal(estado) {
  const s = { ...estado, valor: valorEmpresa(estado) };
  const final = FINALES.find((f) => f.test(s)) || FINALES[FINALES.length - 1];
  return { final, valor: s.valor };
}

// Puntaje final = puntaje de partida + Valor de Empresa + bonus del final.
// Devuelve también el desglose para el conteo animado.
export function puntajeFinal(estado, final, valor) {
  const gestion = estado.puntaje - estado.ptsMisiones;
  const bonus = final.bonus || 0;
  const total = estado.puntaje + valor + bonus;
  return {
    total,
    desglose: [
      { label: "Gestión y dados", pts: gestion },
      { label: "Misiones cumplidas", pts: estado.ptsMisiones },
      { label: "Valor de Empresa", pts: valor },
      { label: `Final «${final.titulo}»`, pts: bonus },
    ],
  };
}

// Elige la crisis de R11 según resistencia
export function crisisFinal(estado) {
  return estado.resistencia >= 70 ? CRISIS_MOTIN : CRISIS_OFERTA;
}

// ============================================================
// Plan de partida: 11 cartas RANDOM del pool + crisis + balance (cierre) +
// 2 eventos fijos (dólar, se va) + 2-3 menores sorteados. Cada partida varía.
// Se construye UNA vez por partida (en multijugador, compartido: sólo universales).
// Pasos: { t:'r', id } | { t:'dolar' } | { t:'seva' } | { t:'crisis' } | { t:'menor', evento }
// Cada paso lleva `label` para el contador de ronda del tablero.
// ============================================================
export function construirPlan({ arqId, multi = false } = {}) {
  // Cartas elegibles: universales + exclusivas del arquetipo (sólo individual).
  // En multijugador se excluyen TODAS las exclusivas (mazo compartido por id).
  // `balance` se reserva siempre como carta de cierre (no entra al sorteo).
  const eligibles = POOL.filter(
    (c) => c.id !== "balance" &&
      (!c.soloArq || (!multi && arqId && c.soloArq.includes(arqId)))
  );
  if (eligibles.length < DECK_BODY_LEN) {
    throw new Error(`Pool insuficiente: ${eligibles.length} cartas elegibles, se necesitan ${DECK_BODY_LEN}.`);
  }
  const cuerpo = shuffle(eligibles).slice(0, DECK_BODY_LEN); // 11 cartas random sin repetir

  // Estructura fija: 3 cartas → dólar → 5 cartas → se va → 3 cartas → crisis → balance
  const base = [
    ...cuerpo.slice(0, 3).map((c) => ({ t: "r", id: c.id })),
    { t: "dolar" },
    ...cuerpo.slice(3, 8).map((c) => ({ t: "r", id: c.id })),
    { t: "seva" },
    ...cuerpo.slice(8, 11).map((c) => ({ t: "r", id: c.id })),
    { t: "crisis" },
    { t: "r", id: "balance" },
  ];

  // Huecos válidos para eventos menores: entre dos rondas consecutivas (nunca
  // pegados a un evento fijo ni a la crisis, nunca antes de la 1ra carta).
  const huecos = [];
  for (let i = 1; i < base.length - 1; i++) {
    if (base[i].t === "r" && base[i + 1].t === "r") huecos.push(i);
  }
  const n = multi ? 2 : 2 + Math.floor(Math.random() * 2); // 2 (multi) | 2-3 (individual)
  const eventos = sortearEventosMenores(n);
  const elegidos = [...huecos].sort(() => Math.random() - 0.5).slice(0, eventos.length).sort((a, b) => b - a);
  const plan = [...base];
  elegidos.forEach((idx, k) => {
    plan.splice(idx + 1, 0, { t: "menor", evento: eventos[k] });
  });

  // Etiquetas: las cartas/crisis usan su posición en el mazo; eventos muestran "N½"
  let n2 = 0;
  for (const paso of plan) {
    if (paso.t === "r" || paso.t === "crisis") {
      n2 += 1;
      paso.label = n2;
    } else {
      paso.label = n2 + "½";
    }
  }
  return plan;
}

// Plan serializable para compartir en un room online (los eventos menores
// llevan funciones resolver: se guardan por id y se rehidratan al leer).
export function serializarPlan(plan) {
  return plan.map((p) =>
    p.t === "menor"
      ? { t: p.t, eventoId: p.evento.id, label: p.label }
      : { t: p.t, id: p.id || null, label: p.label }
  );
}

export function hidratarPlan(planSer) {
  return planSer.map((p) =>
    p.t === "menor"
      ? { t: p.t, evento: EVENTOS_MENORES.find((e) => e.id === p.eventoId), label: p.label }
      : { t: p.t, id: p.id || undefined, label: p.label }
  );
}

// Resuelve la carta concreta de un paso del plan según el estado del jugador
export function pasoDesde(paso, estado) {
  if (paso.t === "r") {
    const carta = POOL_BY_ID[paso.id];
    return { kind: "ronda", carta: aplicarVariante(carta, estado.flags) };
  }
  if (paso.t === "dolar") return { kind: "evento", carta: EVENTO_DOLAR };
  if (paso.t === "seva") return { kind: "evento", carta: eventoSeVa(estado.flags) };
  if (paso.t === "crisis") return { kind: "ronda", carta: aplicarVariante(crisisFinal(estado), estado.flags) };
  if (paso.t === "menor") return { kind: "menor", carta: paso.evento };
}

// Helper: estado de color de un valor
export function estadoColor(v) {
  if (v >= 60) return "verde";
  if (v >= 30) return "ambar";
  return "rojo";
}
