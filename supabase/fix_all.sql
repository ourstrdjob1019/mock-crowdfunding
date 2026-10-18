-- =========================================================================
-- 모의 크라우드펀딩 (CROWDFUND) Supabase DB & 스토리지 통합 초기화 및 권한 설정 SQL
-- Supabase 대시보드 (https://supabase.com/dashboard) > 프로젝트 선택 >
-- 좌측 메뉴 [SQL Editor] > [New query] 에 이 전체 내용을 붙여넣고 [Run] 버튼을 누르세요.
-- =========================================================================

-- 1. 기존 테이블 및 꼬여있던 제약조건 완전 초기화 (안전하게 CASCADE 삭제)
DROP TABLE IF EXISTS public.investments CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.roster CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;

-- 2. 유연한 TEXT 타입 기반 테이블 생성 (문자열 ID, UUID 모두 오류 없이 수용)
CREATE TABLE public.events (
  id TEXT PRIMARY KEY DEFAULT 'evt-2026-fall-01',
  name TEXT NOT NULL DEFAULT '2026 대한민국 대학생 창업·창작 프로젝트 데모데이',
  institution TEXT NOT NULL DEFAULT '서울혁신대학교',
  session TEXT NOT NULL DEFAULT '제3회 정기 데모데이',
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  base_credit INTEGER NOT NULL DEFAULT 10000,
  min_investment INTEGER NOT NULL DEFAULT 2000,
  max_investment INTEGER NOT NULL DEFAULT 5000,
  current_stage TEXT NOT NULL DEFAULT 'FUNDING_OPEN',
  is_ranking_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.teams (
  id TEXT PRIMARY KEY DEFAULT 'team-01',
  event_id TEXT DEFAULT 'evt-2026-fall-01',
  team_number INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- team (단수형)과 teams (복수형) 이름 호환 뷰
CREATE OR REPLACE VIEW public.team AS SELECT * FROM public.teams;

CREATE TABLE public.roster (
  id TEXT PRIMARY KEY DEFAULT 'roster-01',
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  team_id TEXT,
  team_name TEXT,
  role TEXT NOT NULL DEFAULT 'STUDENT',
  institution TEXT DEFAULT '',
  department TEXT DEFAULT '',
  student_number TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  event_id TEXT DEFAULT 'evt-2026-fall-01',
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL DEFAULT 'password123',
  name TEXT NOT NULL,
  institution TEXT DEFAULT '서울혁신대학교',
  department TEXT DEFAULT '자유 참가',
  student_number TEXT DEFAULT '',
  team_id TEXT,
  team_name TEXT,
  role TEXT NOT NULL DEFAULT 'STUDENT',
  privacy_agreed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.projects (
  id TEXT PRIMARY KEY,
  event_id TEXT DEFAULT 'evt-2026-fall-01',
  team_id TEXT,
  team_name TEXT NOT NULL,
  team_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT DEFAULT '',
  thumbnail_url TEXT NOT NULL,
  landing_format TEXT NOT NULL DEFAULT 'IMAGE',
  landing_url TEXT NOT NULL DEFAULT '',
  landing_images JSONB DEFAULT '[]'::jsonb,
  author_id TEXT,
  author_name TEXT,
  author_email TEXT,
  last_modifier_name TEXT,
  last_modified_at TEXT,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  total_credits INTEGER NOT NULL DEFAULT 0,
  investor_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.investments (
  id TEXT PRIMARY KEY,
  event_id TEXT DEFAULT 'evt-2026-fall-01',
  investor_id TEXT NOT NULL,
  investor_name TEXT NOT NULL,
  project_id TEXT NOT NULL,
  team_id TEXT,
  amount INTEGER NOT NULL DEFAULT 2000,
  created_at TEXT DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI'),
  updated_at TEXT DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI')
);

-- 3. 모든 테이블의 RLS 완전 허용 (anon / public 누구나 읽기/쓰기/수정/삭제 가능)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access Events" ON public.events;
CREATE POLICY "Public Full Access Events" ON public.events FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access Teams" ON public.teams;
CREATE POLICY "Public Full Access Teams" ON public.teams FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.roster ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access Roster" ON public.roster;
CREATE POLICY "Public Full Access Roster" ON public.roster FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access Users" ON public.users;
CREATE POLICY "Public Full Access Users" ON public.users FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access Projects" ON public.projects;
CREATE POLICY "Public Full Access Projects" ON public.projects FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access Investments" ON public.investments;
CREATE POLICY "Public Full Access Investments" ON public.investments FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. Supabase Storage 버킷 생성 및 권한 완전 허용
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('project-thumbnails', 'project-thumbnails', true, 10485760)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('landing-files', 'landing-files', true, 26214400)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Storage Read" ON storage.objects;
CREATE POLICY "Public Storage Read" ON storage.objects
  FOR SELECT TO public USING (bucket_id IN ('project-thumbnails', 'landing-files'));

DROP POLICY IF EXISTS "Public Storage Insert" ON storage.objects;
CREATE POLICY "Public Storage Insert" ON storage.objects
  FOR INSERT TO public WITH CHECK (bucket_id IN ('project-thumbnails', 'landing-files'));

DROP POLICY IF EXISTS "Public Storage Update" ON storage.objects;
CREATE POLICY "Public Storage Update" ON storage.objects
  FOR UPDATE TO public USING (bucket_id IN ('project-thumbnails', 'landing-files'));

DROP POLICY IF EXISTS "Public Storage Delete" ON storage.objects;
CREATE POLICY "Public Storage Delete" ON storage.objects
  FOR DELETE TO public USING (bucket_id IN ('project-thumbnails', 'landing-files'));

-- 5. 기본 데이터 시딩 (행사, 팀, 사용자, 프로젝트)
INSERT INTO public.events (id, name, institution, session, event_date, base_credit, min_investment, max_investment, current_stage, is_ranking_public)
VALUES (
  'evt-2026-fall-01',
  '2026 대한민국 대학생 창업·창작 프로젝트 데모데이',
  '서울혁신대학교',
  '제3회 정기 데모데이',
  CURRENT_DATE,
  10000,
  2000,
  5000,
  'FUNDING_OPEN',
  false
);

-- 5. 기본 필수 데이터 시딩 (기본 행사 정보 & 최초 관리자 계정)
-- 사용자 요청: 미리 세팅된 더미 출품작과 테스트 계정은 제거하여 깨끗한 상태에서 직접 등록/테스트 가능하게 구성
INSERT INTO public.users (id, event_id, email, password, name, institution, department, student_number, team_id, team_name, role, privacy_agreed)
VALUES
(
  'user-admin-1',
  'evt-2026-fall-01',
  'admin@gmail.com',
  'password123',
  '총괄 관리자',
  '창업교육센터',
  '운영총괄',
  'ADMIN-00',
  NULL,
  NULL,
  'ADMIN',
  true
)
ON CONFLICT (email) DO NOTHING;

-- ※ 팀(teams)과 출품작(projects)은 사용자가 브라우저에서 '새 프로젝트 출품 등록'을 통해 입력하면
--    Supabase teams 및 projects 테이블에 실시간으로 자동 등록됩니다.
