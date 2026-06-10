// ============================================================
// firebase.js — Conexión a Firebase Realtime Database
// Config vía variables de entorno (.env.local, prefijo VITE_).
// Si falta config, el modo online queda deshabilitado con aviso.
// ============================================================
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Para usar solo Realtime Database alcanza con databaseURL;
// apiKey y demás solo hacen falta si se suman otros servicios (auth, etc.).
const config = {};
if (import.meta.env.VITE_FIREBASE_API_KEY) config.apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
if (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) config.authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
if (import.meta.env.VITE_FIREBASE_DATABASE_URL) config.databaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL;
if (import.meta.env.VITE_FIREBASE_PROJECT_ID) config.projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
if (import.meta.env.VITE_FIREBASE_APP_ID) config.appId = import.meta.env.VITE_FIREBASE_APP_ID;

export const onlineDisponible = !!config.databaseURL;

let db = null;
if (onlineDisponible) {
  const app = initializeApp(config);
  db = getDatabase(app);
}

export { db };
