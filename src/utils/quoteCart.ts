export const QUOTE_CART_KEY = "clayhouse-quote-cart";
export const QUOTE_CART_EVENT = "quote-cart-updated";

declare global {
  interface Window {
    __quoteProductCatalog?: Partial<QuoteCartItem>[];
  }
}

function getClientCatalog(): Partial<QuoteCartItem>[] | undefined {
  if (typeof window === "undefined") return undefined;
  return window.__quoteProductCatalog;
}

export interface QuoteCartItem {
  slug: string;
  name: string;
  category: string;
  color?: string;
  quantity: number;
  unitLabel: string;
  image: string;
  pricePerUnit: string;
  texture?: string;
  productUrl: string;
  /** Id de la variante/dimensión seleccionada (define el código ERP en rayados y macizo-brix). */
  variantId?: string;
  /** Calidad elegida (código ERP: PRI, SEG, MED). */
  calidad?: string;
}

function cartKey(item: Pick<QuoteCartItem, "slug" | "color" | "calidad">): string {
  return `${item.slug}::${item.color ?? ""}::${item.calidad ?? ""}`;
}

/** Quita prefijo "Desde" para mostrar solo el valor en cotización */
export function normalizePriceDisplay(price: string): string {
  return price.replace(/^desde\s+/i, "").trim();
}

function resolvePrice(
  itemPrice: string | undefined,
  catalogPrice: string | undefined
): string {
  const candidate =
    itemPrice && itemPrice !== "Consultar" && !/^desde\s/i.test(itemPrice)
      ? itemPrice
      : (catalogPrice ?? itemPrice ?? "Consultar");
  return normalizePriceDisplay(candidate);
}

/** Completa ítems guardados antes de tener imagen/precio.
 *  El catálogo es la fuente de verdad: si existe el slug, sus datos
 *  (imagen, precio, categoría, textura, URL) reemplazan los guardados. */
export function enrichCartItem(
  item: Partial<QuoteCartItem> & Pick<QuoteCartItem, "slug" | "name" | "quantity" | "unitLabel">,
  catalog?: Partial<QuoteCartItem>[]
): QuoteCartItem {
  const fromCatalog = catalog?.find((p) => p.slug === item.slug);
  return {
    slug: item.slug,
    name: fromCatalog?.name ?? item.name,
    category: fromCatalog?.category ?? item.category ?? "",
    color: item.color,
    quantity: item.quantity,
    unitLabel: fromCatalog?.unitLabel ?? item.unitLabel ?? "unidad",
    image: fromCatalog?.image ?? item.image ?? "",
    pricePerUnit: fromCatalog?.pricePerUnit ?? item.pricePerUnit ?? "Consultar",
    texture: fromCatalog?.texture ?? item.texture,
    productUrl: fromCatalog?.productUrl ?? item.productUrl ?? `/productos/${item.slug}/`,
    variantId: item.variantId,
    calidad: item.calidad,
  };
}

export function getQuoteCart(catalog?: Partial<QuoteCartItem>[]): QuoteCartItem[] {
  if (typeof localStorage === "undefined") return [];
  const cat = catalog ?? getClientCatalog();
  try {
    const raw = localStorage.getItem(QUOTE_CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => enrichCartItem(item, cat));
  } catch {
    return [];
  }
}

export function saveQuoteCart(items: QuoteCartItem[]): void {
  localStorage.setItem(QUOTE_CART_KEY, JSON.stringify(items));
  document.dispatchEvent(new CustomEvent(QUOTE_CART_EVENT));
}

export function addToQuoteCart(
  item: Partial<QuoteCartItem> &
    Pick<QuoteCartItem, "slug" | "name" | "quantity" | "unitLabel"> & {
      category?: string;
    },
  catalog?: Partial<QuoteCartItem>[]
): void {
  const cat = catalog ?? getClientCatalog();
  const full = enrichCartItem(
    {
      category: "",
      image: "",
      pricePerUnit: "Consultar",
      productUrl: `/productos/${item.slug}/`,
      ...item,
    },
    cat
  );
  const cart = getQuoteCart(cat);
  const key = cartKey(full);
  const idx = cart.findIndex((i) => cartKey(i) === key);
  if (idx >= 0) {
    cart[idx] = { ...cart[idx], ...full };
  } else {
    cart.push(full);
  }
  saveQuoteCart(cart);
}

export function removeFromQuoteCart(slug: string, color?: string, calidad?: string): void {
  const key = cartKey({ slug, color, calidad });
  saveQuoteCart(getQuoteCart().filter((i) => cartKey(i) !== key));
}

export function updateQuoteCartItem(
  slug: string,
  color: string | undefined,
  quantity: number,
  catalog?: Partial<QuoteCartItem>[],
  calidad?: string
): void {
  const cat = catalog ?? getClientCatalog();
  const key = cartKey({ slug, color, calidad });
  const cart = getQuoteCart(cat);
  const item = cart.find((i) => cartKey(i) === key);
  if (!item || quantity < 1) return;
  item.quantity = quantity;
  saveQuoteCart(cart);
}

export function clearQuoteCart(): void {
  saveQuoteCart([]);
}

export function getQuoteCartCount(): number {
  return getQuoteCart().length;
}

export function formatPriceLabel(item: QuoteCartItem): string {
  return `${normalizePriceDisplay(item.pricePerUnit)} / ${item.unitLabel}`;
}

export function formatLineSubtotal(item: QuoteCartItem): string {
  const numeric = parseColombianPrice(item.pricePerUnit);
  if (numeric === null) return "A cotizar";
  const total = numeric * item.quantity;
  return formatCop(total);
}

function parseColombianPrice(value: string): number | null {
  const v = value.trim().toLowerCase();
  if (!v || v === "consultar" || v.includes("consult")) return null;
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return null;
  return parseInt(digits, 10);
}

function formatCop(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCartLine(item: QuoteCartItem): string {
  const colorPart = item.color ? ` (${item.color})` : "";
  const subtotal = formatLineSubtotal(item);
  return `• ${item.name}${colorPart} — ${item.quantity} ${item.unitLabel} — ${subtotal}`;
}

export function buildQuoteMessage(items: QuoteCartItem[]): string {
  if (!items.length) return "";
  return ["Solicito cotización de:", "", ...items.map(formatCartLine)].join("\n");
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
