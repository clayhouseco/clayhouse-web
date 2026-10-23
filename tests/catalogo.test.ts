/**
 * EL CATÁLOGO COTIZABLE: CÓDIGOS, UNIDADES Y PRECIOS.
 *
 * Lo que se prueba acá es lo que el cliente ve y lo que el ERP recibe. Tres cosas que ya
 * fallaron en producción: un producto que se podía cotizar con un código que el ERP no
 * reconoce, un precio en una unidad distinta a la que se cobra, y los tres formatos de
 * rayado cotizados todos al precio del más barato.
 */
import { describe, expect, it } from "vitest";
import { cotizableCatalog } from "@/data/cotizacionCatalog";
import { erpDeCodigo, erpProductos } from "@/data/erpFeed";
import { getVisibleProducts } from "@/data/products";
import { copANumero, normalizarUnidad } from "@/data/unidades";

describe("catálogo cotizable", () => {
  it("no está vacío", () => {
    expect(cotizableCatalog.length).toBeGreaterThan(0);
  });

  it("cada artículo lleva un código que el ERP publica hoy", () => {
    for (const item of cotizableCatalog) {
      expect(item.erpCodigo, `${item.label} sin código`).toBeTruthy();
      expect(erpDeCodigo(item.erpCodigo), `${item.erpCodigo} no existe en el ERP`).not.toBeNull();
    }
  });

  it("la unidad de cada artículo es la que publica el ERP para ese código", () => {
    for (const item of cotizableCatalog) {
      const fila = erpDeCodigo(item.erpCodigo);
      if (!fila) continue;
      expect(item.unidad, `${item.erpCodigo}`).toBe(normalizarUnidad(fila.unidad));
    }
  });

  it("los formatos de una misma página no comparten precio por accidente", () => {
    /* Los rayados verticales son R10V, R12V y R15V, con precios distintos en el ERP. */
    const porPagina = new Map<string, Set<string>>();
    for (const item of cotizableCatalog) {
      if (!porPagina.has(item.slug)) porPagina.set(item.slug, new Set());
      porPagina.get(item.slug)!.add(item.refPrice);
    }
    for (const [slug, precios] of porPagina) {
      const filas = erpProductos.filter((p) => p.pagina === slug);
      const distintosEnErp = new Set(
        filas.map((f) => f.precio).filter((v): v is number => typeof v === "number")
      );
      if (distintosEnErp.size > 1) {
        expect(
          precios.size,
          `${slug} tiene ${distintosEnErp.size} precios en el ERP`
        ).toBeGreaterThan(1);
      }
    }
  });

  it("un precio de referencia es una cifra o dice «Consultar», nunca algo a medias", () => {
    for (const item of cotizableCatalog) {
      if (item.refPrice === "Consultar") continue;
      expect(copANumero(item.refPrice), `${item.erpCodigo}: ${item.refPrice}`).toBeGreaterThan(0);
    }
  });

  it("todo producto visible se puede cotizar", () => {
    /* Que se vea y no se pueda pedir es la peor combinación: el cliente recorre la ficha,
       pulsa «Agregar a cotización» y no encuentra la referencia. */
    const cotizables = new Set(cotizableCatalog.map((i) => i.slug));
    for (const p of getVisibleProducts()) {
      expect(cotizables.has(p.slug), `${p.slug} es visible y no es cotizable`).toBe(true);
    }
  });
});

/**
 * LA UNIDAD QUE DECLARA EL TEXTO LIBRE.
 *
 * La Teja Colonial tenía el campo «unidad de venta» en `unidad` y la descripción diciendo
 * «Unidad de venta m²» —la misma confusión que costó un error de veinte veces en el precio—.
 * El campo se corrigió y la frase se quedó, y ninguna verificación la miraba porque todas
 * comparan campos estructurados.
 *
 * La primera versión de esta regla no disparaba nunca: llevaba un `\b` detrás del grupo, y
 * `²` no es carácter de palabra, así que «m²» nunca cerraba. De ahí la primera prueba.
 */
describe("unidad declarada en la descripción", async () => {
  const { unidadEnTexto } = await import("../scripts/lib/catalogo.mjs");

  it("la lee aunque la unidad lleve el símbolo ²", () => {
    expect(unidadEnTexto("Teja Colonial comercializada. Unidad de venta m². Solo Primera.")).toBe(
      "m2"
    );
  });

  it("entiende las otras formas de decirlo", () => {
    expect(unidadEnTexto("Se vende por ml, en lotes.")).toBe("ml");
    expect(unidadEnTexto("Unidad de venta: unidad")).toBe("unidad");
    expect(unidadEnTexto("Venta por m2.")).toBe("m2");
  });

  it("un rendimiento NO es una unidad de venta", () => {
    expect(unidadEnTexto("Ladrillo de fachada. Rendimiento ≈ 20 und/m².")).toBeNull();
    expect(unidadEnTexto("Rinde 12 piezas por m² en muro de soga.")).toBeNull();
  });

  it("sin descripción no inventa nada", () => {
    expect(unidadEnTexto("")).toBeNull();
    expect(unidadEnTexto(null)).toBeNull();
    expect(unidadEnTexto(undefined)).toBeNull();
  });
});

/**
 * EN CUBIERTAS, EL RENDIMIENTO LO MIDE EL ERP — NO SE CALCULA.
 *
 * Un ladrillo teja el plano, así que de su cara y la junta sale cuántos caben en un metro.
 * Una teja se traslapa: se monta sobre la de abajo y sobre la de al lado, y lo que queda a
 * la vista es menos que su medida. Calcularlo da una cifra plausible y falsa.
 *
 * La Teja S lo mostró: su medida «30*45*9» daba tres números, así que se le calculaba una
 * tabla —22 piezas/m²— que ninguna ficha mostraba pero que mandaba sobre el titular del
 * catálogo. La tarjeta anunciaba «≈ $ 73.040/m²» cuando el ERP publica 10,5 und/m², o sea
 * $ 34.860. Inflado 2,1 veces, justo en la cifra con la que se comparan cubiertas.
 */
describe("precio por m² en cubiertas", async () => {
  const { getVisibleProducts } = await import("@/data/products");
  const { getRendimientoTable, getReferencePriceM2 } = await import("@/utils/productPricing");
  const techos = getVisibleProducts().filter((p) => p.category === "Techos");

  it("hay cubiertas que comprobar", () => {
    expect(techos.length).toBeGreaterThan(0);
  });

  it("ninguna cubierta genera una tabla de rendimiento calculada", () => {
    for (const p of techos) expect(getRendimientoTable(p), p.slug).toBeNull();
  });

  it("su precio por m² sale del rendimiento que publica el ERP, no de la geometría", () => {
    for (const p of techos) {
      const m2 = getReferencePriceM2(p);
      if (!m2) continue;
      const porM2 = copANumero(m2);
      const porUnidad = copANumero(p.pricePerUnit);
      const rendimiento = Number.parseFloat(
        String(p.dimensions?.rendimiento ?? "")
          .replace(",", ".")
          .replace(/[^\d.]/g, "")
      );
      if (!porM2 || !porUnidad || !rendimiento) continue;
      /* El redondeo de las piezas por metro admite una pieza de holgura. */
      expect(Math.abs(porM2 / porUnidad - rendimiento), `${p.slug}: ${m2}`).toBeLessThan(1);
    }
  });
});

/**
 * CADA PRODUCTO DICE ALGO ÚTIL SOBRE LA OTRA UNIDAD — PERO NO SE INVENTA UN PRECIO.
 *
 * Lo que se vende por pieza publica su precio por m²: es una pregunta real de presupuesto y
 * que dependa de la junta es correcto, porque el cliente elige la junta.
 *
 * Lo que se factura por m² NO publica un precio por pieza. Hubo uno durante unas horas y
 * estaba mal: dividir el precio del metro entre las piezas que caben da una cifra que se
 * mueve un 43% según el espesor de la pega —$ 1.492 con junta perdida, $ 2.131 con 2 cm— y
 * al revés de la intuición. La pieza física cuesta lo que cuesta; lo que cambia es cuántas
 * caben. Y no se puede comprar una. En su lugar se dice el rendimiento, que es cierto.
 */
describe("la otra unidad", async () => {
  const { getVisibleProducts } = await import("@/data/products");
  const { getReferencePriceM2, getPiezasPorM2Label } = await import("@/utils/productPricing");

  const conPrecio = getVisibleProducts().filter((p) => copANumero(p.pricePerUnit));

  it("todo producto con precio dice algo de la otra unidad", () => {
    for (const p of conPrecio) {
      const otra = getReferencePriceM2(p) ?? getPiezasPorM2Label(p);
      expect(otra, `${p.slug} (${p.pricePerUnit}/${p.priceUnitLabel})`).toBeTruthy();
    }
  });

  it("vendido por pieza, el metro siempre vale MÁS que la pieza", () => {
    for (const p of conPrecio) {
      const m2 = copANumero(getReferencePriceM2(p));
      if (!m2) continue;
      /* Si se invirtiera, estaríamos dividiendo donde hay que multiplicar: la familia de
         errores de la teja colonial y la teja S. */
      expect(m2, `${p.slug}`).toBeGreaterThan(copANumero(p.pricePerUnit)!);
    }
  });

  it("lo que se factura por m² NO publica un precio por pieza", () => {
    const porMetro = conPrecio.filter((p) => p.priceUnitLabel === "m²");
    expect(porMetro.length).toBeGreaterThan(0);
    for (const p of porMetro) {
      expect(getReferencePriceM2(p), p.slug).toBeNull();
      /* Lo que sí dice: cuántas piezas lleva el metro. */
      expect(getPiezasPorM2Label(p), p.slug).toMatch(/^\d+ piezas\/m²$/);
    }
  });
});
