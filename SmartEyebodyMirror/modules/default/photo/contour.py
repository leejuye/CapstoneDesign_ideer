import numpy as np
import cv2
import imutils
import sys
import os
import json
import socket
import numpy
#import findPos as op

def toInfo(sizeInfo):
    try:
        print(json.dumps(sizeInfo))
    except Exception as ex:
        print(ex)
        pass
    sys.stdout.flush()

curPath = os.path.dirname(os.path.abspath(__file__))
curPath += '/image/'

fileName = sys.argv[1]
userID = sys.argv[2]
weight = float(sys.argv[3][:4])

frontImage = cv2.imread(curPath + userID + '/' + fileName + '_front.jpg')
#print(curPath + userID + '/' + fileName + '_front.jpg')
sideImage = cv2.imread(curPath + userID + '/' + fileName + '_side.jpg')
backImage = cv2.imread(curPath + 'background.jpg')
#print(curPath + 'background.jpg')

ratio = [0.8, 0.62, 0.50, 0.38, 0.2]
drawCnt = [[2, 2, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1]]
partName = ["calf", "thigh", "hip", "waist", "chest", "shoulder"]


def getYpoints(top, bottom):
    height = bottom - top
    ret = []
    for i in ratio:
        ret.append(int(i * height + top))
    
    return ret

def getYpointsFromServer(frame):
    TCP_IP = '192.168.0.30'
    TCP_PORT = 10210
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    s.connect((TCP_IP, TCP_PORT))

    encodeParam = [int(cv2.IMWRITE_JPEG_QUALITY), 100]
    result, imgEncode = cv2.imencode('.jpg', frame, encodeParam)

    data = numpy.array(imgEncode)
    stringData = data.tostring()

    s.sendall((str(len(stringData))).encode().ljust(16) + stringData)

    data = s.recv(1024)
    arr = data.decode('utf-8')
    arr = eval(arr)
    arr = list(map(int, arr))

    return arr

def contour(backImage, image):
    # img1 - img2 difference
    difImg = cv2.subtract(backImage, image)
    grayDifImg = cv2.cvtColor(difImg, cv2.COLOR_BGR2GRAY)

    # fastNlMeansDenoising(image file) -> noise reduction
    grayDifImg = cv2.fastNlMeansDenoising(grayDifImg)

    # bilateralFilter(image, kernel size, color SD, distance SD)
    grayDifImg = cv2.bilateralFilter(grayDifImg, 4, 75, 75)

    # adaptiveThreshold(src, maxValue, adaptiveMethod, thresholdType, blockSize, C)
    th = cv2.adaptiveThreshold(grayDifImg, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 101, 0)

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


def line(dic, image, cnts, Ypoints, isSide):
    for j in range(0, len(Ypoints) - isSide):
        arr = []
        for i in cnts:
            x, y = i[0]
            if y == Ypoints[j] and (len(arr) == 0 or arr[-1][0] + 3 <= x):
                arr.append((x, y))
        arrLen = len(arr) - len(arr) % 2
        
        drawArr = []
        for i in range(0, arrLen, 2):
            drawArr.append((arr[i], arr[i+1]))
        drawArr = sorted(drawArr, key = lambda x: x[1][0] - x[0][0], reverse=True)
        
        if len(drawArr) >= drawCnt[isSide][j]:
            dic[partName[j]] = int(drawArr[0][1][0] - drawArr[0][0][0])
            for i in range(0, drawCnt[isSide][j]):
                cv2.putText(image, partName[j], drawArr[i][0],
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1, lineType=cv2.LINE_AA)
                cv2.line(image, drawArr[i][0], drawArr[i][1], (0, 255, 0), 2)
        else:
            dic[partName[j]] = 0.0
        #print(type(dic[partName[j]]), dic[partName[j]], partName[j])

def myArr(locArr, toArr):
    tmp = []
    aLen = len(locArr)

    tmp.append((locArr[0][0][0], locArr[0][0][1]))
    for i in range(1, aLen):
        x, y = locArr[i][0]
        if y != locArr[i - 1][0][1]:
            toArr.append(tmp)
            tmp = []
        if len(tmp) == 0 or x > locArr[i - 1][0][0] + 3:
            tmp.append((x, y))
    toArr.append(tmp)

def findThigh(frontLoc):
    frontArr, sideArr = [], []
    myArr(frontLoc, frontArr)

    fLen = len(frontArr)
    mn, idx = 1987564321, 0

    # find thigh from front image
    for i in range(int(fLen * 0.9), 0, -1):
        if len(frontArr[i]) <= 2:
            idx = frontArr[i][0][1] + 15
            break

    return idx




frontContour, cntsFront = contour(backImage, frontImage)
sideContour, cntsSide = contour(backImage, sideImage)

bottom, top = 0, 1987654321
for loc in cntsFront[0]:
    x, y = loc[0]
    top = min(y, top)
    bottom = max(y, bottom)

# find skeleton
imageFront = imutils.resize(cv2.imread(curPath + userID + '/' + fileName + '_front.jpg'), width=400)
# y Value
Ypoints = []
if len(sys.argv) <= 4:
    Ypoints = getYpointsFromServer(imageFront)
else:
    for i in range(4, len(sys.argv)):
        Ypoints.append(int(sys.argv[i]))
#print(Ypoints)
#Ypoints[1] = findThigh(cntsFront[0])


frontSizeInfo = {}
sideSizeInfo = {}

r = bottom - top
height = int(r)

line(frontSizeInfo, frontContour, cntsFront[0], Ypoints, False)
line(sideSizeInfo, sideContour, cntsSide[0], Ypoints, True)

cv2.imwrite(curPath + userID + "/" + fileName + "_front.jpg", frontContour)
cv2.imwrite(curPath + userID + "/" + fileName + "_side.jpg", sideContour)

#cv2.imwrite(curPath + "_front.jpg", frontContour)
#cv2.imwrite(curPath + "_side.jpg", sideContour)

# temporary data
frontSizeInfo["weight"] = weight
sideSizeInfo["weight"] = weight
#print(type(frontSizeInfo["weight"]), frontSizeInfo["weight"])

frontSizeInfo["chest"] = 0
sideSizeInfo["chest"] = 0

frontSizeInfo["height"] = height
sideSizeInfo["height"] = height
#print(type(frontSizeInfo["height"]), frontSizeInfo["height"])

frontSizeInfo["bmi"] = round((weight / (height * height)) * 10000, 2)
sideSizeInfo["bmi"] = round((weight / (height * height)) * 10000, 2)
#print(type(frontSizeInfo["bmi"]), frontSizeInfo["bmi"])

sideSizeInfo["shoulder"] = 0
#print(type(frontSizeInfo["shoulder"]), frontSizeInfo["shoulder"])
# end

frontSizeInfo["is_front"] = True
sideSizeInfo["is_front"] = False

frontSizeInfo["file_name"] = fileName
sideSizeInfo["file_name"] = fileName

frontSizeInfo["id"] = userID
sideSizeInfo["id"] = userID

sizeInfo = dict(front=frontSizeInfo, side=sideSizeInfo)
if len(sys.argv) <= 4:
    Ypoints.append(userID)
    Ypoints.reverse()
    sizeInfo["ypoints"] = Ypoints

#print(json.dumps(sizeInfo))
toInfo(sizeInfo)