import numpy as np
import sys
import json
import os
import picamera
import time
from PIL import Image


curPath = os.path.dirname(os.path.abspath(__file__))

cam = picamera.PiCamera()

cam.resolution = (720, 1280)
cam.framerate = 24
cam.start_preview(fullscreen=False, window=(20, 100, 400, 700))

# Load the arbitrarily sized image
img = Image.open(curPath +'/overlay.png')
# Create an image padded to the required size with
# mode 'RGB'
pad = Image.new('RGBA', (
    ((img.size[0] + 31) // 32) * 32,
    ((img.size[1] + 15) // 16) * 16,
    ))
# Paste the original image into the padded one
pad.paste(img, (0, 0))

# Add the overlay with the padded image as the source,
# but the original image's dimensions

o = cam.add_overlay(pad.tobytes(), size=img.size, fullscreen = False , window = (20, 100, 400, 700))
# By default, the overlay is in layer 0, beneath the
# preview (which defaults to layer 2). Here we make
# the new overlay semi-transparent, then move it above
# the preview
o.layer = 3

time.sleep(20)
cam.stop_preview()
cam.capture(curPath + "/image/" + sys.argv[1])