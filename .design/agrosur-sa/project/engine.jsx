// ============================================================
// engine.jsx — Lógica del juego (puro, sin React)
// ============================================================

const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));

// Estado inicial de una empresa según arquetipo
function nuevoEstado(arqId, nombreJugador) {
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
  };
}

// Aplica un objeto de efectos {caja, confianza, adopcion, motivacion} al estado (inmutable)
function aplicarEfectos(estado, ef) {
  const n = { ...estado };
  if (!ef) return n;
  if (ef.caja != null) n.caja = clamp(n.caja + ef.caja);
  if (ef.confianza != null) n.confianza = clamp(n.confianza + ef.confianza);
  if (ef.adopcion != null) n.adopcion = clamp(n.adopcion + ef.adopcion);
  if (ef.motivacion != null) n.motivacion = clamp(n.motivacion + ef.motivacion);
  return n;
}

function aplicarResistencia(estado, delta) {
  if (!delta) return estado;
  const n = { ...estado };
  n.resistencia = clamp(n.resistencia + delta);
  n.resistHist = [...n.resistHist, n.resistencia];
  return n;
}

function agregarFlags(estado, flagStr) {
  if (!flagStr) return estado;
  const nuevos = flagStr.split("|").map((f) => f.trim()).filter(Boolean);
  return { ...estado, flags: [...estado.flags, ...nuevos] };
}

// Chequea fin anticipado
function chequearFin(estado) {
  const n = { ...estado };
  if (n.caja <= 0) { n.terminado = true; n.motivoFin = "quiebra"; }
  else if (n.confianza <= 10) { n.terminado = true; n.motivoFin = "exodo"; }
  return n;
}

// Umbral del dado: 11+ normal; 15+ si el indicador relacionado está en rojo (<30)
function umbralDado(estado, rel) {
  if (rel && estado[rel] != null && estado[rel] < 30) return 15;
  return 11;
}

// Tira un d20
function tirarD20() {
  return 1 + Math.floor(Math.random() * 20);
}

// Resuelve una opción elegida. Para opciones con dado, se le pasa el roll.
// Devuelve { estado, resultado } donde resultado describe lo ocurrido (para animar/loguear)
function resolverOpcion(estado, carta, opcion, roll) {
  let s = { ...estado };
  const detalle = { cartaTitulo: carta.titulo, ronda: carta.ronda, opcionId: opcion.id, opcionTexto: opcion.texto };

  // 1) costo / efecto base siempre se aplica
  s = aplicarEfectos(s, opcion.ef);
  if (opcion.resist) s = aplicarResistencia(s, opcion.resist);
  if (opcion.flag) s = agregarFlags(s, opcion.flag);

  // 2) dado
  if (opcion.dado) {
    const umbral = umbralDado(estado, opcion.rel);
    const exito = roll >= umbral;
    const rama = exito ? opcion.dado.exito : opcion.dado.fracaso;
    s = aplicarEfectos(s, rama.ef);
    if (rama.resist) s = aplicarResistencia(s, rama.resist);
    if (rama.flag) s = agregarFlags(s, rama.flag);
    detalle.dado = { roll, umbral, exito, rel: opcion.rel, nota: rama.nota };
  }

  s = chequearFin(s);
  s.log = [...s.log, detalle];
  return { estado: s, resultado: detalle };
}

// Aplica un evento fijo (sin opciones)
function resolverEvento(estado, evento) {
  let s = aplicarEfectos(estado, evento.ef);
  s = chequearFin(s);
  s.log = [...s.log, { evento: evento.titulo, ronda: evento.insertarTras + 0.5, ef: evento.ef }];
  return s;
}

// Valor de empresa = promedio de los 4 visibles
function valorEmpresa(estado) {
  return Math.round((estado.caja + estado.confianza + estado.adopcion + estado.motivacion) / 4);
}

// Determina el final
function calcularFinal(estado) {
  const s = { ...estado, valor: valorEmpresa(estado) };
  const final = FINALES.find((f) => f.test(s)) || FINALES[FINALES.length - 1];
  return { final, valor: s.valor };
}

// Construye la secuencia de cartas de una partida (incluye eventos y crisis dinámica)
// Devuelve un array de "pasos": {tipo:'ronda'|'evento', carta}
function construirSecuencia() {
  // Las rondas 1-8 + R10 son fijas; R9 y eventos se resuelven en runtime
  // por dependencia de flags. Acá devolvemos el plan base.
  return RONDAS;
}

// Elige la crisis de R9 según resistencia
function crisisR9(estado) {
  return estado.resistencia >= 70 ? CRISIS_MOTIN : CRISIS_OFERTA;
}

// Helper: estado de color de un valor
function estadoColor(v) {
  if (v >= 60) return "verde";
  if (v >= 30) return "ambar";
  return "rojo";
}

Object.assign(window, {
  clamp, nuevoEstado, aplicarEfectos, aplicarResistencia, agregarFlags,
  chequearFin, umbralDado, tirarD20, resolverOpcion, resolverEvento,
  valorEmpresa, calcularFinal, construirSecuencia, crisisR9, estadoColor,
});
