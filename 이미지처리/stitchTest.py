from stitch import Stitcher
import imutils
import cv2

leftImage = cv2.imread(r'./image/left1.jpg')
rightImage = cv2.imread(r'./image/right1.jpg')
leftImage = imutils.resize(leftImage, width=400)
rightImage = imutils.resize(rightImage, width=400)

stitcher = Stitcher()
result = stitcher.stitch([leftImage, rightImage])

cv2.imshow("left Image", leftImage)
cv2.imshow("right Image", rightImage)
cv2.imshow("Result", result)
cv2.waitKey(0)
