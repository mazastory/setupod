/**
 * SETUPOD ↔ MAZA Lead Magnet Engine (v1.0)
 * 모달 리드 수집 및 MAZA Supabase & SETUPOD 듀얼 동기화
 */
(function(window) {
  'use strict';

  var LEAD_CONFIGS = {
    'mazaus.com': {
      title: '해외 송금·환전 수수료 80% 절감 가이드',
      desc: '페이팔/와이즈 숨겨진 환전 수수료를 0.5% 미만으로 낮추는 2026 시크릿 가이드북을 무료로 드립니다.',
      badge: '💰 mazaus.com 특별 리포트',
      leadType: 'fx_guide',
      downloadUrl: 'https://setupod.com/assets/leads/mazaus_fx_guide.html',
      themeColor: '#38bdf8'
    },
    'autosite.kr': {
      title: '스마트스토어·쿠팡 마진 1초 계산 시뮬레이터',
      desc: '로켓그로스 역마진을 사전에 차단하는 마진율 엑셀/노션 템플릿 & 세무 체크리스트를 즉시 다운로드하세요.',
      badge: '📊 autosite.kr 이커머스 자산',
      leadType: 'margin_calc',
      downloadUrl: 'https://setupod.com/assets/leads/autosite_margin_calc.html',
      themeColor: '#34d399'
    },
    'brewoak.com': {
      title: '스페셜티 커피 골든 브루잉 & 디개싱 캘린더',
      desc: '로스팅 포인트별 최적의 디개싱 일수와 추출 황금 비율 치트시트를 무료로 보내드립니다.',
      badge: '☕ brewoak.com 커피 랩',
      leadType: 'brewing_cheatsheet',
      downloadUrl: 'https://setupod.com/assets/leads/brewoak_cheatsheet.html',
      themeColor: '#fbbf24'
    },
    'default': {
      title: '2026 비즈니스 턴키 OS 올인원 스타터 키트',
      desc: '1초 만에 가동되는 인터랙티브 웹 팟과 고체류율 트래픽 확보 비법을 담은 스타터 키트를 무료 제공합니다.',
      badge: '🚀 SETUPOD 비즈니스 스타터',
      leadType: 'starter_kit',
      downloadUrl: 'https://setupod.com/assets/leads/setupod_starter_kit.html',
      themeColor: '#a855f7'
    }
  };

  var LeadMagnet = {
    domain: null,
    config: null,
    modalEl: null,
    hasShown: false,

    init: function(options) {
      options = options || {};
      var host = options.domain || window.location.hostname.replace(/^www\./, '');
      this.domain = host;
      this.config = LEAD_CONFIGS[host] || LEAD_CONFIGS['default'];

      this.injectStyles();
      this.buildModal();

      // 30초 후 또는 스크롤 70% 도달 시 자동 제안
      this.bindTriggers();
    },

    injectStyles: function() {
      if (document.getElementById('lead-magnet-style')) return;
      var style = document.createElement('style');
      style.id = 'lead-magnet-style';
      style.textContent = `
        .lm-overlay {
          position: fixed; inset: 0; z-index: 99999;
          background: rgba(3, 7, 18, 0.75);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px; opacity: 0; pointer-events: none;
          transition: opacity 0.3s ease;
          font-family: 'Pretendard', -apple-system, sans-serif;
        }
        .lm-overlay.active { opacity: 1; pointer-events: auto; }
        .lm-card {
          width: 100%; max-width: 480px;
          background: #111827;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 28px; padding: 36px 32px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7);
          position: relative; color: #f9fafb;
          transform: translateY(20px); transition: transform 0.3s ease;
        }
        .lm-overlay.active .lm-card { transform: translateY(0); }
        .lm-close {
          position: absolute; top: 20px; right: 20px;
          background: rgba(255,255,255,0.06); border: none;
          color: #9ca3af; width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s; font-size: 16px;
        }
        .lm-close:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .lm-badge {
          display: inline-block; padding: 4px 12px; border-radius: 9999px;
          font-size: 12px; font-weight: 800; margin-bottom: 14px;
        }
        .lm-title { font-size: 22px; font-weight: 900; line-height: 1.35; margin-bottom: 10px; color: #fff; }
        .lm-desc { font-size: 13.5px; color: #9ca3af; line-height: 1.6; margin-bottom: 24px; }
        .lm-form { display: flex; flex-direction: column; gap: 12px; }
        .lm-input {
          width: 100%; padding: 14px 16px;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 14px; color: #fff; font-size: 14px; outline: none;
          transition: border-color 0.2s; box-sizing: border-box;
        }
        .lm-input:focus { border-color: #6366f1; }
        .lm-submit {
          width: 100%; padding: 15px; border-radius: 14px;
          border: none; font-size: 14.5px; font-weight: 900;
          cursor: pointer; transition: all 0.2s; color: #fff;
          margin-top: 4px; box-shadow: 0 4px 14px rgba(0,0,0,0.3);
        }
        .lm-submit:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .lm-success { display: none; text-align: center; }
        .lm-btn-download {
          display: inline-block; width: 100%; padding: 15px;
          background: #22c55e; color: #000; font-weight: 900;
          border-radius: 14px; text-decoration: none; font-size: 15px;
          margin-top: 16px; box-sizing: border-box;
        }
      `;
      document.head.appendChild(style);
    },

    buildModal: function() {
      var overlay = document.createElement('div');
      overlay.className = 'lm-overlay';
      overlay.id = 'leadMagnetOverlay';

      var c = this.config;
      overlay.innerHTML = `
        <div class="lm-card">
          <button class="lm-close" onclick="LeadMagnet.close()">✕</button>
          
          <div id="lmFormContainer">
            <span class="lm-badge" style="background:${c.themeColor}22; color:${c.themeColor}; border:1px solid ${c.themeColor}44;">
              ${c.badge}
            </span>
            <h3 class="lm-title">${c.title}</h3>
            <p class="lm-desc">${c.desc}</p>

            <form class="lm-form" onsubmit="LeadMagnet.submit(event)">
              <input type="email" id="lmEmail" class="lm-input" placeholder="받으실 이메일 주소 입력 (필수)" required />
              <input type="text" id="lmContact" class="lm-input" placeholder="이름 또는 카카오톡 ID (선택)" />
              <button type="submit" id="lmBtnSubmit" class="lm-submit" style="background:${c.themeColor};">
                🎁 1초 만에 무료 선물 받기
              </button>
            </form>
            <div style="font-size:11px; color:#6b7280; text-align:center; margin-top:12px;">
              * 스팸 없이 즉시 다운로드 링크가 열립니다. 언제든 구독 해제 가능합니다.
            </div>
          </div>

          <div id="lmSuccessContainer" class="lm-success">
            <div style="font-size:40px; margin-bottom:12px;">🎉</div>
            <h3 class="lm-title">신청이 완료되었습니다!</h3>
            <p class="lm-desc" style="margin-bottom:18px;">소중한 리포트가 준비되었습니다. 아래 버튼을 눌러 지금 바로 확인하세요.</p>
            <a href="${c.downloadUrl}" target="_blank" class="lm-btn-download">
              📥 가이드 & 템플릿 즉시 열기 (PDF)
            </a>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      this.modalEl = overlay;
    },

    open: function() {
      if (this.modalEl) {
        this.modalEl.classList.add('active');
      }
    },

    close: function() {
      if (this.modalEl) {
        this.modalEl.classList.remove('active');
      }
    },

    bindTriggers: function() {
      var self = this;
      // 1. 이미 다운로드 받은 적이 없으면 25초 뒤 부드럽게 노출
      if (!localStorage.getItem('lm_submitted_' + this.domain)) {
        setTimeout(function() {
          if (!self.hasShown) {
            self.hasShown = true;
            self.open();
          }
        }, 25000);
      }
    },

    submit: function(e) {
      e.preventDefault();
      var email = document.getElementById('lmEmail').value.trim();
      var contact = document.getElementById('lmContact').value.trim();
      if (!email) return;

      var btn = document.getElementById('lmBtnSubmit');
      if (btn) btn.innerText = '선물 생성 중...';

      var payload = {
        domain: this.domain,
        email: email,
        contact: contact,
        lead_type: this.config.leadType,
        source: 'lead_magnet_widget',
        created_at: new Date().toISOString()
      };

      // 1. MAZA Studio 백엔드로 비동기 전송
      try {
        fetch('https://mazastudio.kr/api/telemetry/lead', {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(function() {});
      } catch(err) {}

      // 2. SETUPOD 중앙 DB로도 백업 전송 (2-Way)
      try {
        fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(function() {});
      } catch(err) {}

      // 저장 완료 처리 및 즉시 다운로드 화면 전환
      localStorage.setItem('lm_submitted_' + this.domain, 'true');
      document.getElementById('lmFormContainer').style.display = 'none';
      document.getElementById('lmSuccessContainer').style.display = 'block';
    }
  };

  window.LeadMagnet = LeadMagnet;

  // DOM 준비 시 자동 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { LeadMagnet.init(); });
  } else {
    LeadMagnet.init();
  }
})(window);
