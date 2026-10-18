-- =========================================================================
-- 모의 크라우드펀딩 (CROWDFUND) Supabase DB & 스토리지 긴급 권한 및 테이블 복구 SQL
-- Supabase 대시보드 (https://supabase.com/dashboard) > 프로젝트 선택 >
-- 좌측 메뉴 [SQL Editor] > [New query] 에 이 전체 내용을 붙여넣고 [Run] 버튼을 누르세요.
-- =========================================================================

-- 1. 기존 테이블 정리 및 유연한 구조로 재설정 (ID 문자열 및 자유 가입 지원)
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY DEFAULT 'event-main',
  name TEXT NOT NULL DEFAULT '2026 청년 창업 모의 크라우드펀딩 대회',
  institution TEXT NOT NULL DEFAULT '청년창업진흥원',
  session TEXT NOT NULL DEFAULT '오후 실전 투자 세션 (본선)',
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  base_credit INTEGER NOT NULL DEFAULT 10000,
  min_investment INTEGER NOT NULL DEFAULT 2000,
  max_investment INTEGER NOT NULL DEFAULT 5000,
  current_stage TEXT NOT NULL DEFAULT 'FUNDING_OPEN',
  is_ranking_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 기존 id 컬럼이 UUID인 경우 TEXT로 완화 허용
DO $$
BEGIN
  ALTER TABLE public.events ALTER COLUMN id TYPE TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  event_id TEXT DEFAULT 'event-main',
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL DEFAULT 'password123',
  name TEXT NOT NULL,
  institution TEXT DEFAULT '창업지원단',
  department TEXT DEFAULT '자유 참가',
  student_number TEXT DEFAULT '',
  team_id TEXT,
  team_name TEXT,
  role TEXT NOT NULL DEFAULT 'STUDENT',
  privacy_agreed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  ALTER TABLE public.users ALTER COLUMN id TYPE TEXT;
  ALTER TABLE public.users ALTER COLUMN event_id TYPE TEXT;
  ALTER TABLE public.users ALTER COLUMN team_id TYPE TEXT;
  -- password 컬럼 없으면 추가
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'password123';
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS privacy_agreed BOOLEAN DEFAULT true;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  event_id TEXT DEFAULT 'event-main',
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

DO $$
BEGIN
  ALTER TABLE public.projects ALTER COLUMN id TYPE TEXT;
  ALTER TABLE public.projects ALTER COLUMN event_id TYPE TEXT;
  ALTER TABLE public.projects ALTER COLUMN team_id TYPE TEXT;
  ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS author_id TEXT;
  ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS author_name TEXT;
  ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS author_email TEXT;
  ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS landing_images JSONB DEFAULT '[]'::jsonb;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.investments (
  id TEXT PRIMARY KEY,
  event_id TEXT DEFAULT 'event-main',
  investor_id TEXT NOT NULL,
  investor_name TEXT NOT NULL,
  project_id TEXT NOT NULL,
  team_id TEXT,
  amount INTEGER NOT NULL DEFAULT 2000,
  created_at TEXT DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI'),
  updated_at TEXT DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI')
);

DO $$
BEGIN
  ALTER TABLE public.investments ALTER COLUMN id TYPE TEXT;
  ALTER TABLE public.investments ALTER COLUMN event_id TYPE TEXT;
  ALTER TABLE public.investments ALTER COLUMN investor_id TYPE TEXT;
  ALTER TABLE public.investments ALTER COLUMN project_id TYPE TEXT;
  ALTER TABLE public.investments ALTER COLUMN team_id TYPE TEXT;
  ALTER TABLE public.investments ALTER COLUMN created_at TYPE TEXT;
  ALTER TABLE public.investments ALTER COLUMN updated_at TYPE TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- =========================================================================
-- 2. 모든 테이블의 RLS 권한 완전 개방 (anon / authenticated 누구나 CRUD 가능)
-- =========================================================================

-- events 테이블 RLS 해제 또는 전면 허용
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access Events" ON public.events;
CREATE POLICY "Public Full Access Events" ON public.events FOR ALL TO public USING (true) WITH CHECK (true);

-- users 테이블 RLS 해제 또는 전면 허용
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access Users" ON public.users;
CREATE POLICY "Public Full Access Users" ON public.users FOR ALL TO public USING (true) WITH CHECK (true);

-- projects 테이블 RLS 해제 또는 전면 허용
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access Projects" ON public.projects;
CREATE POLICY "Public Full Access Projects" ON public.projects FOR ALL TO public USING (true) WITH CHECK (true);

-- investments 테이블 RLS 해제 또는 전면 허용
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access Investments" ON public.investments;
CREATE POLICY "Public Full Access Investments" ON public.investments FOR ALL TO public USING (true) WITH CHECK (true);

-- =========================================================================
-- 3. Supabase Storage 버킷 생성 및 업로드 권한 완전 허용
-- =========================================================================

-- 3-1. 썸네일 버킷 (project-thumbnails) 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('project-thumbnails', 'project-thumbnails', true, 10485760)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3-2. 랜딩 파일 버킷 (landing-files) 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('landing-files', 'landing-files', true, 26214400)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3-3. Storage objects 테이블 RLS 정책 (누구나 파일 조회, 업로드, 수정, 삭제 가능)
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

-- =========================================================================
-- 4. 기본 행사 및 테스트 데이터 시딩 (DB가 비어있을 때 즉각 동작하도록)
-- =========================================================================

INSERT INTO public.events (id, name, institution, session, event_date, base_credit, min_investment, max_investment, current_stage, is_ranking_public)
VALUES (
  'event-main',
  '2026 청년 창업 모의 크라우드펀딩 대회',
  '청년창업진흥원',
  '오후 실전 투자 세션 (본선)',
  CURRENT_DATE,
  10000,
  2000,
  5000,
  'FUNDING_OPEN',
  false
)
ON CONFLICT (id) DO NOTHING;

-- 테스트 계정 2개 등록 (김철수 학생, 박평가 심사위원)
INSERT INTO public.users (id, event_id, email, password, name, institution, department, student_number, team_id, team_name, role, privacy_agreed)
VALUES
(
  'user-test-student',
  'event-main',
  'student1@startup.kr',
  'password123',
  '김철수',
  '한국대학교',
  '컴퓨터공학과',
  '20241234',
  'team-eco',
  '1조 에코패키징',
  'STUDENT',
  true
),
(
  'user-test-judge',
  'event-main',
  'judge1@startup.kr',
  'password123',
  '박평가',
  '벤처캐피탈 파트너스',
  '수석심사역',
  'JUDGE-001',
  NULL,
  NULL,
  'JUDGE',
  true
)
ON CONFLICT (email) DO NOTHING;

-- 샘플 프로젝트 2개 등록
INSERT INTO public.projects (
  id, event_id, team_id, team_name, team_number, title, summary, description,
  thumbnail_url, landing_format, landing_url, landing_images,
  author_id, author_name, author_email, last_modifier_name, last_modified_at,
  is_hidden, total_credits, investor_count
)
VALUES
(
  'proj-1',
  'event-main',
  'team-eco',
  '1조 에코패키징',
  1,
  '버섯 균사체 기반 100% 생분해 친환경 완충 포장재',
  '스티로폼을 완벽 대체하는 30일 자연 생분해 패키징 솔루션',
  '기존 스티로폼 완충재는 분해에 500년 이상 소요되며 미세플라스틱을 유발합니다. 저희 1조 에코패키징은 농업 부산물과 버섯 균사체를 결합하여 30일 만에 토양에서 퇴비화되는 고강도 친환경 완충재를 개발했습니다.',
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
  'IMAGE',
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1600&q=80',
  '["https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1600&q=80", "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1600&q=80"]'::jsonb,
  'user-test-student',
  '김철수',
  'student1@startup.kr',
  '김철수 (팀 대표)',
  to_char(now(), 'YYYY-MM-DD HH24:MI'),
  false,
  7000,
  2
),
(
  'proj-2',
  'event-main',
  'team-care',
  '2조 AI 헬스케어',
  2,
  '비접촉 레이더 센서 기반 독거노인 응급 모니터링 시스템',
  '카메라 프라이버시 침해 없이 호흡·심박·낙상을 실시간 감지하는 스마트 케어',
  '독거노인 고독사 및 낙상 사고를 예방하기 위해 고주파 초광대역 레이더 센서를 활용하여 벽이나 장애물을 투과해 생체 신호를 감지합니다.',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
  'IMAGE',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80',
  '["https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80", "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1600&q=80"]'::jsonb,
  'user-test-student',
  '이영희',
  'younghee@startup.kr',
  '이영희 (팀 대표)',
  to_char(now(), 'YYYY-MM-DD HH24:MI'),
  false,
  5000,
  1
)
ON CONFLICT (id) DO NOTHING;
