from PIL import Image
import random

width, height = 800, 1130
img = Image.new('RGB', (width, height), color='#1c1c1e')
pixels = img.load()

for i in range(width):
    for j in range(height):
        noise = random.randint(-6, 6)
        r = max(0, min(255, 0x1c + noise))
        g = max(0, min(255, 0x1c + noise))
        b = max(0, min(255, 0x1e + noise))
        pixels[i, j] = (r, g, b)

img.save('assets/dark_paper_texture.jpg', quality=95)
print("✅ Dark paper texture created!")
