import os
import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from advanced_mockup import make_iphone_3d, make_floor_reflection, make_pdf_document

def create_studio_bg(width, height, glow_x_ratio=0.5, scale=2):
    bg = Image.new("RGBA", (width, height), (13, 15, 17, 255))
    
    # Amber/orange radial glow
    gw, gh = 400, 250
    glow_small = Image.new("RGBA", (gw, gh), (0, 0, 0, 0))
    gcx, gcy = gw * glow_x_ratio, gh * 0.48
    g_max_r = gw * 0.50
    glow_col = (234, 88, 12)
    
    for y in range(gh):
        for x in range(gw):
            dist = math.sqrt((x - gcx)**2 + (y - gcy)**2)
            if dist < g_max_r:
                factor = (1.0 - dist / g_max_r) ** 2.2
                alpha = int(48 * factor)
                glow_small.putpixel((x, y), (glow_col[0], glow_col[1], glow_col[2], alpha))
                
    glow_large = glow_small.resize((width, height), Image.Resampling.BICUBIC)
    bg.alpha_composite(glow_large)
    
    # Floor ambient highlight
    floor_y = int(height * 0.70)
    floor_h = height - floor_y
    floor_overlay = Image.new("RGBA", (width, floor_h), (0, 0, 0, 0))
    fdraw = ImageDraw.Draw(floor_overlay)
    
    for y in range(floor_h):
        t = y / float(floor_h)
        alpha = int(28 * (1.0 - t))
        fdraw.line([(0, y), (width, y)], fill=(255, 140, 70, alpha), width=1)
        
    bg.alpha_composite(floor_overlay, (0, floor_y))
    return bg

def draw_header_title(canvas, scale=2):
    draw = ImageDraw.Draw(canvas)
    try:
        font_title = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", int(36 * scale))
        font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", int(17 * scale))
    except Exception:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        
    title_text = "JejakPaket - Aplikasi Operator Bukti Packing"
    sub_text = "Scan Cepat Ekspedisi  •  Anti-Scan Ganda  •  Foto & Video Serah Terima  •  Dokumen PDF Sah"
    
    bbox_t = draw.textbbox((0, 0), title_text, font=font_title)
    tw = bbox_t[2] - bbox_t[0]
    tx = (canvas.width - tw) // 2
    ty = int(55 * scale)
    draw.text((tx, ty), title_text, font=font_title, fill=(245, 247, 250, 255))
    
    bbox_s = draw.textbbox((0, 0), sub_text, font=font_sub)
    sw = bbox_s[2] - bbox_s[0]
    sx = (canvas.width - sw) // 2
    sy = ty + int(48 * scale)
    draw.text((sx, sy), sub_text, font=font_sub, fill=(156, 163, 175, 255))

def generate_layout_a():
    """Layout A: Centered 3D Phone Trio (like Styfen's Nyawit) with floating PDF Document behind them"""
    SCALE = 2
    W, H = 1600 * SCALE, 1000 * SCALE
    print("Generating Layout A (Styfen Nyawit Trio + Background Document)...")
    
    canvas = create_studio_bg(W, H, glow_x_ratio=0.5, scale=SCALE)
    draw_header_title(canvas, scale=SCALE)
    
    # 1. Background Document (elevated, floating centered behind phones)
    doc_sheet, doc_pad, dw, dh = make_pdf_document(target_h=620, scale=SCALE)
    doc_x = (W - doc_sheet.width) // 2
    doc_y = int(145 * SCALE) - doc_pad
    canvas.alpha_composite(doc_sheet, (doc_x, doc_y))
    
    # 2. 3D Phones
    # Left: Scan resi (yaw -1, turned right)
    phone_l = make_iphone_3d("public/projects/raw/mobile_scan.webp", target_h=450, scale=SCALE, yaw_direction=-1)
    phone_l = phone_l.rotate(-4.0, resample=Image.Resampling.BICUBIC, expand=True)
    ref_l = make_floor_reflection(phone_l, height_ratio=0.20, max_alpha=0.30)
    
    # Right: Video dropping (yaw +1, turned left)
    phone_r = make_iphone_3d("public/projects/raw/mobile_video.webp", target_h=450, scale=SCALE, yaw_direction=1)
    phone_r = phone_r.rotate(4.0, resample=Image.Resampling.BICUBIC, expand=True)
    ref_r = make_floor_reflection(phone_r, height_ratio=0.20, max_alpha=0.30)
    
    # Center: Foto packing (yaw 0, upright, in front)
    phone_c = make_iphone_3d("public/projects/raw/mobile_foto.webp", target_h=465, scale=SCALE, yaw_direction=0)
    ref_c = make_floor_reflection(phone_c, height_ratio=0.22, max_alpha=0.40)
    
    # Positioning
    base_y = int(875 * SCALE)
    cx = W // 2
    spacing = int(280 * SCALE)
    
    lx = cx - spacing - phone_l.width // 2
    ly = base_y - phone_l.height
    
    rx = cx + spacing - phone_r.width // 2
    ry = base_y - phone_r.height
    
    cc_x = cx - phone_c.width // 2
    cc_y = base_y - phone_c.height - int(8 * SCALE)
    
    # Floor contact shadows
    shadow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow_layer)
    for px, py, pw, ph in [(lx, ly, phone_l.width, phone_l.height),
                           (rx, ry, phone_r.width, phone_r.height),
                           (cc_x, cc_y, phone_c.width, phone_c.height)]:
        sw_w = int(pw * 0.72)
        sw_h = int(32 * SCALE)
        sx = px + (pw - sw_w) // 2
        sy = py + ph - int(18 * SCALE)
        sdraw.ellipse([sx, sy, sx + sw_w, sy + sw_h], fill=(0, 0, 0, 200))
        # Deep body shadow
        sdraw.rounded_rectangle([px + int(25 * SCALE), py + int(45 * SCALE), px + pw - int(25 * SCALE), py + ph], radius=int(40 * SCALE), fill=(0, 0, 0, 130))
        
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(int(22 * SCALE)))
    canvas.alpha_composite(shadow_layer)
    
    # Floor reflections
    canvas.alpha_composite(ref_l, (lx, ly + phone_l.height - int(6 * SCALE)))
    canvas.alpha_composite(ref_r, (rx, ry + phone_r.height - int(6 * SCALE)))
    canvas.alpha_composite(ref_c, (cc_x, cc_y + phone_c.height - int(6 * SCALE)))
    
    # Composite Phones
    canvas.alpha_composite(phone_l, (lx, ly))
    canvas.alpha_composite(phone_r, (rx, ry))
    canvas.alpha_composite(phone_c, (cc_x, cc_y))
    
    out = canvas.resize((1600, 1000), Image.Resampling.LANCZOS)
    out.save("scratch/layout_a.webp", "WEBP", quality=95)
    print("Saved scratch/layout_a.webp")

def generate_layout_b():
    """Layout B: Panoramic Split (PDF Document on Left + 3 Phones on Right)"""
    SCALE = 2
    W, H = 1600 * SCALE, 1000 * SCALE
    print("Generating Layout B (Document on Left + 3 Phones on Right)...")
    
    canvas = create_studio_bg(W, H, glow_x_ratio=0.68, scale=SCALE)
    draw_header_title(canvas, scale=SCALE)
    
    # 1. Document on the left side
    doc_sheet, doc_pad, dw, dh = make_pdf_document(target_h=670, scale=SCALE)
    # Slight tilt on document
    doc_rot = doc_sheet.rotate(1.5, resample=Image.Resampling.BICUBIC, expand=True)
    doc_x = int(100 * SCALE) - doc_pad
    doc_y = int(190 * SCALE) - doc_pad
    canvas.alpha_composite(doc_rot, (doc_x, doc_y))
    
    # 2. 3 Phones on the right side
    target_h = 430
    phone_l = make_iphone_3d("public/projects/raw/mobile_scan.webp", target_h=target_h, scale=SCALE, yaw_direction=-1)
    phone_l = phone_l.rotate(-5.0, resample=Image.Resampling.BICUBIC, expand=True)
    ref_l = make_floor_reflection(phone_l, height_ratio=0.20, max_alpha=0.30)
    
    phone_r = make_iphone_3d("public/projects/raw/mobile_video.webp", target_h=target_h, scale=SCALE, yaw_direction=1)
    phone_r = phone_r.rotate(5.0, resample=Image.Resampling.BICUBIC, expand=True)
    ref_r = make_floor_reflection(phone_r, height_ratio=0.20, max_alpha=0.30)
    
    phone_c = make_iphone_3d("public/projects/raw/mobile_foto.webp", target_h=target_h + 15, scale=SCALE, yaw_direction=0)
    ref_c = make_floor_reflection(phone_c, height_ratio=0.22, max_alpha=0.40)
    
    base_y = int(875 * SCALE)
    center_phones_x = int(1120 * SCALE)
    spacing = int(220 * SCALE)
    
    lx = center_phones_x - spacing - phone_l.width // 2
    ly = base_y - phone_l.height
    
    rx = center_phones_x + spacing - phone_r.width // 2
    ry = base_y - phone_r.height
    
    cc_x = center_phones_x - phone_c.width // 2
    cc_y = base_y - phone_c.height - int(8 * SCALE)
    
    # Shadows
    shadow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow_layer)
    for px, py, pw, ph in [(lx, ly, phone_l.width, phone_l.height),
                           (rx, ry, phone_r.width, phone_r.height),
                           (cc_x, cc_y, phone_c.width, phone_c.height)]:
        sw_w = int(pw * 0.72)
        sw_h = int(32 * SCALE)
        sx = px + (pw - sw_w) // 2
        sy = py + ph - int(18 * SCALE)
        sdraw.ellipse([sx, sy, sx + sw_w, sy + sw_h], fill=(0, 0, 0, 200))
        sdraw.rounded_rectangle([px + int(25 * SCALE), py + int(45 * SCALE), px + pw - int(25 * SCALE), py + ph], radius=int(40 * SCALE), fill=(0, 0, 0, 130))
        
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(int(22 * SCALE)))
    canvas.alpha_composite(shadow_layer)
    
    # Floor reflections
    canvas.alpha_composite(ref_l, (lx, ly + phone_l.height - int(6 * SCALE)))
    canvas.alpha_composite(ref_r, (rx, ry + phone_r.height - int(6 * SCALE)))
    canvas.alpha_composite(ref_c, (cc_x, cc_y + phone_c.height - int(6 * SCALE)))
    
    # Composite Phones
    canvas.alpha_composite(phone_l, (lx, ly))
    canvas.alpha_composite(phone_r, (rx, ry))
    canvas.alpha_composite(phone_c, (cc_x, cc_y))
    
    out = canvas.resize((1600, 1000), Image.Resampling.LANCZOS)
    out.save("scratch/layout_b.webp", "WEBP", quality=95)
    print("Saved scratch/layout_b.webp")

if __name__ == "__main__":
    generate_layout_a()
    generate_layout_b()
