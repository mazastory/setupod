/**
 * SETUPOD ↔ MAZA Lead Magnet Engine (v1.0)
 * 모달 리드 수집 및 MAZA Supabase & SETUPOD 듀얼 동기화
 */
(function(window) {
  'use strict';

  var LEAD_CONFIGS = {
    'mazaus.com': {
      title: '해외 송금·환전 비용 점검 체크리스트',
      desc: '환전 단계의 비용을 직접 비교해 볼 수 있는 점검표를 무료로 보내드립니다.',
      badge: '💰 mazaus.com 특별 리포트',
      leadType: 'fx_guide',
      downloadUrl: 'https://setupod.com/leads/mazaus_fx_guide.html',
      themeColor: '#38bdf8'
    },
    'autosite.kr': {
      title: '스마트스토어·쿠팡 마진 점검 & 정산 체크리스트',
      desc: '숨은 비용을 빠뜨리지 않도록 마진 계산 항목과 정산 점검표를 무료로 보내드립니다.',
      badge: '📊 autosite.kr 이커머스 자산',
      leadType: 'margin_calc',
      downloadUrl: 'https://setupod.com/leads/autosite_margin_calc.html',
      themeColor: '#34d399'
    },
    'brewoak.com': {
      title: '커피 브루잉 비율 & 디개싱 캘린더',
      desc: '로스팅 단계별 디개싱 기간과 추출 비율의 출발점을 정리한 치트시트를 무료로 보내드립니다.',
      badge: '☕ brewoak.com 커피 랩',
      leadType: 'brewing_cheatsheet',
      downloadUrl: 'https://setupod.com/leads/brewoak_cheatsheet.html',
      themeColor: '#fbbf24'
    },
    'default': {
      title: '셋업팟 스타터 키트',
      desc: '셋업팟으로 시작할 때 알아 두면 좋은 구성과 순서를 정리한 스타터 키트를 무료로 보내드립니다.',
      badge: '🚀 SETUPOD 비즈니스 스타터',
      leadType: 'starter_kit',
      downloadUrl: 'https://setupod.com/leads/setupod_starter_kit.html',
      themeColor: '#a855f7'
    }
  };

  var POD_LEAD_MAP = {
    'planner': {
      title: '셋업팟 스타터 키트',
      desc: '셋업팟으로 시작할 때 알아 두면 좋은 구성과 순서를 정리한 스타터 키트를 무료로 보내드립니다.',
      badge: '🚀 플래너 팟 공식 스타터',
      leadType: 'starter_kit',
      downloadUrl: 'https://setupod.com/leads/setupod_starter_kit.html',
      themeColor: '#a855f7'
    },
    'bizcard': {
      title: '해외 송금·환전 비용 점검 체크리스트',
      desc: '환전 단계의 비용을 직접 비교해 볼 수 있는 점검표를 무료로 보내드립니다.',
      badge: '💼 3D 명함 팟 특별 리포트',
      leadType: 'fx_guide',
      downloadUrl: 'https://setupod.com/leads/mazaus_fx_guide.html',
      themeColor: '#38bdf8'
    },
    'bizcard3d': {
      title: '해외 송금·환전 비용 점검 체크리스트',
      desc: '환전 단계의 비용을 직접 비교해 볼 수 있는 점검표를 무료로 보내드립니다.',
      badge: '💼 3D 명함 팟 특별 리포트',
      leadType: 'fx_guide',
      downloadUrl: 'https://setupod.com/leads/mazaus_fx_guide.html',
      themeColor: '#38bdf8'
    },
    'calculator': {
      title: '스마트스토어·쿠팡 마진 점검 & 정산 체크리스트',
      desc: '숨은 비용을 빠뜨리지 않도록 마진 계산 항목과 정산 점검표를 무료로 보내드립니다.',
      badge: '📊 계산기 팟 이커머스 자산',
      leadType: 'margin_calc',
      downloadUrl: 'https://setupod.com/leads/autosite_margin_calc.html',
      themeColor: '#34d399'
    },
    'margin': {
      title: '스마트스토어·쿠팡 마진 점검 & 정산 체크리스트',
      desc: '숨은 비용을 빠뜨리지 않도록 마진 계산 항목과 정산 점검표를 무료로 보내드립니다.',
      badge: '📊 계산기 팟 이커머스 자산',
      leadType: 'margin_calc',
      downloadUrl: 'https://setupod.com/leads/autosite_margin_calc.html',
      themeColor: '#34d399'
    },
    'brewoak': {
      title: '커피 브루잉 비율 & 디개싱 캘린더',
      desc: '로스팅 단계별 디개싱 기간과 추출 비율의 출발점을 정리한 치트시트를 무료로 보내드립니다.',
      badge: '☕ brewoak 브루잉 랩',
      leadType: 'brewing_cheatsheet',
      downloadUrl: 'https://setupod.com/leads/brewoak_cheatsheet.html',
      themeColor: '#fbbf24'
    },
    'runway': {
      title: '셋업팟 스타터 키트',
      desc: '셋업팟으로 시작할 때 알아 두면 좋은 구성과 순서를 정리한 스타터 키트를 무료로 보내드립니다.',
      badge: '🚀 SETUPOD 스타터',
      leadType: 'starter_kit',
      downloadUrl: 'https://setupod.com/leads/setupod_starter_kit.html',
      themeColor: '#6366f1'
    },
    'nomad': {
      title: '셋업팟 스타터 키트',
      desc: '셋업팟으로 시작할 때 알아 두면 좋은 구성과 순서를 정리한 스타터 키트를 무료로 보내드립니다.',
      badge: '🚀 SETUPOD 스타터',
      leadType: 'starter_kit',
      downloadUrl: 'https://setupod.com/leads/setupod_starter_kit.html',
      themeColor: '#38bdf8'
    },
    'adsense': {
      title: '셋업팟 스타터 키트',
      desc: '셋업팟으로 시작할 때 알아 두면 좋은 구성과 순서를 정리한 스타터 키트를 무료로 보내드립니다.',
      badge: '🚀 SETUPOD 스타터',
      leadType: 'starter_kit',
      downloadUrl: 'https://setupod.com/leads/setupod_starter_kit.html',
      themeColor: '#f59e0b'
    },
    'fx': {
      title: '해외 송금·환전 비용 점검 체크리스트',
      desc: '환전 단계의 비용을 직접 비교해 볼 수 있는 점검표를 무료로 보내드립니다.',
      badge: '💱 환전 점검표',
      leadType: 'fx_guide',
      downloadUrl: 'https://setupod.com/leads/mazaus_fx_guide.html',
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

      // [2026-10-13] 유저 도메인에 넣어 준 임베드 팟 안에서는 이 팝업을 띄우지 않는다.
      // 그 방문자는 유저 사이트의 방문자이고, 연락처의 주인도 그 유저다 — 우리 선물 팝업이
      // 25초 뒤 열려 연락처를 가져가면 안 된다. (setupod.com 의 /embed 쉘은 팟을 iframe 으로 부른다)
      var qs = new URLSearchParams(window.location.search);
      var inFrame = false;
      try { inFrame = window.self !== window.top; } catch (e) { inFrame = true; }
      if (qs.get('embed') === '1' || inFrame) return;

      var host = options.domain || window.location.hostname.replace(/^www\./, '');
      var params = new URLSearchParams(window.location.search);
      
      // 경로 기반 팟 감지
      var path = window.location.pathname.toLowerCase();
      var pathPod = '';
      if (path.indexOf('/planner') !== -1) pathPod = 'planner';
      else if (path.indexOf('/bizcard') !== -1) pathPod = 'bizcard3d';
      else if (path.indexOf('/margin') !== -1) pathPod = 'margin';
      else if (path.indexOf('/calculator') !== -1) pathPod = 'calculator';
      else if (path.indexOf('/brewoak') !== -1) pathPod = 'brewoak';
      else if (path.indexOf('/runway') !== -1) pathPod = 'runway';
      else if (path.indexOf('/nomad') !== -1) pathPod = 'nomad';
      else if (path.indexOf('/adsense') !== -1) pathPod = 'adsense';
      else if (path.indexOf('/fx') !== -1) pathPod = 'fx';

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
          border-radius: 28px; padding: 32px 26px;
          box-shadow: 0 25px 60px -12px rgba(0,0,0,0.85), 0 0 35px rgba(99,102,241,0.15);
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
        .lm-desc { font-size: 13.5px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px; }
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
          display: inline-block; width: 100%; padding: 14px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff; font-weight: 900;
          border-radius: 14px; text-decoration: none; font-size: 15px;
          margin-top: 14px; box-sizing: border-box;
          box-shadow: 0 6px 20px rgba(16,185,129,0.3);
          transition: all 0.2s;
        }
        .lm-btn-download:hover { transform: translateY(-1px); filter: brightness(1.08); }
        
        /* 셋업팟 추가 유료 팟 업셀링 영역 */
        .lm-upsell-box {
          margin-top: 20px; padding: 16px 14px;
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 16px; text-align: center;
        }
        .lm-upsell-title {
          font-size: 12.5px; font-weight: 800; color: #c084fc; margin-bottom: 5px;
        }
        .lm-upsell-desc {
          font-size: 11.5px; color: #94a3b8; line-height: 1.5; margin-bottom: 12px;
        }
        .lm-btn-upsell {
          display: inline-flex; align-items: center; justify-content: center;
          width: 100%; padding: 12px 14px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
          color: #ffffff; font-weight: 800; font-size: 12.5px;
          border-radius: 12px; text-decoration: none;
          box-shadow: 0 4px 16px rgba(99,102,241,0.4);
          transition: all 0.2s; box-sizing: border-box;
        }
        .lm-btn-upsell:hover {
          filter: brightness(1.12); transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(139,92,246,0.6);
          color: #ffffff;
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
              <div class="lm-field-group">
                <label class="lm-label">이메일 주소 <span>*</span></label>
                <input type="email" id="lmEmail" class="lm-input" placeholder="자료를 수령하실 이메일 주소 입력" required />
              </div>
              <label style="display:flex;gap:8px;align-items:flex-start;font-size:12px;color:#cbd5e1;line-height:1.5;margin:10px 0 6px;text-align:left;">
                <input type="checkbox" id="lmConsent" required style="margin-top:3px;" />
                <span><strong>[필수]</strong> 개인정보 수집·이용에 동의합니다.<br/>
                  <span style="color:#94a3b8;">수집자: 투머스(SETUPOD) · 항목: 이메일 주소 · 목적: 신청하신 자료의 제공 ·
                  보유: 삭제를 요청하시기 전까지 보관하며, 요청하시면 영업일 7일 이내에 삭제 ·
                  동의하지 않으셔도 사이트는 이용하실 수 있으나 자료는 받으실 수 없습니다.
                  <a href="https://setupod.com/privacy" target="_blank" rel="noopener noreferrer" style="color:#a5b4fc;">자세히</a></span></span>
              </label>
              <label style="display:flex;gap:8px;align-items:flex-start;font-size:12px;color:#cbd5e1;line-height:1.5;margin:6px 0 12px;text-align:left;">
                <input type="checkbox" id="lmProvideMaza" style="margin-top:3px;" />
                <span><strong>[선택]</strong> 마자 스튜디오(캔두코리아)에도 이메일을 제공해 도메인·디지털 자산 관련 안내를 받겠습니다.<br/>
                  <span style="color:#94a3b8;">체크하지 않으셔도 자료는 받으실 수 있습니다.</span></span>
              </label>
              <button type="submit" id="lmBtnSubmit" class="lm-submit" style="background:${c.themeColor};">
                🎁 1초 만에 무료 선물 받기
              </button>
            </form>
            <div style="font-size:11px; color:#64748b; text-align:center; margin-top:12px;">
              * 신청하신 자료는 바로 열람하실 수 있습니다.
            </div>
          </div>

          <div id="lmSuccessContainer" class="lm-success">
            <div style="font-size:42px; margin-bottom:10px;">🎉</div>
            <h3 class="lm-title" style="color:#10b981; font-size:20px;">신청이 완료되었습니다!</h3>
            <p class="lm-desc" style="margin-bottom:14px;">
              <strong>${c.title}</strong> 자산이 준비되었습니다.<br/>
              아래 버튼을 눌러 지금 바로 확인하세요.
            </p>
            <a href="${c.downloadUrl}" target="_blank" class="lm-btn-download">
              📥 가이드 & 템플릿 즉시 열기 (무료 열람)
            </a>

            <!-- 셋업팟 맞춤 팟 추가 유료 결제 아웃링크 배너 -->
            <div class="lm-upsell-box">
              <div class="lm-upsell-title">🎓 MAZA 1년 장학 팟 외 추가 비즈니스 팟이 필요하신가요?</div>
              <div class="lm-upsell-desc">
                3D 명함, 마진 계산기, 멀티링크, 플래너 등 나만의 맞춤형 비즈니스 팟을 셋업팟 공식 스토어에서 직접 주문·장착하세요.
              </div>
              <a href="https://setupod.com?utm_source=maza_lead_modal&utm_medium=success_upsell&utm_campaign=custom_pod" target="_blank" rel="noopener noreferrer" class="lm-btn-upsell">
                🚀 셋업팟 공식 스토어에서 나만의 맞춤 팟 추가하기 →
              </a>
            </div>
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
      var self = this;
      var emailEl = document.getElementById('lmEmail');
      var consentEl = document.getElementById('lmConsent');
      var provideEl = document.getElementById('lmProvideMaza');

      var email = emailEl ? emailEl.value.trim() : '';
      if (!email) return;
      // 필수 동의가 없으면 어디에도 보내지 않는다(브라우저 required 를 우회한 경우까지 막는다)
      if (!consentEl || !consentEl.checked) return;
      var provideToMaza = !!(provideEl && provideEl.checked);

      var btn = document.getElementById('lmBtnSubmit');
      if (btn) btn.innerText = '신청 처리 중...';

      var payload = {
        domain: this.domain,
        email: email,
        contact: { email: email },
        pod_id: this.podId || 'general',
        lead_type: this.config.leadType,
        gift_name: this.config.title,
        source: 'lead_magnet_widget',
        consent: true,
        consent_version: 'setupod-lead-2026-10-13',
        provide_to_maza: provideToMaza,
        created_at: new Date().toISOString()
      };

      // 1. 셋업팟(투머스) — 수집자. 항상 보낸다.
      var setupodApiUrl = (window.location.hostname.indexOf('setupod.com') !== -1 || window.location.hostname === 'localhost')
        ? '/api/leads'
        : 'https://setupod.com/api/leads';
      var sendSetupod = fetch(setupodApiUrl, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(function(err) {
        console.warn('[SETUPOD Lead DB Notice]:', err && err.message);
        return { ok: false, error: err };
      });

      // 2. 마자(캔두코리아) — 방문자가 [선택] 에 동의했을 때만.
      var sendMaza = Promise.resolve({ ok: true, skipped: true });
      if (provideToMaza) {
        var mazaUrl = window.MAZA_LEAD_URL || 'https://mazastudio.kr/api/telemetry/lead';
        sendMaza = fetch(mazaUrl, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(function(err) {
          console.warn('[MAZA Lead Telemetry Notice]:', err && err.message);
          return { ok: false, error: err };
        });
      }

      // 3. 독립 분기 처리: 마자 API나 CORS 실패에 구애받지 않고 셋업팟 DB 저장을 완수하고 화면 전환
      if (typeof Promise !== 'undefined' && Promise.allSettled) {
        Promise.allSettled([sendMaza, sendSetupod]).finally(function() {
          self.renderSuccess();
        });
      } else {
        self.renderSuccess();
      }
    },

    renderSuccess: function() {
      localStorage.setItem('lm_submitted_' + this.domain, 'true');
      var formContainer = document.getElementById('lmFormContainer');
      var successContainer = document.getElementById('lmSuccessContainer');
      if (formContainer) formContainer.style.display = 'none';
      if (successContainer) successContainer.style.display = 'block';
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
