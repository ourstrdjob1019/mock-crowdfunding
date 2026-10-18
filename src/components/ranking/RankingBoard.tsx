"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { Trophy, Users, X, Eye, EyeOff, Sparkles } from "lucide-react";

interface RankingBoardProps {
  onClose: () => void;
}

export const RankingBoard: React.FC<RankingBoardProps> = ({ onClose }) => {
  const { event, projects, toggleRankingPublic, currentUser } = useApp();

  const [ratio, setRatio] = React.useState({ creditUnit: 1000, scorePerUnit: 10 });
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("mc_score_ratio");
      if (saved) setRatio(JSON.parse(saved));
    } catch {}
  }, []);

  const calculateScore = (credits: number) => {
    if (!ratio.creditUnit || ratio.creditUnit <= 0) return 0;
    return Math.round(((credits / ratio.creditUnit) * ratio.scorePerUnit) * 10) / 10;
  };

  const sortedProjects = [...projects]
    .filter((p) => !p.isHidden)
    .sort((a, b) => {
      if (b.totalCredits !== a.totalCredits) {
        return b.totalCredits - a.totalCredits;
      }
      return b.investorCount - a.investorCount;
    });

  const totalFunded = projects.reduce((sum, p) => sum + p.totalCredits, 0);

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A] text-white overflow-y-auto flex flex-col justify-between selection:bg-[#0052FF] selection:text-white relative">
      {/* 도트 텍스처 오버레이 */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-dot-pattern-dark z-0" />
      {/* 은은한 래디얼 글루 */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* 상단 프로젝터 헤더 */}
      <header className="relative z-10 border-b border-slate-800 px-6 md:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-gradient flex items-center justify-center text-white shadow-accent">
            <Trophy size={24} />
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400 font-semibold">
              {event.institution} · {event.session}
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-white">
              LIVE PROJECT RANKING BOARD
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {currentUser?.role === "ADMIN" && (
            <button
              onClick={toggleRankingPublic}
              className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-blue-500 font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {event.isRankingPublic ? (
                <>
                  <EyeOff size={14} className="text-rose-400" /> 랭킹 비공개 전환
                </>
              ) : (
                <>
                  <Eye size={14} className="text-blue-400" /> ★ 전체 랭킹 즉시 공개
                </>
              )}
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2.5 rounded-full border border-slate-700 hover:border-white text-slate-400 hover:text-white transition-all cursor-pointer"
            title="닫기 (ESC)"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* 메인 랭킹 본문 */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-8 md:py-12">
        {/* 통계 요약 카드 4개 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8 mb-8 border-b border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 text-xs font-mono block uppercase">참여 프로젝트</span>
            <span className="text-2xl md:text-3xl font-bold font-mono text-white mt-1 block">
              {sortedProjects.length} 팀
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 text-xs font-mono block uppercase">총 누적 펀딩액</span>
            <span className="text-2xl md:text-3xl font-bold font-mono text-blue-400 mt-1 block">
              {totalFunded.toLocaleString()} CR
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 text-xs font-mono block uppercase">진행 단계</span>
            <span className="text-xl md:text-2xl font-bold font-mono text-white mt-1 block uppercase">
              {event.currentStage}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 text-xs font-mono block uppercase">대중 공개 상태</span>
            <span
              className={`text-xl md:text-2xl font-bold font-mono mt-1 block uppercase ${
                event.isRankingPublic ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {event.isRankingPublic ? "공개됨 (PUBLIC)" : "비공개 (BLIND)"}
            </span>
          </div>
        </div>

        {/* 랭킹 비공개 안내 (관리자 이외) */}
        {!event.isRankingPublic && currentUser?.role !== "ADMIN" ? (
          <div className="py-24 text-center rounded-3xl border border-slate-800 p-8 my-8 bg-slate-900/80 backdrop-blur-sm">
            <div className="w-20 h-20 rounded-full bg-slate-800 text-slate-500 mx-auto flex items-center justify-center mb-6">
              <Trophy size={40} className="animate-pulse text-blue-400" />
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4 text-white">
              RANKING IS CURRENTLY BLINDED
            </h2>
            <p className="font-sans text-base md:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
              모든 발표와 투자가 공식 마감된 후, 관리자의 공개 신호와 함께 발표장 화면에 실시간 순위표가 송출됩니다.
            </p>
          </div>
        ) : (
          /* 순위 리스트 */
          <div className="space-y-4">
            {sortedProjects.map((proj, idx) => {
              const rank = idx + 1;
              const isTopThree = rank <= 3;

              return (
                <div
                  key={proj.id}
                  className={`rounded-2xl border transition-all p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    rank === 1
                      ? "border-blue-500/80 bg-gradient-to-r from-blue-950/60 to-slate-900 shadow-accent-lg"
                      : isTopThree
                      ? "border-slate-700 bg-slate-800/80"
                      : "border-slate-800/80 bg-slate-900/60"
                  }`}
                >
                  {/* 순위 & 팀 정보 */}
                  <div className="flex items-center space-x-6 md:space-x-8">
                    <span
                      className={`font-mono text-3xl md:text-5xl font-black w-14 text-center ${
                        rank === 1
                          ? "text-blue-400"
                          : rank === 2 || rank === 3
                          ? "text-white"
                          : "text-slate-600"
                      }`}
                    >
                      {String(rank).padStart(2, "0")}
                    </span>

                    <div>
                      <div className="flex items-center space-x-2.5 mb-1.5">
                        <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded-full border border-slate-700 text-slate-300 bg-slate-800">
                          TEAM {String(proj.teamNumber).padStart(2, "0")}
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-400">
                          {proj.teamName}
                        </span>
                        {rank === 1 && (
                          <span className="bg-accent-gradient text-white text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <Sparkles size={11} /> 1ST PLACE
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">
                        {proj.title}
                      </h3>
                    </div>
                  </div>

                  {/* 펀딩 결과 수치 & 환산 점수 */}
                  <div className="flex items-center space-x-6 md:space-x-8 self-end md:self-center font-mono">
                    <div className="text-right">
                      <span className="text-slate-400 text-xs uppercase block flex items-center gap-1 justify-end">
                        <Users size={12} /> 투자자
                      </span>
                      <span className="text-base md:text-lg font-bold text-slate-200">
                        {proj.investorCount}명
                      </span>
                    </div>

                    <div className="text-right min-w-[130px]">
                      <span className="text-slate-400 text-xs uppercase block">누적 크레딧</span>
                      <span className="text-xl md:text-2xl font-black text-slate-200 tracking-tight">
                        {proj.totalCredits.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-slate-400">CR</span>
                      </span>
                    </div>

                    <div className="text-right min-w-[130px] pl-4 border-l border-slate-700/80">
                      <span className="text-blue-400 text-xs uppercase font-bold block">★ 환산 점수</span>
                      <span className="text-2xl md:text-3xl font-black text-emerald-400 tracking-tight">
                        {calculateScore(proj.totalCredits).toFixed(1)}{" "}
                        <span className="text-xs font-normal text-slate-400">점</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 최하단 푸터 */}
      <footer className="relative z-10 border-t border-slate-800 px-6 md:px-12 py-4 flex items-center justify-between font-mono text-xs text-slate-500">
        <span>CROWDFUND LIVE PROJECTION ENGINE</span>
        <span>PRESS ESC OR CLOSE BUTTON TO RETURN</span>
      </footer>
    </div>
  );
};
