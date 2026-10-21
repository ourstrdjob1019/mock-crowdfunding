"use client";

import React, { useState, useEffect } from "react";
import { Project, LandingFormat, ProjectCategory } from "@/types";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { uploadThumbnail, uploadLandingFile } from "@/lib/supabase";
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Globe, 
  Trash2, 
  Plus, 
  AlertCircle,
  Sparkles,
  Link as LinkIcon
} from "lucide-react";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editProject?: Project | null;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  editProject,
}) => {
  const { currentUser, createProject, updateProject, deleteProject } = useApp();

  const isEditing = Boolean(editProject);

  const [title, setTitle] = useState("");
  const [teamName, setTeamName] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProjectCategory>("AI/SaaS");
  const [targetCredits, setTargetCredits] = useState<number>(20000);
  const [highlight1, setHighlight1] = useState("");
  const [highlight2, setHighlight2] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [landingFormat, setLandingFormat] = useState<LandingFormat>("IMAGE");
  const [landingUrl, setLandingUrl] = useState("");
  const [landingImages, setLandingImages] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadStatus, setUploadStatus] = useState<string>("");

  useEffect(() => {
    if (editProject) {
      setTitle(editProject.title);
      setTeamName(editProject.teamName);
      setSummary(editProject.summary);
      setDescription(editProject.description);
      setCategory(editProject.category || "AI/SaaS");
      setTargetCredits(editProject.targetCredits || 20000);
      setHighlight1(editProject.pitchHighlights?.[0] || "");
      setHighlight2(editProject.pitchHighlights?.[1] || "");
      setThumbnailUrl(editProject.thumbnailUrl);
      setLandingFormat(editProject.landingFormat);
      setLandingUrl(editProject.landingUrl);
      setLandingImages(editProject.landingImages || [editProject.landingUrl]);
    } else {
      // 신규 등록 기본값
      setTitle("");
      setTeamName(currentUser?.teamName || `${currentUser?.name || "학생"} 팀`);
      setSummary("");
      setDescription("");
      setCategory("AI/SaaS");
      setTargetCredits(20000);
      setHighlight1("");
      setHighlight2("");
      setThumbnailUrl("https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80");
      setLandingFormat("IMAGE");
      setLandingUrl("");
      setLandingImages([]);
    }
    setErrorMessage("");
  }, [editProject, currentUser, isOpen]);

  if (!isOpen) return null;

  // 1. 대표 썸네일 파일 업로드 처리
  const handleThumbnailFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus("썸네일 이미지 처리 중...");
    // 1차: FileReader로 즉각적인 base64 미리보기 적용
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setThumbnailUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);

    // 2차: Supabase Storage 업로드 시도 (설정된 경우)
    try {
      const res = await uploadThumbnail(file);
      if (res.url) {
        setThumbnailUrl(res.url);
      } else if (res.error) {
        setErrorMessage(`⚠️ Storage 업로드 실패: ${res.error} (제공된 fix_all.sql 실행 후 다시 시도해 주세요. 현재는 로컬 미리보기로 저장됩니다)`);
      }
    } catch (err: any) {
      setErrorMessage(`⚠️ 업로드 중 예외 발생: ${err.message || err}`);
    } finally {
      setUploadStatus("");
    }
  };

  // 2. 상세 이미지 다중 업로드 처리 (G마켓 스타일 세로 상세페이지)
  const handleDetailImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadStatus("상세 이미지 로딩 및 업로드 중...");
    const newImageUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const dataUrl = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.readAsDataURL(file);
      });
      newImageUrls.push(dataUrl);

      // Supabase 업로드 병행
      try {
        const res = await uploadLandingFile(file);
        if (res.url) {
          newImageUrls[newImageUrls.length - 1] = res.url;
        } else if (res.error) {
          setErrorMessage(`⚠️ 상세이미지 Storage 업로드 오류: ${res.error}`);
        }
      } catch {
        // base64 유지
      }
    }

    setLandingImages((prev) => [...prev, ...newImageUrls]);
    if (!landingUrl && newImageUrls.length > 0) {
      setLandingUrl(newImageUrls[0]);
    }
    setUploadStatus("");
  };

  // 3. PDF 파일 업로드 처리
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus("PDF 문서 처리 중...");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLandingUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);

    try {
      const res = await uploadLandingFile(file);
      if (res.url) {
        setLandingUrl(res.url);
      } else if (res.error) {
        setErrorMessage(`⚠️ PDF Storage 업로드 오류: ${res.error}`);
      }
    } catch (err: any) {
      setErrorMessage(`⚠️ PDF 업로드 예외: ${err.message}`);
    } finally {
      setUploadStatus("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("프로젝트 제목을 입력해 주세요.");
      return;
    }

    if (!thumbnailUrl.trim()) {
      setErrorMessage("대표 썸네일 이미지를 등록해 주세요.");
      return;
    }

    let finalLandingUrl = landingUrl;
    let finalLandingImages = landingImages;

    if (landingFormat === "IMAGE") {
      if (landingImages.length === 0 && !landingUrl) {
        setErrorMessage("상세페이지 이미지를 1장 이상 등록하거나 URL을 입력해 주세요.");
        return;
      }
      finalLandingUrl = landingUrl || landingImages[0] || thumbnailUrl;
      if (finalLandingImages.length === 0) {
        finalLandingImages = [finalLandingUrl];
      }
    } else if (landingFormat === "PDF") {
      if (!landingUrl.trim()) {
        setErrorMessage("PDF 문서를 업로드하거나 PDF URL을 입력해 주세요.");
        return;
      }
    } else if (landingFormat === "HTML") {
      if (!landingUrl.trim()) {
        setErrorMessage("시연 웹페이지 URL(HTML)을 입력해 주세요.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const highlights = [highlight1, highlight2].filter(Boolean);
      if (highlights.length === 0) {
        highlights.push("2026 데모데이 출품작 및 시장 검증 진행");
      }

      if (isEditing && editProject) {
        const res = await updateProject({
          id: editProject.id,
          title: title.trim(),
          teamName: teamName.trim() || editProject.teamName,
          summary: summary.trim(),
          description: description.trim(),
          category,
          targetCredits: Number(targetCredits) || 20000,
          pitchHighlights: highlights,
          thumbnailUrl: thumbnailUrl.trim(),
          landingFormat,
          landingUrl: finalLandingUrl,
          landingImages: finalLandingImages,
        });

        setIsSubmitting(false);
        if (!res.success) {
          setErrorMessage(res.message);
        } else {
          onClose();
        }
      } else {
        const res = await createProject({
          teamId: currentUser?.teamId || `team-${Date.now().toString().slice(-4)}`,
          teamName: teamName.trim() || `${currentUser?.name} 팀`,
          teamNumber: 1, // AppContext에서 자동 계산
          title: title.trim(),
          summary: summary.trim(),
          description: description.trim(),
          category,
          targetCredits: Number(targetCredits) || 20000,
          pitchHighlights: highlights,
          thumbnailUrl: thumbnailUrl.trim(),
          landingFormat,
          landingUrl: finalLandingUrl,
          landingImages: finalLandingImages,
        });

        setIsSubmitting(false);
        if (!res.success) {
          setErrorMessage(res.message);
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || "프로젝트 저장 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!editProject) return;
    if (confirm("정말로 이 프로젝트를 삭제하시겠습니까? 관련 펀딩 내역도 함께 정리됩니다.")) {
      const res = await deleteProject(editProject.id);
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl border border-slate-200/90 w-full max-w-3xl relative shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* 모달 헤더 */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-gradient text-white flex items-center justify-center shadow-accent">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 leading-tight">
                {isEditing ? "프로젝트 게시글 수정" : "새 프로젝트 출품 등록"}
              </h2>
              <p className="text-[11px] font-mono text-slate-500">
                작성자: <strong>{currentUser?.name}</strong> ({currentUser?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
                title="프로젝트 삭제"
              >
                <Trash2 size={16} /> <span className="hidden sm:inline">삭제</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 폼 본문 (스크롤 영역) */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {uploadStatus && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>{uploadStatus}</span>
            </div>
          )}

          {/* 1. 기본 정보 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                프로젝트(출품작) 제목 *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 뉴로보이스 — 인공지능 기반 실시간 음성 합성 디바이스"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                팀명 *
              </label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="예: 팀 뉴로보이스"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              한 줄 요약 (프로젝트 핵심 설명)
            </label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="예: 루게릭병 환자를 위한 초소형 이어셋과 온디바이스 생성 AI 보조공학 솔루션"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            />
          </div>

          {/* 분야 및 목표 크레딧 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                혁신 분야 카테고리 *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none bg-white cursor-pointer"
              >
                <option value="AI/SaaS">AI/SaaS</option>
                <option value="Bio/Health">Bio/Health</option>
                <option value="FinTech">FinTech</option>
                <option value="GreenTech">GreenTech</option>
                <option value="Robotics">Robotics</option>
                <option value="EdTech">EdTech</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                목표 펀딩 크레딧 (CR) *
              </label>
              <input
                type="number"
                min={10000}
                step={5000}
                value={targetCredits}
                onChange={(e) => setTargetCredits(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              상세 소개 글 (마크다운 / 텍스트)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="프로젝트의 기획 배경, 핵심 기술력, 펀딩 목적을 자세히 작성해 주세요."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none leading-relaxed"
            />
          </div>

          {/* 핵심 성과 피치 하이라이트 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                핵심 성과 1
              </label>
              <input
                type="text"
                value={highlight1}
                onChange={(e) => setHighlight1(e.target.value)}
                placeholder="예: 국내외 특허 2건 출원 완료"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                핵심 성과 2
              </label>
              <input
                type="text"
                value={highlight2}
                onChange={(e) => setHighlight2(e.target.value)}
                placeholder="예: 사전 사용자 테스트 1,000명 확보"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>


          {/* 2. 대표 썸네일 이미지 업로드 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-800">
                대표 썸네일 이미지 *
              </label>
              <span className="text-[11px] font-mono text-slate-400">권장: 16:10 또는 4:3 비율</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-40 aspect-[16/10] bg-slate-200 rounded-xl overflow-hidden border border-slate-300 shrink-0 relative">
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                    <ImageIcon size={24} />
                    <span>미리보기</span>
                  </div>
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-600 cursor-pointer shadow-sm transition-all">
                  <Upload size={14} /> 썸네일 이미지 파일 선택
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="text-[11px] text-slate-500 font-mono">또는 외부 이미지 URL 직접 입력:</div>
                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. 상세 랜딩페이지 포맷 선택 (IMAGE / PDF / HTML) */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-800">
              상세 랜딩페이지 포맷 (G마켓 스타일 결과물 제공 방식) *
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLandingFormat("IMAGE")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  landingFormat === "IMAGE"
                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <ImageIcon size={16} /> 이미지 (IMAGE)
              </button>

              <button
                type="button"
                onClick={() => setLandingFormat("PDF")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  landingFormat === "PDF"
                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FileText size={16} /> PDF 문서 (PDF)
              </button>

              <button
                type="button"
                onClick={() => setLandingFormat("HTML")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  landingFormat === "HTML"
                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Globe size={16} /> 웹페이지 (HTML)
              </button>
            </div>

            {/* 포맷별 파일/URL 입력 */}
            {landingFormat === "IMAGE" && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-blue-600" /> 세로형 상세페이지 이미지 등록 (G마켓 스타일)
                  </span>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer shadow-sm transition-all">
                    <Plus size={14} /> 이미지 파일 추가
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleDetailImagesUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <p className="text-[11px] text-slate-500">
                  G마켓 상품 설명처럼 세로로 길게 이어지는 고해상도 상세 이미지들을 순서대로 등록할 수 있습니다.
                </p>

                {landingImages.length > 0 ? (
                  <div className="space-y-2">
                    {landingImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 gap-3"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <img src={img} alt={`detail-${idx}`} className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0" />
                          <span className="font-mono text-xs text-slate-600 truncate">{img.slice(0, 50)}...</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLandingImages(landingImages.filter((_, i) => i !== idx))}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center border border-dashed border-slate-300 rounded-xl bg-white">
                    <p className="text-xs text-slate-500">등록된 상세 이미지가 없습니다. [이미지 파일 추가]를 눌러 업로드하세요.</p>
                  </div>
                )}
              </div>
            )}

            {landingFormat === "PDF" && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-600" /> PDF 문서 등록 (웹 뷰어 임베드)
                </span>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-600 cursor-pointer shadow-sm transition-all shrink-0">
                    <Upload size={14} /> PDF 파일 선택
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      value={landingUrl}
                      onChange={(e) => setLandingUrl(e.target.value)}
                      placeholder="또는 PDF URL 입력 (예: https://.../document.pdf)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

                {landingUrl && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2">
                    <FileText size={14} className="text-emerald-600 shrink-0" />
                    <span className="truncate">연결된 PDF: {landingUrl.slice(0, 60)}...</span>
                  </div>
                )}
              </div>
            )}

            {landingFormat === "HTML" && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Globe size={14} className="text-blue-600" /> 인터랙티브 웹페이지 URL 등록
                </span>

                <div className="relative">
                  <LinkIcon size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="url"
                    value={landingUrl}
                    onChange={(e) => setLandingUrl(e.target.value)}
                    placeholder="https://my-project-demo.vercel.app 또는 노션 포트폴리오 URL"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  사용자가 프로젝트를 열었을 때 안전한 iframe 환경에서 실제 웹페이지가 렌더링됩니다.
                </p>
              </div>
            )}
          </div>

          {/* 저장 및 닫기 버튼 */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {isEditing ? "수정사항 저장하기" : "프로젝트 출품 완료"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
