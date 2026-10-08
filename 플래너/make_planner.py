# -*- coding: utf-8 -*-
"""Project & Life Planner 생성기  (A4 · 하이퍼링크/북마크 포함)

사용법
    python3 make_planner.py                      # config.json 대로 생성
    python3 make_planner.py --year 2028          # 연도만 바꿔서
    python3 make_planner.py --theme light        # 테마 바꿔서
    python3 make_planner.py --config my.json --out my.pdf

필요: pip install reportlab fonttools holidays
모든 설정(연도·공휴일·색상·레이아웃·문구)은 config.json 에서 바꿉니다.
"""
import argparse, calendar, datetime as dt, hashlib, json, math, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))

# ───────────────────────── 설정 로드 ─────────────────────────
ap = argparse.ArgumentParser()
ap.add_argument('--config', default=os.path.join(HERE, 'config.json'))
ap.add_argument('--year', type=int); ap.add_argument('--theme'); ap.add_argument('--out')
ap.add_argument('--rebuild-fonts', action='store_true')
args = ap.parse_args()
CFG_RAW = open(args.config, encoding='utf-8').read()
CFG = json.loads(CFG_RAW)
if args.year: CFG['year'] = args.year
if args.theme: CFG['theme'] = args.theme
DEFAULT_LAYOUT = {'margin': 46, 'n_projects': 10, 'project_milestones': 5, 'project_subgoals': 4, 'project_subgoal_tasks': 4,
    'project_log_rows': 13, 'index_backlog_items': 4, 'quarter_tracker_rows': 6, 'not_to_do_items': 2, 'habit_rows': 8,
    'monthly_goals': 4, 'month_cell_lines': 3, 'week_priorities': 3, 'week_todos': 8, 'week_block_lines': 3,
    'daily_line_gap': 26, 'daily_style': 'lines', 'daily_blank_top': 0, 'notes_style': 'lines',
    'show_holiday_labels': True, 'show_english': True, 'corner_radius': 5, 'button_radius': 3}
YEAR = CFG['year']; L = {**DEFAULT_LAYOUT, **CFG['layout']}; T = CFG['texts']; SEC = CFG['sections']
OUT = args.out or CFG['output'].format(year=YEAR)

# ───────────────────────── 폰트 (CFF/TTF → 서브셋 TrueType, 캐시) ─────────────────────────
ROLES = ('Light', 'Reg', 'Med', 'Serif')
NOTO = {'Light': 'NotoSansCJK-Light.ttc', 'Reg': 'NotoSansCJK-Regular.ttc',
        'Med': 'NotoSansCJK-Medium.ttc', 'Serif': 'NotoSerifCJK-Bold.ttc'}
def font_sources():
    fc = CFG['fonts']; cu = fc.get('custom', {}) or {}; res = {}
    for r in ROLES:
        p = cu.get(r) or cu.get('all')
        if p:
            p = p if os.path.isabs(p) else os.path.join(os.path.dirname(os.path.abspath(args.config)), p)
            if not os.path.exists(p): sys.exit(f'폰트 파일을 찾을 수 없습니다: {p}')
            res[r] = (p, fc.get('custom_index', 0))
        else:
            res[r] = (os.path.join(fc['noto_dir'], NOTO[r]), 1)          # Noto CJK, 1 = KR 서브폰트
    return res
FSRC = font_sources()
CMAPS = {}
def ensure_fonts():
    src = open(__file__, encoding='utf-8').read() + CFG_RAW
    chars = set(chr(c) for c in range(0x20, 0x7f)) | set(re.findall(r'[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]', src))
    chars |= set('‹›·–—×✓•○□↑↓←→・~')
    sig = hashlib.md5((''.join(sorted(chars)) + repr([(r, FSRC[r], os.path.getmtime(FSRC[r][0])) for r in ROLES])).encode()).hexdigest()[:12]
    d = os.path.join(HERE, 'fonts', sig); os.makedirs(d, exist_ok=True)
    from fontTools.ttLib import TTFont as FT, newTable
    for r in ROLES:
        out = os.path.join(d, f'{r}.ttf')
        if args.rebuild_fonts or not os.path.exists(out):
            print(f'폰트 변환 중... {r} ← {os.path.basename(FSRC[r][0])}')
            from fontTools import subset
            from fontTools.pens.cu2quPen import Cu2QuPen
            from fontTools.pens.ttGlyphPen import TTGlyphPen
            f = FT(FSRC[r][0], fontNumber=FSRC[r][1], lazy=False)
            opt = subset.Options(); opt.layout_features = ['kern']; opt.notdef_outline = True; opt.name_IDs = ['*']; opt.hinting = False
            sb = subset.Subsetter(opt); sb.populate(text=''.join(sorted(chars))); sb.subset(f)
            if 'CFF ' in f:
                gs = f.getGlyphSet(); order = f.getGlyphOrder(); glyf = {}
                for g in order:
                    pen = TTGlyphPen(gs); gs[g].draw(Cu2QuPen(pen, 1.0, reverse_direction=True)); glyf[g] = pen.glyph()
                t = newTable('glyf'); t.glyphOrder = order; t.glyphs = glyf; f['glyf'] = t; f['loca'] = newTable('loca')
                mp = newTable('maxp'); mp.tableVersion = 0x00010000
                for a_ in ('maxZones', 'maxTwilightPoints', 'maxStorage', 'maxFunctionDefs', 'maxInstructionDefs', 'maxStackElements',
                           'maxSizeOfInstructions', 'maxComponentElements', 'maxPoints', 'maxContours', 'maxCompositePoints',
                           'maxCompositeContours', 'maxComponentDepth'): setattr(mp, a_, 0)
                mp.maxZones = 1; mp.numGlyphs = len(order); f['maxp'] = mp
                for a_ in ('CFF ', 'VORG'):
                    if a_ in f: del f[a_]
                f['head'].glyphDataFormat = 0; f['head'].indexToLocFormat = 1; f.sfntVersion = '\x00\x01\x00\x00'
                post = f['post']; post.formatType = 2.0; post.extraNames = []; post.mapping = {}; post.glyphOrder = order
            f.save(out)
        CMAPS[r] = set(FT(out).getBestCmap().keys())
    return d, chars
FDIR, USED_CHARS = ensure_fonts()

from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
for r in ROLES: pdfmetrics.registerFont(TTFont(r, os.path.join(FDIR, f'{r}.ttf')))
# 폰트에 없는 글자 경고 + 기호 대체 (손글씨체에는 ‹ › · 같은 기호가 없는 경우가 많음)
SUBST = {'‹': ['‹', '<', '〈', '←'], '›': ['›', '>', '〉', '→'], '·': ['·', '・', '•', '∙', '.', ' '], '–': ['–', '-', '~'], '—': ['—', '-'], '×': ['×', 'x']}
_cfg_text = ''.join(re.findall(r'"([^"]*)"', CFG_RAW)) if False else CFG_RAW
for r in ROLES:
    miss = sorted({ch for ch in re.findall(r'[\uac00-\ud7af]', open(__file__, encoding='utf-8').read() + CFG_RAW) if ord(ch) not in CMAPS[r]})
    if miss and FSRC[r][0].find('Noto') < 0: print(f'⚠ [{r}] 폰트에 없는 한글 {len(miss)}자: {"".join(miss[:40])}  → 다른 단어로 바꾸거나 전체 한글을 지원하는 폰트를 쓰세요')
def fixch(role, s):
    cm = CMAPS[role]; out = []
    for ch in s:
        if ord(ch) in cm or ch == ' ': out.append(ch)
        else: out.append(next((x for x in SUBST.get(ch, []) if x == ' ' or ord(x) in cm), ch))
    return ''.join(out)

# ───────────────────────── 색상 / 페이지 크기 ─────────────────────────
def C(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
TH = {k: C(v) for k, v in CFG['themes'][CFG['theme']].items()}
BG, HDR, LINE, CARD, CARDLN = TH['bg'], TH['header'], TH['line'], TH['card'], TH['card_line']
TXT, HEAD, MUTE, SUB, DIM, DIM2, RULE = TH['text'], TH['head'], TH['mute'], TH['sub'], TH['dim'], TH['dim2'], TH['rule']
SUNC, SATC = TH['sun'], TH['sat']
CELL_WE, CELL_BD, CELL_DIM, DAILY_LN = TH['cell_weekend'], TH['cell_border'], TH['cell_dim'], TH['daily_line']

W, H = 595.2756, 841.8898            # 디자인 좌표계(A4). 다른 용지는 이 좌표계를 비율 유지하며 확대/축소
PAGE_SIZES = {'A4': (595.2756, 841.8898), 'A5': (419.5276, 595.2756), 'LETTER': (612, 792),
              'IPAD': (768, 1024), 'IPAD_PRO_11': (834, 1194), 'IPAD_PRO_12.9': (1024, 1366), 'GOODNOTES': (768, 1024)}
ps = CFG.get('page_size', 'A4')
PW, PH = (ps if isinstance(ps, list) else PAGE_SIZES[str(ps).upper().replace(' ', '_')])
SC = min(PW / W, PH / H); TX = (PW - W * SC) / 2; TY = (PH - H * SC) / 2
OX, OY = TX / SC, TY / SC            # 가장자리 여분(디자인 단위) — 헤더/배경을 끝까지 채울 때 사용
MX = L['margin']; RAD = L['corner_radius']; BRAD = L['button_radius']
SHOW_EN = L['show_english']; NOTES_STYLE = L['notes_style']

# ───────────────────────── 문구(라벨) ─────────────────────────
LB = {
 'nav_year': '연간', 'nav_month': '월간', 'nav_week': '주간', 'nav_project': '프로젝트', 'nav_compass': '컴퍼스',
 'nav_prev': '‹ 이전', 'nav_next': '다음 ›', 'nav_prev_month': '‹ 이전달', 'nav_next_month': '다음달 ›',
 'nav_prev_week': '‹ 이전주', 'nav_next_week': '다음주 ›', 'nav_index': '인덱스', 'nav_overview': '개요', 'nav_exec': '실행',
 'nav_log': '기록', 'nav_calendar': '달력', 'nav_review': '리뷰', 'nav_q': 'Q{q}', 'nav_q1': '1분기', 'nav_m': '{m}월',
 'cover_chip_compass': 'LIFE COMPASS', 'cover_chip_projects': 'PROJECTS', 'cover_chip_year': '연간 달력',
 'compass_title': 'LIFE COMPASS', 'compass_sub': '{year} · 한 해의 방향',
 'theme_card': ['올해의 한 문장', 'THEME OF THE YEAR'], 'not_to_do': ['올해 하지 않기로 한 것', 'NOT TO DO LIST'], 'area_tag': 'AREA {n:02d}',
 'q_title': 'Q{q}', 'q_sub': '{year} · {a}월 – {b}월',
 'look_back': ['지난 분기 회고', 'LOOK BACK'], 'look_items': ['잘된 것', '아쉬운 것', '배운 것'],
 'big_rocks': ['이번 분기 목표 3', 'BIG ROCKS'], 'measure': '측정 기준',
 'tracker': ['이번 분기 프로젝트', 'PROJECT TRACKER'], 'tracker_cols': ['프로젝트', '핵심 결과물', '기한', '진행률', '상태'],
 'retro': ['분기 마감 회고', 'RETRO'],
 'pidx_title': 'PROJECTS', 'pidx_sub': '프로젝트 인덱스', 'pidx_hint': '번호를 누르면 해당 프로젝트로 이동합니다',
 'pidx_cols': ['No.', '프로젝트명', '기간', '우선순위', '상태'], 'backlog': ['연기된 / 대기 목록', 'STANDBY · BACKLOG'],
 'proj_title': 'PROJECT {n:02d}', 'proj_sub_o': '개요 · 목표 정의', 'proj_sub_a': '세부 목표 · 실행 과제', 'proj_sub_l': '진행 기록 · 피드백',
 'proj_name': ['프로젝트명', 'PROJECT NAME'], 'why': ['왜 하는가', 'WHY'], 'dod': ['완료의 정의', 'DEFINITION OF DONE'],
 'start': ['시작일', 'START'], 'due': ['목표 마감', 'DUE'], 'hours': ['주당 투입', 'HOURS/WK'],
 'milestones': ['마일스톤', 'MILESTONES'], 'target_date': '목표일', 'risks': ['예상 장애물 · 대비책', 'RISKS'],
 'subgoal': ['세부 목표 {n}', 'SUB-GOAL'], 'deadline': '마감', 'progress': ['전체 진행률', 'PROGRESS'],
 'log': ['진행 로그', 'LOG · FEEDBACK'], 'log_cols': ['날짜', '한 일 · 진행 상황', '피드백 · 다음 액션'],
 'year_sub': 'YEARLY  OVERVIEW', 'year_hint': '날짜를 누르면 일간 노트로 이동합니다',
 'month_sub': '{year}년 {m}월', 'month_goals': ['이달의 목표', 'MONTHLY GOALS'], 'month_memo': ['메모', 'NOTES'],
 'review_title': '{m:02d} REVIEW', 'review_sub': '{year}년 {m}월 · 습관과 회고', 'habit': ['습관 트래커', 'HABIT TRACKER'],
 'review_boxes': [['잘된 것', 'KEEP'], ['아쉬운 것', 'PROBLEM'], ['배운 것', 'LEARNED'], ['다음 달에 바꿀 것', 'TRY']],
 'week_title': 'WEEK {n:02d}', 'week_priorities': ['이번 주 핵심', 'TOP PRIORITIES'], 'week_todo': ['할 일', 'TO DO'],
 'week_notes': ['메모 · 회고', 'NOTES'],
}
LB.update({k: v for k, v in CFG.get('labels', {}).items() if not k.startswith('_')})
def lb(k, **kw):
    v = LB[k]; return v.format(**kw) if isinstance(v, str) else v
def pair(k, **kw):                           # [제목, 영문태그] → (제목, 태그 or None)
    t, e = LB[k]; t = t.format(**kw); return t, (e.format(**kw) if SHOW_EN else None)

# ───────────────────────── 날짜 / 공휴일 ─────────────────────────
d0 = dt.date(YEAR, 1, 1)
DAYS = [d0 + dt.timedelta(i) for i in range(366 if calendar.isleap(YEAR) else 365)]
KWD = ['월', '화', '수', '목', '금', '토', '일']
KWDL = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']
EWD = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
MN = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
FIRST_WD = 6 if CFG['week_start'] == 'sun' else 0

def load_holidays():
    hc = CFG['holidays']; res = {}
    if hc['mode'] == 'auto':
        try:
            import holidays as hl
            for d, n in hl.country_holidays('KR', years=[YEAR], language='ko').items():
                if '노동절' in n and not hc['include_labor_day']: continue
                if '제헌절' in n and not hc['include_constitution_day']: continue
                if '선거' in n and not hc['include_election_days']: continue
                sub = '대체' in n
                n = n.replace('신정연휴', '신정').replace('기독탄신일', '성탄절')
                n = re.sub(r'(설날|추석) (전날|다음날)', r'\1 연휴', n)
                if sub: n = '대체휴일'
                res[(d.month, d.day)] = n
        except ImportError:
            print('※ holidays 라이브러리가 없어 manual 표를 사용합니다 (pip install holidays)'); hc = dict(hc, mode='manual')
    if hc['mode'] == 'manual':
        for k, v in hc['manual'].items(): res[tuple(map(int, k.split('-')))] = v
    for k, v in hc.get('add', {}).items(): res[tuple(map(int, k.split('-')))] = v
    for k in hc.get('remove', []): res.pop(tuple(map(int, k.split('-'))), None)
    return res
HOLIDAYS = load_holidays()
def hol(d): return HOLIDAYS.get((d.month, d.day)) if d.year == YEAR else None
def is_red(d): return d.weekday() == 6 or hol(d) is not None
def col_of(d): return SUNC if is_red(d) else (SATC if d.weekday() == 5 else TXT)

wk0 = d0 - dt.timedelta((d0.weekday() - FIRST_WD) % 7)
NWEEKS = ((DAYS[-1] - wk0).days // 7) + 1
def wk_start(i): return wk0 + dt.timedelta(7 * i)

# ───────────────────────── 페이지 키 / 섹션 ─────────────────────────
def K_Q(q): return f'q{q}'
def K_P(n, s): return f'p{n}{s}'
def K_M(m): return f'm{m}'
def K_R(m): return f'r{m}'
def K_W(i): return f'w{i}'
def K_D(d): return f'd{d.month}_{d.day}'
K_COVER, K_COMP, K_PIDX, K_YEAR = 'cover', 'comp', 'pidx', 'year'
def q_of(m): return (m - 1) // 3 + 1
def exists(key):
    if key is None: return False
    if key == 'cover': return True
    if key == 'comp': return SEC['compass']
    if key == 'year': return SEC['annual']
    if key == 'pidx' or re.fullmatch(r'p\d+[oal]', key): return SEC['projects']
    if re.fullmatch(r'q\d', key): return SEC['quarters']
    if re.fullmatch(r'[mr]\d+', key): return SEC['monthly']
    if re.fullmatch(r'w\d+', key): return SEC['weekly']
    if re.fullmatch(r'd\d+_\d+', key): return SEC['daily']
    return False

# ───────────────────────── 드로잉 헬퍼 ─────────────────────────
c = canvas.Canvas(OUT, pagesize=(PW, PH))
c.setTitle(f'{YEAR} Planner'); c.setAuthor('Claude')
def fill(col): c.setFillColorRGB(*col)
def stroke(col, w=0.5): c.setStrokeColorRGB(*col); c.setLineWidth(w)
def rect(x, y, w, h, f=None, s=None, r=0, lw=0.6):
    if f: fill(f)
    if s: stroke(s, lw)
    if r: c.roundRect(x, y, w, h, min(r, w / 2, h / 2), stroke=1 if s else 0, fill=1 if f else 0)
    else: c.rect(x, y, w, h, stroke=1 if s else 0, fill=1 if f else 0)
def text(x, y, s, font='Reg', size=9, col=None, sp=0, al='l'):
    col = col or TXT; s = fixch(font, s); fill(col); w = pdfmetrics.stringWidth(s, font, size) + sp * len(s)
    if al == 'c': x -= w / 2
    elif al == 'r': x -= w
    t = c.beginText(); t.setFont(font, size); t.setCharSpace(sp); t.setTextOrigin(x, y); t.textOut(s); c.drawText(t)
    return w
def hline(x1, x2, y, col=None, w=0.4): stroke(col or RULE, w); c.line(x1, y, x2, y)
def go(key, x, y, w, h):
    if exists(key): c.linkRect('', key, (x * SC + TX, y * SC + TY, (x + w) * SC + TX, (y + h) * SC + TY), relative=0, thickness=0)
def page(key, title=None, level=0):
    c.bookmarkPage(key)
    if title: c.addOutlineEntry(title, key, level=level, closed=True)
    rect(0, 0, PW, PH, f=BG); c.translate(TX, TY); c.scale(SC, SC)
def band(y, h, col, extend_top=False):          # 가로 전폭 띠 (여분 영역까지 채움)
    rect(-OX, y, W + 2 * OX, h + (OY if extend_top else 0), f=col)
def header(h, title, sub=None, tsize=26, tx=None, ty=None):
    tx = MX if tx is None else tx
    band(H - h, h, HDR, True); band(H - h - 3, 3, LINE)
    ty = ty or H - h + 38
    if title: text(tx, ty, title, 'Serif', tsize, HEAD)
    if sub: text(tx, ty - 17, sub, 'Light', 8.5, MUTE, 1.6 if SHOW_EN else 0.6)
def nav(rows, right=None, bw=52, pitch=58):
    right = W - MX if right is None else right
    for ri, row in enumerate(rows):
        y = H - 46 - ri * 24
        for ci, (lab, key) in enumerate(reversed(row)):
            if not lab or (key is not None and not exists(key)): continue
            x = right - bw - ci * pitch
            rect(x, y, bw, 15, f=LINE, r=BRAD); text(x + bw / 2, y + 4.8, lab, 'Med', 7.5, TXT, al='c'); go(key, x, y, bw, 15)
def card(x, y, w, h, title=None, en=None):
    rect(x, y, w, h, f=CARD, s=CARDLN, r=RAD, lw=0.7)
    if title: text(x + 11, y + h - 17, title, 'Med', 8.5, TXT)
    if en and SHOW_EN: text(x + w - 11, y + h - 16.5, en, 'Light', 6, DIM2, 1.2, 'r')
def cardp(x, y, w, h, key, **kw): t, e = pair(key, **kw); card(x, y, w, h, t, e)
def checkbox(x, y, s=6.5): rect(x, y, s, s, s=DIM2, r=min(BRAD / 2, 3), lw=0.7)
def writelines(x1, x2, y, n, gap=15):
    for i in range(n): hline(x1, x2, y - i * gap, RULE, 0.5)
def paper(x1, x2, ytop, ybot, gap, style=None, col=None):
    """메모 영역 채우기: lines(줄) / dots(점 모눈) / grid(모눈) / none(백지)"""
    style = style or NOTES_STYLE; col = col or DAILY_LN
    if style == 'none' or gap <= 0: return
    if style in ('lines', 'grid'):
        y = ytop
        while y > ybot - 0.01: hline(x1, x2, y, col, .55); y -= gap
    if style == 'grid':
        x = x1
        while x < x2 + 0.01: stroke(col, .45); c.line(x, ytop, x, ybot + ((ytop - ybot) % gap if False else 0)); x += gap
    if style == 'dots':
        fill(col); y = ytop
        while y > ybot - 0.01:
            x = x1
            while x < x2 + 0.01: c.circle(x, y, .75, stroke=0, fill=1); x += gap
            y -= gap
def head_sub(title, sub, h=100, size=28): header(h, title, sub, size, ty=H - h + 40)
def N(k, **kw): return lb(k, **kw)

# ════════════════ 1. 표지 ════════════════
page(K_COVER, '표지')
band(437.78, 404.11, HDR, True); band(437.78, 3, LINE)
text(W / 2, 589, str(YEAR), 'Serif', 118, HEAD, al='c')
stroke(DIM2, .8); c.line(245.6, 559.9, 349.6, 559.9)
text(W / 2, 534.6, T['cover_tagline'], 'Light', 10.5, SUB, 3.2, 'c')
text(W / 2, 349.4, T['cover_title'], 'Light', 13, TXT, al='c')
text(W / 2, 319.9, T['cover_subtitle'], 'Light', 9.5, MUTE, al='c')
for i in range(12):
    x = 105.64 + (i % 6) * 66; y = 231.5 - (i // 6) * 28
    rect(x, y, 48, 20, f=LINE, r=BRAD); text(x + 24, y + 6.5, f'{i+1:02d}', 'Med', 9, HEAD, al='c'); go(K_M(i + 1), x, y, 48, 20)
chips = [(N(a), k) for a, k in (('cover_chip_compass', K_COMP), ('cover_chip_projects', K_PIDX), ('cover_chip_year', K_YEAR)) if exists(k)]
for i, (lab, key) in enumerate(chips):
    x = W / 2 - (len(chips) * 120 + (len(chips) - 1) * 10.8) / 2 + i * 130.8; y = 168
    rect(x, y, 120, 22, f=LINE, r=BRAD); text(x + 60, y + 7, lab, 'Med', 8.5, TXT, 1.2 if SHOW_EN else 0.4, 'c'); go(key, x, y, 120, 22)
text(W / 2, 113, T['cover_name_label'], 'Light', 7, DIM2, 2.4, 'c'); hline(223, 372, 99, DIM2, .6)
c.showPage()

# ════════════════ 2. LIFE COMPASS ════════════════
if SEC['compass']:
    page(K_COMP, 'LIFE COMPASS · 연간 목표')
    head_sub(N('compass_title'), N('compass_sub', year=YEAR))
    text(W - MX, H - 78, T['compass_hint'], 'Light', 8, MUTE, al='r')
    nav([[(N('nav_year'), K_YEAR), (N('nav_project'), K_PIDX), (N('nav_q1'), K_Q(1))]])
    cardp(MX, 652, W - 2 * MX, 62, 'theme_card'); hline(MX + 14, W - MX - 14, 676, DIM2, .6)
    text(MX + 14, 660, T['compass_theme_hint'], 'Light', 6.5, MUTE)
    areas = T['areas']; fields = T['area_fields']; rows = math.ceil(len(areas) / 2)
    cw = (W - 2 * MX - 15) / 2; top, bot = 637, 40 + 66 + 12
    pitch = (top - bot) / rows; ch = pitch - 12
    for i, nm in enumerate(areas):
        x = MX + (i % 2) * (cw + 15); y = top - (i // 2) * pitch - ch
        card(x, y, cw, ch, nm, N('area_tag', n=i + 1))
        fp = (ch - 36) / len(fields)
        for j, lab in enumerate(fields):
            yy = y + ch - 38 - j * fp
            text(x + 11, yy, lab, 'Light', 7, MUTE); writelines(x + 58, x + cw - 11, yy - 3, 2 if j == len(fields) - 1 else 1, 14)
    n = L['not_to_do_items']; nh = 30 + n * 16
    cardp(MX, 40, W - 2 * MX, nh, 'not_to_do')
    for j in range(n): checkbox(MX + 12, 40 + 10 + (n - 1 - j) * 16 + 1); hline(MX + 26, W - MX - 12, 40 + 10 + (n - 1 - j) * 16, DIM2, .5)
    c.showPage()

# ════════════════ 3. 분기 ════════════════
if SEC['quarters']:
    for q in range(1, 5):
        page(K_Q(q), f'Q{q}')
        head_sub(N('q_title', q=q), N('q_sub', year=YEAR, a=3 * q - 2, b=3 * q))
        nav([[(N('nav_compass'), K_COMP), (N('nav_project'), K_PIDX), (N('nav_m', m=3 * q - 2), K_M(3 * q - 2))],
             [(N('nav_prev') if q > 1 else '', K_Q(q - 1)), (N('nav_next') if q < 4 else '', K_Q(q + 1))]])
        cw1 = 244; cardp(MX, 540, cw1, 150, 'look_back')
        for j, lab in enumerate(N('look_items')):
            yy = 660 - j * 34; text(MX + 11, yy, lab, 'Light', 7, MUTE); writelines(MX + 60, MX + cw1 - 11, yy - 3, 1)
            hline(MX + 11, MX + cw1 - 11, yy - 18, RULE, .5)
        x2 = MX + cw1 + 14; cw2 = W - MX - x2; cardp(x2, 540, cw2, 150, 'big_rocks')
        for j in range(3):
            yy = 656 - j * 38; text(x2 + 11, yy - 2, str(j + 1), 'Serif', 12, TXT)
            hline(x2 + 28, x2 + cw2 - 11, yy, DIM2, .5); text(x2 + 28, yy - 12, N('measure'), 'Light', 6, MUTE); hline(x2 + 70, x2 + cw2 - 11, yy - 14, RULE, .5)
        cardp(MX, 150, W - 2 * MX, 375, 'tracker')
        cols = [MX + 11, MX + 140, MX + 330, MX + 395, MX + 470]
        for lab, x in zip(N('tracker_cols'), cols): text(x, 487, lab, 'Light', 6.5, MUTE)
        hline(MX + 8, W - MX - 8, 479, DIM2, .6)
        nr = L['quarter_tracker_rows']; rp = (479 - 162) / nr
        for j in range(nr):
            yy = 479 - (j + 1) * rp; hline(MX + 8, W - MX - 8, yy, RULE, .5); rect(cols[3], yy + rp / 2 - 3, 55, 6, s=DIM2, r=1, lw=.6)
        for x in cols[1:]: stroke(RULE, .4); c.line(x - 6, 479, x - 6, 162)
        cardp(MX, 46, W - 2 * MX, 90, 'retro'); writelines(MX + 12, W - MX - 12, 92, 3, 18)
        c.showPage()

# ════════════════ 4~5. 프로젝트 ════════════════
NP = L['n_projects']
if SEC['projects']:
    page(K_PIDX, '프로젝트')
    head_sub(N('pidx_title'), N('pidx_sub'))
    text(W - MX, H - 78, N('pidx_hint'), 'Light', 8, MUTE, al='r')
    nav([[(N('nav_compass'), K_COMP), (N('nav_year'), K_YEAR), (N('nav_q1'), K_Q(1))]])
    cx = [MX, MX + 58, 333, 413, 487]; top = 700
    for lab, x in zip(N('pidx_cols'), (cx[0] + 4, cx[1] + 12, cx[2] + 12, cx[3] + 12, cx[4] + 12)): text(x, top, lab, 'Light', 6.5, MUTE)
    hline(MX, W - MX, top - 8, DIM2, .6)
    nb = L['index_backlog_items']; bh = 30 + nb * 15; rh = (top - 8 - (46 + bh + 14)) / NP
    for i in range(NP):
        yb = top - 8 - (i + 1) * rh; hline(MX, W - MX, yb, RULE, .6)
        rect(MX + 2, yb + rh / 2 - 7, 24, 14, f=LINE, r=BRAD); text(MX + 14, yb + rh / 2 - 2.5, f'{i+1:02d}', 'Med', 7.5, HEAD, al='c'); go(K_P(i + 1, 'o'), MX + 2, yb + rh / 2 - 7, 24, 14)
    for x in cx[1:]: stroke(RULE, .5); c.line(x, top - 8, x, top - 8 - NP * rh)
    cardp(MX, 46, W - 2 * MX, bh, 'backlog')
    for j in range(nb): yy = 46 + 12 + (nb - 1 - j) * 15; checkbox(MX + 12, yy); hline(MX + 26, W - MX - 12, yy - 2, RULE, .5)
    c.showPage()

    def pnav(n): nav([[(N('nav_index'), K_PIDX), (N('nav_overview'), K_P(n, 'o')), (N('nav_exec'), K_P(n, 'a'))], [(N('nav_log'), K_P(n, 'l')), (N('nav_year'), K_YEAR)]])
    for n in range(1, NP + 1):
        page(K_P(n, 'o'), N('proj_title', n=n), level=1)
        header(88, N('proj_title', n=n), N('proj_sub_o'), 26, ty=H - 88 + 34); pnav(n)
        cardp(MX, 637, W - 2 * MX, 55, 'proj_name'); hline(MX + 12, W - MX - 12, 650, DIM2, .6)
        hw = (W - 2 * MX - 15) / 2
        for k, key in enumerate(('why', 'dod')):
            x = MX + k * (hw + 15); cardp(x, 527, hw, 96, key); writelines(x + 12, x + hw - 12, 580, 3, 16)
        sw = (W - 2 * MX - 30) / 3
        for k, key in enumerate(('start', 'due', 'hours')):
            x = MX + k * (sw + 15); cardp(x, 461, sw, 52, key); hline(x + 12, x + sw - 12, 473, DIM2, .6)
        nm = L['project_milestones']; cardp(MX, 132, W - 2 * MX, 315, 'milestones'); mp = (315 - 50) / nm
        for m in range(nm):
            yy = 447 - 52 - m * mp; checkbox(MX + 12, yy); text(MX + 32, yy + 1, f'M{m+1}', 'Light', 7, MUTE)
            hline(MX + 56, W - MX - 105, yy - 2, DIM2, .5); text(W - MX - 98, yy + 6, N('target_date'), 'Light', 5.5, MUTE); hline(W - MX - 98, W - MX - 12, yy - 2, DIM2, .5)
        cardp(MX, 48, W - 2 * MX, 74, 'risks'); writelines(MX + 12, W - MX - 12, 78, 2, 16)
        c.showPage()

        page(K_P(n, 'a'), f'{N("proj_title", n=n)} · {N("nav_exec")}', level=2)
        header(88, N('proj_title', n=n), N('proj_sub_a'), 26, ty=H - 88 + 34); pnav(n)
        ns, nt = L['project_subgoals'], L['project_subgoal_tasks']; reg_top, reg_bot = 702, 50; sp = (reg_top - reg_bot) / ns; sh = sp - 10
        for s_ in range(ns):
            y = reg_top - (s_ + 1) * sp + 10
            cardp(MX, y, W - 2 * MX, sh, 'subgoal', n=s_ + 1)
            hline(MX + 76, W - MX - 130, y + sh - 19, DIM2, .5); text(W - MX - 118, y + sh - 17, N('deadline'), 'Light', 6, MUTE); hline(W - MX - 98, W - MX - 74, y + sh - 19, DIM2, .5)
            tp = (sh - 50) / nt
            for r in range(nt): yy = y + sh - 46 - r * tp; checkbox(MX + 12, yy); hline(MX + 28, W - MX - 12, yy - 2, RULE, .6)
        c.showPage()

        page(K_P(n, 'l'), f'{N("proj_title", n=n)} · {N("nav_log")}', level=2)
        header(88, N('proj_title', n=n), N('proj_sub_l'), 26, ty=H - 88 + 34); pnav(n)
        cardp(MX, 646, W - 2 * MX, 56, 'progress')
        bx, bw_ = MX + 12, W - 2 * MX - 24; rect(bx, 662, bw_, 14, s=DIM2, r=min(BRAD, 6), lw=.7)
        for k in range(11): x = bx + bw_ * k / 10; stroke(RULE, .4); c.line(x, 662, x, 676); text(x, 651, str(k * 10), 'Light', 5, MUTE, al='c')
        cardp(MX, 48, W - 2 * MX, 584, 'log')
        lc = [MX + 12, MX + 80, MX + 328]
        for lab, x in zip(N('log_cols'), lc): text(x, 596, lab, 'Light', 6, MUTE)
        hline(MX + 8, W - MX - 8, 588, DIM2, .6); lr = L['project_log_rows']; lp = (588 - 62) / lr
        for r in range(lr): hline(MX + 8, W - MX - 8, 588 - (r + 1) * lp, RULE, .5)
        for x in lc[1:]: stroke(RULE, .4); c.line(x - 8, 588, x - 8, 62)
        c.showPage()

# ════════════════ 6. 연간 달력 ════════════════
if SEC['annual']:
    page(K_YEAR, f'{YEAR} 연간 달력')
    header(100, str(YEAR), N('year_sub'), 36, ty=H - 100 + 36)
    nav([[(N('nav_compass'), K_COMP), (N('nav_project'), K_PIDX), (N('nav_q', q=1), K_Q(1))], [(N('nav_q', q=2), K_Q(2)), (N('nav_q', q=3), K_Q(3)), (N('nav_q', q=4), K_Q(4))]])
    if SEC['daily']: text(W - MX, H - 118, N('year_hint'), 'Light', 6.5, MUTE, al='r')
    bwid = 144; bx0 = [MX + 2, MX + 174, MX + 346]
    for m in range(1, 13):
        bx = bx0[(m - 1) % 3]; by = H - 150 - ((m - 1) // 3) * 168
        text(bx, by, f'{m:02d}', 'Serif', 15, HEAD)
        if SHOW_EN: text(bx + 25, by + 1, MN[m - 1], 'Light', 6, MUTE, 1.2)
        go(K_M(m), bx, by - 2, 60, 14); cwid = bwid / 7
        for k in range(7): text(bx + k * cwid + cwid / 2, by - 18, KWD[k], 'Light', 6, SUNC if k == 6 else (SATC if k == 5 else MUTE), al='c')
        hline(bx, bx + bwid, by - 22, DIM2, .6); off = dt.date(YEAR, m, 1).weekday()
        for dd in range(1, calendar.monthrange(YEAR, m)[1] + 1):
            d = dt.date(YEAR, m, dd); idx = off + dd - 1; r_, k = idx // 7, idx % 7
            x = bx + k * cwid + cwid / 2; y = by - 36 - r_ * 13.8
            text(x, y, str(dd), 'Reg', 7, col_of(d), al='c'); go(K_D(d), x - cwid / 2 + 1, y - 3, cwid - 2, 11)
    c.showPage()

# ════════════════ 7. 월간 + 리뷰 ════════════════
SUNFIRST_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
if SEC['monthly']:
    for m in range(1, 13):
        page(K_M(m), f'{m}월 달력', level=1)
        header(118, f'{m:02d}', None, 52, tx=52, ty=H - 118 + 41)
        if SHOW_EN: text(118, H - 118 + 57, MN[m - 1], 'Light', 11, SUB, 3)
        text(118, H - 118 + (39 if SHOW_EN else 50), N('month_sub', year=YEAR, m=m), 'Light', 10 if SHOW_EN else 13, MUTE if SHOW_EN else SUB)
        nav([[(N('nav_year'), K_YEAR), (N('nav_review'), K_R(m)), (N('nav_project'), K_PIDX)],
             [(N('nav_compass'), K_COMP), (N('nav_prev_month') if m > 1 else '', K_M(m - 1)), (N('nav_next_month') if m < 12 else '', K_M(m + 1))]], right=W - 52)
        gx, gw = 44, W - 88; cwid = gw / 7; gtop = 679.9
        for k in range(7):
            wd = (FIRST_WD + k) % 7
            text(gx + k * cwid + cwid / 2, 691.9, EWD[wd] if SHOW_EN else KWD[wd], 'Med', 7.5 if SHOW_EN else 9, SUNC if wd == 6 else (SATC if wd == 5 else SUB), 1.2 if SHOW_EN else 0, 'c')
        hline(gx, gx + gw, 681.9, DIM2, .9)
        first = dt.date(YEAR, m, 1); off = (first.weekday() - FIRST_WD) % 7; nd = calendar.monthrange(YEAR, m)[1]
        nrows = (off + nd + 6) // 7; rh = 510 / nrows; nl = L['month_cell_lines']
        for r_ in range(nrows):
            for k in range(7):
                dnum = r_ * 7 + k - off + 1; d = first + dt.timedelta(dnum - 1); inm = (d.month == m and d.year == YEAR)
                x = gx + k * cwid; y = gtop - (r_ + 1) * rh
                if inm and (is_red(d) or d.weekday() == 5): rect(x, y, cwid, rh, f=CELL_WE)
                rect(x, y, cwid, rh, s=CELL_BD, lw=.5)
                if inm:
                    text(x + 7, y + rh - 19, str(d.day), 'Reg', 12.5, col_of(d)); go(K_D(d), x, y, cwid, rh)
                    if hol(d) and L['show_holiday_labels']: text(x + cwid - 5, y + rh - 18, hol(d), 'Light', 5.5, SUNC, al='r')
                else: text(x + 7, y + rh - 19, str(d.day), 'Reg', 12.5, CELL_DIM)
                for j in range(nl): hline(x + 6, x + cwid - 6, y + rh - 33 - j * 11, RULE, .4)
        ng = L['monthly_goals']; gh = 106; gp = (gh - 44) / max(ng - 1, 1) if ng > 1 else 0
        cardp(gx, 40, gw / 2 - 8, gh, 'month_goals')
        for j in range(ng): yy = 40 + 14 + (ng - 1 - j) * gp; checkbox(gx + 11, yy); hline(gx + 26, gx + gw / 2 - 19, yy - 1, RULE, .5)
        cardp(gx + gw / 2 + 8, 40, gw / 2 - 8, gh, 'month_memo'); paper(gx + gw / 2 + 19, gx + gw - 11, 108, 52, 20 if NOTES_STYLE == 'lines' else 12)
        text(W / 2, 22, f'{YEAR}  ·  {m:02d}', 'Light', 6.5, DIM2, 2, 'c')
        c.showPage()

        page(K_R(m), f'{m}월 리뷰', level=1)
        header(88, N('review_title', m=m), N('review_sub', year=YEAR, m=m), 26, ty=H - 88 + 34)
        nav([[(N('nav_calendar'), K_M(m)), (N('nav_project'), K_PIDX), (N('nav_compass'), K_COMP)], [(N('nav_year'), K_YEAR), (N('nav_q', q=q_of(m)), K_Q(q_of(m)))]])
        cardp(MX, 489, W - 2 * MX, 214, 'habit')
        nd = calendar.monthrange(YEAR, m)[1]; gx0 = MX + 78; cw_ = (W - MX - 12 - gx0) / 31; hr = L['habit_rows']; hp = (666 - 497) / hr
        for dd in range(1, nd + 1): text(gx0 + (dd - .5) * cw_, 674, str(dd), 'Light', 4.5, MUTE, al='c')
        for r in range(hr):
            yy = 666 - r * hp
            if T['habit_labels_lines']: hline(MX + 12, MX + 70, yy - hp + 4, DIM2, .5)
            for dd in range(nd): rect(gx0 + dd * cw_, yy - hp + 2, cw_, hp - 4, s=CELL_BD, lw=.4)
        cwid2 = (W - 2 * MX - 15) / 2
        for k, (key, y) in enumerate((('0', 266), ('1', 266), ('2', 48), ('3', 48))):
            t, e = LB['review_boxes'][int(key)]; x = MX if k % 2 == 0 else MX + cwid2 + 15
            card(x, y, cwid2, 209, t, e); paper(x + 11, x + cwid2 - 11, y + 209 - 38, y + 12, 18 if NOTES_STYLE == 'lines' else 12)
        c.showPage()

# ════════════════ 8. 주간 ════════════════
if SEC['weekly']:
    for i in range(NWEEKS):
        s = wk_start(i); e = s + dt.timedelta(6)
        page(K_W(i), f'{i+1}주차', level=1)
        header(100, N('week_title', n=i + 1), f'{s.year}. {s.month:02d}. {s.day:02d} – {e.month:02d}. {e.day:02d}', 26, ty=H - 100 + 36)
        mo = s.month if s.year == YEAR else 1
        nav([[(N('nav_year'), K_YEAR), (N('nav_month'), K_M(mo)), (N('nav_project'), K_PIDX)],
             [(N('nav_prev_week') if i > 0 else '', K_W(i - 1)), (N('nav_next_week') if i < NWEEKS - 1 else '', K_W(i + 1))]])
        lw_ = 258; bh = 96; wl = L['week_block_lines']
        for k in range(7):
            d = s + dt.timedelta(k); y = 722 - (k + 1) * bh + 2; inyr = d.year == YEAR
            red = is_red(d) and inyr; sat = d.weekday() == 5
            if red or sat: rect(MX, y, lw_, bh - 2, f=CELL_WE)
            rect(MX, y, 2, bh - 2, f=SUNC if red else (SATC if sat else DIM2)); hline(MX, MX + lw_, y, DIM2, .5)
            nc = col_of(d) if inyr else DIM
            text(MX + 12, y + bh - 22, f'{d.day:02d}', 'Serif', 15, nc); text(MX + 36, y + bh - 21, KWD[d.weekday()], 'Reg', 8, nc)
            if SHOW_EN: text(MX + 52, y + bh - 21, EWD[d.weekday()], 'Light', 5.5, MUTE, 1)
            if hol(d) and inyr and L['show_holiday_labels']: text(MX + lw_ - 8, y + bh - 20, hol(d), 'Light', 6, SUNC, al='r')
            if inyr: go(K_D(d), MX, y, lw_, bh)
            for j in range(wl): hline(MX + 12, MX + lw_ - 8, y + bh - 36 - j * 14, RULE, .5)
        rx = MX + lw_ + 14; rw = W - MX - rx; npri, ntd = L['week_priorities'], L['week_todos']
        cardp(rx, 604, rw, 118, 'week_priorities'); pp = (118 - 40) / npri
        for j in range(npri): yy = 722 - 40 - j * pp; text(rx + 11, yy + 4, f'{j+1}.', 'Light', 6, MUTE); hline(rx + 22, rx + rw - 11, yy, RULE, .5)
        cardp(rx, 240, rw, 350, 'week_todo'); tp = (350 - 50) / ntd
        for j in range(ntd): yy = 590 - 44 - j * tp; checkbox(rx + 11, yy + 2); hline(rx + 26, rx + rw - 11, yy, RULE, .5)
        cardp(rx, 48, rw, 178, 'week_notes'); paper(rx + 11, rx + rw - 11, 172, 62, 21 if NOTES_STYLE == 'lines' else 12)
        text(W / 2, 28, f'{s.year}  ·  WEEK {i+1:02d}' if SHOW_EN else f'{s.year}  ·  {i+1}주차', 'Light', 6.5, DIM2, 2, 'c')
        c.showPage()

# ════════════════ 9. 일간 ════════════════
if SEC['daily']:
    for n, d in enumerate(DAYS):
        page(K_D(d), f'{d.month}/{d.day}', level=1)
        header(104, '', None); nc = col_of(d)
        text(MX, H - 104 + 37, f'{d.day:02d}', 'Serif', 40, nc)
        text(105.5, H - 104 + 52, KWDL[d.weekday()], 'Med', 12, nc)
        if SHOW_EN: text(145.6 + (8 if len(KWDL[d.weekday()]) > 3 else 0), H - 104 + 52, EWD[d.weekday()], 'Light', 7.5, MUTE, 1.4)
        text(105.5, H - 104 + 33, f'{d.year}. {d.month:02d}. {d.day:02d}', 'Light', 9.5, SUB)
        if hol(d): text(105.5, H - 104 + 17, hol(d), 'Light', 7.5, SUNC)
        text(W - MX, H - 104 + 11, f'{n+1} / {len(DAYS)}', 'Light', 7, MUTE, al='r')
        nav([[(N('nav_year'), K_YEAR), (N('nav_month'), K_M(d.month)), (N('nav_week'), K_W((d - wk0).days // 7))],
             [(N('nav_prev') if n > 0 else '', K_D(DAYS[n - 1]) if n > 0 else None), (N('nav_next') if n < len(DAYS) - 1 else '', K_D(DAYS[n + 1]) if n < len(DAYS) - 1 else None)]])
        card(MX, 54, W - 2 * MX, 670)
        gap = L['daily_line_gap']; ytop = 679.9 - L['daily_blank_top']
        paper(72, W - 72, ytop, 70, gap, L['daily_style'])
        text(W / 2, 30, f'{d.year}  ·  {d.month:02d}  ·  {d.day:02d}', 'Light', 6.5, DIM2, 2, 'c')
        c.showPage()

c.save(); print('saved', OUT, '— pages:', c.getPageNumber() - 1, f'· {PW:.0f}x{PH:.0f}pt')
