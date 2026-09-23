-- SETUPOD Supabase Project Schema SQL
-- Supabase 대시보드 -> SQL Editor 에서 'Run'을 누르면 1초 만에 생성됩니다.

-- 1. 유저 프로필 테이블 (고유 슬러그 및 계정 정보)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Creator',
  handle TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  theme TEXT DEFAULT 'violet',
  tier TEXT DEFAULT 'FREE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 유저별 컴포넌트 팟 데이터 (3D 명함, 카카오, 인스타, 링크 등)
-- slug 는 개인 고유 슬러그 (예: 'alex') 또는 기업/팀원 네임스페이스 (예: 'setupod/alex') 지원
CREATE TABLE IF NOT EXISTS public.pods (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  components_json JSONB NOT NULL DEFAULT '[]'::JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 기존에 생성된 테이블을 위한 안전한 고유 인덱스 생성
CREATE UNIQUE INDEX IF NOT EXISTS pods_slug_idx ON public.pods(slug);

-- 3. 리드 수집 DB 테이블 (고객 전화번호 및 문의)
CREATE TABLE IF NOT EXISTS public.leads (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_slug TEXT NOT NULL,
  phone TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 페이지 뷰 (조회수 통계) 테이블
CREATE TABLE IF NOT EXISTS public.page_views (
  id BIGSERIAL PRIMARY KEY,
  target_slug TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS page_views_slug_idx ON public.page_views(target_slug);

-- RLS (Row Level Security) 설정
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- 누구나 프로필 및 팟 정보는 읽을 수 있음 (공개 프로필)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public pods are viewable by everyone" ON public.pods;
CREATE POLICY "Public pods are viewable by everyone" ON public.pods FOR SELECT USING (true);

-- 본인만 자기 프로필/팟 수정 가능
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can manage own pods" ON public.pods;
CREATE POLICY "Users can manage own pods" ON public.pods FOR ALL USING (auth.uid() = user_id);

-- 리드 수집은 누구나 INSERT 가능 (방문자 연락처 등록)
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;
CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
-- 리드 확인은 본인만 가능
DROP POLICY IF EXISTS "Leads are viewable by owner only" ON public.leads;
CREATE POLICY "Leads are viewable by owner only" ON public.leads FOR SELECT USING (auth.uid() = user_id);

-- 페이지 뷰 생성은 누구나 가능 (비로그인 방문자 포함)
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);

-- 페이지 뷰 조회를 위해서는 pods 테이블과 조인하여 소유자 확인이 필요하지만, 대시보드 로드 시 보안을 위해 일단 모두 읽기 허용 또는 특정 백엔드 뷰 사용.
-- 간편한 연동을 위해 임시로 읽기 권한을 열어둡니다 (실 서비스 배포 전 고도화 필요).
DROP POLICY IF EXISTS "Page views are viewable by everyone" ON public.page_views;
CREATE POLICY "Page views are viewable by everyone" ON public.page_views FOR SELECT USING (true);

-- 4. BrewOak 숙성통 작업 테이블 (비동기 결과 저장)
CREATE TABLE IF NOT EXISTS public.brewoak_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  memo TEXT NOT NULL,
  target_days INT NOT NULL DEFAULT 1,
  threads_out TEXT,
  insta_out TEXT,
  kakao_out TEXT,
  unlock_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.brewoak_jobs ENABLE ROW LEVEL SECURITY;

-- 본인만 자신의 글을 읽을 수 있음
DROP POLICY IF EXISTS "Users can view own brewoak jobs" ON public.brewoak_jobs;
CREATE POLICY "Users can view own brewoak jobs" ON public.brewoak_jobs FOR SELECT USING (auth.uid() = user_id);

-- Edge Function(Service Role) 등에서만 INSERT/UPDATE 가능하게 제한하거나, 클라이언트에서 바로 INSERT 가능하게 할지 결정.
-- 클라이언트에서 바로 INSERT 하는 것을 허용 (Edge Function에서 바로 업데이트)
DROP POLICY IF EXISTS "Users can insert own brewoak jobs" ON public.brewoak_jobs;
CREATE POLICY "Users can insert own brewoak jobs" ON public.brewoak_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own brewoak jobs" ON public.brewoak_jobs;
CREATE POLICY "Users can update own brewoak jobs" ON public.brewoak_jobs FOR UPDATE USING (auth.uid() = user_id);
