/**
 * LAS VENTANAS DE LA VIGILANCIA DEL COTIZADOR.
 *
 * `vigilar-cotizaciones.mjs` necesita una clave de servicio para consultar, así que no se
 * puede ejecutar entero sin credenciales. Lo único que tiene lógica —cómo se arma «la
 * última hora» y «hoy»— vive aparte justamente para poder probarlo acá.
 *
 * La ventana se calcula sobre el NÚMERO de solicitud y no sobre una fecha, porque
 * `created_at` puede no existir en esa tabla: es del ERP, no nuestra. Lo que lo hace viable
 * es que `WEB-AAAAMMDD-HHMMSS` ordena igual como texto que como fecha.
 */
import { describe, expect, it } from "vitest";

const { PREFIJO, selloDelDia, selloDelInstante, filtroDesde, filtroDelDia } =
  await import("../scripts/lib/ventana.mjs");

const el = (a: number, m: number, d: number, h = 0, min = 0, s = 0) =>
  new Date(a, m - 1, d, h, min, s);

describe("sellos", () => {
  it("el del día lleva el prefijo de la web y la fecha con ceros", () => {
    expect(selloDelDia(el(2026, 10, 22))).toBe("WEB-20261022");
    expect(selloDelDia(el(2026, 1, 5))).toBe("WEB-20260105");
  });

  it("el del instante añade la hora, también con ceros", () => {
    expect(selloDelInstante(el(2026, 10, 22, 10, 30, 45))).toBe("WEB-20261022-103045");
    expect(selloDelInstante(el(2026, 1, 5, 3, 7, 9))).toBe("WEB-20260105-030709");
  });

  it("coincide con el formato que de verdad escribe el cotizador", async () => {
    const { numeroDeSolicitud } = await import("@/utils/cotizador");
    const fecha = el(2026, 10, 22, 10, 30, 45);
    expect(numeroDeSolicitud(fecha)).toBe(selloDelInstante(fecha));
  });
});

describe("orden como texto", () => {
  /* Es lo que permite usar `>=` para una ventana de tiempo. Si fallara, la vigilancia
     contaría de más o de menos sin avisar. */
  it("un instante posterior siempre ordena después", () => {
    const pares: [Date, Date][] = [
      [el(2026, 10, 22, 10, 0, 0), el(2026, 10, 22, 10, 0, 1)],
      [el(2026, 10, 22, 9, 59, 59), el(2026, 10, 22, 10, 0, 0)],
      [el(2026, 10, 22, 23, 59, 59), el(2026, 10, 23, 0, 0, 0)],
      [el(2026, 12, 31, 23, 59, 59), el(2027, 1, 1, 0, 0, 0)],
      [el(2026, 9, 30, 12, 0, 0), el(2026, 10, 1, 12, 0, 0)],
    ];
    for (const [antes, despues] of pares) {
      expect(selloDelInstante(antes) < selloDelInstante(despues), `${antes} < ${despues}`).toBe(
        true
      );
    }
  });

  it("cruzar la medianoche no rompe la ventana de una hora", () => {
    const ahora = el(2026, 10, 23, 0, 30, 0);
    const haceUnaHora = new Date(ahora.getTime() - 3600_000);
    expect(selloDelInstante(haceUnaHora).startsWith("WEB-20261022-23")).toBe(true);
    /* Lo de hoy ordena después del corte; lo de antier, antes. */
    expect(selloDelInstante(ahora) > selloDelInstante(haceUnaHora)).toBe(true);
    expect(selloDelInstante(el(2026, 10, 22, 22, 0, 0)) < selloDelInstante(haceUnaHora)).toBe(true);
  });
});

describe("filtros de PostgREST", () => {
  it("el de la ventana usa gte sobre el número", () => {
    expect(filtroDesde(el(2026, 10, 22, 10, 30, 45))).toBe("numero=gte.WEB-20261022-103045");
  });

  it("el del día usa like con comodín al final", () => {
    expect(filtroDelDia(el(2026, 10, 22))).toBe("numero=like.WEB-20261022*");
  });

  it("solo cuentan las de la web: el prefijo las separa de las del ERP", () => {
    expect(PREFIJO).toBe("WEB-");
    expect(filtroDelDia(el(2026, 10, 22)).includes(PREFIJO)).toBe(true);
    expect(filtroDesde(el(2026, 10, 22)).includes(PREFIJO)).toBe(true);
  });
});
