import re

# Read profile_studio.html to extract styles and layout base
with open('/Volumes/M/GitHub/setupod/profile_studio.html', 'r', encoding='utf-8') as f:
    ps_html = f.read()

head_match = re.search(r'(<head>.*?</style>)', ps_html, re.DOTALL)
head_content = head_match.group(1) if head_match else ""

# The JS from styles.js
styles_js = """
  const COMMON = [
    "너는 스레드(Threads)에 올릴 한국어 글을 쓰는 사람이다.",
    "아래 원문을 **같은 소재·같은 주장으로** 다시 쓴다.",
    "",
    "[반드시 지킬 것]",
    "· **무조건 반말로 쓴다.** 존댓말이 한 문장이라도 섞이면 실패다.",
    "    «~해요/~합니다/~하세요» → «~해»,  «~네요» → «~네»,  «~거든요» → «~거든»",
    "  ⚠️ 원문이 존댓말이어도 **반말로 바꿔서** 쓴다. 원문 말끝을 따라가지 마라.",
    "· **무엇에 대한 글인지(소재)와 하려는 말(주장)은 원문 그대로 유지한다.**",
    "· 다만 **문장과 표현은 새로 쓴다.** 원문 문장을 그대로 옮기면 도용이다.",
    "· 원문에 없는 사실·숫자·경험을 **지어내지 마라.**",
    "· 첫 줄은 아래 [첫 줄] 규칙을 따른다.",
    "· **한 줄은 20자 안팎**(30자 넘기지 마라), 의미 단위로 끊는다.",
    "  문단은 2~4줄, 문단 사이에 빈 줄 하나. 아래 [본보기] 모양 그대로.",
    "· 실제 사람이 쓴 것처럼. 광고 문구 티가 나면 실패다.",
    "· 해시태그는 쓰지 않는다.",
    "· 과장·단정(최고·1위·무조건 효과)은 쓰지 않는다.",
    "· 결과는 **올릴 글 본문만** 출력한다. 설명·머리말·따옴표·번호를 붙이지 마라.",
    "",
    "[첫 줄 — 여기서 승부가 난다]",
    "· 첫 줄만 보고 **손가락을 멈추게** 해야 한다. 한 문장, 20자 안팎.",
    "· **원문 첫 줄을 옮기지 마라.** 외국 글이면 번역투가 그대로 나온다 — 그건 훅이 아니다.",
    "· ❌ **첫 줄에 물건 이름·가격·산 곳·브랜드를 넣지 마라.** 넣는 순간 훅이 아니라 설명이 된다.",
    "· ✅ 셋 중 하나로 시작한다:",
    "    ① 내 반응 — «이거 진작 알았으면 좋았을 텐데» / «돈 쓴 게 아까워 죽겠어»",
    "    ② 뒤집기  — «비싼 거 살 필요 없더라» / «싼 게 더 오래 가는 거 실화냐»",
    "    ③ 되묻기  — «나만 몰랐던 거야?» / «이런 거 다들 어떻게 알아?»",
    "",
    "[본보기 — 이 모양으로 써라]",
    "사람 먹는 거 한참 쳐다보더니",
    "갑자기 저러는 거 실화냐😹",
    "",
    "진짜 어이없고 귀여워 미치겠네",
    "이거 나만 본 거 아니지?",
    "",
    "이런 행동하는 고양이 또 있어?",
    "",
    "↑ 보다시피 **한 줄이 짧고**, **두 줄씩 묶여** 있고, 문단 사이에 **빈 줄**이 있다.",
    "  말끝은 반말이고, 마지막은 **질문으로 닫아** 댓글을 부른다."
  ].join("\\n");

  const PRESETS = {
    real: "말투는 «직접 써 본 사람의 솔직한 후기». 좋은 점만 늘어놓지 말고 사소한 아쉬움도 한 줄 섞는다.",
    monologue: "말투는 «혼잣말». 감탄과 물음표를 섞고, 남에게 설명하는 게 아니라 혼자 놀란 것처럼 쓴다.",
    tip: "말투는 «알려 주는 사람». 순서나 방법이 눈에 보이게 쓴다. 다만 강의처럼 딱딱해지면 안 된다.",
    empathy: "말투는 «같은 처지의 사람». 읽는 사람이 겪었을 상황을 먼저 말하고, 그다음에 이야기를 잇는다."
  };

  const KIND_RULES = {
    daily: [
      "[이 글의 종류 — 일상글]",
      "· **파는 말이 한 글자도 들어가면 안 된다.** 제품 추천·구매 유도·링크 언급 모두 금지.",
      "· 목적은 «이 계정이 사람이 굴리는 계정이구나» 를 보여 주는 것이다.",
      "· 공감이나 웃음이 남으면 성공이다."
    ].join("\\n"),
    shopping: [
      "[이 글의 종류 — 쇼핑글]",
      "· 제품을 소개하되 **광고처럼 들리면 안 된다.** 써 본 이야기가 먼저고 제품은 그 안에 있다.",
      "· 가격·할인율을 단정해서 적지 마라(바뀐다).",
      "· 본문에 링크를 넣지 마라 — 링크는 따로 붙인다.",
      "· 마지막은 «궁금하면 댓글» 처럼 가볍게 닫는다."
    ].join("\\n")
  };

  const DEPTHS = {
    same: "원문의 소재와 주장을 **바꾸지 마라.** 예시나 상황도 원문 것을 쓰되 표현만 바꾼다.",
    loose: "소재와 주장은 유지하되, 예시나 상황은 비슷한 다른 것으로 바꿔도 된다. 주제는 절대 바꾸지 마라."
  };

  function buildPrompt(source, kind, presetKey, depthKey, extra, product) {
    const pBody = PRESETS[presetKey] || PRESETS.real;
    const dBody = DEPTHS[depthKey] || DEPTHS.same;
    
    const out = [
      COMMON,
      "",
      KIND_RULES[kind] || KIND_RULES.daily,
      "",
      "[얼마나 바꿀까]",
      "· " + dBody,
      "",
      "[말투]",
      "· " + pBody
    ];
    
    if (kind === "shopping" && product.trim()) {
      out.push("", "[소개할 것]", "· " + product.trim());
    }
    if (extra.trim()) {
      out.push("", "[추가 지시 — 위와 겹치면 이쪽을 따른다]", "· " + extra.trim());
    }
    
    if (kind === "shopping") {
      out.push(
        "",
        "[하나 더 — 링크 앞에 붙일 한 줄]",
        "본문을 다 쓴 뒤, 아래 구분줄을 **한 글자도 바꾸지 말고** 그대로 적고,",
        "그 다음 줄에 «상품 링크를 걸면서 덧붙일 한 줄» 을 써라.",
        "",
        "  ===링크한줄===",
        "",
        "· **딱 한 줄.** 20자 안팎. 반말. 본문에서 이어지는 말이어야 한다."
      );
    }

    out.push(
      "",
      "[원문 — 이 이야기를 내 말로 다시 쓴다. 문장을 옮기지는 마라]",
      '\"\"\"',
      source.slice(0, 1500),
      '\"\"\"',
      "",
      "위 원문과 **같은 소재·같은 주장**으로, **반말로**, 표현만 새로 써라. 올릴 글 본문만 출력해라."
    );
    
    return out.join("\\n");
  }

  async function callGemini(apiKey, prompt) {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 2048,
          }
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "API 호출 실패");
      }
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (err) {
      throw err;
    }
  }
"""

html_content = f"""<!DOCTYPE html>
<html lang="ko">
{head_content}
  <style>
    .input-field {{
      width: 100%;
      background: rgba(0,0,0,0.3);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 14px;
      color: #fff;
      font-family: inherit;
      font-size: 13.5px;
      margin-bottom: 16px;
    }}
    .input-field:focus {{
      outline: none;
      border-color: var(--violet);
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
    }}
    textarea.input-field {{
      min-height: 120px;
      resize: vertical;
    }}
    
    .result-box {{
      width: 100%;
      max-width: 500px;
      background: #110d24;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }}
    
    .result-text {{
      background: rgba(255,255,255,0.05);
      padding: 16px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.7;
      white-space: pre-wrap;
      min-height: 200px;
      color: #e2e8f0;
      border: 1px solid rgba(255,255,255,0.1);
    }}
    
    .loading-spinner {{
      display: none;
      width: 40px; height: 40px;
      border: 3px solid rgba(139, 92, 246, 0.3);
      border-top-color: #8b5cf6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 40px auto;
    }}
    @keyframes spin {{ to {{ transform: rotate(360deg); }} }}
  </style>
</head>
<body>
  <!-- Top Nav -->
  <header class="top-nav">
    <a href="index.html" class="brand-logo-wrap">
      <img src="assets/favicon-32x32.png" alt="SETUPOD" style="width:24px;height:24px;border-radius:6px;">
      <span class="brand-title">SETUPOD</span>
      <span class="nav-tag">AI 훅 메이커</span>
    </a>
    <div style="display:flex;gap:12px;align-items:center;">
      <a href="index.html" style="color:#94a3b8;font-size:13px;text-decoration:none;font-weight:600;">나가기 ✕</a>
    </div>
  </header>

  <div class="studio-layout">
    <!-- Left Controls -->
    <div class="controls-panel">
      <div class="panel-scroll">
        <h2 style="font-size:20px; font-weight:900; margin-bottom:8px;">AI 바이럴 훅 설계</h2>
        <p style="font-size:13px; color:#94a3b8; margin-bottom:24px;">다른 사람의 잘 된 글(원문)을 넣으면 나만의 스타일로 완벽하게 재창조합니다.</p>
        
        <label class="section-label">원문 텍스트 (참고용)</label>
        <textarea id="sourceText" class="input-field" placeholder="여기에 벤치마킹할 원본 글을 붙여넣으세요..."></textarea>
        
        <div style="display:flex; gap:12px;">
          <div style="flex:1;">
            <label class="section-label" style="margin-top:0;">글 종류</label>
            <select id="selKind" class="input-field" onchange="toggleShoppingFields()">
              <option value="daily">📷 일상글 (정보성)</option>
              <option value="shopping">🛒 쇼핑글 (판매/링크)</option>
            </select>
          </div>
          <div style="flex:1;">
            <label class="section-label" style="margin-top:0;">말투 (문체)</label>
            <select id="selPreset" class="input-field">
              <option value="real">솔직 후기체</option>
              <option value="monologue">혼잣말체</option>
              <option value="tip">꿀팁체</option>
              <option value="empathy">공감체</option>
            </select>
          </div>
        </div>
        
        <div id="shoppingFields" style="display:none; background:rgba(255,255,255,0.05); padding:16px; border-radius:12px; margin-bottom:16px;">
          <label class="section-label" style="margin-top:0; color:#f472b6;">판매할 상품명 (선택)</label>
          <input type="text" id="productName" class="input-field" style="margin-bottom:0;" placeholder="예: 무선 고데기, 다이어트 보조제">
        </div>
        
        <label class="section-label">변경 강도</label>
        <select id="selDepth" class="input-field">
          <option value="same">내용 그대로 (표현만 다르게)</option>
          <option value="loose">살짝 바꾸기 (내 예시 추가)</option>
        </select>
        
        <label class="section-label">추가 지시사항 (선택)</label>
        <input type="text" id="extraInst" class="input-field" placeholder="예: 마지막에 웃는 이모지 넣어줘">
        
        <label class="section-label"><i data-lucide="key" style="width:14px;"></i> Gemini API Key</label>
        <input type="password" id="apiKey" class="input-field" placeholder="AIzaSy...">
        <p style="font-size:11px; color:#64748b; margin-top:-10px; margin-bottom:20px;">무료 키 발급: <a href="https://aistudio.google.com/apikey" target="_blank" style="color:#38bdf8;">Google AI Studio</a> (로컬에만 저장됨)</p>
        
        <button id="btnGenerate" class="btn-action-primary" style="width:100%; margin-top:10px;">
          <i data-lucide="sparkles"></i> 후킹되는 글로 변환하기
        </button>
      </div>
    </div>
    
    <!-- Right Preview -->
    <div class="preview-canvas-area">
      <div id="loading" class="loading-spinner"></div>
      
      <div id="resultBox" class="result-box" style="display:none;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="font-size:16px; font-weight:800; color:#c4b5fd;">✨ 변환 완료</h3>
          <button id="btnCopy" class="btn-action-secondary" style="padding:8px 12px; font-size:12px;">복사하기</button>
        </div>
        
        <div id="outText" class="result-text"></div>
        
        <div id="linkBox" style="display:none; margin-top:10px;">
          <h4 style="font-size:12px; color:#f472b6; margin-bottom:8px;">🔗 링크 안내 멘트</h4>
          <div id="outLink" class="result-text" style="min-height:auto; padding:12px; border-color:#f472b6;"></div>
        </div>
      </div>
      
      <div id="emptyState" style="text-align:center; opacity:0.5;">
        <i data-lucide="edit-3" style="width:48px; height:48px; margin:0 auto 16px;"></i>
        <p>왼쪽 패널에서 원문을 입력하고<br>변환 버튼을 눌러주세요.</p>
      </div>
    </div>
  </div>

  <script src="https://unpkg.com/lucide@latest"></script>
  <script>
    lucide.createIcons();

    {styles_js}

    // Load API Key
    document.getElementById('apiKey').value = localStorage.getItem('VH_GEMINI_KEY') || '';

    function toggleShoppingFields() {
      const isShopping = document.getElementById('selKind').value === 'shopping';
      document.getElementById('shoppingFields').style.display = isShopping ? 'block' : 'none';
    }

    document.getElementById('btnGenerate').addEventListener('click', async () => {
      const source = document.getElementById('sourceText').value;
      const apiKey = document.getElementById('apiKey').value;
      
      if (!source.trim()) return alert("원문 텍스트를 입력해주세요.");
      if (!apiKey.trim()) return alert("Gemini API Key를 입력해주세요.");
      
      localStorage.setItem('VH_GEMINI_KEY', apiKey.trim());
      
      const kind = document.getElementById('selKind').value;
      const preset = document.getElementById('selPreset').value;
      const depth = document.getElementById('selDepth').value;
      const extra = document.getElementById('extraInst').value;
      const product = document.getElementById('productName').value;
      
      const prompt = buildPrompt(source, kind, preset, depth, extra, product);
      
      document.getElementById('emptyState').style.display = 'none';
      document.getElementById('resultBox').style.display = 'none';
      document.getElementById('loading').style.display = 'block';
      
      try {
        const resultText = await callGemini(apiKey.trim(), prompt);
        
        let mainText = resultText;
        let linkText = "";
        
        if (kind === 'shopping' && resultText.includes('===링크한줄===')) {
          const parts = resultText.split('===링크한줄===');
          mainText = parts[0].trim();
          linkText = parts[1] ? parts[1].trim() : "";
        }
        
        document.getElementById('outText').textContent = mainText;
        if (kind === 'shopping' && linkText) {
          document.getElementById('outLink').textContent = linkText;
          document.getElementById('linkBox').style.display = 'block';
        } else {
          document.getElementById('linkBox').style.display = 'none';
        }
        
        document.getElementById('loading').style.display = 'none';
        document.getElementById('resultBox').style.display = 'flex';
        
      } catch (err) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('emptyState').style.display = 'block';
        alert("오류 발생: " + err.message);
      }
    });

    document.getElementById('btnCopy').addEventListener('click', () => {
      const main = document.getElementById('outText').textContent;
      const link = document.getElementById('outLink').textContent;
      const isShopping = document.getElementById('selKind').value === 'shopping';
      
      let copyText = main;
      if (isShopping && link) {
        copyText += '\\n\\n' + link;
      }
      
      navigator.clipboard.writeText(copyText).then(() => {
        const btn = document.getElementById('btnCopy');
        btn.textContent = '복사 완료!';
        btn.style.background = '#34d399';
        setTimeout(() => {
          btn.textContent = '복사하기';
          btn.style.background = 'rgba(255, 255, 255, 0.08)';
        }, 2000);
      });
    });
  </script>
</body>
</html>
"""

with open('/Volumes/M/GitHub/setupod/hook_maker.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Created hook_maker.html successfully!")
