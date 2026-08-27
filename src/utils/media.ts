import { assetUrl } from "./paths";

/** Logo horizontal Clay House */
export const logos = {
  header: assetUrl("/logo-clayhouse.png"),
  headerAlt: assetUrl("/logo-clayhouse.png"),
  /** Logo horizontal en blanco (para fondos oscuros e impresión/PDF) */
  headerWhite: assetUrl("/logo-clayhouse-white.png"),
  /** Isotipo CH (crema) para pie de página */
  footerMark: assetUrl("/Logos/MASTERMesa de trabajo 11.png"),
} as const;
