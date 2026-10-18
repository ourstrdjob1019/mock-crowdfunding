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

export const INITIAL_ROSTER: RosterItem[] = [];

export const INITIAL_USERS: User[] = [];

export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_INVESTMENTS: Investment[] = [];
