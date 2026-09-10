/**
 * SETUPOD Supabase SDK Client
 * Supabase Project: xhjauoabxybaksvbtcic
 */

const SUPABASE_URL = "https://xhjauoabxybaksvbtcic.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoamF1b2FieHliYWtzdmJ0Y2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzg0NzQsImV4cCI6MjEwNDYxNDQ3NH0.wBK3-8IIq3JKYbMrVlLtx6rRPRmhCblm74EwL_3PxBY";

// Supabase 클라이언트 초기화
let supabaseClient = null;

if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// 1. 카카오 간편 로그인
async function signInWithKakao() {
  if (!supabaseClient) return alert("Supabase 클라이언트가 초기화되지 않았습니다.");
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: window.location.origin + window.location.pathname
    }
  });
  if (error) console.error("Kakao login error:", error);
}

// 2. 구글 간편 로그인
async function signInWithGoogle() {
  if (!supabaseClient) return alert("Supabase 클라이언트가 초기화되지 않았습니다.");
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname
    }
  });
  if (error) console.error("Google login error:", error);
}

// 3. 이메일/비밀번호 간편 가입
async function signUpWithEmail(email, password) {
  if (!supabaseClient) return;
  return await supabaseClient.auth.signUp({ email, password });
}

// 4. 이메일 로그인
async function signInWithEmail(email, password) {
  if (!supabaseClient) return;
  return await supabaseClient.auth.signInWithPassword({ email, password });
}

// 5. 로그아웃
async function signOutUser() {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
  window.location.reload();
}

// 6. 현재 세션 / 유저 가져오기
async function getCurrentUser() {
  if (!supabaseClient) return null;
  const { data: { session } } = await supabaseClient.auth.getSession();
  return session ? session.user : null;
}

// 7. 내 팟(Pod) & 프로필 클라우드 동기화 (저장)
async function syncPodToCloud(slug, profileData, componentsData) {
  const user = await getCurrentUser();
  if (!user) return { error: "로그인이 필요합니다." };

  // 프로필 업데이트/생성
  const { error: profileErr } = await supabaseClient
    .from('profiles')
    .upsert({
      id: user.id,
      slug: slug,
      name: profileData.name,
      handle: profileData.handle,
      bio: profileData.bio,
      theme: profileData.theme || 'violet',
      updated_at: new Date().toISOString()
    });

  if (profileErr) return { error: profileErr.message };

  // 팟 컴포넌트 목록 업데이트/생성 (slug 기준 upsert)
  const { error: podErr } = await supabaseClient
    .from('pods')
    .upsert({
      user_id: user.id,
      slug: slug,
      components_json: componentsData,
      updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

  if (podErr) return { error: podErr.message };

  return { success: true };
}

// 7-2. 팀/기업 명함 일괄 클라우드 저장
async function syncTeamPodsToCloud(companySlug, companyData, members) {
  const user = await getCurrentUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const results = [];
  const cleanCompSlug = companySlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

  for (const m of members) {
    const memberSlug = (m.slug || m.name).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const fullSlug = `${cleanCompSlug}/${memberSlug}`;

    const cardModel = {
      theme: companyData.theme || 'obsidian',
      name: m.name,
      role: m.role,
      company: companyData.company,
      companyWatermark: companyData.watermark || companyData.company,
      slogan: companyData.slogan || '',
      tagline: companyData.tagline || 'ALL-IN-ONE BUSINESS ASSET',
      phone: m.phone || '',
      email: m.email || '',
      moatTags: companyData.tags || ['3D 인터랙티브', 'vCard 주소록 저장', '올인원 멀티링크'],
      primaryAction: {
        url: companyData.websiteUrl || 'https://setupod.com',
        label: companyData.websiteLabel || '공식 웹사이트'
      },
      socials: [
        { type: 'kakao', url: companyData.kakaoUrl || '#', label: companyData.kakaoLabel || '카카오톡' },
        { type: 'instagram', url: companyData.instaUrl || '#', label: companyData.instaLabel || '인스타그램' }
      ],
      logo: {
        src: companyData.logoSrc || 'assets/logo.gif',
        fallback: 'assets/logo.gif',
        alt: companyData.company
      },
      vcard: {
        firstName: m.name,
        org: companyData.company,
        title: m.role,
        tel: m.phone,
        email: m.email,
        url: `https://setupod.com/${fullSlug}`
      }
    };

    const { error: err } = await supabaseClient
      .from('pods')
      .upsert({
        user_id: user.id,
        slug: fullSlug,
        components_json: { card: cardModel },
        updated_at: new Date().toISOString()
      }, { onConflict: 'slug' });

    if (err) {
      console.warn(`Failed to sync pod ${fullSlug}:`, err);
      results.push({ slug: fullSlug, success: false, error: err.message });
    } else {
      results.push({ slug: fullSlug, success: true });
    }
  }

  return { success: true, results };
}

// 8. 클라우드에서 팟 불러오기 (공개 페이지 조회)
async function loadPodFromCloud(slug) {
  if (!supabaseClient) return null;

  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .single();

  const { data: pod } = await supabaseClient
    .from('pods')
    .select('*')
    .eq('slug', slug)
    .single();

  return { profile, pod };
}

// 9. 방문자 리드(전화번호) 클라우드 DB 저장
async function saveLeadToCloud(targetSlug, phone) {
  if (!supabaseClient) return false;
  const { error } = await supabaseClient
    .from('leads')
    .insert({
      target_slug: targetSlug,
      phone: phone,
      metadata: { referrer: document.referrer, userAgent: navigator.userAgent }
    });
  return !error;
}
