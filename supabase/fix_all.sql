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
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  team_number INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

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

INSERT INTO public.teams (id, event_id, team_number, name)
VALUES 
  ('team-01', 'evt-2026-fall-01', 1, '뉴로보이스 (Team 01)'),
  ('team-02', 'evt-2026-fall-01', 2, '에코루프 (Team 02)');

INSERT INTO public.users (id, event_id, email, password, name, institution, department, student_number, team_id, team_name, role, privacy_agreed)
VALUES
(
  'user-student-1',
  'evt-2026-fall-01',
  'student1@gmail.com',
  'password123',
  '임종락',
  '서울혁신대학교',
  '컴퓨터공학과',
  '2021-14022',
  'team-01',
  '뉴로보이스 (Team 01)',
  'STUDENT',
  true
),
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
);

INSERT INTO public.projects (
  id, event_id, team_id, team_name, team_number, title, summary, description,
  thumbnail_url, landing_format, landing_url, landing_images,
  author_id, author_name, author_email, last_modifier_name, last_modified_at,
  is_hidden, total_credits, investor_count
)
VALUES
(
  'proj-01',
  'evt-2026-fall-01',
  'team-01',
  '뉴로보이스 (Team 01)',
  1,
  '뉴로보이스 (NeuroVoice) — 신경 뇌파 기반 실시간 음성 합성 디바이스',
  '루게릭병 및 발화 장애인을 위한 비침습적 초소형 이어셋과 온디바이스 생성 AI 보조공학 솔루션',
  '인간의 의사소통 권리는 어떤 순간에도 박탈되어서는 안 됩니다. 뉴로보이스는 성대를 사용할 수 없는 근위축성 측삭경화증 환자 및 성대 절제 수술 환자를 위해, 귀 뒤에서 측정되는 미세한 뇌파와 안면 근전도 신호를 98.4%의 정확도로 해석합니다.',
  'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1200&q=80',
  'IMAGE',
  'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1600&q=80',
  '["https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1600&q=80", "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80", "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1600&q=80"]'::jsonb,
  'user-student-1',
  '임종락',
  'student1@gmail.com',
  '임종락',
  to_char(now(), 'YYYY-MM-DD HH24:MI'),
  false,
  6000,
  2
),
(
  'proj-02',
  'evt-2026-fall-01',
  'team-02',
  '에코루프 (Team 02)',
  2,
  '에코루프 (EcoLoop) — 건설 폐플라스틱 업사이클링 초경량 단열 방수 블록',
  '산업 폐기물 92% 재활용, 기존 콘크리트 대비 60% 경량화 및 탄소배출 74% 감축 패시브 건축자재',
  '도시 재생 및 제로에너지 건축물 인증을 위한 혁신 업사이클링 솔루션입니다. 열전도율 0.028W/mK로 에너지 효율을 극대화합니다.',
  'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1200&q=80',
  'IMAGE',
  'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1600&q=80',
  '["https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1600&q=80", "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80"]'::jsonb,
  'user-student-1',
  '박서연',
  'seoyeon@gmail.com',
  '박서연',
  to_char(now(), 'YYYY-MM-DD HH24:MI'),
  false,
  4000,
  1
);
