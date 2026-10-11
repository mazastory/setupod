// BrewOak Degassing & Peak Flavor Engine v1.0
(function () {
  'use strict';

  // --- Degassing Science Parameters by Roast Level ---
  const ROAST_PROFILES = {
    light: {
      nameKo: "약배전 (Light Roast)",
      nameEn: "Light Roast",
      restDays: 7,
      peakStart: 10,
      peakEnd: 21,
      fadeAfter: 30,
      tempAdviceKo: "추출 수온 93-95°C 추천 (조직이 단단해 높은 온도로 성분을 녹입니다)",
      tempAdviceEn: "Brew at 93-95°C (dense cell structure requires higher water temp)",
      statusMessagesKo: {
        tooEarly: "이산화탄소가 왕성하게 방출 중입니다. 지금 내리면 가스 거품으로 인해 맹맹하거나 풋내가 날 수 있어요.",
        ready: "가스가 안정되고 있습니다. 화사한 산미가 슬슬 피어오르는 시기입니다.",
        peak: "향미 만개(Peak)! 자스민, 꽃, 과일의 섬세한 아로마가 가장 완벽하게 터져 나오는 골든 타임입니다.",
        fading: "산미가 차분해지고 단맛 위주로 넘어가는 단계입니다. 밀폐 보관에 유의하세요."
      }
    },
    medium: {
      nameKo: "중배전 (Medium Roast)",
      nameEn: "Medium Roast",
      restDays: 4,
      peakStart: 7,
      peakEnd: 16,
      fadeAfter: 28,
      tempAdviceKo: "추출 수온 91-93°C 추천 (단맛과 산미의 균형이 가장 좋습니다)",
      tempAdviceEn: "Brew at 91-93°C (ideal for sweet, balanced extraction)",
      statusMessagesKo: {
        tooEarly: "원두 내부 가스가 아직 많습니다. 2~3일만 더 기다려 주세요.",
        ready: "안정화 단계 진입. 부드러운 산미와 단맛이 조화롭게 올라옵니다.",
        peak: "최고의 밸런스(Peak)! 밀크초콜릿, 너티한 단맛과 깔끔한 바디감이 최정점입니다.",
        fading: "향미가 서서히 가라앉고 있습니다. 빠른 시일 내에 소진을 권장합니다."
      }
    },
    dark: {
      nameKo: "강배전 (Dark Roast)",
      nameEn: "Dark Roast",
      restDays: 3,
      peakStart: 5,
      peakEnd: 12,
      fadeAfter: 21,
      tempAdviceKo: "추출 수온 88-90°C 추천 (쓴맛과 탄 맛을 억제하고 묵직한 오일을 살립니다)",
      tempAdviceEn: "Brew at 88-90°C (lower temp prevents harsh bitterness and preserves rich body)",
      statusMessagesKo: {
        tooEarly: "표면에 오일과 가스가 빠르게 반응 중입니다. 1~2일 뒤 추출을 권장합니다.",
        ready: "가스가 빠르게 안정되었습니다. 진한 풍미가 준비되었습니다.",
        peak: "묵직한 바디감(Peak)! 다크초콜릿, 스모키한 스위트니스와 오일감이 절정입니다.",
        fading: "오일 성분이 산화되기 쉬우니 직사광선을 피해 서늘한 곳에 밀폐 보관하세요."
      }
    }
  };

  // --- Character Expressions SVG ---
  const FACES = {
    idle: `<g class="bob"><use href="#barrel"/><use href="#lid"/>
      <ellipse cx="49" cy="77" rx="4.5" ry="6" fill="#2A211B"/><circle cx="50.5" cy="75" r="1.8" fill="#fff"/>
      <ellipse cx="71" cy="77" rx="4.5" ry="6" fill="#2A211B"/><circle cx="72.5" cy="75" r="1.8" fill="#fff"/>
      <path d="M55 86 Q60 90 65 86" stroke="#2A211B" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>`,
    waiting: `<g class="bob"><use href="#barrel"/><use href="#lid"/>
      <path d="M44 77 Q49 81 54 77 M66 77 Q71 81 76 77" stroke="#2A211B" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <ellipse cx="60" cy="88" rx="2.6" ry="2.2" fill="#2A211B"/></g>
      <circle class="bubble" cx="38" cy="22" r="6" fill="#FFF7E8" stroke="#C9B79C" stroke-width="1.5"/>
      <circle class="bubble" cx="50" cy="14" r="4" fill="#FFF7E8" stroke="#C9B79C" stroke-width="1.5"/>
      <circle class="bubble" cx="30" cy="10" r="3" fill="#FFF7E8" stroke="#C9B79C" stroke-width="1.5"/>`,
    peak: `<g class="bob"><use href="#barrel"/><use href="#lid"/>
      <ellipse cx="49" cy="76" rx="5" ry="6.5" fill="#2A211B"/><circle cx="50.8" cy="73.6" r="2" fill="#fff"/>
      <ellipse cx="71" cy="76" rx="5" ry="6.5" fill="#2A211B"/><circle cx="72.8" cy="73.6" r="2" fill="#fff"/>
      <path d="M52 84 Q60 93 68 84 Q60 88 52 84 Z" fill="#6B2E22" stroke="#2A211B" stroke-width="2" stroke-linejoin="round"/></g>
      <path d="M100 22 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 Z" fill="#F2C14E"/>
      <path d="M18 40 l1.5 3.5 l3.5 1.5 l-3.5 1.5 l-1.5 3.5 l-1.5 -3.5 l-3.5 -1.5 l3.5 -1.5 Z" fill="#F2C14E"/>`
  };

  // State
  let currentRoast = 'medium';
  let roastDate = new Date(); // Default today

  // DOM Elements
  const elStage = document.getElementById('brewStage');
  const elSpeech = document.getElementById('speechBubble');
  const elRoastDateInput = document.getElementById('roastDateInput');
  const elDaysPassed = document.getElementById('daysPassed');
  const elStatusBadge = document.getElementById('statusBadge');
  const elStatusHeadline = document.getElementById('statusHeadline');
  const elStatusDetail = document.getElementById('statusDetail');
  const elPeakRange = document.getElementById('peakRange');
  const elTempAdvice = document.getElementById('tempAdvice');
  const elGaugeFill = document.getElementById('gaugeFill');
  const elGaugeMarker = document.getElementById('gaugeMarker');

  function setFace(faceKey) {
    if (elStage && FACES[faceKey]) {
      elStage.innerHTML = `<svg viewBox="0 0 120 130" role="img" aria-label="브루 마스코트">${FACES[faceKey]}</svg>`;
    }
  }

  function setSpeech(text) {
    if (elSpeech) elSpeech.textContent = text;
  }

  function formatDate(d) {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}.${m}.${day}`;
  }

  function addDays(d, days) {
    const res = new Date(d);
    res.setDate(res.getDate() + days);
    return res;
  }

  function calculateDegassing() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rDate = new Date(elRoastDateInput.value);
    rDate.setHours(0, 0, 0, 0);

    // Difference in days
    const diffTime = today - rDate;
    const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

    elDaysPassed.textContent = `${diffDays}일 차`;

    const profile = ROAST_PROFILES[currentRoast];

    // Peak start and end dates
    const peakStartDate = addDays(rDate, profile.peakStart);
    const peakEndDate = addDays(rDate, profile.peakEnd);
    elPeakRange.textContent = `${formatDate(peakStartDate)} ~ ${formatDate(peakEndDate)}`;
    elTempAdvice.textContent = profile.tempAdviceKo;

    // Status evaluation
    let statusClass = "status-ready";
    let badgeText = "숙성 진행 중";
    let headlineText = "";
    let detailText = "";
    let faceKey = "idle";
    let speech = "";

    if (diffDays < profile.restDays) {
      statusClass = "status-early";
      badgeText = "⚠️ 휴지기 (Resting)";
      headlineText = "아직 이산화탄소가 많아요! (잠시 대기)";
      detailText = profile.statusMessagesKo.tooEarly;
      faceKey = "waiting";
      speech = `로스팅 후 ${profile.restDays}일째부터 향미가 서서히 올라옵니다.`;
    } else if (diffDays >= profile.peakStart && diffDays <= profile.peakEnd) {
      statusClass = "status-peak";
      badgeText = "🔥 절정기 (Peak Window)";
      headlineText = "지금이 바로 최고의 골든 타임입니다!";
      detailText = profile.statusMessagesKo.peak;
      faceKey = "peak";
      speech = "향미와 단맛이 절정에 달했어요! 지금 바로 내려보세요 ☕";
    } else if (diffDays < profile.peakStart) {
      statusClass = "status-ready";
      badgeText = "🌿 안정화 단계 (Ready)";
      headlineText = "원두가 안정화되었습니다. (마시기 좋은 시기)";
      detailText = profile.statusMessagesKo.ready;
      faceKey = "idle";
      speech = "이제 마셔도 좋아요! 앞으로 며칠간 향이 더 풍성해집니다.";
    } else {
      statusClass = "status-fading";
      badgeText = "🍂 완만기 (Fading)";
      headlineText = "향미가 차분해진 단계입니다.";
      detailText = profile.statusMessagesKo.fading;
      faceKey = "idle";
      speech = "산미가 잦아들었지만 고소한 단맛으로 즐길 수 있습니다.";
    }

    elStatusBadge.className = `status-badge ${statusClass}`;
    elStatusBadge.textContent = badgeText;
    elStatusHeadline.textContent = headlineText;
    elStatusDetail.textContent = detailText;
    setFace(faceKey);
    setSpeech(speech);

    // Update Visual Gauge (0% ~ 100%, capped at 30 days)
    const pct = Math.min(100, Math.max(0, (diffDays / profile.fadeAfter) * 100));
    if (elGaugeFill) elGaugeFill.style.width = `${pct}%`;
    if (elGaugeMarker) elGaugeMarker.style.left = `${pct}%`;
  }

  function init() {
    // Default date: 3 days ago for rich initial visualization
    const initDate = addDays(new Date(), -3);
    const y = initDate.getFullYear();
    const m = (initDate.getMonth() + 1).toString().padStart(2, '0');
    const d = initDate.getDate().toString().padStart(2, '0');
    elRoastDateInput.value = `${y}-${m}-${d}`;

    // Date change event
    elRoastDateInput.addEventListener('change', calculateDegassing);

    // Quick Date Steppers (-1d, -3d, -7d, 오늘)
    document.querySelectorAll('[data-date-delta]').forEach(btn => {
      btn.addEventListener('click', () => {
        const delta = parseInt(btn.dataset.dateDelta, 10);
        const target = addDays(new Date(), delta);
        const ty = target.getFullYear();
        const tm = (target.getMonth() + 1).toString().padStart(2, '0');
        const td = target.getDate().toString().padStart(2, '0');
        elRoastDateInput.value = `${ty}-${tm}-${td}`;
        calculateDegassing();
      });
    });

    // Roast Selector Buttons
    document.querySelectorAll('[data-roast]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-roast]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentRoast = btn.dataset.roast;
        calculateDegassing();
      });
    });

    calculateDegassing();
  }

  init();
})();
