import os
from PIL import Image, ImageDraw, ImageFont

icons_dir = os.path.join(os.path.dirname(__file__), '..', 'icons')
os.makedirs(icons_dir, exist_ok=True)

def create_icon(size):
    # Dark modern slate background
    img = Image.new('RGBA', (size, size), (15, 23, 42, 255))
    draw = ImageDraw.Draw(img)
    
    # Rounded badge or circle
    margin = int(size * 0.08)
    draw.rounded_rectangle([margin, margin, size - margin, size - margin], radius=int(size * 0.22), fill=(30, 41, 59, 255), outline=(16, 185, 129, 255), width=max(2, int(size * 0.03)))
    
    # Inner glowing circle
    cx, cy = size // 2, size // 2
    r = int(size * 0.32)
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(16, 185, 129, 40), outline=(52, 211, 153, 255), width=max(2, int(size * 0.025)))
    
    # Checkmark / Upward growth arrow
    # Point 1 (left of check), Point 2 (bottom of check), Point 3 (top right of check)
    p1 = (int(cx - size * 0.16), int(cy + size * 0.02))
    p2 = (int(cx - size * 0.04), int(cy + size * 0.14))
    p3 = (int(cx + size * 0.18), int(cy - size * 0.14))
    
    draw.line([p1, p2, p3], fill=(16, 185, 129, 255), width=max(3, int(size * 0.06)), joint="curve")
    
    # Star / spark of transformation at top-right
    sx, sy = int(cx + size * 0.22), int(cy - size * 0.22)
    sr = int(size * 0.05)
    draw.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=(56, 189, 248, 255))
    
    return img

sizes = [(512, 'icon-512.png'), (192, 'icon-192.png'), (96, 'favicon.png'), (48, 'favicon-48.png')]
for s, filename in sizes:
    icon = create_icon(s)
    icon.save(os.path.join(icons_dir, filename), 'PNG')
    print(f"Generated {filename} ({s}x{s})")

print("Icons generated successfully!")
