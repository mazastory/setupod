# MEMOPOD 2.0 & THREADS AUTOPILOT 전체 제작 히스토리 & 진화 일지
> **Project Evolution Chronicle & Architecture Master Log**  
> 작성일자: 2026년 10월 17일 | 총괄 기획 & 디렉팅: 대표님 | 파트너: Antigravity AI

---

## 📌 1. 프로젝트의 탄생 배경과 철학 (Why We Built This)

### 기존 메모 툴의 3대 고질병
1. **노션(Notion)의 비대화**: 메모 하나 적으려는데 로딩 3초, 무거운 에디터 때문에 떠오른 아이디어가 증발함.
2. **카카오톡 '나에게 보내기'의 무덤화**: 링크와 생각들을 마구 던져두지만 검색도 안 되고 영원히 잊혀짐.
3. **실행(Action) 부재**: 메모는 열심히 적는데 정작 '오늘 당장 무엇을 해야 하는가(To-Do)'로 연결되지 않음.

### 우리의 해결책: '2-티어(Tier) 분리 하이브리드 시스템'
- **Tier 1 (바탕화면)**: 0.2초 만에 단축키로 툭 띄우는 **0.2MB 초경량 미니 메모장** (Apple Notes 3단 UI).
- **Tier 2 (웹 지휘소)**: 적어둔 낙서들을 AI가 분석하여 **3D 지식 그래프**로 엮어주고 **Action Plan**을 도출하는 관제센터.

---

## 💡 2. 비즈니스 전략의 대전환 (대표님의 날카로운 결단)

- **초기 계획**: 네이버 스마트스토어에 바로 유료 디지털 상품으로 등록하려 함.
- **대표님의 전략적 대전환**:
  > *"이걸 지금 당장 네이버에 유료로 내놓지 말고, 테스트 버전으로 다운로드하게 하고 업데이트하면서 시장조사를 해보는 게 어때? 옛 버전을 업데이트하게 하면서 유료가 되든 리드를 받든 그때 결정하는 거지."*
- **전환 결과 (Product-Led Growth)**:
  - 진입 장벽 0%의 **무료 얼리액세스 베타** 모델 채택.
  - 웹 상세페이지(`setupod.com/memopod`)를 제품 설명서 겸 무료 다운로드 창구로 활용.
  - 쓰레드(Threads)를 통해 충성 오가닉 트래픽을 모으는 전략으로 피벗 성공.

---

## 🛠️ 3. 인스톨러 & 안정성 엔지니어링

1. **초경량 네이티브 패키징**:
   - **macOS**: `build_dmg.py`를 통해 0.26MB 초경량 DMG 인스톨러 빌드.
   - **Windows**: `build_exe.py`를 통해 0.07MB 초경량 Portable ZIP 패키징.
2. **서버 멀티스레드 & 안정성 혁신 (`server.py`)**:
   - 기존 단일 스레드 `socketserver.TCPServer`의 리소스 점유 및 `ERR_CONNECTION_REFUSED` 에러 해결.
   - `socketserver.ThreadingMixIn` 기반 동시 접속 처리 구현.
   - 파이썬 환경이 깨져있어도 `file://` 프로토콜로 100% 실행되는 무결점(Zero-Dependency) 폴백 탑재.
3. **IDE 린터 충돌 완벽 해결**:
   - DMG 빌드 시 생성되는 `dmg_staging/Applications` 심볼릭 링크를 빌드 완료 즉시 자동 청소(`unlink`)하도록 개선하여 에러 0건 달성.

---

## 🚀 4. 쓰레드(Threads) 바이럴 시스템 & 6편 릴레이

### 메타 알고리즘 필승 치트키
- **첫 번째 댓글(대댓글) 링크 전략**:
  본문에 외부 링크(URL)를 넣으면 메타 알고리즘상 도달률(Reach)이 급감하므로, **본문에는 개발 스토리텔링을 유지하고 첫 댓글(`POST_REPLY`)에 무료 다운로드 링크를 자동 등록**.

### 6단계 바이럴 릴레이 구성 ([THREADS_VIRAL_POSTS.md](file:///Users/m/Documents/GitHub/memopod/docs/THREADS_VIRAL_POSTS.md))
- **Part 1 [런칭]**: 노션이 너무 무거워서 제 입맛대로 만든 0.2MB 초경량 메모장
- **Part 2 [공감]**: 카카오톡 '나에게 보내기'에 메모 500개 쌓인 사람들의 특징
- **Part 3 [충격]**: 폴더식 메모의 시대는 끝났습니다 (3D 지식 그래프)
- **Part 4 [피드백]**: 베타 테스터 분들의 피드백을 받습니다 (빌딩 인 퍼블릭)
- **Part 5 [로드맵]**: v2.1 기능 예고 및 얼리버드 평생 혜택
- **Part 6 [대표님 아이디어 추가]**: 아이폰/아이패드 애플 순정 메모 0초 iCloud 연동 비법

---

## 🖥️ 5. Threads 관제 시스템의 진화 (CLI ➔ Web ➔ Vercel 배포)

1. **저장소 이전 및 모듈화**:
   - M 드라이브의 코드를 [`/Users/m/Documents/GitHub/threads-autopilot`](file:///Users/m/Documents/GitHub/threads-autopilot)으로 이전 및 Git 초기화.
   - 하드코딩되어 있던 설정을 `campaigns/memopod.js` 데이터셋으로 모듈화.
2. **웹 커맨드 센터 (`http://localhost:3400`) 구축**:
   - 터미널을 몰라도 브라우저에서 마우스 클릭으로 조작하는 Web GUI 완성.
   - 실제 Threads 스마트폰 피드와 동일한 **WYSIWYG 라이브 목업**.
   - Server-Sent Events (SSE) 기반 실시간 터미널 관제 콘솔.
3. **Vercel 실서버 배포 (`https://setupod.com/thread`)**:
   - 대표님의 요청으로 `setupod` 저장소에 서브패스 배포.
   - `<base href="/thread/">` 경로 보정으로 CSS 깨짐 방지 완료.
   - 어디서든 폰이나 PC에서 원클릭으로 카피북을 복사할 수 있는 `[📋 전체 복사]` 기능 탑재.

---

## 🛡️ 6. 데이터 유실 방지와 클라우드 금고 (유료화 비즈니스 훅)

- **대표님의 결정적 문제 제기**:
  > *"이게 기기 간 통신이 로그인 없이 가능하지만, 기록이 날아갈 수 있잖아."*
- **해결 및 비즈니스 전환 모델**:
  - **1차 로컬 금고**: 내 PC 디스크 파일(`notes.json`/SQLite)에 저장되어 브라우저 캐시 삭제 시에도 데스크톱은 100% 안전.
  - **2차 클라우드 금고 (`cloud-sync.js`)**:
    - **Supabase 기반 카카오/구글 1초 로그인**.
    - 아이폰 ⇄ 아이패드 ⇄ 맥북 ⇄ 윈도우 양방향 실시간 동기화.
    - "캐시 삭제에도 안전한 평생 클라우드 금고"라는 명분으로 **이메일 리드 확보 및 유료 PRO 전환 유도**.
  - **오프라인 백업**: JSON 내보내기/불러오기로 데이터 안전성 200% 보장.

---

## 📂 7. 레포지토리 및 핵심 자산 맵

| 레포지토리 / 위치 | 주요 역할 | 핵심 파일 |
| :--- | :--- | :--- |
| **`memopod/`** | 0.2MB 인스톨러 & 메모 코어 | `build_dmg.py`, `quick.html`, `server.py`, `js/cloud-sync.js` |
| **`threads-autopilot/`** | 쓰레드 자동화 봇 & 로컬 웹 관제소 | `server.js`, `cli.js`, `campaigns/memopod.js`, `web/` |
| **`setupod/`** | 메인 서비스 & Vercel 배포 | `setupod.com/memopod`, `setupod.com/thread`, `vercel.json` |
| **`docs/`** | 마스터 전략 & 카피북 | `REVENUE_STRATEGY.md`, `SMARTSTORE_LISTING_PACK.md`, `THREADS_VIRAL_POSTS.md`, `PROJECT_EVOLUTION_CHRONICLE.md` |

---

> **기록 보존 완료**: 이 문서는 향후 투자 유치, 팀원 온보딩, 제품 브랜딩 스토리텔링의 원천 소스로 영구 보존됩니다.
