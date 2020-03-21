import numpy as np
import cv2
import imutils

print(cv2.__version__)

frontimg = cv2.imread(r'.\image\front.jpg')
sideimg = cv2.imread(r'.\image\side.jpg')
bgimg = cv2.imread(r'.\image\background.jpg')

# img1 -> img2 달라진 곳 찾기 (배경 - 인물)
# difimg = cv2.subtract(bgimg, frontimg)
difimg = cv2.subtract(bgimg, sideimg)

gray_difimg = cv2.cvtColor(difimg, cv2.COLOR_BGR2GRAY)

# fastNlMeansDenoising(이미지) -> 노이즈 제거
gray_difimg = cv2.fastNlMeansDenoising(gray_difimg)

# 가우시안 필터링을 쓰면 이미지의 경계선도 흐려진다. 따라서 양방향 필터링(Bilateral Filtering) 이용
# bilateralFilter(이미지, 커널크기, 색공간 표준편차, 거리공간 표준편차)
gray_difimg = cv2.bilateralFilter(gray_difimg, 3, 75, 75)

# adaptiveThreshold(입력 이미지, threshold 값보다 클 경우 지정값, thresholing값 결정방법,
# threshold유형, threshold를 적용할 영역의 크기, 평균이나 가중평균에서 차감할 값
# https://blog.naver.com/handuelly/221803811174 참고
th1 = cv2.adaptiveThreshold(gray_difimg, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 9, 2)


# 엣지 검출
# https://webnautes.tistory.com/1258
img_sobel_x = cv2.Sobel(th1, cv2.CV_64F, 1, 0, ksize=3)
img_sobel_x = cv2.convertScaleAbs(img_sobel_x)

img_sobel_y = cv2.Sobel(th1, cv2.CV_64F, 0, 1, ksize=3)
img_sobel_y = cv2.convertScaleAbs(img_sobel_y)

img_sobel = cv2.addWeighted(img_sobel_x, 1, img_sobel_y, 1, 0);

# cv2.imshow("Sobel X", cv2.resize(img_sobel_x, (400, 700)))
# cv2.imshow("Sobel Y", cv2.resize(img_sobel_y, (400, 700)))
cv2.imshow("Sobel", cv2.resize(img_sobel, (400, 700)))


# findContours는 이미지 자체를 수정하기 때문에 복사본(laplacian.copy())사용
# findContours: 동일한 색 또는 동일한 픽셀값(강도,intensity)을 가지고 있는 영역의 경계선 정보다. 물체의 윤곽선, 외형을 파악하는데 사용
# https://datascienceschool.net/view-notebook/f9f8983941254a34bf0fee42c66c5539/ 참고
# 모드는 제일 용량이 적게 든다고 해서 사용!
cnts = cv2.findContours(img_sobel.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

# pip install imutils
# grab_contours: contours의 총 개수
cnts = imutils.grab_contours(cnts)
#윤곽선 정렬..?
cnts = sorted(cnts, key = cv2.contourArea, reverse = True)[:10]
screenCnt = None

#원본 이미지에 cnts이미지 draw
# image = cv2.drawContours(frontimg, cnts, -1, (0,255,0), 3)
image = cv2.drawContours(sideimg, cnts, -1, (0,255,0), 3)

cv2.imshow("sobel", cv2.resize(image, (400, 700)))
cv2.waitKey(0)
cv2.destroyAllWindows()
