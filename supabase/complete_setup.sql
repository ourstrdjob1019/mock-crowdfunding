-- =========================================================================
-- 모의 크라우드펀딩 평가 시스템 (CROWDFUND) 원클릭 통합 DB & 스토리지 세팅 SQL
-- Supabase 대시보드 > SQL Editor 에서 전체 복사 후 실행(RUN)하세요.
-- =========================================================================

-- 0. 기존 테이블/함수 정리 (필요 시)
-- DROP TABLE IF EXISTS public.investments CASCADE;
-- DROP TABLE IF EXISTS public.projects CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;
-- DROP TABLE IF EXISTS public.roster CASCADE;
-- DROP TABLE IF EXISTS public.teams CASCADE;
-- DROP TABLE IF EXISTS public.events CASCADE;

-- =========================================================================
-- 1. 테이블 생성
-- =========================================================================

-- 1-1. 행사 테이블 (events)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  session TEXT NOT NULL,
  event_date DATE NOT NULL,
  base_credit INTEGER NOT NULL DEFAULT 10000,
  min_investment INTEGER NOT NULL DEFAULT 2000,
  max_investment INTEGER NOT NULL DEFAULT 5000,
  current_stage TEXT NOT NULL DEFAULT 'FUNDING_OPEN' CHECK (current_stage IN ('PREPARING', 'REGISTRATION', 'FUNDING_OPEN', 'FUNDING_CLOSED', 'RANKING_PUBLISHED')),
  is_ranking_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1-2. 팀 테이블 (teams)
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  team_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, team_number)
);

-- 1-3. 사전 명단 테이블 (roster: 화이트리스트 가입 허용 기준)
CREATE TABLE IF NOT EXISTS public.roster (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  team_name TEXT,
  role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'JUDGE', 'ADMIN')),
  institution TEXT NOT NULL,
  department TEXT NOT NULL,
  student_number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, email)
);

-- 1-4. 회원 프로필 테이블 (users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL DEFAULT 'password123', -- 관리자가 8자리 난수로 리셋 가능
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  department TEXT NOT NULL,
  student_number TEXT NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  team_name TEXT,
  role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'JUDGE', 'ADMIN')),
  privacy_agreed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1-5. 프로젝트 테이블 (projects)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL UNIQUE REFERENCES public.teams(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  team_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT NOT NULL,
  landing_format TEXT NOT NULL DEFAULT 'IMAGE' CHECK (landing_format IN ('IMAGE', 'PDF', 'HTML')),
  landing_url TEXT NOT NULL,
  landing_images JSONB DEFAULT '[]'::jsonb,
  last_modifier_name TEXT,
  last_modified_at TIMESTAMPTZ DEFAULT now(),
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  total_credits INTEGER NOT NULL DEFAULT 0,
  investor_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1-6. 투자 테이블 (investments)
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  investor_name TEXT NOT NULL,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount >= 2000 AND amount <= 5000),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(investor_id, project_id) -- 1인당 팀별 1회 투자 엄격 보장
);

-- 인덱스 설정
CREATE INDEX IF NOT EXISTS idx_investments_event ON public.investments(event_id);
CREATE INDEX IF NOT EXISTS idx_investments_investor ON public.investments(investor_id);
CREATE INDEX IF NOT EXISTS idx_investments_project ON public.investments(project_id);

-- =========================================================================
-- 2. Supabase Storage 버킷 생성 및 권한 설정
-- =========================================================================

-- 2-1. 썸네일 버킷 (project-thumbnails)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-thumbnails',
  'project-thumbnails',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760;

-- 2-2. 랜딩페이지 파일 버킷 (landing-files)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'landing-files',
  'landing-files',
  true,
  26214400, -- 25MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/html']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 26214400;

-- 2-3. Storage RLS 정책: 누구나 파일 읽기(조회) 허용
DROP POLICY IF EXISTS "Public Storage Read Access" ON storage.objects;
CREATE POLICY "Public Storage Read Access" ON storage.objects
  FOR SELECT USING (bucket_id IN ('project-thumbnails', 'landing-files'));

-- 2-4. Storage RLS 정책: 업로드 및 수정/삭제 허용
DROP POLICY IF EXISTS "Allow Upload Access" ON storage.objects;
CREATE POLICY "Allow Upload Access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id IN ('project-thumbnails', 'landing-files'));

DROP POLICY IF EXISTS "Allow Update Delete Access" ON storage.objects;
CREATE POLICY "Allow Update Delete Access" ON storage.objects
  FOR ALL USING (bucket_id IN ('project-thumbnails', 'landing-files'));

-- =========================================================================
-- 3. 핵심 트랜잭션 함수 (RPC)
-- =========================================================================

-- 3-1. 원자적 가상 크레딧 투자 처리 함수 (동시성 Race Condition 방지)
CREATE OR REPLACE FUNCTION public.rpc_invest_or_update(
  p_event_id UUID,
  p_investor_id UUID,
  p_project_id UUID,
  p_amount INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event RECORD;
  v_investor RECORD;
  v_project RECORD;
  v_existing_investment RECORD;
  v_used_credit INTEGER;
  v_current_team_amount INTEGER := 0;
  v_available_credit INTEGER;
  v_total_proj_credits INTEGER;
  v_investor_count INTEGER;
BEGIN
  -- 1. 행사 단계 검증
  SELECT * INTO v_event FROM public.events WHERE id = p_event_id FOR SHARE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', '존재하지 않는 행사입니다.');
  END IF;

  IF v_event.current_stage <> 'FUNDING_OPEN' THEN
    RETURN jsonb_build_object('success', false, 'error', '현재 펀딩 진행 시간이 아닙니다.');
  END IF;

  -- 2. 투자 금액 단위 및 범위 검증 (2,000 ~ 5,000, 100단위)
  IF p_amount < v_event.min_investment OR p_amount > v_event.max_investment THEN
    RETURN jsonb_build_object('success', false, 'error', '투자 금액은 ' || v_event.min_investment || '에서 ' || v_event.max_investment || ' 크레딧 사이여야 합니다.');
  END IF;

  IF (p_amount % 100) <> 0 THEN
    RETURN jsonb_build_object('success', false, 'error', '투자 금액은 100 크레딧 단위여야 합니다.');
  END IF;

  -- 3. 투자자 정보 조회 및 자기 팀 투자 금지 확인
  SELECT * INTO v_investor FROM public.users WHERE id = p_investor_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', '유효하지 않은 투자자입니다.');
  END IF;

  SELECT * INTO v_project FROM public.projects WHERE id = p_project_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', '존재하지 않는 프로젝트입니다.');
  END IF;

  IF v_investor.team_id IS NOT NULL AND v_investor.team_id = v_project.team_id THEN
    RETURN jsonb_build_object('success', false, 'error', '자신의 팀 프로젝트에는 투자할 수 없습니다.');
  END IF;

  -- 4. 잔여 크레딧 원자적 계산 (FOR UPDATE 락 적용)
  SELECT * INTO v_existing_investment 
  FROM public.investments 
  WHERE investor_id = p_investor_id AND project_id = p_project_id
  FOR UPDATE;

  IF FOUND THEN
    v_current_team_amount := v_existing_investment.amount;
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO v_used_credit
  FROM public.investments
  WHERE investor_id = p_investor_id;

  v_available_credit := (v_event.base_credit - v_used_credit) + v_current_team_amount;

  IF p_amount > v_available_credit THEN
    RETURN jsonb_build_object('success', false, 'error', '잔여 크레딧이 부족합니다. 사용 가능 잔여액: ' || v_available_credit);
  END IF;

  -- 5. 저장 또는 수정
  IF FOUND THEN
    UPDATE public.investments
    SET amount = p_amount, updated_at = now()
    WHERE id = v_existing_investment.id;
  ELSE
    INSERT INTO public.investments (event_id, investor_id, investor_name, project_id, team_id, amount)
    VALUES (p_event_id, p_investor_id, v_investor.name, p_project_id, v_project.team_id, p_amount);
  END IF;

  -- 6. 프로젝트 테이블 누적 통계 갱신
  SELECT COALESCE(SUM(amount), 0), COUNT(*)
  INTO v_total_proj_credits, v_investor_count
  FROM public.investments
  WHERE project_id = p_project_id;

  UPDATE public.projects
  SET total_credits = v_total_proj_credits, investor_count = v_investor_count
  WHERE id = p_project_id;

  RETURN jsonb_build_object(
    'success', true, 
    'amount', p_amount, 
    'total_credits', v_total_proj_credits,
    'investor_count', v_investor_count
  );
END;
$$;

-- 3-2. 관리자용 8자리 임시 비밀번호 난수 발급 RPC 함수
CREATE OR REPLACE FUNCTION public.rpc_admin_reset_password(
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_temp_password TEXT;
  v_user_name TEXT;
BEGIN
  -- 8자리 임의 숫자 생성 (10000000 ~ 99999999)
  v_temp_password := floor(10000000 + random() * 90000000)::text;

  UPDATE public.users
  SET password_hash = v_temp_password
  WHERE id = p_user_id
  RETURNING name INTO v_user_name;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', '사용자를 찾을 수 없습니다.');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'user_name', v_user_name,
    'temp_password', v_temp_password
  );
END;
$$;
