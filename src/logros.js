// ============================================================
// logros.js — Logros desbloqueables (chequeo por eventos)
// ctx: { estado, resultado?, final?, valor?, puntaje?, meta }
// `fase`: "partida" (tras cada resolución) | "final" (al cierre)
// ============================================================

export const LOGROS = [
  // --- durante la partida ---
  {
    id: "manos-oro", emoji: "✨", nombre: "Manos de oro", fase: "partida",
    desc: "Sacá un 20 natural.",
    test: (c) => c.resultado?.dado?.critico,
  },
  {
    id: "imparable", emoji: "🔥", nombre: "Imparable", fase: "partida",
    desc: "Encadená una racha de 5 rondas positivas.",
    test: (c) => c.estado.racha >= 5,
  },
  {
    id: "doble-objetivo", emoji: "🎯", nombre: "Doble objetivo", fase: "partida",
    desc: "Cumplí las dos misiones de tu arquetipo en una partida.",
    test: (c) => Object.keys(c.estado.misiones).length >= 2,
  },
  {
    id: "don-raul-amigo", emoji: "🧔", nombre: "Don Raúl, amigo", fase: "partida",
    desc: "Ganate a Don Raúl: padrino del sistema y tribus integradas.",
    test: (c) => c.estado.flags.includes("padrino:si") && c.estado.flags.includes("tribus:integradas"),
  },
  // --- al cierre ---
  {
    id: "primera", emoji: "🪴", nombre: "Primer día en la oficina", fase: "final",
    desc: "Terminá tu primera partida.",
    test: () => true,
  },
  {
    id: "tropezar", emoji: "🩹", nombre: "Tropezar no es caer", fase: "final",
    desc: "Sacá un 1 natural y aun así llevá la empresa a buen puerto.",
    test: (c) => c.estado.log.some((l) => l.dado?.pifia) && c.final.id !== "quiebra",
  },
  {
    id: "caja-fuerte", emoji: "🧰", nombre: "Caja fuerte", fase: "final",
    desc: "Terminá con la 💰 Caja en 80 o más.",
    test: (c) => c.estado.caja >= 80,
  },
  {
    id: "sin-rojo", emoji: "🛡️", nombre: "Sin tocar el rojo", fase: "final",
    desc: "Terminá sin que ningún indicador haya bajado de 30.",
    test: (c) => c.estado.minIndicador >= 30 && c.final.id !== "quiebra",
  },
  {
    id: "fenix", emoji: "🐦‍🔥", nombre: "Fénix", fase: "final",
    desc: "Tocá fondo (algún indicador < 15) y terminá con Valor ≥ 60.",
    test: (c) => c.estado.minIndicador < 15 && c.valor >= 60,
  },
  {
    id: "cronista", emoji: "📰", nombre: "Cronista del cambio", fase: "final",
    desc: "Conocé 3 finales distintos.",
    test: (c) => c.meta.finalesVistos.length >= 3,
  },
  {
    id: "archivista", emoji: "📚", nombre: "Archivista", fase: "final",
    desc: "Conocé los 7 finales.",
    test: (c) => c.meta.finalesVistos.length >= 7,
  },
  {
    id: "gerente-serial", emoji: "💼", nombre: "Gerente serial", fase: "final",
    desc: "Ganá con 3 arquetipos distintos.",
    test: (c) => c.meta.arquetiposGanados.length >= 3,
  },
  {
    id: "leyenda", emoji: "🏛️", nombre: "Leyenda de la Bolsa", fase: "final",
    desc: "Ganá con los 5 arquetipos.",
    test: (c) => c.meta.arquetiposGanados.length >= 5,
  },
];

// Devuelve los logros nuevos (no presentes en meta.logros) que pasan su test
export function checkLogros(ctx, fase) {
  const ya = ctx.meta.logros || {};
  return LOGROS.filter((l) => l.fase === fase && !ya[l.id] && l.test(ctx));
}
