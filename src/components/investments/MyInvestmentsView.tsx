"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Project } from "@/types";
import { TrendingUp, Briefcase, Coins, RotateCcw } from "lucide-react";

interface MyInvestmentsViewProps {
  onEditInvestment?: (project: Project) => void;
  onExploreGallery: () => void;
}

export const MyInvestmentsView: React.FC<MyInvestmentsViewProps> = ({
  onExploreGallery,
}) => {
  const {
    currentUser,
    remainingCredits,
    usedCredits,
    getUserTotalInvestments,
    projects,
    cancelInvestment,
  } = useApp();

  const [cancelNotice, setCancelNotice] = useState<string | null>(null);

  if (!currentUser) return null;

  const myInvestments = getUserTotalInvestments();

  const handleCancel = async (invId: string) => {
    if (confirm("정말로 이 투자를 취소(환불)하시겠습니까?")) {
      const res = await cancelInvestment(invId);
      setCancelNotice(res.message);
      setTimeout(() => setCancelNotice(null), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Toast Notice */}
      {cancelNotice && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] px-5 py-2.5 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <span>{cancelNotice}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">내 모의투자 포트폴리오</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          2026 데모데이 출품작에 참여한 모의투자 내역입니다. 펀딩 진행 중 단계에서는 자유롭게 투자를 취소(환불)할 수 있습니다.
        </p>
      </div>

      {/* 3 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">총 투자 크레딧</p>
            <p className="text-2xl font-extrabold font-mono text-blue-600 mt-1">
              {usedCredits.toLocaleString()} <span className="text-xs font-sans text-slate-500">CR</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">참여 프로젝트 수</p>
            <p className="text-2xl font-extrabold font-mono text-emerald-600 mt-1">
              {myInvestments.length} <span className="text-xs font-sans text-slate-500">개 팀</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">잔여 크레딧 잔액</p>
            <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
              {remainingCredits.toLocaleString()} <span className="text-xs font-sans text-slate-500">CR</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Investments History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm">모의투자 내역 리스트</h2>
          <span className="text-xs text-slate-400 font-mono">실시간 환불 보장 정책 적용</span>
        </div>

        {myInvestments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Coins className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-sm font-medium text-slate-600">아직 투자한 프로젝트가 없습니다.</p>
            <button
              type="button"
              onClick={onExploreGallery}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition cursor-pointer"
            >
              프로젝트 둘러보고 투자하기
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">팀 / 프로젝트명</th>
                  <th className="py-3 px-4">발표 형식</th>
                  <th className="py-3 px-4">투자 일시</th>
                  <th className="py-3 px-4 text-right">투자 크레딧</th>
                  <th className="py-3 px-4 text-center">상태 / 조치</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myInvestments.map((inv) => {
                  const proj = projects.find((p) => p.id === inv.projectId);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {proj ? proj.title : inv.projectId}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          <span className="text-blue-600 font-bold">
                            {proj ? `Team ${String(proj.teamNumber).padStart(2, "0")}` : ""}
                          </span>{" "}
                          · {proj ? proj.teamName : inv.teamId}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {proj ? proj.landingFormat : "IMAGE"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {inv.createdAt}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-600 text-sm">
                        {inv.amount.toLocaleString()} CR
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleCancel(inv.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-[11px] transition cursor-pointer"
                        >
                          투자 취소 (환불)
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

    </div>
  );
};
