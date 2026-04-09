"""
process-logo-simple.py — Pillow-only fallback background remover.

Use this if rembg isn't installable (network issues, CPU constraints).
It uses color distance from a sampled background to build an alpha
mask. Works well for logos with a near-uniform background (like our
watercolor parchment) but may leave soft halos around very detailed
edges. For best quality, prefer scripts/process-logo.py (which uses
the ML-based rembg).

USAGE
    python scripts/process-logo-simple.py

OUTPUT
    public/brand/logo.png   (transparent)
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageFilter


def main() -> None:
    script_dir = Path(__file__).resolve().parent
    project_root = script_dir.parent
    source = project_root.parent / "assets" / "Logomain1.jpg"
    out_path = project_root / "public" / "brand" / "logo.png"
    out_path.parent.mkdir(parents=True, exist_ok=True)

    if not source.exists():
        sys.stderr.write(f"ERROR: source logo not found at {source}\n")
        sys.exit(1)

    print(f"reading  {source}")
    img = Image.open(source).convert("RGBA")
    w, h = img.size

    # Sample the 8 edge points to get the background color.
    samples = [
        img.getpixel((5, 5))[:3],
        img.getpixel((w - 6, 5))[:3],
        img.getpixel((5, h - 6))[:3],
        img.getpixel((w - 6, h - 6))[:3],
        img.getpixel((w // 2, 5))[:3],
        img.getpixel((5, h // 2))[:3],
        img.getpixel((w - 6, h // 2))[:3],
        img.getpixel((w // 2, h - 6))[:3],
    ]
    bg = tuple(sum(s[i] for s in samples) // len(samples) for i in range(3))
    print(f"sampled  background = rgb{bg}  #{bg[0]:02x}{bg[1]:02x}{bg[2]:02x}")

    # Build an alpha mask: distance from bg in RGB space.
    # Tune with the thresholds below — anything below `solid_thresh`
    # stays fully transparent; anything above `opaque_thresh` stays
    # fully opaque; in between is interpolated smoothly.
    solid_thresh = 10.0   # pixels within this distance are transparent
    opaque_thresh = 45.0  # pixels beyond this distance are fully opaque

    pixels = list(img.getdata())
    new_pixels = []
    for r, g, b, a in pixels:
        dr = r - bg[0]
        dg = g - bg[1]
        db = b - bg[2]
        dist = (dr * dr + dg * dg + db * db) ** 0.5
        if dist <= solid_thresh:
            alpha = 0
        elif dist >= opaque_thresh:
            alpha = 255
        else:
            t = (dist - solid_thresh) / (opaque_thresh - solid_thresh)
            alpha = int(round(t * 255))
        new_pixels.append((r, g, b, alpha))
    img.putdata(new_pixels)

    # A tiny blur on the alpha channel softens the edge and hides
    # JPEG compression artifacts.
    r_, g_, b_, a_ = img.split()
    a_ = a_.filter(ImageFilter.GaussianBlur(radius=0.8))
    img = Image.merge("RGBA", (r_, g_, b_, a_))

    print(f"writing  {out_path}")
    img.save(out_path, "PNG", optimize=True)

    print("done")


if __name__ == "__main__":
    main()
