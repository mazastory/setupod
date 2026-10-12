const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || "https://xhjauoabxybaksvbtcic.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoamF1b2FieHliYWtzdmJ0Y2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzg0NzQsImV4cCI6MjEwNDYxNDQ3NH0.wBK3-8IIq3JKYbMrVlLtx6rRPRmhCblm74EwL_3PxBY";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || null;

const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, supabaseKey);

const DOMAINS_BACKUP_LEDGER = '/tmp/setupod_domain_register_ledger.jsonl';

function appendDomainLedger(record) {
  try {
    fs.appendFileSync(DOMAINS_BACKUP_LEDGER, JSON.stringify(record) + '\n', 'utf8');
  } catch (e) {}
}

function readDomainLedger() {
  try {
    if (!fs.existsSync(DOMAINS_BACKUP_LEDGER)) return [];
    return fs.readFileSync(DOMAINS_BACKUP_LEDGER, 'utf8')
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

  // POST: 마자 장학 팟 배정 시 도메인 등록 수신
  if (req.method === 'POST') {
    try {
      const {
        domain,
        pod_id,
        scholarship_granted,
        user_email,
        user_phone,
        site_name,
        created_at
      } = req.body || {};

      if (!domain) {
        return res.status(400).json({ success: false, error: 'domain is required' });
      }

      const normalizedDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
      const podId = pod_id || 'planner';
      const timestamp = created_at || new Date().toISOString();

      const domainRecord = {
        domain: normalizedDomain,
        assigned_pod_id: podId,
        site_name: site_name || normalizedDomain,
        owner_email: user_email ? user_email.trim().toLowerCase() : null,
        owner_phone: user_phone || null,
        scholarship_granted: scholarship_granted !== undefined ? scholarship_granted : true,
        hosting_provider: 'vercel_maza',
        plan_type: 'maza_scholarship_1yr',
        status: 'active',
        created_at: timestamp,
        updated_at: timestamp
      };

      // 1. 안전 파일 원장에 백업 (어떤 상황에서도 유실 방지)
      appendDomainLedger(domainRecord);

      // 2. 셋업팟 DB (partner_sites) 저장 시도
      let dbSaved = false;
      try {
        const { error } = await supabase
          .from('partner_sites')
          .upsert([domainRecord], { onConflict: 'domain' });
        if (!error) dbSaved = true;
      } catch (err) {}

      return res.status(200).json({
        success: true,
        domain: normalizedDomain,
        pod_id: podId,
        scholarship_granted: domainRecord.scholarship_granted,
        db_persisted: dbSaved,
        embed_url: `https://setupod.com/embed/${podId}?domain=${encodeURIComponent(normalizedDomain)}`,
        message: 'Domain registered successfully in SETUPOD registry'
      });
    } catch (err) {
      console.error('[Domain Register Fatal]:', err);
      return res.status(500).json({ success: false, error: 'Internal domain registration error' });
    }
  }

  // GET: 등록된 도메인 목록 조회 (대시보드 연동용)
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
      const localDomains = readDomainLedger();
      const seen = new Set(sites.map(s => s.domain));
      for (const loc of localDomains) {
        if (!seen.has(loc.domain)) {
          seen.add(loc.domain);
          sites.push(loc);
        }
      }

      return res.status(200).json({
        success: true,
        count: sites.length,
        domains: sites
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Internal query error' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
