import numpy as np
import cv2
import sys
import json
import os
import picamera
import time
from PIL import Image


curPath = os.path.dirname(os.path.abspath(__file__))

cam = picamera.PiCamera()

cam.resolution = (480, 640)
cam.framerate = 24
cam.start_preview(fullscreen=False, window=(20, 100, 480, 640))

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

o = cam.add_overlay(pad.tobytes(), size=img.size, fullscreen = False , window = (20, 100, 480, 600))
# By default, the overlay is in layer 0, beneath the
# preview (which defaults to layer 2). Here we make
# the new overlay semi-transparent, then move it above
# the preview
o.layer = 3

time.sleep(20)
cam.stop_preview()
cam.capture(curPath + "/image/" + sys.argv[1])

mtx = np.array([[412.9634173, 0., 226.99121613], [0., 412.39697781, 280.22672336], [0., 0., 1.]])
dist = np.array([[-3.70615012e-01, 2.39676247e-01, 1.30295455e-04, 1.03008073e-03, -1.23421190e-01]])

img = cv2.imread(curPath + "/image/" + sys.argv[1])

h,  w = img.shape[:2]
newcameramtx, roi=cv2.getOptimalNewCameraMatrix(mtx,dist,(w,h),0,(w,h))

# undistort
mapx,mapy = cv2.initUndistortRectifyMap(mtx,dist,None,newcameramtx,(w,h),5)
dst = cv2.remap(img,mapx,mapy,cv2.INTER_LINEAR)

# crop the image
x,y,w,h = roi
dst = dst[y:y+h, x:x+w]
cv2.imwrite(curPath + "/image/" + sys.argv[1],dst)
#cv2.imwrite(curPath + "/image/calibresult.png",dst)