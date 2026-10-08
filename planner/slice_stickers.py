import cv2
import numpy as np
import os
import sys

def slice_stickers(image_path, output_dir="stickers_output", padding=10, min_size=50):
    """
    한 장짜리 스티커 시트 이미지를 여러 개의 개별 PNG 파일로 자동 분할합니다.
    (배경이 흰색이거나 투명한 이미지 모두 지원)
    """
    if not os.path.exists(image_path):
        print(f"오류: {image_path} 파일을 찾을 수 없습니다.")
        return

    # 출력 폴더 생성
    os.makedirs(output_dir, exist_ok=True)
    print(f"[{image_path}] 이미지를 분석하여 스티커를 자동 분할합니다...")

    # 이미지 읽기 (알파 채널 포함)
    img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        print("이미지를 읽을 수 없습니다.")
        return

    # 알파(투명) 채널이 있는지 확인
    if img.shape[2] == 4:
        # 투명 배경인 경우: 알파 채널을 마스크로 사용
        alpha_channel = img[:, :, 3]
        _, thresh = cv2.threshold(alpha_channel, 10, 255, cv2.THRESH_BINARY)
    else:
        # 흰색 배경인 경우: 흰색이 아닌 부분을 스티커로 인식
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # 배경(흰색)을 검은색으로, 스티커를 흰색으로 반전
        _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
        
        # 이미지에 알파 채널 추가 (저장 시 투명 배경을 위해)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
        # 흰색 배경을 투명하게 처리 (240 이상 밝은 색상)
        mask = gray > 240
        img[mask, 3] = 0

    # 윤곽선(Contours) 찾기
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    count = 0
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        
        # 너무 작은 노이즈(먼지)는 무시
        if w < min_size or h < min_size:
            continue
            
        # 패딩(여백) 추가 및 이미지 경계선 넘지 않도록 처리
        x1 = max(0, x - padding)
        y1 = max(0, y - padding)
        x2 = min(img.shape[1], x + w + padding)
        y2 = min(img.shape[0], y + h + padding)
        
        # 스티커 잘라내기
        sticker = img[y1:y2, x1:x2]
        
        count += 1
        output_path = os.path.join(output_dir, f"sticker_{count:03d}.png")
        cv2.imwrite(output_path, sticker)
        
    print(f"🎉 성공! 총 {count}개의 스티커가 '{output_dir}' 폴더에 개별 PNG로 저장되었습니다.")

if __name__ == "__main__":
    print("=== SETUPOD 자동 스티커 커팅기 ===")
    if len(sys.argv) < 2:
        print("사용법: python3 slice_stickers.py [이미지파일명.png]")
        print("예시: python3 slice_stickers.py sticker_sheet.png")
    else:
        file_path = sys.argv[1]
        slice_stickers(file_path)
