export const CARTAS_RELACIONES = [
  {
    id: "rel_1",
    tema: "Relaciones",
    clase: "C4",
    titulo: "El apretón de Don Ernesto",
    narrativa:
      "Don Ernesto, cliente desde los tiempos de tu viejo, vino a cerrar la soja con un apretón de manos, sin contrato firmado. El mercado se movió en contra y ahora perdés plata si le respetás el precio de palabra.",
    opciones: [
      {
        id: "A",
        texto: "Respetar la palabra: el precio acordado es sagrado, aunque duela la caja.",
        cat: "relacional",
        ef: { confianza: 12, caja: -9 },
      },
      {
        id: "B",
        texto: "Renegociar el número mostrándole la pizarra del día.",
        cat: "comercial",
        ef: { caja: 5, confianza: -4 },
      },
      {
        id: "C",
        texto: "Proponerle partir la diferencia y firmar de acá en más todo por escrito.",
        cat: "operativa",
        ef: { caja: -3 },
        rel: "confianza",
        dado: {
          exito: {
            ef: { confianza: 14, motivacion: 5 },
            nota: "Don Ernesto valoró la honestidad y aceptó formalizar; quedó como cliente para otra década.",
          },
          fracaso: {
            ef: { confianza: 2 },
            nota: "Aceptó a regañadientes el reparto, pero el papelerío le pareció desconfianza.",
          },
        },
      },
    ],
    concepto:
      "La palabra empeñada construye reputación, pero formalizar a tiempo protege el vínculo cuando el mercado se da vuelta.",
  },
  {
    id: "rel_2",
    tema: "Relaciones",
    clase: "C4",
    titulo: "El proveedor que falla",
    narrativa:
      "El camionero de confianza te dejó plantado dos cargas seguidas y un cliente grande amenaza con irse a otra corredora. Don Raúl te dice que con el flete no se jode, que es la sangre del negocio.",
    opciones: [
      {
        id: "A",
        texto: "Cortar con el transportista y contratar una flota nueva, más cara pero seria.",
        cat: "financiera",
        ef: { caja: -8, confianza: 4 },
      },
      {
        id: "B",
        texto: "Llamarlo, escuchar qué le pasó y darle una última chance con cláusula de penalidad.",
        cat: "relacional",
        ef: { confianza: 6, caja: -2 },
        rel: "confianza",
        dado: {
          exito: {
            ef: { confianza: 13, caja: 4 },
            nota: "Estaba con la madre internada; arregló todo y ahora te prioriza las cargas.",
          },
          fracaso: {
            ef: { confianza: -3 },
            nota: "Prometió pero volvió a fallar; perdiste tiempo y casi al cliente.",
          },
          critico: {
            ef: { confianza: 18, motivacion: 6 },
            nota: "No solo se recompuso: te consiguió dos camiones más para la temporada pico.",
          },
          pifia: {
            ef: { confianza: -11, caja: -6 },
            nota: "Desapareció con un adelanto y dejó dos clientes sin descargar. Un desastre.",
          },
        },
      },
      {
        id: "C",
        texto: "Imponerle por contrato horarios y multas, sí o sí, sin charla previa.",
        cat: "operativa",
        ef: { caja: 3, confianza: -3 },
        resist: 10,
      },
    ],
    concepto:
      "Antes de cortar un vínculo de años conviene entender qué falló: a veces la lealtad bien administrada rinde más que un proveedor nuevo.",
  },
  {
    id: "rel_3",
    tema: "Relaciones",
    clase: "C4",
    titulo: "Reseña filosa en el grupo",
    narrativa:
      "Un productor enojado escribió en el grupo de WhatsApp de la zona que AgroSur S.A. \"liquida tarde y no atiende el teléfono\". Marta te avisa que ya lo leyeron treinta chacareros antes del mate de la mañana.",
    opciones: [
      {
        id: "A",
        texto: "Llamarlo personalmente, escuchar el reclamo y resolverle la liquidación hoy mismo.",
        cat: "relacional",
        ef: { confianza: 9, caja: -3 },
        rel: "confianza",
        dado: {
          exito: {
            ef: { confianza: 15, adopcion: 5 },
            nota: "Lo solucionaste tan rápido que él mismo escribió un mensaje retractándose.",
          },
          fracaso: {
            ef: { confianza: 1 },
            nota: "Aceptó la disculpa pero borró nada; quedó la duda flotando en el grupo.",
          },
          critico: {
            ef: { confianza: 21, motivacion: 7 },
            nota: "Quedó tan conforme que te recomendó a tres vecinos en el mismo grupo.",
          },
          pifia: {
            ef: { confianza: -12, motivacion: -5 },
            nota: "Te calentaste, le contestaste mal por escrito y la captura voló por toda la zona.",
          },
        },
      },
      {
        id: "B",
        texto: "Responder público en el grupo con los tiempos reales de transferencia.",
        cat: "comercial",
        ef: { confianza: 3, caja: 2 },
      },
      {
        id: "C",
        texto: "Montar un canal de avisos automáticos de liquidación para todos los clientes.",
        cat: "tecnologica",
        ef: { caja: -6, adopcion: 7 },
      },
    ],
    concepto:
      "La reputación en el campo viaja por el boca a boca y el grupo del pueblo: atender rápido un reclamo vale más que cualquier descargo.",
  },
  {
    id: "rel_4",
    tema: "Relaciones",
    clase: "C4",
    titulo: "El cliente que paga tarde",
    narrativa:
      "Un cliente importante te debe tres comisiones y siempre estira el pago \"hasta la próxima cosecha\". Vero, de administración, ya no sabe cómo cerrar el mes con ese agujero en la caja.",
    opciones: [
      {
        id: "A",
        texto: "Frenarle nuevas operaciones hasta que regularice la deuda.",
        cat: "financiera",
        ef: { caja: 7, confianza: -6 },
        resist: 8,
      },
      {
        id: "B",
        texto: "Sentarte a tomar un mate y armarle un plan de pagos realista.",
        cat: "relacional",
        ef: { confianza: 7, caja: -2 },
        rel: "confianza",
        dado: {
          exito: {
            ef: { confianza: 12, caja: 6 },
            nota: "Cumplió el plan al pie y agradeció no haberlo expuesto; te quedó cliente fiel.",
          },
          fracaso: {
            ef: { confianza: 2, caja: -4 },
            nota: "Firmó el plan pero arrancó atrasándose; seguís corriendo de atrás la plata.",
          },
        },
      },
      {
        id: "C",
        texto: "Cobrarle un interés por mora cargado en la próxima comisión.",
        cat: "comercial",
        ef: { caja: 5, confianza: -3 },
      },
    ],
    concepto:
      "La morosidad se administra cuidando el vínculo: un plan de pagos conserva al cliente; el apriete seco suele perderlo.",
  },
  {
    id: "rel_5",
    tema: "Relaciones",
    clase: "C4",
    titulo: "Asado de fin de cosecha",
    narrativa:
      "Cerró una campaña dura y dudás si gastar en juntar a los clientes y proveedores en un asado a la vera del Paraná. Don Raúl jura que en esos fuegos se firman los mejores negocios del año siguiente.",
    opciones: [
      {
        id: "A",
        texto: "Organizar el asado a lo grande, con todos los vínculos de la corredora.",
        cat: "cultural",
        ef: { caja: -8, confianza: 8 },
        rel: "confianza",
        dado: {
          exito: {
            ef: { confianza: 16, adopcion: 6 },
            nota: "Entre el chori y el vino se cerraron acuerdos de palabra para toda la campaña que viene.",
          },
          fracaso: {
            ef: { confianza: 4, caja: -3 },
            nota: "Linda junta, pero vino poca gente y el gasto pesó más que el rédito.",
          },
          critico: {
            ef: { confianza: 22, motivacion: 8 },
            nota: "El asado se hizo leyenda en la zona; ahora todos quieren operar con AgroSur S.A.",
          },
          pifia: {
            ef: { confianza: -10, caja: -6 },
            nota: "Se mezclaron dos clientes enemistados, hubo escándalo y el chisme corrió feo.",
          },
        },
      },
      {
        id: "B",
        texto: "Ahorrar la plata y mandar un saludo formal de fin de campaña.",
        cat: "financiera",
        ef: { caja: 4, confianza: -2 },
      },
      {
        id: "C",
        texto: "Hacer un encuentro chico solo con los tres clientes fundacionales.",
        cat: "relacional",
        ef: { caja: -3, confianza: 5 },
      },
    ],
    concepto:
      "Los vínculos del agro se cultivan fuera de la oficina: una mesa compartida abre negocios que ningún contrato logra solo.",
  },
];
