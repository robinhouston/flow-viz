#!/usr/bin/python
# -*- encoding: utf-8 -*-
from __future__ import division

import random
import cairo


W, H = 500, 500
NUM_STREAMS = 16000
MAX_AGE = 7
BORDER = 100

streams = []

for i in range(NUM_STREAMS):
    x = random.randrange(-BORDER, W + BORDER)
    y = random.randrange(-BORDER, H + BORDER)
    streams.append([
        x, y, random.randrange(1, MAX_AGE+1), x, y
    ])

def to_px(n, f):
    def _f(x_px, y_px):
        divisor = min(W, H)/n
        x = (x_px - W/2) / divisor
        y = (y_px - H/2) / divisor
        
        return f(x - 5, y)
    return _f

def julia(cx, cy):
    return lambda x, y: [
            (x*x - y*y + cx - x),
            ( 2*x*y + cy - y)
       ]

def render_frames(velocity):
    global im, cx
    
    cx.set_source_rgba(0x4C/0xFF,0x4C/0xFF,0x4C/0xFF, 1)
    cx.paint()
    for frame_index in range(MAX_AGE*3):
        next_frame(velocity)
    
    for frame_index in range(MAX_AGE):
        next_frame(velocity)
        output_filename = "frame-%02d.png" % (frame_index,)
        print "Writing " + output_filename + "..."
        with open(output_filename, 'w') as out:
            im.write_to_png(out)

def next_frame(velocity):
    global cx, im, stream
    
    cx.set_source_rgba(0x4C/0xFF,0x4C/0xFF,0x4C/0xFF, 0.1)
    cx.paint()
    
    for stream in streams:
        if stream[2] == 0:
            stream[0] = stream[3]
            stream[1] = stream[4]
            stream[2] = MAX_AGE
        
        v = velocity(stream[0], stream[1])
        if v[0] <= W and v[1] <= H:
            cx.move_to(stream[0], stream[1])
            cx.line_to(stream[0] + v[0], stream[1] + v[1])
            cx.set_source_rgba(0xFF/0xFF,0xFF/0xFF,0xFF/0xFF, 0.06)
            cx.stroke()
            
            stream[0] += v[0]
            stream[1] += v[1]
        
        stream[2] -= 1

im = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H)
cx = cairo.Context(im)

cx.set_line_width(1.0)
render_frames(velocity=to_px(10, julia(0, 10)))


# convert -delay 6 frame-*.png -layers OptimizeTransparency flow.gif
