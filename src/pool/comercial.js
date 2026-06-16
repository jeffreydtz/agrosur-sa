export const CARTAS_COMERCIAL = [
  {
    id: "com_1",
    tema: "Comercial",
    clase: "C2",
    titulo: "El cliente que se nos va",
    narrativa:
      "Don Ernesto, el productor más grande de Carcarañá, amenaza con vender directo a la aceitera. Si se va, otros lo siguen.",
    opciones: [
      {
        id: "A",
        texto: "Mejorarle la comisión y atarlo con contrato anual.",
        cat: "comercial",
        ef: { caja: -6, confianza: 8, adopcion: 4 },
        resist: 8,
      },
      {
        id: "B",
        texto: "Financiarle el flete hasta el puerto de Rosario.",
        cat: "financiera",
        ef: { caja: -10, confianza: 6 },
      },
      {
        id: "C",
        texto: "Plantarse y dejarlo ir; no negociamos bajo presión.",
        cat: "arriesgada",
        ef: { caja: 4 },
        rel: "confianza",
        dado: {
          exito: {
            ef: { caja: 10, confianza: 8 },
            nota: "Volvió solo: la aceitera lo trató peor.",
          },
          fracaso: {
            ef: { caja: -8, confianza: -4 },
            nota: "Se fue y arrastró a dos vecinos.",
          },
        },
      },
    ],
    concepto:
      "El poder de negociación del comprador (Porter) sube cuando el cliente concentra volumen.",
  },
  {
    id: "com_2",
    tema: "Comercial",
    clase: "C2",
    titulo: "Llega una corredora nueva",
    narrativa:
      "Una corredora porteña abre oficina a la vuelta y sale a romper precios. Marta propone responder antes de perder cartera.",
    opciones: [
      {
        id: "A",
        texto: "Igualar el precio y defender cada cuenta a muerte.",
        cat: "comercial",
        ef: { caja: -8, confianza: 5, adopcion: 3 },
      },
      {
        id: "B",
        texto: "Diferenciarnos con servicio: análisis de calidad gratis.",
        cat: "operativa",
        ef: { caja: -5, confianza: 4, adopcion: 6 },
        resist: 10,
      },
      {
        id: "C",
        texto: "Apostar fuerte a una campaña de marca en la zona.",
        cat: "arriesgada",
        ef: { caja: -7 },
        rel: "adopcion",
        dado: {
          exito: {
            ef: { caja: 12, confianza: 8, adopcion: 8 },
            nota: "El nombre AgroSur pesa: los productores eligen confianza.",
          },
          fracaso: {
            ef: { caja: -6, adopcion: -3 },
            nota: "Mucho ruido, pocas firmas nuevas.",
          },
          critico: {
            ef: { caja: 18, confianza: 12, adopcion: 11 },
            nota: "Excepcional (doble 6): nos volvimos referencia regional.",
          },
          pifia: {
            ef: { caja: -12, confianza: -6 },
            nota: "Desastre (doble 1): gastamos de más y nadie se enteró.",
          },
        },
      },
    ],
    concepto:
      "Frente a un nuevo competidor, diferenciarse suele rendir más que la guerra de precios.",
  },
  {
    id: "com_3",
    tema: "Comercial",
    clase: "C2",
    titulo: "Saltar al sur santafesino",
    narrativa:
      "Vero detecta lechería y maíz desatendidos en Venado Tuerto. Abrir plaza nueva tienta, pero estira la estructura.",
    opciones: [
      {
        id: "A",
        texto: "Abrir una sucursal chica con un corredor local.",
        cat: "comercial",
        ef: { caja: -12, confianza: 6, adopcion: 5 },
        flag: "expansion_sur",
      },
      {
        id: "B",
        texto: "Tantear la zona con un acopiador aliado, sin fierros.",
        cat: "relacional",
        ef: { caja: -3, confianza: 4, adopcion: 3 },
      },
      {
        id: "C",
        texto: "Mandar a Vero a romper el mercado a pura rueda.",
        cat: "arriesgada",
        ef: { caja: -6, motivacion: 4 },
        rel: "adopcion",
        dado: {
          exito: {
            ef: { caja: 13, confianza: 9, adopcion: 9 },
            nota: "Cerró tres acopios grandes en una semana.",
          },
          fracaso: {
            ef: { caja: -7, motivacion: -4 },
            nota: "La plaza es cerrada; cuesta entrar de afuera.",
          },
        },
      },
    ],
    concepto:
      "Expandirse a un segmento nuevo exige medir el costo de la estructura contra el potencial real.",
  },
  {
    id: "com_4",
    tema: "Comercial",
    clase: "C2",
    titulo: "Posicionar o abaratar",
    narrativa:
      "Don Raúl quiere bajar comisiones para ganar volumen; Marta insiste en venderse como la corredora premium del cordón.",
    opciones: [
      {
        id: "A",
        texto: "Bajar comisión y pelear por volumen masivo.",
        cat: "financiera",
        ef: { caja: 6, confianza: -3, adopcion: 5 },
      },
      {
        id: "B",
        texto: "Subir el listón: servicio premium y comisión firme.",
        cat: "comercial",
        ef: { caja: 4, confianza: 8 },
        resist: 12,
      },
      {
        id: "C",
        texto: "Segmentar: premium para grandes, low-cost para chicos.",
        cat: "cultural",
        ef: { caja: -4, motivacion: 3 },
        rel: "confianza",
        dado: {
          exito: {
            ef: { caja: 14, confianza: 10, adopcion: 7 },
            nota: "Cada productor encontró su traje a medida.",
          },
          fracaso: {
            ef: { caja: -6, confianza: -4 },
            nota: "El equipo se mareó con dos discursos a la vez.",
          },
          critico: {
            ef: { caja: 20, confianza: 14, adopcion: 9 },
            nota: "Excepcional (doble 6): dominamos ambas puntas del mercado.",
          },
          pifia: {
            ef: { caja: -11, confianza: -7 },
            nota: "Desastre (doble 1): nadie entendió qué somos.",
          },
        },
      },
    ],
    concepto:
      "El posicionamiento define a quién servís; querer ser todo para todos suele diluir la marca.",
  },
];
