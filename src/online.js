// ============================================================
// online.js — Rooms multijugador sobre Firebase RTDB
//
// Estructura en la base:
// rooms/{CODIGO}: {
//   creado, host: playerId, estado: "lobby" | "jugando",
//   limiteMin, inicioTs, plan: [pasos serializados],
//   jugadores: { [playerId]: { nombre, arqId, arqEmoji, arqNombre,
//     ronda, puntaje, caja, confianza, adopcion, motivacion,
//     terminado, finalizado, puntajeTotal, finalNombre, valor, ts } }
// }
// ============================================================
import {
  ref, get, set, update, onValue, onDisconnect, serverTimestamp, remove,
} from "firebase/database";
import { db } from "./firebase.js";
import { construirPlan, serializarPlan } from "./engine.js";

const MAX_JUGADORES = 6;

// Sin caracteres ambiguos (0/O, 1/I/L)
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generarCodigo() {
  let c = "";
  for (let i = 0; i < 5; i++) c += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  return c;
}

export function nuevoPlayerId() {
  let id = sessionStorage.getItem("agrosur_pid");
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem("agrosur_pid", id);
  }
  return id;
}

function perfilInicial({ nombre, arqId, arqEmoji, arqNombre }) {
  return {
    nombre, arqId, arqEmoji, arqNombre,
    ronda: 0, puntaje: 0,
    caja: null, confianza: null, adopcion: null, motivacion: null,
    terminado: false, finalizado: false,
    puntajeTotal: null, finalNombre: null, valor: null,
    ts: serverTimestamp(),
  };
}

// Crea room; reintenta si el código ya existe. Devuelve { codigo, playerId }.
export async function crearRoom({ nombre, arqId, arqEmoji, arqNombre, limiteMin }) {
  const playerId = nuevoPlayerId();
  for (let intento = 0; intento < 5; intento++) {
    const codigo = generarCodigo();
    const r = ref(db, "rooms/" + codigo);
    const snap = await get(r);
    if (snap.exists()) continue;
    await set(r, {
      creado: serverTimestamp(),
      host: playerId,
      estado: "lobby",
      limiteMin,
      inicioTs: null,
      plan: serializarPlan(construirPlan({ multi: true })),
      jugadores: { [playerId]: perfilInicial({ nombre, arqId, arqEmoji, arqNombre }) },
    });
    onDisconnect(ref(db, `rooms/${codigo}/jugadores/${playerId}/conectado`)).set(false);
    return { codigo, playerId };
  }
  throw new Error("No pude generar un código de room. Probá de nuevo.");
}

// Se une a un room existente. Devuelve { codigo, playerId }.
export async function unirseRoom(codigo, { nombre, arqId, arqEmoji, arqNombre }) {
  codigo = codigo.trim().toUpperCase();
  const r = ref(db, "rooms/" + codigo);
  const snap = await get(r);
  if (!snap.exists()) throw new Error("No existe un room con el código " + codigo + ".");
  const room = snap.val();
  if (room.estado !== "lobby") throw new Error("Ese room ya empezó la partida.");
  const cant = Object.keys(room.jugadores || {}).length;
  if (cant >= MAX_JUGADORES) throw new Error("El room está lleno (" + MAX_JUGADORES + " jugadores).");
  const playerId = nuevoPlayerId();
  await set(ref(db, `rooms/${codigo}/jugadores/${playerId}`),
    perfilInicial({ nombre, arqId, arqEmoji, arqNombre }));
  return { codigo, playerId };
}

// Host arranca la partida: fija inicio y pasa a "jugando".
export function iniciarRoom(codigo) {
  return update(ref(db, "rooms/" + codigo), {
    estado: "jugando",
    inicioTs: serverTimestamp(),
  });
}

// Suscripción al room completo. Devuelve unsubscribe.
export function escucharRoom(codigo, cb) {
  return onValue(ref(db, "rooms/" + codigo), (snap) => cb(snap.val()));
}

// Publica progreso del jugador local (tras cada paso).
export function publicarProgreso(codigo, playerId, estado, rondaLabel) {
  return update(ref(db, `rooms/${codigo}/jugadores/${playerId}`), {
    ronda: rondaLabel,
    puntaje: estado.puntaje,
    caja: estado.caja,
    confianza: estado.confianza,
    adopcion: estado.adopcion,
    motivacion: estado.motivacion,
    terminado: !!estado.terminado,
    ts: serverTimestamp(),
  });
}

// Publica el cierre del jugador local (puntaje final, final alcanzado).
export function publicarFinal(codigo, playerId, { puntajeTotal, finalNombre, valor }) {
  return update(ref(db, `rooms/${codigo}/jugadores/${playerId}`), {
    finalizado: true,
    terminado: true,
    puntajeTotal,
    finalNombre,
    valor,
    ts: serverTimestamp(),
  });
}

// Salir del lobby. Si se va el host (o no queda nadie), se borra el room.
export async function salirRoom(codigo, playerId) {
  const snap = await get(ref(db, "rooms/" + codigo));
  if (!snap.exists()) return;
  if (snap.val().host === playerId) {
    await remove(ref(db, "rooms/" + codigo));
    return;
  }
  await remove(ref(db, `rooms/${codigo}/jugadores/${playerId}`));
  const rest = await get(ref(db, `rooms/${codigo}/jugadores`));
  if (!rest.exists()) await remove(ref(db, "rooms/" + codigo));
}

// Milisegundos restantes según el reloj del room.
export function msRestantes(room) {
  if (!room || !room.inicioTs || !room.limiteMin) return null;
  return room.inicioTs + room.limiteMin * 60000 - Date.now();
}
