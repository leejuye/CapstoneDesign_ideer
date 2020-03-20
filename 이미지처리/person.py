import numpy as np
import cv2

img1 = cv2.imread('noBBang.jpg')
img2 = cv2.imread('BBang.jpg')

# img1 -> img2 달라진 곳 찾기
img3 = cv2.subtract(img1, img2)
gray3 = cv2.cvtColor(img3, cv2.COLOR_BGR2GRAY)

# fastNlMeansDenoising(이미지) -> 노이즈 제거
gray3 = cv2.fastNlMeansDenoising(gray3)

tmp = cv2.adaptiveThreshold(gray3, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 11, 2)

# threshold(이미지, 20이상의 값을, 255값으로 변경, )
ret, th1 = cv2.threshold(gray3, 20, 255, cv2.THRESH_BINARY)
# 테두리 검출
canny = cv2.Canny(th1, 250, 255)

cv2.imshow("thresh", cv2.resize(th1, (500, 800)))
cv2.imshow("tmp", cv2.resize(tmp, (500, 800)))
cv2.imshow("canny", cv2.resize(canny, (500, 800)))
cv2.imshow("subtract", cv2.resize(gray3, (500, 800)))
cv2.waitKey(0)