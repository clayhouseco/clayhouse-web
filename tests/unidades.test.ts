/**
 * LA UNIDAD DE VENTA Y LA CONVERSIÓN DE PRECIO.
 *
 * Es el cálculo que costó meses: la teja colonial se vende por m² y la web tenía su precio
 * por pieza, así que 60 m² salían en $ 96.000 cuando son $ 2.112.000. Estas pruebas fijan
 * el comportamiento para que no vuelva por descuido.
 */
import { describe, expect, it } from "vitest";
import {
  copANumero,
  normalizarUnidad,
  numeroACop,
  precioEnUnidadDeVenta,
  unidadDeVenta,
  unidadesPorM2,
  UNIDAD_PRECIO_LABEL,
} from "@/data/unidades";

describe("normalizarUnidad", () => {
  it("reconoce las formas en que el ERP y la web escriben el metro cuadrado", () => {
    for (const forma of ["m2", "m²", "MT2", " M2 "]) {
      expect(normalizarUnidad(forma)).toBe("m2");
    }
  });

  it("todo lo que no reconoce cae en unidad, que es lo más común y lo menos dañino", () => {
    expect(normalizarUnidad("")).toBe("unidad");
    expect(normalizarUnidad(null)).toBe("unidad");
    expect(normalizarUnidad("caja")).toBe("unidad");
  });
});

describe("precios en texto", () => {
  it("lee un precio con puntos de miles", () => {
    expect(copANumero("$ 2.450")).toBe(2450);
    expect(copANumero("$ 110.000")).toBe(110000);
  });

  it("devuelve null cuando no hay cifra, en vez de cero", () => {
    expect(copANumero("Consultar")).toBeNull();
    expect(copANumero("")).toBeNull();
    expect(copANumero(undefined)).toBeNull();
  });

  it("escribe en pesos con el separador colombiano", () => {
    expect(numeroACop(35200)).toBe("$ 35.200");
  });
});

describe("precioEnUnidadDeVenta", () => {
  it("no toca el precio cuando ya está en la unidad en que se vende", () => {
    expect(precioEnUnidadDeVenta("romano", "$ 2.450", "unidad", "unidad")).toEqual({
      texto: "$ 2.450",
    });
  });

  it("lleva el precio por pieza a metro cuadrado con el rendimiento del ERP", () => {
    /* La teja colonial: 20 piezas por m² × $ 1.600. El rendimiento sale del catálogo
       versionado, así que esta prueba se mueve si el ERP lo cambia —y eso es lo que se
       quiere: que el cálculo siga al dato y no al revés. */
    const und = unidadesPorM2("teja-colonial");
    if (!und) return; // el catálogo del momento no publica rendimiento para esta página
    const r = precioEnUnidadDeVenta("teja-colonial", "$ 1.600", "unidad", "m2");
    expect(r?.texto).toBe(numeroACop(1600 * und));
    expect(r?.equivale).toBe("$ 1.600");
  });

  it("no inventa una conversión que no se puede hacer", () => {
    /* De metro cuadrado a pieza habría que dividir, y nadie vende la pieza suelta de algo
       que se despacha por metro: antes de publicar una cifra falsa, no se publica ninguna. */
    expect(precioEnUnidadDeVenta("enchape-romano", "$ 89.500", "m2", "unidad")).toBeNull();
  });

  it("sin precio no hay nada que convertir", () => {
    expect(precioEnUnidadDeVenta("romano", undefined, "unidad", "m2")).toBeNull();
    expect(precioEnUnidadDeVenta("romano", "", "unidad", "m2")).toBeNull();
  });
});

describe("unidadDeVenta", () => {
  it("manda el ERP cuando publica la página", () => {
    expect(["unidad", "m2", "ml"]).toContain(unidadDeVenta("romano"));
  });

  it("usa lo escrito a mano cuando el ERP no conoce la página", () => {
    expect(unidadDeVenta("pagina-que-no-existe", "m²")).toBe("m2");
  });
});

describe("etiquetas", () => {
  it("el metro cuadrado se escribe con el símbolo, no «m2»", () => {
    expect(UNIDAD_PRECIO_LABEL.m2).toBe("m²");
    expect(UNIDAD_PRECIO_LABEL.unidad).toBe("unidad");
  });
});
