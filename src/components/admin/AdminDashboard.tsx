"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { EventStage } from "@/types";
import { Button } from "@/components/ui/Button";
import { 
  Download, 
  Trophy, 
  CheckCircle2, 
  KeyRound, 
  Layers, 
  Activity, 
  Users,
  Copy,
  Check,
  X,
  RefreshCw,
  Calculator,
  Coins,
  TrendingUp,
  FolderGit2,
  Award,
  Eye,
  EyeOff
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
    refreshFromSupabase,
  } = useApp();

  const [activeAdminSubTab, setActiveAdminSubTab] = useState<"dashboard" | "stages" | "stats" | "roster">("dashboard");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // 포인트 -> 점수 환산 기준 설정 상태
  // 기본: 1,000 CR당 10점 (즉, 100 CR = 1점)
  const [creditUnit, setCreditUnit] = useState<number>(1000);
  const [scorePerUnit, setScorePerUnit] = useState<number>(10);
  const [savedRatioSuccess, setSavedRatioSuccess] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedRatio = localStorage.getItem("mc_score_ratio");
      if (savedRatio) {
        const parsed = JSON.parse(savedRatio);
        if (parsed.creditUnit) setCreditUnit(parsed.creditUnit);
        if (parsed.scorePerUnit) setScorePerUnit(parsed.scorePerUnit);
      }
    } catch {
      // 기본값 유지
    }
  }, []);

  const handleSaveRatio = () => {
    if (creditUnit <= 0 || scorePerUnit <= 0) {
      alert("크레딧 단위와 환산 점수는 0보다 커야 합니다.");
      return;
    }
    localStorage.setItem("mc_score_ratio", JSON.stringify({ creditUnit, scorePerUnit }));
    setSavedRatioSuccess(true);
    setTimeout(() => setSavedRatioSuccess(false), 2500);
  };

  // 팀별 환산 점수 계산 함수
  const calculateScore = (totalCredits: number): number => {
    if (creditUnit <= 0) return 0;
    const score = (totalCredits / creditUnit) * scorePerUnit;
    return Math.round(score * 10) / 10; // 소수점 첫째자리 반올림
  };

  // 비밀번호 리셋 결과 팝업 모달 상태
  const [resetModalData, setResetModalData] = useState<{
    userName: string;
    userEmail: string;
    tempPassword: string;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const stages: { key: EventStage; label: string; desc: string }[] = [
    { key: "PREPARING", label: "01. 행사 준비", desc: "명단 확인 및 시스템 초기화 진행" },
    { key: "REGISTRATION", label: "02. 등록 접수", desc: "학생 팀의 결과물 등록/수정 허용" },
    { key: "FUNDING_OPEN", label: "03. 펀딩 오픈", desc: "실시간 가상 자본 투자 허용 (수정 잠금)" },
    { key: "FUNDING_CLOSED", label: "04. 펀딩 마감", desc: "추가 투자 및 금액 수정 전면 차단" },
    { key: "RANKING_PUBLISHED", label: "05. 랭킹 공개", desc: "발표장 순위표 송출 및 결과 확인" },
  ];

  // 수동 실시간 DB 동기화
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshFromSupabase();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // 엑셀 내보내기 (환산 점수 컬럼 포함)
  const handleExportExcel = () => {
    const sorted = [...projects].sort((a, b) => b.totalCredits - a.totalCredits);
    const rankingData = sorted.map((p, idx) => ({
      순위: idx + 1,
      팀번호: p.teamNumber,
      팀명: p.teamName,
      프로젝트명: p.title,
      누적투자액_CR: p.totalCredits,
      환산점수_점: calculateScore(p.totalCredits),
      참여투자자수: p.investorCount,
      포맷: p.landingFormat,
      숨김여부: p.isHidden ? "숨김" : "노출",
    }));

    const detailData = investments.map((inv) => {
      const proj = projects.find((p) => p.id === inv.projectId);
      return {
        투자ID: inv.id,
        투자자명: inv.investorName,
        대상팀: proj ? proj.teamName : inv.teamId,
        프로젝트명: proj ? proj.title : "",
        투자금액_CR: inv.amount,
        투자일시: inv.createdAt,
        수정일시: inv.updatedAt,
      };
    });

    const wb = XLSX.utils.book_new();
    const wsRanking = XLSX.utils.json_to_sheet(rankingData);
    const wsDetail = XLSX.utils.json_to_sheet(detailData);

    XLSX.utils.book_append_sheet(wb, wsRanking, "팀별_최종_순위및환산점수");
    XLSX.utils.book_append_sheet(wb, wsDetail, "개인별_투자_원장");

    XLSX.writeFile(wb, `${event.name}_평가결과_${event.eventDate}.xlsx`);
  };

  // 비밀번호 리셋 실행
  const handlePasswordReset = async (userId: string, userName: string, userEmail: string) => {
    const res = await resetPassword(userId);
    if (res.success && res.tempPassword) {
      setResetModalData({
        userName,
        userEmail,
        tempPassword: res.tempPassword,
      });
      setIsCopied(false);
    }
  };

  const handleCopyPassword = () => {
    if (resetModalData) {
      navigator.clipboard.writeText(resetModalData.tempPassword);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // KPI 계산
  const totalFundingCredits = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const judgeCount = users.filter((u) => u.role === "JUDGE").length;
  const studentCount = users.filter((u) => u.role === "STUDENT").length;
  const topProject = [...projects].sort((a, b) => b.totalCredits - a.totalCredits)[0];

  return (
    <div className="space-y-8">
      {/* 8자리 임시 비밀번호 발급 안내 모달 */}
      {resetModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setResetModalData(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                <KeyRound size={28} />
              </div>

              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-blue-600 font-bold">
                  비밀번호 초기화 완료
                </span>
                <h3 className="text-xl font-display font-bold text-slate-900 mt-1">
                  새 임시 비밀번호 발급
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  <strong>{resetModalData.userName}</strong> ({resetModalData.userEmail}) 학생의 비밀번호가 아래 8자리 숫자로 즉시 변경되었습니다.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-blue-200 flex items-center justify-between">
                <div className="text-left font-mono">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">8자리 임시 비밀번호</span>
                  <span className="text-2xl font-bold tracking-widest text-blue-600">
                    {resetModalData.tempPassword}
                  </span>
                </div>

                <button
                  onClick={handleCopyPassword}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-xs font-mono font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {isCopied ? "복사됨" : "번호 복사"}
                </button>
              </div>

              <Button variant="primary" isFullWidth onClick={() => setResetModalData(null)}>
                확인 완료
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 상단 통합 헤더 & 실시간 새로고침 및 액션 바 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <Activity size={12} /> REAL-TIME ADMIN MONITOR
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
            운영 관리자 통합 관제실
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            실시간 데이터 현황 모니터링, 점수 환산 기준 입력, 라운드 제어 및 원장 다운로드
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            title="Supabase DB의 최신 등록 내역을 즉시 다시 불러옵니다"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin text-blue-600" : ""} />
            <span>{isRefreshing ? "동기화 중..." : "실시간 DB 새로고침"}</span>
          </button>

          <button
            onClick={openProjectorRanking}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trophy size={14} /> 프로젝터 랭킹 송출
          </button>

          <button
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} /> 엑셀 다운로드 (.xlsx)
          </button>
        </div>
      </div>

      {/* 1. 실시간 종합 KPI 현황판 (핵심 지표 카드 4종) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 카드 1: 등록 참가자 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider">총 가입 참가자</span>
            <Users size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-900">
            {users.length} <span className="text-xs font-normal text-slate-500">명</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-500 flex gap-2">
            <span>학생 <strong>{studentCount}</strong></span>
            <span>·</span>
            <span>심사위원 <strong>{judgeCount}</strong></span>
          </div>
        </div>

        {/* 카드 2: 출품 프로젝트 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider">출품 프로젝트</span>
            <FolderGit2 size={16} className="text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-900">
            {projects.length} <span className="text-xs font-normal text-slate-500">개 팀</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-500">
            공개 노출 중: <strong>{projects.filter((p) => !p.isHidden).length}</strong>개
          </div>
        </div>

        {/* 카드 3: 누적 펀딩 건수 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider">누적 투자 건수</span>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-900">
            {investments.length} <span className="text-xs font-normal text-slate-500">건</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-emerald-600 font-semibold">
            실시간 펀딩 활성화
          </div>
        </div>

        {/* 카드 4: 누적 유치 자본 */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider">총 펀딩 자본</span>
            <Coins size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-amber-400">
            {totalFundingCredits.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-300">CR</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400">
            팀당 평균: {projects.length > 0 ? Math.round(totalFundingCredits / projects.length).toLocaleString() : 0} CR
          </div>
        </div>
      </div>

      {/* 2. 포인트 -> 점수 환산 기준 입력 컨트롤러 (사용자 필수 요청 기능) */}
      <div className="bg-white rounded-3xl border border-blue-200/80 p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <Calculator size={12} /> SCORE CONVERSION SYSTEM
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
              포인트(CR) 대비 평가 점수 환산 기준 설정
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              팀별로 유치한 펀딩 크레딧을 최종 평가 점수(100점 만점 등)로 자동 환산할 기준을 직접 입력하세요.
            </p>
          </div>

          {savedRatioSuccess && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold animate-pulse">
              <Check size={14} /> 환산 기준 저장 완료
            </span>
          )}
        </div>

        {/* 환산 공식 인풋 박스 */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-800">
            <span>누적 포인트</span>
            <div className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-slate-300 shadow-inner">
              <input
                type="number"
                min={1}
                step={100}
                value={creditUnit}
                onChange={(e) => setCreditUnit(Number(e.target.value))}
                className="w-24 text-right font-mono font-bold text-blue-600 focus:outline-none"
              />
              <span className="font-mono text-xs text-slate-500 font-normal">CR 당</span>
            </div>

            <span>➔</span>

            <span>환산 점수</span>
            <div className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-slate-300 shadow-inner">
              <input
                type="number"
                min={0.1}
                step={1}
                value={scorePerUnit}
                onChange={(e) => setScorePerUnit(Number(e.target.value))}
                className="w-20 text-right font-mono font-bold text-emerald-600 focus:outline-none"
              />
              <span className="font-mono text-xs text-slate-500 font-normal">점</span>
            </div>

            <button
              onClick={handleSaveRatio}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer ml-auto"
            >
              환산 기준 적용
            </button>
          </div>

          <div className="text-xs font-mono text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase">현재 적용 환산 공식 예시</span>
            <strong className="text-slate-800">
              1,000 CR 유치 시 = {calculateScore(1000)}점
            </strong>{" "}
            (5,000 CR 유치 시 = <strong>{calculateScore(5000)}점</strong>)
          </div>
        </div>
      </div>

      {/* 3. 하단 탭 네비게이션 */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveAdminSubTab("dashboard")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeAdminSubTab === "dashboard"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          📊 실시간 팀별 점수 현황표
        </button>
        <button
          onClick={() => setActiveAdminSubTab("stages")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeAdminSubTab === "stages"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          ⚡ 행사 라운드 제어 ({event.currentStage})
        </button>
        <button
          onClick={() => setActiveAdminSubTab("roster")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeAdminSubTab === "roster"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          👥 가입 계정 및 비밀번호 관리 ({users.length}명)
        </button>
      </div>

      {/* 탭 1: 실시간 팀별 점수 현황표 (환산 점수 실시간 연동) */}
      {activeAdminSubTab === "dashboard" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                실시간 팀별 펀딩 및 환산 점수 순위표
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                현재 설정된 환산 기준(<strong>{creditUnit.toLocaleString()} CR = {scorePerUnit}점</strong>)으로 각 팀의 점수가 실시간 산출됩니다.
              </p>
            </div>

            <div className="font-mono text-xs text-slate-500">
              등록 출품작: <strong className="text-slate-900">{projects.length}개</strong>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-mono">
              아직 등록된 출품 프로젝트가 없습니다. 참가자가 프로젝트를 등록하면 실시간으로 현황표에 집계됩니다.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3.5 border-r border-slate-200 text-center w-14">순위</th>
                    <th className="p-3.5 border-r border-slate-200">팀 정보</th>
                    <th className="p-3.5 border-r border-slate-200">프로젝트명</th>
                    <th className="p-3.5 border-r border-slate-200 text-right">누적 크레딧</th>
                    <th className="p-3.5 border-r border-slate-200 text-right bg-blue-50/60 text-blue-900">
                      ★ 환산 점수
                    </th>
                    <th className="p-3.5 border-r border-slate-200 text-center">서포터</th>
                    <th className="p-3.5 text-center w-28">노출 상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...projects]
                    .sort((a, b) => b.totalCredits - a.totalCredits)
                    .map((proj, idx) => {
                      const score = calculateScore(proj.totalCredits);
                      return (
                        <tr
                          key={proj.id}
                          className={proj.isHidden ? "opacity-40 bg-slate-50" : "hover:bg-slate-50/70 transition-colors"}
                        >
                          <td className="p-3.5 border-r border-slate-100 text-center font-bold text-slate-700">
                            {idx === 0 ? "🥇 1위" : idx === 1 ? "🥈 2위" : idx === 2 ? "🥉 3위" : `${idx + 1}위`}
                          </td>
                          <td className="p-3.5 border-r border-slate-100 font-bold text-slate-900">
                            TEAM {String(proj.teamNumber).padStart(2, "0")}<br />
                            <span className="text-[11px] font-normal text-slate-500">{proj.teamName}</span>
                          </td>
                          <td className="p-3.5 border-r border-slate-100 max-w-xs truncate font-sans text-slate-800">
                            {proj.title}
                          </td>
                          <td className="p-3.5 border-r border-slate-100 text-right font-bold text-sm text-slate-800">
                            {proj.totalCredits.toLocaleString()} CR
                          </td>
                          <td className="p-3.5 border-r border-slate-100 text-right font-bold text-base text-blue-600 bg-blue-50/30">
                            {score.toFixed(1)} <span className="text-xs font-normal text-slate-500">점</span>
                          </td>
                          <td className="p-3.5 border-r border-slate-100 text-center font-semibold text-slate-600">
                            {proj.investorCount}명
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => toggleProjectVisibility(proj.id)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 mx-auto ${
                                proj.isHidden
                                  ? "bg-slate-200 text-slate-600 hover:bg-slate-300"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              }`}
                            >
                              {proj.isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                              {proj.isHidden ? "숨김됨" : "정상 노출"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 탭 2: 행사 라운드 제어 */}
      {activeAdminSubTab === "stages" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-[11px] font-bold uppercase tracking-wider mb-2">
              <Layers size={12} /> EVENT STAGE CONTROLLER
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900">
              행사 단계 원클릭 전환
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              단계 버튼을 누르면 참가자 화면의 투자 가능 여부와 프로젝트 등록 권한이 즉시 전환됩니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {stages.map((st) => {
              const isActive = event.currentStage === st.key;
              return (
                <div
                  key={st.key}
                  className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                    isActive
                      ? "border-blue-500 bg-blue-50/50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-mono text-xs font-bold ${isActive ? "text-blue-700" : "text-slate-800"}`}>
                        {st.label}
                      </span>
                      {isActive && <CheckCircle2 size={16} className="text-blue-600" />}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => setStage(st.key)}
                    disabled={isActive}
                    className={`mt-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white cursor-default shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {isActive ? "현재 진행 중" : "이 단계로 전환"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 font-bold">
                PARTICIPANT VISIBILITY
              </span>
              <h3 className="text-lg font-display font-bold text-slate-900 mt-0.5">
                참가자 순위표 노출 설정 (현재: {event.isRankingPublic ? "공개 상태" : "숨김 상태"})
              </h3>
              <p className="text-xs text-slate-500">
                공개 버튼을 누르면 일반 참가자 화면에서도 실시간 순위와 총 모금액이 노출됩니다.
              </p>
            </div>

            <Button
              variant={event.isRankingPublic ? "outline" : "primary"}
              onClick={toggleRankingPublic}
            >
              {event.isRankingPublic ? "랭킹 즉시 비공개 전환" : "★ 랭킹 즉시 공개하기"}
            </Button>
          </div>
        </div>
      )}

      {/* 탭 3: 가입 계정 및 비밀번호 관리 */}
      {activeAdminSubTab === "roster" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-[11px] font-bold uppercase tracking-wider mb-2">
                <Users size={12} /> ACCOUNT & PASSWORD CONTROLLER
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-900">
                가입 계정 명단 및 비밀번호 리셋
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                학생이나 심사위원이 비밀번호를 분실했을 때, 관리자가 [비번 리셋] 버튼을 눌러 임의의 8자리 번호를 즉시 발급할 수 있습니다.
              </p>
            </div>
            <div className="font-mono text-xs text-slate-500">
              총 등록 계정: <strong className="text-slate-900">{users.length}명</strong>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="p-3.5 border-r border-slate-200">역할</th>
                  <th className="p-3.5 border-r border-slate-200">이름</th>
                  <th className="p-3.5 border-r border-slate-200">이메일(아이디)</th>
                  <th className="p-3.5 border-r border-slate-200">소속 정보</th>
                  <th className="p-3.5 text-center">비밀번호 관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="p-3.5 border-r border-slate-100 font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        u.role === "ADMIN"
                          ? "bg-slate-900 text-white"
                          : u.role === "JUDGE"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {u.role === "ADMIN" ? "관리자" : u.role === "JUDGE" ? "심사위원" : "학생"}
                      </span>
                    </td>
                    <td className="p-3.5 border-r border-slate-100 font-bold text-slate-900">
                      {u.name}
                    </td>
                    <td className="p-3.5 border-r border-slate-100 text-slate-600">
                      {u.email}
                    </td>
                    <td className="p-3.5 border-r border-slate-100 text-slate-500">
                      {u.institution} {u.department ? `· ${u.department}` : ""}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handlePasswordReset(u.id, u.name, u.email)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-semibold flex items-center gap-1 mx-auto transition-all cursor-pointer shadow-sm"
                      >
                        <KeyRound size={12} /> 비번 리셋
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
