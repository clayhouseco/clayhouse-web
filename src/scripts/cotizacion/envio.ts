/**
 * ENVIAR LA COTIZACIÓN: REGISTRAR PRIMERO, ABRIR EL CANAL DESPUÉS.
 *
 * El cliente elige cómo seguir —imprimir, WhatsApp o correo— y las tres salidas sacan al
 * navegador de la página: `window.print()` congela la pestaña, `window.open()` cambia de
 * foco y el envío del formulario navega. Antes la solicitud se mandaba al ERP sin esperar y
 * justo después ocurría eso: el navegador cortaba la petición a medio camino y la
 * cotización se perdía. Y si el servidor la rechazaba, el error se tragaba en silencio: el
 * cliente veía su WhatsApp abierto y creía que ya había cotizado.
 *
 * Ahora se registra, se espera, y solo entonces se abre el canal. El aviso queda a la vista
 * para que pueda reintentar, y se sigue adelante igual: dejarlo sin su WhatsApp sería peor.
 */
import {
  construirFilaErp,
  resumenMedicion,
  textoCotizacion,
  validarCotizacion,
  type Cotizacion,
  type ErrorCotizacion,
} from "@/utils/cotizador";
import { medir, origenVisita, pedir, type ConfigCotizacion } from "./config";

type Tono = "enviando" | "ok" | "error" | "";

export function montarEnvio(opciones: {
  form: HTMLFormElement;
  config: ConfigCotizacion;
  /** La cotización tal como está en el formulario en este instante. */
  cotizacion: () => Cotizacion;
  /** Se llama cuando la solicitud ya salió por correo y el carrito debe vaciarse. */
  alDespedir: () => void;
}): void {
  const { form, config, cotizacion, alDespedir } = opciones;
  const estadoEl = form.querySelector<HTMLElement>("[data-envio-estado]");

  function estado(texto: string, tono: Tono = ""): void {
    if (!estadoEl) return;
    estadoEl.hidden = !texto;
    estadoEl.textContent = texto;
    estadoEl.dataset.tono = tono;
  }

  /** El campo al que hay que llevar el foco cuando falta algo. */
  function campoDe(error: ErrorCotizacion): HTMLElement | null {
    if (error.campo === "lineas") return form.querySelector<HTMLElement>("[data-add-linea]");
    return form.querySelector<HTMLElement>(`[data-c="${error.campo}"]`);
  }

  function limpiarErrores(): void {
    form.querySelectorAll(".cotz-error").forEach((e) => e.remove());
    form.querySelectorAll("[aria-invalid]").forEach((e) => {
      e.removeAttribute("aria-invalid");
      e.removeAttribute("aria-describedby");
    });
  }

  /**
   * EL ERROR, JUNTO AL CAMPO QUE LO CAUSA.
   *
   * Era un `alert()` del navegador: corta todo, no dice a qué campo se refiere más que por
   * el texto, y al aceptarlo desaparece —quien use lector de pantalla y se distraiga no
   * tiene cómo volver a oírlo—. Ahora el mensaje se queda escrito debajo del campo, el
   * campo se marca como inválido para la tecnología de apoyo, y el foco va ahí.
   */
  function avisar(error: ErrorCotizacion): void {
    limpiarErrores();
    estado(error.mensaje, "error");
    const el = campoDe(error);
    if (!el) return;
    const id = `${el.id || el.getAttribute("name") || "campo"}-error`;
    const aviso = document.createElement("span");
    aviso.className = "cotz-error";
    aviso.id = id;
    aviso.textContent = error.mensaje;
    el.setAttribute("aria-invalid", "true");
    el.setAttribute("aria-describedby", id);
    (el.closest("label") ?? el.parentElement)?.appendChild(aviso);
    el.focus();
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.addEventListener("input", limpiarErrores, { once: true });
  }

  /** Devuelve la cotización si está completa; si no, avisa y devuelve null. */
  function listaParaEnviar(): Cotizacion | null {
    const c = cotizacion();
    const error = validarCotizacion(c);
    if (error) {
      avisar(error);
      return null;
    }
    limpiarErrores();
    return c;
  }

  // ---- Registro en el ERP (tabla `cotizaciones` de Supabase) ----
  // La web inserta la solicitud directo en la tabla del ERP con su misma estructura;
  // aparece como borrador "WEB-…". Los botones siguen siendo el respaldo.
  let registrada = false;
  /**
   * La petición en curso, compartida.
   *
   * Con solo la bandera `registrada` había una carrera real: cada botón se deshabilita a sí
   * mismo, así que pulsar WhatsApp y enseguida Imprimir dejaba dos manejadores corriendo. El
   * segundo leía `registrada` todavía en false —el primero aún esperaba la respuesta— y
   * mandaba una segunda fila. Dos solicitudes idénticas en la bandeja del ERP para un solo
   * cliente, y el equipo llamando dos veces.
   *
   * Guardando la promesa, el segundo canal espera la MISMA petición en vez de abrir otra. Si
   * falla se suelta, para que el cliente pueda reintentar.
   */
  let enVuelo: Promise<boolean> | null = null;

  function registrar(c: Cotizacion, canal: string): Promise<boolean> {
    if (registrada) return Promise.resolve(true);
    enVuelo ??= enviarAlErp(c, canal).finally(() => {
      if (!registrada) enVuelo = null;
    });
    return enVuelo;
  }

  async function enviarAlErp(c: Cotizacion, canal: string): Promise<boolean> {
    estado("Registrando tu solicitud…", "enviando");
    try {
      const res = await fetch(`${config.supabaseUrl}/rest/v1/cotizaciones`, {
        method: "POST",
        headers: {
          apikey: config.supabaseKey,
          Authorization: `Bearer ${config.supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(construirFilaErp(c, { origen: origenVisita() })),
        // Si el usuario navega, el navegador termina de enviarla igual.
        keepalive: true,
      });
      if (res.ok) {
        registrada = true;
        /* LA CONVERSIÓN ES ESTO, Y NADA ANTES.
           No el clic en WhatsApp, no el envío del formulario: la fila escrita en la base del
           ERP. Como `registrada` corta las llamadas siguientes, un cliente que use los tres
           canales cuenta una sola conversión. */
        medir("generate_lead", resumenMedicion(c, canal));
        estado(
          "Solicitud registrada. Nuestro equipo la recibe y te confirma precios y flete.",
          "ok"
        );
        return true;
      }
      estado(
        `No pudimos registrar la solicitud (error ${res.status}). Sigue por el canal que elegiste y, si puedes, vuelve a intentarlo.`,
        "error"
      );
      return false;
    } catch {
      estado(
        "No pudimos registrar la solicitud: revisa tu conexión. Sigue por el canal que elegiste y vuelve a intentarlo.",
        "error"
      );
      return false;
    }
  }

  /** Registra con el botón deshabilitado, para que no se pulse dos veces. */
  async function conBoton(
    btn: HTMLButtonElement | null,
    c: Cotizacion,
    canal: string
  ): Promise<void> {
    if (btn) btn.disabled = true;
    medir("quote_submit_attempt", resumenMedicion(c, canal));
    await registrar(c, canal);
    if (btn) btn.disabled = false;
  }

  // ---- Opción 1: imprimir / guardar PDF ----
  pedir<HTMLButtonElement>(form, "[data-action-print]").addEventListener("click", async (ev) => {
    const c = listaParaEnviar();
    if (!c) return;
    // El diálogo de impresión congela la pestaña: primero se registra.
    await conBoton(ev.currentTarget as HTMLButtonElement, c, "print");
    medir("quote_print", resumenMedicion(c, "print"));
    window.print();
  });

  // ---- Opción 2: WhatsApp (texto; wa.me no adjunta PDF) ----
  pedir<HTMLButtonElement>(form, "[data-action-whatsapp]").addEventListener("click", async (ev) => {
    const c = listaParaEnviar();
    if (!c) return;
    const texto = textoCotizacion(c); // se arma antes: el registro no debe cambiar lo que se manda
    await conBoton(ev.currentTarget as HTMLButtonElement, c, "whatsapp");
    medir("quote_whatsapp_open", resumenMedicion(c, "whatsapp"));
    window.open(
      `https://wa.me/${config.waNumber}?text=${encodeURIComponent(texto)}`,
      "_blank",
      "noopener"
    );
  });

  // ---- Opción 3: correo (Formspree si está configurado; si no, mailto) ----
  /**
   * En vez de una bandera «ya pasé por acá», el manejador se quita cuando termina.
   *
   * Hacía falta algo así porque el envío se frena, se registra y solo entonces se deja
   * seguir; con una bandera había que leerla antes de esperar y escribirla después, que es
   * justo la forma de una carrera. Quitando el manejador queda dicho en una línea: hizo su
   * trabajo, ahora envía el navegador. Si el envío es por `mailto:` el manejador se queda,
   * porque ahí no hay segunda pasada y el cliente puede volver a intentar.
   */
  const alEnviar = async (e: SubmitEvent): Promise<void> => {
    e.preventDefault();
    const c = listaParaEnviar();
    if (!c) return;

    const texto = textoCotizacion(c);
    await conBoton(form.querySelector<HTMLButtonElement>("[data-action-email]"), c, "email");
    medir("quote_email_open", resumenMedicion(c, "email"));

    const campo = form.querySelector<HTMLInputElement>("[data-cotizacion-payload]");
    if (campo) campo.value = texto.replace(/\*/g, ""); // legible, sin el markdown de WhatsApp

    if (!form.getAttribute("action")) {
      // Sin Formspree: se abre el cliente de correo del usuario hacia ventas.
      const asunto = encodeURIComponent("Solicitud de cotización — Clay House");
      window.location.href = `mailto:${config.ventasEmail}?subject=${asunto}&body=${encodeURIComponent(texto)}`;
      return;
    }
    alDespedir();
    form.removeEventListener("submit", alEnviar);
    form.submit(); // ahora sí, con el registro confirmado
  };

  form.addEventListener("submit", alEnviar);
}
