/**
 * UN CHROME DE VERDAD SOBRE EL SITIO CONSTRUIDO.
 *
 * Lo comparten las pruebas de accesibilidad y de teclado: levantan `dist/` en un servidor
 * mínimo, abren Chrome sin ventana y hablan con él por el protocolo de depuración. Sin
 * dependencias: Node trae `WebSocket` desde la 22 y Chrome ya está en la máquina.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const TIPOS = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".xml": "application/xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".pdf": "application/pdf",
  ".ico": "image/x-icon",
};

/**
 * DÓNDE ESTÁ CHROME.
 *
 * Estaba escrito tres veces —acá, en la prueba de medición y en el generador de fichas— y
 * solo una de las tres sabía mirar en Linux. Eso bastaba para que las pruebas de navegador
 * no se pudieran correr en una máquina que no fuera el Mac de quien las escribió, que es
 * justo donde hace falta correrlas: en el servidor de integración.
 */
const CANDIDATOS = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

/** La primera ruta que exista. Si no hay ninguna, la primera candidata, para que el mensaje
 *  de error diga dónde se buscó. */
export const CHROME = CANDIDATOS.find((c) => fs.existsSync(c)) ?? CANDIDATOS[0];

export const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

/** Sirve `dist/` en un puerto. Devuelve el servidor para cerrarlo al final. */
export function servirDist(puerto) {
  const raiz = path.join(process.cwd(), "dist");
  const servidor = http.createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split("?")[0]);
    if (rel.endsWith("/")) rel += "index.html";
    if (!path.extname(rel)) rel += "/index.html";
    const file = path.join(raiz, rel);
    if (!file.startsWith(raiz) || !fs.existsSync(file)) {
      res.writeHead(404).end("no");
      return;
    }
    res.writeHead(200, { "content-type": TIPOS[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((r) => servidor.listen(puerto, () => r(servidor)));
}

/** Abre Chrome sin ventana y devuelve `{ evaluar, enviar, tecla, cerrar }`. */
export async function abrirChrome(puertoCdp) {
  if (!fs.existsSync(CHROME))
    throw new Error(
      `No encuentro Chrome (busqué en ${CANDIDATOS.join(", ")}). Defina CHROME_PATH.`
    );
  const perfil = fs.mkdtempSync("/tmp/clayhouse-chrome-");
  const chrome = spawn(
    CHROME,
    [
      `--remote-debugging-port=${puertoCdp}`,
      "--headless=new",
      "--no-first-run",
      `--user-data-dir=${perfil}`,
      "--disable-gpu",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  let destino = null;
  for (let i = 0; i < 40 && !destino; i++) {
    try {
      const lista = await (await fetch(`http://127.0.0.1:${puertoCdp}/json/list`)).json();
      destino = lista.find((x) => x.type === "page");
    } catch {
      /* todavía no levanta */
    }
    if (!destino) await esperar(250);
  }
  if (!destino) throw new Error("Chrome no respondió al protocolo de depuración");

  const ws = new WebSocket(destino.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pendientes = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pendientes.has(m.id)) {
      pendientes.get(m.id)(m);
      pendientes.delete(m.id);
    }
  };
  const enviar = (method, params = {}) =>
    new Promise((res) => {
      const i = ++id;
      pendientes.set(i, res);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  const evaluar = async (expression) =>
    (await enviar("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }))
      .result?.result?.value;

  /** Una tecla de verdad, no un evento sintético: así la ve el navegador igual que un dedo. */
  const tecla = async (key, codigo) => {
    for (const type of ["rawKeyDown", "keyUp"]) {
      await enviar("Input.dispatchKeyEvent", {
        type,
        key,
        code: key,
        windowsVirtualKeyCode: codigo,
        nativeVirtualKeyCode: codigo,
        text: key === "Tab" ? "\t" : undefined,
      });
    }
    await esperar(90);
  };

  await enviar("Page.enable");
  await enviar("Runtime.enable");

  return {
    enviar,
    evaluar,
    tecla,
    cerrar: () => {
      ws.close();
      chrome.kill();
      try {
        fs.rmSync(perfil, { recursive: true, force: true });
      } catch {
        /* lo borra el sistema */
      }
    },
  };
}
