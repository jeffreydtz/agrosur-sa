// ============================================================
// screens.jsx — Pantallas completas
// ============================================================
import { useState } from "react";
import { ARQUETIPOS, INDICADORES } from "../data.js";
import { tirarD20, resolverOpcion, resolverEvento } from "../engine.js";
import { Dado, Efectos, Opcion } from "./ui.jsx";

// --- Etiqueta de concepto / clase ---
export function ClaseTag({ clase, tema }) {
  return (
    <div className="clase-tag">
      <span className="clase-cod">{clase}</span>
      <span className="clase-tema">{tema}</span>
    </div>
  );
}

// --- Caja de concepto pedagógico ---
export function ConceptoBox({ texto, presentacion }) {
  return (
    <div className={"concepto-box " + (presentacion ? "concepto-pres" : "")}>
      <span className="concepto-icon">🎓</span>
      <div>
        <div className="concepto-titulo">Concepto en juego</div>
        <div className="concepto-texto">{texto}</div>
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
          rosarina con 30 años de tradición. Durante <strong>10 rondas</strong> vas a decidir
          el rumbo de la empresa. Al final, sabrás qué AgroSur construiste —
          y el Consultor te dirá por qué.
        </p>
        <button className="btn btn-grande" onClick={onComenzar}>Empezar ▸</button>
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
export function ComoJugar({ onSiguiente }) {
  return (
    <div className="pantalla como-jugar">
      <div className="cj-card">
        <h2 className="cj-titulo">Cómo jugar</h2>
        <ol className="cj-lista">
          <li>Gestionás AgroSur S.A. durante <b>10 rondas</b>. Cada ronda presenta una situación con <b>3 opciones</b>.</li>
          <li>Tus decisiones suben ⬆️ o bajan ⬇️ los <b>4 indicadores</b>: 💰 Caja, 🤝 Confianza, ⚙️ Adopción y 🔥 Motivación.</li>
          <li>Las opciones con <b>🎲</b> son arriesgadas: se tira un dado de 20 caras. Con <b>11 o más</b> sale bien. Si el indicador relacionado está <b className="rojo-txt">en rojo (menos de 30)</b>, necesitás <b>15 o más</b>.</li>
          <li>Si la 💰 Caja llega a 0 o la 🤝 Confianza cae a 10, la partida termina antes.</li>
          <li>Al final se calcula tu <b>Valor de Empresa</b> y el Consultor te entrega su informe.</li>
        </ol>
        <p className="cj-consejo">
          En las organizaciones no hay decisiones correctas en abstracto.
          Hay decisiones <i>coherentes</i> —o no— con tu situación.
        </p>
        <button className="btn btn-grande" onClick={onSiguiente}>Entendido ▸</button>
      </div>
    </div>
  );
}

// ============================================================
// SELECCIÓN DE MODO
// ============================================================
export function ModoSelect({ onElegir }) {
  const modos = [
    { id: "individual", emoji: "👤", nombre: "Individual", desc: "Campaña de 10 rondas con un arquetipo al azar." },
    { id: "multi", emoji: "👥", nombre: "Multijugador", desc: "2 a 4 jugadores, mismo dispositivo. Gana el mayor Valor de Empresa." },
    { id: "presentacion", emoji: "🎤", nombre: "Presentación", desc: "Partida exprés de 3 rondas para defender en vivo. El curso vota." },
  ];
  return (
    <div className="pantalla modo-select">
      <h2 className="seccion-titulo">Elegí un modo</h2>
      <div className="modo-grid">
        {modos.map((m) => (
          <button key={m.id} className="modo-card" onClick={() => onElegir(m.id)}>
            <span className="modo-emoji">{m.emoji}</span>
            <span className="modo-nombre">{m.nombre}</span>
            <span className="modo-desc">{m.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// SELECCIÓN DE ARQUETIPO
// ============================================================
export function ArquetipoCard({ arq, onElegir, seleccionado }) {
  const orden = ["caja", "confianza", "adopcion", "motivacion"];
  return (
    <button className={"arq-card " + (seleccionado ? "arq-sel" : "")} onClick={() => onElegir(arq)}>
      <div className="arq-head">
        <span className="arq-emoji">{arq.emoji}</span>
        <span className="arq-nombre">{arq.nombre}</span>
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
    </button>
  );
}

export function ArquetipoSelect({ titulo, permitirAzar, onElegir, jugadorNum }) {
  const [nombre, setNombre] = useState("");
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
          <ArquetipoCard key={a.id} arq={a} onElegir={(arq) => onElegir(arq.id, nombre)} />
        ))}
      </div>
      {permitirAzar && (
        <button className="btn btn-ghost" onClick={() => onElegir(ARQUETIPOS[Math.floor(Math.random() * ARQUETIPOS.length)].id, nombre)}>
          🎲 Asignar al azar
        </button>
      )}
    </div>
  );
}

// ============================================================
// VISTA DE RONDA (núcleo jugable)
// ============================================================
export function RondaView({ estado, carta, onAplicar, onSiguiente, modoPresentacion }) {
  const [fase, setFase] = useState("elegir");   // elegir | tirando | resuelto
  const [pend, setPend] = useState(null);        // {estado, detalle, opcion}

  function elegir(opcion) {
    if (fase !== "elegir") return;
    if (opcion.dado) {
      const roll = tirarD20();
      const { estado: ns, resultado } = resolverOpcion(estado, carta, opcion, roll);
      setPend({ estado: ns, detalle: resultado, opcion });
      setFase("tirando");
    } else {
      const { estado: ns, resultado } = resolverOpcion(estado, carta, opcion, 0);
      setPend({ estado: ns, detalle: resultado, opcion });
      onAplicar(ns);
      setFase("resuelto");
    }
  }

  function dadoListo() {
    onAplicar(pend.estado);
    setFase("resuelto");
  }

  const dadoDetalle = pend && pend.detalle.dado;

  return (
    <div className={"ronda-view " + (carta.crisis ? "es-crisis" : "")}>
      {carta.crisis && <div className="crisis-ribbon">⚠️ CRISIS</div>}
      <div className="carta">
        <ClaseTag clase={carta.clase} tema={carta.tema} />
        <h2 className="carta-titulo">{carta.titulo}</h2>
        <p className="carta-narrativa">{carta.narrativa}</p>

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
              <Dado rolling={false} valor={dadoDetalle.roll} umbral={dadoDetalle.umbral} exito={dadoDetalle.exito} />
            )}
            {dadoDetalle && dadoDetalle.nota && (
              <p className={"resol-nota " + (dadoDetalle.exito ? "nota-exito" : "nota-fracaso")}>{dadoDetalle.nota}</p>
            )}
            <ConceptoBox texto={carta.concepto} presentacion={modoPresentacion} />
            <button className="btn btn-grande" onClick={onSiguiente}>
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
      const ns = resolverEvento(estado, evento);
      onAplicar(ns);
      setAplicado(true);
    } else {
      onSiguiente();
    }
  }
  return (
    <div className="ronda-view evento-view">
      <div className="evento-ribbon">⚡ EVENTO · {evento.severidad ? "impacto " + evento.severidad : "contexto"}</div>
      <div className="carta carta-evento">
        <ClaseTag clase={evento.clase} tema={evento.tema} />
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
