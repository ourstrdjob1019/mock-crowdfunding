"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { EventStage } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Download, 
  Trophy, 
  RotateCcw, 
  CheckCircle2, 
  KeyRound, 
  ShieldCheck, 
  Layers, 
  Activity, 
  Users,
  Copy,
  Check,
  X
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
    resetAllData,
  } = useApp();

  const [activeAdminSubTab, setActiveAdminSubTab] = useState<"stages" | "stats" | "roster">("stages");
  const [resetNotice, setResetNotice] = useState<string>("");

  // 비밀번호 리셋 결과 팝업 모달 상태
  const [resetModalData, setResetModalData] = useState<{
    userName: string;
    userEmail: string;
    tempPassword: string;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const stages: { key: EventStage; label: string; desc: string }[] = [
    { key: "PREPARING", label: "01. 행사 준비", desc: "명단 업로드 및 팀 매칭 진행" },
    { key: "REGISTRATION", label: "02. 등록 접수", desc: "학생 팀의 결과물 등록/수정 허용" },
    { key: "FUNDING_OPEN", label: "03. 펀딩 오픈", desc: "실시간 가상 자본 투자 허용 (수정 잠금)" },
    { key: "FUNDING_CLOSED", label: "04. 펀딩 마감", desc: "추가 투자 및 금액 수정 전면 차단" },
    { key: "RANKING_PUBLISHED", label: "05. 랭킹 공개", desc: "발표장 순위표 송출 및 결과 확인" },
  ];

  const handleExportExcel = () => {
    const sorted = [...projects].sort((a, b) => b.totalCredits - a.totalCredits);
    const rankingData = sorted.map((p, idx) => ({
      순위: idx + 1,
      팀번호: p.teamNumber,
      팀명: p.teamName,
      프로젝트명: p.title,
      누적투자액_CR: p.totalCredits,
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

    XLSX.utils.book_append_sheet(wb, wsRanking, "팀별_최종_순위");
    XLSX.utils.book_append_sheet(wb, wsDetail, "개인별_투자_원장");

    XLSX.writeFile(wb, `${event.name}_평가결과_${event.eventDate}.xlsx`);
  };

  // 비밀번호 리셋 실행 및 8자리 난수 발급
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

              {/* 8자리 비밀번호 카드 */}
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
                  {isCopied ? "복사됨" : "복사"}
                </button>
              </div>

              <p className="text-[11px] text-slate-500 text-left bg-blue-50/60 p-3 rounded-xl border border-blue-100 leading-relaxed">
                💡 <strong>안내:</strong> 학생에게 이 <strong>8자리 숫자</strong>를 전달해 주세요. 학생이 로그인 화면에서 이 숫자를 입력하면 바로 정상 로그인됩니다.
              </p>

              <Button
                variant="primary"
                isFullWidth
                onClick={() => setResetModalData(null)}
              >
                확인 및 닫기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 관리자 서브 네비게이션 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex space-x-1.5">
          <button
            onClick={() => setActiveAdminSubTab("stages")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeAdminSubTab === "stages"
                ? "bg-blue-50 text-blue-700 font-bold shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            단계 전환 제어
          </button>
          <button
            onClick={() => setActiveAdminSubTab("stats")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeAdminSubTab === "stats"
                ? "bg-blue-50 text-blue-700 font-bold shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            실시간 펀딩 현황
          </button>
          <button
            onClick={() => setActiveAdminSubTab("roster")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeAdminSubTab === "roster"
                ? "bg-blue-50 text-blue-700 font-bold shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            명단·팀 및 비번 리셋
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={openProjectorRanking}
            className="px-4 py-2 rounded-xl bg-accent-gradient text-white text-xs font-bold shadow-accent hover:shadow-accent-lg transition-all flex items-center gap-1.5 cursor-pointer"
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

      {/* 1. 단계 전환 제어 탭 */}
      {activeAdminSubTab === "stages" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-[11px] font-bold uppercase tracking-wider mb-2">
              <Layers size={12} /> EVENT STAGE CONTROLLER
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900">
              행사 단계 원클릭 전환
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              단계 버튼을 누르면 전체 시스템에 즉각 반영되며, 참가자의 화면과 투자 권한이 즉시 전환됩니다.
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
                공개 버튼을 누르면 일반 참가자 화면에서도 실시간 순위와 총 모금액이 활성화됩니다.
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

      {/* 2. 실시간 모니터링 */}
      {activeAdminSubTab === "stats" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-[11px] font-bold uppercase tracking-wider mb-2">
                <Activity size={12} /> LIVE METRICS
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900">
                팀별 누적 투자 모니터링
              </h2>
            </div>
            <div className="font-mono text-xs text-slate-500">
              총 누적 투자: <span className="font-bold text-blue-600">{investments.length}건</span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="p-3.5 border-r border-slate-200">팀</th>
                  <th className="p-3.5 border-r border-slate-200">프로젝트명</th>
                  <th className="p-3.5 border-r border-slate-200 text-right">누적 크레딧</th>
                  <th className="p-3.5 border-r border-slate-200 text-center">투자자 수</th>
                  <th className="p-3.5 border-r border-slate-200">포맷</th>
                  <th className="p-3.5 text-center">프로젝트 노출</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((proj) => (
                  <tr key={proj.id} className={proj.isHidden ? "opacity-40 bg-slate-50" : "hover:bg-slate-50/60"}>
                    <td className="p-3.5 border-r border-slate-100 font-bold text-slate-900">
                      TEAM {String(proj.teamNumber).padStart(2, "0")} ({proj.teamName})
                    </td>
                    <td className="p-3.5 border-r border-slate-100 max-w-xs truncate font-sans text-slate-800">
                      {proj.title}
                    </td>
                    <td className="p-3.5 border-r border-slate-100 text-right font-bold text-sm text-blue-600">
                      {proj.totalCredits.toLocaleString()} CR
                    </td>
                    <td className="p-3.5 border-r border-slate-100 text-center text-slate-700">
                      {proj.investorCount}명
                    </td>
                    <td className="p-3.5 border-r border-slate-100 text-slate-500">
                      {proj.landingFormat}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => toggleProjectVisibility(proj.id)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-bold hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
                      >
                        {proj.isHidden ? "숨김 해제" : "숨김 처리"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. 명단 관리 및 비밀번호 리셋 */}
      {activeAdminSubTab === "roster" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-[11px] font-bold uppercase tracking-wider mb-2">
              <Users size={12} /> ROSTER & ACCESS CONTROL
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900">
              참가자 명단 및 8자리 비밀번호 초기화
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              비밀번호를 분실한 학생의 [비번 리셋] 버튼을 누르면 <strong>임의의 8자리 숫자</strong>가 생성되며, 학생은 그 번호로 즉시 로그인할 수 있습니다.
            </p>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="p-3.5 border-r border-slate-200">이름</th>
                  <th className="p-3.5 border-r border-slate-200">Gmail 아이디</th>
                  <th className="p-3.5 border-r border-slate-200">역할</th>
                  <th className="p-3.5 border-r border-slate-200">소속 팀</th>
                  <th className="p-3.5 border-r border-slate-200">학번</th>
                  <th className="p-3.5 text-center">8자리 비번 리셋</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="p-3.5 border-r border-slate-100 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3.5 border-r border-slate-100 text-slate-700">{u.email}</td>
                    <td className="p-3.5 border-r border-slate-100">
                      <Badge variant={u.role === "ADMIN" ? "primary" : u.role === "JUDGE" ? "secondary" : "outline"} size="sm">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="p-3.5 border-r border-slate-100 text-slate-600">
                      {u.teamName || "-"}
                    </td>
                    <td className="p-3.5 border-r border-slate-100 text-slate-500">{u.studentNumber}</td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handlePasswordReset(u.id, u.name, u.email)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-600 hover:text-white text-blue-700 text-[11px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <KeyRound size={12} /> 8자리 비번 리셋
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
            <span className="font-mono text-xs text-slate-400">
              테스트 시뮬레이션용 데이터 초기화
            </span>
            <button
              onClick={() => {
                if (confirm("모든 테스트 투자와 설정을 초기 상태로 되돌리시겠습니까?")) {
                  resetAllData();
                  setResetNotice("데이터가 성공적으로 초기화되었습니다.");
                  setTimeout(() => setResetNotice(""), 3000);
                }
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 font-mono text-xs text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <RotateCcw size={13} /> 테스트 데이터 전체 초기화
            </button>
          </div>
          {resetNotice && (
            <p className="font-mono text-xs text-blue-600 font-bold">{resetNotice}</p>
          )}
        </div>
      )}
    </div>
  );
};
