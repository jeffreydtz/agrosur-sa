// ============================================================
// engine.js — Lógica del juego (puro, sin React)
// ============================================================
import {
  ARQUETIPOS, FINALES, MISIONES, CRISIS_MOTIN, CRISIS_OFERTA,
  RONDAS, EVENTO_DOLAR, eventoSeVa,
} from "./data.js";
import { sortearEventosMenores } from "./dataEventos.js";

export const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));

const VISIBLES = ["caja", "confianza", "adopcion", "motivacion"];

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

// Umbral del dado: 11+ normal; 15+ si el indicador relacionado está en rojo (<30).
// mod: ajuste por variante de carta (consecuencias encadenadas).
export function umbralDado(estado, rel, mod = 0) {
  const base = rel && estado[rel] != null && estado[rel] < 30 ? 15 : 11;
  return Math.max(2, Math.min(19, base + mod));
}

// Tira un d20
export function tirarD20() {
  return 1 + Math.floor(Math.random() * 20);
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

// Resuelve una opción elegida. Para opciones con dado, se le pasa el roll.
// Devuelve { estado, resultado } donde resultado describe lo ocurrido (para animar/loguear)
export function resolverOpcion(estado, carta, opcion, roll) {
  const antes = snapshot(estado);
  let s = { ...estado };
  const detalle = {
    cartaId: carta.id, cartaTitulo: carta.titulo, ronda: carta.ronda,
    opcionId: opcion.id, opcionTexto: opcion.texto,
  };

  // 1) costo / efecto base siempre se aplica
  s = aplicarEfectos(s, opcion.ef);
  if (opcion.resist) s = aplicarResistencia(s, opcion.resist);
  if (opcion.flag) s = agregarFlags(s, opcion.flag);

  // 2) dado (con críticos y pifias)
  if (opcion.dado) {
    const umbral = umbralDado(estado, opcion.rel, opcion.umbralMod || 0);
    const critico = roll === 20;
    const pifia = roll === 1;
    const exito = critico ? true : pifia ? false : roll >= umbral;
    let rama;
    if (critico) {
      rama = opcion.dado.critico || escalarRama(opcion.dado.exito, 1.5);
    } else if (pifia) {
      rama = opcion.dado.pifia ||
        { ...escalarRama(opcion.dado.fracaso, 1.5), resist: (escalarRama(opcion.dado.fracaso, 1.5).resist || 0) + 5 };
    } else {
      rama = exito ? opcion.dado.exito : opcion.dado.fracaso;
    }
    s = aplicarEfectos(s, rama.ef);
    if (rama.resist) s = aplicarResistencia(s, rama.resist);
    if (rama.flag) s = agregarFlags(s, rama.flag);
    detalle.dado = {
      roll, umbral, exito, critico, pifia,
      casiExito: !exito && !pifia && roll === umbral - 1,
      justo: exito && !critico && roll === umbral,
      rel: opcion.rel, nota: rama.nota,
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

  // 5) puntaje: deltas positivos + bonus de dado, multiplicado por racha
  let base = Object.values(detalle.deltas).filter((v) => v > 0).reduce((a, b) => a + b, 0);
  if (detalle.dado) {
    if (detalle.dado.critico) base += 25;
    else if (detalle.dado.exito) base += 10;
  }
  const pts = Math.round(base * (1 + 0.1 * Math.min(s.racha, 5)));
  s.puntaje = estado.puntaje + pts;
  s.ptsMisiones = estado.ptsMisiones;
  detalle.puntos = pts;
  detalle.racha = s.racha;

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
// Plan de partida: 12 rondas + 2 eventos fijos + 2-3 menores sorteados.
// Se construye UNA vez por partida (en multijugador, compartido).
// Pasos: { t:'r', id } | { t:'dolar' } | { t:'seva' } | { t:'crisis' } | { t:'menor', evento }
// Cada paso lleva `label` para el contador de ronda del tablero.
// ============================================================
export function construirPlan({ multi = false } = {}) {
  const base = [
    { t: "r", id: "sequia" }, { t: "r", id: "fintech" }, { t: "r", id: "rumbo" },
    { t: "dolar" },
    { t: "r", id: "siempre" }, { t: "r", id: "tribus" }, { t: "r", id: "cambiamos" }, { t: "r", id: "error" },
    { t: "seva" },
    { t: "r", id: "renuncias" }, { t: "r", id: "appmovil" }, { t: "r", id: "denuncia" },
    { t: "crisis" },
    { t: "r", id: "balance" },
  ];

  // Huecos válidos para eventos menores: entre dos rondas consecutivas (nunca
  // pegados a un evento fijo ni a la crisis, nunca antes de la ronda 2).
  const huecos = [];
  for (let i = 0; i < base.length - 1; i++) {
    if (base[i].t === "r" && base[i + 1].t === "r" && base[i].id !== "sequia") huecos.push(i);
  }
  const n = multi ? 2 : 2 + Math.floor(Math.random() * 2); // 2 (multi) | 2-3 (individual)
  const eventos = sortearEventosMenores(n);
  const elegidos = [...huecos].sort(() => Math.random() - 0.5).slice(0, eventos.length).sort((a, b) => b - a);
  const plan = [...base];
  elegidos.forEach((idx, k) => {
    plan.splice(idx + 1, 0, { t: "menor", evento: eventos[k] });
  });

  // Etiquetas de ronda: las rondas usan su número; eventos muestran "N½"
  let ultima = 0;
  for (const paso of plan) {
    if (paso.t === "r") {
      ultima = RONDAS.find((r) => r.id === paso.id).ronda;
      paso.label = ultima;
    } else if (paso.t === "crisis") {
      ultima = 11;
      paso.label = 11;
    } else {
      paso.label = ultima + "½";
    }
  }
  return plan;
}

// Resuelve la carta concreta de un paso del plan según el estado del jugador
export function pasoDesde(paso, estado) {
  if (paso.t === "r") {
    const carta = RONDAS.find((r) => r.id === paso.id);
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
