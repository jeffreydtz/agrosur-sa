// ============================================================
// screens2.jsx — Final, Informe del Consultor, Posiciones
// ============================================================
import { INDICADORES } from "../data.js";
import { generarInforme } from "../consultor.js";
import { sfx } from "../sound.js";
import { Tally } from "./juice.jsx";

// --- Final (con conteo de puntaje, récord y logros nuevos) ---
export function FinalScreen({ jugador, resumen, onVerInforme }) {
  const { estado, final, valor, puntajeTotal, desglose } = jugador;
  const orden = ["caja", "confianza", "adopcion", "motivacion"];
  return (
    <div className="pantalla final-screen" style={{ "--final-c": final.color }}>
      <div className="final-card">
        <div className="final-emoji">{final.emoji}</div>
        <div className="final-kicker">Final alcanzado</div>
        <h2 className="final-titulo" style={{ color: final.color }}>{final.titulo}</h2>
        <p className="final-narrativa">{final.narrativa}</p>

        <div className="valor-empresa">
          <span className="valor-label">Valor de Empresa</span>
          <span className="valor-num" style={{ color: final.color }}>{valor}<span className="valor-100">/100</span></span>
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
