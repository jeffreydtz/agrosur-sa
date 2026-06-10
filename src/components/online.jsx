// ============================================================
// online.jsx — Pantallas del modo online (rooms)
// ============================================================
import { useState, useEffect } from "react";
import { ARQUETIPOS } from "../data.js";
import { sfx } from "../sound.js";
import { ArquetipoSelect } from "./screens.jsx";
import { crearRoom, unirseRoom, iniciarRoom, salirRoom, msRestantes } from "../online.js";

const LIMITES = [5, 10, 15, 20];

function arqDe(arqId) {
  return ARQUETIPOS.find((a) => a.id === arqId);
}

// --- Menú online: crear o unirse ---
export function OnlineMenu({ onCrear, onUnirse, onVolver }) {
  return (
    <div className="pantalla modo-select">
      <h2 className="seccion-titulo">Jugar online</h2>
      <div className="modo-grid">
        <button className="modo-card" onClick={() => { sfx.click(); onCrear(); }}>
          <span className="modo-emoji">🏗️</span>
          <span className="modo-nombre">Crear room</span>
          <span className="modo-desc">Generás un código de 5 letras y se lo pasás a los demás.</span>
        </button>
        <button className="modo-card" onClick={() => { sfx.click(); onUnirse(); }}>
          <span className="modo-emoji">🔑</span>
          <span className="modo-nombre">Unirse a un room</span>
          <span className="modo-desc">Entrás con tu nombre y el código que te pasaron.</span>
        </button>
      </div>
      <button className="btn btn-ghost" onClick={() => { sfx.click(); onVolver(); }}>◂ Volver</button>
    </div>
  );
}

// --- Aviso cuando falta config de Firebase ---
export function OnlineNoConfig({ onVolver }) {
  return (
    <div className="pantalla online-config">
      <h2 className="seccion-titulo">Online no configurado</h2>
      <p className="online-config-txt">
        El modo online usa Firebase Realtime Database. Para activarlo:
      </p>
      <ol className="online-config-pasos">
        <li>Creá un proyecto en <b>console.firebase.google.com</b> y agregale una <b>Realtime Database</b> (modo de prueba).</li>
        <li>Registrá una app web y copiá la config.</li>
        <li>Creá <code>.env.local</code> en la raíz del proyecto (hay un ejemplo en <code>.env.local.example</code>) y pegá los valores.</li>
        <li>Reiniciá el servidor de desarrollo.</li>
      </ol>
      <button className="btn btn-grande" onClick={() => { sfx.click(); onVolver(); }}>◂ Volver</button>
    </div>
  );
}

// --- Setup de crear/unirse: datos + arquetipo, hace el alta en Firebase ---
export function OnlineSetup({ modoSetup, onRoom, onVolver }) {
  const esCrear = modoSetup === "crear";
  const [paso, setPaso] = useState("datos"); // datos | arquetipo
  const [codigo, setCodigo] = useState("");
  const [limiteMin, setLimiteMin] = useState(10);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function elegirArquetipo(arqId, nombre) {
    if (cargando) return;
    const arq = arqDe(arqId);
    const perfil = {
      nombre: nombre || "Jugador",
      arqId, arqEmoji: arq.emoji, arqNombre: arq.nombre,
    };
    setCargando(true);
    setError(null);
    try {
      const res = esCrear
        ? await crearRoom({ ...perfil, limiteMin })
        : await unirseRoom(codigo, perfil);
      onRoom({ ...res, ...perfil });
    } catch (e) {
      setError(e.message || "Algo falló. Probá de nuevo.");
      setCargando(false);
      setPaso("datos");
    }
  }

  if (paso === "arquetipo") {
    return (
      <div className="online-setup">
        {cargando && <div className="online-cargando">Conectando…</div>}
        <ArquetipoSelect
          titulo={esCrear ? "Tu AgroSur (creás el room)" : "Tu AgroSur (room " + codigo.toUpperCase() + ")"}
          permitirAzar
          jugadorNum={1}
          onElegir={elegirArquetipo}
        />
        <button className="btn btn-ghost" onClick={() => { sfx.click(); setPaso("datos"); }}>◂ Volver</button>
      </div>
    );
  }

  return (
    <div className="pantalla online-setup">
      <h2 className="seccion-titulo">{esCrear ? "Crear room" : "Unirse a un room"}</h2>
      {esCrear ? (
        <div className="online-form">
          <label className="online-label">Tiempo límite de la partida</label>
          <div className="limite-grid">
            {LIMITES.map((m) => (
              <button
                key={m}
                className={"limite-btn " + (limiteMin === m ? "limite-sel" : "")}
                onClick={() => { sfx.click(); setLimiteMin(m); }}
              >
                {m} min
              </button>
            ))}
          </div>
          <p className="online-hint">Cuando se acaba el tiempo, la partida se cierra para todos y gana el mejor Valor de Empresa.</p>
        </div>
      ) : (
        <div className="online-form">
          <label className="online-label">Código del room</label>
          <input
            className="nombre-input codigo-input"
            placeholder="p. ej. K7M2X"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            maxLength={5}
            autoFocus
          />
        </div>
      )}
      {error && <p className="online-error">⚠️ {error}</p>}
      <div className="online-acciones">
        <button className="btn btn-ghost" onClick={() => { sfx.click(); onVolver(); }}>◂ Volver</button>
        <button
          className="btn btn-grande"
          disabled={!esCrear && codigo.trim().length < 5}
          onClick={() => { sfx.click(); setPaso("arquetipo"); }}
        >
          Siguiente ▸
        </button>
      </div>
    </div>
  );
}

// --- Lobby: código grande, lista de jugadores, host arranca ---
export function LobbyScreen({ online, room, onSalir }) {
  const jugadores = Object.entries((room && room.jugadores) || {});
  const soyHost = room && room.host === online.playerId;
  return (
    <div className="pantalla lobby">
      <h2 className="seccion-titulo">Room</h2>
      <div className="lobby-codigo" title="Compartí este código">
        {online.codigo.split("").map((c, i) => <span key={i} className="codigo-letra">{c}</span>)}
      </div>
      <p className="lobby-sub">Compartí el código · ⏱ {room ? room.limiteMin : "…"} min de partida · ranking en vivo</p>
      <div className="lobby-jugadores">
        {jugadores.map(([pid, j]) => (
          <div key={pid} className="lobby-jugador">
            <span className="lobby-arq">{j.arqEmoji}</span>
            <span className="lobby-nombre">{j.nombre}</span>
            {pid === room.host && <span className="lobby-host">HOST</span>}
            {pid === online.playerId && <span className="lobby-vos">vos</span>}
          </div>
        ))}
      </div>
      {soyHost ? (
        <button
          className="btn btn-grande"
          disabled={jugadores.length < 2}
          onClick={() => { sfx.click(); iniciarRoom(online.codigo); }}
        >
          {jugadores.length < 2 ? "Esperando jugadores…" : "Comenzar partida ▸"}
        </button>
      ) : (
        <p className="lobby-espera">Esperando a que el host comience…</p>
      )}
      <button
        className="btn btn-ghost"
        onClick={() => { sfx.click(); salirRoom(online.codigo, online.playerId); onSalir(); }}
      >
        ◂ Salir del room
      </button>
    </div>
  );
}

// --- Reloj + ranking en vivo durante la partida ---
export function OnlineHud({ room, playerId, onExpira }) {
  const [, setTickCount] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTickCount((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const ms = msRestantes(room);
  useEffect(() => {
    if (ms != null && ms <= 0) onExpira();
  });

  if (!room) return null;
  const restante = Math.max(0, ms || 0);
  const mm = Math.floor(restante / 60000);
  const ss = Math.floor((restante % 60000) / 1000);
  const urgente = restante < 60000;

  const ranking = Object.entries(room.jugadores || {})
    .map(([pid, j]) => ({ pid, ...j }))
    .sort((a, b) => (b.puntaje || 0) - (a.puntaje || 0));

  return (
    <div className="online-hud">
      <div className={"hud-reloj " + (urgente ? "reloj-urgente" : "")}>
        ⏱ {mm}:{String(ss).padStart(2, "0")}
      </div>
      <div className="hud-ranking">
        {ranking.map((j, i) => (
          <span key={j.pid} className={"hud-jugador " + (j.pid === playerId ? "hud-vos" : "")}>
            {i + 1}. {j.arqEmoji} {j.nombre}
            <b> {j.finalizado ? (j.valor != null ? j.valor : j.puntaje) : (j.puntaje || 0)}</b>
            {j.finalizado ? " 🏁" : j.terminado ? " 💀" : j.ronda ? ` · R${j.ronda}` : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

// --- Posiciones finales del room ---
export function PosicionesOnline({ room, playerId, onVerInforme, onReiniciar }) {
  const medallas = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣"];
  const jugadores = Object.entries((room && room.jugadores) || {})
    .map(([pid, j]) => ({ pid, ...j }))
    .sort((a, b) => {
      if (!!b.finalizado !== !!a.finalizado) return b.finalizado ? 1 : -1;
      return (b.valor ?? -1) - (a.valor ?? -1) || (b.puntajeTotal ?? 0) - (a.puntajeTotal ?? 0);
    });
  const faltan = jugadores.filter((j) => !j.finalizado).length;

  return (
    <div className="pantalla posiciones">
      <h2 className="seccion-titulo">Tabla de posiciones</h2>
      <p className="posiciones-sub">
        {faltan > 0
          ? `Esperando a ${faltan} jugador${faltan > 1 ? "es" : ""}… el ranking se actualiza solo.`
          : "Mismo contexto, distintas organizaciones, distintos resultados."}
      </p>
      <div className="rank-lista">
        {jugadores.map((j, i) => (
          <div key={j.pid} className={"rank-fila " + (i === 0 && faltan === 0 ? "rank-ganador" : "")}>
            <span className="rank-medalla">{j.finalizado ? medallas[i] || "·" : "⏳"}</span>
            <span className="rank-emoji">{j.arqEmoji}</span>
            <div className="rank-info">
              <div className="rank-nombre">{j.nombre}{j.pid === playerId ? " (vos)" : ""}</div>
              <div className="rank-final">{j.finalizado ? j.finalNombre : "Todavía jugando · R" + (j.ronda || "1")}</div>
              <div className="rank-pts">{j.finalizado ? (j.puntajeTotal + " pts") : (j.puntaje || 0) + " pts parciales"}</div>
            </div>
            {j.pid === playerId && j.finalizado && (
              <button className="rank-informe" onClick={() => { sfx.click(); onVerInforme(); }}>📋 Informe</button>
            )}
            <span className="rank-valor">{j.finalizado && j.valor != null ? j.valor : "—"}</span>
          </div>
        ))}
      </div>
      <button className="btn btn-grande" onClick={() => { sfx.click(); onReiniciar(); }}>↺ Nueva partida</button>
    </div>
  );
}
