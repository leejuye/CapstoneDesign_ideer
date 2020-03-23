import numpy as np
import cv2

class Stitcher:
    def stitch(self, images, ratio=0.75):
        (imageB, imageA) = images
        (kpsA, desA) = self.imageSIFT(imageA)
        (kpsB, desB) = self.imageSIFT(imageB)

        # Brute-Force 특징점 매칭
        # http://www.gisdeveloper.co.kr/?p=6824
        bf = cv2.BFMatcher()
        # 2순위 결과까지 반환
        matches = bf.knnMatch(desA, desB, 2)
        good = []

        for m, n in matches:
            # 1순위 결과가 2순위 결과 * ratio 보다 가까운 값만 고려
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
        # SIFT 이미지 특성 검출
        # https://blog.naver.com/samsjang/220643446825
        sift = cv2.xfeatures2d.SIFT_create()
        kps, des = sift.detectAndCompute(image, None)

        return (kps, des)
