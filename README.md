# AgroSur S.A. — Crónicas del Cambio

Simulación organizacional jugable: sos el Gerente de Transformación de una corredora de granos rosarina y gestionás la empresa durante 10 rondas de decisiones. Construida con React + Vite, 100% offline (sin backend ni llamadas externas).

## Cómo correr

```bash
npm install
npm run dev      # desarrollo en http://localhost:5173
npm run build    # build de producción en dist/
npm run preview  # servir el build
```

## El juego

- **10 rondas**, una por clase de la materia (Contexto → Porter → Política → Cultura → Cambio → Estructura → Puestos → Decisiones → Crisis → Cierre), cada una con 3 opciones.
- **4 indicadores visibles** (💰 Caja, 🤝 Confianza, ⚙️ Adopción, 🔥 Motivación) + un **indicador oculto** de resistencia política.
- **Dado d20** para las opciones arriesgadas: éxito con 11+, o 15+ si el indicador relacionado está en rojo (<30).
- **2 eventos fijos**: Salto del dólar (tras R3) y Se va el que sabía (tras R6, con impacto encadenado según si documentaste / armaste células).
- **Crisis en R9**: Motín de los Históricos si la resistencia llegó a 70, si no la Oferta de la multinacional.
- **6 finales narrados** + Valor de Empresa, e **Informe del Consultor** generado por plantillas (Burke & Litwin, coalición dominante, estilo de decisión, rumbo elegido).
- **3 modos**: individual, multijugador pass-and-play (2–4, con handoff de dispositivo) y presentación exprés (3 rondas con concepto resaltado).

Fin anticipado: Caja en 0 → quiebra; Confianza ≤ 10 → éxodo de clientes.

## Estructura

```
src/
  data.js               arquetipos, mazo de rondas, eventos, crisis, finales
  engine.js             lógica pura del juego (estado, efectos, d20, finales)
  consultor.js          informe del consultor por plantillas (offline)
  components/ui.jsx     chips, barras, tablero, dado, opciones
  components/screens.jsx   intro, cómo jugar, modos, arquetipos, ronda, evento
  components/screens2.jsx  final, informe, tabla de posiciones
  App.jsx               máquina de estados y los 3 modos
```

— Organización y Gestión Empresaria · UAI Rosario
