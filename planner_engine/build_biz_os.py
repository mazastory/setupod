import os
import calendar
import datetime
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

def register_fonts():
    pdfmetrics.registerFont(TTFont('NotoSansKR', '/Users/m/Library/Fonts/NanumGothic.ttf'))
    pdfmetrics.registerFont(TTFont('NotoSansKR-Bold', '/Users/m/Library/Fonts/NanumGothicBold.ttf'))
    pdfmetrics.registerFont(TTFont('BigCaslon', '/System/Library/Fonts/Supplemental/BigCaslon.ttf'))

# ─── 색상 팔레트 ───
BG_DARK = colors.HexColor("#101010")
BG_CARD = colors.HexColor("#1A1A1A")
BG_BTN = colors.HexColor("#2C2C2C")
BG_FIELD = colors.HexColor("#222222")
TEXT_W = colors.white
TEXT_SUB = colors.HexColor("#7A7A7A")
TEXT_MUTED = colors.HexColor("#555555")
ACCENT_PURPLE = colors.HexColor("#A855F7")
ACCENT_BLUE = colors.HexColor("#38BDF8")
ACCENT_GREEN = colors.HexColor("#34D399")
ACCENT_GOLD = colors.HexColor("#FBBF24")
ACCENT_ROSE = colors.HexColor("#FB7185")
ACCENT_RED = colors.HexColor("#E24A4A")
LINE_COLOR = colors.HexColor("#2A2A2A")

HOLIDAYS_2027 = {
    (1, 1): "신정", (2, 5): "설날 연휴", (2, 6): "설날", (2, 7): "설날 연휴",
    (2, 8): "대체공휴일", (2, 9): "대체공휴일", (3, 1): "3·1절",
    (5, 5): "어린이날", (5, 13): "부처님오신날", (6, 6): "현충일",
    (8, 15): "광복절", (8, 16): "대체공휴일",
    (9, 14): "추석 연휴", (9, 15): "추석", (9, 16): "추석 연휴",
    (10, 3): "개천절", (10, 4): "대체공휴일", (10, 9): "한글날", (10, 11): "대체공휴일",
    (12, 25): "기독탄신일", (12, 27): "대체공휴일",
}

W, H = 768, 1024
MARGIN = 40

# ─── 유틸리티 ───
def dark_bg(c):
    c.setFillColor(BG_DARK)
    c.rect(0, 0, W, H, fill=1, stroke=0)

def home_btn(c):
    c.setFont("NotoSansKR", 9)
    c.setFillColor(TEXT_SUB)
    c.drawString(W - 80, H - 40, "H O M E")
    c.linkAbsolute("", "Home", (W - 85, H - 45, W - 30, H - 25))

def nav_tabs(c, current_month, month_dests):
    c.setFont("NotoSansKR-Bold", 9)
    for i in range(12):
        tab_x = 40 + i * 40
        c.setFillColor(TEXT_W if i + 1 == current_month else TEXT_SUB)
        c.drawCentredString(tab_x, H - 40, f"{i+1:02d}")
        c.linkAbsolute("", month_dests[i], (tab_x - 15, H - 45, tab_x + 15, H - 25))

def draw_lined_area(c, x, y, w, h, line_spacing=28):
    """빈 줄 노트 영역 그리기"""
    c.setStrokeColor(LINE_COLOR)
    c.setLineWidth(0.5)
    curr_y = y - line_spacing
    while curr_y > y - h:
        c.line(x, curr_y, x + w, curr_y)
        curr_y -= line_spacing

def draw_field_box(c, x, y, w, h, label="", placeholder=""):
    """입력 필드 박스 그리기 (굿노트에서 필기용)"""
    c.setFillColor(BG_FIELD)
    c.roundRect(x, y, w, h, 4, fill=1, stroke=0)
    if label:
        c.setFont("NotoSansKR-Bold", 8)
        c.setFillColor(TEXT_SUB)
        c.drawString(x + 10, y + h - 14, label)
    if placeholder:
        c.setFont("NotoSansKR", 8)
        c.setFillColor(TEXT_MUTED)
        c.drawString(x + 10, y + 8, placeholder)

def draw_checkbox_line(c, x, y, w, label=""):
    """체크박스 + 텍스트 라인"""
    c.setStrokeColor(TEXT_SUB)
    c.setLineWidth(0.5)
    c.rect(x, y, 12, 12, fill=0, stroke=1)
    c.setStrokeColor(LINE_COLOR)
    c.line(x + 20, y, x + w, y)
    if label:
        c.setFont("NotoSansKR", 9)
        c.setFillColor(TEXT_MUTED)
        c.drawString(x + 20, y + 2, label)

def draw_section_title(c, x, y, title, accent_color=ACCENT_PURPLE):
    """섹션 제목 (아이콘 대신 색 포인트 바)"""
    c.setFillColor(accent_color)
    c.roundRect(x, y, 3, 14, 1, fill=1, stroke=0)
    c.setFont("NotoSansKR-Bold", 10)
    c.setFillColor(TEXT_W)
    c.drawString(x + 10, y + 2, title)

# ══════════════════════════════════════════════
# 메인 생성 함수
# ══════════════════════════════════════════════
def create_pro_planner():
    filename = "2027_SETUPOD_PLANNER_PRO.pdf"
    c = canvas.Canvas(filename, pagesize=(W, H))
    
    month_dests = [f"Month_{m}" for m in range(1, 13)]
    quarter_dests = [f"Quarter_{q}" for q in range(1, 5)]
    
    # ══════════════════════════════════════
    # PAGE 1: COVER
    # ══════════════════════════════════════
    c.bookmarkPage("Home")
    c.setFillColor(BG_CARD)
    c.rect(0, H/2, W, H/2, fill=1, stroke=0)
    c.setFillColor(BG_DARK)
    c.rect(0, 0, W, H/2, fill=1, stroke=0)
    
    # PRO 배지
    c.setFillColor(ACCENT_GOLD)
    c.setFont("NotoSansKR-Bold", 9)
    c.drawCentredString(W/2, H * 0.82, "P R O   E D I T I O N")
    
    # 메인 타이틀
    c.setFillColor(TEXT_W)
    c.setFont("BigCaslon", 180)
    c.drawCentredString(W/2, H * 0.68, "2027")
    
    # 구분선
    c.setStrokeColor(TEXT_MUTED)
    c.setLineWidth(0.5)
    c.line(W/2 - 40, H * 0.60, W/2 + 40, H * 0.60)
    
    # 서브 타이틀
    c.setFont("NotoSansKR", 14)
    c.setFillColor(TEXT_SUB)
    c.drawCentredString(W/2, H * 0.56, "C A L E N D A R  ·  P R O J E C T  ·  N O T E S")
    
    c.setFont("NotoSansKR", 16)
    c.setFillColor(colors.HexColor("#AAAAAA"))
    c.drawCentredString(W/2, H * 0.42, "한 해의 리듬을 설계하는 비즈니스 OS")
    
    c.setFont("NotoSansKR", 10)
    c.setFillColor(colors.HexColor("#666666"))
    c.drawCentredString(W/2, H * 0.38, "Life Compass + 분기 Big Rocks + 프로젝트 트래커 + 365일 데일리")
    
    # ─── 커버 버튼 그리드 ───
    btn_w, btn_h, gap_x, gap_y = 80, 30, 16, 16
    total_w = 6 * btn_w + 5 * gap_x  # 560
    start_x = W/2 - total_w / 2
    start_y = H * 0.28
    
    c.setFont("NotoSansKR-Bold", 11)
    for i in range(12):
        row, col = i // 6, i % 6
        x = start_x + col * (btn_w + gap_x)
        y = start_y - row * (btn_h + gap_y)
        c.setFillColor(BG_BTN)
        c.roundRect(x, y, btn_w, btn_h, 3, fill=1, stroke=0)
        c.setFillColor(TEXT_W)
        c.drawCentredString(x + btn_w/2, y + 10, f"{i+1:02d}")
        c.linkAbsolute("", month_dests[i], (x, y, x + btn_w, y + btn_h))
    
    # 하단 특별 버튼들 (5개로 확장)
    b_labels = ["LIFE COMPASS", "Q1", "Q2", "Q3", "Q4"]
    b_dests = ["Life_Compass"] + quarter_dests
    b_btn_w = (total_w - 4 * gap_x) / 5  # 5개 버튼
    b_y = start_y - 2 * (btn_h + gap_y)
    
    for i, label in enumerate(b_labels):
        x = start_x + i * (b_btn_w + gap_x)
        c.setFillColor(BG_BTN)
        c.roundRect(x, b_y, b_btn_w, btn_h, 3, fill=1, stroke=0)
        c.setFillColor(ACCENT_GOLD if i == 0 else TEXT_W)
        c.setFont("NotoSansKR-Bold", 9)
        c.drawCentredString(x + b_btn_w/2, b_y + 10, label)
        c.linkAbsolute("", b_dests[i], (x, b_y, x + b_btn_w, b_y + btn_h))
    
    # 연간 달력 버튼
    yc_y = b_y - (btn_h + gap_y)
    c.setFillColor(BG_BTN)
    c.roundRect(start_x, yc_y, total_w, btn_h, 3, fill=1, stroke=0)
    c.setFillColor(TEXT_SUB)
    c.setFont("NotoSansKR-Bold", 10)
    c.drawCentredString(W/2, yc_y + 10, "2 0 2 7   Y E A R L Y   C A L E N D A R")
    c.linkAbsolute("", "Yearly_Calendar", (start_x, yc_y, start_x + total_w, yc_y + btn_h))
    
    # NAME 라인
    c.setFillColor(TEXT_MUTED)
    c.setFont("NotoSansKR", 8)
    c.drawCentredString(W/2, 65, "N A M E")
    c.setStrokeColor(TEXT_MUTED)
    c.setLineWidth(0.3)
    c.line(W/2 - 45, 52, W/2 + 45, 52)
    
    c.showPage()
    
    # ══════════════════════════════════════
    # PAGE 2-3: LIFE COMPASS (2페이지)
    # ══════════════════════════════════════
    c.bookmarkPage("Life_Compass")
    dark_bg(c)
    home_btn(c)
    
    # 헤더
    c.setFillColor(ACCENT_PURPLE)
    c.setFont("NotoSansKR-Bold", 9)
    c.drawString(MARGIN, H - 50, "LIFE COMPASS")
    
    c.setFillColor(TEXT_W)
    c.setFont("BigCaslon", 36)
    c.drawString(MARGIN, H - 100, "2027")
    c.setFont("NotoSansKR", 12)
    c.setFillColor(TEXT_SUB)
    c.drawString(MARGIN + 100, H - 95, "한 해의 방향과 리듬")
    
    c.setFont("NotoSansKR", 14)
    c.setFillColor(TEXT_W)
    c.drawString(MARGIN, H - 140, "올해가 끝났을 때 어떤 사람이 되어 있고 싶은가")
    
    c.setFont("NotoSansKR", 10)
    c.setFillColor(TEXT_SUB)
    c.drawString(MARGIN, H - 160, "방향이 흔들릴 때마다 돌아올 기준이 되는 북극성을 설정하세요.")
    
    # Theme of the Year 필드
    draw_field_box(c, MARGIN, H - 220, W - MARGIN*2, 40, 
                   "THEME OF THE YEAR (올해의 한 문장)")
    
    # 5대 영역 카드 (각 영역: 핵심 목표, 성공 기준, 핵심 실천 행동)
    areas = [
        ("AREA 01", "커리어 · 일", ACCENT_PURPLE),
        ("AREA 02", "AI · 역량 학습", ACCENT_BLUE),
        ("AREA 03", "수익 · 자산", ACCENT_GREEN),
    ]
    
    card_h = 240
    card_y = H - 250
    card_w = (W - MARGIN*2 - 20) / 2
    
    # 첫 페이지: AREA 01~03
    for idx, (code, title, accent) in enumerate(areas):
        if idx < 2:
            x = MARGIN + idx * (card_w + 20)
            y = card_y
        else:
            x = MARGIN
            y = card_y - card_h - 20
            
        this_w = card_w if idx < 2 else W - MARGIN*2
        
        # 카드 배경
        c.setFillColor(BG_CARD)
        c.roundRect(x, y - card_h, this_w, card_h, 6, fill=1, stroke=0)
        
        # 상단 액센트 바
        c.setFillColor(accent)
        c.roundRect(x, y - 3, this_w, 3, 1, fill=1, stroke=0)
        
        # 코드 & 제목
        c.setFont("NotoSansKR-Bold", 7)
        c.setFillColor(accent)
        c.drawString(x + 12, y - 20, code)
        c.setFont("NotoSansKR-Bold", 12)
        c.setFillColor(TEXT_W)
        c.drawString(x + 12, y - 38, title)
        
        # 필드들 (높이 확대)
        fw = this_w - 24
        draw_field_box(c, x + 12, y - 80, fw, 32, "핵심 목표")
        draw_field_box(c, x + 12, y - 125, fw, 32, "성공 기준 (측정 지표)")
        draw_field_box(c, x + 12, y - 190, fw, 55, "핵심 실천 행동")
    
    # 하단 자유 메모
    bottom_y = card_y - card_h - 20 - card_h - 15
    draw_section_title(c, MARGIN, bottom_y, "연간 방향 메모", ACCENT_PURPLE)
    draw_lined_area(c, MARGIN, bottom_y - 5, W - MARGIN*2, abs(bottom_y - 50), 26)
    
    c.showPage()
    
    # Life Compass 2페이지: AREA 04~05
    dark_bg(c)
    home_btn(c)
    c.setFillColor(ACCENT_PURPLE)
    c.setFont("NotoSansKR-Bold", 9)
    c.drawString(MARGIN, H - 50, "LIFE COMPASS (continued)")
    
    areas2 = [
        ("AREA 04", "건강 · 체력", ACCENT_GOLD),
        ("AREA 05", "관계 · 멘토링", ACCENT_ROSE),
    ]
    
    card_y2 = H - 80
    for idx, (code, title, accent) in enumerate(areas2):
        x = MARGIN + idx * (card_w + 20)
        y = card_y2
        
        c.setFillColor(BG_CARD)
        c.roundRect(x, y - card_h, card_w, card_h, 6, fill=1, stroke=0)
        c.setFillColor(accent)
        c.roundRect(x, y - 3, card_w, 3, 1, fill=1, stroke=0)
        
        c.setFont("NotoSansKR-Bold", 7)
        c.setFillColor(accent)
        c.drawString(x + 12, y - 20, code)
        c.setFont("NotoSansKR-Bold", 12)
        c.setFillColor(TEXT_W)
        c.drawString(x + 12, y - 38, title)
        
        fw = card_w - 24
        draw_field_box(c, x + 12, y - 80, fw, 32, "핵심 목표")
        draw_field_box(c, x + 12, y - 125, fw, 32, "성공 기준 (측정 지표)")
        draw_field_box(c, x + 12, y - 190, fw, 55, "핵심 실천 행동")
    
    # 하단: 자유 노트 영역 (연간 핵심 메모)
    notes_y2 = card_y2 - card_h - 30
    draw_section_title(c, MARGIN, notes_y2, "연간 핵심 메모 & 아이디어", ACCENT_PURPLE)
    draw_lined_area(c, MARGIN, notes_y2 - 5, W - MARGIN*2, abs(notes_y2 - 50), 26)
    
    c.showPage()
    
    # ══════════════════════════════════════
    # QUARTERLY PAGES (Q1~Q4, 각 2페이지)
    # ══════════════════════════════════════
    quarter_months = {1: (1, 3), 2: (4, 6), 3: (7, 9), 4: (10, 12)}
    quarter_labels = {1: "Q1 (1~3월)", 2: "Q2 (4~6월)", 3: "Q3 (7~9월)", 4: "Q4 (10~12월)"}
    
    for q in range(1, 5):
        # ─── 페이지 1: Big Rocks + 프로젝트 트래커 ───
        c.bookmarkPage(f"Quarter_{q}")
        dark_bg(c)
        home_btn(c)
        
        # 분기 탭
        tab_w = 130
        for qi in range(1, 5):
            tx = MARGIN + (qi - 1) * (tab_w + 10)
            if qi == q:
                c.setFillColor(ACCENT_PURPLE)
                c.roundRect(tx, H - 52, tab_w, 24, 4, fill=1, stroke=0)
                c.setFillColor(TEXT_W)
            else:
                c.setFillColor(BG_BTN)
                c.roundRect(tx, H - 52, tab_w, 24, 4, fill=1, stroke=0)
                c.setFillColor(TEXT_SUB)
            c.setFont("NotoSansKR-Bold", 9)
            c.drawCentredString(tx + tab_w/2, H - 45, quarter_labels[qi])
            c.linkAbsolute("", f"Quarter_{qi}", (tx, H - 55, tx + tab_w, H - 28))
        
        # Big Rocks 섹션
        draw_section_title(c, MARGIN, H - 90, f"Q{q} 3대 핵심 목표 (BIG ROCKS)", ACCENT_PURPLE)
        c.setFont("NotoSansKR", 9)
        c.setFillColor(TEXT_SUB)
        c.drawString(MARGIN + 10, H - 108, "이 3가지만 완수해도 이번 분기는 대성공입니다.")
        
        rock_w = (W - MARGIN*2 - 20) / 3
        rock_h = 130
        rock_y = H - 130
        
        for r in range(3):
            rx = MARGIN + r * (rock_w + 10)
            c.setFillColor(BG_CARD)
            c.roundRect(rx, rock_y - rock_h, rock_w, rock_h, 5, fill=1, stroke=0)
            
            # 상단 바
            rock_colors = [ACCENT_PURPLE, ACCENT_BLUE, ACCENT_GREEN]
            c.setFillColor(rock_colors[r])
            c.roundRect(rx, rock_y - 3, rock_w, 3, 1, fill=1, stroke=0)
            
            c.setFont("NotoSansKR-Bold", 8)
            c.setFillColor(rock_colors[r])
            c.drawString(rx + 10, rock_y - 20, f"ROCK {r+1:02d}")
            
            # 체크박스
            c.setStrokeColor(TEXT_SUB)
            c.setLineWidth(0.5)
            c.rect(rx + rock_w - 55, rock_y - 22, 10, 10, fill=0, stroke=1)
            c.setFont("NotoSansKR", 7)
            c.setFillColor(TEXT_MUTED)
            c.drawString(rx + rock_w - 42, rock_y - 20, "달성")
            
            fw = rock_w - 20
            draw_field_box(c, rx + 10, rock_y - 60, fw, 28, "핵심 목표")
            draw_field_box(c, rx + 10, rock_y - 100, fw, 28, "측정 기준")
        
        # 프로젝트 트래커
        proj_y = rock_y - rock_h - 30
        draw_section_title(c, MARGIN, proj_y, "분기 프로젝트 트래커 (PROJECT TRACKER)", ACCENT_BLUE)
        c.setFont("NotoSansKR", 9)
        c.setFillColor(TEXT_SUB)
        c.drawString(MARGIN + 10, proj_y - 18, "프로젝트별 핵심 결과물과 진척도를 추적합니다.")
        
        # 테이블 헤더
        table_y = proj_y - 40
        cols = [MARGIN, MARGIN + 30, MARGIN + 240, MARGIN + 420, MARGIN + 560]
        headers = ["#", "프로젝트명", "핵심 결과물", "진척도", "상태"]
        c.setFillColor(BG_CARD)
        c.roundRect(MARGIN, table_y - 22, W - MARGIN*2, 22, 3, fill=1, stroke=0)
        c.setFont("NotoSansKR-Bold", 8)
        c.setFillColor(TEXT_SUB)
        for ci, h in enumerate(headers):
            c.drawString(cols[ci] + 5, table_y - 16, h)
        
        # 프로젝트 행 (8줄) — 행 간격 넓힘
        row_height = 50
        for row in range(8):
            ry = table_y - 22 - row * row_height
            c.setStrokeColor(LINE_COLOR)
            c.setLineWidth(0.5)
            c.line(MARGIN, ry - row_height, W - MARGIN, ry - row_height)
            
            c.setFont("NotoSansKR", 9)
            c.setFillColor(TEXT_MUTED)
            c.drawString(cols[0] + 8, ry - 30, f"{row+1}")
            
            # 빈 필드 라인
            for ci in range(1, 4):
                c.setStrokeColor(LINE_COLOR)
                c.line(cols[ci] + 5, ry - 35, cols[ci] + (cols[ci+1] - cols[ci]) - 15, ry - 35)
            
            # 상태 체크박스
            c.setStrokeColor(TEXT_SUB)
            c.rect(cols[4] + 10, ry - 33, 10, 10, fill=0, stroke=1)
        
        # 하단 분기 메모 영역
        notes_y = table_y - 22 - 8 * row_height - 20
        draw_section_title(c, MARGIN, notes_y, f"Q{q} 핵심 메모 & 아이디어", ACCENT_GREEN)
        draw_lined_area(c, MARGIN, notes_y - 5, W - MARGIN*2, notes_y - 30, 26)
        
        c.showPage()
        
        # ─── 페이지 2: 분기 회고 (RETROSPECTIVE) ───
        dark_bg(c)
        home_btn(c)
        
        draw_section_title(c, MARGIN, H - 60, f"Q{q} 마감 및 회고 (RETROSPECTIVE)", ACCENT_ROSE)
        c.setFont("NotoSansKR", 10)
        c.setFillColor(TEXT_SUB)
        c.drawString(MARGIN + 10, H - 80, "경험에서 배움을 추출해야 다음 분기에 더 빠르게 성장합니다.")
        
        retro_items = [
            ("잘된 것 (KEEP / SUCCESS)", ACCENT_GREEN, "이번 분기에 효과적이었고 계속 유지할 성공 요인은?"),
            ("아쉬운 것 (PROBLEM)", ACCENT_ROSE, "목표 달성을 가로막았거나 개선이 필요한 병목은?"),
            ("배운 것 (LEARNED / TRY)", ACCENT_BLUE, "다음 분기에 새롭게 시도하거나 배운 원칙은?"),
        ]
        
        retro_h = 250
        retro_y = H - 110
        for ri, (title, accent, placeholder) in enumerate(retro_items):
            ry = retro_y - ri * (retro_h + 15)
            c.setFillColor(BG_CARD)
            c.roundRect(MARGIN, ry - retro_h, W - MARGIN*2, retro_h, 6, fill=1, stroke=0)
            c.setFillColor(accent)
            c.roundRect(MARGIN, ry - 3, W - MARGIN*2, 3, 1, fill=1, stroke=0)
            
            c.setFont("NotoSansKR-Bold", 11)
            c.setFillColor(accent)
            c.drawString(MARGIN + 15, ry - 24, title)
            
            c.setFont("NotoSansKR", 8)
            c.setFillColor(TEXT_MUTED)
            c.drawString(MARGIN + 15, ry - 40, placeholder)
            
            draw_lined_area(c, MARGIN + 15, ry - 45, W - MARGIN*2 - 30, retro_h - 55, 28)
        
        c.showPage()
    
    # ══════════════════════════════════════
    # MONTHLY CALENDAR (12개월)
    # ══════════════════════════════════════
    for m in range(1, 13):
        dark_bg(c)
        c.bookmarkPage(month_dests[m-1])
        nav_tabs(c, m, month_dests)
        home_btn(c)
        
        c.setFillColor(TEXT_W)
        c.setFont("BigCaslon", 60)
        c.drawString(MARGIN, H - 120, f"{m:02d}")
        
        # 월 이름 (영문)
        month_names = ["", "January", "February", "March", "April", "May", "June",
                       "July", "August", "September", "October", "November", "December"]
        c.setFont("NotoSansKR", 12)
        c.setFillColor(TEXT_SUB)
        c.drawString(MARGIN + 75, H - 105, month_names[m])
        
        # 분기 링크
        q = (m - 1) // 3 + 1
        c.setFont("NotoSansKR-Bold", 9)
        c.setFillColor(ACCENT_PURPLE)
        c.drawString(MARGIN + 75, H - 120, f"Q{q}")
        c.linkAbsolute("", f"Quarter_{q}", (MARGIN + 75, H - 125, MARGIN + 95, H - 108))
        
        # 달력 그리드
        c.setStrokeColor(LINE_COLOR)
        c.setLineWidth(0.5)
        margin_x = MARGIN
        grid_width = W - margin_x * 2
        col_w = grid_width / 7
        row_h = 110
        grid_y = H - 160
        
        days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
        c.setFont("NotoSansKR-Bold", 8)
        for i, d in enumerate(days):
            x = margin_x + i * col_w
            if i == 5:
                c.setFillColor(ACCENT_BLUE)
            elif i == 6:
                c.setFillColor(ACCENT_RED)
            else:
                c.setFillColor(TEXT_SUB)
            c.drawCentredString(x + col_w/2, grid_y + 15, d)
        
        cal = calendar.monthcalendar(2027, m)
        for row_idx, week in enumerate(cal):
            y = grid_y - row_idx * row_h
            
            # 주간 이동 버튼
            try:
                first_day = next(d for d in week if d != 0)
                week_num = datetime.date(2027, m, first_day).isocalendar()[1]
                c.setFillColor(BG_BTN)
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
                    c.linkAbsolute("", f"Daily_{m:02d}{day:02d}", (x, y - row_h, x + col_w, y))
                    
                    is_holiday = (m, day) in HOLIDAYS_2027
                    if col_idx == 6 or is_holiday:
                        c.setFillColor(ACCENT_RED)
                    elif col_idx == 5:
                        c.setFillColor(ACCENT_BLUE)
                    else:
                        c.setFillColor(TEXT_SUB)
                    
                    c.setFont("NotoSansKR", 12)
                    c.drawString(x + 10, y - 20, str(day))
                    
                    if is_holiday:
                        c.setFont("NotoSansKR", 7)
                        c.drawString(x + 10, y - 32, HOLIDAYS_2027[(m, day)])
        
        # 하단 월간 메모 영역
        notes_y = grid_y - len(cal) * row_h - 30
        draw_section_title(c, MARGIN, notes_y, f"{month_names[m]} 핵심 메모 & 아이디어", ACCENT_BLUE)
        notes_h = notes_y - 40 # 바닥 여백(40px)을 남긴 실제 라인영역 높이
        if notes_h > 30:
            draw_lined_area(c, MARGIN, notes_y - 10, W - MARGIN*2, notes_h, 28)
            
        c.showPage()
    
    # ══════════════════════════════════════
    # WEEKLY PAGES (52~53주)
    # ══════════════════════════════════════
    start_date = datetime.date(2027, 1, 1)
    end_date = datetime.date(2027, 12, 31)
    curr = start_date
    weeks_done = set()
    
    while curr <= end_date:
        w = curr.isocalendar()[1]
        if w not in weeks_done:
            weeks_done.add(w)
            dark_bg(c)
            c.bookmarkPage(f"Weekly_{w:02d}")
            home_btn(c)
            
            # 헤더
            c.setFillColor(ACCENT_BLUE)
            c.setFont("NotoSansKR-Bold", 9)
            c.drawString(MARGIN, H - 50, "WEEKLY PLANNER")
            
            c.setFillColor(TEXT_W)
            c.setFont("BigCaslon", 36)
            c.drawString(MARGIN, H - 90, f"Week {w:02d}")
            
            # 월 링크
            c.setFont("NotoSansKR", 10)
            c.setFillColor(TEXT_SUB)
            c.drawString(MARGIN + 160, H - 85, f"M O N T H")
            c.linkAbsolute("", f"Month_{curr.month}", (MARGIN + 160, H - 90, MARGIN + 260, H - 70))
            
            # 이번 주의 Big Focus
            draw_section_title(c, MARGIN, H - 120, "이번 주 최우선 과제 (WEEKLY FOCUS)", colors.HexColor("#F97316"))
            draw_field_box(c, MARGIN, H - 155, W - MARGIN*2, 28, "", "이번 주에 반드시 끝내야 할 단 1가지")
            
            # 7일 그리드 (2열: 좌 MON~THU, 우 FRI~SUN + 주간 회고)
            day_names = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
            left_w = (W - MARGIN*2 - 15) / 2
            day_h = 170
            
            for di in range(7):
                if di < 4:  # 좌측 열
                    dx = MARGIN
                    dy = H - 195 - di * (day_h + 8)
                else:  # 우측 열
                    dx = MARGIN + left_w + 15
                    dy = H - 195 - (di - 4) * (day_h + 8)
                
                c.setFillColor(BG_CARD)
                c.roundRect(dx, dy - day_h, left_w, day_h, 4, fill=1, stroke=0)
                
                # 요일 헤더
                day_accent = ACCENT_RED if di == 6 else (ACCENT_BLUE if di == 5 else TEXT_W)
                c.setFont("NotoSansKR-Bold", 10)
                c.setFillColor(day_accent)
                c.drawString(dx + 10, dy - 18, day_names[di])
                
                # 체크리스트 라인
                for li in range(4):
                    ly = dy - 45 - li * 28
                    draw_checkbox_line(c, dx + 10, ly, left_w - 30)
            
            # 우측 하단: 주간 회고
            review_dy = H - 195 - 3 * (day_h + 8)
            c.setFillColor(BG_CARD)
            c.roundRect(MARGIN + left_w + 15, review_dy - day_h, left_w, day_h, 4, fill=1, stroke=0)
            c.setFillColor(ACCENT_GREEN)
            c.roundRect(MARGIN + left_w + 15, review_dy - 3, left_w, 3, 1, fill=1, stroke=0)
            c.setFont("NotoSansKR-Bold", 10)
            c.setFillColor(ACCENT_GREEN)
            c.drawString(MARGIN + left_w + 25, review_dy - 18, "주간 회고")
            draw_lined_area(c, MARGIN + left_w + 25, review_dy - 30, left_w - 20, day_h - 40, 24)
            
            c.showPage()
        curr += datetime.timedelta(days=1)
    
    # ══════════════════════════════════════
    # DAILY PAGES (365일) — 구조화된 레이아웃
    # ══════════════════════════════════════
    curr = start_date
    while curr <= end_date:
        dark_bg(c)
        c.bookmarkPage(f"Daily_{curr.strftime('%m%d')}")
        home_btn(c)
        
        # MONTH 링크
        c.setFont("NotoSansKR", 9)
        c.setFillColor(TEXT_SUB)
        c.drawString(W - 160, H - 40, "M O N T H")
        c.linkAbsolute("", f"Month_{curr.month}", (W - 170, H - 45, W - 100, H - 25))
        
        # WEEKLY 링크
        wk = curr.isocalendar()[1]
        c.drawString(W - 250, H - 40, f"W E E K")
        c.linkAbsolute("", f"Weekly_{wk:02d}", (W - 260, H - 45, W - 190, H - 25))
        
        # DAILY FOCUS 배지
        c.setFillColor(colors.HexColor("#F97316"))
        c.setFont("NotoSansKR-Bold", 8)
        c.drawString(MARGIN, H - 50, "DAILY FOCUS")
        
        # 날짜
        c.setFillColor(TEXT_W)
        c.setFont("BigCaslon", 32)
        c.drawString(MARGIN, H - 90, curr.strftime('%B %d'))
        
        c.setFont("NotoSansKR-Bold", 11)
        day_str = curr.strftime('%A').upper()
        if (curr.month, curr.day) in HOLIDAYS_2027:
            day_str += f" · {HOLIDAYS_2027[(curr.month, curr.day)]}"
            c.setFillColor(ACCENT_RED)
        else:
            c.setFillColor(TEXT_SUB)
        c.drawString(MARGIN, H - 110, day_str)
        
        # 연도 표시
        c.setFont("NotoSansKR", 9)
        c.setFillColor(TEXT_MUTED)
        c.drawString(MARGIN + 200, H - 85, "2027")
        
        # ─── 좌측 패널 (메인 작업) ───
        left_w = (W - MARGIN*2 - 20) * 0.6
        right_w = (W - MARGIN*2 - 20) * 0.4
        panel_y = H - 130
        
        # 1. TOP PRIORITY
        draw_section_title(c, MARGIN, panel_y, "오늘의 1순위 핵심 과제 (TOP PRIORITY)", colors.HexColor("#F97316"))
        draw_field_box(c, MARGIN, panel_y - 35, left_w, 28, "", "오늘 반드시 끝낼 단 1가지")
        
        # 2. 체크리스트
        draw_section_title(c, MARGIN, panel_y - 80, "체크리스트 & TO-DO", ACCENT_PURPLE)
        for ti in range(10):
            ty = panel_y - 110 - ti * 26
            draw_checkbox_line(c, MARGIN + 5, ty, left_w - 15)
        
        # 3. 타임블록 & 데일리 메모
        draw_section_title(c, MARGIN, panel_y - 385, "타임블록 & 데일리 메모", ACCENT_BLUE)
        memo_labels = ["• 오전 포커스:", "• 오후 세일즈:", "• 저녁 회고 & 아이디어:"]
        for mi, mlabel in enumerate(memo_labels):
            my = panel_y - 410 - mi * 65
            c.setFont("NotoSansKR", 8)
            c.setFillColor(TEXT_MUTED)
            c.drawString(MARGIN + 5, my + 45, mlabel)
            draw_lined_area(c, MARGIN + 5, my + 40, left_w - 10, 50, 22)
        
        # ─── 우측 패널 ───
        rx = MARGIN + left_w + 20
        
        # 감사 일기
        c.setFillColor(BG_CARD)
        c.roundRect(rx, panel_y - 120, right_w, 150, 5, fill=1, stroke=0)
        c.setFillColor(ACCENT_GOLD)
        c.roundRect(rx, panel_y + 27, right_w, 3, 1, fill=1, stroke=0)
        c.setFont("NotoSansKR-Bold", 9)
        c.setFillColor(ACCENT_GOLD)
        c.drawString(rx + 10, panel_y + 10, "오늘의 감사 (GRATITUDE)")
        draw_lined_area(c, rx + 10, panel_y, right_w - 20, 110, 24)
        
        # 배운 것 / 인사이트
        c.setFillColor(BG_CARD)
        c.roundRect(rx, panel_y - 290, right_w, 150, 5, fill=1, stroke=0)
        c.setFillColor(ACCENT_GREEN)
        c.roundRect(rx, panel_y - 143, right_w, 3, 1, fill=1, stroke=0)
        c.setFont("NotoSansKR-Bold", 9)
        c.setFillColor(ACCENT_GREEN)
        c.drawString(rx + 10, panel_y - 160, "오늘의 배움 (INSIGHT)")
        draw_lined_area(c, rx + 10, panel_y - 170, right_w - 20, 110, 24)
        
        # 내일 준비
        c.setFillColor(BG_CARD)
        c.roundRect(rx, panel_y - 460, right_w, 150, 5, fill=1, stroke=0)
        c.setFillColor(ACCENT_ROSE)
        c.roundRect(rx, panel_y - 313, right_w, 3, 1, fill=1, stroke=0)
        c.setFont("NotoSansKR-Bold", 9)
        c.setFillColor(ACCENT_ROSE)
        c.drawString(rx + 10, panel_y - 330, "내일 준비 (TOMORROW)")
        for ti in range(3):
            ty = panel_y - 360 - ti * 28
            draw_checkbox_line(c, rx + 10, ty, right_w - 30)
        
        # 하단: 데일리 스코어
        c.setFillColor(BG_CARD)
        c.roundRect(rx, panel_y - 590, right_w, 110, 5, fill=1, stroke=0)
        c.setFont("NotoSansKR-Bold", 9)
        c.setFillColor(TEXT_SUB)
        c.drawString(rx + 10, panel_y - 493, "하루 자기평가")
        
        scores = ["생산성", "건강", "마인드"]
        for si, slabel in enumerate(scores):
            sy = panel_y - 520 - si * 25
            c.setFont("NotoSansKR", 9)
            c.setFillColor(TEXT_MUTED)
            c.drawString(rx + 10, sy, slabel)
            # 5점 스케일 동그라미
            for dot in range(5):
                c.setStrokeColor(TEXT_SUB)
                c.setLineWidth(0.5)
                c.circle(rx + 80 + dot * 22, sy + 4, 6, fill=0, stroke=1)
        
        c.showPage()
        curr += datetime.timedelta(days=1)
    
    # ══════════════════════════════════════
    # YEARLY CALENDAR (1페이지 미니 캘린더)
    # ══════════════════════════════════════
    dark_bg(c)
    c.bookmarkPage("Yearly_Calendar")
    home_btn(c)
    
    c.setFillColor(TEXT_W)
    c.setFont("BigCaslon", 36)
    c.drawString(MARGIN, H - 70, "2027")
    c.setFont("NotoSansKR", 11)
    c.setFillColor(TEXT_SUB)
    c.drawString(MARGIN + 110, H - 65, "Yearly Calendar")
    
    mini_w = (W - MARGIN*2 - 30) / 3
    mini_h = 210
    
    for m in range(1, 13):
        row = (m - 1) // 3
        col = (m - 1) % 3
        mx = MARGIN + col * (mini_w + 15)
        my = H - 100 - row * (mini_h + 15)
        
        c.setFillColor(BG_CARD)
        c.roundRect(mx, my - mini_h, mini_w, mini_h, 4, fill=1, stroke=0)
        
        c.setFont("NotoSansKR-Bold", 11)
        c.setFillColor(TEXT_W)
        c.drawString(mx + 8, my - 18, f"{m:02d}")
        c.linkAbsolute("", month_dests[m-1], (mx, my - mini_h, mx + mini_w, my))
        
        # 미니 달력
        cal = calendar.monthcalendar(2027, m)
        cell_w = (mini_w - 16) / 7
        cell_h = 22
        
        day_labels = ["M", "T", "W", "T", "F", "S", "S"]
        c.setFont("NotoSansKR", 6)
        for di, dl in enumerate(day_labels):
            c.setFillColor(ACCENT_RED if di == 6 else (ACCENT_BLUE if di == 5 else TEXT_MUTED))
            c.drawCentredString(mx + 8 + di * cell_w + cell_w/2, my - 35, dl)
        
        for wi, week in enumerate(cal):
            for di, day in enumerate(week):
                if day != 0:
                    dx = mx + 8 + di * cell_w + cell_w/2
                    dy = my - 50 - wi * cell_h
                    
                    is_holiday = (m, day) in HOLIDAYS_2027
                    if di == 6 or is_holiday:
                        c.setFillColor(ACCENT_RED)
                    elif di == 5:
                        c.setFillColor(ACCENT_BLUE)
                    else:
                        c.setFillColor(TEXT_SUB)
                    
                    c.setFont("NotoSansKR", 7)
                    c.drawCentredString(dx, dy, str(day))
    
    c.showPage()
    
    # ─── 저장 ───
    c.save()
    print(f"✅ PRO Planner generated: {filename}")

if __name__ == '__main__':
    register_fonts()
    create_pro_planner()
