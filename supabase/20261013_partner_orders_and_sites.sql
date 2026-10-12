-- SETUPOD ↔ MAZA 파트너십 주문 원장 및 장학 도메인 테이블 생성 SQL
-- 셋업팟 Supabase (xhjauoabxybaksvbtcic) SQL Editor에서 실행

-- 1. 마켓플레이스 주문 원장 테이블 (partner_orders)
CREATE TABLE IF NOT EXISTS public.partner_orders (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  domain TEXT NOT NULL,
  pod_id TEXT NOT NULL,
  buyer_email TEXT,
  buyer_phone TEXT,
  sale_price NUMERIC DEFAULT 0,
  maza_commission NUMERIC DEFAULT 0,
  setupod_payout NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'card',
  license_key TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'maza_store',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS partner_orders_domain_idx ON public.partner_orders(domain);
CREATE INDEX IF NOT EXISTS partner_orders_pod_idx ON public.partner_orders(pod_id);

ALTER TABLE public.partner_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can insert partner_orders" ON public.partner_orders;
CREATE POLICY "Public can insert partner_orders" ON public.partner_orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can view partner_orders" ON public.partner_orders;
CREATE POLICY "Public can view partner_orders" ON public.partner_orders FOR SELECT USING (true);


-- 2. 마자 무료 장학 지원 사이트 도메인 관제 테이블 (partner_sites)
CREATE TABLE IF NOT EXISTS public.partner_sites (
  domain TEXT PRIMARY KEY,
  site_name TEXT,
  assigned_pod_id TEXT NOT NULL DEFAULT 'planner',
  owner_email TEXT,
  owner_phone TEXT,
  hosting_provider TEXT DEFAULT 'vercel_maza',
  plan_type TEXT DEFAULT 'maza_scholarship_1yr',
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.partner_sites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can upsert partner_sites" ON public.partner_sites;
CREATE POLICY "Public can upsert partner_sites" ON public.partner_sites FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update partner_sites" ON public.partner_sites;
CREATE POLICY "Public can update partner_sites" ON public.partner_sites FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public can view partner_sites" ON public.partner_sites;
CREATE POLICY "Public can view partner_sites" ON public.partner_sites FOR SELECT USING (true);
