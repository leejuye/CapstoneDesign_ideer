import numpy as np
import cv2
import imutils
import sys
import json


def to_node(type, src):
    try:
        print(json.dumps({type: src}))
    except Exception:
        pass
    sys.stdout.flush()


frontimg = cv2.imread('/modules/default/photo/front.jpg')
bgimg = cv2.imread('/modules/default/photo/background.jpg')

# img1 - img2 difference
difimg = cv2.subtract(bgimg, frontimg)

gray_difimg = cv2.cvtColor(difimg, cv2.COLOR_BGR2GRAY)

# fastNlMeansDenoising(image file) -> noise reduction
gray_difimg = cv2.fastNlMeansDenoising(gray_difimg)

# bilateralFilter(image, kernel size, color SD, distance SD)
gray_difimg = cv2.bilateralFilter(gray_difimg, 3, 75, 75)

# adaptiveThreshold(src, maxValue, adaptiveMethod, thresholdType, blockSize, C)
th1 = cv2.adaptiveThreshold(gray_difimg, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 9, 2)

# edge detection
img_sobel_x = cv2.Sobel(th1, cv2.CV_64F, 1, 0, ksize=3)
img_sobel_x = cv2.convertScaleAbs(img_sobel_x)

img_sobel_y = cv2.Sobel(th1, cv2.CV_64F, 0, 1, ksize=3)
img_sobel_y = cv2.convertScaleAbs(img_sobel_y)

img_sobel = cv2.addWeighted(img_sobel_x, 1, img_sobel_y, 1, 0)

# image copy (laplacian.copy())
# finding contours
img_sobel = imutils.resize(img_sobel, width=400)
cnts = cv2.findContours(img_sobel.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_NONE)

# grab_contours
cnts = imutils.grab_contours(cnts)
cnts = sorted(cnts, key=cv2.contourArea, reverse=True)[:1]
screenCnt = None

# image draw
frontimg = imutils.resize(frontimg, width=400)
image = cv2.drawContours(frontimg, cnts, -1, (0, 255, 0), 1)

cv2.imwrite("result.jpg", cv2.resize(frontimg, (400, 700)))
to_node("status", "/modules/default/photo/result.jpg")
