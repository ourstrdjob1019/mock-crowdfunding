"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight, 
  AlertCircle, 
  Sparkles,
  GraduationCap,
  Award,
  Users,
  School,
  Hash
} from "lucide-react";
import { UserRole } from "@/types";

export const AuthScreen: React.FC = () => {
  const { login, register, projects, event, users, demoLogin } = useApp();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // 로그인 폼
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // 회원가입 폼
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regDepartment, setRegDepartment] = useState("");
  const [regStudentNumber, setRegStudentNumber] = useState("");
  const [regRole, setRegRole] = useState<UserRole>("STUDENT");
  const [regPrivacyAgreed, setRegPrivacyAgreed] = useState(true);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    const res = await login(loginEmail, loginPassword);
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!regEmail.trim()) {
      setErrorMessage("이메일 주소를 입력해 주세요.");
      return;
    }
    if (!regPassword.trim()) {
      setErrorMessage("비밀번호를 입력해 주세요.");
      return;
    }
    if (!regName.trim()) {
      setErrorMessage("이름(실명)을 입력해 주세요.");
      return;
    }

    const res = await register({
      email: regEmail.trim(),
      password: regPassword.trim(),
      name: regName.trim(),
      department: regDepartment.trim() || (regRole === "STUDENT" ? "창업학부" : "운영위원회"),
      studentNumber: regStudentNumber.trim(),
      institution: "서원대학교",
      role: regRole,
      privacyAgreed: regPrivacyAgreed,
    });

    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between relative overflow-hidden py-10 px-4 sm:px-6">
      {/* 부드러운 배경 앰비언트 그라데이션 */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent rounded-full blur-[90px] pointer-events-none" />

      {/* 상단 브랜드 헤더 */}
      <header className="relative z-10 max-w-md w-full mx-auto text-center pt-2 sm:pt-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-3">
          <Sparkles size={22} />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          레디스타트업
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          클라우드펀딩 플랫폼 · {event.name}
        </p>

        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] font-mono font-medium text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {event.institution} · 시스템 가동 중
        </div>
      </header>

      {/* 메인 로그인 / 회원가입 카드 */}
      <main className="relative z-10 max-w-md w-full mx-auto my-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100 p-6 sm:p-8 transition-all">
          
          {/* 로그인 / 회원가입 탭 */}
          <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage("");
              }}
              className={`py-2.5 rounded-lg transition-all cursor-pointer text-center ${
                mode === "login"
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrorMessage("");
              }}
              className={`py-2.5 rounded-lg transition-all cursor-pointer text-center ${
                mode === "register"
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              회원가입
            </button>
          </div>

          {/* 에러 메시지 알림 */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* 1. 로그인 폼 */}
          {mode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  이메일 (아이디)
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="등록된 이메일 주소 입력"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="비밀번호 입력"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" isFullWidth size="lg">
                  로그인 <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>

              {/* 데모 빠른 계정 로그인 (원클릭) */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="block text-[11px] font-semibold text-slate-500 text-center">
                  ⚡ 데모 원클릭 간편 로그인
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const student = users.find((u) => u.role === "STUDENT") || users[0];
                      if (student) demoLogin(student.id);
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-[11px] font-bold text-slate-700 transition cursor-pointer text-center"
                  >
                    👤 학생
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const judge = users.find((u) => u.role === "JUDGE");
                      if (judge) demoLogin(judge.id);
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-[11px] font-bold text-slate-700 transition cursor-pointer text-center"
                  >
                    ⚖️ 심사위원
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const admin = users.find((u) => u.role === "ADMIN");
                      if (admin) demoLogin(admin.id);
                    }}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 text-[11px] font-bold transition cursor-pointer text-center"
                  >
                    ⚙️ 총괄 관리자
                  </button>
                </div>
              </div>

              <p className="text-center text-[11px] text-slate-400 pt-2">
                계정이 없으신가요? 상단의 <strong>회원가입</strong> 탭에서 직접 가입하거나 관리자에게 문의하세요.
              </p>
            </form>
          )}

          {/* 2. 회원가입 폼 */}
          {mode === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  이메일 (아이디) *
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="로그인에 사용할 이메일"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  이름 (실명) *
                </label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  />
                </div>
              </div>

              {/* 학과 및 학번 (조원 매칭 및 본인 확인용) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    학과 / 전공 {regRole === "STUDENT" && <span className="text-blue-600">*</span>}
                  </label>
                  <div className="relative">
                    <School size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      placeholder="예: 컴퓨터공학과"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    학번 {regRole === "STUDENT" && <span className="text-blue-600">*</span>}
                  </label>
                  <div className="relative">
                    <Hash size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={regStudentNumber}
                      onChange={(e) => setRegStudentNumber(e.target.value)}
                      placeholder="예: 20261234"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 역할/참가 구분 선택 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  참가 구분 *
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRegRole("STUDENT")}
                    className={`py-2 px-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      regRole === "STUDENT"
                        ? "border-blue-500 bg-blue-50/70 text-blue-700 font-bold shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <GraduationCap size={16} className={regRole === "STUDENT" ? "text-blue-600" : "text-slate-400"} />
                    <span>학생</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole("JUDGE")}
                    className={`py-2 px-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      regRole === "JUDGE"
                        ? "border-blue-500 bg-blue-50/70 text-blue-700 font-bold shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Award size={16} className={regRole === "JUDGE" ? "text-blue-600" : "text-slate-400"} />
                    <span>심사위원</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole("STUDENT")}
                    className={`py-2 px-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      regRole === "STUDENT"
                        ? "border-blue-500 bg-blue-50/70 text-blue-700 font-bold shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Users size={16} className={regRole === "STUDENT" ? "text-blue-600" : "text-slate-400"} />
                    <span>일반 참가</span>
                  </button>
                </div>
              </div>

              {/* 개인정보 수집 및 이용 동의 */}
              <div className="pt-1 flex items-start gap-2">
                <input
                  type="checkbox"
                  id="privacy-check"
                  required
                  checked={regPrivacyAgreed}
                  onChange={(e) => setRegPrivacyAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="privacy-check" className="text-xs text-slate-600 leading-snug cursor-pointer">
                  <span className="font-semibold text-slate-800">[필수] 동의</span>: 가상 크라우드펀딩 모의 투자 참여 및 가상 크레딧(10,000 CR) 지급에 동의합니다.
                </label>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" isFullWidth size="lg">
                  가입 완료하고 10,000 CR 받기 <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </form>
          )}

        </div>
      </main>

      {/* 하단 푸터 */}
      <footer className="relative z-10 max-w-md w-full mx-auto text-center py-4">
        <p className="text-[11px] font-mono text-slate-400">
          © 2026 {event.institution} · 모의 크라우드펀딩 평가 시스템
        </p>
      </footer>
    </div>
  );
};
