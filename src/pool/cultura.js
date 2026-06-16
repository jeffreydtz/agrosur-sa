export const CARTAS_CULTURA = [
  {
    id: "cul_1",
    tema: "Cultura",
    clase: "C4",
    titulo: "El mate de las siete",
    narrativa:
      "Don Raúl arma la corredora a la vieja usanza: rueda de mate a las siete y cada uno cuenta cómo viene la cosecha. Los pibes nuevos llegan con auriculares y ni saludan.",
    opciones: [
      {
        id: "A",
        texto: "Imponés el ritual del mate para todos, sí o sí.",
        cat: "cultural",
        ef: { motivacion: 6, confianza: 8 },
        resist: 7,
      },
      {
        id: "B",
        texto: "Dejás que cada equipo arme su propio cable a tierra.",
        cat: "operativa",
        ef: { adopcion: 5, motivacion: 4, confianza: -3 },
      },
      {
        id: "C",
        texto: "Sentás a viejos y nuevos a charlar sin libreto.",
        cat: "relacional",
        ef: { caja: -3 },
        rel: "motivacion",
        dado: {
          exito: {
            ef: { motivacion: 14, confianza: 7 },
            nota: "Se mezclaron y enganchó la rueda.",
          },
          fracaso: {
            ef: { motivacion: -3 },
            nota: "Quedó la charla forzada, nadie aflojó.",
          },
          critico: {
            ef: { motivacion: 20, confianza: 11, adopcion: 6 },
            nota: "Nació un equipo de verdad (doble 6).",
          },
          pifia: {
            ef: { motivacion: -9, confianza: -6 },
            nota: "Saltó el choque generacional (doble 1).",
          },
        },
      },
    ],
    concepto:
      "Los rituales no se decretan: se construyen cruzando a la gente que los va a vivir.",
  },
  {
    id: "cul_2",
    tema: "Cultura",
    clase: "C4",
    titulo: "Soja vieja, sistema nuevo",
    narrativa:
      "Comprás un software de gestión de contratos, pero Marta y los corredores de años siguen anotando todo en el cuaderno Gloria. 'Así nunca nos equivocamos', te dicen.",
    opciones: [
      {
        id: "A",
        texto: "Capacitás dos tardes y bancás los errores de arranque.",
        cat: "cultural",
        ef: { caja: -7, adopcion: 10, motivacion: 4 },
      },
      {
        id: "B",
        texto: "Lo hacés obligatorio desde el lunes, sin red.",
        cat: "operativa",
        ef: { adopcion: 8, motivacion: -8, confianza: -4 },
        resist: 9,
      },
      {
        id: "C",
        texto: "Ponés a Marta de madrina del cambio.",
        cat: "relacional",
        ef: { caja: -4 },
        rel: "adopcion",
        dado: {
          exito: {
            ef: { adopcion: 13, motivacion: 8 },
            nota: "Marta arrastró a todo el piso.",
          },
          fracaso: {
            ef: { adopcion: 3, motivacion: -2 },
            nota: "Le costó, avanzó a media máquina.",
          },
        },
      },
    ],
    concepto:
      "La resistencia al cambio cede más con un referente interno que con un manual.",
  },
  {
    id: "cul_3",
    tema: "Cultura",
    clase: "C4",
    titulo: "Acopio contra Pizarra",
    narrativa:
      "El sector de acopio y el de mesa de operaciones se tiran la pelota cuando algo sale mal. Dos tribus en la misma corredora, cada una con su jerga y su rencor.",
    opciones: [
      {
        id: "A",
        texto: "Armás objetivos cruzados: ganan o pierden juntos.",
        cat: "cultural",
        ef: { motivacion: 9, adopcion: 6, caja: -3 },
      },
      {
        id: "B",
        texto: "Bancás al sector más fuerte y que el otro se adapte.",
        cat: "arriesgada",
        ef: { caja: 5, motivacion: -10, confianza: -6 },
      },
      {
        id: "C",
        texto: "Mandás a los dos jefes a destrabar el quilombo solos.",
        cat: "relacional",
        ef: { motivacion: 2 },
        rel: "confianza",
        dado: {
          exito: {
            ef: { confianza: 12, motivacion: 7 },
            nota: "Se sinceraron y bajaron la guardia.",
          },
          fracaso: {
            ef: { confianza: -5, motivacion: -3 },
            nota: "Volvieron peleados de la reunión.",
          },
          critico: {
            ef: { confianza: 17, motivacion: 10, adopcion: 5 },
            nota: "Se hicieron socios del proyecto (doble 6).",
          },
          pifia: {
            ef: { confianza: -11, motivacion: -8 },
            nota: "Escaló a guerra abierta (doble 1).",
          },
        },
      },
    ],
    concepto:
      "Las subculturas en guerra se alinean con incentivos compartidos, no con ganadores y perdedores.",
  },
  {
    id: "cul_4",
    tema: "Cultura",
    clase: "C4",
    titulo: "La renuncia de Vero",
    narrativa:
      "Vero, tu mejor analista de mercados, te pasa la renuncia: 'Acá nadie reconoce nada y el clima está pesado'. Si se va, se lleva medio know-how de la mesa.",
    opciones: [
      {
        id: "A",
        texto: "Le ofrecés más plata y un bono atado a resultados.",
        cat: "financiera",
        ef: { caja: -12, motivacion: 5 },
      },
      {
        id: "B",
        texto: "Le das voz: la sumás a decidir cómo se trabaja.",
        cat: "cultural",
        ef: { motivacion: 11, confianza: 7, caja: -2 },
      },
      {
        id: "C",
        texto: "Charla franca, sin promesas, a ver qué necesita.",
        cat: "relacional",
        ef: { caja: -1 },
        rel: "motivacion",
        dado: {
          exito: {
            ef: { motivacion: 15, confianza: 8 },
            nota: "Se quedó y volvió con pilas.",
          },
          fracaso: {
            ef: { motivacion: -6, confianza: -4 },
            nota: "Igual se fue, pero en buenos términos.",
          },
          critico: {
            ef: { motivacion: 21, confianza: 12, adopcion: 4 },
            nota: "Se quedó y se volvió referente (doble 6).",
          },
          pifia: {
            ef: { motivacion: -12, confianza: -7 },
            nota: "Se fue dolida y contagió al resto (doble 1).",
          },
        },
      },
    ],
    concepto:
      "El talento se retiene con reconocimiento y voz, no solo con un cheque más gordo.",
  },
  {
    id: "cul_5",
    tema: "Cultura",
    clase: "C4",
    titulo: "Don Ernesto no afloja",
    narrativa:
      "Don Ernesto, treinta años en la corredora, frena cada propuesta nueva con un 'esto siempre se hizo así'. La gente joven lo respeta, pero ya empieza a frustrarse.",
    opciones: [
      {
        id: "A",
        texto: "Lo nombrás mentor: que enseñe lo bueno del oficio.",
        cat: "cultural",
        ef: { motivacion: 8, confianza: 9, adopcion: -2 },
      },
      {
        id: "B",
        texto: "Lo corrés del medio y empujás el cambio sin él.",
        cat: "arriesgada",
        ef: { adopcion: 9, motivacion: -9, confianza: -7 },
        resist: 10,
      },
      {
        id: "C",
        texto: "Le pedís que lidere él la primera prueba piloto.",
        cat: "operativa",
        ef: { caja: -3 },
        rel: "adopcion",
        dado: {
          exito: {
            ef: { adopcion: 14, motivacion: 9, confianza: 6 },
            nota: "Se prendió y se convirtió en evangelista.",
          },
          fracaso: {
            ef: { adopcion: -2, motivacion: -4 },
            nota: "Hizo el trámite sin convicción.",
          },
        },
      },
    ],
    concepto:
      "Al que resiste, dale un rol en el cambio: la experiencia pasa de freno a motor.",
  },
];
