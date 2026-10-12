-- SETUPOD Supabase partner_leads RLS & Permissive Access SQL
-- Supabase 대시보드 (Project: xhjauoabxybaksvbtcic) SQL Editor에서 실행

-- 1. partner_leads 테이블 RLS 정책 활성화 및 공개 INSERT 허용
ALTER TABLE IF EXISTS public.partner_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert partner_leads" ON public.partner_leads;
CREATE POLICY "Anyone can insert partner_leads" ON public.partner_leads
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view partner_leads" ON public.partner_leads;
CREATE POLICY "Public can view partner_leads" ON public.partner_leads
  FOR SELECT USING (true);

-- 2. leads 테이블도 공개 INSERT 허용 (보조 저장소)
ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;
CREATE POLICY "Anyone can insert leads" ON public.leads
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view leads" ON public.leads;
CREATE POLICY "Public can view leads" ON public.leads
  FOR SELECT USING (true);
