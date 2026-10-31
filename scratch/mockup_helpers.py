import os
import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont

def make_iphone(screen_path, target_h=1000, scale=2):
    """Creates a high-resolution iPhone 16 Pro mockup with metallic titanium edge and Dynamic Island."""
    screen = Image.open(screen_path).convert('RGBA')
    aspect = screen.width / screen.height
    screen_h = int(target_h * scale)
    screen_w = int(screen_h * aspect)
    screen_resized = screen.resize((screen_w, screen_h), Image.Resampling.LANCZOS)
    
    bezel = int(16 * scale)
    phone_w = screen_w + bezel * 2
    phone_h = screen_h + bezel * 2
    r_outer = int(52 * scale)
    r_inner = int(40 * scale)
    
    pad = int(40 * scale)
    phone = Image.new('RGBA', (phone_w + pad * 2, phone_h + pad * 2), (0, 0, 0, 0))
    pdraw = ImageDraw.Draw(phone)
    
    ox, oy = pad, pad
    
    # Outer dark titanium rim
    pdraw.rounded_rectangle(
        [ox, oy, ox + phone_w, oy + phone_h],
        radius=r_outer,
        fill=(22, 24, 26, 255),
        outline=(55, 58, 62, 255),
        width=int(2.5 * scale)
    )
    
    # Inner metallic bezel edge
    pdraw.rounded_rectangle(
        [ox + int(2 * scale), oy + int(2 * scale), ox + phone_w - int(2 * scale), oy + phone_h - int(2 * scale)],
        radius=r_outer - int(2 * scale),
        outline=(38, 41, 45, 255),
        width=int(2 * scale)
    )
    
    # Screen Mask
    screen_mask = Image.new('L', (screen_w, screen_h), 0)
    smdraw = ImageDraw.Draw(screen_mask)
    smdraw.rounded_rectangle([0, 0, screen_w, screen_h], radius=r_inner, fill=255)
    
    phone.paste(screen_resized, (ox + bezel, oy + bezel), mask=screen_mask)
    
    # Screen glass inner stroke
    pdraw.rounded_rectangle(
        [ox + bezel, oy + bezel, ox + bezel + screen_w - 1, oy + bezel + screen_h - 1],
        radius=r_inner,
        outline=(0, 0, 0, 100),
        width=int(1.5 * scale)
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
    # Subtle camera lens reflection
    lens_r = int(di_h * 0.22)
    lens_x = di_x + di_w - int(di_h * 0.6)
    lens_y = di_y + di_h // 2
    pdraw.ellipse(
        [lens_x - lens_r, lens_y - lens_r, lens_x + lens_r, lens_y + lens_r],
        fill=(20, 30, 48, 255)
    )
    
    # Button notches on outer frame (Volume buttons left, Power button right)
    btn_w = int(3.5 * scale)
    # Power button (right)
    pwr_y = oy + int(phone_h * 0.25)
    pwr_h = int(phone_h * 0.12)
    pdraw.rounded_rectangle([ox + phone_w, pwr_y, ox + phone_w + btn_w, pwr_y + pwr_h], radius=int(2 * scale), fill=(55, 58, 62, 255))
    
    # Volume buttons (left)
    vol1_y = oy + int(phone_h * 0.22)
    vol_h = int(phone_h * 0.08)
    pdraw.rounded_rectangle([ox - btn_w, vol1_y, ox, vol1_y + vol_h], radius=int(2 * scale), fill=(55, 58, 62, 255))
    vol2_y = vol1_y + vol_h + int(12 * scale)
    pdraw.rounded_rectangle([ox - btn_w, vol2_y, ox, vol2_y + vol_h], radius=int(2 * scale), fill=(55, 58, 62, 255))
    
    return phone

def create_floor_reflection(phone, height_ratio=0.25, max_alpha=0.35):
    """Generates a soft fading vertical floor reflection of the phone."""
    # Flip vertically
    flipped = phone.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    h = int(flipped.height * height_ratio)
    # Take the top part of flipped (which is bottom of original)
    reflection = flipped.crop((0, 0, flipped.width, h))
    
    # Create vertical alpha gradient mask (fading to 0 at bottom)
    mask = Image.new('L', (reflection.width, h), 0)
    for y in range(h):
        # Quadratic fade
        alpha = int(255 * max_alpha * (1.0 - (y / float(h)))**1.8)
        for x in range(reflection.width):
            mask.putpixel((x, y), alpha)
            
    # Combine with original alpha
    ref_alpha = reflection.split()[3]
    # Multiply alphas
    final_alpha = Image.new('L', (reflection.width, h), 0)
    for y in range(h):
        for x in range(reflection.width):
            val = (ref_alpha.getpixel((x, y)) * mask.getpixel((x, y))) // 255
            final_alpha.putpixel((x, y), val)
            
    reflection.putalpha(final_alpha)
    # Soft blur
    reflection = reflection.filter(ImageFilter.GaussianBlur(3))
    return reflection

print("iPhone generator helper defined successfully!")
