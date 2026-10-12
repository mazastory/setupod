-- SETUPOD Supabase partner_leads 완전 동기화 및 RLS 허용 SQL
-- 셋업팟 Supabase 대시보드 (Project: xhjauoabxybaksvbtcic) -> SQL Editor 에서 Run 실행

-- 1. partner_leads 테이블 및 컬럼 보장 생성
CREATE TABLE IF NOT EXISTS public.partner_leads (
  id BIGSERIAL PRIMARY KEY,
  domain TEXT NOT NULL DEFAULT 'setupod.com',
  email TEXT NOT NULL,
  phone TEXT,
  kakao_id TEXT,
  name TEXT,
  source TEXT DEFAULT 'lead_magnet_widget',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기존 테이블이 있더라도 신규 컬럼 안전 추가
ALTER TABLE public.partner_leads ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.partner_leads ADD COLUMN IF NOT EXISTS kakao_id TEXT;
ALTER TABLE public.partner_leads ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.partner_leads ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.partner_leads ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'lead_magnet_widget';

-- 2. partner_leads RLS 정책 활성화 및 누구나 INSERT/SELECT 허용
ALTER TABLE public.partner_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert partner_leads" ON public.partner_leads;
CREATE POLICY "Anyone can insert partner_leads" ON public.partner_leads
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view partner_leads" ON public.partner_leads;
CREATE POLICY "Public can view partner_leads" ON public.partner_leads
  FOR SELECT USING (true);

-- 3. leads 테이블도 공개 INSERT 허용 (보조 백업 저장소)
ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;
CREATE POLICY "Anyone can insert leads" ON public.leads
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view leads" ON public.leads;
CREATE POLICY "Public can view leads" ON public.leads
  FOR SELECT USING (true);
