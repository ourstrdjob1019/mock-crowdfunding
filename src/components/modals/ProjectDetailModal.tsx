"use client";

import React from "react";
import { Project } from "@/types";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { X, ArrowUpRight, CheckCircle2, UserCheck, FileText } from "lucide-react";

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onOpenInvest: (project: Project) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onOpenInvest,
}) => {
  const { currentUser, getUserInvestmentForProject, event } = useApp();

  if (!project) return null;

  const existingInvestment = currentUser ? getUserInvestmentForProject(project.id) : undefined;
  const isMyTeam = currentUser?.teamId === project.teamId;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 md:p-8">
      <div className="bg-white rounded-3xl border border-slate-200/90 w-full max-w-4xl relative shadow-2xl my-auto overflow-hidden">
        {/* 상단 닫기 바 */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="font-mono text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <span className="font-bold text-blue-600">TEAM {String(project.teamNumber).padStart(2, "0")}</span>
            <span>·</span>
            <span className="font-semibold text-slate-800">{project.teamName}</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* 1. 상단 썸네일 */}
        <div className="w-full h-72 md:h-96 bg-slate-100 overflow-hidden relative">
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm text-white px-3.5 py-1.5 rounded-full font-mono text-xs font-semibold uppercase tracking-wider">
            포맷: {project.landingFormat} LANDING
          </div>
        </div>

        {/* 2. 타이틀 & 요약 & 설명 */}
        <div className="p-6 md:p-10 border-b border-slate-100">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 leading-tight tracking-tight mb-4">
            {project.title}
          </h1>

          <div className="font-mono text-xs text-slate-400 uppercase tracking-wider pb-4 mb-6 border-b border-slate-100 flex flex-wrap gap-4 justify-between">
            <span>마지막 업데이트: {project.lastModifiedAt} (수정자: {project.lastModifierName})</span>
            <span>누적 참여: {project.investorCount}명</span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-blue-950 font-medium text-base md:text-lg leading-relaxed mb-6">
            "{project.summary}"
          </div>

          <div className="text-sm md:text-base font-sans text-slate-700 leading-relaxed whitespace-pre-line">
            {project.description}
          </div>
        </div>

        {/* 3. 랜딩페이지 전체 뷰어 */}
        <div className="p-6 md:p-10 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200">
            <h3 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" /> 공식 프로젝트 랜딩페이지
            </h3>
            <span className="font-mono text-xs text-slate-500">
              {project.landingFormat === "IMAGE" ? "연속 고화질 이미지 뷰" : project.landingFormat}
            </span>
          </div>

          {/* 형식별 렌더링 */}
          {project.landingFormat === "IMAGE" && (
            <div className="flex flex-col space-y-4 rounded-2xl overflow-hidden border border-slate-200 p-2 bg-white shadow-sm">
              {(project.landingImages || [project.landingUrl]).map((imgUrl, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-100">
                  <img
                    src={imgUrl}
                    alt={`Landing page part ${idx + 1}`}
                    className="w-full h-auto object-contain block"
                  />
                  <div className="text-right py-1 px-3 font-mono text-[10px] text-slate-400 bg-slate-50 border-t border-slate-100">
                    PAGE {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          )}

          {project.landingFormat === "PDF" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <iframe
                src={project.landingUrl}
                className="w-full h-[600px] rounded-xl border border-slate-200"
                title="Project PDF Document"
              />
            </div>
          )}

          {project.landingFormat === "HTML" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <iframe
                src={project.landingUrl}
                sandbox="allow-same-origin allow-scripts"
                className="w-full h-[600px] rounded-xl border border-slate-200"
                title="Project HTML Sandbox"
              />
            </div>
          )}
        </div>

        {/* 4. 최하단 투자하기 액션 바 */}
        <div className="p-6 md:p-8 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-20 border-t border-slate-100">
          <div>
            <div className="font-mono text-xs text-slate-400 uppercase">
              {project.teamName} 평가
            </div>
            {existingInvestment ? (
              <div className="font-mono text-sm font-bold text-blue-600 flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 size={16} /> 이미 {existingInvestment.amount.toLocaleString()} CR 투자함 (수정 가능)
              </div>
            ) : isMyTeam ? (
              <div className="font-mono text-sm font-bold text-slate-400 flex items-center gap-1.5 mt-0.5">
                <UserCheck size={16} /> 본인 소속 팀 프로젝트입니다
              </div>
            ) : (
              <div className="text-xs md:text-sm text-slate-600 mt-0.5">
                1회 최소 2,000 ~ 최대 5,000 CR 범위에서 투자
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              닫기
            </Button>

            {event.currentStage === "FUNDING_OPEN" && !isMyTeam && (
              <Button
                variant="primary"
                onClick={() => {
                  onClose();
                  onOpenInvest(project);
                }}
                className="w-full sm:w-auto"
              >
                {existingInvestment ? "금액 수정하기" : "이 팀에 투자하기"} <ArrowUpRight size={16} className="ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
