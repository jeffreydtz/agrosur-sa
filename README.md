# AgroSur S.A. — Crónicas del Cambio

Simulación organizacional jugable: sos el Gerente de Transformación de una corredora de granos rosarina y gestionás la empresa durante 12 rondas de decisiones. Construida con React + Vite, 100% offline (sin backend ni llamadas externas).

## Cómo correr

```bash
npm install
npm run dev      # desarrollo en http://localhost:5173
npm run build    # build de producción en dist/
npm run preview  # servir el build
```

## El juego

- **12 rondas**, una por clase de la materia (Contexto → Porter → Política → Cultura → Subculturas → Cambio → Estructura → Puestos → Gestión del cambio → Decisiones → Crisis → Cierre), cada una con 3 opciones.
- **4 indicadores visibles** (💰 Caja, 🤝 Confianza, ⚙️ Adopción, 🔥 Motivación) + un **indicador oculto** de resistencia política.
- **Dado d20** para las opciones arriesgadas: éxito con 11+, o 15+ si el indicador relacionado está en rojo (<30). **20 natural = CRÍTICO ★** (efectos amplificados), **1 natural = PIFIA ☠**. Casi-éxitos dramatizados ("¡Por UNO!").
- **🔥 Racha**: encadenar rondas positivas multiplica los puntos (nunca los indicadores).
- **🎯 Misiones**: 2 objetivos propios por arquetipo, con bonus de puntos.
- **2 eventos fijos** (Salto del dólar tras R3; Se va el que sabía tras R7, con impacto encadenado según documentaste / armaste células) + **pool de 8 eventos menores** ("Titulares"): se sortean 2-3 por partida, varios reactivos al estado — cada partida es distinta.
- **Consecuencias encadenadas**: buscar un culpable en R7 vuelve amplificado en la denuncia de R10 (golpe de entrada + dado más difícil); ganarte a Don Raúl ablanda el Motín.
- **Crisis en R11**: Motín de los Históricos si la resistencia llegó a 70, si no la Oferta de la multinacional.
- **6 finales narrados** + Valor de Empresa, **puntaje con conteo animado y récord personal**, e **Informe del Consultor** por plantillas (Burke & Litwin, subculturas, coalición dominante, estilo de decisión, rumbo).
- **Meta-progresión** (localStorage): 13 logros desbloqueables, colección de finales (7) y arquetipos ganados (5), mejor puntaje.
- **Sonido sintetizado** (WebAudio, sin archivos) con botón de mute persistente.
- **2 modos**: individual y multijugador pass-and-play (2–4, mismo plan de partida y mismos titulares para todos; la colección no se toca en multi).

Fin anticipado: Caja en 0 → quiebra; Confianza ≤ 10 → éxodo de clientes.

## Estructura

```
src/
  data.js               arquetipos, mazo de 12 rondas, eventos fijos, crisis, finales, misiones
  dataEventos.js        pool de eventos menores ("Titulares") + sorteo
  engine.js             lógica pura: efectos, d20 con críticos, racha, puntaje, variantes, plan de partida
  consultor.js          informe del consultor por plantillas (offline)
  meta.js               persistencia localStorage (logros, colección, récords, mute)
  logros.js             definiciones y chequeo de logros
  sound.js              efectos de sonido sintetizados (WebAudio)
  components/ui.jsx     chips, barras con deltas flotantes, tablero, dado animado, opciones
  components/juice.jsx  toasts, confetti, racha, misiones, conteo de puntaje
  components/screens.jsx   intro, cómo jugar, modos, arquetipos, ronda, eventos
  components/screens2.jsx  final con tally, informe, tabla de posiciones
  App.jsx               máquina de estados y los 2 modos
```

— Organización y Gestión Empresaria · UAI Rosario
