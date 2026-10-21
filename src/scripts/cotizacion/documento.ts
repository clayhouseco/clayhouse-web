/**
 * EL DOCUMENTO QUE SE VA ARMANDO AL LADO.
 *
 * No es una vista previa decorativa: es lo que el cliente imprime o guarda en PDF, y es la
 * única señal de que lo que escribió quedó bien entendido. Se repinta entero en cada cambio
 * —son veinte nodos, no hay nada que optimizar— y se alimenta del mismo objeto `Cotizacion`
 * que después viaja al ERP. Si el documento muestra una cifra, es la cifra que se guarda.
 */
import type { Cotizacion } from "@/utils/cotizador";
import { esc, pedir, pesosLargos } from "./config";

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function fechaLarga(d: Date): string {
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

export function montarDocumento(form: HTMLFormElement): (c: Cotizacion) => void {
  const campo = (sel: string) => pedir<HTMLElement>(form, sel);

  const fecha = campo("[data-doc-fecha]");
  const nombre = campo("[data-doc-nombre]");
  const tel = campo("[data-doc-tel]");
  const email = campo("[data-doc-email]");
  const proyecto = campo("[data-doc-proyecto]");
  const entrega = campo("[data-doc-entrega]");
  const ubicacion = campo("[data-doc-ubicacion]");
  const cuerpo = campo("[data-doc-lineas]");
  const material = campo("[data-doc-material]");

  return function pintar(c: Cotizacion): void {
    fecha.textContent = fechaLarga(new Date());
    nombre.textContent = c.cliente.nombre || "Pendiente";
    tel.textContent = c.cliente.telefono || "Pendiente";
    email.textContent = c.cliente.email || "Pendiente";
    proyecto.textContent = c.cliente.proyecto || "Pendiente";

    const planta = c.entrega === "planta";
    entrega.textContent = planta ? "Recoge en planta" : "Despacho a obra";
    ubicacion.textContent = planta
      ? "Planta Amagá"
      : [c.ubicacion?.direccion, c.ubicacion?.municipio].filter(Boolean).join(", ") || "Pendiente";

    if (!c.lineas.length) {
      cuerpo.innerHTML =
        '<tr><td colspan="4" class="cotz-doc__vacio">Agrega productos para verlos aquí.</td></tr>';
      material.textContent = "—";
      return;
    }

    cuerpo.innerHTML = c.lineas
      .map((l) => {
        const detalle = l.colorNombre ?? "";
        const sub = l.precioUnitario ? l.precioUnitario * l.cantidad : 0;
        return (
          `<tr><td><b>${esc(l.producto)}</b>` +
          (detalle ? `<br><span class="cotz-doc__det">${esc(detalle)}</span>` : "") +
          `</td>` +
          `<td class="num">${l.cantidad} ${esc(l.unidadLabel)}</td>` +
          `<td class="num">${l.precioUnitario ? pesosLargos(l.precioUnitario) : "—"}</td>` +
          `<td class="num">${sub ? pesosLargos(sub) : "A confirmar"}</td></tr>`
        );
      })
      .join("");

    /* Una línea sin precio no se suma como cero: se dice que falta confirmarla. */
    const total = c.lineas.reduce((t, l) => t + l.precioUnitario * l.cantidad, 0);
    const faltan = c.lineas.some((l) => !l.precioUnitario);
    material.textContent = pesosLargos(total) + (faltan ? " + a confirmar" : "");
  };
}
