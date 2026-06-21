// ============================================================
// juice.jsx — Feedback lúdico: toasts, confetti, racha, resumen, tally
// ============================================================
import { useState, useEffect, useMemo, useRef } from "react";
import { sfx } from "../sound.js";

// --- Cola de toasts (logros, misiones, rachas) ---
export function ToastQueue({ toasts, onDone }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDone={() => onDone(t.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3600);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className={"toast " + (toast.tipo === "logro" ? "toast-logro" : "")} onClick={onDone}>
      <span className="toast-emoji">{toast.emoji}</span>
      <div className="toast-body">
        {toast.kicker && <div className="toast-kicker">{toast.kicker}</div>}
        <div className="toast-titulo">{toast.titulo}</div>
        {toast.sub && <div className="toast-sub">{toast.sub}</div>}
      </div>
    </div>
  );
}

// --- Confetti CSS (críticos y grandes victorias) ---
const CONF_COLORS = ["#e0b13a", "#34a0a4", "#5a9e3f", "#cf7359", "#f5f0e4", "#e8693c"];
export function Confetti({ seed = 1 }) {
  const piezas = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        left: ((i * 37 + seed * 13) % 100),
        delay: ((i * 53) % 40) / 100,
        dur: 1.1 + ((i * 29) % 60) / 100,
        color: CONF_COLORS[i % CONF_COLORS.length],
        rot: (i * 47) % 360,
        size: 6 + ((i * 31) % 7),
      })),
    [seed]
  );
  return (
    <div className="confetti" aria-hidden="true">
      {piezas.map((p, i) => (
        <span
          key={i}
          className="confetti-pieza"
          style={{
            left: p.left + "%",
            animationDelay: p.delay + "s",
            animationDuration: p.dur + "s",
            background: p.color,
            width: p.size,
            height: p.size * 0.6,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// --- Chip de racha en el tablero ---
export function RachaChip({ racha }) {
  if (racha < 2) return null;
  return (
    <div className={"racha-chip " + (racha >= 5 ? "racha-max" : "")} title="Rondas positivas seguidas">
      🔥 <b>x{racha}</b>
    </div>
  );
}

// --- Resumen de puntos tras resolver una ronda ---
export function ResumenRonda({ resultado }) {
  if (!resultado) return null;
  const { puntos, racha, rachaRota, apuesta, offBackfire, offProfileExito } = resultado;
  return (
    <div className="resumen-ronda">
      {apuesta && offProfileExito && <span className="resumen-apuesta-ok">🎲 ¡La apuesta salió!</span>}
      {offBackfire && <span className="resumen-apuesta-mal">🎲 La apuesta rebotó</span>}
      {puntos > 0 && <span className="resumen-pts">+{puntos} pts</span>}
      {racha >= 2 && <span className="resumen-racha">🔥 Racha x{racha}</span>}
      {rachaRota && <span className="resumen-rota">💔 Racha rota</span>}
      {puntos === 0 && !rachaRota && !offBackfire && racha < 2 && <span className="resumen-neutro">Ronda dura. A remarla.</span>}
    </div>
  );
}

// --- Misiones del arquetipo (colapsable durante la partida) ---
export function MisionChips({ misiones, completadas }) {
  const [abierto, setAbierto] = useState(false);
  if (!misiones || !misiones.length) return null;
  const hechas = misiones.filter((m) => completadas[m.id]).length;
  return (
    <div className="mision-wrap">
      <button className="mision-toggle" onClick={() => setAbierto(!abierto)}>
        🎯 Misiones <b>{hechas}/{misiones.length}</b> {abierto ? "▾" : "▸"}
      </button>
      {abierto && (
        <div className="mision-lista">
          {misiones.map((m) => (
            <div key={m.id} className={"mision-item " + (completadas[m.id] ? "mision-ok" : "")}>
              <span className="mision-check">{completadas[m.id] ? "✅" : "⬜"}</span>
              <div>
                <b>{m.nombre}</b>
                <div className="mision-desc">{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Conteo animado del puntaje final ---
export function Tally({ desglose, total, nuevoRecord }) {
  const [paso, setPaso] = useState(0); // cuántas líneas reveladas
  const [mostrado, setMostrado] = useState(0);
  const acumulado = desglose.slice(0, paso).reduce((a, d) => a + d.pts, 0);
  const objetivo = paso >= desglose.length ? total : acumulado;
  const rafRef = useRef(null);

  useEffect(() => {
    if (paso < desglose.length) {
      const t = setTimeout(() => {
        sfx.tickTally();
        setPaso(paso + 1);
      }, paso === 0 ? 350 : 600);
      return () => clearTimeout(t);
    }
    if (nuevoRecord) {
      const t = setTimeout(() => sfx.record(), 700);
      return () => clearTimeout(t);
    }
  }, [paso]);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const desde = mostrado;
    const hasta = objetivo;
    if (desde === hasta) return;
    const t0 = performance.now();
    const dur = 450;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      setMostrado(Math.round(desde + (hasta - desde) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [objetivo]);

  const completo = paso >= desglose.length;
  return (
    <div className="tally">
      <div className="tally-total">
        <span className="tally-label">Puntaje</span>
        <span className="tally-num">{mostrado}</span>
      </div>
      <div className="tally-lineas">
        {desglose.slice(0, paso).map((d, i) => (
          <div key={i} className="tally-linea">
            <span>{d.label}</span>
            <b>{d.pts >= 0 ? "+" : ""}{d.pts}</b>
          </div>
        ))}
      </div>
      {completo && nuevoRecord && <div className="tally-record">🏅 ¡NUEVO RÉCORD PERSONAL!</div>}
    </div>
  );
}
