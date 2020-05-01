import numpy as np
import sys
import json
import os
import picamera
import time

def to_node(type1, message1, type2, message2):
    try:
        print(json.dumps({type1: message1, type2: message2}))
    except Exception:
        pass
    sys.stdout.flush()
    
curPath = os.path.dirname(os.path.abspath(__file__))

cam = picamera.PiCamera()
%cam.resolution

cam.start_preview(fullscreen=False, window=(20, 100, 400, 400))
time.sleep(10)
cam.stop_preview()

cam.capture(curPath + "/image/cam.jpg")
