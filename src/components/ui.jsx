// ============================================================
// ui.jsx — Componentes presentacionales
// ============================================================
import { useState, useEffect, useRef } from "react";
import { INDICADORES } from "../data.js";
import { estadoColor, umbralDado } from "../engine.js";
import { sfx } from "../sound.js";
import { RachaChip } from "./juice.jsx";

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

// --- Una barra de indicador (con delta flotante) ---
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
        <div
          className={"barra-fill " + (delta != null && delta !== 0 ? (delta > 0 ? "fill-flash-up" : "fill-flash-down") : "")}
          style={{ width: valor + "%", background: fillColor }}
        />
      </div>
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
            <div className="tablero-arq">{etiqueta || estado.arqNombre}</div>
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
      <div className="tablero-barras">
        <Barra k="caja" valor={estado.caja} delta={deltas.caja} seq={seq} />
        <Barra k="confianza" valor={estado.confianza} delta={deltas.confianza} seq={seq} />
        <Barra k="adopcion" valor={estado.adopcion} delta={deltas.adopcion} seq={seq} />
        <Barra k="motivacion" valor={estado.motivacion} delta={deltas.motivacion} seq={seq} />
      </div>
    </div>
  );
}

// --- Par de dados 2d6 (giran, el primero clava y el segundo estira la tensión) ---
const PIPS = {
  1: [5], 2: [3, 7], 3: [3, 5, 7], 4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9],
};

function CaraD6({ valor }) {
  return (
    <div className="d6-cara">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => (
        <span key={c} className={"pip" + (PIPS[valor].includes(c) ? " pip-on" : "")} />
      ))}
    </div>
  );
}

export function Dado({ rolling, valor, d1, d2, umbral, exito, critico, pifia, onDone }) {
  const [caras, setCaras] = useState([d1 || 1, d2 || 1]);
  const [girando, setGirando] = useState([false, false]);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const settleRef = useRef(null);

  useEffect(() => {
    if (!rolling) {
      setCaras([d1 || 1, d2 || 1]);
      setGirando([false, false]);
      return;
    }
    let cancelado = false;
    let timer = null;
    let delay = 70;
    let i = 0;
    let fijado1 = false;
    const rand = () => 1 + Math.floor(Math.random() * 6);
    setGirando([true, true]);
    const settle = () => {
      if (cancelado) return;
      cancelado = true;
      clearTimeout(timer);
      setCaras([d1, d2]);
      setGirando([false, false]);
      if (onDoneRef.current) onDoneRef.current();
    };
    settleRef.current = settle;
    const tick = () => {
      if (cancelado) return;
      setCaras((c) => [fijado1 ? d1 : rand(), rand()]);
      sfx.diceTick(i++);
      delay *= 1.12;
      if (!fijado1 && delay >= 170) {
        // el primer dado clava; el segundo acelera de nuevo y estira el suspenso
        fijado1 = true;
        delay = 90;
        setCaras([d1, rand()]);
        setGirando([false, true]);
      }
      if (delay < 240) timer = setTimeout(tick, delay);
      else timer = setTimeout(settle, 430); // pausa dramática antes de revelar
    };
    timer = setTimeout(tick, delay);
    return () => { cancelado = true; clearTimeout(timer); };
  }, [rolling, d1, d2]);

  const estadoClase = rolling
    ? "dado-rolling"
    : critico ? "dado-critico"
    : pifia ? "dado-pifia"
    : exito === true ? "dado-exito"
    : exito === false ? "dado-fracaso" : "";

  const suma = caras[0] + caras[1];

  return (
    <div className="dado-wrap">
      <div
        className={"dados-par " + estadoClase}
        onClick={() => rolling && settleRef.current && settleRef.current()}
        title={rolling ? "Tocá para apurar los dados" : undefined}
      >
        <div className={"dado-d6 " + (girando[0] ? "d6-girando" : "d6-quieto")}>
          <CaraD6 valor={caras[0]} />
        </div>
        <span className="dados-mas">+</span>
        <div className={"dado-d6 d6-segundo " + (girando[1] ? "d6-girando" : "d6-quieto")}>
          <CaraD6 valor={caras[1]} />
        </div>
        <span className={"dados-total" + (rolling ? " total-rolling" : "")}>= {suma}</span>
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
export function Opcion({ opcion, estado, onElegir, deshabilitado, seleccionada }) {
  const esDado = !!opcion.dado;
  const umbral = esDado ? umbralDado(estado, opcion.rel, opcion.umbralMod || 0) : null;
  const enRojo = esDado && opcion.rel && estado[opcion.rel] < 30;
  const indRel = opcion.rel ? INDICADORES[opcion.rel] : null;
  const rachaEnJuego = esDado && estado.racha >= 3;

  return (
    <button
      className={"opcion " + (esDado ? "opcion-dado " : "") + (seleccionada ? "opcion-sel " : "")}
      onClick={() => onElegir(opcion)}
      disabled={deshabilitado}
    >
      <div className="opcion-head">
        <span className="opcion-letra">{opcion.id}</span>
        <span className="opcion-texto">{opcion.texto}</span>
        {esDado && <span className="opcion-d20">🎲</span>}
      </div>

      {!esDado && (
        <div className="opcion-ef"><Efectos ef={opcion.ef} /></div>
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
