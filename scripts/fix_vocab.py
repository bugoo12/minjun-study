import json
p="C:/Users/user/minjun/data/vocabulary.json"
d=json.load(open(p,encoding="utf-8"))
for w in d["words"]:
    if w["word"]=="red":
        w["exampleMeaning"]="사과는 빨간색이다."
    if w["word"]=="brush":
        w["example"]="Brush your teeth."
        w["exampleMeaning"]="이를 닦아라."
json.dump(d,open(p,"w",encoding="utf-8"),ensure_ascii=False,indent=2)
print("done")
