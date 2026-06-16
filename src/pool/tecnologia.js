// ============================================================
// pool/tecnologia.js — Cartas de decisión: TECNOLOGÍA
// Sistemas · datos · automatización · IA · plataformas ·
// ciberseguridad · integraciones.
// Cartas universales (sin soloArq, sin ronda).
// ============================================================

export const CARTAS_TECNOLOGIA = [
  {
    id: "tec_1",
    tema: "Tecnología",
    clase: "C5",
    titulo: "La nube o el servidor",
    narrativa:
      "El servidor que aguanta toda la operatoria de granos vive en un placard al lado de la cocina, recalentándose cada vez que arranca el aire. Marta avisa que si se quema, perdemos los contratos de la campaña entera.",
    opciones: [
      { id: "A", texto: "Migrar todo a la nube, con backups automáticos.", cat: "tecnologica", ef: { adopcion: 12, caja: -10 } },
      { id: "B", texto: "Comprar un servidor nuevo y dejarlo en la oficina.", cat: "operativa", ef: { caja: -8, confianza: 4 } },
      {
        id: "C", texto: "Contratar un consultor para diseñar la migración bien hecha.", cat: "arriesgada",
        ef: { caja: -6 }, rel: "adopcion",
        dado: {
          exito: { ef: { adopcion: 16, confianza: 8 }, nota: "El consultor migra sin caídas y deja todo documentado. La oficina ni se enteró del cambio." },
          fracaso: { ef: { adopcion: 4 }, nota: "La migración funciona, pero a medias: quedaron planillas viejas conviviendo con la nube." },
          critico: { ef: { adopcion: 22, confianza: 12, motivacion: 5 }, nota: "Doble seis: además de migrar, el consultor automatiza los backups y capacita al equipo. Nunca más un placard recalentado." },
          pifia: { ef: { caja: -12, confianza: -6 }, nota: "Doble uno: la migración se cae a mitad de campaña y se pierden contratos. El consultor desaparece sin atender el teléfono." },
        },
      },
    ],
    concepto: "La infraestructura crítica no se improvisa: la continuidad operativa depende de decisiones de arquitectura, no de la suerte.",
  },

  {
    id: "tec_2",
    tema: "Tecnología",
    clase: "C5",
    titulo: "Los datos sueltos",
    narrativa:
      "Cada corredor tiene su propio Excel con los precios y posiciones de sus clientes. Don Raúl jura que el suyo «es el bueno», pero los números nunca cierran entre planillas y el directorio pide un solo tablero confiable.",
    opciones: [
      { id: "A", texto: "Imponer un único sistema central de carga de datos.", cat: "operativa", ef: { adopcion: 14, motivacion: -8 }, resist: 12 },
      { id: "B", texto: "Armar un tablero que integre todos los Excel existentes.", cat: "tecnologica", ef: { adopcion: 9, caja: -6 } },
      {
        id: "C", texto: "Sentar a los corredores a definir juntos qué dato es la verdad.", cat: "cultural",
        ef: { caja: -4 }, rel: "confianza",
        dado: {
          exito: { ef: { confianza: 14, adopcion: 10 }, nota: "Acuerdan reglas comunes y hasta Don Raúl carga en el sistema. Por primera vez los números cierran." },
          fracaso: { ef: { confianza: 4 }, nota: "La reunión ayuda, pero cada uno sigue confiando más en su propia planilla." },
        },
      },
    ],
    concepto: "Una sola fuente de verdad vale más por el acuerdo humano que la sostiene que por la herramienta que la guarda.",
  },

  {
    id: "tec_3",
    tema: "Tecnología",
    clase: "C5",
    titulo: "La IA que pronostica",
    narrativa:
      "Un proveedor ofrece un modelo de IA que predice el precio de la soja en Rosario con dos semanas de anticipación. Don Ernesto, cliente de toda la vida, pregunta desconfiado si ahora «la máquina» le va a decir cuándo vender.",
    opciones: [
      { id: "A", texto: "Usar la IA como una opinión más, junto a la del corredor.", cat: "tecnologica", ef: { adopcion: 11, confianza: 6 } },
      { id: "B", texto: "Rechazarla: el olfato del corredor no se reemplaza.", cat: "relacional", ef: { confianza: 8, adopcion: -6 } },
      {
        id: "C", texto: "Pilotear el modelo en una campaña con clientes que se animen.", cat: "arriesgada",
        ef: { caja: -7 }, rel: "adopcion",
        dado: {
          exito: { ef: { adopcion: 18, confianza: 8 }, nota: "El modelo acierta el momento de vender y Don Ernesto cuenta a todos que «la máquina lo bancó»." },
          fracaso: { ef: { adopcion: 5 }, nota: "El pronóstico falla un par de veces; sirve de referencia pero nadie le suelta la mano todavía." },
          critico: { ef: { adopcion: 24, confianza: 12, motivacion: 6 }, nota: "Doble seis: el modelo anticipa una suba fuerte y los clientes del piloto ganan plata. Hay lista de espera para entrar." },
          pifia: { ef: { caja: -10, confianza: -8 }, nota: "Doble uno: la IA recomienda vender justo antes de una suba histórica. Don Ernesto pierde plata y la bronca corre por toda la región." },
        },
      },
    ],
    concepto: "La IA agrega valor cuando asiste al criterio humano, no cuando pretende reemplazar la confianza construida en años.",
  },

  {
    id: "tec_4",
    tema: "Tecnología",
    clase: "C5",
    titulo: "El mail trucho",
    narrativa:
      "Llega un correo idéntico al de un cliente pidiendo cambiar la cuenta donde depositar el pago de una venta de trigo. Vero lo frena de casualidad, pero queda claro que un ciberataque puede vaciar la caja en un clic.",
    opciones: [
      { id: "A", texto: "Implementar doble verificación para todo cambio de cuenta.", cat: "tecnologica", ef: { adopcion: 10, caja: -5 } },
      { id: "B", texto: "Mandar una circular pidiendo «más atención» y seguir igual.", cat: "operativa", ef: { confianza: -4, caja: 3 }, resist: 6 },
      {
        id: "C", texto: "Contratar una auditoría de seguridad y simular un ataque real.", cat: "financiera",
        ef: { caja: -8 }, rel: "confianza",
        dado: {
          exito: { ef: { confianza: 16, adopcion: 8 }, nota: "La simulación destapa tres agujeros y los cierran. Los clientes valoran que AgroSur cuide su plata." },
          fracaso: { ef: { confianza: 5 }, nota: "La auditoría encuentra poco nuevo, pero deja al equipo más alerta que antes." },
        },
      },
    ],
    concepto: "La ciberseguridad es un costo invisible hasta que falla: prevenir sale infinitamente más barato que un solo fraude consumado.",
  },

  {
    id: "tec_5",
    tema: "Tecnología",
    clase: "C5",
    titulo: "Conectar la balanza",
    narrativa:
      "La balanza de la planta, el sistema de la bolsa y la facturación viven en mundos aparte; alguien copia los pesos a mano y a veces se equivoca un cero. Marta sueña con que todo hable solo, sin volver a tipear.",
    opciones: [
      { id: "A", texto: "Integrar balanza, bolsa y facturación con una API.", cat: "tecnologica", ef: { adopcion: 13, caja: -9 } },
      { id: "B", texto: "Dejar la carga manual pero con doble control de un segundo.", cat: "operativa", ef: { confianza: 5, motivacion: -4 } },
      {
        id: "C", texto: "Hacer un piloto de integración en una sola sucursal.", cat: "arriesgada",
        ef: { caja: -6 }, rel: "adopcion",
        dado: {
          exito: { ef: { adopcion: 17, motivacion: 8 }, nota: "El piloto elimina el tipeo y los errores de cero. El equipo pide replicarlo en todas las plantas." },
          fracaso: { ef: { adopcion: 5 }, nota: "La integración anda a tirones: la balanza vieja no siempre responde y hay que cargar a mano igual." },
          critico: { ef: { adopcion: 22, confianza: 10, motivacion: 6 }, nota: "Doble seis: la integración no solo elimina errores, sino que acorta el tiempo de descarga. Los camioneros lo notan y se corre la voz." },
          pifia: { ef: { caja: -10, confianza: -5 }, nota: "Doble uno: la API mal configurada factura pesos cambiados durante un día entero. Hay que rehacer remitos y pedir disculpas a media región." },
        },
      },
    ],
    concepto: "Integrar sistemas elimina el error humano repetido, pero la integración mal hecha lo multiplica: hay que pilotear antes de escalar.",
  },
];
