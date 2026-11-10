"""Render the six-panel storyboard preview without requiring Chrome or FFmpeg."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from math import sin, cos, pi
from pathlib import Path

OUT = Path(__file__).parent / "storyboard.png"
W, H = 1080, 2860
BG = (2, 3, 6)
WHITE = (233, 234, 240)
DIM = (146, 151, 168)
VIOLET = (157, 131, 255)
RED = (255, 88, 100)
GREEN = (110, 237, 179)
SURF = (24, 28, 40)
SURF2 = (34, 39, 53)
FONT_DIR = Path("/usr/share/fonts/truetype/dejavu")

def f(size, bold=False, mono=False):
    name = ("DejaVuSansMono-Bold.ttf" if mono and bold else
            "DejaVuSansMono.ttf" if mono else
            "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf")
    return ImageFont.truetype(FONT_DIR / name, size)

def text(draw, xy, s, size=22, color=WHITE, bold=False, mono=False, anchor=None):
    draw.text(xy, s, font=f(size, bold, mono), fill=color, anchor=anchor)

def rr(draw, box, r, fill, outline=None, width=1):
    draw.rounded_rectangle(box, r, fill=fill, outline=outline, width=width)

def glow(img, center, radius, color, alpha=80):
    layer = Image.new("RGBA", img.size, (0,0,0,0))
    d = ImageDraw.Draw(layer)
    x, y = center
    for i in range(radius, 0, -8):
        a = int(alpha * (1 - i / radius) ** 2)
        d.ellipse((x-i, y-i, x+i, y+i), fill=(*color, a))
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(18)))

def grid(draw, x, y, w, h):
    for xx in range(x+18, x+w-10, 48): draw.line((xx,y+18,xx,y+h-18), fill=(233,234,240,10), width=1)
    for yy in range(y+18, y+h-10, 48): draw.line((x+18,yy,x+w-18,yy), fill=(233,234,240,10), width=1)

def panel(img, ox, oy, title, time):
    d = ImageDraw.Draw(img, "RGBA")
    rr(d, (ox,oy,ox+480,oy+880), 24, (10,12,18,255), (233,234,240,36), 2)
    # subtle top radial lift
    glow(img, (ox+365, oy+178), 230, VIOLET, 42)
    grid(d, ox, oy, 480, 880)
    text(d, (ox+32,oy+48), f"{time}  ·  {title}", 16, DIM, mono=True)
    d.line((ox+28,oy+814,ox+452,oy+814), fill=(233,234,240,30), width=1)
    return d

def iso_box(d, x, y, w, h, top, left, right):
    # little portrait-friendly isometric block
    d.polygon([(x,y),(x+w,y-18),(x+w+48,y+4),(x+48,y+22)], fill=top)
    d.polygon([(x,y),(x+48,y+22),(x+48,y+h+22),(x,y+h)], fill=left)
    d.polygon([(x+48,y+22),(x+w+48,y+4),(x+w+48,y+h+4),(x+48,y+h+22)], fill=right)

def phone(d, x, y, s=1):
    w,h=244*s,440*s
    rr(d,(x,y,x+w,y+h),30*s,(27,31,44,255),(233,234,240,90),2)
    rr(d,(x+14*s,y+38*s,x+w-14*s,y+396*s),17*s,(8,11,17,255),(233,234,240,28),1)
    d.rounded_rectangle((x+91*s,y+14*s,x+153*s,y+22*s),4*s,fill=(47,52,66,255))
    text(d,(x+34*s,y+88*s),"CHECKOUT",13*s,DIM,mono=True)
    text(d,(x+34*s,y+172*s),"₹2,000",37*s,WHITE,bold=True)
    text(d,(x+34*s,y+206*s),"one logical payment",12*s,DIM)
    rr(d,(x+30*s,y+250*s,x+214*s,y+314*s),15*s,VIOLET)
    text(d,(x+122*s,y+290*s),"PAY",18*s,(8,9,13),bold=True,anchor="mm")

def db(d,x,y,w=168,h=238, key=None, state=None, accent=VIOLET):
    d.ellipse((x,y,x+w,y+44),fill=(49,56,74),outline=(233,234,240,58),width=2)
    d.rectangle((x,y+22,x+w,y+h-22),fill=(17,20,29),outline=(233,234,240,58),width=2)
    d.ellipse((x,y+h-44,x+w,y+h),fill=(15,18,25),outline=(233,234,240,58),width=2)
    if key:
        rr(d,(x+18,y+70,x+w-18,y+151),10,(accent[0],accent[1],accent[2],35),accent,2)
        text(d,(x+w/2,y+96),key,13,accent,mono=True,anchor="mm")
        text(d,(x+w/2,y+128),state or "",13,accent,mono=True,anchor="mm")

def packet(d,x,y,label="REQ",color=VIOLET):
    rr(d,(x,y,x+76,y+34),9,color)
    text(d,(x+38,y+22),label,11,(8,9,13),mono=True,anchor="mm")

def caption(d, x, y, w, s, accent=VIOLET):
    rr(d,(x,y,x+w,y+52),14,(8,10,15,230),(233,234,240,48),1)
    d.ellipse((x+17,y+19,x+25,y+27),fill=accent)
    text(d,(x+38,y+26),s,14,WHITE,anchor="lm")

def frame1(img, ox, oy):
    d=panel(img,ox,oy,"THE HOOK","01 · 00:00—00:08")
    phone(d,ox+118,oy+180)
    for dy in (0,28):
        d.arc((ox+330,oy+452+dy,ox+392,oy+515+dy),300,80,fill=VIOLET,width=4)
    d.line((ox+330,oy+525,ox+400,oy+604),fill=VIOLET,width=4)
    d.line((ox+344,oy+545,ox+405,oy+625),fill=VIOLET,width=4)
    packet(d,ox+286,oy+675); packet(d,ox+286,oy+732)
    text(d,(ox+32,oy+795),"DOUBLE CHARGE?",30,RED,bold=True)

def frame2(img, ox, oy):
    d=panel(img,ox,oy,"THE PROBLEM","02 · 00:08—00:17")
    packet(d,ox+36,oy+196,"REQ 01"); packet(d,ox+36,oy+268,"REQ 02")
    d.line((ox+112,oy+212,ox+240,oy+280),fill=VIOLET,width=5)
    d.line((ox+112,oy+284,ox+240,oy+330),fill=VIOLET,width=5)
    iso_box(d,ox+220,oy+208,164,280,(44,50,66),(23,26,37),(34,39,53))
    text(d,(ox+284,oy+257),"PAYMENT",13,WHITE,mono=True,anchor="mm"); text(d,(ox+284,oy+282),"SERVER",13,WHITE,mono=True,anchor="mm")
    rr(d,(ox+280,oy+313,ox+394,oy+361),9,(255,88,100,40),RED,1); text(d,(ox+337,oy+342),"CHARGE",12,RED,mono=True,anchor="mm")
    rr(d,(ox+280,oy+385,ox+394,oy+433),9,(255,88,100,40),RED,1); text(d,(ox+337,oy+414),"CHARGE",12,RED,mono=True,anchor="mm")
    for yy,tx in ((oy+570,"TXN_8F2A"),(oy+656,"TXN_91C0")):
        rr(d,(ox+94,yy,ox+380,yy+70),12,(21,25,35,255),RED,1); text(d,(ox+114,yy+30),tx,13,DIM,mono=True); text(d,(ox+114,yy+54),"₹2,000 · CAPTURED",13,RED,mono=True)
    d.rectangle((ox+80,oy+548,ox+398,oy+752),outline=RED,width=2)
    text(d,(ox+32,oy+800),"TWICE PROCESSED",28,RED,bold=True)

def frame3(img, ox, oy):
    d=panel(img,ox,oy,"THE SOLUTION","03 · 00:17—00:30")
    d.ellipse((ox+76,oy+205,ox+132,oy+261),outline=VIOLET,width=8); d.line((ox+130,oy+233,ox+360,oy+233),fill=VIOLET,width=11)
    d.line((ox+270,oy+233,ox+270,oy+263),fill=VIOLET,width=10); d.line((ox+315,oy+233,ox+315,oy+263),fill=VIOLET,width=10)
    text(d,(ox+72,oy+300),"pay_123",31,VIOLET,mono=True,bold=True)
    packet(d,ox+32,oy+390,"REQ + KEY",SURF2); packet(d,ox+32,oy+466,"RETRY + KEY",SURF2)
    d.line((ox+108,oy+407,ox+240,oy+470),fill=VIOLET,width=4); d.line((ox+108,oy+483,ox+240,oy+520),fill=VIOLET,width=4)
    db(d,ox+236,oy+386,184,205,"pay_123","PROCESSING")
    text(d,(ox+32,oy+700),"ATOMIC RESERVATION",14,DIM,mono=True); text(d,(ox+32,oy+736),"one owner token, not a read-then-write",15,WHITE)
    rr(d,(ox+32,oy+776,ox+382,oy+826),12,(157,131,255,31),VIOLET,1); text(d,(ox+207,oy+809),"UNIQUE(key) → ONE OWNER",12,VIOLET,mono=True,anchor="mm")

def frame4(img, ox, oy):
    d=panel(img,ox,oy,"SAFE RETRY","04 · 00:30—00:43")
    rr(d,(ox+48,oy+190,ox+212,oy+414),18,SURF2,(233,234,240,45),1); text(d,(ox+130,oy+234),"SERVER",13,WHITE,mono=True,anchor="mm")
    rr(d,(ox+74,oy+266,ox+186,oy+322),10,(157,131,255,30),VIOLET,1); text(d,(ox+130,oy+298),"pay_123",12,VIOLET,mono=True,anchor="mm")
    d.ellipse((ox+112,oy+348,ox+148,oy+384),fill=GREEN); d.line((ox+120,oy+365,ox+128,oy+373),fill=(7,16,13),width=4); d.line((ox+128,oy+373,ox+141,oy+358),fill=(7,16,13),width=4)
    db(d,ox+278,oy+190,160,248,"COMPLETED","RESULT: OK",GREEN)
    d.line((ox+212,oy+304,ox+278,oy+304),fill=GREEN,width=6)
    d.arc((ox+144,oy+394,ox+414,oy+570),190,340,fill=GREEN,width=4)
    rr(d,(ox+64,oy+520,ox+414,oy+604),14,(21,25,35,255),GREEN,1); text(d,(ox+239,oy+554),"SAVED RESULT",13,GREEN,mono=True,anchor="mm"); text(d,(ox+239,oy+580),"₹2,000 · SUCCESS",13,WHITE,mono=True,anchor="mm")
    text(d,(ox+32,oy+690),"ONE PAYMENT",29,GREEN,bold=True); text(d,(ox+32,oy+738),"TWO RESPONSES",29,WHITE,bold=True); text(d,(ox+32,oy+800),"retry never re-executes the charge",13,DIM,mono=True)

def frame5(img, ox, oy):
    d=panel(img,ox,oy,"THE RACE","05 · 00:43—00:53")
    packet(d,ox+34,oy+206,"REQ A",SURF2); packet(d,ox+34,oy+302,"REQ B",SURF2)
    d.line((ox+110,oy+222,ox+254,oy+316),fill=VIOLET,width=5); d.line((ox+110,oy+318,ox+254,oy+316),fill=VIOLET,width=5)
    db(d,ox+248,oy+214,172,268,"pay_123","OWNER: A")
    d.line((ox+334,oy+456,ox+414,oy+570),fill=RED,width=5)
    rr(d,(ox+248,oy+560,ox+440,oy+626),11,(255,88,100,35),RED,1); text(d,(ox+344,oy+588),"UNIQUE(key)",12,RED,mono=True,anchor="mm"); text(d,(ox+344,oy+612),"ALREADY EXISTS",12,RED,mono=True,anchor="mm")
    rr(d,(ox+44,oy+692,ox+436,oy+754),12,SURF2,VIOLET,1); text(d,(ox+240,oy+731),"B → IN_PROGRESS / WAIT",13,VIOLET,mono=True,anchor="mm")
    text(d,(ox+32,oy+802),"no fabricated green result",15,WHITE)

def frame6(img, ox, oy):
    d=panel(img,ox,oy,"THE TAKEAWAY","06 · 00:53—01:00")
    d.line((ox+70,oy+270,ox+248,oy+390),fill=VIOLET,width=6); d.line((ox+70,oy+350,ox+248,oy+390),fill=VIOLET,width=6)
    d.ellipse((ox+56,oy+256,ox+84,oy+284),fill=VIOLET); d.ellipse((ox+56,oy+336,ox+84,oy+364),fill=VIOLET)
    d.ellipse((ox+192,oy+334,ox+304,oy+446),fill=(110,237,179,45),outline=GREEN,width=4); d.line((ox+223,oy+390,ox+241,oy+408),fill=GREEN,width=8); d.line((ox+241,oy+408,ox+278,oy+364),fill=GREEN,width=8)
    text(d,(ox+316,oy+383),"ONE PAYMENT",13,GREEN,mono=True); text(d,(ox+316,oy+412),"many safe responses",13,DIM,mono=True)
    text(d,(ox+32,oy+550),"SAFE RETRIES.",28,VIOLET,bold=True); text(d,(ox+32,oy+604),"NO DUPLICATE",28,WHITE,bold=True); text(d,(ox+32,oy+658),"EXECUTION.",28,WHITE,bold=True)
    rr(d,(ox+32,oy+710,ox+448,oy+802),14,(21,25,35,255),(233,234,240,45),1); text(d,(ox+52,oy+742),"SCOPE NOTE",12,DIM,mono=True); text(d,(ox+52,oy+773),"provider-side idempotency /",14,WHITE); text(d,(ox+52,oy+797),"recovery may still be required",14,WHITE)

def main():
    img=Image.new("RGBA",(W,H),BG+(255,))
    text(ImageDraw.Draw(img),(40,27),"PAYMENT IDEMPOTENCY · STORYBOARD / 60 S · 1080 × 1920",16,DIM,mono=True)
    panels=[frame1,frame2,frame3,frame4,frame5,frame6]
    for i,fn in enumerate(panels): fn(img,40+(i%2)*520,55+(i//2)*930)
    text(ImageDraw.Draw(img),(40,2840),"STORYBOARD PREVIEW · TECHNICAL STORY FIRST · ACCENT = KEY · RED = RISK · GREEN = ONE COMPLETED PAYMENT",14,DIM,mono=True)
    img.convert("RGB").save(OUT,quality=93,optimize=True)

if __name__ == "__main__": main()
