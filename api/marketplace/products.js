/**
 * SETUPOD ↔ MAZA Studio Marketplace Product Catalog API
 * 마자 스튜디오 파트너십 스토어 실시간 자동 연동 엔드포인트
 * 
 * 무료 장학 팟(3종) 및 프리미엄 유료 팟(4종) 메타데이터, 가격, 미리보기, 임베드 URL 제공
 */

const PRODUCTS = [
  // ----------------------------------------------------
  // 1. 무료 장학 지원 팟 (3종) - 1년 10만 원 인프라 장학 번들
  // ----------------------------------------------------
  {
    id: "planner",
    tier: "scholarship_free",
    name: "2026 비즈니스 플래너 OS 팟",
    tagline: "매일 할 일 체크, D-Day, 루틴 메모 (고체류율 보장)",
    desc: "1년의 리듬을 설계하는 비즈니스 OS. 연간 Life Compass, 365일 비즈니스 스트릭 잔디밭, 분기 Big Rocks, 뽀모도로 타이머 내장.",
    price: 0,
    original_value: 100000,
    free_gift: {
      title: "2026 비즈니스 턴키 OS 올인원 스타터 키트",
      url: "https://setupod.com/leads/setupod_starter_kit.html"
    },
    preview_url: "https://setupod.com/planner",
    embed_url: "https://setupod.com/embed/planner",
    badge: "🎓 MAZA 1년 장학 무료",
    category: "productivity",
    features: ["연간 목표 Life Compass", "365일 비즈니스 잔디밭", "뽀모도로 몰입 타이머", "모바일/PC 실시간 동기화"]
  },
  {
    id: "bizcard",
    tier: "scholarship_free",
    name: "3D 인터랙티브 디지털 명함 팟",
    tagline: "3D 회전 카드, 원클릭 SNS 연결, 스마트폰 연락처 다이렉트 저장",
    desc: "Three.js 기반 3D 인터랙티브 홀로그램 명함. 방문자의 감탄을 자아내며 원클릭으로 연락처와 SNS 링크를 전달합니다.",
    price: 0,
    original_value: 100000,
    free_gift: {
      title: "2026 해외 셀러 & 프리랜서 송금·환전 수수료 80% 절감 가이드",
      url: "https://setupod.com/leads/mazaus_fx_guide.html"
    },
    preview_url: "https://setupod.com/bizcard/card.html?id=demo",
    embed_url: "https://setupod.com/embed/bizcard",
    badge: "🎓 MAZA 1년 장학 무료",
    category: "branding",
    features: ["3D 회전 & 자이로 센서 반응", "원클릭 vCard 저장", "SNS/메신저 다중 연결", "글로벌 반응형 UI"]
  },
  {
    id: "margin",
    tier: "scholarship_free",
    name: "스마트스토어·쿠팡 마진 1초 계산기 팟",
    tagline: "판매가/원가/플랫폼 수수료 1초 마진율 계산 & 역마진 방지",
    desc: "이커머스 셀러 필수 도구. 로켓그로스 및 네이버 스마트스토어 카테고리별 수수료와 마진을 실시간 시뮬레이션합니다.",
    price: 0,
    original_value: 100000,
    free_gift: {
      title: "스마트스토어·쿠팡 로켓 마진 1초 계산 노션/엑셀 템플릿",
      url: "https://setupod.com/leads/autosite_margin_calc.html"
    },
    preview_url: "https://setupod.com/margin",
    embed_url: "https://setupod.com/embed/margin",
    badge: "🎓 MAZA 1년 장학 무료",
    category: "ecommerce",
    features: ["스마트스토어/쿠팡 로켓 수수료 테이블", "실시간 순수익 슬라이더", "역마진 경고 알림", "셀러 노션 템플릿 연동"]
  },

  // ----------------------------------------------------
  // 2. 마자 스토어 유료 입점 팟 (프리미엄 4종) - 25% 중개 수수료
  // ----------------------------------------------------
  {
    id: "runway",
    tier: "premium",
    name: "스타트업 번레이트 & 런웨이 시뮬레이터",
    tagline: "월 고정비, 투자 잔액, 생존 개월 수를 정밀 그래프로 산출",
    desc: "스타트업과 법인을 위한 데스밸리 돌파 도구. 실시간 월간 지출액을 조정하며 잔여 생존 개월 수(Runway)를 인터랙티브하게 계산합니다.",
    price: 49000,
    commission_rate: 0.25,
    maza_commission: 12250,
    setupod_payout: 36750,
    free_gift: {
      title: "2026 스타트업 런웨이 2배 연장 전략 가이드",
      url: "https://setupod.com/leads/setupod_starter_kit.html"
    },
    preview_url: "https://setupod.com/runway",
    embed_url: "https://setupod.com/embed/runway",
    badge: "🔥 마켓 베스트셀러",
    category: "startup",
    features: ["실시간 번레이트 슬라이더", "생존 D-Day 카운트다운", "데스밸리 구간 경고", "원클릭 PDF 리포트 출력"]
  },
  {
    id: "nomad",
    tier: "premium",
    name: "글로벌 도시 생활비 & 환율 시뮬레이터",
    tagline: "전 세계 거점 도시별 월세/식비/실시간 환율 물가 비교 (mazaus 등 필수)",
    desc: "디지털 노마드와 글로벌 셀러를 위한 도시별 생활비 계산기. 발리, 방콕, 도쿄, 뉴욕, 서울의 물가와 최신 환율을 실시간 비교합니다.",
    price: 39000,
    commission_rate: 0.25,
    maza_commission: 9750,
    setupod_payout: 29250,
    free_gift: {
      title: "전 세계 디지털 노마드 비자 & 세금 최적화 국가 가이드",
      url: "https://setupod.com/leads/setupod_starter_kit.html"
    },
    preview_url: "https://setupod.com/nomad",
    embed_url: "https://setupod.com/embed/nomad",
    badge: "✈️ 글로벌 특화",
    category: "global",
    features: ["전 세계 5대 거점 물가 비교", "실시간 환율 변환 엔진", "노마드 비자 조건 안내", "월 예상 생활비 차트"]
  },
  {
    id: "multilink",
    tier: "premium",
    name: "VIP 인터랙티브 멀티링크 & 결제 연동 팟",
    tagline: "인스타/카카오용 링크트리 + 계좌번호 복사 + 입금 알림톡 연동",
    desc: "고급스러운 다크 글래스모피즘 멀티링크. 단순 링크 모음을 넘어 계좌 복사, 간편 결제 링크, 실시간 프로필 커스텀을 지원합니다.",
    price: 29000,
    commission_rate: 0.25,
    maza_commission: 7250,
    setupod_payout: 21750,
    preview_url: "https://setupod.com/multilink/index.html",
    embed_url: "https://setupod.com/embed/multilink",
    badge: "⚡ 전환율 극대화",
    category: "marketing",
    features: ["반응형 글래스모피즘 카드", "계좌번호 원클릭 복사", "SNS 다중 채널 연결", "초고속 로딩"]
  },
  {
    id: "secret_room",
    tier: "premium",
    name: "VIP 히든 룸 & 시크릿 쿠폰 팟",
    tagline: "특정 퀴즈/패스워드를 푼 VIP에게만 열리는 프리미엄 보너스 룸",
    desc: "방문자의 호기심과 바이럴을 자극하는 인터랙티브 비밀의 방. 시크릿 코드 입력 시 특별 할인 쿠폰과 숨겨진 리소스를 공개합니다.",
    price: 59000,
    commission_rate: 0.25,
    maza_commission: 14750,
    setupod_payout: 44250,
    preview_url: "https://setupod.com/secret_room/index.html",
    embed_url: "https://setupod.com/embed/secret_room",
    badge: "💎 최고 수익성",
    category: "gamification",
    features: ["암호/퀴즈 게이트웨이", "시크릿 쿠폰 원클릭 발급", "VIP 체류시간 대폭 증가", "바이럴 공유 트리거"]
  },
  {
    id: "adsense",
    tier: "premium",
    name: "블로그 애드센스 일매출 & 자산가치 계산기",
    tagline: "일일 방문자 수와 타겟 국가별 예상 월수익 및 Flippa 매각 가치 산출",
    desc: "마자의 수많은 블로거, 워드프레스 운영자를 위한 필수 유틸리티. 예상 CTR과 국가별 eCPM을 실시간 계산하여 웹사이트의 잠재 가치를 시뮬레이션합니다.",
    price: 39000,
    commission_rate: 0.25,
    maza_commission: 9750,
    setupod_payout: 29250,
    free_gift: {
      title: "2026 고단가 애드센스 키워드 100선 & CPC 3배 상승 치트시트",
      url: "https://setupod.com/leads/setupod_starter_kit.html"
    },
    preview_url: "https://setupod.com/adsense/index.html",
    embed_url: "https://setupod.com/embed/adsense",
    badge: "📈 블로거 필수템",
    category: "blog",
    features: ["국가별 eCPM 프리셋", "Flippa 30x 자산가치 산출", "일일/월간 원화 환산 차트", "고단가 키워드 리드 수집"]
  },
  {
    id: "fx",
    tier: "premium",
    name: "해외직구 1초 관부가세 & 카드 수수료 계산기",
    tagline: "실시간 환율 + 카드 수수료(1.2%) + 미국/일본/유럽 통관 과세 1초 계산",
    desc: "해외 구매대행 셀러 및 직구 블로그 필수템. 상품 가격 입력 시 면세 범위($150~$200) 체크 및 복합 관부가세를 실시간 산출합니다.",
    price: 35000,
    commission_rate: 0.25,
    maza_commission: 8750,
    setupod_payout: 26250,
    free_gift: {
      title: "2026 무관세 해외직구 관부가세 절세 가이드북",
      url: "https://setupod.com/leads/mazaus_fx_guide.html"
    },
    preview_url: "https://setupod.com/fx/index.html",
    embed_url: "https://setupod.com/embed/fx",
    badge: "✈️ 해외직구 특화",
    category: "global",
  }
];

const { generate100Products, VERTICALS, ENGINES } = require('./matrix_data.js');

const MATRIX_100_PRODUCTS = generate100Products();

// 핵심 9종 제품과 100개 매트릭스 제품의 완벽한 통합
// id 중복 방지 및 우선순위 보장
const ALL_PRODUCTS = [];
const seenIds = new Set();

for (const p of PRODUCTS) {
  if (!seenIds.has(p.id)) {
    seenIds.add(p.id);
    ALL_PRODUCTS.push(p);
  }
}

for (const p of MATRIX_100_PRODUCTS) {
  if (!seenIds.has(p.id)) {
    seenIds.add(p.id);
    ALL_PRODUCTS.push(p);
  }
}

module.exports = async (req, res) => {
  // CORS 허용 (마자 스튜디오 도메인에서 자유롭게 패치 가능)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { tier, id, category, limit } = req.query || {};

  let filtered = ALL_PRODUCTS;
  if (tier) {
    filtered = filtered.filter(p => p.tier === tier);
  }
  if (id) {
    filtered = filtered.filter(p => p.id === id);
  }
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  if (limit) {
    const num = parseInt(limit, 10);
    if (!isNaN(num) && num > 0) {
      filtered = filtered.slice(0, num);
    }
  }

  return res.status(200).json({
    success: true,
    version: "2026.2.0-100MATRIX",
    partner: "MAZA Studio 🤝 SETUPOD",
    updated_at: new Date().toISOString(),
    total_count: filtered.length,
    matrix_stats: {
      categories_count: VERTICALS.length,
      engines_count: ENGINES.length,
      free_pods_count: ALL_PRODUCTS.filter(p => p.tier === 'scholarship_free').length,
      premium_pods_count: ALL_PRODUCTS.filter(p => p.tier === 'premium').length
    },
    revenue_share_policy: {
      maza_fee_percentage: 25,
      setupod_payout_percentage: 75,
      scholarship_free_support: "1년 인프라 + 호스팅 + 스타터 팟 1개 전액 무상 지원",
      anti_cannibalization: "100개 세부 업종별 독립 팟 분산으로 유저 간 키워드 중복 경쟁 100% 방지"
    },
    categories: VERTICALS.map(v => ({ id: v.cat, name: v.catName })),
    products: filtered
  });
};
