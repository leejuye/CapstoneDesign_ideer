# import the necessary packages
import numpy as np
import cv2
import sys
import json
import os
import time
import RPi.GPIO as GPIO
from picamera import PiCamera
from PIL import Image
from picamera.array import PiRGBArray

# Use GPIO numbering
GPIO.setmode(GPIO.BCM)
 
# Set GPIO for camera LED
# Use 5 for Model A/B and 32 for Model B+
CAMLED = 5 
 
# Set GPIO to output
GPIO.setup(CAMLED, GPIO.OUT, initial=False) 

#path
curPath = os.path.dirname(os.path.abspath(__file__))

def toInfo():
    try:
        print("success")
    except Exception:
        pass
    sys.stdout.flush()

# overlay
overlay = None
if sys.argv[1][len(sys.argv[1])-5] == 't':
    overlay = cv2.imread(curPath + '/overlay_front.png')
else:
    overlay = cv2.imread(curPath + '/overlay_side.png')

overlay = cv2.resize(overlay, (480, 640))

# initialize the camera and grab a reference to the raw camera capture
camera = PiCamera()
camera.resolution = (480, 640)
camera.framerate = 32

rawCapture = PiRGBArray(camera, size=(480, 640))

#distortion correction
mtx = np.array([[412.9634173, 0., 226.99121613], [0., 412.39697781, 280.22672336], [0., 0., 1.]])
dist = np.array([[-3.70615012e-01, 2.39676247e-01, 1.30295455e-04, 1.03008073e-03, -1.23421190e-01]])

#count text setting
location = (350, 150)
color = (255, 255, 255)
font = cv2.FONT_HERSHEY_SIMPLEX
fontSize = 5
thickness = 2

# sound setting
#pygame.mixer.init()
#sfx1 = pygame.mixer.Sound(curPath + "/sound/bleeper.wav")
#sfx2 = pygame.mixer.Sound(curPath + "/sound/shutter.wav")
#check = [False, False, False]

# allow the camera to warmup
time.sleep(0.1)

# capture frames from the camera
winName = "view"
start = time.time()
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
    addedImage = cv2.add(image,overlay)
    addedImage = np.fliplr(addedImage)
    addedImage = np.array(addedImage)

    #count down text
    cnt = time.time()-start
    if cnt >= 6:
        cv2.putText(addedImage, "1", location, font, fontSize, color, thickness, cv2.LINE_AA)
#        check[0] = playSound("sfx1", check[0])
    elif cnt >= 5:
        cv2.putText(addedImage, "2", location, font, fontSize, color, thickness, cv2.LINE_AA)
#        check[1] = playSound("sfx1", check[1])
    elif cnt >= 4:
        cv2.putText(addedImage, "3", location, font, fontSize, color, thickness, cv2.LINE_AA)
#        check[2] = playSound("sfx1", check[2])
    
    # show the frame
    cv2.namedWindow(winName)
    cv2.moveWindow(winName, 20, 50)
    cv2.imshow(winName, addedImage)
    key = cv2.waitKey(1) & 0xFF
    
    # clear the stream in preparation for the next frame
    rawCapture.truncate(0)
    
    # if the `q` key was pressed, break from the loop
    if key == ord("q") or time.time()-start >= 7:
#        playSound("sfx2")
        camera.capture(curPath + "/image/" + sys.argv[2] + "/" + sys.argv[1])
        break

img = cv2.imread(curPath + "/image/" + sys.argv[2] + "/" + sys.argv[1])

# undistort image
h,  w = img.shape[:2]
newcameramtx, roi=cv2.getOptimalNewCameraMatrix(mtx,dist,(w,h),0,(w,h))

# undistort
mapx,mapy = cv2.initUndistortRectifyMap(mtx,dist,None,newcameramtx,(w,h),5)
dst = cv2.remap(img,mapx,mapy,cv2.INTER_LINEAR)

# crop the image
x,y,w,h = roi
dst = dst[y:y+h, x:x+w]

dst = np.fliplr(dst)
cv2.imwrite(curPath + "/image/" + sys.argv[2] + "/" + sys.argv[1], dst)
#cv2.imwrite(curPath + "/image/calibresult.png",dst)

toInfo()
