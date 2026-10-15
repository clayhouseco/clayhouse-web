/** Clave del consentimiento. La comparte el script inline de Analytics.astro,
 *  que la lee antes de que cargue gtag para fijar el estado inicial. */
export const CONSENT_KEY = "clayhouse-analytics-consent";

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    __clayhouseAnalytics?: {
      plausibleDomain?: string;
      ga4Id?: string;
    };
    /** Para los scripts en línea de la página (el cotizador no se empaqueta con
     *  este módulo, así que no puede importarlo). */
    clayTrack?: (name: string, props?: Record<string, unknown>) => void;
    clayOrigen?: () => Record<string, string>;
  }
}

export function hasAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

export function setAnalyticsConsent(accepted: boolean) {
  try {
    localStorage.setItem(CONSENT_KEY, accepted ? "accepted" : "declined");
  } catch {
    /* private mode */
  }
}

function injectPlausible(domain: string) {
  if (document.querySelector("script[data-plausible]")) return;
  const script = document.createElement("script");
  script.defer = true;
  script.dataset.domain = domain;
  script.dataset.plausible = "true";
  script.src = "https://plausible.io/js/script.js";
  document.head.appendChild(script);
}

/**
 * Comunica el consentimiento a Google (Consent Mode v2).
 *
 * Antes la web decidía el consentimiento cargando o no la etiqueta: sin aceptar,
 * gtag no existía y Google no se enteraba de nada. El costo era real —quien
 * rechazaba hacía clic en un anuncio, escribía por WhatsApp, y Ads nunca lo
 * sabía—, así que las campañas subestimaban resultados y optimizaban con datos
 * incompletos.
 *
 * Ahora la etiqueta carga siempre pero arranca denegada: sin cookies ni
 * identificador persistente. Google recibe señales anónimas con las que puede
 * estimar las conversiones que no ve, y al aceptar se pasa a `granted`.
 */
function updateConsent(granted: boolean) {
  if (!window.gtag) return;
  const state = granted ? "granted" : "denied";
  window.gtag("consent", "update", {
    ad_storage: state,
    analytics_storage: state,
    ad_user_data: state,
    ad_personalization: state,
  });
}

/** Se llama al aceptar o rechazar en el banner. */
export function applyConsent(granted: boolean) {
  const cfg = window.__clayhouseAnalytics;
  if (!cfg) return;

  if (granted && cfg.plausibleDomain) injectPlausible(cfg.plausibleDomain);
  if (cfg.ga4Id) updateConsent(granted);
}

/**
 * Un evento, a los dos medidores.
 *
 * GA4 admite objetos y listas —los eventos de comercio llevan `items: [...]`—; Plausible
 * solo admite texto plano, así que recibe las propiedades simples y descarta el resto en
 * vez de mandar «[object Object]».
 *
 * NUNCA se envía un dato personal. Lo que viaja es el código del producto, la categoría,
 * la cantidad, el valor estimado y el canal; el nombre, el teléfono, el correo, la
 * dirección y cualquier texto libre se quedan en la solicitud, que va al ERP por su
 * propio camino. Un nombre dentro de Analytics es un problema de protección de datos sin
 * ninguna ganancia de medición.
 */
export function trackEvent(name: string, props?: Record<string, unknown>) {
  if (window.plausible) {
    const planas: Record<string, string> = {};
    for (const [k, v] of Object.entries(props ?? {})) {
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        planas[k] = String(v);
      }
    }
    window.plausible(name, Object.keys(planas).length ? { props: planas } : undefined);
  }
  if (window.gtag) {
    window.gtag("event", name, props ?? {});
  }
}

/**
 * DE DÓNDE LLEGÓ LA VISITA — para el registro comercial, no para Analytics.
 *
 * Google ya sabe lo suyo; quien no lo sabe es el asesor que abre la solicitud en el ERP y
 * no tiene cómo saber si vino de un anuncio, de una búsqueda o de un enlace. Esto se
 * captura al entrar y viaja con la cotización, en las notas comerciales.
 *
 * Se guarda en `sessionStorage` y solo lo que identifica la CAMPAÑA: nada del visitante.
 * Se escribe una sola vez por sesión —la primera página manda, que es la que trae los
 * parámetros del anuncio— y se borra al cerrar la pestaña.
 */
const ORIGEN_KEY = "clayhouse-origen";
const PARAMS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "gclid", "gbraid", "wbraid",
];

export function capturarOrigen(): Record<string, string> {
  let guardado: Record<string, string> = {};
  try {
    guardado = JSON.parse(sessionStorage.getItem(ORIGEN_KEY) || "{}");
  } catch {
    guardado = {};
  }
  if (Object.keys(guardado).length) return guardado;

  const url = new URL(window.location.href);
  const origen: Record<string, string> = {};
  for (const k of PARAMS) {
    const v = url.searchParams.get(k);
    if (v) origen[k] = v.slice(0, 120);
  }
  origen.landing = url.pathname.slice(0, 160);
  /* El referente, solo el dominio: la ruta completa de otro sitio puede llevar datos de
     quien navega y no aporta nada a la gestión comercial. */
  try {
    if (document.referrer) {
      const r = new URL(document.referrer);
      if (r.hostname && r.hostname !== url.hostname) origen.referrer = r.hostname;
    }
  } catch {
    /* referente ilegible */
  }
  try {
    sessionStorage.setItem(ORIGEN_KEY, JSON.stringify(origen));
  } catch {
    /* modo privado */
  }
  return origen;
}

let formStartTracked = false;

export function bindAnalyticsEvents() {
  document.addEventListener(
    "click",
    (e) => {
      const target = e.target instanceof Element ? e.target.closest("[data-track]") : null;
      if (!target || !(target instanceof HTMLElement)) return;
      const eventName = target.dataset.track;
      if (!eventName) return;
      const props: Record<string, string> = {
        location: target.dataset.trackLocation ?? "unknown",
      };
      if (target.dataset.trackLabel) props.label = target.dataset.trackLabel;
      trackEvent(eventName, props);
    },
    true
  );

  document.addEventListener(
    "focusin",
    (e) => {
      if (formStartTracked) return;
      const form = e.target instanceof Element ? e.target.closest("#contact-form, .review-form") : null;
      if (!form) return;
      formStartTracked = true;
      trackEvent("form_start", { form: form.id || "contact" });
    },
    true
  );

  /* La ficha de producto deja sus datos en un atributo del contenedor; acá se leen y se
     manda `view_item` una vez por carga. El catálogo del ERP ya puso ahí el código con el
     que se factura, así que GA4 y el ERP hablan del mismo artículo. */
  const vista = document.querySelector("[data-view-item]");
  if (vista instanceof HTMLElement && vista.dataset.viewItem) {
    try {
      trackEvent("view_item", JSON.parse(vista.dataset.viewItem));
    } catch {
      /* atributo ilegible: no se mide, pero la página sigue */
    }
  }

  /* El intento de envío NO es una conversión: Formspree puede rechazarlo, la red puede
     caerse y el visitante puede cerrar la pestaña. Se mide el intento acá y la conversión
     en la página de gracias, a la que solo se llega cuando el envío salió bien.
     Lleva nombre propio y no `quote_submit_attempt`: este formulario es el de contacto, y
     mezclarlo con el del cotizador ensucia el embudo de cotización. */
  document.getElementById("contact-form")?.addEventListener("submit", () => {
    trackEvent("form_submit_attempt", { form: "contact", canal: "email" });
  });

  /* La página de gracias es la confirmación del servidor: Formspree redirige a ella solo
     si aceptó el mensaje. Se dispara una vez por carga. */
  if (window.location.pathname.replace(/\/$/, "") === "/contacto/gracias") {
    trackEvent("generate_lead", { form: "contact", canal: "email", currency: "COP" });
  }
}

export function initAnalyticsOnLoad() {
  const cfg = window.__clayhouseAnalytics;
  if (!cfg) return;

  // GA4 ya lo cargó el script inline de Analytics.astro, con el consentimiento
  // por defecto resuelto antes de la primera vista de página. Aquí solo queda
  // Plausible (que no usa cookies y no necesita banner) y los eventos.
  if (cfg.plausibleDomain) injectPlausible(cfg.plausibleDomain);
  capturarOrigen();
  /* El cotizador vive en un `<script define:vars>`, que Astro no empaqueta: no puede
     importar nada. Se le deja la puerta abierta por el objeto global. */
  window.clayTrack = trackEvent;
  window.clayOrigen = capturarOrigen;
  bindAnalyticsEvents();
}
