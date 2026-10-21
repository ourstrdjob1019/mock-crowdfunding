/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Coins,
  TrendingUp,
  Award,
  Users,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  FileText,
  Globe,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Tv,
  ArrowUpRight,
  Search,
  Filter,
  BarChart3,
  Sliders,
  RotateCcw,
  Maximize2,
  Lock,
  Building2,
  Briefcase,
  Compass,
  Layers,
  Flame,
  Check,
  Send,
  Calendar,
  Eye,
  Info
} from 'lucide-react';

// --- TYPES ---
type Role = 'STUDENT' | 'ADMIN';
type ProjectFormat = 'IMAGE' | 'PDF' | 'WEB';
type ProjectCategory = 'AI/SaaS' | 'Bio/Health' | 'FinTech' | 'GreenTech' | 'Robotics' | 'EdTech';

interface Comment {
  id: string;
  author: string;
  team: string;
  amount?: number;
  message: string;
  timestamp: string;
}

interface Project {
  id: string;
  teamId: string;
  teamName: string;
  teamNumber: string;
  title: string;
  summary: string;
  description: string;
  category: ProjectCategory;
  format: ProjectFormat;
  thumbnail: string;
  targetCredits: number;
  raisedCredits: number;
  backerCount: number;
  pitchHighlights: string[];
  teamMembers: { name: string; role: string }[];
  comments: Comment[];
  isUserProject?: boolean;
  // Detail content based on format
  detailImages?: string[];
  pdfSlides?: { title: string; subtitle: string; content: string; keyMetrics: string[] }[];
  webDemoUrl?: string;
  webDemoFeatures?: string[];
}

interface Investment {
  id: string;
  projectId: string;
  projectTitle: string;
  teamName: string;
  teamNumber: string;
  amount: number;
  timestamp: string;
  format: ProjectFormat;
}

interface User {
  id: string;
  name: string;
  team: string;
  teamId: string;
  initialCredits: number;
  remainingCredits: number;
}

// Stage definitions
const STAGES = [
  { id: 1, code: '01', title: '준비 중', desc: '출품 사전 가이드 및 시스템 점검' },
  { id: 2, code: '02', title: '출품 등록', desc: '팀별 IR 피치덱 및 시연 자료 업로드' },
  { id: 3, code: '03', title: '펀딩 진행 중', desc: '학생 및 청중 평가단 실시간 모의투자' },
  { id: 4, code: '04', title: '펀딩 마감', desc: '투자 집계 완료 및 검증 절차 진행' },
  { id: 5, code: '05', title: '랭킹 공개', desc: '최종 환산 점수 발표 및 시상식 진행' },
];

// --- INITIAL MOCK DATA ---
const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-01',
    teamId: 'team-01',
    teamName: '넥스트웨이브',
    teamNumber: 'Team 01',
    title: '뉴로싱크 (NeuroSync) - 초음파 뇌파 동기화 기반 수면 최적화 슬립테크',
    summary: '비침습 집속 초음파와 실시간 EEG 센싱 기술을 융합하여 렘수면 및 깊은 수면 시간을 38% 증진시키는 수면 헬스케어 디바이스 & 구독형 AI 케어 솔루션입니다.',
    description: '현대인의 만성 수면장애와 집중력 저하 문제를 해결하기 위해 대학 연구실의 뇌공학 원천 특허를 기반으로 창업한 슬립테크 하드웨어 스타트업입니다. 특허받은 tFUS(경두개 집속초음파) 모듈과 전두엽 뇌파 피드백 루프를 통해 수면 단계별 최적 주파수를 자율 변조합니다.',
    category: 'Bio/Health',
    format: 'IMAGE',
    thumbnail: 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=900&q=80',
    targetCredits: 25000,
    raisedCredits: 14000,
    backerCount: 4,
    isUserProject: true, // CURRENT USER PROJECT (김서연 소속)
    pitchHighlights: [
      '국내 1위 수면의학센터 임상 시험 유효성 검증 (수면 효율 +38.4%)',
      '경량화 헤어밴드형 디바이스 자체 설계 및 PCT 국제 특허 2건 출원',
      '사전 B2C 예약 구매자 1,200명 확보 및 월 구독형 B2B 웰니스 플랜 런칭'
    ],
    teamMembers: [
      { name: '김서연', role: '대표 / 바이오메디컬 공학' },
      { name: '박진우', role: 'CTO / 뇌신경 신호처리 박사과정' },
      { name: '이지민', role: 'CPO / UX & 프로덕트 디자인' }
    ],
    comments: [
      { id: 'c1', author: '한동훈', team: '엔젤투자클럽', amount: 3000, message: '임상 데이터 기반이라 신뢰도가 매우 높습니다. 시제품 완성도 기대됩니다!', timestamp: '14:22' },
      { id: 'c2', author: '최유나', team: '소프트웨어학과', amount: 2000, message: '수면 부족인 대학생들에게 정말 절실한 아이템이네요 응원합니다!', timestamp: '15:10' }
    ],
    detailImages: [
      'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'proj-02',
    teamId: 'team-02',
    teamName: '하이퍼스케일',
    teamNumber: 'Team 02',
    title: '플로우코어 (FlowCore) - 엔터프라이즈 멀티모달 자율 AI 에이전트 오케스트레이터',
    summary: '코드 생성, 문서 파싱, 데이터베이스 쿼리를 자체 판단으로 수행하는 기업용 협업 AI 워크플로우 자동화 엔진입니다.',
    description: '복잡한 사내 ERP/레거시 시스템과 최신 대형 언어 모델을 노코드 블록으로 연결하여 실무자의 수작업 업무를 최대 80% 자동화합니다. 보안 규제를 준수하는 온프레미스 경량화 모델 배포 파이프라인을 내장했습니다.',
    category: 'AI/SaaS',
    format: 'WEB',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80',
    targetCredits: 30000,
    raisedCredits: 28000,
    backerCount: 8,
    isUserProject: false,
    pitchHighlights: [
      '오픈소스 커뮤니티 GitHub Star 4.2k 달성 및 글로벌 개발자 유입',
      '국내 중견 제조/물류 3개사 대상 유료 PoC 계약 체결 (연 1.8억원 규모)',
      '실시간 API 오케스트레이션 지연 시간 120ms 미만 초경량 엔진'
    ],
    teamMembers: [
      { name: '정민호', role: 'CEO / AI 시스템 아키텍트' },
      { name: '송아름', role: 'Lead ML Engineer' },
      { name: '류태양', role: 'Full-stack Platform Engineer' }
    ],
    comments: [
      { id: 'c3', author: '김서연', team: '넥스트웨이브 Team 01', amount: 2000, message: '기술 스택이 탄탄하고 UI 오케스트레이션이 매끄럽네요. 투자 완료!', timestamp: '13:05' },
      { id: 'c4', author: '배준혁', team: '컴퓨터공학과', amount: 4000, message: '노코드 AI 에이전트 트렌드에 최적화된 비즈니스 모델입니다.', timestamp: '14:50' }
    ],
    webDemoUrl: 'https://flowcore-agent-demo.sandbox',
    webDemoFeatures: [
      '사내 데이터베이스 자연어 쿼리 자동 실행',
      'PDF 계약서 100건 일괄 요약 및 위험 조항 하이라이트',
      'Slack 및 Microsoft Teams 양방향 봇 알림 파이프라인'
    ]
  },
  {
    id: 'proj-03',
    teamId: 'team-03',
    teamName: '에코이노베이션',
    teamNumber: 'Team 03',
    title: '솔라퓨전 (SolarFusion) - 페로브스카이트-실리콘 탠덤 초고효율 도심형 BIPV 태양광',
    summary: '기존 태양광 대비 발전 효율 32% 달성! 반투명 건물 일체형 태양광 패널로 도시 빌딩의 탄소중립 제로에너지빌딩(ZEB) 전환을 선도합니다.',
    description: '대학 신소재공학과 연구실 기반의 클린테크 스핀오프입니다. 페로브스카이트 유무기 하이브리드 박막 코팅 기술을 통해 도심 빌딩 외벽 및 창호에 부착 가능한 가볍고 심미성이 뛰어난 건축일체형 태양광 솔루션을 개발합니다.',
    category: 'GreenTech',
    format: 'PDF',
    thumbnail: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=900&q=80',
    targetCredits: 20000,
    raisedCredits: 19000,
    backerCount: 6,
    isUserProject: false,
    pitchHighlights: [
      '차세대 탠덤 셀 공인 발전 효율 31.8% 공인 시험성적서 획득',
      '건축 외장재 KS 인증 및 화재 내구성 1등급 테스트 통과',
      '도심형 오피스 빌딩 실증 프로젝트 착수 (예상 연간 전기세 28% 절감)'
    ],
    teamMembers: [
      { name: '강동원', role: '대표 / 신소재공학 박사' },
      { name: '윤지원', role: '생산공정 엔지니어' },
      { name: '오세훈', role: '그린에너지 정책 & 인허가' }
    ],
    comments: [
      { id: 'c5', author: '이서진', team: '지속가능발전연구소', amount: 5000, message: 'BIPV 시장의 가려운 곳을 긁어주는 획기적인 기술입니다.', timestamp: '15:30' }
    ],
    pdfSlides: [
      {
        title: 'SLIDE 01: 도심형 에너지 위기와 ZEB 규제',
        subtitle: '도심 고층 빌딩의 탄소 배출 규제와 기존 옥상 태양광의 면적 한계',
        content: '국내외 제로에너지빌딩 의무화 시행에 따라 도심 외벽 BIPV 수요가 연 45% 급성장 중이나, 기존 실리콘 패널은 무겁고 효율이 18% 수준에 머뭅니다.',
        keyMetrics: ['연 45% BIPV 시장 성장률', '기존 패널 대비 무게 65% 경량화', '발전 효율 31.8%']
      },
      {
        title: 'SLIDE 02: 독자적 탠덤 코팅 원천 기술',
        subtitle: '페로브스카이트 하이브리드 박막 롤투롤 연속 코팅 공정',
        content: '저온 용액 공정 기반의 롤투롤 생산 기술을 도입하여 생산 단가를 기존 대비 40% 절감하고, 가시광선 투과율 조절이 가능한 반투명 디자인을 구현했습니다.',
        keyMetrics: ['생산 원가 40% 절감', '투과율 20~50% 가변 제어', '특허 등록 4건 보유']
      },
      {
        title: 'SLIDE 03: 비즈니스 모델 및 실증 로드맵',
        subtitle: '대형 건설사 B2B 공급 및 에너지 구독형 PPA 모델 동시 추진',
        content: '2026년 하반기 서울 마포구 스마트오피스 빌딩 외벽 실증 시공 완료 예정이며, EPC 시공사 협업 파이프라인을 구축 중입니다.',
        keyMetrics: ['B2B 파트너십 3건 MOU', '손익분기점 2027년 Q3 전망', '누적 탄소저감 1,200톤']
      }
    ]
  },
  {
    id: 'proj-04',
    teamId: 'team-04',
    teamName: '알고리듬랩',
    teamNumber: 'Team 04',
    title: '퀀텀로지스 (QuantumLogix) - 다중 에이전트 자율 물류 경로 최적화 스케줄러',
    summary: '도심 라스트마일 배송 경로를 양자 시뮬레이션 알고리즘으로 실시간 연산하여 배송 지연율 42% 감소 및 유류비 27%를 절감합니다.',
    description: '물류 센터의 재고 배치부터 화물차량 적재 및 배송 기사별 최적 경로를 복합 제약조건 하에서 수 초 만에 도출하는 AI/양자 하이브리드 솔루션입니다.',
    category: 'Robotics',
    format: 'WEB',
    thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80',
    targetCredits: 25000,
    raisedCredits: 22000,
    backerCount: 7,
    isUserProject: false,
    pitchHighlights: [
      '국내 택배 3사 대상 시뮬레이션 벤치마크 테스트 우위 입증',
      '실시간 교통 돌발상황 및 배송 취소 즉각 재할당 엔진 탑재',
      '클라우드 SaaS 형태로 기사 1인당 월 12,000원 접근성 높은 요금제'
    ],
    teamMembers: [
      { name: '임재현', role: 'CEO / 산업공학과' },
      { name: '권하늘', role: '수리 최적화 연구원' },
      { name: '조민석', role: 'GIS & 클라우드 백엔드' }
    ],
    comments: [
      { id: 'c6', author: '안성민', team: '스마트모빌리티랩', amount: 3000, message: '라스트마일 물류의 효율화 알고리즘이 매우 탄탄해 보입니다.', timestamp: '16:02' }
    ],
    webDemoUrl: 'https://quantumlogix-fleet.app',
    webDemoFeatures: [
      '1,000개 배송지 실시간 3초 내 최적 군집화',
      '트럭 적재 부피 3D 시각화 시뮬레이션',
      '탄소 배출 저감 및 비용 절감 대시보드'
    ]
  },
  {
    id: 'proj-05',
    teamId: 'team-05',
    teamName: '핀스마트',
    teamNumber: 'Team 05',
    title: '크레딧루프 (CreditLoop) - 긱워커 및 대학생 대체데이터(Alt-Data) 대안신용평가',
    summary: '금융 이력이 부족한 씬파일러(Thin-Filer) 청년을 위해 통신비 납부, 긱 플랫폼 평점, 깃허브 커밋 등을 분석하여 포용적 금융 기회를 제공합니다.',
    description: '전통적 금융권 신용평가의 사각지대에 놓인 대학생, 프리랜서, 초기 창업자에게 공정한 신용점수를 부여하고 저금리 마이크로 파이낸싱 연계를 돕는 핀테크 API 플랫폼입니다.',
    category: 'FinTech',
    format: 'IMAGE',
    thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=900&q=80',
    targetCredits: 20000,
    raisedCredits: 16000,
    backerCount: 5,
    isUserProject: false,
    pitchHighlights: [
      '금융위원회 혁신금융서비스 샌드박스 1차 심사 통과',
      '비금융 데이터 40여 종 머신러닝 스코어링 모델 AUC 0.89 달성',
      '인터넷전문은행 2곳과 연계 대출 모델 실증 협약 체결'
    ],
    teamMembers: [
      { name: '문태경', role: '대표 / 금융공학' },
      { name: '신다혜', role: '리스크 모델링 분석가' },
      { name: '구본승', role: '금융보안 & 컴플라이언스' }
    ],
    comments: [
      { id: 'c7', author: '박소현', team: '경제학과', amount: 3000, message: '학생 입장에서 정말 공감되는 서비스입니다!', timestamp: '14:40' }
    ],
    detailImages: [
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'proj-06',
    teamId: 'team-06',
    teamName: '에듀바이브',
    teamNumber: 'Team 06',
    title: '클래스마인드 (ClassMind) - 시선 추적과 생성형 AI 튜터 기반의 적응형 학습 솔루션',
    summary: '웹캠 기반의 동공/시선 집중도 분석과 오답 원인 진단 AI를 결합하여 학생 개개인에게 초개인화된 1:1 맞춤형 과외 경험을 제공합니다.',
    description: '단순한 인터넷 강의 수강을 넘어, 학습자가 문제를 풀며 멈칫한 순간과 개념 혼동을 시선 및 필기 속도로 감지하여 그 즉시 소크라테스식 발문으로 유도하는 인터랙티브 에듀테크 서비스입니다.',
    category: 'EdTech',
    format: 'PDF',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    targetCredits: 20000,
    raisedCredits: 11000,
    backerCount: 3,
    isUserProject: false,
    pitchHighlights: [
      '별도 하드웨어 없이 일반 노트북 웹캠만으로 시선 추적 정확도 94%',
      '대치동 학원가 12개 클래스 파일럿 테스트 만족도 96점 기록',
      'AI 튜터 응답 생성 속도 0.8초 이내 실시간 인터랙션 구축'
    ],
    teamMembers: [
      { name: '장우석', role: '대표 / 컴퓨터교육과' },
      { name: '서유진', role: '인지심리학 연구원' },
      { name: '노현아', role: '프론트엔드 에듀테크 엔지니어' }
    ],
    comments: [
      { id: 'c8', author: '김현태', team: '사범대학', amount: 2000, message: '시선 데이터로 집중도를 파악하는 아이디어가 참신합니다.', timestamp: '16:15' }
    ],
    pdfSlides: [
      {
        title: 'SLIDE 01: 인강 완강률 4%의 함정',
        subtitle: '수동적 강의 시청의 한계와 실시간 집중 이탈 문제',
        content: '국내 이러닝 시장은 6조 원 규모이나, 학생 혼자 화면을 보며 완강하는 비율은 4% 미만입니다. 핵심 문제는 피드백의 부재입니다.',
        keyMetrics: ['온라인 인강 완강률 4.2%', '집중 이탈 평균 12분', '수동적 청취 문제']
      },
      {
        title: 'SLIDE 02: 시선 추적 온디바이스 컴퓨터 비전',
        subtitle: '개인정보 침해 없는 엣지 시선 추적 알고리즘',
        content: '서버로 영상을 전송하지 않고 브라우저 WebAssembly 상에서 실시간 시선 좌표만 추출하여 완벽한 프라이버시 보호와 초저지연을 실현했습니다.',
        keyMetrics: ['연산 지연시간 24ms', '영상 비전송 프라이버시 100%', 'WebAssembly 경량화']
      }
    ]
  }
];

// Initial user state (김서연 - Team 01, has already spent 2,000 CR on FlowCore)
const INITIAL_USER: User = {
  id: 'user-01',
  name: '김서연',
  team: '넥스트웨이브 Team 01',
  teamId: 'team-01',
  initialCredits: 10000,
  remainingCredits: 8000,
};

const INITIAL_INVESTMENTS: Investment[] = [
  {
    id: 'inv-01',
    projectId: 'proj-02',
    projectTitle: '플로우코어 (FlowCore) - 엔터프라이즈 멀티모달 자율 AI 에이전트 오케스트레이터',
    teamName: '하이퍼스케일',
    teamNumber: 'Team 02',
    amount: 2000,
    timestamp: '2026-10-18 13:05',
    format: 'WEB'
  }
];

export default function App() {
  // App Global State
  const [role, setRole] = useState<Role>('STUDENT');
  const [activeTab, setActiveTab] = useState<'GALLERY' | 'MY_INVESTMENTS' | 'MY_TEAM' | 'ADMIN'>('GALLERY');
  const [currentStageId, setCurrentStageId] = useState<number>(3); // Default 03. 펀딩 진행 중
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [investments, setInvestments] = useState<Investment[]>(INITIAL_INVESTMENTS);

  // Gallery Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'RAISED' | 'PERCENT' | 'BACKERS' | 'LATEST'>('RAISED');

  // Detail Modal State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [investmentSliderVal, setInvestmentSliderVal] = useState<number>(2000);
  const [detailCommentInput, setDetailCommentInput] = useState<string>('');
  const [pdfSlideIndex, setPdfSlideIndex] = useState<number>(0);

  // New Project Submission Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    teamName: '넥스트웨이브',
    teamNumber: 'Team 01',
    title: '',
    summary: '',
    description: '',
    category: 'AI/SaaS' as ProjectCategory,
    format: 'IMAGE' as ProjectFormat,
    targetCredits: 20000,
    highlight1: '',
    highlight2: '',
    webDemoUrl: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
  });

  // Admin Conversion Formula State
  const [unitCredit, setUnitCredit] = useState<number>(1000);
  const [pointScore, setPointScore] = useState<number>(10);

  // 16:9 Dark Projector Screen State
  const [isProjectorOpen, setIsProjectorOpen] = useState(false);

  // Toast System
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Trigger celebration confetti
  const fireConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#2563EB', '#06B6D4', '#F59E0B', '#10B981', '#8B5CF6'],
    });
  };

  const fireGrandConfetti = () => {
    const end = Date.now() + 2 * 1000;
    const colors = ['#F59E0B', '#FBBF24', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'];
    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  // Helper calculations
  const totalRaisedAll = useMemo(() => {
    return projects.reduce((acc, p) => acc + p.raisedCredits, 0);
  }, [projects]);

  const totalBackersAll = useMemo(() => {
    return projects.reduce((acc, p) => acc + p.backerCount, 0);
  }, [projects]);

  const currentStageObj = STAGES.find(s => s.id === currentStageId) || STAGES[2];

  // Calculated Leaderboard based on current conversion formula
  const leaderboardData = useMemo(() => {
    return projects.map((p) => {
      const convertedPoints = unitCredit > 0 ? (p.raisedCredits / unitCredit) * pointScore : 0;
      const progressPercent = Math.round((p.raisedCredits / p.targetCredits) * 100);
      return {
        ...p,
        convertedPoints: Number(convertedPoints.toFixed(1)),
        progressPercent,
      };
    }).sort((a, b) => b.convertedPoints - a.convertedPoints);
  }, [projects, unitCredit, pointScore]);

  // Filtered & Sorted Projects for Gallery
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.teamNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchFormat = selectedFormat === 'ALL' || p.format === selectedFormat;
      return matchSearch && matchCat && matchFormat;
    }).sort((a, b) => {
      if (sortBy === 'RAISED') return b.raisedCredits - a.raisedCredits;
      if (sortBy === 'PERCENT') return (b.raisedCredits / b.targetCredits) - (a.raisedCredits / a.targetCredits);
      if (sortBy === 'BACKERS') return b.backerCount - a.backerCount;
      return 0;
    });
  }, [projects, searchQuery, selectedCategory, selectedFormat, sortBy]);

  // Handle Investment Action
  const handleInvest = (amount: number) => {
    if (!selectedProject) return;

    if (currentStageId !== 3) {
      showToast(`현재 [${currentStageObj.title}] 단계에서는 모의투자를 진행할 수 없습니다.`);
      return;
    }

    // STRICT SELF-INVESTMENT BLOCK
    if (selectedProject.isUserProject || selectedProject.teamId === user.teamId) {
      showToast('⚠️ 본인이 출품한 프로젝트에는 투자할 수 없습니다 (자가 투자 방지 정책).');
      return;
    }

    if (amount > user.remainingCredits) {
      showToast('잔여 모의투자 크레딧이 부족합니다.');
      return;
    }

    // Deduct credits from user
    setUser(prev => ({
      ...prev,
      remainingCredits: prev.remainingCredits - amount,
    }));

    // Update project raised credits and backer count
    setProjects(prev => prev.map(p => {
      if (p.id === selectedProject.id) {
        return {
          ...p,
          raisedCredits: p.raisedCredits + amount,
          backerCount: p.backerCount + 1,
          comments: [
            {
              id: 'c_' + Date.now(),
              author: user.name,
              team: user.team,
              amount: amount,
              message: `${amount.toLocaleString()} CR 모의투자에 동참했습니다! 성장을 응원합니다.`,
              timestamp: '방금 전'
            },
            ...p.comments
          ]
        };
      }
      return p;
    }));

    // Add to investments history
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newInv: Investment = {
      id: 'inv_' + Date.now(),
      projectId: selectedProject.id,
      projectTitle: selectedProject.title,
      teamName: selectedProject.teamName,
      teamNumber: selectedProject.teamNumber,
      amount: amount,
      timestamp: timeStr,
      format: selectedProject.format,
    };
    setInvestments(prev => [newInv, ...prev]);

    // Keep selectedProject view in sync
    setSelectedProject(prev => {
      if (!prev) return null;
      return {
        ...prev,
        raisedCredits: prev.raisedCredits + amount,
        backerCount: prev.backerCount + 1,
        comments: [
          {
            id: 'c_' + Date.now(),
            author: user.name,
            team: user.team,
            amount: amount,
            message: `${amount.toLocaleString()} CR 모의투자에 동참했습니다! 성장을 응원합니다.`,
            timestamp: '방금 전'
          },
          ...prev.comments
        ]
      };
    });

    fireConfetti();
    showToast(`🎉 ${selectedProject.teamNumber} ${selectedProject.teamName}에 ${amount.toLocaleString()} CR 투자가 성공적으로 완료되었습니다!`);
  };

  // Handle Cancel/Refund Investment
  const handleCancelInvestment = (investmentId: string) => {
    if (currentStageId > 3) {
      showToast('⚠️ 펀딩 마감 이후에는 투자를 취소할 수 없습니다.');
      return;
    }

    const targetInv = investments.find(inv => inv.id === investmentId);
    if (!targetInv) return;

    // Refund credits to user
    setUser(prev => ({
      ...prev,
      remainingCredits: prev.remainingCredits + targetInv.amount,
    }));

    // Deduct from project
    setProjects(prev => prev.map(p => {
      if (p.id === targetInv.projectId) {
        return {
          ...p,
          raisedCredits: Math.max(0, p.raisedCredits - targetInv.amount),
          backerCount: Math.max(0, p.backerCount - 1),
        };
      }
      return p;
    }));

    // Remove from investments
    setInvestments(prev => prev.filter(inv => inv.id !== investmentId));
    showToast(`↩️ 투자가 취소되어 ${targetInv.amount.toLocaleString()} CR이 지갑으로 전액 환불되었습니다.`);
  };

  // Handle Submit New Project
  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitForm.title.trim() || !submitForm.summary.trim()) {
      showToast('프로젝트 제목과 요약 설명을 입력해주세요.');
      return;
    }

    const newProj: Project = {
      id: 'proj_' + Date.now(),
      teamId: 'team-' + Date.now(),
      teamName: submitForm.teamName,
      teamNumber: submitForm.teamNumber || 'Team New',
      title: submitForm.title,
      summary: submitForm.summary,
      description: submitForm.description || submitForm.summary,
      category: submitForm.category,
      format: submitForm.format,
      thumbnail: submitForm.thumbnailUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
      targetCredits: Number(submitForm.targetCredits) || 20000,
      raisedCredits: 0,
      backerCount: 0,
      isUserProject: submitForm.teamName.includes('넥스트웨이브') || submitForm.teamNumber === 'Team 01',
      pitchHighlights: [
        submitForm.highlight1 || '혁신적인 기술 기반 문제 해결 프로덕트',
        submitForm.highlight2 || '2026 데모데이 출품작 및 시장 검증 진행',
        '팀 내 핵심 연구 인력 참여 및 시제품 완성'
      ],
      teamMembers: [
        { name: user.name, role: '대표 / 프로젝트 리드' },
        { name: '팀원 A', role: '핵심 개발자' },
      ],
      comments: [],
      detailImages: [
        'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80'
      ],
      pdfSlides: submitForm.format === 'PDF' ? [
        {
          title: 'SLIDE 01: ' + submitForm.title,
          subtitle: submitForm.summary,
          content: submitForm.description || '2026 대학 스타트업 데모데이 출품 자료입니다.',
          keyMetrics: ['목표 펀딩: ' + submitForm.targetCredits + ' CR', '팀: ' + submitForm.teamName, '카테고리: ' + submitForm.category]
        }
      ] : undefined,
      webDemoUrl: submitForm.webDemoUrl || 'https://prototype.demo.internal',
      webDemoFeatures: ['핵심 대시보드 시연', '데이터 입력 및 모의 테스트', '결과 리포트 출력']
    };

    setProjects(prev => [newProj, ...prev]);
    setIsSubmitModalOpen(false);
    fireConfetti();
    showToast(`🚀 [${newProj.teamNumber}] ${newProj.title} 프로젝트가 성공적으로 출품 등록되었습니다!`);
    // Reset form
    setSubmitForm({
      teamName: '넥스트웨이브',
      teamNumber: 'Team 01',
      title: '',
      summary: '',
      description: '',
      category: 'AI/SaaS',
      format: 'IMAGE',
      targetCredits: 20000,
      highlight1: '',
      highlight2: '',
      webDemoUrl: '',
      thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
    });
  };

  // Add Comment to Project Detail
  const handleAddComment = () => {
    if (!detailCommentInput.trim() || !selectedProject) return;
    const newComment: Comment = {
      id: 'c_' + Date.now(),
      author: user.name,
      team: user.team,
      message: detailCommentInput.trim(),
      timestamp: '방금 전'
    };
    const updated = {
      ...selectedProject,
      comments: [newComment, ...selectedProject.comments]
    };
    setSelectedProject(updated);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    setDetailCommentInput('');
    showToast('💬 응원 댓글이 등록되었습니다.');
  };

  // Spent credits calculation
  const spentCredits = user.initialCredits - user.remainingCredits;
  const spentPercent = Math.min(100, Math.round((spentCredits / user.initialCredits) * 100));

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">

      {/* ========================================================
          1. TOP GLOBAL DEV BAR & HEADER
          ======================================================== */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
          
          {/* Left: Live Indicator & Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
              </span>
              <span>DEMODAY 2026 · LIVE EXHIBITION</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
              <span className="text-slate-400">현재 단계:</span>
              <span className="font-semibold text-slate-900">{currentStageObj.code}. {currentStageObj.title}</span>
            </div>
          </div>

          {/* Right: Quick Stage Notice & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Stage Quick Pill */}
            <div className="hidden lg:flex items-center text-xs text-slate-500 font-mono">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>D-DAY · 실시간 가상 펀딩 세션 진행 중</span>
            </div>

            {/* Role Switcher Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setRole('STUDENT');
                  showToast('👤 [학생 / 투자자] 모드로 전환되었습니다.');
                }}
                className={`px-3 py-1.5 rounded-md transition duration-150 flex items-center gap-1.5 cursor-pointer ${
                  role === 'STUDENT'
                    ? 'bg-white text-blue-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>학생 / 투자자</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('ADMIN');
                  setActiveTab('ADMIN');
                  showToast('⚙️ [총괄 관리자] 모드로 전환되었습니다. 콘솔이 활성화됩니다.');
                }}
                className={`px-3 py-1.5 rounded-md transition duration-150 flex items-center gap-1.5 cursor-pointer ${
                  role === 'ADMIN'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>총괄 관리자</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
          MAIN APP LAYOUT (LEFT STICKY SIDEBAR + CONTENT AREA)
          ======================================================== */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">

        {/* ----------------------------------------------------
            LEFT STICKY NAVIGATION SIDEBAR
            ---------------------------------------------------- */}
        <aside className="w-full md:w-68 shrink-0 flex flex-col gap-5 md:sticky md:top-21 md:self-start">
          
          {/* 1. Logo Header */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent">
                CROWDFUND
              </div>
              <div className="text-[11px] font-medium text-slate-500 tracking-wide">
                2026 University DemoDay
              </div>
            </div>
          </div>

          {/* 2. Bento Wallet Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
            {/* Subtle background glow */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-blue-100 rounded-full blur-2xl opacity-60 pointer-events-none"></div>

            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                내 투자 지갑 (Wallet)
              </span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                1인 한도
              </span>
            </div>

            <div className="text-2xl font-extrabold font-mono text-slate-900 tracking-tight flex items-baseline gap-1">
              {user.remainingCredits.toLocaleString()}
              <span className="text-xs font-bold text-blue-600 font-sans">CR</span>
            </div>

            {/* Spent vs Remaining Progress */}
            <div className="mt-3">
              <div className="flex justify-between text-[11px] text-slate-500 font-mono mb-1">
                <span>사용 {spentCredits.toLocaleString()} CR</span>
                <span className="font-semibold text-blue-600">잔여 {user.remainingCredits.toLocaleString()} CR</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                <div
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${spentPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Fast Credit Reset / Refill for testing */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">테스트 잔액 리필</span>
              <button
                type="button"
                onClick={() => {
                  setUser(prev => ({ ...prev, remainingCredits: 10000 }));
                  showToast('💳 지갑이 기본 10,000 CR로 리필되었습니다.');
                }}
                className="text-[10px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                초기화
              </button>
            </div>
          </div>

          {/* 3. Navigation Menu */}
          <nav className="flex flex-col gap-1 bg-white rounded-2xl p-2 border border-slate-200/90 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('GALLERY')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                activeTab === 'GALLERY'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>프로젝트 둘러보기</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{projects.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('MY_INVESTMENTS')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                activeTab === 'MY_INVESTMENTS'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>내 투자 내역</span>
              </div>
              {investments.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white font-mono">
                  {investments.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('MY_TEAM')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                activeTab === 'MY_TEAM'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span>내 팀 프로젝트</span>
              </div>
              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                Team 01
              </span>
            </button>

            {/* Admin Console (Visible ONLY when Admin role is active) */}
            {role === 'ADMIN' && (
              <button
                type="button"
                onClick={() => setActiveTab('ADMIN')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  activeTab === 'ADMIN'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>관리자 콘솔</span>
                </div>
                <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-amber-400/20 text-amber-300 font-bold">
                  ADMIN
                </span>
              </button>
            )}
          </nav>

          {/* 4. CTA Button: Glowing primary blue "+ 새 프로젝트 출품 등록" */}
          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            <span>새 프로젝트 출품 등록</span>
          </button>

          {/* 5. Bottom User Profile (Note: Projector launch button must NOT appear here) */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              {user.name.slice(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-sm font-bold text-slate-900 truncate">{user.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                  role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {role === 'ADMIN' ? '관리자' : '학생'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">{user.team}</p>
            </div>
          </div>
        </aside>

        {/* ----------------------------------------------------
            RIGHT CONTENT AREA (SWITCHED BY ACTIVE TAB)
            ---------------------------------------------------- */}
        <main className="flex-1 min-w-0 flex flex-col gap-6">

          {/* ========================================================
              VIEW 1: MAIN PROJECT GALLERY
              ======================================================== */}
          {activeTab === 'GALLERY' && (
            <div className="flex flex-col gap-6">
              
              {/* Hero Banner: Deep Gradient Card */}
              <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden border border-slate-800 shadow-xl">
                {/* Visual mesh glow */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="max-w-xl space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-cyan-300 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>2026 대학 스타트업 데모데이 크라우드펀딩</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                      미래를 이끌 청년 창업팀에게<br className="hidden sm:inline" />
                      당신의 모의투자 크레딧을 베팅하세요
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                      모든 참여자에게 <span className="text-amber-400 font-mono font-bold">10,000 CR</span> 기본 지급. 건당 <span className="text-cyan-300 font-mono font-bold">2,000 ~ 5,000 CR</span> 분산 투자 가능하며, 실시간 펀딩 점수는 심사 평가에 자동 반영됩니다.
                    </p>
                  </div>

                  {/* Quick rule chips */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex flex-col gap-2.5 shrink-0 min-w-56 text-xs">
                    <div className="text-slate-300 font-semibold flex items-center gap-1.5 pb-1 border-b border-white/10">
                      <Info className="w-3.5 h-3.5 text-cyan-400" />
                      <span>모의투자 핵심 원칙</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-200">
                      <span>1인 지급 크레딧</span>
                      <span className="font-mono font-bold text-amber-400">10,000 CR</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-200">
                      <span>1회 투자 제한</span>
                      <span className="font-mono font-bold text-cyan-300">2,000~5,000 CR</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-200">
                      <span>자가 투자 방지</span>
                      <span className="font-semibold text-rose-300">본인 팀 투자 불가</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  
                  {/* Search input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="프로젝트명, 팀명 또는 키워드로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Sort selector & Count */}
                  <div className="flex items-center gap-2.5">
                    <div className="text-xs text-slate-500 shrink-0">
                      총 <span className="font-mono font-bold text-blue-600">{filteredProjects.length}</span>개 프로젝트
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      aria-label="프로젝트 정렬 방식"
                      className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="RAISED">펀딩액 높은순</option>
                      <option value="PERCENT">달성률 높은순</option>
                      <option value="BACKERS">참여자 많은순</option>
                      <option value="LATEST">최신순</option>
                    </select>
                  </div>
                </div>

                {/* Filter tags (Category & Format) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  {/* Category Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {['ALL', 'AI/SaaS', 'Bio/Health', 'FinTech', 'GreenTech', 'Robotics', 'EdTech'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                          selectedCategory === cat
                            ? 'bg-blue-600 text-white font-semibold shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat === 'ALL' ? '전체 분야' : cat}
                      </button>
                    ))}
                  </div>

                  {/* Format Pills */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                    <span className="text-[10px] text-slate-400 px-1.5 font-medium">형식:</span>
                    {['ALL', 'IMAGE', 'PDF', 'WEB'].map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setSelectedFormat(fmt)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                          selectedFormat === fmt
                            ? 'bg-white text-blue-700 font-bold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {fmt === 'ALL' ? '전체' : fmt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3-Column Responsive Project Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => {
                  const progressPct = Math.round((project.raisedCredits / project.targetCredits) * 100);
                  const isOwned = project.isUserProject || project.teamId === user.teamId;

                  return (
                    <div
                      key={project.id}
                      className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:-translate-y-1 hover:shadow-lg transition-all duration-200 flex flex-col group"
                    >
                      {/* 16:9 Thumbnail with Zoom */}
                      <div className="relative aspect-16/9 overflow-hidden bg-slate-100 cursor-pointer" onClick={() => setSelectedProject(project)}>
                        <img
                          src={project.thumbnail}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                        {/* Badges in Thumbnail */}
                        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold shadow-xs">
                            {project.teamNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold text-white backdrop-blur-md shadow-xs ${
                            project.format === 'WEB' ? 'bg-cyan-600/90' : project.format === 'PDF' ? 'bg-indigo-600/90' : 'bg-emerald-600/90'
                          }`}>
                            {project.format}
                          </span>
                        </div>

                        {/* Owned badge if owned by user */}
                        {isOwned && (
                          <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-md bg-amber-500 text-white text-[11px] font-bold shadow-md flex items-center gap-1 animate-pulse">
                            <Award className="w-3 h-3" />
                            내 팀 출품작
                          </div>
                        )}

                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                          <span className="font-semibold text-slate-200">{project.teamName}</span>
                          <span className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-medium text-slate-300">
                            {project.category}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <h2
                            onClick={() => setSelectedProject(project)}
                            className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            {project.title}
                          </h2>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {project.summary}
                          </p>
                        </div>

                        {/* Funding Progress Bar */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-extrabold font-mono text-slate-900">
                                {project.raisedCredits.toLocaleString()}
                              </span>
                              <span className="text-xs font-bold text-slate-500">CR</span>
                            </div>
                            <span className="text-sm font-extrabold font-mono text-blue-600">
                              {progressPct}%
                            </span>
                          </div>

                          {/* Progress track */}
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, progressPct)}%` }}
                            ></div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>목표: {project.targetCredits.toLocaleString()} CR</span>
                            <span className="flex items-center gap-1 text-slate-600 font-medium">
                              <Users className="w-3 h-3 text-slate-400" />
                              {project.backerCount}명 참여
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedProject(project)}
                          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            isOwned
                              ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200/80 hover:border-blue-600'
                          }`}
                        >
                          <span>{isOwned ? '내 팀 프로젝트 상세 확인' : '프로젝트 상세 & 모의투자'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 4: MY INVESTMENTS (PORTFOLIO)
              ======================================================== */}
          {activeTab === 'MY_INVESTMENTS' && (
            <div className="flex flex-col gap-6">
              
              {/* Header */}
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">내 모의투자 포트폴리오</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  2026 데모데이 출품작에 참여한 모의투자 내역입니다. 펀딩 진행 중 단계에서는 자유롭게 투자를 취소(환불)할 수 있습니다.
                </p>
              </div>

              {/* 3 Stat KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">총 투자 크레딧</p>
                    <p className="text-2xl font-extrabold font-mono text-blue-600 mt-1">
                      {spentCredits.toLocaleString()} <span className="text-xs font-sans text-slate-500">CR</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">참여 프로젝트 수</p>
                    <p className="text-2xl font-extrabold font-mono text-emerald-600 mt-1">
                      {investments.length} <span className="text-xs font-sans text-slate-500">개 팀</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Briefcase className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">잔여 크레딧 잔액</p>
                    <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
                      {user.remainingCredits.toLocaleString()} <span className="text-xs font-sans text-slate-500">CR</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Coins className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Investments History Table */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-bold text-slate-900 text-sm">모의투자 내역 리스트</h2>
                  <span className="text-xs text-slate-400 font-mono">실시간 환불 보장 정책 적용</span>
                </div>

                {investments.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-3">
                    <Coins className="w-12 h-12 mx-auto text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">아직 투자한 프로젝트가 없습니다.</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('GALLERY')}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition cursor-pointer"
                    >
                      프로젝트 둘러보고 투자하기
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">팀 / 프로젝트명</th>
                          <th className="py-3 px-4">발표 형식</th>
                          <th className="py-3 px-4">투자 일시</th>
                          <th className="py-3 px-4 text-right">투자 크레딧</th>
                          <th className="py-3 px-4 text-center">상태 / 조치</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {investments.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{inv.projectTitle}</div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                <span className="text-blue-600 font-bold">{inv.teamNumber}</span> · {inv.teamName}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                {inv.format}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-500">
                              {inv.timestamp}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-600 text-sm">
                              {inv.amount.toLocaleString()} CR
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleCancelInvestment(inv.id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-[11px] transition cursor-pointer"
                              >
                                투자 취소 (환불)
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 7: MY TEAM PROJECT VIEW
              ======================================================== */}
          {activeTab === 'MY_TEAM' && (
            <div className="flex flex-col gap-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                    <Award className="w-3.5 h-3.5" />
                    내 팀 출품 프로젝트 대시보드
                  </div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                    [Team 01] 넥스트웨이브 - 뉴로싱크 (NeuroSync)
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const myProj = projects.find(p => p.id === 'proj-01');
                    if (myProj) setSelectedProject(myProj);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center gap-1.5 self-start cursor-pointer shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>투자자 뷰로 확인</span>
                </button>
              </div>

              {/* 3 KPI Stats for My Project */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
                  <p className="text-xs font-semibold text-slate-500">누적 펀딩 모의투자액</p>
                  <p className="text-2xl font-extrabold font-mono text-blue-600 mt-1">
                    {projects.find(p => p.id === 'proj-01')?.raisedCredits.toLocaleString()} <span className="text-xs font-sans text-slate-500">CR</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">목표 25,000 CR 대비 56% 달성</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
                  <p className="text-xs font-semibold text-slate-500">투자 참여 서포터 수</p>
                  <p className="text-2xl font-extrabold font-mono text-indigo-600 mt-1">
                    {projects.find(p => p.id === 'proj-01')?.backerCount} <span className="text-xs font-sans text-slate-500">명</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">실시간 청중 평가 참여 중</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
                  <p className="text-xs font-semibold text-slate-500">자가 투자 방지 상태</p>
                  <p className="text-base font-bold text-amber-600 mt-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    규정 준수 (클린 펀딩)
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">본인 팀 투자 차단 기능 활성</p>
                </div>
              </div>

              {/* Backers & Investor Cheering Comments Feed */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  우리 팀을 응원해준 서포터 & 피드백 로그
                </h2>

                <div className="divide-y divide-slate-100">
                  {projects.find(p => p.id === 'proj-01')?.comments.map((cm) => (
                    <div key={cm.id} className="py-3 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{cm.author}</span>
                          <span className="text-[11px] text-slate-400">({cm.team})</span>
                          {cm.amount && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold font-mono">
                              +{cm.amount.toLocaleString()} CR 투자
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{cm.message}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">{cm.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 5: ADMIN CONTROL TOWER (ADMIN ONLY)
              ======================================================== */}
          {activeTab === 'ADMIN' && role === 'ADMIN' && (
            <div className="flex flex-col gap-6">
              
              {/* Header with Projector Launcher Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-xs font-bold font-mono">
                    CONTROL TOWER
                  </div>
                  <h1 className="text-2xl font-extrabold tracking-tight mt-1">
                    2026 데모데이 심사 집계 총괄 운영 센터
                  </h1>
                  <p className="text-xs text-slate-300 mt-1">
                    실시간 펀딩 현황 모니터링, 단계 제어, 포인트 환산 공식 동적 변경 및 전광판 송출을 제어합니다.
                  </p>
                </div>

                {/* Big CTA: Launch Projector Screen */}
                <button
                  type="button"
                  onClick={() => setIsProjectorOpen(true)}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/30 transition-all flex items-center gap-2 cursor-pointer active:scale-98 shrink-0"
                >
                  <Tv className="w-5 h-5 text-slate-950" />
                  <span>🏆 빔프로젝터 대형 랭킹 전광판 송출</span>
                </button>
              </div>

              {/* 1. 4 Bento KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
                  <p className="text-xs font-semibold text-slate-500">총 펀딩 투자액 (Total CR)</p>
                  <p className="text-2xl font-extrabold font-mono text-blue-600 mt-1">
                    {totalRaisedAll.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">전체 팀 합산</span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
                  <p className="text-xs font-semibold text-slate-500">총 투자 참여 건수</p>
                  <p className="text-2xl font-extrabold font-mono text-emerald-600 mt-1">
                    {totalBackersAll}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">청중 평가단 참여 수</span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
                  <p className="text-xs font-semibold text-slate-500">출품 등록 팀 수</p>
                  <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
                    {projects.length}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">경쟁 스타트업</span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
                  <p className="text-xs font-semibold text-slate-500">팀당 평균 펀딩액</p>
                  <p className="text-2xl font-extrabold font-mono text-indigo-600 mt-1">
                    {projects.length > 0 ? Math.round(totalRaisedAll / projects.length).toLocaleString() : 0}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">평균 CR</span>
                </div>
              </div>

              {/* 2. 5-Stage Event Flow Switcher */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    행사 진행 5단계 제어기 (Event Flow Controller)
                  </h2>
                  <span className="text-xs text-slate-500">
                    현재 적용: <strong className="text-blue-700 font-mono">{currentStageObj.code}. {currentStageObj.title}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {STAGES.map((stg) => {
                    const isActive = currentStageId === stg.id;
                    const isPassed = currentStageId > stg.id;

                    return (
                      <button
                        key={stg.id}
                        type="button"
                        onClick={() => {
                          setCurrentStageId(stg.id);
                          showToast(`📢 행사 단계가 [${stg.code}. ${stg.title}] 로 전환되었습니다.`);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-semibold'
                            : isPassed
                            ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            : 'bg-white text-slate-400 border-slate-200/70 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>
                            STAGE {stg.code}
                          </span>
                          {isActive && <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse"></span>}
                        </div>
                        <div className={`text-xs font-bold mt-1 ${isActive ? 'text-white' : 'text-slate-800'}`}>
                          {stg.title}
                        </div>
                        <div className={`text-[10px] line-clamp-1 mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                          {stg.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Real-time Point-to-Score Converter */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-amber-500" />
                      실시간 펀딩액 ➔ 심사 점수 동적 환산기 (Formula Converter)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      공식을 변경하면 하단 종합 리더보드 및 전광판에 점수가 즉시 재계산되어 반영됩니다.
                    </p>
                  </div>

                  {/* Formula Inputs */}
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-medium">
                    <span className="text-slate-600">매</span>
                    <input
                      type="number"
                      value={unitCredit}
                      min={100}
                      step={100}
                      onChange={(e) => setUnitCredit(Math.max(1, Number(e.target.value)))}
                      className="w-18 px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900 text-center"
                    />
                    <span className="text-slate-600 font-mono">CR 당 =</span>
                    <input
                      type="number"
                      value={pointScore}
                      min={1}
                      step={1}
                      onChange={(e) => setPointScore(Math.max(0.1, Number(e.target.value)))}
                      className="w-14 px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-blue-600 text-center"
                    />
                    <span className="text-slate-600">점 환산</span>
                  </div>
                </div>

                {/* Dynamic Leaderboard Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4 text-center">순위</th>
                          <th className="py-3 px-4">팀명 (출품작)</th>
                          <th className="py-3 px-4">분야 / 형식</th>
                          <th className="py-3 px-4 text-right">누적 모의투자액</th>
                          <th className="py-3 px-4 text-right">서포터</th>
                          <th className="py-3 px-4 text-right font-mono font-bold text-blue-600">
                            환산 심사 점수
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {leaderboardData.map((team, idx) => {
                          const rank = idx + 1;
                          let rankBadge = (
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-mono font-bold inline-flex items-center justify-center text-xs">
                              {rank}
                            </span>
                          );
                          if (rank === 1) {
                            rankBadge = (
                              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-mono font-extrabold inline-flex items-center justify-center text-xs shadow-xs">
                                🥇 1
                              </span>
                            );
                          } else if (rank === 2) {
                            rankBadge = (
                              <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-mono font-bold inline-flex items-center justify-center text-xs">
                                🥈 2
                              </span>
                            );
                          } else if (rank === 3) {
                            rankBadge = (
                              <span className="w-6 h-6 rounded-full bg-amber-700/80 text-white font-mono font-bold inline-flex items-center justify-center text-xs">
                                🥉 3
                              </span>
                            );
                          }

                          return (
                            <tr key={team.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4 text-center">{rankBadge}</td>
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-900">{team.title}</div>
                                <div className="text-[11px] text-slate-500 font-medium">
                                  {team.teamNumber} · {team.teamName}
                                  {team.isUserProject && (
                                    <span className="ml-1.5 text-amber-600 font-bold">[내 팀]</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium mr-1">
                                  {team.category}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                                  {team.format}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                                {team.raisedCredits.toLocaleString()} CR
                              </td>
                              <td className="py-3 px-4 text-right font-mono text-slate-600">
                                {team.backerCount}명
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-extrabold text-blue-700 text-sm">
                                {team.convertedPoints.toFixed(1)} <span className="text-xs font-sans text-slate-400">점</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ========================================================
          VIEW 2: DETAIL VIEWER & STICKY INVESTMENT MODAL (WADIZ STYLE)
          ======================================================== */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in duration-200">
            
            {/* Top Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-bold text-xs">
                  {selectedProject.teamNumber}
                </span>
                <span className="font-semibold text-xs text-slate-500">
                  {selectedProject.teamName} · {selectedProject.category}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono font-bold">
                  {selectedProject.format}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                aria-label="닫기"
                className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-600 hover:text-slate-900 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Split Layout (65% Scrollable Left + 35% Sticky Right) */}
            <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
              
              {/* ----------------------------------------------------
                  LEFT CONTENT (65% Scrollable + Copyright Protection)
                  ---------------------------------------------------- */}
              <div
                onContextMenu={(e) => {
                  e.preventDefault();
                  showToast('🔒 저작권 보호를 위해 우클릭 및 이미지 저장이 제한됩니다.');
                }}
                className="lg:w-[65%] p-6 border-b lg:border-b-0 lg:border-r border-slate-200 select-none overflow-y-auto space-y-6"
              >
                {/* Copyright Protection Notice Banner */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>2026 DEMODAY 저작권 보호 구역 · 무단 복제 및 캡처가 엄격히 금지됩니다.</span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-mono font-bold">PROTECTED</span>
                </div>

                {/* Title & Summary */}
                <div className="space-y-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                    {selectedProject.title}
                  </h1>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>

                {/* Pitch Highlights Card */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    핵심 피치 하이라이트 (Key Highlights)
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {selectedProject.pitchHighlights.map((hl, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* FORMAT-SPECIFIC VIEWER */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    {selectedProject.format === 'IMAGE' && <ImageIcon className="w-4 h-4 text-emerald-600" />}
                    {selectedProject.format === 'PDF' && <FileText className="w-4 h-4 text-indigo-600" />}
                    {selectedProject.format === 'WEB' && <Globe className="w-4 h-4 text-cyan-600" />}
                    <span>출품 자료 상세 뷰어 ({selectedProject.format})</span>
                  </h3>

                  {/* 1. IMAGE FORMAT: E-Commerce / Wadiz Vertical Scroll Strip */}
                  {selectedProject.format === 'IMAGE' && (
                    <div className="space-y-3 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 p-2">
                      <div className="text-[11px] text-center text-slate-500 py-1 font-medium">
                        ▼ 스크롤하여 상세 IR 인포그래픽을 확인하세요
                      </div>
                      {selectedProject.detailImages?.map((imgUrl, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden shadow-xs">
                          <img
                            src={imgUrl}
                            alt={`상세 ${idx + 1}`}
                            className="w-full object-cover pointer-events-none"
                          />
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
                            SECTION {idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 2. PDF FORMAT: Embedded Slides Simulation with Navigation */}
                  {selectedProject.format === 'PDF' && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-5 space-y-4">
                      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
                        <span className="font-mono">PDF Viewer (Embedded #toolbar=0)</span>
                        <span>{pdfSlideIndex + 1} / {selectedProject.pdfSlides?.length || 1} Slides</span>
                      </div>

                      {/* Current Slide Display */}
                      {selectedProject.pdfSlides && selectedProject.pdfSlides[pdfSlideIndex] && (
                        <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700 space-y-3">
                          <div className="text-amber-400 font-mono text-xs font-bold">
                            {selectedProject.pdfSlides[pdfSlideIndex].title}
                          </div>
                          <div className="text-sm font-bold text-white">
                            {selectedProject.pdfSlides[pdfSlideIndex].subtitle}
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {selectedProject.pdfSlides[pdfSlideIndex].content}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                            {selectedProject.pdfSlides[pdfSlideIndex].keyMetrics.map((met, mi) => (
                              <div key={mi} className="bg-slate-900/80 rounded-lg p-2 text-center text-[11px] font-mono text-cyan-300 border border-slate-700">
                                {met}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Slide Controls */}
                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          disabled={pdfSlideIndex === 0}
                          onClick={() => setPdfSlideIndex(prev => Math.max(0, prev - 1))}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>이전 슬라이드</span>
                        </button>
                        <button
                          type="button"
                          disabled={!selectedProject.pdfSlides || pdfSlideIndex >= selectedProject.pdfSlides.length - 1}
                          onClick={() => setPdfSlideIndex(prev => prev + 1)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>다음 슬라이드</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. WEB FORMAT: Interactive Sandbox Browser Simulation */}
                  {selectedProject.format === 'WEB' && (
                    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                      {/* Browser address bar */}
                      <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                        </div>
                        <div className="flex-1 bg-white px-3 py-1 rounded-md text-[11px] font-mono text-slate-600 border border-slate-200 flex items-center justify-between">
                          <span>{selectedProject.webDemoUrl}</span>
                          <span className="text-[10px] text-emerald-600 font-bold">HTTPS · LIVE</span>
                        </div>
                      </div>

                      {/* Interactive Sandbox UI */}
                      <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/30 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-xs text-slate-800">
                            🚀 실시간 프로토타입 시연 샌드박스
                          </div>
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                            Interactive Demo
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {selectedProject.webDemoFeatures?.map((feat, fi) => (
                            <div key={fi} className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                              <div className="text-[10px] font-bold text-blue-600">FEATURE 0{fi + 1}</div>
                              <div className="text-xs text-slate-700 font-medium">{feat}</div>
                            </div>
                          ))}
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-blue-200 flex items-center justify-between">
                          <span className="text-xs text-slate-600">자율 에이전트 쿼리 응답 테스트 준비 완료</span>
                          <button
                            type="button"
                            onClick={() => showToast('✨ 웹 프로토타입 시연 응답이 시뮬레이션되었습니다.')}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer"
                          >
                            모의 실행해보기
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Team Members */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900">팀 구성원 (Founding Team)</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.teamMembers.map((mem, mi) => (
                      <div key={mi} className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs text-slate-800 flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{mem.name}</span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-500 text-[11px]">{mem.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cheering Comments & Discussion */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>응원 및 심사의견 ({selectedProject.comments.length})</span>
                    <span className="text-[11px] text-slate-400 font-normal">건전한 피드백을 남겨주세요</span>
                  </h3>

                  {/* Comment Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="프로젝트를 향한 응원 또는 질문을 남겨주세요..."
                      value={detailCommentInput}
                      onChange={(e) => setDetailCommentInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment();
                      }}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleAddComment}
                      className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition cursor-pointer flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      등록
                    </button>
                  </div>

                  {/* Comment list */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedProject.comments.map((cm) => (
                      <div key={cm.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="font-bold">{cm.author} <span className="text-slate-400 font-normal">({cm.team})</span></span>
                          <span className="text-[10px] text-slate-400 font-mono">{cm.timestamp}</span>
                        </div>
                        <p className="text-slate-600 mt-1">{cm.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* ----------------------------------------------------
                  RIGHT STICKY INVESTMENT WIDGET (35%)
                  ---------------------------------------------------- */}
              <div className="lg:w-[35%] p-6 bg-slate-50/50 flex flex-col justify-between gap-6">
                
                <div className="space-y-5">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">모의 크라우드펀딩 진행 현황</span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-3xl font-extrabold font-mono text-slate-900">
                        {selectedProject.raisedCredits.toLocaleString()}
                      </span>
                      <span className="text-sm font-bold text-blue-600">CR</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                      <span className="font-bold text-blue-600 font-mono text-sm">
                        {Math.round((selectedProject.raisedCredits / selectedProject.targetCredits) * 100)}% 달성
                      </span>
                      <span>목표 {selectedProject.targetCredits.toLocaleString()} CR</span>
                    </div>

                    {/* Progress track */}
                    <div className="w-full bg-slate-200 rounded-full h-2.5 mt-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.round((selectedProject.raisedCredits / selectedProject.targetCredits) * 100))}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2 font-mono">
                      <span>총 {selectedProject.backerCount}명 모의투자 참여</span>
                      <span>1회 한도 5,000 CR</span>
                    </div>
                  </div>

                  {/* ==============================================
                      STRICT SELF-INVESTMENT BLOCK CHECK
                      ============================================== */}
                  {selectedProject.isUserProject || selectedProject.teamId === user.teamId ? (
                    <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300/80 text-amber-900 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>자가 투자 방지 정책 (Self-Investment Block)</span>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        ⚠️ 본인이 출품한 프로젝트에는 투자할 수 없습니다. 타 팀의 혁신 아이템을 둘러보고 분산 투자하세요.
                      </p>
                      <div className="text-[10px] text-amber-700 font-mono pt-1">
                        소속: {user.team}
                      </div>
                    </div>
                  ) : (
                    /* NORMAL INVESTMENT FLOW */
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">투자 금액 선택</span>
                        <span className="text-xs font-mono font-bold text-blue-600">
                          {investmentSliderVal.toLocaleString()} CR
                        </span>
                      </div>

                      {/* Slider 2,000 to 5,000 CR (Step 1,000) */}
                      <div className="space-y-1">
                        <input
                          type="range"
                          min={2000}
                          max={5000}
                          step={1000}
                          value={investmentSliderVal}
                          onChange={(e) => setInvestmentSliderVal(Number(e.target.value))}
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>2,000 CR</span>
                          <span>3,000 CR</span>
                          <span>4,000 CR</span>
                          <span>5,000 CR</span>
                        </div>
                      </div>

                      {/* Quick preset buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        {[2000, 3000, 5000].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setInvestmentSliderVal(preset)}
                            className={`py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer border ${
                              investmentSliderVal === preset
                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            +{preset.toLocaleString()} CR
                          </button>
                        ))}
                      </div>

                      {/* Live remaining credits calculation */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-500">
                          <span>현재 내 잔여 지갑:</span>
                          <span className="font-mono font-semibold text-slate-800">{user.remainingCredits.toLocaleString()} CR</span>
                        </div>
                        <div className="flex justify-between text-slate-700 font-bold pt-1 border-t border-slate-200">
                          <span>투자 후 잔여 예상:</span>
                          <span className={`font-mono ${user.remainingCredits - investmentSliderVal < 0 ? 'text-rose-600' : 'text-blue-600'}`}>
                            {(user.remainingCredits - investmentSliderVal).toLocaleString()} CR
                          </span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button
                        type="button"
                        disabled={
                          currentStageId !== 3 ||
                          user.remainingCredits < investmentSliderVal
                        }
                        onClick={() => handleInvest(investmentSliderVal)}
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>{investmentSliderVal.toLocaleString()} CR 모의투자 참여하기</span>
                      </button>

                      {user.remainingCredits < investmentSliderVal && (
                        <p className="text-[11px] text-rose-500 text-center font-medium">
                          잔여 크레딧이 부족합니다. 상단 지갑 리필을 이용하세요.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 text-center">
                  CROWDFUND 2026 데모데이 심사 보안 규정을 준수합니다.
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          VIEW 3: PROJECT SUBMISSION MODAL
          ======================================================== */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in duration-200">
            
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h2 className="font-extrabold text-slate-900 text-base">새 스타트업 프로젝트 출품 등록</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitProject} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">팀 이름</label>
                  <input
                    type="text"
                    required
                    value={submitForm.teamName}
                    onChange={(e) => setSubmitForm({ ...submitForm, teamName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">팀 번호 (예: Team 01)</label>
                  <input
                    type="text"
                    required
                    value={submitForm.teamNumber}
                    onChange={(e) => setSubmitForm({ ...submitForm, teamNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">프로젝트 명 (Brand / Product Title)</label>
                <input
                  type="text"
                  required
                  placeholder="예: 넥스트인사이트 - AI 기반 대학생 진로 솔루션"
                  value={submitForm.title}
                  onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">한 줄 요약 (1-Line Summary)</label>
                <input
                  type="text"
                  required
                  placeholder="아이템의 핵심 가치와 문제 해결 방식을 간결하게 서술"
                  value={submitForm.summary}
                  onChange={(e) => setSubmitForm({ ...submitForm, summary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">산업 분야 카테고리</label>
                  <select
                    value={submitForm.category}
                    onChange={(e) => setSubmitForm({ ...submitForm, category: e.target.value as ProjectCategory })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="AI/SaaS">AI/SaaS</option>
                    <option value="Bio/Health">Bio/Health</option>
                    <option value="FinTech">FinTech</option>
                    <option value="GreenTech">GreenTech</option>
                    <option value="Robotics">Robotics</option>
                    <option value="EdTech">EdTech</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">목표 펀딩 금액 (Target CR)</label>
                  <input
                    type="number"
                    min={5000}
                    step={1000}
                    value={submitForm.targetCredits}
                    onChange={(e) => setSubmitForm({ ...submitForm, targetCredits: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Format Selector Tabs */}
              <div className="space-y-1.5 pt-1">
                <label className="block font-bold text-slate-700">발표 IR 자료 형식 선택</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'IMAGE', icon: ImageIcon, label: '🖼️ 상세 이미지 다중 등록' },
                    { id: 'PDF', icon: FileText, label: '📄 PDF 발표자료 슬라이드' },
                    { id: 'WEB', icon: Globe, label: '🌐 웹 시연 링크 Sandbox' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setSubmitForm({ ...submitForm, format: fmt.id as ProjectFormat })}
                      className={`py-2 px-3 rounded-xl border text-center transition cursor-pointer ${
                        submitForm.format === fmt.id
                          ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{fmt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">상세 스토리 및 기술 설명</label>
                <textarea
                  rows={3}
                  placeholder="팀의 창업 동기, 타깃 시장, 원천 기술 등을 자세히 설명해주세요."
                  value={submitForm.description}
                  onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">핵심 성과 1</label>
                  <input
                    type="text"
                    placeholder="예: 특허 1건 출원 완료"
                    value={submitForm.highlight1}
                    onChange={(e) => setSubmitForm({ ...submitForm, highlight1: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">핵심 성과 2</label>
                  <input
                    type="text"
                    placeholder="예: 사전 사용자 테스트 500명 확보"
                    value={submitForm.highlight2}
                    onChange={(e) => setSubmitForm({ ...submitForm, highlight2: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                  🚀 2026 데모데이 출품작 등록 완료
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================
          VIEW 6: 16:9 DARK PROJECTOR SCREEN VIEW (FULLSCREEN OVERLAY)
          ======================================================== */}
      {isProjectorOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B0F19] text-white flex flex-col justify-between overflow-hidden select-none dark-projector">
          
          {/* Top Bar for Projector */}
          <div className="p-4 sm:p-6 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span>LIVE 4K PROJECTOR SCREEN</span>
              </div>
              <span className="text-sm font-extrabold tracking-tight text-white hidden sm:inline">
                2026 UNIVERSITY STARTUP DEMODAY · 실시간 순위 전광판
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Confetti Trigger Button for Award moments */}
              <button
                type="button"
                onClick={fireGrandConfetti}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/30 hover:scale-105 transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>축하 꽃가루 발사 (Confetti)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsProjectorOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main 16:9 Stage Area: Top 3 3D-Podium Section */}
          <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 py-6 relative">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="text-center mb-6 space-y-1">
              <span className="text-amber-400 font-mono text-xs tracking-widest uppercase">
                Official Real-time Leaderboard
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                실시간 종합 랭킹 & 환산 스코어
              </h1>
            </div>

            {/* 3D-PODIUM (2nd - 1st - 3rd) */}
            <div className="w-full max-w-4xl grid grid-cols-3 gap-3 sm:gap-6 items-end">
              
              {/* 2ND PLACE (SILVER) */}
              {leaderboardData[1] && (
                <div className="flex flex-col items-center">
                  <div className="w-full bg-gradient-to-b from-slate-800/80 to-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-500/30 backdrop-blur-md text-center space-y-2 shadow-xl hover:-translate-y-1 transition duration-200">
                    <span className="text-2xl">🥈</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-700/80 text-slate-200 font-bold">
                      RANK 02
                    </span>
                    <h3 className="font-bold text-white text-sm sm:text-base line-clamp-1">
                      {leaderboardData[1].title}
                    </h3>
                    <div className="text-xs text-slate-400">
                      {leaderboardData[1].teamNumber} · {leaderboardData[1].teamName}
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <div className="text-lg sm:text-xl font-extrabold font-mono text-cyan-300">
                        {leaderboardData[1].raisedCredits.toLocaleString()} <span className="text-xs text-slate-400">CR</span>
                      </div>
                      <div className="text-sm font-extrabold font-mono text-slate-300">
                        {leaderboardData[1].convertedPoints.toFixed(1)} 점
                      </div>
                    </div>
                  </div>
                  {/* Silver Pillar */}
                  <div className="w-full h-24 sm:h-32 bg-gradient-to-b from-slate-700 to-slate-800 rounded-b-2xl border-x border-b border-slate-600/50 flex items-center justify-center font-mono font-bold text-slate-400 text-lg">
                    2nd
                  </div>
                </div>
              )}

              {/* 1ST PLACE (GOLD) - Center Elevated & Glowing */}
              {leaderboardData[0] && (
                <div className="flex flex-col items-center -mt-6">
                  <div className="w-full bg-gradient-to-b from-amber-950/80 via-slate-900/90 to-slate-950 rounded-2xl p-5 sm:p-6 border-2 border-amber-400/80 backdrop-blur-md text-center space-y-2 shadow-2xl shadow-amber-500/20 relative animate-pulse-glow">
                    {/* Crown Icon */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-2xl shadow-lg shadow-amber-400/50 font-bold">
                      👑
                    </div>

                    <div className="pt-3">
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black tracking-wide">
                        CHAMPION 1ST
                      </span>
                    </div>

                    <h3 className="font-extrabold text-white text-base sm:text-lg line-clamp-1 pt-1">
                      {leaderboardData[0].title}
                    </h3>
                    <div className="text-xs font-semibold text-amber-300">
                      {leaderboardData[0].teamNumber} · {leaderboardData[0].teamName}
                    </div>

                    <div className="pt-2 border-t border-amber-400/20">
                      <div className="text-xl sm:text-2xl font-black font-mono text-amber-400">
                        {leaderboardData[0].raisedCredits.toLocaleString()} <span className="text-xs text-amber-200">CR</span>
                      </div>
                      <div className="text-base sm:text-lg font-black font-mono text-cyan-300">
                        {leaderboardData[0].convertedPoints.toFixed(1)} 점
                      </div>
                    </div>
                  </div>
                  {/* Gold Pillar */}
                  <div className="w-full h-36 sm:h-48 bg-gradient-to-b from-amber-600 to-amber-800 rounded-b-2xl border-x border-b border-amber-400/60 flex items-center justify-center font-mono font-black text-amber-200 text-2xl shadow-lg">
                    1st
                  </div>
                </div>
              )}

              {/* 3RD PLACE (BRONZE) */}
              {leaderboardData[2] && (
                <div className="flex flex-col items-center">
                  <div className="w-full bg-gradient-to-b from-slate-800/80 to-slate-900/90 rounded-2xl p-4 sm:p-5 border border-amber-700/40 backdrop-blur-md text-center space-y-2 shadow-xl hover:-translate-y-1 transition duration-200">
                    <span className="text-2xl">🥉</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 font-bold">
                      RANK 03
                    </span>
                    <h3 className="font-bold text-white text-sm sm:text-base line-clamp-1">
                      {leaderboardData[2].title}
                    </h3>
                    <div className="text-xs text-slate-400">
                      {leaderboardData[2].teamNumber} · {leaderboardData[2].teamName}
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <div className="text-lg sm:text-xl font-extrabold font-mono text-cyan-300">
                        {leaderboardData[2].raisedCredits.toLocaleString()} <span className="text-xs text-slate-400">CR</span>
                      </div>
                      <div className="text-sm font-extrabold font-mono text-slate-300">
                        {leaderboardData[2].convertedPoints.toFixed(1)} 점
                      </div>
                    </div>
                  </div>
                  {/* Bronze Pillar */}
                  <div className="w-full h-20 sm:h-28 bg-gradient-to-b from-amber-800 to-slate-800 rounded-b-2xl border-x border-b border-amber-700/50 flex items-center justify-center font-mono font-bold text-amber-300 text-lg">
                    3rd
                  </div>
                </div>
              )}

            </div>

            {/* 4th ~ 6th Place Mini Score Strip */}
            <div className="w-full max-w-4xl mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {leaderboardData.slice(3, 6).map((t, i) => (
                <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-400">{i + 4}위</span>
                    <span className="font-semibold text-slate-200 truncate max-w-36">{t.teamName}</span>
                  </div>
                  <div className="font-mono text-cyan-300 font-bold">
                    {t.raisedCredits.toLocaleString()} CR ({t.convertedPoints.toFixed(1)}점)
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Bottom Ticker: Current Conversion Formula Banner */}
          <div className="px-6 py-3 border-t border-white/10 bg-black/60 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-amber-400">📊 공식 환산 산출식:</span>
              <span>매 {unitCredit.toLocaleString()} CR 당 = {pointScore}점 자동 환산 적용 중</span>
            </div>
            <div className="text-cyan-400 font-semibold">
              ● REAL-TIME SYNC ACTIVATED · 2026 DEMODAY JURY SYSTEM
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          GLOBAL FLOATING TOAST NOTIFICATION
          ======================================================== */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom duration-200">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <p className="text-xs font-medium leading-relaxed">{toastMessage}</p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
