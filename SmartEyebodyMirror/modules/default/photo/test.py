import sys
import json

def to_node(type, message):
    try:
        print(json.dumps({type: message}))
    except Exception:
        pass
    sys.stdout.flush()


to_node("status", "text: juye")