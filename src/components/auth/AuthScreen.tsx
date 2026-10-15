"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  School, 
  BookOpen, 
  Hash, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Zap
} from "lucide-react";

export const AuthScreen: React.FC = () => {
  const { login, register, demoLogin, users, roster, event } = useApp();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // 로그인 폼
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // 회원가입 폼
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regInstitution, setRegInstitution] = useState("서울혁신대학교");
  const [regDepartment, setRegDepartment] = useState("");
  const [regStudentNumber, setRegStudentNumber] = useState("");
  const [regPrivacyAgreed, setRegPrivacyAgreed] = useState(false);

  // 이메일 입력 시 화이트리스트 명단 매칭 미리보기
  const matchedRoster = roster.find((r) => r.email.toLowerCase() === regEmail.trim().toLowerCase());

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    const res = login(loginEmail, loginPassword);
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    const res = register({
      email: regEmail,
      password: regPassword,
      name: regName,
      institution: regInstitution,
      department: regDepartment,
      studentNumber: regStudentNumber,
      privacyAgreed: regPrivacyAgreed,
    });

    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      setSuccessMessage(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0F172A] flex flex-col justify-between relative overflow-hidden">
      {/* 배경 장식: Ambient Radial Glow & Dot Pattern */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-dot-pattern-light opacity-60 pointer-events-none" />

      {/* 상단 간이 헤더 */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-accent-gradient flex items-center justify-center text-white shadow-accent">
            <Sparkles size={20} />
          </div>
          <div>
            <span className="font-display text-xl font-bold tracking-tight text-slate-900 block leading-tight">
              CROWDFUND
            </span>
            <span className="font-mono text-[11px] text-slate-500 uppercase tracking-widest">
              {event.institution} · {event.session}
            </span>
          </div>
        </div>

        <Badge variant="primary" hasPulseDot={true} size="sm">
          {event.currentStage === "FUNDING_OPEN" ? "펀딩 진행 중 (LIVE)" : event.currentStage}
        </Badge>
      </header>

      {/* 메인 인증 컨테이너 */}
      <main className="relative z-10 max-w-5xl w-full mx-auto px-4 py-8 md:py-12 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* 좌측 소개 영역 (Editorial Calistoga Hero) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-50/60 px-4 py-1.5 text-xs font-mono text-blue-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              모의 크라우드펀딩 평가 시스템
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight tracking-tight text-slate-900">
              미래를 바꾸는 학생 프로젝트에 <br />
              <span className="text-gradient">직접 투자하고 평가</span>하세요
            </h1>

            <p className="font-sans text-slate-600 text-sm md:text-base leading-relaxed">
              복잡한 심사표 대신 1인당 <strong>10,000 가상 크레딧</strong>으로 팀당 2,000~5,000 크레딧을 직접 펀딩하여 살아있는 성과 평가를 만듭니다.
            </p>

            {/* 빠른 테스트용 원클릭 데모 계정 안내 바 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                <Zap size={14} className="text-blue-600" />
                테스트용 빠른 1초 데모 로그인
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                회원가입 없이 즉시 계정별 권한과 기능을 테스트할 수 있습니다:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => demoLogin(u.id)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition-all cursor-pointer group"
                  >
                    <span className="block text-[11px] font-mono text-blue-600 font-bold uppercase">
                      {u.role === "ADMIN" ? "관리자" : u.role === "JUDGE" ? "심사위원" : "학생"}
                    </span>
                    <span className="font-semibold text-xs text-slate-800 group-hover:text-blue-600">
                      {u.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 우측 로그인 / 회원가입 카드 */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-8 md:p-10 relative">
              {/* 탭 전환 (로그인 / 회원가입) */}
              <div className="flex rounded-xl bg-slate-100 p-1 mb-8">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMessage("");
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                    mode === "login"
                      ? "bg-white text-slate-900 shadow-sm font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  기존 회원 로그인
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setErrorMessage("");
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                    mode === "register"
                      ? "bg-white text-slate-900 shadow-sm font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  사전 명단 회원가입
                </button>
              </div>

              {/* 에러 및 안내 메시지 */}
              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* 1. 로그인 폼 */}
              {mode === "login" && (
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Gmail 아이디 (Email)
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="예: student1@gmail.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
                      비밀번호 (Password)
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="비밀번호 입력"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" variant="primary" isFullWidth size="lg">
                      로그인하기 <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>

                  <div className="pt-3 text-center">
                    <p className="text-xs text-slate-500">
                      아직 가입하지 않으셨나요?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("register")}
                        className="text-blue-600 font-semibold underline underline-offset-2 cursor-pointer"
                      >
                        사전 명단 회원가입 바로가기
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* 2. 회원가입 폼 (화이트리스트 사전 검증) */}
              {mode === "register" && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Gmail 주소 */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Gmail 주소 (사전 등록 명단 확인) *
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="반드시 행사 명단에 등록된 Gmail 입력"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                      />
                    </div>

                    {/* 화이트리스트 사전 매칭 피드백 */}
                    {regEmail && (
                      <div className="mt-2 text-xs font-mono">
                        {matchedRoster ? (
                          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <span>
                              확인 완료: <strong>{matchedRoster.name}</strong> ({matchedRoster.teamName || "심사위원"})
                            </span>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-1.5">
                            <AlertCircle size={14} className="text-amber-600" />
                            <span>명단 확인 대기 중: 관리자 명단에 등록된 Gmail만 가입됩니다.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 비밀번호 */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      비밀번호 *
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="비밀번호 설정"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* 이름 & 학교 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        이름 *
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="이름 입력"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        학교 *
                      </label>
                      <input
                        type="text"
                        required
                        value={regInstitution}
                        onChange={(e) => setRegInstitution(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* 학과 & 학번 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        학과 *
                      </label>
                      <input
                        type="text"
                        required
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        placeholder="예: 컴퓨터공학과"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        학번 *
                      </label>
                      <input
                        type="text"
                        required
                        value={regStudentNumber}
                        onChange={(e) => setRegStudentNumber(e.target.value)}
                        placeholder="예: 2024-00001"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* 개인정보 수집 이용 동의 (기획안 요구사항) */}
                  <div className="pt-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="privacy-check"
                      required
                      checked={regPrivacyAgreed}
                      onChange={(e) => setRegPrivacyAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="privacy-check" className="text-xs text-slate-600 leading-snug cursor-pointer">
                      <span className="font-bold text-slate-900">[필수] 개인정보 수집 및 이용 동의</span>: 모의 크라우드펀딩 평가 참여 및 팀 매칭, 결과 산출을 위한 최소한의 개인정보 수집에 동의합니다.
                    </label>
                  </div>

                  <div className="pt-3">
                    <Button type="submit" variant="primary" isFullWidth size="lg">
                      명단 확인 후 가입 완료하기 <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>

                  <div className="pt-2 text-center">
                    <p className="text-xs text-slate-500">
                      이미 계정이 있으신가요?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("login")}
                        className="text-blue-600 font-semibold underline underline-offset-2 cursor-pointer"
                      >
                        로그인으로 전환
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 하단 푸터 */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-slate-500 gap-2">
        <span>© 2026 {event.institution} 모의 크라우드펀딩 평가 시스템</span>
        <span>SECURITY: WHITELIST ACCESS RESTRICTION ACTIVE</span>
      </footer>
    </div>
  );
};
