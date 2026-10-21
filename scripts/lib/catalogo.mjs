/**
 * EN QUÉ NO COINCIDEN EL ERP Y LA WEB — CALCULADO UNA SOLA VEZ.
 *
 * Tres comandos preguntaban lo mismo por separado y se contestaban distinto. El peor caso:
 * `sync:erp` leía el precio solo dentro de `colores`, así que decía que los rayados no tenían
 * precio en el ERP —tienen tres, uno por formato, en el campo `precio` del producto— y la
 * recomendación que salía de ahí era asignarles un color que no necesitan. La página, en
 * cambio, sí los leía. Un informe que contradice al código no lo lee nadie dos veces.
 *
 * Acá vive el cálculo y de acá lo toman los dos comandos:
 *   · `scripts/sync-erp.mjs`      — baja el catálogo y escribe el informe.
 *   · `scripts/verificar-datos.mjs` — imprime la tabla y, con --strict, falla el despliegue.
 *
 * REGLA DE FONDO: acá no se decide ningún dato. Se dice quién debería decidirlo. El peso de
 * un ladrillo no lo resuelve un script —lo resuelve una balanza— y las medidas en disputa
 * tampoco. Lo que sí se puede afirmar es que el precio y la unidad los manda quien factura.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { conflictosDeFichas } from "../fichas/verificar.mjs";

export const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dato = (f) => fs.readFileSync(path.join(raiz, "src/data", f), "utf8");

/* ─────────────────────────── las dos fuentes ─────────────────────────── */

export function leerFeed() {
  try {
    return JSON.parse(fs.readFileSync(path.join(raiz, "src/data/erpFeed.json"), "utf8"));
  } catch {
    return null;
  }
}

/** Días desde que se bajó el catálogo que va a salir publicado. */
export function edadDelFeed(feed) {
  const t = Date.parse(feed?.actualizado ?? "");
  if (!Number.isFinite(t)) return null;
  return (Date.now() - t) / 86_400_000;
}

/**
 * Las fichas escritas a mano, leídas del texto de `products.ts`.
 *
 * Se parte por producto y no se barre el archivo con un regex corrido: hay campos que un
 * producto declara y el siguiente no, y un regex corrido empareja el campo de uno con el
 * slug del otro. Ya pasó en el generador de imágenes de compartir.
 */
export function productosDeLaWeb() {
  const ts = dato("products.ts");
  const inicios = [...ts.matchAll(/\n {4}slug: "/g)].map((m) => m.index);
  const out = [];
  for (let i = 0; i < inicios.length; i++) {
    const b = ts.slice(inicios[i], inicios[i + 1] ?? ts.length);
    const uno = (re) => b.match(re)?.[1];
    out.push({
      slug: uno(/slug: "([^"]+)"/),
      nombre: uno(/name: "([^"]+)"/),
      categoria: uno(/category: "([^"]+)"/),
      precio: uno(/pricePerUnit: "([^"]+)"/),
      desde: uno(/priceFrom: "([^"]+)"/),
      unidad: uno(/priceUnitLabel: "([^"]+)"/) ?? "unidad",
      largo: uno(/largo: "([^"]+)"/),
      ancho: uno(/ancho: "([^"]+)"/),
      alto: uno(/alto: "([^"]+)"/),
      peso: uno(/pesoAprox: "([^"]+)"/),
      oculto: /hidden: true/.test(b),
    });
  }
  return out.filter((p) => p.slug);
}

/** Los códigos de ERP_MAP: slug → código, y código → de dónde sale. */
export function codigosDeLaWeb() {
  const ts = dato("erpCatalog.ts");
  const ini = ts.indexOf("const ERP_MAP");
  const mapa = ts.slice(ini, ts.indexOf("\n};", ini));
  const porCodigo = new Map();
  // Llaves balanceadas, no líneas: en ERP_MAP hay entradas de una línea y de varias, y un
  // recorrido por líneas se salta justo las cortas.
  const re = /^\s{2}"?([a-z0-9-]+)"?:\s*\{/gm;
  for (let m; (m = re.exec(mapa));) {
    let nivel = 0,
      i = m.index + m[0].length - 1,
      fin = i;
    for (; i < mapa.length; i++) {
      if (mapa[i] === "{") nivel++;
      else if (mapa[i] === "}" && --nivel === 0) {
        fin = i;
        break;
      }
    }
    const cuerpo = mapa.slice(m.index, fin + 1);
    const uno = cuerpo.match(/codigo:\s*"([^"]+)"/);
    if (uno) porCodigo.set(uno[1], { slug: m[1], variante: null });
    const pv = cuerpo.match(/porVariante:\s*\{([^}]*)\}/);
    if (pv)
      for (const mm of pv[1].matchAll(/"?([\w.x]+)"?:\s*"([^"]+)"/g))
        porCodigo.set(mm[2], { slug: m[1], variante: mm[1] });
  }
  return porCodigo;
}

export function inactivosDeInventario() {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(raiz, "src/data/availability.json"), "utf8"));
    return {
      slugs: new Set(j.inactive ?? []),
      fecha: j.updatedAt ?? null,
      fuente: j.source ?? null,
    };
  } catch {
    return { slugs: new Set(), fecha: null, fuente: null };
  }
}

/* ─────────────────────── lo que el ERP dice de un producto ─────────────────────── */

export const numero = (v) => {
  const d = String(v ?? "").replace(/[^\d]/g, "");
  return d ? Number.parseInt(d, 10) : null;
};
export const cm = (v) => {
  const m = String(v ?? "").match(/(\d+(?:[.,]\d+)?)/);
  return m ? Number.parseFloat(m[1].replace(",", ".")) : null;
};
export const medidasErp = (d) =>
  (String(d ?? "").match(/\d+(?:[.,]\d+)?/g) || []).map((x) =>
    Number.parseFloat(x.replace(",", "."))
  );

export const normalizarUnidad = (raw) => {
  const v = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (v === "m2" || v === "m²" || v === "mt2") return "m2";
  if (v === "ml" || v === "mt") return "ml";
  return "unidad";
};

/**
 * El precio que el ERP publica para una fila, EN LA UNIDAD DEL ERP.
 *
 * Es la misma regla que aplica la página (`precioDesde` en erpProductos.ts): el precio vive
 * dentro de cada color cuando el producto maneja color, y en el campo `precio` cuando no
 * —los rayados, los macizos, los pisos y las tejas no manejan color—. Mirar solo los colores
 * dejaba sin precio a 21 de 22 productos.
 */
export function precioDeErp(fila) {
  const colores = (fila.colores ?? [])
    .map((c) => c.precio)
    .filter((v) => typeof v === "number" && v > 0);
  if (colores.length) return Math.min(...colores);
  return typeof fila.precio === "number" && fila.precio > 0 ? fila.precio : null;
}

/** El precio más bajo de una página (puede agrupar varios formatos). */
export function precioDePagina(filas) {
  const v = filas.map(precioDeErp).filter((x) => typeof x === "number");
  return v.length ? Math.min(...v) : null;
}

/** "≈ 22 und/m²" → 22. Único rendimiento válido en tejas: se traslapan. */
export function unidadesPorM2(filas) {
  for (const p of filas) {
    const m = String(p.rendimiento ?? "").match(/(\d+(?:[.,]\d+)?)\s*und/i);
    if (m) {
      const n = Number.parseFloat(m[1].replace(",", "."));
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return null;
}

/* ──────────────────────────── la tabla de conflictos ──────────────────────────── */

/** Quién debería decidir cada campo, y por qué. Es la única parte opinable de este archivo. */
/**
 * LA UNIDAD DE VENTA QUE DECLARA UNA DESCRIPCIÓN, SI DECLARA ALGUNA.
 *
 * La descripción del ERP es texto libre, y el texto libre envejece sin que nada lo note. La
 * Teja Colonial lo mostró: su campo «unidad de venta» decía `unidad` y su descripción seguía
 * diciendo «Unidad de venta m²» —la misma confusión que causó el error de veinte veces en el
 * precio—. El campo se corrigió; la frase se quedó, y ninguna verificación la miraba porque
 * todas comparan campos estructurados.
 *
 * Solo cuenta una unidad DECLARADA como tal: «unidad de venta X», «se vende por X». No
 * cualquier mención: «≈ 20 und/m²» es un rendimiento, no una unidad de venta, y señalarlo
 * sería ruido que acabaría enseñando a ignorar el informe.
 *
 * Devuelve la unidad normalizada, o null si la frase no declara ninguna.
 */
export function unidadEnTexto(descripcion) {
  /* `(?![a-z…])` y no `\b`: `²` no es carácter de palabra, así que un `\b` detrás de «m²»
     nunca cierra y la regla no dispara nunca. Pasó. */
  const DECLARA =
    /(?:unidad\s+de\s+venta|se\s+vende(?:\s+(?:por|en))?|venta\s+(?:por|en))\s*:?\s*(m2|m²|ml|metro\s+lineal|unidad(?:es)?|und)(?![a-záéíóúñ])/i;
  const dicho = (descripcion ?? "").match(DECLARA)?.[1];
  return dicho ? normalizarUnidad(dicho) : null;
}

export const MANDA = {
  erp: "ERP",
  web: "Web",
  medicion: "Medición",
  norma: "Norma aplicable",
  ensayo: "Ensayo",
};

const fila = (slug, campo, web, erp, manda, accion, bloquea = false) => ({
  slug,
  campo,
  web,
  erp,
  manda,
  accion,
  bloquea,
});

/**
 * Todo lo que no coincide, en una sola lista con las seis columnas que pidió la auditoría:
 * producto, campo, valor web, valor ERP, fuente que debería prevalecer y acción requerida.
 */
export function conflictos(feed) {
  const filas = [];
  const web = productosDeLaWeb();
  const slugsWeb = new Set(web.map((p) => p.slug));
  const porSlug = new Map();
  for (const p of feed.productos ?? []) {
    if (!p.pagina) continue;
    if (!porSlug.has(p.pagina)) porSlug.set(p.pagina, []);
    porSlug.get(p.pagina).push(p);
  }
  const codigos = codigosDeLaWeb();
  const codigosErp = new Set((feed.productos ?? []).map((p) => p.codigo).filter(Boolean));

  /* La pieza más barata que vende la fábrica, según el propio catálogo. Sirve de referencia
     para saber si un precio por m² está en la escala de un metro o en la de una pieza. */
  const piezaMasBarata = (feed.productos ?? [])
    .filter((p) => normalizarUnidad(p.unidad) === "unidad")
    .map(precioDeErp)
    .filter((v) => typeof v === "number" && v > 0)
    .reduce((min, v) => (min === null || v < min ? v : min), null);

  /* ── 1. Quién está en cada lista ── */
  for (const p of web) {
    if (porSlug.has(p.slug)) continue;
    filas.push(
      fila(
        p.slug,
        "publicación",
        "ficha escrita en la web",
        "no lo publica",
        MANDA.erp,
        "marcar `mostrar_web` en el ERP, o bajar la ficha de la web"
      )
    );
  }
  for (const [slug] of porSlug) {
    if (slugsWeb.has(slug)) continue;
    filas.push(
      fila(
        slug,
        "textos de venta",
        "ficha armada sola con los datos del ERP",
        "lo publica",
        MANDA.web,
        "escribirle textos de venta y fotos de marca cuando entre al protocolo"
      )
    );
  }
  for (const p of feed.productos ?? []) {
    if (p.codigo) continue;
    filas.push(
      fila(
        p.pagina ?? p.id,
        "código",
        "—",
        "publicado sin código",
        MANDA.erp,
        "asignarle código en el ERP: sin él no se puede cotizar ni inventariar",
        true
      )
    );
  }
  /* Fotos que el ERP nombra y el repositorio no tiene. Va acá y no en el repaso campo a
     campo porque ese solo mira los productos con ficha escrita a mano, y un producto nacido
     en el ERP no tiene otras fotos: si su ruta no existe, su galería se queda vacía.

     El ERP las guarda con el prefijo de su propio sitio (`/productos/…` donde acá es
     `/images/…`), así que se prueban las dos formas, igual que `fotosServibles` en
     erpProductos.ts. Lo que queda es lo que de verdad falta: la ficha ya no publica una
     imagen rota, pero la foto sigue haciendo falta y solo alguien puede subirla. */
  const hayArchivo = (u) =>
    fs.existsSync(path.join("public", decodeURIComponent(u).replace(/^\//, "")));
  for (const [slug, filasErp] of porSlug) {
    const faltantes = [
      ...new Set(
        filasErp
          .flatMap((x) => [
            x.imagen,
            ...(x.fotos || []),
            ...(x.colores || []).flatMap((c) => [c.imagen, ...(c.fotos || [])]),
          ])
          .filter((u) => u && !/^https?:/.test(u))
          .filter((u) => !hayArchivo(u) && !hayArchivo(u.replace(/^\/productos\//, "/images/")))
      ),
    ];
    if (faltantes.length)
      filas.push(
        fila(
          slug,
          "fotos",
          "no tiene el archivo",
          faltantes.join(", "),
          MANDA.web,
          "subir la foto al repositorio en esa ruta, o quitar la referencia en el ERP"
        )
      );
  }

  /* Una unidad declarada en la descripción que contradice al campo. Ver `unidadEnTexto`. */
  for (const p of feed.productos ?? []) {
    const enFrase = unidadEnTexto(p.descripcion);
    if (!enFrase) continue;
    const enCampo = normalizarUnidad(p.unidad);
    if (enFrase === enCampo) continue;
    filas.push(
      fila(
        p.pagina ?? p.id,
        "unidad · descripción",
        `campo: ${enCampo}`,
        `la descripción dice ${enFrase}`,
        MANDA.erp,
        /* No bloquea el despliegue: no se sabe cuál de los dos está mal, y dejar al equipo
         sin publicar por una frase ambigua es peor que el aviso. Si el que estuviera mal
         fuera el CAMPO, lo atrapa la comprobación de coherencia precio/unidad, que sí
         bloquea. */
        "corregir la frase en el ERP: el campo manda y el texto se quedó viejo"
      )
    );
  }

  for (const [codigo, de] of codigos) {
    if (codigosErp.has(codigo)) continue;
    filas.push(
      fila(
        de.slug,
        "código",
        codigo,
        "no existe",
        MANDA.erp,
        "crear el código en el ERP, o borrar su entrada de ERP_MAP; mientras tanto el producto no entra al cotizador"
      )
    );
  }

  /* ── 2. Campo a campo ── */
  for (const [slug, filasErp] of porSlug) {
    const p = web.find((x) => x.slug === slug);
    if (!p) continue;
    const e = filasErp[0];

    // Unidad de venta. La página ya sigue la del ERP; lo que queda en disputa es el precio
    // escrito a mano, que está en otra unidad y hay que convertir en cada build.
    const unidadErp = normalizarUnidad(e.unidad);
    const unidadWeb = normalizarUnidad(p.unidad);
    if (unidadErp !== unidadWeb) {
      const und = unidadesPorM2(filasErp);
      /* Si el ERP publica su propio precio, no hay nada que convertir: la página usa ese, en
         la unidad del ERP, y lo escrito a mano queda de respaldo viejo —molesto, no grave—.
         Solo cuando el precio lo pone la web hay que llevarlo a la otra unidad, y entonces
         sí importa si se puede. */
      const loResuelveElErp = precioDePagina(filasErp) !== null;
      const convertible =
        unidadErp === "m2" && unidadWeb === "unidad" && !!und && !!numero(p.precio);
      filas.push(
        fila(
          slug,
          "unidad de venta",
          `precio por ${unidadWeb}`,
          unidadErp,
          MANDA.erp,
          loResuelveElErp
            ? `la página publica el precio del ERP en su unidad; el escrito a mano en products.ts quedó en ${unidadWeb} y conviene actualizarlo o borrarlo`
            : convertible
              ? `la página convierte con el rendimiento del ERP (${und} und/m²); poner el precio por m² en el ERP para no depender de la conversión`
              : "no hay rendimiento publicado con el que convertir el precio: la página no muestra cifra hasta que el ERP publique precio por m²",
          !loResuelveElErp && !convertible
        )
      );
    }

    // Precio. Manda el ERP y la página ya lo usa; el escrito a mano queda como respaldo
    // silencioso, y un respaldo viejo es peor que ninguno.
    const pe = precioDePagina(filasErp);
    const pw = numero(p.precio);
    if (pe === null) {
      filas.push(
        fila(
          slug,
          "precio",
          p.precio ?? "sin precio",
          "no publica precio",
          MANDA.erp,
          "ponerle precio en el ERP; hoy la página publica el escrito a mano, que nadie revisa"
        )
      );
    } else if (pw !== null && pe !== pw) {
      filas.push(
        fila(
          slug,
          "precio",
          p.precio,
          `$ ${pe.toLocaleString("es-CO")}`,
          MANDA.erp,
          "la página ya publica el del ERP: actualizar o borrar el escrito a mano en products.ts"
        )
      );
    }
    /**
     * UN PRECIO POR PIEZA ETIQUETADO COMO PRECIO POR METRO.
     *
     * La teja colonial llegó del ERP a $ 1.600 con la unidad en m². Son $ 1.600 por teja
     * —y van 20 en un metro—, así que publicarlo tal cual pone el metro 20 veces más
     * barato de lo que cuesta. Es el mismo error que costó meses al revés, cuando el
     * cotizador multiplicaba metros por el precio de una pieza.
     *
     * Se detecta sin inventar cifras: si el producto se vende por m² y publica su
     * rendimiento, el precio de una pieza sale de dividir. Cuando esa división queda muy
     * por debajo de la pieza más barata del propio catálogo, lo que hay no es un precio
     * por metro.
     */
    if (unidadErp === "m2" && pe !== null) {
      const und = unidadesPorM2(filasErp);
      const porPieza = und ? pe / und : null;
      if (porPieza !== null && piezaMasBarata !== null && porPieza < piezaMasBarata / 4) {
        filas.push(
          fila(
            slug,
            "precio",
            p.precio ?? "—",
            `$ ${pe.toLocaleString("es-CO")} / m² (≈ $ ${Math.round(porPieza).toLocaleString("es-CO")} por pieza)`,
            MANDA.erp,
            `con ${und} piezas por m², ese precio por metro sale a menos de lo que cuesta una pieza: ` +
              `parece el precio de la unidad puesto en un producto que se vende por m². Corregir en el ERP ` +
              `—precio por m², o unidad «unidad»— antes de publicarlo`,
            true
          )
        );
      }
    }

    /* Uno por uno, no solo el más barato: la página publica el mínimo, pero el cotizador
       cobra el del color que elija el cliente. Un cero o un dígito de más en un solo color
       se cuela en una cotización sin aparecer en ninguna etiqueta. */
    for (const fil of filasErp) {
      const sueltos = [
        ...(fil.colores ?? []).map((c) => [c.nombre || c.codigo, c.precio]),
        ["precio de lista", fil.precio],
      ];
      for (const [de, v] of sueltos) {
        if (typeof v !== "number" || (v > 0 && v <= 5_000_000)) continue;
        /* Un cero no detiene nada: la página ya lo trata como «sin precio» y cae en el
           siguiente que haya. Vale la pena decirlo, no bloquear por ello. */
        const cero = v === 0;
        filas.push(
          fila(
            slug,
            "precio",
            p.precio ?? "—",
            `${de}: $ ${v.toLocaleString("es-CO")}`,
            MANDA.erp,
            cero
              ? "precio en cero en el ERP: la página lo ignora y publica el siguiente que encuentre"
              : "la cifra del ERP está fuera de todo rango razonable: revisarla antes de publicarla",
            !cero
          )
        );
      }
    }

    // Colores: definen el SKU con el que se factura.
    if (filasErp.every((x) => !x.colores?.length)) {
      filas.push(
        fila(
          slug,
          "colores",
          "lista escrita en la web",
          "sus variantes no tienen color",
          MANDA.erp,
          "asignar el color a cada variante en el ERP; mientras no lo tenga, el precio por color tampoco viaja"
        )
      );
    }

    // Medidas y peso: ninguno de los dos lados se puede verificar desde un script.
    const me = medidasErp(e.dimension);
    const mw = [p.alto, p.ancho, p.largo].map(cm);
    if (me.length === 3 && mw.every((x) => x !== null)) {
      const a = [...me].sort((x, y) => x - y).join(" · ");
      const b = [...mw].sort((x, y) => x - y).join(" · ");
      if (a !== b)
        filas.push(
          fila(
            slug,
            "dimensiones",
            b,
            a,
            MANDA.medicion,
            "medir la pieza y corregir el lado que esté mal; de esto sale el rendimiento, así que mientras no se resuelva las piezas por m² también están en duda"
          )
        );
    }
    const ke = e.pesoKg,
      kw = cm(p.peso);
    if (ke && kw && Math.abs(ke - kw) > 0.05)
      filas.push(
        fila(
          slug,
          "peso",
          `${kw} kg`,
          `${ke} kg`,
          MANDA.medicion,
          "pesar la pieza y corregir el lado que esté mal"
        )
      );

    // Fotos: gerencia decidió traerlas a mano (protocolo de marca).
    const externas = filasErp
      .flatMap((x) => [x.imagen, ...(x.fotos || [])])
      .filter((u) => u && /^https?:/.test(u));
    if (externas.length)
      filas.push(
        fila(
          slug,
          "fotos",
          "sirve las del repositorio",
          `${externas.length} foto(s) subidas al ERP`,
          MANDA.web,
          "revisar si cumplen el protocolo de marca y bajarlas al repositorio"
        )
      );
  }

  /* ── 3. Las fichas técnicas en PDF ──
     Salen del mismo catálogo y se descargan desde la página, así que un dato viejo ahí pesa
     igual que uno viejo en la ficha web. El reparto de quién manda no es el mismo: una norma
     la decide su propio alcance —NTC 2086 es la de tejas de arcilla y NTC 4205 la de
     mampostería— y una resistencia la decide el ensayo, no el criterio de nadie. */
  const fichas = conflictosDeFichas();
  for (const [slug, campo, enFicha, enErp] of [...fichas.fisicos, ...fichas.textuales]) {
    const c = String(campo).toLowerCase();
    const manda =
      c === "norma"
        ? MANDA.norma
        : c === "titulo"
          ? MANDA.web
          : c === "colores"
            ? MANDA.web
            : /resistencia|absorci|tolerancia|eflorescencia/.test(c)
              ? MANDA.ensayo
              : MANDA.medicion;
    const accion =
      manda === MANDA.norma
        ? "confirmar qué norma le aplica por su uso y dejar la misma en los dos lados"
        : manda === MANDA.ensayo
          ? "tomar el valor del certificado de ensayo; ninguno de los dos archivos lo puede decidir"
          : manda === MANDA.web
            ? "la ficha publicada manda en cómo se nombra y en los tonos fotografiados; alinear el ERP si conviene"
            : "medir o pesar la pieza y corregir el lado que esté mal";
    filas.push(fila(slug, `ficha · ${campo}`, enFicha, enErp, manda, accion));
  }
  for (const slug of fichas.huerfanas)
    filas.push(
      fila(
        slug,
        "ficha · publicación",
        "PDF publicado",
        "no lo publica",
        MANDA.erp,
        "o se marca `mostrar_web` en el ERP, o se baja el PDF de la web"
      )
    );

  return filas;
}

/** Lo que no debería salir a producción. Es el subconjunto `bloquea` de la tabla. */
export const bloqueos = (filas) => filas.filter((f) => f.bloquea);

/* ───────────────────────────── informe en markdown ───────────────────────────── */

export function reporteMarkdown(feed, filas) {
  const porCampo = new Map();
  for (const f of filas) {
    if (!porCampo.has(f.campo)) porCampo.set(f.campo, []);
    porCampo.get(f.campo).push(f);
  }
  const secciones = [...porCampo.entries()].map(([campo, fs_]) => {
    const cuerpo = fs_
      .map((f) => `| ${f.slug} | ${f.web} | ${f.erp} | ${f.manda} | ${f.accion} |`)
      .join("\n");
    return `## ${campo} (${fs_.length})\n\n| Producto | Valor web | Valor ERP | Manda | Acción requerida |\n|---|---|---|---|---|\n${cuerpo}`;
  });

  return (
    `# Conflictos entre el ERP y la página web\n\n` +
    `_Generado por \`npm run verificar:datos\` · catálogo del ERP al ${feed.actualizado}._\n\n` +
    `La columna **Manda** dice quién debería decidir el dato, no quién tiene razón hoy:\n\n` +
    `- **ERP** — es quien factura y quien despacha: el precio, la unidad de venta, el código y\n` +
    `  los colores salen de ahí, y la página ya los sigue. Lo que aparece acá es la copia\n` +
    `  escrita a mano que quedó vieja al lado.\n` +
    `- **Web** — lo que nadie puede deducir: los textos de venta, el SEO y las fotos tomadas\n` +
    `  con el protocolo de marca.\n` +
    `- **Medición** — no lo resuelve ninguno de los dos archivos. Hay que medir o pesar la\n` +
    `  pieza; publicar el dato del ERP sería tan arriesgado como dejar el de la web.\n` +
    `- **Norma aplicable** — lo decide el alcance de la norma, no una preferencia: NTC 2086 es\n` +
    `  la de tejas de arcilla y NTC 4205 la de mampostería. Donde la ficha cita la que le\n` +
    `  corresponde por uso, la ficha tiene razón.\n` +
    `- **Ensayo** — una resistencia o una absorción salen del certificado de laboratorio. Entre\n` +
    `  «20 MPa» y «2 MPa» no hay criterio que valga: hay un ensayo que lo dice.\n\n` +
    `Las filas que empiezan por \`ficha ·\` son del PDF que el cliente descarga; el resto, de la\n` +
    `página del producto. Son dos sitios donde el mismo dato puede quedarse viejo por separado.\n\n` +
    (secciones.length
      ? secciones.join("\n\n") + "\n"
      : "Sin conflictos: los dos lados dicen lo mismo.\n")
  );
}
