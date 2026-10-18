"use client";

import React, { useState, useEffect } from "react";
import { Project } from "@/types";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { X, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, Wallet } from "lucide-react";
import confetti from "canvas-confetti";

interface InvestModalProps {
  project: Project | null;
  onClose: () => void;
}

export const InvestModal: React.FC<InvestModalProps> = ({ project, onClose }) => {
  const { event, currentUser, remainingCredits, getUserInvestmentForProject, invest } = useApp();
  
  if (!project || !currentUser) return null;

  const existing = getUserInvestmentForProject(project.id);
  const currentInvestmentAmount = existing ? existing.amount : 0;
  const availableCredit = remainingCredits + currentInvestmentAmount;

  const [amount, setAmount] = useState<number>(
    existing ? existing.amount : Math.min(2000, availableCredit)
  );
  const [confirmedNotice, setConfirmedNotice] = useState<boolean>(existing ? true : false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (existing) {
      setAmount(existing.amount);
      setConfirmedNotice(true);
    } else {
      setAmount(Math.min(2000, availableCredit));
      setConfirmedNotice(false);
    }
    setErrorMessage("");
    setIsSuccess(false);
  }, [project, existing, availableCredit]);

  const handleQuickAdd = (delta: number) => {
    const next = Math.max(2000, Math.min(5000, amount + delta));
    setAmount(next);
  };

  const handleInvestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!confirmedNotice && !existing) {
      setErrorMessage("투자 취소 불가 규칙(최소 2,000 크레딧 유지)에 동의해야 합니다.");
      return;
    }

    const result = await invest(project.id, amount);
    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    setIsSuccess(true);
    confetti({
      particleCount: 60,
      spread: 70,
      colors: ["#0052FF", "#4D7CFF", "#FFFFFF"],
    });

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-slate-200/90 w-full max-w-lg p-6 md:p-8 relative shadow-2xl">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* 상단 타이틀 */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-[11px] font-bold uppercase tracking-wider mb-2">
            TEAM {String(project.teamNumber).padStart(2, "0")} · {project.teamName}
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-tight">
            {existing ? "투자 금액 수정하기" : "가상 크레딧 모의 투자"}
          </h2>
        </div>

        {/* 잔여 크레딧 대조 바 */}
        <div className="rounded-2xl border border-slate-200 p-4 mb-6 bg-slate-50 text-xs font-mono">
          <div className="flex justify-between items-center mb-1 text-slate-600">
            <span>내 현재 잔여 자본</span>
            <span className="font-bold text-slate-900 text-sm">{remainingCredits.toLocaleString()} CR</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
            <span>이 팀에 투입 가능한 한도</span>
            <span className="font-bold text-blue-600 text-sm">{availableCredit.toLocaleString()} CR</span>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 size={36} />
            </div>
            <p className="font-display text-2xl font-bold text-slate-900">투자가 완료되었습니다</p>
            <p className="font-mono text-xs text-slate-600 mt-2">
              {amount.toLocaleString()} CR 이 안전하게 기록되었습니다.
            </p>
          </div>
        ) : (
          <form onSubmit={handleInvestSubmit} className="space-y-6">
            {/* 금액 슬라이더 및 디스플레이 */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                  투자 금액 선택 (2,000 ~ 5,000)
                </label>
                <span className="text-2xl font-mono font-bold text-blue-600">
                  {amount.toLocaleString()} <span className="text-sm font-normal text-slate-500">CR</span>
                </span>
              </div>

              {/* 슬라이더 */}
              <input
                type="range"
                min={2000}
                max={5000}
                step={100}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-full accent-[#0052FF] cursor-pointer appearance-none outline-none"
              />

              {/* 퀵 추가 버튼 */}
              <div className="grid grid-cols-4 gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setAmount(2000)}
                  className="py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer shadow-sm"
                >
                  최소 2천
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(500)}
                  className="py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer shadow-sm"
                >
                  +500
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(1000)}
                  className="py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer shadow-sm"
                >
                  +1,000
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(Math.min(5000, availableCredit))}
                  className="py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs font-semibold text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer shadow-sm"
                >
                  최대 가능
                </button>
              </div>
            </div>

            {/* 첫 투자 시 동의 체크박스 */}
            {!existing && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="confirm-notice-modal"
                  checked={confirmedNotice}
                  onChange={(e) => setConfirmedNotice(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="confirm-notice-modal" className="text-xs text-slate-600 leading-snug cursor-pointer">
                  <span className="font-bold text-slate-900 underline">투자 취소 불가 규칙 확인</span>: 투자 후에는 금액 수정만 가능하며, 0원으로 전액 취소할 수 없음에 동의합니다. (최소 2,000 CR 유지)
                </label>
              </div>
            )}

            {/* 에러 메시지 */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-mono text-xs flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" variant="primary" disabled={amount > availableCredit}>
                {existing ? "금액 수정 확정" : "투자 완료하기"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
