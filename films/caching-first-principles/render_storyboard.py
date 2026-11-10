"""Render the minimalist architectural storyboard contact board."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).parent / 'storyboard.png'
W, H = 1800, 1220
PAPER = (245, 242, 235); WHITE = (255, 253, 248); INK = (23, 23, 27); DIM = (110, 109, 115); LINE = (23, 23, 27, 48); VIOLET = (103, 87, 217); RED = (222, 83, 97); GREEN = (44, 154, 109); AMBER = (201, 137, 38); BLUE = (61, 122, 170)
FONT = Path('/usr/share/fonts/truetype/dejavu')
def f(size, bold=False, mono=False):
    name = 'DejaVuSansMono-Bold.ttf' if mono and bold else 'DejaVuSansMono.ttf' if mono else 'DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf'
    return ImageFont.truetype(FONT / name, size)
def text(d, xy, s, size=20, color=INK, bold=False, mono=False, anchor=None): d.text(xy, s, font=f(size, bold, mono), fill=color, anchor=anchor)
def rr(d, box, r, fill, outline=LINE, width=1): d.rounded_rectangle(box, r, fill=fill, outline=outline, width=width)
def line(d, pts, fill=INK, width=3): d.line(pts, fill=fill, width=width, joint='curve')
def panel(d, x, y, title, sub):
    rr(d, (x,y,x+540,y+460), 22, WHITE, (23,23,27,56), 2)
    for xx in range(x+20, x+540, 64): d.line((xx,y+18,xx,y+442), fill=(23,23,27,12), width=1)
    for yy in range(y+18, y+460, 64): d.line((x+18,yy,x+522,yy), fill=(23,23,27,12), width=1)
    text(d,(x+28,y+34),sub,14,DIM,mono=True); text(d,(x+28,y+82),title,30,INK,True)
def cube(d, cx, cy, w=120, h=80, accent=None, label='API'):
    top=[(cx-w/2,cy-h/2),(cx,cy-h/2-32),(cx+w/2,cy-h/2),(cx,cy-h/2+32)]
    left=[(cx-w/2,cy-h/2),(cx,cy-h/2+32),(cx,cy+h/2+32),(cx-w/2,cy+h/2)]
    right=[(cx,cy-h/2+32),(cx+w/2,cy-h/2),(cx+w/2,cy+h/2),(cx,cy+h/2+32)]
    d.polygon(top, fill=WHITE, outline=INK); d.polygon(left, fill=(233,229,220), outline=INK); d.polygon(right, fill=(216,211,202), outline=INK)
    text(d,(cx,cy+8),label,14,accent or INK,True,True,'mm')
def packet(d,x,y,label,color): rr(d,(x-42,y-15,x+42,y+15),15,(255,253,248),color,2); text(d,(x,y+1),label,11,color,True,True,'mm')
def dots(d, x0,y0,x1,y1,n,color):
    for i in range(n):
        t=(i+1)/(n+1); x=x0+(x1-x0)*t; y=y0+(y1-y0)*t+((i%3)-1)*12; d.ellipse((x-4,y-4,x+4,y+4),fill=color)

def draw():
    im=Image.new('RGB',(W,H),PAPER); d=ImageDraw.Draw(im,'RGBA'); text(d,(60,56),'CACHING / FROM FIRST PRINCIPLES / ARCHITECTURAL SAMPLE',14,DIM,mono=True); text(d,(60,102),'One click → repeated work → cache hit',32,INK,True)
    cells=[(60,145,'ONE CLICK','01 · 00:00—00:05.6'),(630,145,'REPEATED WORK','02 · 00:05.6—00:11.5'),(1200,145,'ADD A CACHE','03 · 00:11.5—00:17.7'),(60,650,'CACHE HIT','04 · 00:17.7—00:23.6'),(630,650,'THE TRADE-OFF','05 · 00:23.6—00:30'),(1200,650,'FINAL HOLD','06 · ONE SHORTCUT')]
    for x,y,t,s in cells: panel(d,x,y,t,s)
    # one click route
    text(d,(88,270),'ONE CLICK,',30,VIOLET,True); text(d,(88,306),'ONE REQUEST',30,INK,True); rr(d,(90,350,250,415),12,WHITE,(23,23,27,70),2); text(d,(110,376),'PROFILE',12,DIM,mono=True); text(d,(110,398),'AANYA RAO',13,INK,True); cube(d,355,455,130,80,VIOLET,'API'); cube(d,480,380,130,80,BLUE,'DB'); line(d,[(250,382),(300,425)],VIOLET,4); line(d,[(410,430),(430,405)],BLUE,4); packet(d,278,400,'GET',VIOLET); text(d,(410,555),'50,000 REQUESTS',16,RED,True,True,'mm'); dots(d,130,445,330,430,16,RED)
    # bottleneck
    text(d,(658,270),'≈ 4 ms',50,RED,True); text(d,(660,302),'same read, repeated',14,DIM,mono=True); cube(d,790,460,130,80,VIOLET,'API'); cube(d,955,405,145,90,RED,'DB'); cube(d,1080,490,125,68,DIM,'DISK'); line(d,[(850,435),(890,420)],VIOLET,4); line(d,[(1025,442),(1045,475)],RED,4); text(d,(658,555),'POOL FULL  /  DISK READS',14,RED,True,True); line(d,[(680,580),(1100,580)],DIM,2); text(d,(680,605),'0.5   +   1.5   +   1.5   +   0.5 ms',12,DIM,False,True)
    # miss
    text(d,(1228,270),'MISS',48,RED,True); cube(d,1295,440,125,76,VIOLET,'CACHE'); cube(d,1450,390,130,82,BLUE,'DB'); line(d,[(1350,420),(1380,405)],RED,4); line(d,[(1450,440),(1360,520)],VIOLET,4); packet(d,1370,402,'MISS',RED); text(d,(1228,555),'READ → SAVE IN MEMORY',14,VIOLET,True,True)
    # hit
    text(d,(88,780),'1.1 ms',54,GREEN,True); text(d,(90,812),'memory path',14,GREEN,False,True); cube(d,270,920,130,80,VIOLET,'API'); cube(d,430,870,145,90,GREEN,'CACHE'); cube(d,560,820,125,76,DIM,'DB'); line(d,[(330,890),(365,860)],GREEN,6); packet(d,350,875,'HIT',GREEN); text(d,(90,1055),'≈4 ms database path / dimmed',13,DIM,False,True)
    # teardown
    text(d,(658,780),'TTL 60 s',45,AMBER,True); cube(d,800,870,120,70,VIOLET,'APP'); cube(d,800,940,120,70,GREEN,'CACHE'); cube(d,800,1010,120,70,BLUE,'DB'); line(d,[(880,870),(1010,870)],VIOLET,2); line(d,[(880,940),(1010,940)],GREEN,2); line(d,[(880,1010),(1010,1010)],BLUE,2); text(d,(1030,875),'APP',13,VIOLET,True,True); text(d,(1030,945),'CACHE',13,GREEN,True,True); text(d,(1030,1015),'DATABASE',13,BLUE,True,True)
    # final
    text(d,(1228,790),'LESS',50,GREEN,True); text(d,(1228,846),'REPEATED WORK',39,INK,True); rr(d,(1228,900,1690,1000),12,(250,229,230),RED,2); text(d,(1250,935),'TTL / STALE DATA / STAMPEDE',14,RED,True,True); text(d,(1250,970),'still need design',14,DIM,False,True)
    text(d,(60,1170),'VIOLET = ROUTE · RED = PRESSURE / MISS · GREEN = HIT · SOURCE: PRABHANJAN2.SUBSTACK.COM',13,DIM,False,True)
    im.save(OUT); print(OUT, (W,H))

if __name__ == '__main__': draw()
