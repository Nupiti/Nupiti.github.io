# -*- coding: utf-8 -*-
"""
Builds files/CV_Sumith_Abeykoon.pdf from the website's own data files, so the CV
always says what the site says.

    career        data/career.json
    publications  data/publications.json
    beamtimes     data/beamtimes.json
    grants        data/research-notes.json  (entries tagged "Grant")
    everything else (summary, skills, prizes, conferences...)  data/cv.json

Run:  python tools/make-cv.py     (or double-click make-cv.bat)
Needs the 'reportlab' package:  pip install reportlab
"""
import json, os, sys, datetime

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.enums import TA_LEFT
    from reportlab.lib import colors
    from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                    KeepTogether, HRFlowable)
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
except ImportError:
    print("The 'reportlab' package is missing.  Run:  pip install reportlab")
    sys.exit(1)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def load(p):
    with open(os.path.join(ROOT, p), encoding='utf-8') as f:
        return json.load(f)

cv   = load('data/cv.json')
car  = load('data/career.json')['positions']
pubs = load('data/publications.json')['papers']
beam = load('data/beamtimes.json')['campaigns']
notes = load('data/research-notes.json')['notes']
OUT = os.path.join(ROOT, 'files', 'CV_Sumith_Abeykoon.pdf')

# ---- fonts: use a Unicode TrueType font if one is around (for – ’ ₃ etc.) ----
BASE, BOLD, ITAL = 'Helvetica', 'Helvetica-Bold', 'Helvetica-Oblique'
cands = [
    ('C:/Windows/Fonts/georgia.ttf', 'C:/Windows/Fonts/georgiab.ttf', 'C:/Windows/Fonts/georgiai.ttf'),
    ('/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf'),
    ('/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf', '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf', '/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf'),
]
for r, b, i in cands:
    if os.path.exists(r) and os.path.exists(b) and os.path.exists(i):
        pdfmetrics.registerFont(TTFont('CVr', r)); pdfmetrics.registerFont(TTFont('CVb', b)); pdfmetrics.registerFont(TTFont('CVi', i))
        BASE, BOLD, ITAL = 'CVr', 'CVb', 'CVi'
        break

INK = colors.HexColor('#1a1612'); QUIET = colors.HexColor('#5c5248'); RULE = colors.HexColor('#c9bfb3'); EMBER = colors.HexColor('#b4471e')
S = {
  'name': ParagraphStyle('name', fontName=BOLD, fontSize=20, leading=24, textColor=INK, spaceAfter=2),
  'head': ParagraphStyle('head', fontName=BASE, fontSize=10.5, leading=14, textColor=QUIET),
  'h2':   ParagraphStyle('h2', fontName=BOLD, fontSize=11.5, leading=14, textColor=EMBER, spaceBefore=9, spaceAfter=3),
  'body': ParagraphStyle('body', fontName=BASE, fontSize=9.6, leading=13, textColor=INK),
  'small':ParagraphStyle('small', fontName=BASE, fontSize=8.8, leading=12, textColor=QUIET),
  'when': ParagraphStyle('when', fontName=BASE, fontSize=9, leading=13, textColor=QUIET),
  'bul':  ParagraphStyle('bul', fontName=BASE, fontSize=9.6, leading=13, textColor=INK, leftIndent=9, bulletIndent=0),
}
def P(t, st='body'): return Paragraph(t, S[st])
def esc(t): return (t or '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
def rule(): return HRFlowable(width='100%', thickness=0.6, color=RULE, spaceBefore=2, spaceAfter=4)

def rows_table(rows, wcol=30*mm):
    t = Table(rows, colWidths=[wcol, None])
    t.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('LEFTPADDING', (0,0), (-1,-1), 0),
                           ('RIGHTPADDING', (0,0), (-1,-1), 6), ('TOPPADDING', (0,0), (-1,-1), 1.5), ('BOTTOMPADDING', (0,0), (-1,-1), 1.5)]))
    return t

story = []
c = cv['contact']
story.append(P(esc(cv['name']), 'name'))
story.append(P(esc(cv['headline']), 'head'))
LINK = "<link href='%s'><font color='#1a5fb4'><u>%s</u></font></link>"
story.append(P(esc(c['affiliation']), 'head'))
story.append(P((LINK % ('mailto:' + c['email'], esc(c['email']))) + ' · ' + (LINK % (c['web_url'], esc(c['web']))) + ' · ORCID ' + (LINK % (c['orcid_url'], esc(c['orcid']))), 'head'))
story.append(Spacer(1, 4)); story.append(rule())
story.append(P(esc(cv['summary'])))

# ---- key competencies
story.append(P('Key competencies', 'h2')); story.append(rule())
for k in cv['competencies']: story.append(Paragraph(esc(k), S['bul'], bulletText='•'))

# ---- career & education (from career.json)
story.append(P('Education and professional experience', 'h2')); story.append(rule())
rows = []
skip = set(cv.get('skip_positions', []))
for p in car:
    if p['role'] in skip: continue
    txt = f"<b>{esc(p['role'])}</b>, {esc(p['where'])}"
    note = cv.get('education_notes', {}).get(p['when']) or p.get('note', '')
    if note: txt += f"<br/><font color='#5c5248' size='8.8'>{esc(note)}</font>"
    rows.append([P(esc(p['when']), 'when'), P(txt)])
story.append(rows_table(rows))

# ---- prizes
if cv.get('prizes'):
    story.append(P('Prizes', 'h2')); story.append(rule())
    for k in cv['prizes']: story.append(Paragraph(esc(k), S['bul'], bulletText='•'))

# ---- grants (from research-notes.json)
grants = [n for n in notes if n.get('tag') == 'Grant']
if grants:
    story.append(P('Grants and awarded proposals', 'h2')); story.append(rule())
    rows = [[P(esc(n.get('date', '')), 'when'), P(esc(n['title']))] for n in grants]
    story.append(rows_table(rows))

# ---- skills, technical, supervision
story.append(P('Technical skills', 'h2')); story.append(rule())
rows = [[P(f"<b>{esc(k)}</b>", 'body'), P(esc(v))] for k, v in cv['skills'].items()]
story.append(rows_table(rows))
story.append(P('Laboratory and instrument experience', 'h2')); story.append(rule())
for k in cv['technical']: story.append(Paragraph(esc(k), S['bul'], bulletText='•'))

# ---- beamtimes (from beamtimes.json)
story.append(P('Synchrotron and neutron campaigns', 'h2')); story.append(rule())
rows = [[P(esc(b['when']), 'when'), P(f"<b>{esc(b['facility'])}</b> — {esc(b['what'])}" + (f" <font color='#5c5248'>({esc(b['code'])})</font>" if b.get('code') else ''))] for b in beam]
story.append(rows_table(rows))

story.append(P('Student supervision', 'h2')); story.append(rule())
for k in cv['supervision']: story.append(Paragraph(esc(k), S['bul'], bulletText='•'))

# ---- publications (from publications.json), newest first, own name in bold
story.append(P('Publications', 'h2')); story.append(rule())
pubs_sorted = sorted(pubs, key=lambda x: -int(x.get('year', 0)))
rows, last = [], None
for p in pubs_sorted:
    auth = esc(p['authors']).replace('S. Abeykoon', '<b>S. Abeykoon</b>').replace('S. Abekoon', '<b>S. Abekoon</b>')
    doi = f" <font color='#5c5248'>doi:{esc(p['doi'])}</font>" if p.get('doi') else ''
    yr = str(p['year'])
    rows.append([P(yr if yr != last else '', 'when'), P(f"{auth}. {esc(p['title'])}. <i>{esc(p['journal'])}</i>.{doi}")])
    last = yr
story.append(rows_table(rows, wcol=14*mm))

# ---- conferences
story.append(P('Selected conferences, talks and training', 'h2')); story.append(rule())
for k in cv['conferences']: story.append(Paragraph(esc(k), S['bul'], bulletText='•'))

story.append(Spacer(1, 8))
story.append(P(f"Generated from sumithabeykoon.com, {datetime.date.today():%B %Y}.", 'small'))

def footer(canvas, doc):
    canvas.saveState(); canvas.setFont(BASE, 8); canvas.setFillColor(QUIET)
    canvas.drawRightString(A4[0] - 18*mm, 12*mm, f"Sumith Abeykoon — CV — page {doc.page}")
    canvas.restoreState()

# keep each section heading with its first entry, so no heading is stranded at a page foot
packed, i = [], 0
while i < len(story):
    f = story[i]
    if isinstance(f, Paragraph) and f.style is S['h2'] and i + 2 < len(story):
        packed.append(KeepTogether(story[i:i+3])); i += 3
    else:
        packed.append(f); i += 1
story = packed

os.makedirs(os.path.dirname(OUT), exist_ok=True)
doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=16*mm, bottomMargin=18*mm,
                        title='Sumith Abeykoon — CV', author='Sumith Abeykoon')
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print('Wrote', OUT)
