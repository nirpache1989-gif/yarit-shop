"""
process-logo.py — remove the background from the Shoresh logo.

WHAT THIS DOES
  1. Reads the source watercolor logo from
       ../assets/Logomain1.jpg
     (relative to the yarit-shop project root, i.e.
     C:\\AI\\YaritShop\\assets\\Logomain1.jpg)
  2. Runs `rembg` to strip the parchment background.
  3. Writes two outputs:
       public/brand/logo.png          - transparent PNG (primary use)
       public/brand/logo-parchment.jpg - original copy with background

WHY THIS SCRIPT EXISTS
  The logo is a watercolor illustration whose "background" is part of
  the art — a warm parchment/cream texture. For the site we want both
  versions:
    - logo.png (transparent) for headers, footers, anywhere the site
      background doesn't match the parchment tone.
    - logo-parchment.jpg (original) for the hero / about page where
      the painted background adds atmosphere.

HOW TO RUN
  From the yarit-shop project root:

     pip install rembg pillow
     python scripts/process-logo.py

  Optional flags:
     --source PATH        override input file
     --out PATH           override output directory

DEPENDENCIES
  rembg         — onnxruntime-based background remover
  pillow        — image I/O and format conversion

NOTES
  - Run once at the start of the project and any time the source logo
    is replaced.
  - The rembg model downloads on first run (~170MB); subsequent runs
    are cached.
  - If the output is cropped poorly, try a different rembg model:
      from rembg import remove, new_session
      session = new_session("isnet-general-use")
      remove(input_data, session=session)
"""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path


def process(source: Path, out_dir: Path) -> None:
    try:
        from rembg import remove  # type: ignore
        from PIL import Image  # type: ignore
    except ImportError:
        sys.stderr.write(
            "\nERROR: rembg and pillow are required. Install with:\n"
            "    pip install rembg pillow\n\n"
        )
        sys.exit(1)

    if not source.exists():
        sys.stderr.write(f"ERROR: source logo not found at {source}\n")
        sys.exit(1)

    out_dir.mkdir(parents=True, exist_ok=True)

    # 1. Keep an original-with-background copy for places where the
    #    parchment texture is desired (hero, about).
    original_copy = out_dir / "logo-parchment.jpg"
    shutil.copy2(source, original_copy)
    print(f"  copied  {original_copy}")

    # 2. Run rembg to produce a transparent PNG.
    print("  running rembg (first run downloads the model, ~170MB)...")
    with source.open("rb") as f:
        input_bytes = f.read()
    output_bytes = remove(input_bytes)

    transparent_png = out_dir / "logo.png"
    with transparent_png.open("wb") as f:
        f.write(output_bytes)
    print(f"  wrote   {transparent_png}")

    # 3. Verify the PNG is valid and log its dimensions.
    with Image.open(transparent_png) as img:
        print(f"  size    {img.size} mode={img.mode}")

    print("\nDone.")


def main() -> None:
    script_dir = Path(__file__).resolve().parent
    project_root = script_dir.parent  # yarit-shop/
    default_source = project_root.parent / "assets" / "Logomain1.jpg"
    default_out = project_root / "public" / "brand"

    parser = argparse.ArgumentParser(description="Process the Shoresh logo.")
    parser.add_argument(
        "--source",
        type=Path,
        default=default_source,
        help=f"source logo path (default: {default_source})",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=default_out,
        help=f"output directory (default: {default_out})",
    )
    args = parser.parse_args()

    print(f"source : {args.source}")
    print(f"out    : {args.out}")
    process(args.source, args.out)


if __name__ == "__main__":
    main()
