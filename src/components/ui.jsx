// ============================================================
// ui.jsx — Componentes presentacionales
// ============================================================
import { useState, useEffect, useRef } from "react";
import { INDICADORES, AFIN_BY_ARQ } from "../data.js";
import { CAT_LABEL } from "../dataPool.js";
import { estadoColor, umbralDado, esApuesta, previsualizarApuesta } from "../engine.js";
import { sfx } from "../sound.js";
import { RachaChip } from "./juice.jsx";

// --- Tilt 3D con mouse (solo punteros finos; setea --rx/--ry/--mx/--my) ---
export function useTilt(max = 5) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(pointer:fine)").matches) return;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--rx", (-py * max).toFixed(2) + "deg");
      el.style.setProperty("--ry", (px * max).toFixed(2) + "deg");
      el.style.setProperty("--mx", ((px + 0.5) * 100).toFixed(1) + "%");
      el.style.setProperty("--my", ((py + 0.5) * 100).toFixed(1) + "%");
    };
    const leave = () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, [max]);
  return ref;
}

// --- Chip de efecto (flecha) ---
export function Chip({ k, v }) {
  const ind = INDICADORES[k];
  if (!ind || !v) return null;
  const up = v > 0;
  return (
    <span className="chip" style={{ "--c": ind.color }}>
      <span className="chip-emoji">{ind.emoji}</span>
      <span className="chip-val">{up ? "+" : "−"}{Math.abs(v)}</span>
    </span>
  );
}

// --- Línea de efectos a partir de un objeto ef ---
export function Efectos({ ef }) {
  if (!ef) return null;
  const orden = ["caja", "confianza", "adopcion", "motivacion"];
  const chips = orden.filter((k) => ef[k] != null && ef[k] !== 0);
  if (!chips.length) return <span className="chip chip-neutro">sin efecto directo</span>;
  return <span className="efectos">{chips.map((k) => <Chip key={k} k={k} v={ef[k]} />)}</span>;
}

// --- Una barra de indicador (con delta flotante y ticks de umbral) ---
export function Barra({ k, valor, delta, seq }) {
  const ind = INDICADORES[k];
  const estado = estadoColor(valor);
  const fillColor = estado === "verde" ? "#5a9e3f" : estado === "ambar" ? "#d9a521" : "#cf4631";
  return (
    <div className={"barra " + (estado === "rojo" ? "barra-rojo" : "")}>
      <div className="barra-top">
        <span className="barra-emoji">{ind.emoji}</span>
        <span className="barra-nombre">{ind.nombre}</span>
        <span className="barra-num" style={{ color: fillColor }}>
          {valor}
          {delta != null && delta !== 0 && (
            <span key={seq} className={"barra-float " + (delta > 0 ? "float-up" : "float-down")}>
              {delta > 0 ? "+" : "−"}{Math.abs(delta)}
            </span>
          )}
        </span>
      </div>
      <div className="barra-track">
        <span className="barra-tick" style={{ left: "30%" }} />
        <span className="barra-tick" style={{ left: "60%" }} />
        <div
          className={"barra-fill " + (delta != null && delta !== 0 ? (delta > 0 ? "fill-flash-up" : "fill-flash-down") : "")}
          style={{ width: valor + "%", "--bc": fillColor }}
        />
      </div>
    </div>
  );
}

// --- Viaje de la partida: un nodo por ronda ---
function Journey({ ronda, total }) {
  const media = String(ronda).includes("½");
  const n = parseInt(ronda, 10) || 0;
  return (
    <div className="journey" aria-hidden="true" title={"Ronda " + ronda + " de " + total}>
      {Array.from({ length: total }, (_, i) => {
        const num = i + 1;
        const clase =
          num < n || (num === n && media) ? "j-done"
          : num === n ? "j-cur"
          : num === n + 1 && media ? "j-next"
          : "";
        return <span key={num} className={"journey-dot " + clase} />;
      })}
    </div>
  );
}

// --- Tablero superior ---
export function Tablero({ estado, ronda, totalRondas, etiqueta, fx }) {
  const deltas = (fx && fx.deltas) || {};
  const seq = fx ? fx.seq : 0;
  return (
    <div className="tablero">
      <div className="tablero-head">
        <div className="tablero-empresa">
          <span className="tablero-emoji">{estado.arqEmoji}</span>
          <div>
            <div className="tablero-nombre">{estado.nombreJugador}</div>
            <div className="tablero-arq">
              {etiqueta || (estado.nombreJugador !== estado.arqNombre ? estado.arqNombre : "AgroSur S.A.")}
            </div>
          </div>
        </div>
        <RachaChip racha={estado.racha} />
        <div className="tablero-pts" title="Puntaje de la partida">
          <span className="pts-label">PTS</span>
          <span className="pts-num" key={estado.puntaje}>{estado.puntaje}</span>
        </div>
        <div className="tablero-ronda">
          <span className="ronda-label">Ronda</span>
          <span className="ronda-num">{ronda}<span className="ronda-tot">/{totalRondas}</span></span>
        </div>
      </div>
      <Journey ronda={ronda} total={totalRondas} />
      <div className="tablero-barras">
        <Barra k="caja" valor={estado.caja} delta={deltas.caja} seq={seq} />
        <Barra k="confianza" valor={estado.confianza} delta={deltas.confianza} seq={seq} />
        <Barra k="adopcion" valor={estado.adopcion} delta={deltas.adopcion} seq={seq} />
        <Barra k="motivacion" valor={estado.motivacion} delta={deltas.motivacion} seq={seq} />
      </div>
    </div>
  );
}

// ============================================================
// Dados 3D (2d6): cubos reales que ruedan, frenan y clavan.
// El primero clava antes; el segundo estira el suspenso.
// ============================================================
const PIPS = {
  1: [5], 2: [3, 7], 3: [3, 5, 7], 4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9],
};

function CaraPips({ valor }) {
  return (
    <div className="d6-cara">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => (
        <span key={c} className={"pip" + (PIPS[valor].includes(c) ? " pip-on" : "")} />
      ))}
    </div>
  );
}

// cara frontal=1, trasera=6, derecha=2, izquierda=5, arriba=3, abajo=4
const CARAS = [
  { v: 1, clase: "cf" }, { v: 6, clase: "cb" },
  { v: 2, clase: "cr" }, { v: 5, clase: "cl" },
  { v: 3, clase: "ct" }, { v: 4, clase: "cd" },
];

// rotación [rx, ry] que deja el valor mirando al frente
const ORIENT = { 1: [0, 0], 2: [0, -90], 3: [-90, 0], 4: [90, 0], 5: [0, 90], 6: [0, 180] };

function targetTransform(valor, vueltasX, vueltasY) {
  const [rx, ry] = ORIENT[valor];
  return `rotateX(${rx - 360 * vueltasX}deg) rotateY(${ry + 360 * vueltasY}deg)`;
}

function CuboD6({ transform, dur, landing }) {
  return (
    <div className={"d6-escena" + (landing ? " d6-land" : "")}>
      <div className="cubo" style={transform ? { transform, transitionDuration: dur + "s" } : undefined}>
        {CARAS.map(({ v, clase }) => (
          <div key={v} className={"cara3d " + clase}><CaraPips valor={v} /></div>
        ))}
      </div>
    </div>
  );
}

const DUR1 = 1.15;  // segundos hasta que clava el primer dado
const DUR2 = 2.0;   // el segundo estira el suspenso
const PAUSA = 380;  // pausa dramática antes de revelar el resultado

export function Dado({ rolling, valor, d1, d2, umbral, exito, critico, pifia, onDone }) {
  // anim: transforms + duraciones actuales de cada cubo
  const [anim, setAnim] = useState(() =>
    rolling ? null : { t1: targetTransform(d1 || 1, 0, 0), t2: targetTransform(d2 || 1, 0, 0), dur1: 0, dur2: 0 }
  );
  const [landed, setLanded] = useState(rolling ? 0 : 2);
  const timers = useRef([]);
  const skipRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!rolling) {
      setAnim({ t1: targetTransform(d1 || 1, 0, 0), t2: targetTransform(d2 || 1, 0, 0), dur1: 0, dur2: 0 });
      setLanded(2);
      return;
    }
    // ticks de sonido con cadencia decreciente mientras giran
    let i = 0, delay = 70, cancel = false;
    const tick = () => {
      if (cancel) return;
      sfx.diceTick(i++);
      delay *= 1.16;
      if (delay < 320) timers.current.push(setTimeout(tick, delay));
    };
    timers.current.push(setTimeout(tick, delay));

    const raf = requestAnimationFrame(() => {
      setAnim({
        t1: targetTransform(d1, 4, 3),
        t2: targetTransform(d2, 5, 4),
        dur1: DUR1, dur2: DUR2,
      });
    });
    timers.current.push(setTimeout(() => { sfx.thunk(); setLanded(1); }, DUR1 * 1000));
    timers.current.push(setTimeout(() => { sfx.thunk(); setLanded(2); }, DUR2 * 1000));
    timers.current.push(setTimeout(() => { onDoneRef.current && onDoneRef.current(); }, DUR2 * 1000 + PAUSA));

    return () => {
      cancel = true;
      cancelAnimationFrame(raf);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [rolling, d1, d2]);

  function apurar() {
    if (!rolling || skipRef.current) return;
    skipRef.current = true;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setAnim({ t1: targetTransform(d1, 1, 1), t2: targetTransform(d2, 1, 1), dur1: 0.22, dur2: 0.3 });
    timers.current.push(setTimeout(() => { sfx.thunk(); setLanded(2); }, 320));
    timers.current.push(setTimeout(() => { onDoneRef.current && onDoneRef.current(); }, 520));
  }

  const estadoClase = rolling
    ? "dado-rolling"
    : critico ? "dado-critico"
    : pifia ? "dado-pifia"
    : exito === true ? "dado-exito"
    : exito === false ? "dado-fracaso" : "";

  const total = (d1 || 1) + (d2 || 1);

  return (
    <div className="dado-wrap">
      <div
        className={"dados-par " + estadoClase}
        onClick={apurar}
        title={rolling ? "Tocá para apurar los dados" : undefined}
      >
        <CuboD6 transform={anim && anim.t1} dur={anim ? anim.dur1 : 0} landing={landed >= 1} />
        <span className="dados-mas">+</span>
        <CuboD6 transform={anim && anim.t2} dur={anim ? anim.dur2 : 0} landing={landed >= 2} />
        <span className={"dados-total" + (landed < 2 ? " total-rolling" : "")}>
          {landed < 2 ? "= ?" : "= " + total}
        </span>
      </div>
      {!rolling && exito != null && (
        <div className={"dado-result " + (critico ? "txt-critico" : pifia ? "txt-pifia" : exito ? "txt-exito" : "txt-fracaso")}>
          {critico ? "★ ¡CRÍTICO!" : pifia ? "☠ ¡PIFIA!" : exito ? "✓ ÉXITO" : "✗ FRACASO"}{" "}
          <span className="dado-tirada">({valor} vs {umbral}+)</span>
        </div>
      )}
      {rolling && umbral && (
        <div className="dado-objetivo">Necesitás {umbral}+ · doble 6 = crítico ★</div>
      )}
    </div>
  );
}

// --- Botón de opción ---
export function Opcion({ opcion, estado, onElegir, deshabilitado, seleccionada, indice = 0 }) {
  const esDado = !!opcion.dado;
  // Fuera de perfil: categoría que no está en la afinidad del arquetipo
  const off = !!(opcion.cat && !(AFIN_BY_ARQ[estado.arquetipo] || []).includes(opcion.cat));
  // Apuesta: opción fuera de perfil, sin dado propio y con efecto positivo
  // => se resuelve tirando dados (riesgo real, no bonus gratis).
  const apuesta = esApuesta(estado, opcion);
  const esTirada = esDado || apuesta;
  const pv = apuesta ? previsualizarApuesta(estado, opcion) : null;
  const umbral = esDado ? umbralDado(estado, opcion.rel, (opcion.umbralMod || 0) + (off ? 1 : 0)) : null;
  const enRojo = esDado && opcion.rel && estado[opcion.rel] < 30;
  const indRel = opcion.rel ? INDICADORES[opcion.rel] : null;
  const rachaEnJuego = esTirada && estado.racha >= 3;

  return (
    <button
      className={"opcion " + (esTirada ? "opcion-dado " : "") + (apuesta ? "opcion-apuesta " : "") + (seleccionada ? "opcion-sel " : "")}
      onClick={() => onElegir(opcion)}
      disabled={deshabilitado}
      style={{ animationDelay: indice * 0.08 + "s" }}
      title={"Atajo de teclado: " + opcion.id}
    >
      <div className="opcion-head">
        <span className="opcion-letra">{opcion.id}</span>
        <span className="opcion-texto">{opcion.texto}</span>
        {esTirada && <span className="opcion-d20">🎲</span>}
      </div>

      {opcion.cat && (
        <div className="opcion-cat">
          <span className={"cat-chip " + (off ? "cat-off" : "cat-on")}>
            {CAT_LABEL[opcion.cat]} {off ? "· fuera de perfil" : "· tu fuerte"}
          </span>
          {off && !apuesta && <span className="cat-hint">+60% puntos si sale bien</span>}
          {apuesta && <span className="cat-hint cat-hint-apuesta">🎲 apuesta · sale mejor o rebota</span>}
        </div>
      )}

      {!esTirada && (
        <div className="opcion-ef"><Efectos ef={opcion.ef} /></div>
      )}

      {apuesta && pv && (
        <div className="opcion-dado-info opcion-apuesta-info">
          <div className="dado-linea">
            <span className="dado-badge apuesta-badge">🎲 Apuesta · fuera de tu terreno</span>
            {pv.rel && estado[pv.rel] < 30
              ? <span className="dado-warning">⚠️ {INDICADORES[pv.rel].nombre} en rojo: sale con {pv.umbral}+</span>
              : <span className="dado-warning">Sale bien con {pv.umbral}+</span>}
            <span className="dado-bonus">★ +60% puntos si sale</span>
            {rachaEnJuego && <span className="dado-racha-tag">🔥 Racha en juego</span>}
          </div>
          <div className="rama rama-exito">
            <span className="rama-label">Sale</span><Efectos ef={pv.exito} />
          </div>
          <div className="rama rama-fracaso">
            <span className="rama-label">Rebota</span><Efectos ef={pv.fracaso} />
          </div>
        </div>
      )}

      {esDado && (
        <div className="opcion-dado-info">
          {opcion.ef && Object.keys(opcion.ef).length > 0 && (
            <div className="opcion-costo">Costo fijo: <Efectos ef={opcion.ef} /></div>
          )}
          <div className="dado-linea">
            <span className="dado-badge">🎲 Dado · {indRel ? indRel.nombre : "azar"}</span>
            {enRojo
              ? <span className="dado-warning">⚠️ {indRel.nombre} en rojo: necesitás {umbral}+</span>
              : <span className="dado-normal">Éxito con {umbral}+</span>}
            {opcion.umbralMod ? (
              <span className={opcion.umbralMod > 0 ? "dado-warning" : "dado-bonus"}>
                {opcion.umbralMod > 0 ? `🔁 +${opcion.umbralMod} por consecuencia` : `🤝 ${opcion.umbralMod} por tus lazos`}
              </span>
            ) : null}
            {off
              ? <span className="dado-warning">🚀 Fuera de perfil: +1 al umbral</span>
              : opcion.cat ? <span className="dado-bonus">✓ Tu terreno: tirada confiable</span> : null}
            {rachaEnJuego && <span className="dado-racha-tag">🔥 Racha en juego</span>}
          </div>
          <div className="rama rama-exito">
            <span className="rama-label">Éxito</span><Efectos ef={opcion.dado.exito.ef} />
          </div>
          <div className="rama rama-fracaso">
            <span className="rama-label">Fracaso</span><Efectos ef={opcion.dado.fracaso.ef} />
          </div>
        </div>
      )}
    </button>
  );
}
