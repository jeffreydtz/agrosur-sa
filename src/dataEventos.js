// ============================================================
// dataEventos.js — Pool de eventos menores ("Titulares")
// Eventos cortos y variables: 2-3 por partida, sorteados al inicio.
// Cada evento define resolver(estado, opcionId) -> { ef, resist, nota }
// Los reactivos leen el estado: misma carta, distinto resultado.
// ============================================================

export const EVENTOS_MENORES = [
  {
    id: "lluvia",
    emoji: "🌧️",
    titulo: "Lluvia justa",
    narrativa: "Llovieron 60 milímetros en la región núcleo, justo a tiempo. El campo respira; la mesa de operaciones, también.",
    resolver: () => ({
      ef: { caja: 8, motivacion: 5 },
      nota: "Entra volumen y el humor de la oficina cambia con el pronóstico.",
    }),
  },
  {
    id: "viral",
    emoji: "📱",
    titulo: "Viral en el grupo",
    narrativa: "Un productor te nombra en el grupo de WhatsApp de la zona, el que leen todos. Lo que diga de AgroSur depende de cómo venís tratando a la gente.",
    resolver: (s) =>
      s.confianza >= 60
        ? { ef: { confianza: 6, adopcion: 4 }, nota: "«AgroSur te atiende como antes y encima tiene app.» Tres productores piden la demo." }
        : { ef: { confianza: -6 }, nota: "«Están más preocupados por los sistemas que por el cliente.» El mensaje duele porque algo de razón tiene." },
  },
  {
    id: "paro",
    emoji: "🚛",
    titulo: "Paro de transporte",
    narrativa: "Una semana de camiones parados en la autopista a San Lorenzo. Los embarques se atrasan y los teléfonos no paran de sonar.",
    resolver: () => ({
      ef: { caja: -8, motivacion: -4 },
      nota: "No lo provocaste vos, no lo arregla nadie de tu equipo. Contexto puro.",
    }),
  },
  {
    id: "sobrino",
    emoji: "🤵",
    titulo: "El sobrino del dueño",
    narrativa: "El directorio te «sugiere» tomar como pasante a un sobrino con apellido. No tiene experiencia, pero tiene padrinos.",
    binaria: [
      { id: "A", texto: "Integrarlo con tareas reales y un tutor." },
      { id: "B", texto: "Rebotarlo con elegancia: acá se entra por mérito." },
    ],
    resolver: (s, opcionId) =>
      opcionId === "A"
        ? { ef: { motivacion: -4, confianza: 5 }, nota: "El equipo refunfuña, pero el pibe resulta menos inútil de lo esperado y los dueños lo agradecen." }
        : { resist: 8, nota: "Quedaste derecho ante el equipo… y anotado en la libreta negra de un director.", ef: {} },
  },
  {
    id: "bolsa",
    emoji: "🏛️",
    titulo: "Mención de la Bolsa",
    narrativa: "La Bolsa de Comercio arma un informe sobre corredoras que innovan. Mandan un relevamiento: quieren ver adopción real, no folletos.",
    resolver: (s) =>
      s.adopcion >= 55
        ? { ef: { confianza: 5, motivacion: 6 }, nota: "AgroSur aparece destacada en el informe. El equipo lo comparte con orgullo: «salimos en la Bolsa»." }
        : { ef: {}, nota: "Quedaste a las puertas: «interesante, pero la adopción todavía no acompaña». Cerca. Tan cerca." },
  },
  {
    id: "cosecha",
    emoji: "🌾",
    titulo: "Cosecha récord de soja",
    narrativa: "La campaña cierra con números históricos. Entra volumen como nunca… y el equipo no da abasto.",
    resolver: () => ({
      ef: { caja: 10, motivacion: -5 },
      nota: "Plata que entra, gente que sale tarde. Toda bendición operativa tiene su factura humana.",
    }),
  },
  {
    id: "servidor",
    emoji: "🔥",
    titulo: "Se cayó el servidor",
    narrativa: "Viernes, 18:45. Se cae todo: sistema, mails, telefonía IP. ¿Tenías backup y manuales, o rezás?",
    resolver: (s) =>
      s.flags.includes("documentado:si") || s.adopcion >= 60
        ? { ef: { caja: -4 }, nota: "Dos horas de susto. Había backup, había manual de contingencia, hubo asado de festejo el sábado." }
        : { ef: { caja: -8, adopcion: -6 }, nota: "Nadie sabía qué hacer sin «preguntarle a alguien». El lunes, media oficina volvió al papel «por las dudas»." },
  },
  {
    id: "asado",
    emoji: "🥩",
    titulo: "El asado de Don Raúl",
    narrativa: "Don Raúl organiza su asado anual en la quinta. Históricamente, ahí se arreglan las cosas que la oficina no arregla.",
    resolver: (s) =>
      s.resistencia < 50
        ? { ef: { motivacion: 8 }, resist: -5, nota: "Te sentaron en la mesa principal. Entre el vacío y el malbec, dos corredores te dicen: «contá conmigo para lo del sistema»." }
        : { ef: { motivacion: -3 }, nota: "Te enteraste el lunes: no estabas invitado. En la cocina se habló mucho, y nada bueno." },
  },
];

// Sortea n eventos distintos del pool (Fisher-Yates parcial)
export function sortearEventosMenores(n) {
  const pool = [...EVENTOS_MENORES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(n, pool.length));
}
