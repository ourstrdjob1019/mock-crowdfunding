"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { EventStage } from "@/types";
import { 
  Download, 
  Tv, 
  Layers, 
  BarChart3, 
  RefreshCw, 
  Coins, 
  KeyRound, 
  Copy, 
  Check, 
  X,
  Users,
  Eye,
  EyeOff,
  RotateCcw
} from "lucide-react";
import * as XLSX from "xlsx";

interface AdminDashboardProps {
  openProjectorRanking: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ openProjectorRanking }) => {
  const {
    event,
    setStage,
    toggleRankingPublic,
    projects,
    toggleProjectVisibility,
    investments,
    users,
    resetPassword,
    resetAllInvestments,
    refreshFromSupabase,
  } = useApp();

  const [activeAdminSubTab, setActiveAdminSubTab] = useState<"control" | "roster">("control");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // 포인트 -> 점수 환산 기준 설정
  const [creditUnit, setCreditUnit] = useState<number>(1000);
  const [scorePerUnit, setScorePerUnit] = useState<number>(10);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // 비밀번호 리셋 팝업
  const [resetModalData, setResetModalData] = useState<{
    userName: string;
    userEmail: string;
    tempPassword: string;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    try {
      const savedRatio = localStorage.getItem("mc_score_ratio");
      if (savedRatio) {
        const parsed = JSON.parse(savedRatio);
        if (parsed.creditUnit) setCreditUnit(parsed.creditUnit);
        if (parsed.scorePerUnit) setScorePerUnit(parsed.scorePerUnit);
      }
    } catch {}
  }, []);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3000);
  };

  const handleUnitCreditChange = (val: number) => {
    const updated = Math.max(1, val);
    setCreditUnit(updated);
    localStorage.setItem("mc_score_ratio", JSON.stringify({ creditUnit: updated, scorePerUnit }));
  };

  const handleScorePerUnitChange = (val: number) => {
    const updated = Math.max(0.1, val);
    setScorePerUnit(updated);
    localStorage.setItem("mc_score_ratio", JSON.stringify({ creditUnit, scorePerUnit: updated }));
  };

  const stages: { key: EventStage; code: string; title: string; desc: string }[] = [
    { key: "PREPARING", code: "01", title: "준비 중", desc: "출품 사전 가이드 및 시스템 점검" },
    { key: "REGISTRATION", code: "02", title: "출품 등록", desc: "팀별 IR 피치덱 및 시연 자료 업로드" },
    { key: "FUNDING_OPEN", code: "03", title: "펀딩 진행 중", desc: "학생 및 청중 평가단 실시간 모의투자" },
    { key: "FUNDING_CLOSED", code: "04", title: "펀딩 마감", desc: "투자 집계 완료 및 검증 절차 진행" },
    { key: "RANKING_PUBLISHED", code: "05", title: "랭킹 공개", desc: "최종 환산 점수 발표 및 시상식 진행" },
  ];

  const currentStageObj = stages.find((s) => s.key === event.currentStage) || stages[2];

  // 계산 통계
  const totalRaisedAll = useMemo(() => {
    return projects.reduce((acc, p) => acc + p.totalCredits, 0);
  }, [projects]);

  const totalBackersAll = useMemo(() => {
    return projects.reduce((acc, p) => acc + p.investorCount, 0);
  }, [projects]);

  // 동적 환산 리더보드
  const leaderboardData = useMemo(() => {
    return projects
      .map((p) => {
        const convertedPoints = creditUnit > 0 ? (p.totalCredits / creditUnit) * scorePerUnit : 0;
        return {
          ...p,
          convertedPoints: Number(convertedPoints.toFixed(1)),
        };
      })
      .sort((a, b) => b.totalCredits - a.totalCredits);
  }, [projects, creditUnit, scorePerUnit]);

  // 수동 실시간 DB 동기화
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshFromSupabase();
      showToast("🔄 Supabase 최신 데이터가 동기화되었습니다.");
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // 엑셀 내보내기
  const handleExportExcel = () => {
    const rankingData = leaderboardData.map((p, idx) => ({
      순위: idx + 1,
      팀번호: p.teamNumber,
      팀명: p.teamName,
      프로젝트명: p.title,
      누적투자액_CR: p.totalCredits,
      환산점수_점: p.convertedPoints,
      참여투자자수: p.investorCount,
      포맷: p.landingFormat,
      분야: p.category || "AI/SaaS",
    }));

    const wb = XLSX.utils.book_new();
    const wsRanking = XLSX.utils.json_to_sheet(rankingData);
    XLSX.utils.book_append_sheet(wb, wsRanking, "최종집계_순위");
    XLSX.writeFile(wb, `2026_데모데이_최종결과_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast("📊 엑셀 결과 보고서 다운로드가 완료되었습니다.");
  };

  const handleResetUserPassword = async (userItem: any) => {
    if (confirm(`${userItem.name}님의 비밀번호를 임시 비밀번호로 초기화하시겠습니까?`)) {
      const res = await resetPassword(userItem.id);
      if (res.success && res.tempPassword) {
        setResetModalData({
          userName: userItem.name,
          userEmail: userItem.email,
          tempPassword: res.tempPassword,
        });
        setIsCopied(false);
      } else {
        alert(res.message);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Toast Notice */}
      {toastNotice && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] px-5 py-2.5 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <span>{toastNotice}</span>
        </div>
      )}

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

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>DB 동기화</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              if (confirm("모든 프로젝트의 누적 투자액과 참여 투자 내역을 0 CR로 일괄 초기화하시겠습니까?")) {
                const res = await resetAllInvestments();
                showToast(`🧹 ${res.message}`);
              }
            }}
            className="px-3 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/70 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>투자 전체 0원 초기화</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>엑셀 집계</span>
          </button>

          {/* Big CTA: Launch Projector Screen */}
          <button
            type="button"
            onClick={openProjectorRanking}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/30 transition-all flex items-center gap-2 cursor-pointer active:scale-98 shrink-0"
          >
            <Tv className="w-5 h-5 text-slate-950" />
            <span>🏆 빔프로젝터 대형 랭킹 전광판 송출</span>
          </button>
        </div>
      </div>

      {/* Subtab Toggle (Control Tower vs Roster) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveAdminSubTab("control")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeAdminSubTab === "control"
              ? "bg-blue-600 text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          실시간 컨트롤 타워 & 랭킹 환산
        </button>
        <button
          type="button"
          onClick={() => setActiveAdminSubTab("roster")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeAdminSubTab === "roster"
              ? "bg-blue-600 text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          참가자 계정 및 비밀번호 관리 ({users.length}명)
        </button>
      </div>

      {activeAdminSubTab === "control" ? (
        <>
          {/* 1. 4 Bento KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
              <p className="text-xs font-semibold text-slate-500">총 펀딩 투자액 (Total CR)</p>
              <p className="text-2xl font-extrabold font-mono text-blue-600 mt-1">
                {totalRaisedAll.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400 font-mono">전체 팀 합산</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
              <p className="text-xs font-semibold text-slate-500">총 투자 참여 건수</p>
              <p className="text-2xl font-extrabold font-mono text-emerald-600 mt-1">
                {totalBackersAll}
              </p>
              <span className="text-[10px] text-slate-400 font-mono">청중 평가단 참여 수</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
              <p className="text-xs font-semibold text-slate-500">출품 등록 팀 수</p>
              <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
                {projects.length}
              </p>
              <span className="text-[10px] text-slate-400 font-mono">경쟁 스타트업</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
              <p className="text-xs font-semibold text-slate-500">팀당 평균 펀딩액</p>
              <p className="text-2xl font-extrabold font-mono text-indigo-600 mt-1">
                {projects.length > 0 ? Math.round(totalRaisedAll / projects.length).toLocaleString() : 0}
              </p>
              <span className="text-[10px] text-slate-400 font-mono">평균 CR</span>
            </div>
          </div>

          {/* 2. 5-Stage Event Flow Switcher */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
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
              {stages.map((stg) => {
                const isActive = event.currentStage === stg.key;

                return (
                  <button
                    key={stg.key}
                    type="button"
                    onClick={() => {
                      setStage(stg.key);
                      showToast(`📢 행사 단계가 [${stg.code}. ${stg.title}] 로 전환되었습니다.`);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs font-semibold"
                        : "bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold ${isActive ? "text-blue-200" : "text-slate-400"}`}>
                        STAGE {stg.code}
                      </span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />}
                    </div>
                    <div className={`text-xs font-bold mt-1 ${isActive ? "text-white" : "text-slate-800"}`}>
                      {stg.title}
                    </div>
                    <div className={`text-[10px] line-clamp-1 mt-0.5 ${isActive ? "text-blue-100" : "text-slate-400"}`}>
                      {stg.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Real-time Point-to-Score Converter */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
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
                  value={creditUnit}
                  min={100}
                  step={100}
                  onChange={(e) => handleUnitCreditChange(Number(e.target.value))}
                  className="w-18 px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900 text-center"
                />
                <span className="text-slate-600 font-mono">CR 당 =</span>
                <input
                  type="number"
                  value={scorePerUnit}
                  min={0.1}
                  step={1}
                  onChange={(e) => handleScorePerUnitChange(Number(e.target.value))}
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
                      <th className="py-3 px-4 text-center">노출 여부</th>
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
                          <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-mono font-extrabold inline-flex items-center justify-center text-xs shadow-2xs">
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
                              Team {String(team.teamNumber).padStart(2, "0")} · {team.teamName}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium mr-1">
                              {team.category || "AI/SaaS"}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                              {team.landingFormat}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            {team.totalCredits.toLocaleString()} CR
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-600">
                            {team.investorCount}명
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-extrabold text-blue-700 text-sm">
                            {team.convertedPoints.toFixed(1)} <span className="text-xs font-sans text-slate-400">점</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (!team.isHidden && !confirm(`[${team.title}] 프로젝트를 갤러리에서 숨김 처리하시겠습니까?`)) {
                                  return;
                                }
                                toggleProjectVisibility(team.id);
                              }}
                              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition ${
                                team.isHidden
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              {team.isHidden ? "숨김 상태" : "정상 노출"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Roster & Password Management */
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              참가자 명단 및 비밀번호 초기화 관리
            </h2>
            <span className="text-xs text-slate-400">총 {users.length}명 등록됨</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">이름</th>
                    <th className="py-3 px-4">이메일</th>
                    <th className="py-3 px-4">역할</th>
                    <th className="py-3 px-4">소속 / 학과</th>
                    <th className="py-3 px-4 text-center">비밀번호 조치</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === "ADMIN" ? "bg-amber-100 text-amber-800" : u.role === "JUDGE" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {u.role === "ADMIN" ? "관리자" : u.role === "JUDGE" ? "심사위원" : "학생"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {u.teamName ? `${u.teamName} (${u.department || ""})` : u.institution || u.department || "-"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleResetUserPassword(u)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <KeyRound className="w-3 h-3 text-slate-500" />
                          <span>비밀번호 초기화</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">비밀번호 초기화 완료</h3>
              <button
                type="button"
                onClick={() => setResetModalData(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              <strong>{resetModalData.userName}</strong> ({resetModalData.userEmail}) 님의 임시 비밀번호가 생성되었습니다:
            </p>
            <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between font-mono font-bold text-sm text-blue-600">
              <span>{resetModalData.tempPassword}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(resetModalData.tempPassword);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className="p-1 hover:text-slate-900 transition"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">참가자에게 복사하여 전달해 주세요.</p>
          </div>
        </div>
      )}

    </div>
  );
};
