-- ==========================================
-- 모의 크라우드펀딩 시스템 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하십시오.
-- ==========================================

-- 1. 행사 테이블 (events)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  session TEXT NOT NULL,
  event_date DATE NOT NULL,
  base_credit INTEGER NOT NULL DEFAULT 10000,
  min_investment INTEGER NOT NULL DEFAULT 2000,
  max_investment INTEGER NOT NULL DEFAULT 5000,
  current_stage TEXT NOT NULL DEFAULT 'PREPARING' CHECK (current_stage IN ('PREPARING', 'REGISTRATION', 'FUNDING_OPEN', 'FUNDING_CLOSED', 'RANKING_PUBLISHED')),
  is_ranking_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 팀 테이블 (teams)
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  team_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, team_number)
);

-- 3. 사전 명단 테이블 (roster: 화이트리스트 가입 허용 기준)
CREATE TABLE IF NOT EXISTS public.roster (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'JUDGE', 'ADMIN')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, email)
);

-- 4. 회원 프로필 테이블 (users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  department TEXT NOT NULL,
  student_number TEXT NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'JUDGE', 'ADMIN')),
  privacy_agreed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. 프로젝트 테이블 (projects)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL UNIQUE REFERENCES public.teams(id) ON DELETE CASCADE,
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
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. 투자 테이블 (investments)
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount >= 2000 AND amount <= 5000),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(investor_id, project_id) -- 1인당 팀별 1회 투자 보장
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_investments_event ON public.investments(event_id);
CREATE INDEX IF NOT EXISTS idx_investments_investor ON public.investments(investor_id);
CREATE INDEX IF NOT EXISTS idx_investments_project ON public.investments(project_id);

-- =======================================================
-- 원자적 트랜잭션 함수: 동시성 방지 및 잔여 크레딧 완벽 검증
-- =======================================================
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

  -- 이번 변경으로 필요로 하는 추가 크레딧
  v_available_credit := (v_event.base_credit - v_used_credit) + v_current_team_amount;

  IF p_amount > v_available_credit THEN
    RETURN jsonb_build_object('success', false, 'error', '잔여 크레딧이 부족합니다. 사용 가능한 크레딧: ' || v_available_credit);
  END IF;

  -- 5. 저장 또는 금액 수정
  IF FOUND THEN
    UPDATE public.investments
    SET amount = p_amount, updated_at = now()
    WHERE id = v_existing_investment.id;
  ELSE
    INSERT INTO public.investments (event_id, investor_id, project_id, team_id, amount)
    VALUES (p_event_id, p_investor_id, p_project_id, v_project.team_id, p_amount);
  END IF;

  RETURN jsonb_build_object('success', true, 'amount', p_amount);
END;
$$;
