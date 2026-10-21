/**
 * DÓNDE SE ENTREGA: MODALIDAD, DIRECCIÓN Y PUNTO EN EL MAPA.
 *
 * El flete es lo que el equipo comercial tiene que calcular a mano, y para calcularlo
 * necesita saber a dónde llega el camión. Una dirección escrita a mano en Colombia rural no
 * alcanza: «vereda La Clara» no le dice nada a quien cotiza el viaje. Por eso se busca la
 * dirección contra OpenStreetMap, se deja un pin arrastrable con capa de satélite —para ver
 * accesos y vías destapadas— y las coordenadas viajan al ERP junto con el texto.
 *
 * Es el mismo enfoque del ERP: Nominatim y Leaflet, sin llave y sin costo. Leaflet se carga
 * solo cuando hace falta el mapa; quien recoge en planta nunca lo descarga.
 */
import type { UbicacionCotizacion } from "@/utils/cotizador";
import { pedir } from "./config";

export type Entrega = "planta" | "obra";

export interface Ubicacion {
  entrega(): Entrega;
  leer(): UbicacionCotizacion;
}

/** Lo que Nominatim devuelve y nos sirve. */
interface DireccionOsm {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
}
interface ResultadoOsm {
  display_name: string;
  lat: string;
  lon: string;
  address?: DireccionOsm;
}

export function montarUbicacion(opciones: {
  form: HTMLFormElement;
  alCambiar: () => void;
}): Ubicacion {
  const { form, alCambiar } = opciones;

  const valorEntrega = pedir<HTMLInputElement>(form, "[data-entrega-value]");
  const camposObra = pedir<HTMLElement>(form, "[data-obra-fields]");
  const direccionEl = pedir<HTMLInputElement>(form, "[data-direccion]");
  const listaEl = pedir<HTMLUListElement>(form, "[data-ac-list]");
  const muniEl = pedir<HTMLInputElement>(form, 'input[name="municipio"]');
  const deptoEl = pedir<HTMLSelectElement>(form, 'select[name="departamento"]');
  const latEl = pedir<HTMLInputElement>(form, "[data-lat]");
  const lngEl = pedir<HTMLInputElement>(form, "[data-lng]");
  const mapaCaja = pedir<HTMLElement>(form, "[data-map-wrap]");
  const mapaLienzo = pedir<HTMLElement>(form, "[data-map-canvas]");
  const mapaBoton = form.querySelector<HTMLButtonElement>("[data-map-toggle]");
  const mapaCoords = form.querySelector<HTMLElement>("[data-map-coords]");

  // ---- Modalidad de entrega ----
  function fijarEntrega(valor: Entrega): void {
    valorEntrega.value = valor;
    const planta = valor === "planta";
    camposObra.hidden = planta;
    /* Deshabilitados, no solo escondidos: un campo oculto pero habilitado sigue
       enviándose y sigue exigiéndose. */
    camposObra
      .querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select")
      .forEach((el) => {
        el.disabled = planta;
      });
    form.querySelectorAll<HTMLInputElement>("[data-req-obra]").forEach((el) => {
      el.required = !planta;
    });
    alCambiar();
  }

  form.querySelectorAll<HTMLButtonElement>(".cotz-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      form.querySelectorAll<HTMLButtonElement>(".cotz-pill").forEach((p) => {
        const activo = p === pill;
        p.classList.toggle("cotz-pill--active", activo);
        p.setAttribute("aria-pressed", activo ? "true" : "false");
      });
      fijarEntrega(pill.dataset.entrega === "planta" ? "planta" : "obra");
    });
  });

  // ---- Campos ----
  let silenciarSugerencias = false;
  /** Cambia la dirección por código, sin volver a disparar el autocompletado. */
  function ponerDireccion(valor: string): void {
    silenciarSugerencias = true;
    direccionEl.value = valor;
    direccionEl.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function ponerCampo(el: HTMLInputElement | HTMLSelectElement, valor: string): void {
    if (!valor) return;
    if (el instanceof HTMLSelectElement) {
      const opcion = [...el.options].find((o) => o.value.toLowerCase() === valor.toLowerCase());
      if (opcion) {
        el.value = opcion.value;
      } else {
        /* Un departamento que no está en la lista (o escrito distinto por OSM) se agrega:
           vale más guardar lo que dijo el mapa que dejar el campo en Antioquia. */
        const o = document.createElement("option");
        o.value = valor;
        o.textContent = valor;
        el.appendChild(o);
        el.value = valor;
      }
    } else {
      el.value = valor;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function llenarDesdeOsm(a: DireccionOsm | undefined): void {
    if (!a) return;
    ponerCampo(muniEl, a.city ?? a.town ?? a.village ?? a.municipality ?? a.county ?? "");
    ponerCampo(deptoEl, a.state ?? "");
  }

  function mostrarCoords(lat: number, lng: number): void {
    latEl.value = lat.toFixed(6);
    lngEl.value = lng.toFixed(6);
    if (mapaCoords) mapaCoords.textContent = `Punto exacto: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    mapaCaja.hidden = false;
  }

  // ---- Leaflet, solo cuando se necesita ----
  type Leaflet = typeof import("leaflet");
  let leaflet: Promise<Leaflet> | null = null;
  let L: Leaflet | null = null;
  let mapa: import("leaflet").Map | null = null;
  let pin: import("leaflet").Marker | null = null;

  function cargarLeaflet(): Promise<Leaflet> {
    leaflet ??= (async () => {
      /* Leaflet se publica como UMD: según cómo lo empaquete Vite, el módulo es el objeto
         `L` o lo trae en `default`. */
      const cargado: Leaflet & { default?: Leaflet } = await import("leaflet");
      const mod = cargado.default ?? cargado;
      await import("leaflet/dist/leaflet.css");
      mod.Icon.Default.mergeOptions({
        /* Servidos desde acá y no desde unpkg: son los mismos archivos que trae el paquete
           (copiados a public/images/leaflet/), y así el mapa no depende de un CDN ajeno ni
           hay que abrirle la puerta en la política de seguridad. */
        iconUrl: "/images/leaflet/marker-icon.png",
        iconRetinaUrl: "/images/leaflet/marker-icon-2x.png",
        shadowUrl: "/images/leaflet/marker-shadow.png",
      });
      L = mod;
      return mod;
    })();
    return leaflet;
  }

  function ponerPin(lat: number, lng: number): void {
    if (!L || !mapa) return;
    if (pin) {
      pin.setLatLng([lat, lng]);
      return;
    }
    const nuevo = L.marker([lat, lng], { draggable: true }).addTo(mapa);
    nuevo.on("dragend", () => {
      const p = nuevo.getLatLng();
      elegirPunto(p.lat, p.lng);
    });
    pin = nuevo;
  }

  function elegirPunto(lat: number, lng: number): void {
    ponerPin(lat, lng);
    mostrarCoords(lat, lng);
    void geocodificarInverso(lat, lng);
  }

  /* Se guarda la promesa y no solo el mapa: dos clics seguidos en «Editar ubicación»
     entraban los dos mientras Leaflet seguía cargando, y se creaban dos mapas sobre el
     mismo div —el segundo tapaba al primero y el pin dejaba de responder—. */
  let montaje: Promise<import("leaflet").Map> | null = null;
  function asegurarMapa(): Promise<import("leaflet").Map> {
    montaje ??= construirMapa();
    return montaje;
  }

  async function construirMapa(): Promise<import("leaflet").Map> {
    const Lf = await cargarLeaflet();
    const centro: [number, number] = [Number(latEl.value) || 6.226, Number(lngEl.value) || -75.564];
    const nuevo = Lf.map(mapaLienzo, { scrollWheelZoom: true }).setView(
      centro,
      latEl.value ? 15 : 12
    );
    const calle = Lf.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    });
    const satelite = Lf.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Imágenes &copy; Esri", maxZoom: 19 }
    );
    calle.addTo(nuevo);
    Lf.control.layers({ Calle: calle, Satélite: satelite }).addTo(nuevo);
    nuevo.on("click", (e) => elegirPunto(e.latlng.lat, e.latlng.lng));
    mapa = nuevo;
    return nuevo;
  }

  function abrirMapa(): void {
    if (!mapaLienzo.hidden) return;
    mapaLienzo.hidden = false;
    if (mapaBoton) mapaBoton.textContent = "▲ Ocultar mapa";
    setTimeout(() => mapa?.invalidateSize(), 60);
  }

  async function fijarPunto(lat: number, lng: number): Promise<void> {
    mostrarCoords(lat, lng);
    const m = await asegurarMapa();
    abrirMapa();
    ponerPin(lat, lng);
    m.setView([lat, lng], 15);
  }

  mapaBoton?.addEventListener("click", async () => {
    await asegurarMapa();
    const abrir = mapaLienzo.hidden;
    mapaLienzo.hidden = !abrir;
    mapaBoton.textContent = abrir ? "▲ Ocultar mapa" : "📍 Editar ubicación en el mapa";
    if (abrir) setTimeout(() => mapa?.invalidateSize(), 60);
  });

  // ---- Nominatim ----
  async function geocodificarInverso(lat: number, lng: number): Promise<void> {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lng}`,
        { headers: { Accept: "application/json" } }
      );
      const datos = (await r.json()) as ResultadoOsm | null;
      if (datos?.display_name) ponerDireccion(datos.display_name);
      llenarDesdeOsm(datos?.address);
    } catch {
      /* sin reverso la dirección escrita a mano sigue valiendo */
    }
  }

  let sugerencias: ResultadoOsm[] = [];
  const ocultarLista = (): void => {
    listaEl.hidden = true;
    listaEl.replaceChildren();
    sugerencias = [];
  };

  let temporizador: ReturnType<typeof setTimeout> | undefined;
  let aborto: AbortController | undefined;
  direccionEl.addEventListener("input", () => {
    if (silenciarSugerencias) {
      silenciarSugerencias = false;
      ocultarLista();
      return;
    }
    const q = direccionEl.value.trim();
    clearTimeout(temporizador);
    aborto?.abort();
    if (q.length < 4) {
      ocultarLista();
      return;
    }
    temporizador = setTimeout(async () => {
      aborto = new AbortController();
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=co&q=${encodeURIComponent(q)}`,
          { signal: aborto.signal, headers: { Accept: "application/json" } }
        );
        const arr = (await r.json()) as ResultadoOsm[];
        if (!Array.isArray(arr) || !arr.length) {
          ocultarLista();
          return;
        }
        sugerencias = arr;
        listaEl.replaceChildren(
          ...arr.map((s, i) => {
            const li = document.createElement("li");
            li.setAttribute("role", "option");
            li.dataset.i = String(i);
            li.textContent = s.display_name;
            return li;
          })
        );
        listaEl.hidden = false;
      } catch {
        /* una búsqueda fallida no borra lo que el cliente ya escribió */
      }
    }, 350);
  });

  listaEl.addEventListener("mousedown", (e) => {
    const li = e.target instanceof Element ? e.target.closest<HTMLElement>("li[data-i]") : null;
    if (!li) return;
    e.preventDefault();
    const s = sugerencias[Number(li.dataset.i)];
    if (!s) return;
    ponerDireccion(s.display_name);
    llenarDesdeOsm(s.address);
    ocultarLista();
    void fijarPunto(Number.parseFloat(s.lat), Number.parseFloat(s.lon));
  });

  direccionEl.addEventListener("blur", () => setTimeout(ocultarLista, 150));

  return {
    entrega: () => (valorEntrega.value === "planta" ? "planta" : "obra"),
    leer(): UbicacionCotizacion {
      const lat = latEl.value;
      const lng = lngEl.value;
      return {
        direccion: direccionEl.value.trim(),
        municipio: muniEl.value.trim(),
        departamento: deptoEl.value.trim(),
        ...(lat && lng ? { lat, lng, maps: `https://www.google.com/maps?q=${lat},${lng}` } : {}),
      };
    },
  };
}
