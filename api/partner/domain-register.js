/**
 * 마자 장학 팟 배정 → 셋업팟 도메인 등록 수신 (2026-10-14 개정 — 인증 필수)
 * 호출자: 마자 스튜디오 **서버**(회원 브라우저가 아니다). `Authorization: Bearer <PARTNER_API_KEY>` 필요.
 * 이전에는 인증이 없었고(누구나 등록·덮어쓰기·전체 목록 조회), `scholarship_granted` 컬럼이 없는 표에 넣으려다
 * 저장이 조용히 실패해도 `success:true` 로 답했다. 지금은 저장되지 않으면 성공이라고 하지 않는다.
 */
const { createClient } = require('@supabase/supabase-js');
const { authorized, normalizeDomain, validDomain, validPod, normalizeEmail, short } = require('../_partner');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xhjauoabxybaksvbtcic.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoamF1b2FieHliYWtzdmJ0Y2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzg0NzQsImV4cCI6MjEwNDYxNDQ3NH0.wBK3-8IIq3JKYbMrVlLtx6rRPRmhCblm74EwL_3PxBY';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || null;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!authorized(req)) return res.status(401).json({ success: false, error: 'Unauthorized' });

  if (req.method === 'POST') {
    try {
      const b = req.body || {};
      const domain = normalizeDomain(b.domain);
      if (!domain || !validDomain(domain)) return res.status(400).json({ success: false, error: 'valid domain is required' });
      const podId = b.pod_id === undefined || b.pod_id === null ? 'planner' : b.pod_id;
      if (!validPod(podId)) return res.status(400).json({ success: false, error: 'invalid pod_id' });

      // [2026-10-14] 도메인에 세트(팟)를 여러 개 붙일 수 있다(최대 3). 첫 번째가 대표 팟(assigned_pod_id)이다.
      let podIds = [podId];
      if (b.pod_ids !== undefined) {
        const list = Array.isArray(b.pod_ids) ? b.pod_ids : [];
        const clean = [...new Set(list)];
        if (clean.length < 1 || clean.length > 3 || !clean.every(validPod)) {
          return res.status(400).json({ success: false, error: 'invalid pod_ids' });
        }
        podIds = clean;
      }

      const timestamp = new Date().toISOString();
      const record = {
        domain,
        assigned_pod_id: podIds[0],
        site_name: short(b.site_name, 200) || domain,
        owner_email: normalizeEmail(b.user_email),
        owner_phone: null,
        hosting_provider: 'vercel_maza',
        plan_type: 'maza_scholarship_1yr',
        metadata: {
          scholarship_granted: b.scholarship_granted !== false,
          pod_ids: podIds,
          source: short(b.source, 64) || 'maza_studio_scholarship',
          maza_user_id: short(b.user_id, 64),
        },
        status: 'active',
        updated_at: timestamp,
      };

      const { error } = await supabase.from('partner_sites').upsert([{ ...record, created_at: timestamp }], { onConflict: 'domain' });
      if (error) {
        console.error('[Domain Register] upsert failed:', error.message);
        return res.status(503).json({ success: false, db_persisted: false, error: 'Could not save the registration', detail: { code: error.code || null, message: String(error.message || '').slice(0, 200) } }); // 인증을 통과한 호출자(마자 서버)에게만 간다
      }
      return res.status(200).json({
        success: true,
        db_persisted: true,
        domain,
        pod_id: podIds[0],
        pod_ids: podIds,
        embed_url: `https://setupod.com/embed/${podIds[0]}?domain=${encodeURIComponent(domain)}`,
      });
    } catch (err) {
      console.error('[Domain Register Fatal]:', err && err.message);
      return res.status(500).json({ success: false, error: 'Internal domain registration error' });
    }
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.from('partner_sites').select('*').order('created_at', { ascending: false }).limit(200);
      if (error) return res.status(500).json({ success: false, error: 'Internal query error' });
      return res.status(200).json({ success: true, count: (data || []).length, domains: data || [] });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Internal query error' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
