import os
import math
from PIL import Image, ImageDraw, ImageFilter

def create_grid_background(width, height, scale=2):
    center_color = (252, 249, 245)
    edge_color = (239, 227, 212)
    
    gw, gh = 400, 250
    grad_small = Image.new("RGBA", (gw, gh))
    gcx, gcy = gw / 2.0, gh / 2.0
    g_max_dist = math.sqrt(gcx**2 + gcy**2)
    
    for y in range(gh):
        for x in range(gw):
            dist = math.sqrt((x - gcx)**2 + (y - gcy)**2)
            t = min(1.0, dist / (g_max_dist * 0.95))
            t = t * t * (3 - 2 * t)
            r = int(center_color[0] + (edge_color[0] - center_color[0]) * t)
            g = int(center_color[1] + (edge_color[1] - center_color[1]) * t)
            b = int(center_color[2] + (edge_color[2] - center_color[2]) * t)
            grad_small.putpixel((x, y), (r, g, b, 255))
            
    bg = grad_small.resize((width, height), Image.Resampling.BICUBIC)
    
    grid_draw = ImageDraw.Draw(bg)
    grid_step = int(40 * scale)
    grid_line_color = (212, 194, 175, 120)
    
    line_w = max(1, int(1 * scale))
    for x in range(0, width, grid_step):
        grid_draw.line([(x, 0), (x, height)], fill=grid_line_color, width=line_w)
    for y in range(0, height, grid_step):
        grid_draw.line([(0, y), (width, y)], fill=grid_line_color, width=line_w)
        
    return bg

def draw_rounded_window(canvas, screenshot_path, x, y, w, h, scale=2, crop_left_ratio=0.0):
    radius = int(15 * scale)
    title_h = int(38 * scale)
    
    # 1. Multi-layer Shadows
    # Layer 1: Ambient deep
    shadow_canvas = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    s1_draw = ImageDraw.Draw(shadow_canvas)
    s1_blur = int(36 * scale)
    s1_offset_y = int(24 * scale)
    s1_box = [x, y + s1_offset_y, x + w, y + h + s1_offset_y]
    s1_draw.rounded_rectangle(s1_box, radius=radius, fill=(15, 10, 5, int(255 * 0.17)))
    shadow_canvas = shadow_canvas.filter(ImageFilter.GaussianBlur(s1_blur))
    canvas.alpha_composite(shadow_canvas)
    
    # Layer 2: Mid-range
    shadow_canvas2 = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    s2_draw = ImageDraw.Draw(shadow_canvas2)
    s2_blur = int(14 * scale)
    s2_offset_y = int(9 * scale)
    s2_box = [x, y + s2_offset_y, x + w, y + h + s2_offset_y]
    s2_draw.rounded_rectangle(s2_box, radius=radius, fill=(15, 10, 5, int(255 * 0.11)))
    shadow_canvas2 = shadow_canvas2.filter(ImageFilter.GaussianBlur(s2_blur))
    canvas.alpha_composite(shadow_canvas2)
    
    # Layer 3: Contact
    shadow_canvas3 = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    s3_draw = ImageDraw.Draw(shadow_canvas3)
    s3_blur = int(4 * scale)
    s3_offset_y = int(2 * scale)
    s3_box = [x, y + s3_offset_y, x + w, y + h + s3_offset_y]
    s3_draw.rounded_rectangle(s3_box, radius=radius, fill=(15, 10, 5, int(255 * 0.06)))
    shadow_canvas3 = shadow_canvas3.filter(ImageFilter.GaussianBlur(s3_blur))
    canvas.alpha_composite(shadow_canvas3)

    # 2. Window Surface
    window_img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    win_draw = ImageDraw.Draw(window_img)
    win_draw.rounded_rectangle([0, 0, w, h], radius=radius, fill=(255, 255, 255, 255))
    
    # 3. Title bar
    header_color = (255, 255, 255, 255)
    win_draw.rounded_rectangle([0, 0, w, title_h + radius], radius=radius, fill=header_color)
    win_draw.rectangle([0, title_h, w, title_h + radius], fill=(255, 255, 255, 255))
    
    # Traffic light dots
    dot_diameter = int(11 * scale)
    dot_radius = dot_diameter / 2.0
    dot_y = title_h / 2.0
    start_x = int(18 * scale)
    gap = int(8 * scale)
    
    dots_colors = [
        (255, 95, 86, 255),    # Red
        (255, 189, 46, 255),   # Yellow
        (39, 201, 63, 255)     # Green
    ]
    
    for i, col in enumerate(dots_colors):
        dx = start_x + i * (dot_diameter + gap)
        win_draw.ellipse(
            [dx, dot_y - dot_radius, dx + dot_diameter, dot_y + dot_radius],
            fill=col
        )
        
    # Address bar pill
    pill_w = int(w * 0.44)
    pill_h = int(22 * scale)
    pill_x = int((w - pill_w) / 2.0)
    pill_y = int((title_h - pill_h) / 2.0)
    pill_r = int(pill_h / 2.0)
    
    win_draw.rounded_rectangle(
        [pill_x, pill_y, pill_x + pill_w, pill_y + pill_h],
        radius=pill_r,
        fill=(241, 243, 245, 255)
    )
    
    # Title bar divider
    line_w = max(1, int(1 * scale))
    win_draw.line(
        [(0, title_h), (w, title_h)],
        fill=(235, 238, 242, 255),
        width=line_w
    )
    
    # 4. Screenshot
    content_h = h - title_h
    raw_shot = Image.open(screenshot_path).convert("RGBA")
    
    if crop_left_ratio > 0:
        # Crop left portion (e.g. sidebar)
        crop_x = int(raw_shot.width * crop_left_ratio)
        raw_shot = raw_shot.crop((crop_x, 0, raw_shot.width, raw_shot.height))
        
    target_w = w
    scaled_h = int(raw_shot.height * (target_w / float(raw_shot.width)))
    
    if scaled_h < content_h:
        target_h = content_h
        target_w = int(raw_shot.width * (target_h / float(raw_shot.height)))
        scaled_shot = raw_shot.resize((target_w, target_h), Image.Resampling.LANCZOS)
    else:
        scaled_shot = raw_shot.resize((target_w, scaled_h), Image.Resampling.LANCZOS)
        
    crop_box = (0, 0, w, content_h)
    cropped_shot = scaled_shot.crop(crop_box)
    window_img.paste(cropped_shot, (0, title_h))
    
    # 5. Mask
    mask = Image.new("L", (w, h), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, w, h], radius=radius, fill=255)
    
    masked_window = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    masked_window.paste(window_img, (0, 0), mask=mask)
    
    # 6. Border
    border_draw = ImageDraw.Draw(masked_window)
    border_draw.rounded_rectangle(
        [0, 0, w - 1, h - 1],
        radius=radius,
        outline=(0, 0, 0, 24),
        width=line_w
    )
    
    canvas.paste(masked_window, (x, y), mask=mask)

def generate_option_a():
    """Option A (Dwijaya Style): Dashboard back-left, Orders bottom-right, Integration bottom-left"""
    SCALE = 2
    FINAL_W = 1600
    FINAL_H = 1000
    canvas = create_grid_background(FINAL_W * SCALE, FINAL_H * SCALE, scale=SCALE)
    
    # Window 1: Dashboard (Back, Left)
    w1_x = int(75 * SCALE)
    w1_y = int(80 * SCALE)
    w1_w = int(1000 * SCALE)
    w1_h = int(620 * SCALE)
    draw_rounded_window(canvas, "public/projects/raw/dashboard.png", w1_x, w1_y, w1_w, w1_h, scale=SCALE)
    
    # Window 2: Orders & Batches (Bottom Right)
    w2_x = int(760 * SCALE)
    w2_y = int(390 * SCALE)
    w2_w = int(765 * SCALE)
    w2_h = int(525 * SCALE)
    draw_rounded_window(canvas, "public/projects/raw/orders.png", w2_x, w2_y, w2_w, w2_h, scale=SCALE)
    
    # Window 3: Integration Setup (Bottom Left Floating)
    w3_x = int(130 * SCALE)
    w3_y = int(550 * SCALE)
    w3_w = int(600 * SCALE)
    w3_h = int(365 * SCALE)
    draw_rounded_window(canvas, "public/projects/raw/integration.png", w3_x, w3_y, w3_w, w3_h, scale=SCALE)
    
    out = canvas.resize((FINAL_W, FINAL_H), Image.Resampling.LANCZOS)
    out.save("scratch/cover_option_a.webp", "WEBP", quality=95)
    print("Generated scratch/cover_option_a.webp")

def generate_option_b():
    """Option B (Madura Mart Style): Dashboard tall left, Orders top-right, Integration bottom-right"""
    SCALE = 2
    FINAL_W = 1600
    FINAL_H = 1000
    canvas = create_grid_background(FINAL_W * SCALE, FINAL_H * SCALE, scale=SCALE)
    
    # Window 1: Dashboard (Left, taller)
    w1_x = int(75 * SCALE)
    w1_y = int(80 * SCALE)
    w1_w = int(920 * SCALE)
    w1_h = int(830 * SCALE)
    draw_rounded_window(canvas, "public/projects/raw/dashboard.png", w1_x, w1_y, w1_w, w1_h, scale=SCALE)
    
    # Window 2: Orders & Batches (Top Right)
    w2_x = int(770 * SCALE)
    w2_y = int(110 * SCALE)
    w2_w = int(755 * SCALE)
    w2_h = int(380 * SCALE)
    draw_rounded_window(canvas, "public/projects/raw/orders.png", w2_x, w2_y, w2_w, w2_h, scale=SCALE)
    
    # Window 3: Integration Setup (Bottom Right)
    w3_x = int(770 * SCALE)
    w3_y = int(530 * SCALE)
    w3_w = int(755 * SCALE)
    w3_h = int(380 * SCALE)
    draw_rounded_window(canvas, "public/projects/raw/integration.png", w3_x, w3_y, w3_w, w3_h, scale=SCALE)
    
    out = canvas.resize((FINAL_W, FINAL_H), Image.Resampling.LANCZOS)
    out.save("scratch/cover_option_b.webp", "WEBP", quality=95)
    print("Generated scratch/cover_option_b.webp")

if __name__ == "__main__":
    generate_option_a()
    generate_option_b()
