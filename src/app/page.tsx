"use client";

import React, { useState } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProjectCard } from "@/components/gallery/ProjectCard";
import { ProjectDetailModal } from "@/components/modals/ProjectDetailModal";
import { InvestModal } from "@/components/modals/InvestModal";
import { RankingBoard } from "@/components/ranking/RankingBoard";
import { MyInvestmentsView } from "@/components/investments/MyInvestmentsView";
import { TeamProjectManager } from "@/components/team/TeamProjectManager";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { Badge } from "@/components/ui/Badge";
import { Project } from "@/types";
import { Search, Sparkles, Filter, TrendingUp } from "lucide-react";

function MainDashboard() {
  const { event, projects, currentUser } = useApp();
  const [currentTab, setCurrentTab] = useState<"gallery" | "my-investments" | "team-project" | "admin">("gallery");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [investingProject, setInvestingProject] = useState<Project | null>(null);
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

                {/* 검색 바 */}
                <div className="pt-4 max-w-md">
                  <div className="flex items-center rounded-2xl border border-slate-200/90 bg-white shadow-sm p-1.5 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                    <div className="p-2 text-slate-400">
                      <Search size={18} />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="프로젝트명, 팀명 또는 기술 키워드 검색"
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onSelect={(p) => setSelectedProject(p)}
                      onInvestClick={(p) => setInvestingProject(p)}
                    />
                  ))}
                </div>
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
        />
      )}

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
