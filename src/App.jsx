// ============================================================
// App.jsx — Orquestador: máquina de estados y los 2 modos
// ============================================================
import { useState, useRef, useEffect } from "react";
import {
  nuevoEstado, construirPlan, hidratarPlan, pasoDesde, calcularFinal,
  chequearMisiones, puntajeFinal, TOTAL_RONDAS,
} from "./engine.js";
import { getMeta, recordRun, registrarLogros } from "./meta.js";
import { checkLogros } from "./logros.js";
import { sfx, getMuted, toggleMuted } from "./sound.js";
import { onlineDisponible } from "./firebase.js";
import { escucharRoom, publicarProgreso, publicarFinal } from "./online.js";
import { Tablero } from "./components/ui.jsx";
import {
  Intro, ComoJugar, ModoSelect, ArquetipoSelect, RondaView,
  EventoScreen, EventoMenorScreen,
} from "./components/screens.jsx";
import { FinalScreen, InformeScreen, Posiciones } from "./components/screens2.jsx";
import {
  OnlineMenu, OnlineNoConfig, OnlineSetup, LobbyScreen, OnlineHud, PosicionesOnline,
} from "./components/online.jsx";
import { ToastQueue } from "./components/juice.jsx";

function Handoff({ jugador, onListo }) {
  return (
    <div className="pantalla handoff">
      <div className="handoff-card">
        <div className="handoff-emoji">📱</div>
        <div className="handoff-txt">Pasá el dispositivo a</div>
        <div className="handoff-nombre">{jugador.estado.nombreJugador}</div>
        <div className="handoff-arq">{jugador.estado.arqEmoji} {jugador.estado.arqNombre}</div>
        <button className="btn btn-grande" onClick={() => { sfx.click(); onListo(); }}>Estoy listo ▸</button>
      </div>
    </div>
  );
}

function CountSelect({ onElegir, onVolver }) {
  return (
    <div className="pantalla modo-select">
      <h2 className="seccion-titulo">¿Cuántos jugadores?</h2>
      <div className="count-grid">
        {[2, 3, 4].map((n) => (
          <button key={n} className="count-btn" onClick={() => { sfx.click(); onElegir(n); }}>{n}</button>
        ))}
      </div>
      <button className="btn btn-ghost" onClick={() => { sfx.click(); onVolver(); }}>◂ Volver</button>
    </div>
  );
}

export default function Juego() {
  const [fase, setFase] = useState("intro");
  const [modo, setModo] = useState(null);

  // jugadores: [{ estado, final?, valor?, puntajeTotal?, desglose? }]
  const [jugadores, setJugadores] = useState([]);
  const [plan, setPlan] = useState([]);
  const [planIdx, setPlanIdx] = useState(0);
  const [turnoIdx, setTurnoIdx] = useState(0);
  const [subfase, setSubfase] = useState("jugar"); // handoff | jugar
  const [verInformeIdx, setVerInformeIdx] = useState(null);
  const [resumenFinal, setResumenFinal] = useState(null); // {nuevoRecord, logros}

  // feedback lúdico
  const [fx, setFx] = useState(null); // {deltas, seq, shake}
  const [toasts, setToasts] = useState([]);
  const [muted, setMuted] = useState(getMuted());
  const seqRef = useRef(0);
  const toastIdRef = useRef(0);

  // setup multijugador
  const [count, setCount] = useState(2);
  const [setupPlayer, setSetupPlayer] = useState(0);
  const [setupAcc, setSetupAcc] = useState([]);

  // online (rooms)
  const [online, setOnline] = useState(null); // {codigo, playerId, nombre, arqId, ...}
  const [roomSnap, setRoomSnap] = useState(null);
  const finalizadoRef = useRef(false);

  const esMulti = modo === "multi";
  const esOnline = modo === "online";

  // suscripción al room mientras haya uno activo
  const vioRoomRef = useRef(false);
  useEffect(() => {
    if (!online) { setRoomSnap(null); vioRoomRef.current = false; return; }
    const off = escucharRoom(online.codigo, setRoomSnap);
    return off;
  }, [online && online.codigo]);

  // el room desapareció (el host lo cerró) estando en el lobby
  useEffect(() => {
    if (roomSnap) { vioRoomRef.current = true; return; }
    if (fase === "onlineLobby" && vioRoomRef.current) {
      setOnline(null);
      setFase("onlineMenu");
    }
  }, [roomSnap, fase]);

  // el host arrancó: todos pasan del lobby al juego
  useEffect(() => {
    if (fase !== "onlineLobby" || !roomSnap || roomSnap.estado !== "jugando") return;
    const est = nuevoEstado(online.arqId, online.nombre);
    setJugadores([{ estado: est }]);
    setPlan(hidratarPlan(roomSnap.plan));
    setPlanIdx(0); setTurnoIdx(0); setSubfase("jugar"); setFx(null);
    finalizadoRef.current = false;
    setFase("play");
  }, [fase, roomSnap && roomSnap.estado]);

  function pushToasts(nuevos) {
    if (!nuevos.length) return;
    setToasts((ts) => [
      ...ts,
      ...nuevos.map((n) => ({ ...n, id: ++toastIdRef.current })),
    ]);
  }

  function quitarToast(id) {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }

  function reiniciar() {
    setFase("intro"); setModo(null); setJugadores([]); setPlan([]);
    setPlanIdx(0); setTurnoIdx(0); setSubfase("jugar"); setVerInformeIdx(null);
    setResumenFinal(null); setFx(null); setToasts([]);
    setSetupPlayer(0); setSetupAcc([]);
    setOnline(null); setRoomSnap(null); finalizadoRef.current = false;
  }

  function elegirModo(m) {
    setModo(m);
    if (m === "individual") setFase("setupIndividual");
    else if (m === "multi") setFase("setupCount");
    else if (m === "online") setFase(onlineDisponible ? "onlineMenu" : "onlineConfig");
  }

  function iniciarIndividual(arqId, nombre) {
    const est = nuevoEstado(arqId, nombre);
    setJugadores([{ estado: est }]);
    setPlan(construirPlan({ arqId, multi: false }));
    setPlanIdx(0); setTurnoIdx(0); setSubfase("jugar"); setFx(null);
    setFase("play");
  }

  function elegirCount(n) { setCount(n); setSetupPlayer(0); setSetupAcc([]); setFase("setupPlayers"); }

  function setupJugador(arqId, nombre) {
    const est = nuevoEstado(arqId, nombre || ("Jugador " + (setupPlayer + 1)));
    const acc = [...setupAcc, { estado: est }];
    if (setupPlayer + 1 < count) {
      setSetupAcc(acc); setSetupPlayer(setupPlayer + 1);
    } else {
      setJugadores(acc);
      setPlan(construirPlan({ multi: true })); // mismo plan para todos
      setPlanIdx(0); setTurnoIdx(0); setFx(null);
      setSubfase("handoff"); setFase("play");
    }
  }

  // ns: nuevo estado del jugador en turno; resultado: detalle para feedback
  function aplicar(ns, resultado) {
    setJugadores((js) => js.map((j, i) => (i === turnoIdx ? { ...j, estado: ns } : j)));
    if (esOnline && online) {
      publicarProgreso(online.codigo, online.playerId, ns, plan[planIdx] ? plan[planIdx].label : 0);
    }
    if (resultado && resultado.deltas) {
      const net = Object.values(resultado.deltas).reduce((a, b) => a + b, 0);
      setFx({ deltas: resultado.deltas, seq: ++seqRef.current, shake: net <= -10 });
    }
    const nuevos = [];
    if (resultado && resultado.misionesNuevas) {
      for (const m of resultado.misionesNuevas) {
        nuevos.push({ emoji: "🎯", kicker: "Misión cumplida · +40 pts", titulo: m.nombre, sub: m.desc });
      }
      if (resultado.misionesNuevas.length) sfx.mision();
    }
    if (modo === "individual") {
      const unlocked = checkLogros({ estado: ns, resultado, meta: getMeta() }, "partida");
      if (unlocked.length) {
        registrarLogros(unlocked.map((l) => l.id));
        sfx.toast();
        for (const l of unlocked) {
          nuevos.push({ emoji: l.emoji, kicker: "Logro desbloqueado", titulo: l.nombre, sub: l.desc, tipo: "logro" });
        }
      }
    }
    pushToasts(nuevos);
  }

  function finalizar() {
    if (finalizadoRef.current) return;
    finalizadoRef.current = true;
    const cerrados = jugadores.map((j) => {
      const { final, valor } = calcularFinal(j.estado);
      const m = chequearMisiones(j.estado, { valor });
      const pf = puntajeFinal(m.estado, final, valor);
      return { ...j, estado: m.estado, final, valor, puntajeTotal: pf.total, desglose: pf.desglose, misionesFinales: m.nuevas };
    });
    setJugadores(cerrados);

    if (esOnline) {
      const j = cerrados[0];
      publicarFinal(online.codigo, online.playerId, {
        puntajeTotal: j.puntajeTotal,
        finalNombre: j.final.emoji + " " + j.final.titulo,
        valor: j.valor,
      });
      recordRun({ estado: j.estado, finalId: j.final.id, valor: 0, puntaje: 0, modo: "online" });
      sfx.fanfarria();
      setFase("posicionesOnline");
    } else if (!esMulti) {
      const j = cerrados[0];
      const { nuevoRecord, meta } = recordRun({
        estado: j.estado, finalId: j.final.id, valor: j.valor,
        puntaje: j.puntajeTotal, modo: "individual",
      });
      const unlocked = checkLogros(
        { estado: j.estado, final: j.final, valor: j.valor, puntaje: j.puntajeTotal, meta },
        "final"
      );
      registrarLogros(unlocked.map((l) => l.id));
      pushToasts(j.misionesFinales.map((m) => ({ emoji: "🎯", kicker: "Misión cumplida · +40 pts", titulo: m.nombre, sub: m.desc })));
      setResumenFinal({ nuevoRecord, logros: unlocked });
      sfx.fanfarria();
      setFase("final");
    } else {
      recordRun({ estado: cerrados[0].estado, finalId: cerrados[0].final.id, valor: 0, puntaje: 0, modo: "multi" });
      sfx.fanfarria();
      setFase("posiciones");
    }
  }

  function siguienteTurno() {
    setFx(null);
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

  function onToggleMute() {
    setMuted(toggleMuted());
  }

  // ----- RENDER -----
  let contenido = null;

  if (fase === "intro") contenido = <Intro onComenzar={() => setFase("comoJugar")} />;
  else if (fase === "comoJugar") contenido = <ComoJugar onSiguiente={() => setFase("modo")} onVolver={() => setFase("intro")} />;
  else if (fase === "modo") contenido = <ModoSelect onElegir={elegirModo} onVolver={() => setFase("comoJugar")} />;
  else if (fase === "setupIndividual")
    contenido = (
      <ArquetipoSelect
        titulo="Elegí tu AgroSur"
        permitirAzar
        mostrarColeccion
        onElegir={iniciarIndividual}
        onVolver={() => { setModo(null); setFase("modo"); }}
      />
    );
  else if (fase === "setupCount")
    contenido = <CountSelect onElegir={elegirCount} onVolver={() => { setModo(null); setFase("modo"); }} />;
  else if (fase === "onlineConfig") contenido = <OnlineNoConfig onVolver={() => setFase("modo")} />;
  else if (fase === "onlineMenu")
    contenido = (
      <OnlineMenu
        onCrear={() => setFase("onlineCrear")}
        onUnirse={() => setFase("onlineUnirse")}
        onVolver={() => setFase("modo")}
      />
    );
  else if (fase === "onlineCrear" || fase === "onlineUnirse")
    contenido = (
      <OnlineSetup
        modoSetup={fase === "onlineCrear" ? "crear" : "unirse"}
        onRoom={(datos) => { setOnline(datos); setFase("onlineLobby"); }}
        onVolver={() => setFase("onlineMenu")}
      />
    );
  else if (fase === "onlineLobby")
    contenido = (
      <LobbyScreen
        online={online}
        room={roomSnap}
        onSalir={() => { setOnline(null); setFase("onlineMenu"); }}
      />
    );
  else if (fase === "setupPlayers")
    contenido = (
      <ArquetipoSelect
        key={setupPlayer}
        titulo={"Jugador " + (setupPlayer + 1) + " de " + count + ": elegí tu AgroSur"}
        permitirAzar
        jugadorNum={setupPlayer + 1}
        onElegir={setupJugador}
        onVolver={() => {
          if (setupPlayer === 0) { setFase("setupCount"); return; }
          setSetupAcc(setupAcc.slice(0, -1));
          setSetupPlayer(setupPlayer - 1);
        }}
      />
    );
  else if (fase === "play") {
    const jugador = jugadores[turnoIdx];
    const estado = jugador.estado;
    const desc = plan[planIdx];
    const paso = pasoDesde(desc, estado);
    const etiqueta = esMulti ? "Turno de " + estado.nombreJugador : null;

    if (subfase === "handoff") {
      contenido = <Handoff jugador={jugador} onListo={() => setSubfase("jugar")} />;
    } else {
      contenido = (
        <div className={"play-wrap " + (fx && fx.shake ? "shake" : "")}>
          {esOnline && <OnlineHud room={roomSnap} playerId={online.playerId} onExpira={finalizar} />}
          <Tablero estado={estado} ronda={desc.label} totalRondas={TOTAL_RONDAS} etiqueta={etiqueta} fx={fx} />
          {paso.kind === "evento" ? (
            <EventoScreen
              key={planIdx + "-" + turnoIdx}
              estado={estado}
              evento={paso.carta}
              onAplicar={aplicar}
              onSiguiente={siguienteTurno}
            />
          ) : paso.kind === "menor" ? (
            <EventoMenorScreen
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
            />
          )}
        </div>
      );
    }
  } else if (fase === "posicionesOnline") {
    if (verInformeIdx != null) {
      contenido = (
        <InformeScreen
          estado={jugadores[0].estado}
          ctaTexto="◂ Volver a posiciones"
          onCta={() => setVerInformeIdx(null)}
          onReiniciar={reiniciar}
        />
      );
    } else {
      contenido = (
        <PosicionesOnline
          room={roomSnap}
          playerId={online.playerId}
          onVerInforme={() => setVerInformeIdx(0)}
          onReiniciar={reiniciar}
        />
      );
    }
  } else if (fase === "final") {
    contenido = <FinalScreen jugador={jugadores[0]} resumen={resumenFinal} onVerInforme={() => setFase("informe")} />;
  } else if (fase === "informe") {
    contenido = <InformeScreen estado={jugadores[0].estado} onReiniciar={reiniciar} />;
  } else if (fase === "posiciones") {
    if (verInformeIdx != null) {
      contenido = (
        <InformeScreen
          estado={jugadores[verInformeIdx].estado}
          ctaTexto="◂ Volver a posiciones"
          onCta={() => setVerInformeIdx(null)}
          onReiniciar={reiniciar}
        />
      );
    } else {
      contenido = (
        <Posiciones
          jugadores={jugadores}
          onReiniciar={reiniciar}
          onVerInforme={(i) => setVerInformeIdx(i)}
        />
      );
    }
  }

  return (
    <>
      <button className="mute-btn" onClick={onToggleMute} title={muted ? "Activar sonido" : "Silenciar"}>
        {muted ? "🔇" : "🔊"}
      </button>
      <ToastQueue toasts={toasts} onDone={quitarToast} />
      {contenido}
    </>
  );
}
