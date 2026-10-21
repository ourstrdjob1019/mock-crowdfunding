import { supabase, isSupabaseConfigured } from "./supabase";
import { User, Project, Investment, Event, EventStage } from "@/types";

/**
 * DB 컬럼 (snake_case) -> Project (camelCase) 변환
 */
export function mapDbProjectToModel(row: any): Project {
  return {
    id: String(row.id),
    eventId: row.event_id || "evt-2026-fall-01",
    teamId: row.team_id || "",
    teamName: row.team_name || "",
    teamNumber: row.team_number || 1,
    title: row.title || "",
    summary: row.summary || "",
    description: row.description || "",
    thumbnailUrl: row.thumbnail_url || "",
    landingFormat: row.landing_format || "IMAGE",
    landingUrl: row.landing_url || "",
    landingImages: Array.isArray(row.landing_images) ? row.landing_images : (row.landing_url ? [row.landing_url] : []),
    authorId: row.author_id,
    authorName: row.author_name,
    authorEmail: row.author_email,
    lastModifierName: row.last_modifier_name,
    lastModifiedAt: row.last_modified_at,
    isHidden: Boolean(row.is_hidden),
    totalCredits: Number(row.total_credits) || 0,
    investorCount: Number(row.investor_count) || 0,
  };
}

/**
 * Project (camelCase) -> DB 컬럼 (snake_case) 변환
 */
export function mapModelProjectToDb(proj: Partial<Project>): Record<string, any> {
  const dbData: Record<string, any> = {};
  if (proj.id !== undefined) dbData.id = proj.id;
  if (proj.eventId !== undefined) dbData.event_id = proj.eventId;
  if (proj.teamId !== undefined) dbData.team_id = proj.teamId;
  if (proj.teamName !== undefined) dbData.team_name = proj.teamName;
  if (proj.teamNumber !== undefined) dbData.team_number = proj.teamNumber;
  if (proj.title !== undefined) dbData.title = proj.title;
  if (proj.summary !== undefined) dbData.summary = proj.summary;
  if (proj.description !== undefined) dbData.description = proj.description;
  if (proj.thumbnailUrl !== undefined) dbData.thumbnail_url = proj.thumbnailUrl;
  if (proj.landingFormat !== undefined) dbData.landing_format = proj.landingFormat;
  if (proj.landingUrl !== undefined) dbData.landing_url = proj.landingUrl;
  if (proj.landingImages !== undefined) dbData.landing_images = proj.landingImages;
  if (proj.authorId !== undefined) dbData.author_id = proj.authorId;
  if (proj.authorName !== undefined) dbData.author_name = proj.authorName;
  if (proj.authorEmail !== undefined) dbData.author_email = proj.authorEmail;
  if (proj.lastModifierName !== undefined) dbData.last_modifier_name = proj.lastModifierName;
  if (proj.lastModifiedAt !== undefined) dbData.last_modified_at = proj.lastModifiedAt;
  if (proj.isHidden !== undefined) dbData.is_hidden = proj.isHidden;
  if (proj.totalCredits !== undefined) dbData.total_credits = proj.totalCredits;
  if (proj.investorCount !== undefined) dbData.investor_count = proj.investorCount;
  return dbData;
}

/**
 * DB 컬럼 -> User 변환
 */
export function mapDbUserToModel(row: any): User {
  return {
    id: String(row.id),
    eventId: row.event_id || "evt-2026-fall-01",
    email: row.email || "",
    password: row.password || row.password_hash || "password123",
    name: row.name || "",
    institution: row.institution || "",
    department: row.department || "",
    studentNumber: row.student_number || "",
    teamId: row.team_id,
    teamName: row.team_name,
    role: row.role || "STUDENT",
    privacyAgreed: Boolean(row.privacy_agreed || row.privacy_agreed_at),
  };
}

/**
 * User -> DB 변환
 */
export function mapModelUserToDb(user: User): Record<string, any> {
  return {
    id: user.id,
    event_id: user.eventId || "evt-2026-fall-01",
    email: user.email.toLowerCase().trim(),
    password: user.password || "password123",
    name: user.name,
    institution: user.institution || "",
    department: user.department || "",
    student_number: user.studentNumber || "",
    team_id: user.teamId || null,
    team_name: user.teamName || null,
    role: user.role,
    privacy_agreed: Boolean(user.privacyAgreed),
  };
}

/**
 * DB 컬럼 -> Investment 변환
 */
export function mapDbInvestmentToModel(row: any): Investment {
  return {
    id: String(row.id),
    eventId: row.event_id || "evt-2026-fall-01",
    investorId: row.investor_id || "",
    investorName: row.investor_name || "",
    projectId: row.project_id || "",
    teamId: row.team_id || "",
    amount: Number(row.amount) || 0,
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

/**
 * Investment -> DB 변환
 */
export function mapModelInvestmentToDb(inv: Investment): Record<string, any> {
  return {
    id: inv.id,
    event_id: inv.eventId || "evt-2026-fall-01",
    investor_id: inv.investorId,
    investor_name: inv.investorName,
    project_id: inv.projectId,
    team_id: inv.teamId || null,
    amount: inv.amount,
    created_at: inv.createdAt,
    updated_at: inv.updatedAt,
  };
}

/**
 * Supabase DB에서 모든 데이터 가져오기
 */
export async function fetchAllFromSupabase(): Promise<{
  event: Event | null;
  users: User[];
  projects: Project[];
  investments: Investment[];
  error?: string;
}> {
  if (!supabase || !isSupabaseConfigured) {
    return { event: null, users: [], projects: [], investments: [], error: "Supabase not configured" };
  }

  try {
    const [eventRes, usersRes, projectsRes, investmentsRes] = await Promise.all([
      supabase.from("events").select("*").limit(1).maybeSingle(),
      supabase.from("users").select("*"),
      supabase.from("projects").select("*").order("team_number", { ascending: true }),
      supabase.from("investments").select("*"),
    ]);

    let event: Event | null = null;
    if (eventRes.data) {
      event = {
        id: String(eventRes.data.id),
        name: eventRes.data.name,
        institution: eventRes.data.institution,
        session: eventRes.data.session,
        eventDate: eventRes.data.event_date,
        baseCredit: Number(eventRes.data.base_credit) || 10000,
        minInvestment: Number(eventRes.data.min_investment) || 2000,
        maxInvestment: Number(eventRes.data.max_investment) || 5000,
        currentStage: eventRes.data.current_stage || "FUNDING_OPEN",
        isRankingPublic: Boolean(eventRes.data.is_ranking_public),
      };
    }

    const users = (usersRes.data || []).map(mapDbUserToModel);
    const projects = (projectsRes.data || []).map(mapDbProjectToModel);
    const investments = (investmentsRes.data || []).map(mapDbInvestmentToModel);

    return { event, users, projects, investments };
  } catch (err: any) {
    console.error("[SupabaseService] Fetch error:", err);
    return { event: null, users: [], projects: [], investments: [], error: err.message };
  }
}

/**
 * 유저 등록 (Supabase DB)
 */
export async function dbInsertUser(user: User): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Supabase not configured" };
  try {
    const dbUser = mapModelUserToDb(user);
    const { error } = await supabase.from("users").upsert([dbUser]);
    if (error) {
      console.error("[SupabaseService] dbInsertUser error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 비밀번호 리셋 (Supabase DB)
 */
export async function dbResetPassword(userId: string, tempPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Supabase not configured" };
  try {
    const { error } = await supabase.from("users").update({ password: tempPassword }).eq("id", userId);
    if (error) {
      console.error("[SupabaseService] dbResetPassword error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 팀 정보 등록/동기화 헬퍼 (teams 및 team 단수형 테이블 모두 지원)
 */
async function syncTeamToDb(teamId: string, teamName: string, teamNumber: number, eventId: string = "evt-2026-fall-01") {
  if (!supabase) return;

  const teamData = {
    id: teamId,
    event_id: eventId,
    team_number: teamNumber || 1,
    name: teamName,
  };

  // 1차: teams 테이블 시도
  const { error } = await supabase.from("teams").upsert(teamData, { onConflict: "id" });

  if (error) {
    // 2차: 테이블명이 단수형 'team'인 경우
    if (error.message?.toLowerCase().includes("does not exist")) {
      const res = await supabase.from("team").upsert(teamData, { onConflict: "id" });
      if (res.error) console.warn("[SupabaseService] 'team' upsert warning:", res.error.message);
      return;
    }

    // 3차: 외래키 제약조건 위반인 경우 event_id 제외하고 시도
    if (error.message?.toLowerCase().includes("foreign key")) {
      const fallbackData = {
        id: teamId,
        team_number: teamNumber || 1,
        name: teamName,
      };
      await supabase.from("teams").upsert(fallbackData, { onConflict: "id" });
      await supabase.from("team").upsert(fallbackData, { onConflict: "id" });
    } else {
      console.warn("[SupabaseService] teams upsert warning:", error.message);
    }
  }
}

/**
 * 새 프로젝트 등록 (Supabase DB: teams 테이블과 projects 테이블 동시 등록)
 */
export async function dbInsertProject(project: Project): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Supabase not configured" };
  try {
    // 1. teams (또는 team) 테이블에 팀 정보 자동 등록/동기화
    if (project.teamName) {
      const teamId = project.teamId || `team-${Date.now().toString().slice(-6)}`;
      await syncTeamToDb(teamId, project.teamName, project.teamNumber || 1, project.eventId);
    }

    // 2. projects 테이블에 프로젝트 등록
    const dbProj = mapModelProjectToDb(project);
    const { error } = await supabase.from("projects").insert([dbProj]);
    if (error) {
      console.error("[SupabaseService] dbInsertProject error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 프로젝트 수정 (Supabase DB: teams 테이블도 함께 동기화)
 */
export async function dbUpdateProject(projectId: string, updates: Partial<Project>): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Supabase not configured" };
  try {
    // 팀명 변경 시 teams 및 team 테이블 동기화
    if (updates.teamName && updates.teamId) {
      await supabase.from("teams").update({ name: updates.teamName }).eq("id", updates.teamId);
      await supabase.from("team").update({ name: updates.teamName }).eq("id", updates.teamId);
    }

    const dbUpdates = mapModelProjectToDb(updates);
    delete dbUpdates.id;
    const { error } = await supabase.from("projects").update(dbUpdates).eq("id", projectId);
    if (error) {
      console.error("[SupabaseService] dbUpdateProject error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 프로젝트 삭제 (Supabase DB: 투자 및 프로젝트 삭제)
 */
export async function dbDeleteProject(projectId: string, teamId?: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Supabase not configured" };
  try {
    // 프로젝트 삭제 및 연관된 투자 삭제
    await supabase.from("investments").delete().eq("project_id", projectId);
    const { error } = await supabase.from("projects").delete().eq("id", projectId);
    if (teamId) {
      await supabase.from("teams").delete().eq("id", teamId);
      await supabase.from("team").delete().eq("id", teamId);
    }
    if (error) {
      console.error("[SupabaseService] dbDeleteProject error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 투자 등록 또는 금액 수정 (Supabase DB)
 */
export async function dbSaveInvestment(
  investment: Investment,
  newProjectTotal: number,
  newInvestorCount: number
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Supabase not configured" };
  try {
    const dbInv = mapModelInvestmentToDb(investment);
    const { error: invErr } = await supabase.from("investments").upsert([dbInv]);
    if (invErr) {
      console.error("[SupabaseService] dbSaveInvestment error:", invErr);
      return { success: false, error: invErr.message };
    }

    // 프로젝트 총 누적액과 투자자 수 갱신
    await supabase.from("projects").update({
      total_credits: newProjectTotal,
      investor_count: newInvestorCount,
    }).eq("id", investment.projectId);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 행사 단계/공개여부 변경 (Supabase DB)
 */
export async function dbUpdateEvent(event: Event): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Supabase not configured" };
  try {
    const { error } = await supabase.from("events").upsert([
      {
        id: event.id || "evt-2026-fall-01",
        name: event.name,
        institution: event.institution,
        session: event.session,
        event_date: event.eventDate,
        base_credit: event.baseCredit,
        min_investment: event.minInvestment,
        max_investment: event.maxInvestment,
        current_stage: event.currentStage,
        is_ranking_public: event.isRankingPublic,
      },
    ]);
    if (error) {
      console.error("[SupabaseService] dbUpdateEvent error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 투자 삭제 / 취소 및 프로젝트 누적액 복구 (Supabase DB)
 */
export async function dbDeleteInvestment(
  investmentId: string,
  projectId: string,
  newProjectTotal: number,
  newInvestorCount: number
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Supabase not configured" };
  try {
    await supabase.from("investments").delete().eq("id", investmentId);
    await supabase.from("projects").update({
      total_credits: newProjectTotal,
      investor_count: newInvestorCount,
    }).eq("id", projectId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

