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

export type LandingFormat = "IMAGE" | "PDF" | "HTML";

export interface Project {
  id: string;
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
