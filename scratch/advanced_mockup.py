import os
import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont

def make_iphone_3d(screen_path, target_h=460, scale=2, yaw_direction=0):
    """
    Creates an iPhone 16 Pro mockup.
    yaw_direction:
      -1: turned to the right (left side closer)
       0: straight forward
      +1: turned to the left (right side closer)
    """
    screen = Image.open(screen_path).convert('RGBA')
    aspect = screen.width / screen.height
    screen_h = int(target_h * scale)
    screen_w = int(screen_h * aspect)
    screen_resized = screen.resize((screen_w, screen_h), Image.Resampling.LANCZOS)
    
    bezel = int(14 * scale)
    phone_w = screen_w + bezel * 2
    phone_h = screen_h + bezel * 2
    r_outer = int(48 * scale)
    r_inner = int(36 * scale)
    
    pad = int(30 * scale)
    phone = Image.new('RGBA', (phone_w + pad * 2, phone_h + pad * 2), (0, 0, 0, 0))
    pdraw = ImageDraw.Draw(phone)
    ox, oy = pad, pad
    
    # Outer dark titanium rim
    pdraw.rounded_rectangle(
        [ox, oy, ox + phone_w, oy + phone_h],
        radius=r_outer,
        fill=(20, 22, 24, 255),
        outline=(65, 70, 76, 255),
        width=int(2.5 * scale)
    )
    # Inner metallic edge
    pdraw.rounded_rectangle(
        [ox + int(2 * scale), oy + int(2 * scale), ox + phone_w - int(2 * scale), oy + phone_h - int(2 * scale)],
        radius=r_outer - int(2 * scale),
        outline=(40, 44, 48, 255),
        width=int(2 * scale)
    )
    
    # Screen Mask
    screen_mask = Image.new('L', (screen_w, screen_h), 0)
    smdraw = ImageDraw.Draw(screen_mask)
    smdraw.rounded_rectangle([0, 0, screen_w, screen_h], radius=r_inner, fill=255)
    phone.paste(screen_resized, (ox + bezel, oy + bezel), mask=screen_mask)
    
    # Screen inner subtle border
    pdraw.rounded_rectangle(
        [ox + bezel, oy + bezel, ox + bezel + screen_w - 1, oy + bezel + screen_h - 1],
        radius=r_inner,
        outline=(0, 0, 0, 120),
        width=max(1, int(1 * scale))
    )
    
    # Dynamic Island pill
    di_w, di_h = int(screen_w * 0.28), int(screen_h * 0.033)
    di_x = ox + bezel + (screen_w - di_w) // 2
    di_y = oy + bezel + int(screen_h * 0.012)
    pdraw.rounded_rectangle(
        [di_x, di_y, di_x + di_w, di_y + di_h],
        radius=di_h // 2,
        fill=(5, 5, 5, 255)
    )
    
    # Outer buttons
    btn_w = int(3.5 * scale)
    pwr_y = oy + int(phone_h * 0.25)
    pwr_h = int(phone_h * 0.12)
    pdraw.rounded_rectangle([ox + phone_w, pwr_y, ox + phone_w + btn_w, pwr_y + pwr_h], radius=int(2 * scale), fill=(60, 65, 70, 255))
    
    vol1_y = oy + int(phone_h * 0.22)
    vol_h = int(phone_h * 0.08)
    pdraw.rounded_rectangle([ox - btn_w, vol1_y, ox, vol1_y + vol_h], radius=int(2 * scale), fill=(60, 65, 70, 255))
    vol2_y = vol1_y + vol_h + int(12 * scale)
    pdraw.rounded_rectangle([ox - btn_w, vol2_y, ox, vol2_y + vol_h], radius=int(2 * scale), fill=(60, 65, 70, 255))
    
    # 3D Perspective QUAD transform
    pw, ph = phone.size
    if yaw_direction == -1:
        # Turned right (left edge closer)
        diff_y = int(ph * 0.035)
        diff_x = int(pw * 0.03)
        quad = [
            (0, 0),
            (0, ph),
            (pw - diff_x, ph - diff_y),
            (pw - diff_x, diff_y)
        ]
        phone_3d = phone.transform((pw, ph), Image.Transform.QUAD, [p for pt in quad for p in pt], resample=Image.Resampling.BICUBIC)
        # Add visible metallic left edge
        edge_layer = Image.new('RGBA', (pw, ph), (0, 0, 0, 0))
        edraw = ImageDraw.Draw(edge_layer)
        edraw.line([(pad, pad + 10), (pad, pad + phone_h - 10)], fill=(90, 95, 105, 180), width=int(2.5 * scale))
        phone_3d.alpha_composite(edge_layer)
        return phone_3d
    elif yaw_direction == 1:
        # Turned left (right edge closer)
        diff_y = int(ph * 0.035)
        diff_x = int(pw * 0.03)
        quad = [
            (diff_x, diff_y),
            (diff_x, ph - diff_y),
            (pw, ph),
            (pw, 0)
        ]
        phone_3d = phone.transform((pw, ph), Image.Transform.QUAD, [p for pt in quad for p in pt], resample=Image.Resampling.BICUBIC)
        # Add visible metallic right edge
        edge_layer = Image.new('RGBA', (pw, ph), (0, 0, 0, 0))
        edraw = ImageDraw.Draw(edge_layer)
        rx = pad + phone_w
        edraw.line([(rx, pad + 10), (rx, pad + phone_h - 10)], fill=(90, 95, 105, 180), width=int(2.5 * scale))
        phone_3d.alpha_composite(edge_layer)
        return phone_3d
    else:
        return phone

def make_floor_reflection(phone_img, height_ratio=0.22, max_alpha=0.35):
    flipped = phone_img.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    h = int(flipped.height * height_ratio)
    ref = flipped.crop((0, 0, flipped.width, h))
    
    ref_alpha = ref.split()[3]
    final_alpha = Image.new('L', (ref.width, h), 0)
    for y in range(h):
        t = y / float(h)
        alpha = int(255 * max_alpha * (1.0 - t)**1.6)
        for x in range(ref.width):
            orig_a = ref_alpha.getpixel((x, y))
            final_alpha.putpixel((x, y), (orig_a * alpha) // 255)
            
    ref.putalpha(final_alpha)
    return ref.filter(ImageFilter.GaussianBlur(3))

def make_pdf_document(target_h=620, scale=2):
    """Creates a realistic, crisp white paper document of the PDF proof."""
    doc = Image.open("public/projects/raw/doc_pdf.webp").convert("RGBA")
    dh = int(target_h * scale)
    dw = int(dh * (doc.width / float(doc.height)))
    doc_resized = doc.resize((dw, dh), Image.Resampling.LANCZOS)
    
    radius = int(10 * scale)
    mask = Image.new("L", (dw, dh), 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.rounded_rectangle([0, 0, dw, dh], radius=radius, fill=255)
    
    doc_card = Image.new("RGBA", (dw, dh), (0, 0, 0, 0))
    doc_card.paste(doc_resized, (0, 0), mask=mask)
    
    # Paper border
    cdraw = ImageDraw.Draw(doc_card)
    cdraw.rounded_rectangle([0, 0, dw - 1, dh - 1], radius=radius, outline=(220, 224, 230, 255), width=max(1, int(1.5 * scale)))
    
    # Shadow
    pad = int(45 * scale)
    shadow_sheet = Image.new("RGBA", (dw + pad * 2, dh + pad * 2), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow_sheet)
    sdraw.rounded_rectangle([pad, pad + int(14 * scale), pad + dw, pad + dh + int(14 * scale)], radius=radius, fill=(0, 0, 0, 130))
    shadow_sheet = shadow_sheet.filter(ImageFilter.GaussianBlur(int(22 * scale)))
    shadow_sheet.alpha_composite(doc_card, (pad, pad))
    
    return shadow_sheet, pad, dw, dh

print("Advanced 3D phone and document helpers loaded!")
