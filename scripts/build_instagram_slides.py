import re
import os

archive_path = '/Volumes/M/GitHub/setupod/archive/instagram_slides.html'
with open(archive_path, 'r', encoding='utf-8') as f:
    html = f.read()

# We will extract the CSS from archive
css_match = re.search(r'<style>(.*?)</style>', html, re.DOTALL)
css = css_match.group(1) if css_match else ''

head_links = """
  <!-- Google Fonts & Pretendard -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&family=Noto+Serif+KR:wght@700;900&family=Pretendard:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  
  <script src="https://unpkg.com/lucide@0.344.0"></script>
  <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js" crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js" crossorigin="anonymous"></script>
"""

new_html = """<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI 인스타그램 카드뉴스 생성기 | SETUPOD</title>
  __HEAD_LINKS__
  <style>
    __CSS__
    
    /* 추가 CSS for editable fields */
    .editable-field {
      transition: background 0.2s, outline 0.2s;
      border-radius: 6px;
      padding: 2px 4px;
    }
    .editable-field:hover {
      outline: 2px dashed rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.08);
    }
    .editable-field:focus {
      outline: 2px solid var(--accent-gold);
      background: rgba(0, 0, 0, 0.4);
    }
    
    /* Loading Spinner */
    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      border-top-color: #fff;
      width: 20px;
      height: 20px;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .panel-input {
      width: 100%;
      background: #0f0e17;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px;
      color: #e2e8f0;
      font-size: 13px;
      font-family: inherit;
      resize: vertical;
      margin-top: 10px;
    }
    .panel-input:focus {
      outline: none;
      border-color: var(--accent-gold);
    }
  </style>
</head>
<body>
  <header>
    <div class="brand-title">
      <img src="assets/setupod.gif" alt="SETUPOD Logo" style="height:28px; width:auto;" onerror="this.src='assets/favicon-32x32.png'">
      <span>SETUPOD CARD STUDIO</span>
      <span class="brand-badge">AI CAROUSEL GENERATOR</span>
    </div>
    <div class="top-actions">
      <a href="dashboard.html" class="btn-top">
        <i data-lucide="layout-dashboard" style="width:14px;height:14px;"></i>
        <span>대시보드로 돌아가기</span>
      </a>
    </div>
  </header>

  <main class="workspace">
    <!-- LEFT: Panel Controls -->
    <section class="sidebar-panel">
      
      <!-- AI Generator -->
      <div class="panel-card">
        <div class="panel-title">
          <i data-lucide="sparkles" style="width:16px;height:16px;color:#f59e0b;"></i>
          <span>AI 주제 입력</span>
        </div>
        <div>
          <textarea id="ai-topic-input" class="panel-input" rows="3" placeholder="예: 무자본 창업으로 첫 달 100만원 버는 3가지 현실적인 방법"></textarea>
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
          <span style="font-size:13px; color:var(--text-muted); font-weight:700;">생성할 카드 장수: <span id="card-count-val" style="color:var(--accent-gold);">6</span>장</span>
          <input type="range" id="ai-card-count" min="4" max="10" value="6" style="width:120px; accent-color:var(--accent-gold);">
        </div>

        <button id="btn-generate-ai" class="btn-action btn-download-single" style="margin-top:10px;">
          <i data-lucide="wand-2" style="width:16px;height:16px;"></i>
          <span id="btn-generate-ai-text">AI로 카드뉴스 뼈대 6장 생성</span>
        </button>
      </div>

      <!-- Slide Selector -->
      <div class="panel-card">
        <div class="panel-title">
          <i data-lucide="layers" style="width:16px;height:16px;color:#f59e0b;"></i>
          <span>슬라이드 네비게이터</span>
        </div>
        <div class="slide-tabs" id="dynamic-slide-tabs">
          <!-- JS will inject buttons here -->
        </div>
      </div>

      <!-- Export Actions -->
      <div class="panel-card">
        <div class="panel-title">
          <i data-lucide="download" style="width:16px;height:16px;color:#f59e0b;"></i>
          <span>고화질 (1080x1350) 이미지 다운로드</span>
        </div>
        <div class="action-btn-group">
          <button class="btn-action btn-download-all" onclick="downloadCurrentSlide()" id="btn-dl-single">
            <i data-lucide="image" style="width:16px;height:16px;"></i>
            <span>현재 슬라이드 (1장) 다운로드</span>
          </button>
          <button class="btn-action btn-download-single" onclick="downloadAllSlides()" id="btn-dl-all">
            <i data-lucide="folder-down" style="width:16px;height:16px;"></i>
            <span>전체 일괄 다운로드 (ZIP)</span>
          </button>
        </div>
      </div>
    </section>

    <!-- RIGHT: Live Canvas Preview -->
    <section class="preview-stage">
      <div class="nav-bar-stage">
        <span class="stage-indicator" id="stageIndicator">SLIDE 01 / 06</span>
        <div class="nav-arrows">
          <button class="nav-circle-btn" onclick="prevSlide()" title="이전 슬라이드">
            <i data-lucide="chevron-left" style="width:18px;height:18px;"></i>
          </button>
          <button class="nav-circle-btn" onclick="nextSlide()" title="다음 슬라이드">
            <i data-lucide="chevron-right" style="width:18px;height:18px;"></i>
          </button>
        </div>
      </div>

      <!-- Canvas Frame (1080 x 1350) -->
      <div class="card-canvas-viewport" id="cardCanvas">
        <!-- JS will inject slides here -->
      </div>
    </section>
  </main>

  <script>
    // ----------------------------------------------------
    // 1. STATE & DATA
    // ----------------------------------------------------
    let slidesData = [
      {
        badge: "SERIAL MASTERCLASS · 01",
        eyebrow: "⚠️ 애드센스 최대의 착각",
        headline: "서브도메인 100개 파면<br>승인도 100개?<br><em>치명적인 착각입니다.</em>",
        desc: '"블로그 10개 운영하니까 수익도 10배 되겠지?"<br>열심히 글 썼다가 한 번에 통째로 날아가는 이유.<br><strong>구글은 바보가 아닙니다.</strong>',
        featureType: "alert", // alert, success, none
        featureTitle: "실제 피해 사례",
        featureText: "서브도메인 50개 운영하다 본진 도메인 하나 제재 먹고 50개 사이트 광고가 동시에 영구 정지된 실제 사례",
        footerBrand: "SETUPOD",
        footerPrompt: "넘겨서 진실 확인 👉"
      }
    ];

    while(slidesData.length < 6) {
      slidesData.push({
        badge: "STEP " + (slidesData.length+1),
        eyebrow: "0" + (slidesData.length+1) + " · 내용입력",
        headline: "이곳을 클릭하여<br><em>제목을 수정하세요</em>",
        desc: "여기에 본문 설명을 입력합니다. 핵심적인 내용만 간결하게 작성하는 것이 가독성에 좋습니다.",
        featureType: "none",
        featureTitle: "",
        featureText: "",
        footerBrand: "SETUPOD",
        footerPrompt: (slidesData.length === 5) ? "저장하고 실천하기 🔖" : "다음 장으로 👉"
      });
    }

    let currentSlideIdx = 0;

    // ----------------------------------------------------
    // 2. RENDER FUNCTIONS
    // ----------------------------------------------------
    function renderApp() {
      renderTabs();
      renderSlides();
      updateStageIndicator();
      lucide.createIcons();
    }

    function renderTabs() {
      const tabsContainer = document.getElementById('dynamic-slide-tabs');
      tabsContainer.innerHTML = '';
      slidesData.forEach((_, idx) => {
        const btn = document.createElement('button');
        btn.className = `slide-tab-btn ${idx === currentSlideIdx ? 'active' : ''}`;
        btn.onclick = () => { currentSlideIdx = idx; renderApp(); };
        btn.innerHTML = `
          <span class="tab-num">0${idx + 1}</span>
          <span>슬라이드</span>
        `;
        tabsContainer.appendChild(btn);
      });
    }

    function renderSlides() {
      const canvas = document.getElementById('cardCanvas');
      canvas.innerHTML = '';

      slidesData.forEach((sd, idx) => {
        const page = document.createElement('div');
        page.className = `slide-page ${idx === currentSlideIdx ? 'active' : ''}`;
        page.id = `slide${idx}`;

        let featureHtml = '';
        if (sd.featureType !== 'none') {
          const iconName = sd.featureType === 'alert' ? 'alert-triangle' : 'check-circle';
          const titleColor = sd.featureType === 'alert' ? '#f87171' : '#34d399';
          featureHtml = `
            <div class="feature-card ${sd.featureType}">
              <div class="feature-title" style="color:${titleColor};">
                <i data-lucide="${iconName}" style="width:16px;height:16px;"></i>
                <span class="editable-field" contenteditable="true" data-idx="${idx}" data-key="featureTitle">${sd.featureTitle}</span>
              </div>
              <div class="feature-text editable-field" contenteditable="true" data-idx="${idx}" data-key="featureText">${sd.featureText}</div>
            </div>
          `;
        }

        page.innerHTML = `
          <div class="slide-header">
            <span class="slide-badge editable-field" contenteditable="true" data-idx="${idx}" data-key="badge">${sd.badge}</span>
            <span class="slide-step-tag">0${idx + 1} / 0${slidesData.length}</span>
          </div>
          <div class="slide-body">
            <div class="slide-eyebrow editable-field" contenteditable="true" data-idx="${idx}" data-key="eyebrow">${sd.eyebrow}</div>
            <h2 class="slide-headline editable-field" contenteditable="true" data-idx="${idx}" data-key="headline">${sd.headline}</h2>
            <p class="slide-desc editable-field" contenteditable="true" data-idx="${idx}" data-key="desc">${sd.desc}</p>
            ${featureHtml}
          </div>
          <div class="slide-footer">
            <span class="slide-footer-brand editable-field" contenteditable="true" data-idx="${idx}" data-key="footerBrand">${sd.footerBrand}</span>
            <span class="slide-swipe-prompt editable-field" contenteditable="true" data-idx="${idx}" data-key="footerPrompt">${sd.footerPrompt}</span>
          </div>
        `;
        canvas.appendChild(page);
      });

      // Add blur event to save edits back to state
      document.querySelectorAll('.editable-field').forEach(el => {
        el.addEventListener('blur', (e) => {
          const idx = e.target.getAttribute('data-idx');
          const key = e.target.getAttribute('data-key');
          slidesData[idx][key] = e.target.innerHTML; // using innerHTML to preserve <br> and <em>
        });
      });
    }

    function updateStageIndicator() {
      const max = slidesData.length < 10 ? '0'+slidesData.length : slidesData.length;
      const cur = (currentSlideIdx + 1) < 10 ? '0'+(currentSlideIdx+1) : (currentSlideIdx+1);
      document.getElementById('stageIndicator').textContent = `SLIDE ${cur} / ${max}`;
      
      // Also update slider sync
      document.getElementById('ai-card-count').value = slidesData.length;
      document.getElementById('card-count-val').textContent = slidesData.length;
    }

    function prevSlide() {
      if (currentSlideIdx > 0) {
        currentSlideIdx--;
        renderApp();
      }
    }
    function nextSlide() {
      if (currentSlideIdx < slidesData.length - 1) {
        currentSlideIdx++;
        renderApp();
      }
    }

    // ----------------------------------------------------
    // 3. AI GENERATION (Gemini)
    // ----------------------------------------------------
    document.getElementById('ai-card-count').addEventListener('input', (e) => {
      const count = e.target.value;
      document.getElementById('card-count-val').textContent = count;
      document.getElementById('btn-generate-ai-text').textContent = `AI로 카드뉴스 뼈대 ${count}장 생성`;
    });

    document.getElementById('btn-generate-ai').addEventListener('click', async () => {
      const topic = document.getElementById('ai-topic-input').value.trim();
      if(!topic) { alert("주제를 입력해주세요."); return; }
      const count = parseInt(document.getElementById('ai-card-count').value);
      
      const btn = document.getElementById('btn-generate-ai');
      const origHtml = btn.innerHTML;
      btn.innerHTML = `<div class="spinner"></div><span style="margin-left:8px;">AI가 ${count}장 내용을 기획 중입니다...</span>`;
      btn.disabled = true;

      try {
        const systemPrompt = `You are a top-tier copywriter for Instagram carousel card news.
Generate a ${count}-slide script based on the given topic. Return exactly in JSON format.
Rules for the JSON array of objects:
- "badge": English uppercase category (e.g., "SECRET TIP", "MARKETING", "STEP 01")
- "eyebrow": Very short eyebrow text in Korean with 1 emoji (e.g., "🔥 충격적인 사실")
- "headline": The main title of the slide. Use <br> for line breaks. Wrap the most important part in <em>...</em> tags. Make it punchy.
- "desc": Body text. Use <br> and <strong>...</strong> to emphasize keywords.
- "featureType": Choose one of: "alert" (warning/bad), "success" (good/tip), or "none". (Usually 1-2 slides have features, rest are none)
- "featureTitle": Short title for the feature box. (leave empty string if none)
- "featureText": The text inside the feature box. (leave empty string if none)
- "footerBrand": "SETUPOD"
- "footerPrompt": "넘겨서 진실 확인 👉" for middle slides, "저장하고 실천하기 🔖" for the last slide.

Make the copywriting extremely hooking, valuable, and easy to read. Example valid output array: [{"badge":"...", "eyebrow":"...", "headline":"...", "desc":"...", "featureType":"none", "featureTitle":"", "featureText":"", "footerBrand":"SETUPOD", "footerPrompt":"넘겨서 진실 확인 👉"}]`;

        const userPrompt = `주제: "${topic}"\n카드 개수: ${count}장`;

        const payload = {
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
                responseMimeType: "application/json",
            }
        };

        const apiKey = localStorage.getItem('SETUPOD_GEMINI_KEY') || ""; // Can be grabbed from user's storage later
        if(!apiKey) {
            const userKey = prompt("Gemini API Key를 입력해주세요 (무료 키 발급 가능):");
            if(userKey) {
                localStorage.setItem('SETUPOD_GEMINI_KEY', userKey);
                payload.key = userKey;
            } else {
                throw new Error("No API Key");
            }
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${localStorage.getItem('SETUPOD_GEMINI_KEY')}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if(!response.ok) {
            if (response.status === 400 || response.status === 403) {
                localStorage.removeItem('SETUPOD_GEMINI_KEY');
                alert("API Key가 유효하지 않습니다. 다시 시도해주세요.");
            }
            throw new Error("API Request Failed: " + response.status);
        }
        
        const data = await response.json();
        const jsonText = data.candidates[0].content.parts[0].text;
        const parsed = JSON.parse(jsonText);
        
        if(parsed && parsed.length > 0) {
           slidesData = parsed;
           currentSlideIdx = 0;
           renderApp();
        }
      } catch(err) {
        console.error(err);
        if (err.message !== "No API Key") {
            alert("생성에 실패했습니다. 브라우저 콘솔을 확인하세요.");
        }
      } finally {
        btn.innerHTML = origHtml;
        btn.disabled = false;
        lucide.createIcons();
      }
    });

    // ----------------------------------------------------
    // 4. EXPORT FUNCTIONS
    // ----------------------------------------------------
    async function captureSlide(idx) {
      const origIdx = currentSlideIdx;
      currentSlideIdx = idx;
      renderTabs();
      
      document.querySelectorAll('.slide-page').forEach((el, i) => {
        if(i === idx) el.classList.add('active');
        else el.classList.remove('active');
      });
      
      await new Promise(r => setTimeout(r, 100)); // wait for font rendering
      
      const canvasNode = document.getElementById('cardCanvas');
      const canvas = await html2canvas(canvasNode, {
        scale: 2.3478, // (1080 / 460) = 2.3478 -> exact 1080px width
        useCORS: true,
        backgroundColor: '#0f0c1b'
      });
      
      // Restore
      currentSlideIdx = origIdx;
      document.querySelectorAll('.slide-page').forEach((el, i) => {
        if(i === origIdx) el.classList.add('active');
        else el.classList.remove('active');
      });
      renderTabs();
      
      return canvas.toDataURL("image/png");
    }

    async function downloadCurrentSlide() {
      const btn = document.getElementById('btn-dl-single');
      const origHtml = btn.innerHTML;
      btn.innerHTML = '저장 중...';
      try {
        const dataUrl = await captureSlide(currentSlideIdx);
        const link = document.createElement('a');
        link.download = `instagram_slide_0${currentSlideIdx+1}.png`;
        link.href = dataUrl;
        link.click();
      } catch(err) {
        alert("이미지 저장 중 오류가 발생했습니다.");
        console.error(err);
      } finally {
        btn.innerHTML = origHtml;
        lucide.createIcons();
      }
    }

    async function downloadAllSlides() {
      const btn = document.getElementById('btn-dl-all');
      const origText = btn.innerHTML;
      btn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;margin-right:8px;"></div> ZIP 생성 중...';
      btn.style.pointerEvents = 'none';

      try {
        const zip = new JSZip();
        for(let i=0; i<slidesData.length; i++) {
          const dataUrl = await captureSlide(i);
          const base64Data = dataUrl.split(',')[1];
          zip.file(`slide_0${i+1}.png`, base64Data, {base64: true});
        }
        
        const blob = await zip.generateAsync({type:"blob"});
        saveAs(blob, "setupod_cardnews.zip");
      } catch(err) {
        alert("ZIP 압축 중 오류가 발생했습니다.");
        console.error(err);
      } finally {
        btn.innerHTML = origText;
        btn.style.pointerEvents = 'auto';
        lucide.createIcons();
      }
    }

    // Initial render
    renderApp();
  </script>
</body>
</html>"""

new_html = new_html.replace('__HEAD_LINKS__', head_links)
new_html = new_html.replace('__CSS__', css)

with open('/Volumes/M/GitHub/setupod/instagram_slides.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Created /Volumes/M/GitHub/setupod/instagram_slides.html")
