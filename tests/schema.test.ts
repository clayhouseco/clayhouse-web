/**
 * DATOS ESTRUCTURADOS DE PRODUCTO.
 *
 * Es lo que Google lee para mostrar precio y disponibilidad. Un `sku` que no existe en el
 * ERP o un precio sin unidad son errores que no se ven en la página: se ven en los
 * resultados de búsqueda, semanas después.
 */
import { describe, expect, it } from "vitest";
import { getVisibleProducts } from "@/data/products";
import { erpDeCodigo } from "@/data/erpFeed";
import { buildProductJsonLd } from "@/utils/productSchema";
import { copANumero } from "@/data/unidades";

const productos = getVisibleProducts();

describe("Product JSON-LD", () => {
  it("el sku es el código con el que factura el ERP, no el slug de la web", () => {
    for (const p of productos) {
      const nodo = buildProductJsonLd(p) as Record<string, unknown>;
      const sku = String(nodo.sku);
      /* Si el ERP conoce ese código, el sku es ese; nunca el slug cuando hay código. */
      if (erpDeCodigo(sku)) {
        expect(nodo.mpn).toBe(sku);
      } else {
        expect(sku, `${p.slug} usó el slug como sku`).toBe(p.slug);
      }
    }
  });

  it("cuando hay precio, viene con moneda y con la unidad en que se vende", () => {
    for (const p of productos) {
      const nodo = buildProductJsonLd(p) as any;
      const oferta = nodo.offers;
      expect(oferta.priceCurrency).toBe("COP");
      if (!p.pricePerUnit) continue;
      expect(copANumero(String(oferta.price))).toBeGreaterThan(0);
      expect(oferta.priceSpecification["@type"]).toBe("UnitPriceSpecification");
      expect(oferta.priceSpecification.unitText).toBe(p.priceUnitLabel ?? "unidad");
      /* MTK es metro cuadrado y C62 es unidad, en el código que entiende Google. */
      expect(oferta.priceSpecification.unitCode).toBe(p.priceUnitLabel === "m²" ? "MTK" : "C62");
    }
  });

  it("sin precio no se publica una cifra, se dice que es bajo cotización", () => {
    const sinPrecio = productos.find((p) => !p.pricePerUnit);
    if (!sinPrecio) return;
    const nodo = buildProductJsonLd(sinPrecio) as any;
    expect(nodo.offers.price).toBeUndefined();
    expect(String(nodo.offers.priceSpecification.description)).toMatch(/cotizaci/i);
  });

  it("la imagen es una dirección absoluta: Google no resuelve rutas relativas", () => {
    for (const p of productos) {
      const nodo = buildProductJsonLd(p) as Record<string, unknown>;
      expect(String(nodo.image)).toMatch(/^https:\/\//);
    }
  });
});
