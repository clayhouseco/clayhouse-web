/**
 * UNA IMAGEN DE COMPARTIR POR PRODUCTO.
 *
 * Gerencia: «por qué cuando mando un link me sale la misma imagen siempre».
 *
 * Las fichas de producto no declaraban `og:image`, así que las 17 caían en la genérica
 * `/og-image.jpg` —la foto de una fachada—. Al mandar el enlace de Cartagena por WhatsApp
 * llegaba esa foto, no el ladrillo del que se está hablando.
 *
 * NO BASTA CON APUNTAR A LA FOTO DEL PRODUCTO. Dos razones:
 *
 *   · Casi todas son `.webp`, y la vista previa de WhatsApp falla con ese formato más veces
 *     de las que acierta. Acá se exporta JPEG, que entiende todo el mundo.
 *   · Open Graph se dibuja a 1200×630 (1,91:1) y las fotos de producto son 3:2. Dejar que
 *     WhatsApp recorte corta el ladrillo por donde le parece; acá se encaja entera sobre
 *     blanco, que es el fondo con el que están fotografiadas.
 *
 * Se regeneran en cada build y viven en public/images/og/. Son artefactos, no originales:
 * si la foto del producto cambia, la de compartir se rehace sola.
 *
 * LAS PÁGINAS QUE NO SON FICHA TAMBIÉN TIENEN LA SUYA.
 *
 * Gerencia, otra vez: «cuando mando https://clayhouse.com.co/productos sale la misma imagen
 * de antes». Las fichas ya tenían la suya, pero el catálogo, el cotizador, nosotros,
 * contacto, proyectos y el blog seguían cayendo en `/og-image.jpg` —la foto de una fachada—,
 * así que todos los enlaces que no fueran de producto llegaban iguales a WhatsApp.
 *
 * Estas se recortan a 1200×630 en vez de encajarse sobre blanco: son fotos de obra, no
 * piezas sobre fondo claro, y dejarlas con franjas blancas a los lados se ve peor que
 * recortarlas.
 *
 *   node scripts/generate-og.mjs [--force]
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const ANCHO = 1200;
const ALTO = 630;
const MARGEN = 40;          // aire alrededor de la pieza
const SRC_ROOT = "public";
const OUT_DIR = "public/images/og";
const FORCE = process.argv.includes("--force");

/**
 * Las rutas de `image:` en products.ts, sin importar TypeScript.
 *
 * Se corta por producto antes de buscar. Un regex corrido que empareje «slug» con el
 * siguiente «image» se desalinea en cuanto un producto no declara foto: se probó y dejó a
 * los rayados verticales con la foto del bloquelón y a los horizontales con la del enchape
 * rústico, que en una vista previa de WhatsApp es peor que no tener imagen.
 */
function imagenesDeProductos() {
  const ts = fs.readFileSync("src/data/products.ts", "utf8");
  const inicios = [...ts.matchAll(/\n    slug: "/g)].map((m) => m.index);
  const out = [];
  for (let i = 0; i < inicios.length; i++) {
    const bloque = ts.slice(inicios[i], inicios[i + 1] ?? ts.length);
    const slug = bloque.match(/slug: "([^"]+)"/)?.[1];
    // La llamada puede ocupar varias líneas —los rayados la parten— así que se permite
    // salto de línea entre los argumentos.
    const img = bloque.match(/image: productFolderImage\(\s*"([^"]+)",\s*"([^"]+)"\s*\)/);
    if (slug && img) out.push({ slug, file: `/images/products/${img[1]}/${img[2]}` });
  }
  return out;
}

/**
 * La foto con la que cada página se presenta cuando alguien manda su enlace.
 *
 * Es la misma que abre la página, así que quien recibe el enlace por WhatsApp ve lo que va
 * a encontrar al abrirlo. Las páginas de aviso legal y utilidades no están acá a propósito:
 * se quedan con la genérica del sitio, que para ellas es lo correcto.
 */
const PAGINAS = [
  { nombre: "inicio", fuente: "src/assets/images/hero/DSC08862.jpg" },
  { nombre: "productos", fuente: "src/assets/images/hero/DSC08873.jpg" },
  { nombre: "cotizacion", fuente: "src/assets/images/hero/DSC08873.jpg" },
  { nombre: "nosotros", fuente: "src/assets/images/hero/Mina.JPG" },
  { nombre: "contacto", fuente: "src/assets/images/hero/Plaza de Envigado.jpg" },
  { nombre: "proyectos", fuente: "src/assets/images/hero/Edificio 8k.jpg" },
  { nombre: "blog", fuente: "src/assets/images/hero/Dos Santos.jpg" },
];

fs.mkdirSync(OUT_DIR, { recursive: true });

let hechas = 0, reusadas = 0, sinFuente = 0, fallidas = 0;

for (const { slug, file } of imagenesDeProductos()) {
  const src = path.join(SRC_ROOT, decodeURIComponent(file));
  const out = path.join(OUT_DIR, `${slug}.jpg`);

  if (!fs.existsSync(src)) { sinFuente++; continue; }
  if (!FORCE && fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs) {
    reusadas++;
    continue;
  }

  try {
    const pieza = await sharp(src)
      .resize(ANCHO - MARGEN * 2, ALTO - MARGEN * 2, { fit: "inside", withoutEnlargement: false })
      .toBuffer();
    await sharp({ create: { width: ANCHO, height: ALTO, channels: 3, background: "#ffffff" } })
      .composite([{ input: pieza, gravity: "centre" }])
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(out);
    hechas++;
  } catch (e) {
    fallidas++;
    console.warn(`  ⚠️  ${slug}: ${e.message}`);
  }
}

/* Las páginas: recorte a 1200×630 desde el centro, que es donde está el motivo en todas. */
for (const { nombre, fuente } of PAGINAS) {
  const out = path.join(OUT_DIR, `pagina-${nombre}.jpg`);
  if (!fs.existsSync(fuente)) { sinFuente++; continue; }
  if (!FORCE && fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(fuente).mtimeMs) {
    reusadas++;
    continue;
  }
  try {
    await sharp(fuente)
      .rotate()
      .resize(ANCHO, ALTO, { fit: "cover", position: "attention" })
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(out);
    hechas++;
  } catch (e) {
    fallidas++;
    console.warn(`  ⚠️  pagina-${nombre}: ${e.message}`);
  }
}

const partes = [`${hechas} generadas`, `${reusadas} en caché`];
if (sinFuente) partes.push(`${sinFuente} sin foto`);
if (fallidas) partes.push(`${fallidas} fallidas`);
console.log(`[og] ${partes.join(" · ")}`);
