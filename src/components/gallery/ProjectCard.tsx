"use client";

import React from "react";
import { Project } from "@/types";
import { useApp } from "@/context/AppContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowUpRight, CheckCircle2, UserCheck, Eye, Edit3, Sparkles } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  onInvestClick: (project: Project) => void;
  onEditClick?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  onInvestClick,
  onEditClick,
}) => {
  const { currentUser, getUserInvestmentForProject, event } = useApp();
  const existingInvestment = currentUser ? getUserInvestmentForProject(project.id) : undefined;
  const isMyTeam = currentUser?.teamId && currentUser.teamId === project.teamId;
  const isMyProject = currentUser?.id === project.authorId;
  const canEdit = isMyProject || currentUser?.role === "ADMIN";

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1 relative">
      {/* 상단 썸네일 영역 */}
      <div
        onClick={() => onSelect(project)}
        className="relative aspect-[16/10] overflow-hidden bg-slate-100 cursor-pointer"
      >
        <img
          src={project.thumbnailUrl}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* 좌상단 팀 뱃지 */}
        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
          <span className="bg-accent-gradient text-white px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider shadow-sm uppercase">
            TEAM {String(project.teamNumber).padStart(2, "0")}
          </span>
          <span className="bg-white/95 backdrop-blur-sm text-slate-800 border border-slate-200 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold shadow-sm">
            {project.teamName}
          </span>
        </div>

        {/* 내 상태 표시 (우상단) */}
        {isMyProject ? (
          <div className="absolute top-3 right-3 bg-amber-500 text-white px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
            <Sparkles size={12} /> 내 출품작
          </div>
        ) : isMyTeam ? (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-slate-900 border border-slate-300 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <UserCheck size={12} className="text-blue-600" /> 우리 팀
          </div>
        ) : existingInvestment ? (
          <div className="absolute top-3 right-3 bg-accent-gradient text-white px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-accent">
            <CheckCircle2 size={12} /> 투자 완료: {existingInvestment.amount.toLocaleString()} CR
          </div>
        ) : null}
      </div>

      {/* 본문 정보 영역 */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> FORMAT: {project.landingFormat}
            </span>
            <span>최종 수정: {project.lastModifiedAt.slice(5)}</span>
          </div>

          <h3
            onClick={() => onSelect(project)}
            className="text-xl font-display font-bold tracking-tight text-slate-900 leading-snug hover:text-blue-600 transition-colors cursor-pointer mb-2.5 line-clamp-2"
          >
            {project.title}
          </h3>

          <p className="text-sm font-sans text-slate-600 leading-relaxed line-clamp-2 mb-6">
            {project.summary}
          </p>
        </div>

        {/* 카드 하단 액션 바 */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => onSelect(project)}
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Eye size={14} /> 상세페이지 열람
          </button>

          {/* 투자 또는 수정 버튼 로직 */}
          {canEdit && onEditClick ? (
            <button
              onClick={() => onEditClick(project)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
            >
              <Edit3 size={13} /> 수정하기
            </button>
          ) : event.currentStage === "FUNDING_OPEN" ? (
            isMyTeam || isMyProject ? (
              <span className="text-xs font-mono font-semibold text-slate-400">
                [자기 팀 투자 불가]
              </span>
            ) : existingInvestment ? (
              <button
                onClick={() => onInvestClick(project)}
                className="px-3.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-100 font-mono text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                금액 수정 ({existingInvestment.amount.toLocaleString()})
              </button>
            ) : (
              <button
                onClick={() => onInvestClick(project)}
                className="px-4 py-2 bg-accent-gradient text-white rounded-xl hover:shadow-accent font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:-translate-y-0.5"
              >
                투자하기 <ArrowUpRight size={14} />
              </button>
            )
          ) : (
            <span className="text-xs font-mono text-slate-400">
              {event.currentStage === "REGISTRATION"
                ? "등록 접수 단계"
                : event.currentStage === "FUNDING_CLOSED"
                ? "펀딩 마감됨"
                : "결과 공개됨"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
