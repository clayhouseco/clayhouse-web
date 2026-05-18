#!/usr/bin/env python3
"""
Fondo crema (#fffbf9) para fotos de producto.
Procesa cada subcarpeta de color en products/{slug}/{variant}/ → {variant}/web/

Uso: python3 scripts/process-product-bg.py romano
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public" / "images" / "products"
CREAM = (255, 251, 249)
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp"}
SKIP_DIRS = {"web", "proyectos", "_shared"}
SKIP_FILES = {"fachada.jpg", "fachada.png", "fachada.jpeg"}


def process_slug_root(slug_dir: Path) -> None:
    """PNG/JPG en la raíz del producto (romano dimensiones, romano ficha)."""
    out = slug_dir / "web"
    for src in sorted(slug_dir.iterdir()):
        if not src.is_file() or src.suffix.lower() not in IMAGE_EXT:
            continue
        if not should_process(src.name):
            continue
        if not re.match(r"^romano (dimensiones|ficha)", src.name, re.I):
            continue
        dst = out / (src.stem + ".jpg")
        process_file(src, dst)
        print(f"  ✓ {src.name} → web/{dst.name}")


def should_process(filename: str) -> bool:
    return filename.lower() not in SKIP_FILES and "fachada" not in filename.lower()


def is_background(r: int, g: int, b: int, a: int) -> bool:
    if a < 12:
        return True
    mx, mn = max(r, g, b), min(r, g, b)
    spread = mx - mn
    avg = (r + g + b) / 3
    if mx < 42:
        return True
    if mn > 248:
        return True
    if spread < 28 and avg > 155:
        return True
    return False


def process_file(src: Path, dst: Path) -> None:
    img = Image.open(src).convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if is_background(r, g, b, a):
                px[x, y] = (*CREAM, 0)
    bg = Image.new("RGBA", img.size, (*CREAM, 255))
    bg.paste(img, mask=img.split()[3])
    dst.parent.mkdir(parents=True, exist_ok=True)
    bg.convert("RGB").save(dst, "JPEG", quality=92, optimize=True)


def process_shared(slug_dir: Path) -> None:
    shared = slug_dir / "_shared"
    if not shared.is_dir():
        return
    out = shared / "web"
    for src in sorted(shared.iterdir()):
        if src.suffix.lower() not in IMAGE_EXT or src.name.startswith("."):
            continue
        if not should_process(src.name):
            print(f"  ○ sin procesar (obra): _shared/{src.name}")
            continue
        dst = out / (src.stem + ".jpg")
        process_file(src, dst)
        print(f"  ✓ _shared/{src.name} → _shared/web/{dst.name}")


def process_slug(slug: str) -> None:
    slug_dir = PUBLIC / slug
    if not slug_dir.is_dir():
        print(f"No existe {slug_dir}")
        sys.exit(1)

    print(f"Procesando {slug}")
    process_slug_root(slug_dir)
    process_shared(slug_dir)

    for variant_dir in sorted(slug_dir.iterdir()):
        if not variant_dir.is_dir():
            continue
        if variant_dir.name in SKIP_DIRS or variant_dir.name.startswith("."):
            continue
        out = variant_dir / "web"
        for src in sorted(variant_dir.iterdir()):
            if src.suffix.lower() not in IMAGE_EXT or src.name.startswith("."):
                continue
            if not should_process(src.name):
                print(f"  ○ sin procesar (obra): {variant_dir.name}/{src.name}")
                continue
            dst = out / (src.stem + ".jpg")
            process_file(src, dst)
            print(f"  ✓ {variant_dir.name}/{src.name} → {variant_dir.name}/web/{dst.name}")


def main() -> None:
    if len(sys.argv) < 2:
        print("Uso: python3 scripts/process-product-bg.py <slug>")
        sys.exit(1)
    process_slug(sys.argv[1])


if __name__ == "__main__":
    main()
