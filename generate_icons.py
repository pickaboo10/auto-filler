"""
generate_icons.py
One-time script to generate extension icons using Pillow.
Creates icons/icon16.png, icons/icon48.png, icons/icon128.png
"""

import os
from PIL import Image, ImageDraw, ImageFont

# Configuration
ICON_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "icons")
BG_COLOR = "#1a73e8"
TEXT_COLOR = "white"
LETTER = "A"
SIZES = [16, 48, 128]

# Font paths to try in order
FONT_PATHS = [
    "arialbd.ttf",                                                  # Windows
    "/System/Library/Fonts/Helvetica.ttc",                          # Mac
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",         # Linux
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", # Linux alt
]


def load_font(size):
    """Try loading a font from known paths; fall back to default."""
    for path in FONT_PATHS:
        try:
            return ImageFont.truetype(path, size)
        except (IOError, OSError):
            continue
    print("Warning: No system font found. Using Pillow default font.")
    return ImageFont.load_default()


def center_text(draw, img_size, text, font):
    """Calculate (x, y) to center text on the image."""
    # Try textbbox first (Pillow >= 8.0)
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        x = (img_size - text_w) / 2 - bbox[0]
        y = (img_size - text_h) / 2 - bbox[1]
        return x, y
    except AttributeError:
        pass

    # Try font.getsize() (older Pillow)
    try:
        text_w, text_h = font.getsize(text)
        x = (img_size - text_w) / 2
        y = (img_size - text_h) / 2
        return x, y
    except AttributeError:
        pass

    # Absolute last resort: hardcode offset
    offset = img_size // 3
    return offset, offset


def generate_icon(size):
    """Generate a single icon at the given pixel size."""
    img = Image.new("RGBA", (size, size), BG_COLOR)
    draw = ImageDraw.Draw(img)

    font_size = int(size * 0.6)
    font = load_font(font_size)

    x, y = center_text(draw, size, LETTER, font)
    draw.text((x, y), LETTER, fill=TEXT_COLOR, font=font)

    return img


def main():
    os.makedirs(ICON_DIR, exist_ok=True)

    for size in SIZES:
        img = generate_icon(size)
        filepath = os.path.join(ICON_DIR, f"icon{size}.png")
        img.save(filepath, "PNG")
        print(f"Created {filepath}  ({size}x{size})")

    print("Icon generation complete.")


if __name__ == "__main__":
    main()
