import os
import shutil
import subprocess

def process_stickers(input_jpg, output_dir):
    temp_png = f"temp_{os.path.basename(input_jpg)}.png"
    print(f"[{input_jpg}] AI 배경 제거 중 (rembg)...")
    # rembg로 배경 완벽 제거
    subprocess.run(["rembg", "i", input_jpg, temp_png], check=True)
    
    # slice_stickers.py의 핵심 로직을 바로 적용 (투명 배경 인식)
    import cv2
    os.makedirs(output_dir, exist_ok=True)
    img = cv2.imread(temp_png, cv2.IMREAD_UNCHANGED)
    alpha_channel = img[:, :, 3]
    _, thresh = cv2.threshold(alpha_channel, 10, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    count = 0
    padding = 10
    min_size = 50
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        if w < min_size or h < min_size: continue
        x1 = max(0, x - padding)
        y1 = max(0, y - padding)
        x2 = min(img.shape[1], x + w + padding)
        y2 = min(img.shape[0], y + h + padding)
        sticker = img[y1:y2, x1:x2]
        count += 1
        cv2.imwrite(os.path.join(output_dir, f"sticker_{count:03d}.png"), sticker)
    
    os.remove(temp_png)
    print(f"-> {count}개의 스티커 완벽 분할 완료! ({output_dir})")

# 기존 폴더 삭제
for d in ['stickers_kmong', 'stickers_kakao']:
    if os.path.exists(d): shutil.rmtree(d)

process_stickers('ai_functional_stickers.jpg', 'stickers_kmong/functional')
process_stickers('ai_premium_stickers.jpg', 'stickers_kmong/premium')
process_stickers('ai_character_stickers.jpg', 'stickers_kmong/character')
process_stickers('ai_sticker_sheet.jpg', 'stickers_kmong/basic')
process_stickers('ai_bear_stickers.jpg', 'stickers_kakao/bear')
process_stickers('ai_cat_stickers.jpg', 'stickers_kakao/cat')
