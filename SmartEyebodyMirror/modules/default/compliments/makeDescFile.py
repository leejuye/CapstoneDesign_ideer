import json
from collections import OrderedDict

data = OrderedDict()

data["morning"] = ["안녕하세요", "좋은 아침입니다!", "원하는 기능을 \n말씀해주세요."]
data["afternoon"] = ["안녕하세요", "좋은 점심입니다!", "원하는 기능을 \n말씀해주세요."]
data["evening"] = ["안녕하세요", "좋은 저녁입니다!", "원하는 기능을 \n말씀해주세요."]

data["noKeyword"] = ["처음 듣는 말이에요.\n다시 말씀해주세요."]
data["noResponse"] = ["잘못 들었습니다.\n다시 말씀해주세요."]

data["startCam"] = ["※주의※\n몸의 맵시가 잘 보이는 옷을 입고 계신가요? :)\n(대답은 '응/아니'로 해주세요.)"]

data["frontStart"] = ["정면을 바라보고 이 자세로 서주세요.",
                           "정면 촬영을 시작하겠습니다.\n움직임을 멈추시고 잠시만 기다려주세요."]
data["frontResult"] = ["정면 사진이 올바르게 촬영되었나요?\n(대답은 '응/아니'로 해주세요.)"]

with open('./description.json', 'w', encoding="utf-8") as makeFile:
    json.dump(data, makeFile, ensure_ascii=False, indent="\t")