// ============================================================
// app.jsx — Orquestador: máquina de estados y los 3 modos
// ============================================================
const { useState } = React;

// Plan de pasos: t='r' (ronda RONDAS[i]) | 'dolar' | 'seva' | 'crisis'
const PLAN_FULL = [
  { t: "r", i: 0 }, { t: "r", i: 1 }, { t: "r", i: 2 },
  { t: "dolar" },
  { t: "r", i: 3 }, { t: "r", i: 4 }, { t: "r", i: 5 },
  { t: "seva" },
  { t: "r", i: 6 }, { t: "r", i: 7 },
  { t: "crisis" },
  { t: "r", i: 8 }, // R10
];
// Presentación exprés: cultura (R4) → estructura (R6) → crisis (R9)
const PLAN_EXPRESS = [
  { t: "r", i: 3 }, { t: "r", i: 5 }, { t: "crisis" },
];

function pasoDesde(desc, estado) {
  if (desc.t === "r") return { kind: "ronda", carta: RONDAS[desc.i] };
  if (desc.t === "dolar") return { kind: "evento", carta: EVENTO_DOLAR };
  if (desc.t === "seva") return { kind: "evento", carta: eventoSeVa(estado.flags) };
  if (desc.t === "crisis") return { kind: "ronda", carta: crisisR9(estado) };
}

function Handoff({ jugador, onListo }) {
  return (
    <div className="pantalla handoff">
      <div className="handoff-card">
        <div className="handoff-emoji">📱</div>
        <div className="handoff-txt">Pasá el dispositivo a</div>
        <div className="handoff-nombre">{jugador.estado.nombreJugador}</div>
        <div className="handoff-arq">{jugador.estado.arqEmoji} {jugador.estado.arqNombre}</div>
        <button className="btn btn-grande" onClick={onListo}>Estoy listo ▸</button>
      </div>
    </div>
  );
}

function CountSelect({ onElegir }) {
  return (
    <div className="pantalla modo-select">
      <h2 className="seccion-titulo">¿Cuántos jugadores?</h2>
      <div className="count-grid">
        {[2, 3, 4].map((n) => (
          <button key={n} className="count-btn" onClick={() => onElegir(n)}>{n}</button>
        ))}
      </div>
    </div>
  );
}

function Juego() {
  const [fase, setFase] = useState("intro");
  const [modo, setModo] = useState(null);

  // jugadores: [{ estado }]
  const [jugadores, setJugadores] = useState([]);
  const [plan, setPlan] = useState(PLAN_FULL);
  const [planIdx, setPlanIdx] = useState(0);
  const [turnoIdx, setTurnoIdx] = useState(0);
  const [subfase, setSubfase] = useState("jugar"); // handoff | jugar
  const [verInformeIdx, setVerInformeIdx] = useState(null);

  // setup multijugador
  const [count, setCount] = useState(2);
  const [setupPlayer, setSetupPlayer] = useState(0);
  const [setupAcc, setSetupAcc] = useState([]);

  const esMulti = modo === "multi";
  const esPres = modo === "presentacion";
  const totalRondas = plan === PLAN_EXPRESS ? 3 : 10;

  function reiniciar() {
    setFase("intro"); setModo(null); setJugadores([]); setPlan(PLAN_FULL);
    setPlanIdx(0); setTurnoIdx(0); setSubfase("jugar"); setVerInformeIdx(null);
    setSetupPlayer(0); setSetupAcc([]);
  }

  function elegirModo(m) {
    setModo(m);
    if (m === "individual") setFase("setupIndividual");
    else if (m === "multi") setFase("setupCount");
    else if (m === "presentacion") {
      // arranque automático con La Tradicional
      const est = nuevoEstado("tradicional", "AgroSur (demo)");
      setJugadores([{ estado: est }]);
      setPlan(PLAN_EXPRESS); setPlanIdx(0); setTurnoIdx(0); setSubfase("jugar");
      setFase("play");
    }
  }

  function iniciarIndividual(arqId, nombre) {
    const est = nuevoEstado(arqId, nombre);
    setJugadores([{ estado: est }]);
    setPlan(PLAN_FULL); setPlanIdx(0); setTurnoIdx(0); setSubfase("jugar");
    setFase("play");
  }

  function elegirCount(n) { setCount(n); setSetupPlayer(0); setSetupAcc([]); setFase("setupPlayers"); }

  function setupJugador(arqId, nombre) {
    const est = nuevoEstado(arqId, nombre || ("Jugador " + (setupPlayer + 1)));
    const acc = [...setupAcc, { estado: est }];
    if (setupPlayer + 1 < count) {
      setSetupAcc(acc); setSetupPlayer(setupPlayer + 1);
    } else {
      setJugadores(acc); setPlan(PLAN_FULL); setPlanIdx(0); setTurnoIdx(0);
      setSubfase(count > 1 ? "handoff" : "jugar"); setFase("play");
    }
  }

  function aplicar(ns) {
    setJugadores((js) => js.map((j, i) => (i === turnoIdx ? { ...j, estado: ns } : j)));
  }

  function finalizar() {
    if (esMulti) setFase("posiciones");
    else setFase("final");
  }

  function siguienteTurno() {
    // próximo jugador no terminado en este paso
    let next = turnoIdx + 1;
    while (next < jugadores.length && jugadores[next].estado.terminado) next++;
    if (next < jugadores.length) {
      setTurnoIdx(next);
      setSubfase(jugadores.length > 1 ? "handoff" : "jugar");
      return;
    }
    // paso completo -> avanzar plan
    const np = planIdx + 1;
    let first = 0;
    while (first < jugadores.length && jugadores[first].estado.terminado) first++;
    if (np >= plan.length || first >= jugadores.length) { finalizar(); return; }
    setPlanIdx(np);
    setTurnoIdx(first);
    setSubfase(jugadores.length > 1 ? "handoff" : "jugar");
  }

  // ----- RENDER -----
  if (fase === "intro") return <Intro onComenzar={() => setFase("comoJugar")} />;
  if (fase === "comoJugar") return <ComoJugar onSiguiente={() => setFase("modo")} />;
  if (fase === "modo") return <ModoSelect onElegir={elegirModo} />;

  if (fase === "setupIndividual")
    return <ArquetipoSelect titulo="Elegí tu AgroSur" permitirAzar onElegir={iniciarIndividual} />;

  if (fase === "setupCount") return <CountSelect onElegir={elegirCount} />;

  if (fase === "setupPlayers")
    return (
      <ArquetipoSelect
        key={setupPlayer}
        titulo={"Jugador " + (setupPlayer + 1) + " de " + count + ": elegí tu AgroSur"}
        permitirAzar
        jugadorNum={setupPlayer + 1}
        onElegir={setupJugador}
      />
    );

  if (fase === "play") {
    const jugador = jugadores[turnoIdx];
    const estado = jugador.estado;
    const desc = plan[planIdx];
    const paso = pasoDesde(desc, estado);
    const etiqueta = esMulti ? "Turno de " + estado.nombreJugador : null;
    const esExpress = plan === PLAN_EXPRESS;
    const rondaLabel = esExpress
      ? (planIdx + 1)
      : (paso.kind === "evento" ? (desc.t === "dolar" ? "3½" : "6½") : paso.carta.ronda);

    if (subfase === "handoff") {
      return <Handoff jugador={jugador} onListo={() => setSubfase("jugar")} />;
    }

    return (
      <div className="play-wrap">
        <Tablero estado={estado} ronda={rondaLabel} totalRondas={totalRondas} etiqueta={etiqueta} />
        {paso.kind === "evento" ? (
          <EventoScreen
            key={planIdx + "-" + turnoIdx}
            estado={estado}
            evento={paso.carta}
            onAplicar={aplicar}
            onSiguiente={siguienteTurno}
          />
        ) : (
          <RondaView
            key={planIdx + "-" + turnoIdx}
            estado={estado}
            carta={paso.carta}
            onAplicar={aplicar}
            onSiguiente={siguienteTurno}
            modoPresentacion={esPres}
          />
        )}
      </div>
    );
  }

  if (fase === "final") {
    const estado = jugadores[0].estado;
    return <FinalScreen estado={estado} onVerInforme={() => setFase("informe")} />;
  }

  if (fase === "informe") {
    const estado = jugadores[0].estado;
    return <InformeScreen estado={estado} onReiniciar={reiniciar} />;
  }

  if (fase === "posiciones") {
    if (verInformeIdx != null) {
      return (
        <InformeScreen
          estado={jugadores[verInformeIdx].estado}
          ctaTexto="◂ Volver a posiciones"
          onCta={() => setVerInformeIdx(null)}
          onReiniciar={reiniciar}
        />
      );
    }
    return (
      <Posiciones
        jugadores={jugadores}
        onReiniciar={reiniciar}
        onVerInforme={(i) => setVerInformeIdx(i)}
      />
    );
  }

  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(<Juego />);
