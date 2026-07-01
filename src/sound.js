// ============================================================
// sound.js — Efectos de sonido sintetizados (WebAudio, sin assets)
// Singleton fuera de React. AudioContext perezoso (primer gesto).
// Mute persistido vía meta.js.
// ============================================================
import { isMuted, setMuted as persistMuted } from "./meta.js";

let ctx = null;
let master = null;
let muted = null;

function ensure() {
  if (muted === null) muted = isMuted();
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function getMuted() {
  if (muted === null) muted = isMuted();
  return muted;
}

export function toggleMuted() {
  muted = !getMuted();
  persistMuted(muted);
  return muted;
}

// --- primitivas ---
function tone(freq, dur, { type = "sine", gain = 0.18, when = 0, slide = 0 } = {}) {
  if (getMuted() || !ensure()) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise(dur, { gain = 0.12, when = 0, freq = 800 } = {}) {
  if (getMuted() || !ensure()) return;
  const t0 = ctx.currentTime + when;
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = "bandpass";
  filt.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filt).connect(g).connect(master);
  src.start(t0);
}

// --- háptica (móvil): vibración corta acompañando los golpes fuertes ---
function buzz(patron) {
  try {
    if (navigator.vibrate) navigator.vibrate(patron);
  } catch { /* sin soporte */ }
}

// --- efectos del juego ---
export const sfx = {
  click() { tone(640, 0.06, { type: "triangle", gain: 0.1 }); },
  carta() { noise(0.12, { gain: 0.08, freq: 1800 }); },
  diceTick(i = 0) { noise(0.03, { gain: 0.09, freq: 2400 - i * 60 }); tone(900 - i * 18, 0.03, { type: "square", gain: 0.04 }); },
  thunk() { noise(0.06, { gain: 0.16, freq: 420 }); tone(150, 0.09, { type: "sine", gain: 0.14, slide: -40 }); buzz(14); },
  diceExito() { tone(523, 0.12, { type: "triangle" }); tone(659, 0.12, { type: "triangle", when: 0.09 }); tone(784, 0.22, { type: "triangle", when: 0.18 }); buzz(24); },
  diceFracaso() { tone(220, 0.2, { type: "sawtooth", gain: 0.12 }); tone(208, 0.3, { type: "sawtooth", gain: 0.12, when: 0.12 }); },
  critico() {
    tone(523, 0.1, { type: "triangle" }); tone(659, 0.1, { type: "triangle", when: 0.07 });
    tone(784, 0.1, { type: "triangle", when: 0.14 }); tone(1047, 0.3, { type: "triangle", when: 0.21 });
    tone(2093, 0.18, { type: "sine", gain: 0.08, when: 0.26 });
    buzz([20, 40, 20, 40, 90]);
  },
  pifia() { tone(110, 0.35, { type: "sawtooth", gain: 0.16, slide: -40 }); noise(0.25, { gain: 0.1, freq: 300, when: 0.05 }); buzz([70, 50, 70]); },
  casiExito() { tone(440, 0.14, { type: "triangle" }); tone(392, 0.25, { type: "triangle", when: 0.14 }); },
  evento() { tone(392, 0.18, { type: "triangle" }); tone(554, 0.3, { type: "triangle", when: 0.12 }); },
  golpe() { tone(150, 0.3, { type: "sawtooth", gain: 0.14, slide: -60 }); buzz(45); },
  toast() { tone(1320, 0.1, { type: "sine", gain: 0.1 }); tone(1760, 0.18, { type: "sine", gain: 0.08, when: 0.08 }); },
  mision() { tone(660, 0.1, { type: "triangle" }); tone(880, 0.1, { type: "triangle", when: 0.08 }); tone(1320, 0.22, { type: "triangle", when: 0.16 }); },
  racha(n = 3) { const base = 392 * Math.pow(1.122, Math.min(n, 6)); tone(base, 0.09, { type: "triangle" }); tone(base * 1.5, 0.14, { type: "triangle", when: 0.07 }); },
  rachaRota() { tone(330, 0.18, { type: "triangle", slide: -120, gain: 0.12 }); },
  fanfarria() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, { type: "triangle", when: i * 0.11 }));
    tone(1319, 0.4, { type: "triangle", when: 0.46 });
    buzz([30, 60, 30, 60, 120]);
  },
  tickTally() { tone(880, 0.025, { type: "square", gain: 0.05 }); },
  record() { [659, 784, 988, 1319, 1568].forEach((f, i) => tone(f, 0.14, { type: "triangle", when: i * 0.09 })); },
};
