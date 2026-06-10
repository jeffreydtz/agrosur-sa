// ============================================================
// screens.jsx — Pantallas completas
// ============================================================
import { useState } from "react";
import { ARQUETIPOS, INDICADORES, MISIONES } from "../data.js";
import { tirarDados, resolverOpcion, resolverEvento, resolverEventoMenor, aplicarGolpe } from "../engine.js";
import { getMeta } from "../meta.js";
import { sfx } from "../sound.js";
import { Dado, Efectos, Opcion } from "./ui.jsx";
import { Confetti, ResumenRonda } from "./juice.jsx";

// --- Etiqueta de concepto / clase ---
export function ClaseTag({ clase, tema, personaje }) {
  return (
    <div className="clase-tag">
      <span className="clase-cod">{clase}</span>
      <span className="clase-tema">{tema}</span>
      {personaje && (
        <span className="personaje-tag">{personaje.emoji} {personaje.nombre}</span>
      )}
    </div>
  );
}

// --- Caja de concepto pedagógico (colapsada por defecto) ---
export function ConceptoBox({ texto }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className={"concepto-box " + (abierto ? "" : "concepto-cerrado")} onClick={() => setAbierto(!abierto)} role="button">
      <span className="concepto-icon">🎓</span>
      <div>
        <div className="concepto-titulo">Concepto en juego {abierto ? "▾" : "▸"}</div>
        {abierto && <div className="concepto-texto">{texto}</div>}
      </div>
    </div>
  );
}

// ============================================================
// INTRO
// ============================================================
export function Intro({ onComenzar }) {
  return (
    <div className="pantalla intro">
      <div className="intro-inner">
        <div className="intro-kicker">Simulación organizacional</div>
        <h1 className="intro-titulo">AgroSur <span className="intro-sa">S.A.</span></h1>
        <div className="intro-sub">Crónicas del Cambio</div>
        <p className="intro-lead">
          Sos el nuevo <strong>Gerente de Transformación</strong> de una corredora de granos
          rosarina con 30 años de tradición. Durante <strong>12 rondas</strong> vas a decidir
          el rumbo de la empresa. Al final, sabrás qué AgroSur construiste —
          y el Consultor te dirá por qué.
        </p>
        <button className="btn btn-grande" onClick={() => { sfx.click(); onComenzar(); }}>Empezar ▸</button>
        <div className="intro-pie">Organización y Gestión Empresaria · UAI Rosario</div>
      </div>
      <div className="intro-deco" aria-hidden="true">
        {["💰","🤝","⚙️","🔥"].map((e,i) => <span key={i} className="deco-ind">{e}</span>)}
      </div>
    </div>
  );
}

// ============================================================
// CÓMO JUGAR
// ============================================================
export function ComoJugar({ onSiguiente, onVolver }) {
  return (
    <div className="pantalla como-jugar">
      <div className="cj-card">
        <h2 className="cj-titulo">Cómo jugar</h2>
        <ol className="cj-lista">
          <li>Gestionás AgroSur S.A. durante <b>12 rondas</b>. Cada ronda presenta una situación con <b>3 opciones</b> — y entre rondas pueden caer <b>titulares sorpresa</b>.</li>
          <li>Tus decisiones suben ⬆️ o bajan ⬇️ los <b>4 indicadores</b>: 💰 Caja, 🤝 Confianza, ⚙️ Adopción y 🔥 Motivación.</li>
          <li>Las opciones con <b>🎲</b> tiran <b>dos dados</b>: con <b>7+</b> sale bien. Si el indicador relacionado está <b className="rojo-txt">en rojo (&lt;30)</b>, necesitás <b>9+</b>. <b>Doble 6 es CRÍTICO ★</b>; <b>doble 1 es PIFIA ☠</b>.</li>
          <li>Encadenar rondas positivas arma una <b>🔥 racha</b> que multiplica tus puntos. Tu arquetipo trae <b>🎯 2 misiones</b> propias.</li>
          <li>Si la 💰 Caja llega a 0 o la 🤝 Confianza cae a 10, la partida termina antes.</li>
          <li>Al final: <b>Valor de Empresa</b>, puntaje, logros y el informe del Consultor.</li>
        </ol>
        <p className="cj-consejo">
          En las organizaciones no hay decisiones correctas en abstracto.
          Hay decisiones <i>coherentes</i> —o no— con tu situación.
        </p>
        <button className="btn btn-grande" onClick={() => { sfx.click(); onSiguiente(); }}>Entendido ▸</button>
      </div>
      <button className="btn btn-ghost" onClick={() => { sfx.click(); onVolver(); }}>◂ Volver</button>
    </div>
  );
}

// ============================================================
// SELECCIÓN DE MODO
// ============================================================
export function ModoSelect({ onElegir, onVolver }) {
  const modos = [
    { id: "individual", emoji: "👤", nombre: "Individual", desc: "Campaña de 12 rondas. Misiones, logros y tu récord personal." },
    { id: "multi", emoji: "👥", nombre: "Pass & Play", desc: "2 a 4 jugadores, mismo dispositivo, pasándoselo por turnos. Gana el mayor Valor de Empresa." },
    { id: "online", emoji: "🌐", nombre: "Online", desc: "Rooms con código para compartir. Cada uno juega su empresa, ranking en vivo y tiempo límite." },
  ];
  return (
    <div className="pantalla modo-select">
      <h2 className="seccion-titulo">Elegí un modo</h2>
      <div className="modo-grid">
        {modos.map((m) => (
          <button key={m.id} className="modo-card" onClick={() => { sfx.click(); onElegir(m.id); }}>
            <span className="modo-emoji">{m.emoji}</span>
            <span className="modo-nombre">{m.nombre}</span>
            <span className="modo-desc">{m.desc}</span>
          </button>
        ))}
      </div>
      {onVolver && <button className="btn btn-ghost" onClick={() => { sfx.click(); onVolver(); }}>◂ Volver</button>}
    </div>
  );
}

// ============================================================
// SELECCIÓN DE ARQUETIPO
// ============================================================
export function ArquetipoCard({ arq, onElegir, ganado }) {
  const orden = ["caja", "confianza", "adopcion", "motivacion"];
  const misiones = MISIONES[arq.id] || [];
  return (
    <button className="arq-card" onClick={() => onElegir(arq)}>
      <div className="arq-head">
        <span className="arq-emoji">{arq.emoji}</span>
        <span className="arq-nombre">{arq.nombre}</span>
        {ganado && <span className="arq-ganado" title="Ya ganaste con este arquetipo">🏆</span>}
      </div>
      <p className="arq-desafio">{arq.desafio}</p>
      <div className="arq-stats">
        {orden.map((k) => {
          const ind = INDICADORES[k];
          const v = arq[k];
          const col = v >= 60 ? "#5a9e3f" : v >= 30 ? "#d9a521" : "#cf4631";
          return (
            <div key={k} className="arq-stat">
              <span className="arq-stat-emoji">{ind.emoji}</span>
              <div className="arq-mini-track"><div className="arq-mini-fill" style={{ width: v + "%", background: col }} /></div>
              <span className="arq-stat-num" style={{ color: col }}>{v}</span>
            </div>
          );
        })}
      </div>
      {misiones.length > 0 && (
        <div className="arq-misiones">
          {misiones.map((m) => (
            <div key={m.id} className="arq-mision">🎯 {m.nombre}</div>
          ))}
        </div>
      )}
    </button>
  );
}

export function ArquetipoSelect({ titulo, permitirAzar, onElegir, jugadorNum, mostrarColeccion, onVolver }) {
  const [nombre, setNombre] = useState("");
  const meta = getMeta();
  return (
    <div className="pantalla arq-select">
      <h2 className="seccion-titulo">{titulo || "Elegí tu AgroSur"}</h2>
      {jugadorNum && (
        <input
          className="nombre-input"
          placeholder={"Nombre del jugador " + jugadorNum}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={20}
        />
      )}
      <div className="arq-grid">
        {ARQUETIPOS.map((a) => (
          <ArquetipoCard
            key={a.id}
            arq={a}
            ganado={mostrarColeccion && meta.arquetiposGanados.includes(a.id)}
            onElegir={(arq) => { sfx.carta(); onElegir(arq.id, nombre); }}
          />
        ))}
      </div>
      {permitirAzar && (
        <button className="btn btn-ghost" onClick={() => { sfx.carta(); onElegir(ARQUETIPOS[Math.floor(Math.random() * ARQUETIPOS.length)].id, nombre); }}>
          🎲 Asignar al azar
        </button>
      )}
      {onVolver && <button className="btn btn-ghost" onClick={() => { sfx.click(); onVolver(); }}>◂ Volver</button>}
      {mostrarColeccion && meta.partidas > 0 && (
        <div className="coleccion-footer">
          <span>Partidas <b>{meta.partidas}</b></span>
          <span>Récord <b>{meta.mejorPuntaje}</b></span>
          <span>Finales <b>{meta.finalesVistos.length}/7</b></span>
          <span>Arquetipos ganados <b>{meta.arquetiposGanados.length}/5</b></span>
          <span>Logros <b>{Object.keys(meta.logros).length}/13</b></span>
        </div>
      )}
    </div>
  );
}

// ============================================================
// VISTA DE RONDA (núcleo jugable)
// ============================================================
export function RondaView({ estado, carta, onAplicar, onSiguiente }) {
  const variante = carta.varianteActiva;
  const conGolpe = variante && variante.efEntrada;
  // entrada (golpe de consecuencia) | elegir | tirando | resuelto
  const [fase, setFase] = useState(conGolpe ? "entrada" : "elegir");
  const [pend, setPend] = useState(null); // {estado, detalle, opcion}
  const [confetti, setConfetti] = useState(0);

  function encajarGolpe() {
    const { estado: ns, deltas } = aplicarGolpe(estado, variante.efEntrada);
    sfx.golpe();
    onAplicar(ns, { deltas });
    setFase("elegir");
  }

  function elegir(opcion) {
    if (fase !== "elegir") return;
    sfx.click();
    if (opcion.dado) {
      const roll = tirarDados();
      const { estado: ns, resultado } = resolverOpcion(estado, carta, opcion, roll);
      setPend({ estado: ns, detalle: resultado, opcion });
      setFase("tirando");
    } else {
      const { estado: ns, resultado } = resolverOpcion(estado, carta, opcion, 0);
      setPend({ estado: ns, detalle: resultado, opcion });
      onAplicar(ns, resultado);
      const net = Object.values(resultado.deltas).reduce((a, b) => a + b, 0);
      if (net >= 15) setConfetti((c) => c + 1);
      setFase("resuelto");
    }
  }

  function dadoListo() {
    const d = pend.detalle.dado;
    if (d.critico) { sfx.critico(); setConfetti((c) => c + 1); }
    else if (d.pifia) sfx.pifia();
    else if (d.exito) sfx.diceExito();
    else if (d.casiExito) sfx.casiExito();
    else sfx.diceFracaso();
    if (pend.detalle.rachaRota) sfx.rachaRota();
    else if (pend.detalle.racha >= 3 && d.exito) sfx.racha(pend.detalle.racha);
    onAplicar(pend.estado, pend.detalle);
    setFase("resuelto");
  }

  const dadoDetalle = pend && pend.detalle.dado;

  return (
    <div className={"ronda-view " + (carta.crisis ? "es-crisis" : "")}>
      {confetti > 0 && <Confetti seed={confetti} />}
      {carta.crisis && <div className="crisis-ribbon">⚠️ CRISIS</div>}
      {variante && !carta.crisis && <div className="consecuencia-ribbon">{variante.ribbon}</div>}
      <div className="carta">
        {carta.crisis && variante && <div className="consecuencia-inline">{variante.ribbon}</div>}
        <ClaseTag clase={carta.clase} tema={carta.tema} personaje={carta.personaje} />
        <h2 className="carta-titulo">{carta.titulo}</h2>
        <p className="carta-narrativa">{carta.narrativa}</p>
        {variante && variante.narrativaExtra && (
          <p className="carta-narrativa narrativa-consecuencia">{variante.narrativaExtra}</p>
        )}

        {fase === "entrada" && (
          <div className="resolucion">
            <div className="evento-efectos">
              <span className="evento-ef-label">El golpe:</span>
              <Efectos ef={variante.efEntrada} />
            </div>
            <button className="btn btn-grande" onClick={encajarGolpe}>Encajar el golpe ▸</button>
          </div>
        )}

        {fase === "elegir" && (
          <div className="opciones">
            {carta.opciones.map((op) => (
              <Opcion key={op.id} opcion={op} estado={estado} onElegir={elegir} />
            ))}
          </div>
        )}

        {fase === "tirando" && (
          <div className="resolucion">
            <div className="resol-opcion">Elegiste <b>{pend.opcion.id}.</b> {pend.opcion.texto}</div>
            <Dado
              rolling={true}
              valor={dadoDetalle.roll}
              d1={dadoDetalle.d1}
              d2={dadoDetalle.d2}
              umbral={dadoDetalle.umbral}
              exito={null}
              onDone={dadoListo}
            />
          </div>
        )}

        {fase === "resuelto" && (
          <div className="resolucion">
            <div className="resol-opcion">Elegiste <b>{pend.opcion.id}.</b> {pend.opcion.texto}</div>
            {dadoDetalle && (
              <Dado
                rolling={false}
                valor={dadoDetalle.roll}
                d1={dadoDetalle.d1}
                d2={dadoDetalle.d2}
                umbral={dadoDetalle.umbral}
                exito={dadoDetalle.exito}
                critico={dadoDetalle.critico}
                pifia={dadoDetalle.pifia}
              />
            )}
            {dadoDetalle && dadoDetalle.casiExito && (
              <p className="resol-casi">¡Por UNO! El {dadoDetalle.roll} se quedó mirando el {dadoDetalle.umbral}.</p>
            )}
            {dadoDetalle && dadoDetalle.justo && (
              <p className="resol-justo">Justito. Pero entró.</p>
            )}
            {dadoDetalle && dadoDetalle.nota && (
              <p className={"resol-nota " + (dadoDetalle.exito ? "nota-exito" : "nota-fracaso")}>{dadoDetalle.nota}</p>
            )}
            <ResumenRonda resultado={pend.detalle} />
            <ConceptoBox texto={carta.concepto} />
            <button className="btn btn-grande" onClick={() => { sfx.click(); onSiguiente(); }}>
              {estado.terminado ? "Ver desenlace ▸" : "Continuar ▸"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// EVENTO FIJO
// ============================================================
export function EventoScreen({ estado, evento, onAplicar, onSiguiente }) {
  const [aplicado, setAplicado] = useState(false);
  function continuar() {
    if (!aplicado) {
      sfx.golpe();
      const { estado: ns, resultado } = resolverEvento(estado, evento);
      onAplicar(ns, resultado);
      setAplicado(true);
    } else {
      sfx.click();
      onSiguiente();
    }
  }
  return (
    <div className="ronda-view evento-view">
      <div className="evento-ribbon">⚡ EVENTO · {evento.severidad ? "impacto " + evento.severidad : "contexto"}</div>
      <div className="carta carta-evento">
        <ClaseTag clase={evento.clase} tema={evento.tema} personaje={evento.personaje} />
        <h2 className="carta-titulo">{evento.titulo}</h2>
        <p className="carta-narrativa">{evento.narrativa}</p>
        <div className="evento-efectos">
          <span className="evento-ef-label">El golpe:</span>
          <Efectos ef={evento.ef} />
        </div>
        <ConceptoBox texto={evento.concepto} />
        <button className="btn btn-grande" onClick={continuar}>
          {!aplicado ? "Recibir el golpe ▸" : (estado.terminado ? "Ver desenlace ▸" : "Continuar ▸")}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// EVENTO MENOR ("Titulares")
// ============================================================
export function EventoMenorScreen({ estado, evento, onAplicar, onSiguiente }) {
  const [resultado, setResultado] = useState(null);

  function resolver(opcionId = null) {
    sfx.evento();
    const { estado: ns, resultado: r } = resolverEventoMenor(estado, evento, opcionId);
    onAplicar(ns, r);
    setResultado(r);
  }

  return (
    <div className="ronda-view evento-view">
      <div className="evento-ribbon menor-ribbon">📰 TITULARES</div>
      <div className="carta carta-evento carta-menor">
        <h2 className="carta-titulo">{evento.emoji} {evento.titulo}</h2>
        <p className="carta-narrativa">{evento.narrativa}</p>

        {!resultado && evento.binaria && (
          <div className="opciones">
            {evento.binaria.map((op) => (
              <button key={op.id} className="opcion" onClick={() => resolver(op.id)}>
                <div className="opcion-head">
                  <span className="opcion-letra">{op.id}</span>
                  <span className="opcion-texto">{op.texto}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {!resultado && !evento.binaria && (
          <button className="btn btn-grande" onClick={() => resolver()}>Ver qué pasa ▸</button>
        )}

        {resultado && (
          <div className="resolucion">
            <p className="resol-nota">{resultado.nota}</p>
            {Object.keys(resultado.deltas).length > 0 && (
              <div className="evento-efectos">
                <Efectos ef={resultado.deltas} />
              </div>
            )}
            <button className="btn btn-grande" onClick={() => { sfx.click(); onSiguiente(); }}>
              {estado.terminado ? "Ver desenlace ▸" : "Continuar ▸"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
