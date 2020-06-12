import cv2

BODY_PARTS = {"Head": 0, "Neck": 1, "RShoulder": 2, "RElbow": 3, "RWrist": 4,
              "LShoulder": 5, "LElbow": 6, "LWrist": 7, "RHip": 8, "RKnee": 9,
              "RAnkle": 10, "LHip": 11, "LKnee": 12, "LAnkle": 13, "Chest": 14,
              "Background": 15}

POSE_PAIRS = [["LKnee", "LAnkle", 0.4], ["LHip", "LKnee", 0.7], ["LHip", "LKnee", 0.2],
              ["Chest", "LHip", 0.5], ["Chest", "Chest", 1.0], ["LShoulder", "LShoulder", 1.0]]

def openPos(originImage):
    protoFile = "./pose/mpi/pose_deploy_linevec_faster_4_stages.prototxt"
    weightsFile = "./pose/mpi/pose_iter_160000.caffemodel"

    # Read the network (Caffe framework model)
    # https://thebook.io/006939/ch16/01/02/
    net = cv2.dnn.readNetFromCaffe(protoFile, weightsFile)
    height, width, _ = originImage.shape

    # image to blob
    blob = cv2.dnn.blobFromImage(originImage, 1.0 / 127.5, (width, height), (127.5, 127.5, 127.5), swapRB=True, crop=False)
    net.setInput(blob)

    # get result
    output = net.forward()
    H = output.shape[2]
    W = output.shape[3]

    # detected keypoints list
    points = []
    for i in range(0, 15):
        # confidence map of corresponding body's part
        probMap = output[0, i, :, :]

        # find global max
        _, prob, _, point = cv2.minMaxLoc(probMap)

        # Scale the point to fit on the original image
        x = (width * point[0]) / W
        y = (height * point[1]) / H

        if prob > 0.1:
            cv2.circle(originImage, (int(x), int(y)), 2, (0, 255, 255), thickness=-1, lineType=cv2.FILLED)
            cv2.putText(originImage, "{}".format(i), (int(x), int(y)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1, lineType=cv2.LINE_AA)
            points.append((int(x), int(y)))
        else:
            points.append(None)

    retPoints = []
    for pair in POSE_PAIRS:
        partA = BODY_PARTS[pair[0]]
        partB = BODY_PARTS[pair[1]]

        cH, cW, _ = originImage.shape
        if points[partA] and points[partB]:
            Y = points[partA][1] + int((points[partB][1] - points[partA][1]) * pair[2])
            retPoints.append(Y)
            cv2.line(originImage, (50,Y), (100,Y), (0, 255, 0), 2)
            cv2.putText(originImage, str(pair), (100,Y),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1, lineType=cv2.LINE_AA)

    # cv2.imshow('fff', originImage)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()

    #retPoints.sort()
    return retPoints
#
# frame = cv2.imread('./image/front2.jpg')
# openPos(frame)
# cv2.imshow('fff', frame)
#
# cv2.waitKey(0)
# cv2.destroyAllWindows()