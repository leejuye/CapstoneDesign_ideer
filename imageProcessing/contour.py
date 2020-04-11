import numpy as np
import cv2
import imutils
import findPos as op

# print(cv2.__version__)

frontImage = cv2.imread('./image/front.jpg')
sideImage = cv2.imread('./image/side.jpg')
backImage = cv2.imread('./image/background.jpg')


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


def line(image, cnts, Ypoints):
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
                if maxGap < arr[i + 1][0] - arr[i][0]:
                    maxGap = arr[i + 1][0] - arr[i][0]
                    idx = i
            else:
                cv2.line(image, (arr[i][0], arr[i][1]), (arr[i + 1][0], arr[i + 1][1]), (0, 255, 0), 2)
        if idx != -1:
            cv2.line(image, (arr[idx][0], arr[idx][1]), (arr[idx + 1][0], arr[idx + 1][1]), (0, 255, 0), 2)


frontContour, cntsFront = contour(backImage, frontImage)
sideContour, cntsSide = contour(backImage, sideImage)

# find skeleton
imageFront = imutils.resize(cv2.imread('./image/front.jpg'), width=400)
# y Value
Ypoints = op.openPos(imageFront, frontContour)

line(frontContour, cntsFront, Ypoints)
line(sideContour, cntsSide, Ypoints)

cv2.imshow("front", cv2.resize(frontContour, (400, 700)))
cv2.imshow("side", cv2.resize(sideContour, (400, 700)))

cv2.waitKey(0)
cv2.destroyAllWindows()
