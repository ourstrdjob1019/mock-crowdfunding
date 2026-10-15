"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Event, Project, User, Investment, EventStage, RosterItem } from "@/types";
import { INITIAL_EVENT, INITIAL_USERS, INITIAL_PROJECTS, INITIAL_INVESTMENTS, INITIAL_ROSTER } from "@/lib/mockData";
import confetti from "canvas-confetti";

export interface RegisterFormData {
  email: string;
  password: string;
  institution: string;
  department: string;
  studentNumber: string;
  name: string;
  privacyAgreed: boolean;
}

interface AppContextType {
  event: Event;
  currentUser: User | null;
  isLoggedIn: boolean;
  users: User[];
  roster: RosterItem[];
  projects: Project[];
  investments: Investment[];
  remainingCredits: number;
  usedCredits: number;
  login: (email: string, password: string) => { success: boolean; message: string };
  demoLogin: (userId: string) => void;
  register: (data: RegisterFormData) => { success: boolean; message: string };
  resetPassword: (userId: string) => { success: boolean; tempPassword?: string; message: string };
  logout: () => void;
  setCurrentUser: (user: User) => void;
  setStage: (stage: EventStage) => void;
  toggleRankingPublic: () => void;
  toggleProjectVisibility: (projectId: string) => void;
  invest: (projectId: string, amount: number) => { success: boolean; message: string };
  getUserInvestmentForProject: (projectId: string) => Investment | undefined;
  getUserTotalInvestments: () => Investment[];
  updateProject: (project: Partial<Project> & { id: string }) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [event, setEventState] = useState<Event>(INITIAL_EVENT);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [roster] = useState<RosterItem[]>(INITIAL_ROSTER);
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [investments, setInvestments] = useState<Investment[]>(INITIAL_INVESTMENTS);

  // 로컬 스토리지 동기화
  useEffect(() => {
    const savedEvent = localStorage.getItem("mc_event");
    const savedProjects = localStorage.getItem("mc_projects");
    const savedInvestments = localStorage.getItem("mc_investments");
    const savedUsers = localStorage.getItem("mc_users");
    const savedCurrentUserId = localStorage.getItem("mc_current_user_id");

    if (savedEvent) setEventState(JSON.parse(savedEvent));
    if (savedProjects) setProjects(JSON.parse(savedProjects));
    if (savedInvestments) setInvestments(JSON.parse(savedInvestments));
    if (savedUsers) setUsers(JSON.parse(savedUsers));

    if (savedCurrentUserId) {
      const allUsers = savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS;
      const found = allUsers.find((u: User) => u.id === savedCurrentUserId);
      if (found) {
        setCurrentUserState(found);
        setIsLoggedIn(true);
      }
    }
  }, []);

  const saveToStorage = (newEvent: Event, newProjects: Project[], newInvestments: Investment[], newUsers: User[]) => {
    localStorage.setItem("mc_event", JSON.stringify(newEvent));
    localStorage.setItem("mc_projects", JSON.stringify(newProjects));
    localStorage.setItem("mc_investments", JSON.stringify(newInvestments));
    localStorage.setItem("mc_users", JSON.stringify(newUsers));
  };

  // 로그인 로직 (실제 저장된 비밀번호 또는 8자리 임시 비밀번호 검증)
  const login = (email: string, password: string): { success: boolean; message: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!user) {
      return {
        success: false,
        message: "등록되지 않은 계정입니다. 사전 명단에 등록된 아이디로 먼저 회원가입해 주세요.",
      };
    }

    if (!password) {
      return { success: false, message: "비밀번호를 입력해 주세요." };
    }

    // 비밀번호 체크 (설정된 비밀번호가 있으면 일치 여부 확인)
    if (user.password && user.password !== password) {
      return {
        success: false,
        message: "비밀번호가 올바르지 않습니다. 관리자가 발급한 8자리 임시 비밀번호를 입력하세요.",
      };
    }

    setCurrentUserState(user);
    setIsLoggedIn(true);
    localStorage.setItem("mc_current_user_id", user.id);
    return { success: true, message: `${user.name}님 환영합니다.` };
  };

  // 데모 간편 로그인
  const demoLogin = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUserState(user);
      setIsLoggedIn(true);
      localStorage.setItem("mc_current_user_id", user.id);
    }
  };

  // 회원가입
  const register = (data: RegisterFormData): { success: boolean; message: string } => {
    const trimmedEmail = data.email.trim().toLowerCase();

    if (!trimmedEmail.endsWith("@gmail.com")) {
      return { success: false, message: "아이디는 @gmail.com 주소만 사용 가능합니다." };
    }

    const rosterMatch = roster.find((r) => r.email.toLowerCase() === trimmedEmail);
    if (!rosterMatch) {
      return {
        success: false,
        message: "가입 불가: 관리자가 사전 등록한 행사 참가 명단에 존재하지 않는 Gmail 주소입니다.",
      };
    }

    const alreadyRegistered = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (alreadyRegistered) {
      return { success: false, message: "이미 가입 완료된 아이디입니다. 로그인해 주세요." };
    }

    if (!data.privacyAgreed) {
      return { success: false, message: "개인정보 수집 및 이용에 동의해야 가입할 수 있습니다." };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: trimmedEmail,
      password: data.password || "password123",
      name: data.name || rosterMatch.name,
      institution: data.institution || rosterMatch.institution,
      department: data.department || rosterMatch.department,
      studentNumber: data.studentNumber || rosterMatch.studentNumber,
      role: rosterMatch.role,
      teamId: rosterMatch.teamId,
      teamName: rosterMatch.teamName,
      eventId: event.id,
      privacyAgreed: true,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUserState(newUser);
    setIsLoggedIn(true);
    localStorage.setItem("mc_current_user_id", newUser.id);
    saveToStorage(event, projects, investments, updatedUsers);

    confetti({
      particleCount: 60,
      spread: 70,
      colors: ["#0052FF", "#4D7CFF", "#FFFFFF"],
    });

    return {
      success: true,
      message: `${newUser.name}님의 회원가입이 완료되었습니다. (배정 팀: ${newUser.teamName || "소속 없음"})`,
    };
  };

  // 관리자 기능: 임의의 숫자 8자리 비밀번호 자동 생성 및 계정 갱신
  const resetPassword = (userId: string): { success: boolean; tempPassword?: string; message: string } => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) {
      return { success: false, message: "해당 사용자를 찾을 수 없습니다." };
    }

    // 8자리 랜덤 숫자 생성 (예: 10000000 ~ 99999999)
    const tempPassword = Math.floor(10000000 + Math.random() * 90000000).toString();

    // 해당 유저의 비밀번호를 임시 비밀번호로 갱신
    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, password: tempPassword } : u
    );

    setUsers(updatedUsers);
    saveToStorage(event, projects, investments, updatedUsers);

    return {
      success: true,
      tempPassword,
      message: `${targetUser.name} 학생의 비밀번호가 8자리 임시 비밀번호 [${tempPassword}]로 리셋되었습니다.`,
    };
  };

  const logout = () => {
    setCurrentUserState(null);
    setIsLoggedIn(false);
    localStorage.removeItem("mc_current_user_id");
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    setIsLoggedIn(true);
    localStorage.setItem("mc_current_user_id", user.id);
  };

  const userInvestments = currentUser
    ? investments.filter((inv) => inv.investorId === currentUser.id)
    : [];
  const usedCredits = userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const remainingCredits = currentUser ? event.baseCredit - usedCredits : 0;

  const getUserInvestmentForProject = (projectId: string) => {
    if (!currentUser) return undefined;
    return investments.find((inv) => inv.investorId === currentUser.id && inv.projectId === projectId);
  };

  const getUserTotalInvestments = () => {
    return userInvestments;
  };

  const setStage = (stage: EventStage) => {
    const isPublic = stage === "RANKING_PUBLISHED";
    const updated = { ...event, currentStage: stage, isRankingPublic: isPublic };
    setEventState(updated);
    saveToStorage(updated, projects, investments, users);

    if (isPublic) {
      confetti({
        particleCount: 90,
        spread: 90,
        colors: ["#0052FF", "#4D7CFF", "#0F172A", "#FFFFFF"],
      });
    }
  };

  const toggleRankingPublic = () => {
    const updated = { ...event, isRankingPublic: !event.isRankingPublic };
    setEventState(updated);
    saveToStorage(updated, projects, investments, users);
  };

  const toggleProjectVisibility = (projectId: string) => {
    const updatedProjects = projects.map((p) =>
      p.id === projectId ? { ...p, isHidden: !p.isHidden } : p
    );
    setProjects(updatedProjects);
    saveToStorage(event, updatedProjects, investments, users);
  };

  const updateProject = (updatedFields: Partial<Project> & { id: string }) => {
    if (!currentUser) return;
    const updatedProjects = projects.map((p) =>
      p.id === updatedFields.id
        ? {
            ...p,
            ...updatedFields,
            lastModifierName: currentUser.name,
            lastModifiedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
          }
        : p
    );
    setProjects(updatedProjects);
    saveToStorage(event, updatedProjects, investments, users);
  };

  const invest = (projectId: string, amount: number): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: "로그인이 필요합니다." };
    }

    if (event.currentStage !== "FUNDING_OPEN") {
      return { success: false, message: "현재는 펀딩 진행 시간이 아닙니다." };
    }

    const targetProject = projects.find((p) => p.id === projectId);
    if (!targetProject) {
      return { success: false, message: "해당 프로젝트를 찾을 수 없습니다." };
    }

    if (currentUser.teamId && currentUser.teamId === targetProject.teamId) {
      return { success: false, message: "자신의 소속 팀 프로젝트에는 투자할 수 없습니다." };
    }

    if (amount < event.minInvestment || amount > event.maxInvestment) {
      return {
        success: false,
        message: `투자 금액은 ${event.minInvestment.toLocaleString()} ~ ${event.maxInvestment.toLocaleString()} 크레딧 범위 내여야 합니다.`,
      };
    }

    if (amount % 100 !== 0) {
      return { success: false, message: "투자 금액은 100 크레딧 단위로 입력해야 합니다." };
    }

    const existingInvestment = getUserInvestmentForProject(projectId);
    const currentInvestmentAmount = existingInvestment ? existingInvestment.amount : 0;
    const availableCredit = remainingCredits + currentInvestmentAmount;

    if (amount > availableCredit) {
      return {
        success: false,
        message: `잔여 크레딧이 부족합니다. (투자 가능 한도: ${availableCredit.toLocaleString()} 크레딧)`,
      };
    }

    let newInvestments: Investment[];
    if (existingInvestment) {
      newInvestments = investments.map((inv) =>
        inv.id === existingInvestment.id
          ? { ...inv, amount, updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16) }
          : inv
      );
    } else {
      const newInv: Investment = {
        id: `inv-${Date.now()}`,
        eventId: event.id,
        investorId: currentUser.id,
        investorName: currentUser.name,
        projectId,
        teamId: targetProject.teamId,
        amount,
        createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      };
      newInvestments = [...investments, newInv];
    }

    const updatedProjects = projects.map((p) => {
      const projInvestments = newInvestments.filter((inv) => inv.projectId === p.id);
      const total = projInvestments.reduce((sum, inv) => sum + inv.amount, 0);
      return {
        ...p,
        totalCredits: total,
        investorCount: projInvestments.length,
      };
    });

    setInvestments(newInvestments);
    setProjects(updatedProjects);
    saveToStorage(event, updatedProjects, newInvestments, users);

    return {
      success: true,
      message: existingInvestment
        ? `${targetProject.teamName}에 대한 투자가 ${amount.toLocaleString()} 크레딧으로 수정되었습니다.`
        : `${targetProject.teamName}에 ${amount.toLocaleString()} 크레딧 투자가 완료되었습니다.`,
    };
  };

  const resetAllData = () => {
    localStorage.removeItem("mc_event");
    localStorage.removeItem("mc_projects");
    localStorage.removeItem("mc_investments");
    localStorage.removeItem("mc_users");
    localStorage.removeItem("mc_current_user_id");
    setEventState(INITIAL_EVENT);
    setProjects(INITIAL_PROJECTS);
    setInvestments(INITIAL_INVESTMENTS);
    setUsers(INITIAL_USERS);
    setCurrentUserState(null);
    setIsLoggedIn(false);
  };

  return (
    <AppContext.Provider
      value={{
        event,
        currentUser,
        isLoggedIn,
        users,
        roster,
        projects,
        investments,
        remainingCredits,
        usedCredits,
        login,
        demoLogin,
        register,
        resetPassword,
        logout,
        setCurrentUser,
        setStage,
        toggleRankingPublic,
        toggleProjectVisibility,
        invest,
        getUserInvestmentForProject,
        getUserTotalInvestments,
        updateProject,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
