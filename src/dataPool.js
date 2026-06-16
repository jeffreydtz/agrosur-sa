// ============================================================
// dataPool.js — Pool de decisiones (mazo random)
// El cuerpo de la partida se sortea de acá (sin repetir). Cada PARTIDA
// arma un mazo distinto -> rejugabilidad.
//
// Estructura de carta:
//   { id, tema, clase, titulo, narrativa, opciones:[...], concepto,
//     personaje?, variantes?, soloArq? }
//   soloArq: [arqId]  -> carta EXCLUSIVA: sólo entra al mazo de ese arquetipo
//                        (sólo en individual; en multijugador se excluyen).
//
// Estructura de opción (igual que antes + `cat`):
//   { id, texto, cat, ef:{caja,confianza,adopcion,motivacion}, resist, flag,
//     rel, umbralMod, dado:{exito,fracaso,critico,pifia} }
//   `cat` = categoría de la decisión. Si la categoría NO está en la afinidad
//   del arquetipo, la opción es "fuera de perfil": dado +1, pero +60% puntos
//   si sale bien (ver engine.js / esOffProfile).
//
// Categorías (7): tecnologica · arriesgada · financiera · relacional ·
//                 operativa · cultural · comercial
// ============================================================

export const CATEGORIAS = [
  "tecnologica", "arriesgada", "financiera", "relacional",
  "operativa", "cultural", "comercial",
];

export const CAT_LABEL = {
  tecnologica: "🔧 Tech",
  arriesgada: "🎲 Arriesgada",
  financiera: "💰 Financiera",
  relacional: "🤝 Relacional",
  operativa: "⚙️ Operativa",
  cultural: "🌱 Cultural",
  comercial: "📈 Comercial",
};

// Cartas universales por categoría (autoría modular en src/pool/)
import { CARTAS_TECNOLOGIA } from "./pool/tecnologia.js";
import { CARTAS_RELACIONES } from "./pool/relaciones.js";
import { CARTAS_FINANZAS } from "./pool/finanzas.js";
import { CARTAS_OPERACIONES } from "./pool/operaciones.js";
import { CARTAS_CULTURA } from "./pool/cultura.js";
import { CARTAS_COMERCIAL } from "./pool/comercial.js";
import { CARTAS_RIESGO } from "./pool/riesgo.js";

export const POOL = [
  // ============================================================
  // CARTAS MIGRADAS (las 11 originales, ahora con `cat` por opción)
  // ============================================================

  {
    id: "sequia",
    tema: "Contexto",
    clase: "C1 · C2",
    titulo: "Sequía histórica",
    narrativa:
      "La peor seca en décadas castiga la región núcleo. Los productores no entregan, el volumen operado se desploma y AgroSur vive de comisiones. El directorio te mira: sos el nuevo Gerente de Transformación. ¿Qué hacemos con la caja que se achica?",
    opciones: [
      { id: "A", texto: "Recortar costos y achicar la estructura ya.", cat: "financiera", ef: { caja: 10, motivacion: -10, confianza: -5 } },
      { id: "B", texto: "Aguantar el temporal sin tocar nada. La seca pasa.", cat: "operativa", ef: { caja: -5, motivacion: 5 } },
      {
        id: "C", texto: "Salir a buscar negocios nuevos: financiamiento y canje.", cat: "comercial",
        ef: { caja: -5 }, rel: "caja",
        dado: {
          exito: { ef: { caja: 18, confianza: 5 }, nota: "El canje engancha a 4 productores nuevos. Entra aire fresco a la caja." },
          fracaso: { ef: { caja: -5 }, nota: "Los nuevos negocios tardan en madurar. Gastaste sin retorno inmediato." },
        },
      },
    ],
    concepto: "La organización es un sistema abierto: el contexto (la seca) manda. Hay variables no controlables.",
  },

  {
    id: "fintech",
    tema: "Porter",
    clase: "C2",
    titulo: "La fintech",
    narrativa:
      "Aparece AgroPay: una fintech que opera 100% por app con comisiones 40% más bajas. Tres de tus productores más grandes te llaman: «O igualás eso, o nos vamos». El poder de negociación del cliente nunca se sintió tan fuerte.",
    opciones: [
      { id: "A", texto: "Bajar comisiones para retenerlos. No los puedo perder.", cat: "financiera", ef: { caja: -15, confianza: 10 } },
      {
        id: "B", texto: "Diferenciarte: asesoría experta que una app no da.", cat: "relacional",
        ef: { caja: -5 }, rel: "confianza",
        dado: {
          exito: { ef: { confianza: 15, adopcion: 10 }, nota: "El servicio relacional + datos los enamora. Se quedan y traen a otros." },
          fracaso: { ef: { confianza: 3 }, nota: "Apreciaron el gesto, pero uno igual se fue a probar la app." },
        },
      },
      { id: "C", texto: "Ignorarlos: «son una moda, no aguantan un ciclo».", cat: "arriesgada", ef: { caja: 5, confianza: -15 }, resist: 5 },
    ],
    concepto: "Porter: alto poder de negociación del cliente. ¿Competís por costos o te diferenciás?",
  },

  {
    id: "rumbo",
    tema: "Política de negocios",
    clase: "C3",
    titulo: "El rumbo",
    narrativa:
      "El directorio te cita: «Definí el rumbo de los próximos años. ¿Quiénes somos?». Tu respuesta va a teñir todas las decisiones que siguen. No hay vuelta atrás fácil.",
    opciones: [
      { id: "A", texto: "Liderazgo en costos: ser la corredora más barata.", cat: "financiera", ef: { caja: 10, confianza: -5 }, flag: "estrategia:costos" },
      { id: "B", texto: "Diferenciación relacional: el apretón de manos como marca.", cat: "relacional", ef: { confianza: 12, caja: -5 }, flag: "estrategia:relacional" },
      { id: "C", texto: "Enfoque en nicho: especialistas en el productor mediano + tech.", cat: "tecnologica", ef: { adopcion: 8, motivacion: 5, caja: -5 }, flag: "estrategia:nicho" },
    ],
    concepto: "Estrategias genéricas (Porter) y política de negocios: el rumbo ordena todo lo demás.",
  },

  {
    id: "siempre",
    tema: "Cultura",
    clase: "C4",
    titulo: "Siempre se hizo así",
    personaje: { emoji: "🧔", nombre: "Don Raúl" },
    narrativa:
      "Los corredores históricos cierran negocios por teléfono y pasan los contratos «de palabra». El sistema de registro lleva 3 meses disponible: lo usan 2 personas. Don Raúl (25 años en la casa) te frena en el pasillo: «Pibe, acá los negocios se cierran mirando a los ojos, no con formularios».",
    opciones: [
      { id: "A", texto: "Decreto: uso obligatorio del sistema desde el lunes.", cat: "operativa", ef: { adopcion: 15, motivacion: -10 }, resist: 20 },
      {
        id: "B", texto: "Negociar: Don Raúl co-diseña el sistema y es su «padrino».", cat: "relacional",
        ef: { caja: -5 }, rel: "confianza",
        dado: {
          exito: { ef: { adopcion: 20, confianza: 10 }, resist: -15, flag: "padrino:si", nota: "Don Raúl se pone la camiseta. El ancla se vuelve catalizador: los demás lo siguen." },
          fracaso: { ef: { adopcion: 5 }, nota: "Don Raúl escuchó, pero no se comprometió. Avance tibio." },
          critico: { ef: { adopcion: 25, confianza: 15 }, resist: -20, flag: "padrino:si", nota: "Don Raúl no solo se pone la camiseta: arma él mismo la capacitación para los demás corredores. La oficina entera da vuelta la página." },
          pifia: { ef: { confianza: -10, motivacion: -8 }, resist: 10, nota: "«A mí no me vengas con teatro, pibe.» Don Raúl se siente usado para la foto. Lo perdiste — y los demás lo vieron." },
        },
      },
      { id: "C", texto: "Esperar a que la cultura madure sola.", cat: "cultural", ef: { motivacion: 5, adopcion: -10 } },
    ],
    concepto: "Resistencia política vs. social. Convertir un ancla cultural en catalizador del cambio (Schein).",
  },

  {
    id: "tribus",
    tema: "Subculturas",
    clase: "C4",
    titulo: "Dos tribus",
    narrativa:
      "Contrataste tres pibes de sistemas para sostener la transformación. A la semana, los corredores los bautizaron «los nintendo»; ellos responden con «los dinosaurios». En el último asado de la empresa comieron en mesas separadas. Dos subculturas bajo el mismo techo, y la grieta crece.",
    opciones: [
      { id: "A", texto: "Cada tribu en su sector. Que no se mezclen y listo.", cat: "operativa", ef: { adopcion: 5, confianza: -5 }, resist: 10, flag: "tribus:separadas" },
      {
        id: "B", texto: "Duplas cruzadas: cada corredor trabaja una semana con un dev.", cat: "cultural",
        ef: { caja: -5 }, rel: "motivacion",
        dado: {
          exito: { ef: { adopcion: 12, motivacion: 10, confianza: 5 }, resist: -10, flag: "tribus:integradas", nota: "Don Raúl descubre que «el pibe de sistemas» sabe de fútbol y de futuros. Cada tribu aprende el idioma de la otra." },
          fracaso: { ef: { motivacion: -5 }, nota: "Las duplas se sintieron forzadas. «Una semana perdida», gruñe Don Raúl. La grieta sigue." },
          critico: { ef: { adopcion: 18, motivacion: 14, confianza: 8 }, resist: -15, flag: "tribus:integradas", nota: "La dupla Don Raúl–Tomi termina cerrando un negocio juntos: el corredor pone el cliente, el pibe arma el tablero. La oficina aplaude." },
          pifia: { ef: { motivacion: -10, confianza: -5 }, resist: 8, nota: "La semana termina en un cruce a los gritos en la cocina. «Dinosaurios» contra «nintendos», segundo round. Peor que antes." },
        },
      },
      { id: "C", texto: "Un proyecto con objetivo común: la primera «cosecha digital».", cat: "tecnologica", ef: { motivacion: 6, adopcion: 6, caja: -10 }, flag: "tribus:proyecto" },
    ],
    concepto: "Subculturas (Schein): operadores, ingenieros, directivos. La integración no se decreta: se diseña.",
  },

  {
    id: "cambiamos",
    tema: "Cambio",
    clase: "C5",
    titulo: "¿Cómo cambiamos?",
    narrativa:
      "Llegó el momento de elegir CÓMO se transforma AgroSur. ¿Movés primero la cultura y el liderazgo, o los sistemas y procesos? Y la pregunta incómoda: ¿documentamos los procesos críticos ahora, mientras hay tiempo?",
    opciones: [
      { id: "A", texto: "Transformacional: visión, liderazgo y cultura primero. Y documentar.", cat: "cultural", ef: { motivacion: 10, adopcion: 8, caja: -10 }, flag: "enfoque:transformacional|documentado:si" },
      { id: "B", texto: "Transaccional: sistemas e incentivos rápido. Documentar después.", cat: "tecnologica", ef: { adopcion: 15, motivacion: -5 }, flag: "enfoque:transaccional|documentado:no" },
      {
        id: "C", texto: "Cambio participativo co-construido con el equipo.", cat: "cultural",
        ef: { caja: -5 }, rel: "motivacion", flag: "documentado:si",
        dado: {
          exito: { ef: { adopcion: 15, motivacion: 10, confianza: 8 }, flag: "enfoque:transformacional", nota: "El equipo se apropia del cambio. Documentan ellos mismos lo que saben." },
          fracaso: { ef: { adopcion: 5 }, flag: "enfoque:transaccional", nota: "Las reuniones se diluyeron. Quedó la intención, no el método." },
        },
      },
    ],
    concepto: "Burke & Litwin: cambio transformacional (cultura/liderazgo) vs. transaccional (sistemas/procesos).",
  },

  {
    id: "error",
    tema: "Estructura",
    clase: "C6",
    titulo: "El error millonario",
    narrativa:
      "Un contrato de 3.000 toneladas se transmitió de palabra entre Comercial y Logística. El camión fue a San Lorenzo; el buque esperaba en Bahía Blanca. Cliente furioso y nadie sabe de quién era la responsabilidad. Los silos se acusan entre sí.",
    opciones: [
      {
        id: "A", texto: "Reestructurar: células transversales por proceso.", cat: "operativa",
        ef: { caja: -15 }, rel: "adopcion",
        dado: {
          exito: { ef: { adopcion: 15, confianza: 10 }, flag: "celulas:si", nota: "Las células rompen los silos. El conocimiento empieza a circular: «Se va el que sabía» pierde fuerza." },
          fracaso: { ef: { motivacion: -5 }, nota: "Confusión de doble mando: nadie sabe a quién reporta. La reestructura genera fricción." },
          critico: { ef: { adopcion: 20, confianza: 14, motivacion: 6 }, flag: "celulas:si", nota: "Las células funcionan tan bien que un cliente pregunta «¿qué cambiaron?». El proceso manda y el organigrama acompaña." },
          pifia: { ef: { motivacion: -10, caja: -5 }, nota: "Doble mando, triple confusión: dos células se pelean por el mismo contrato y el cliente lo nota. Carísimo aprendizaje." },
        },
      },
      { id: "B", texto: "Mantener funcional + roles de enlace entre áreas.", cat: "operativa", ef: { caja: -5, confianza: 5 } },
      { id: "C", texto: "Buscar un culpable y sancionarlo. Que aprendan.", cat: "cultural", ef: { motivacion: -15, confianza: -5 }, resist: 15, flag: "culpable:si" },
    ],
    concepto: "Los problemas son sistémicos (C1). Estructura y coordinación transversal (C6); síntoma vs. causa (C8).",
  },

  {
    id: "renuncias",
    tema: "Diseño de puestos",
    clase: "C7",
    titulo: "La ola de renuncias",
    narrativa:
      "Tras la salida del referente, el área de Contratos se vacía: dos renuncias en una semana. Los que quedan están sobrecargados y miran la puerta. Hay que rediseñar el trabajo, no solo tapar agujeros.",
    opciones: [
      { id: "A", texto: "Rotación de puestos: que todos aprendan todo.", cat: "operativa", ef: { adopcion: 6, motivacion: 5, caja: -5 } },
      { id: "B", texto: "Enriquecimiento del puesto: autonomía, variedad y sentido.", cat: "cultural", ef: { motivacion: 15, confianza: 5, caja: -5 }, flag: "enriquecimiento:si" },
      { id: "C", texto: "Contratar más gente, rápido, para frenar la sangría.", cat: "financiera", ef: { caja: -15, motivacion: -5, confianza: 5 } },
    ],
    concepto: "Diseño de puestos: rotación, enriquecimiento y Calidad de Vida Laboral vs. burnout (C7).",
  },

  {
    id: "appmovil",
    tema: "Gestión del cambio",
    clase: "C5",
    titulo: "AgroSur Móvil renace",
    narrativa:
      "La app que la gestión anterior pagó carísima junta polvo: 7 descargas, y 2 son tuyas. El directorio pregunta qué pensás hacer con «esa inversión». Relanzarla en serio… o enterrarla con honores.",
    opciones: [
      {
        id: "A", texto: "Relanzarla con los productores como co-diseñadores. Beta con Don Ernesto incluido.", cat: "tecnologica",
        ef: { caja: -10 }, rel: "adopcion",
        dado: {
          exito: { ef: { adopcion: 15, confianza: 10 }, flag: "app:relanzada", nota: "Don Ernesto manda capturas al grupo: «hasta yo la uso». Los usuarios de la beta se vuelven evangelistas." },
          fracaso: { ef: { adopcion: 4, caja: -5 }, nota: "Quedó a mitad de camino: linda demo, pocos usuarios reales." },
          critico: { ef: { adopcion: 22, confianza: 14, motivacion: 6 }, flag: "app:relanzada", nota: "La beta explota: en dos semanas hay lista de espera y los productores se la recomiendan entre ellos. La app dejó de ser «esa inversión»." },
          pifia: { ef: { caja: -10, adopcion: -5 }, nota: "El relanzamiento se cae en vivo, delante del directorio. «¿Para esto pagamos dos veces?»" },
        },
      },
      { id: "B", texto: "Enterrarla y volver al Excel que todos conocen.", cat: "operativa", ef: { caja: 5, adopcion: -10, motivacion: 4 }, flag: "app:enterrada" },
      { id: "C", texto: "Uso obligatorio: la pagamos, se usa.", cat: "arriesgada", ef: { adopcion: 10, confianza: -8, motivacion: -6 }, resist: 10 },
    ],
    concepto: "Tecnología sin gestión del cambio es gasto, no inversión: la adopción se construye con usuarios, no con decretos (C5).",
  },

  {
    id: "denuncia",
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
      { id: "A", texto: "Autocrático: lo resolvés vos solo, rápido y sin ruido.", cat: "arriesgada", ef: { caja: 5, confianza: -5, motivacion: -5 }, resist: 10 },
      {
        id: "B", texto: "Consultivo: aplicás los 5 Porqués para hallar la causa raíz.", cat: "relacional",
        ef: { caja: -5 }, rel: "confianza",
        dado: {
          exito: { ef: { confianza: 15, adopcion: 10 }, flag: "raiz:si", nota: "Los 5 Porqués revelan que el problema era el proceso, no la persona. Lo arreglás de raíz." },
          fracaso: { ef: { confianza: 3 }, nota: "El análisis fue apurado. Calmaste a Don Ernesto, pero la causa sigue ahí." },
        },
      },
      { id: "C", texto: "Participativo: equipo y cliente resuelven juntos a la vista de todos.", cat: "cultural", ef: { confianza: 12, motivacion: 8, caja: -10 } },
    ],
    concepto: "Estilos de toma de decisiones (autocrático→participativo) y causa raíz vs. síntoma (C8).",
  },

  // ---- balance: SIEMPRE es la carta de cierre (no entra al random) ----
  {
    id: "balance",
    tema: "Cierre",
    clase: "Integración",
    titulo: "Balance anual",
    narrativa:
      "Fin del ejercicio. La asamblea espera tu última decisión de legado: ¿en qué estado dejás a AgroSur para quien venga después? Es la foto final de la empresa que construiste.",
    opciones: [
      { id: "A", texto: "Reinvertir en la gente y consolidar el sistema.", cat: "cultural", ef: { motivacion: 6, adopcion: 6, caja: -5 }, flag: "legado:reinvertir" },
      { id: "B", texto: "Consolidar lo logrado y jugar seguro.", cat: "operativa", ef: { caja: 4 }, flag: "legado:consolidar" },
      { id: "C", texto: "Repartir dividendos y declarar la victoria.", cat: "financiera", ef: { caja: 12, motivacion: -6, confianza: -5 }, flag: "legado:dividendos" },
    ],
    concepto: "Integración: toda decisión organizacional es, también, una decisión sobre el futuro.",
  },

  // ============================================================
  // CARTAS UNIVERSALES NUEVAS
  // ============================================================

  {
    id: "creditoblando",
    tema: "Finanzas",
    clase: "C2",
    titulo: "Línea de crédito blanda",
    narrativa:
      "El banco con el que operás te ofrece una línea a tasa subsidiada por ser cliente histórico. Plata barata, pero plata que hay que devolver. El gerente de cuentas insiste: «aprovechá ahora que el cupo está».",
    opciones: [
      { id: "A", texto: "Tomarla entera y financiar capital de trabajo.", cat: "financiera", ef: { caja: 14, confianza: -4 }, resist: 5 },
      {
        id: "B", texto: "Tomar la mitad y destinarla a un proyecto de mejora.", cat: "operativa",
        ef: { caja: 4 }, rel: "caja",
        dado: {
          exito: { ef: { caja: 8, adopcion: 8, motivacion: 5 }, nota: "El crédito medido financia exactamente lo que faltaba. Rinde sin asfixiar." },
          fracaso: { ef: { caja: -4 }, nota: "El proyecto se demoró y la cuota ya empezó a correr. Apretado, pero manejable." },
        },
      },
      { id: "C", texto: "Rechazarla: no quiero deuda en un año incierto.", cat: "financiera", ef: { caja: -3, confianza: 6 } },
    ],
    concepto: "Apalancamiento: la deuda barata multiplica, pero también amplifica el riesgo del contexto.",
  },

  {
    id: "datospremium",
    tema: "Nuevos negocios",
    clase: "C3",
    titulo: "Vender los datos",
    narrativa:
      "Tu sistema acumula años de precios, rindes y operaciones de la zona. Un equipo propone empaquetarlo como informe de mercado pago. Hay valor en esos datos… si el sector confía en cómo los usás.",
    opciones: [
      {
        id: "A", texto: "Lanzar un servicio de inteligencia de mercado por suscripción.", cat: "tecnologica",
        ef: { caja: -8 }, rel: "adopcion",
        dado: {
          exito: { ef: { caja: 14, adopcion: 10, confianza: 5 }, nota: "El informe semanal se vuelve lectura obligada en la plaza. Nuevo ingreso recurrente." },
          fracaso: { ef: { caja: -6 }, nota: "Buen producto, mala tracción: pocos pagan por algo que «se consigue gratis preguntando»." },
          critico: { ef: { caja: 20, adopcion: 14, confianza: 8 }, nota: "El informe de AgroSur lo citan hasta en la radio agropecuaria. Te volviste referencia de datos." },
          pifia: { ef: { caja: -10, confianza: -8 }, nota: "Un cliente se siente expuesto: «¿estás vendiendo mis números?». Mal trago reputacional." },
        },
      },
      { id: "B", texto: "Usar los datos solo puertas adentro para asesorar mejor.", cat: "relacional", ef: { confianza: 8, adopcion: 4, caja: -3 } },
      { id: "C", texto: "Dejarlo: no es nuestro negocio.", cat: "operativa", ef: { caja: 2, motivacion: -3 } },
    ],
    concepto: "Los datos como activo estratégico. El nuevo negocio vale tanto como la confianza que lo sostiene.",
  },

  {
    id: "clienteancla",
    tema: "Porter",
    clase: "C2",
    titulo: "El cliente ancla",
    narrativa:
      "Tu cliente más grande —el 18% del volumen— pide condiciones especiales: comisión más baja y atención prioritaria, o se va con la competencia. Tenerlo te da escala; depender de él te ata las manos.",
    opciones: [
      { id: "A", texto: "Darle todo lo que pide. No puedo perder ese volumen.", cat: "financiera", ef: { caja: -10, confianza: 6 }, resist: 5 },
      {
        id: "B", texto: "Negociar un combo: algo de precio + servicio que la competencia no da.", cat: "relacional",
        ef: { caja: -4 }, rel: "confianza",
        dado: {
          exito: { ef: { confianza: 12, caja: 6, adopcion: 5 }, nota: "Se queda y encima firma a más plazo: valoró el servicio por encima de los dos centavos." },
          fracaso: { ef: { confianza: -6, caja: -5 }, nota: "Negoció duro y arrancó concesiones. Lo retenés, pero apretado." },
          critico: { ef: { confianza: 16, caja: 10, adopcion: 8 }, nota: "Tan conforme quedó que te recomienda con dos productores de su grupo. El ancla se volvió motor." },
          pifia: { ef: { caja: -14, confianza: -8 }, nota: "Se ofendió con la contraoferta y se fue igual, hablando mal por toda la plaza." },
        },
      },
      { id: "C", texto: "Dejarlo ir y diversificar la cartera con muchos chicos.", cat: "comercial", ef: { caja: -8, confianza: 4, motivacion: 5 } },
    ],
    concepto: "Poder de negociación del cliente (Porter): la concentración de cartera es escala y es riesgo a la vez.",
  },

  {
    id: "capacitacion",
    tema: "Desarrollo",
    clase: "C7",
    titulo: "Plan de capacitación",
    narrativa:
      "El equipo sabe vender, pero le cuesta el sistema nuevo. RR.HH. propone un plan de capacitación serio: horas, plata y a alguien que lo lleve adelante. Otros dicen que «se aprende sobre la marcha».",
    opciones: [
      { id: "A", texto: "Plan formal con horario protegido y un referente interno.", cat: "cultural", ef: { caja: -8, adopcion: 8, motivacion: 8 } },
      { id: "B", texto: "Tutoriales cortos y que cada uno avance a su ritmo.", cat: "operativa", ef: { adopcion: 6, caja: -2 } },
      {
        id: "C", texto: "Gamificar: ranking de adopción con premios para el equipo.", cat: "tecnologica",
        ef: { caja: -5 }, rel: "motivacion",
        dado: {
          exito: { ef: { adopcion: 12, motivacion: 10 }, nota: "El ranking prende: hasta Don Raúl quiere salir primero. La adopción se vuelve juego." },
          fracaso: { ef: { motivacion: -4 }, nota: "A algunos el ranking les pareció una pavada y se sintieron expuestos." },
        },
      },
    ],
    concepto: "Calidad de Vida Laboral y desarrollo: la capacitación es inversión en adopción, no costo.",
  },

  {
    id: "ciberataque",
    tema: "Contexto",
    clase: "C1",
    titulo: "Te encriptaron todo",
    narrativa:
      "Lunes 8 a.m.: una pantalla negra pide rescate en bitcoins. Un ransomware secuestró el sistema de operaciones. Los teléfonos arden, los clientes preguntan y el reloj corre.",
    opciones: [
      {
        id: "A", texto: "Activar el plan de contingencia y restaurar del backup.", cat: "tecnologica",
        ef: { caja: -6 }, rel: "adopcion",
        dado: {
          exito: { ef: { adopcion: 6, confianza: 6 }, nota: "Había backup y protocolo. En cuatro horas estabas operando. El equipo respira: «el sistema nos salvó»." },
          fracaso: { ef: { caja: -8, adopcion: -6 }, nota: "El backup era viejo y faltaban manuales. Dos días a pulmón para volver. Susto grande." },
          critico: { ef: { adopcion: 12, confianza: 10 }, nota: "Tan aceitado salió que un cliente ni se enteró del ataque. La inversión en sistemas demostró su valor." },
          pifia: { ef: { caja: -14, confianza: -8, adopcion: -8 }, nota: "Nadie sabía dónde estaban los backups. Medio día perdido y un cliente que vio todo el papelón." },
        },
      },
      { id: "B", texto: "Pagar el rescate y que esto se termine ya.", cat: "arriesgada", ef: { caja: -16, motivacion: -4 } },
      { id: "C", texto: "Operar en papel mientras se resuelve, sin pagar.", cat: "operativa", ef: { caja: -6, motivacion: -6, confianza: 3 } },
    ],
    concepto: "Variable no controlable + costo de no tener resiliencia: la contingencia se prepara antes, no durante.",
  },

  {
    id: "sustentable",
    tema: "Mercado",
    clase: "C3",
    titulo: "El sello verde",
    narrativa:
      "Compradores del exterior empiezan a exigir trazabilidad y huella de carbono. Certificar a tus productores abre mercados premium, pero cuesta plata, tiempo y convencer a gente que «hace 40 años produce igual».",
    opciones: [
      {
        id: "A", texto: "Liderar: armar un programa de trazabilidad para tus productores.", cat: "comercial",
        ef: { caja: -10 }, rel: "confianza",
        dado: {
          exito: { ef: { caja: 12, confianza: 10, adopcion: 8 }, nota: "Te volviste la corredora que abre la puerta a la exportación premium. Llegan productores nuevos por eso." },
          fracaso: { ef: { caja: -6, motivacion: -4 }, nota: "El programa avanzó lento: mucho papel, pocos convencidos. Quedó la semilla plantada." },
          critico: { ef: { caja: 18, confianza: 14, adopcion: 10 }, nota: "Un comprador europeo firma directo con tu cartera certificada. La plaza entera toma nota." },
          pifia: { ef: { caja: -12, confianza: -6 }, nota: "Prometiste certificación y no llegaste a tiempo: un embarque se cayó y el cliente lo recordó." },
        },
      },
      { id: "B", texto: "Esperar a que sea obligatorio y copiar al que lo haga bien.", cat: "operativa", ef: { caja: 3, adopcion: -3 } },
      { id: "C", texto: "Ofrecerlo solo a los clientes grandes que lo pidan.", cat: "comercial", ef: { caja: -4, confianza: 6 } },
    ],
    concepto: "Tendencias del entorno (Porter/C2): anticiparse a un cambio de mercado puede volverse ventaja competitiva.",
  },

  // ============================================================
  // CARTAS EXCLUSIVAS POR ARQUETIPO (soloArq) — sólo en individual
  // ============================================================

  // --- La Tradicional ---
  {
    id: "ex_herencia", soloArq: ["tradicional"],
    tema: "Relaciones",
    clase: "C4",
    titulo: "El cliente de toda la vida",
    narrativa:
      "Don Aldo operó con tu abuelo, con tu viejo y ahora con vos. Tiene 78 años, no quiere saber nada de apps y mueve un volumen que respetás. «Mientras vos me atiendas como siempre, yo te sigo», te dice tomando un café.",
    opciones: [
      { id: "A", texto: "Atenderlo como siempre, a mano, sin pedirle nada nuevo.", cat: "relacional", ef: { confianza: 10, adopcion: -4 } },
      {
        id: "B", texto: "Mandarle al nieto, que sí usa la app, como puente.", cat: "relacional",
        ef: { caja: -3 }, rel: "confianza",
        dado: {
          exito: { ef: { confianza: 12, adopcion: 12 }, nota: "El nieto carga, Don Aldo firma. Lo mejor de los dos mundos: relación intacta, datos en el sistema." },
          fracaso: { ef: { confianza: 4 }, nota: "Don Aldo lo tomó con cariño pero el nieto aparece poco. Avance parcial." },
          critico: { ef: { confianza: 16, adopcion: 16, motivacion: 5 }, nota: "Don Aldo termina mostrándole la app a otros productores de su edad: «mirá, no muerde». Sos leyenda." },
          pifia: { ef: { confianza: -8 }, nota: "Don Aldo se sintió «tercerizado» y lo dijo fuerte en el club. La confianza acusó el golpe." },
        },
      },
      { id: "C", texto: "Aprovechar su cariño para empujarle el sistema de una.", cat: "arriesgada", ef: { adopcion: 6, confianza: -10 }, resist: 6 },
    ],
    concepto: "El capital relacional es el activo de la Tradicional: se cuida y se transmite, no se fuerza.",
  },
  {
    id: "ex_moderniza", soloArq: ["tradicional"],
    tema: "Cambio",
    clase: "C5",
    titulo: "Modernizar sin traicionar",
    narrativa:
      "La junta de socios mayores te observa con la ceja levantada cada vez que decís «digitalizar». Para ellos, el alma de AgroSur es la palabra empeñada. Tu desafío: avanzar sin que sientan que rematás la tradición.",
    opciones: [
      { id: "A", texto: "Vestir lo nuevo con lo viejo: «el sistema cuida tu palabra».", cat: "cultural", ef: { adopcion: 8, confianza: 8, caja: -5 } },
      { id: "B", texto: "Ir despacio: un proceso por trimestre, sin sobresaltos.", cat: "operativa", ef: { adopcion: 5, motivacion: 4 } },
      {
        id: "C", texto: "Mostrarles números de la fintech para meter urgencia.", cat: "comercial",
        ef: { caja: -3 }, rel: "confianza",
        dado: {
          exito: { ef: { adopcion: 12, motivacion: 6 }, nota: "El miedo a quedar afuera los movió. «Bueno, pibe, pero con cuidado.» Luz verde con condiciones." },
          fracaso: { ef: { confianza: -6 }, nota: "Lo vivieron como un reto y se cerraron más. «Nosotros sabemos lo que hacemos.»" },
        },
      },
    ],
    concepto: "Gestión del cambio en cultura fuerte: traducir lo nuevo al lenguaje de los valores existentes.",
  },

  // --- La Endeudada ---
  {
    id: "ex_refinanciar", soloArq: ["endeudada"],
    tema: "Finanzas",
    clase: "C3",
    titulo: "Refinanciar la deuda",
    narrativa:
      "El vencimiento gordo está a la vuelta y la caja no llega. El banco ofrece refinanciar: más plazo, más interés, y una cláusula que te ata. Hay que decidir con quién y cómo encarar la mochila.",
    opciones: [
      {
        id: "A", texto: "Sentarte a negociar quita y plazo, cara a cara.", cat: "financiera",
        ef: { caja: -3 }, rel: "caja",
        dado: {
          exito: { ef: { caja: 16, confianza: 5 }, nota: "Conseguiste quita y aire. El gerente del banco valoró que dieras la cara. Respirás." },
          fracaso: { ef: { caja: -6 }, nota: "Refinanciaste, pero a tasa cara. Pateaste el problema sin resolverlo." },
          critico: { ef: { caja: 24, confianza: 8 }, nota: "Negociación maestra: quita, plazo largo y sin cláusulas leoninas. Te sacaste la soga del cuello." },
          pifia: { ef: { caja: -12, motivacion: -5 }, nota: "El banco endureció todo y firmaste contra reloj. Quedaste más atado que antes." },
        },
      },
      { id: "B", texto: "Vender cartera de cobranza para hacer caja ya.", cat: "financiera", ef: { caja: 12, confianza: -6 } },
      { id: "C", texto: "Apretar gastos al hueso y pagar como sea.", cat: "operativa", ef: { caja: 6, motivacion: -10 } },
    ],
    concepto: "Reestructuración financiera: ganar tiempo sin hipotecar el futuro es el arte de la empresa apretada.",
  },
  {
    id: "ex_vender_activo", soloArq: ["endeudada"],
    tema: "Decisión estratégica",
    clase: "C8",
    titulo: "Vender el galpón",
    narrativa:
      "Tenés un galpón sobre la ruta que no usás casi. Venderlo te haría una caja enorme de golpe, pero es patrimonio histórico de la familia y el directorio lo mira con culpa. Plata urgente vs. respaldo.",
    opciones: [
      { id: "A", texto: "Venderlo y sanear el balance de una vez.", cat: "financiera", ef: { caja: 18, confianza: -6, motivacion: -4 } },
      {
        id: "B", texto: "Alquilarlo: ingreso mensual sin desprenderte.", cat: "arriesgada",
        ef: { caja: -2 }, rel: "caja",
        dado: {
          exito: { ef: { caja: 12, motivacion: 4 }, nota: "Apareció un inquilino serio a buen precio. Ingreso fijo sin perder el ladrillo." },
          fracaso: { ef: { caja: -4 }, nota: "El galpón quedó vacío meses y los gastos siguen. La apuesta no arrancó." },
        },
      },
      { id: "C", texto: "No tocarlo: es el último respaldo si todo se complica.", cat: "operativa", ef: { caja: -4, confianza: 6 } },
    ],
    concepto: "Liquidez vs. respaldo patrimonial: vender el activo resuelve hoy y desarma la red de mañana.",
  },

  // --- La Tecnócrata ---
  {
    id: "ex_legacy", soloArq: ["tecnocrata"],
    tema: "Estructura",
    clase: "C6",
    titulo: "El sistema que nadie quería",
    narrativa:
      "Heredaste un ERP carísimo, potente y odiado. Tiene de todo, pero es tan complejo que la gente lo esquiva y vuelve al Excel. La inversión ya está hecha: el problema no es el fierro, es el uso.",
    opciones: [
      {
        id: "A", texto: "Simplificarlo: esconder el 80% y dejar solo lo que usan.", cat: "tecnologica",
        ef: { caja: -8 }, rel: "adopcion",
        dado: {
          exito: { ef: { adopcion: 16, confianza: 8 }, nota: "Con tres botones y nada más, la gente al fin lo usa. La adopción despega de verdad." },
          fracaso: { ef: { adopcion: 4 }, nota: "Lo simplificaste pero la desconfianza quedó. «Otra vez tocaron el sistema.»" },
          critico: { ef: { adopcion: 22, confianza: 12, motivacion: 6 }, nota: "Quedó tan simple que los corredores lo prefieren al Excel. Ganaste la guerra de adopción." },
          pifia: { ef: { adopcion: -8, caja: -6 }, nota: "Al recortar funciones rompiste algo que sí usaban en Liquidaciones. Quejas por todos lados." },
        },
      },
      { id: "B", texto: "Capacitar fuerte sobre el sistema completo.", cat: "operativa", ef: { caja: -6, adopcion: 6, motivacion: -3 } },
      { id: "C", texto: "Reconocer el error: migrar a algo más simple y barato.", cat: "financiera", ef: { caja: -12, adopcion: 8, confianza: 6 } },
    ],
    concepto: "Adopción > funcionalidad: el mejor sistema es el que la gente efectivamente usa.",
  },
  {
    id: "ex_datosintuicion", soloArq: ["tecnocrata"],
    tema: "Toma de decisiones",
    clase: "C8",
    titulo: "Datos contra intuición",
    narrativa:
      "Tu tablero recomienda no operar con un productor por riesgo de mora. Pero Don Raúl mete la mano en el fuego por él: «lo conozco hace 20 años, va a pagar». El algoritmo dice una cosa, el olfato otra.",
    opciones: [
      { id: "A", texto: "Seguir el dato: el sistema está para algo.", cat: "tecnologica", ef: { adopcion: 8, confianza: -8 } },
      {
        id: "B", texto: "Cruzar ambos: usar el dato como alerta, no como veredicto.", cat: "relacional",
        ef: { caja: -2 }, rel: "confianza",
        dado: {
          exito: { ef: { confianza: 12, adopcion: 10 }, nota: "Pediste garantía extra y operaste. Pagó. El dato afinó el olfato en vez de reemplazarlo." },
          fracaso: { ef: { confianza: -4 }, nota: "Quedó la sensación de que dudaste de la palabra de Don Raúl. Frío pero prudente." },
        },
      },
      { id: "C", texto: "Confiar en el olfato de Don Raúl y operar igual.", cat: "arriesgada", ef: { confianza: 8, adopcion: -6, caja: -4 } },
    ],
    concepto: "Decisión basada en datos vs. juicio experto: la madurez es combinarlos, no idolatrar uno.",
  },

  // --- La Quemada ---
  {
    id: "ex_sabatico", soloArq: ["quemada"],
    tema: "Diseño de puestos",
    clase: "C7",
    titulo: "El equipo fundido",
    narrativa:
      "Tu mejor analista te manda un mensaje a las 23:40 un domingo. No es una buena señal. El equipo viene a mil hace meses y la nafta se acabó: errores tontos, caras largas, gente que mira la puerta.",
    opciones: [
      { id: "A", texto: "Frenar todo una semana: pausa real para recargar.", cat: "cultural", ef: { caja: -6, motivacion: 16, adopcion: -3 } },
      {
        id: "B", texto: "Redistribuir la carga y sumar una mano part-time.", cat: "operativa",
        ef: { caja: -5 }, rel: "motivacion",
        dado: {
          exito: { ef: { motivacion: 12, confianza: 5 }, nota: "El aire entra: con la carga repartida, el equipo vuelve a levantar la cabeza." },
          fracaso: { ef: { motivacion: -3 }, nota: "El refuerzo tardó en sumar y la sobrecarga siguió unas semanas más." },
        },
      },
      { id: "C", texto: "Apretar los dientes: «aguantemos hasta cerrar la campaña».", cat: "arriesgada", ef: { caja: 4, motivacion: -12 } },
    ],
    concepto: "Burnout: la motivación es un recurso que se agota; ignorarla sale más caro que cuidarla.",
  },
  {
    id: "ex_lidervuelve", soloArq: ["quemada"],
    tema: "Liderazgo",
    clase: "C4",
    titulo: "El líder que renace",
    narrativa:
      "Vero supo prender al equipo, pero la última etapa la apagó. Sigue, pero en piloto automático. Si volvés a encender a Vero, encendés a media oficina con ella. El cómo importa.",
    opciones: [
      {
        id: "A", texto: "Darle un proyecto propio con autonomía real.", cat: "relacional",
        ef: { caja: -4 }, rel: "motivacion",
        dado: {
          exito: { ef: { motivacion: 16, confianza: 8, adopcion: 6 }, nota: "Vero se reengancha y arrastra al equipo. La oficina recupera el pulso." },
          fracaso: { ef: { motivacion: -4 }, nota: "El proyecto no terminó de prenderla. Se ve interés, falta chispa." },
          critico: { ef: { motivacion: 22, confianza: 12, adopcion: 8 }, nota: "Vero vuelve a ser la de antes y forma a dos más a su imagen. Liderazgo que se multiplica." },
          pifia: { ef: { motivacion: -8, confianza: -4 }, nota: "Le quedó grande en el peor momento y se frustró más. Tiro por la culata." },
        },
      },
      { id: "B", texto: "Charla honesta y un plan de carrera concreto.", cat: "cultural", ef: { motivacion: 8, confianza: 4, caja: -2 } },
      { id: "C", texto: "Subirle el sueldo y listo, que se motive sola.", cat: "financiera", ef: { caja: -8, motivacion: 4 } },
    ],
    concepto: "Liderazgo transformacional: reactivar a un referente reactiva al sistema que lo rodea.",
  },

  // --- La Estrella ---
  {
    id: "ex_complacencia", soloArq: ["estrella"],
    tema: "Estrategia",
    clase: "C3",
    titulo: "La trampa de la complacencia",
    narrativa:
      "Todo anda bien. Demasiado bien. Los números cierran, el clima es bueno y nadie quiere mover nada. Pero «sólo los paranoicos sobreviven»: el mejor momento para incomodarse es justo cuando no hace falta.",
    opciones: [
      {
        id: "A", texto: "Abrir un frente nuevo aunque hoy no lo necesites.", cat: "comercial",
        ef: { caja: -8 }, rel: "adopcion",
        dado: {
          exito: { ef: { caja: 14, adopcion: 10, motivacion: 8 }, nota: "El frente nuevo agarra viento de cola. Te adelantaste al ciclo y el equipo lo siente." },
          fracaso: { ef: { caja: -6 }, nota: "La apuesta no prendió rápido, pero mantuvo al equipo despierto y aprendiendo." },
          critico: { ef: { caja: 20, adopcion: 14, motivacion: 10 }, nota: "Lo nuevo se vuelve tu segundo motor justo cuando el primero empieza a aflojar. Visión pura." },
          pifia: { ef: { caja: -12, motivacion: -5 }, nota: "Te dispersaste y descuidaste lo que andaba. «¿Para qué tocamos lo que funcionaba?»" },
        },
      },
      { id: "B", texto: "Auditar todo en busca de grietas invisibles.", cat: "operativa", ef: { caja: -4, adopcion: 6, confianza: 4 } },
      { id: "C", texto: "Disfrutar el buen momento y no arriesgar nada.", cat: "financiera", ef: { caja: 8, motivacion: -6 } },
    ],
    concepto: "«Only the paranoid survive» (Grove): la complacencia es el riesgo que no aparece en ningún tablero.",
  },
  {
    id: "ex_corona", soloArq: ["estrella"],
    tema: "Competencia",
    clase: "C2",
    titulo: "Defender la corona",
    narrativa:
      "Sos la corredora líder de la plaza y todos te apuntan. Un competidor agresivo empieza a robar cuentas con precios de guerra. Defender el trono cuesta; perderlo, más.",
    opciones: [
      { id: "A", texto: "Igualar precios y aguantar la guerra con tu espalda.", cat: "financiera", ef: { caja: -12, confianza: 6 } },
      {
        id: "B", texto: "No pelear por precio: subir la vara de servicio y datos.", cat: "comercial",
        ef: { caja: -5 }, rel: "confianza",
        dado: {
          exito: { ef: { confianza: 12, adopcion: 8, caja: 6 }, nota: "Los clientes valoran lo que el barato no da. La guerra de precios te resbala." },
          fracaso: { ef: { confianza: -4, caja: -4 }, nota: "Algunos igual se tentaron con el precio. Perdiste un par, no la cartera." },
          critico: { ef: { confianza: 16, adopcion: 12, caja: 10 }, nota: "Tu jugada de valor deja al competidor compitiendo solo. Reafirmaste el liderazgo sin malvender." },
          pifia: { ef: { confianza: -10, caja: -8 }, nota: "Te confiaste y se te fueron tres cuentas grandes al precio bajo. El trono tembló." },
        },
      },
      { id: "C", texto: "Comprar al competidor chico antes de que crezca.", cat: "arriesgada", ef: { caja: -16, adopcion: 6, confianza: 4 } },
    ],
    concepto: "Rivalidad competitiva (Porter): defender el liderazgo por valor sostiene mejor que la guerra de precios.",
  },

  // --- La Disruptiva ---
  {
    id: "ex_rondainversion", soloArq: ["disruptiva"],
    tema: "Finanzas",
    clase: "C3",
    titulo: "La ronda de inversión",
    narrativa:
      "Un fondo de venture agro pone una oferta: capital fuerte para crecer rápido, a cambio de una porción de la empresa y la presión de escalar «ya». Quemar caja para crecer es tu juego, pero el reloj del inversor no perdona.",
    opciones: [
      {
        id: "A", texto: "Tomar la ronda y pisar el acelerador a fondo.", cat: "arriesgada",
        ef: { caja: 16 }, rel: "adopcion",
        dado: {
          exito: { ef: { adopcion: 14, caja: 6, motivacion: 8 }, nota: "El capital se traduce en producto y usuarios. Crecés a una velocidad que asusta (del bueno)." },
          fracaso: { ef: { caja: -8, motivacion: -6 }, nota: "Creciste en gastos antes que en ingresos. El inversor empieza a impacientarse." },
          critico: { ef: { adopcion: 20, caja: 12, motivacion: 12 }, nota: "Hockey stick: la adopción se dispara y el fondo ya habla de la próxima ronda. Estás volando." },
          pifia: { ef: { caja: -14, confianza: -6, motivacion: -8 }, nota: "Escalaste un producto que no estaba listo. Churn, quejas y un board nervioso." },
        },
      },
      { id: "B", texto: "Tomar la mitad y crecer con más control.", cat: "financiera", ef: { caja: 8, adopcion: 6 } },
      { id: "C", texto: "Rechazar: crecer con tu propia caja, despacio pero tuyo.", cat: "comercial", ef: { caja: -4, confianza: 8, motivacion: 5 } },
    ],
    concepto: "Capital de riesgo: el combustible acelera, pero también la presión por resultados. Velocidad vs. control.",
  },
  {
    id: "ex_desconfianza", soloArq: ["disruptiva"],
    tema: "Cultura del sector",
    clase: "C4",
    titulo: "«¿Y estos quiénes son?»",
    narrativa:
      "Tenés la mejor app del agro y a nadie del campo le importa todavía. Los productores tradicionales te miran de reojo: «software lindo, pero ¿saben de soja?». Sin su confianza, tu fierro no opera nada.",
    opciones: [
      {
        id: "A", texto: "Sumar un corredor histórico respetado como socio/cara visible.", cat: "relacional",
        ef: { caja: -8 }, rel: "confianza",
        dado: {
          exito: { ef: { confianza: 16, adopcion: 8 }, nota: "El veterano te presta su reputación y abre puertas que el código no abría. La plaza empieza a creer." },
          fracaso: { ef: { confianza: 2, caja: -4 }, nota: "El veterano ayudó, pero el sector sigue cauto. La confianza se gana de a poco." },
          critico: { ef: { confianza: 22, adopcion: 12, motivacion: 6 }, nota: "Tu socio histórico te lleva a cada reunión: «estos pibes son serios». El campo te adopta." },
          pifia: { ef: { confianza: -8, caja: -6 }, nota: "El veterano y tu cultura startup chocaron feo. Se fue dando un portazo y habló mal." },
        },
      },
      { id: "B", texto: "Bajar al barro: recorrer campos y tomar mate, sin laptop.", cat: "relacional", ef: { caja: -6, confianza: 10, adopcion: -3 } },
      { id: "C", texto: "Insistir con la tecnología: «cuando vean los números, vienen».", cat: "tecnologica", ef: { adopcion: 8, confianza: -8 } },
    ],
    concepto: "Confianza como licencia para operar: en el agro, la mejor tecnología no compra la credibilidad del vínculo.",
  },

  // ============================================================
  // CARTAS UNIVERSALES POR CATEGORÍA (módulos en src/pool/)
  // ============================================================
  ...CARTAS_TECNOLOGIA,
  ...CARTAS_RELACIONES,
  ...CARTAS_FINANZAS,
  ...CARTAS_OPERACIONES,
  ...CARTAS_CULTURA,
  ...CARTAS_COMERCIAL,
  ...CARTAS_RIESGO,
];

export const POOL_BY_ID = Object.fromEntries(POOL.map((c) => [c.id, c]));
