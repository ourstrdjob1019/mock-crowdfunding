"use client";

import React, { useState, useEffect } from "react";
import { Project } from "@/types";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { X, AlertCircle, CheckCircle2, Coins, ShieldCheck, Wallet, ArrowRight, Ban } from "lucide-react";
import confetti from "canvas-confetti";

interface InvestModalProps {
  project: Project | null;
  onClose: () => void;
}

export const InvestModal: React.FC<InvestModalProps> = ({ project, onClose }) => {
  const { event, currentUser, remainingCredits, getUserInvestmentForProject, invest } = useApp();
  
  if (!project || !currentUser) return null;

  // 팀원 및 본인 프로젝트 여부 (투자 차단)
  const isMyTeamProject = Boolean(
    currentUser && (
      project.authorId === currentUser.id ||
      (currentUser.email && project.authorEmail?.toLowerCase() === currentUser.email.toLowerCase()) ||
      (project.teamMemberIds && (
        project.teamMemberIds.includes(currentUser.id) ||
        (currentUser.email && project.teamMemberIds.map(s => s.toLowerCase()).includes(currentUser.email.toLowerCase())) ||
        (currentUser.studentNumber && project.teamMemberIds.includes(currentUser.studentNumber))
      )) ||
      (project.teamMemberDetails && project.teamMemberDetails.some(m => 
        m.id === currentUser.id ||
        (currentUser.email && m.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
        (currentUser.studentNumber && m.studentNumber === currentUser.studentNumber)
      )) ||
      (project.teamId && currentUser.teamId && project.teamId === currentUser.teamId)
    )
  );

  const existing = getUserInvestmentForProject(project.id);
  const currentInvestmentAmount = existing ? existing.amount : 0;
  const availableCredit = remainingCredits + currentInvestmentAmount;

  // 숫자 직접 입력 상태 (2,000 ~ 5,000)
  const [amountStr, setAmountStr] = useState<string>(
    String(existing ? existing.amount : Math.min(2000, availableCredit))
  );
  const [confirmedNotice, setConfirmedNotice] = useState<boolean>(existing ? true : false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (existing) {
      setAmountStr(String(existing.amount));
      setConfirmedNotice(true);
    } else {
      setAmountStr(String(Math.min(2000, availableCredit)));
      setConfirmedNotice(false);
    }
    setErrorMessage("");
    setIsSuccess(false);
  }, [project, existing, availableCredit]);

  // 숫자 입력 변경 핸들러 (2000 ~ 5000 제한)
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, "");
    if (!rawVal) {
      setAmountStr("");
      return;
    }

    const numVal = parseInt(rawVal, 10);
    // 5,000 초과 입력 차단
    if (numVal > 5000) {
      setAmountStr("5000");
      setErrorMessage("최대 투자 금액은 5,000 CR 입니다.");
    } else {
      setAmountStr(String(numVal));
      if (numVal >= 2000 && numVal <= 5000) {
        setErrorMessage("");
      }
    }
  };

  // 포커스 아웃 시 2000 미만 자동 클램핑 보정
  const handleAmountBlur = () => {
    const num = parseInt(amountStr, 10) || 0;
    if (num < 2000) {
      setAmountStr("2000");
      setErrorMessage("최소 투자 금액은 2,000 CR 입니다.");
    } else if (num > 5000) {
      setAmountStr("5000");
    } else {
      setErrorMessage("");
    }
  };

  const setFixedPreset = (preset: number) => {
    setAmountStr(String(preset));
    setErrorMessage("");
  };

  // ★ 요구사항 4: 크고 풍성한 돈(지폐, 동전, 돈자루) 파티클 애니메이션
  const triggerMoneyEffect = () => {
    try {
      const scalar = 3.6; // 초대형 크기
      const dollar = confetti.shapeFromText({ text: "💵", scalar });
      const coin = confetti.shapeFromText({ text: "🪙", scalar });
      const moneyBag = confetti.shapeFromText({ text: "💰", scalar });
      const yen = confetti.shapeFromText({ text: "💴", scalar });

      // 1차 센터 머니 폭탄 (화면 중앙)
      confetti({
        shapes: [dollar, coin, moneyBag, yen],
        scalar,
        particleCount: 50,
        spread: 90,
        origin: { y: 0.6 },
        ticks: 250,
      });

      // 2차 좌/우 돈포 발사
      setTimeout(() => {
        confetti({
          shapes: [dollar, coin],
          scalar: 3.2,
          particleCount: 45,
          angle: 60,
          spread: 80,
          origin: { x: 0.05, y: 0.75 },
          ticks: 260,
        });
        confetti({
          shapes: [moneyBag, coin],
          scalar: 3.2,
          particleCount: 45,
          angle: 120,
          spread: 80,
          origin: { x: 0.95, y: 0.75 },
          ticks: 260,
        });
      }, 180);

      // 3차 황금빛 골드 샤워
      setTimeout(() => {
        confetti({
          particleCount: 90,
          spread: 120,
          origin: { y: 0.55 },
          colors: ["#F59E0B", "#FCD34D", "#10B981", "#3B82F6", "#FFFFFF", "#EAB308"],
          ticks: 280,
        });
      }, 350);
    } catch (e) {
      console.warn("Confetti effect fallback:", e);
    }
  };

  const handleInvestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (isMyTeamProject) {
      setErrorMessage("본인이 출품했거나 팀원으로 등록된 프로젝트에는 투자가 제한됩니다.");
      return;
    }

    const currentNum = parseInt(amountStr, 10);
    if (isNaN(currentNum) || currentNum < 2000 || currentNum > 5000) {
      setErrorMessage("투자 금액은 최소 2,000 CR ~ 최대 5,000 CR 사이여야 합니다.");
      return;
    }

    if (currentNum > availableCredit) {
      setErrorMessage(`투자 가능 한도(${availableCredit.toLocaleString()} CR)를 초과할 수 없습니다.`);
      return;
    }

    if (!confirmedNotice && !existing) {
      setErrorMessage("투자 취소 불가 규칙(최소 2,000 크레딧 유지)에 동의해야 합니다.");
      return;
    }

    const result = await invest(project.id, currentNum);
    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    setIsSuccess(true);
    triggerMoneyEffect();

    setTimeout(() => {
      onClose();
    }, 1800);
  };

  const numericAmount = parseInt(amountStr, 10) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-slate-200/90 w-full max-w-lg p-6 md:p-8 relative shadow-2xl transition-all">
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

        {/* 소속 팀원 투자 차단 안내 */}
        {isMyTeamProject ? (
          <div className="py-6 px-4 text-center rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
              <Ban size={24} />
            </div>
            <h3 className="text-base font-bold text-amber-900">자가 투자 방지 정책 안내</h3>
            <p className="text-xs text-amber-800 leading-relaxed max-w-md mx-auto">
              회원님은 이 프로젝트의 <strong>출품 대표자 또는 등록된 팀원</strong>이므로 같은 프로젝트에 투자할 수 없습니다. 타 팀의 프로젝트를 둘러보고 분산 투자에 참여해보세요!
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition"
              >
                확인 및 닫기
              </button>
            </div>
          </div>
        ) : isSuccess ? (
          <div className="py-8 text-center flex flex-col items-center space-y-3">
            <div className="w-18 h-18 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md animate-bounce">
              <Coins size={40} className="text-amber-500" />
            </div>
            <p className="font-display text-2xl font-bold text-slate-900">모의투자가 성공했습니다!</p>
            <p className="font-mono text-sm text-blue-600 font-bold">
              {numericAmount.toLocaleString()} CR 이 안전하게 투자되었습니다 💵
            </p>
            <p className="text-xs text-slate-400">화면 가득 머니 샤워와 함께 기록이 완료되었습니다.</p>
          </div>
        ) : (
          <form onSubmit={handleInvestSubmit} className="space-y-6">
            {/* ★ 요구사항 3: 숫자 직접 입력 및 2,000 ~ 5,000 강제 제한 */}
            <div className="p-4 rounded-2xl bg-white border-2 border-blue-100 shadow-xs space-y-3">
              <div className="flex justify-between items-baseline">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                  투자 금액 직접 입력 (2,000 ~ 5,000)
                </label>
                <span className="text-[11px] font-semibold text-blue-600">
                  최소 2,000 ~ 최대 5,000
                </span>
              </div>

              {/* 직접 숫자 입력 필드 */}
              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-400">
                  <Coins className="w-5 h-5 text-amber-500" />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amountStr}
                  onChange={handleAmountChange}
                  onBlur={handleAmountBlur}
                  placeholder="2000"
                  className="w-full pl-12 pr-16 py-3.5 rounded-xl border border-slate-300 font-mono text-2xl font-black text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                />
                <span className="absolute right-4 text-sm font-bold text-slate-500 font-sans">
                  CR
                </span>
              </div>

              {/* 퀵 프리셋 버튼 */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[2000, 3000, 4000, 5000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFixedPreset(preset)}
                    className={`py-2 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                      numericAmount === preset
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm scale-102"
                        : "bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    {preset.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-slate-400 text-center font-medium">
                ※ 2,000 미만이나 5,000 초과 금액은 입력이 제한됩니다.
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
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="confirm-notice-modal" className="text-xs text-slate-600 cursor-pointer leading-relaxed">
                  <span className="font-bold text-slate-900">모의투자 규정 안내:</span> 투자 후 전액 취소는 불가능하며, 1회 투자 한도는 최소 2,000 CR ~ 최대 5,000 CR 입니다.
                </label>
              </div>
            )}

            {/* 에러 메시지 알림 */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle size={15} className="text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition cursor-pointer"
              >
                닫기
              </button>
              <Button type="submit" variant="primary" isFullWidth size="lg">
                <span className="flex items-center gap-1.5 justify-center">
                  <span>{existing ? "금액 변경하기" : `${numericAmount.toLocaleString()} CR 투자하기`}</span>
                  <ArrowRight size={16} />
                </span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
