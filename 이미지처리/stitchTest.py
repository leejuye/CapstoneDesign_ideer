from stitch import Stitcher
import imutils
import cv2

def rotateImage(image, deg):
    dst = cv2.transpose(image)
    dst = cv2.flip(dst, deg == 90)
    return dst

leftImage = cv2.imread(r'./image/left.jpg')
rightImage = cv2.imread(r'./image/right.jpg')
leftImage = rotateImage(imutils.resize(leftImage, width=400), 270)
rightImage = rotateImage(imutils.resize(rightImage, width=400), 270)

stitcher = Stitcher()
result = stitcher.stitch([leftImage, rightImage])

cv2.imshow("left Image", leftImage)
cv2.imshow("right Image", rightImage)
cv2.imshow("Result", rotateImage(result, 90))
cv2.waitKey(0)
