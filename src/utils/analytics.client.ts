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

export function trackEvent(name: string, props?: Record<string, string>) {
  if (window.plausible) {
    window.plausible(name, props ? { props } : undefined);
  }
  if (window.gtag) {
    window.gtag("event", name, props ?? {});
  }
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

  // Conversión de lead: se dispara una sola vez al enviar el formulario
  // (antes se duplicaba con el data-track del botón, que ya se quitó).
  document.getElementById("contact-form")?.addEventListener("submit", () => {
    trackEvent("generate_lead", { form: "contact" });
  });
}

export function initAnalyticsOnLoad() {
  const cfg = window.__clayhouseAnalytics;
  if (!cfg) return;

  // GA4 ya lo cargó el script inline de Analytics.astro, con el consentimiento
  // por defecto resuelto antes de la primera vista de página. Aquí solo queda
  // Plausible (que no usa cookies y no necesita banner) y los eventos.
  if (cfg.plausibleDomain) injectPlausible(cfg.plausibleDomain);
  bindAnalyticsEvents();
}
