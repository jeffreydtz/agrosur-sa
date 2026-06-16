export const CARTAS_FINANZAS = [
  {
    id: "fin_1",
    tema: "Finanzas",
    clase: "C3",
    titulo: "El dólar se escapa",
    narrativa: "Don Raúl entra agitado: el blue saltó tres puntos antes del mediodía y hay cobranzas en pesos sin cerrar. La caja te mira y vos mirás la pizarra del Rosario.",
    opciones: [
      { id: "A", texto: "Dolarizar la caja hoy mismo, sin chistar.", cat: "financiera", ef: { caja: 10, confianza: -3 } },
      { id: "B", texto: "Apurar cobranzas pendientes con descuento.", cat: "comercial", ef: { caja: 6, adopcion: 4 }, resist: 8 },
      {
        id: "C", texto: "Bancarte la posición en pesos y esperar.", cat: "arriesgada",
        ef: { caja: -3 }, rel: "caja",
        dado: {
          exito:   { ef: { caja: 18, confianza: 5 }, nota: "El dólar planchó y ganaste el carry." },
          fracaso: { ef: { caja: -8 }, nota: "Siguió volando y comiste la diferencia." },
          critico: { ef: { caja: 26, confianza: 8 }, nota: "Tasa y tipo de cambio a favor: doble 6." },
          pifia:   { ef: { caja: -16, motivacion: -5 }, nota: "Corrida total, fundiste el mes." },
        },
      },
    ],
    concepto: "En el agro la moneda es soja, pero la caja se paga en pesos: cubrirse a tiempo no es timidez, es oficio.",
  },
  {
    id: "fin_2",
    tema: "Finanzas",
    clase: "C3",
    titulo: "Comisión o volumen",
    narrativa: "Un acopiador grande te ofrece todo su volumen si le bajás la comisión a la mitad. Marta hace números y la pizarra no cierra tan linda como suena.",
    opciones: [
      { id: "A", texto: "Mantener la comisión de siempre.", cat: "financiera", ef: { caja: 4, confianza: 4 } },
      { id: "B", texto: "Bajar comisión y ganar la cuenta entera.", cat: "comercial", ef: { caja: -2, adopcion: 8 }, flag: "cuentaGrande" },
      {
        id: "C", texto: "Comisión baja, pero con cláusula de exclusividad.", cat: "relacional",
        ef: { caja: -3 }, rel: "caja",
        dado: {
          exito:   { ef: { caja: 14, confianza: 6 }, nota: "Te trajo todo el volumen prometido." },
          fracaso: { ef: { caja: -6, confianza: -3 }, nota: "Cumplió a medias y te ató las manos." },
        },
      },
    ],
    concepto: "Comisión fina con volumen gordo puede rendir más que el revés, pero solo si el otro cumple lo pactado.",
  },
  {
    id: "fin_3",
    tema: "Finanzas",
    clase: "C3",
    titulo: "La deuda del banco",
    narrativa: "Vence la línea de descubierto y el banco te tienta con refinanciar a tasa cara. Don Ernesto, de la vieja escuela, dice que la deuda buena no existe.",
    opciones: [
      { id: "A", texto: "Cancelar con caja propia y quedar limpio.", cat: "financiera", ef: { caja: -10, confianza: 6 } },
      { id: "B", texto: "Refinanciar y conservar liquidez operativa.", cat: "operativa", ef: { caja: 8, motivacion: -3 }, resist: 10 },
      {
        id: "C", texto: "Negociar quita pateando el mostrador.", cat: "arriesgada",
        ef: { caja: -2 }, rel: "caja",
        dado: {
          exito:   { ef: { caja: 12, confianza: 4 }, nota: "El gerente aflojó y te bajó la tasa." },
          fracaso: { ef: { caja: -7, confianza: -4 }, nota: "Se ofendió y te cortó el crédito." },
          critico: { ef: { caja: 18, confianza: 7 }, nota: "Quita histórica: doble 6 en la mesa." },
          pifia:   { ef: { caja: -14, motivacion: -6 }, nota: "Te mandó a Veraz, un desastre." },
        },
      },
    ],
    concepto: "La deuda no es ni santa ni diabla: cuesta lo que cuesta el día que la caja no alcanza.",
  },
  {
    id: "fin_4",
    tema: "Finanzas",
    clase: "C3",
    titulo: "Invertir en la balanza",
    narrativa: "La balanza de camiones quedó vieja y se pierde plata en cada pesada. Vero propone una nueva con software; sale un platal pero promete márgenes más limpios.",
    opciones: [
      { id: "A", texto: "Comprar la balanza nueva con todo.", cat: "tecnologica", ef: { caja: -12, adopcion: 9 } },
      { id: "B", texto: "Calibrar la vieja y aguantar un año más.", cat: "financiera", ef: { caja: 3, confianza: -2 } },
      {
        id: "C", texto: "Leasing de la balanza, riesgo repartido.", cat: "arriesgada",
        ef: { caja: -5 }, rel: "caja",
        dado: {
          exito:   { ef: { caja: 16, adopcion: 6 }, nota: "Pesadas exactas, recuperaste margen." },
          fracaso: { ef: { caja: -9 }, nota: "Cuotas pesadas y poco volumen." },
        },
      },
    ],
    concepto: "Una inversión bien medida se paga sola; el problema es confundir el deseo con el repago.",
  },
  {
    id: "fin_5",
    tema: "Finanzas",
    clase: "C3",
    titulo: "Costos que carcomen",
    narrativa: "Cierra el trimestre y los costos fijos se comieron el margen como gorgojo en silo. Don Raúl quiere recortar gente; Marta dice que el problema son los fletes mal cotizados.",
    opciones: [
      { id: "A", texto: "Renegociar fletes y proveedores uno por uno.", cat: "operativa", ef: { caja: 7, adopcion: 4 }, resist: 7 },
      { id: "B", texto: "Recorte parejo de gastos administrativos.", cat: "financiera", ef: { caja: 9, motivacion: -6 } },
      {
        id: "C", texto: "Apostar a un sistema de costeo por cliente.", cat: "tecnologica",
        ef: { caja: -4 }, rel: "caja",
        dado: {
          exito:   { ef: { caja: 14, confianza: 5 }, nota: "Detectaste cuentas que perdían plata." },
          fracaso: { ef: { caja: -6, adopcion: -3 }, nota: "Mucho número y poca decisión." },
          critico: { ef: { caja: 22, confianza: 8 }, nota: "Rediseñaste el negocio: doble 6." },
          pifia:   { ef: { caja: -12, motivacion: -5 }, nota: "Parálisis por análisis, perdiste el trimestre." },
        },
      },
    ],
    concepto: "Bajar costos a ciegas duele dos veces; conocer dónde se va la plata es la mitad de la cobranza.",
  },
];
