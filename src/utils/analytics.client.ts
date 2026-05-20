const CONSENT_KEY = "clayhouse-analytics-consent";

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    __clayhouseAnalytics?: {
      plausibleDomain?: string;
      ga4Id?: string;
      needsConsent?: boolean;
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

function injectGa4(measurementId: string) {
  if (document.querySelector(`script[data-ga4="${measurementId}"]`)) return;

  const loader = document.createElement("script");
  loader.async = true;
  loader.dataset.ga4 = measurementId;
  loader.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(loader);

  const inline = document.createElement("script");
  inline.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', { anonymize_ip: true });
  `;
  document.head.appendChild(inline);
}

export function loadAnalytics() {
  const cfg = window.__clayhouseAnalytics;
  if (!cfg) return;

  if (cfg.plausibleDomain) injectPlausible(cfg.plausibleDomain);
  if (cfg.ga4Id && hasAnalyticsConsent()) injectGa4(cfg.ga4Id);
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
      trackEvent(eventName, {
        location: target.dataset.trackLocation ?? "unknown",
      });
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

  document.getElementById("contact-form")?.addEventListener("submit", () => {
    trackEvent("quote_submit", { form: "contact" });
  });
}

export function initAnalyticsOnLoad() {
  const cfg = window.__clayhouseAnalytics;
  if (!cfg) return;

  if (cfg.plausibleDomain) injectPlausible(cfg.plausibleDomain);
  if (cfg.ga4Id && (!cfg.needsConsent || hasAnalyticsConsent())) {
    injectGa4(cfg.ga4Id);
  }
  bindAnalyticsEvents();
}
