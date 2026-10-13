/**
 * 마자 장학 사이트 목록·등록 (2026-10-14 개정 — 인증 필수). `Authorization: Bearer <PARTNER_API_KEY>`.
 * 이전에는 GET 이 partner_sites 전체(소유자 이메일 포함)를 인증 없이 돌려줬다.
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
      const podId = b.assigned_pod_id === undefined || b.assigned_pod_id === null ? 'planner' : b.assigned_pod_id;
      if (!validPod(podId)) return res.status(400).json({ success: false, error: 'invalid assigned_pod_id' });

      const timestamp = new Date().toISOString();
      const record = {
        domain,
        site_name: short(b.site_name, 200) || domain,
        assigned_pod_id: podId,
        owner_email: normalizeEmail(b.owner_email),
        owner_phone: null,
        hosting_provider: short(b.hosting_provider, 64) || 'vercel_maza',
        plan_type: short(b.plan_type, 64) || 'maza_scholarship_1yr',
        metadata: b.metadata && typeof b.metadata === 'object' && !Array.isArray(b.metadata) ? b.metadata : {},
        status: 'active',
        created_at: timestamp,
        updated_at: timestamp,
      };
      const { error } = await supabase.from('partner_sites').upsert([record], { onConflict: 'domain' });
      if (error) {
        console.error('[Partner Sites] upsert failed:', error.message);
        return res.status(503).json({ success: false, db_persisted: false, error: 'Could not save the registration', detail: { code: error.code || null, message: String(error.message || '').slice(0, 200) } }); // 인증을 통과한 호출자(마자 서버)에게만 간다
      }
      return res.status(200).json({
        success: true,
        db_persisted: true,
        domain,
        assigned_pod_id: podId,
        embed_url: `https://setupod.com/embed/${podId}?domain=${encodeURIComponent(domain)}`,
      });
    } catch (err) {
      console.error('[Partner Sites Register Error]:', err && err.message);
      return res.status(500).json({ success: false, error: 'Internal registration error' });
    }
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.from('partner_sites').select('*').order('created_at', { ascending: false }).limit(200);
      if (error) return res.status(500).json({ success: false, error: 'Internal query error' });
      return res.status(200).json({ success: true, count: (data || []).length, sites: data || [] });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Internal query error' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
