import numpy as np
import cv2
import imutils

print(cv2.__version__)

frontimg = cv2.imread(r'.\image\front.jpg')
bgimg = cv2.imread(r'.\image\background.jpg')

# img1 -> img2 달라진 곳 찾기 (배경 - 인물)
difimg = cv2.subtract(bgimg, frontimg)

gray_difimg = cv2.cvtColor(difimg, cv2.COLOR_BGR2GRAY)

# fastNlMeansDenoising(이미지) -> 노이즈 제거
gray_difimg = cv2.fastNlMeansDenoising(gray_difimg)

# adaptiveThreshold(입력 이미지, threshold 값보다 클 경우 지정값, thresholing값 결정방법, threshold유형, threshold를 적용할 영역의 크기, 평균이나 가중평균에서 차감할 값)
# https://blog.naver.com/handuelly/221803811174 참고
th1 = cv2.adaptiveThreshold(gray_difimg, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 9, 2)

# 엣지 검출 (캐니 / 라플라시안 / 소벨)
# https://076923.github.io/posts/Python-opencv-14/ 참고
canny = cv2.Canny(th1, 254, 255)
laplacian = cv2.Laplacian(th1, cv2.CV_8U, ksize=5)
sobel = cv2.Sobel(th1, cv2.CV_8U, 1, 0, 5)

# findContours는 이미지 자체를 수정하기 때문에 복사본(laplacian.copy())사용
# findContours: 동일한 색 또는 동일한 픽셀값(강도,intensity)을 가지고 있는 영역의 경계선 정보다. 물체의 윤곽선, 외형을 파악하는데 사용
# https://datascienceschool.net/view-notebook/f9f8983941254a34bf0fee42c66c5539/ 참고
# 모드는 제일 용량이 적게 든다고 해서 사용!
cnts = cv2.findContours(laplacian.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
# pip install imutils
# grab_contours: contours의 총 개수
cnts = imutils.grab_contours(cnts)
#윤곽선 정렬..?
cnts = sorted(cnts, key = cv2.contourArea, reverse = True)[:10]
screenCnt = None

#원본 이미지에 cnts이미지 draw
image = cv2.drawContours(frontimg, cnts, -1, (0,255,0), 3)

# cv2.imshow("thresh", cv2.resize(th1, (400, 700)))
# cv2.imshow("canny", cv2.resize(canny, (400, 700)))
# cv2.imshow("sobel", cv2.resize(sobel, (400, 700)))
# cv2.imshow("laplacian", cv2.resize(laplacian, (400, 700)))
# cv2.imshow("subtract", cv2.resize(gray_difimg, (400, 700)))

cv2.imshow('image', cv2.resize(image, (400, 700)))
cv2.waitKey(0)
cv2.destroyAllWindows()
