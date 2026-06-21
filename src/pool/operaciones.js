export const CARTAS_OPERACIONES = [
  {
    id: "ope_1",
    tema: "Operaciones",
    clase: "C6",
    titulo: "El silo que no cierra",
    narrativa:
      "Don Raúl te avisa que el silo 3 viene con humedad alta y la balanza no concuerda con los remitos. La cosecha gruesa entra fuerte y los camiones se amontonan en la playa.",
    opciones: [
      {
        id: "A",
        texto: "Parar la descarga y recalibrar balanza con el calador.",
        cat: "operativa",
        ef: { caja: -5, confianza: 9 },
        resist: 8,
        offDado: {
          exito: { ef: { caja: -3, confianza: 13 }, nota: "Parar la playa molestó, pero la balanza prolija te ganó respeto en la zona." },
          fracaso: { ef: { confianza: -6, motivacion: -5 }, nota: "Frenaste la descarga en plena cosecha gruesa: bronca de camioneros y productores." },
        },
      },
      {
        id: "B",
        texto: "Seguir recibiendo y ajustar las diferencias en la liquidación.",
        cat: "financiera",
        ef: { caja: 7, confianza: -8, motivacion: -3 },
      },
      {
        id: "C",
        texto: "Sumar turno de secado nocturno con personal extra.",
        cat: "arriesgada",
        ef: { caja: -6 },
        rel: "adopcion",
        dado: {
          exito: {
            ef: { adopcion: 14, confianza: 7 },
            nota: "Grano en condiciones, productores conformes.",
          },
          fracaso: {
            ef: { motivacion: -5 },
            nota: "El turno rindió poco y se hizo tarde.",
          },
        },
      },
    ],
    concepto:
      "La calidad se mide en la balanza, no en la confianza: un proceso prolijo evita reclamos.",
  },
  {
    id: "ope_2",
    tema: "Operaciones",
    clase: "C6",
    titulo: "Papeles al día",
    narrativa:
      "Marta encuentra cartas de porte sin cerrar y CTGs vencidas en el cajón. Si llega una fiscalización de AFIP, la corredora queda expuesta.",
    opciones: [
      {
        id: "A",
        texto: "Digitalizar y ordenar toda la documentación con un sistema.",
        cat: "tecnologica",
        ef: { caja: -8, adopcion: 12, confianza: 6 },
        flag: "docs_digital",
      },
      {
        id: "B",
        texto: "Pedirle a Marta que regularice a mano antes del cierre.",
        cat: "operativa",
        ef: { motivacion: -6, confianza: 4 },
        resist: 6,
      },
      {
        id: "C",
        texto: "Tercerizar el control documental en un estudio contable.",
        cat: "relacional",
        ef: { caja: -5 },
        rel: "confianza",
        dado: {
          exito: {
            ef: { confianza: 12, motivacion: 5 },
            nota: "El estudio dejó todo impecable.",
          },
          fracaso: {
            ef: { caja: -4, motivacion: -4 },
            nota: "Cobraron de más y demoraron.",
          },
          critico: {
            ef: { confianza: 18, motivacion: 8, adopcion: 6 },
            nota: "Excepcional: además nos armaron tablero de vencimientos (doble 6).",
          },
          pifia: {
            ef: { motivacion: -10, caja: -6 },
            nota: "Desastre: traspapelaron remitos y hubo que rehacer todo (doble 1).",
          },
        },
      },
    ],
    concepto:
      "En el granero del país, los papeles ordenados valen tanto como la mercadería en el silo.",
  },
  {
    id: "ope_3",
    tema: "Operaciones",
    clase: "C6",
    titulo: "Logística trabada",
    narrativa:
      "Los camiones esperan ocho horas en cola hacia el puerto de Rosario y los fleteros amenazan con no volver. Cada hora parada es plata que se evapora.",
    opciones: [
      {
        id: "A",
        texto: "Implementar turnos de carga coordinados por WhatsApp con la terminal.",
        cat: "operativa",
        ef: { caja: -4, adopcion: 10, confianza: 5 },
        offDado: {
          exito: { ef: { adopcion: 14, confianza: 8 }, nota: "Los turnos por WhatsApp ordenaron la cola: los fleteros al fin saben cuándo venir." },
          fracaso: { ef: { adopcion: -5, motivacion: -4 }, nota: "Nadie respetó los turnos y el grupo de WhatsApp terminó en quilombo." },
        },
      },
      {
        id: "B",
        texto: "Pagar un plus a los fleteros para asegurar disponibilidad.",
        cat: "financiera",
        ef: { caja: -9, motivacion: 6 },
      },
      {
        id: "C",
        texto: "Probar un nuevo acopio satélite para descomprimir la playa.",
        cat: "arriesgada",
        ef: { caja: -7 },
        rel: "adopcion",
        dado: {
          exito: {
            ef: { adopcion: 16, confianza: 8 },
            nota: "El acopio satélite descargó la cola, fluye todo.",
          },
          fracaso: {
            ef: { motivacion: -5, caja: -3 },
            nota: "Quedó lejos y sumó flete corto.",
          },
          critico: {
            ef: { adopcion: 22, confianza: 12, motivacion: 7 },
            nota: "Excepcional: se volvió hub de la zona (doble 6).",
          },
          pifia: {
            ef: { motivacion: -10, caja: -8 },
            nota: "Desastre: caminos intransitables y mercadería varada (doble 1).",
          },
        },
      },
    ],
    concepto:
      "Coordinar la logística antes que pagar el apuro: el cuello de botella se resuelve con proceso, no con plata.",
  },
  {
    id: "ope_4",
    tema: "Operaciones",
    clase: "C6",
    titulo: "Áreas que no se hablan",
    narrativa:
      "Comercial cierra ventas que Operaciones no llega a entregar y Don Ernesto culpa a Vero por los faltantes. La falta de coordinación entre áreas está rompiendo entregas.",
    opciones: [
      {
        id: "A",
        texto: "Instaurar una reunión diaria corta entre comercial y operaciones.",
        cat: "cultural",
        ef: { motivacion: 8, confianza: 7, caja: -2 },
        offDado: {
          exito: { ef: { motivacion: 11, confianza: 10 }, nota: "La reunión corta destrabó todo: comercial y operaciones al fin hablan el mismo idioma." },
          fracaso: { ef: { motivacion: -6, caja: -3 }, nota: "La reunión se volvió catarsis: cada uno defendiendo su quinta, media hora perdida por día." },
        },
      },
      {
        id: "B",
        texto: "Frenar nuevas ventas hasta nivelar el stock comprometido.",
        cat: "operativa",
        ef: { caja: -8, confianza: 6 },
        resist: 10,
      },
      {
        id: "C",
        texto: "Armar un tablero compartido de stock y compromisos en tiempo real.",
        cat: "tecnologica",
        ef: { caja: -6 },
        rel: "adopcion",
        dado: {
          exito: {
            ef: { adopcion: 15, confianza: 9 },
            nota: "Cada área ve lo mismo, se acabaron las sorpresas.",
          },
          fracaso: {
            ef: { motivacion: -4 },
            nota: "Nadie lo cargaba y quedó desactualizado.",
          },
        },
      },
    ],
    concepto:
      "Sin coordinación entre áreas, la mejor venta termina en un faltante: la información compartida alinea a todos.",
  },
];
