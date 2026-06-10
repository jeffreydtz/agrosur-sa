// ============================================================
// AgroSur S.A. — Crónicas del Cambio
// data.js — Arquetipos, mazo completo (12 rondas), misiones, finales
// ============================================================

// --- Arquetipos (definen solo valores iniciales) ---
export const ARQUETIPOS = [
  {
    id: "tradicional",
    nombre: "La Tradicional",
    emoji: "🌾",
    caja: 60, confianza: 85, adopcion: 15, motivacion: 60, resistencia: 35,
    desafio: "Queridísima, analógica. Digitalizar sin romper la confianza.",
  },
  {
    id: "endeudada",
    nombre: "La Endeudada",
    emoji: "📉",
    caja: 25, confianza: 60, adopcion: 40, motivacion: 45, resistencia: 30,
    desafio: "Cada peso cuenta. Elegir bien en qué invertir.",
  },
  {
    id: "tecnocrata",
    nombre: "La Tecnócrata",
    emoji: "🖥️",
    caja: 50, confianza: 35, adopcion: 75, motivacion: 55, resistencia: 50,
    desafio: "Compró sistemas que nadie quiere. Recuperar la confianza.",
  },
  {
    id: "quemada",
    nombre: "La Quemada",
    emoji: "🥵",
    caja: 65, confianza: 60, adopcion: 45, motivacion: 20, resistencia: 35,
    desafio: "Equipo fundido. Sin motivación, todo lo arriesgado sale mal.",
  },
  {
    id: "estrella",
    nombre: "La Estrella",
    emoji: "⭐",
    caja: 75, confianza: 75, adopcion: 50, motivacion: 70, resistencia: 25,
    desafio: "Modo fácil… hasta que la complacencia te alcanza.",
  },
];

export const INDICADORES = {
  caja:       { emoji: "💰", nombre: "Caja",      color: "#e0b13a", desc: "Recursos para invertir y operar." },
  confianza:  { emoji: "🤝", nombre: "Confianza", color: "#cf7359", desc: "Relación con clientes y clima interno." },
  adopcion:   { emoji: "⚙️", nombre: "Adopción",  color: "#34a0a4", desc: "Que la tecnología se use de verdad." },
  motivacion: { emoji: "🔥", nombre: "Motivación",color: "#e8693c", desc: "Energía del equipo." },
};

// ============================================================
// MISIONES — 2 por arquetipo. `final: true` se evalúa al cierre;
// las demás, después de cada resolución. test(estado, {valor}).
// ============================================================
export const MISIONES = {
  tradicional: [
    {
      id: "abuela", nombre: "Abuela digital",
      desc: "Llegá a ⚙️ Adopción ≥ 60 manteniendo 🤝 Confianza ≥ 70.",
      test: (s) => s.adopcion >= 60 && s.confianza >= 70,
    },
    {
      id: "padrino", nombre: "El padrino",
      desc: "Lográ que Don Raúl apadrine el sistema (negociar con éxito).",
      test: (s) => s.flags.includes("padrino:si"),
    },
  ],
  endeudada: [
    {
      id: "respirar", nombre: "Respirar",
      desc: "Llevá la 💰 Caja a 50 o más antes de terminar la ronda 6.",
      test: (s) => s.caja >= 50 && s.rondasJugadas <= 6,
    },
    {
      id: "lona", nombre: "Nunca en la lona", final: true,
      desc: "Terminá la partida sin que la 💰 Caja baje nunca de 20.",
      test: (s) => s.minCaja >= 20,
    },
  ],
  tecnocrata: [
    {
      id: "reconquista", nombre: "Reconquista",
      desc: "Recuperá la 🤝 Confianza hasta 60 o más.",
      test: (s) => s.confianza >= 60,
    },
    {
      id: "raiz", nombre: "No era la herramienta",
      desc: "Resolvé la denuncia de Don Ernesto con los 5 Porqués (con éxito).",
      test: (s) => s.flags.includes("raiz:si"),
    },
  ],
  quemada: [
    {
      id: "creer", nombre: "Volver a creer",
      desc: "Subí la 🔥 Motivación hasta 60 o más.",
      test: (s) => s.motivacion >= 60,
    },
    {
      id: "cvl", nombre: "Calidad de vida", final: true,
      desc: "Elegí el enriquecimiento del puesto y terminá con 🔥 ≥ 50.",
      test: (s) => s.flags.includes("enriquecimiento:si") && s.motivacion >= 50,
    },
  ],
  estrella: [
    {
      id: "pilotos", nombre: "Nada de pilotos automáticos", final: true,
      desc: "Terminá con un Valor de Empresa de 75 o más.",
      test: (s, ctx) => (ctx && ctx.valor != null ? ctx.valor : 0) >= 75,
    },
    {
      id: "paranoica", nombre: "Paranoica sobrevive", final: true,
      desc: "Que ningún indicador baje de 40 en toda la partida.",
      test: (s) => s.minIndicador >= 40,
    },
  ],
};

// ============================================================
// MAZO — 12 rondas principales
// Estructura de opción:
//   { id, texto, ef:{caja,confianza,adopcion,motivacion}, resist, flag, rel, umbralMod, dado }
//   dado: { exito:{ef,resist,flag,nota}, fracaso:{...}, critico:{...}, pifia:{...} }
// Cartas con `variantes`: se activan según flags previas (consecuencias encadenadas).
// ============================================================

export const RONDAS = [
  // ---------- R1 ----------
  {
    id: "sequia",
    ronda: 1,
    tema: "Contexto",
    clase: "C1 · C2",
    titulo: "Sequía histórica",
    narrativa:
      "La peor seca en décadas castiga la región núcleo. Los productores no entregan, el volumen operado se desploma y AgroSur vive de comisiones. El directorio te mira: sos el nuevo Gerente de Transformación. ¿Qué hacemos con la caja que se achica?",
    opciones: [
      {
        id: "A",
        texto: "Recortar costos y achicar la estructura ya.",
        ef: { caja: 10, motivacion: -10, confianza: -5 },
      },
      {
        id: "B",
        texto: "Aguantar el temporal sin tocar nada. La seca pasa.",
        ef: { caja: -5, motivacion: 5 },
      },
      {
        id: "C",
        texto: "Salir a buscar negocios nuevos: financiamiento y canje.",
        ef: { caja: -5 },
        rel: "caja",
        dado: {
          exito: { ef: { caja: 18, confianza: 5 }, nota: "El canje engancha a 4 productores nuevos. Entra aire fresco a la caja." },
          fracaso: { ef: { caja: -5 }, nota: "Los nuevos negocios tardan en madurar. Gastaste sin retorno inmediato." },
        },
      },
    ],
    concepto: "La organización es un sistema abierto: el contexto (la seca) manda. Hay variables no controlables.",
  },

  // ---------- R2 ----------
  {
    id: "fintech",
    ronda: 2,
    tema: "Porter",
    clase: "C2",
    titulo: "La fintech",
    narrativa:
      "Aparece AgroPay: una fintech que opera 100% por app con comisiones 40% más bajas. Tres de tus productores más grandes te llaman: «O igualás eso, o nos vamos». El poder de negociación del cliente nunca se sintió tan fuerte.",
    opciones: [
      {
        id: "A",
        texto: "Bajar comisiones para retenerlos. No los puedo perder.",
        ef: { caja: -15, confianza: 10 },
      },
      {
        id: "B",
        texto: "Diferenciarte: asesoría experta que una app no da.",
        ef: { caja: -5 },
        rel: "confianza",
        dado: {
          exito: { ef: { confianza: 15, adopcion: 10 }, nota: "El servicio relacional + datos los enamora. Se quedan y traen a otros." },
          fracaso: { ef: { confianza: 3 }, nota: "Apreciaron el gesto, pero uno igual se fue a probar la app." },
        },
      },
      {
        id: "C",
        texto: "Ignorarlos: «son una moda, no aguantan un ciclo».",
        ef: { caja: 5, confianza: -15 },
        resist: 5,
      },
    ],
    concepto: "Porter: alto poder de negociación del cliente. ¿Competís por costos o te diferenciás?",
  },

  // ---------- R3 ----------
  {
    id: "rumbo",
    ronda: 3,
    tema: "Política de negocios",
    clase: "C3",
    titulo: "El rumbo",
    narrativa:
      "El directorio te cita: «Definí el rumbo de los próximos años. ¿Quiénes somos?». Tu respuesta va a teñir todas las decisiones que siguen. No hay vuelta atrás fácil.",
    opciones: [
      {
        id: "A",
        texto: "Liderazgo en costos: ser la corredora más barata.",
        ef: { caja: 10, confianza: -5 },
        flag: "estrategia:costos",
      },
      {
        id: "B",
        texto: "Diferenciación relacional: el apretón de manos como marca.",
        ef: { confianza: 12, caja: -5 },
        flag: "estrategia:relacional",
      },
      {
        id: "C",
        texto: "Enfoque en nicho: especialistas en el productor mediano + tech.",
        ef: { adopcion: 8, motivacion: 5, caja: -5 },
        flag: "estrategia:nicho",
      },
    ],
    concepto: "Estrategias genéricas (Porter) y política de negocios: el rumbo ordena todo lo demás.",
  },

  // ---------- R4 ----------
  {
    id: "siempre",
    ronda: 4,
    tema: "Cultura",
    clase: "C4",
    titulo: "Siempre se hizo así",
    personaje: { emoji: "🧔", nombre: "Don Raúl" },
    narrativa:
      "Los corredores históricos cierran negocios por teléfono y pasan los contratos «de palabra». El sistema de registro lleva 3 meses disponible: lo usan 2 personas. Don Raúl (25 años en la casa) te frena en el pasillo: «Pibe, acá los negocios se cierran mirando a los ojos, no con formularios».",
    opciones: [
      {
        id: "A",
        texto: "Decreto: uso obligatorio del sistema desde el lunes.",
        ef: { adopcion: 15, motivacion: -10 },
        resist: 20,
      },
      {
        id: "B",
        texto: "Negociar: Don Raúl co-diseña el sistema y es su «padrino».",
        ef: { caja: -5 },
        rel: "confianza",
        dado: {
          exito: { ef: { adopcion: 20, confianza: 10 }, resist: -15, flag: "padrino:si", nota: "Don Raúl se pone la camiseta. El ancla se vuelve catalizador: los demás lo siguen." },
          fracaso: { ef: { adopcion: 5 }, nota: "Don Raúl escuchó, pero no se comprometió. Avance tibio." },
          critico: { ef: { adopcion: 25, confianza: 15 }, resist: -20, flag: "padrino:si", nota: "Don Raúl no solo se pone la camiseta: arma él mismo la capacitación para los demás corredores. La oficina entera da vuelta la página." },
          pifia: { ef: { confianza: -10, motivacion: -8 }, resist: 10, nota: "«A mí no me vengas con teatro, pibe.» Don Raúl se siente usado para la foto. Lo perdiste — y los demás lo vieron." },
        },
      },
      {
        id: "C",
        texto: "Esperar a que la cultura madure sola.",
        ef: { motivacion: 5, adopcion: -10 },
      },
    ],
    concepto: "Resistencia política vs. social. Convertir un ancla cultural en catalizador del cambio (Schein).",
  },

  // ---------- R5 (NUEVA) ----------
  {
    id: "tribus",
    ronda: 5,
    tema: "Subculturas",
    clase: "C4",
    titulo: "Dos tribus",
    narrativa:
      "Contrataste tres pibes de sistemas para sostener la transformación. A la semana, los corredores los bautizaron «los nintendo»; ellos responden con «los dinosaurios». En el último asado de la empresa comieron en mesas separadas. Dos subculturas bajo el mismo techo, y la grieta crece.",
    opciones: [
      {
        id: "A",
        texto: "Cada tribu en su sector. Que no se mezclen y listo.",
        ef: { adopcion: 5, confianza: -5 },
        resist: 10,
        flag: "tribus:separadas",
      },
      {
        id: "B",
        texto: "Duplas cruzadas: cada corredor trabaja una semana con un dev.",
        ef: { caja: -5 },
        rel: "motivacion",
        dado: {
          exito: { ef: { adopcion: 12, motivacion: 10, confianza: 5 }, resist: -10, flag: "tribus:integradas", nota: "Don Raúl descubre que «el pibe de sistemas» sabe de fútbol y de futuros. Cada tribu aprende el idioma de la otra." },
          fracaso: { ef: { motivacion: -5 }, nota: "Las duplas se sintieron forzadas. «Una semana perdida», gruñe Don Raúl. La grieta sigue." },
          critico: { ef: { adopcion: 18, motivacion: 14, confianza: 8 }, resist: -15, flag: "tribus:integradas", nota: "La dupla Don Raúl–Tomi termina cerrando un negocio juntos: el corredor pone el cliente, el pibe arma el tablero. La oficina aplaude." },
          pifia: { ef: { motivacion: -10, confianza: -5 }, resist: 8, nota: "La semana termina en un cruce a los gritos en la cocina. «Dinosaurios» contra «nintendos», segundo round. Peor que antes." },
        },
      },
      {
        id: "C",
        texto: "Un proyecto con objetivo común: la primera «cosecha digital».",
        ef: { motivacion: 6, adopcion: 6, caja: -10 },
        flag: "tribus:proyecto",
      },
    ],
    concepto: "Subculturas (Schein): operadores, ingenieros, directivos. La integración no se decreta: se diseña.",
  },

  // ---------- R6 ----------
  {
    id: "cambiamos",
    ronda: 6,
    tema: "Cambio",
    clase: "C5",
    titulo: "¿Cómo cambiamos?",
    narrativa:
      "Llegó el momento de elegir CÓMO se transforma AgroSur. ¿Movés primero la cultura y el liderazgo, o los sistemas y procesos? Y la pregunta incómoda: ¿documentamos los procesos críticos ahora, mientras hay tiempo?",
    opciones: [
      {
        id: "A",
        texto: "Transformacional: visión, liderazgo y cultura primero. Y documentar.",
        ef: { motivacion: 10, adopcion: 8, caja: -10 },
        flag: "enfoque:transformacional|documentado:si",
      },
      {
        id: "B",
        texto: "Transaccional: sistemas e incentivos rápido. Documentar después.",
        ef: { adopcion: 15, motivacion: -5 },
        flag: "enfoque:transaccional|documentado:no",
      },
      {
        id: "C",
        texto: "Cambio participativo co-construido con el equipo.",
        ef: { caja: -5 },
        rel: "motivacion",
        flag: "documentado:si",
        dado: {
          exito: { ef: { adopcion: 15, motivacion: 10, confianza: 8 }, flag: "enfoque:transformacional", nota: "El equipo se apropia del cambio. Documentan ellos mismos lo que saben." },
          fracaso: { ef: { adopcion: 5 }, flag: "enfoque:transaccional", nota: "Las reuniones se diluyeron. Quedó la intención, no el método." },
        },
      },
    ],
    concepto: "Burke & Litwin: cambio transformacional (cultura/liderazgo) vs. transaccional (sistemas/procesos).",
  },

  // ---------- R7 ----------
  {
    id: "error",
    ronda: 7,
    tema: "Estructura",
    clase: "C6",
    titulo: "El error millonario",
    narrativa:
      "Un contrato de 3.000 toneladas se transmitió de palabra entre Comercial y Logística. El camión fue a San Lorenzo; el buque esperaba en Bahía Blanca. Cliente furioso y nadie sabe de quién era la responsabilidad. Los silos se acusan entre sí.",
    opciones: [
      {
        id: "A",
        texto: "Reestructurar: células transversales por proceso.",
        ef: { caja: -15 },
        rel: "adopcion",
        dado: {
          exito: { ef: { adopcion: 15, confianza: 10 }, flag: "celulas:si", nota: "Las células rompen los silos. El conocimiento empieza a circular: «Se va el que sabía» pierde fuerza." },
          fracaso: { ef: { motivacion: -5 }, nota: "Confusión de doble mando: nadie sabe a quién reporta. La reestructura genera fricción." },
          critico: { ef: { adopcion: 20, confianza: 14, motivacion: 6 }, flag: "celulas:si", nota: "Las células funcionan tan bien que un cliente pregunta «¿qué cambiaron?». El proceso manda y el organigrama acompaña." },
          pifia: { ef: { motivacion: -10, caja: -5 }, nota: "Doble mando, triple confusión: dos células se pelean por el mismo contrato y el cliente lo nota. Carísimo aprendizaje." },
        },
      },
      {
        id: "B",
        texto: "Mantener funcional + roles de enlace entre áreas.",
        ef: { caja: -5, confianza: 5 },
      },
      {
        id: "C",
        texto: "Buscar un culpable y sancionarlo. Que aprendan.",
        ef: { motivacion: -15, confianza: -5 },
        resist: 15,
        flag: "culpable:si",
      },
    ],
    concepto: "Los problemas son sistémicos (C1). Estructura y coordinación transversal (C6); síntoma vs. causa (C8).",
  },

  // ---------- R8 ----------
  {
    id: "renuncias",
    ronda: 8,
    tema: "Diseño de puestos",
    clase: "C7",
    titulo: "La ola de renuncias",
    narrativa:
      "Tras la salida del referente, el área de Contratos se vacía: dos renuncias en una semana. Los que quedan están sobrecargados y miran la puerta. Hay que rediseñar el trabajo, no solo tapar agujeros.",
    opciones: [
      {
        id: "A",
        texto: "Rotación de puestos: que todos aprendan todo.",
        ef: { adopcion: 6, motivacion: 5, caja: -5 },
      },
      {
        id: "B",
        texto: "Enriquecimiento del puesto: autonomía, variedad y sentido.",
        ef: { motivacion: 15, confianza: 5, caja: -5 },
        flag: "enriquecimiento:si",
      },
      {
        id: "C",
        texto: "Contratar más gente, rápido, para frenar la sangría.",
        ef: { caja: -15, motivacion: -5, confianza: 5 },
      },
    ],
    concepto: "Diseño de puestos: rotación, enriquecimiento y Calidad de Vida Laboral vs. burnout (C7).",
  },

  // ---------- R9 (NUEVA) ----------
  {
    id: "appmovil",
    ronda: 9,
    tema: "Gestión del cambio",
    clase: "C5",
    titulo: "AgroSur Móvil renace",
    narrativa:
      "La app que la gestión anterior pagó carísima junta polvo: 7 descargas, y 2 son tuyas. El directorio pregunta qué pensás hacer con «esa inversión». Relanzarla en serio… o enterrarla con honores.",
    opciones: [
      {
        id: "A",
        texto: "Relanzarla con los productores como co-diseñadores. Beta con Don Ernesto incluido.",
        ef: { caja: -10 },
        rel: "adopcion",
        dado: {
          exito: { ef: { adopcion: 15, confianza: 10 }, flag: "app:relanzada", nota: "Don Ernesto manda capturas al grupo: «hasta yo la uso». Los usuarios de la beta se vuelven evangelistas." },
          fracaso: { ef: { adopcion: 4, caja: -5 }, nota: "Quedó a mitad de camino: linda demo, pocos usuarios reales." },
          critico: { ef: { adopcion: 22, confianza: 14, motivacion: 6 }, flag: "app:relanzada", nota: "La beta explota: en dos semanas hay lista de espera y los productores se la recomiendan entre ellos. La app dejó de ser «esa inversión»." },
          pifia: { ef: { caja: -10, adopcion: -5 }, nota: "El relanzamiento se cae en vivo, delante del directorio. «¿Para esto pagamos dos veces?»" },
        },
      },
      {
        id: "B",
        texto: "Enterrarla y volver al Excel que todos conocen.",
        ef: { caja: 5, adopcion: -10, motivacion: 4 },
        flag: "app:enterrada",
      },
      {
        id: "C",
        texto: "Uso obligatorio: la pagamos, se usa.",
        ef: { adopcion: 10, confianza: -8, motivacion: -6 },
        resist: 10,
      },
    ],
    concepto: "Tecnología sin gestión del cambio es gasto, no inversión: la adopción se construye con usuarios, no con decretos (C5).",
  },

  // ---------- R10 ----------
  {
    id: "denuncia",
    ronda: 10,
    tema: "Toma de decisiones",
    clase: "C8",
    titulo: "La denuncia de Don Ernesto",
    personaje: { emoji: "👴", nombre: "Don Ernesto" },
    narrativa:
      "Don Ernesto —cliente fundacional, amigo de los dueños— denuncia un error de liquidación que lo perjudicó. La noticia corre. ¿Cómo decidís la respuesta de la empresa?",
    variantes: [
      {
        cuando: "culpable:si",
        ribbon: "🔁 CONSECUENCIA · El error millonario",
        narrativaExtra:
          "Y hay algo peor: desde que sancionaste a un culpable por el error millonario, nadie reporta los problemas. Este venía incubándose hace semanas y te enteraste por el cliente. El miedo esconde los errores; no los arregla.",
        efEntrada: { confianza: -5, motivacion: -3 },
        opcionesPatch: { B: { umbralMod: 1 } },
      },
    ],
    opciones: [
      {
        id: "A",
        texto: "Autocrático: lo resolvés vos solo, rápido y sin ruido.",
        ef: { caja: 5, confianza: -5, motivacion: -5 },
        resist: 10,
      },
      {
        id: "B",
        texto: "Consultivo: aplicás los 5 Porqués para hallar la causa raíz.",
        ef: { caja: -5 },
        rel: "confianza",
        dado: {
          exito: { ef: { confianza: 15, adopcion: 10 }, flag: "raiz:si", nota: "Los 5 Porqués revelan que el problema era el proceso, no la persona. Lo arreglás de raíz." },
          fracaso: { ef: { confianza: 3 }, nota: "El análisis fue apurado. Calmaste a Don Ernesto, pero la causa sigue ahí." },
        },
      },
      {
        id: "C",
        texto: "Participativo: equipo y cliente resuelven juntos a la vista de todos.",
        ef: { confianza: 12, motivacion: 8, caja: -10 },
      },
    ],
    concepto: "Estilos de toma de decisiones (autocrático→participativo) y causa raíz vs. síntoma (C8).",
  },

  // ---------- R11 se inserta dinámicamente (crisis) ----------

  // ---------- R12 ----------
  {
    id: "balance",
    ronda: 12,
    tema: "Cierre",
    clase: "Integración",
    titulo: "Balance anual",
    narrativa:
      "Fin del ejercicio. La asamblea espera tu última decisión de legado: ¿en qué estado dejás a AgroSur para quien venga después? Es la foto final de la empresa que construiste.",
    opciones: [
      {
        id: "A",
        texto: "Reinvertir en la gente y consolidar el sistema.",
        ef: { motivacion: 6, adopcion: 6, caja: -5 },
        flag: "legado:reinvertir",
      },
      {
        id: "B",
        texto: "Consolidar lo logrado y jugar seguro.",
        ef: { caja: 4 },
        flag: "legado:consolidar",
      },
      {
        id: "C",
        texto: "Repartir dividendos y declarar la victoria.",
        ef: { caja: 12, motivacion: -6, confianza: -5 },
        flag: "legado:dividendos",
      },
    ],
    concepto: "Integración: toda decisión organizacional es, también, una decisión sobre el futuro.",
  },
];

export const RONDAS_BY_ID = Object.fromEntries(RONDAS.map((r) => [r.id, r]));

// ============================================================
// EVENTOS FIJOS
// ============================================================

export const EVENTO_DOLAR = {
  id: "dolar",
  tipo: "evento",
  insertarTras: 3,
  tema: "Contexto",
  clase: "C2 · C8",
  titulo: "Salto del dólar",
  narrativa:
    "De un día para el otro, el dólar salta un 30%. Los productores retienen mercadería, los contratos en pesos quedan desfasados y la operatoria se congela. No lo provocaste vos, no lo controlás vos: es el contexto argentino. Golpea a todos por igual.",
  ef: { caja: -10, confianza: -5, motivacion: -5 },
  concepto: "Variables no controlables y contexto (C2). En multijugador, idéntico para todas las empresas.",
};

// El impacto de "Se va el que sabía" depende de flags previas
export function eventoSeVa(flags) {
  const documentado = flags.includes("documentado:si");
  const celulas = flags.includes("celulas:si");
  let ef, narrativa, severidad;
  if (celulas) {
    ef = { motivacion: -4, confianza: -3 };
    severidad = "leve";
    narrativa =
      "Renuncia Marta, la referente de Contratos que tenía todo «en la cabeza». Pero las células transversales ya repartieron el conocimiento: el equipo absorbe el golpe. Se siente, no duele.";
  } else if (documentado) {
    ef = { motivacion: -6, adopcion: -5 };
    severidad = "moderado";
    narrativa =
      "Renuncia Marta, la referente de Contratos. Por suerte documentaste los procesos críticos a tiempo: hay manuales, hay registros. El bache se cubre con esfuerzo, pero se cubre.";
  } else {
    ef = { adopcion: -15, motivacion: -10, confianza: -10 };
    severidad = "grave";
    narrativa =
      "Renuncia Marta, la referente de Contratos, y se lleva en la cabeza 12 años de cómo funciona todo. Nadie documentó nada. Los contratos se traban, los clientes esperan, el equipo improvisa. El conocimiento concentrado en personas pasó la factura.";
  }
  return {
    id: "seva",
    tipo: "evento",
    insertarTras: 7,
    tema: "Estructura",
    clase: "C1 · C6",
    titulo: "Se va el que sabía",
    personaje: { emoji: "👩‍💼", nombre: "Marta" },
    narrativa,
    ef,
    severidad,
    concepto: "Conocimiento concentrado en personas. El costo de no documentar y de los silos (C1, C6).",
  };
}

// ============================================================
// CRISIS R11 — dos variantes
// ============================================================

export const CRISIS_MOTIN = {
  id: "crisis",
  ronda: 11,
  tema: "Crisis · Resistencia política",
  clase: "C4",
  titulo: "El Motín de los Históricos",
  personaje: { emoji: "🧔", nombre: "Don Raúl" },
  narrativa:
    "Era cuestión de tiempo. Cansados de decisiones impuestas «por decreto», los corredores históricos se plantan: amenazan con irse en bloque y llevarse sus carteras de clientes. Don Raúl encabeza. La resistencia política que venías acumulando en silencio estalló.",
  crisis: true,
  variantes: [
    {
      cuando: (flags) => flags.includes("tribus:integradas") || flags.includes("padrino:si"),
      ribbon: "🤝 LAZOS QUE VUELVEN",
      narrativaExtra:
        "Pero algo cambió: Don Raúl te frena antes de la asamblea. «Yo sé que vos escuchás, pibe. Convencé al resto.» El vínculo que construiste te abre una puerta.",
      opcionesPatch: { B: { umbralMod: -1 } },
    },
  ],
  opciones: [
    {
      id: "A",
      texto: "Ceder: co-gobierno con los históricos, frenar el sistema.",
      ef: { confianza: 15, adopcion: -12, motivacion: 5 },
      resist: -25,
    },
    {
      id: "B",
      texto: "Negociar una salida: integrarlos como referentes del cambio.",
      ef: { caja: -5 },
      rel: "confianza",
      dado: {
        exito: { ef: { confianza: 15, motivacion: 10, adopcion: 5 }, resist: -20, nota: "Les das un rol de honor en la transformación. El motín se transforma en alianza." },
        fracaso: { ef: { confianza: -15, motivacion: -8 }, nota: "No te creyeron. Dos corredores se van y se llevan clientes. Éxodo parcial." },
        critico: { ef: { confianza: 20, motivacion: 14, adopcion: 8 }, resist: -30, nota: "Don Raúl pide la palabra y dice: «el pibe tiene razón». El motín se vuelve mesa de trabajo, y la asamblea termina en aplauso." },
        pifia: { ef: { confianza: -20, motivacion: -12 }, resist: 5, nota: "La reunión termina con portazos. Tres corredores renuncian en bloque y se llevan media cartera." },
      },
    },
    {
      id: "C",
      texto: "Plantarte: despedir a los cabecillas y seguir adelante.",
      ef: { confianza: -20, motivacion: -15, adopcion: 10 },
    },
  ],
  concepto: "Resistencia política de la coalición dominante (Schein). El indicador oculto se cobró su precio.",
};

export const CRISIS_OFERTA = {
  id: "crisis",
  ronda: 11,
  tema: "Crisis · Decisión estratégica",
  clase: "C3 · C8",
  titulo: "La oferta de la multinacional",
  narrativa:
    "Una multinacional del agro pone una oferta sobre la mesa: compra AgroSur, paga bien, y vos quedás como gerente regional. «Es el negocio de tu vida», dicen los dueños. Pero es el fin del proyecto independiente. ¿Vendés o seguís?",
  crisis: true,
  opciones: [
    {
      id: "A",
      texto: "Vender. Es un gran negocio y un cierre con plata.",
      ef: {},
      flag: "vendida:si",
    },
    {
      id: "B",
      texto: "Rechazar y redoblar la apuesta por la autonomía.",
      ef: { caja: -5 },
      rel: "motivacion",
      dado: {
        exito: { ef: { caja: 12, motivacion: 10, confianza: 5 }, nota: "El equipo se envalentona: «somos dueños de nuestro destino». La apuesta rinde." },
        fracaso: { ef: { caja: -10 }, nota: "Rechazaste la oferta, pero el mercado no acompañó. Quedaste expuesto." },
        critico: { ef: { caja: 18, motivacion: 14, confianza: 8 }, nota: "La noticia corre por la plaza: «AgroSur no se vende». Llegan tres clientes nuevos por puro orgullo rosarino." },
        pifia: { ef: { caja: -14, motivacion: -6 }, nota: "Rechazaste la oferta y al mes el mercado se dio vuelta. El directorio te lo recuerda en cada almuerzo." },
      },
    },
    {
      id: "C",
      texto: "Negociar una alianza: inversión minoritaria, seguís al mando.",
      ef: { caja: 15, confianza: -5, adopcion: 10 },
    },
  ],
  concepto: "Decisión estratégica bajo incertidumbre. Autonomía vs. capital. «Sólo los paranoicos sobreviven» (Grove).",
};

// ============================================================
// FINALES
// ============================================================
// Se evalúan en orden de prioridad. El primero que matchea, gana.

export const FINALES = [
  {
    id: "quiebra",
    emoji: "💀",
    titulo: "Quiebra / Éxodo",
    color: "#cf4631",
    bonus: 0,
    test: (s) => s.caja <= 0 || s.confianza <= 10,
    narrativa:
      "AgroSur no llegó al final del ejercicio. Sin caja no hay operación; sin confianza no hay clientes. La autopsia organizacional es clara: una empresa es un sistema, y cuando una variable crítica colapsa, arrastra al resto.",
    veredicto: "Game over anticipado.",
  },
  {
    id: "vendida",
    emoji: "💼",
    titulo: "Vendida",
    color: "#9b8557",
    bonus: 50,
    test: (s) => s.flags.includes("vendida:si"),
    narrativa:
      "Firmaste la venta. Buen negocio: los dueños cobraron, vos quedaste bien parado. Pero el proyecto independiente que era AgroSur dejó de existir. ¿Éxito o derrota? Depende de qué viniste a construir.",
    veredicto: "Fin del proyecto. La pregunta queda abierta.",
  },
  {
    id: "lider",
    emoji: "🏆",
    titulo: "Líder del sector",
    color: "#5a9e3f",
    bonus: 150,
    test: (s) => s.valor >= 75 && s.caja >= 50 && s.confianza >= 50 && s.adopcion >= 50 && s.motivacion >= 50,
    narrativa:
      "Lo lograste: escalaste el negocio sin perder el alma. La tecnología se usa de verdad, los clientes confían más que nunca y el equipo está prendido fuego (del bueno). AgroSur es referencia en la plaza rosarina.",
    veredicto: "Escalaste sin perder el alma.",
  },
  {
    id: "carton",
    emoji: "🤖",
    titulo: "Tecnología de cartón",
    color: "#34a0a4",
    bonus: 60,
    test: (s) => s.adopcion >= 70 && s.confianza < 40,
    narrativa:
      "Tenés sistemas impecables, dashboards hermosos, una app que funciona. El problema: los clientes se fueron. Digitalizaste tan rápido y tan «por decreto» que rompiste la relación que hacía única a AgroSur. Tecnología sin confianza es cartón pintado.",
    veredicto: "Sistemas impecables, clientes que se fueron.",
  },
  {
    id: "boutique",
    emoji: "🤝",
    titulo: "La boutique relacional",
    color: "#cf7359",
    bonus: 60,
    test: (s) => s.confianza >= 75 && s.adopcion < 30,
    narrativa:
      "Todos te quieren. El apretón de manos sigue intacto, los clientes te son fieles, sos la corredora más querida de Rosario. Pero seguís dependiendo de Excel y de la memoria de las personas: imposible de escalar. Cuando se vaya el que sabe, tiembla todo.",
    veredicto: "Querida por todos, imposible de escalar.",
  },
  {
    id: "zombie",
    emoji: "🧟",
    titulo: "Empresa zombie",
    color: "#d9a521",
    bonus: 20,
    test: (s) => [s.caja, s.confianza, s.adopcion, s.motivacion].every((v) => v >= 30 && v <= 55),
    narrativa:
      "AgroSur ni creció ni quebró. Sobrevive en una medianía gris: cada decisión tibia evitó el desastre pero también el progreso. Ganó la complacencia. «Sólo los paranoicos sobreviven», y vos te quedaste cómodo.",
    veredicto: "Ni creció ni quebró: ganó la complacencia.",
  },
  // Fallback
  {
    id: "claroscuros",
    emoji: "🌗",
    titulo: "Una empresa con claroscuros",
    color: "#9b8557",
    bonus: 40,
    test: () => true,
    narrativa:
      "AgroSur cerró el año con luces y sombras. Avanzaste en algunos frentes y quedaste en deuda en otros: una empresa real, con sus contradicciones. No es el final de los libros, pero es honesto. El sistema sigue en movimiento.",
    veredicto: "Sobreviviste. La transformación sigue pendiente.",
  },
];
