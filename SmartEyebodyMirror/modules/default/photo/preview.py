# import the necessary packages
import numpy as np
import cv2
import sys
import json
import os
from picamera import PiCamera
import time
from PIL import Image
from picamera.array import PiRGBArray

curPath = os.path.dirname(os.path.abspath(__file__))

# initialize the camera and grab a reference to the raw camera capture
overlay = cv2.imread(curPath +'/overlay_front.png')

overlay = cv2.resize(overlay, (480, 640))
# overlay = cv2.cvtColor(overlay, cv2.COLOR_RGB2RGBA)

camera = PiCamera()
camera.resolution = (480, 640)
camera.framerate = 32

rawCapture = PiRGBArray(camera, size=(480, 640))

mtx = np.array([[412.9634173, 0., 226.99121613], [0., 412.39697781, 280.22672336], [0., 0., 1.]])
dist = np.array([[-3.70615012e-01, 2.39676247e-01, 1.30295455e-04, 1.03008073e-03, -1.23421190e-01]])
# allow the camera to warmup
time.sleep(0.1)
# capture frames from the camera
winName = "view"
cnt = 0
for frame in camera.capture_continuous(rawCapture, format="bgr", use_video_port=True):
    # grab the raw NumPy array representing the image, then initialize the timestamp
    # and occupied/unoccupied text
    image = frame.array
    h,  w = image.shape[:2]
    newcameramtx, roi=cv2.getOptimalNewCameraMatrix(mtx,dist,(w,h),0,(w,h))

    # undistort
    mapx,mapy = cv2.initUndistortRectifyMap(mtx,dist,None,newcameramtx,(w,h),5)
    dst = cv2.remap(image,mapx,mapy,cv2.INTER_LINEAR)

    # crop the image
    x,y,w,h = roi
    dst = dst[y:y+h, x:x+w]
    
    image = dst
    added_image = cv2.add(image,overlay)
    added_image = np.fliplr(added_image)
    # show the frame
    cv2.namedWindow(winName)
    cv2.moveWindow(winName, 20, 50)
    cv2.imshow(winName, added_image)
    key = cv2.waitKey(1) & 0xFF
    cnt = cnt+1
    # clear the stream in preparation for the next frame
    rawCapture.truncate(0)
    # if the `q` key was pressed, break from the loop
    if key == ord("q") or cnt == 100:
        camera.capture(curPath + "/image/" + sys.argv[1])
        break

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