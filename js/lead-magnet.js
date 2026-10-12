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
      downloadUrl: 'https://setupod.com/leads/mazaus_fx_guide.html',
      themeColor: '#38bdf8'
    },
    'autosite.kr': {
      title: '스마트스토어·쿠팡 마진 1초 계산 시뮬레이터',
      desc: '로켓그로스 역마진을 사전에 차단하는 마진율 엑셀/노션 템플릿 & 세무 체크리스트를 즉시 다운로드하세요.',
      badge: '📊 autosite.kr 이커머스 자산',
      leadType: 'margin_calc',
      downloadUrl: 'https://setupod.com/leads/autosite_margin_calc.html',
      themeColor: '#34d399'
    },
    'brewoak.com': {
      title: '스페셜티 커피 골든 브루잉 & 디개싱 캘린더',
      desc: '로스팅 포인트별 최적의 디개싱 일수와 추출 황금 비율 치트시트를 무료로 보내드립니다.',
      badge: '☕ brewoak.com 커피 랩',
      leadType: 'brewing_cheatsheet',
      downloadUrl: 'https://setupod.com/leads/brewoak_cheatsheet.html',
      themeColor: '#fbbf24'
    },
    'default': {
      title: '2026 비즈니스 턴키 OS 올인원 스타터 키트',
      desc: '1초 만에 가동되는 인터랙티브 웹 팟과 고체류율 트래픽 확보 비법을 담은 스타터 키트를 무료 제공합니다.',
      badge: '🚀 SETUPOD 비즈니스 스타터',
      leadType: 'starter_kit',
      downloadUrl: 'https://setupod.com/leads/setupod_starter_kit.html',
      themeColor: '#a855f7'
    }
  };

  var POD_LEAD_MAP = {
    'planner': {
      title: '2026 비즈니스 턴키 OS 올인원 스타터 키트',
      desc: '1초 만에 가동되는 턴키 비즈니스 도구와 트래픽 확보 매뉴얼을 담은 공식 스타터 키트를 무료로 드립니다.',
      badge: '🚀 플래너 팟 공식 스타터',
      leadType: 'starter_kit',
      downloadUrl: 'https://setupod.com/leads/setupod_starter_kit.html',
      themeColor: '#a855f7'
    },
    'bizcard': {
      title: '2026 해외 셀러 & 프리랜서 송금·환전 80% 절감 가이드',
      desc: '페이팔/와이즈 숨겨진 환전 수수료를 0.5% 미만으로 낮추는 2026 시크릿 가이드북을 무료로 드립니다.',
      badge: '💼 3D 명함 팟 특별 리포트',
      leadType: 'fx_guide',
      downloadUrl: 'https://setupod.com/leads/mazaus_fx_guide.html',
      themeColor: '#38bdf8'
    },
    'bizcard3d': {
      title: '2026 해외 셀러 & 프리랜서 송금·환전 80% 절감 가이드',
      desc: '페이팔/와이즈 숨겨진 환전 수수료를 0.5% 미만으로 낮추는 2026 시크릿 가이드북을 무료로 드립니다.',
      badge: '💼 3D 명함 팟 특별 리포트',
      leadType: 'fx_guide',
      downloadUrl: 'https://setupod.com/leads/mazaus_fx_guide.html',
      themeColor: '#38bdf8'
    },
    'calculator': {
      title: '스마트스토어·쿠팡 마진 1초 계산 시뮬레이터',
      desc: '로켓그로스 역마진을 사전에 차단하는 마진율 엑셀/노션 템플릿 & 세무 체크리스트를 즉시 다운로드하세요.',
      badge: '📊 계산기 팟 이커머스 자산',
      leadType: 'margin_calc',
      downloadUrl: 'https://setupod.com/leads/autosite_margin_calc.html',
      themeColor: '#34d399'
    },
    'margin': {
      title: '스마트스토어·쿠팡 마진 1초 계산 시뮬레이터',
      desc: '로켓그로스 역마진을 사전에 차단하는 마진율 엑셀/노션 템플릿 & 세무 체크리스트를 즉시 다운로드하세요.',
      badge: '📊 계산기 팟 이커머스 자산',
      leadType: 'margin_calc',
      downloadUrl: 'https://setupod.com/leads/autosite_margin_calc.html',
      themeColor: '#34d399'
    },
    'runway': {
      title: '2026 스타트업 런웨이 2배 연장 전략 가이드',
      desc: '데스밸리를 극복하고 번레이트를 절반으로 낮추는 실전 런웨이 연장 가이드북을 무료로 드립니다.',
      badge: '📈 스타트업 런웨이 자산',
      leadType: 'runway_guide',
      downloadUrl: 'https://setupod.com/leads/setupod_starter_kit.html',
      themeColor: '#6366f1'
    },
    'nomad': {
      title: '전 세계 디지털 노마드 비자 & 세금 최적화 국가 가이드',
      desc: '주요 거점 도시별 합법적 세금 면제 및 노마드 비자 발급 가이드북을 무료 제공합니다.',
      badge: '✈️ 디지털 노마드 특별 가이드',
      leadType: 'nomad_guide',
      downloadUrl: 'https://setupod.com/leads/setupod_starter_kit.html',
      themeColor: '#38bdf8'
    }
  };

  var LeadMagnet = {
    domain: null,
    podId: null,
    config: null,
    modalEl: null,
    hasShown: false,

    init: function(options) {
      options = options || {};
      var host = options.domain || window.location.hostname.replace(/^www\./, '');
      var params = new URLSearchParams(window.location.search);
      
      // 경로 기반 팟 감지 (/planner, /bizcard, /margin, /runway, /nomad 등)
      var path = window.location.pathname.toLowerCase();
      var pathPod = '';
      if (path.indexOf('/planner') !== -1) pathPod = 'planner';
      else if (path.indexOf('/bizcard') !== -1) pathPod = 'bizcard';
      else if (path.indexOf('/margin') !== -1) pathPod = 'margin';
      else if (path.indexOf('/runway') !== -1) pathPod = 'runway';
      else if (path.indexOf('/nomad') !== -1) pathPod = 'nomad';
      else if (path.indexOf('/calculator') !== -1) pathPod = 'calculator';

      var podId = options.podId || params.get('podId') || params.get('pod_id') || pathPod || '';

      this.domain = host;
      this.podId = podId;

      // 1순위: podId 매핑, 2순위: 도메인 매핑, 3순위: default
      if (podId && POD_LEAD_MAP[podId]) {
        this.config = POD_LEAD_MAP[podId];
      } else if (LEAD_CONFIGS[host]) {
        this.config = LEAD_CONFIGS[host];
      } else {
        this.config = LEAD_CONFIGS['default'];
      }

      this.injectStyles();
      this.buildModal();

      // 25초 후 자동 제안 트리거 바인딩
      this.bindTriggers();
    },

    injectStyles: function() {
      if (document.getElementById('lead-magnet-style')) return;
      var style = document.createElement('style');
      style.id = 'lead-magnet-style';
      style.textContent = `
        .lm-overlay {
          position: fixed; inset: 0; z-index: 99999;
          background: rgba(3, 7, 18, 0.78);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px; opacity: 0; pointer-events: none;
          transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: 'Pretendard', -apple-system, sans-serif;
        }
        .lm-overlay.active { opacity: 1; pointer-events: auto; }
        .lm-card {
          width: 100%; max-width: 480px;
          background: #101626;
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 28px; padding: 34px 28px;
          box-shadow: 0 25px 60px -12px rgba(0,0,0,0.8), 0 0 35px rgba(99,102,241,0.15);
          position: relative; color: #f9fafb;
          transform: translateY(24px) scale(0.97); 
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lm-overlay.active .lm-card { transform: translateY(0) scale(1); }
        .lm-close {
          position: absolute; top: 18px; right: 18px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
          color: #9ca3af; width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s; font-size: 15px;
        }
        .lm-close:hover { background: rgba(255,255,255,0.15); color: #fff; transform: rotate(90deg); }
        .lm-badge {
          display: inline-block; padding: 4px 12px; border-radius: 9999px;
          font-size: 12px; font-weight: 800; margin-bottom: 14px;
        }
        .lm-title { font-size: 21px; font-weight: 900; line-height: 1.35; margin-bottom: 10px; color: #fff; letter-spacing: -0.02em; }
        .lm-desc { font-size: 13.5px; color: #94a3b8; line-height: 1.6; margin-bottom: 22px; }
        .lm-form { display: flex; flex-direction: column; gap: 12px; }
        .lm-field-group { display: flex; flex-direction: column; gap: 5px; }
        .lm-label { font-size: 12px; font-weight: 700; color: #cbd5e1; }
        .lm-label span { color: #f43f5e; margin-left: 2px; }
        .lm-input {
          width: 100%; padding: 13px 15px;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 12px; color: #fff; font-size: 14px; outline: none;
          transition: border-color 0.2s, background 0.2s; box-sizing: border-box;
        }
        .lm-input:focus { border-color: #6366f1; background: rgba(99,102,241,0.06); }
        .lm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media (max-width: 480px) {
          .lm-row { grid-template-columns: 1fr; }
        }
        .lm-submit {
          width: 100%; padding: 15px; border-radius: 14px;
          border: none; font-size: 15px; font-weight: 900;
          cursor: pointer; transition: all 0.2s; color: #fff;
          margin-top: 6px; box-shadow: 0 4px 20px rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .lm-submit:hover { filter: brightness(1.12); transform: translateY(-1.5px); }
        .lm-success { display: none; text-align: center; }
        .lm-btn-download {
          display: inline-block; width: 100%; padding: 15px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff; font-weight: 900;
          border-radius: 14px; text-decoration: none; font-size: 15px;
          margin-top: 18px; box-sizing: border-box;
          box-shadow: 0 6px 20px rgba(16,185,129,0.3);
          transition: all 0.2s;
        }
        .lm-btn-download:hover { transform: translateY(-1px); filter: brightness(1.08); }
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
              <div class="lm-field-group">
                <label class="lm-label">이메일 주소 <span>*</span></label>
                <input type="email" id="lmEmail" class="lm-input" placeholder="자료를 수령하실 이메일 주소 입력" required />
              </div>
              <div class="lm-row">
                <div class="lm-field-group">
                  <label class="lm-label" style="color:#94a3b8;">휴대폰 번호 <small>(선택 / 알림용)</small></label>
                  <input type="tel" id="lmPhone" class="lm-input" placeholder="010-0000-0000" />
                </div>
                <div class="lm-field-group">
                  <label class="lm-label" style="color:#94a3b8;">카카오톡 ID <small>(선택 / 빠른 문의)</small></label>
                  <input type="text" id="lmKakao" class="lm-input" placeholder="카카오톡 ID" />
                </div>
              </div>
              <button type="submit" id="lmBtnSubmit" class="lm-submit" style="background:${c.themeColor};">
                🎁 1초 만에 무료 선물 받기
              </button>
            </form>
            <div style="font-size:11px; color:#64748b; text-align:center; margin-top:12px;">
              * 스팸 발송 없이 즉시 열람 및 다운로드 링크가 열립니다.
            </div>
          </div>

          <div id="lmSuccessContainer" class="lm-success">
            <div style="font-size:42px; margin-bottom:12px;">🎉</div>
            <h3 class="lm-title" style="color:#10b981;">신청이 완료되었습니다!</h3>
            <p class="lm-desc" style="margin-bottom:18px;">
              <strong>${c.title}</strong> 자산이 준비되었습니다.<br/>
              아래 다운로드 버튼을 눌러 지금 바로 확인하세요.
            </p>
            <a href="${c.downloadUrl}" target="_blank" class="lm-btn-download">
              📥 가이드 & 템플릿 즉시 열기 (무료 열람)
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
      var emailEl = document.getElementById('lmEmail');
      var phoneEl = document.getElementById('lmPhone');
      var kakaoEl = document.getElementById('lmKakao');

      var email = emailEl ? emailEl.value.trim() : '';
      var phone = phoneEl ? phoneEl.value.trim() : '';
      var kakao = kakaoEl ? kakaoEl.value.trim() : '';
      if (!email) return;

      var btn = document.getElementById('lmBtnSubmit');
      if (btn) btn.innerText = '선물 생성 중...';

      var payload = {
        domain: this.domain,
        email: email,
        phone: phone || null,
        kakao_id: kakao || null,
        contact: [phone, kakao ? ('카카오: ' + kakao) : ''].filter(Boolean).join(' / ') || null,
        pod_id: this.podId || 'general',
        lead_type: this.config.leadType,
        gift_title: this.config.title,
        source: 'lead_magnet_widget',
        created_at: new Date().toISOString()
      };

      // 1. MAZA Studio 백엔드로 비동기 전송
      var mazaUrl = window.MAZA_LEAD_URL || 'https://mazastudio.kr/api/telemetry/lead';
      try {
        fetch(mazaUrl, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(function() {});
      } catch(err) {}

      // 2. SETUPOD 중앙 DB로도 백업 전송 (2-Way 절대 보존)
      var setupodApiUrl = (window.location.hostname.indexOf('setupod.com') !== -1 || window.location.hostname === 'localhost')
        ? '/api/leads'
        : 'https://setupod.com/api/leads';

      try {
        fetch(setupodApiUrl, {
          method: 'POST',
          mode: 'cors',
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
