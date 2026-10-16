"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Badge } from "@/components/ui/Badge";
import { 
  LayoutGrid, 
  WalletCards, 
  ShieldCheck, 
  Trophy, 
  LogOut, 
  Sparkles, 
  CreditCard, 
  ChevronRight,
  Plus
} from "lucide-react";

interface SidebarProps {
  currentTab: "gallery" | "my-investments" | "team-project" | "admin";
  setCurrentTab: (tab: "gallery" | "my-investments" | "team-project" | "admin") => void;
  openProjectorRanking: () => void;
  openCreateProject?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  openProjectorRanking,
  openCreateProject,
}) => {
  const { event, currentUser, users, setCurrentUser, logout, remainingCredits, usedCredits } = useApp();

  if (!currentUser) return null;

  const stageLabels: Record<string, { text: string; badge: "primary" | "secondary" | "outline" | "success" }> = {
    PREPARING: { text: "준비 중", badge: "outline" },
    REGISTRATION: { text: "등록 접수", badge: "secondary" },
    FUNDING_OPEN: { text: "펀딩 진행 중", badge: "primary" },
    FUNDING_CLOSED: { text: "펀딩 마감", badge: "secondary" },
    RANKING_PUBLISHED: { text: "결과 공개됨", badge: "success" },
  };

  const creditUsagePercent = Math.min(100, (usedCredits / event.baseCredit) * 100);

  return (
    <aside className="w-72 md:w-80 bg-white border-r border-slate-200/90 flex flex-col justify-between h-screen sticky top-0 shrink-0 z-30 shadow-sm">
      {/* 1. 상단 브랜드 & 행사 정보 */}
      <div>
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent-gradient flex items-center justify-center text-white shadow-accent">
              <Sparkles size={20} />
            </div>
            <div>
              <span className="font-display text-xl font-bold tracking-tight text-slate-900 block leading-tight">
                CROWDFUND
              </span>
              <span className="font-mono text-[11px] text-blue-600 font-bold uppercase tracking-wider">
                EVALUATION PLATFORM
              </span>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="font-semibold text-slate-800">{event.name}</div>
            <div className="font-mono text-[11px] text-slate-400">
              {event.institution} · {event.session}
            </div>
          </div>

          <div className="mt-3">
            <Badge
              variant={stageLabels[event.currentStage].badge}
              size="sm"
              hasPulseDot={event.currentStage === "FUNDING_OPEN"}
            >
              {stageLabels[event.currentStage].text}
            </Badge>
          </div>
        </div>

        {/* 2. 내 가상 크레딧 카드 위젯 (심사위원 및 학생) */}
        {currentUser.role !== "ADMIN" && (
          <div className="m-4 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-dot-pattern-dark opacity-30 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 uppercase tracking-wider pb-1">
                <span className="flex items-center gap-1.5 text-white font-bold">
                  <CreditCard size={13} className="text-blue-400" /> 가상 자본 지갑
                </span>
                <span>총 10,000 CR</span>
              </div>

              <div className="mt-2">
                <span className="text-[11px] font-mono text-slate-400 block">잔여 투자 가능액</span>
                <span className="text-2xl font-mono font-bold tracking-tight text-white">
                  {remainingCredits.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-blue-400">CR</span>
                </span>
              </div>

              <div className="mt-3">
                <div className="w-full bg-slate-700/80 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-accent-gradient h-full transition-all duration-300 rounded-full"
                    style={{ width: `${creditUsagePercent}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] font-mono text-slate-400">
                  <span>투자 누적: {usedCredits.toLocaleString()} CR</span>
                  <span>1회: 2천~5천</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. 사이드바 내비게이션 메뉴 목록 (학생: 갤러리/내투자만 노출, 관리자: 관리자 콘솔 노출) */}
        <nav className="px-4 py-2 space-y-1.5">
          <button
            onClick={() => setCurrentTab("gallery")}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === "gallery"
                ? "bg-blue-50 text-blue-700 font-bold shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-3">
              <LayoutGrid size={18} className={currentTab === "gallery" ? "text-blue-600" : "text-slate-400"} />
              01. 프로젝트 갤러리
            </span>
            {currentTab === "gallery" && <ChevronRight size={14} className="text-blue-600" />}
          </button>

          {currentUser.role !== "ADMIN" && (
            <button
              onClick={() => setCurrentTab("my-investments")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentTab === "my-investments"
                  ? "bg-blue-50 text-blue-700 font-bold shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-3">
                <WalletCards size={18} className={currentTab === "my-investments" ? "text-blue-600" : "text-slate-400"} />
                02. 내 투자 내역
              </span>
              {currentTab === "my-investments" && <ChevronRight size={14} className="text-blue-600" />}
            </button>
          )}

          {/* 관리자(ADMIN)일 때만 관리자 콘솔 노출 (학생/심사위원에게는 완전 숨김) */}
          {currentUser.role === "ADMIN" && (
            <button
              onClick={() => setCurrentTab("admin")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentTab === "admin"
                  ? "bg-blue-50 text-blue-700 font-bold shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-3">
                <ShieldCheck size={18} className={currentTab === "admin" ? "text-blue-600" : "text-slate-400"} />
                관리자 콘솔 (총괄 제어)
              </span>
              {currentTab === "admin" && <ChevronRight size={14} className="text-blue-600" />}
            </button>
          )}
        </nav>

        {openCreateProject && (
          <div className="px-4 pt-1 pb-2">
            <button
              onClick={openCreateProject}
              className="w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus size={15} /> 새 프로젝트 출품 등록
            </button>
          </div>
        )}
      </div>

      {/* 4. 하단 프로필 및 송출 */}
      <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
        <button
          onClick={openProjectorRanking}
          className="w-full py-2.5 px-3.5 rounded-xl bg-accent-gradient text-white text-xs font-bold shadow-accent hover:shadow-accent-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Trophy size={14} /> 빔프로젝터 랭킹 송출 ↗
        </button>

        <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="truncate">
              <div className="font-bold text-xs text-slate-800 truncate">{currentUser.name}</div>
              <div className="font-mono text-[10px] text-slate-500 truncate">
                [{currentUser.role === "ADMIN" ? "관리자" : currentUser.role === "JUDGE" ? "심사위원" : currentUser.teamName ? "학생" : "일반참가"}] {currentUser.teamName || "자유 투자자"}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="로그아웃"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>

        <div className="pt-1">
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            빠른 계정 전환 (시뮬레이터)
          </label>
          <select
            value={currentUser.id}
            onChange={(e) => {
              const selected = users.find((u) => u.id === e.target.value);
              if (selected) {
                setCurrentUser(selected);
                // 학생으로 전환 시 갤러리로 자동 이동
                if (selected.role !== "ADMIN" && currentTab === "admin") {
                  setCurrentTab("gallery");
                }
              }
            }}
            className="w-full text-xs font-mono p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none cursor-pointer"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                [{u.role === "ADMIN" ? "관리자" : u.role === "JUDGE" ? "심사위원" : "학생"}] {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </aside>
  );
};
