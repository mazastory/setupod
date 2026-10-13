/**
 * 파트너(마자) 전용 API 공용 도구 — 2026-10-14
 *
 * 왜 만들었나: /api/partner/sites · /api/partner/domain-register 가 인증 없이 열려 있었다(10/14 확인).
 *  · GET 은 partner_sites 전체(소유자 이메일·전화 포함)를 누구에게나 돌려줬고
 *  · POST 는 누구나 어떤 도메인이든 등록·덮어쓸 수 있었다. 브라우저에서 곧바로 불러서(CORS *) 열쇠를 숨길 곳도 없었다.
 *
 * 규칙: `Authorization: Bearer <PARTNER_API_KEY>` 가 맞아야 한다. 환경변수가 없으면 **항상 거절**(fail-closed).
 *       호출은 **마자 서버가** 한다(회원 브라우저가 아니다) — 그래서 CORS 를 열지 않는다.
 */
const crypto = require('crypto');

const PARTNER_API_KEY = process.env.PARTNER_API_KEY || '';

function authorized(req) {
  if (!PARTNER_API_KEY) return false;
  const h = String((req.headers && req.headers['authorization']) || '');
  const given = h.startsWith('Bearer ') ? h.slice(7) : '';
  const a = Buffer.from(given);
  const b = Buffer.from(PARTNER_API_KEY);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const DOMAIN_RE = /^(?=.{3,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const POD_RE = /^[a-z0-9_-]{1,64}$/;
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

function normalizeDomain(v) {
  if (typeof v !== 'string') return '';
  return v.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
}
const validDomain = (d) => DOMAIN_RE.test(d);
const validPod = (p) => typeof p === 'string' && POD_RE.test(p);
const normalizeEmail = (e) => (typeof e === 'string' && EMAIL_RE.test(e.trim().toLowerCase()) && e.length <= 254 ? e.trim().toLowerCase() : null);
const short = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : null);

module.exports = { authorized, normalizeDomain, validDomain, validPod, normalizeEmail, short };
