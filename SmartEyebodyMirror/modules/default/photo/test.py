import sys
import json
import time

def to_node(type, message):
    try:
        print(json.dumps({type: message}))
    except Exception:
        pass
    sys.stdout.flush()

time.sleep(10)
to_node("status", "success")

