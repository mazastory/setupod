const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync('index.html', 'utf8');

const cssStart = indexHtml.indexOf('/* ── 글로벌 네비게이션 ── */');
const cssEnd = indexHtml.indexOf('/* ── 히어로 섹션 ── */');
const dropdownCss = `
    .nav-dropdown { position: relative; display: inline-block; }
    .nav-dropdown-menu {
      display: none; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
      background: rgba(13, 8, 24, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05);
      border-radius: 12px; padding: 8px; min-width: 160px; box-shadow: 0 16px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15);
      z-index: 100; margin-top: 10px;
    }
    .nav-dropdown-menu::before {
      content: ''; position: absolute; top: -10px; left: 0; width: 100%; height: 10px;
    }
    .nav-dropdown:hover .nav-dropdown-menu { display: flex; flex-direction: column; gap: 4px; }
    .nav-dropdown-menu a {
      color: rgba(255,255,255,0.8); text-decoration: none; font-size: 13.5px; font-weight: 600;
      padding: 10px 14px; border-radius: 8px; transition: all 0.2s; white-space: nowrap;
    }
    .nav-dropdown-menu a:hover { background: rgba(255,255,255,0.08); color: #fff; }
`;
const gnbCss = indexHtml.substring(cssStart, cssEnd).trim() + '\\n' + dropdownCss;

const navStart = indexHtml.indexOf('<nav>');
const navEnd = indexHtml.indexOf('</nav>') + 6;
const gnbNav = indexHtml.substring(navStart, navEnd).trim();

const mobileMenuStart = indexHtml.indexOf('<div class="mobile-menu-overlay"');
const mobileMenuEnd = indexHtml.indexOf('</div>\n    </div>\n  </div>', mobileMenuStart) + 26;
const mobileMenuHtml = indexHtml.substring(mobileMenuStart, mobileMenuEnd).trim();

const jsStart = indexHtml.indexOf('function toggleMobileMenu()');
const jsEnd = indexHtml.indexOf('// GA4 Interaction Tracking');
const gnbJs = indexHtml.substring(jsStart, jsEnd).trim();

const snippet = {
  css: gnbCss,
  nav: gnbNav,
  mobile: mobileMenuHtml,
  js: gnbJs,
  embedCss: `
    /* B2B2B Widget Embed Mode */
    html.is-embedded nav,
    html.is-embedded header,
    html.is-embedded .mobile-menu-overlay,
    html.is-embedded footer {
      display: none !important;
    }
    html.is-embedded body {
      background: transparent !important;
      padding-top: 0 !important;
    }
  `,
  embedJs: `
    // B2B2B Widget Embed Logic
    (function() {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('embed') === 'true') {
        document.documentElement.classList.add('is-embedded');
        const observer = new ResizeObserver(() => {
          window.parent.postMessage({ type: 'setupod_resize', height: document.documentElement.scrollHeight }, '*');
        });
        observer.observe(document.body);
        window.addEventListener('load', () => {
          window.parent.postMessage({ type: 'setupod_ready', height: document.documentElement.scrollHeight }, '*');
        });
      }
    })();
  `
};

console.log("CSS length:", snippet.css.length);

const files = [
  'link.html',
  'profile_studio.html',
  'product_studio.html',
  'maker.html',
  'roi_calculator.html',
  'proposal_maker.html',
  'proof.html',
  'hook_maker.html',
  'detail_studio.html',
  '10k_studio.html',
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');

  // 1. Remove old header and ANY PREVIOUSLY INJECTED STUFF if we are recovering from a bad commit, 
  // but wait, I did a git reset --hard! So they are clean!
  html = html.replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, '');

  // 2. Inject CSS before </head>
  if (!html.includes('/* ── 글로벌 네비게이션 ── */')) {
    const styleBlock = `\n  <style>\n${snippet.css}\n${snippet.embedCss}\n  </style>\n`;
    html = html.replace('</head>', styleBlock + '</head>');
  } else if (!html.includes('/* B2B2B Widget Embed Mode */')) {
    // If nav is already there but embed CSS is missing, add it
    const styleBlock = `\n  <style>\n${snippet.embedCss}\n  </style>\n`;
    html = html.replace('</head>', styleBlock + '</head>');
  }

  // 3. Inject NAV after <body>
  if (!html.includes('<nav>')) {
    html = html.replace(/<body[^>]*>/i, match => match + '\n\n' + snippet.nav + '\n\n' + snippet.mobile);
  }

  // 4. Inject JS before </body>
  if (!html.includes('function toggleMobileMenu()')) {
    const scriptBlock = `\n  <script>\n${snippet.js}\n${snippet.embedJs}\n  </script>\n`;
    html = html.replace('</body>', scriptBlock + '</body>');
  } else if (!html.includes('// B2B2B Widget Embed Logic')) {
    const scriptBlock = `\n  <script>\n${snippet.embedJs}\n  </script>\n`;
    html = html.replace('</body>', scriptBlock + '</body>');
  }

  // If link.html, add back the missing buttons
  if (file === 'link.html' && !html.includes('handleCloudSync()')) {
    const additionalNavActions = `
      <button onclick="handleCloudSync()" class="btn-create-nav" id="btnCloudSync" style="background:rgba(168,85,247,0.15);border:1px solid rgba(168,85,247,0.4);color:#c4b5fd;margin-right:8px;" title="클라우드 영구 저장">
        <i data-lucide="cloud" style="width:14px;height:14px;"></i>
        <span id="cloudSyncText">저장</span>
      </button>
      <a href="#" onclick="window.open('card.html?id=' + (JSON.parse(localStorage.getItem('setupod_card_data'))?.id || 'setupod'), '_blank'); return false;" class="btn-create-nav" style="background:rgba(255,217,120,0.15);border:1px solid rgba(255,217,120,0.4);color:#ffd978;margin-right:16px;" title="3D 명함 보기">
        <i data-lucide="rotate-3d" style="width:14px;height:14px;"></i>
        <span>3D</span>
      </a>
`;
    html = html.replace('<a href="maker.html" class="btn-create-nav">', additionalNavActions + '\n      <a href="maker.html" class="btn-create-nav">');
  }
  
  // product_studio.html context fix
  if (file === 'product_studio.html') {
    html = html.replace(
      /const canvas = document\.getElementById\('stageCanvas'\); ctx\.imageSmoothingEnabled = true; ctx\.imageSmoothingQuality = 'high';\s*const ctx = canvas\.getContext\('2d'\);/,
      "const canvas = document.getElementById('stageCanvas');\n    const ctx = canvas.getContext('2d');\n    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';"
    );
  }

  fs.writeFileSync(file, html);
  console.log(`Injected GNB cleanly into ${file}`);
});
