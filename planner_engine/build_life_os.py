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
YEAR = CFG['year']; L = CFG['layout']; T = CFG['texts']; SEC = CFG['sections']
OUT = args.out or CFG['output'].format(year=YEAR)

# ───────────────────────── 폰트 (CFF → TrueType 서브셋, 캐시) ─────────────────────────
FONT_DIR = os.path.join(HERE, 'fonts')
def ensure_fonts():
    src = open(__file__, encoding='utf-8').read() + CFG_RAW
    chars = set(chr(c) for c in range(0x20, 0x7f)) | set(re.findall(r'[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]', src))
    chars |= set('‹›·–—×✓•○□↑↓←→')
    sig = hashlib.md5(''.join(sorted(chars)).encode()).hexdigest()
    stamp = os.path.join(FONT_DIR, '.charset')
    if (not args.rebuild_fonts and os.path.exists(stamp) and open(stamp).read() == sig
            and all(os.path.exists(os.path.join(FONT_DIR, f'{n}.ttf')) for n in ('Light', 'Regular', 'Medium', 'Serif'))):
        return
    print('폰트 변환 중... (처음 한 번, 또는 문구가 바뀐 경우)')
    from fontTools.ttLib import TTFont as FT, newTable
    from fontTools import subset
    from fontTools.pens.cu2quPen import Cu2QuPen
    from fontTools.pens.ttGlyphPen import TTGlyphPen
    D = CFG['fonts']['noto_dir']
    jobs = {'Light': 'NotoSansCJK-Light.ttc', 'Regular': 'NotoSansCJK-Regular.ttc',
            'Medium': 'NotoSansCJK-Medium.ttc', 'Serif': 'NotoSerifCJK-Bold.ttc'}
    os.makedirs(FONT_DIR, exist_ok=True)
    for name, fn in jobs.items():
        f = FT(os.path.join(D, fn), fontNumber=1)          # 1 = KR
        opt = subset.Options(); opt.layout_features = ['kern']; opt.notdef_outline = True
        opt.name_IDs = ['*']; opt.hinting = False
        s = subset.Subsetter(opt); s.populate(text=''.join(sorted(chars))); s.subset(f)
        gs = f.getGlyphSet(); order = f.getGlyphOrder(); glyf = {}
        for g in order:
            pen = TTGlyphPen(gs); gs[g].draw(Cu2QuPen(pen, 1.0, reverse_direction=True)); glyf[g] = pen.glyph()
        t = newTable('glyf'); t.glyphOrder = order; t.glyphs = glyf; f['glyf'] = t
        f['loca'] = newTable('loca')
        mp = newTable('maxp'); mp.tableVersion = 0x00010000
        for a in ('maxZones', 'maxTwilightPoints', 'maxStorage', 'maxFunctionDefs', 'maxInstructionDefs', 'maxStackElements',
                  'maxSizeOfInstructions', 'maxComponentElements', 'maxPoints', 'maxContours', 'maxCompositePoints',
                  'maxCompositeContours', 'maxComponentDepth'): setattr(mp, a, 0)
        mp.maxZones = 1; mp.numGlyphs = len(order); f['maxp'] = mp
        for a in ('CFF ', 'VORG'):
            if a in f: del f[a]
        f['head'].glyphDataFormat = 0; f['head'].indexToLocFormat = 1; f.sfntVersion = '\x00\x01\x00\x00'
        post = f['post']; post.formatType = 2.0; post.extraNames = []; post.mapping = {}; post.glyphOrder = order
        f.save(os.path.join(FONT_DIR, f'{name}.ttf'))
    open(stamp, 'w').write(sig)
ensure_fonts()

from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
for n, p in (('Light', 'Light'), ('Reg', 'Regular'), ('Med', 'Medium'), ('Serif', 'Serif')):
    pdfmetrics.registerFont(TTFont(n, os.path.join(FONT_DIR, f'{p}.ttf')))

# ───────────────────────── 색상 ─────────────────────────
def C(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
TH = {k: C(v) for k, v in CFG['themes'][CFG['theme']].items()}
BG, HDR, LINE, CARD, CARDLN = TH['bg'], TH['header'], TH['line'], TH['card'], TH['card_line']
TXT, HEAD, MUTE, SUB, DIM, DIM2, RULE = TH['text'], TH['head'], TH['mute'], TH['sub'], TH['dim'], TH['dim2'], TH['rule']
SUNC, SATC = TH['sun'], TH['sat']
CELL_WE, CELL_BD, CELL_DIM, DAILY_LN = TH['cell_weekend'], TH['cell_border'], TH['cell_dim'], TH['daily_line']

W, H = 595.2756, 841.8898
MX = L['margin']; RAD = L['corner_radius']

# ───────────────────────── 날짜 / 공휴일 ─────────────────────────
d0 = dt.date(YEAR, 1, 1)
DAYS = [d0 + dt.timedelta(i) for i in range(366 if calendar.isleap(YEAR) else 365)]
KWD = ['월', '화', '수', '목', '금', '토', '일']
KWDL = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']
EWD = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
MN = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
FIRST_WD = 6 if CFG['week_start'] == 'sun' else 0       # 한 주의 첫 요일 (월=0 … 일=6)

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
            print('※ holidays 라이브러리가 없어 manual 표를 사용합니다 (pip install holidays)')
            hc = dict(hc, mode='manual')
    if hc['mode'] == 'manual':
        for k, v in hc['manual'].items(): res[tuple(map(int, k.split('-')))] = v
    for k, v in hc.get('add', {}).items(): res[tuple(map(int, k.split('-')))] = v
    for k in hc.get('remove', []): res.pop(tuple(map(int, k.split('-'))), None)
    return res
HOLIDAYS = load_holidays()
def hol(d): return HOLIDAYS.get((d.month, d.day)) if d.year == YEAR else None
def is_red(d): return d.weekday() == 6 or hol(d) is not None
def col_of(d): return SUNC if is_red(d) else (SATC if d.weekday() == 5 else TXT)

wk0 = d0 - dt.timedelta((d0.weekday() - FIRST_WD) % 7)        # 1주차 시작일
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
c = canvas.Canvas(OUT, pagesize=(W, H))
c.setTitle(f'{YEAR} Project & Life Planner'); c.setAuthor('Claude')
def fill(col): c.setFillColorRGB(*col)
def stroke(col, w=0.5): c.setStrokeColorRGB(*col); c.setLineWidth(w)
def rect(x, y, w, h, f=None, s=None, r=0, lw=0.6):
    if f: fill(f)
    if s: stroke(s, lw)
    if r: c.roundRect(x, y, w, h, r, stroke=1 if s else 0, fill=1 if f else 0)
    else: c.rect(x, y, w, h, stroke=1 if s else 0, fill=1 if f else 0)
def text(x, y, s, font='Reg', size=9, col=None, sp=0, al='l'):
    col = col or TXT; fill(col); w = pdfmetrics.stringWidth(s, font, size) + sp * len(s)
    if al == 'c': x -= w / 2
    elif al == 'r': x -= w
    t = c.beginText(); t.setFont(font, size); t.setCharSpace(sp); t.setTextOrigin(x, y); t.textOut(s); c.drawText(t)
    return w
def hline(x1, x2, y, col=None, w=0.4): stroke(col or RULE, w); c.line(x1, y, x2, y)
def go(key, x, y, w, h):
    if exists(key): c.linkRect('', key, (x, y, x + w, y + h), relative=0, thickness=0)
def page(key, title=None, level=0):
    c.bookmarkPage(key)
    if title: c.addOutlineEntry(title, key, level=level, closed=True)
    rect(0, 0, W, H, f=BG)
def header(h, title, sub=None, tsize=26, tx=None, ty=None):
    tx = MX if tx is None else tx
    rect(0, H - h, W, h, f=HDR); rect(0, H - h - 3, W, 3, f=LINE)
    ty = ty or H - h + 38
    text(tx, ty, title, 'Serif', tsize, HEAD)
    if sub: text(tx, ty - 17, sub, 'Light', 8.5, MUTE, 1.6)
def nav(rows, right=None, bw=52, pitch=58):
    right = W - MX if right is None else right
    for ri, row in enumerate(rows):
        y = H - 46 - ri * 24
        for ci, (lab, key) in enumerate(reversed(row)):
            if not lab or (key is not None and not exists(key)): continue
            x = right - bw - ci * pitch
            rect(x, y, bw, 15, f=LINE, r=3); text(x + bw / 2, y + 4.8, lab, 'Med', 7.5, TXT, al='c'); go(key, x, y, bw, 15)
def card(x, y, w, h, title=None, en=None):
    rect(x, y, w, h, f=CARD, s=CARDLN, r=RAD, lw=0.7)
    if title: text(x + 11, y + h - 17, title, 'Med', 8.5, TXT)
    if en: text(x + w - 11, y + h - 16.5, en, 'Light', 6, DIM2, 1.2, 'r')
def checkbox(x, y, s=6.5): rect(x, y, s, s, s=DIM2, r=1, lw=0.7)
def writelines(x1, x2, y, n, gap=15):
    for i in range(n): hline(x1, x2, y - i * gap, RULE, 0.5)
def head_sub(title, sub, h=100, size=28): header(h, title, sub, size, ty=H - h + 40)

# ════════════════ 1. 표지 ════════════════
page(K_COVER, '표지')
rect(0, 437.78, W, 404.11, f=HDR); rect(0, 437.78, W, 3, f=LINE)
text(W / 2, 589, str(YEAR), 'Serif', 118, HEAD, al='c')
stroke(DIM2, .8); c.line(245.6, 559.9, 349.6, 559.9)
text(W / 2, 534.6, T['cover_tagline'], 'Light', 10.5, SUB, 3.2, 'c')
text(W / 2, 349.4, T['cover_title'], 'Light', 13, TXT, al='c')
text(W / 2, 319.9, T['cover_subtitle'], 'Light', 9.5, MUTE, al='c')
for i in range(12):
    x = 105.64 + (i % 6) * 66; y = 231.5 - (i // 6) * 28
    rect(x, y, 48, 20, f=LINE, r=3); text(x + 24, y + 6.5, f'{i+1:02d}', 'Med', 9, HEAD, al='c'); go(K_M(i + 1), x, y, 48, 20)
for i, (lab, key) in enumerate((('LIFE COMPASS', K_COMP), ('PROJECTS', K_PIDX), ('연간 달력', K_YEAR))):
    if not exists(key): continue
    x = 105.6 + i * 130.8; y = 168
    rect(x, y, 120, 22, f=LINE, r=3); text(x + 60, y + 7, lab, 'Med', 8.5, TXT, 1.2, 'c'); go(key, x, y, 120, 22)
text(W / 2, 113, T['cover_name_label'], 'Light', 7, DIM2, 2.4, 'c'); hline(223, 372, 99, DIM2, .6)
c.showPage()

# ════════════════ 2. LIFE COMPASS ════════════════
if SEC['compass']:
    page(K_COMP, 'LIFE COMPASS · 연간 목표')
    head_sub('LIFE COMPASS', f'{YEAR} · 한 해의 방향')
    text(W - MX, H - 78, T['compass_hint'], 'Light', 8, MUTE, al='r')
    nav([[('연간', K_YEAR), ('프로젝트', K_PIDX), ('1분기', K_Q(1))]])
    card(MX, 652, W - 2 * MX, 62, '올해의 한 문장', 'THEME OF THE YEAR'); hline(MX + 14, W - MX - 14, 676, DIM2, .6)
    text(MX + 14, 660, T['compass_theme_hint'], 'Light', 6.5, MUTE)
    areas = T['areas']; fields = T['area_fields']; rows = math.ceil(len(areas) / 2)
    cw = (W - 2 * MX - 15) / 2; top, bot = 637, 40 + 66 + 12
    pitch = (top - bot) / rows; ch = pitch - 12
    for i, nm in enumerate(areas):
        x = MX + (i % 2) * (cw + 15); y = top - (i // 2) * pitch - ch
        card(x, y, cw, ch, nm, f'AREA {i+1:02d}')
        fp = (ch - 36) / len(fields)
        for j, lab in enumerate(fields):
            yy = y + ch - 38 - j * fp
            text(x + 11, yy, lab, 'Light', 7, MUTE); writelines(x + 58, x + cw - 11, yy - 3, 2 if j == len(fields) - 1 else 1, 14)
    n = L['not_to_do_items']; nh = 30 + n * 16
    card(MX, 40, W - 2 * MX, nh, '올해 하지 않기로 한 것', 'NOT TO DO LIST')
    for j in range(n): checkbox(MX + 12, 40 + 10 + (n - 1 - j) * 16 + 1); hline(MX + 26, W - MX - 12, 40 + 10 + (n - 1 - j) * 16, DIM2, .5)
    c.showPage()

# ════════════════ 3. 분기 ════════════════
if SEC['quarters']:
    for q in range(1, 5):
        page(K_Q(q), f'Q{q}')
        head_sub(f'Q{q}', f'{YEAR} · {3*q-2}월 – {3*q}월')
        nav([[('컴퍼스', K_COMP), ('프로젝트', K_PIDX), (f'{3*q-2}월', K_M(3 * q - 2))],
             [('‹ 이전' if q > 1 else '', K_Q(q - 1)), ('다음 ›' if q < 4 else '', K_Q(q + 1))]])
        cw1 = 244; card(MX, 540, cw1, 150, '지난 분기 회고', 'LOOK BACK')
        for j, lab in enumerate(('잘된 것', '아쉬운 것', '배운 것')):
            yy = 660 - j * 34; text(MX + 11, yy, lab, 'Light', 7, MUTE); writelines(MX + 60, MX + cw1 - 11, yy - 3, 1)
            hline(MX + 11, MX + cw1 - 11, yy - 18, RULE, .5)
        x2 = MX + cw1 + 14; cw2 = W - MX - x2; card(x2, 540, cw2, 150, '이번 분기 목표 3', 'BIG ROCKS')
        for j in range(3):
            yy = 656 - j * 38; text(x2 + 11, yy - 2, str(j + 1), 'Serif', 12, TXT)
            hline(x2 + 28, x2 + cw2 - 11, yy, DIM2, .5); text(x2 + 28, yy - 12, '측정 기준', 'Light', 6, MUTE); hline(x2 + 70, x2 + cw2 - 11, yy - 14, RULE, .5)
        card(MX, 150, W - 2 * MX, 375, '이번 분기 프로젝트', 'PROJECT TRACKER')
        cols = [MX + 11, MX + 140, MX + 330, MX + 395, MX + 470]
        for lab, x in zip(('프로젝트', '핵심 결과물', '기한', '진행률', '상태'), cols): text(x, 487, lab, 'Light', 6.5, MUTE)
        hline(MX + 8, W - MX - 8, 479, DIM2, .6)
        nr = L['quarter_tracker_rows']; rp = (479 - 162) / nr
        for j in range(nr):
            yy = 479 - (j + 1) * rp; hline(MX + 8, W - MX - 8, yy, RULE, .5); rect(cols[3], yy + rp / 2 - 3, 55, 6, s=DIM2, r=1, lw=.6)
        for x in cols[1:]: stroke(RULE, .4); c.line(x - 6, 479, x - 6, 162)
        card(MX, 46, W - 2 * MX, 90, '분기 마감 회고', 'RETRO'); writelines(MX + 12, W - MX - 12, 92, 3, 18)
        c.showPage()

# ════════════════ 4~5. 프로젝트 ════════════════
NP = L['n_projects']
if SEC['projects']:
    page(K_PIDX, '프로젝트')
    head_sub('PROJECTS', '프로젝트 인덱스')
    text(W - MX, H - 78, '번호를 누르면 해당 프로젝트로 이동합니다', 'Light', 8, MUTE, al='r')
    nav([[('컴퍼스', K_COMP), ('연간', K_YEAR), ('1분기', K_Q(1))]])
    cx = [MX, MX + 58, 333, 413, 487]; top = 700
    for lab, x in zip(('No.', '프로젝트명', '기간', '우선순위', '상태'), (cx[0] + 4, cx[1] + 12, cx[2] + 12, cx[3] + 12, cx[4] + 12)): text(x, top, lab, 'Light', 6.5, MUTE)
    hline(MX, W - MX, top - 8, DIM2, .6)
    nb = L['index_backlog_items']; bh = 30 + nb * 15; rh = (top - 8 - (46 + bh + 14)) / NP
    for i in range(NP):
        yb = top - 8 - (i + 1) * rh; hline(MX, W - MX, yb, RULE, .6)
        rect(MX + 2, yb + rh / 2 - 7, 24, 14, f=LINE, r=3); text(MX + 14, yb + rh / 2 - 2.5, f'{i+1:02d}', 'Med', 7.5, HEAD, al='c'); go(K_P(i + 1, 'o'), MX + 2, yb + rh / 2 - 7, 24, 14)
    for x in cx[1:]: stroke(RULE, .5); c.line(x, top - 8, x, top - 8 - NP * rh)
    card(MX, 46, W - 2 * MX, bh, '연기된 / 대기 목록', 'STANDBY · BACKLOG')
    for j in range(nb): yy = 46 + 12 + (nb - 1 - j) * 15; checkbox(MX + 12, yy); hline(MX + 26, W - MX - 12, yy - 2, RULE, .5)
    c.showPage()

    def pnav(n): nav([[('인덱스', K_PIDX), ('개요', K_P(n, 'o')), ('실행', K_P(n, 'a'))], [('기록', K_P(n, 'l')), ('연간', K_YEAR)]])
    for n in range(1, NP + 1):
        page(K_P(n, 'o'), f'PROJECT {n:02d}', level=1)
        header(88, f'PROJECT {n:02d}', '개요 · 목표 정의', 26, ty=H - 88 + 34); pnav(n)
        card(MX, 637, W - 2 * MX, 55, '프로젝트명', 'PROJECT NAME'); hline(MX + 12, W - MX - 12, 650, DIM2, .6)
        hw = (W - 2 * MX - 15) / 2
        for k, (t, e) in enumerate((('왜 하는가', 'WHY'), ('완료의 정의', 'DEFINITION OF DONE'))):
            x = MX + k * (hw + 15); card(x, 527, hw, 96, t, e); writelines(x + 12, x + hw - 12, 580, 3, 16)
        sw = (W - 2 * MX - 30) / 3
        for k, (t, e) in enumerate((('시작일', 'START'), ('목표 마감', 'DUE'), ('주당 투입', 'HOURS/WK'))):
            x = MX + k * (sw + 15); card(x, 461, sw, 52, t, e); hline(x + 12, x + sw - 12, 473, DIM2, .6)
        nm = L['project_milestones']; card(MX, 132, W - 2 * MX, 315, '마일스톤', 'MILESTONES'); mp = (315 - 50) / nm
        for m in range(nm):
            yy = 447 - 52 - m * mp; checkbox(MX + 12, yy); text(MX + 32, yy + 1, f'M{m+1}', 'Light', 7, MUTE)
            hline(MX + 56, W - MX - 105, yy - 2, DIM2, .5); text(W - MX - 98, yy + 6, '목표일', 'Light', 5.5, MUTE); hline(W - MX - 98, W - MX - 12, yy - 2, DIM2, .5)
        card(MX, 48, W - 2 * MX, 74, '예상 장애물 · 대비책', 'RISKS'); writelines(MX + 12, W - MX - 12, 78, 2, 16)
        c.showPage()

        page(K_P(n, 'a'), f'PROJECT {n:02d} · 실행', level=2)
        header(88, f'PROJECT {n:02d}', '세부 목표 · 실행 과제', 26, ty=H - 88 + 34); pnav(n)
        ns, nt = L['project_subgoals'], L['project_subgoal_tasks']; reg_top, reg_bot = 702, 50; sp = (reg_top - reg_bot) / ns; sh = sp - 10
        for s in range(ns):
            y = reg_top - (s + 1) * sp + 10
            card(MX, y, W - 2 * MX, sh, f'세부 목표 {s+1}', 'SUB-GOAL')
            hline(MX + 76, W - MX - 130, y + sh - 19, DIM2, .5); text(W - MX - 118, y + sh - 17, '마감', 'Light', 6, MUTE); hline(W - MX - 98, W - MX - 74, y + sh - 19, DIM2, .5)
            tp = (sh - 50) / nt
            for r in range(nt): yy = y + sh - 46 - r * tp; checkbox(MX + 12, yy); hline(MX + 28, W - MX - 12, yy - 2, RULE, .6)
        c.showPage()

        page(K_P(n, 'l'), f'PROJECT {n:02d} · 기록', level=2)
        header(88, f'PROJECT {n:02d}', '진행 기록 · 피드백', 26, ty=H - 88 + 34); pnav(n)
        card(MX, 646, W - 2 * MX, 56, '전체 진행률', 'PROGRESS')
        bx, bw_ = MX + 12, W - 2 * MX - 24; rect(bx, 662, bw_, 14, s=DIM2, r=1, lw=.7)
        for k in range(11): x = bx + bw_ * k / 10; stroke(RULE, .4); c.line(x, 662, x, 676); text(x, 651, str(k * 10), 'Light', 5, MUTE, al='c')
        card(MX, 48, W - 2 * MX, 584, '진행 로그', 'LOG · FEEDBACK')
        lc = [MX + 12, MX + 80, MX + 328]
        for lab, x in zip(('날짜', '한 일 · 진행 상황', '피드백 · 다음 액션'), lc): text(x, 596, lab, 'Light', 6, MUTE)
        hline(MX + 8, W - MX - 8, 588, DIM2, .6); lr = L['project_log_rows']; lp = (588 - 62) / lr
        for r in range(lr): hline(MX + 8, W - MX - 8, 588 - (r + 1) * lp, RULE, .5)
        for x in lc[1:]: stroke(RULE, .4); c.line(x - 8, 588, x - 8, 62)
        c.showPage()

# ════════════════ 6. 연간 달력 ════════════════
if SEC['annual']:
    page(K_YEAR, f'{YEAR} 연간 달력')
    header(100, str(YEAR), 'YEARLY  OVERVIEW', 36, ty=H - 100 + 36)
    nav([[('컴퍼스', K_COMP), ('프로젝트', K_PIDX), ('Q1', K_Q(1))], [('Q2', K_Q(2)), ('Q3', K_Q(3)), ('Q4', K_Q(4))]])
    if SEC['daily']: text(W - MX, H - 118, '날짜를 누르면 일간 노트로 이동합니다', 'Light', 6.5, MUTE, al='r')
    bwid = 144; bx0 = [MX + 2, MX + 174, MX + 346]
    for m in range(1, 13):
        bx = bx0[(m - 1) % 3]; by = H - 150 - ((m - 1) // 3) * 168
        text(bx, by, f'{m:02d}', 'Serif', 15, HEAD); text(bx + 25, by + 1, MN[m - 1], 'Light', 6, MUTE, 1.2); go(K_M(m), bx, by - 2, 60, 14)
        cwid = bwid / 7
        for k in range(7): text(bx + k * cwid + cwid / 2, by - 18, KWD[k], 'Light', 6, SUNC if k == 6 else (SATC if k == 5 else MUTE), al='c')
        hline(bx, bx + bwid, by - 22, DIM2, .6); off = dt.date(YEAR, m, 1).weekday()
        for dd in range(1, calendar.monthrange(YEAR, m)[1] + 1):
            d = dt.date(YEAR, m, dd); idx = off + dd - 1; r_, k = idx // 7, idx % 7
            x = bx + k * cwid + cwid / 2; y = by - 36 - r_ * 13.8
            text(x, y, str(dd), 'Reg', 7, col_of(d), al='c'); go(K_D(d), x - cwid / 2 + 1, y - 3, cwid - 2, 11)
    c.showPage()

# ════════════════ 7. 월간 + 리뷰 ════════════════
SUNFIRST = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
if SEC['monthly']:
    for m in range(1, 13):
        page(K_M(m), f'{m}월 달력', level=1)
        header(118, f'{m:02d}', None, 52, tx=52, ty=H - 118 + 41)
        text(118, H - 118 + 57, MN[m - 1], 'Light', 11, SUB, 3); text(118, H - 118 + 39, f'{YEAR}년 {m}월', 'Light', 10, MUTE)
        nav([[('연간', K_YEAR), ('리뷰', K_R(m)), ('프로젝트', K_PIDX)],
             [('컴퍼스', K_COMP), ('‹ 이전달' if m > 1 else '', K_M(m - 1)), ('다음달 ›' if m < 12 else '', K_M(m + 1))]], right=W - 52)
        gx, gw = 44, W - 88; cwid = gw / 7; gtop = 679.9
        for k in range(7):
            wd = (FIRST_WD + k) % 7
            text(gx + k * cwid + cwid / 2, 691.9, EWD[wd], 'Med', 7.5, SUNC if wd == 6 else (SATC if wd == 5 else SUB), 1.2, 'c')
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
        card(gx, 40, gw / 2 - 8, gh, '이달의 목표', 'MONTHLY GOALS')
        for j in range(ng): yy = 40 + 14 + (ng - 1 - j) * gp; checkbox(gx + 11, yy); hline(gx + 26, gx + gw / 2 - 19, yy - 1, RULE, .5)
        card(gx + gw / 2 + 8, 40, gw / 2 - 8, gh, '메모', 'NOTES'); writelines(gx + gw / 2 + 19, gx + gw - 11, 108, 4, 20)
        text(W / 2, 22, f'{YEAR}  ·  {m:02d}', 'Light', 6.5, DIM2, 2, 'c')
        c.showPage()

        page(K_R(m), f'{m}월 리뷰', level=1)
        header(88, f'{m:02d} REVIEW', f'{YEAR}년 {m}월 · 습관과 회고', 26, ty=H - 88 + 34)
        nav([[('달력', K_M(m)), ('프로젝트', K_PIDX), ('컴퍼스', K_COMP)], [('연간', K_YEAR), (f'Q{q_of(m)}', K_Q(q_of(m)))]])
        card(MX, 489, W - 2 * MX, 214, '습관 트래커', 'HABIT TRACKER')
        nd = calendar.monthrange(YEAR, m)[1]; gx0 = MX + 78; cw_ = (W - MX - 12 - gx0) / 31; hr = L['habit_rows']; hp = (666 - 497) / hr
        for dd in range(1, nd + 1): text(gx0 + (dd - .5) * cw_, 674, str(dd), 'Light', 4.5, MUTE, al='c')
        for r in range(hr):
            yy = 666 - r * hp
            if T['habit_labels_lines']: hline(MX + 12, MX + 70, yy - hp + 4, DIM2, .5)
            for dd in range(nd): rect(gx0 + dd * cw_, yy - hp + 2, cw_, hp - 4, s=CELL_BD, lw=.4)
        cwid2 = (W - 2 * MX - 15) / 2
        for k, (t, e, y) in enumerate((('잘된 것', 'KEEP', 266), ('아쉬운 것', 'PROBLEM', 266), ('배운 것', 'LEARNED', 48), ('다음 달에 바꿀 것', 'TRY', 48))):
            x = MX if k % 2 == 0 else MX + cwid2 + 15
            card(x, y, cwid2, 209, t, e); writelines(x + 11, x + cwid2 - 11, y + 209 - 38, 9, 18)
        c.showPage()

# ════════════════ 8. 주간 ════════════════
if SEC['weekly']:
    for i in range(NWEEKS):
        s = wk_start(i); e = s + dt.timedelta(6)
        page(K_W(i), f'{i+1}주차', level=1)
        header(100, f'WEEK {i+1:02d}', f'{s.year}. {s.month:02d}. {s.day:02d} – {e.month:02d}. {e.day:02d}', 26, ty=H - 100 + 36)
        mo = s.month if s.year == YEAR else 1
        nav([[('연간', K_YEAR), ('월간', K_M(mo)), ('프로젝트', K_PIDX)],
             [('‹ 이전주' if i > 0 else '', K_W(i - 1)), ('다음주 ›' if i < NWEEKS - 1 else '', K_W(i + 1))]])
        lw_ = 258; bh = 96
        for k in range(7):
            d = s + dt.timedelta(k); y = 722 - (k + 1) * bh + 2; inyr = d.year == YEAR
            red = is_red(d) and inyr; sat = d.weekday() == 5
            if red or sat: rect(MX, y, lw_, bh - 2, f=CELL_WE)
            rect(MX, y, 2, bh - 2, f=SUNC if red else (SATC if sat else DIM2)); hline(MX, MX + lw_, y, DIM2, .5)
            nc = col_of(d) if inyr else DIM
            text(MX + 12, y + bh - 22, f'{d.day:02d}', 'Serif', 15, nc); text(MX + 36, y + bh - 21, KWD[d.weekday()], 'Reg', 8, nc)
            text(MX + 52, y + bh - 21, EWD[d.weekday()], 'Light', 5.5, MUTE, 1)
            if hol(d) and inyr and L['show_holiday_labels']: text(MX + lw_ - 8, y + bh - 20, hol(d), 'Light', 6, SUNC, al='r')
            if inyr: go(K_D(d), MX, y, lw_, bh)
            for j in range(3): hline(MX + 12, MX + lw_ - 8, y + bh - 36 - j * 14, RULE, .5)
        rx = MX + lw_ + 14; rw = W - MX - rx; npri, ntd = L['week_priorities'], L['week_todos']
        card(rx, 604, rw, 118, '이번 주 핵심', 'TOP PRIORITIES'); pp = (118 - 40) / npri
        for j in range(npri): yy = 722 - 40 - j * pp; text(rx + 11, yy + 4, f'{j+1}.', 'Light', 6, MUTE); hline(rx + 22, rx + rw - 11, yy, RULE, .5)
        card(rx, 240, rw, 350, '할 일', 'TO DO'); tp = (350 - 50) / ntd
        for j in range(ntd): yy = 590 - 44 - j * tp; checkbox(rx + 11, yy + 2); hline(rx + 26, rx + rw - 11, yy, RULE, .5)
        card(rx, 48, rw, 178, '메모 · 회고', 'NOTES'); writelines(rx + 11, rx + rw - 11, 172, 7, 21)
        text(W / 2, 28, f'{s.year}  ·  WEEK {i+1:02d}', 'Light', 6.5, DIM2, 2, 'c')
        c.showPage()

# ════════════════ 9. 일간 ════════════════
if SEC['daily']:
    for n, d in enumerate(DAYS):
        page(K_D(d), f'{d.month}/{d.day}', level=1)
        header(104, '', None); nc = col_of(d)
        text(MX, H - 104 + 37, f'{d.day:02d}', 'Serif', 40, nc)
        text(105.5, H - 104 + 52, KWDL[d.weekday()], 'Med', 12, nc)
        text(145.6 + (8 if len(KWDL[d.weekday()]) > 3 else 0), H - 104 + 52, EWD[d.weekday()], 'Light', 7.5, MUTE, 1.4)
        text(105.5, H - 104 + 33, f'{d.year}. {d.month:02d}. {d.day:02d}', 'Light', 9.5, SUB)
        if hol(d): text(105.5, H - 104 + 17, hol(d), 'Light', 7.5, SUNC)
        text(W - MX, H - 104 + 11, f'{n+1} / {len(DAYS)}', 'Light', 7, MUTE, al='r')
        nav([[('연간', K_YEAR), ('월간', K_M(d.month)), ('주간', K_W((d - wk0).days // 7))],
             [('‹ 이전' if n > 0 else '', K_D(DAYS[n - 1]) if n > 0 else None), ('다음 ›' if n < len(DAYS) - 1 else '', K_D(DAYS[n + 1]) if n < len(DAYS) - 1 else None)]])
        card(MX, 54, W - 2 * MX, 670)
        y = 679.9
        while y > 70: hline(72, W - 72, y, DAILY_LN, .55); y -= L['daily_line_gap']
        text(W / 2, 30, f'{d.year}  ·  {d.month:02d}  ·  {d.day:02d}', 'Light', 6.5, DIM2, 2, 'c')
        c.showPage()

c.save(); print('saved', OUT, '— pages:', c.getPageNumber() - 1)
