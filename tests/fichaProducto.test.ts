/**
 * LA FICHA DE PRODUCTO: QUÉ SE PUBLICA Y QUÉ NO.
 *
 * Estas reglas vivían dentro de `[slug].astro` y solo se podían comprobar construyendo el
 * sitio y mirando la página. La primera prueba de acá es una que falló al sacarlas: el
 * calado tiene `dimensions` con los tres campos vacíos, y preguntando por el objeto en vez
 * de por la línea salía una fila «Dimensiones» sin nada al lado.
 */
import { describe, expect, it } from "vitest";
import {
  descargasDeFicha,
  fichaConVersion,
  filasDeEspecificacion,
  galeriaDeProducto,
  imagenDeCompartir,
  lineaDeDimensiones,
} from "@/utils/fichaProducto";
import { getProduct, getVisibleProducts } from "@/data/products";
import { getProductAssets } from "@/data/productVariants";

const romano = getProduct("romano")!;
const calado = getProduct("calado")!;

describe("línea de dimensiones", () => {
  it("va de menor a mayor, como se dicta una medida en obra", () => {
    const linea = lineaDeDimensiones(romano);
    expect(linea).toBeTruthy();
    const nums = linea!.split("×").map((x) => Number.parseFloat(x));
    expect(nums).toEqual([...nums].sort((a, b) => a - b));
  });

  it("es null cuando el producto no tiene medidas publicadas", () => {
    expect(lineaDeDimensiones(calado)).toBeNull();
  });
});

describe("filas de especificación", () => {
  const filas = (p = romano, opciones = { hayTablaDeRendimiento: false }) =>
    filasDeEspecificacion(p, getProductAssets(p.slug)?.variants[0], opciones);

  it("ninguna fila sale sin valor", () => {
    for (const p of getVisibleProducts()) {
      for (const f of filas(p)) {
        expect(f.value?.trim(), `${p.slug} · ${f.label}`).toBeTruthy();
      }
    }
  });

  it("el calado no publica una fila «Dimensiones» vacía", () => {
    expect(filas(calado).some((f) => f.label === "Dimensiones")).toBe(false);
  });

  it("empieza por textura y color: es lo primero que se pregunta", () => {
    const f = filas();
    expect(f[0]?.label).toBe("Textura");
    expect(f[1]?.label).toBe("Color");
  });

  it("la textura la manda la variante, no el producto", () => {
    const assets = getProductAssets("romano");
    const variante = assets?.variants.find((v) => v.texturaNombre);
    if (!variante) return;
    const f = filasDeEspecificacion(romano, variante, { hayTablaDeRendimiento: false });
    expect(f[0]?.value).toBe(variante.texturaNombre);
  });

  it("con tabla de rendimiento no repite el dato como fila suelta", () => {
    const conTabla = filas(romano, { hayTablaDeRendimiento: true });
    expect(conTabla.some((f) => f.label === "Rendimiento")).toBe(false);
  });

  it("sin tabla, el rendimiento sí se publica donde exista", () => {
    const teja = getProduct("teja-colonial");
    if (!teja) return;
    const f = filasDeEspecificacion(teja, undefined, { hayTablaDeRendimiento: false });
    expect(f.some((x) => x.label === "Rendimiento")).toBe(true);
  });
});

describe("fichas en PDF", () => {
  it("un archivo que no existe no se ofrece", () => {
    expect(fichaConVersion("/images/products/no-existe/ficha.pdf")).toBeNull();
  });

  it("la ficha que existe lleva versión por contenido", () => {
    const d = descargasDeFicha(romano, getProductAssets("romano"));
    expect(d.principal).toMatch(/\.pdf\?v=[0-9a-f]{8}$/);
  });

  it("los rayados tienen una ficha por dimensión, y la principal es una de ellas", () => {
    const p = getProduct("rayados-verticales");
    if (!p) return;
    const d = descargasDeFicha(p, getProductAssets(p.slug));
    expect(d.variantes.length).toBeGreaterThan(1);
    expect(d.principal).toBe(d.variantes[0]!.url);
    const mapa = JSON.parse(d.mapaJson!) as Record<string, { url: string }>;
    expect(Object.keys(mapa).length).toBe(d.variantes.length);
  });

  it("ninguna URL ofrecida apunta a un archivo inexistente", () => {
    for (const p of getVisibleProducts()) {
      const d = descargasDeFicha(p, getProductAssets(p.slug));
      for (const v of d.variantes) expect(v.url, `${p.slug}/${v.id}`).toMatch(/\?v=/);
    }
  });
});

describe("galería", () => {
  it("un producto sin manifiesto arma la galería con lo que tiene, y abre con la foto principal", () => {
    const sinManifiesto = getVisibleProducts().find((p) => !getProductAssets(p.slug));
    if (!sinManifiesto) return;
    const fotos = galeriaDeProducto(sinManifiesto, undefined, "default");
    expect(fotos.length).toBeGreaterThan(0);
    expect(fotos[0]!.label).toBe("Producto");
    for (const f of fotos) {
      expect(f.src, sinManifiesto.slug).toBeTruthy();
      expect(f.alt, sinManifiesto.slug).toBeTruthy();
    }
  });

  it("todos los productos visibles tienen al menos una foto", () => {
    for (const p of getVisibleProducts()) {
      const fotos = galeriaDeProducto(
        p,
        getProductAssets(p.slug),
        getProductAssets(p.slug)?.variants[0]?.id ?? "default"
      );
      expect(fotos.length, p.slug).toBeGreaterThan(0);
    }
  });
});

describe("imagen de compartir", () => {
  it("se usa la del producto cuando existe", () => {
    expect(imagenDeCompartir("romano")).toBe("/images/og/romano.jpg");
  });

  it("y undefined cuando no, para caer en la genérica del sitio", () => {
    expect(imagenDeCompartir("no-existe-este-producto")).toBeUndefined();
  });
});
