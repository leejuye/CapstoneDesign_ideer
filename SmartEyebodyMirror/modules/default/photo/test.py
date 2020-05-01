import numpy as np
import cv2
import imutils
import sys
import json
import os
import picamera
import time

def to_node(type1, message1, type2, message2):
    try:
        print(json.dumps({type1: message1, type2: message2}))
    except Exception:
        pass
    sys.stdout.flush()

curPath = os.path.dirname(os.path.abspath(__file__))
frontImage = cv2.imread(curPath + '/image/front.jpg')
sideImage = cv2.imread(curPath + '/image/side.jpg')
backImage = cv2.imread(curPath + '/image/background.jpg')


def contour(backImage, image):
    # img1 - img2 difference
    difImg = cv2.subtract(backImage, image)
    grayDifImg = cv2.cvtColor(difImg, cv2.COLOR_BGR2GRAY)

    # fastNlMeansDenoising(image file) -> noise reduction
    grayDifImg = cv2.fastNlMeansDenoising(grayDifImg)

    # bilateralFilter(image, kernel size, color SD, distance SD)
    grayDifImg = cv2.bilateralFilter(grayDifImg, 4, 75, 75)

    # adaptiveThreshold(src, maxValue, adaptiveMethod, thresholdType, blockSize, C)
    th = cv2.adaptiveThreshold(grayDifImg, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 9, 2)

    # edge detection
    imgSobelX = cv2.Sobel(th, cv2.CV_64F, 1, 0, ksize=3)
    imgSobelX = cv2.convertScaleAbs(imgSobelX)
    imgSobelY = cv2.Sobel(th, cv2.CV_64F, 0, 1, ksize=3)
    imgSobelY = cv2.convertScaleAbs(imgSobelY)
    imgSobel = cv2.addWeighted(imgSobelX, 1, imgSobelY, 1, 0)

    # resize image
    imgSobel = imutils.resize(imgSobel, width=400)

    # finding contours
    cnts = cv2.findContours(imgSobel.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_NONE)

    # grab_contours
    cnts = imutils.grab_contours(cnts)
    cnts = sorted(cnts, key=cv2.contourArea, reverse=True)[:1]
    screenCnt = None

    # image draw
    image = imutils.resize(image, width=400)
    image = cv2.drawContours(image, cnts, -1, (0, 255, 0), 1)

    return image, cnts

cam = picamera.PiCamera()
cam.start_preview(fullscreen=False, window=(20, 100, 400, 700))
time.sleep(10)
cam.stop_preview()
cam.capture(curPath + "/image/cam.jpg")

frontContour, cntsFront = contour(backImage, frontImage)
sideContour, cntsSide = contour(backImage, sideImage)

cv2.imwrite(curPath + "/image/frontContour.jpg", cv2.resize(frontContour, (400, 700)))
cv2.imwrite(curPath + "/image/sideContour.jpg", cv2.resize(sideContour, (400, 700)))

to_node("front", "frontContour", "side", "sideContour")
