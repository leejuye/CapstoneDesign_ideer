import numpy as np
import cv2

class Stitcher:
    def stitch(self, images, ratio=0.75):
        (imageB, imageA) = images
        (kpsA, desA) = self.imageSIFT(imageA)
        (kpsB, desB) = self.imageSIFT(imageB)

        # Brute-Force Feature Matching
        # http://www.gisdeveloper.co.kr/?p=6824
        bf = cv2.BFMatcher()
        # top two matches
        matches = bf.knnMatch(desA, desB, 2)
        good = []

        for m, n in matches:
            # distance within a certain ratio of each other
            if m.distance < n.distance * ratio:
                good.append(m)

        if len(good) > 4:
            ptsA = np.float32([kpsA[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
            ptsB = np.float32([kpsB[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)

            H, masked = cv2.findHomography(ptsA, ptsB, cv2.RANSAC, 5.0)

            result = cv2.warpPerspective(imageA, H, (imageA.shape[1] +
                                                     imageB.shape[1], imageA.shape[0]))
            result[0:imageB.shape[0], 0:imageB.shape[1]] = imageB

            return result

        return None

    def imageSIFT(self, image):
        # SIFT feature detector
        # https://blog.naver.com/samsjang/220643446825
        sift = cv2.xfeatures2d.SIFT_create()
        kps, des = sift.detectAndCompute(image, None)

        return (kps, des)
