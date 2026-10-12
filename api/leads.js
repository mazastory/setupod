const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || "https://xhjauoabxybaksvbtcic.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoamF1b2FieHliYWtzdmJ0Y2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzg0NzQsImV4cCI6MjEwNDYxNDQ3NH0.wBK3-8IIq3JKYbMrVlLtx6rRPRmhCblm74EwL_3PxBY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { domain, email, contact, lead_type, source } = req.body || {};

      if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
      }

      // 셋업팟 DB에 저장 (partner_leads 테이블)
      const { data, error } = await supabase
        .from('partner_leads')
        .insert([{
          domain: domain || 'setupod.com',
          email: email.trim().toLowerCase(),
          contact: contact || null,
          lead_type: lead_type || 'general',
          source: source || 'web',
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('[SETUPOD Lead Error]:', error.message);
        return res.status(200).json({ success: true, saved: false });
      }

      return res.status(200).json({ success: true, saved: true });
    } catch (err) {
      console.error('[SETUPOD Lead Fatal]:', err);
      return res.status(200).json({ success: true, saved: false });
    }
  }

  // GET: 대시보드 통계 조회
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('partner_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        return res.status(200).json({ success: true, leads: [] });
      }

      return res.status(200).json({ success: true, leads: data || [] });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Internal error' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
