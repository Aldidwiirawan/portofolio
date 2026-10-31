import os
import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from mockup_helpers import make_iphone, create_floor_reflection

def create_dark_amber_background(width, height, scale=2):
    """Creates a dark studio background with warm amber radial glow and subtle floor horizon."""
    bg = Image.new("RGBA", (width, height), (13, 15, 17, 255))
    
    # 1. Warm amber radial bloom behind the devices
    # Center: x = width * 0.5, y = height * 0.48
    cx = width * 0.5
    cy = height * 0.48
    glow_rad = int(width * 0.45)
    
    # Generate radial glow
    gw, gh = 400, 250
    glow_small = Image.new("RGBA", (gw, gh), (0, 0, 0, 0))
    gcx, gcy = gw * 0.5, gh * 0.48
    g_max_r = gw * 0.48
    
    # Amber/orange glow color: (234, 88, 12)
    glow_col = (234, 88, 12)
    
    for y in range(gh):
        for x in range(gw):
            dist = math.sqrt((x - gcx)**2 + (y - gcy)**2)
            if dist < g_max_r:
                factor = (1.0 - dist / g_max_r) ** 2.2
                alpha = int(45 * factor)  # Subtle 18% peak opacity
                glow_small.putpixel((x, y), (glow_col[0], glow_col[1], glow_col[2], alpha))
                
    glow_large = glow_small.resize((width, height), Image.Resampling.BICUBIC)
    bg.alpha_composite(glow_large)
    
    # 2. Floor horizon & subtle ambient reflection plane at bottom
    floor_y = int(height * 0.72)
    floor_h = height - floor_y
    floor_overlay = Image.new("RGBA", (width, floor_h), (0, 0, 0, 0))
    fdraw = ImageDraw.Draw(floor_overlay)
    
    for y in range(floor_h):
        t = y / float(floor_h)
        # Subtle gradient from darker horizon to slightly warmer foreground
        alpha = int(25 * (1.0 - t))
        fdraw.line([(0, y), (width, y)], fill=(255, 140, 70, alpha), width=1)
        
    bg.alpha_composite(floor_overlay, (0, floor_y))
    
    return bg

def draw_header_title(canvas, scale=2):
    """Draws modern title at the top matching Styfen's style."""
    draw = ImageDraw.Draw(canvas)
    
    try:
        font_title = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", int(36 * scale))
        font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", int(17 * scale))
    except Exception:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        
    title_text = "JejakPaket - Aplikasi Operator Bukti Packing"
    sub_text = "Scan Cepat Ekspedisi  •  Anti-Scan Ganda  •  Foto & Video Serah Terima  •  Dokumen PDF Sah"
    
    # Measure title
    bbox_t = draw.textbbox((0, 0), title_text, font=font_title)
    tw = bbox_t[2] - bbox_t[0]
    tx = (canvas.width - tw) // 2
    ty = int(60 * scale)
    
    # Draw soft title glow
    draw.text((tx, ty), title_text, font=font_title, fill=(245, 247, 250, 255))
    
    # Measure sub
    bbox_s = draw.textbbox((0, 0), sub_text, font=font_sub)
    sw = bbox_s[2] - bbox_s[0]
    sx = (canvas.width - sw) // 2
    sy = ty + int(48 * scale)
    draw.text((sx, sy), sub_text, font=font_sub, fill=(156, 163, 175, 255))

def make_pdf_card(scale=2, target_w=600):
    """Creates a sleek white document sheet with subtle drop shadow for the PDF proof."""
    doc = Image.open("public/projects/raw/doc_pdf.webp").convert("RGBA")
    
    w = int(target_w * scale)
    h = int(w * (doc.height / float(doc.width)))
    doc_resized = doc.resize((w, h), Image.Resampling.LANCZOS)
    
    radius = int(12 * scale)
    mask = Image.new("L", (w, h), 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.rounded_rectangle([0, 0, w, h], radius=radius, fill=255)
    
    card = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    card.paste(doc_resized, (0, 0), mask=mask)
    
    # 1px border
    cdraw = ImageDraw.Draw(card)
    cdraw.rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, outline=(220, 225, 230, 255), width=max(1, int(1.5 * scale)))
    
    # Drop shadow
    pad = int(50 * scale)
    shadow_card = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow_card)
    sdraw.rounded_rectangle([pad, pad + int(15 * scale), pad + w, pad + h + int(15 * scale)], radius=radius, fill=(0, 0, 0, 110))
    shadow_card = shadow_card.filter(ImageFilter.GaussianBlur(int(25 * scale)))
    
    shadow_card.alpha_composite(card, (pad, pad))
    return shadow_card, pad

def generate_option_centered():
    """
    Composition 1:
    - 3 iPhones in the foreground (Left: Scan -7°, Center: Foto 0°, Right: Video +7°)
    - The PDF Document sheet floating gracefully centered in the upper/mid background behind the phones!
    - Soft floor reflections and contact shadows.
    """
    SCALE = 2
    FINAL_W = 1600
    FINAL_H = 1000
    CW = FINAL_W * SCALE
    CH = FINAL_H * SCALE
    
    print("Generating Composition 1 (Centered Document behind 3 Phones)...")
    canvas = create_dark_amber_background(CW, CH, scale=SCALE)
    draw_header_title(canvas, scale=SCALE)
    
    # 1. Background PDF Document (floating behind phones)
    pdf_card, pdf_pad = make_pdf_card(scale=SCALE, target_w=680)
    # Position: centered horizontally, top ~ 140px
    pdf_x = (CW - pdf_card.width) // 2
    pdf_y = int(140 * SCALE) - pdf_pad
    canvas.alpha_composite(pdf_card, (pdf_x, pdf_y))
    
    # 2. Build 3 iPhones
    target_phone_h = 440  # at 1x -> 880 at 2x
    print("Building iPhone Left (Scan resi)...")
    phone_left = make_iphone("public/projects/raw/mobile_scan.webp", target_h=target_phone_h, scale=SCALE)
    
    print("Building iPhone Center (Foto packing)...")
    phone_center = make_iphone("public/projects/raw/mobile_foto.webp", target_h=target_phone_h + 15, scale=SCALE)
    
    print("Building iPhone Right (Video dropping)...")
    phone_right = make_iphone("public/projects/raw/mobile_video.webp", target_h=target_phone_h, scale=SCALE)
    
    # Base positioning
    # Ground baseline at y ~ 860px (at 1x) = 1720px at 2x
    base_y = int(870 * SCALE)
    center_x = CW // 2
    
    # Left Phone: tilted -7.5 degrees
    rot_left = phone_left.rotate(-7.5, resample=Image.Resampling.BICUBIC, expand=True)
    ref_left = create_floor_reflection(rot_left, height_ratio=0.22, max_alpha=0.30)
    
    # Right Phone: tilted +7.5 degrees
    rot_right = phone_right.rotate(7.5, resample=Image.Resampling.BICUBIC, expand=True)
    ref_right = create_floor_reflection(rot_right, height_ratio=0.22, max_alpha=0.30)
    
    # Center Phone: upright 0 degrees
    rot_center = phone_center
    ref_center = create_floor_reflection(rot_center, height_ratio=0.25, max_alpha=0.40)
    
    # Coordinates
    spacing = int(270 * SCALE)
    lx = center_x - spacing - rot_left.width // 2
    ly = base_y - rot_left.height
    
    rx = center_x + spacing - rot_right.width // 2
    ry = base_y - rot_right.height
    
    cx = center_x - rot_center.width // 2
    cy = base_y - rot_center.height - int(10 * SCALE)
    
    # 3. Ambient contact shadows on floor
    shadow_layer = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow_layer)
    for px, py, pw, ph, tilt in [(lx, ly, rot_left.width, rot_left.height, -7),
                                  (rx, ry, rot_right.width, rot_right.height, 7),
                                  (cx, cy, rot_center.width, rot_center.height, 0)]:
        # Contact shadow oval
        sw_w = int(pw * 0.75)
        sw_h = int(35 * SCALE)
        sx = px + (pw - sw_w) // 2
        sy = py + ph - int(20 * SCALE)
        sdraw.ellipse([sx, sy, sx + sw_w, sy + sw_h], fill=(0, 0, 0, 180))
        
        # Deep ambient shadow behind phone
        sdraw.rounded_rectangle([px + int(20 * SCALE), py + int(40 * SCALE), px + pw - int(20 * SCALE), py + ph], radius=int(40 * SCALE), fill=(0, 0, 0, 120))
        
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(int(22 * SCALE)))
    canvas.alpha_composite(shadow_layer)
    
    # 4. Floor Reflections
    canvas.alpha_composite(ref_left, (lx, ly + rot_left.height - int(5 * SCALE)))
    canvas.alpha_composite(ref_right, (rx, ry + rot_right.height - int(5 * SCALE)))
    canvas.alpha_composite(ref_center, (cx, cy + rot_center.height - int(5 * SCALE)))
    
    # 5. Composite Phones (Left & Right first, Center in front)
    canvas.alpha_composite(rot_left, (lx, ly))
    canvas.alpha_composite(rot_right, (rx, ry))
    canvas.alpha_composite(rot_center, (cx, cy))
    
    # Downscale to 1600x1000
    out = canvas.resize((FINAL_W, FINAL_H), Image.Resampling.LANCZOS)
    out.save("scratch/jejakpaket_cover_v1.webp", "WEBP", quality=95)
    print("Saved scratch/jejakpaket_cover_v1.webp")

if __name__ == "__main__":
    generate_option_centered()
