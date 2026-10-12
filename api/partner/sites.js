const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || "https://xhjauoabxybaksvbtcic.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoamF1b2FieHliYWtzdmJ0Y2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzg0NzQsImV4cCI6MjEwNDYxNDQ3NH0.wBK3-8IIq3JKYbMrVlLtx6rRPRmhCblm74EwL_3PxBY";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || null;

const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, supabaseKey);

const SITES_BACKUP_LEDGER = '/tmp/setupod_partner_sites_ledger.jsonl';

function appendSiteLedger(siteObj) {
  try {
    fs.appendFileSync(SITES_BACKUP_LEDGER, JSON.stringify(siteObj) + '\n', 'utf8');
  } catch (e) {}
}

function readSiteLedger() {
  try {
    if (!fs.existsSync(SITES_BACKUP_LEDGER)) return [];
    return fs.readFileSync(SITES_BACKUP_LEDGER, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map(line => { try { return JSON.parse(line); } catch(e) { return null; } })
      .filter(Boolean);
  } catch (e) {
    return [];
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST: 마자 장학 무료 사이트 도메인 & 기본 탑재 팟 정보 등록 수신
  if (req.method === 'POST') {
    try {
      const {
        domain,
        site_name,
        assigned_pod_id,
        owner_email,
        owner_phone,
        hosting_provider,
        plan_type,
        metadata
      } = req.body || {};

      if (!domain) {
        return res.status(400).json({ success: false, error: 'domain is required' });
      }

      const timestamp = new Date().toISOString();
      const normalizedDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
      const podId = assigned_pod_id || 'planner';

      const siteRecord = {
        domain: normalizedDomain,
        site_name: site_name || normalizedDomain,
        assigned_pod_id: podId,
        owner_email: owner_email ? owner_email.trim().toLowerCase() : null,
        owner_phone: owner_phone || null,
        hosting_provider: hosting_provider || 'vercel_maza',
        plan_type: plan_type || 'maza_scholarship_1yr',
        metadata: metadata || {},
        status: 'active',
        created_at: timestamp,
        updated_at: timestamp
      };

      // 1. 안전 파일 원장에 백업
      appendSiteLedger(siteRecord);

      // 2. 셋업팟 DB (partner_sites) 저장 시도
      let dbSaved = false;
      try {
        const { error } = await supabase.from('partner_sites').upsert([siteRecord], { onConflict: 'domain' });
        if (!error) dbSaved = true;
      } catch (err) {}

      // 3. 발급된 임베드 링크 반환
      return res.status(200).json({
        success: true,
        domain: normalizedDomain,
        assigned_pod_id: podId,
        db_persisted: dbSaved,
        embed_url: `https://setupod.com/embed/${podId}?domain=${encodeURIComponent(normalizedDomain)}`,
        message: 'Scholarship site successfully registered with SETUPOD'
      });
    } catch (err) {
      console.error('[Partner Sites Register Error]:', err);
      return res.status(500).json({ success: false, error: 'Internal registration error' });
    }
  }

  // GET: 등록된 마자 무료 장학 사이트 도메인 전체 목록 조회
  if (req.method === 'GET') {
    try {
      let sites = [];
      try {
        const { data, error } = await supabase
          .from('partner_sites')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);
        if (!error && Array.isArray(data)) sites = data;
      } catch (e) {}

      // 로컬 원장 데이터 병합
      const localSites = readSiteLedger();
      const seen = new Set(sites.map(s => s.domain));
      for (const loc of localSites) {
        if (!seen.has(loc.domain)) {
          seen.add(loc.domain);
          sites.push(loc);
        }
      }

      return res.status(200).json({
        success: true,
        count: sites.length,
        sites
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Internal query error' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
