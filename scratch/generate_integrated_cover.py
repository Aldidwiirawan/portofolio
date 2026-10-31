import os
import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from advanced_mockup import make_iphone_3d, make_floor_reflection, make_pdf_document

def create_studio_bg(width, height, glow_x_ratio=0.58, scale=2):
    bg = Image.new("RGBA", (width, height), (12, 14, 16, 255))
    
    # Warm amber / terracotta radial ambient bloom
    gw, gh = 400, 250
    glow_small = Image.new("RGBA", (gw, gh), (0, 0, 0, 0))
    gcx, gcy = gw * glow_x_ratio, gh * 0.48
    g_max_r = gw * 0.52
    glow_col = (234, 88, 12)
    
    for y in range(gh):
        for x in range(gw):
            dist = math.sqrt((x - gcx)**2 + (y - gcy)**2)
            if dist < g_max_r:
                factor = (1.0 - dist / g_max_r) ** 2.2
                alpha = int(50 * factor)
                glow_small.putpixel((x, y), (glow_col[0], glow_col[1], glow_col[2], alpha))
                
    glow_large = glow_small.resize((width, height), Image.Resampling.BICUBIC)
    bg.alpha_composite(glow_large)
    
    # Floor ambient highlight plane
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

def generate_masterpiece():
    SCALE = 2
    FINAL_W = 1600
    FINAL_H = 1000
    W = FINAL_W * SCALE
    H = FINAL_H * SCALE
    
    print("Generating Integrated Masterpiece Cover (Document + 3 Overlapping 3D Phones)...")
    canvas = create_studio_bg(W, H, glow_x_ratio=0.60, scale=SCALE)
    draw_header_title(canvas, scale=SCALE)
    
    # 1. Document (Left side, slightly tilted -2.5°, gently overlapped by Left Phone)
    doc_target_h = 650
    doc_sheet, doc_pad, dw, dh = make_pdf_document(target_h=doc_target_h, scale=SCALE)
    doc_rot = doc_sheet.rotate(-2.5, resample=Image.Resampling.BICUBIC, expand=True)
    doc_ref = make_floor_reflection(doc_rot, height_ratio=0.18, max_alpha=0.25)
    
    doc_x = int(95 * SCALE) - doc_pad
    doc_y = int(185 * SCALE) - doc_pad
    
    # Document floor reflection
    canvas.alpha_composite(doc_ref, (doc_x, doc_y + doc_rot.height - int(10 * SCALE)))
    # Document card
    canvas.alpha_composite(doc_rot, (doc_x, doc_y))
    
    # 2. Build 3 iPhones
    target_phone_h = 445
    # Phone Left: Scan resi (yaw -1, turned slightly to center, tilted -5.5°)
    phone_l = make_iphone_3d("public/projects/raw/mobile_scan.webp", target_h=target_phone_h, scale=SCALE, yaw_direction=-1)
    phone_l = phone_l.rotate(-5.5, resample=Image.Resampling.BICUBIC, expand=True)
    ref_l = make_floor_reflection(phone_l, height_ratio=0.22, max_alpha=0.32)
    
    # Phone Right: Dropping video (yaw +1, turned slightly to center, tilted +5.5°)
    phone_r = make_iphone_3d("public/projects/raw/mobile_video.webp", target_h=target_phone_h, scale=SCALE, yaw_direction=1)
    phone_r = phone_r.rotate(5.5, resample=Image.Resampling.BICUBIC, expand=True)
    ref_r = make_floor_reflection(phone_r, height_ratio=0.22, max_alpha=0.32)
    
    # Phone Center: Foto packing & antrean (yaw 0, upright, hero in front)
    phone_c = make_iphone_3d("public/projects/raw/mobile_foto.webp", target_h=target_phone_h + 18, scale=SCALE, yaw_direction=0)
    ref_c = make_floor_reflection(phone_c, height_ratio=0.24, max_alpha=0.42)
    
    # Positioning
    base_y = int(880 * SCALE)
    # The 3 phones span from x = 540 to x = 1500 (spanning 960px width)
    center_phones_x = int(1055 * SCALE)
    spacing = int(245 * SCALE)
    
    lx = center_phones_x - spacing - phone_l.width // 2
    ly = base_y - phone_l.height
    
    rx = center_phones_x + spacing - phone_r.width // 2
    ry = base_y - phone_r.height
    
    cc_x = center_phones_x - phone_c.width // 2
    cc_y = base_y - phone_c.height - int(8 * SCALE)
    
    # 3. Floor contact shadows for phones
    shadow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow_layer)
    for px, py, pw, ph in [(lx, ly, phone_l.width, phone_l.height),
                           (rx, ry, phone_r.width, phone_r.height),
                           (cc_x, cc_y, phone_c.width, phone_c.height)]:
        sw_w = int(pw * 0.72)
        sw_h = int(32 * SCALE)
        sx = px + (pw - sw_w) // 2
        sy = py + ph - int(18 * SCALE)
        sdraw.ellipse([sx, sy, sx + sw_w, sy + sw_h], fill=(0, 0, 0, 210))
        # Ambient shadow
        sdraw.rounded_rectangle([px + int(25 * SCALE), py + int(45 * SCALE), px + pw - int(25 * SCALE), py + ph], radius=int(40 * SCALE), fill=(0, 0, 0, 130))
        
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(int(22 * SCALE)))
    canvas.alpha_composite(shadow_layer)
    
    # 4. Floor reflections
    canvas.alpha_composite(ref_l, (lx, ly + phone_l.height - int(6 * SCALE)))
    canvas.alpha_composite(ref_r, (rx, ry + phone_r.height - int(6 * SCALE)))
    canvas.alpha_composite(ref_c, (cc_x, cc_y + phone_c.height - int(6 * SCALE)))
    
    # 5. Composite Phones
    # Left and Right phones behind Center phone
    canvas.alpha_composite(phone_l, (lx, ly))
    canvas.alpha_composite(phone_r, (rx, ry))
    # Center phone in front
    canvas.alpha_composite(phone_c, (cc_x, cc_y))
    
    # 6. Downscale to final 1600x1000
    print("Downscaling to final 1600x1000 with Lanczos...")
    out = canvas.resize((FINAL_W, FINAL_H), Image.Resampling.LANCZOS)
    
    output_webp = "public/projects/jejakpaket-cover.webp"
    output_png = "public/projects/jejakpaket-cover.png"
    
    out.save(output_webp, "WEBP", quality=95, method=6)
    out.save(output_png, "PNG", optimize=True)
    
    print(f"Masterpiece cover successfully generated:")
    print(f"- {output_webp} ({os.path.getsize(output_webp)} bytes)")
    print(f"- {output_png} ({os.path.getsize(output_png)} bytes)")

if __name__ == "__main__":
    generate_masterpiece()
