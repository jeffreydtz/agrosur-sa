// ============================================================
// ui.jsx — Componentes presentacionales
// ============================================================
const { useState, useEffect, useRef } = React;

// --- Chip de efecto (flecha) ---
function Chip({ k, v }) {
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
function Efectos({ ef }) {
  if (!ef) return null;
  const orden = ["caja", "confianza", "adopcion", "motivacion"];
  const chips = orden.filter((k) => ef[k] != null && ef[k] !== 0);
  if (!chips.length) return <span className="chip chip-neutro">sin efecto directo</span>;
  return <span className="efectos">{chips.map((k) => <Chip key={k} k={k} v={ef[k]} />)}</span>;
}

// --- Una barra de indicador ---
function Barra({ k, valor, animar }) {
  const ind = INDICADORES[k];
  const estado = estadoColor(valor);
  const fillColor = estado === "verde" ? "#5a9e3f" : estado === "ambar" ? "#d9a521" : "#cf4631";
  return (
    <div className={"barra " + (estado === "rojo" ? "barra-rojo" : "")}>
      <div className="barra-top">
        <span className="barra-emoji">{ind.emoji}</span>
        <span className="barra-nombre">{ind.nombre}</span>
        <span className="barra-num" style={{ color: fillColor }}>{valor}</span>
      </div>
      <div className="barra-track">
        <div
          className={"barra-fill " + (animar ? "barra-anim" : "")}
          style={{ width: valor + "%", background: fillColor }}
        />
      </div>
    </div>
  );
}

// --- Tablero superior ---
function Tablero({ estado, ronda, totalRondas, etiqueta }) {
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
        <div className="tablero-ronda">
          <span className="ronda-label">Ronda</span>
          <span className="ronda-num">{ronda}<span className="ronda-tot">/{totalRondas}</span></span>
        </div>
      </div>
      <div className="tablero-barras">
        <Barra k="caja" valor={estado.caja} animar />
        <Barra k="confianza" valor={estado.confianza} animar />
        <Barra k="adopcion" valor={estado.adopcion} animar />
        <Barra k="motivacion" valor={estado.motivacion} animar />
      </div>
    </div>
  );
}

// --- Dado d20 ---
function Dado({ rolling, valor, umbral, exito, onDone }) {
  const [cara, setCara] = useState(valor || 1);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (rolling) {
      let ticks = 0;
      intervalRef.current = setInterval(() => {
        setCara(1 + Math.floor(Math.random() * 20));
        ticks++;
      }, 70);
      const t = setTimeout(() => {
        clearInterval(intervalRef.current);
        setCara(valor);
        if (onDone) onDone();
      }, 1300);
      return () => { clearInterval(intervalRef.current); clearTimeout(t); };
    } else {
      setCara(valor || 1);
    }
  }, [rolling, valor]);

  const estadoClase = rolling ? "dado-rolling" : (exito === true ? "dado-exito" : exito === false ? "dado-fracaso" : "");
  return (
    <div className="dado-wrap">
      <div className={"dado " + estadoClase}>
        <svg viewBox="0 0 100 100" className="dado-svg" aria-hidden="true">
          <polygon points="50,4 92,28 92,72 50,96 8,72 8,28" />
          <polygon className="dado-inner" points="50,18 78,34 78,66 50,82 22,66 22,34" />
        </svg>
        <span className="dado-num">{cara}</span>
      </div>
      {!rolling && exito != null && (
        <div className={"dado-result " + (exito ? "txt-exito" : "txt-fracaso")}>
          {exito ? "✓ ÉXITO" : "✗ FRACASO"} <span className="dado-tirada">({cara} vs {umbral}+)</span>
        </div>
      )}
      {rolling && umbral && (
        <div className="dado-objetivo">Necesitás {umbral}+</div>
      )}
    </div>
  );
}

// --- Botón de opción ---
function Opcion({ opcion, estado, onElegir, deshabilitado, seleccionada }) {
  const esDado = !!opcion.dado;
  const umbral = esDado ? umbralDado(estado, opcion.rel) : null;
  const enRojo = esDado && opcion.rel && estado[opcion.rel] < 30;
  const indRel = opcion.rel ? INDICADORES[opcion.rel] : null;

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
              ? <span className="dado-warning">⚠️ {indRel.nombre} en rojo: necesitás 15+</span>
              : <span className="dado-normal">Éxito con {umbral}+</span>}
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

Object.assign(window, { Chip, Efectos, Barra, Tablero, Dado, Opcion });
