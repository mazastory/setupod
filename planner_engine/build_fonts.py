# CFF(OTF/TTC) -> TrueType(glyf) 서브셋 변환 (ReportLab은 CFF 폰트를 지원하지 않음)
import re, sys, os
from fontTools.ttLib import TTFont, newTable
from fontTools import subset
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.ttGlyphPen import TTGlyphPen

src = open('make_planner.py', encoding='utf-8').read()
chars = set(chr(c) for c in range(0x20, 0x7f)) | set(re.findall(r'[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]', src))
chars |= set('‹›·–—×✓•○□↑↓←→')
D = '/usr/share/fonts/opentype/noto/'
jobs = {'Light': 'NotoSansCJK-Light.ttc', 'Regular': 'NotoSansCJK-Regular.ttc',
        'Medium': 'NotoSansCJK-Medium.ttc', 'Serif': 'NotoSerifCJK-Bold.ttc'}
os.makedirs('fonts', exist_ok=True)
for name, fn in jobs.items():
    f = TTFont(D + fn, fontNumber=1)  # index 1 = KR
    opt = subset.Options(); opt.layout_features = ['kern']; opt.notdef_outline = True
    opt.name_IDs = ['*']; opt.hinting = False
    s = subset.Subsetter(opt); s.populate(text=''.join(sorted(chars))); s.subset(f)
    gs = f.getGlyphSet(); order = f.getGlyphOrder(); glyf = {}
    for g in order:
        pen = TTGlyphPen(gs); gs[g].draw(Cu2QuPen(pen, 1.0, reverse_direction=True)); glyf[g] = pen.glyph()
    t = newTable('glyf'); t.glyphOrder = order; t.glyphs = glyf; f['glyf'] = t
    f['loca'] = newTable('loca')
    mp = newTable('maxp'); mp.tableVersion = 0x00010000
    for a in ('maxZones','maxTwilightPoints','maxStorage','maxFunctionDefs','maxInstructionDefs','maxStackElements','maxSizeOfInstructions','maxComponentElements'): setattr(mp, a, 0)
    mp.maxZones = 1; mp.maxComponentDepth = 0
    for a in ('maxPoints','maxContours','maxCompositePoints','maxCompositeContours'): setattr(mp, a, 0)
    mp.numGlyphs = len(order); f['maxp'] = mp
    for a in ('CFF ', 'VORG'):
        if a in f: del f[a]
    f['head'].glyphDataFormat = 0; f['head'].indexToLocFormat = 1
    f.sfntVersion = '\x00\x01\x00\x00'
    post = f['post']; post.formatType = 2.0; post.extraNames = []; post.mapping = {}; post.glyphOrder = order
    f.save(f'fonts/{name}.ttf'); print(name, len(order), 'glyphs')
