export type EventStage = "PREPARING" | "REGISTRATION" | "FUNDING_OPEN" | "FUNDING_CLOSED" | "RANKING_PUBLISHED";

export interface Event {
  id: string;
  name: string;
  institution: string; // 학교명
  session: string; // 회차 (예: 2026 가을학기)
  eventDate: string;
  baseCredit: number; // 10,000
  minInvestment: number; // 2,000
  maxInvestment: number; // 5,000
  currentStage: EventStage;
  isRankingPublic: boolean;
  creditUnitForScore?: number; // 환산 기준 크레딧 (예: 1000 CR)
  scorePerCreditUnit?: number; // 환산 점수 (예: 10 점)
}

export interface Team {
  id: string;
  eventId: string;
  teamNumber: number;
  name: string;
}

export type UserRole = "STUDENT" | "JUDGE" | "ADMIN";

export interface RosterItem {
  email: string;
  name: string;
  role: UserRole;
  teamId?: string;
  teamName?: string;
  institution: string;
  department: string;
  studentNumber: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  institution: string;
  department: string;
  studentNumber: string;
  role: UserRole;
  teamId?: string;
  teamName?: string;
  eventId: string;
  privacyAgreed: boolean;
  password?: string; // 로그인 비밀번호 (기본: 123456 or 8자리 난수)
}

export type LandingFormat = "IMAGE" | "PDF" | "HTML" | "WEB" | "VIDEO";
export type MediaType = "IMAGE" | "PDF" | "HTML" | "VIDEO";
export type ProjectCategory = "AI/SaaS" | "Bio/Health" | "FinTech" | "GreenTech" | "Robotics" | "EdTech";

export interface ProjectMediaItem {
  id: string;
  type: MediaType;
  priority: number; // 1, 2, 3, 4 ... 우선순위
  title?: string;
  url: string; // 이미지/PDF/HTML/동영상 URL 또는 Storage URL
  images?: string[]; // 다중 이미지
  htmlContent?: string; // HTML 파일 업로드 텍스트 내용
  videoType?: "FILE" | "URL"; // 동영상 구분
  fileName?: string;
}

export interface TeamMemberDetail {
  id: string;
  email: string;
  name: string;
  department?: string;
  studentNumber?: string;
}

export interface Comment {
  id: string;
  author: string;
  team: string;
  amount?: number;
  message: string;
  timestamp: string;
}

export interface PdfSlide {
  title: string;
  subtitle: string;
  content: string;
  keyMetrics: string[];
}

export interface Project {
  id: string;
  eventId?: string;
  teamId: string;
  teamName: string;
  teamNumber: number;
  title: string;
  summary: string;
  description: string;
  thumbnailUrl: string;
  landingFormat: LandingFormat;
  landingUrl: string;
  landingImages?: string[];
  lastModifierName: string;
  lastModifiedAt: string;
  isHidden: boolean;
  totalCredits: number;
  investorCount: number;
  authorId?: string;
  authorName?: string;
  authorEmail?: string;
  category?: ProjectCategory;
  targetCredits?: number;
  pitchHighlights?: string[];
  teamMembers?: { name: string; role: string }[];
  teamMemberIds?: string[]; // 소속 팀원 ID 목록 (투자 제한용)
  teamMemberDetails?: TeamMemberDetail[]; // 팀원 상세 정보 (이름, 학과, 학번)
  mediaItems?: ProjectMediaItem[]; // 4종 미디어 및 우선순위 배열
  comments?: Comment[];
  detailImages?: string[];
  pdfSlides?: PdfSlide[];
  webDemoUrl?: string;
  webDemoFeatures?: string[];
  isUserProject?: boolean;
}

export interface Investment {
  id: string;
  eventId: string;
  investorId: string;
  investorName: string;
  projectId: string;
  teamId: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

