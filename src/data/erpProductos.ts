/**
 * UN PRODUCTO NUEVO DEL ERP YA TIENE PÁGINA.
 *
 * Gerencia: «cuando creo el nuevo producto voy a la página web y sale error 404».
 *
 * Las páginas de producto salían de `products.ts`, un archivo escrito a mano. Crear el producto
 * en el ERP, marcarlo para la web, ponerle foto, colores y precio no bastaba: mientras nadie
 * viniera a escribir su ficha acá y a desplegar, la URL no existía. Y el ERP sí lo estaba
 * ofreciendo —en el cotizador, en el catálogo—, así que se enlazaba a un 404.
 *
 * ACÁ NACEN LOS QUE NO ESTÁN ESCRITOS. Para cada página que el ERP publica y `products.ts` no
 * tiene, se arma una ficha con lo que el ERP sabe: nombre, medidas, rendimiento, peso, foto,
 * colores, precio y las especificaciones —norma, textura, tipo de uso, absorción—.
 *
 * NO SE INVENTA PROSA. «Acabado limpio y elegante en tonos tierra claros, ideal para espacios
 * con estilo cálido y atemporal» no se deduce de ningún dato: eso lo escribe alguien que sabe
 * vender, y ponerle a un producto nuevo el texto de otro es peor que no ponerle ninguno. La
 * descripción que se arma acá dice lo que es y cuánto mide, y nada más. La página sale el mismo
 * día, con sus datos ciertos; el texto de venta se escribe después en `products.ts`, y desde
 * ese momento manda el escrito a mano.
 *
 * ESTA ES LA MITAD BARATA DEL PROBLEMA. La otra mitad —que las fotos buenas, las de proyectos y
 * el PDF de la ficha técnica también lleguen solos— necesita que esas cosas vivan en el ERP.
 * Mientras tanto un producto recién nacido se ve con la foto que le subieron al ERP, que es lo
 * que hay.
 */
import type { Product, ProductSpec } from "@/data/products";
import type { ProductCategory } from "@/data/catalogCategories";
import { erpProductos, type ErpProducto } from "@/data/erpFeed";
import { precioTexto } from "@/data/erpVariants";
import { fichaPdf } from "@/utils/paths";

/** El ERP nombra sus categorías en minúscula; el catálogo de la web, capitalizadas. */
const CATEGORIAS: Record<string, ProductCategory> = {
  fachadas: "Fachadas",
  divisorios: "Divisorios",
  enchapes: "Enchapes",
  techos: "Techos",
  decorativos: "Decorativos",
  /* El ERP tiene «pisos» y el catálogo de la web todavía no. Van a Decorativos, que es donde
     hoy se muestran los de 30×30 y 10×30, hasta que exista la categoría. */
  pisos: "Decorativos",
};

/** Busca una especificación por etiqueta, sin importar tildes ni mayúsculas. */
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
function espec(p: ErpProducto, ...etiquetas: string[]): string {
  for (const e of especificacionesDe(p)) {
    if (etiquetas.some((x) => norm(x) === norm(e.etiqueta))) return e.valor;
  }
  return "";
}

function especificacionesDe(p: ErpProducto): { etiqueta: string; valor: string }[] {
  return (p as { especificaciones?: { etiqueta: string; valor: string }[] }).especificaciones ?? [];
}

/** «5*11*38» → «5 × 11 × 38 cm», para poder decir la medida en una frase. */
function medidaLegible(dimension: string | null): string {
  if (!dimension) return "";
  const partes = dimension.split(/[*x×]/).map((x) => x.trim()).filter(Boolean);
  return partes.length ? `${partes.join(" × ")} cm` : "";
}

/** El precio más bajo entre los colores; si ninguno tiene, ninguno. */
function precioDesde(p: ErpProducto): number | null {
  const vals = (p.colores ?? [])
    .map((c) => (c as { precio?: number | null }).precio)
    .filter((v): v is number => typeof v === "number" && v > 0);
  return vals.length ? Math.min(...vals) : null;
}

function productoDeErp(ps: ErpProducto[], slug: string): Product {
  /* Varios productos comparten página cuando son formatos (los rayados). El primero da el
     nombre y la foto; las medidas se dejan fuera porque cada formato tiene la suya. */
  const p = ps[0];
  const unicoFormato = ps.length === 1;
  const medida = unicoFormato ? medidaLegible(p.dimension) : "";
  const norma = espec(p, "Norma");
  const uso = espec(p, "Tipo de uso", "Aplicación", "Uso");
  const textura = espec(p, "Textura", "Acabado");
  const colores = (p.colores ?? []).map((c) => c.nombre);

  /* La descripción dice lo que es y cuánto mide. Ver la nota de arriba: acá no se inventa. */
  const factual = [p.nombre, medida && `de ${medida}`, "en arcilla cocida"].filter(Boolean).join(" ") + ".";
  const descripcion = (p.descripcion ?? "").trim() || factual;

  /* La ficha ya muestra la textura, el color, las medidas y el peso como campos propios: si
     además viajan en `specs` la tabla los repite. */
  const YA_LOS_MUESTRA = ["textura", "acabado", "color", "colores", "dimensiones", "medidas", "peso"];
  const specs: ProductSpec[] = especificacionesDe(p)
    .filter((e) => !YA_LOS_MUESTRA.includes(norm(e.etiqueta)))
    .map((e) => ({ label: e.etiqueta, value: e.valor }));
  if (p.rendimiento && !specs.some((s) => norm(s.label) === "rendimiento")) {
    specs.push({ label: "Rendimiento", value: `${p.rendimiento} und/m²` });
  }

  const desde = precioDesde(p);
  const partes = unicoFormato ? (p.dimension ?? "").split(/[*x×]/).map((x) => x.trim()).filter(Boolean) : [];
  const nums = partes.map((x) => Number(x.replace(",", "."))).filter((n) => Number.isFinite(n));

  return {
    name: p.nombre,
    slug,
    category: CATEGORIAS[norm(p.categoria ?? "")] ?? "Fachadas",
    shortDescription: descripcion,
    description: descripcion,
    /* El «tipo de uso» del ERP es una frase, no una lista de argumentos de venta. Se pone tal
       cual, como un punto, en vez de partirla en pedazos que no son frases. */
    applications: uso ? [uso] : [],
    color: colores.join(", "),
    texture: textura,
    featured: false,
    seoTitle: `${p.nombre} | Clay House`,
    seoDescription: [descripcion, norma && `Norma ${norma}.`, "Fabricado en Amagá, Antioquia."]
      .filter(Boolean).join(" ").slice(0, 300),
    image: p.imagen ?? "",
    gallery: p.fotos ?? [],
    /* De «5*11*38» el ERP escribe espesor, ancho y largo; la ficha quiere largo y alto, y el
       largo de un ladrillo es siempre su medida mayor. */
    dimensions: nums.length === 3
      ? {
          largo: `${Math.max(...nums)} cm`,
          alto: `${Math.min(...nums)} cm`,
          ancho: `${nums.slice().sort((a, b) => a - b)[1]} cm`,
          pesoAprox: p.pesoKg ? `${String(p.pesoKg).replace(".", ",")} kg` : undefined,
          rendimiento: p.rendimiento ? `${p.rendimiento} und/m²` : undefined,
        }
      : undefined,
    pricePerUnit: precioTexto(desde),
    priceUnitLabel: p.unidad === "m2" ? "m²" : "unidad",
    specs,
    technicalPdf: fichaPdf(slug),
  };
}

/**
 * Las páginas que el ERP publica y `products.ts` no tiene escritas.
 *
 * `escritos` son los slugs escritos a mano: si una página ya está ahí, manda ésa. Lo de acá es
 * el piso, no el techo.
 */
export function productosNacidosEnErp(escritos: ReadonlySet<string>): Product[] {
  const porPagina = new Map<string, ErpProducto[]>();
  for (const p of erpProductos) {
    if (!p.pagina || escritos.has(p.pagina)) continue;
    const ps = porPagina.get(p.pagina);
    if (ps) ps.push(p); else porPagina.set(p.pagina, [p]);
  }
  return [...porPagina.entries()]
    .sort((a, b) => (a[1][0].orden || 0) - (b[1][0].orden || 0))
    .map(([slug, ps]) => productoDeErp(ps, slug));
}
