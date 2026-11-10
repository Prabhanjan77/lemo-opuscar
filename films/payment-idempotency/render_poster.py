from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from math import pi

HERE = Path(__file__).parent
W, H = 1080, 1920
VIOLET=(157,131,255); GREEN=(110,237,179); WHITE=(233,234,240); DIM=(146,151,168)
FONT=Path('/usr/share/fonts/truetype/dejavu')
def ft(n,b=False,m=False):
    p=FONT/('DejaVuSansMono-Bold.ttf' if m and b else 'DejaVuSansMono.ttf' if m else 'DejaVuSans-Bold.ttf' if b else 'DejaVuSans.ttf')
    return ImageFont.truetype(p,n)
def glow(im,x,y,r,c,a):
    lay=Image.new('RGBA',im.size,(0,0,0,0));d=ImageDraw.Draw(lay)
    for q in range(r,0,-10): d.ellipse((x-q,y-q,x+q,y+q),fill=(*c,int(a*(1-q/r)**2)))
    im.alpha_composite(lay.filter(ImageFilter.GaussianBlur(20)))
def main():
    im=Image.new('RGBA',(W,H),(3,4,8,255)); d=ImageDraw.Draw(im,'RGBA')
    glow(im,720,350,580,VIOLET,45); glow(im,540,760,300,GREEN,45)
    for x in range(0,W,48): d.line((x,0,x,H),fill=(233,234,240,12 if x%192 else 25),width=1)
    for y in range(0,H,48): d.line((0,y,W,y),fill=(233,234,240,12 if y%192 else 25),width=1)
    d.text((60,78),'PAYMENT IDEMPOTENCY',font=ft(25,True,True),fill=DIM)
    d.text((60,125),'DARK TECH KEYNOTE / SYSTEM DESIGN',font=ft(15,False,True),fill=DIM)
    # two violet request paths
    d.line((155,620,400,620,540,760),fill=VIOLET,width=12,joint='curve'); d.line((155,860,400,860,540,760),fill=VIOLET,width=12,joint='curve')
    d.ellipse((122,588,188,654),fill=VIOLET); d.ellipse((122,828,188,894),fill=VIOLET)
    glow(im,540,760,190,GREEN,55)
    d.ellipse((452,672,628,848),fill=(110,237,179,42),outline=GREEN,width=7)
    d.line((490,759,530,799),fill=GREEN,width=15);d.line((530,799,602,710),fill=GREEN,width=15)
    d.text((660,720),'ONE PAYMENT',font=ft(20,True,True),fill=GREEN); d.text((660,760),'MANY SAFE RESPONSES',font=ft(17,False,True),fill=DIM)
    d.text((60,1120),'SAFE RETRIES.',font=ft(68,True),fill=VIOLET)
    d.text((60,1200),'NO DUPLICATE',font=ft(68,True),fill=WHITE)
    d.text((60,1280),'EXECUTION.',font=ft(68,True),fill=WHITE)
    d.line((60,1355,1020,1355),fill=(157,131,255,140),width=2)
    d.text((60,1430),'ONE KEY. ONE OWNER. ONE STORED RESULT.',font=ft(20,True,True),fill=WHITE)
    box=(60,1530,1020,1692);d.rounded_rectangle(box,20,fill=(17,20,29,240),outline=(233,234,240,45),width=2)
    d.text((90,1570),'SCOPE NOTE',font=ft(16,True,True),fill=DIM)
    d.text((90,1605),'Provider-side idempotency or recovery may still be required.',font=ft(24),fill=WHITE)
    d.text((60,1818),'A 60-SECOND ENGINEERING EXPLAINER',font=ft(16,False,True),fill=DIM)
    im.convert('RGB').save(HERE/'poster.jpg',quality=94,optimize=True)
if __name__=='__main__':main()
