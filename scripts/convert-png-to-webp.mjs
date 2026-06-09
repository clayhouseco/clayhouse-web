import sharp from "sharp";
import fs from "node:fs";
import { execSync } from "node:child_process";

const files = execSync(`find public/images -iname "*.png"`).toString().trim().split("\n").filter(Boolean);
let origTotal = 0, newTotal = 0, converted = 0, kept = 0;
const failures = [];

for (const png of files) {
  const webp = png.replace(/\.png$/i, ".webp");
  try {
    const orig = fs.statSync(png).size;
    const buf = await sharp(png).webp({ quality: 82, effort: 6 }).toBuffer();
    // Seguridad: si por algo WebP saliera más grande, conservamos PNG
    if (buf.length >= orig) { kept++; continue; }
    fs.writeFileSync(webp, buf);
    fs.unlinkSync(png);
    origTotal += orig; newTotal += buf.length; converted++;
  } catch (e) {
    failures.push(`${png}: ${e.message}`);
  }
}
const mb = (b) => (b / 1048576).toFixed(1);
console.log(`Convertidos: ${converted}  |  conservados como PNG (WebP era mayor): ${kept}  |  fallos: ${failures.length}`);
console.log(`Peso: ${mb(origTotal)} MB → ${mb(newTotal)} MB  (-${(100 - newTotal / origTotal * 100).toFixed(0)}%)`);
if (failures.length) console.log("FALLOS:\n" + failures.join("\n"));
