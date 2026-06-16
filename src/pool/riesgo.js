export const CARTAS_RIESGO = [
  {
    id: "rie_1",
    tema: "Apuesta",
    clase: "C8",
    titulo: "Posición sin cubrir",
    narrativa:
      "Don Raúl olfatea que la soja va a saltar y propone tomar una posición fuerte sin cobertura. Si pega, levantamos el mes; si no, comemos margin call.",
    opciones: [
      {
        id: "A",
        texto: "Vamos al toque: posición abierta y a bancarla.",
        cat: "arriesgada",
        ef: { caja: -6 },
        rel: "caja",
        dado: {
          exito: { ef: { caja: 20, motivacion: 8 }, nota: "El mercado nos dio la razón." },
          fracaso: { ef: { caja: -12, motivacion: -5 }, nota: "Entró el margin call." },
          critico: { ef: { caja: 30, motivacion: 12, confianza: 6 }, nota: "Saltó el doble seis: jugada redonda." },
          pifia: { ef: { caja: -18, motivacion: -8 }, nota: "Doble uno: nos limpió el mercado." },
        },
      },
      {
        id: "B",
        texto: "Cerramos con futuros y dormimos tranquilos.",
        cat: "financiera",
        ef: { caja: 4, motivacion: -3 },
        resist: 8,
      },
      {
        id: "C",
        texto: "Marta llama a tres clientes y arma un calce a medias.",
        cat: "comercial",
        ef: { caja: -3, confianza: 6 },
      },
    ],
    concepto: "Apostar sin cobertura es elegir techo alto y piso de barro: el riesgo no se evita, se administra.",
  },
  {
    id: "rie_2",
    tema: "Apuesta",
    clase: "C8",
    titulo: "Camión adelantado",
    narrativa:
      "Aparece un lote grande de maíz a precio de remate, pero hay que pagarlo hoy y vender la semana que viene. Vero dice que es plata que no tenemos.",
    opciones: [
      {
        id: "A",
        texto: "Lo agarramos todo y rezamos por el clima.",
        cat: "arriesgada",
        ef: { caja: -6 },
        rel: "caja",
        dado: {
          exito: { ef: { caja: 18, motivacion: 7 }, nota: "Lo colocamos con buen spread." },
          fracaso: { ef: { caja: -10, motivacion: -5 }, nota: "Bajó el precio y quedamos pagados." },
          critico: { ef: { caja: 27, motivacion: 11, confianza: 6 }, nota: "Doble seis: lo vendimos en alza." },
          pifia: { ef: { caja: -16, motivacion: -8 }, nota: "Doble uno: se desplomó y comimos todo." },
        },
      },
      {
        id: "B",
        texto: "Tomamos solo la mitad y descartamos el resto.",
        cat: "operativa",
        ef: { caja: 3, motivacion: -2 },
        resist: 6,
      },
      {
        id: "C",
        texto: "Don Ernesto consigue un socio que ponga la otra parte.",
        cat: "relacional",
        ef: { caja: -4, confianza: 7 },
      },
    ],
    concepto: "Comprar barato sin red de venta es una apuesta: lo barato sale caro si el mercado se da vuelta.",
  },
  {
    id: "rie_3",
    tema: "Apuesta",
    clase: "C8",
    titulo: "Mercado nuevo",
    narrativa:
      "Un exportador ofrece un contrato gordo de poroto especial que nunca operamos. Es saltar a otra cancha o quedarnos donde sabemos pisar.",
    opciones: [
      {
        id: "A",
        texto: "Firmamos el contrato grande y aprendemos en la marcha.",
        cat: "arriesgada",
        ef: { caja: -6 },
        rel: "confianza",
        dado: {
          exito: { ef: { caja: 16, confianza: 8 }, nota: "Cumplimos y nos abrió una vidriera." },
          fracaso: { ef: { caja: -9, confianza: -6 }, nota: "Fallamos la calidad y nos castigaron." },
          critico: { ef: { caja: 24, confianza: 12, motivacion: 8 }, nota: "Doble seis: cliente nuevo de lujo." },
          pifia: { ef: { caja: -15, confianza: -10 }, nota: "Doble uno: nos rebotaron el embarque." },
        },
      },
      {
        id: "B",
        texto: "Seguimos con los granos de siempre, sin sobresaltos.",
        cat: "operativa",
        ef: { caja: 4, motivacion: -3 },
        resist: 7,
      },
      {
        id: "C",
        texto: "Vero arma un piloto chico para probar calidad primero.",
        cat: "tecnologica",
        ef: { caja: -4, adopcion: 6 },
      },
    ],
    concepto: "Entrar a un mercado que no conocés es una apuesta de reputación: el upside abre puertas, el downside las cierra.",
  },
  {
    id: "rie_4",
    tema: "Apuesta",
    clase: "C8",
    titulo: "Crecer en la sequía",
    narrativa:
      "Plena seca y la competencia se achica. Don Raúl quiere ir al all-in: tomar oficina, gente y clientes que están sueltos en la plaza.",
    opciones: [
      {
        id: "A",
        texto: "All-in: nos plantamos grandes mientras todos se cuidan.",
        cat: "arriesgada",
        ef: { caja: -6 },
        rel: "motivacion",
        dado: {
          exito: { ef: { caja: 17, motivacion: 9 }, nota: "Salimos de la seca el doble de fuertes." },
          fracaso: { ef: { caja: -11, motivacion: -6 }, nota: "Cargamos costos y no entró volumen." },
          critico: { ef: { caja: 26, motivacion: 13, confianza: 6 }, nota: "Doble seis: quedamos líderes de plaza." },
          pifia: { ef: { caja: -20, motivacion: -9 }, nota: "Doble uno: nos comió la estructura." },
        },
      },
      {
        id: "B",
        texto: "Apretamos el cinturón y aguantamos el chaparrón.",
        cat: "financiera",
        ef: { caja: 5, motivacion: -3 },
        resist: 9,
      },
      {
        id: "C",
        texto: "Marta cultiva los clientes fieles y siembra para después.",
        cat: "relacional",
        ef: { caja: -4, confianza: 7 },
      },
    ],
    concepto: "Crecer en la crisis es la apuesta clásica: timing perfecto te corona, mal cálculo te funde.",
  },
];
