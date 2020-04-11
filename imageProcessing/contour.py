import numpy as np
import cv2
import imutils
import findPos as op

# print(cv2.__version__)

frontimg = cv2.imread('./image/front3.jpg')
# sideimg = cv2.imread('./image/side.jpg')
bgimg = cv2.imread('./image/background2.jpg')


# img1 - img2 difference
difimg = cv2.subtract(bgimg, frontimg)
# difimg = cv2.subtract(bgimg, sideimg)

gray_difimg = cv2.cvtColor(difimg, cv2.COLOR_BGR2GRAY)

# fastNlMeansDenoising(image file) -> noise reduction
gray_difimg = cv2.fastNlMeansDenoising(gray_difimg)

# bilateralFilter(image, kernel size, color SD, distance SD)
gray_difimg = cv2.bilateralFilter(gray_difimg, 4, 75, 75)

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
image = cv2.drawContours(frontimg, cnts, -1, (0,255,0), 1)
# image = cv2.drawContours(sideimg, cnts, -1, (0,255,0), 3)

# find skeleton
image = imutils.resize(frontimg, width=400)
image_front = imutils.resize(cv2.imread('./image/front3.jpg'), width=400)

# y Value
Ypoints = op.openPos(image_front, image)

for j in range(0, len(Ypoints)):
    arr = []
    for i in cnts[0]:
        x, y = i[0]
        if y == Ypoints[j] and (len(arr) == 0 or arr[-1][0] + 3 <= x):
            arr.append((x, y))
    arrLen = len(arr) - len(arr) % 2
    idx, maxGap = -1, -1
    for i in range(0, arrLen, 2):
        if j < 3:
            if maxGap < arr[i+1][0] - arr[i][0]:
                maxGap = arr[i+1][0] - arr[i][0]
                idx = i
        else:
            cv2.line(image, (arr[i][0], arr[i][1]), (arr[i+1][0], arr[i+1][1]), (0, 255, 0), 2)
    if idx != -1:
        cv2.line(image, (arr[idx][0], arr[idx][1]), (arr[idx+1][0], arr[idx+1][1]), (0, 255, 0), 2)


cv2.imshow("line", cv2.resize(image, (400, 700)))

cv2.waitKey(0)
cv2.destroyAllWindows()
