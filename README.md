# minjun-study

민준이(초등 4학년)를 위한 정적 학습 대시보드입니다. 서버 없이 HTML/CSS/JavaScript로 동작하며 GitHub Pages에서 실행할 수 있습니다.

## 실행 방법

1. 이 폴더를 그대로 사용합니다.
2. 로컬 확인:
   ```bash
   python -m http.server 8765
   ```
   브라우저에서 `http://localhost:8765/` 를 엽니다.
3. 파일을 직접 열어도 대부분 동작하지만, 데이터 fetch를 위해 로컬 서버 사용을 권장합니다.

## 폴더 구조

- `index.html`
- `css/style.css`, `css/print.css`
- `js/` (dateutil, storage, math-generator, math-grade, speech, english, calendar, settings, app)
- `data/vocabulary.json`, `data/math-config.json`
- `assets/`
- `tests/validate-data.js`, `tests/run-tests.js`
- `README.md`

## 테스트

```bash
node tests/validate-data.js
node tests/run-tests.js
```

## GitHub Pages 배포

1. GitHub에서 새 저장소를 만듭니다 (예: `minjun-study`).
2. 이 폴더의 파일을 업로드합니다.
3. 저장소 Settings > Pages > Source 를 `main` 브랜치 / 루트로 설정합니다.
4. 배포 주소는 `https://<사용자명>.github.io/minjun-study/` 형태입니다.
   실제 주소는 저장소 설정에서 확인하세요. (임의로 보고하지 않습니다.)

모든 경로는 상대 경로(`data/...`)를 사용하므로 프로젝트 하위 경로에서도 동작합니다. 서비스 워커는 포함하지 않았습니다.

## 보호자 설정

- 수학 단원 선택: 설정 탭에서 체크박스로 단원을 끄거나 켤 수 있습니다.
- 난이도: 쉬움/보통/도전 문제 수를 조정할 수 있습니다.
- 음성/속도/따라 말하기 대기 시간: 설정 탭에서 조정합니다.
- JSON 내보내기/가져오기: 설정 탭 버튼을 사용합니다. 기록은 이 기기의 이 브라우저에만 저장됩니다.

## 단어 데이터 형식

`data/vocabulary.json`:

```json
{
  "version": "1.0.0",
  "contentVersion": "2026-11-11",
  "words": [
    {
      "id": "w001",
      "word": "apple",
      "meaning": "사과",
      "pos": "noun",
      "example": "I eat an apple.",
      "exampleMeaning": "나는 사과를 먹는다.",
      "difficulty": "1",
      "icon": "🍎",
      "category": "food",
      "audioUrl": null
    }
  ]
}
```

- `audioUrl`이 있으면 음원 파일을 사용하고, 없으면 브라우저 음성을 사용합니다.
- 새 단어를 추가할 때는 id를 중복되지 않게 부여하세요.

## 수학 설정 형식

`data/math-config.json`의 `units`에서 `weight`를 조정하면 단원별 출제 비율이 바뀝니다. `enabledByDefault`는 기본값일 뿐, 실제 사용 여부는 설정 화면에서 보호자가 조정합니다.

## 검증 도구

`tests/validate-data.js`는 중복 ID, 필수 필드 누락, 중복 단어를 검사합니다. `tests/run-tests.js`는 날짜별 생성, 채점, 철자 비교 등을 검사합니다.

## ChatGPT 연동(향후)

- 단어장/문장제 데이터는 JSON 형식으로 추가할 수 있습니다.
- 새 데이터가 잘못되어도 앱이 멈추지 않도록 fetch 실패 시 기본값으로 처리합니다.
- 기존 학습 기록은 localStorage에 별도 저장되므로 데이터 파일 업데이트 시에도 보존됩니다.

## 음성(TTS) 확장

- 현재는 브라우저 Web Speech API를 사용합니다.
- Google Cloud TTS 등 유료 API는 이번 버전에서 사용하지 않습니다.
- API 키를 프론트엔드나 공개 저장소에 넣지 마세요.
- 향후 서버리스 프록시를 통해 음원을 생성하고 `audioUrl`로 연결할 수 있습니다.

## 한계 / 추가 확인 필요

- 음성 목록과 발음 품질은 기기/브라우저마다 다릅니다.
- 자동 테스트로 확인하지 못한 항목: 실제 기기 음성 재생, 따라 말하기 타이밍, A4 인쇄 레이아웃, 모바일 키보드 입력.
- GitHub Pages 배포 주소는 실제 배포 후 확인해야 합니다.
