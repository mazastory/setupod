const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || "https://xhjauoabxybaksvbtcic.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoamF1b2FieHliYWtzdmJ0Y2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzg0NzQsImV4cCI6MjEwNDYxNDQ3NH0.wBK3-8IIq3JKYbMrVlLtx6rRPRmhCblm74EwL_3PxBY";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || null;

const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, supabaseKey);

const ORDERS_BACKUP_LEDGER = '/tmp/setupod_orders_ledger.jsonl';

function appendOrderLedger(orderObj) {
  try {
    fs.appendFileSync(ORDERS_BACKUP_LEDGER, JSON.stringify(orderObj) + '\n', 'utf8');
  } catch (e) {}
}

function readOrderLedger() {
  try {
    if (!fs.existsSync(ORDERS_BACKUP_LEDGER)) return [];
    return fs.readFileSync(ORDERS_BACKUP_LEDGER, 'utf8')
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

  // POST: 마자 결제 완료 웹훅 수신
  if (req.method === 'POST') {
    try {
      const {
        order_id,
        domain,
        pod_id,
        buyer_email,
        buyer_phone,
        sale_price,
        maza_commission,
        setupod_payout,
        payment_method,
        source
      } = req.body || {};

      if (!order_id || !domain || !pod_id) {
        return res.status(400).json({
          success: false,
          error: 'Missing required order fields: order_id, domain, and pod_id are required'
        });
      }

      const timestamp = new Date().toISOString();
      const normalizedDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
      const licenseKey = `LIC_${pod_id.toUpperCase()}_${Buffer.from(normalizedDomain).toString('hex').slice(0, 8)}_${Date.now().toString(36)}`;

      const orderRecord = {
        order_id: String(order_id),
        domain: normalizedDomain,
        pod_id: String(pod_id),
        buyer_email: buyer_email ? buyer_email.trim().toLowerCase() : null,
        buyer_phone: buyer_phone || null,
        sale_price: Number(sale_price) || 0,
        maza_commission: Number(maza_commission) || 0,
        setupod_payout: Number(setupod_payout) || 0,
        payment_method: payment_method || 'card',
        source: source || 'maza_store',
        license_key: licenseKey,
        status: 'completed',
        created_at: timestamp
      };

      // 1. 안전 파일 원장에 백업 (유실 방지)
      appendOrderLedger(orderRecord);

      // 2. 셋업팟 DB (partner_orders) 저장 시도
      let dbSaved = false;
      try {
        const { error } = await supabase.from('partner_orders').insert([orderRecord]);
        if (!error) dbSaved = true;
      } catch (err) {}

      // 3. 결제 완료 응답 & 즉시 장착 가능한 임베드 코드 반환
      return res.status(200).json({
        success: true,
        order_id: orderRecord.order_id,
        domain: normalizedDomain,
        pod_id: orderRecord.pod_id,
        license_key: licenseKey,
        db_persisted: dbSaved,
        embed: {
          iframe_url: `https://setupod.com/embed/${pod_id}?domain=${encodeURIComponent(normalizedDomain)}&license=${encodeURIComponent(licenseKey)}`,
          script_code: `<iframe src="https://setupod.com/embed/${pod_id}?domain=${encodeURIComponent(normalizedDomain)}&license=${encodeURIComponent(licenseKey)}" style="width:100%; height:680px; border:none; border-radius:18px;" allow="clipboard-write"></iframe>`
        },
        message: 'Order processed successfully & license key issued'
      });
    } catch (err) {
      console.error('[Marketplace Order Fatal]:', err);
      return res.status(500).json({ success: false, error: 'Internal order error' });
    }
  }

  // GET: 주문 내역 목록 조회
  if (req.method === 'GET') {
    try {
      let orders = [];
      try {
        const { data, error } = await supabase
          .from('partner_orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        if (!error && Array.isArray(data)) orders = data;
      } catch (e) {}

      // 로컬 원장 데이터 병합
      const localOrders = readOrderLedger();
      const seen = new Set(orders.map(o => o.order_id));
      for (const loc of localOrders) {
        if (!seen.has(loc.order_id)) {
          seen.add(loc.order_id);
          orders.push(loc);
        }
      }

      return res.status(200).json({
        success: true,
        count: orders.length,
        orders
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Internal query error' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
