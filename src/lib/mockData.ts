import { Event, Project, User, Investment, RosterItem } from "@/types";

export const INITIAL_EVENT: Event = {
  id: "evt-2026-fall-01",
  name: "2026 대한민국 대학생 창업·창작 프로젝트 데모데이",
  institution: "서울혁신대학교",
  session: "제3회 정기 데모데이",
  eventDate: "2026-10-27",
  baseCredit: 10000,
  minInvestment: 2000,
  maxInvestment: 5000,
  currentStage: "FUNDING_OPEN",
  isRankingPublic: false,
};

export const INITIAL_ROSTER: RosterItem[] = [
  {
    email: "student1@gmail.com",
    name: "임종락",
    role: "STUDENT",
    teamId: "team-01",
    teamName: "뉴로보이스 (Team 01)",
    institution: "서울혁신대학교",
    department: "컴퓨터공학과",
    studentNumber: "2021-14022",
  },
  {
    email: "admin@gmail.com",
    name: "총괄 관리자",
    role: "ADMIN",
    institution: "창업교육센터",
    department: "운영총괄",
    studentNumber: "ADMIN-00",
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: "user-student-1",
    email: "student1@gmail.com",
    password: "password123",
    name: "임종락",
    institution: "서울혁신대학교",
    department: "컴퓨터공학과",
    studentNumber: "2021-14022",
    role: "STUDENT",
    teamId: "team-01",
    teamName: "뉴로보이스 (Team 01)",
    eventId: "evt-2026-fall-01",
    privacyAgreed: true,
  },
  {
    id: "user-admin-1",
    email: "admin@gmail.com",
    password: "password123",
    name: "총괄 관리자",
    institution: "창업교육센터",
    department: "운영총괄",
    studentNumber: "ADMIN-00",
    role: "ADMIN",
    teamId: undefined,
    teamName: undefined,
    eventId: "evt-2026-fall-01",
    privacyAgreed: true,
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-01",
    teamId: "team-01",
    teamName: "팀 뉴로보이스",
    teamNumber: 1,
    title: "뉴로보이스 (NeuroVoice) — 신경 뇌파 기반 실시간 음성 합성 디바이스",
    summary: "루게릭병 및 발화 장애인을 위한 비침습적 초소형 이어셋과 온디바이스 생성 AI 보조공학 솔루션",
    description: `[프로젝트 핵심 요약]
인간의 의사소통 권리는 어떤 순간에도 박탈되어서는 안 됩니다.
뉴로보이스는 성대를 사용할 수 없는 근위축성 측삭경화증 환자 및 성대 절제 수술 환자를 위해, 귀 뒤에서 측정되는 미세한 뇌파(EEG)와 표면 안면 근전도(sEMG) 신호를 98.4%의 정확도로 해석합니다.

[기술 및 기능적 특장점]
1. 초소형 인이어 디바이스: 일상생활에서 부담 없이 착용 가능한 12g 초경량 설계
2. 온디바이스 SLM 탑재: 인터넷 연결 없이 80ms 초저지연 실시간 음성 합성
3. 음색 복원 알고리즘: 환자의 발병 전 과거 음성 녹음본을 기반으로 고유 음색 99% 재현

[크라우드펀딩 목표]
시제품 2차 금형 제작 및 서울대병원 임상 피험자 파일럿 테스트 진행을 위한 연구개발비로 활용됩니다.`,
    thumbnailUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1200&q=80",
    landingFormat: "IMAGE",
    landingUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1600&q=80",
    landingImages: [
      "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1600&q=80"
    ],
    lastModifierName: "임종락",
    lastModifiedAt: "2026-10-16 14:20",
    isHidden: false,
    totalCredits: 6000,
    investorCount: 2,
    authorId: "user-student-1",
    authorName: "임종락",
    authorEmail: "student1@gmail.com",
  },
  {
    id: "proj-02",
    teamId: "team-02",
    teamName: "아키스케치 랩",
    teamNumber: 2,
    title: "BIM-Forge — 손스케치 한 장으로 1분 만에 완성되는 건축 3D 모델링 SaaS",
    summary: "건축사를 위한 설계 자동화 솔루션. 복잡한 지자체 조례 자동 필터링 및 BIM 모델링 자동 생성",
    description: `[프로젝트 핵심 요약]
건축 설계 초기 기획 단계에서 법규 검토에만 평균 14일이 소요됩니다.
BIM-Forge는 아이패드 손스케치와 대지 지번을 입력하면, 지자체 건폐율·용적률·일조사선 제한을 실시간 반영하여 즉시 시공 가능한 3D Revit 호환 모델과 공사비 개략 견적서를 생성합니다.

[기술 및 기능적 특장점]
1. 도면 생성 AI 엔진: 2D 라인 스케치를 3D 파라메트릭 볼륨으로 실시간 변환
2. 전국 지자체 조례 DB 연동: 최신 건축법 및 도시계획 조례 위반 여부 3초 내 검토
3. IFC 및 Revit 파일 즉시 내보내기

[크라우드펀딩 목표]
전국 50개 건축사사무소 대상 클로즈드 베타 서비스 및 클라우드 GPU 인프라 확장을 위해 펀딩을 진행합니다.`,
    thumbnailUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
    landingFormat: "PDF",
    landingUrl: "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
    landingImages: [
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80"
    ],
    lastModifierName: "총괄 관리자",
    lastModifiedAt: "2026-10-16 15:10",
    isHidden: false,
    totalCredits: 4000,
    investorCount: 1,
    authorId: "user-admin-1",
    authorName: "총괄 관리자",
    authorEmail: "admin@gmail.com",
  },
];

export const INITIAL_INVESTMENTS: Investment[] = [];
