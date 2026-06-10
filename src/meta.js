// ============================================================
// meta.js — Persistencia local (logros, colección, récords)
// localStorage con try/catch: si falla, el juego sigue sin memoria.
// ============================================================

const KEY = "agrosur.v1";

const DEFAULT = {
  version: 1,
  muted: false,
  partidas: 0,
  mejorPuntaje: 0,
  mejorValor: 0,
  finalesVistos: [],      // ids de FINALES
  arquetiposGanados: [],  // ids de ARQUETIPOS (valor ≥60 sin quiebra)
  logros: {},             // { logroId: fechaISO }
};

let cache = null;

export function getMeta() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
  } catch {
    cache = { ...DEFAULT };
  }
  return cache;
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch { /* sin persistencia: seguimos en memoria */ }
}

export function updateMeta(fn) {
  cache = fn({ ...getMeta() });
  save();
  return cache;
}

export function isMuted() {
  return getMeta().muted;
}

export function setMuted(m) {
  updateMeta((meta) => ({ ...meta, muted: m }));
}

// Registra el cierre de una partida. Colección y récords solo en modo
// individual (dispositivo compartido en multi → no contaminar la colección).
export function recordRun({ estado, finalId, valor, puntaje, modo }) {
  let nuevoRecord = false;
  updateMeta((meta) => {
    const n = { ...meta, partidas: meta.partidas + 1 };
    if (modo === "individual") {
      if (!n.finalesVistos.includes(finalId)) n.finalesVistos = [...n.finalesVistos, finalId];
      const gano = finalId !== "quiebra" && valor >= 60;
      if (gano && !n.arquetiposGanados.includes(estado.arquetipo)) {
        n.arquetiposGanados = [...n.arquetiposGanados, estado.arquetipo];
      }
      if (puntaje > n.mejorPuntaje) { n.mejorPuntaje = puntaje; nuevoRecord = n.partidas > 1; }
      if (valor > n.mejorValor) n.mejorValor = valor;
    }
    return n;
  });
  return { nuevoRecord, meta: getMeta() };
}

export function registrarLogros(ids) {
  if (!ids.length) return getMeta();
  return updateMeta((meta) => {
    const logros = { ...meta.logros };
    const hoy = new Date().toISOString().slice(0, 10);
    for (const id of ids) if (!logros[id]) logros[id] = hoy;
    return { ...meta, logros };
  });
}
