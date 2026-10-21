/**
 * LA COTIZACIÓN: VALIDACIÓN, TEXTO Y FILA DEL ERP.
 *
 * Es la parte del sitio donde un error cuesta dinero: una fila mal armada es una solicitud
 * que el ERP no puede procesar, y nadie se entera hasta que el cliente llama preguntando.
 */
import { describe, expect, it } from "vitest";
import {
  construirFilaErp,
  numeroDeSolicitud,
  notasComerciales,
  resumenMedicion,
  textoCotizacion,
  valorCotizacion,
  validarCotizacion,
  type Cotizacion,
} from "@/utils/cotizador";

const base: Cotizacion = {
  cliente: { nombre: "Ana Restrepo", telefono: "3001234567", email: "ana@obra.co", proyecto: "Casa Alta" },
  entrega: "obra",
  ubicacion: { direccion: "Calle 10 #5-20", municipio: "Envigado", departamento: "Antioquia", lat: "6.17", lng: "-75.59" },
  lineas: [
    {
      codigo: "ROM", producto: "Ladrillo Romano", categoria: "Fachadas",
      colorCodigo: "NAT", colorNombre: "Natural", calidadCodigo: "PRI", calidadNombre: "Primera",
      cantidad: 500, unidad: "unidad", unidadLabel: "Unidad", precioUnitario: 2450,
    },
  ],
};

describe("validación", () => {
  it("pasa con nombre, teléfono y al menos una línea", () => {
    expect(validarCotizacion(base)).toBeNull();
  });

  it("sin nombre no hay a quién llamar", () => {
    const r = validarCotizacion({ ...base, cliente: { ...base.cliente, nombre: "  " } });
    expect(r?.campo).toBe("nombre");
  });

  it("sin teléfono tampoco", () => {
    const r = validarCotizacion({ ...base, cliente: { ...base.cliente, telefono: "" } });
    expect(r?.campo).toBe("telefono");
  });

  it("sin líneas no hay nada que cotizar", () => {
    const r = validarCotizacion({ ...base, lineas: [] });
    expect(r?.campo).toBe("lineas");
  });

  it("el correo no es obligatorio: en obra se trabaja por WhatsApp", () => {
    expect(validarCotizacion({ ...base, cliente: { ...base.cliente, email: undefined } })).toBeNull();
  });
});

describe("número de solicitud", () => {
  it("lleva el prefijo WEB y la fecha, para distinguirlo en el ERP", () => {
    expect(numeroDeSolicitud(new Date(2026, 9, 20, 14, 35, 12))).toBe("WEB-20261020-143512");
  });
});

describe("texto para WhatsApp", () => {
  const texto = textoCotizacion(base);

  it("abre identificando la solicitud y al cliente", () => {
    expect(texto.startsWith("*Solicitud de cotización — Clay House*")).toBe(true);
    expect(texto).toContain("Cliente: Ana Restrepo");
    expect(texto).toContain("Tel: 3001234567 · ana@obra.co");
  });

  it("lista cada producto con su color, calidad, cantidad y unidad", () => {
    expect(texto).toContain("• Ladrillo Romano (Natural · Primera) — 500 Unidad");
  });

  it("dice siempre que el flete no está incluido", () => {
    expect(texto).toContain("el flete NO está incluido");
  });

  it("cuando se recoge en planta no inventa una dirección de obra", () => {
    const t = textoCotizacion({ ...base, entrega: "planta" });
    expect(t).toContain("Recoge en planta");
    expect(t).not.toContain("Envigado");
  });
});

describe("fila del ERP", () => {
  const fila = construirFilaErp(base, { numero: "WEB-X", origen: {} }) as Record<string, any>;

  it("las columnas sueltas describen la primera línea", () => {
    expect(fila.producto_codigo).toBe("ROM");
    expect(fila.cantidad).toBe(500);
    expect(fila.valor_unitario).toBe(2450);
    expect(fila.valor_producto).toBe(500 * 2450);
    expect(fila.unidad).toBe("unidad");
  });

  it("los datos de contacto viajan al ERP: es lo único con lo que pueden responder", () => {
    expect(fila.atencion).toBe("Ana Restrepo");
    expect(fila.telefono).toBe("3001234567");
    expect(fila.email).toBe("ana@obra.co");
  });

  it("las coordenadas van como números, no como texto", () => {
    expect(fila.lat_entrega).toBeCloseTo(6.17);
    expect(fila.lng_entrega).toBeCloseTo(-75.59);
  });

  it("recoger en planta no manda dirección ni coordenadas", () => {
    const f = construirFilaErp({ ...base, entrega: "planta" }) as Record<string, any>;
    expect(f.direccion).toBe("");
    expect(f.municipio).toBeNull();
    expect(f.lat_entrega).toBeNull();
  });

  it("con varias líneas el código suelto dice VARIOS y el detalle va en items", () => {
    const dos: Cotizacion = {
      ...base,
      lineas: [
        { ...base.lineas[0]!, codigo: null },
        { ...base.lineas[0]!, codigo: "TOS", producto: "Ladrillo Toscano", cantidad: 100, precioUnitario: 2250 },
      ],
    };
    const f = construirFilaErp(dos) as Record<string, any>;
    expect(f.producto_codigo).toBe("VARIOS");
    expect(f.items).toHaveLength(2);
    expect(f.items[1].valorProducto).toBe(100 * 2250);
  });
});

describe("notas comerciales", () => {
  it("sin campaña, solo lo esencial", () => {
    const n = notasComerciales(base);
    expect(n[0]).toContain("Solicitud desde la web");
    expect(n.at(-1)).toContain("Flete NO incluido");
  });

  it("con campaña, el asesor ve de dónde llegó", () => {
    const n = notasComerciales(base, {
      utm_source: "google", utm_medium: "cpc", utm_campaign: "romano",
      gclid: "ABC123", landing: "/productos/romano",
    });
    expect(n).toContain("Origen: google / cpc / romano");
    expect(n).toContain("gclid: ABC123");
    expect(n).toContain("Entró por: /productos/romano");
  });
});

describe("resumen para el medidor", () => {
  const r = resumenMedicion(base, "whatsapp") as Record<string, any>;

  it("lleva valor, moneda y canal", () => {
    expect(r.value).toBe(valorCotizacion(base));
    expect(r.currency).toBe("COP");
    expect(r.canal).toBe("whatsapp");
  });

  it("describe el pedido con el código del ERP", () => {
    expect(r.items[0].item_id).toBe("ROM");
    expect(r.items[0].quantity).toBe(500);
  });

  it("NO lleva ningún dato personal", () => {
    const texto = JSON.stringify(r);
    expect(texto).not.toContain("Ana Restrepo");
    expect(texto).not.toContain("3001234567");
    expect(texto).not.toContain("ana@obra.co");
    expect(texto).not.toContain("Envigado");
  });
});
