"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { LandingFormat } from "@/types";
import { CheckCircle2, Lock, FolderGit2, AlertCircle } from "lucide-react";

export const TeamProjectManager: React.FC = () => {
  const { currentUser, projects, updateProject, event } = useApp();
  const myTeamProject = projects.find((p) => p.teamId === currentUser?.teamId);

  const isLocked = event.currentStage === "FUNDING_OPEN" || event.currentStage === "FUNDING_CLOSED" || event.currentStage === "RANKING_PUBLISHED";

  const [title, setTitle] = useState(myTeamProject?.title || "");
  const [summary, setSummary] = useState(myTeamProject?.summary || "");
  const [description, setDescription] = useState(myTeamProject?.description || "");
  const [landingFormat, setLandingFormat] = useState<LandingFormat>(myTeamProject?.landingFormat || "IMAGE");
  const [thumbnailUrl, setThumbnailUrl] = useState(myTeamProject?.thumbnailUrl || "");
  const [landingUrl, setLandingUrl] = useState(myTeamProject?.landingUrl || "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!currentUser?.teamId) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center font-mono text-sm text-slate-500">
        소속된 팀이 없습니다. (심사위원 또는 관리자 계정입니다)
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      alert("펀딩 단계가 시작된 이후에는 평가의 공정성을 위해 프로젝트를 수정할 수 없습니다.");
      return;
    }

    if (myTeamProject) {
      await updateProject({
        id: myTeamProject.id,
        title,
        summary,
        description,
        landingFormat,
        thumbnailUrl: thumbnailUrl || myTeamProject.thumbnailUrl,
        landingUrl: landingUrl || myTeamProject.landingUrl,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-10 shadow-sm space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-[11px] font-bold uppercase tracking-wider">
            <FolderGit2 size={12} /> TEAM REPOSITORY
          </div>
          {isLocked && (
            <span className="bg-slate-900 text-white px-3 py-1 rounded-full font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Lock size={12} className="text-amber-400" /> 프로젝트 수정 잠김 (펀딩 진행 중)
            </span>
          )}
        </div>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 tracking-tight mt-2">
          우리 팀 프로젝트 관리 ({myTeamProject?.teamName})
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          같은 팀원 누구나 등록·수정할 수 있으며, 마지막 저장 시 수정자와 시각이 자동으로 기록됩니다.
        </p>
      </div>

      {myTeamProject && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-600 flex justify-between">
          <span>마지막 수정자: <strong className="text-slate-900">{myTeamProject.lastModifierName}</strong></span>
          <span>수정 시각: <strong className="text-slate-900">{myTeamProject.lastModifiedAt}</strong></span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
            프로젝트 제목 (Title) *
          </label>
          <input
            type="text"
            required
            disabled={isLocked}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 font-display text-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none disabled:bg-slate-100"
            placeholder="팀의 대표 프로젝트 명칭을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
            한 줄 소개글 (Summary) *
          </label>
          <input
            type="text"
            required
            disabled={isLocked}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none disabled:bg-slate-100"
            placeholder="갤러리 카드에 노출될 핵심 한 줄 설명"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
            상세 설명 (Description)
          </label>
          <textarea
            rows={5}
            disabled={isLocked}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none disabled:bg-slate-100"
            placeholder="프로젝트의 문제 정의 및 해결 솔루션을 상세히 기술하세요"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
              랜딩페이지 파일 형식 (Landing Format)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["IMAGE", "PDF", "HTML"] as LandingFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  disabled={isLocked}
                  onClick={() => setLandingFormat(fmt)}
                  className={`py-2.5 rounded-xl border font-mono text-xs font-bold uppercase transition-all ${
                    landingFormat === fmt
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
              대표 썸네일 이미지 URL
            </label>
            <input
              type="text"
              disabled={isLocked}
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none disabled:bg-slate-100"
              placeholder="https://..."
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
            랜딩페이지 소스 URL ({landingFormat})
          </label>
          <input
            type="text"
            disabled={isLocked}
            value={landingUrl}
            onChange={(e) => setLandingUrl(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none disabled:bg-slate-100"
            placeholder={
              landingFormat === "IMAGE"
                ? "고화질 랜딩 이미지 URL (Supabase Storage 등)"
                : landingFormat === "PDF"
                ? "PDF 문서 URL"
                : "단일 HTML 파일 URL"
            }
          />
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
          {savedSuccess ? (
            <span className="font-mono text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 size={16} /> 프로젝트가 성공적으로 저장되었습니다.
            </span>
          ) : (
            <span className="font-mono text-xs text-slate-400">
              {isLocked ? "현재 단계에서는 수정이 잠겨 있습니다." : "저장 시 즉시 갤러리에 반영됩니다."}
            </span>
          )}

          <Button type="submit" variant="primary" disabled={isLocked}>
            프로젝트 정보 저장하기
          </Button>
        </div>
      </form>
    </div>
  );
};
