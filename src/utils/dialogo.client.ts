/**
 * EL TECLADO SE QUEDA DENTRO DEL DIÁLOGO MIENTRAS ESTÁ ABIERTO.
 *
 * Los tres diálogos del sitio —el carrito de cotización, el visor de proyectos y la galería
 * de la ficha— se cerraban con Escape, pero el tabulador seguía recorriendo la página de
 * atrás: con el visor abierto se podía llegar al menú, al pie y a enlaces que el diálogo
 * está tapando. Quien no ve la pantalla no tiene forma de saber que salió.
 *
 * Y al cerrar, el foco se quedaba donde estuviera. Esto lo devuelve al elemento que abrió el
 * diálogo, que es donde la persona estaba antes de entrar.
 *
 * Se usa así:
 *
 *   let soltar: (() => void) | null = null;
 *   function abrir() { …mostrar…; soltar = atraparFoco(dialogo); }
 *   function cerrar() { …ocultar…; soltar?.(); soltar = null; }
 */
const ENFOCABLES = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function enfocables(raiz: HTMLElement): HTMLElement[] {
  return [...raiz.querySelectorAll<HTMLElement>(ENFOCABLES)].filter(
    (el) => el.offsetParent !== null || el === document.activeElement
  );
}

/**
 * Encierra el foco dentro de `dialogo`. Devuelve la función que lo suelta y restituye el
 * foco anterior; llamarla al cerrar.
 */
export function atraparFoco(dialogo: HTMLElement): () => void {
  const previo = document.activeElement as HTMLElement | null;

  const alTeclear = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const lista = enfocables(dialogo);
    if (!lista.length) {
      e.preventDefault();
      return;
    }
    const primero = lista[0];
    const ultimo = lista[lista.length - 1];
    const activo = document.activeElement;
    /* Fuera del diálogo —o en su borde— el tabulador vuelve adentro en vez de escaparse. */
    if (!dialogo.contains(activo)) {
      e.preventDefault();
      (e.shiftKey ? ultimo : primero).focus();
    } else if (e.shiftKey && activo === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && activo === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  };

  document.addEventListener("keydown", alTeclear, true);

  /* El primer foco va dentro del diálogo; si no hay nada enfocable, al diálogo mismo para
     que el lector de pantalla lo anuncie. */
  const lista = enfocables(dialogo);
  if (lista.length) lista[0].focus();
  else {
    if (!dialogo.hasAttribute("tabindex")) dialogo.setAttribute("tabindex", "-1");
    dialogo.focus();
  }

  return () => {
    document.removeEventListener("keydown", alTeclear, true);
    /* Solo se devuelve el foco si sigue en pantalla: si la página cambió, forzarlo movería
       la vista a un sitio que la persona no pidió. */
    if (previo && previo.isConnected) previo.focus();
  };
}
