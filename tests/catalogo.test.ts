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
