/**
 * LO QUE LA FICHA TÉCNICA NO PUEDE SACAR DEL ERP.
 *
 * Los datos —medidas, peso, rendimiento, norma, colores y la tabla técnica— salen de
 * `erpFeed.json`, que baja del ERP. Acá queda solo lo que allá no vive:
 *
 *   · `features` y `usos` — textos de venta. «Excelente desempeño estructural» no se deduce de
 *     ningún dato: lo escribe alguien que sabe vender.
 *   · `foto` — la fotografía de marca, tomada con el protocolo y recortada.
 *   · `subtitulo` y `clasificacion` — cómo se titula la ficha, que no siempre es el nombre.
 *   · `orden` — en qué orden van las filas de la tabla técnica, que se agruparon con criterio.
 *   · `variants` — formatos de una misma página (macizo 6x12x24, rayados 10/12/15). Viven acá
 *     porque el ERP no los modela como formatos de un producto sino como productos aparte.
 *
 * Y ADEMÁS, LOS DATOS EN DISPUTA. Cuando un dato de acá NO coincide con el del ERP, queda
 * escrito abajo con una nota de qué dice el ERP. Se conserva el valor que hoy se publica: nadie
 * puede decidir desde un archivo cuál de los dos pesos es el verdadero. `npm run fichas:verificar`
 * los lista todos, para que no se queden ahí para siempre sin que nadie los mire.
 *
 * Un producto NUEVO no necesita nada de esto: su ficha se arma sola con lo que tenga el ERP, y
 * acá solo se le agregan sus textos de venta cuando alguien los escriba.
 *
 * GENERADO la primera vez partiendo el fichas.data.mjs que había; de aquí en adelante se edita
 * a mano. Tras cambiar algo:  node scripts/fichas/generate.mjs --only <slug>
 */

export const editorial = [
  {
    /* EN DISPUTA con el ERP (6):
       · dims: acá «{"largo":"28,5 cm","ancho":"14,5 cm","alto":"4,6 cm"}» · el ERP dice «{"largo":"28,5 cm","ancho":"14 cm","alto":"5,2 cm"}»
       · colores: acá «[["Natural","#B4682F"],["Matizado claro","#B87942"],["Matizado oscuro"» · el ERP dice «[["Matizado Oscuro","#6f3a2c"],["Matizado Claro","#b06a45"],["Natural"»
       · PESO APROX.: acá «2,1 kg» · el ERP dice «1,8 kg»
       · DIMENSIONES: acá «28,5 × 14,5 × 4,6 cm» · el ERP dice «28,5 × 14 × 5,2 cm»
       · RENDIMIENTO: acá «76 und/m²» · el ERP dice «≈ 68 und/m²»
       · TOLERANCIAS DIMENSIONALES: acá «± 2%» · el ERP dice «± 2%»  */
    "slug": "toscano",
    "subtitulo": "LADRILLO DE ARCILLA COCIDA",
    "clasificacion": "TOSCANO",
    "foto": "/public/images/products/toscano/isometrico toscano.webp",
    "features": [
      [
        "shield",
        "ALTA RESISTENCIA",
        "Excelente desempeño estructural."
      ],
      [
        "thermo",
        "DURABILIDAD",
        "Resistente al fuego, intemperie y desgaste."
      ],
      [
        "leaf",
        "MATERIAL NATURAL",
        "Arcilla 100% natural, sustentable y reciclable."
      ]
    ],
    "usos": [
      "Fachadas modernas residenciales y comerciales",
      "Interiores decorativos y muros de acento",
      "Proyectos minimalistas y contemporáneos",
      "Patios y zonas sociales con diseño atemporal"
    ],
    "dims": {
      "largo": "28,5 cm",
      "ancho": "14,5 cm",
      "alto": "4,6 cm"
    },
    "colores": [
      [
        "Natural",
        "#B4682F"
      ],
      [
        "Matizado claro",
        "#B87942"
      ],
      [
        "Matizado oscuro",
        "#7C4A32"
      ]
    ],
    "specsRow": [
      [
        "weight",
        "PESO APROX.",
        "2,1 kg",
        "(por unidad)"
      ],
      [
        "cube",
        "DIMENSIONES",
        "28,5 × 14,5 × 4,6 cm",
        ""
      ],
      [
        "grid",
        "RENDIMIENTO",
        "76 und/m²",
        "(por metro cuadrado)"
      ],
      [
        "flame",
        "RESISTENCIA AL FUEGO",
        "Excelente",
        ""
      ],
      [
        "arrows",
        "TOLERANCIAS DIMENSIONALES",
        "± 2%",
        ""
      ]
    ],
    "orden": [
      "PESO APROX.",
      "DIMENSIONES",
      "RENDIMIENTO",
      "RESISTENCIA A LA COMPRESIÓN",
      "ABSORCIÓN DE AGUA",
      "RESISTENCIA AL FUEGO",
      "TOLERANCIAS DIMENSIONALES"
    ],
  },
  {
    /* El ERP no publica este producto: la ficha se sostiene sola, entera, desde acá. */
    "slug": "napolitano",
    "subtitulo": "LADRILLO DE ARCILLA COCIDA",
    "clasificacion": "NAPOLITANO",
    "foto": "/public/images/products/napolitano/Napolitano dimensiones.webp",
    "features": [
      [
        "shield",
        "ALTA RESISTENCIA",
        "Excelente desempeño estructural."
      ],
      [
        "thermo",
        "DURABILIDAD",
        "Resistente al fuego, intemperie y desgaste."
      ],
      [
        "leaf",
        "MATERIAL NATURAL",
        "Arcilla 100% natural, sustentable y reciclable."
      ]
    ],
    "usos": [
      "Fachadas de vivienda y comercio",
      "Muros perimetrales a la vista",
      "Remodelaciones con lenguaje clásico-contemporáneo"
    ],
    "titulo": "NAPOLITANO",
    "norma": "NTC 4205-2 / 4205-3",
    "dims": {
      "largo": "20 cm",
      "ancho": "10 cm",
      "alto": "5 cm"
    },
    "colores": [
      [
        "Matizado",
        "#9C5A38"
      ],
      [
        "Natural",
        "#B4682F"
      ]
    ],
    "specsRow": [
      [
        "weight",
        "PESO APROX.",
        "1,8 kg",
        "(por unidad)"
      ],
      [
        "cube",
        "DIMENSIONES",
        "20 × 10 × 5 cm",
        ""
      ],
      [
        "grid",
        "RENDIMIENTO",
        "68 und/m²",
        "(por metro cuadrado)"
      ],
      [
        "compress",
        "RESISTENCIA A LA COMPRESIÓN",
        "Promedio 14 MPa · Individual 10 MPa",
        ""
      ],
      [
        "drop",
        "ABSORCIÓN DE AGUA",
        "Promedio 13% · Individual 17%",
        ""
      ],
      [
        "flame",
        "RESISTENCIA AL FUEGO",
        "Excelente",
        ""
      ],
      [
        "arrows",
        "TOLERANCIAS DIMENSIONALES",
        "± 2%",
        ""
      ]
    ],
  },
  {
    /* EN DISPUTA con el ERP (6):
       · dims: acá «{"largo":"28,3 cm","ancho":"14,5 cm","alto":"6 cm"}» · el ERP dice «{"largo":"30 cm","ancho":"15 cm","alto":"6 cm"}»
       · colores: acá «[["Natural","#B4682F"],["Matizado claro","#B87942"],["Matizado oscuro"» · el ERP dice «[["Natural","#c8835f"],["Matizado Claro","#b06a45"],["Matizado Oscuro"»
       · PESO APROX.: acá «2,9 kg» · el ERP dice «2,5 kg»
       · DIMENSIONES: acá «28,3 × 14,5 × 6 cm» · el ERP dice «30 × 15 × 6 cm»
       · RENDIMIENTO: acá «59 und/m²» · el ERP dice «≈ 60 und/m²»
       · TOLERANCIAS DIMENSIONALES: acá «± 2%» · el ERP dice «± 2%»  */
    "slug": "romano",
    "subtitulo": "LADRILLO DE ARCILLA COCIDA",
    "clasificacion": "ROMANO",
    "foto": "/public/images/products/romano/romano dimensiones.webp",
    "features": [
      [
        "shield",
        "ALTA RESISTENCIA",
        "Excelente desempeño estructural."
      ],
      [
        "thermo",
        "DURABILIDAD",
        "Resistente al fuego, intemperie y desgaste."
      ],
      [
        "leaf",
        "MATERIAL NATURAL",
        "Arcilla 100% natural, sustentable y reciclable."
      ]
    ],
    "usos": [
      "Fachadas patrimoniales y contemporáneas",
      "Muros a la vista en vivienda campestre",
      "Cerramientos y muros de acento"
    ],
    "dims": {
      "largo": "28,3 cm",
      "ancho": "14,5 cm",
      "alto": "6 cm"
    },
    "colores": [
      [
        "Natural",
        "#B4682F"
      ],
      [
        "Matizado claro",
        "#B87942"
      ],
      [
        "Matizado oscuro",
        "#7C4A32"
      ]
    ],
    "specsRow": [
      [
        "weight",
        "PESO APROX.",
        "2,9 kg",
        "(por unidad)"
      ],
      [
        "cube",
        "DIMENSIONES",
        "28,3 × 14,5 × 6 cm",
        ""
      ],
      [
        "grid",
        "RENDIMIENTO",
        "59 und/m²",
        "(por metro cuadrado)"
      ],
      [
        "flame",
        "RESISTENCIA AL FUEGO",
        "Excelente",
        ""
      ],
      [
        "arrows",
        "TOLERANCIAS DIMENSIONALES",
        "± 2%",
        ""
      ]
    ],
    "orden": [
      "PESO APROX.",
      "DIMENSIONES",
      "RENDIMIENTO",
      "RESISTENCIA A LA COMPRESIÓN",
      "ABSORCIÓN DE AGUA",
      "RESISTENCIA AL FUEGO",
      "TOLERANCIAS DIMENSIONALES"
    ],
  },
  {
    /* EN DISPUTA con el ERP (2):
       · PESO APROX.: acá «1,6 kg» · el ERP dice «2,8 kg»
       · TOLERANCIAS DIMENSIONALES: acá «± 4%» · el ERP dice «± 4%»  */
    "slug": "cartagena",
    "subtitulo": "LADRILLO DE ARCILLA COCIDA",
    "clasificacion": "CARTAGENA",
    "foto": "/public/images/products/cartagena/Cartagena dimensiones.webp",
    "features": [
      [
        "shield",
        "ALTA RESISTENCIA",
        "Excelente desempeño estructural."
      ],
      [
        "thermo",
        "DURABILIDAD",
        "Resistente al fuego, intemperie y desgaste."
      ],
      [
        "leaf",
        "MATERIAL NATURAL",
        "Arcilla 100% natural, sustentable y reciclable."
      ]
    ],
    "usos": [
      "Fachadas residenciales y comerciales",
      "Muros estructurales interiores con revoque",
      "Divisiones internas y obra residencial"
    ],
    "colores": [
      [
        "Natural",
        "#B4682F"
      ],
      [
        "Matizado claro",
        "#B87942"
      ],
      [
        "Matizado oscuro",
        "#7C4A32"
      ]
    ],
    "specsRow": [
      [
        "weight",
        "PESO APROX.",
        "1,6 kg",
        "(por unidad)"
      ],
      [
        "flame",
        "RESISTENCIA AL FUEGO",
        "Excelente",
        ""
      ],
      [
        "arrows",
        "TOLERANCIAS DIMENSIONALES",
        "± 4%",
        ""
      ]
    ],
    "orden": [
      "PESO APROX.",
      "DIMENSIONES",
      "RESISTENCIA A LA COMPRESIÓN",
      "ABSORCIÓN DE AGUA",
      "RESISTENCIA AL FUEGO",
      "TOLERANCIAS DIMENSIONALES"
    ],
  },
  {
    /* EN DISPUTA con el ERP (2):
       · norma: acá «"NTC 4205 / NTC 3829"» · el ERP dice «"NTC 4205"»
       · colores: acá «[["Matizado claro","#B87942"],["Matizado oscuro","#7C4A32"]]» · el ERP dice «[["Matizado Claro","#b06a45"],["Matizado Oscuro","#6f3a2c"]]»  */
    "slug": "macizo-campesino",
    "subtitulo": "LADRILLO MACIZO DE ARCILLA COCIDA",
    "clasificacion": "MACIZO CAMPESINO",
    "foto": "/public/images/products/macizo-campesino/macizo campesino dimensiones.webp",
    "features": [
      [
        "shield",
        "ALTA RESISTENCIA",
        "Excelente desempeño estructural."
      ],
      [
        "thermo",
        "DURABILIDAD",
        "Resistente al fuego, intemperie y desgaste."
      ],
      [
        "leaf",
        "MATERIAL NATURAL",
        "Arcilla 100% natural, sustentable y reciclable."
      ]
    ],
    "usos": [
      "Pisos interiores y exteriores",
      "Andenes y senderos",
      "Fachadas rústicas y tradicionales",
      "Zonas residenciales y comerciales"
    ],
    "norma": "NTC 4205 / NTC 3829",
    "dims": {
      "largo": "20 cm",
      "ancho": "10 cm",
      "alto": "6 cm"
    },
    "colores": [
      [
        "Matizado claro",
        "#B87942"
      ],
      [
        "Matizado oscuro",
        "#7C4A32"
      ]
    ],
    "specsRow": [
      [
        "weight",
        "PESO APROX.",
        "2,0 kg",
        "(por unidad)"
      ],
      [
        "cube",
        "DIMENSIONES",
        "20 × 10 × 6 cm",
        ""
      ],
      [
        "compress",
        "CARGA DE ROTURA",
        "Promedio 2500 N · Individual 2000 N",
        ""
      ],
      [
        "drop",
        "ABSORCIÓN DE AGUA",
        "Promedio 14% · Individual 17%",
        ""
      ],
      [
        "flame",
        "RESISTENCIA AL FUEGO",
        "Excelente",
        ""
      ],
      [
        "arrows",
        "TOLERANCIAS DIMENSIONALES",
        "± 2%",
        ""
      ]
    ],
  },
  {
    /* EN DISPUTA con el ERP (1):
       · norma: acá «"NMX-C-404-ONNCCE"» · el ERP dice «"NTC 4205"»  */
    "slug": "macizo-brix",
    "subtitulo": "LADRILLO MACIZO DE ARCILLA COCIDA",
    "features": [
      [
        "shield",
        "ALTA RESISTENCIA",
        "Excelente desempeño estructural."
      ],
      [
        "thermo",
        "DURABILIDAD",
        "Resistente al fuego, intemperie y desgaste."
      ],
      [
        "leaf",
        "MATERIAL NATURAL",
        "Arcilla 100% natural, sustentable y reciclable."
      ]
    ],
    "usos": [
      "Muros estructurales o divisorios",
      "Pisos o adoquinados",
      "Obras comerciales o residenciales"
    ],
    "variants": [
      {
        "id": "6x12x24",
        "titulo": "MACIZO 6x12x24",
        "clasificacion": "MACIZO 6x12x24",
        "foto": "/public/images/products/macizo-brix/macizo 6x12x24 dimensiones.webp",
        "dims": {
          "largo": "24 cm",
          "ancho": "12 cm",
          "alto": "6 cm"
        },
        "specsRow": [
          [
            "weight",
            "PESO APROX.",
            "3,80 kg",
            "(por unidad)"
          ],
          [
            "cube",
            "DIMENSIONES",
            "24 × 12 × 6 cm",
            ""
          ],
          [
            "compress",
            "RESISTENCIA A LA COMPRESIÓN",
            "≥ 150 kg/cm²",
            ""
          ],
          [
            "drop",
            "ABSORCIÓN DE AGUA",
            "≤ 18%",
            ""
          ],
          [
            "flame",
            "RESISTENCIA AL FUEGO",
            "Excelente",
            ""
          ],
          [
            "arrows",
            "TOLERANCIAS DIMENSIONALES",
            "± 3 mm",
            ""
          ]
        ]
      }
    ],
    "norma": "NMX-C-404-ONNCCE",
    "colores": [
      [
        "Natural",
        "#B4682F"
      ]
    ],
    "orden": [],
  },
  {
    /* EN DISPUTA con el ERP (4):
       · norma: acá «"NTC 4205-3"» · el ERP dice «"NTC 4205 · NSR-10"»
       · colores: acá «[["Adobe","#928372"],["Arena","#BDA182"],["Natural","#997353"],["Cocoa» · el ERP dice «[["Arena","#c9a876"],["Natural","#c8835f"],["Cocoa","#5a4636"],["Adobe»
       · RENDIMIENTO: acá «56 und/m²» · el ERP dice «≈ 56 und/m²»
       · TOLERANCIAS DIMENSIONALES: acá «± 2%» · el ERP dice «± 2%»  */
    "slug": "bocadillo-prensado",
    "subtitulo": "LADRILLO DE ARCILLA COCIDA",
    "clasificacion": "BOCADILLO PRENSADO",
    "foto": "/public/images/products/bocadillo-prensado/adobe/bocadillo-prensado-adobe-dimensiones.webp",
    "features": [
      [
        "shield",
        "ALTA RESISTENCIA",
        "Excelente desempeño estructural."
      ],
      [
        "thermo",
        "DURABILIDAD",
        "Resistente al fuego, intemperie y desgaste."
      ],
      [
        "leaf",
        "MATERIAL NATURAL",
        "Arcilla 100% natural, sustentable y reciclable."
      ]
    ],
    "usos": [
      "Fachadas con detalle fino",
      "Muros divisorios y de acento",
      "Remates y entrecalles",
      "Proyectos con aparejo de formato pequeño"
    ],
    "norma": "NTC 4205-3",
    "dims": {
      "largo": "24,5 cm",
      "ancho": "11,5 cm",
      "alto": "6 cm"
    },
    "colores": [
      [
        "Adobe",
        "#928372"
      ],
      [
        "Arena",
        "#BDA182"
      ],
      [
        "Natural",
        "#997353"
      ],
      [
        "Cocoa",
        "#544E49"
      ]
    ],
    "specsRow": [
      [
        "cube",
        "DIMENSIONES",
        "24,5 × 11,5 × 6 cm",
        ""
      ],
      [
        "grid",
        "RENDIMIENTO",
        "56 und/m²",
        "(por metro cuadrado)"
      ],
      [
        "flame",
        "RESISTENCIA AL FUEGO",
        "Excelente",
        ""
      ],
      [
        "arrows",
        "TOLERANCIAS DIMENSIONALES",
        "± 2%",
        ""
      ]
    ],
    "orden": [
      "PESO APROX.",
      "DIMENSIONES",
      "RENDIMIENTO",
      "RESISTENCIA A LA COMPRESIÓN",
      "ABSORCIÓN DE AGUA",
      "RESISTENCIA AL FUEGO",
      "TOLERANCIAS DIMENSIONALES"
    ],
  },
  {
    /* EN DISPUTA con el ERP (6):
       · titulo: acá «"GRAN FORMATO PRENSADO"» · el ERP dice «"LADRILLO GRAN FORMATO PRENSADO"»
       · norma: acá «"NTC 4205-3"» · el ERP dice «"NTC 4205 · NSR-10"»
       · colores: acá «[["Adobe","#A49078"],["Arena","#D6C1AB"],["Natural","#AB7752"],["Cocoa» · el ERP dice «[["Arena","#c9a876"],["Natural","#c8835f"],["Cocoa","#5a4636"],["Adobe»
       · PESO APROX.: acá «3,3 kg» · el ERP dice «3,1 kg»
       · RENDIMIENTO: acá «41,7 und/m²» · el ERP dice «≈ 41 und/m²»
       · TOLERANCIAS DIMENSIONALES: acá «± 2%» · el ERP dice «± 2%»  */
    "slug": "gran-formato-prensado",
    "subtitulo": "LADRILLO DE ARCILLA COCIDA",
    "clasificacion": "GRAN FORMATO PRENSADO",
    "foto": "/public/images/products/gran-formato-prensado/adobe/gran-formato-prensado-adobe-dimensiones.webp",
    "features": [
      [
        "shield",
        "ALTA RESISTENCIA",
        "Excelente desempeño estructural."
      ],
      [
        "thermo",
        "DURABILIDAD",
        "Resistente al fuego, intemperie y desgaste."
      ],
      [
        "leaf",
        "MATERIAL NATURAL",
        "Arcilla 100% natural, sustentable y reciclable."
      ]
    ],
    "usos": [
      "Fachadas de gran escala",
      "Muros de acento y divisorios",
      "Proyectos con lenguaje horizontal",
      "Aparejo de formato grande"
    ],
    "titulo": "GRAN FORMATO PRENSADO",
    "norma": "NTC 4205-3",
    "dims": {
      "largo": "39 cm",
      "ancho": "11,5 cm",
      "alto": "5 cm"
    },
    "colores": [
      [
        "Adobe",
        "#A49078"
      ],
      [
        "Arena",
        "#D6C1AB"
      ],
      [
        "Natural",
        "#AB7752"
      ],
      [
        "Cocoa",
        "#7F746B"
      ]
    ],
    "specsRow": [
      [
        "weight",
        "PESO APROX.",
        "3,3 kg",
        "(por unidad)"
      ],
      [
        "cube",
        "DIMENSIONES",
        "39 × 11,5 × 5 cm",
        ""
      ],
      [
        "grid",
        "RENDIMIENTO",
        "41,7 und/m²",
        "(por metro cuadrado)"
      ],
      [
        "flame",
        "RESISTENCIA AL FUEGO",
        "Excelente",
        ""
      ],
      [
        "arrows",
        "TOLERANCIAS DIMENSIONALES",
        "± 2%",
        ""
      ]
    ],
    "orden": [
      "PESO APROX.",
      "DIMENSIONES",
      "RENDIMIENTO",
      "RESISTENCIA A LA COMPRESIÓN",
      "ABSORCIÓN DE AGUA",
      "RESISTENCIA AL FUEGO",
      "TOLERANCIAS DIMENSIONALES"
    ],
  },
  {
    /* EN DISPUTA con el ERP (1):
       · norma: acá «"NTC 4205-2 / 4205-3"» · el ERP dice «"NTC 4205"»  */
    "slug": "rayados-verticales",
    "subtitulo": "LADRILLO DE ARCILLA COCIDA",
    "features": [
      [
        "ruler",
        "TEXTURA DECORATIVA",
        "Relieve que aporta ritmo y juego de luz."
      ],
      [
        "thermo",
        "DURABILIDAD",
        "Resistente al desgaste y la intemperie."
      ],
      [
        "leaf",
        "MATERIAL NATURAL",
        "Arcilla 100% natural, sustentable y reciclable."
      ]
    ],
    "usos": [
      "Muros estructurales interiores (con revoque)",
      "Estructuras y muros",
      "Construcción residencial",
      "Obra comercial e industrial"
    ],
    "variants": [
      {
        "id": "10",
        "titulo": "RAYADO 10 VERTICAL",
        "clasificacion": "RAYADO 10 VERTICAL",
        "foto": "/public/images/products/rayados-verticales/rayado 10-vertical/rayado 10 vertical dimensiones.webp",
        "dims": {
          "largo": "40 cm",
          "ancho": "10 cm",
          "alto": "20 cm"
        },
        "specsRow": [
          [
            "weight",
            "PESO APROX.",
            "6,9 kg",
            "(por unidad)"
          ],
          [
            "compress",
            "RESISTENCIA A LA COMPRESIÓN",
            "Promedio 20 MPa · Individual 15 MPa",
            "(PV · no estructural)"
          ],
          [
            "drop",
            "ABSORCIÓN DE AGUA",
            "Promedio 17% · Individual 19%",
            ""
          ],
          [
            "flame",
            "RESISTENCIA AL FUEGO",
            "Excelente",
            ""
          ],
          [
            "arrows",
            "TOLERANCIAS DIMENSIONALES",
            "± 2%",
            ""
          ]
        ]
      },
      {
        "id": "12",
        "titulo": "RAYADO 12 VERTICAL",
        "clasificacion": "RAYADO 12 VERTICAL",
        "foto": "/public/images/products/rayados-verticales/rayado 12-vertical/rayado 12 vertical dimensiones.webp",
        "dims": {
          "largo": "40 cm",
          "ancho": "12 cm",
          "alto": "20 cm"
        },
        "specsRow": [
          [
            "weight",
            "PESO APROX.",
            "8,8 kg",
            "(por unidad)"
          ],
          [
            "compress",
            "RESISTENCIA A LA COMPRESIÓN",
            "Promedio 20 MPa · Individual 15 MPa",
            "(PV · no estructural)"
          ],
          [
            "drop",
            "ABSORCIÓN DE AGUA",
            "Promedio 17% · Individual 19%",
            ""
          ],
          [
            "flame",
            "RESISTENCIA AL FUEGO",
            "Excelente",
            ""
          ],
          [
            "arrows",
            "TOLERANCIAS DIMENSIONALES",
            "± 2%",
            ""
          ]
        ]
      },
      {
        "id": "15",
        "titulo": "RAYADO 15 VERTICAL",
        "clasificacion": "RAYADO 15 VERTICAL",
        "foto": "/public/images/products/rayados-verticales/rayado 15-vertical/rayado 15 vertical dimensiones.webp",
        "dims": {
          "largo": "40 cm",
          "ancho": "15 cm",
          "alto": "20 cm"
        },
        "specsRow": [
          [
            "weight",
            "PESO APROX.",
            "9,0 kg",
            "(por unidad)"
          ],
          [
            "compress",
            "RESISTENCIA A LA COMPRESIÓN",
            "Promedio 20 MPa · Individual 15 MPa",
            "(PV · no estructural)"
          ],
          [
            "drop",
            "ABSORCIÓN DE AGUA",
            "Promedio 17% · Individual 19%",
            ""
          ],
          [
            "flame",
            "RESISTENCIA AL FUEGO",
            "Excelente",
            ""
          ],
          [
            "arrows",
            "TOLERANCIAS DIMENSIONALES",
            "± 2%",
            ""
          ]
        ]
      }
    ],
    "norma": "NTC 4205-2 / 4205-3",
    "colores": [
      [
        "Natural",
        "#B4682F"
      ]
    ],
    "orden": [],
  },
  {
    /* EN DISPUTA con el ERP (1):
       · norma: acá «"NTC 4205-2 / 4205-3"» · el ERP dice «"NTC 4205"»  */
    "slug": "rayados-horizontales",
    "subtitulo": "LADRILLO DE ARCILLA COCIDA",
    "features": [
      [
        "ruler",
        "TEXTURA DECORATIVA",
        "Relieve que aporta ritmo y juego de luz."
      ],
      [
        "thermo",
        "DURABILIDAD",
        "Resistente al desgaste y la intemperie."
      ],
      [
        "leaf",
        "MATERIAL NATURAL",
        "Arcilla 100% natural, sustentable y reciclable."
      ]
    ],
    "usos": [
      "Muros estructurales interiores (con revoque)",
      "Divisiones internas",
      "Construcción residencial",
      "Obra comercial e industrial"
    ],
    "variants": [
      {
        "id": "10",
        "titulo": "RAYADO 10 HORIZONTAL",
        "clasificacion": "RAYADO 10 HORIZONTAL",
        "foto": "/public/images/products/rayados-horizontales/rayado 10-horizontal/rayado 10 horizontal dimensiones.webp",
        "dims": {
          "largo": "40 cm",
          "ancho": "10 cm",
          "alto": "20 cm"
        },
        "specsRow": [
          [
            "weight",
            "PESO APROX.",
            "5,5 – 6,0 kg",
            "(por unidad)"
          ],
          [
            "compress",
            "RESISTENCIA A LA COMPRESIÓN",
            "Promedio 5 MPa · Individual 3 MPa",
            "(PV · no estructural)"
          ],
          [
            "drop",
            "ABSORCIÓN DE AGUA",
            "Promedio 17% · Individual 20%",
            ""
          ],
          [
            "flame",
            "RESISTENCIA AL FUEGO",
            "Excelente",
            ""
          ],
          [
            "arrows",
            "TOLERANCIAS DIMENSIONALES",
            "± 2%",
            ""
          ]
        ]
      },
      {
        "id": "12",
        "titulo": "RAYADO 12 HORIZONTAL",
        "clasificacion": "RAYADO 12 HORIZONTAL",
        "foto": "/public/images/products/rayados-horizontales/rayado 12-horizontal/rayado 12 horizontal dimensiones.webp",
        "dims": {
          "largo": "40 cm",
          "ancho": "12 cm",
          "alto": "20 cm"
        },
        "specsRow": [
          [
            "weight",
            "PESO APROX.",
            "6,0 – 6,5 kg",
            "(por unidad)"
          ],
          [
            "compress",
            "RESISTENCIA A LA COMPRESIÓN",
            "Promedio 5 MPa · Individual 3 MPa",
            "(PV · no estructural)"
          ],
          [
            "drop",
            "ABSORCIÓN DE AGUA",
            "Promedio 17% · Individual 20%",
            ""
          ],
          [
            "flame",
            "RESISTENCIA AL FUEGO",
            "Excelente",
            ""
          ],
          [
            "arrows",
            "TOLERANCIAS DIMENSIONALES",
            "± 2%",
            ""
          ]
        ]
      },
      {
        "id": "15",
        "titulo": "RAYADO 15 HORIZONTAL",
        "clasificacion": "RAYADO 15 HORIZONTAL",
        "foto": "/public/images/products/rayados-horizontales/rayado 15-horizontal/rayado 15 horizontal dimensiones.webp",
        "dims": {
          "largo": "40 cm",
          "ancho": "15 cm",
          "alto": "20 cm"
        },
        "specsRow": [
          [
            "weight",
            "PESO APROX.",
            "6,5 – 7,0 kg",
            "(por unidad)"
          ],
          [
            "compress",
            "RESISTENCIA A LA COMPRESIÓN",
            "Promedio 5 MPa · Individual 3 MPa",
            "(PV · no estructural)"
          ],
          [
            "drop",
            "ABSORCIÓN DE AGUA",
            "Promedio 17% · Individual 20%",
            ""
          ],
          [
            "flame",
            "RESISTENCIA AL FUEGO",
            "Excelente",
            ""
          ],
          [
            "arrows",
            "TOLERANCIAS DIMENSIONALES",
            "± 2%",
            ""
          ]
        ]
      }
    ],
    "norma": "NTC 4205-2 / 4205-3",
    "colores": [
      [
        "Natural",
        "#B4682F"
      ]
    ],
    "orden": [],
  },
  {
    /* El ERP no publica este producto: la ficha se sostiene sola, entera, desde acá. */
    "slug": "enchape-rustico",
    "subtitulo": "REVESTIMIENTO DE ARCILLA COCIDA",
    "clasificacion": "ENCHAPE RÚSTICO",
    "foto": "/public/images/products/enchape-rustico/producto/enchape-rustico-producto-2.webp",
    "features": [
      [
        "shield",
        "ACABADO DECORATIVO",
        "Revestimiento con textura y carácter."
      ],
      [
        "thermo",
        "DURABILIDAD",
        "Resistente al desgaste y la intemperie."
      ],
      [
        "leaf",
        "MATERIAL NATURAL",
        "Arcilla 100% natural, sustentable y reciclable."
      ]
    ],
    "usos": [
      "Paredes decorativas interiores y exteriores",
      "Fachadas de acento",
      "Pisos decorativos",
      "Restaurantes, hoteles y comercio"
    ],
    "titulo": "ENCHAPE RÚSTICO",
    "norma": "NTC 5547",
    "dims": {
      "largo": "25 cm",
      "ancho": "2,4 cm",
      "alto": "6 cm"
    },
    "colores": [
      [
        "Natural",
        "#B4682F"
      ],
      [
        "Matizado",
        "#9C5A38"
      ]
    ],
    "specsRow": [
      [
        "weight",
        "PESO APROX.",
        "0,8 kg",
        "(por unidad)"
      ],
      [
        "grid",
        "RENDIMIENTO",
        "66 und/m²",
        "(por metro cuadrado)"
      ],
      [
        "drop",
        "ABSORCIÓN DE AGUA",
        "Promedio 13% · Individual 14%",
        ""
      ],
      [
        "ruler",
        "RESISTENCIA A LA FLEXIÓN",
        "Promedio 3 MPa",
        ""
      ],
      [
        "arrows",
        "TOLERANCIAS DIMENSIONALES",
        "± 2%",
        ""
      ]
    ],
  },
  {
    /* EN DISPUTA con el ERP (4):
       · titulo: acá «"ENCHAPE THIN BRICK"» · el ERP dice «"ENCHAPE THINBRICK"»
       · norma: acá «"NTC 4205"» · el ERP dice «"NTC 4205 · contracción +0 / 2%"»
       · colores: acá «[["Natural","#C8825A"],["Bianco","#CFC4B9"],["Capuccino","#D5AF82"],["» · el ERP dice «[["Natural","#c8835f"],["Bianco","#e8e2d8"],["Capuccino","#a9846b"],["»
       · PESO APROX.: acá «0,280 kg» · el ERP dice «0,28 kg»  */
    "slug": "enchape-thinbrick",
    "subtitulo": "REVESTIMIENTO DELGADO DE ARCILLA COCIDA",
    "clasificacion": "THIN BRICK · REVESTIMIENTO INTERIOR",
    "foto": "/public/images/products/enchape-thinbrick/natural/enchape-thinbrick-natural.webp",
    "features": [
      [
        "shield",
        "BAJO ESPESOR",
        "Reviste muros con solo 1 cm de espesor."
      ],
      [
        "thermo",
        "USO INTERIOR",
        "Fabricado para revestir muros y paredes interiores."
      ],
      [
        "leaf",
        "MATERIAL NATURAL",
        "Arcilla 100% natural, sustentable y reciclable."
      ]
    ],
    "usos": [
      "Muros de acento en interiores",
      "Zócalos y detalles con bajo espesor",
      "Restaurantes, hoteles y comercio",
      "Chimeneas y muros decorativos"
    ],
    "titulo": "ENCHAPE THIN BRICK",
    "norma": "NTC 4205",
    "dims": {
      "largo": "20 cm",
      "ancho": "1 cm",
      "alto": "5 cm"
    },
    "colores": [
      [
        "Natural",
        "#C8825A"
      ],
      [
        "Bianco",
        "#CFC4B9"
      ],
      [
        "Capuccino",
        "#D5AF82"
      ],
      [
        "Cocoa",
        "#4A3E3D"
      ]
    ],
    "specsRow": [
      [
        "weight",
        "PESO APROX.",
        "0,280 kg",
        "(por unidad)"
      ],
      [
        "grid",
        "RENDIMIENTO",
        "66 – 86 und/m²",
        "(sin junta / junta 1 cm)"
      ],
      [
        "compress",
        "RESISTENCIA A LA COMPRESIÓN",
        "No aplica",
        "(revestimiento)"
      ],
      [
        "drop",
        "ABSORCIÓN MÁXIMA",
        "No aplica",
        "(revestimiento)"
      ],
      [
        "arrows",
        "CONTRACCIÓN PERMITIDA",
        "+0 / 2%",
        ""
      ]
    ],
    "orden": [
      "PESO APROX.",
      "RENDIMIENTO",
      "RESISTENCIA A LA COMPRESIÓN",
      "ABSORCIÓN MÁXIMA",
      "CONTRACCIÓN PERMITIDA"
    ],
  },
  {
    /* EN DISPUTA con el ERP (2):
       · norma: acá «"NTC 5547"» · el ERP dice «"NTC 4205"»
       · colores: acá «[["Natural","#B4682F"],["Matizado","#9C5A38"],["Matizado oscuro","#7C4» · el ERP dice «[["Natural","#c8835f"],["Matizado Claro","#b06a45"],["Matizado Oscuro"»  */
    "slug": "enchape-romano",
    "subtitulo": "REVESTIMIENTO DE ARCILLA COCIDA",
    "clasificacion": "ENCHAPE ROMANO",
    "foto": "/public/images/products/enchape-romano/enchape romano dimensiones.webp",
    "features": [
      [
        "shield",
        "ACABADO DECORATIVO",
        "Revestimiento con textura y carácter."
      ],
      [
        "thermo",
        "DURABILIDAD",
        "Resistente al desgaste y la intemperie."
      ],
      [
        "leaf",
        "MATERIAL NATURAL",
        "Arcilla 100% natural, sustentable y reciclable."
      ]
    ],
    "usos": [
      "Revestimientos decorativos de muros interiores y exteriores",
      "Fachadas rústicas y coloniales",
      "Zonas residenciales y comerciales",
      "Ambientes rústicos y naturales"
    ],
    "norma": "NTC 5547",
    "dims": {
      "largo": "28 cm",
      "ancho": "6 cm",
      "alto": "1,3 cm"
    },
    "colores": [
      [
        "Natural",
        "#B4682F"
      ],
      [
        "Matizado",
        "#9C5A38"
      ],
      [
        "Matizado oscuro",
        "#7C4A32"
      ]
    ],
    "specsRow": [
      [
        "compress",
        "CARGA DE ROTURA",
        "Promedio 300 N · Individual 250 N",
        ""
      ],
      [
        "drop",
        "ABSORCIÓN DE AGUA",
        "Promedio 13% · Individual 14%",
        ""
      ],
      [
        "ruler",
        "RESISTENCIA A LA FLEXIÓN",
        "Promedio 3 MPa · Individual 3 MPa",
        ""
      ],
      [
        "arrows",
        "TOLERANCIAS DIMENSIONALES",
        "± 2%",
        ""
      ]
    ],
    "orden": [
      "PESO APROX.",
      "CARGA DE ROTURA",
      "ABSORCIÓN DE AGUA",
      "RESISTENCIA A LA FLEXIÓN",
      "TOLERANCIAS DIMENSIONALES"
    ],
  },
  {
    /* EN DISPUTA con el ERP (2):
       · norma: acá «"NTC 2086"» · el ERP dice «"NTC 4205"»
       · RENDIMIENTO: acá «13 und/m²» · el ERP dice «≈ 13 und/m²»  */
    "slug": "teja-plana",
    "subtitulo": "PIEZA DE ARCILLA COCIDA",
    "clasificacion": "TEJA PLANA",
    "foto": "/public/images/products/teja-plana/natural/teja plana natural dimensiones.webp",
    "features": [
      [
        "shield",
        "ALTA RESISTENCIA",
        "Excelente desempeño estructural y decorativo."
      ],
      [
        "thermo",
        "DURABILIDAD",
        "Resistente al desgaste, intemperie y variaciones térmicas."
      ],
      [
        "leaf",
        "MATERIAL NATURAL",
        "Arcilla 100% natural, sustentable y reciclable."
      ]
    ],
    "usos": [
      "Cubiertas visibles en vivienda campestre",
      "Pérgolas y cubiertas de terraza",
      "Proyectos patrimoniales y turísticos"
    ],
    "norma": "NTC 2086",
    "dims": {
      "largo": "40 cm",
      "ancho": "25 cm",
      "alto": "—"
    },
    "colores": [
      [
        "Natural",
        "#B4682F"
      ],
      [
        "Chocolate",
        "#6B4636"
      ]
    ],
    "specsRow": [
      [
        "compress",
        "RESISTENCIA A LA COMPRESIÓN",
        "13 MPa mín.",
        "(carga de rotura)"
      ],
      [
        "drop",
        "ABSORCIÓN DE AGUA",
        "3% – 6% máx.",
        ""
      ],
      [
        "ruler",
        "PLANARIDAD",
        "1,5%",
        ""
      ],
      [
        "arrows",
        "TOLERANCIAS DIMENSIONALES",
        "± 2%",
        ""
      ],
      [
        "grid",
        "RENDIMIENTO",
        "13 und/m²",
        "(por metro cuadrado)"
      ]
    ],
    "orden": [
      "PESO APROX.",
      "RESISTENCIA A LA COMPRESIÓN",
      "ABSORCIÓN DE AGUA",
      "PLANARIDAD",
      "TOLERANCIAS DIMENSIONALES",
      "RENDIMIENTO"
    ],
  },
  {
    /* EN DISPUTA con el ERP (1):
       · norma: acá «"NTC 2086"» · el ERP dice «"NTC 4205"»  */
    "slug": "teja-colonial",
    "subtitulo": "PIEZA DE ARCILLA COCIDA",
    "clasificacion": "TEJA COLONIAL",
    "foto": "/public/images/products/teja-colonial/teja colonial dimensiones.webp",
    "features": [
      [
        "shield",
        "ALTA RESISTENCIA",
        "Excelente desempeño estructural y decorativo."
      ],
      [
        "thermo",
        "DURABILIDAD",
        "Resistente al desgaste, intemperie y variaciones térmicas."
      ],
      [
        "leaf",
        "MATERIAL NATURAL",
        "Arcilla 100% natural, sustentable y reciclable."
      ]
    ],
    "usos": [
      "Cubiertas visibles en vivienda campestre",
      "Proyectos patrimoniales y turísticos",
      "Ampliaciones con lenguaje tradicional"
    ],
    "norma": "NTC 2086",
    "dims": {
      "largo": "41 cm",
      "ancho": "20 cm",
      "alto": "11 cm"
    },
    "colores": [
      [
        "Roja",
        "#B4552F"
      ]
    ],
    "specsRow": [
      [
        "compress",
        "RESISTENCIA A LA COMPRESIÓN",
        "13 MPa mín.",
        "(carga de rotura)"
      ],
      [
        "drop",
        "ABSORCIÓN DE AGUA",
        "3% – 6% máx.",
        ""
      ],
      [
        "ruler",
        "PLANARIDAD",
        "1,5%",
        ""
      ],
      [
        "arrows",
        "TOLERANCIAS DIMENSIONALES",
        "± 2%",
        ""
      ]
    ],
    "orden": [
      "PESO APROX.",
      "RESISTENCIA A LA COMPRESIÓN",
      "ABSORCIÓN DE AGUA",
      "PLANARIDAD",
      "TOLERANCIAS DIMENSIONALES"
    ],
  },
  {
    /* EN DISPUTA con el ERP (3):
       · colores: acá «[["Natural","#B45B33"]]» · el ERP dice «[["Natural","#c8835f"]]»
       · RESISTENCIA A LA COMPRESIÓN: acá «Promedio 20 MPa · Individual 15 MPa» · el ERP dice «Promedio 20 MPa · Individual 15 MPa»
       · TOLERANCIAS DIMENSIONALES: acá «± 2%» · el ERP dice «± 2%»  */
    "slug": "bloquelon",
    "subtitulo": "BLOQUE DE ARCILLA COCIDA",
    "clasificacion": "BLOQUELÓN",
    "foto": "/public/images/products/bloquelon/bloquelon-dimensiones.webp",
    "features": [
      [
        "cube",
        "GRAN FORMATO",
        "Rinde 5 piezas por m² — muros más rápidos."
      ],
      [
        "leaf",
        "LIVIANO",
        "Celdas huecas que aligeran la estructura."
      ],
      [
        "thermo",
        "DURABILIDAD",
        "Arcilla cocida resistente al desgaste y la intemperie."
      ]
    ],
    "usos": [
      "Muros divisorios interiores",
      "Cerramientos y divisiones livianas",
      "Obra residencial y comercial",
      "Construcción rápida de gran formato"
    ],
    "dims": {
      "largo": "80 cm",
      "ancho": "8 cm",
      "alto": "23 cm"
    },
    "colores": [
      [
        "Natural",
        "#B45B33"
      ]
    ],
    "specsRow": [
      [
        "cube",
        "DIMENSIONES",
        "80 × 23 × 8 cm",
        ""
      ],
      [
        "grid",
        "RENDIMIENTO",
        "5 und/m²",
        "(por metro cuadrado)"
      ],
      [
        "compress",
        "RESISTENCIA A LA COMPRESIÓN",
        "Promedio 20 MPa · Individual 15 MPa",
        "(PV · no estructural)"
      ],
      [
        "flame",
        "RESISTENCIA AL FUEGO",
        "Excelente",
        ""
      ],
      [
        "arrows",
        "TOLERANCIAS DIMENSIONALES",
        "± 2%",
        ""
      ]
    ],
    "orden": [
      "PESO APROX.",
      "DIMENSIONES",
      "RENDIMIENTO",
      "RESISTENCIA A LA COMPRESIÓN",
      "ABSORCIÓN DE AGUA",
      "RESISTENCIA AL FUEGO",
      "TOLERANCIAS DIMENSIONALES"
    ],
  },
  {
    /* El ERP no publica este producto: la ficha se sostiene sola, entera, desde acá. */
    "slug": "gran-formato",
    "subtitulo": "LADRILLO TOLETE DE ARCILLA COCIDA",
    "clasificacion": "GRAN FORMATO",
    "foto": "/public/images/products/gran-formato/tierra/gran-formato-tierra-dimensiones.webp",
    "features": [
      [
        "shield",
        "ALTA RESISTENCIA",
        "Promedio 30 MPa a la compresión."
      ],
      [
        "ruler",
        "GRAN FORMATO",
        "Rinde 41,7 piezas por metro cuadrado."
      ],
      [
        "leaf",
        "MATERIAL NATURAL",
        "Arcilla cocida con cara vista rugosa."
      ]
    ],
    "usos": [
      "Muros de fachada",
      "Muros divisorios",
      "Muros estructurales",
      "Proyectos de gran escala"
    ],
    "titulo": "GRAN FORMATO",
    "norma": "NTC 4205-1 / 4205-3",
    "dims": {
      "largo": "39 cm",
      "ancho": "11,5 cm",
      "alto": "5 cm"
    },
    "colores": [
      [
        "Cobrizo",
        "#A05A40"
      ],
      [
        "Cocoa",
        "#4E4238"
      ],
      [
        "Duna",
        "#C4B694"
      ],
      [
        "Terracota",
        "#AC5B38"
      ],
      [
        "Tierra",
        "#9F8A6C"
      ]
    ],
    "specsRow": [
      [
        "weight",
        "PESO APROX.",
        "2,9 kg",
        "(por unidad)"
      ],
      [
        "cube",
        "DIMENSIONES",
        "39 × 11,5 × 5 cm",
        ""
      ],
      [
        "grid",
        "RENDIMIENTO",
        "41,7 und/m²",
        "(por metro cuadrado)"
      ],
      [
        "compress",
        "RESISTENCIA A LA COMPRESIÓN",
        "Promedio 30 MPa · Individual 25 MPa",
        ""
      ],
      [
        "drop",
        "ABSORCIÓN DE AGUA",
        "4–13% (según color)",
        ""
      ],
      [
        "flame",
        "RESISTENCIA AL FUEGO",
        "Excelente",
        ""
      ],
      [
        "arrows",
        "TOLERANCIAS DIMENSIONALES",
        "± 5 / ± 3 / ± 2 mm",
        ""
      ]
    ],
  },
];
