# Imágenes IA para fichas de producto

Cada producto del catálogo admite **dos imágenes generadas con IA** además de la foto real:

| Tipo | Archivo | Uso en la web |
|------|---------|----------------|
| Dimensiones | `public/images/products/{slug}/dimensiones.jpg` | Diagrama técnico con medidas |
| Fachada / obra | `public/images/products/{slug}/fachada.jpg` | Render del producto en muro |

**Slugs:** `toscano`, `napolitano`, `romano`, `cartagena`, `macizo-campesino`, `macizo-brix`, `rayados-verticales`, `rayados-horizontales`, `enchape-rustico`, `enchape-romano`, `piso-30x30`, `teja-plana`

**Estado (mayo 2026):** las 12 referencias ya tienen `dimensiones.jpg` y `fachada.jpg` generadas como propuesta inicial (revisar medidas contra cada PDF antes de producción).

Hasta que exista el JPG, la ficha muestra un placeholder. La foto real no se reemplaza.

---

## Recomendaciones generales

- **Herramientas:** Midjourney, DALL·E, Ideogram, Adobe Firefly o similar.
- **Proporción:** dimensiones **4:3**; fachada **16:9**.
- **Estilo dimensiones:** fondo blanco o crema `#FBF7F4`, líneas chocolate `#472410`, acentos terracota `#7C482C`. Sin texto decorativo; solo cotas legibles.
- **Estilo fachada:** arquitectura contemporánea colombiana, luz natural, muro de ladrillo a la vista con juntas de mortero claras. No marcas ni logos.
- **Validación:** contrasta medidas con el PDF en `public/Fichas Tecnicas/` antes de publicar.

### Prompt base — dimensiones

```
Technical product illustration, single clay brick [NOMBRE PRODUCTO] on white/cream background, orthographic 3/4 view, clean architectural diagram style, dimension lines with arrows showing length width height in centimeters [MEDIDAS], terracotta and sand tones, minimal, no watermark, no brand logo, professional catalog quality, 4:3
```

### Prompt base — fachada / render

```
Architectural photograph, contemporary house facade in Colombia, exterior wall clad in [NOMBRE] handmade terracotta brick, natural daylight, shallow depth of field, warm earth tones #7C482C and #472410, mortar joints visible, premium residential architecture, photorealistic, no people, no text, 16:9
```

---

## Por producto

### Toscano (`toscano`)

- **Dimensiones:** largo 24 cm, ancho 5.5 cm, alto 11 cm. Perfil toscano con relieve.
- **Fachada:** muro con textura rústica toscana, tono arena y sombras profundas.

### Napolitano (`napolitano`)

- **Dimensiones:** formato alargado napolitano (consultar ficha PDF).
- **Fachada:** aparejo vertical elegante, tonos rojizos matizados.

### Romano (`romano`)

- **Dimensiones:** perfil romano alargado.
- **Fachada:** juego de sombras en aparejo romano, ladrillo natural semimatizado.

### Cartagena (`cartagena`)

- **Dimensiones:** formato Cartagena (ficha PDF).
- **Fachada:** fachada con tonos claros u oscuros, carácter regional costero-contemporáneo.

### Macizo Campesino (`macizo-campesino`)

- **Dimensiones:** ladrillo macizo campesino, cara lisa.
- **Fachada:** muro estructural o acabado rústico terracota natural (no solo fachada fina).

### Macizo Brix (`macizo-brix`)

- **Dimensiones:** formato Brix optimizado (ficha PDF).
- **Fachada:** obra moderna con macizo rojizo uniforme.

### Rayado vertical (`rayados-verticales`)

- **Dimensiones:** ladrillo con surcos verticales visibles.
- **Fachada:** muro con rayado vertical, luz lateral que resalta textura.

### Rayado horizontal (`rayados-horizontales`)

- **Dimensiones:** ladrillo con surcos horizontales.
- **Fachada:** fachada residencial con énfasis horizontal en el aparejo.

### Enchape rústico (`enchape-rustico`)

- **Dimensiones:** pieza de enchape delgada (ficha PDF).
- **Fachada:** muro interior o exterior revestido con enchape rústico, detalle de esquina.

### Enchape romano (`enchape-romano`)

- **Dimensiones:** perfil romano para enchape.
- **Fachada:** columna o muro de acento con enchape romano semimatizado.

### Piso 30×30 (`piso-30x30`)

- **Dimensiones:** losa 30×30 cm, espesor ~2.5 cm, vista en planta y lateral.
- **Fachada:** usar prompt de **ambiente:** patio o salón con piso de barro tabaco, muebles mínimos, luz cálida (guardar como `fachada.jpg` por convención del sitio).

### Teja plana (`teja-plana`)

- **Dimensiones:** teja plana con largo, ancho y espesor (ficha PDF).
- **Fachada:** cubierta inclinada con tejas planas visibles, estética tradicional-contemporánea.

---

## Flujo de trabajo

1. Genera **dimensiones** y **fachada** por producto.
2. Revisa medidas contra la ficha técnica PDF.
3. Exporta JPG (calidad 85–90 %, ancho ≥ 1600 px).
4. Guarda en `public/images/products/{slug}/`.
5. `npm run dev` y abre `/productos/{slug}` para verificar.

Si quieres que el equipo genere las imágenes por ti, comparte las medidas exactas de cada ficha (o los PDF ya están en el repo) y se pueden afinar los prompts producto por producto.
