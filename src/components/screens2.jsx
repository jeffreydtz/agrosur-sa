// ============================================================
// screens2.jsx — Final, Informe del Consultor, Posiciones
// ============================================================
import { useState, useEffect, useRef, useMemo } from "react";
import { INDICADORES } from "../data.js";
import { generarInforme } from "../consultor.js";
import { sfx } from "../sound.js";
import { Tally, Confetti } from "./juice.jsx";

// --- Gauge circular animado del Valor de Empresa ---
function RingGauge({ valor, color }) {
  const [prog, setProg] = useState(0);
  const [num, setNum] = useState(0);
  useEffect(() => {
    const raf1 = requestAnimationFrame(() => setProg(valor));
    const t0 = performance.now();
    const dur = 1500;
    let raf2;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      setNum(Math.round(valor * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf2 = requestAnimationFrame(step);
    };
    raf2 = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  }, [valor]);

  const R = 64;
  const C = 2 * Math.PI * R;
  return (
    <div className="ring-wrap" style={{ "--rc": color }}>
      <svg className="ring" viewBox="0 0 160 160" aria-hidden="true">
        <circle className="ring-track" cx="80" cy="80" r={R} />
        <circle
          className="ring-prog"
          cx="80" cy="80" r={R}
          stroke={color}
          strokeDasharray={C}
          strokeDashoffset={C * (1 - prog / 100)}
          transform="rotate(-90 80 80)"
        />
      </svg>
      <div className="ring-centro">
        <span className="ring-num" style={{ color }}>{num}</span>
        <span className="ring-de">/100</span>
      </div>
    </div>
  );
}

// --- Final (con conteo de puntaje, récord y logros nuevos) ---
export function FinalScreen({ jugador, resumen, onVerInforme }) {
  const { estado, final, valor, puntajeTotal, desglose } = jugador;
  const orden = ["caja", "confianza", "adopcion", "motivacion"];
  const festejo = final.id === "lider" || (resumen && resumen.nuevoRecord);
  return (
    <div className="pantalla final-screen" style={{ "--final-c": final.color }}>
      {festejo && <Confetti seed={3} denso />}
      <div className="final-card">
        <div className="final-emoji">{final.emoji}</div>
        <div className="final-kicker">Final alcanzado</div>
        <h2 className="final-titulo" style={{ color: final.color }}>{final.titulo}</h2>
        <p className="final-narrativa">{final.narrativa}</p>

        <div className="valor-empresa">
          <span className="valor-label">Valor de Empresa</span>
          <RingGauge valor={valor} color={final.color} />
        </div>

        <div className="final-indicadores">
          {orden.map((k) => {
            const ind = INDICADORES[k];
            const v = estado[k];
            const col = v >= 60 ? "#5a9e3f" : v >= 30 ? "#d9a521" : "#cf4631";
            return (
              <div key={k} className="final-ind">
                <span className="final-ind-emoji">{ind.emoji}</span>
                <span className="final-ind-num" style={{ color: col }}>{v}</span>
                <span className="final-ind-nombre">{ind.nombre}</span>
              </div>
            );
          })}
        </div>

        <Tally desglose={desglose} total={puntajeTotal} nuevoRecord={resumen && resumen.nuevoRecord} />

        {resumen && resumen.logros.length > 0 && (
          <div className="logros-reel">
            {resumen.logros.map((l) => (
              <div key={l.id} className="logro-item">
                <span className="logro-emoji">{l.emoji}</span>
                <div>
                  <div className="logro-nombre">🏆 {l.nombre}</div>
                  <div className="logro-desc">{l.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="btn btn-grande" onClick={() => { sfx.click(); onVerInforme(); }}>
          📋 Leer el Informe del Consultor ▸
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Trayectoria de la partida — 4 indicadores, un punto por paso.
// Colores propios del gráfico (validados para contraste y CVD
// sobre papel); la identidad la refuerzan emoji + etiquetas.
// ============================================================
const CHART_C = { caja: "#a37a10", confianza: "#a84e35", adopcion: "#0097a7", motivacion: "#bc4519" };
const SERIES = ["caja", "confianza", "adopcion", "motivacion"];
const TAG_MARK = { evento: "⚡", menor: "📰", crisis: "⚠️" };

// geometría del viewBox
const W = 560, H = 250, PL = 34, PR = 64, PT = 14, PB = 26;
const PW = W - PL - PR, PH = H - PT - PB;

function Trayectoria({ estado }) {
  const hist = estado.hist;
  const wrapRef = useRef(null);
  const [hov, setHov] = useState(null); // índice de paso hovereado

  const geo = useMemo(() => {
    if (!hist || hist.length < 2) return null;
    const N = hist.length;
    const x = (i) => PL + (i / (N - 1)) * PW;
    const y = (v) => PT + (1 - v / 100) * PH;
    const lineas = SERIES.map((k) => ({
      k,
      puntos: hist.map((h, i) => x(i).toFixed(1) + "," + y(h[k]).toFixed(1)).join(" "),
      finalV: hist[N - 1][k],
    }));
    // etiquetas de fin de línea sin colisiones (mín. 17px de separación)
    const labels = SERIES
      .map((k) => ({ k, v: hist[N - 1][k], y: y(hist[N - 1][k]) }))
      .sort((a, b) => a.y - b.y);
    for (let i = 1; i < labels.length; i++) {
      if (labels[i].y - labels[i - 1].y < 17) labels[i].y = labels[i - 1].y + 17;
    }
    return { N, x, y, lineas, labels };
  }, [hist]);

  if (!geo) return null;
  const { N, x, y, lineas, labels } = geo;

  function onMove(e) {
    const rect = wrapRef.current.getBoundingClientRect();
    const sx = rect.width / W;
    const mx = (e.clientX - rect.left) / sx;
    const i = Math.max(0, Math.min(N - 1, Math.round(((mx - PL) / PW) * (N - 1))));
    setHov(i);
  }

  const tipLeft = hov != null && wrapRef.current
    ? Math.max(70, Math.min(x(hov) * (wrapRef.current.getBoundingClientRect().width / W), wrapRef.current.getBoundingClientRect().width - 70))
    : 0;

  return (
    <section className="traj">
      <h3 className="traj-titulo">La trayectoria de tu partida</h3>
      <div className="traj-leyenda">
        {SERIES.map((k) => (
          <span key={k} className="traj-leyenda-item">
            <span className="traj-swatch" style={{ background: CHART_C[k] }} />
            {INDICADORES[k].emoji} {INDICADORES[k].nombre}
          </span>
        ))}
      </div>
      <div className="traj-plot" ref={wrapRef}>
        <svg
          className="traj-svg"
          viewBox={`0 0 ${W} ${H}`}
          onMouseMove={onMove}
          onMouseLeave={() => setHov(null)}
          role="img"
          aria-label="Evolución de los cuatro indicadores a lo largo de la partida"
        >
          {/* grilla y umbrales */}
          {[0, 100].map((v) => (
            <g key={v}>
              <line className="traj-grid" x1={PL} x2={PL + PW} y1={y(v)} y2={y(v)} />
              <text className="traj-ylabel" x={PL - 6} y={y(v) + 3} textAnchor="end">{v}</text>
            </g>
          ))}
          <line className="traj-grid traj-umbral" x1={PL} x2={PL + PW} y1={y(30)} y2={y(30)} stroke="#b8862e" />
          <text className="traj-ylabel" x={PL - 6} y={y(30) + 3} textAnchor="end">30</text>
          <line className="traj-grid traj-umbral" x1={PL} x2={PL + PW} y1={y(60)} y2={y(60)} stroke="#5a9e3f" />
          <text className="traj-ylabel" x={PL - 6} y={y(60) + 3} textAnchor="end">60</text>

          {/* marcas de eventos en el eje x */}
          {hist.map((h, i) =>
            TAG_MARK[h.tag] ? (
              <text key={i} className="traj-evmark" x={x(i)} y={H - 6} textAnchor="middle">
                {TAG_MARK[h.tag]}
              </text>
            ) : null
          )}

          {/* crosshair */}
          {hov != null && (
            <line className="traj-cross" x1={x(hov)} x2={x(hov)} y1={PT} y2={PT + PH} />
          )}

          {/* líneas */}
          {lineas.map((l) => (
            <polyline key={l.k} className="traj-linea" points={l.puntos} stroke={CHART_C[l.k]} />
          ))}

          {/* puntos del paso hovereado (con anillo de superficie) */}
          {hov != null && SERIES.map((k) => (
            <circle key={k} className="traj-punto" cx={x(hov)} cy={y(hist[hov][k])} r="4.5" fill={CHART_C[k]} />
          ))}

          {/* etiquetas directas al final de cada línea */}
          {labels.map((l) => (
            <text key={l.k} className="traj-endlabel" x={PL + PW + 8} y={l.y + 4} fill={CHART_C[l.k]}>
              {INDICADORES[l.k].emoji} {l.v}
            </text>
          ))}
        </svg>

        {hov != null && (
          <div className="traj-tip" style={{ left: tipLeft, top: 2 }}>
            <div className="traj-tip-titulo">
              {hov === 0 ? "Inicio" : `Paso ${hov}`}{hist[hov].nombre && hist[hov].nombre !== "Inicio" ? " · " + hist[hov].nombre : ""}
            </div>
            {SERIES.map((k) => (
              <div key={k}>{INDICADORES[k].emoji} {INDICADORES[k].nombre}: <b>{hist[hov][k]}</b></div>
            ))}
          </div>
        )}
      </div>

      <details className="traj-tabla">
        <summary>Ver los datos en tabla</summary>
        <table>
          <thead>
            <tr>
              <th>Paso</th>
              {SERIES.map((k) => <th key={k}>{INDICADORES[k].emoji} {INDICADORES[k].nombre}</th>)}
            </tr>
          </thead>
          <tbody>
            {hist.map((h, i) => (
              <tr key={i}>
                <td>{i === 0 ? "Inicio" : `${i}. ${h.nombre || ""}`}</td>
                {SERIES.map((k) => <td key={k}>{h[k]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}

// --- Informe del Consultor ---
export function InformeScreen({ estado, onReiniciar, ctaTexto, onCta }) {
  const informe = generarInforme(estado);
  return (
    <div className="pantalla informe-screen">
      <div className="informe-card">
        <div className="informe-head">
          <span className="informe-icon">🧑‍💼</span>
          <div>
            <div className="informe-kicker">Informe del Consultor</div>
            <h2 className="informe-titulo">Diagnóstico de tu gestión</h2>
          </div>
          <div className="informe-valor">
            <span>{informe.final.emoji}</span>
            <b style={{ color: informe.final.color }}>{informe.valor}</b>
          </div>
        </div>

        <div className="informe-cuerpo">
          {informe.secciones.map((sec, i) => (
            <section key={i} className="informe-seccion">
              <h3 className="informe-seccion-titulo">{sec.titulo}</h3>
              <p className="informe-seccion-texto">{sec.texto}</p>
            </section>
          ))}
          <Trayectoria estado={estado} />
        </div>

        <div className="informe-firma">— El Consultor · AgroSur S.A.</div>

        <div className="informe-acciones">
          {ctaTexto && <button className="btn btn-grande" onClick={() => { sfx.click(); onCta(); }}>{ctaTexto}</button>}
          <button className="btn btn-ghost" onClick={() => { sfx.click(); onReiniciar(); }}>↺ Volver al inicio</button>
        </div>
      </div>
    </div>
  );
}

// --- Tabla de posiciones (multijugador) ---
export function Posiciones({ jugadores, onReiniciar, onVerInforme }) {
  const ranking = jugadores
    .map((j, idx) => ({ ...j, idx }))
    .sort((a, b) => b.valor - a.valor);
  const medallas = ["🥇", "🥈", "🥉", "4️⃣"];
  return (
    <div className="pantalla posiciones">
      <h2 className="seccion-titulo">Tabla de posiciones</h2>
      <p className="posiciones-sub">Mismo contexto, distintas organizaciones, distintos resultados.</p>
      <div className="rank-lista">
        {ranking.map((j, i) => (
          <div key={i} className={"rank-fila " + (i === 0 ? "rank-ganador" : "")}>
            <span className="rank-medalla">{medallas[i]}</span>
            <span className="rank-emoji">{j.estado.arqEmoji}</span>
            <div className="rank-info">
              <div className="rank-nombre">{j.estado.nombreJugador}</div>
              <div className="rank-final" style={{ color: j.final.color }}>{j.final.emoji} {j.final.titulo}</div>
              <div className="rank-pts">{j.puntajeTotal} pts · racha máx 🔥{j.estado.mejorRacha}</div>
            </div>
            <button className="rank-informe" onClick={() => { sfx.click(); onVerInforme(j.idx); }}>📋 Informe</button>
            <span className="rank-valor" style={{ color: j.final.color }}>{j.valor}</span>
          </div>
        ))}
      </div>
      <button className="btn btn-grande" onClick={() => { sfx.click(); onReiniciar(); }}>↺ Nueva partida</button>
    </div>
  );
}
