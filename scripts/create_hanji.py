from PIL import Image, ImageDraw, ImageFilter
import random
import math

width, height = 768, 1024
# Base dark charcoal color
img = Image.new('RGBA', (width, height), color='#222222')
draw = ImageDraw.Draw(img)

print("Generating Hanji base noise...")
pixels = img.load()
for i in range(width):
    for j in range(height):
        if random.random() < 0.4:
            noise = random.randint(-3, 3)
            r = max(0, min(255, 0x22 + noise))
            pixels[i, j] = (r, r, r, 255)

print("Generating subtle Hanji fibers...")
# Draw much fewer, thicker, heavily transparent fibers
for _ in range(3000):
    x1 = random.randint(-20, width+20)
    y1 = random.randint(-20, height+20)
    length = random.randint(20, 80)
    angle = random.uniform(0, 3.1415 * 2)
    
    x2 = x1 + int(math.cos(angle) * length)
    y2 = y1 + int(math.sin(angle) * length)
    
    # Fibers are extremely subtle, almost melting into background
    is_dark = random.choice([True, False])
    base_val = 28 if is_dark else 40
    opacity = random.randint(8, 15)
    color = (base_val, base_val, base_val, opacity)
    
    draw.line([(x1, y1), (x2, y2)], fill=color, width=random.choice([1, 2, 3]))

# Add very soft fiber clumps
for _ in range(400):
    x = random.randint(0, width)
    y = random.randint(0, height)
    r = random.randint(2, 6)
    draw.ellipse([x-r, y-r, x+r, y+r], fill=(36, 36, 36, 8))

print("Applying organic heavy blur...")
# Blur heavily so they look like embedded paper fibers, not scratches
img = img.filter(ImageFilter.GaussianBlur(radius=1.5))

# Save the image
img.convert('RGB').save('assets/dark_hanji_texture.jpg', quality=95)
print("✅ Subtle Dark Hanji texture created successfully!")
