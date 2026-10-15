"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Project } from "@/types";
import { Button } from "@/components/ui/Button";
import { Wallet, Edit3, ArrowRight, CheckCircle2, CreditCard } from "lucide-react";

interface MyInvestmentsViewProps {
  onEditInvestment: (project: Project) => void;
  onExploreGallery: () => void;
}

export const MyInvestmentsView: React.FC<MyInvestmentsViewProps> = ({
  onEditInvestment,
  onExploreGallery,
}) => {
  const { currentUser, event, remainingCredits, usedCredits, getUserTotalInvestments, projects } = useApp();
  const myInvestments = getUserTotalInvestments();

  if (!currentUser) return null;

  return (
    <div className="space-y-8">
      {/* 상단 타이틀 & 크레딧 카드 */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-[11px] font-bold uppercase tracking-wider mb-2">
              <CreditCard size={12} /> PORTFOLIO STATEMENT
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 tracking-tight">
              내 가상 자본 투자 포트폴리오
            </h2>
            <p className="text-sm text-slate-600 mt-1.5">
              투자자: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.email}) · {currentUser.department}
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 min-w-[280px] shadow-md relative overflow-hidden">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 uppercase pb-1 border-b border-slate-700/60">
              <span>기본 자본금</span>
              <span>{event.baseCredit.toLocaleString()} CR</span>
            </div>
            <div className="mt-3 flex justify-between items-baseline">
              <span className="text-xs font-mono text-slate-400">잔여 투자 가능액</span>
              <span className="text-2xl font-mono font-bold text-blue-400">
                {remainingCredits.toLocaleString()} <span className="text-xs font-normal">CR</span>
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-700/60 flex justify-between text-xs font-mono text-slate-400">
              <span>투자 완료: {myInvestments.length}팀</span>
              <span>누적 투입: {usedCredits.toLocaleString()} CR</span>
            </div>
          </div>
        </div>

        {/* 규칙 요약 안내 */}
        <div className="pt-6 font-mono text-xs text-slate-500 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            • <strong>투자 한도:</strong> 팀당 1회, 2,000 ~ 5,000 CR
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            • <strong>금액 수정:</strong> 펀딩 마감 전까지 자율 수정 가능
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            • <strong>잔여 크레딧:</strong> 잔여액을 전부 쓰지 않아도 무방
          </div>
        </div>
      </div>

      {/* 투자 목록 */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-display font-bold text-slate-900">
            투자 포트폴리오 목록 ({myInvestments.length}개 팀)
          </h3>
          <Button variant="outline" size="sm" onClick={onExploreGallery}>
            더 많은 팀 둘러보기 <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>

        {myInvestments.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 p-8">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 mx-auto flex items-center justify-center mb-3">
              <Wallet size={28} />
            </div>
            <p className="font-display text-xl font-bold text-slate-900 mb-1">아직 투자한 프로젝트가 없습니다</p>
            <p className="text-sm text-slate-500 mb-6">
              프로젝트 갤러리에서 팀들의 결과물 랜딩페이지를 열람하고 마음에 드는 팀에 투자해 보세요.
            </p>
            <Button variant="primary" onClick={onExploreGallery}>
              프로젝트 갤러리로 이동
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myInvestments.map((inv) => {
              const proj = projects.find((p) => p.id === inv.projectId);
              if (!proj) return null;

              return (
                <div
                  key={inv.id}
                  className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/80 px-3 rounded-2xl transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={proj.thumbnailUrl}
                      alt={proj.title}
                      className="w-20 h-14 object-cover rounded-xl border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 uppercase">
                          TEAM {String(proj.teamNumber).padStart(2, "0")}
                        </span>
                        <span className="font-mono text-xs text-slate-500 font-semibold">
                          {proj.teamName}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-base md:text-lg text-slate-900 leading-tight">
                        {proj.title}
                      </h4>
                      <p className="font-mono text-[11px] text-slate-400 mt-1">
                        투자 일시: {inv.createdAt} {inv.updatedAt !== inv.createdAt && `(수정됨: ${inv.updatedAt})`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 self-end md:self-center">
                    <div className="text-right font-mono">
                      <span className="text-[11px] text-slate-400 uppercase block">투자 확정액</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {inv.amount.toLocaleString()} <span className="text-xs font-normal text-slate-400">CR</span>
                      </span>
                    </div>

                    {event.currentStage === "FUNDING_OPEN" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditInvestment(proj)}
                        className="flex items-center gap-1.5"
                      >
                        <Edit3 size={13} /> 금액 수정
                      </Button>
                    ) : (
                      <span className="font-mono text-xs text-slate-400">
                        수정 마감됨
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
