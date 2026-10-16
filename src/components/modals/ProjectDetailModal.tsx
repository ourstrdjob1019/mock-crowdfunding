"use client";

import React, { useState } from "react";
import { Project } from "@/types";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { 
  X, 
  ArrowUpRight, 
  CheckCircle2, 
  UserCheck, 
  FileText, 
  Edit3, 
  Trash2, 
  Share2, 
  ExternalLink, 
  ShieldAlert, 
  TrendingUp, 
  Users, 
  Coins, 
  Sparkles,
  ChevronRight,
  Maximize2
} from "lucide-react";

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onOpenInvest: (project: Project) => void;
  onOpenEdit?: (project: Project) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onOpenInvest,
  onOpenEdit,
}) => {
  const { currentUser, getUserInvestmentForProject, investments, event, deleteProject } = useApp();

  const [activeTab, setActiveTab] = useState<"detail" | "story" | "team" | "supporters">("detail");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  if (!project) return null;

  const existingInvestment = currentUser ? getUserInvestmentForProject(project.id) : undefined;
  const isMyTeam = currentUser?.teamId && currentUser.teamId === project.teamId;
  const isMyProject = currentUser?.id === project.authorId;
  const canEdit = isMyProject || currentUser?.role === "ADMIN";

  const allImages = project.landingImages && project.landingImages.length > 0
    ? project.landingImages
    : [project.thumbnailUrl, project.landingUrl].filter(Boolean);

  const activeMainImage = allImages[selectedImageIndex] || project.thumbnailUrl;

  // 프로젝트별 펀딩 지표
  const targetGoalCredits = 10000;
  const fundingRate = Math.round((project.totalCredits / targetGoalCredits) * 100);
  const projectSupporters = investments.filter((inv) => inv.projectId === project.id);

  const handleDelete = () => {
    if (confirm("정말로 이 프로젝트를 삭제하시겠습니까?")) {
      const res = deleteProject(project.id);
      if (res.success) {
        onClose();
      } else {
        alert(res.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-md flex items-start justify-center p-2 sm:p-4 md:p-6">
      <div className="bg-white rounded-3xl border border-slate-200/90 w-full max-w-5xl relative shadow-2xl overflow-hidden my-4 md:my-8 flex flex-col">
        
        {/* 1. 상단 G마켓 스타일 탑 바 (네비게이션 & 작성자 권한 툴바) */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 truncate">
            <span className="font-bold text-blue-600">DEMODAY 2026</span>
            <ChevronRight size={12} className="text-slate-400" />
            <span className="text-slate-600">출품 갤러리</span>
            <ChevronRight size={12} className="text-slate-400" />
            <span className="font-semibold text-slate-900 truncate">TEAM {String(project.teamNumber).padStart(2, "0")}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* 작성자 또는 관리자 전용 수정/삭제 액션 */}
            {canEdit && (
              <div className="flex items-center gap-1.5 mr-2">
                <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-mono font-bold text-amber-700">
                  {isMyProject ? "내 출품작" : "관리자 권한"}
                </span>
                {onOpenEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenEdit(project);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Edit3 size={13} /> 게시글 수정
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-all cursor-pointer"
                  title="프로젝트 삭제"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 2. 상단 E-Commerce / Funding Hero 섹션 (좌측 대표 이미지 + 우측 펀딩 지표 & 구매 박스) */}
        <div className="p-4 sm:p-8 md:p-10 border-b border-slate-200/80 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* 좌측: 대형 썸네일 뷰어 & 썸네일 캐러셀 (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-900 shadow-md group">
                <img
                  src={activeMainImage}
                  alt={project.title}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* 포맷 뱃지 */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
                  <span className="bg-accent-gradient text-white px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider shadow-sm uppercase">
                    TEAM {String(project.teamNumber).padStart(2, "0")}
                  </span>
                  <span className="bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider">
                    {project.landingFormat} 포맷
                  </span>
                </div>

                {project.landingFormat === "HTML" && (
                  <a
                    href={project.landingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3.5 right-3.5 bg-white/95 text-slate-900 hover:bg-blue-600 hover:text-white px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    새 창 열기 <ExternalLink size={13} />
                  </a>
                )}
              </div>

              {/* 썸네일 리스트 (G마켓 서브 썸네일 셀렉터) */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-20 aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        selectedImageIndex === idx
                          ? "border-blue-600 ring-2 ring-blue-100 scale-105"
                          : "border-slate-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Thumb-${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 우측: 펀딩 메트릭 & 투자 CTA 박스 (lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
                  <span className="font-bold text-blue-600">{project.teamName}</span>
                  <span>최종 수정: {project.lastModifiedAt.slice(5)}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 leading-snug tracking-tight mb-3">
                  {project.title}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {project.summary}
                </p>
              </div>

              {/* G마켓 / 와디즈 스타일 실시간 펀딩 현황 지표 카드 */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                        현재 모인 가상 자본
                      </span>
                      <div className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight">
                        {project.totalCredits.toLocaleString()}{" "}
                        <span className="text-sm font-normal text-blue-400">CR</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-mono font-bold text-emerald-400">
                        {fundingRate}%
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 block">달성률</span>
                    </div>
                  </div>

                  {/* 게이지 프로그레스 바 */}
                  <div className="w-full bg-slate-700/80 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-accent-gradient h-full transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min(100, fundingRate)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-slate-300 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Users size={14} className="text-blue-400" />
                      서포터 <strong>{project.investorCount}명</strong> 참여
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      펀딩 LIVE
                    </span>
                  </div>
                </div>
              </div>

              {/* 투자 CTA 버튼 영역 */}
              <div className="space-y-3">
                {isMyTeam || isMyProject ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed flex items-start gap-2.5">
                    <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block mb-0.5">자가 출품작 투자 제한 안내</strong>
                      공정한 평가를 위해 본인이 출품하거나 소속된 팀 프로젝트에는 가상 크레딧 투자가 제한됩니다.
                    </div>
                  </div>
                ) : existingInvestment ? (
                  <div className="space-y-2">
                    <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <CheckCircle2 size={16} className="text-blue-600" />
                        내가 이미 투자한 금액
                      </span>
                      <span className="font-mono text-base font-bold text-blue-700">
                        {existingInvestment.amount.toLocaleString()} CR
                      </span>
                    </div>
                    {event.currentStage === "FUNDING_OPEN" && (
                      <Button
                        variant="primary"
                        isFullWidth
                        size="lg"
                        onClick={() => {
                          onClose();
                          onOpenInvest(project);
                        }}
                      >
                        투자 금액 수정하기 (2,000 ~ 5,000 CR)
                      </Button>
                    )}
                  </div>
                ) : (
                  <div>
                    {event.currentStage === "FUNDING_OPEN" ? (
                      <Button
                        variant="primary"
                        isFullWidth
                        size="lg"
                        onClick={() => {
                          onClose();
                          onOpenInvest(project);
                        }}
                        className="shadow-accent hover:shadow-accent-lg text-base py-3.5"
                      >
                        <Sparkles size={18} className="mr-2" />
                        이 프로젝트에 펀딩하기 (2천 ~ 5천 CR)
                      </Button>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-mono text-center font-semibold">
                        현재 펀딩 진행 시간이 아닙니다.
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* 3. 하단 G마켓 스타일 상세페이지 탭 & 본문 스크롤 영역 */}
        <div className="bg-slate-50/60 flex-1">
          {/* 스틱키 탭 네비게이션 */}
          <div className="sticky top-[57px] z-20 bg-white border-b border-slate-200 px-4 sm:px-8 flex space-x-1 sm:space-x-4 shadow-sm">
            <button
              onClick={() => setActiveTab("detail")}
              className={`py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "detail"
                  ? "border-blue-600 text-blue-600 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              📄 결과물 상세페이지
            </button>
            <button
              onClick={() => setActiveTab("story")}
              className={`py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "story"
                  ? "border-blue-600 text-blue-600 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              💡 프로젝트 스토리
            </button>
            <button
              onClick={() => setActiveTab("team")}
              className={`py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "team"
                  ? "border-blue-600 text-blue-600 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              👥 팀 및 출품 정보
            </button>
            <button
              onClick={() => setActiveTab("supporters")}
              className={`py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "supporters"
                  ? "border-blue-600 text-blue-600 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              📊 서포터 목록 ({projectSupporters.length})
            </button>
          </div>

          {/* 탭 1: 결과물 상세페이지 (G마켓 스타일 세로 긴 상세 뷰어) */}
          {activeTab === "detail" && (
            <div className="p-4 sm:p-8 md:p-12 max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-8 space-y-6">
                
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileText size={18} className="text-blue-600" />
                    {project.landingFormat === "IMAGE" ? "고해상도 상세 설명 이미지 (연속 뷰)" : `${project.landingFormat} 공식 결과물`}
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    FORMAT: {project.landingFormat}
                  </span>
                </div>

                {/* IMAGE 포맷: G마켓처럼 세로로 시원하게 이어지는 실물 상세페이지 롤링 */}
                {project.landingFormat === "IMAGE" && (
                  <div className="space-y-0 max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                    {(project.landingImages && project.landingImages.length > 0 ? project.landingImages : [project.landingUrl]).map((imgUrl, idx) => (
                      <div key={idx} className="relative bg-slate-100">
                        <img
                          src={imgUrl}
                          alt={`상세페이지 파트 ${idx + 1}`}
                          className="w-full h-auto block object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-slate-900/70 text-white font-mono text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                          PAGE {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* PDF 포맷: 웹 내장 PDF 뷰어 */}
                {project.landingFormat === "PDF" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-500">PDF 프레젠테이션 문서 열람</span>
                      <a
                        href={project.landingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <Maximize2 size={13} /> 새 창 전체화면 열기
                      </a>
                    </div>
                    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 h-[650px]">
                      <iframe
                        src={project.landingUrl}
                        className="w-full h-full"
                        title="PDF Document Viewer"
                      />
                    </div>
                  </div>
                )}

                {/* HTML 포맷: 웹페이지 임베드 */}
                {project.landingFormat === "HTML" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-500">인터랙티브 웹페이지 시연</span>
                      <a
                        href={project.landingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <ExternalLink size={13} /> 외부 웹사이트 바로가기
                      </a>
                    </div>
                    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white h-[650px]">
                      <iframe
                        src={project.landingUrl}
                        sandbox="allow-same-origin allow-scripts allow-popups"
                        className="w-full h-full"
                        title="Interactive HTML Prototype"
                      />
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* 탭 2: 프로젝트 스토리 */}
          {activeTab === "story" && (
            <div className="p-4 sm:p-8 md:p-12 max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-6">
                <h3 className="font-display text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                  프로젝트 기획 및 개발 배경
                </h3>
                <div className="text-sm md:text-base font-sans text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
                  {project.description || "등록된 상세 스토리 내용이 없습니다."}
                </div>
              </div>
            </div>
          )}

          {/* 탭 3: 팀 및 출품 정보 */}
          {activeTab === "team" && (
            <div className="p-4 sm:p-8 md:p-12 max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-6">
                <h3 className="font-display text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                  출품 팀 및 관리 정보
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 block mb-1">소속 팀</span>
                    <strong className="text-sm text-slate-800">{project.teamName} (TEAM {project.teamNumber})</strong>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 block mb-1">출품 등록자</span>
                    <strong className="text-sm text-slate-800">{project.authorName || project.lastModifierName || "학생 참가자"}</strong>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 block mb-1">최종 수정 일시</span>
                    <strong className="text-sm text-slate-800">{project.lastModifiedAt}</strong>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 block mb-1">출품 포맷</span>
                    <strong className="text-sm text-slate-800">{project.landingFormat} LANDING</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 탭 4: 서포터 목록 */}
          {activeTab === "supporters" && (
            <div className="p-4 sm:p-8 md:p-12 max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-4">
                <h3 className="font-display text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                  펀딩에 참여한 서포터 ({projectSupporters.length}명)
                </h3>

                {projectSupporters.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    아직 참여한 투자자가 없습니다. 첫 번째 서포터가 되어보세요!
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {projectSupporters.map((supporter) => (
                      <div key={supporter.id} className="py-3 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px]">
                            {supporter.investorName.charAt(0)}
                          </span>
                          <span className="font-semibold text-slate-800">{supporter.investorName}</span>
                          <span className="text-slate-400 text-[10px]">{supporter.createdAt}</span>
                        </div>
                        <span className="font-bold text-blue-600">
                          {supporter.amount.toLocaleString()} CR
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
