# -*- coding: utf-8 -*-
import json, os

words = []

def add(w, meaning, pos, example, exMeaning, diff, icon, category):
    words.append({
        "id": None,
        "word": w,
        "meaning": meaning,
        "pos": pos,
        "example": example,
        "exampleMeaning": exMeaning,
        "difficulty": diff,
        "icon": icon,
        "category": category,
        "audioUrl": None
    })

# Family
family = [
("mom","엄마","noun","This is my mom.","이것은 우리 엄마다.","1","👩","family"),
("dad","아빠","noun","My dad is tall.","우리 아빠는 키가 크다.","1","👨","family"),
("parents","부모님","noun","I love my parents.","나는 부모님을 사랑한다.","2","👨‍👩‍👧","family"),
("brother","형/남동생","noun","My brother plays soccer.","내 형은 축구를 한다.","1","👦","family"),
("sister","누나/여동생","noun","My sister reads books.","내 누나는 책을 읽는다.","1","👧","family"),
("grandma","할머니","noun","Grandma makes soup.","할머니는 수프를 만든다.","1","👵","family"),
("grandpa","할아버지","noun","Grandpa walks slowly.","할아버지는 천천히 걷는다.","1","👴","family"),
("baby","아기","noun","The baby is sleeping.","아기가 자고 있다.","1","👶","family"),
("family","가족","noun","My family is happy.","우리 가족은 행복하다.","1","🏠","family"),
("uncle","삼촌/외삼촌","noun","Uncle visits us.","삼촌이 우리를 방문한다.","2","👨","family"),
("aunt","이모/고모","noun","Aunt cooks dinner.","이모가 저녁을 만든다.","2","👩","family"),
("cousin","사촌","noun","My cousin is funny.","내 사촌은 재미있다.","2","👧","family"),
]
for t in family: add(*t)

# School
school = [
("school","학교","noun","I go to school.","나는 학교에 간다.","1","🏫","school"),
("teacher","선생님","noun","The teacher smiles.","선생님이 웃으신다.","1","👩‍🏫","school"),
("student","학생","noun","I am a student.","나는 학생이다.","1","🎒","school"),
("class","반/수업","noun","Our class is big.","우리 반은 크다.","1","🏫","school"),
("book","책","noun","I read a book.","나는 책을 읽는다.","1","📖","school"),
("pencil","연필","noun","I have a pencil.","나는 연필을 가지고 있다.","1","✏️","school"),
("eraser","지우개","noun","Use the eraser.","지우개를 사용해라.","1","🧽","school"),
("ruler","자","noun","The ruler is long.","자는 길다.","1","📏","school"),
("notebook","공책","noun","Write in the notebook.","공책에 써라.","1","📓","school"),
("desk","책상","noun","The desk is clean.","책상이 깨끗하다.","1","🪑","school"),
("chair","의자","noun","Sit on the chair.","의자에 앉아라.","1","🪑","school"),
("board","칠판","noun","Look at the board.","칠판을 보아라.","1","📋","school"),
("homework","숙제","noun","I do homework.","나는 숙제를 한다.","1","📝","school"),
("test","시험","noun","The test is easy.","시험은 쉽다.","2","📝","school"),
("library","도서관","noun","I like the library.","나는 도서관을 좋아한다.","2","📚","school"),
("principal","교장 선생님","noun","The principal speaks.","교장 선생님이 말씀하신다.","3","👨‍💼","school"),
("subject","과목","noun","Math is my subject.","수학은 내 과목이다.","2","📚","school"),
("science","과학","noun","Science is fun.","과학은 재미있다.","2","🔬","school"),
("math","수학","noun","I like math.","나는 수학을 좋아한다.","1","➕","school"),
("english","영어","noun","English is useful.","영어는 유용하다.","1","🔤","school"),
]
for t in school: add(*t)

# Food
food = [
("rice","밥/쌀","noun","I eat rice.","나는 밥을 먹는다.","1","🍚","food"),
("bread","빵","noun","I like bread.","나는 빵을 좋아한다.","1","🍞","food"),
("milk","우유","noun","Drink milk.","우유를 마셔라.","1","🥛","food"),
("water","물","noun","I drink water.","나는 물을 마신다.","1","💧","food"),
("apple","사과","noun","An apple is red.","사과는 빨갛다.","1","🍎","food"),
("banana","바나나","noun","I eat a banana.","나는 바나나를 먹는다.","1","🍌","food"),
("orange","오렌지","noun","Orange juice is sweet.","오렌지 주스는 달다.","1","🍊","food"),
("grape","포도","noun","Grapes are purple.","포도는 보라색이다.","1","🍇","food"),
("strawberry","딸기","noun","Strawberry is sweet.","딸기는 달다.","2","🍓","food"),
("egg","계란","noun","I eat an egg.","나는 계란을 먹는다.","1","🥚","food"),
("meat","고기","noun","Meat is tasty.","고기는 맛있다.","1","🥩","food"),
("chicken","닭고기","noun","Chicken is good.","닭고기는 좋다.","1","🍗","food"),
("fish","생선/물고기","noun","I eat fish.","나는 생선을 먹는다.","1","🐟","food"),
("soup","수프/국","noun","Soup is hot.","국은 뜨겁다.","1","🍲","food"),
("noodle","국수","noun","Noodles are long.","국수는 길다.","1","🍜","food"),
("pizza","피자","noun","Pizza is yummy.","피자는 맛있다.","1","🍕","food"),
("cake","케이크","noun","The cake is sweet.","케이크는 달다.","1","🎂","food"),
("icecream","아이스크림","noun","I love ice cream.","나는 아이스크림을 좋아한다.","1","🍦","food"),
("chocolate","초콜릿","noun","Chocolate is brown.","초콜릿은 갈색이다.","2","🍫","food"),
("candy","사탕","noun","Candy is sweet.","사탕은 달다.","1","🍬","food"),
("juice","주스","noun","I drink juice.","나는 주스를 마신다.","1","🧃","food"),
("tea","차","noun","Tea is warm.","차는 따뜻하다.","1","🍵","food"),
("breakfast","아침 식사","noun","Breakfast is ready.","아침 식사가 준비되었다.","2","🍳","food"),
("lunch","점심 식사","noun","Lunch is at noon.","점심은 정오에 있다.","1","🍱","food"),
("dinner","저녁 식사","noun","Dinner is nice.","저녁 식사는 좋다.","1","🍽️","food"),
("snack","간식","noun","I eat a snack.","나는 간식을 먹는다.","1","🍪","food"),
]
for t in food: add(*t)

# Animals
animals = [
("dog","개","noun","The dog barks.","개가 짖는다.","1","🐶","animals"),
("cat","고양이","noun","The cat sleeps.","고양이가 잔다.","1","🐱","animals"),
("bird","새","noun","The bird flies.","새가 날아간다.","1","🐦","animals"),
("rabbit","토끼","noun","The rabbit hops.","토끼가 뛴다.","1","🐰","animals"),
("horse","말","noun","The horse runs fast.","말은 빨리 달린다.","2","🐴","animals"),
("cow","소","noun","The cow eats grass.","소는 풀을 먹는다.","1","🐄","animals"),
("pig","돼지","noun","The pig is pink.","돼지는 분홍색이다.","1","🐷","animals"),
("sheep","양","noun","Sheep give wool.","양은 양털을 준다.","2","🐑","animals"),
("chicken","닭","noun","The chicken lays eggs.","닭은 계란을 낳는다.","1","🐔","animals"),
("duck","오리","noun","The duck swims.","오리는 헤엄친다.","1","🦆","animals"),
("lion","사자","noun","The lion is strong.","사자는 강하다.","2","🦁","animals"),
("tiger","호랑이","noun","The tiger is big.","호랑이는 크다.","2","🐯","animals"),
("elephant","코끼리","noun","Elephant has a trunk.","코끼리는 코가 길다.","2","🐘","animals"),
("monkey","원숭이","noun","Monkey eats banana.","원숭이는 바나나를 먹는다.","2","🐵","animals"),
("bear","곰","noun","Bear sleeps in winter.","곰은 겨울에 잔다.","2","🐻","animals"),
("giraffe","기린","noun","Giraffe is tall.","기린은 키가 크다.","2","🦒","animals"),
("zebra","얼룩말","noun","Zebra has stripes.","얼룩말은 줄무늬가 있다.","2","🦓","animals"),
("panda","판다","noun","Panda eats bamboo.","판다는 대나무를 먹는다.","2","🐼","animals"),
("snake","뱀","noun","Snake has no legs.","뱀은 다리가 없다.","2","🐍","animals"),
("frog","개구리","noun","Frog jumps high.","개구리는 높이 뛴다.","2","🐸","animals"),
("turtle","거북이","noun","Turtle is slow.","거북이는 느리다.","2","🐢","animals"),
("fish","물고기","noun","Fish swim in water.","물고기는 물에서 헤엄친다.","1","🐟","animals"),
("insect","곤충","noun","Insect is small.","곤충은 작다.","2","🐛","animals"),
("butterfly","나비","noun","Butterfly is pretty.","나비는 예쁘다.","2","🦋","animals"),
("bee","벌","noun","Bee makes honey.","벌은 꿀을 만든다.","1","🐝","animals"),
]
for t in animals: add(*t)

# Body
body = [
("head","머리","noun","My head hurts.","내 머리가 아프다.","1","👤","body"),
("hair","머리카락","noun","My hair is black.","내 머리카락은 검다.","1","💇","body"),
("eye","눈","noun","I have two eyes.","나는 눈이 두 개 있다.","1","👁️","body"),
("ear","귀","noun","I hear with ears.","나는 귀로 듣는다.","1","👂","body"),
("nose","코","noun","My nose is small.","내 코는 작다.","1","👃","body"),
("mouth","입","noun","Open your mouth.","입을 벌려라.","1","👄","body"),
("tooth","이/치아","noun","Brush your teeth.","이를 닦아라.","1","🦷","body"),
("hand","손","noun","Raise your hand.","손을 들어라.","1","✋","body"),
("finger","손가락","noun","I have ten fingers.","나는 손가락이 열 개 있다.","1","👆","body"),
("arm","팔","noun","My arm is long.","내 팔은 길다.","1","💪","body"),
("leg","다리","noun","My leg is strong.","내 다리는 강하다.","1","🦵","body"),
("foot","발","noun","My foot hurts.","내 발이 아프다.","1","🦶","body"),
("heart","심장/마음","noun","My heart beats.","내 심장이 뛴다.","2","❤️","body"),
("stomach","배/위","noun","My stomach is full.","내 배가 부르다.","2","🍽️","body"),
("back","등","noun","My back is straight.","내 등은 곧다.","1","🧍","body"),
("skin","피부","noun","Skin is soft.","피부는 부드럽다.","2","✋","body"),
]
for t in body: add(*t)

# Home
home = [
("house","집","noun","My house is big.","내 집은 크다.","1","🏠","home"),
("room","방","noun","My room is clean.","내 방은 깨끗하다.","1","🚪","home"),
("door","문","noun","Open the door.","문을 열어라.","1","🚪","home"),
("window","창문","noun","Open the window.","창문을 열어라.","1","🪟","home"),
("bed","침대","noun","I sleep in bed.","나는 침대에서 잔다.","1","🛏️","home"),
("table","테이블","noun","Put it on the table.","테이블 위에 놓아라.","1","🪑","home"),
("chair","의자","noun","Sit on the chair.","의자에 앉아라.","1","🪑","home"),
("kitchen","부엌","noun","Mom is in kitchen.","엄마는 부엌에 있다.","1","🍳","home"),
("bathroom","화장실","noun","Where is bathroom?","화장실은 어디에 있나요?","1","🚽","home"),
("tv","텔레비전","noun","Watch TV.","TV를 보아라.","1","📺","home"),
("phone","전화기","noun","My phone rings.","내 전화기가 울린다.","1","📱","home"),
("clock","시계","noun","The clock ticks.","시계가 똑딱거린다.","1","⏰","home"),
("lamp","램프","noun","Turn on the lamp.","램프를 켜라.","1","💡","home"),
("sofa","소파","noun","Sit on the sofa.","소파에 앉아라.","1","🛋️","home"),
("garden","정원","noun","Flowers in garden.","정원에 꽃이 있다.","2","🌷","home"),
("roof","지붕","noun","The roof is high.","지붕은 높다.","2","🏠","home"),
("wall","벽","noun","Paint the wall.","벽을 칠해라.","1","🧱","home"),
("floor","바닥","noun","Clean the floor.","바닥을 닦아라.","1","🧹","home"),
]
for t in home: add(*t)

# Sports / exercise
sports = [
("run","달리다","verb","I run fast.","나는 빨리 달린다.","1","🏃","sports"),
("walk","걷다","verb","I walk to school.","나는 학교에 걸어간다.","1","🚶","sports"),
("jump","뛰다","verb","Jump high.","높이 뛰어라.","1","⬆️","sports"),
("swim","수영하다","verb","I swim well.","나는 수영을 잘한다.","1","🏊","sports"),
("kick","차다","verb","Kick the ball.","공을 차라.","1","⚽","sports"),
("throw","던지다","verb","Throw the ball.","공을 던져라.","1","⚾","sports"),
("catch","잡다","verb","Catch the ball.","공을 잡아라.","1","⚾","sports"),
("play","놀다/하다","verb","Let's play.","놀자.","1","🎮","sports"),
("exercise","운동하다","verb","I exercise daily.","나는 매일 운동한다.","2","🏋️","sports"),
("soccer","축구","noun","I play soccer.","나는 축구를 한다.","1","⚽","sports"),
("baseball","야구","noun","Baseball is fun.","야구는 재미있다.","2","⚾","sports"),
("basketball","농구","noun","I like basketball.","나는 농구를 좋아한다.","2","🏀","sports"),
("tennis","테니스","noun","Tennis is cool.","테니스는 멋지다.","2","🎾","sports"),
("gym","체육관","noun","We go to gym.","우리는 체육관에 간다.","2","🏋️","sports"),
("team","팀","noun","Our team wins.","우리 팀이 이긴다.","1","👥","sports"),
("win","이기다","verb","We win the game.","우리는 경기에서 이긴다.","1","🏆","sports"),
("lose","지다","verb","Don't lose heart.","낙심하지 마라.","2","😞","sports"),
("score","점수","noun","The score is high.","점수가 높다.","2","🔢","sports"),
]
for t in sports: add(*t)

# Daily actions / verbs
daily = [
("eat","먹다","verb","I eat breakfast.","나는 아침을 먹는다.","1","🍽️","daily"),
("drink","마시다","verb","I drink water.","나는 물을 마신다.","1","🥤","daily"),
("sleep","자다","verb","I sleep at night.","나는 밤에 잔다.","1","😴","daily"),
("wake","일어나다","verb","Wake up early.","일찍 일어나라.","1","⏰","daily"),
("wash","씻다","verb","Wash your hands.","손을 씻어라.","1","🧼","daily"),
("brush"," brushing ( 이를 닦다)","verb","Brush your teeth.","이를 닦아라.","1","🦷","daily"),
("read","읽다","verb","I read books.","나는 책을 읽는다.","1","📖","daily"),
("write","쓰다","verb","Write your name.","이름을 써라.","1","✍️","daily"),
("draw","그리다","verb","Draw a picture.","그림을 그려라.","1","🎨","daily"),
("sing","노래하다","verb","Sing a song.","노래를 불러라.","1","🎤","daily"),
("dance","춤추다","verb","Dance happily.","신나게 춤춰라.","1","💃","daily"),
("listen","듣다","verb","Listen carefully.","주의 깊게 들어라.","1","👂","daily"),
("speak","말하다","verb","Speak English.","영어로 말해라.","1","🗣️","daily"),
("look","보다/바라보다","verb","Look at me.","나를 보아라.","1","👀","daily"),
("watch","보다","verb","Watch TV.","TV를 봐라.","1","📺","daily"),
("open","열다","verb","Open the book.","책을 열어라.","1","📖","daily"),
("close","닫다","verb","Close the door.","문을 닫아라.","1","🚪","daily"),
("clean","청소하다","verb","Clean your room.","방을 청소해라.","1","🧹","daily"),
("help","돕다","verb","Help your friend.","친구를 도와라.","1","🤝","daily"),
("share","나누다","verb","Share toys.","장난감을 나눠라.","1","🤝","daily"),
("smile","미소 짓다","verb","Smile please.","웃어 주세요.","1","😊","daily"),
("laugh","웃다","verb","We laugh together.","우리는 함께 웃는다.","1","😂","daily"),
("cry","울다","verb","Don't cry.","울지 마라.","1","😢","daily"),
("think","생각하다","verb","Think carefully.","신중히 생각해라.","2","🤔","daily"),
("know","알다","verb","I know the answer.","나는 답을 안다.","1","💡","daily"),
("learn","배우다","verb","I learn English.","나는 영어를 배운다.","1","📚","daily"),
("teach","가르치다","verb","Mom teaches me.","엄마가 나를 가르친다.","2","👩‍🏫","daily"),
("find","찾다","verb","Find the key.","열쇠를 찾아라.","1","🔍","daily"),
("give","주다","verb","Give me a pen.","나에게 펜을 주어라.","1","🎁","daily"),
("take","가져가다/받다","verb","Take this book.","이 책을 가져가라.","1","✋","daily"),
("make","만들다","verb","Make a cake.","케이크를 만들어라.","1","🛠️","daily"),
("go","가다","verb","Let's go.","가자.","1","🚶","daily"),
("come","오다","verb","Come here.","여기로 와라.","1","🚶","daily"),
("stop","멈추다","verb","Stop running.","달리기를 멈춰라.","1","🛑","daily"),
("start","시작하다","verb","Start now.","지금 시작해라.","1","▶️","daily"),
("finish","끝내다","verb","Finish homework.","숙제를 끝내라.","1","✅","daily"),
]
for t in daily: add(*t)

# Colors / adjectives
colors = [
("red","빨간색","adjective","The apple is red.","사과는 빨indsight다.","1","🔴","colors"),
("blue","파란색","adjective","The sky is blue.","하늘은 파랗다.","1","🔵","colors"),
("green","초록색","adjective","Grass is green.","풀은 초록색이다.","1","🟢","colors"),
("yellow","노란색","adjective","The sun is yellow.","해는 노란색이다.","1","🟡","colors"),
("black","검은색","adjective","The cat is black.","고양이는 검은색이다.","1","⚫","colors"),
("white","흰색","adjective","Snow is white.","눈은 흰색이다.","1","⚪","colors"),
("pink","분홍색","adjective","The flower is pink.","꽃은 분홍색이다.","1","🌸","colors"),
("orange","주황색","adjective","Orange is orange.","오렌지는 주황색이다.","1","🟠","colors"),
("purple","보라색","adjective","Grape is purple.","포도는 보라색이다.","2","🟣","colors"),
("brown","갈색","adjective","Bear is brown.","곰은 갈색이다.","2","🟤","colors"),
("big","큰","adjective","The elephant is big.","코끼리는 크다.","1","🐘","colors"),
("small","작은","adjective","The mouse is small.","쥐는 작다.","1","🐭","colors"),
("tall","키가 큰","adjective","He is tall.","그는 키가 크다.","1","🧍","colors"),
("short","짧은/키가 작은","adjective","The pencil is short.","연필은 짧다.","1","✏️","colors"),
("long","긴","adjective","The road is long.","길은 길다.","1","🛣️","colors"),
("fast","빠른","adjective","The car is fast.","차는 빠르다.","1","🚗","colors"),
("slow","느린","adjective","The turtle is slow.","거북이는 느리다.","1","🐢","colors"),
("happy","행복한","adjective","I am happy.","나는 행복하다.","1","😊","colors"),
("sad","슬픈","adjective","He is sad.","그는 슬프다.","1","😢","colors"),
("hot","더운/뜨거운","adjective","The soup is hot.","국은 뜨겁다.","1","🔥","colors"),
("cold","추운/차가운","adjective","Ice is cold.","얼음은 차갑다.","1","🧊","colors"),
("clean","깨끗한","adjective","My room is clean.","내 방은 깨끗하다.","1","✨","colors"),
("dirty","더러운","adjective","Hands are dirty.","손이 더럽다.","1","🧼","colors"),
("new","새로운","adjective","I have a new toy.","나는 새 장난감이 있다.","1","🆕","colors"),
("old","오래된/늙은","adjective","The house is old.","집은 오래되었다.","1","🏛️","colors"),
("good","좋은","adjective","Good job!","잘했어!","1","👍","colors"),
("bad","나쁜","adjective","Bad weather.","나쁜 날씨.","1","👎","colors"),
("easy","쉬운","adjective","This is easy.","이것은 쉽다.","1","😊","colors"),
("hard","어려운","adjective","Math is hard.","수학은 어렵다.","1","😓","colors"),
("beautiful","아름다운","adjective","The flower is beautiful.","꽃은 아름답다.","2","🌸","colors"),
("strong","강한","adjective","He is strong.","그는 강하다.","2","💪","colors"),
("weak","약한","adjective","The bridge is weak.","다리는 약하다.","2","🪢","colors"),
]
for t in colors: add(*t)

# Time / numbers / others
others = [
("time","시간","noun","What time is it?","지금 몇 시인가요?","1","⏰","others"),
("day","날/하루","noun","Have a nice day.","좋은 하루 되세요.","1","📅","others"),
("night","밤","noun","Stars at night.","밤에 별이 보인다.","1","🌙","others"),
("morning","아침","noun","Good morning.","좋은 아침.","1","🌅","others"),
("afternoon","오후","noun","Good afternoon.","좋은 오후.","1","☀️","others"),
("evening","저녁","noun","Good evening.","좋은 저녁.","1","🌆","others"),
("today","오늘","adverb","Today is Monday.","오늘은 월요일이다.","1","📅","others"),
("tomorrow","내일","adverb","See you tomorrow.","내일 보자.","1","📅","others"),
("yesterday","어제","adverb","Yesterday was fun.","어제는 재미있었다.","1","📅","others"),
("week","주","noun","One week has 7 days.","일주일은 7일이다.","1","📆","others"),
("month","월/달","noun","This month is May.","이번 달은 5월이다.","1","📅","others"),
("year","년/해","noun","Happy new year.","새해 복 많이 받으세요.","1","🎉","others"),
("hour","시간","noun","One hour is 60 minutes.","한 시간은 60분이다.","2","⏰","others"),
("minute","분","noun","Wait a minute.","잠깐 기다려라.","1","⏱️","others"),
("number","숫자","noun","Write the number.","숫자를 써라.","1","🔢","others"),
("zero","영/제로","noun","Zero means nothing.","영은 아무것도 없다는 뜻이다.","2","0️⃣","others"),
("one","하나/일","number","I have one apple.","나는 사과가 하나 있다.","1","1️⃣","others"),
("two","둘/이","number","Two birds fly.","새 두 마리가 날아간다.","1","2️⃣","others"),
("three","셋/삼","number","Three cats sleep.","고양이 세 마리가 잔다.","1","3️⃣","others"),
("four","넷/사","number","Four wheels.","바퀴 네 개.","1","4️⃣","others"),
("five","다섯/오","number","Five fingers.","손가락 다섯 개.","1","5️⃣","others"),
("ten","열/십","number","Ten toes.","발가락 열 개.","1","🔟","others"),
("hundred","백","number","One hundred students.","학생 백 명.","2","💯","others"),
("first","첫 번째","adjective","I am first.","나는 첫 번째이다.","1","1️⃣","others"),
("second","두 번째","adjective","Second place.","두 번째 자리.","2","2️⃣","others"),
("last","마지막","adjective","Last page.","마지막 페이지.","1","LAST","others"),
("more","더 많은","adjective","I want more.","나는 더 원한다.","1","➕","others"),
("less","더 적은","adjective","Less sugar.","설탕을 적게.","2","➖","others"),
("all","모든","adjective","All students.","모든 학생들.","1","🌐","others"),
("some","약간/몇몇","adjective","Some water.","물 약간.","1","💧","others"),
("none","없음","pronoun","None left.","아무것도 남지 않았다.","2","0️⃣","others"),
("here","여기","adverb","Come here.","여기로 와라.","1","📍","others"),
("there","저기","adverb","Go there.","저기로 가라.","1","📍","others"),
("up","위로","adverb","Look up.","위를 보아라.","1","⬆️","others"),
("down","아래로","adverb","Sit down.","앉아라.","1","⬇️","others"),
("left","왼쪽","adjective","Turn left.","왼쪽으로 돌아라.","1","⬅️","others"),
("right","오른쪽","adjective","Turn right.","오른쪽으로 돌아라.","1","➡️","others"),
("inside","안쪽","adverb","Stay inside.","안에 있어라.","1","🏠","others"),
("outside","바깥","adverb","Play outside.","밖에서 놀아라.","1","🌳","others"),
("front","앞","noun","Stand in front.","앞에 서라.","1","⬆️","others"),
("back","뒤","noun","Go to the back.","뒤로 가라.","1","⬇️","others"),
("top","꼭대기","noun","Top of hill.","언덕 꼭대기.","2","⛰️","others"),
("bottom","바닥","noun","Bottom of box.","상자 바닥.","2","📦","others"),
]
for t in others: add(*t)

# Weather / nature
nature = [
("sun","해/태양","noun","The sun shines.","해가 빛난다.","1","☀️","nature"),
("moon","달","noun","The moon is bright.","달이 밝다.","1","🌙","nature"),
("star","별","noun","Stars twinkle.","별이 반짝인다.","1","⭐","nature"),
("sky","하늘","noun","The sky is blue.","하늘은 파랗다.","1","🌤️","nature"),
("cloud","구름","noun","Clouds are white.","구름은 희다.","1","☁️","nature"),
("rain","비","noun","Rain falls.","비가 온다.","1","🌧️","nature"),
("snow","눈","noun","Snow is white.","눈은 희다.","1","❄️","nature"),
("wind","바람","noun","Wind blows.","바람이 분다.","1","🌬️","nature"),
("tree","나무","noun","The tree is tall.","나무는 키가 크다.","1","🌳","nature"),
("flower","꽃","noun","The flower is pretty.","꽃은 예쁘다.","1","🌸","nature"),
("grass","풀/잔디","noun","Grass is green.","잔디는 초록색이다.","1","🌱","nature"),
("leaf","잎","noun","Leaf falls.","잎이 떨어진다.","1","🍃","nature"),
("mountain","산","noun","Mountain is high.","산은 높다.","1","⛰️","nature"),
("river","강","noun","River flows.","강이 흐른다.","1","🌊","nature"),
("sea","바다","noun","Sea is blue.","바다는 파랗다.","1","🌊","nature"),
("beach","해변","noun","Play on beach.","해변에서 놀아라.","2","🏖️","nature"),
("forest","숲","noun","Forest is green.","숲은 초록색이다.","2","🌲","nature"),
("lake","호수","noun","Lake is calm.","호수는 잔잔하다.","2","🏞️","nature"),
("rock","바위/돌","noun","Rock is hard.","바위는 단단하다.","1","🪨","nature"),
("sand","모래","noun","Sand is yellow.","모래는 노란색이다.","1","🏝️","nature"),
("hot weather","더운 날씨","noun","Hot weather today.","오늘은 더운 날씨다.","2","☀️","nature"),
("cold weather","추운 날씨","noun","Cold weather outside.","밖은 추운 날씨다.","2","❄️","nature"),
]
for t in nature: add(*t)

# Transport
transport = [
("car","자동차","noun","My dad drives a car.","아빠는 자동차를 운전한다.","1","🚗","transport"),
("bus","버스","noun","I take the bus.","나는 버스를 탄다.","1","🚌","transport"),
("train","기차","noun","Train is fast.","기차는 빠르다.","1","🚆","transport"),
("bike","자전거","noun","I ride a bike.","나는 자전거를 탄다.","1","🚲","transport"),
("airplane","비행기","noun","Airplane flies high.","비행기는 높이 난다.","2","✈️","transport"),
("ship","배/선박","noun","Ship sails sea.","배가 바다를 항해한다.","2","🚢","transport"),
("boat","보트","noun","Boat on river.","강에 보트가 있다.","2","🚤","transport"),
("taxi","택시","noun","Take a taxi.","택시를 타라.","1","🚕","transport"),
("subway","지하철","noun","Subway is crowded.","지하철은 붐빈다.","2","🚇","transport"),
("road","도로","noun","Road is long.","도로는 길다.","1","🛣️","transport"),
("bridge","다리","noun","Bridge over river.","강 위에 다리가 있다.","2","🌉","transport"),
("wheel","바퀴","noun","Wheel turns.","바퀴가 돈다.","2","🛞","transport"),
("ticket","표/티켓","noun","Buy a ticket.","표를 사라.","2","🎫","transport"),
("station","역/정류장","noun","Wait at station.","역에서 기다려라.","2","🚉","transport"),
("airport","공항","noun","Airport is big.","공항은 크다.","2","✈️","transport"),
]
for t in transport: add(*t)

# Feelings / actions more
feel = [
("like","좋아하다","verb","I like apples.","나는 사과를 좋아한다.","1","❤️","feelings"),
("love","사랑하다","verb","I love mom.","나는 엄마를 사랑한다.","1","💖","feelings"),
("want","원하다","verb","I want a toy.","나는 장난감을 원한다.","1","🙋","feelings"),
("need","필요하다","verb","I need help.","나는 도움이 필요하다.","1","🆘","feelings"),
("happy","행복한","adjective","I feel happy.","나는 행복하다.","1","😊","feelings"),
("angry","화난","adjective","He is angry.","그는 화가 났다.","1","😠","feelings"),
("scared","무서운/두려운","adjective","I am scared.","나는 무섭다.","2","😨","feelings"),
("tired","피곤한","adjective","I am tired.","나는 피곤하다.","1","😴","feelings"),
("hungry","배고픈","adjective","I am hungry.","나는 배고프다.","1","🍽️","feelings"),
("thirsty","목마른","adjective","I am thirsty.","나는 목마르다.","1","🥤","feelings"),
("sorry","미안한","adjective","I am sorry.","미안하다.","1","🙏","feelings"),
("thanks","고마운","interjection","Thanks a lot.","정말 고맙다.","1","🙏","feelings"),
("please","제발/부탁합니다","adverb","Please help me.","도와 주세요.","1","🙏","feelings"),
("excuse me","실례합니다","phrase","Excuse me, please.","실례합니다.","2","🙋","feelings"),
("welcome","환영합니다","interjection","Welcome home.","집에 온 것을 환영한다.","2","👋","feelings"),
]
for t in feel: add(*t)

# Places / community
places = [
("park","공원","noun","Play in park.","공원에서 놀아라.","1","🌳","places"),
("store","가게","noun","Buy at store.","가게에서 사라.","1","🏪","places"),
("hospital","병원","noun","Go to hospital.","병원에 가라.","2","🏥","places"),
("bank","은행","noun","Money at bank.","은행에 돈이 있다.","2","🏦","places"),
("restaurant","식당","noun","Eat at restaurant.","식당에서 먹어라.","2","🍽️","places"),
("museum","박물관","noun","Visit museum.","박물관을 방문해라.","3","🏛️","places"),
("zoo","동물원","noun","Animals at zoo.","동물원에 동물이 있다.","1","🦒","places"),
("aquarium","수족관","noun","Fish at aquarium.","수족관에 물고기가 있다.","2","🐠","places"),
("theater","극장","noun","Watch movie at theater.","극장에서 영화를 봐라.","2","🎬","places"),
("post office","우체국","noun","Mail at post office.","우체국에서 우편을 보내라.","2","📮","places"),
("police station","경찰서","noun","Police help us.","경찰이 우리를 돕는다.","2","🚓","places"),
("fire station","소방서","noun","Fire truck at station.","소방서에 소방차가 있다.","3","🚒","places"),
("city","도시","noun","City is big.","도시는 크다.","1","🏙️","places"),
("village","마을","noun","Village is quiet.","마을은 조용하다.","2","🏘️","places"),
("country","나라/시골","noun","My country is Korea.","내 나라는 한국이다.","1","🇰🇷","places"),
]
for t in places: add(*t)

# School subjects / objects extra
extra = [
("color","색깔","noun","What color?","무슨 색깔인가요?","1","🎨","extra"),
("shape","모양","noun","Round shape.","둥근 모양.","1","⬜","extra"),
("circle","원","noun","Draw a circle.","원을 그려라.","1","⭕","extra"),
("square","정사각형","noun","Square has 4 sides.","정사각형은 변이 4개 있다.","1","⬜","extra"),
("triangle","삼각형","noun","Triangle has 3 sides.","삼각형은 변이 3개 있다.","1","🔺","extra"),
("rectangle","직사각형","noun","Rectangle is long.","직사각형은 길다.","2","▬","extra"),
("line","선/줄","noun","Draw a line.","선을 그려라.","1","➖","extra"),
("point","점","noun","A point is small.","점은 작다.","2","•","extra"),
("angle","각","noun","Right angle.","직각.","2","📐","extra"),
("side","변/옆","noun","Side of square.","정사각형의 변.","2","📏","extra"),
("edge","가장자리","noun","Edge of table.","테이블 가장자리.","2","📐","extra"),
("center","가운데/중심","noun","Center of circle.","원의 중심.","2","🎯","extra"),
("top","위","noun","Top of page.","페이지 위.","1","⬆️","extra"),
("bottom","아래","noun","Bottom of page.","페이지 아래.","1","⬇️","extra"),
("middle","중간","noun","Middle of road.","도로 중간.","1","↔️","extra"),
("size","크기","noun","What size?","크기가 얼마인가요?","1","📏","extra"),
("weight","무게","noun","Weight of bag.","가방의 무게.","2","⚖️","extra"),
("length","길이","noun","Length of rope.","줄의 길이.","2","📏","extra"),
("height","높이","noun","Height of tree.","나무의 높이.","2","📏","extra"),
("width","너비","noun","Width of door.","문의 너비.","2","📏","extra"),
("speed","속도","noun","Car speed.","자동차 속도.","2","🚀","extra"),
("sound","소리","noun","Loud sound.","큰 소리.","1","🔊","extra"),
("light","빛/가벼운","noun","Light is bright.","빛은 밝다.","1","💡","extra"),
("dark","어두운","adjective","Dark room.","어두운 방.","1","🌑","extra"),
("quiet","조용한","adjective","Be quiet.","조용히 해라.","1","🤫","extra"),
("loud","시끄러운","adjective","Loud music.","시끄러운 음악.","1","🔊","extra"),
("soft","부드러운","adjective","Soft pillow.","부드러운 베개.","1","🪶","extra"),
("hard","딱딱한","adjective","Hard rock.","딱딱한 돌.","1","🪨","extra"),
("smooth","매끄러운","adjective","Smooth surface.","매끄러운 표면.","2","✨","extra"),
("rough","거친","adjective","Rough road.","거친 길.","2","🪵","extra"),
("sharp","날카로운","adjective","Sharp knife.","날카로운 칼.","2","🔪","extra"),
("dull","무딘","adjective","Dull pencil.","무딘 연필.","3","✏️","extra"),
("heavy","무거운","adjective","Heavy box.","무거운 상자.","1","📦","extra"),
("light (adj)","가벼운","adjective","Light bag.","가벼운 가방.","1","🎒","extra"),
("full","가득 찬","adjective","Full glass.","가득 찬 컵.","1","🥤","extra"),
("empty","빈","adjective","Empty box.","빈 상자.","1","📦","extra"),
("open (adj)","열린","adjective","Open door.","열린 문.","1","🚪","extra"),
("closed","닫힌","adjective","Closed shop.","닫힌 가게.","1","🚪","extra"),
]
for t in extra: add(*t)

# Fix one typo entry (red meaning)
for w in words:
    if w["word"]=="red":
        w["meaning"]="빨간색"

# assign ids unique
seen=set()
uniq=[]
for w in words:
    key=w["word"].lower()
    if key in seen:
        continue
    seen.add(key)
    uniq.append(w)
words=uniq

for i,w in enumerate(words,1):
    w["id"]=f"w{i:03d}"

os.makedirs("C:/Users/user/minjun/data", exist_ok=True)
with open("C:/Users/user/minjun/data/vocabulary.json","w",encoding="utf-8") as f:
    json.dump({"version":"1.0.0","contentVersion":"2026-11-11","words":words}, f, ensure_ascii=False, indent=2)
print("count", len(words))
