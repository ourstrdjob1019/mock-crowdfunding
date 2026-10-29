"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
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
  isMutating: boolean;
  mutationMessage: string | null;
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
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [mutationMessage, setMutationMessage] = useState<string | null>(null);
  const mutationLockRef = useRef<boolean>(false);

  // 동기 뮤텍스 잠금 래퍼: 광클릭(0.001초 연타) 시 첫 1회만 실행하고 나머지는 즉시 차단
  const runWithMutationLock = async <T,>(
    message: string,
    task: () => Promise<T>,
    blockedReturn: T
  ): Promise<T> => {
    if (mutationLockRef.current) {
      return blockedReturn;
    }
    mutationLockRef.current = true;
    setIsMutating(true);
    setMutationMessage(message);
    try {
      return await task();
    } finally {
      mutationLockRef.current = false;
      setIsMutating(false);
      setMutationMessage(null);
    }
  };

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
        if (supaData.projectsLoaded) {
          setProjects(supaData.projects);
        }
        if (supaData.investmentsLoaded) {
          setInvestments(supaData.investments);
        }
        if (supaData.usersLoaded) {
          const finalUsers = supaData.users.length > 0 ? supaData.users : INITIAL_USERS;
          setUsers(finalUsers);

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
        if (supaData.event) {
          setEventState(supaData.event);
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

    // 1. 탭 활성화(포커스) 시 Supabase 최신 데이터 즉시 동기화
    const handleFocus = () => {
      loadData(true);
    };
    window.addEventListener("focus", handleFocus);

    // 2. 10초 주기 백그라운드 무중단 폴링 (모바일 네트워크/방화벽 환경에서도 100% 실시간 동기화 보장)
    const pollInterval = setInterval(() => {
      loadData(true);
    }, 10000);

    // 3. Supabase Realtime WebSocket 구독 (투자, 프로젝트, 행사 단계 변경 시 즉시 반영)
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const triggerRealtimeSync = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadData(true);
      }, 400);
    };

    const channel = supabase
      ? supabase
          .channel("realtime-crowdfund-sync")
          .on("postgres_changes", { event: "*", schema: "public", table: "investments" }, triggerRealtimeSync)
          .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, triggerRealtimeSync)
          .on("postgres_changes", { event: "*", schema: "public", table: "events" }, triggerRealtimeSync)
          .on("postgres_changes", { event: "*", schema: "public", table: "users" }, triggerRealtimeSync)
          .subscribe()
      : null;

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(pollInterval);
      if (debounceTimer) clearTimeout(debounceTimer);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
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

  // 1. 새 프로젝트 등록 (Supabase DB + 중복 클릭 원천 잠금)
  const createProject = async (
    data: Omit<Project, "id" | "totalCredits" | "investorCount" | "lastModifierName" | "lastModifiedAt" | "isHidden">
  ): Promise<{ success: boolean; project?: Project; message: string }> => {
    if (!currentUser) {
      return { success: false, message: "로그인이 필요합니다." };
    }

    return runWithMutationLock(
      "새 프로젝트 출품 정보를 서버에 등록하고 있습니다...",
      async () => {
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

        // 3. 로컬 상태 업데이트
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
      },
      { success: false, message: "현재 서버와 데이터 통신 중입니다. 잠시만 기다려 주세요." }
    );
  };

  // 2. 프로젝트 수정 (Supabase DB + 중복 클릭 원천 잠금)
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

    return runWithMutationLock(
      "프로젝트 수정 사항을 서버에 저장하고 있습니다...",
      async () => {
        const fullUpdates = {
          ...updatedFields,
          lastModifierName: currentUser.name,
          lastModifiedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        };

        // Supabase DB 갱신
        const dbRes = await dbUpdateProject(updatedFields.id, fullUpdates);
        if (!dbRes.success) {
          return { success: false, message: `수정 저장 실패: ${dbRes.error || "DB 오류"}` };
        }

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
      },
      { success: false, message: "현재 서버와 데이터 통신 중입니다. 잠시만 기다려 주세요." }
    );
  };

  // 3. 프로젝트 삭제 (Supabase DB + 중복 클릭 원천 잠금)
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

    return runWithMutationLock(
      "프로젝트를 서버에서 삭제하고 있습니다...",
      async () => {
        // Supabase DB 삭제 (projects 및 teams 테이블 동시 삭제)
        await dbDeleteProject(projectId, targetProject.teamId);

        const updatedProjects = projects.filter((p) => p.id !== projectId);
        const updatedInvestments = investments.filter((inv) => inv.projectId !== projectId);

        setProjects(updatedProjects);
        setInvestments(updatedInvestments);
        saveToStorage(event, updatedProjects, updatedInvestments, users);

        return { success: true, message: "프로젝트가 삭제되었습니다." };
      },
      { success: false, message: "현재 서버와 데이터 통신 중입니다. 잠시만 기다려 주세요." }
    );
  };

  // 4. 펀딩 투자 (고정 조합 ID + 동기 뮤텍스 잠금 + 서버 한도 검증으로 광클릭 중복 생성 원천 차단)
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

    return runWithMutationLock(
      "투자 내역을 서버에 안전하게 기록하고 있습니다...",
      async () => {
        const existingInvestment = getUserInvestmentForProject(projectId);
        const currentInvestmentAmount = existingInvestment ? existingInvestment.amount : 0;
        const availableCredit = remainingCredits + currentInvestmentAmount;

        if (amount > availableCredit) {
          return {
            success: false,
            message: `잔여 크레딧이 부족합니다. (투자 가능 한도: ${availableCredit.toLocaleString()} 크레딧)`,
          };
        }

        // 결정론적 고정 ID (동일 투자자 + 동일 프로젝트는 항상 단일 Primary Key를 사용하여 중복 행 생성 불가능)
        const deterministicId = `inv-${currentUser.id}__${projectId}`;
        const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);

        const targetInvestment: Investment = {
          id: deterministicId,
          eventId: event.id || "evt-2026-fall-01",
          investorId: currentUser.id,
          investorName: currentUser.name,
          projectId,
          teamId: targetProject.teamId,
          amount,
          createdAt: existingInvestment ? existingInvestment.createdAt : nowStr,
          updatedAt: nowStr,
        };

        // 동일 (investorId, projectId)의 이전 행은 모두 제거하고 단일 행으로 병합
        const newInvestments = [
          ...investments.filter(
            (inv) => !(inv.investorId === currentUser.id && inv.projectId === projectId)
          ),
          targetInvestment,
        ];

        // 프로젝트 총액 및 투자자 수 계산
        const projInvestments = newInvestments.filter((inv) => inv.projectId === projectId);
        const projTotal = projInvestments.reduce((sum, inv) => sum + inv.amount, 0);
        const projInvestors = projInvestments.length;

        // Supabase DB 저장 및 서버측 한도/중복 검증
        const dbRes = await dbSaveInvestment(targetInvestment, projTotal, projInvestors, event.baseCredit);
        if (!dbRes.success) {
          return {
            success: false,
            message: dbRes.error || "투자 저장 중 서버 오류가 발생했습니다. 다시 시도해 주세요.",
          };
        }

        const finalTotal = dbRes.verifiedTotal !== undefined ? dbRes.verifiedTotal : projTotal;
        const finalCount = dbRes.verifiedCount !== undefined ? dbRes.verifiedCount : projInvestors;

        const updatedProjects = projects.map((p) => {
          if (p.id === projectId) {
            return {
              ...p,
              totalCredits: finalTotal,
              investorCount: finalCount,
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
      },
      { success: false, message: "현재 서버와 데이터 통신 중입니다. 잠시만 기다려 주세요." }
    );
  };

  // 5. 투자 취소 (전액 환불 + 중복 클릭 잠금)
  const cancelInvestment = async (investmentId: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: "로그인이 필요합니다." };
    const targetInv = investments.find((inv) => inv.id === investmentId);
    if (!targetInv) return { success: false, message: "투자 내역을 찾을 수 없습니다." };

    return runWithMutationLock(
      "투자 취소 및 크레딧 환불을 처리하고 있습니다...",
      async () => {
        let newProjectTotal = 0;
        let newInvestorCount = 0;

        // 동일 투자자 + 프로젝트의 모든 투자 행 제거
        const newInvestments = investments.filter(
          (inv) =>
            inv.id !== investmentId &&
            !(inv.investorId === targetInv.investorId && inv.projectId === targetInv.projectId)
        );

        const projInvsAfter = newInvestments.filter((inv) => inv.projectId === targetInv.projectId);
        newProjectTotal = projInvsAfter.reduce((sum, inv) => sum + inv.amount, 0);
        newInvestorCount = projInvsAfter.length;

        const dbRes = await dbDeleteInvestment(
          investmentId,
          targetInv.projectId,
          newProjectTotal,
          newInvestorCount,
          targetInv.investorId
        );

        const finalTotal = dbRes.verifiedTotal !== undefined ? dbRes.verifiedTotal : newProjectTotal;
        const finalCount = dbRes.verifiedCount !== undefined ? dbRes.verifiedCount : newInvestorCount;

        const updatedProjects = projects.map((p) => {
          if (p.id === targetInv.projectId) {
            return {
              ...p,
              totalCredits: finalTotal,
              investorCount: finalCount,
            };
          }
          return p;
        });

        setInvestments(newInvestments);
        setProjects(updatedProjects);
        saveToStorage(event, updatedProjects, newInvestments, users);

        return {
          success: true,
          message: `투자가 취소되어 ${targetInv.amount.toLocaleString()} CR이 지갑으로 전액 환불되었습니다.`,
        };
      },
      { success: false, message: "현재 서버와 데이터 통신 중입니다. 잠시만 기다려 주세요." }
    );
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
        isMutating,
        mutationMessage,
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

      {/* 글로벌 서버 통신 잠금 모달 팝업 (광클릭 원천 차단) */}
      {isMutating && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 select-none cursor-wait"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-200 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-900">
                서버와 데이터 통신 중입니다
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {mutationMessage || "안전하게 데이터를 처리하고 있습니다. 잠시만 기다려 주세요..."}
              </p>
            </div>
            <div className="w-full py-2 px-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] font-semibold text-amber-800">
              ⚠️ 중복 처리 방지를 위해 완료될 때까지 버튼 클릭이 잠깁니다.
            </div>
          </div>
        </div>
      )}
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
