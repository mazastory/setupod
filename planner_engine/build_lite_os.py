import os
import calendar
import datetime
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

def download_fonts():
    # 애플 시스템 폰트(BigCaslon)와 로컬 폰트(Nanum) 사용
    pdfmetrics.registerFont(TTFont('NotoSansKR', '/Users/m/Library/Fonts/NanumGothic.ttf'))
    pdfmetrics.registerFont(TTFont('NotoSansKR-Bold', '/Users/m/Library/Fonts/NanumGothicBold.ttf'))
    pdfmetrics.registerFont(TTFont('BigCaslon', '/System/Library/Fonts/Supplemental/BigCaslon.ttf'))

def create_planner():
    filename = "2027_SETUPOD_PLANNER_FINAL.pdf"
    
    HOLIDAYS_2027 = {
        (1, 1): "신정",
        (2, 5): "설날 연휴",
        (2, 6): "설날",
        (2, 7): "설날 연휴",
        (2, 8): "대체공휴일",
        (2, 9): "대체공휴일",
        (3, 1): "3·1절",
        (5, 5): "어린이날",
        (5, 13): "부처님오신날",
        (6, 6): "현충일",
        (8, 15): "광복절",
        (8, 16): "대체공휴일",
        (9, 14): "추석 연휴",
        (9, 15): "추석",
        (9, 16): "추석 연휴",
        (10, 3): "개천절",
        (10, 4): "대체공휴일",
        (10, 9): "한글날",
        (10, 11): "대체공휴일",
        (12, 25): "기독탄신일",
        (12, 27): "대체공휴일",
    }
    
    # 아이패드 비율 (3:4)
    width, height = 768, 1024
    c = canvas.Canvas(filename, pagesize=(width, height))
    
    # 원작 기반 미세 조정 팔레트
    TOP_BG = colors.HexColor("#1A1A1A")       # 짙은 회색
    BOTTOM_BG = colors.HexColor("#101010")    # 리얼 다크 블랙
    TEXT_MAIN = colors.white
    TEXT_SUB = colors.HexColor("#7A7A7A")
    BUTTON_BG = colors.HexColor("#2C2C2C")    # 오리지널과 동일한 채도의 버튼 배경
    
    # --- 1. COVER PAGE ---
    c.bookmarkPage("Home")
    c.setFillColor(TOP_BG)
    c.rect(0, height/2, width, height/2, fill=1, stroke=0)
    
    c.setFillColor(BOTTOM_BG)
    c.rect(0, 0, width, height/2, fill=1, stroke=0)
    
    # 메인 타이틀
    c.setFillColor(TEXT_MAIN)
    c.setFont("BigCaslon", 180)
    c.drawCentredString(width/2, height * 0.68, "2027")
    
    # 짧은 구분선 (원작 디테일)
    c.setStrokeColor(colors.HexColor("#555555"))
    c.setLineWidth(0.5)
    c.line(width/2 - 40, height * 0.60, width/2 + 40, height * 0.60)
    
    # 서브 타이틀
    c.setFont("NotoSansKR", 14)
    c.setFillColor(TEXT_SUB)
    c.drawCentredString(width/2, height * 0.56, "C A L E N D A R   ·   P R O J E C T   ·   N O T E S")
    
    # 중앙 한글 타이틀
    c.setFont("NotoSansKR", 16)
    c.setFillColor(colors.HexColor("#AAAAAA"))
    c.drawCentredString(width/2, height * 0.42, "한 해의 리듬을 설계하는 노트")
    
    c.setFont("NotoSansKR", 10)
    c.setFillColor(colors.HexColor("#666666"))
    c.drawCentredString(width/2, height * 0.38, "목표 시스템 + 프로젝트 관리 + 달력 + 데일리 노트")
    
    # 버튼 그리드 (전체 박스 스케일 업)
    btn_w = 80
    btn_h = 30
    gap_x = 16
    gap_y = 16
    
    # 6개씩 2줄 -> 총 가로 폭: 6 * 80 + 5 * 16 = 480 + 80 = 560
    start_x = width/2 - (560 / 2)
    start_y = height * 0.28
    
    month_destinations = [f"Month_{m}" for m in range(1, 13)]
    
    c.setFont("NotoSansKR-Bold", 11)
    for i in range(12):
        row = i // 6
        col = i % 6
        x = start_x + col * (btn_w + gap_x)
        y = start_y - row * (btn_h + gap_y)
        
        c.setFillColor(BUTTON_BG)
        c.roundRect(x, y, btn_w, btn_h, 3, fill=1, stroke=0)
        
        c.setFillColor(TEXT_MAIN)
        c.drawCentredString(x + btn_w/2, y + 10, f"{i+1:02d}")
        c.linkAbsolute("", month_destinations[i], (x, y, x + btn_w, y + btn_h))
        
    # 하단 3개 버튼 (상단 6개 버튼 폭과 완벽하게 정렬)
    # 총 폭 560. 3개 버튼 + 2개 간격(16) = 3*b_btn_w + 32 = 560 -> b_btn_w = 176
    b_btn_w = 176
    b_start_x = start_x
    b_y = start_y - 2 * (btn_h + gap_y)
    
    labels = ["LIFE COMPASS", "PROJECTS", "연간 달력"]
    special_destinations = ["Life_Compass", "Projects", "Yearly_Calendar"]
    for i, label in enumerate(labels):
        x = b_start_x + i * (b_btn_w + gap_x)
        c.setFillColor(BUTTON_BG)
        c.roundRect(x, b_y, b_btn_w, btn_h, 3, fill=1, stroke=0)
        c.setFillColor(TEXT_MAIN)
        c.drawCentredString(x + b_btn_w/2, b_y + 10, label)
        c.linkAbsolute("", special_destinations[i], (x, b_y, x + b_btn_w, b_y + btn_h))
        
    # 네임 라인 (더 얇고 미니멀하게)
    c.setFillColor(colors.HexColor("#555555"))
    c.setFont("NotoSansKR", 8)
    c.drawCentredString(width/2, 65, "N A M E")
    c.setLineWidth(0.3)
    c.line(width/2 - 45, 52, width/2 + 45, 52)
    
    c.showPage()
    
    # --- 2. INNER PAGES (월간 달력) ---
    for m in range(1, 13):
        # 내지는 올블랙(하단 톤) 배경 사용
        c.setFillColor(BOTTOM_BG)
        c.rect(0, 0, width, height, fill=1, stroke=0)
        c.bookmarkPage(month_destinations[m-1])
        
        # 상단 네비게이션 탭 (원작 스타일 미니멀 탭)
        c.setFont("NotoSansKR-Bold", 9)
        tab_start_y = height - 40
        for i in range(12):
            tab_x = 40 + i * 40
            if i + 1 == m:
                c.setFillColor(TEXT_MAIN)
            else:
                c.setFillColor(TEXT_SUB)
            c.drawCentredString(tab_x, tab_start_y, f"{i+1:02d}")
            c.linkAbsolute("", month_destinations[i], (tab_x - 15, tab_start_y - 5, tab_x + 15, tab_start_y + 15))
            
        # 홈 버튼 추가
        c.setFont("NotoSansKR", 9)
        c.setFillColor(TEXT_SUB)
        c.drawString(width - 80, height - 40, "H O M E")
        c.linkAbsolute("", "Home", (width - 85, height - 45, width - 30, height - 25))
        
        # 달력 타이틀
        c.setFillColor(TEXT_MAIN)
        c.setFont("BigCaslon", 60)
        c.drawString(40, height - 120, f"{m:02d}")
        
        # 그리드 선 세팅
        c.setStrokeColor(colors.HexColor("#2A2A2A"))
        c.setLineWidth(0.5)
        
        # 간단한 달력 렌더링
        margin_x = 40
        grid_width = width - margin_x * 2
        col_w = grid_width / 7
        row_h = 110
        grid_y = height - 160
        
        # 요일 헤더
        days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
        c.setFont("NotoSansKR-Bold", 8)
        for i, d in enumerate(days):
            x = margin_x + i * col_w
            if i == 5:
                c.setFillColor(colors.HexColor("#4A90E2")) # 토요일 파란색
            elif i == 6:
                c.setFillColor(colors.HexColor("#E24A4A")) # 일요일 빨간색
            else:
                c.setFillColor(TEXT_SUB)
            c.drawCentredString(x + col_w/2, grid_y + 15, d)
        
        cal = calendar.monthcalendar(2027, m)
        for row_idx, week in enumerate(cal):
            y = grid_y - row_idx * row_h
            
            # 주간 이동 버튼 (좌측 여백)
            try:
                first_day = next(d for d in week if d != 0)
                week_num = datetime.date(2027, m, first_day).isocalendar()[1]
                c.setFillColor(BUTTON_BG)
                c.roundRect(10, y - row_h + 40, 20, 30, 2, fill=1, stroke=0)
                c.setFillColor(TEXT_SUB)
                c.setFont("NotoSansKR", 8)
                c.drawCentredString(20, y - row_h + 52, "W")
                c.linkAbsolute("", f"Weekly_{week_num:02d}", (10, y - row_h + 40, 30, y - row_h + 70))
            except StopIteration:
                pass
            
            for col_idx, day in enumerate(week):
                x = margin_x + col_idx * col_w
                c.rect(x, y - row_h, col_w, row_h, fill=0, stroke=1)
                
                if day != 0:
                    # 날짜 박스 전체를 Daily 페이지로 링크
                    c.linkAbsolute("", f"Daily_{m:02d}{day:02d}", (x, y - row_h, x + col_w, y))
                    
                    is_holiday = (m, day) in HOLIDAYS_2027
                    if col_idx == 6 or is_holiday:
                        c.setFillColor(colors.HexColor("#E24A4A")) # 일요일 또는 공휴일
                    elif col_idx == 5:
                        c.setFillColor(colors.HexColor("#4A90E2")) # 토요일
                    else:
                        c.setFillColor(TEXT_SUB)
                        
                    c.setFont("NotoSansKR", 12)
                    c.drawString(x + 10, y - 20, str(day))
                    
                    if is_holiday:
                        c.setFont("NotoSansKR", 7)
                        c.drawString(x + 10, y - 32, HOLIDAYS_2027[(m, day)])
        c.showPage()
    
    # --- 3. WEEKLY PAGES ---
    start_date = datetime.date(2027, 1, 1)
    end_date = datetime.date(2027, 12, 31)
    curr = start_date
    weeks_done = set()
    while curr <= end_date:
        w = curr.isocalendar()[1]
        if w not in weeks_done:
            weeks_done.add(w)
            c.setFillColor(BOTTOM_BG)
            c.rect(0, 0, width, height, fill=1, stroke=0)
            c.bookmarkPage(f"Weekly_{w:02d}")
            
            c.setFont("NotoSansKR", 9)
            c.setFillColor(TEXT_SUB)
            c.drawString(width - 80, height - 40, "H O M E")
            c.linkAbsolute("", "Home", (width - 85, height - 45, width - 30, height - 25))
            
            c.setFillColor(TEXT_MAIN)
            c.setFont("BigCaslon", 40)
            c.drawString(40, height - 100, f"Week {w:02d}")
            
            c.setStrokeColor(colors.HexColor("#2A2A2A"))
            c.setLineWidth(0.5)
            for line_y in range(int(height - 150), 100, -100):
                c.line(40, line_y, width - 40, line_y)
            c.showPage()
        curr += datetime.timedelta(days=1)
        
    # --- 4. DAILY PAGES ---
    curr = start_date
    while curr <= end_date:
        c.setFillColor(BOTTOM_BG)
        c.rect(0, 0, width, height, fill=1, stroke=0)
        c.bookmarkPage(f"Daily_{curr.strftime('%m%d')}")
        
        c.setFont("NotoSansKR", 9)
        c.setFillColor(TEXT_SUB)
        c.drawString(width - 80, height - 40, "H O M E")
        c.linkAbsolute("", "Home", (width - 85, height - 45, width - 30, height - 25))
        
        c.drawString(width - 160, height - 40, "M O N T H")
        c.linkAbsolute("", f"Month_{curr.month}", (width - 170, height - 45, width - 100, height - 25))
        
        c.setFillColor(TEXT_MAIN)
        c.setFont("BigCaslon", 40)
        c.drawString(40, height - 100, curr.strftime('%B %d, %Y'))
        
        c.setFont("NotoSansKR-Bold", 12)
        c.setFillColor(TEXT_SUB)
        day_str = curr.strftime('%A').upper()
        if (curr.month, curr.day) in HOLIDAYS_2027:
            day_str += f" · {HOLIDAYS_2027[(curr.month, curr.day)]}"
            c.setFillColor(colors.HexColor("#E24A4A"))
        c.drawString(40, height - 120, day_str)
        
        c.setStrokeColor(colors.HexColor("#2A2A2A"))
        c.setLineWidth(0.5)
        for line_y in range(int(height - 180), 100, -30):
            c.line(40, line_y, width - 40, line_y)
        c.showPage()
        curr += datetime.timedelta(days=1)
        
    # --- 5. SPECIAL PAGES ---
    for i, dest in enumerate(special_destinations):
        c.setFillColor(BOTTOM_BG)
        c.rect(0, 0, width, height, fill=1, stroke=0)
        c.bookmarkPage(dest)
        
        # 홈 버튼 추가
        c.setFont("NotoSansKR", 9)
        c.setFillColor(TEXT_SUB)
        c.drawString(width - 80, height - 40, "H O M E")
        c.linkAbsolute("", "Home", (width - 85, height - 45, width - 30, height - 25))
        
        c.setFillColor(TEXT_MAIN)
        c.setFont("NotoSansKR-Bold", 20)
        c.drawString(40, height - 100, labels[i])
        
        # 간단한 노트 라인 추가
        c.setStrokeColor(colors.HexColor("#2A2A2A"))
        c.setLineWidth(0.5)
        for line_y in range(int(height - 180), 100, -40):
            c.line(40, line_y, width - 40, line_y)
            
        c.showPage()
    
    c.save()
    print(f"✅ Replica Planner PDF generated successfully: {filename}")

if __name__ == '__main__':
    download_fonts()
    create_planner()
