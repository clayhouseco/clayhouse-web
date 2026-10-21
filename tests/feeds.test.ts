/**
 * EL SITEMAP Y EL FEED DE MERCHANT: LO QUE LEEN LAS MÁQUINAS.
 *
 * Son los dos archivos del sitio que ninguna persona abre, y por eso un error en ellos dura
 * meses. Un sitemap que declara URLs con una forma distinta a la del canonical le hace
 * gastar rastreo a Google resolviendo el empate; un feed con un campo mal escrito termina en
 * cuenta de Merchant suspendida, y esta ya lo estuvo.
 *
 * Se llaman los endpoints de verdad —los mismos que corre el build— y se revisa el XML que
 * sale.
 */
import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { GET as sitemapGET } from "@/pages/sitemap.xml";
import { GET as feedGET } from "@/pages/feed.xml";
import { cotizableCatalog } from "@/data/cotizacionCatalog";
import { getVisibleProducts } from "@/data/products";
import { site } from "@/data/site";
import { copANumero } from "@/utils/pesos";

/** Los endpoints no usan el contexto de Astro; se les pasa uno vacío. */
const llamar = async (ruta: (ctx: never) => Response | Promise<Response>) => {
  const res = await ruta(undefined as never);
  return { res, xml: await res.text() };
};

const etiquetas = (xml: string, etiqueta: string): string[] =>
  [...xml.matchAll(new RegExp(`<${etiqueta}>([^<]*)</${etiqueta}>`, "g"))].map((m) => m[1]!);

/**
 * El sitemap CONSTRUIDO, para lo que depende del blog.
 *
 * Las entradas del blog salen de una colección de contenido, y esa la monta Astro durante el
 * build: llamando al endpoint desde una prueba, `getCollection("blog")` devuelve vacío. Todo
 * lo demás se comprueba contra el endpoint; estas dos cosas, contra el archivo que de verdad
 * se sube. Si no hay `dist/`, se dicen en voz alta en vez de pasar en silencio.
 */
const SITEMAP_CONSTRUIDO = "dist/sitemap.xml";
const construido = () =>
  fs.existsSync(SITEMAP_CONSTRUIDO) ? fs.readFileSync(SITEMAP_CONSTRUIDO, "utf8") : null;

describe("sitemap.xml", () => {
  it("se sirve como XML", async () => {
    const { res } = await llamar(sitemapGET);
    expect(res.headers.get("Content-Type")).toContain("xml");
  });

  it("declara el urlset con su espacio de nombres", async () => {
    const { xml } = await llamar(sitemapGET);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  });

  it("todas las URLs son absolutas y del dominio del sitio", async () => {
    const { xml } = await llamar(sitemapGET);
    const locs = etiquetas(xml, "loc");
    expect(locs.length).toBeGreaterThan(20);
    for (const loc of locs) expect(loc.startsWith(`${site.url}/`), loc).toBe(true);
  });

  it("ninguna lleva barra final, salvo la raíz: es la forma del canonical", async () => {
    const { xml } = await llamar(sitemapGET);
    for (const loc of etiquetas(xml, "loc")) {
      if (loc === `${site.url}/`) continue;
      expect(loc.endsWith("/"), loc).toBe(false);
    }
  });

  it("ninguna lleva parámetros ni ancla: serían URLs duplicadas", async () => {
    const { xml } = await llamar(sitemapGET);
    for (const loc of etiquetas(xml, "loc")) {
      expect(loc.includes("?"), loc).toBe(false);
      expect(loc.includes("#"), loc).toBe(false);
    }
  });

  it("no repite ninguna URL", async () => {
    const { xml } = await llamar(sitemapGET);
    const locs = etiquetas(xml, "loc");
    expect(new Set(locs).size).toBe(locs.length);
  });

  it("lista todos los productos visibles, y solo esos", async () => {
    const { xml } = await llamar(sitemapGET);
    const locs = new Set(etiquetas(xml, "loc"));
    const fichas = [...locs].filter(
      (l) => /\/productos\/[^/]+$/.test(l) && !l.includes("/categoria/")
    );
    const visibles = getVisibleProducts().map((p) => `${site.url}/productos/${p.slug}`);
    expect(fichas.sort()).toEqual(visibles.sort());
  });

  it("no ofrece a Google las páginas que no se indexan", async () => {
    const { xml } = await llamar(sitemapGET);
    for (const loc of etiquetas(xml, "loc")) {
      expect(/\/404$|\/gracias$/.test(loc), loc).toBe(false);
    }
  });

  it("el lastmod, donde está, es una fecha de verdad", () => {
    const xml = construido();
    expect(
      xml,
      "corre `npm run build` antes: el lastmod sale de la colección del blog"
    ).not.toBeNull();
    const fechas = etiquetas(xml!, "lastmod");
    expect(fechas.length).toBeGreaterThan(0);
    for (const f of fechas) {
      expect(f).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(f)), f).toBe(false);
    }
  });

  it("solo las entradas del blog llevan lastmod: inventarlo le quita valor al sitemap", () => {
    const xml = construido();
    expect(xml, "corre `npm run build` antes").not.toBeNull();
    const conFecha = [...xml!.matchAll(/<loc>([^<]+)<\/loc>\s*\n\s*<lastmod>/g)].map((m) => m[1]!);
    expect(conFecha.length).toBeGreaterThan(0);
    for (const loc of conFecha) expect(loc, loc).toContain("/blog/");
  });

  it("el blog construido está en el sitemap, una vez cada entrada", () => {
    const xml = construido();
    expect(xml, "corre `npm run build` antes").not.toBeNull();
    const entradas = etiquetas(xml!, "loc").filter((l) => l.includes("/blog/"));
    expect(entradas.length).toBeGreaterThan(0);
    expect(new Set(entradas).size).toBe(entradas.length);
    for (const l of entradas) {
      expect(fs.existsSync(`dist${new URL(l).pathname}/index.html`), l).toBe(true);
    }
  });
});

describe("feed.xml (Google Merchant)", () => {
  /** Lo que el feed debería traer: lo cotizable con precio numérico. */
  const conPrecio = cotizableCatalog.filter((i) => copANumero(i.refPrice));

  it("se sirve como XML y es un RSS con el espacio `g:`", async () => {
    const { res, xml } = await llamar(feedGET);
    expect(res.headers.get("Content-Type")).toContain("xml");
    expect(xml).toContain('xmlns:g="http://base.google.com/ns/1.0"');
    expect(xml).toContain('<rss version="2.0"');
  });

  it("trae un artículo por referencia cotizable con precio", async () => {
    const { xml } = await llamar(feedGET);
    const ids = etiquetas(xml, "g:id");
    expect(ids.length).toBe(conPrecio.length);
    expect(ids.length).toBeGreaterThan(10);
  });

  it("el id es el código del ERP: el feed, la web y la factura nombran lo mismo", async () => {
    const { xml } = await llamar(feedGET);
    const ids = new Set(etiquetas(xml, "g:id"));
    for (const item of conPrecio) expect(ids.has(item.erpCodigo ?? item.id), item.label).toBe(true);
  });

  it("no repite ningún id: Merchant rechaza el feed entero", async () => {
    const { xml } = await llamar(feedGET);
    const ids = etiquetas(xml, "g:id");
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("cada artículo trae los campos que Merchant exige", async () => {
    const { xml } = await llamar(feedGET);
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]!);
    expect(items.length).toBeGreaterThan(10);
    for (const item of items) {
      for (const campo of [
        "g:id",
        "g:title",
        "g:description",
        "g:link",
        "g:image_link",
        "g:availability",
        "g:condition",
        "g:price",
        "g:brand",
        "g:mpn",
        "g:product_type",
      ]) {
        expect(item, campo).toContain(`<${campo}>`);
      }
    }
  });

  it("el precio lleva importe y moneda", async () => {
    const { xml } = await llamar(feedGET);
    const precios = etiquetas(xml, "g:price");
    expect(precios.length).toBeGreaterThan(10);
    for (const p of precios) {
      expect(p).toMatch(/^\d+\.00 COP$/);
      expect(Number.parseInt(p, 10)).toBeGreaterThan(0);
    }
  });

  it("los enlaces y las imágenes son absolutos", async () => {
    const { xml } = await llamar(feedGET);
    for (const url of [...etiquetas(xml, "g:link"), ...etiquetas(xml, "g:image_link")]) {
      expect(url.startsWith("https://"), url).toBe(true);
    }
  });

  it("no declara `identifier_exists`: con marca y MPN ya está identificado", async () => {
    const { xml } = await llamar(feedGET);
    expect(xml).not.toContain("identifier_exists");
  });

  it("la medida de precio usa los tokens de Merchant, no las etiquetas de la web", async () => {
    const { xml } = await llamar(feedGET);
    for (const m of etiquetas(xml, "g:unit_pricing_measure")) {
      expect(["1 sqm", "1 m"]).toContain(m);
    }
  });

  it("lo que se vende por pieza omite la medida en vez de inventarse un token", async () => {
    const { xml } = await llamar(feedGET);
    const medidas = etiquetas(xml, "g:unit_pricing_measure").length;
    const porPieza = conPrecio.filter((i) => i.unidad === "unidad").length;
    expect(medidas).toBe(conPrecio.length - porPieza);
  });

  it("las referencias que comparten página se agrupan como variantes", async () => {
    const { xml } = await llamar(feedGET);
    const porSlug = new Map<string, number>();
    for (const i of conPrecio) porSlug.set(i.slug, (porSlug.get(i.slug) ?? 0) + 1);
    const agrupados = etiquetas(xml, "g:item_group_id");
    const esperados = conPrecio.filter((i) => (porSlug.get(i.slug) ?? 0) > 1);
    expect(agrupados.length).toBe(esperados.length);
    for (const g of new Set(agrupados)) expect((porSlug.get(g) ?? 0) > 1, g).toBe(true);
  });

  it("el XML va escapado: un `&` suelto rompe el feed", async () => {
    const { xml } = await llamar(feedGET);
    /* Todo & tiene que ser el comienzo de una entidad. */
    expect(xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;)/g)).toBeNull();
  });
});
