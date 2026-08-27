/**
 * Generador de fichas técnicas de Clay House.
 *
 * Toma los datos de fichas.data.mjs, arma una infografía en HTML con las fuentes
 * de marca y la renderiza a PDF de alta calidad con Google Chrome (headless).
 * El resultado reemplaza el ficha.pdf de cada producto.
 *
 * Uso:
 *   node scripts/fichas/generate.mjs --all                 Genera las 15
 *   node scripts/fichas/generate.mjs --only romano         Solo una (o varias: --only romano,toscano)
 *   node scripts/fichas/generate.mjs --only romano --preview   Deja el PDF en scripts/fichas/_preview/ sin tocar el producto
 *
 * Requisitos: Google Chrome instalado. Si está en otra ruta, exportar CHROME_PATH.
 * Ver scripts/fichas/README.md
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { fichas } from "./fichas.data.mjs";

const ROOT = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../..");
const BASE = "file://" + ROOT.split(path.sep).map(encodeURIComponent).join("/");
const FONTS = BASE + "/brand-assets/FUENTES";
const RED = "#8B1E1E";

// ---- CLI ----
const args = process.argv.slice(2);
const preview = args.includes("--preview");
let selected = fichas.map((f) => f.slug);
const onlyIdx = args.indexOf("--only");
if (onlyIdx !== -1 && args[onlyIdx + 1]) selected = args[onlyIdx + 1].split(",");
else if (!args.includes("--all") && onlyIdx === -1) {
  console.log("Especifica --all o --only <slug>. Ver --help en el README.");
  process.exit(1);
}

// ---- Chrome ----
function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  for (const c of candidates) if (fs.existsSync(c)) return c;
  throw new Error("No se encontró Chrome. Instálalo o exporta CHROME_PATH.");
}
const CHROME = findChrome();

// ---- Íconos SVG (línea) ----
const IC = {
  shield: '<path d="M32 6l20 8v14c0 14-9 24-20 28C21 52 12 42 12 28V14z"/>',
  thermo: '<path d="M32 12a5 5 0 0 1 5 5v22a9 9 0 1 1-10 0V17a5 5 0 0 1 5-5z"/><path d="M32 30v12"/>',
  leaf: '<path d="M14 50c0-20 16-36 36-36 0 20-16 36-36 36z"/><path d="M22 42C30 34 40 30 48 22"/>',
  ruler: '<path d="M10 22h44v20H10z"/><path d="M18 22v7M26 22v10M34 22v7M42 22v10"/>',
  weight: '<path d="M22 22h20l5 28H17z"/><path d="M27 22a5 5 0 1 1 10 0"/>',
  cube: '<path d="M32 8l22 12v24L32 56 10 44V20z"/><path d="M10 20l22 12 22-12M32 32v24"/>',
  grid: '<path d="M12 16h40v32H12z"/><path d="M12 27h40M12 37h40M25 16v32M39 16v32"/>',
  compress: '<path d="M16 40h32v8H16z"/><path d="M24 12v18M24 30l-5-6M24 30l5-6M40 12v18M40 30l-5-6M40 30l5-6"/>',
  drop: '<path d="M32 10c8 12 14 19 14 27a14 14 0 1 1-28 0c0-8 6-15 14-27z"/>',
  flame: '<path d="M34 8c2 10-8 12-8 22a10 10 0 0 0 20 0c0-5-2-8-4-11 1 6-3 8-5 5-3-4 3-9-3-16z"/>',
  arrows: '<path d="M8 32h48"/><path d="M8 32l8-6M8 32l8 6M56 32l-8-6M56 32l-8 6"/>',
  home: '<path d="M12 30L32 14l20 16"/><path d="M18 28v22h28V28"/>',
  tool: '<path d="M14 50l18-18"/><path d="M34 20a8 8 0 1 0 10 10l-6-6-4 2-2-4z"/><path d="M12 46l6 6"/>',
  wash: '<path d="M32 12c5 8 9 12 9 18a9 9 0 1 1-18 0c0-6 4-10 9-18z"/><path d="M46 40l3 3M50 30l4 1M15 44l-3 3"/>',
  warn: '<path d="M32 12l24 42H8z"/><path d="M32 28v12M32 46v0.5"/>',
};
const icon = (n, size = 34, sw = 2.4, color = RED) =>
  `<svg viewBox="0 0 64 64" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${IC[n] || ""}</svg>`;

const RECS = [
  ["home", "ALMACENAMIENTO", "Sitio plano, seco y aislado del terreno; proteger de escorrentía y escombros. No apilar a más de 1,5 m."],
  ["tool", "INSTALACIÓN", "Humedecer las piezas antes de pegar. Juntas uniformes de 10 mm (±3). Seguir el Manual de Fachadas Clay House."],
  ["wash", "LAVADO Y LIMPIEZA", "Tras el fraguado, limpiar con agua y cepillo de cerdas suaves. Prevenir eflorescencias."],
  ["warn", "NOTAS IMPORTANTES", "El tono varía ligeramente entre lotes; mezclar piezas de varias estibas para un acabado homogéneo."],
];

const fotoURL = (foto) => BASE + foto.split("/").map(encodeURIComponent).join("/");
const br = (v) => String(v).replace(/ · /g, "<br>");

function buildHtml(p, photoUrl) {
  const feat = p.features.map(([n, t, d]) => `<div class="feat"><div class="feat-ic">${icon(n, 30)}</div><div><h4>${t}</h4><p>${d}</p></div></div>`).join("");
  const colors = p.colores.map(([n, c]) => `<div class="sw"><span style="background:${c}"></span>${n}</div>`).join("");
  const specs = p.specsRow.map(([n, t, v, s]) => `<div class="spec"><div class="spec-ic">${icon(n, 28)}</div><div class="spec-l">${t}</div><div class="spec-v">${br(v)}</div>${s ? `<div class="spec-s">${s}</div>` : ""}</div>`).join("");
  const recs = RECS.map(([n, t, d]) => `<div class="rec"><div class="rec-ic">${icon(n, 20, 2.6)}</div><div><h5>${t}</h5><p>${d}</p></div></div>`).join("");
  const nCol = p.colores.length;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'M';src:url('${FONTS}/Montserrat-Regular.ttf');font-weight:400}
@font-face{font-family:'M';src:url('${FONTS}/Montserrat-Medium.ttf');font-weight:500}
@font-face{font-family:'M';src:url('${FONTS}/Montserrat-SemiBold.ttf');font-weight:600}
@font-face{font-family:'M';src:url('${FONTS}/Montserrat-Bold.ttf');font-weight:700}
@font-face{font-family:'M';src:url('${FONTS}/Montserrat-ExtraBold.ttf');font-weight:800}
@font-face{font-family:'M';src:url('${FONTS}/Montserrat-Black.ttf');font-weight:900}
@page{size:340mm 227mm;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'M',sans-serif;color:#3a3230;background:#FCFBF7;width:340mm;height:227mm;padding:12mm 15mm 8mm}
.top{display:flex;justify-content:space-between;align-items:flex-start;gap:8mm}
.title h1{font-weight:900;font-size:33pt;color:${RED};line-height:.95;letter-spacing:-.5px}
.title p{font-weight:600;font-size:10.5pt;color:#8a807c;margin-top:3mm;letter-spacing:1px}
.clsbox{border:2px solid ${RED};border-radius:6px;padding:5mm 8mm;text-align:right;min-width:66mm}
.clsbox .k{font-weight:700;font-size:8pt;letter-spacing:1.5px;color:#8a807c}
.clsbox .v{font-weight:800;font-size:14pt;color:${RED};margin-bottom:3mm;line-height:1.1}
.mid{display:grid;grid-template-columns:78mm 1fr 70mm;gap:8mm;margin-top:6mm;align-items:start}
.feat{display:flex;gap:4mm;margin-bottom:5.5mm;align-items:flex-start}
.feat-ic{flex:none;width:14mm;height:14mm;border:1.5px solid #e3b8ac;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#fdf3ef}
.feat h4{color:${RED};font-weight:800;font-size:10pt;letter-spacing:.3px}
.feat p{font-size:8.5pt;color:#5c534f;margin-top:1mm;line-height:1.3}
.photo{text-align:center}
.photo img{max-width:100%;max-height:78mm;object-fit:contain}
.dimline{margin-top:3mm;font-weight:700;font-size:9.5pt;color:#5c534f}
.dimline b{color:${RED}}
.rightcol h3{color:${RED};font-weight:800;font-size:10pt;letter-spacing:.5px;margin-bottom:3mm}
.sw{display:flex;align-items:center;gap:3mm;font-weight:600;font-size:9.5pt;margin-bottom:2.5mm}
.sw span{width:12mm;height:8mm;border-radius:3px;display:inline-block;border:1px solid rgba(0,0,0,.08)}
.rightcol ul{list-style:none;margin-top:5mm}
.rightcol li{font-size:8.5pt;color:#5c534f;padding-left:5mm;position:relative;margin-bottom:2mm;line-height:1.25}
.rightcol li:before{content:'';position:absolute;left:0;top:1.7mm;width:2mm;height:2mm;border-radius:50%;background:${RED}}
.bottom{display:grid;grid-template-columns:1fr 108mm;gap:7mm;margin-top:6mm}
.techbox{border:1.5px solid #e3b8ac;border-radius:8px;padding:5mm 3mm}
.techtitle{color:${RED};font-weight:800;font-size:10pt;letter-spacing:.5px;margin:0 0 4mm 3mm}
.specs{display:flex;justify-content:space-between}
.spec{flex:1;text-align:center;padding:0 1.5mm;border-right:1px solid #eadfd9}
.spec:last-child{border-right:none}
.spec-ic{display:flex;justify-content:center;margin-bottom:2mm}
.spec-l{font-weight:700;font-size:6.6pt;color:${RED};letter-spacing:.2px;line-height:1.2;min-height:9mm}
.spec-v{font-weight:800;font-size:8pt;color:#3a3230;margin-top:1.5mm;line-height:1.25}
.spec-s{font-size:5.8pt;color:#9a908b;margin-top:.8mm}
.recbox{border:1.5px solid #e3b8ac;border-radius:8px;padding:4mm 5mm}
.recbox>h3{color:${RED};font-weight:800;font-size:10pt;letter-spacing:.5px;margin-bottom:3mm}
.rec{display:flex;gap:3mm;margin-bottom:2.5mm;align-items:flex-start}
.rec-ic{flex:none;width:8mm;height:8mm;border-radius:50%;background:#fdf3ef;display:flex;align-items:center;justify-content:center}
.rec h5{color:${RED};font-weight:800;font-size:8pt;letter-spacing:.3px}
.rec p{font-size:7.2pt;color:#5c534f;line-height:1.3;margin-top:.5mm}
.footer{display:flex;align-items:center;gap:6mm;margin-top:4mm;padding-top:4mm;border-top:2px solid ${RED};font-size:8pt;color:#5c534f;font-weight:600}
.footer b{color:${RED};font-weight:900;font-size:11pt;letter-spacing:1px}
.footer-logo{height:6mm;width:auto;display:block}
</style></head><body>
<div class="top">
  <div class="title"><h1>${p.titulo}</h1><p>${p.subtitulo}</p></div>
  <div class="clsbox"><div class="k">CLASIFICACIÓN</div><div class="v">${p.clasificacion}</div><div class="k">NORMA DE REFERENCIA</div><div class="v" style="font-size:12pt;margin:0">${p.norma}</div></div>
</div>
<div class="mid">
  <div>${feat}</div>
  <div class="photo"><img src="${photoUrl}"></div>
  <div class="rightcol"><h3>DISPONIBLE EN ${nCol} ${nCol === 1 ? "COLOR" : "COLORES"}</h3>${colors}</div>
</div>
<div class="bottom">
  <div class="techbox"><div class="techtitle">CARACTERÍSTICAS TÉCNICAS</div><div class="specs">${specs}</div></div>
  <div class="recbox"><h3>RECOMENDACIONES</h3>${recs}</div>
</div>
<div class="footer"><img class="footer-logo" src="${BASE}/public/logo-clayhouse.png" alt="Clay House"/><span>www.clayhouse.com.co</span><span>ventas@clayhouse.com.co</span><span>(320) 672-3365</span></div>
</body></html>`;
}

// ---- Render ----
const tmpDir = fs.mkdtempSync(path.join(ROOT, ".ficha-tmp-"));
const previewDir = path.join(ROOT, "scripts/fichas/_preview");
if (preview) fs.mkdirSync(previewDir, { recursive: true });

let done = 0;
for (const slug of selected) {
  const p = fichas.find((f) => f.slug === slug);
  if (!p) {
    console.warn(`  ⚠️  ${slug}: no está en fichas.data.mjs`);
    continue;
  }
  // Un producto puede tener varias dimensiones (variants) → una ficha por cada
  // una en <slug>/fichas/<id>.pdf. Si no, una sola ficha en <slug>/ficha.pdf.
  const specs = p.variants
    ? p.variants.map((v) => ({ ...p, ...v, _id: v.id }))
    : [{ ...p, _id: null }];

  if (p.variants && !preview) {
    const single = path.join(ROOT, "public/images/products", slug, "ficha.pdf");
    if (fs.existsSync(single)) fs.rmSync(single); // ya no aplica la ficha única
    fs.mkdirSync(path.join(ROOT, "public/images/products", slug, "fichas"), { recursive: true });
  }

  for (const spec of specs) {
    const tag = spec._id ? `${slug}-${spec._id}` : slug;
    const srcPhoto = path.join(ROOT, decodeURIComponent(spec.foto.replace(/^\/public/, "public")));
    const photoOut = path.join(tmpDir, `${tag}-photo.jpg`);
    try {
      await sharp(srcPhoto).resize({ width: 1100, withoutEnlargement: true }).flatten({ background: "#FCFBF7" }).jpeg({ quality: 84, mozjpeg: true }).toFile(photoOut);
    } catch {
      console.warn(`  ⚠️  ${tag}: foto no encontrada (${spec.foto})`);
    }
    const photoUrl = fs.existsSync(photoOut)
      ? "file://" + photoOut.split(path.sep).map(encodeURIComponent).join("/")
      : fotoURL(spec.foto);
    const htmlPath = path.join(tmpDir, `${tag}.html`);
    fs.writeFileSync(htmlPath, buildHtml(spec, photoUrl));
    const out = preview
      ? path.join(previewDir, `${tag}.pdf`)
      : spec._id
        ? path.join(ROOT, "public/images/products", slug, "fichas", `${spec._id}.pdf`)
        : path.join(ROOT, "public/images/products", slug, "ficha.pdf");
    execFileSync(CHROME, ["--headless", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${out}`, "file://" + htmlPath.split(path.sep).map(encodeURIComponent).join("/")], { stdio: "ignore" });
    const kb = (fs.statSync(out).size / 1024).toFixed(0);
    console.log(`  ✓ ${tag.padEnd(26)} ${kb} KB${preview ? "  (preview)" : ""}`);
    done++;
  }
}
fs.rmSync(tmpDir, { recursive: true, force: true });
console.log(`\n${done} ficha(s) generada(s)${preview ? ` en ${previewDir}` : " en las carpetas de producto"}.`);
