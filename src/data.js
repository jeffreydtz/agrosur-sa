// ============================================================
// AgroSur S.A. — Crónicas del Cambio
// data.js — Arquetipos (+afinidades), misiones, eventos fijos, crisis, finales
// (El mazo de decisiones vive en dataPool.js)
// ============================================================

// --- Arquetipos ---
// Definen valores iniciales y AFINIDADES (categorías en las que la empresa es
// fuerte). Una decisión cuya categoría NO está en `afin` es "fuera de perfil":
// más difícil (dado +1), pero si sale bien suma más puntos (ver engine.js).
export const ARQUETIPOS = [
  {
    id: "tradicional",
    nombre: "La Tradicional",
    emoji: "🌾",
    caja: 60, confianza: 85, adopcion: 15, motivacion: 60, resistencia: 35,
    desafio: "Queridísima, analógica. Digitalizar sin romper la confianza.",
    afin: ["relacional", "comercial"],
  },
  {
    id: "endeudada",
    nombre: "La Endeudada",
    emoji: "📉",
    caja: 25, confianza: 60, adopcion: 40, motivacion: 45, resistencia: 30,
    desafio: "Cada peso cuenta. Elegir bien en qué invertir.",
    afin: ["financiera", "operativa"],
  },
  {
    id: "tecnocrata",
    nombre: "La Tecnócrata",
    emoji: "🖥️",
    caja: 50, confianza: 35, adopcion: 75, motivacion: 55, resistencia: 50,
    desafio: "Compró sistemas que nadie quiere. Recuperar la confianza.",
    afin: ["tecnologica", "operativa"],
  },
  {
    id: "quemada",
    nombre: "La Quemada",
    emoji: "🥵",
    caja: 65, confianza: 60, adopcion: 45, motivacion: 20, resistencia: 35,
    desafio: "Equipo fundido. Sin motivación, todo lo arriesgado sale mal.",
    afin: ["cultural", "relacional"],
  },
  {
    id: "estrella",
    nombre: "La Estrella",
    emoji: "⭐",
    caja: 75, confianza: 75, adopcion: 50, motivacion: 70, resistencia: 25,
    desafio: "Modo fácil… hasta que la complacencia te alcanza.",
    afin: ["comercial", "financiera"],
  },
  {
    id: "disruptiva",
    nombre: "La Disruptiva",
    emoji: "🚀",
    caja: 35, confianza: 30, adopcion: 80, motivacion: 75, resistencia: 45,
    desafio: "Fierro tecnológico, cero rodaje. Ganarte al sector tradicional sin fundirte.",
    afin: ["tecnologica", "arriesgada"],
  },
];

// Afinidades por arquetipo (lookup rápido para el motor y la UI)
export const AFIN_BY_ARQ = Object.fromEntries(ARQUETIPOS.map((a) => [a.id, a.afin]));

export const INDICADORES = {
  caja:       { emoji: "💰", nombre: "Caja",      color: "#e0b13a", desc: "Recursos para invertir y operar." },
  confianza:  { emoji: "🤝", nombre: "Confianza", color: "#cf7359", desc: "Relación con clientes y clima interno." },
  adopcion:   { emoji: "⚙️", nombre: "Adopción",  color: "#34a0a4", desc: "Que la tecnología se use de verdad." },
  motivacion: { emoji: "🔥", nombre: "Motivación",color: "#e8693c", desc: "Energía del equipo." },
};

// ============================================================
// MISIONES — 2 por arquetipo. `final: true` se evalúa al cierre;
// las demás, después de cada resolución. test(estado, {valor}).
// ============================================================
// Misiones reworked: stat-based o por afinidad (offWins/onWins), logrables
// con cualquier mazo random. offWins = apuestas fuera de perfil ganadas (las
// decisiones fuera de perfil ahora se resuelven tirando dados, ver engine.js
// esApuesta/resolverOpcion); onWins = decisiones en perfil ganadas.
export const MISIONES = {
  tradicional: [
    {
      id: "abuela", nombre: "Abuela digital",
      desc: "Llegá a ⚙️ Adopción ≥ 60 manteniendo 🤝 Confianza ≥ 70.",
      test: (s) => s.adopcion >= 60 && s.confianza >= 70,
    },
    {
      id: "saltosinred", nombre: "Salto sin red",
      desc: "Ganá una apuesta fuera de tu perfil.",
      test: (s) => (s.offWins || 0) >= 1,
    },
  ],
  endeudada: [
    {
      id: "respirar", nombre: "Respirar",
      desc: "Llevá la 💰 Caja a 50 o más en la primera mitad de la partida.",
      test: (s) => s.caja >= 50 && s.rondasJugadas <= 7,
    },
    {
      id: "lona", nombre: "Nunca en la lona", final: true,
      desc: "Terminá la partida sin que la 💰 Caja baje nunca de 20.",
      test: (s) => s.minCaja >= 20,
    },
  ],
  tecnocrata: [
    {
      id: "reconquista", nombre: "Reconquista",
      desc: "Recuperá la 🤝 Confianza hasta 60 o más.",
      test: (s) => s.confianza >= 60,
    },
    {
      id: "humanizar", nombre: "Humanizar el fierro", final: true,
      desc: "Terminá con ⚙️ Adopción ≥ 65 y 🤝 Confianza ≥ 55.",
      test: (s) => s.adopcion >= 65 && s.confianza >= 55,
    },
  ],
  quemada: [
    {
      id: "creer", nombre: "Volver a creer",
      desc: "Subí la 🔥 Motivación hasta 60 o más.",
      test: (s) => s.motivacion >= 60,
    },
    {
      id: "cvl", nombre: "Calidad de vida", final: true,
      desc: "Terminá con 🔥 Motivación ≥ 55 sin que ningún indicador baje de 25.",
      test: (s) => s.motivacion >= 55 && s.minIndicador >= 25,
    },
  ],
  estrella: [
    {
      id: "pilotos", nombre: "Nada de pilotos automáticos", final: true,
      desc: "Terminá con un Valor de Empresa de 75 o más.",
      test: (s, ctx) => (ctx && ctx.valor != null ? ctx.valor : 0) >= 75,
    },
    {
      id: "paranoica", nombre: "Paranoica sobrevive", final: true,
      desc: "Que ningún indicador baje de 40 en toda la partida.",
      test: (s) => s.minIndicador >= 40,
    },
  ],
  disruptiva: [
    {
      id: "traccion", nombre: "Tracción real",
      desc: "Ganá 3 decisiones de tu perfil (tech o arriesgadas).",
      test: (s) => (s.onWins || 0) >= 3,
    },
    {
      id: "runway", nombre: "Runway", final: true,
      desc: "Llegá al final sin que la 💰 Caja baje nunca de 15.",
      test: (s) => s.minCaja >= 15,
    },
  ],
};

// ============================================================
// EVENTOS FIJOS
// ============================================================

export const EVENTO_DOLAR = {
  id: "dolar",
  tipo: "evento",
  insertarTras: 3,
  tema: "Contexto",
  clase: "C2 · C8",
  titulo: "Salto del dólar",
  narrativa:
    "De un día para el otro, el dólar salta un 30%. Los productores retienen mercadería, los contratos en pesos quedan desfasados y la operatoria se congela. No lo provocaste vos, no lo controlás vos: es el contexto argentino. Golpea a todos por igual.",
  ef: { caja: -10, confianza: -5, motivacion: -5 },
  concepto: "Variables no controlables y contexto (C2). En multijugador, idéntico para todas las empresas.",
};

// El impacto de "Se va el que sabía" depende de flags previas
export function eventoSeVa(flags) {
  const documentado = flags.includes("documentado:si");
  const celulas = flags.includes("celulas:si");
  let ef, narrativa, severidad;
  if (celulas) {
    ef = { motivacion: -4, confianza: -3 };
    severidad = "leve";
    narrativa =
      "Renuncia Marta, la referente de Contratos que tenía todo «en la cabeza». Pero las células transversales ya repartieron el conocimiento: el equipo absorbe el golpe. Se siente, no duele.";
  } else if (documentado) {
    ef = { motivacion: -6, adopcion: -5 };
    severidad = "moderado";
    narrativa =
      "Renuncia Marta, la referente de Contratos. Por suerte documentaste los procesos críticos a tiempo: hay manuales, hay registros. El bache se cubre con esfuerzo, pero se cubre.";
  } else {
    ef = { adopcion: -15, motivacion: -10, confianza: -10 };
    severidad = "grave";
    narrativa =
      "Renuncia Marta, la referente de Contratos, y se lleva en la cabeza 12 años de cómo funciona todo. Nadie documentó nada. Los contratos se traban, los clientes esperan, el equipo improvisa. El conocimiento concentrado en personas pasó la factura.";
  }
  return {
    id: "seva",
    tipo: "evento",
    insertarTras: 7,
    tema: "Estructura",
    clase: "C1 · C6",
    titulo: "Se va el que sabía",
    personaje: { emoji: "👩‍💼", nombre: "Marta" },
    narrativa,
    ef,
    severidad,
    concepto: "Conocimiento concentrado en personas. El costo de no documentar y de los silos (C1, C6).",
  };
}

// ============================================================
// CRISIS R11 — dos variantes
// ============================================================

export const CRISIS_MOTIN = {
  id: "crisis",
  ronda: 11,
  tema: "Crisis · Resistencia política",
  clase: "C4",
  titulo: "El Motín de los Históricos",
  personaje: { emoji: "🧔", nombre: "Don Raúl" },
  narrativa:
    "Era cuestión de tiempo. Cansados de decisiones impuestas «por decreto», los corredores históricos se plantan: amenazan con irse en bloque y llevarse sus carteras de clientes. Don Raúl encabeza. La resistencia política que venías acumulando en silencio estalló.",
  crisis: true,
  variantes: [
    {
      cuando: (flags) => flags.includes("tribus:integradas") || flags.includes("padrino:si"),
      ribbon: "🤝 LAZOS QUE VUELVEN",
      narrativaExtra:
        "Pero algo cambió: Don Raúl te frena antes de la asamblea. «Yo sé que vos escuchás, pibe. Convencé al resto.» El vínculo que construiste te abre una puerta.",
      opcionesPatch: { B: { umbralMod: -1 } },
    },
  ],
  opciones: [
    {
      id: "A",
      texto: "Ceder: co-gobierno con los históricos, frenar el sistema.",
      ef: { confianza: 15, adopcion: -12, motivacion: 5 },
      resist: -25,
    },
    {
      id: "B",
      texto: "Negociar una salida: integrarlos como referentes del cambio.",
      ef: { caja: -5 },
      rel: "confianza",
      dado: {
        exito: { ef: { confianza: 15, motivacion: 10, adopcion: 5 }, resist: -20, nota: "Les das un rol de honor en la transformación. El motín se transforma en alianza." },
        fracaso: { ef: { confianza: -15, motivacion: -8 }, nota: "No te creyeron. Dos corredores se van y se llevan clientes. Éxodo parcial." },
        critico: { ef: { confianza: 20, motivacion: 14, adopcion: 8 }, resist: -30, nota: "Don Raúl pide la palabra y dice: «el pibe tiene razón». El motín se vuelve mesa de trabajo, y la asamblea termina en aplauso." },
        pifia: { ef: { confianza: -20, motivacion: -12 }, resist: 5, nota: "La reunión termina con portazos. Tres corredores renuncian en bloque y se llevan media cartera." },
      },
    },
    {
      id: "C",
      texto: "Plantarte: despedir a los cabecillas y seguir adelante.",
      ef: { confianza: -20, motivacion: -15, adopcion: 10 },
    },
  ],
  concepto: "Resistencia política de la coalición dominante (Schein). El indicador oculto se cobró su precio.",
};

export const CRISIS_OFERTA = {
  id: "crisis",
  ronda: 11,
  tema: "Crisis · Decisión estratégica",
  clase: "C3 · C8",
  titulo: "La oferta de la multinacional",
  narrativa:
    "Una multinacional del agro pone una oferta sobre la mesa: compra AgroSur, paga bien, y vos quedás como gerente regional. «Es el negocio de tu vida», dicen los dueños. Pero es el fin del proyecto independiente. ¿Vendés o seguís?",
  crisis: true,
  opciones: [
    {
      id: "A",
      texto: "Vender. Es un gran negocio y un cierre con plata.",
      ef: {},
      flag: "vendida:si",
    },
    {
      id: "B",
      texto: "Rechazar y redoblar la apuesta por la autonomía.",
      ef: { caja: -5 },
      rel: "motivacion",
      dado: {
        exito: { ef: { caja: 12, motivacion: 10, confianza: 5 }, nota: "El equipo se envalentona: «somos dueños de nuestro destino». La apuesta rinde." },
        fracaso: { ef: { caja: -10 }, nota: "Rechazaste la oferta, pero el mercado no acompañó. Quedaste expuesto." },
        critico: { ef: { caja: 18, motivacion: 14, confianza: 8 }, nota: "La noticia corre por la plaza: «AgroSur no se vende». Llegan tres clientes nuevos por puro orgullo rosarino." },
        pifia: { ef: { caja: -14, motivacion: -6 }, nota: "Rechazaste la oferta y al mes el mercado se dio vuelta. El directorio te lo recuerda en cada almuerzo." },
      },
    },
    {
      id: "C",
      texto: "Negociar una alianza: inversión minoritaria, seguís al mando.",
      ef: { caja: 15, confianza: -5, adopcion: 10 },
    },
  ],
  concepto: "Decisión estratégica bajo incertidumbre. Autonomía vs. capital. «Sólo los paranoicos sobreviven» (Grove).",
};

// ============================================================
// FINALES
// ============================================================
// Se evalúan en orden de prioridad. El primero que matchea, gana.

export const FINALES = [
  {
    id: "quiebra",
    emoji: "💀",
    titulo: "Quiebra / Éxodo",
    color: "#cf4631",
    bonus: 0,
    test: (s) => s.caja <= 0 || s.confianza <= 10,
    narrativa:
      "AgroSur no llegó al final del ejercicio. Sin caja no hay operación; sin confianza no hay clientes. La autopsia organizacional es clara: una empresa es un sistema, y cuando una variable crítica colapsa, arrastra al resto.",
    veredicto: "Game over anticipado.",
  },
  {
    id: "vendida",
    emoji: "💼",
    titulo: "Vendida",
    color: "#9b8557",
    bonus: 50,
    test: (s) => s.flags.includes("vendida:si"),
    narrativa:
      "Firmaste la venta. Buen negocio: los dueños cobraron, vos quedaste bien parado. Pero el proyecto independiente que era AgroSur dejó de existir. ¿Éxito o derrota? Depende de qué viniste a construir.",
    veredicto: "Fin del proyecto. La pregunta queda abierta.",
  },
  {
    id: "lider",
    emoji: "🏆",
    titulo: "Líder del sector",
    color: "#5a9e3f",
    bonus: 150,
    test: (s) => s.valor >= 75 && s.caja >= 50 && s.confianza >= 50 && s.adopcion >= 50 && s.motivacion >= 50,
    narrativa:
      "Lo lograste: escalaste el negocio sin perder el alma. La tecnología se usa de verdad, los clientes confían más que nunca y el equipo está prendido fuego (del bueno). AgroSur es referencia en la plaza rosarina.",
    veredicto: "Escalaste sin perder el alma.",
  },
  {
    id: "carton",
    emoji: "🤖",
    titulo: "Tecnología de cartón",
    color: "#34a0a4",
    bonus: 60,
    test: (s) => s.adopcion >= 70 && s.confianza < 40,
    narrativa:
      "Tenés sistemas impecables, dashboards hermosos, una app que funciona. El problema: los clientes se fueron. Digitalizaste tan rápido y tan «por decreto» que rompiste la relación que hacía única a AgroSur. Tecnología sin confianza es cartón pintado.",
    veredicto: "Sistemas impecables, clientes que se fueron.",
  },
  {
    id: "boutique",
    emoji: "🤝",
    titulo: "La boutique relacional",
    color: "#cf7359",
    bonus: 60,
    test: (s) => s.confianza >= 75 && s.adopcion < 30,
    narrativa:
      "Todos te quieren. El apretón de manos sigue intacto, los clientes te son fieles, sos la corredora más querida de Rosario. Pero seguís dependiendo de Excel y de la memoria de las personas: imposible de escalar. Cuando se vaya el que sabe, tiembla todo.",
    veredicto: "Querida por todos, imposible de escalar.",
  },
  {
    id: "zombie",
    emoji: "🧟",
    titulo: "Empresa zombie",
    color: "#d9a521",
    bonus: 20,
    test: (s) => [s.caja, s.confianza, s.adopcion, s.motivacion].every((v) => v >= 30 && v <= 55),
    narrativa:
      "AgroSur ni creció ni quebró. Sobrevive en una medianía gris: cada decisión tibia evitó el desastre pero también el progreso. Ganó la complacencia. «Sólo los paranoicos sobreviven», y vos te quedaste cómodo.",
    veredicto: "Ni creció ni quebró: ganó la complacencia.",
  },
  // Fallback
  {
    id: "claroscuros",
    emoji: "🌗",
    titulo: "Una empresa con claroscuros",
    color: "#9b8557",
    bonus: 40,
    test: () => true,
    narrativa:
      "AgroSur cerró el año con luces y sombras. Avanzaste en algunos frentes y quedaste en deuda en otros: una empresa real, con sus contradicciones. No es el final de los libros, pero es honesto. El sistema sigue en movimiento.",
    veredicto: "Sobreviviste. La transformación sigue pendiente.",
  },
];
