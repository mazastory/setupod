/**
 * 셋업팟 무료 자료 신청 리드 (2026-10-14 개정)
 *
 * ── 무엇이 문제였나 (10/14 확인) ───────────────────────────────────────────
 *  · GET /api/leads 가 **인증 없이 누구에게나** 이메일·전화·카카오 ID 를 돌려줬다(CORS *).
 *  · POST 는 동의 값을 보지 않았고 이메일 형식도 검사하지 않았다. 전화·카카오 ID·이름·raw_contact 까지 저장했다.
 *  · DB 저장이 실패해도 `success:true, saved:true` 로 답했다.
 *  · 개인정보를 서버리스 /tmp 파일에 따로 쌓고 GET 이 그걸 합쳐 보여 줬다.
 *
 * ── 지금 규칙 ───────────────────────────────────────────────────────────────
 *  · GET: `Authorization: Bearer <LEADS_ADMIN_TOKEN>` 이 맞아야 한다. 환경변수가 없으면 **항상 거절**(fail-closed).
 *  · POST: 필수 동의(consent === true) + 이메일 형식 검사. 이메일(과 자료 정보)만 저장한다.
 *  · 저장이 안 되면 성공이라고 답하지 않는다.
 *  · 마자(캔두코리아)로의 전달은 이 파일이 아니라 방문자가 [선택] 에 체크했을 때 브라우저가 따로 보낸다(js/lead-magnet.js).
 */
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xhjauoabxybaksvbtcic.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoamF1b2FieHliYWtzdmJ0Y2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzg0NzQsImV4cCI6MjEwNDYxNDQ3NH0.wBK3-8IIq3JKYbMrVlLtx6rRPRmhCblm74EwL_3PxBY';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || null;
const LEADS_ADMIN_TOKEN = process.env.LEADS_ADMIN_TOKEN || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);

const ALLOWED_ORIGINS = new Set(['https://setupod.com', 'https://www.setupod.com']);
// 로컬 파트는 영숫자·._%+- 만(HTML·따옴표·수식 문자 금지) — 관리자 화면·CSV 로 흘러갈 값이다
const EMAIL_RE = /^[A-Za-z0-9][A-Za-z0-9._%+-]{0,63}@[A-Za-z0-9.-]{1,255}\.[A-Za-z]{2,}$/;

// 서버리스라 인스턴스마다 따로지만, 한 인스턴스에 몰리는 단순 반복은 막는다.
const hits = new Map();
function tooMany(ip, now = Date.now(), limit = 5, windowMs = 10 * 60 * 1000) {
  const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > limit;
}

function isAdmin(req) {
  if (!LEADS_ADMIN_TOKEN) return false; // 설정이 없으면 열지 않는다
  const h = String(req.headers['authorization'] || '');
  const given = h.startsWith('Bearer ') ? h.slice(7) : '';
  const a = Buffer.from(given);
  const b = Buffer.from(LEADS_ADMIN_TOKEN);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const short = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : null);

module.exports = async (req, res) => {
  const origin = String(req.headers['origin'] || '');
  if (ALLOWED_ORIGINS.has(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    try {
      const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
      if (tooMany(ip)) return res.status(429).json({ success: false, error: 'Too many requests' });

      const b = req.body || {};
      const rawEmail = typeof b.email === 'string' ? b.email : (b.contact && typeof b.contact.email === 'string' ? b.contact.email : '');
      const email = rawEmail.trim().toLowerCase();
      if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
      if (email.length > 254 || !EMAIL_RE.test(email)) return res.status(400).json({ success: false, error: 'Invalid email' });
      if (b.consent !== true) return res.status(400).json({ success: false, error: 'Consent is required' });

      const timestamp = new Date().toISOString();
      const record = {
        domain: short(b.domain, 253) || 'setupod.com',
        email,
        phone: null,
        kakao_id: null,
        name: null,
        pod_id: short(b.pod_id, 64) || 'planner',
        gift_name: short(b.gift_name, 200) || short(b.gift_title, 200),
        source: short(b.source, 64) || 'lead_magnet_widget',
        metadata: {
          lead_type: short(b.lead_type, 64) || 'general',
          consent: true,
          consent_version: short(b.consent_version, 64) || 'unknown',
          provide_to_maza: b.provide_to_maza === true,
          collected_at: timestamp,
        },
        created_at: timestamp,
      };

      const { error } = await supabase.from('partner_leads').insert([record]);
      if (error) {
        console.error('[SETUPOD Lead] insert failed:', error.message);
        return res.status(503).json({ success: false, saved: false, error: 'Could not save the request' });
      }
      return res.status(200).json({ success: true, saved: true, lead_type: record.metadata.lead_type });
    } catch (err) {
      console.error('[SETUPOD Lead Fatal]:', err && err.message);
      return res.status(500).json({ success: false, error: 'Server processing error' });
    }
  }

  if (req.method === 'GET') {
    if (!isAdmin(req)) return res.status(401).json({ success: false, error: 'Unauthorized' });
    try {
      const { data, error } = await supabase
        .from('partner_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(150);
      if (error) return res.status(500).json({ success: false, error: 'Internal query error' });
      return res.status(200).json({ success: true, count: (data || []).length, leads: data || [] });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Internal query error' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};

module.exports._test = { tooMany, isAdmin };
