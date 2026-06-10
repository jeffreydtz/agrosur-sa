// ============================================================
// consultor.js — Informe del Consultor (plantillas offline)
// Analiza el log y los flags y produce secciones de informe.
// ============================================================
import { calcularFinal } from "./engine.js";

function tieneFlag(estado, f) { return estado.flags.includes(f); }

function analizarResistencia(estado) {
  const fin = estado.resistencia;
  const ini = estado.resistHist[0];
  const pico = Math.max(...estado.resistHist);
  let texto;
  if (fin >= 70) {
    texto =
      `La resistencia de la coalición dominante trepó de ${ini} a ${fin}. Cada decisión impuesta «por decreto», sin negociar con los guardianes de la cultura, fue cargando una bomba silenciosa. Esto es resistencia política en estado puro (Schein): no es que la gente no entienda el cambio, es que defiende cuotas de poder y una identidad. Cuando ignoraste a la coalición dominante, el sistema te lo cobró.`;
  } else if (pico >= 70) {
    texto =
      `La resistencia llegó a tocar ${pico} —zona de motín— pero supiste descomprimirla a tiempo (terminó en ${fin}). Negociar con los referentes en vez de pasarles por encima desactivó la resistencia política antes de que estallara. Leíste bien a la coalición dominante.`;
  } else if (fin <= 30) {
    texto =
      `Mantuviste la resistencia política muy baja (terminó en ${fin}, desde ${ini}). Trabajaste con la coalición dominante, no contra ella: convertiste anclas culturales en catalizadores. Es el manejo de manual de la resistencia (Schein), aunque ojo: a veces tanto consenso ralentiza el cambio.`;
  } else {
    texto =
      `La resistencia política se mantuvo en niveles manejables (${ini} → ${fin}). Combinaste algo de imposición con algo de negociación. La coalición dominante refunfuñó pero no se amotinó.`;
  }
  return { titulo: "El indicador oculto: la resistencia política", texto };
}

function analizarCambio(estado) {
  const transf = tieneFlag(estado, "enfoque:transformacional");
  const transac = tieneFlag(estado, "enfoque:transaccional");
  const documentado = tieneFlag(estado, "documentado:si");
  let texto;
  if (transf) {
    texto =
      `Elegiste un enfoque de cambio transformacional (Burke & Litwin): moviste primero la cultura, la visión y el liderazgo. Es el enfoque coherente con una empresa relacional como AgroSur, donde el «cómo» importa tanto como el «qué». ` +
      (estado.confianza >= 55
        ? `Y los números te dan la razón: la confianza aguantó.`
        : `Sin embargo, la confianza quedó golpeada: ni el mejor enfoque salva una ejecución descuidada.`);
  } else if (transac) {
    texto =
      `Optaste por un cambio transaccional (Burke & Litwin): sistemas, procesos e incentivos primero. Rápido para mover la adopción tecnológica, pero riesgoso en una cultura de apretón de manos: si el cambio técnico corre más rápido que el cambio cultural, la gente lo vive como una imposición. ` +
      (estado.adopcion >= 60 && estado.confianza >= 50
        ? `Lograste el equilibrio, que no es poco.`
        : `Se notó la tensión entre la velocidad técnica y el ritmo humano.`);
  } else {
    texto =
      `Tu enfoque de cambio quedó indefinido: ni claramente transformacional ni transaccional (Burke & Litwin). El cambio sin un modelo explícito tiende a diluirse, y eso se refleja en una adopción que no termina de despegar.`;
  }
  texto += documentado
    ? ` Acierto clave: documentaste los procesos críticos. Cuando se fue «el que sabía», la empresa no se quedó ciega: el conocimiento estaba en el sistema, no solo en una cabeza.`
    : ` Punto débil: no documentaste los procesos críticos a tiempo. El conocimiento siguió concentrado en personas, y eso es una bomba de tiempo en cualquier organización (C1).`;
  return { titulo: "Tu enfoque de cambio", texto };
}

function analizarDecisiones(estado) {
  // estilo en R8
  const r8 = estado.log.find((l) => l.ronda === 8);
  const culpable = tieneFlag(estado, "culpable:si");
  const celulas = tieneFlag(estado, "celulas:si");
  let texto = "";
  if (r8) {
    if (r8.opcionId === "A") {
      texto += `Frente a la denuncia de Don Ernesto resolviste de forma autocrática: rápido, pero a costa de legitimidad. El estilo autocrático cierra el tema sin resolver la causa raíz; el síntoma vuelve. `;
    } else if (r8.opcionId === "B") {
      texto += `Usaste un estilo consultivo con los 5 Porqués: fuiste a la causa raíz en vez de quedarte en el síntoma (C8). Es la diferencia entre apagar el incendio y arreglar la instalación eléctrica. `;
    } else {
      texto += `Elegiste un estilo participativo: equipo y cliente resolviendo juntos. Más lento, pero construye confianza y aprendizaje organizacional. `;
    }
  }
  if (celulas) {
    texto += `En estructura, te animaste a las células transversales: rompiste los silos funcionales y pusiste el proceso por encima del organigrama (C6). `;
  }
  if (culpable) {
    texto += `Cuidado con un patrón que apareció: buscaste un culpable individual frente a un error que era sistémico. En las organizaciones, casi ningún problema serio es culpa de una sola persona; es el sistema el que falla (C1). Buscar culpables baja la motivación y esconde la causa real. `;
  }
  if (!texto) texto = `Tus decisiones operativas fueron equilibradas, sin un patrón dominante claro.`;
  return { titulo: "Tu estilo de decisión", texto };
}

function analizarEstrategia(estado) {
  let rumbo = "indefinido";
  if (tieneFlag(estado, "estrategia:costos")) rumbo = "costos";
  else if (tieneFlag(estado, "estrategia:relacional")) rumbo = "relacional";
  else if (tieneFlag(estado, "estrategia:nicho")) rumbo = "nicho";

  const map = {
    costos:
      `Definiste un rumbo de liderazgo en costos. Coherente si tu ventaja es la escala, peligroso frente a una fintech que siempre va a ser más barata: en ese juego, una corredora tradicional rara vez gana. La pregunta de Porter es si elegiste el terreno donde podías competir.`,
    relacional:
      `Definiste un rumbo de diferenciación relacional: el apretón de manos como marca. Es la jugada natural de AgroSur y la mejor defensa contra la fintech (que compite por precio, no por relación). Tu desafío era sostener esa diferenciación mientras digitalizabas.`,
    nicho:
      `Definiste un enfoque de nicho: especialización en un segmento + tecnología. Estrategia inteligente para una empresa mediana que no puede ser todo para todos. Concentrar fuerzas suele rendir más que dispersarlas.`,
    indefinido:
      `Tu política de negocios quedó difusa. Sin un rumbo claro (Porter / C3), cada decisión posterior pierde el hilo conductor: la empresa va reaccionando en vez de conduciendo.`,
  };
  return { titulo: "El rumbo elegido", texto: map[rumbo] };
}

function veredictoFinal(estado, final, valor) {
  let texto = `Cerraste con un Valor de Empresa de ${valor}/100 y el perfil «${final.titulo}». ${final.veredicto} `;
  // Comentario sobre la mezcla de indicadores
  const ind = [
    ["caja", estado.caja], ["confianza", estado.confianza],
    ["adopcion", estado.adopcion], ["motivacion", estado.motivacion],
  ];
  const masAlto = ind.reduce((a, b) => (b[1] > a[1] ? b : a));
  const masBajo = ind.reduce((a, b) => (b[1] < a[1] ? b : a));
  const nombre = { caja: "la caja", confianza: "la confianza", adopcion: "la adopción tecnológica", motivacion: "la motivación" };
  texto += `Tu fortaleza fue ${nombre[masAlto[0]]} (${masAlto[1]}); tu deuda pendiente, ${nombre[masBajo[0]]} (${masBajo[1]}). `;
  texto += `Recordá la idea madre de la materia: la organización es un sistema. Ningún indicador se mueve solo, y el verdadero arte de gestionar el cambio es mantener el equilibrio mientras todo se mueve a la vez.`;
  return { titulo: "Veredicto del Consultor", texto };
}

// Genera el informe completo
export function generarInforme(estado) {
  const { final, valor } = calcularFinal(estado);
  const secciones = [];
  // Si terminó anticipado, el informe es más corto y forense
  if (estado.terminado && (final.id === "quiebra")) {
    secciones.push({
      titulo: "Autopsia organizacional",
      texto:
        estado.motivoFin === "quiebra"
          ? `La caja llegó a cero. Sin recursos no hay operación posible. Pero la quiebra rara vez es solo financiera: suele ser el síntoma final de decisiones que erosionaron el sistema mucho antes. La caja fue el último dominó en caer.`
          : `La confianza se desplomó por debajo del umbral de supervivencia y los clientes se fueron en masa. En una corredora que vive de la relación, perder la confianza es perder el negocio. La tecnología más brillante no sirve si no queda nadie del otro lado.`,
    });
    secciones.push(analizarResistencia(estado));
    secciones.push(analizarCambio(estado));
    secciones.push(veredictoFinal(estado, final, valor));
    return { final, valor, secciones };
  }

  secciones.push(analizarEstrategia(estado));
  secciones.push(analizarCambio(estado));
  secciones.push(analizarResistencia(estado));
  secciones.push(analizarDecisiones(estado));
  secciones.push(veredictoFinal(estado, final, valor));
  return { final, valor, secciones };
}
