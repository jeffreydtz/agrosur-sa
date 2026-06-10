# AgroSur S.A. — Crónicas del Cambio

Simulación organizacional jugable: sos el Gerente de Transformación de una corredora de granos rosarina y gestionás la empresa durante 12 rondas de decisiones. Construida con React + Vite. Funciona 100% offline; el modo online (rooms) es opcional y usa Firebase Realtime Database.

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
- **2 dados (2d6)** para las opciones arriesgadas: éxito con 7+, o 9+ si el indicador relacionado está en rojo (<30). **Doble 6 = CRÍTICO ★** (efectos amplificados), **doble 1 = PIFIA ☠**. Casi-éxitos dramatizados ("¡Por UNO!").
- **🔥 Racha**: encadenar rondas positivas multiplica los puntos (nunca los indicadores).
- **🎯 Misiones**: 2 objetivos propios por arquetipo, con bonus de puntos.
- **2 eventos fijos** (Salto del dólar tras R3; Se va el que sabía tras R7, con impacto encadenado según documentaste / armaste células) + **pool de 8 eventos menores** ("Titulares"): se sortean 2-3 por partida, varios reactivos al estado — cada partida es distinta.
- **Consecuencias encadenadas**: buscar un culpable en R7 vuelve amplificado en la denuncia de R10 (golpe de entrada + dado más difícil); ganarte a Don Raúl ablanda el Motín.
- **Crisis en R11**: Motín de los Históricos si la resistencia llegó a 70, si no la Oferta de la multinacional.
- **6 finales narrados** + Valor de Empresa, **puntaje con conteo animado y récord personal**, e **Informe del Consultor** por plantillas (Burke & Litwin, subculturas, coalición dominante, estilo de decisión, rumbo).
- **Meta-progresión** (localStorage): 13 logros desbloqueables, colección de finales (7) y arquetipos ganados (5), mejor puntaje.
- **Sonido sintetizado** (WebAudio, sin archivos) con botón de mute persistente.
- **3 modos**: individual, **Pass & Play** (2–4, mismo dispositivo, mismo plan de partida para todos) y **Online** con rooms: creás un room con código de 5 letras, los demás se unen con nombre + código, cada uno juega su empresa al mismo tiempo con **ranking en vivo y tiempo límite** (5/10/15/20 min) — al vencer el tiempo la partida se cierra para todos y gana el mayor Valor de Empresa.

Fin anticipado: Caja en 0 → quiebra; Confianza ≤ 10 → éxodo de clientes.

## Estructura

```
src/
  data.js               arquetipos, mazo de 12 rondas, eventos fijos, crisis, finales, misiones
  dataEventos.js        pool de eventos menores ("Titulares") + sorteo
  engine.js             lógica pura: efectos, 2d6 con críticos, racha, puntaje, variantes, plan de partida
  consultor.js          informe del consultor por plantillas (offline)
  meta.js               persistencia localStorage (logros, colección, récords, mute)
  logros.js             definiciones y chequeo de logros
  sound.js              efectos de sonido sintetizados (WebAudio)
  components/ui.jsx     chips, barras con deltas flotantes, tablero, dado animado, opciones
  components/juice.jsx  toasts, confetti, racha, misiones, conteo de puntaje
  components/screens.jsx   intro, cómo jugar, modos, arquetipos, ronda, eventos
  components/screens2.jsx  final con tally, informe, tabla de posiciones
  components/online.jsx menú online, crear/unirse a room, lobby, HUD con reloj y ranking, posiciones
  firebase.js           init de Firebase (solo si hay config en .env.local)
  online.js             API de rooms sobre Realtime Database
  App.jsx               máquina de estados y los 3 modos
```

## Modo online (opcional)

1. Creá un proyecto en [console.firebase.google.com](https://console.firebase.google.com) y agregale una **Realtime Database** (modo de prueba para empezar).
2. Registrá una app web y copiá la config.
3. Copiá `.env.local.example` a `.env.local` y completá los valores.
4. Reiniciá `npm run dev`. Sin config, el juego anda igual y el modo online muestra las instrucciones.

— Organización y Gestión Empresaria · UAI Rosario
