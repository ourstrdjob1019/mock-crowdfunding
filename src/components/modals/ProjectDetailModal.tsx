"use client";

import React, { useState } from "react";
import { Project } from "@/types";
import { useApp } from "@/context/AppContext";
import {
  X,
  Lock,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
  FileText,
  Globe,
  Image as ImageIcon,
  Edit3,
  Trash2,
  ExternalLink,
} from "lucide-react";
import confetti from "canvas-confetti";

const formatWebUrl = (url?: string): string => {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onOpenInvest?: (project: Project) => void;
  onOpenEdit?: (project: Project) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onOpenEdit,
}) => {
  const {
    event,
    currentUser,
    remainingCredits,
    invest,
    addComment,
    deleteProject,
  } = useApp();

  const [investmentSliderVal, setInvestmentSliderVal] = useState<number>(2000);
  const [commentInput, setCommentInput] = useState<string>("");
  const [pdfSlideIndex, setPdfSlideIndex] = useState<number>(0);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  if (!project || !currentUser) return null;

  const isOwned = Boolean(
    project.isUserProject ||
      (currentUser.teamId && currentUser.teamId === project.teamId) ||
      currentUser.id === project.authorId
  );

  const canEdit = isOwned || currentUser.role === "ADMIN";
  const targetCredits = project.targetCredits || 20000;
  const progressPct = Math.round((project.totalCredits / targetCredits) * 100);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3000);
  };

  const handleInvestment = async (amount: number) => {
    if (event.currentStage !== "FUNDING_OPEN") {
      showToast("현재 단계에서는 모의투자를 진행할 수 없습니다.");
      return;
    }

    if (isOwned) {
      showToast("⚠️ 본인이 출품한 프로젝트에는 투자할 수 없습니다 (자가 투자 방지 정책).");
      return;
    }

    if (amount > remainingCredits) {
      showToast("잔여 모의투자 크레딧이 부족합니다.");
      return;
    }

    const result = await invest(project.id, amount);
    if (result.success) {
      confetti({
        particleCount: 50,
        spread: 60,
        colors: ["#3B82F6", "#06B6D4", "#F59E0B"],
      });
      showToast(result.message);
    } else {
      showToast(result.message);
    }
  };

  const handleAddCommentSubmit = async () => {
    if (!commentInput.trim()) return;
    const res = await addComment(project.id, commentInput);
    if (res.success) {
      setCommentInput("");
      showToast("💬 응원 댓글이 등록되었습니다.");
    }
  };

  const handleDelete = async () => {
    if (confirm("정말로 이 출품작을 삭제하시겠습니까?")) {
      const res = await deleteProject(project.id);
      if (res.success) {
        onClose();
      } else {
        alert(res.message);
      }
    }
  };

  // 슬라이드 데이터 기본 폴백
  const pdfSlides = project.pdfSlides || [
    {
      title: "SLIDE 01: " + project.title,
      subtitle: project.summary,
      content: project.description,
      keyMetrics: [
        `목표: ${targetCredits.toLocaleString()} CR`,
        `팀: ${project.teamName}`,
        `분야: ${project.category || "혁신 스타트업"}`,
      ],
    },
    {
      title: "SLIDE 02: 핵심 기술 및 비즈니스 모델",
      subtitle: "독자적 기술 경쟁력과 시장 침투 전략",
      content: "대학 연구실 원천 특허 및 시장 검증 데이터를 기반으로 빠르게 수익을 창출하는 비즈니스 구조를 구축했습니다.",
      keyMetrics: ["시장 침투율 연 35%", "특허 등록 완료", "사전 고객 검증"],
    },
  ];

  const detailImages = project.detailImages && project.detailImages.length > 0
    ? project.detailImages
    : (project.landingImages && project.landingImages.length > 0 ? project.landingImages : [project.thumbnailUrl]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      
      {/* Toast Notice */}
      {toastNotice && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] px-4 sm:px-5 py-2.5 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <span>{toastNotice}</span>
        </div>
      )}

      <div className="bg-white w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh] animate-in fade-in duration-200">
        
        {/* Top Modal Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 flex items-center justify-between gap-2 bg-slate-50/70">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-blue-600 text-white font-bold text-[11px] sm:text-xs shrink-0">
              Team {String(project.teamNumber).padStart(2, "0")}
            </span>
            <span className="font-semibold text-xs text-slate-700 line-clamp-1">
              {project.teamName} · {project.category || "스타트업"}
            </span>
            <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono font-bold shrink-0">
              {project.landingFormat}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {canEdit && (
              <div className="flex items-center gap-1 mr-1">
                {onOpenEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenEdit(project);
                    }}
                    className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition cursor-pointer flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">수정</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">삭제</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split Layout (65% Scrollable Left + 35% Sticky Right) */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
          
          {/* ----------------------------------------------------
              LEFT CONTENT (65% Scrollable + Copyright Protection)
              ---------------------------------------------------- */}
          <div
            onContextMenu={(e) => {
              e.preventDefault();
              showToast("🔒 저작권 보호를 위해 우클릭 및 이미지 저장이 제한됩니다.");
            }}
            className="lg:w-[65%] p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-200 select-none overflow-y-auto space-y-5 sm:space-y-6"
          >
            {/* Copyright Protection Notice Banner */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] sm:text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
                <span>2026 DEMODAY 저작권 보호 구역 · 무단 복제 및 캡처 금지</span>
              </div>
              <span className="text-[10px] text-amber-700 font-mono font-bold self-end sm:self-auto">PROTECTED</span>
            </div>

            {/* Title & Summary */}
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                {project.title}
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Pitch Highlights Card */}
            {project.pitchHighlights && project.pitchHighlights.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  핵심 피치 하이라이트 (Key Highlights)
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {project.pitchHighlights.map((hl, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* FORMAT-SPECIFIC VIEWER */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  {project.landingFormat === "IMAGE" && <ImageIcon className="w-4 h-4 text-emerald-600" />}
                  {project.landingFormat === "PDF" && <FileText className="w-4 h-4 text-indigo-600" />}
                  {(project.landingFormat === "WEB" || project.landingFormat === "HTML") && <Globe className="w-4 h-4 text-cyan-600" />}
                  <span>출품 자료 상세 뷰어 ({project.landingFormat === "HTML" ? "WEB/HTML" : project.landingFormat})</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">2026 DEMODAY VIEWER</span>
              </h3>

              {/* 1. IMAGE FORMAT: E-Commerce / Wadiz Vertical Scroll Strip */}
              {project.landingFormat === "IMAGE" && (
                <div className="space-y-3 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 p-2">
                  <div className="text-[11px] text-center text-slate-500 py-1 font-medium">
                    ▼ 스크롤하여 상세 IR 인포그래픽을 확인하세요
                  </div>
                  {detailImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden shadow-2xs">
                      <img
                        src={imgUrl}
                        alt={`상세 ${idx + 1}`}
                        className="w-full object-cover pointer-events-none"
                      />
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
                        SECTION {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. PDF FORMAT: 실제 업로드된 PDF 파일 임베드 뷰어 */}
              {project.landingFormat === "PDF" && (
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs space-y-3">
                  {/* PDF 상단 컨트롤 바 */}
                  <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-xs text-slate-800">
                        출품 IR 피치덱 문서 (PDF)
                      </span>
                    </div>

                    {project.landingUrl && (
                      <a
                        href={project.landingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>새 탭에서 전체화면 보기 / 다운로드</span>
                      </a>
                    )}
                  </div>

                  {/* 실제 PDF 파일 렌더링 */}
                  {project.landingUrl ? (
                    <div className="p-2 sm:p-3 space-y-2">
                      <div className="relative w-full h-[550px] sm:h-[720px] rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner">
                        <iframe
                          src={`${project.landingUrl}#toolbar=1&navpanes=1`}
                          title={`${project.title} PDF Document`}
                          className="w-full h-full border-0"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 text-center py-1">
                        ※ 브라우저나 모바일 기기에 따라 인앱 뷰어가 제한될 경우 상단의 [새 탭에서 전체화면 보기]를 눌러 열람하세요.
                      </p>
                    </div>
                  ) : (
                    /* Fallback: 가상 슬라이드 뷰어 */
                    <div className="rounded-xl border border-slate-200 bg-slate-900 text-white p-5 space-y-4 m-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
                        <span className="font-mono">PDF Slide Preview</span>
                        <span>{pdfSlideIndex + 1} / {pdfSlides.length} Slides</span>
                      </div>
                      {pdfSlides[pdfSlideIndex] && (
                        <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700 space-y-3">
                          <div className="text-amber-400 font-mono text-xs font-bold">
                            {pdfSlides[pdfSlideIndex].title}
                          </div>
                          <div className="text-sm font-bold text-white">
                            {pdfSlides[pdfSlideIndex].subtitle}
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {pdfSlides[pdfSlideIndex].content}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          disabled={pdfSlideIndex === 0}
                          onClick={() => setPdfSlideIndex((prev) => Math.max(0, prev - 1))}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" /> 이전
                        </button>
                        <button
                          type="button"
                          disabled={pdfSlideIndex >= pdfSlides.length - 1}
                          onClick={() => setPdfSlideIndex((prev) => prev + 1)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          다음 <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. WEB / HTML FORMAT: 실제 인터랙티브 웹페이지 iframe 뷰어 */}
              {(project.landingFormat === "WEB" || project.landingFormat === "HTML") && (
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                  {/* Browser address bar */}
                  <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="flex-1 bg-white px-3 py-1 rounded-md text-[11px] font-mono text-slate-700 border border-slate-200 truncate flex items-center justify-between">
                        <span className="truncate">{formatWebUrl(project.landingUrl || project.webDemoUrl) || "https://..."}</span>
                        <span className="text-[10px] text-emerald-600 font-bold shrink-0 ml-2">LIVE DEMO</span>
                      </div>
                    </div>

                    {/* 새 탭에서 열기 버튼 */}
                    {formatWebUrl(project.landingUrl || project.webDemoUrl) && (
                      <a
                        href={formatWebUrl(project.landingUrl || project.webDemoUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>새 탭에서 사이트 열기</span>
                      </a>
                    )}
                  </div>

                  {/* 실제 웹페이지 iframe 렌더링 */}
                  <div className="p-2 sm:p-3 space-y-2">
                    {formatWebUrl(project.landingUrl || project.webDemoUrl) ? (
                      <div className="relative w-full h-[550px] sm:h-[650px] rounded-xl overflow-hidden border border-slate-200 bg-white shadow-inner">
                        <iframe
                          src={formatWebUrl(project.landingUrl || project.webDemoUrl)}
                          title={`${project.title} Web Prototype`}
                          className="w-full h-full border-0"
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                        />
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <Globe className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-semibold text-slate-600">등록된 웹페이지 URL이 없습니다.</p>
                      </div>
                    )}

                    {/* 보안 정책(X-Frame-Options) 안내 배너 */}
                    <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <span className="text-slate-600">
                        💡 외부 사이트의 보안 정책(X-Frame-Options)으로 인해 인앱 뷰어가 차단될 경우 우측의 <strong>새 탭에서 사이트 열기</strong>를 클릭하세요.
                      </span>
                      {formatWebUrl(project.landingUrl || project.webDemoUrl) && (
                        <a
                          href={formatWebUrl(project.landingUrl || project.webDemoUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 font-bold underline shrink-0 hover:text-blue-900"
                        >
                          직접 사이트 방문하기 ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Team Members */}
            {project.teamMembers && project.teamMembers.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900">팀 구성원 (Founding Team)</h3>
                <div className="flex flex-wrap gap-2">
                  {project.teamMembers.map((mem, mi) => (
                    <div key={mi} className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs text-slate-800 flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{mem.name}</span>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-500 text-[11px]">{mem.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cheering Comments & Discussion */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>응원 및 심사의견 ({project.comments?.length || 0})</span>
                <span className="text-[11px] text-slate-400 font-normal">건전한 피드백을 남겨주세요</span>
              </h3>

              {/* Comment Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="프로젝트를 향한 응원 또는 질문을 남겨주세요..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddCommentSubmit();
                  }}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={handleAddCommentSubmit}
                  className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Send className="w-3 h-3" />
                  등록
                </button>
              </div>

              {/* Comment list */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(project.comments && project.comments.length > 0) ? (
                  project.comments.map((cm) => (
                    <div key={cm.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-bold">
                          {cm.author} <span className="text-slate-400 font-normal">({cm.team})</span>
                          {cm.amount && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold font-mono text-[10px]">
                              +{cm.amount.toLocaleString()} CR 투자
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{cm.timestamp}</span>
                      </div>
                      <p className="text-slate-600 mt-1">{cm.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-3 text-center">첫 번째 응원 댓글을 남겨보세요!</p>
                )}
              </div>
            </div>

          </div>

          {/* ----------------------------------------------------
              RIGHT STICKY INVESTMENT WIDGET (35%)
              ---------------------------------------------------- */}
          <div className="lg:w-[35%] p-4 sm:p-6 bg-slate-50/50 flex flex-col justify-between gap-5 sm:gap-6">
            
            <div className="space-y-5">
              <div>
                <span className="text-xs font-semibold text-slate-500">모의 크라우드펀딩 진행 현황</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-extrabold font-mono text-slate-900">
                    {project.totalCredits.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-blue-600">CR</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                  <span className="font-bold text-blue-600 font-mono text-sm">
                    {progressPct}% 달성
                  </span>
                  <span>목표 {targetCredits.toLocaleString()} CR</span>
                </div>

                {/* Progress track */}
                <div className="w-full bg-slate-200 rounded-full h-2.5 mt-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, progressPct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mt-2 font-mono">
                  <span>총 {project.investorCount}명 모의투자 참여</span>
                  <span>1회 한도 5,000 CR</span>
                </div>
              </div>

              {/* STRICT SELF-INVESTMENT BLOCK CHECK */}
              {isOwned ? (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300/80 text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>자가 투자 방지 정책 (Self-Investment Block)</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    ⚠️ 본인이 출품한 프로젝트에는 투자할 수 없습니다. 타 팀의 혁신 아이템을 둘러보고 분산 투자하세요.
                  </p>
                  <div className="text-[10px] text-amber-700 font-mono pt-1">
                    소속: {currentUser.teamName || "내 팀"}
                  </div>
                </div>
              ) : (
                /* NORMAL INVESTMENT FLOW */
                <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">투자 금액 선택</span>
                    <span className="text-xs font-mono font-bold text-blue-600">
                      {investmentSliderVal.toLocaleString()} CR
                    </span>
                  </div>

                  {/* Slider 2,000 to 5,000 CR (Step 1,000) */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min={2000}
                      max={5000}
                      step={1000}
                      value={investmentSliderVal}
                      onChange={(e) => setInvestmentSliderVal(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>2,000 CR</span>
                      <span>3,000 CR</span>
                      <span>4,000 CR</span>
                      <span>5,000 CR</span>
                    </div>
                  </div>

                  {/* Quick preset buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {[2000, 3000, 5000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setInvestmentSliderVal(preset)}
                        className={`py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer border ${
                          investmentSliderVal === preset
                            ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        +{preset.toLocaleString()} CR
                      </button>
                    ))}
                  </div>

                  {/* Live remaining credits calculation */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>현재 내 잔여 지갑:</span>
                      <span className="font-mono font-semibold text-slate-800">{remainingCredits.toLocaleString()} CR</span>
                    </div>
                    <div className="flex justify-between text-slate-700 font-bold pt-1 border-t border-slate-200">
                      <span>투자 후 잔여 예상:</span>
                      <span className={`font-mono ${remainingCredits - investmentSliderVal < 0 ? "text-rose-600" : "text-blue-600"}`}>
                        {(remainingCredits - investmentSliderVal).toLocaleString()} CR
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    type="button"
                    disabled={
                      event.currentStage !== "FUNDING_OPEN" ||
                      remainingCredits < investmentSliderVal
                    }
                    onClick={() => handleInvestment(investmentSliderVal)}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{investmentSliderVal.toLocaleString()} CR 모의투자 참여하기</span>
                  </button>

                  {remainingCredits < investmentSliderVal && (
                    <p className="text-[11px] text-rose-500 text-center font-medium">
                      잔여 크레딧이 부족합니다. 좌측 지갑 리필을 이용하세요.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 text-center">
              CROWDFUND 2026 데모데이 심사 보안 규정을 준수합니다.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
