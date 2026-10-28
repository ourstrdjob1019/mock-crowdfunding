"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Event, Project, User, Investment, EventStage, RosterItem, UserRole, Comment } from "@/types";
import { INITIAL_EVENT, INITIAL_ROSTER, INITIAL_PROJECTS, INITIAL_USERS, INITIAL_INVESTMENTS } from "@/lib/mockData";
import {
  fetchAllFromSupabase,
  dbInsertUser,
  dbResetPassword,
  dbInsertProject,
  dbUpdateProject,
  dbDeleteProject,
  dbSaveInvestment,
  dbDeleteInvestment,
  dbResetAllInvestments,
  dbUpdateEvent,
  mapDbUserToModel,
} from "@/lib/supabaseService";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";

export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  teamId?: string;
  teamName?: string;
  institution?: string;
  department?: string;
  studentNumber?: string;
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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  demoLogin: (userId: string) => void;
  register: (data: RegisterFormData) => Promise<{ success: boolean; message: string }>;
  resetPassword: (userId: string) => Promise<{ success: boolean; tempPassword?: string; message: string }>;
  logout: () => void;
  setCurrentUser: (user: User) => void;
  setStage: (stage: EventStage) => Promise<void>;
  toggleRankingPublic: () => Promise<void>;
  toggleProjectVisibility: (projectId: string) => Promise<void>;
  invest: (projectId: string, amount: number) => Promise<{ success: boolean; message: string }>;
  cancelInvestment: (investmentId: string) => Promise<{ success: boolean; message: string }>;
  addComment: (projectId: string, message: string) => Promise<{ success: boolean; message: string }>;
  resetCreditsToDefault: () => void;
  getUserInvestmentForProject: (projectId: string) => Investment | undefined;
  getUserTotalInvestments: () => Investment[];
  createProject: (
    data: Omit<Project, "id" | "totalCredits" | "investorCount" | "lastModifierName" | "lastModifiedAt" | "isHidden">
  ) => Promise<{ success: boolean; project?: Project; message: string }>;
  updateProject: (project: Partial<Project> & { id: string }) => Promise<{ success: boolean; message: string }>;
  deleteProject: (projectId: string) => Promise<{ success: boolean; message: string }>;
  resetAllInvestments: () => Promise<{ success: boolean; message: string }>;
  resetAllData: () => void;
  refreshFromSupabase: () => Promise<void>;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [event, setEventState] = useState<Event>(INITIAL_EVENT);
  const [users, setUsers] = useState<User[]>([]);
  const [roster] = useState<RosterItem[]>(INITIAL_ROSTER);
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const STORAGE_VERSION = "v16_supabase_single_source_of_truth";

  // 로컬스토리지 용량 초과(QuotaExceededError) 및 구버전 캐시 오염 방지를 위해
  // 데이터는 오직 Supabase DB를 단일 원본(Single Source of Truth)으로 사용합니다.
  const saveToStorage = (_newEvent: Event, _newProjects: Project[], _newInvestments: Investment[], _newUsers: User[]) => {
    try {
      localStorage.setItem("mc_data_version", STORAGE_VERSION);
      localStorage.removeItem("mc_projects");
      localStorage.removeItem("mc_investments");
      localStorage.removeItem("mc_users");
      localStorage.removeItem("mc_event");
    } catch (e) {
      console.warn("Local storage cleanup warning:", e);
    }
  };

  // Supabase 실시간 데이터 로딩 함수 (오직 Supabase DB 기준)
  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);

    try {
      // 이전 브라우저 로컬 캐시 완전 제거 (학생 폰에 남아있던 구버전 데이터 노출 원천 차단)
      localStorage.removeItem("mc_projects");
      localStorage.removeItem("mc_investments");
      localStorage.removeItem("mc_users");
      localStorage.removeItem("mc_event");
      localStorage.setItem("mc_data_version", STORAGE_VERSION);
    } catch {}

    try {
      const supaData = await fetchAllFromSupabase();
      if (!supaData.error) {
        const finalProjects = Array.isArray(supaData.projects) ? supaData.projects : [];
        const finalInvestments = Array.isArray(supaData.investments) ? supaData.investments : [];
        const finalUsers = supaData.users && supaData.users.length > 0 ? supaData.users : INITIAL_USERS;

        setProjects(finalProjects);
        setUsers(finalUsers);
        setInvestments(finalInvestments);
        if (supaData.event) {
          setEventState(supaData.event);
        }

        // 로그인 유지 유저 동기화 (Supabase users 테이블 기준)
        const currentSavedId = localStorage.getItem("mc_current_user_id");
        const currentIsLoggedOut = localStorage.getItem("mc_logged_out") === "true";
        if (!currentIsLoggedOut && currentSavedId && finalUsers.length > 0) {
          const found = finalUsers.find((u: User) => u.id === currentSavedId);
          if (found) {
            setCurrentUserState(found);
            setIsLoggedIn(true);
          } else {
            setCurrentUserState(null);
            setIsLoggedIn(false);
            localStorage.removeItem("mc_current_user_id");
          }
        } else if (currentIsLoggedOut || !currentSavedId) {
          setCurrentUserState(null);
          setIsLoggedIn(false);
        }
      }
    } catch (err) {
      console.warn("Supabase fetch failed:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(false);

    // 탭 활성화(포커스) 시 Supabase 최신 데이터 자동 동기화
    const handleFocus = () => {
      loadData(true);
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const refreshFromSupabase = async () => {
    await loadData(false);
  };

  // 로그인 로직 (메모리에 없으면 Supabase DB 직접 조회)
  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      return { success: false, message: "이메일 주소를 입력해 주세요." };
    }
    if (!password) {
      return { success: false, message: "비밀번호를 입력해 주세요." };
    }

    let targetUser: User | undefined;

    // 1. Supabase DB 테이블에서 실시간 직접 검색 우선 수행 (최신 비밀번호 및 계정 동기화)
    if (supabase) {
      try {
        const { data: dbUser } = await supabase
          .from("users")
          .select("*")
          .ilike("email", trimmedEmail)
          .maybeSingle();

        if (dbUser) {
          targetUser = mapDbUserToModel(dbUser);
          setUsers((prev) => [...prev.filter((u) => u.id !== targetUser!.id), targetUser!]);
        }
      } catch (err) {
        console.warn("Supabase user search failed:", err);
      }
    }

    // 2. DB에서 못 찾았을 경우 현재 로드된 users 목록에서 찾기
    if (!targetUser) {
      targetUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    }

    if (!targetUser) {
      return {
        success: false,
        message: "등록되지 않은 계정입니다. 아이디와 비밀번호를 다시 확인해 주세요.",
      };
    }

    // 비밀번호 엄격 검증 (필수 일치)
    const expectedPassword = targetUser.password || "password123";
    if (expectedPassword !== password) {
      return {
        success: false,
        message: "비밀번호가 올바르지 않습니다. 다시 입력해 주세요.",
      };
    }

    setCurrentUserState(targetUser);
    setIsLoggedIn(true);
    localStorage.removeItem("mc_logged_out");
    localStorage.setItem("mc_current_user_id", targetUser.id);
    return { success: true, message: `${targetUser.name}님 환영합니다.` };
  };

  // 데모 간편 로그인 (비활성화 - 이메일 및 비밀번호 인증 필수)
  const demoLogin = (_userId: string) => {
    console.warn("보안 정책에 의해 간편 로그인 및 계정 전환이 차단되었습니다.");
  };

  // 회원가입 (Supabase DB + LocalStorage 동시 저장)
  const register = async (data: RegisterFormData): Promise<{ success: boolean; message: string }> => {
    const trimmedEmail = data.email.trim().toLowerCase();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      return { success: false, message: "올바른 이메일 주소를 입력해 주세요." };
    }

    const alreadyRegistered = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (alreadyRegistered) {
      return { success: false, message: "이미 가입된 이메일입니다. 로그인해 주세요." };
    }

    if (!data.privacyAgreed) {
      return { success: false, message: "개인정보 수집 및 이용 동의가 필요합니다." };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: trimmedEmail,
      password: data.password || "password123",
      name: data.name.trim() || trimmedEmail.split("@")[0],
      institution: data.institution || event.institution,
      department: data.department || "자유 참가",
      studentNumber: data.studentNumber || "",
      role: data.role || "STUDENT",
      teamId: data.teamId || undefined,
      teamName: data.teamName || undefined,
      eventId: event.id || "evt-2026-fall-01",
      privacyAgreed: true,
    };

    // 1. Supabase DB에 저장 시도
    await dbInsertUser(newUser);

    // 2. 로컬 상태 업데이트
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUserState(newUser);
    setIsLoggedIn(true);
    localStorage.removeItem("mc_logged_out");
    localStorage.setItem("mc_current_user_id", newUser.id);
    saveToStorage(event, projects, investments, updatedUsers);

    confetti({
      particleCount: 60,
      spread: 70,
      colors: ["#0052FF", "#4D7CFF", "#FFFFFF"],
    });

    return {
      success: true,
      message: `${newUser.name}님 환영합니다! 10,000 CR이 충전되었습니다.`,
    };
  };

  // 관리자 기능: 비밀번호 리셋 (Supabase DB + LocalStorage)
  const resetPassword = async (userId: string): Promise<{ success: boolean; tempPassword?: string; message: string }> => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) {
      return { success: false, message: "해당 사용자를 찾을 수 없습니다." };
    }

    const tempPassword = Math.floor(10000000 + Math.random() * 90000000).toString();

    // Supabase DB 갱신
    await dbResetPassword(userId, tempPassword);

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
    localStorage.setItem("mc_logged_out", "true");
  };

  const setCurrentUser = (user: User) => {
    // 현재 로그인된 본인 계정의 정보 갱신만 허용 (타 계정으로 무단 전환 원천 차단)
    if (currentUser && currentUser.id === user.id) {
      setCurrentUserState(user);
    }
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

  const setStage = async (stage: EventStage) => {
    const isPublic = stage === "RANKING_PUBLISHED";
    const updated = { ...event, currentStage: stage, isRankingPublic: isPublic };
    setEventState(updated);
    saveToStorage(updated, projects, investments, users);
    await dbUpdateEvent(updated);

    if (isPublic) {
      confetti({
        particleCount: 90,
        spread: 90,
        colors: ["#0052FF", "#4D7CFF", "#0F172A", "#FFFFFF"],
      });
    }
  };

  const toggleRankingPublic = async () => {
    const updated = { ...event, isRankingPublic: !event.isRankingPublic };
    setEventState(updated);
    saveToStorage(updated, projects, investments, users);
    await dbUpdateEvent(updated);
  };

  const toggleProjectVisibility = async (projectId: string) => {
    const updatedProjects = projects.map((p) =>
      p.id === projectId ? { ...p, isHidden: !p.isHidden } : p
    );
    const target = updatedProjects.find((p) => p.id === projectId);
    setProjects(updatedProjects);
    saveToStorage(event, updatedProjects, investments, users);
    if (target) {
      await dbUpdateProject(projectId, { isHidden: target.isHidden });
    }
  };

  // 1. 새 프로젝트 등록 (Supabase DB + LocalStorage)
  const createProject = async (
    data: Omit<Project, "id" | "totalCredits" | "investorCount" | "lastModifierName" | "lastModifiedAt" | "isHidden">
  ): Promise<{ success: boolean; project?: Project; message: string }> => {
    if (!currentUser) {
      return { success: false, message: "로그인이 필요합니다." };
    }

    const newId = `proj-${Date.now().toString().slice(-6)}`;
    const teamId = data.teamId || `team-${Date.now().toString().slice(-6)}`;
    const newProject: Project = {
      ...data,
      id: newId,
      teamId,
      teamNumber: data.teamNumber || projects.length + 1,
      totalCredits: 0,
      investorCount: 0,
      lastModifierName: currentUser.name,
      lastModifiedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      isHidden: false,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorEmail: currentUser.email,
    };

    // 1. Supabase DB 저장 (projects 및 teams 테이블 동시 저장)
    const dbRes = await dbInsertProject(newProject);
    if (!dbRes.success) {
      console.error("[AppContext] Supabase DB insert failed:", dbRes.error);
      return {
        success: false,
        message: `프로젝트 DB 저장 실패: ${dbRes.error || "데이터베이스에 저장할 수 없습니다."}`,
      };
    }

    // 2. 출품 등록자의 소속 팀 정보도 함께 갱신
    const updatedUser: User = {
      ...currentUser,
      teamId,
      teamName: data.teamName,
    };
    setCurrentUserState(updatedUser);
    const updatedUsers = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
    setUsers(updatedUsers);
    await dbInsertUser(updatedUser);

    // 3. 로컬 상태 및 스토리지 업데이트
    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    saveToStorage(event, updatedProjects, investments, updatedUsers);

    confetti({
      particleCount: 50,
      spread: 60,
      colors: ["#0052FF", "#4D7CFF", "#FFFFFF"],
    });

    return {
      success: true,
      project: newProject,
      message: "새 프로젝트가 성공적으로 출품 등록되었습니다!",
    };
  };

  // 2. 프로젝트 수정 (Supabase DB + LocalStorage)
  const updateProject = async (updatedFields: Partial<Project> & { id: string }): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: "로그인이 필요합니다." };
    }

    const targetProject = projects.find((p) => p.id === updatedFields.id);
    if (!targetProject) {
      return { success: false, message: "해당 프로젝트를 찾을 수 없습니다." };
    }

    const isAuthor = targetProject.authorId === currentUser.id;
    const isAdmin = currentUser.role === "ADMIN";
    if (!isAuthor && !isAdmin) {
      return { success: false, message: "본인이 작성한 프로젝트만 수정할 수 있습니다." };
    }

    const fullUpdates = {
      ...updatedFields,
      lastModifierName: currentUser.name,
      lastModifiedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    // Supabase DB 갱신
    await dbUpdateProject(updatedFields.id, fullUpdates);

    const updatedProjects = projects.map((p) =>
      p.id === updatedFields.id
        ? {
            ...p,
            ...fullUpdates,
          }
        : p
    );

    setProjects(updatedProjects);
    saveToStorage(event, updatedProjects, investments, users);
    return { success: true, message: "프로젝트가 성공적으로 수정되었습니다." };
  };

  // 3. 프로젝트 삭제 (Supabase DB + LocalStorage)
  const deleteProject = async (projectId: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: "로그인이 필요합니다." };
    }

    const targetProject = projects.find((p) => p.id === projectId);
    if (!targetProject) {
      return { success: false, message: "삭제할 프로젝트를 찾을 수 없습니다." };
    }

    const isAuthor = targetProject.authorId === currentUser.id;
    const isAdmin = currentUser.role === "ADMIN";
    if (!isAuthor && !isAdmin) {
      return { success: false, message: "본인이 작성한 프로젝트만 삭제할 수 있습니다." };
    }

    // Supabase DB 삭제 (projects 및 teams 테이블 동시 삭제)
    await dbDeleteProject(projectId, targetProject.teamId);

    const updatedProjects = projects.filter((p) => p.id !== projectId);
    const updatedInvestments = investments.filter((inv) => inv.projectId !== projectId);

    setProjects(updatedProjects);
    setInvestments(updatedInvestments);
    saveToStorage(event, updatedProjects, updatedInvestments, users);

    return { success: true, message: "프로젝트가 삭제되었습니다." };
  };

  // 4. 펀딩 투자 (Supabase DB + LocalStorage)
  const invest = async (projectId: string, amount: number): Promise<{ success: boolean; message: string }> => {
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

    const isAuthor =
      targetProject.authorId === currentUser.id ||
      (Boolean(currentUser.email) && targetProject.authorEmail?.toLowerCase() === currentUser.email.toLowerCase());
    const isMyTeam = Boolean(currentUser.teamId && currentUser.teamId === targetProject.teamId);

    // 팀원 목록에 포함되어 있는지 확인 (아이디, 이메일, 학번 대조)
    const isTeamMember = Boolean(
      (targetProject.teamMemberIds && (
        targetProject.teamMemberIds.includes(currentUser.id) ||
        (currentUser.email && targetProject.teamMemberIds.map(s => s.toLowerCase()).includes(currentUser.email.toLowerCase())) ||
        (currentUser.studentNumber && targetProject.teamMemberIds.includes(currentUser.studentNumber))
      )) ||
      (targetProject.teamMemberDetails && targetProject.teamMemberDetails.some(m => 
        m.id === currentUser.id ||
        (currentUser.email && m.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
        (currentUser.studentNumber && m.studentNumber === currentUser.studentNumber)
      ))
    );

    if (isAuthor || isMyTeam || isTeamMember) {
      return { success: false, message: "본인 또는 소속 팀원이 출품 등록한 프로젝트에는 투자할 수 없습니다." };
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

    let targetInvestment: Investment;
    let newInvestments: Investment[];
    if (existingInvestment) {
      targetInvestment = {
        ...existingInvestment,
        amount,
        updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      };
      newInvestments = investments.map((inv) =>
        inv.id === existingInvestment.id ? targetInvestment : inv
      );
    } else {
      targetInvestment = {
        id: `inv-${Date.now()}`,
        eventId: event.id || "evt-2026-fall-01",
        investorId: currentUser.id,
        investorName: currentUser.name,
        projectId,
        teamId: targetProject.teamId,
        amount,
        createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      };
      newInvestments = [...investments, targetInvestment];
    }

    // 프로젝트 총액 및 투자자 수 계산
    const projInvestments = newInvestments.filter((inv) => inv.projectId === projectId);
    const projTotal = projInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const projInvestors = projInvestments.length;

    // Supabase DB 저장
    await dbSaveInvestment(targetInvestment, projTotal, projInvestors);

    const updatedProjects = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          totalCredits: projTotal,
          investorCount: projInvestors,
        };
      }
      return p;
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

  // 5. 투자 취소 (전액 환불)
  const cancelInvestment = async (investmentId: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: "로그인이 필요합니다." };
    const targetInv = investments.find((inv) => inv.id === investmentId);
    if (!targetInv) return { success: false, message: "투자 내역을 찾을 수 없습니다." };

    let newProjectTotal = 0;
    let newInvestorCount = 0;

    const newInvestments = investments.filter((inv) => inv.id !== investmentId);
    const updatedProjects = projects.map((p) => {
      if (p.id === targetInv.projectId) {
        newProjectTotal = Math.max(0, p.totalCredits - targetInv.amount);
        newInvestorCount = Math.max(0, p.investorCount - 1);
        return {
          ...p,
          totalCredits: newProjectTotal,
          investorCount: newInvestorCount,
        };
      }
      return p;
    });

    await dbDeleteInvestment(investmentId, targetInv.projectId, newProjectTotal, newInvestorCount);

    setInvestments(newInvestments);
    setProjects(updatedProjects);
    saveToStorage(event, updatedProjects, newInvestments, users);

    return {
      success: true,
      message: `투자가 취소되어 ${targetInv.amount.toLocaleString()} CR이 지갑으로 전액 환불되었습니다.`,
    };
  };

  // 6. 응원 댓글 등록
  const addComment = async (projectId: string, message: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: "로그인이 필요합니다." };
    if (!message.trim()) return { success: false, message: "댓글 내용을 입력해 주세요." };

    const newComment: Comment = {
      id: `c_${Date.now()}`,
      author: currentUser.name,
      team: currentUser.teamName || (currentUser.role === "ADMIN" ? "운영진" : "청중 평가단"),
      message: message.trim(),
      timestamp: "방금 전",
    };

    const updatedProjects = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          comments: [newComment, ...(p.comments || [])],
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    saveToStorage(event, updatedProjects, investments, users);
    return { success: true, message: "응원 댓글이 등록되었습니다." };
  };

  // 7. 테스트 잔액 리필 / 초기화
  const resetCreditsToDefault = () => {
    if (!currentUser) return;
    const userInvestments = investments.filter((inv) => inv.investorId === currentUser.id);
    const nonUserInvestments = investments.filter((inv) => inv.investorId !== currentUser.id);

    const updatedProjects = projects.map((p) => {
      const myInv = userInvestments.find((inv) => inv.projectId === p.id);
      if (myInv) {
        return {
          ...p,
          totalCredits: Math.max(0, p.totalCredits - myInv.amount),
          investorCount: Math.max(0, p.investorCount - 1),
        };
      }
      return p;
    });

    setInvestments(nonUserInvestments);
    setProjects(updatedProjects);
    saveToStorage(event, updatedProjects, nonUserInvestments, users);
  };

  // 8. 관리자 기능: 전체 투자 내역 0원 리셋 (Supabase DB + LocalStorage)
  const resetAllInvestments = async (): Promise<{ success: boolean; message: string }> => {
    await dbResetAllInvestments();
    const zeroedProjects = projects.map((p) => ({
      ...p,
      totalCredits: 0,
      investorCount: 0,
    }));
    setInvestments([]);
    setProjects(zeroedProjects);
    localStorage.removeItem("mc_investments");
    saveToStorage(event, zeroedProjects, [], users);
    return {
      success: true,
      message: "모든 프로젝트의 투자 내역과 누적 펀딩액이 0 CR로 완전히 초기화되었습니다.",
    };
  };

  const resetAllData = () => {
    localStorage.removeItem("mc_event");
    localStorage.removeItem("mc_projects");
    localStorage.removeItem("mc_investments");
    localStorage.removeItem("mc_users");
    localStorage.removeItem("mc_current_user_id");
    setEventState(INITIAL_EVENT);
    setProjects([]);
    setInvestments([]);
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
        isLoading,
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
        cancelInvestment,
        addComment,
        resetCreditsToDefault,
        getUserInvestmentForProject,
        getUserTotalInvestments,
        createProject,
        updateProject,
        deleteProject,
        resetAllInvestments,
        resetAllData,
        refreshFromSupabase,
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
