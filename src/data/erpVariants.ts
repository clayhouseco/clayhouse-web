/**
 * LOS BOTONES DE COLOR SALEN DEL ERP.
 *
 * Gerencia: «en la página web nada que salen las variantes de colores de los productos nuevos».
 *
 * La causa no estaba en el ERP —publica bien sus colores, sus fotos y sus precios— sino acá:
 * qué botones existen lo decidía `productVariants.ts`, una lista escrita a mano, producto por
 * producto. El feed del ERP solo rellenaba las fotos y el precio DE LO QUE YA ESTUVIERA EN ESA
 * LISTA. Crear un producto en el ERP no bastaba: había que venir a escribirlo otra vez acá y
 * volver a desplegar, y mientras tanto la página no mostraba nada.
 *
 * DOS COSAS DISTINTAS SE VEN IGUAL EN PANTALLA. Un selector de «Color» (Arena, Topo) y uno de
 * «Formato» (Rayado de 10, de 12, de 15) son el mismo control, pero en el ERP son cosas
 * distintas: los colores son variantes DE UN producto y los formatos son productos SEPARADOS
 * que comparten página. Por eso `erpDeSlug` devuelve una lista: si trae varios, son formatos;
 * si trae uno con colores, son colores.
 *
 * LAS FOTOS SIGUEN SIENDO LAS DE LA WEB CUANDO LAS HAY. En `public/images/products/` están
 * fotografiadas con el protocolo de marca, recortadas y nombradas para que la galería sepa
 * cuál es la pieza y cuál el plano de dimensiones. Eso no lo reemplaza una foto de WhatsApp
 * subida al ERP. Pero cuando un producto nuevo no tiene carpeta todavía, la del ERP es mejor
 * que ninguna: la página sale con su color y su foto el mismo día, y se mejora después.
 *
 * EL PRECIO SÍ SE LE CREE SIEMPRE AL ERP. Estaba escrito a mano en dos archivos de este repo y
 * subir un precio en el ERP no cambiaba la página; el de acá se quedaba viejo sin que nada lo
 * delatara. Gerencia autorizó publicar el precio de lista, y el de lista es el del ERP.
 */
import { erpDeSlug, type ErpProducto } from "@/data/erpFeed";
import type { ProductColorVariant } from "@/data/productVariants";

/** «Matizado Claro» → «matizado-claro»: la llave del botón y el nombre de la carpeta de fotos. */
export function idDeColor(nombre: string): string {
  return nombre
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** 2500 → «$ 2.500», como lo escribe el resto del sitio. */
export function precioTexto(valor: number | null | undefined): string | undefined {
  return typeof valor === "number" && valor > 0 ? `$ ${Math.round(valor).toLocaleString("es-CO")}` : undefined;
}

/** Las fotos que el ERP publica para un color, la portada primero y sin repetir. */
export function fotosDeColor(c: { imagen: string | null; fotos: string[] }): string[] {
  return [...new Set([c.imagen, ...(c.fotos ?? [])].filter((x): x is string => !!x))];
}

/** Las fotos del producto entero (cuando no hay color, o el color no tiene las suyas). */
export function fotosDeProducto(p: ErpProducto): string[] {
  return [...new Set([p.imagen, ...(p.fotos ?? [])].filter((x): x is string => !!x))];
}

export interface VarianteErp extends ProductColorVariant {
  /** Fotos del ERP para esta variante. Solo se usan si la web no tiene carpeta propia. */
  fotosErp: string[];
}

/** El código del color en el ERP (NAT, MC, MO, ARE, TOPO…). Es la llave que no cambia. */
export const codigoDeVariante = (v: ProductColorVariant): string | undefined =>
  (v as { erpColor?: string }).erpColor?.toUpperCase();

/**
 * Las variantes que el ERP publica para una página, o `null` si no publica ninguna.
 *
 * `null` y `[]` no son lo mismo y por eso se distinguen: `null` es «el ERP no sabe de esta
 * página» —y entonces manda lo escrito a mano, que es el caso de las páginas editoriales que
 * no corresponden a un producto vendible—; `[]` sería «sabe y no tiene variantes», que para un
 * selector es lo mismo que no tener selector.
 */
export function variantesDeErp(slug: string): VarianteErp[] | null {
  const ps = erpDeSlug(slug);
  if (!ps.length) return null;

  /**
   * VARIOS PRODUCTOS EN UNA PÁGINA SON FORMATOS, Y ESOS NO SE TOCAN.
   *
   * Los rayados son tres códigos del ERP —R10H, R12H, R15H— que comparten la página
   * `rayados-horizontales`, y su selector dice «Formato», no «Color». Acá se devuelve `null`
   * —«no opino»— a propósito: sus botones se llaman «10», «12» y «15», que es como están
   * nombradas las carpetas de fotos y como los busca `GALLERY_CONFIG`. El ERP los llama
   * «Rayado de 10 Horizontal», y hacerlos coincidir a la fuerza duplicaría los botones o
   * dejaría las galerías apuntando a carpetas que no existen. Mientras los formatos no vivan
   * en el ERP como tales, mandan los escritos a mano.
   */
  if (ps.length > 1) return null;

  /* UN PRODUCTO CON COLORES = COLORES. */
  const p = ps[0];
  const cols = p.colores ?? [];
  if (!cols.length) return [];
  return cols.map((c) => ({
    id: idDeColor(c.nombre),
    label: c.nombre,
    colorLabel: c.nombre,
    folder: idDeColor(c.nombre),
    erpColor: c.codigo,
    pricePerUnit: precioTexto((c as { precio?: number | null }).precio),
    fotosErp: fotosDeColor(c),
  }));
}
