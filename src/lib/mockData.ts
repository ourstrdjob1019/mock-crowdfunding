import { Event, Project, User, Investment, RosterItem } from "@/types";

export const INITIAL_EVENT: Event = {
  id: "evt-2026-fall-01",
  name: "2026 서원대학교 SPARK 창업챌린지(모의 크라우드펀딩 대회)",
  institution: "서원대학교",
  session: "2026 SPARK 창업챌린지",
  eventDate: "2026-10-27",
  baseCredit: 10000,
  minInvestment: 2000,
  maxInvestment: 5000,
  currentStage: "FUNDING_OPEN",
  isRankingPublic: true,
  creditUnitForScore: 1000,
  scorePerCreditUnit: 10,
};

export const INITIAL_ROSTER: RosterItem[] = [
  {
    email: "student@demoday2026.ac.kr",
    name: "김서연",
    role: "STUDENT",
    teamId: "team-01",
    teamName: "넥스트웨이브",
    institution: "서원대학교",
    department: "바이오메디컬공학과",
    studentNumber: "2022145021",
  },
  {
    email: "judge@demoday2026.ac.kr",
    name: "한동훈",
    role: "JUDGE",
    institution: "한국청년엔젤투자클럽",
    department: "심사평가단",
    studentNumber: "J2026-001",
  },
  {
    email: "admin@demoday2026.ac.kr",
    name: "총괄 관리자",
    role: "ADMIN",
    institution: "창업지원단",
    department: "운영본부",
    studentNumber: "ADM-001",
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: "user-01",
    email: "student@demoday2026.ac.kr",
    name: "김서연",
    role: "STUDENT",
    teamId: "team-01",
    teamName: "넥스트웨이브",
    institution: "서원대학교",
    department: "바이오메디컬공학과",
    studentNumber: "2022145021",
    eventId: "evt-2026-fall-01",
    privacyAgreed: true,
    password: "password123",
  },
  {
    id: "user-judge",
    email: "judge@demoday2026.ac.kr",
    name: "한동훈",
    role: "JUDGE",
    institution: "한국청년엔젤투자클럽",
    department: "심사평가단",
    studentNumber: "J2026-001",
    eventId: "evt-2026-fall-01",
    privacyAgreed: true,
    password: "password123",
  },
  {
    id: "user-admin",
    email: "admin@demoday2026.ac.kr",
    name: "총괄 관리자",
    role: "ADMIN",
    institution: "창업지원단",
    department: "운영본부",
    studentNumber: "ADM-001",
    eventId: "evt-2026-fall-01",
    privacyAgreed: true,
    password: "password123",
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-01",
    eventId: "evt-2026-fall-01",
    teamId: "team-01",
    teamName: "넥스트웨이브",
    teamNumber: 1,
    title: "뉴로싱크 (NeuroSync) - 초음파 뇌파 동기화 기반 수면 최적화 슬립테크",
    summary: "비침습 집속 초음파와 실시간 EEG 센싱 기술을 융합하여 렘수면 및 깊은 수면 시간을 38% 증진시키는 수면 헬스케어 디바이스 & 구독형 AI 케어 솔루션입니다.",
    description: "현대인의 만성 수면장애와 집중력 저하 문제를 해결하기 위해 대학 연구실의 뇌공학 원천 특허를 기반으로 창업한 슬립테크 하드웨어 스타트업입니다. 특허받은 tFUS(경두개 집속초음파) 모듈과 전두엽 뇌파 피드백 루프를 통해 수면 단계별 최적 주파수를 자율 변조합니다.",
    category: "Bio/Health",
    landingFormat: "IMAGE",
    thumbnailUrl: "https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=900&q=80",
    landingUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1200&q=80",
    landingImages: [
      "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1200&q=80"
    ],
    detailImages: [
      "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1200&q=80"
    ],
    targetCredits: 25000,
    totalCredits: 14000,
    investorCount: 4,
    lastModifierName: "김서연",
    lastModifiedAt: "2026-10-19 11:00",
    isHidden: false,
    authorId: "user-01",
    authorName: "김서연",
    authorEmail: "student@demoday2026.ac.kr",
    isUserProject: true,
    pitchHighlights: [
      "국내 1위 수면의학센터 임상 시험 유효성 검증 (수면 효율 +38.4%)",
      "경량화 헤어밴드형 디바이스 자체 설계 및 PCT 국제 특허 2건 출원",
      "사전 B2C 예약 구매자 1,200명 확보 및 월 구독형 B2B 웰니스 플랜 런칭"
    ],
    teamMembers: [
      { name: "김서연", role: "대표 / 바이오메디컬 공학" },
      { name: "박진우", role: "CTO / 뇌신경 신호처리 박사과정" },
      { name: "이지민", role: "CPO / UX & 프로덕트 디자인" }
    ],
    comments: [
      { id: "c1", author: "한동훈", team: "엔젤투자클럽", amount: 3000, message: "임상 데이터 기반이라 신뢰도가 매우 높습니다. 시제품 완성도 기대됩니다!", timestamp: "14:22" },
      { id: "c2", author: "최유나", team: "소프트웨어학과", amount: 2000, message: "수면 부족인 대학생들에게 정말 절실한 아이템이네요 응원합니다!", timestamp: "15:10" }
    ]
  },
  {
    id: "proj-02",
    eventId: "evt-2026-fall-01",
    teamId: "team-02",
    teamName: "하이퍼스케일",
    teamNumber: 2,
    title: "플로우코어 (FlowCore) - 엔터프라이즈 멀티모달 자율 AI 에이전트 오케스트레이터",
    summary: "코드 생성, 문서 파싱, 데이터베이스 쿼리를 자체 판단으로 수행하는 기업용 협업 AI 워크플로우 자동화 엔진입니다.",
    description: "복잡한 사내 ERP/레거시 시스템과 최신 대형 언어 모델을 노코드 블록으로 연결하여 실무자의 수작업 업무를 최대 80% 자동화합니다. 보안 규제를 준수하는 온프레미스 경량화 모델 배포 파이프라인을 내장했습니다.",
    category: "AI/SaaS",
    landingFormat: "WEB",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80",
    landingUrl: "https://example.com",
    targetCredits: 30000,
    totalCredits: 28000,
    investorCount: 8,
    lastModifierName: "정민호",
    lastModifiedAt: "2026-10-19 10:30",
    isHidden: false,
    authorId: "user-02",
    authorName: "정민호",
    authorEmail: "flowcore@team.ac.kr",
    isUserProject: false,
    pitchHighlights: [
      "오픈소스 커뮤니티 GitHub Star 4.2k 달성 및 글로벌 개발자 유입",
      "국내 중견 제조/물류 3개사 대상 유료 PoC 계약 체결 (연 1.8억원 규모)",
      "실시간 API 오케스트레이션 지연 시간 120ms 미만 초경량 엔진"
    ],
    teamMembers: [
      { name: "정민호", role: "CEO / AI 시스템 아키텍트" },
      { name: "송아름", role: "Lead ML Engineer" },
      { name: "류태양", role: "Full-stack Platform Engineer" }
    ],
    comments: [
      { id: "c3", author: "김서연", team: "넥스트웨이브 Team 01", amount: 2000, message: "기술 스택이 탄탄하고 UI 오케스트레이션이 매끄럽네요. 투자 완료!", timestamp: "13:05" },
      { id: "c4", author: "배준혁", team: "컴퓨터공학과", amount: 4000, message: "노코드 AI 에이전트 트렌드에 최적화된 비즈니스 모델입니다.", timestamp: "14:50" }
    ],
    webDemoUrl: "https://example.com",
    webDemoFeatures: [
      "사내 데이터베이스 자연어 쿼리 자동 실행",
      "PDF 계약서 100건 일괄 요약 및 위험 조항 하이라이트",
      "Slack 및 Microsoft Teams 양방향 봇 알림 파이프라인"
    ]
  },
  {
    id: "proj-03",
    eventId: "evt-2026-fall-01",
    teamId: "team-03",
    teamName: "에코이노베이션",
    teamNumber: 3,
    title: "솔라퓨전 (SolarFusion) - 페로브스카이트-실리콘 탠덤 초고효율 도심형 BIPV 태양광",
    summary: "기존 태양광 대비 발전 효율 32% 달성! 반투명 건물 일체형 태양광 패널로 도시 빌딩의 탄소중립 제로에너지빌딩(ZEB) 전환을 선도합니다.",
    description: "대학 신소재공학과 연구실 기반의 클린테크 스핀오프입니다. 페로브스카이트 유무기 하이브리드 박막 코팅 기술을 통해 도심 빌딩 외벽 및 창호에 부착 가능한 가볍고 심미성이 뛰어난 건축일체형 태양광 솔루션을 개발합니다.",
    category: "GreenTech",
    landingFormat: "PDF",
    thumbnailUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=900&q=80",
    landingUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    targetCredits: 20000,
    totalCredits: 19000,
    investorCount: 6,
    lastModifierName: "강동원",
    lastModifiedAt: "2026-10-19 09:45",
    isHidden: false,
    authorId: "user-03",
    authorName: "강동원",
    authorEmail: "solar@team.ac.kr",
    isUserProject: false,
    pitchHighlights: [
      "차세대 탠덤 셀 공인 발전 효율 31.8% 공인 시험성적서 획득",
      "건축 외장재 KS 인증 및 화재 내구성 1등급 테스트 통과",
      "도심형 오피스 빌딩 실증 프로젝트 착수 (예상 연간 전기세 28% 절감)"
    ],
    teamMembers: [
      { name: "강동원", role: "대표 / 신소재공학 박사" },
      { name: "윤지원", role: "생산공정 엔지니어" },
      { name: "오세훈", role: "그린에너지 정책 & 인허가" }
    ],
    comments: [
      { id: "c5", author: "이서진", team: "지속가능발전연구소", amount: 5000, message: "BIPV 시장의 가려운 곳을 긁어주는 획기적인 기술입니다.", timestamp: "15:30" }
    ],
    pdfSlides: [
      {
        title: "SLIDE 01: 도심형 에너지 위기와 ZEB 규제",
        subtitle: "도심 고층 빌딩의 탄소 배출 규제와 기존 옥상 태양광의 면적 한계",
        content: "국내외 제로에너지빌딩 의무화 시행에 따라 도심 외벽 BIPV 수요가 연 45% 급성장 중이나, 기존 실리콘 패널은 무겁고 효율이 18% 수준에 머뭅니다.",
        keyMetrics: ["연 45% BIPV 시장 성장률", "기존 패널 대비 무게 65% 경량화", "발전 효율 31.8%"]
      },
      {
        title: "SLIDE 02: 독자적 탠덤 코팅 원천 기술",
        subtitle: "페로브스카이트 하이브리드 박막 롤투롤 연속 코팅 공정",
        content: "저온 용액 공정 기반의 롤투롤 생산 기술을 도입하여 생산 단가를 기존 대비 40% 절감하고, 가시광선 투과율 조절이 가능한 반투명 디자인을 구현했습니다.",
        keyMetrics: ["생산 원가 40% 절감", "투과율 20~50% 가변 제어", "특허 등록 4건 보유"]
      },
      {
        title: "SLIDE 03: 비즈니스 모델 및 실증 로드맵",
        subtitle: "대형 건설사 B2B 공급 및 에너지 구독형 PPA 모델 동시 추진",
        content: "2026년 하반기 서울 마포구 스마트오피스 빌딩 외벽 실증 시공 완료 예정이며, EPC 시공사 협업 파이프라인을 구축 중입니다.",
        keyMetrics: ["B2B 파트너십 3건 MOU", "손익분기점 2027년 Q3 전망", "누적 탄소저감 1,200톤"]
      }
    ]
  },
  {
    id: "proj-04",
    eventId: "evt-2026-fall-01",
    teamId: "team-04",
    teamName: "알고리듬랩",
    teamNumber: 4,
    title: "퀀텀로지스 (QuantumLogix) - 다중 에이전트 자율 물류 경로 최적화 스케줄러",
    summary: "도심 라스트마일 배송 경로를 양자 시뮬레이션 알고리즘으로 실시간 연산하여 배송 지연율 42% 감소 및 유류비 27%를 절감합니다.",
    description: "물류 센터의 재고 배치부터 화물차량 적재 및 배송 기사별 최적 경로를 복합 제약조건 하에서 수 초 만에 도출하는 AI/양자 하이브리드 솔루션입니다.",
    category: "Robotics",
    landingFormat: "WEB",
    thumbnailUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80",
    landingUrl: "https://example.com",
    targetCredits: 25000,
    totalCredits: 22000,
    investorCount: 7,
    lastModifierName: "임재현",
    lastModifiedAt: "2026-10-19 10:15",
    isHidden: false,
    authorId: "user-04",
    authorName: "임재현",
    authorEmail: "quantum@team.ac.kr",
    isUserProject: false,
    pitchHighlights: [
      "국내 택배 3사 대상 시뮬레이션 벤치마크 테스트 우위 입증",
      "실시간 교통 돌발상황 및 배송 취소 즉각 재할당 엔진 탑재",
      "클라우드 SaaS 형태로 기사 1인당 월 12,000원 접근성 높은 요금제"
    ],
    teamMembers: [
      { name: "임재현", role: "CEO / 산업공학과" },
      { name: "권하늘", role: "수리 최적화 연구원" },
      { name: "조민석", role: "GIS & 클라우드 백엔드" }
    ],
    comments: [
      { id: "c6", author: "안성민", team: "스마트모빌리티랩", amount: 3000, message: "라스트마일 물류의 효율화 알고리즘이 매우 탄탄해 보입니다.", timestamp: "16:02" }
    ],
    webDemoUrl: "https://quantumlogix-fleet.app",
    webDemoFeatures: [
      "1,000개 배송지 실시간 3초 내 최적 군집화",
      "트럭 적재 부피 3D 시각화 시뮬레이션",
      "탄소 배출 저감 및 비용 절감 대시보드"
    ]
  },
  {
    id: "proj-05",
    eventId: "evt-2026-fall-01",
    teamId: "team-05",
    teamName: "핀스마트",
    teamNumber: 5,
    title: "크레딧루프 (CreditLoop) - 긱워커 및 대학생 대체데이터(Alt-Data) 대안신용평가",
    summary: "금융 이력이 부족한 씬파일러(Thin-Filer) 청년을 위해 통신비 납부, 긱 플랫폼 평점, 깃허브 커밋 등을 분석하여 포용적 금융 기회를 제공합니다.",
    description: "전통적 금융권 신용평가의 사각지대에 놓인 대학생, 프리랜서, 초기 창업자에게 공정한 신용점수를 부여하고 저금리 마이크로 파이낸싱 연계를 돕는 핀테크 API 플랫폼입니다.",
    category: "FinTech",
    landingFormat: "IMAGE",
    thumbnailUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=900&q=80",
    landingUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    landingImages: [
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
    ],
    detailImages: [
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
    ],
    targetCredits: 20000,
    totalCredits: 16000,
    investorCount: 5,
    lastModifierName: "문태경",
    lastModifiedAt: "2026-10-19 11:20",
    isHidden: false,
    authorId: "user-05",
    authorName: "문태경",
    authorEmail: "fintech@team.ac.kr",
    isUserProject: false,
    pitchHighlights: [
      "금융위원회 혁신금융서비스 샌드박스 1차 심사 통과",
      "비금융 데이터 40여 종 머신러닝 스코어링 모델 AUC 0.89 달성",
      "인터넷전문은행 2곳과 연계 대출 모델 실증 협약 체결"
    ],
    teamMembers: [
      { name: "문태경", role: "대표 / 금융공학" },
      { name: "신다혜", role: "리스크 모델링 분석가" },
      { name: "구본승", role: "금융보안 & 컴플라이언스" }
    ],
    comments: [
      { id: "c7", author: "박소현", team: "경제학과", amount: 3000, message: "학생 입장에서 정말 공감되는 서비스입니다!", timestamp: "14:40" }
    ]
  },
  {
    id: "proj-06",
    eventId: "evt-2026-fall-01",
    teamId: "team-06",
    teamName: "에듀바이브",
    teamNumber: 6,
    title: "클래스마인드 (ClassMind) - 시선 추적과 생성형 AI 튜터 기반의 적응형 학습 솔루션",
    summary: "웹캠 기반의 동공/시선 집중도 분석과 오답 원인 진단 AI를 결합하여 학생 개개인에게 초개인화된 1:1 맞춤형 과외 경험을 제공합니다.",
    description: "단순한 인터넷 강의 수강을 넘어, 학습자가 문제를 풀며 멈칫한 순간과 개념 혼동을 시선 및 필기 속도로 감지하여 그 즉시 소크라테스식 발문으로 유도하는 인터랙티브 에듀테크 서비스입니다.",
    category: "EdTech",
    landingFormat: "PDF",
    thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    landingUrl: "https://classmind-pdf-demo.internal",
    targetCredits: 20000,
    totalCredits: 11000,
    investorCount: 3,
    lastModifierName: "장우석",
    lastModifiedAt: "2026-10-19 11:35",
    isHidden: false,
    authorId: "user-06",
    authorName: "장우석",
    authorEmail: "eduvibe@team.ac.kr",
    isUserProject: false,
    pitchHighlights: [
      "별도 하드웨어 없이 일반 노트북 웹캠만으로 시선 추적 정확도 94%",
      "대치동 학원가 12개 클래스 파일럿 테스트 만족도 96점 기록",
      "AI 튜터 응답 생성 속도 0.8초 이내 실시간 인터랙션 구축"
    ],
    teamMembers: [
      { name: "장우석", role: "대표 / 컴퓨터교육과" },
      { name: "서유진", role: "인지심리학 연구원" },
      { name: "노현아", role: "프론트엔드 에듀테크 엔지니어" }
    ],
    comments: [
      { id: "c8", author: "김현태", team: "사범대학", amount: 2000, message: "시선 데이터로 집중도를 파악하는 아이디어가 참신합니다.", timestamp: "16:15" }
    ],
    pdfSlides: [
      {
        title: "SLIDE 01: 인강 완강률 4%의 함정",
        subtitle: "수동적 강의 시청의 한계와 실시간 집중 이탈 문제",
        content: "국내 이러닝 시장은 6조 원 규모이나, 학생 혼자 화면을 보며 완강하는 비율은 4% 미만입니다. 핵심 문제는 피드백의 부재입니다.",
        keyMetrics: ["온라인 인강 완강률 4.2%", "집중 이탈 평균 12분", "수동적 청취 문제"]
      },
      {
        title: "SLIDE 02: 시선 추적 온디바이스 컴퓨터 비전",
        subtitle: "개인정보 침해 없는 엣지 시선 추적 알고리즘",
        content: "서버로 영상을 전송하지 않고 브라우저 WebAssembly 상에서 실시간 시선 좌표만 추출하여 완벽한 프라이버시 보호와 초저지연을 실현했습니다.",
        keyMetrics: ["연산 지연시간 24ms", "영상 비전송 프라이버시 100%", "WebAssembly 경량화"]
      }
    ]
  }
];

export const INITIAL_INVESTMENTS: Investment[] = [
  {
    id: "inv-01",
    eventId: "evt-2026-fall-01",
    investorId: "user-01",
    investorName: "김서연",
    projectId: "proj-02",
    teamId: "team-02",
    amount: 2000,
    createdAt: "2026-10-18 13:05",
    updatedAt: "2026-10-18 13:05",
  },
];
