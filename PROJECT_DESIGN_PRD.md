# 📱 모의 크라우드펀딩 (CROWDFUND) 서비스 기획안 및 UI/UX 디자인 명세서
> **Google AI Studio / UI Mockup 프롬프트 및 디자인 가이드용 통합 PRD**  
> 대상: 2026 대학생 창업·창작 프로젝트 데모데이 모의 크라우드펀딩 플랫폼

---

## 1. 프로젝트 개요 (Overview)

### 1.1 서비스 목적
- 대학생 창업·창작팀의 데모데이 행사에서 참가자(학생, 심사위원, 관람객)들이 가상 투자금(크레딧)을 활용해 마음에 드는 프로젝트에 모의 투자하고, 실시간 투자 현황을 점수로 환산하여 최종 순위를 선정하는 인터랙티브 모의 크라우드펀딩 웹 플랫폼입니다.

### 1.2 핵심 사용자 (User Roles)
1. **학생 참가자 / 팀 (STUDENT)**: 본인 프로젝트 출품 등록, 다른 팀 프로젝트 열람 및 모의 투자 (본인 팀 자가 투자는 엄격 차단).
2. **심사위원 (JUDGE)**: 전체 프로젝트 심사 및 전문 평가 크레딧 투자.
3. **총괄 운영 관리자 (ADMIN)**: 행사 진행 단계 제어, 실시간 KPI 모니터링 현황판 관리, 포인트-점수 환산 기준 입력, 빔프로젝터 랭킹 송출.

### 1.3 핵심 정책 및 비즈니스 룰
- **초기 크레딧**: 1인당 기본 10,000 CR 지급 (행사 운영자가 조정 가능).
- **투자 한도**: 1건당 최소 2,000 CR ~ 최대 5,000 CR (단위: 1,000 CR).
- **자가 투자 금지**: 본인이 속한 팀 또는 본인이 등록한 출품작에는 시스템적으로 투자가 원천 차단됨.
- **포인트-점수 환산**: 관리자가 직접 "포인트 X개당 점수 Y점" 기준을 입력하면, 각 팀이 받은 투자금이 평가 점수로 실시간 환산됨.
- **콘텐츠 보안 (저작권 보호)**: 출품작 상세 이미지 및 PDF 무단 다운로드 방지 (우클릭/드래그 차단, 뷰어 내 다운로드 버튼 숨김, 인쇄 차단).

---

## 2. 화면 구조 및 레이아웃 (Information Architecture)

```
[ 웹 플랫폼 기본 레이아웃 (데스크톱 기준) ]
┌─────────────────┬─────────────────────────────────────────────────────────────┐
│                 │ [상단] 배너 / 안내 배지 (LIVE EXHIBITION · STAGE INDICATOR) │
│  좌측 고정       ├─────────────────────────────────────────────────────────────┤
│  사이드바        │                                                             │
│  (Sidebar)      │  [메인 콘텐츠 뷰어 (탭 전환 방식)]                            │
│                 │                                                             │
│ 1. 로고 & 행사명 │  - Tab 1: 프로젝트 둘러보기 (전체 갤러리)                     │
│ 2. 단계 인디케이터│  - Tab 2: 내 투자 내역 (포트폴리오)                          │
│ 3. 내 크레딧 카드│  - Tab 3: 내 팀 프로젝트 (등록 및 관리)                       │
│ 4. 메인 메뉴     │  - Tab 4: 관리자 콘솔 (실시간 현황판 & 환산 점수 설정)       │
│ 5. 출품 등록 버튼│                                                             │
│ 6. 하단 내 정보  │  [팝업/모달]                                                │
│                 │  - 프로젝트 상세 뷰어 (G마켓 세로 상세페이지 or PDF 보안 뷰어)│
│                 │  - 새 프로젝트 출품 등록/수정 모달                           │
│                 │  - 빔프로젝터 랭킹 송출 전광판 (관리자 전용 대형 뷰)          │
└─────────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 3. 핵심 페이지별 UI/UX 상세 기획 (Screen Specifications)

### 3.1 로그인 / 회원가입 (Authentication)
* **디자인 톤**: 불필요한 장식 없는 클린 미니멀 화이트/다크블루 스타일.
* **구성 요소**:
  - **로그인 폼**: 이메일, 비밀번호, [로그인] 버튼, [비밀번호 찾기(관리자 문의)] 안내.
  - **회원가입 폼**: 이메일, 비밀번호, 이름, 소속 대학교/기관, 학과/부서, 학번, 개인정보 수집 동의 체크박스.
  - *(참고)* 회원가입 시 팀 선택은 제외됨 (출품작 등록 시 팀명을 작성하면 팀이 자동 생성 및 매핑됨).
  - 테스트/더미 계정 목록이 보이지 않는 정갈한 기업형 로그인 UI.

---

### 3.2 좌측 내비게이션 사이드바 (Navigation Sidebar)
* **특징**: 고정(Sticky) 사이드바, 은은한 보더와 블러 배경.
* **구성 요소**:
  1. **헤더**: 플랫폼 로고(`CROWDFUND`), 행사명, 현재 진행 상태 배지 (예: `펀딩 진행 중`).
  2. **내 지갑 카드 (Wallet Card)**:
     - 보유 잔여 크레딧: 큰 폰트로 강조 (`8,000 CR`)
     - 게이지 바 (Progress Bar): 총 10,000 CR 중 사용률 시각화
     - 사용한 크레딧 / 남은 크레딧 서브 텍스트
  3. **메뉴 리스트**:
     - 🧭 프로젝트 둘러보기 (`Gallery`)
     - 💼 내 투자 내역 (`My Investments`)
     - 🚀 내 팀 프로젝트 (`My Team Project`)
     - ⚙️ 관리자 콘솔 (`Admin Dashboard` - 관리자에게만 노출)
  4. **행동 유도 버튼 (CTA)**:
     - `+ 새 프로젝트 출품 등록` (파란색 포인트 버튼)
  5. **하단 프로필 (User Profile)**:
     - 사용자 아바타, 이름, 역할 태그(`학생`, `심사위원`, `관리자`), 소속 팀명, 로그아웃 버튼.
     - *(보안/권한 정책)* 사용자 화면의 사이드바에는 빔프로젝터 송출 버튼이 없으며, 오직 관리자 화면에서만 송출 가능.

---

### 3.3 프로젝트 둘러보기 메인 (Project Gallery)
* **Hero 섹션**:
  - `DEMODAY 2026 · LIVE EXHIBITION` 펄스 인디케이터 배지.
  - 타이틀: "세상을 바꿀 혁신적인 대학생 아이디어에 직접 모의 투자하세요."
  - 단계 설명 카드: "1인당 10,000 CR 지급 · 건당 2,000~5,000 CR 투자 가능"
* **검색 & 필터 툴바**:
  - 검색창 (프로젝트명, 팀명, 키워드 검색)
  - 정렬 필터: 인기순(모금액순), 최신순, 팀 번호순
* **프로젝트 카드 그리드 (Project Cards)**:
  - 반응형 카드 레이아웃 (3열 그리드).
  - **카드 내부 UI**:
    - 썸네일 이미지 (16:9 비율, 호버 시 부드러운 줌 효과)
    - 상단 배지: 팀 번호 (`Team 01`), 포맷 배지 (`IMAGE` / `PDF` / `WEB`)
    - 팀명 및 프로젝트 타이틀 (볼드)
    - 2줄 요약 설명 (줄임표 처리)
    - 투자 성과 인디케이터:
      - 모금액 게이지 바 & 수치 (`4,000 CR / 40%`)
      - 참여 투자자 수 (`3명 참여`)
    - [프로젝트 보기 및 모의투자] 버튼

---

### 3.4 프로젝트 상세 뷰어 & 모의투자 모달 (Detail View & Investment)
* **레이아웃**: 좌측 상세 콘텐츠 영역 (70%) + 우측 고정 플로팅 투자 패널 (30%).
* **좌측: G마켓/와디즈 스타일 세로 상세페이지 (Scrollable Content)**:
  - 출품작 제목, 팀명, 출품자 정보.
  - **상세 콘텐츠 (3가지 포맷 지원)**:
    1. **IMAGE 포맷**: 긴 세로 상세 이미지들이 끊김 없이 위아래로 연속 나열되는 쇼핑몰 상세페이지 스타일.
    2. **PDF 포맷**: 브라우저 임베디드 뷰어.
    3. **HTML 포맷**: 반응형 웹 데모 iframe 시연 창.
  - **저작권 및 보안 방지 기능**:
    - 이미지 마우스 우클릭 금지 (`contextmenu` 차단)
    - 이미지 드래그 방지 (`user-select: none`, `pointer-events`)
    - PDF 브라우저 툴바 내비게이션의 다운로드/인쇄 버튼 차단 (`#toolbar=0`)
    - 단축키(`Ctrl+S`, `Ctrl+P`) 차단
* **우측: 플로팅 모의투자 위젯 (Floating Investment Widget)**:
  - 현재 펀딩 모금 총액 (`₩ 8,000 CR`) & 달성률
  - 참여자 수
  - **투자 슬라이더 & 프리셋 버튼**:
    - 최소 2,000 CR ~ 최대 5,000 CR (1,000 단위 슬라이더)
    - 퀵 버튼: `+2,000 CR`, `+3,000 CR`, `+5,000 CR`, `전액 투자`
  - 본인 잔여 크레딧 확인 텍스트
  - **[이 프로젝트에 모의투자하기]** 대형 CTA 버튼
  - *(차단 정책)* 본인 팀의 출품작인 경우:
    - 주황색 경고 배너 표출: "⚠️ 본인이 출품한 프로젝트에는 투자할 수 없습니다 (자가 투자 방지 정책)"
    - 투자 버튼 비활성화 (Disabled)

---

### 3.5 새 프로젝트 출품 등록 모달 (Project Form Modal)
* **기능**: 학생 또는 관리자가 새 출품작을 등록하는 단계별 폼.
* **입력 필드**:
  1. **팀명 (Team Name)**: 텍스트 입력창.
     - *(동기화 룰)* 입력 즉시 Supabase `teams` 테이블에 팀 정보 자동 등록 및 사용자 프로필 소속팀 매핑.
  2. **프로젝트명 (Title)** & **한 줄 요약 (Summary)**.
  3. **상세 설명 (Description)**: 여러 줄 텍스트 영역.
  4. **대표 썸네일 이미지 업로드**: 파일 드래그앤드롭 박스 (미리보기 지원).
  5. **상세페이지 포맷 선택 (라디오/탭)**:
     - 🖼️ **상세 이미지 여러 장**: 다중 이미지 업로드 후 순서대로 나열.
     - 📄 **PDF 발표자료**: PDF 파일 업로드 (25MB 제한).
     - 🌐 **웹 시연 링크**: 웹 데모 URL 입력.
  6. **[출품작 등록 완료]** 버튼 (성공 시 축하 컨페티 효과 발생).

---

### 3.6 내 투자 내역 (My Investments)
* **요약 통계**: 총 투자 금액, 참여한 프로젝트 수, 남은 투자 가능 크레딧.
* **투자 목록 카드**:
  - 투자한 프로젝트 썸네일, 프로젝트명, 팀명.
  - 내가 투자한 금액 (`3,000 CR`).
  - 투자 일시 (`2026-10-19 14:30`).
  - [투자 취소] 버튼 (펀딩 진행 중 단계에서만 활성화, 취소 시 크레딧 즉시 환급).

---

### 3.7 총괄 관리자 대시보드 (Admin Dashboard)
* **접근 권한**: 관리자(`ADMIN`) 전용.
* **핵심 기능 4대 영역**:
  1. **실시간 현황판 (Real-time KPI Summary)**:
     - 총 모금 누적 크레딧
     - 총 투자 발생 건수
     - 1인당 평균 투자 금액
     - 등록된 출품작 수 & 가입 회원 수
  2. **포인트-점수 환산기 (Point-to-Score Converter)**:
     - **설명**: "각 팀이 획득한 크레딧 포인트를 심사 평가 점수로 환산하는 기준을 설정합니다."
     - **입력 칸**:
       - `[ 1,000 ] CR 당 = [ 10 ] 점으로 환산`
     - **실시간 결과 테이블**:
       - 순위 / 팀명 / 모금 크레딧 / **환산 최종 점수 (자동 계산)** / 투자자 수
  3. **행사 단계 제어 (Stage Controller)**:
     - 5단계 전환 버튼: `01. 준비 중` ➜ `02. 출품 등록` ➜ `03. 펀딩 진행` ➜ `04. 펀딩 마감` ➜ `05. 랭킹 공개`
     - 클릭 즉시 전체 사용자 페이지에 실시간 반영.
  4. **빔프로젝터 랭킹 송출 버튼**:
     - `[ 🏆 빔프로젝터 대형 랭킹 전광판 송출 ↗ ]` 강조 버튼
     - 클릭 시 새 창 또는 전체화면 모드로 전광판 뷰 팝업 오픈.
  5. **출품작 및 참가자 관리**:
     - 프로젝트 공개/숨김 토글, 강제 삭제.
     - 비밀번호 분실 참가자 임시 비밀번호 초기화 기능.

---

### 3.8 빔프로젝터 대형 스크린 랭킹 전광판 (Projector Screen View)
* **디자인 컨셉**: 미래지향적 다크 네이비 테마 (`#0B0F19`), 네온 골드/블루 하이라이트, 대형 TV/빔프로젝터 최적화.
* **상단 헤더**:
  - 행사 공식 타이틀, 대형 로고, `실시간 집계 중(LIVE)` 애니메이션 인디케이터.
* **1~3위 특별 포디움 (Top 3 Podium)**:
  - 1위 (Gold): 대형 왕관 아이콘, 금빛 글로우, 팀명, 득표 크레딧, 환산 점수.
  - 2위 (Silver): 은빛 카드.
  - 3위 (Bronze): 동빛 카드.
* **4위 이하 리스트**:
  - 깔끔한 글래스모피즘 테이블 형태로 스크롤 또는 순차 표출.
* **시각 효과**:
  - 결과 공개 버튼 클릭 시 화면 전체에 화려한 컨페티(꽃가루) 애니메이션 폭발.

---

## 4. UI/UX 디자인 시스템 가이드 (For Google AI Studio Prompts)

구글 AI 스튜디오에서 화면 프롬프트를 작성할 때 활용할 디자인 키워드입니다:

```json
{
  "theme": "Modern Fintech SaaS & University DemoDay Hybrid",
  "style": "Clean Minimalist, Glassmorphism, Micro-interactions",
  "color_palette": {
    "background_light": "#F8FAFC",
    "surface_white": "#FFFFFF",
    "primary_blue": "#0052FF",
    "primary_gradient": "linear-gradient(135deg, #0052FF 0%, #3B82F6 100%)",
    "accent_cyan": "#06B6D4",
    "text_headline": "#0F172A",
    "text_body": "#475569",
    "border_subtle": "#E2E8F0",
    "dark_projector_bg": "#0B0F19",
    "gold_rank1": "#F59E0B"
  },
  "typography": {
    "font_family": "Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif",
    "number_font": "JetBrains Mono (For credits and scores)"
  },
  "components": {
    "buttons": "Rounded-xl, subtle drop shadow, hover translateY(-1px)",
    "cards": "Rounded-2xl, border-slate-200/80, hover shadow-lg, smooth transition",
    "badges": "Pill-shaped rounded-full, soft colored bg with contrast text"
  }
}
```

---

## 5. 구글 AI 스튜디오 추천 프롬프트 예시 (Copy & Paste)

```markdown
Prompt:
"Design a premium modern Web App UI for a University Startup Demo Day Mock Crowdfunding Platform called 'CROWDFUND'.

The app has 3 main views to generate:
1. Student Gallery & Project Detail:
   - Left Sidebar: Logo, Funding Stage badge, User Wallet Card showing remaining credits (8,000 / 10,000 CR) with a progress bar, navigation items, '+ Submit Project' button, and user profile at the bottom.
   - Main Content: Hero banner 'DEMODAY 2026 LIVE', search bar, filter tabs, and 3-column project cards with team badge, title, funding progress bar, and backer count.
   - Detail Modal: Long vertical product page (Coupang/Wadiz style) with an image list, and a right floating sticky investment widget allowing users to invest 2,000 to 5,000 CR with sliders and preset buttons. Include self-investment block warning.

2. Admin Real-time Control Dashboard:
   - KPI Stat cards (Total Credits Raised, Total Investments, Avg Investment, Participant Count).
   - Point-to-Score Converter: Input box where admin types 'Every [ 1,000 ] CR = [ 10 ] Points', which dynamically recalculates team scores.
   - Stage Controller buttons (Preparing -> Open -> Closed -> Published).
   - Big CTA button: 'Launch Projector Ranking Screen'.

3. Projector Live Ranking Screen (Dark Mode):
   - Dark navy background with neon gold and blue accents.
   - Top 3 Podium for rank 1, 2, 3 with score, credits, and medals.
   - Modern leaderboard table for ranks 4+.
   - Clean, high-contrast, large-font design optimized for 16:9 4K beam projector display."
```
