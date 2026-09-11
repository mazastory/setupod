/**
 * SETUPOD Dynamic Card Renderer Engine
 * Author: SETUPOD Team
 */

let cardData = null;
let qrcodeObj = null;

// URL 파라미터 또는 경로에서 회사 및 카드 slug 추출
// 지원 형식:
// 1. setupod.com/nexus/alex -> company: 'nexus', slug: 'alex'
// 2. setupod.com/alex -> company: null, slug: 'alex'
// 3. ?id=alex 또는 ?id=setupod
function getCardIdentifier() {
  const urlParams = new URLSearchParams(window.location.search);
  const qId = urlParams.get('id') || urlParams.get('card');
  const qComp = urlParams.get('company') || urlParams.get('org');
  if (qId) return { company: qComp || null, slug: qId.toLowerCase() };

  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts.length >= 2 && !pathParts[0].includes('.html')) {
    if (pathParts[0] === 'card') {
      return { company: null, slug: pathParts[1].toLowerCase() };
    }
    return { company: pathParts[0].toLowerCase(), slug: pathParts[1].toLowerCase() };
  }
  if (pathParts.length === 1 && !pathParts[0].includes('.html')) {
    if (pathParts[0] === 'card') return { company: null, slug: 'setupod' };
    return { company: null, slug: pathParts[0].toLowerCase() };
  }
  return { company: null, slug: 'setupod' };
}

function getCardSlug() {
  return getCardIdentifier().slug;
}

// 테마 스타일시트 동적 주입
function applyTheme(themeName) {
  const existingThemeLink = document.getElementById('themeStylesheet');
  const themeHref = `themes/${themeName || 'violet'}.css`;
  
  if (existingThemeLink) {
    existingThemeLink.href = themeHref;
  } else {
    const link = document.createElement('link');
    link.id = 'themeStylesheet';
    link.rel = 'stylesheet';
    link.href = themeHref;
    document.head.appendChild(link);
  }
}

// 텍스트를 거꾸로 분해하여 워터마크 세로 텍스트 생성
function renderWatermark(text) {
  const container = document.getElementById('watermarkContainerFront');
  const containerBack = document.getElementById('watermarkContainerBack');
  if (!text) return;

  // 글자들을 역순으로 뒤집어서 상단부터 배치되게
  const letters = text.toUpperCase().split('').reverse();
  const html = letters.map(char => `<span>${char}</span>`).join('');

  if (container) container.innerHTML = html;
  if (containerBack) containerBack.innerHTML = html;
}

// Lucide 아이콘 매핑 헬퍼
function getSocialIconSvg(type) {
  if (type === 'kakao') {
    return `<svg viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px;flex-shrink:0;color:#ffd978;">
      <path d="M12 3C6.48 3 2 6.48 2 10.77C2 13.52 3.82 15.93 6.6 17.21L5.7 20.55C5.6 20.93 6.03 21.23 6.36 21.01L10.38 18.34C10.91 18.41 11.45 18.45 12 18.45C17.52 18.45 22 14.97 22 10.77C22 6.48 17.52 3 12 3Z" />
    </svg>`;
  }
  if (type === 'instagram') {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;flex-shrink:0;color:#f472b6;">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
    </svg>`;
  }
  return `<i data-lucide="globe" style="width:14px;height:14px;color:#38bdf8;"></i>`;
}

// 내부 2x2 액션 버튼 바인딩
function renderActionDocks(data) {
  const docks = [
    document.getElementById('insideActionDockFront'),
    document.getElementById('insideActionDockBack')
  ];

  const primaryAction = data.primaryAction || {
    url: '#',
    label: '웹사이트 바로가기',
    icon: 'sparkles'
  };

  const socials = data.socials || [];
  const social1 = socials[0] || null;
  const social2 = socials[1] || null;

  docks.forEach(dock => {
    if (!dock) return;

    let row1 = `
      <div class="inside-action-row">
        <button class="btn-action btn-save" onclick="event.stopPropagation(); downloadVCard();" title="주소록에 연락처 저장">
          <i data-lucide="user-plus" style="width: 15px; height: 15px;"></i>
          <span>연락처 저장</span>
        </button>
        <a href="${primaryAction.url}" target="_blank" rel="noopener noreferrer" class="btn-action btn-glass" onclick="event.stopPropagation()" title="${primaryAction.label}">
          <i data-lucide="${primaryAction.icon || 'sparkles'}" style="width: 15px; height: 15px;"></i>
          <span>${primaryAction.label}</span>
        </a>
      </div>
    `;

    let social1Btn = '';
    if (social1) {
      if (social1.type === 'social_modal') {
        social1Btn = `
          <button class="btn-action btn-glass" onclick="event.stopPropagation(); openSocialModal();" title="${social1.label}">
            <i data-lucide="${social1.icon || 'globe'}" style="width: 14px; height: 14px; color: #38bdf8;"></i>
            <span>${social1.label}</span>
          </button>
        `;
      } else {
        social1Btn = `
          <a href="${social1.url}" target="_blank" rel="noopener noreferrer" class="btn-action btn-glass" onclick="event.stopPropagation()" title="${social1.label}">
            ${getSocialIconSvg(social1.type)}
            <span>${social1.label}</span>
          </a>
        `;
      }
    }

    let social2Btn = '';
    if (social2) {
      if (social2.type === 'social_modal') {
        social2Btn = `
          <button class="btn-action btn-glass" onclick="event.stopPropagation(); openSocialModal();" title="${social2.label}">
            <i data-lucide="${social2.icon || 'globe'}" style="width: 14px; height: 14px; color: #38bdf8;"></i>
            <span>${social2.label}</span>
          </button>
        `;
      } else {
        social2Btn = `
          <a href="${social2.url}" target="_blank" rel="noopener noreferrer" class="btn-action btn-glass" onclick="event.stopPropagation()" title="${social2.label}">
            ${getSocialIconSvg(social2.type)}
            <span>${social2.label}</span>
          </a>
        `;
      }
    }

    let row2 = `
      <div class="inside-action-row">
        ${social1Btn}
        ${social2Btn}
      </div>
    `;

    dock.innerHTML = row1 + row2;
  });
}

// 소셜 채널 모달 채우기
function renderSocialModal(data) {
  const modalList = document.getElementById('socialModalList');
  if (!modalList) return;

  const socialModalItem = (data.socials || []).find(s => s.type === 'social_modal');
  if (!socialModalItem || !socialModalItem.channels) {
    modalList.innerHTML = '';
    return;
  }

  const itemsHtml = socialModalItem.channels.map(channel => `
    <a href="${channel.url}" target="_blank" rel="noopener noreferrer" class="channel-row">
      <div class="channel-left">
        <i data-lucide="${channel.icon || 'globe'}" style="width: 18px; height: 18px;"></i>
        <div class="channel-info">
          <span class="channel-name">${channel.name}</span>
          <span class="channel-handle">${channel.id}</span>
        </div>
      </div>
      <div class="channel-right">
        <span class="channel-badge">${channel.badge}</span>
        <i data-lucide="chevron-right" style="width: 16px; height: 16px; color: rgba(255,255,255,0.4);"></i>
      </div>
    </a>
  `).join('');

  modalList.innerHTML = itemsHtml;
}

// 메인 데이터 바인딩
function populateCard(data) {
  cardData = data;

  // 레이아웃 적용
  const layout = data.layout || 'classic';
  const layoutStylesheet = document.getElementById('layoutStylesheet');
  if (layoutStylesheet) {
    layoutStylesheet.href = layout === 'classic' ? '' : `themes/layout-${layout}.css`;
  }
  const cardElement = document.getElementById('cardElement');
  if (cardElement) {
    cardElement.classList.remove('layout-classic', 'layout-metal', 'layout-visual');
    cardElement.classList.add(`layout-${layout}`);
  }

  // 테마 적용
  applyTheme(data.theme);

  // 브라우저 타이틀 및 OG 태그
  if (data.meta) {
    document.title = data.meta.title || `${data.company} | ${data.name} 디지털 명함`;
  }

  // 워터마크
  renderWatermark(data.companyWatermark || data.company);

  // 로고 이미지
  const frontLogoImg = document.getElementById('frontLogoImg');
  const backLogoImg = document.getElementById('backLogoImg');
  if (data.logo) {
    if (frontLogoImg) {
      frontLogoImg.src = data.logo.src;
      frontLogoImg.alt = data.logo.alt || data.company;
      if (data.logo.fallback) {
        frontLogoImg.onerror = () => { frontLogoImg.src = data.logo.fallback; };
      }
    }
    if (backLogoImg) {
      backLogoImg.src = data.logo.src;
      backLogoImg.alt = data.logo.alt || data.company;
      if (data.logo.fallback) {
        backLogoImg.onerror = () => { backLogoImg.src = data.logo.fallback; };
      }
    }
  }

  // 앞면 정보 바인딩
  const frontTagline = document.getElementById('frontTagline');
  const frontCompany = document.getElementById('frontCompany');
  const frontSlogan = document.getElementById('frontSlogan');
  if (frontTagline) frontTagline.innerText = data.tagline || '';
  if (frontCompany) frontCompany.innerText = data.company || '';
  if (frontSlogan) frontSlogan.innerText = data.slogan || '';

  // 뒷면 정보 바인딩
  const backTagline = document.getElementById('backTagline');
  const backCompany = document.getElementById('backCompany');
  const backSlogan = document.getElementById('backSlogan');
  const roleTitle = document.getElementById('roleTitle');
  const nameTitle = document.getElementById('nameTitle');
  if (backTagline) backTagline.innerText = data.tagline || '';
  if (backCompany) backCompany.innerText = data.company || '';
  if (backSlogan) backSlogan.innerText = data.slogan || '';
  if (roleTitle) roleTitle.innerText = data.role || '';
  if (nameTitle) nameTitle.innerText = data.name || '';

  // 연락처 정보 바인딩
  const phoneLink = document.getElementById('phoneLink');
  const phoneKey = document.getElementById('phoneKey');
  const phoneValue = document.getElementById('phoneValue');
  if (phoneLink && data.phone) {
    phoneLink.href = `tel:${data.phone}`;
    if (phoneKey) phoneKey.innerText = data.phoneLabel || 'T';
    if (phoneValue) phoneValue.innerText = data.phone;
  }

  const emailLink = document.getElementById('emailLink');
  const emailKey = document.getElementById('emailKey');
  const emailValue = document.getElementById('emailValue');
  if (emailLink && data.email) {
    emailLink.href = `mailto:${data.email}`;
    if (emailKey) emailKey.innerText = data.emailLabel || 'E';
    if (emailValue) emailValue.innerText = data.email;
  }

  // 해자 태그 (Moat Tags) 바인딩
  const frontMoatTags = document.getElementById('frontMoatTags');
  const backMoatTags = document.getElementById('backMoatTags');
  const tagsHtml = (data.moatTags || []).map(tag => `<span class="moat-tag">${tag}</span>`).join('');
  if (frontMoatTags) frontMoatTags.innerHTML = tagsHtml;
  if (backMoatTags) backMoatTags.innerHTML = tagsHtml;

  // 액션 독 바인딩
  renderActionDocks(data);

  // 소셜 모달 바인딩
  renderSocialModal(data);

  // Lucide Icons 다시 렌더링
  if (window.lucide) {
    lucide.createIcons();
  }
}

// 3D Flip Card Toggle
function toggleCardFlip() {
  const scene = document.getElementById('cardScene');
  if (scene) scene.classList.toggle('flipped');
}

// Touch Slide / Swipe Detection for 3D Flip
let touchStartX = 0;
let touchEndX = 0;

function setupSwipe() {
  const cardSceneEl = document.getElementById('cardScene');
  if (!cardSceneEl) return;

  cardSceneEl.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  cardSceneEl.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diffX = touchEndX - touchStartX;
    if (Math.abs(diffX) > 40) {
      toggleCardFlip();
    }
  }, { passive: true });
}

// QR Code Modal
function initQrCode() {
  const qrTarget = document.getElementById('qrContainer');
  if (!qrTarget) return;
  qrTarget.innerHTML = "";
  qrcodeObj = new QRCode(qrTarget, {
    text: window.location.href,
    width: 160,
    height: 160,
    colorDark: "#100a24",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

function openShareModal() {
  const modal = document.getElementById('shareModal');
  if (modal) {
    modal.classList.add('active');
    if (!qrcodeObj) {
      initQrCode();
    }
  }
}

function closeShareModal() {
  const modal = document.getElementById('shareModal');
  if (modal) modal.classList.remove('active');
}

function handleModalBgClick(e) {
  if (e.target.id === 'shareModal') {
    closeShareModal();
  }
}

// Social Channels Modal
function openSocialModal() {
  const modal = document.getElementById('socialModal');
  if (modal) modal.classList.add('active');
}

function closeSocialModal() {
  const modal = document.getElementById('socialModal');
  if (modal) modal.classList.remove('active');
}

function handleSocialModalBgClick(e) {
  if (e.target.id === 'socialModal') {
    closeSocialModal();
  }
}

// Toast
function showToast(msg) {
  const toast = document.getElementById('toastMsg');
  const toastText = document.getElementById('toastText');
  if (!toast) return;
  if (toastText) toastText.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

// Copy URL
function copyCardUrl() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    showToast("명함 링크가 복사되었습니다!");
    closeShareModal();
  }).catch(() => {
    showToast("링크 복사에 실패했습니다.");
  });
}

// Native Web Share
function nativeShare() {
  if (navigator.share) {
    navigator.share({
      title: (cardData && cardData.meta) ? cardData.meta.title : "SETUPOD 디지털 명함",
      text: (cardData && cardData.company) ? `${cardData.company} 공식 디지털 명함입니다.` : "공식 디지털 명함입니다.",
      url: window.location.href
    }).catch(() => {});
  } else {
    copyCardUrl();
  }
}

// Dynamic vCard Download
function downloadVCard() {
  if (!cardData || !cardData.vcard) {
    showToast("연락처 정보를 찾을 수 없습니다.");
    return;
  }
  const v = cardData.vcard;
  const vcardData = `BEGIN:VCARD
VERSION:3.0
N:${v.lastName || ''};${v.firstName || ''};;;
FN:${v.formattedName || cardData.name}
ORG:${v.org || cardData.company}
TITLE:${v.title || cardData.role}
TEL;TYPE=WORK,VOICE:${v.tel || cardData.phone}
EMAIL;TYPE=WORK,INTERNET:${v.email || cardData.email}
URL;TYPE=WORK:${v.url || cardData.website || ''}
NOTE:${v.note || cardData.slogan || ''}
END:VCARD`;

  const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(v.formattedName || cardData.name).replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("연락처 파일(vCard)이 다운로드되었습니다!");
}

// 클라우드 프로필을 3D 명함 모델로 매핑
function populateCardFromCloud(cloud, company) {
  const p = cloud.profile || {};
  const podJson = (cloud.pod && cloud.pod.components_json) ? cloud.pod.components_json : null;

  // 1. 직접 저장된 고품질 명함 객체(card)가 있는 경우 바로 렌더링
  if (podJson && podJson.card && podJson.card.company && podJson.card.name) {
    populateCard(podJson.card);
    return;
  }
  if (podJson && podJson.company && podJson.name) {
    populateCard(podJson);
    return;
  }

  const role = p.handle ? p.handle.replace(/@\w+\s*[·•-]?\s*/, '').trim() : 'Creator';
  const companyName = company ? company.toUpperCase() : (p.handle && p.handle.includes('@') ? p.handle.split('·')[0].replace('@', '').trim().toUpperCase() : 'SETUPOD');

  const cardModel = {
    slug: p.slug,
    layout: p.layout || 'classic',
    theme: p.theme || 'violet',
    company: companyName,
    companyWatermark: companyName,
    slogan: p.bio || 'ALL-IN-ONE BUSINESS ASSET & 3D CARD',
    tagline: 'ALL-IN-ONE BUSINESS ASSET',
    role: role || '대표',
    name: p.name || 'Member',
    phone: p.phone || '010-0000-0000',
    email: p.email || 'contact@setupod.com',
    moatTags: ['3D 인터랙티브', 'vCard 자동저장', '올인원 멀티링크'],
    logo: {
      src: p.avatar_url || 'assets/setupod.gif',
      fallback: 'assets/setupod.gif',
      alt: companyName
    },
    primaryAction: {
      url: `link.html?id=${p.slug}`,
      label: '멀티링크 바로가기',
      icon: 'link'
    },
    socials: [
      {
        type: 'kakao',
        url: 'https://open.kakao.com',
        label: '카카오톡 채널',
        color: '#ffd978'
      },
      {
        type: 'instagram',
        url: 'https://instagram.com',
        label: '인스타그램'
      }
    ],
    vcard: {
      firstName: p.name || 'Member',
      org: companyName,
      title: role || '대표',
      tel: p.phone || '010-0000-0000',
      email: p.email || 'contact@setupod.com',
      note: p.bio || ''
    },
    meta: {
      title: `${companyName} | ${p.name} 디지털 명함`,
      siteName: companyName
    }
  };

  populateCard(cardModel);
}

// 초기화 진입점
async function initCardEngine() {
  const { company, slug } = getCardIdentifier();

  // 1. Supabase 클라우드에서 검색 시도
  if (typeof loadPodFromCloud === 'function') {
    try {
      const searchSlug = company ? `${company}/${slug}` : slug;
      let cloud = await loadPodFromCloud(searchSlug);
      if (!cloud || !cloud.profile) {
        cloud = await loadPodFromCloud(slug);
      }
      if (cloud && cloud.profile) {
        populateCardFromCloud(cloud, company);
        setupSwipe();
        return;
      }
    } catch (e) {
      console.log("Cloud card fetch fallback:", e);
    }
  }

  // 2. 로컬 JSON 파일 폴백
  const paths = company ? [`cards/${company}_${slug}.json`, `cards/${slug}.json`] : [`cards/${slug}.json`];
  let loaded = false;
  for (const p of paths) {
    try {
      const res = await fetch(p);
      if (res.ok) {
        const data = await res.json();
        populateCard(data);
        loaded = true;
        break;
      }
    } catch (e) {}
  }

  // 3. 기본 setupod 명함 폴백
  if (!loaded) {
    try {
      const fallbackRes = await fetch(`cards/setupod.json`);
      const fallbackData = await fallbackRes.json();
      populateCard(fallbackData);
    } catch (e) {
      showToast("명함 데이터를 불러오지 못했습니다.");
    }
  }

  setupSwipe();
}

window.addEventListener('DOMContentLoaded', initCardEngine);
