"use client";

import React, { useState } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProjectCard } from "@/components/gallery/ProjectCard";
import { ProjectDetailModal } from "@/components/modals/ProjectDetailModal";
import { ProjectFormModal } from "@/components/modals/ProjectFormModal";
import { InvestModal } from "@/components/modals/InvestModal";
import { RankingBoard } from "@/components/ranking/RankingBoard";
import { MyInvestmentsView } from "@/components/investments/MyInvestmentsView";
import { TeamProjectManager } from "@/components/team/TeamProjectManager";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { Badge } from "@/components/ui/Badge";
import { Project } from "@/types";
import { Search, Sparkles, Filter, TrendingUp, Plus } from "lucide-react";

function MainDashboard() {
  const { event, projects, currentUser } = useApp();
  const [currentTab, setCurrentTab] = useState<"gallery" | "my-investments" | "team-project" | "admin">("gallery");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [investingProject, setInvestingProject] = useState<Project | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectorRankingOpen, setIsProjectorRankingOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredProjects = projects.filter(
    (p) =>
      !p.isHidden &&
      (p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.teamName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA] text-[#0F172A]">
      {/* 1. 좌측 사이드바 내비게이션 (사용자 요청: 네비게이션바는 왼쪽으로 몰아주고) */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openProjectorRanking={() => setIsProjectorRankingOpen(true)}
        openCreateProject={() => setIsCreateModalOpen(true)}
      />

      {/* 2. 우측 스크롤 가능한 메인 콘텐츠 */}
      <div className="flex-1 h-screen overflow-y-auto relative">
        {/* 상단 미세 배경 글루 */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">
          {/* 1. 프로젝트 갤러리 탭 */}
          {currentTab === "gallery" && (
            <div className="space-y-10">
              {/* Hero Section (Minimalist Modern Style) */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-50/60 px-4 py-1.5 text-xs font-mono text-blue-700 font-semibold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  DEMODAY 2026 · LIVE EXHIBITION
                </div>

                <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-slate-900 leading-[1.08]">
                  학생 혁신의 내일을 직접 보고, <br />
                  가장 탁월한 팀에 <span className="text-gradient">가상 자본을 투자</span>하세요
                </h1>

                <p className="text-slate-600 text-base md:text-lg max-w-2xl leading-relaxed">
                  팀별로 제출된 상세 랜딩페이지를 열람한 뒤, 심사표 대신 크레딧을 분배하여 실시간 순위와 평가를 결정합니다.
                </p>

                {/* 검색 바 & 새 프로젝트 출품 등록 버튼 */}
                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl">
                  <div className="flex-1 flex items-center rounded-2xl border border-slate-200/90 bg-white shadow-sm p-1.5 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                    <div className="p-2 text-slate-400">
                      <Search size={18} />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="프로젝트명, 팀명 또는 키워드 검색"
                      className="w-full py-1.5 pr-3 text-xs md:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="px-2.5 py-1 text-xs font-mono text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        지우기
                      </button>
                    )}
                  </div>

                  {/* 학생 및 참가자가 직접 프로젝트를 업로드하는 게시판 등록 버튼 */}
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2.5 rounded-2xl bg-accent-gradient text-white font-semibold text-xs md:text-sm flex items-center justify-center gap-1.5 shadow-accent hover:shadow-accent-lg hover:-translate-y-0.5 transition-all cursor-pointer shrink-0"
                  >
                    <Plus size={16} /> 프로젝트 출품 등록
                  </button>
                </div>
              </div>

              {/* 프로젝트 카드 그리드 */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    총 {filteredProjects.length}개의 출품 프로젝트
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    정렬 기준: 팀 번호순 (공정성 보장)
                  </span>
                </div>

                {filteredProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onSelect={(p) => setSelectedProject(p)}
                        onInvestClick={(p) => setInvestingProject(p)}
                        onEditClick={(p) => setEditingProject(p)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-12 text-center my-6 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                      <Sparkles size={24} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-slate-800">
                      {searchQuery ? "검색 결과와 일치하는 프로젝트가 없습니다" : "아직 등록된 출품 프로젝트가 없습니다"}
                    </h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
                      {searchQuery
                        ? "검색어를 다시 확인하시거나 필터를 초기화해 보세요."
                        : "첫 번째 혁신 프로젝트를 직접 출품 등록해 보세요!"}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all inline-flex items-center gap-2 shadow-sm cursor-pointer"
                      >
                        <Plus size={16} /> 프로젝트 출품 등록하기
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. 내 투자 내역 탭 */}
          {currentTab === "my-investments" && (
            <MyInvestmentsView
              onEditInvestment={(p) => setInvestingProject(p)}
              onExploreGallery={() => setCurrentTab("gallery")}
            />
          )}

          {/* 3. 우리 팀 프로젝트 관리 탭 */}
          {currentTab === "team-project" && <TeamProjectManager />}

          {/* 4. 관리자 콘솔 탭 */}
          {currentTab === "admin" && (
            <AdminDashboard openProjectorRanking={() => setIsProjectorRankingOpen(true)} />
          )}

          {/* 하단 푸터 */}
          <footer className="mt-20 pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-slate-400 gap-4">
            <div>
              © 2026 {event.institution} {event.session}
            </div>
            <div className="flex gap-4">
              <span>DESIGN: MINIMALIST MODERN</span>
              <span>RULE: 2,000 ~ 5,000 CR</span>
            </div>
          </footer>
        </div>
      </div>

      {/* 모달 레이어 */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onOpenInvest={(p) => setInvestingProject(p)}
          onOpenEdit={(p) => setEditingProject(p)}
        />
      )}

      {/* 프로젝트 출품 등록 및 수정 모달 */}
      <ProjectFormModal
        isOpen={isCreateModalOpen || Boolean(editingProject)}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingProject(null);
        }}
        editProject={editingProject}
      />

      {investingProject && (
        <InvestModal
          project={investingProject}
          onClose={() => setInvestingProject(null)}
        />
      )}

      {/* 발표장 프로젝터 랭킹 보드 오버레이 */}
      {isProjectorRankingOpen && (
        <RankingBoard onClose={() => setIsProjectorRankingOpen(false)} />
      )}
    </div>
  );
}

function RootApp() {
  const { isLoggedIn } = useApp();

  // 미로그인 상태: 회원가입 및 로그인 화면부터 보여줌!
  if (!isLoggedIn) {
    return <AuthScreen />;
  }

  // 로그인 상태: 좌측 사이드바 + 메인 대시보드
  return <MainDashboard />;
}

export default function Home() {
  return (
    <AppProvider>
      <RootApp />
    </AppProvider>
  );
}
