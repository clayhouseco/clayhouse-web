/**
 * LAS PREGUNTAS QUE LLEGAN POR TELÉFONO, RESPONDIDAS EN LA PÁGINA.
 *
 * Estaban escritas en `cms/faqs.csv` y no se publicaban en ninguna parte: diez respuestas
 * que el equipo comercial repite cada semana, guardadas en un archivo que nadie lee.
 *
 * QUÉ SE CAMBIÓ AL TRAERLAS, Y POR QUÉ:
 *
 *  · La primera preguntaba por «el ladrillo F-PV», una referencia que el catálogo ya no
 *    tiene. La pregunta se reescribe sin nombrarla; la respuesta —que se fabrica bajo NTC
 *    4205— es la que el propio ERP publica en cada producto.
 *  · La del plazo de producción decía «entre 4 y 8 semanas». Gerencia confirmó que depende
 *    de la referencia y el volumen y que no quiere publicar un plazo de antemano, así que
 *    la respuesta dice lo que sí es cierto: que se confirma al cotizar.
 *  · Las cuatro promesas comerciales —muestras, piezas a medida, despacho nacional y
 *    asesoría— están confirmadas por gerencia (20 oct 2026) y se publican como estaban.
 *
 * NO LLEVAN DATOS ESTRUCTURADOS DE FAQ a propósito. Se publican porque responden algo que
 * la gente pregunta, no para pedirle a Google un resultado enriquecido.
 */
export interface Faq {
  pregunta: string;
  respuesta: string;
}

/** Técnicas: viven en las páginas de categoría, al lado de los productos. */
export const faqsTecnicas: Faq[] = [
  {
    pregunta: "¿Los ladrillos cumplen la norma NTC 4205?",
    respuesta:
      "Sí. Las referencias de fachada y mampostería se fabrican bajo los criterios de la NTC 4205-2 (dimensiones y tolerancias) y la NTC 4205-3 (propiedades físicas y mecánicas). La norma de cada referencia está en su ficha técnica, que se descarga desde la página del producto o desde Descargas.",
  },
  {
    pregunta: "¿Cuál es la absorción de agua?",
    respuesta:
      "Los valores por referencia están en cada ficha técnica. Para especificar una fachada, el equipo técnico puede orientarle según la exposición climática del proyecto.",
  },
  {
    pregunta: "¿Qué mortero y qué junta recomiendan?",
    respuesta:
      "Juntas uniformes de 10 mm (±3 mm) para fachada a la vista, mortero compatible con la absorción de la pieza y curado húmedo. El detalle constructivo está en el manual de fachadas.",
  },
];

/** Comerciales y de logística: viven en Contacto. */
export const faqsComerciales: Faq[] = [
  {
    pregunta: "¿Cuánto tarda un pedido?",
    respuesta:
      "Todo se produce bajo pedido, así que el plazo depende de la referencia, el volumen y el acabado. Se confirma al cotizar, junto con el precio y el flete.",
  },
  {
    pregunta: "¿Envían muestras físicas a estudios de arquitectura?",
    respuesta:
      "Sí. Preparamos cajas de muestra con las tonalidades seleccionadas y las enviamos a su oficina. Se piden desde el formulario de contacto.",
  },
  {
    pregunta: "¿Pueden fabricar piezas a medida?",
    respuesta:
      "Sí. Desarrollamos esquineros, dovelas, celosías y piezas según plano, bajo cotización de proyecto.",
  },
  {
    pregunta: "¿Atienden proyectos fuera de Antioquia?",
    respuesta:
      "Sí, despachamos a todo Colombia. Para exportación, escríbanos y coordinamos logística y cotización internacional.",
  },
  {
    pregunta: "¿Ofrecen asesoría técnica en obra?",
    respuesta:
      "Sí. El equipo apoya en especificación, detalles constructivos y coordinación con la interventoría cuando el proyecto lo requiere.",
  },
  {
    pregunta: "¿Cuál es el pedido mínimo?",
    respuesta:
      "Varía por referencia. Indique los metros cuadrados o las unidades en el formulario y le enviamos la cotización con el mínimo de esa referencia.",
  },
  {
    pregunta: "¿Dónde está el taller y se puede visitar?",
    respuesta:
      "En el km 2 de la vía Amagá – Angelópolis, Amagá, Antioquia. Las visitas son con cita previa, de lunes a viernes.",
  },
];
