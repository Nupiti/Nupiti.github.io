"""Convert latitude/longitude to the x,y used by data/worldmap.json and data/coauthor-places.json.
Usage:  python tools/latlon-to-xy.py 41.90 12.50
"""
import sys
TAB=[(0,1,0),(5,0.9986,0.062),(10,0.9954,0.124),(15,0.99,0.186),(20,0.9822,0.248),(25,0.973,0.31),(30,0.96,0.372),(35,0.9427,0.434),(40,0.9216,0.4958),(45,0.8962,0.5571),(50,0.8679,0.6176),(55,0.835,0.6769),(60,0.7986,0.7346),(65,0.7597,0.7903),(70,0.7186,0.8435),(75,0.6732,0.8936),(80,0.6213,0.9394),(85,0.5722,0.9761),(90,0.5322,1)]
def interp(a, col):
    for (l0,x0,y0),(l1,x1,y1) in zip(TAB,TAB[1:]):
        if l0<=a<=l1:
            t=(a-l0)/(l1-l0); v0=(x0,y0)[col]; v1=(x1,y1)[col]; return v0+t*(v1-v0)
    return (TAB[-1][1],TAB[-1][2])[col]
def xy(lat,lon):
    a=abs(lat); rx=interp(a,0)*lon; ry=interp(a,1)*(1 if lat>=0 else -1)
    return round(2.80890*rx+500.191,1), round(-263.492*ry+256.023,1)
if __name__=='__main__':
    lat,lon=float(sys.argv[1]),float(sys.argv[2]); print('x: %s  y: %s' % xy(lat,lon))
