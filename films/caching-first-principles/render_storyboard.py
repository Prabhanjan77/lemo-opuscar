"""Render a small editable contact-board poster from the approved storyboard times."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).parent / 'storyboard.png'
W, H = 1800, 1220
BG = (5, 7, 13); WHITE = (238, 241, 247); DIM = (154, 165, 185); VIOLET = (157, 131, 255); RED = (255, 88, 100); GREEN = (110, 237, 179); AMBER = (255, 198, 109)
FONT = Path('/usr/share/fonts/truetype/dejavu')
def f(size, bold=False, mono=False):
    name = 'DejaVuSansMono-Bold.ttf' if mono and bold else 'DejaVuSansMono.ttf' if mono else 'DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf'
    return ImageFont.truetype(FONT / name, size)
def text(d, xy, s, size=20, color=WHITE, bold=False, mono=False, anchor=None): d.text(xy, s, font=f(size, bold, mono), fill=color, anchor=anchor)
def rr(d, box, r, fill, outline=None, width=1): d.rounded_rectangle(box, r, fill=fill, outline=outline, width=width)
def panel(d, x, y, title, sub):
    rr(d, (x,y,x+540,y+460), 24, (12,17,27), (238,241,247,42), 2)
    for xx in range(x+16, x+540, 48): d.line((xx,y+16,xx,y+444), fill=(238,241,247,9), width=1)
    for yy in range(y+16, y+460, 48): d.line((x+16,yy,x+524,yy), fill=(238,241,247,9), width=1)
    text(d,(x+28,y+34),sub,15,DIM,mono=True); text(d,(x+28,y+80),title,31,WHITE,True)
def pill(d, x,y,w,h,s,color): rr(d,(x,y,x+w,y+h),h//2,(*color,35),color,2); text(d,(x+w//2,y+h//2),s,13,color,True,True,'mm')
def route(d, pts, color, width=5): d.line(pts, fill=color, width=width, joint='curve')

def draw(out):
    im = Image.new('RGB',(W,H),BG); d=ImageDraw.Draw(im,'RGBA'); text(d,(60,56),'CACHING FROM FIRST PRINCIPLES / 30 S SAMPLE / REVIEW BOARD',15,DIM,mono=True); text(d,(60,102),'Traffic spike → miss → population → hit',32,WHITE,True)
    cells=[(60,145,'THE SPIKE','01 · 00:00—00:06'),(630,145,'THE BOTTLENECK','02 · 00:06—00:11.5'),(1200,145,'THE MISS PATH','03 · 00:11.5—00:17.8'),(60,650,'THE HIT PATH','04 · 00:17.8—00:23.5'),(630,650,'THE TRADE-OFF','05 · 00:23.5—00:30'),(1200,650,'END PROMISE','06 · FINAL HOLD')]
    for x,y,t,s in cells: panel(d,x,y,t,s)
    # hook: one click, then a visible user swarm converging on one profile
    text(d,(88,278),'ONE CLICK',43,VIOLET,True); text(d,(90,308),'ONE REQUEST → SAME PROFILE',14,DIM,mono=True)
    for yy,lab in ((340,'USER 01'),(410,'USER 02'),(480,'USER 03')):
        rr(d,(88,yy,248,yy+50),13,(13,21,34),(238,241,247,70),2); d.ellipse((108,yy+13,136,yy+41),fill=(*VIOLET,130)); text(d,(153,yy+24),lab,12,WHITE,True,True); text(d,(153,yy+41),'GET /profile',11,DIM,False,True)
    rr(d,(350,318,520,540),18,(16,24,37),(238,241,247,70),2); rr(d,(365,355,505,498),12,(5,8,14),(238,241,247,25),1); d.ellipse((420,380,454,414),fill=(*VIOLET,150)); d.rectangle((405,436,472,444),fill=(*WHITE,170)); d.rectangle((405,455,457,462),fill=(*DIM,130))
    route(d,[(248,365),(305,350),(350,388)],VIOLET); route(d,[(248,435),(305,420),(350,430)],VIOLET); route(d,[(248,505),(305,480),(350,470)],VIOLET); pill(d,360,555,145,34,'ALL CONVERGE',VIOLET)
    text(d,(88,580),'50,000 PEOPLE · SAME PROFILE',14,RED,False,True)
    # bottleneck
    route(d,[(690,412),(800,450),(910,450),(1030,412)],VIOLET); d.ellipse((690,403,714,427),fill=(*VIOLET,255)); d.ellipse((901,438,925,462),fill=(*RED,255)); rr(d,(840,365,1035,520),14,(26,34,49),(238,241,247,42),2); text(d,(938,407),'DATABASE',13,WHITE,True,True,'mm'); pill(d,858,434,158,33,'POOL FULL',RED); text(d,(658,555),'APP → DB → DISK / ≈4 ms',15,DIM,mono=True)
    # miss
    rr(d,(1248,352,1370,492),14,(27,32,49),(157,131,255,170),2); text(d,(1309,382),'CACHE',13,WHITE,True,True,'mm'); pill(d,1262,420,94,34,'MISS',RED); route(d,[(1372,437),(1460,437),(1540,420)],RED); rr(d,(1515,350,1645,492),14,(25,33,47),(238,241,247,50),2); text(d,(1580,395),'DB',15,WHITE,True,True,'mm'); text(d,(1228,555),'MISS → READ → STORE → RESPOND',15,DIM,mono=True)
    # hit
    text(d,(88,820),'1.1 ms',56,GREEN,True); text(d,(90,855),'CACHE HIT / HOT DATA',15,DIM,mono=True); route(d,[(120,940),(270,870),(490,870)],GREEN,7); pill(d,280,885,82,34,'HIT',GREEN); text(d,(90,1055),'≈4 ms database path dimmed',15,DIM,mono=True)
    # teardown
    text(d,(658,790),'TTL 60 s',48,AMBER,True); text(d,(660,824),'EXPLODED PATH / NAME THE TRADE-OFF',15,DIM,mono=True)
    for_y=[870,930,990]
    for yy,col,lab in zip(for_y,(VIOLET,AMBER,(176,183,199)),('CACHE / TTL','DATABASE','DISK / IOPS')):
        d.polygon([(690,yy),(780,yy-22),(870,yy),(780,yy+25)],fill=(*col,110),outline=(*col,220)); d.polygon([(690,yy),(780,yy+25),(780,yy+64),(690,yy+39)],fill=(24,31,44),outline=(*col,90)); d.polygon([(870,yy),(780,yy+25),(780,yy+64),(870,yy+39)],fill=(35,45,60),outline=(*col,90)); text(d,(900,yy+28),lab,14,col,True,True)
    # end promise
    text(d,(1228,860),'LESS',54,GREEN,True); text(d,(1228,918),'REPEATED WORK',43,WHITE,True); route(d,[(1260,995),(1370,950),(1490,995)],VIOLET,5); d.ellipse((1475,980,1510,1015),fill=(*GREEN,50),outline=GREEN,width=3); text(d,(1540,1000),'stampedes still need design',14,RED,True,True)
    text(d,(60,1170),'RED = PRESSURE / MISS · VIOLET = ROUTE · GREEN = HIT · SOURCE: PRABHANJAN2.SUBSTACK.COM',14,DIM,mono=True)
    im.save(OUT)

if __name__ == '__main__': draw(OUT); print(OUT, (W,H))
