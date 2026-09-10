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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 유저별 컴포넌트 팟 데이터 (3D 명함, 카카오, 인스타, 링크 등)
-- slug 는 개인 고유 슬러그 (예: 'alex') 또는 기업/팀원 네임스페이스 (예: 'toomus/alex') 지원
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

-- RLS (Row Level Security) 설정
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 누구나 프로필 및 팟 정보는 읽을 수 있음 (공개 프로필)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public pods are viewable by everyone" ON public.pods FOR SELECT USING (true);

-- 본인만 자기 프로필/팟 수정 가능
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can manage own pods" ON public.pods FOR ALL USING (auth.uid() = user_id);

-- 리드 수집은 누구나 INSERT 가능 (방문자 연락처 등록)
CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
-- 리드 확인은 본인만 가능
CREATE POLICY "Users can view their own leads" ON public.leads FOR SELECT USING (auth.uid() = user_id);
