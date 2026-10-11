import os
from PIL import Image, ImageDraw, ImageFont

def make_insta_slide(img1_path, img2_path, output_path):
    # 1. 캔버스 생성 (인스타 릴스/스토리 사이즈: 1080 x 1920), 배경색: 따뜻한 베이지
    width, height = 1080, 1920
    canvas = Image.new('RGB', (width, height), '#FFFDF8')
    draw = ImageDraw.Draw(canvas)
    
    try:
        # 2. 이미지 불러오기
        img1 = Image.open(img1_path)
        img2 = Image.open(img2_path)
        
        # 3. 이미지 리사이징 (각 절반 영역에 들어가도록, 약간의 여백 포함)
        target_size = 500
        img1 = img1.resize((target_size, target_size), Image.Resampling.LANCZOS)
        img2 = img2.resize((target_size, target_size), Image.Resampling.LANCZOS)
        
        # 4. 이미지 배치 (세로 분할 방식 대신, 요즘 트렌드인 상/하 또는 좌/우 중 좌/우로 배치)
        # 왼쪽 (목표)
        x1 = 20
        y_img = height - target_size - 100 # 하단 정렬
        canvas.paste(img1, (x1, y_img))
        
        # 오른쪽 (시스템)
        x2 = width // 2 + 20
        canvas.paste(img2, (x2, y_img))
        
        # 5. 중앙 분할선 그리기
        draw.line([(width//2, 100), (width//2, height-100)], fill='#222', width=4)
        
        # 6. 텍스트 작성 (시스템 기본 폰트 사용 - 맥 기준)
        try:
            font_title = ImageFont.truetype("/System/Library/Fonts/AppleSDGothicNeo.ttc", 70)
            font_subtitle = ImageFont.truetype("/System/Library/Fonts/AppleSDGothicNeo.ttc", 45)
            font_bold = ImageFont.truetype("/System/Library/Fonts/AppleSDGothicNeo.ttc", 60)
        except:
            font_title = ImageFont.load_default()
            font_subtitle = ImageFont.load_default()
            font_bold = ImageFont.load_default()

        # 왼쪽 상단 텍스트 (목표)
        draw.text((x1 + 160, 200), "🎯", fill="black", font=font_title)
        draw.text((x1 + 150, 300), "목표", fill="#FF3B30", font=font_title)
        draw.text((x1 + 10, 450), '"\n올해는 무조건\n완벽하게\n다이어리 쓴다!\n"', fill="#333", font=font_subtitle, align="center")

        # 오른쪽 상단 텍스트 (시스템)
        draw.text((x2 + 160, 200), "⚙️", fill="black", font=font_title)
        draw.text((x2 + 120, 300), "시스템", fill="#FF3B30", font=font_title)
        
        # 검은색 배경에 흰 글씨 강조 효과
        text_bg_y = 480
        draw.rectangle([x2+20, text_bg_y, x2+460, text_bg_y+80], fill="black")
        draw.text((x2 + 40, text_bg_y+10), "자기 전 5분,", fill="white", font=font_bold)
        
        draw.rectangle([x2+20, text_bg_y+100, x2+460, text_bg_y+180], fill="black")
        draw.text((x2 + 40, text_bg_y+110), "체크리스트만", fill="white", font=font_bold)
        
        draw.rectangle([x2+20, text_bg_y+200, x2+460, text_bg_y+280], fill="black")
        draw.text((x2 + 40, text_bg_y+210), "확인한다.", fill="white", font=font_bold)

        # 저장
        canvas.save(output_path)
        print(f"✅ 인스타 릴스 슬라이드 생성 완료: {output_path}")

    except Exception as e:
        print(f"❌ 에러 발생: {e}")

if __name__ == "__main__":
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # 뇌(Brain) 폴더 경로 - 현재 대화 ID에 맞춤
    brain_dir = "/Users/m/.gemini/antigravity-ide/brain/63d9bbaf-0b4b-479e-9361-feda1c1f0082"
    
    img1 = os.path.join(brain_dir, "bear_goal_stress_1791638577004.jpg")
    img2 = os.path.join(brain_dir, "bear_system_happy_1791638590044.jpg")
    output = os.path.join(BASE_DIR, "assets", "insta_slide_1.jpg")
    
    if os.path.exists(img1) and os.path.exists(img2):
        make_insta_slide(img1, img2, output)
    else:
        print("이미지 파일을 찾을 수 없습니다. 경로를 확인하세요.")
