/**
 * MEMOPOD 2.0 - AI Knowledge Graph & Smart Brain Dump OS
 * Core Application Engine & Canvas 60FPS Graph Simulation
 */

// ==========================================================================
// 1. Initial State & Seed Data
// ==========================================================================

const SEED_DATA = [
  {
    id: 'node-1',
    type: 'business',
    title: '2026 B2B 가치 기반 프라이싱 (Value-Based Pricing)',
    content: '2026 고단가 B2B 가치 프라이싱 공식:\n- 원가나 투입 시간(Man-Month) 기준이 아닌, 클라이언트가 얻게 될 추가 매출의 10~20%를 견적으로 산정하는 원칙.\n- [ ] 첫 3개 고객사 대상 파일럿 ROI 분석표 제작하기\n- [ ] 가치 기반 견적서 템플릿(PDF) 작성',
    summary: '원가 기준이 아닌 클라이언트 예상 추가 매출의 10~20%를 견적으로 산정하는 B2B 가치 프라이싱 공식.',
    todos: [
      { text: '첫 3개 고객사 대상 파일럿 ROI 분석표 제작하기', done: false },
      { text: '가치 기반 견적서 템플릿(PDF) 작성', done: true }
    ],
    tags: ['pricing', 'b2b', 'business', 'growth'],
    createdAt: '2026-10-12'
  },
  {
    id: 'node-2',
    type: 'business',
    title: '콜드 이메일 85% 오픈율 제목 카피 법칙',
    content: '콜드 이메일 85% 오픈율 제목 카피 법칙:\n- 구체적인 질문형 제목과 괄호 태그 활용, 모바일 프리뷰 30자 이내 핵심 승부.\n- [ ] 타깃 기업 리스트 50개 선별\n- [ ] 3줄 본문 A/B 테스트 초안 작성',
    summary: '구체적인 질문형 제목과 괄호 태그를 활용해 모바일 프리뷰 30자 이내 승부하는 콜드메일 전략.',
    todos: [
      { text: '타깃 기업 리스트 50개 선별', done: false },
      { text: '3줄 본문 A/B 테스트 초안 작성', done: false }
    ],
    tags: ['marketing', 'copywriting', 'coldmail', 'b2b'],
    createdAt: '2026-10-13'
  },
  {
    id: 'node-3',
    type: 'tech',
    title: 'AI 메가 프롬프트: 고객 결제 저항 5가지 도출',
    content: '10초 만에 고객 페르소나와 결제 저항(Objection) 5가지를 도출하는 리버스 프롬프트 설계법.\n- [ ] 랜딩페이지 FAQ 섹션에 5대 저항 요인 답변 배치하기',
    summary: '잠재 고객의 결제 저항 요인 5가지를 10초 만에 도출해내는 AI 리버스 프롬프팅 구조.',
    todos: [
      { text: '랜딩페이지 FAQ 섹션에 5대 저항 요인 답변 배치하기', done: false }
    ],
    tags: ['ai', 'prompt', 'copywriting', 'growth'],
    createdAt: '2026-10-14'
  },
  {
    id: 'node-4',
    type: 'idea',
    title: 'MemoPod x 2026 플래너 원스톱 파이프라인 결합',
    content: '생각 정리(MemoPod)와 실행 관리(2026 플래너)를 하나로 묶어, 지식 노드에서 [플래너로 전송] 클릭 시 오늘의 To-Do로 즉시 등록.\n- [ ] 원클릭 동기화 이벤트 핸들러 검증\n- [ ] 뽀모도로 타이머와 연계 테스트',
    summary: '지식 정리 도구(MemoPod)와 실행 관리 도구(2026 플래너)를 상호 연동한 생산성 올인원 파이프라인.',
    todos: [
      { text: '원클릭 동기화 이벤트 핸들러 검증', done: true },
      { text: '뽀모도로 타이머와 연계 테스트', done: false }
    ],
    tags: ['setupod', 'product', 'memopod', 'planner'],
    createdAt: '2026-10-15'
  },
  {
    id: 'node-5',
    type: 'note',
    title: '옵시디언(Obsidian) 지식 그래프 철학',
    content: '정보는 폴더보다 상호 연관 태그 네트워크로 연결될 때 예측하지 못한 창의적 통찰이 발생한다. 세렌디피티(Serendipity) 극대화.',
    summary: '폴더식 분류 대신 노드 간의 유기적 네트워크 연결을 통해 새로운 창의적 발상을 유도하는 지식 관리 철학.',
    todos: [],
    tags: ['knowledge', 'graph', 'memopod', 'productivity'],
    createdAt: '2026-10-15'
  }
];

const MemoState = {
  items: [],
  activeFilterTag: null,
  activeNodeId: null,
  currentView: 'actions', // 'actions' | 'cards' | 'graph' | 'editor'
  speechRecognition: null,
  isRecording: false,
  geminiApiKey: localStorage.getItem('MEMOPOD_GEMINI_KEY') || localStorage.getItem('FLIP_GEMINI_KEY') || '',
  liveSync: {
    enabled: localStorage.getItem('MEMOPOD_LIVE_SYNC') !== 'false',
    timer: null,
    lastMtime: 0,
    isChecking: false
  },
  graph: {
    nodes: [],
    edges: [],
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    dragNode: null,
    dragStartX: 0,
    dragStartY: 0
  }
};

const STORAGE_KEY = 'memopod_knowledge_v2';

// ==========================================================================
// 2. AI Brain Dump & Semantic Extraction Engine
// ==========================================================================

const BrainDumpAI = {
  // 1. Live Gemini 2.0 Flash AI Auto-Synthesis
  async analyzeWithGemini(rawText, typeHint, apiKey) {
    const systemPrompt = `당신은 1인 창업가, 개발자, 인디해커를 위한 최고의 지식 관리 비서(AI Brain Dump Specialist)입니다.
사용자가 마이크로 횡설수설 말하거나 거칠게 쏟아낸 메모를 깊이 분석하여, 아래의 구조화된 JSON 데이터로 정제하세요:
1. 'title': 메모의 핵심 주제를 요약한 15자 이내의 선명한 제목
2. 'summary': 핵심 인사이트를 정돈한 2~3줄의 말끔한 비즈니스 문장
3. 'todos': 메모에서 실행해야 할 구체적인 할 일(Action Items) 목록 (없으면 빈 배열)
4. 'tags': 메모를 지식 그래프로 연결할 3~5개의 핵심 영문 소문자 태그
5. 'type': 'idea', 'business', 'tech', 'link', 'note' 중 가장 적합한 카테고리`;

    const payload = {
      contents: [{ parts: [{ text: `메모 내용:\n"${rawText}"\n\n타입 힌트: ${typeHint}` }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            summary: { type: "STRING" },
            todos: {
              type: "ARRAY",
              items: { type: "STRING" }
            },
            tags: {
              type: "ARRAY",
              items: { type: "STRING" }
            },
            type: { type: "STRING" }
          },
          required: ["title", "summary", "todos", "tags", "type"]
        }
      }
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) throw new Error(`Gemini API Error: ${resp.status}`);
    const data = await resp.json();
    const jsonStr = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(jsonStr);

    return {
      title: parsed.title || rawText.substring(0, 20),
      summary: parsed.summary,
      todos: (parsed.todos || []).map(t => ({ text: t, done: false })),
      tags: (parsed.tags || []).map(t => t.toLowerCase().replace(/[^a-z0-9]/g, '')),
      type: parsed.type || typeHint || 'note',
      isAi: true
    };
  },

  // 2. Smart Local Fallback (키가 없을 때도 형태소/체크박스/태그 즉시 분석)
  analyzeLocally(text, typeHint) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const title = lines[0] ? lines[0].replace(/^#+\s*/, '').substring(0, 30) : '새 지식 노드';

    // Extract Checkboxes / Action items
    const todos = [];
    lines.forEach(l => {
      const match = l.match(/^-\s*\[([ xX])\]\s*(.*)$/);
      if (match) {
        todos.push({ text: match[2].trim(), done: match[1].toLowerCase() === 'x' });
      } else if (l.startsWith('TODO:') || l.startsWith('할일:') || l.startsWith('액션:')) {
        todos.push({ text: l.replace(/^(TODO:|할일:|액션:)\s*/, ''), done: false });
      }
    });

    // Summary (first 2 sentences)
    let summary = text.replace(/-\s*\[[ xX]\]\s*.*$/gm, '').trim();
    if (summary.length > 80) {
      summary = summary.substring(0, 80) + '...';
    }

    // Dynamic Tag Mapping
    const tagMap = {
      'ai': ['ai', 'gpt', '프롬프트', 'llm', '클로드', '인공지능', 'agent'],
      'pricing': ['가격', '단가', '프라이싱', '견적', '비용', '수익', 'pricing'],
      'marketing': ['마케팅', '광고', '홍보', '유입', '트래픽', '세일즈', '인스타'],
      'b2b': ['b2b', '고객', '기업', '클라이언트', '수주', '엔터프라이즈'],
      'saas': ['saas', '구독', '앱', '소프트웨어', 'mrr'],
      'growth': ['성장', '매출', '스케일', '전환율', '그로스'],
      'planner': ['플래너', '투두', '할일', '일정', '계획', '실행'],
      'copywriting': ['카피', '문구', '제목', '글쓰기', '헤드라인']
    };

    const lower = text.toLowerCase();
    const tags = new Set([typeHint || 'note']);
    for (const [t, kws] of Object.entries(tagMap)) {
      if (kws.some(kw => lower.includes(kw))) {
        tags.add(t);
      }
    }

    return {
      title,
      summary: summary || title,
      todos,
      tags: Array.from(tags).slice(0, 5),
      type: typeHint || 'note',
      isAi: false
    };
  }
};

// ==========================================================================
// 3. Application Controller
// ==========================================================================

const MemoApp = {
  init() {
    this.initStorage();
    this.bindEvents();
    this.initCrossWindowSync();
    this.initVoiceAI();
    this.initGraphEngine();
    this.renderTagPills();
    this.initLiveSyncWatcher();
    this.initActionDashboard();
    this.switchView('actions');
  },

  initStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        MemoState.items = JSON.parse(saved);
      } else {
        MemoState.items = SEED_DATA;
        this.saveItems();
      }
    } catch (e) {
      MemoState.items = SEED_DATA;
    }
  },

  saveItems() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MemoState.items));
    if (typeof this.updateActionBadge === 'function') {
      this.updateActionBadge();
    }
  },

  initCrossWindowSync() {
    try {
      const syncChannel = new BroadcastChannel('memopod_sync_channel');
      syncChannel.onmessage = (e) => {
        this.initStorage();
        if (typeof this.renderActionDashboard === 'function') this.renderActionDashboard();
        if (MemoState.currentView === 'cards') this.renderCardsGrid();
        if (MemoState.currentView === 'graph') this.rebuildGraph();
        if (typeof this.updateActionBadge === 'function') this.updateActionBadge();
        this.showToast('⚡ 미니 메모장에서 작성된 메모가 웹 대시보드에 실시간 반영되었습니다!');
      };
    } catch (err) {
      console.warn('BroadcastChannel not supported:', err);
    }

    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        this.initStorage();
        if (typeof this.renderActionDashboard === 'function') this.renderActionDashboard();
        if (MemoState.currentView === 'cards') this.renderCardsGrid();
        if (MemoState.currentView === 'graph') this.rebuildGraph();
        if (typeof this.updateActionBadge === 'function') this.updateActionBadge();
      }
    });
  },

  bindEvents() {
    // Open macOS Apple Notes Pro Floating Modal Window
    const appleNotesModal = document.getElementById('modalAppleNotesApp');
    const openAppleNotesModal = () => {
      if (appleNotesModal) {
        appleNotesModal.classList.add('open');
      }
    };

    document.getElementById('btnOpenMiniApp')?.addEventListener('click', openAppleNotesModal);
    document.getElementById('btnHeroOpenMini')?.addEventListener('click', openAppleNotesModal);

    // Open in separate native OS popup window
    document.getElementById('btnOpenMiniPopup')?.addEventListener('click', () => {
      window.open('quick.html', 'MemoPodMini', 'width=1040,height=680,left=150,top=100,resizable=yes');
    });

    // Close on backdrop click
    appleNotesModal?.addEventListener('click', (e) => {
      if (e.target === appleNotesModal) {
        appleNotesModal.classList.remove('open');
      }
    });

    // Close on postMessage from iframe red traffic dot 🔴
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'CLOSE_APPLE_NOTES_MODAL') {
        appleNotesModal?.classList.remove('open');
      }
    });

    // View Switcher Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.switchView(view);
      });
    });

    // Brain Dump Submit
    document.getElementById('btnSubmitDump').addEventListener('click', () => {
      this.handleBrainDump();
    });

    // 0.2s Quick Scratchpad Preset Chips
    const QUICK_PRESETS = {
      meeting: "오늘 비즈니스 파트너십 미팅 내용:\n- [ ] 다음주 화요일까지 API 연동 견적서 송부\n- [ ] 계약서 법무 검토 요청하기\n- [ ] 2026 플래너 연동 데모 시연 준비\n대표님이 다음달 1일 출시 일정에 매우 긍정적임.",
      idea: "새로운 초경량 웹앱 아이디어:\n카톡 나와의 채팅방 메모를 0.2초 만에 분석해서 오늘 할 일과 이번 주 일정을 2026 플래너로 자동 동기화해주는 서비스. 월 9,900원 구독 모델 검토해보기.",
      todo: "- [ ] 마자 스튜디오 결제 모듈 테스트\n- [ ] 셋업팟 3D 목업 신규 템플릿 등록\n- [ ] 세금계산서 3건 발행 완료하기\n- [x] 어제 서버 로그 점검 완료",
      kakao: "퇴근길 올리브영 들러서 폼클렌징 사기, 계란 1판, 우유\n- [ ] 내일 아침 10시 팀 싱크 미팅 준비자료 슬랙에 올려두기!"
    };

    document.querySelectorAll('.preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const key = chip.dataset.preset;
        const text = QUICK_PRESETS[key];
        const textarea = document.getElementById('rawDumpText');
        const submitBtn = document.getElementById('btnSubmitDump');
        const typeSelect = document.getElementById('dumpTypeSelect');

        if (textarea && text) {
          textarea.value = text;
          textarea.focus();
          if (key === 'meeting') {
            typeSelect.value = 'business';
          } else if (key === 'idea') {
            typeSelect.value = 'idea';
          } else {
            typeSelect.value = 'auto';
          }

          submitBtn.classList.add('highlight-pulse');
          this.showToast('✨ 1초 예시가 입력되었습니다! [AI 마법 정리] 버튼을 눌러보세요.');
        }
      });
    });

    document.getElementById('rawDumpText')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleBrainDump();
      }
    });

    // Voice AI Toggle
    document.getElementById('btnVoiceToggle').addEventListener('click', () => {
      this.toggleVoiceRecording();
    });

    // Cmd + K Command Palette Trigger
    document.getElementById('cmdKTrigger').addEventListener('click', () => {
      this.openCmdPalette();
    });

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openCmdPalette();
      }
      if (e.key === 'Escape') {
        this.closeCmdPalette();
        this.closeDrawer();
        this.closeSettingsModal();
      }
    });

    // Cmd Palette Input filter
    document.getElementById('cmdSearchInput').addEventListener('input', (e) => {
      this.filterCmdPalette(e.target.value);
    });

    // Drawer Close
    document.getElementById('btnCloseDrawer').addEventListener('click', () => {
      this.closeDrawer();
    });

    // Send to 2026 Planner
    document.getElementById('btnSendToPlanner').addEventListener('click', () => {
      this.sendToPlanner();
    });

    // Markdown Editor Real-time Sync
    document.getElementById('editorMarkdownArea')?.addEventListener('input', (e) => {
      this.renderMarkdownPreview(e.target.value);
    });

    // Settings Modal
    document.getElementById('btnSettings').addEventListener('click', () => {
      this.openSettingsModal();
    });
    document.getElementById('btnSaveSettings').addEventListener('click', () => {
      this.saveSettings();
    });
    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
      });
    });

    // JSON Export / Import
    document.getElementById('btnExportJson').addEventListener('click', () => this.exportJSON());
    document.getElementById('importFileInput').addEventListener('change', (e) => this.importJSON(e));

    // Apple & Windows OS Notes Sync Trigger Buttons
    document.getElementById('btnAppleSyncTrigger')?.addEventListener('click', () => {
      this.openUniversalSyncModal('mac');
    });

    document.getElementById('btnWinSyncTrigger')?.addEventListener('click', () => {
      this.openUniversalSyncModal('win');
    });

    // OS Quick Bar Pills
    document.getElementById('quickPillMac')?.addEventListener('click', () => {
      this.openUniversalSyncModal('mac');
    });
    document.getElementById('quickPillWin')?.addEventListener('click', () => {
      this.openUniversalSyncModal('win');
    });
    document.getElementById('quickPillSamsung')?.addEventListener('click', () => {
      this.openUniversalSyncModal('win');
    });
    document.getElementById('quickPillSample')?.addEventListener('click', () => {
      this.loadWindowsSampleNotes();
    });

    // Universal Modal OS Switcher Tabs
    document.getElementById('tabOsMac')?.addEventListener('click', () => {
      this.switchModalOsTab('mac');
    });
    document.getElementById('tabOsWin')?.addEventListener('click', () => {
      this.switchModalOsTab('win');
    });

    // Windows Action Buttons inside Modal
    document.getElementById('btnSyncWinSticky')?.addEventListener('click', () => {
      this.startWindowsSync('sticky');
    });
    document.getElementById('btnSyncWinSamsung')?.addEventListener('click', () => {
      this.startWindowsSync('samsung');
    });
    document.getElementById('btnLoadWinSample')?.addEventListener('click', () => {
      this.loadWindowsSampleNotes();
    });

    // File Upload & Dropzone for Windows plum.sqlite / .sdocx
    const fileInput = document.getElementById('winNotesFileInput');
    const dropzone = document.getElementById('winDropZone');

    document.getElementById('btnSelectWinFile')?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) this.handleWinFileUpload(file);
    });

    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const file = e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) this.handleWinFileUpload(file);
      });
    }

    document.querySelectorAll('.sync-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sync-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        const folderBox = document.getElementById('appleFolderListBox');
        if (folderBox) {
          folderBox.style.display = mode === 'folders' ? 'block' : 'none';
        }
      });
    });

    document.getElementById('btnToggleAllFolders')?.addEventListener('click', () => {
      const cbs = document.querySelectorAll('.apple-folder-cb');
      const allChecked = Array.from(cbs).every(c => c.checked);
      cbs.forEach(c => c.checked = !allChecked);
      this.updateSelectedFoldersCount();
    });

    document.getElementById('btnStartAppleSync')?.addEventListener('click', () => {
      this.startAppleSync();
    });

    document.getElementById('btnExportObsidianZip')?.addEventListener('click', () => {
      this.exportObsidianZip();
    });

    // Welcome Showcase Bar Dismiss & Toggle (Try-First Hybrid)
    const welcomeBar = document.getElementById('welcomeShowcaseBar');
    const toggleWelcomeBtn = document.getElementById('btnToggleWelcome');
    const dismissWelcomeBtn = document.getElementById('btnDismissWelcome');

    const isWelcomeDismissed = localStorage.getItem('memopod_welcome_dismissed') === 'true';
    if (isWelcomeDismissed && welcomeBar && toggleWelcomeBtn) {
      welcomeBar.classList.add('hidden');
      toggleWelcomeBtn.style.display = 'inline-flex';
    }

    dismissWelcomeBtn?.addEventListener('click', () => {
      if (welcomeBar) welcomeBar.classList.add('hidden');
      if (toggleWelcomeBtn) toggleWelcomeBtn.style.display = 'inline-flex';
      localStorage.setItem('memopod_welcome_dismissed', 'true');
    });

    toggleWelcomeBtn?.addEventListener('click', () => {
      if (welcomeBar) welcomeBar.classList.remove('hidden');
      if (toggleWelcomeBtn) toggleWelcomeBtn.style.display = 'none';
      localStorage.setItem('memopod_welcome_dismissed', 'false');
    });
  },

  switchView(viewName) {
    MemoState.currentView = viewName;
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.view === viewName);
    });
    document.querySelectorAll('.view-panel').forEach(p => {
      p.classList.toggle('active', p.id === `view-${viewName}`);
    });

    if (viewName === 'graph') {
      this.rebuildGraph();
    } else if (viewName === 'cards') {
      this.renderCardsGrid();
    } else if (viewName === 'editor') {
      this.loadActiveOrLatestToEditor();
    } else if (viewName === 'actions') {
      this.renderActionDashboard();
    }
  },

  // ========================================================================
  // Voice AI (AudioPen Speech-To-Text)
  // ========================================================================
  initVoiceAI() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      MemoState.speechRecognition = new SpeechRec();
      MemoState.speechRecognition.lang = 'ko-KR';
      MemoState.speechRecognition.continuous = true;
      MemoState.speechRecognition.interimResults = true;

      MemoState.speechRecognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        const textarea = document.getElementById('rawDumpText');
        textarea.value = transcript;
      };

      MemoState.speechRecognition.onerror = (e) => {
        console.warn('Speech recognition error:', e);
        this.stopVoiceRecording();
      };
    }
  },

  toggleVoiceRecording() {
    if (!MemoState.speechRecognition) {
      this.showToast('이 브라우저는 음성 인식을 지원하지 않습니다. (크롬 권장)');
      return;
    }

    if (MemoState.isRecording) {
      this.stopVoiceRecording();
    } else {
      this.startVoiceRecording();
    }
  },

  startVoiceRecording() {
    try {
      MemoState.speechRecognition.start();
      MemoState.isRecording = true;
      const btn = document.getElementById('btnVoiceToggle');
      btn.classList.add('recording');
      btn.innerHTML = `<i class="fa-solid fa-microphone-lines"></i> <span>듣는 중... (클릭 시 중지)</span>`;
      this.showToast('🎙️ AudioPen 모드: 편하게 생각을 말씀하세요!');
    } catch (e) {
      console.error(e);
    }
  },

  stopVoiceRecording() {
    try {
      MemoState.speechRecognition.stop();
      MemoState.isRecording = false;
      const btn = document.getElementById('btnVoiceToggle');
      btn.classList.remove('recording');
      btn.innerHTML = `<i class="fa-solid fa-microphone"></i> <span>음성 메모 (AudioPen)</span>`;
      this.showToast('✨ 음성 인식이 완료되었습니다. AI 분석 버튼을 눌러보세요.');
    } catch (e) {
      console.error(e);
    }
  },

  // ========================================================================
  // Brain Dump Handler
  // ========================================================================
  async handleBrainDump() {
    const textarea = document.getElementById('rawDumpText');
    const text = textarea.value.trim();
    const typeSelect = document.getElementById('dumpTypeSelect').value;

    if (!text) {
      this.showToast('생각이나 아이디어를 입력해주세요.');
      return;
    }

    const btn = document.getElementById('btnSubmitDump');
    btn.disabled = true;
    btn.classList.remove('highlight-pulse');
    btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> <span>🪄 0.2초 마법 정리 중...</span>`;

    try {
      let analysis;
      const apiKey = MemoState.geminiApiKey;

      if (apiKey) {
        try {
          analysis = await BrainDumpAI.analyzeWithGemini(text, typeSelect, apiKey);
          this.showToast('✨ Gemini AI로 간단 메모를 완벽하게 정제했습니다!');
        } catch (apiErr) {
          console.warn('Gemini error, using local extractor:', apiErr);
          analysis = BrainDumpAI.analyzeLocally(text, typeSelect);
          this.showToast('⚡ 스마트 로컬 분석기로 To-Do와 핵심 과제를 추출했습니다.');
        }
      } else {
        analysis = BrainDumpAI.analyzeLocally(text, typeSelect);
        const todoCnt = (analysis.todos && analysis.todos.length) || 0;
        this.showToast(`⚡ 간단 메모에서 ${todoCnt > 0 ? todoCnt + '개의 To-Do와 ' : ''}핵심 실행 과제를 마법처럼 정리했습니다!`);
      }

      const newNode = {
        id: 'node-' + Date.now(),
        type: analysis.type,
        title: analysis.title,
        content: text,
        summary: analysis.summary,
        todos: analysis.todos,
        tags: analysis.tags,
        createdAt: new Date().toISOString().split('T')[0]
      };

      MemoState.items.unshift(newNode);
      this.saveItems();
      textarea.value = '';

      this.renderTagPills();
      if (typeof this.renderActionDashboard === 'function') {
        this.renderActionDashboard();
      }
      if (MemoState.currentView === 'graph') {
        this.rebuildGraph();
      } else if (MemoState.currentView === 'cards') {
        this.renderCardsGrid();
      }
      this.openDrawer(newNode.id);
    } catch (err) {
      console.error(err);
      this.showToast('메모 정리 중 오류가 발생했습니다.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
      <span id="submitDumpLabel">✨ AI 마법 정리 &amp; To-Do 추출 (0.2s)</span>`;
    }
  },

  // ========================================================================
  // Tag Filter Bar
  // ========================================================================
  renderTagPills() {
    const container = document.getElementById('tagPillsContainer');
    if (!container) return;
    container.innerHTML = '';

    const allPill = document.createElement('div');
    allPill.className = `tag-pill ${!MemoState.activeFilterTag ? 'active' : ''}`;
    allPill.innerHTML = `<i class="fa-solid fa-layer-group"></i> <span>전체 (${MemoState.items.length})</span>`;
    allPill.addEventListener('click', () => {
      MemoState.activeFilterTag = null;
      this.renderTagPills();
      if (MemoState.currentView === 'graph') this.rebuildGraph();
      else if (MemoState.currentView === 'cards') this.renderCardsGrid();
    });
    container.appendChild(allPill);

    const tagCounts = {};
    MemoState.items.forEach(i => {
      (i.tags || []).forEach(t => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });

    Object.keys(tagCounts).sort((a,b) => tagCounts[b] - tagCounts[a]).forEach(tag => {
      const pill = document.createElement('div');
      pill.className = `tag-pill ${MemoState.activeFilterTag === tag ? 'active' : ''}`;
      pill.innerHTML = `<span>#${tag}</span> <strong style="font-size:10px; opacity:0.7;">${tagCounts[tag]}</strong>`;
      pill.addEventListener('click', () => {
        MemoState.activeFilterTag = MemoState.activeFilterTag === tag ? null : tag;
        this.renderTagPills();
        if (MemoState.currentView === 'graph') this.rebuildGraph();
        else if (MemoState.currentView === 'cards') this.renderCardsGrid();
      });
      container.appendChild(pill);
    });
  },

  // ========================================================================
  // 4. 60FPS Force-Directed Knowledge Graph Simulation
  // ========================================================================
  initGraphEngine() {
    const canvas = document.getElementById('graphCanvas');
    if (!canvas) return;

    // Resize Canvas to container
    const resize = () => {
      const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : null;
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(300, (rect && rect.width > 0) ? rect.width : window.innerWidth);
      const h = Math.max(300, (rect && rect.height > 0) ? rect.height : (window.innerHeight - 220));
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
    };
    window.addEventListener('resize', resize);
    resize();

    // Canvas Interactions (Pan & Drag)
    canvas.addEventListener('mousedown', (e) => this.onGraphMouseDown(e));
    window.addEventListener('mousemove', (e) => this.onGraphMouseMove(e));
    window.addEventListener('mouseup', () => this.onGraphMouseUp());
    canvas.addEventListener('wheel', (e) => this.onGraphWheel(e), { passive: false });

    // HUD controls
    document.getElementById('btnZoomIn')?.addEventListener('click', () => this.zoomGraph(1.2));
    document.getElementById('btnZoomOut')?.addEventListener('click', () => this.zoomGraph(0.8));
    document.getElementById('btnZoomReset')?.addEventListener('click', () => this.resetGraphView());

    this.rebuildGraph();
    this.startGraphPhysicsLoop();
  },

  rebuildGraph() {
    const nodes = [];
    const edges = [];
    const items = MemoState.activeFilterTag 
      ? MemoState.items.filter(i => (i.tags || []).includes(MemoState.activeFilterTag))
      : MemoState.items;

    const tagNodesMap = {};
    const typeColorMap = {
      idea: '#fbbf24',
      business: '#38bdf8',
      tech: '#c084fc',
      link: '#34d399',
      note: '#94a3b8'
    };

    // 1. Build Item Nodes
    const itemCount = Math.max(1, items.length);
    items.forEach((item, idx) => {
      const angle = (idx / itemCount) * Math.PI * 2;
      const dist = 120 + (idx % 2 === 0 ? 30 : -20);

      let nodeColor = typeColorMap[item.type] || '#818cf8';
      let iconPrefix = '';
      if (item.source === 'sticky-notes') {
        const themeMap = {
          blue: '#0284c7',
          yellow: '#eab308',
          green: '#10b981',
          pink: '#ec4899',
          purple: '#a855f7'
        };
        nodeColor = themeMap[(item.theme || 'blue').toLowerCase()] || '#0284c7';
        iconPrefix = '🪟 ';
      } else if (item.source === 'samsung-notes') {
        nodeColor = '#2563eb';
        iconPrefix = '📱 ';
      } else if (item.source === 'apple-notes' || item.appleId) {
        iconPrefix = '🍏 ';
      }

      const rawLabel = item.title || (item.summary ? item.summary.substring(0, 16) : '메모 노드');
      const cleanLabel = rawLabel.length > 20 ? rawLabel.substring(0, 20) + '...' : rawLabel;

      nodes.push({
        id: item.id,
        isItem: true,
        data: item,
        label: iconPrefix + cleanLabel,
        color: nodeColor,
        radius: 14,
        livePulse: item.livePulse || 0,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      });

      // Collect Tag Hubs
      (item.tags || []).forEach((t, tIdx) => {
        if (!tagNodesMap[t]) {
          const tAngle = angle + ((tIdx + 1) * 0.45);
          const tDist = dist + 70;
          tagNodesMap[t] = {
            id: 'tag-' + t,
            isItem: false,
            tag: t,
            label: '#' + t,
            color: '#6366f1',
            radius: 9,
            x: Math.cos(tAngle) * tDist,
            y: Math.sin(tAngle) * tDist,
            vx: 0,
            vy: 0
          };
        }
        edges.push({
          source: item.id,
          target: 'tag-' + t
        });
      });
    });

    // Add Tag Hub Nodes
    Object.values(tagNodesMap).forEach(tn => nodes.push(tn));

    MemoState.graph.nodes = nodes;
    MemoState.graph.edges = edges;

    // Update HUD Stats
    const statNode = document.getElementById('statNodeCount');
    const statTag = document.getElementById('statTagCount');
    const statEdge = document.getElementById('statEdgeCount');
    if (statNode) statNode.innerText = items.length;
    if (statTag) statTag.innerText = Object.keys(tagNodesMap).length;
    if (statEdge) statEdge.innerText = edges.length;
  },

  startGraphPhysicsLoop() {
    const canvas = document.getElementById('graphCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const loop = () => {
      if (MemoState.currentView === 'graph') {
        this.updateGraphPhysics();
        this.renderGraphCanvas(ctx, canvas);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },

  updateGraphPhysics() {
    const nodes = MemoState.graph.nodes;
    const edges = MemoState.graph.edges;
    if (!nodes || nodes.length === 0) return;

    const nodeMap = {};
    nodes.forEach(n => {
      if (!isFinite(n.x) || !isFinite(n.y)) {
        n.x = (Math.random() - 0.5) * 200;
        n.y = (Math.random() - 0.5) * 200;
        n.vx = 0;
        n.vy = 0;
      }
      nodeMap[n.id] = n;
    });

    // 1. Coulomb-style Repulsion between all nodes (using unit vectors)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 240) {
          const repulse = (240 - dist) / dist;
          const fx = (dx / dist) * repulse * 3.5;
          const fy = (dy / dist) * repulse * 3.5;
          nodes[i].vx -= fx;
          nodes[i].vy -= fy;
          nodes[j].vx += fx;
          nodes[j].vy += fy;
        }
      }
    }

    // 2. Hooke-style Spring Attraction along Edges (using unit vectors)
    edges.forEach(e => {
      const src = nodeMap[e.source];
      const tgt = nodeMap[e.target];
      if (src && tgt) {
        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const dist = Math.hypot(dx, dy) || 1;
        const displacement = dist - 85;
        const spring = displacement * 0.04;
        const fx = (dx / dist) * spring;
        const fy = (dy / dist) * spring;
        src.vx += fx;
        src.vy += fy;
        tgt.vx -= fx;
        tgt.vy -= fy;
      }
    });

    // 3. Center Gravity, Damping & Strict Velocity Clamping
    nodes.forEach(n => {
      if (n === MemoState.graph.dragNode) return;
      
      // Gentle center gravity
      n.vx -= n.x * 0.003;
      n.vy -= n.y * 0.003;
      
      // Damping / Friction
      n.vx *= 0.85;
      n.vy *= 0.85;
      
      // Strict velocity clamping (Prevents any run-away exponential explosion)
      const speed = Math.hypot(n.vx, n.vy);
      const maxSpeed = 8.0;
      if (speed > maxSpeed) {
        n.vx = (n.vx / speed) * maxSpeed;
        n.vy = (n.vy / speed) * maxSpeed;
      }
      
      n.x += n.vx;
      n.y += n.vy;
    });
  },

  renderGraphCanvas(ctx, canvas) {
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    
    // Auto sync resolution
    const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : null;
    if (rect && rect.width > 0 && rect.height > 0) {
      const targetW = Math.round(rect.width * dpr);
      const targetH = Math.round(rect.height * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(dpr, dpr);
    const cssW = canvas.width / dpr;
    const cssH = canvas.height / dpr;
    const centerX = cssW / 2 + MemoState.graph.offsetX;
    const centerY = cssH / 2 + MemoState.graph.offsetY;
    ctx.translate(centerX, centerY);
    ctx.scale(MemoState.graph.zoom, MemoState.graph.zoom);

    const nodeMap = {};
    MemoState.graph.nodes.forEach(n => nodeMap[n.id] = n);

    // Draw Edges
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.28)';
    ctx.lineWidth = 1;
    MemoState.graph.edges.forEach(e => {
      const src = nodeMap[e.source];
      const tgt = nodeMap[e.target];
      if (src && tgt && isFinite(src.x) && isFinite(tgt.x)) {
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.stroke();
      }
    });

    // Draw Nodes
    MemoState.graph.nodes.forEach(n => {
      if (!isFinite(n.x) || !isFinite(n.y)) return;
      const isSelected = MemoState.activeNodeId === n.id;

      // Glow Ring
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius + (isSelected ? 6 : 3), 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.45)' : `${n.color}33`;
      ctx.fill();

      // Core Circle
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#38bdf8' : '#ffffff';
      ctx.lineWidth = isSelected ? 2.5 : 1.2;
      ctx.stroke();

      // Radar Sonar Pulse for live-synced notes
      if (n.livePulse && n.livePulse > 0) {
        const pulseRatio = (60 - n.livePulse) / 60;
        const sonarRadius = n.radius + pulseRatio * 45;
        ctx.beginPath();
        ctx.arc(n.x, n.y, sonarRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(52, 211, 153, ${Math.max(0, (n.livePulse / 60) * 0.9)})`;
        ctx.lineWidth = 2.2;
        ctx.stroke();
        n.livePulse -= 0.5;
        if (n.data) n.data.livePulse = n.livePulse;
      }

      // Label Text
      ctx.font = `${n.isItem ? '600 11px' : '500 10px'} 'Pretendard', sans-serif`;
      ctx.fillStyle = isSelected ? '#38bdf8' : (n.isItem ? '#f8fafc' : '#94a3b8');
      ctx.textAlign = 'center';
      ctx.fillText(n.label || '', n.x, n.y + n.radius + 14);
    });

    ctx.restore();
  },

  onGraphMouseDown(e) {
    const canvas = document.getElementById('graphCanvas');
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = rect.width / 2 + MemoState.graph.offsetX;
    const centerY = rect.height / 2 + MemoState.graph.offsetY;
    const worldX = (mouseX - centerX) / MemoState.graph.zoom;
    const worldY = (mouseY - centerY) / MemoState.graph.zoom;

    // Check node click
    const clickedNode = MemoState.graph.nodes.find(n => {
      const dx = n.x - worldX;
      const dy = n.y - worldY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 5;
    });

    if (clickedNode) {
      MemoState.graph.dragNode = clickedNode;
      if (clickedNode.isItem) {
        this.openDrawer(clickedNode.id);
      } else {
        // Tag Clicked
        MemoState.activeFilterTag = clickedNode.tag;
        this.renderTagPills();
        this.rebuildGraph();
      }
    } else {
      MemoState.graph.isDragging = true;
      MemoState.graph.dragStartX = e.clientX - MemoState.graph.offsetX;
      MemoState.graph.dragStartY = e.clientY - MemoState.graph.offsetY;
    }
  },

  onGraphMouseMove(e) {
    if (MemoState.graph.dragNode) {
      const canvas = document.getElementById('graphCanvas');
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const centerX = rect.width / 2 + MemoState.graph.offsetX;
      const centerY = rect.height / 2 + MemoState.graph.offsetY;
      MemoState.graph.dragNode.x = (mouseX - centerX) / MemoState.graph.zoom;
      MemoState.graph.dragNode.y = (mouseY - centerY) / MemoState.graph.zoom;
    } else if (MemoState.graph.isDragging) {
      MemoState.graph.offsetX = e.clientX - MemoState.graph.dragStartX;
      MemoState.graph.offsetY = e.clientY - MemoState.graph.dragStartY;
    }
  },

  onGraphMouseUp() {
    MemoState.graph.dragNode = null;
    MemoState.graph.isDragging = false;
  },

  onGraphWheel(e) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    this.zoomGraph(factor);
  },

  zoomGraph(factor) {
    MemoState.graph.zoom = Math.max(0.4, Math.min(3.0, MemoState.graph.zoom * factor));
  },

  resetGraphView() {
    MemoState.graph.zoom = 1;
    MemoState.graph.offsetX = 0;
    MemoState.graph.offsetY = 0;
  },

  // ========================================================================
  // 5. Cards Grid View
  // ========================================================================
  renderCardsGrid() {
    const grid = document.getElementById('cardsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const items = MemoState.activeFilterTag 
      ? MemoState.items.filter(i => (i.tags || []).includes(MemoState.activeFilterTag))
      : MemoState.items;

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'memo-card';
      card.addEventListener('click', () => this.openDrawer(item.id));

      let sourceBadge = '';
      if (item.source === 'sticky-notes') {
        sourceBadge = `<span class="source-tag-win" style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">🪟 스티커 메모</span>`;
        if (item.theme) card.classList.add(`card-theme-${item.theme.toLowerCase()}`);
      } else if (item.source === 'samsung-notes') {
        sourceBadge = `<span class="source-tag-samsung" style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">📱 삼성 노트</span>`;
      } else if (item.source === 'apple-notes' || item.appleId) {
        sourceBadge = `<span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);">🍏 애플 메모</span>`;
      }

      let todosHtml = '';
      if (item.todos && item.todos.length > 0) {
        todosHtml = `
          <div class="memo-todos-preview">
            ${item.todos.slice(0, 2).map((t, idx) => `
              <div class="todo-item-row">
                <input type="checkbox" class="todo-checkbox" ${t.done ? 'checked' : ''} onclick="event.stopPropagation(); MemoApp.toggleCardTodo('${item.id}', ${idx})">
                <span style="${t.done ? 'text-decoration:line-through; opacity:0.6;' : ''}">${t.text}</span>
              </div>
            `).join('')}
          </div>
        `;
      }

      card.innerHTML = `
        <div class="memo-card-head">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="type-pill ${item.type}">${item.type}</span>
            ${sourceBadge}
          </div>
          <span style="font-size:10px; color:var(--text-muted);">${item.createdAt}</span>
        </div>
        <div class="memo-summary-text">${item.title || item.summary}</div>
        <div style="font-size:12px; color:var(--text-secondary); line-height:1.45;">${item.summary}</div>
        ${todosHtml}
        <div class="memo-tags-row">
          ${(item.tags || []).map(t => `<span class="memo-tag-item">#${t}</span>`).join('')}
        </div>
      `;
      grid.appendChild(card);
    });
  },

  toggleCardTodo(itemId, todoIdx) {
    const item = MemoState.items.find(i => i.id === itemId);
    if (item && item.todos[todoIdx]) {
      item.todos[todoIdx].done = !item.todos[todoIdx].done;
      this.saveItems();
      this.renderCardsGrid();
    }
  },

  // ========================================================================
  // 6. Markdown Editor View
  // ========================================================================
  loadActiveOrLatestToEditor() {
    const target = MemoState.items.find(i => i.id === MemoState.activeNodeId) || MemoState.items[0];
    if (!target) return;
    const textarea = document.getElementById('editorMarkdownArea');
    textarea.value = target.content || target.summary;
    this.renderMarkdownPreview(textarea.value);
  },

  renderMarkdownPreview(rawText) {
    const preview = document.getElementById('markdownPreviewPane');
    if (!preview) return;

    let html = rawText
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/^-\s*\[([ xX])\]\s*(.*$)/gim, (m, check, text) => {
        const isChecked = check.toLowerCase() === 'x';
        return `<div class="todo-item-row" style="margin-bottom:6px;"><input type="checkbox" ${isChecked ? 'checked' : ''}> <span style="${isChecked ? 'text-decoration:line-through; opacity:0.6;' : ''}">${text}</span></div>`;
      })
      .replace(/^-\s+(.*$)/gim, '<ul><li>$1</li></ul>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/\n$/gim, '<br />');

    preview.innerHTML = html;
  },

  // ========================================================================
  // 7. Slide-out Drawer & 2026 Planner Integration
  // ========================================================================
  openDrawer(itemId) {
    const item = MemoState.items.find(i => i.id === itemId);
    if (!item) return;

    MemoState.activeNodeId = itemId;
    const drawer = document.getElementById('memoDrawer');
    drawer.classList.add('open');

    document.getElementById('drawerTypeTag').className = `type-pill ${item.type}`;
    document.getElementById('drawerTypeTag').innerText = item.type;
    document.getElementById('drawerTitle').innerText = item.title || '지식 노드 상세';
    document.getElementById('drawerDate').innerText = item.createdAt;
    document.getElementById('drawerSummaryText').innerText = item.summary;

    // Render Action Items
    const todosWrap = document.getElementById('drawerTodosContainer');
    todosWrap.innerHTML = '';
    if (item.todos && item.todos.length > 0) {
      item.todos.forEach((t, idx) => {
        const row = document.createElement('div');
        row.className = 'action-item-check';
        row.innerHTML = `
          <input type="checkbox" class="todo-checkbox" ${t.done ? 'checked' : ''}>
          <span style="${t.done ? 'text-decoration:line-through; opacity:0.6;' : ''}">${t.text}</span>
        `;
        row.querySelector('input').addEventListener('change', (e) => {
          t.done = e.target.checked;
          MemoApp.saveItems();
          MemoApp.openDrawer(itemId);
        });
        todosWrap.appendChild(row);
      });
    } else {
      todosWrap.innerHTML = `<span style="font-size:11px; color:var(--text-muted);">추출된 실행 액션 아이템이 없습니다.</span>`;
    }

    // Full Raw Content
    document.getElementById('drawerRawContent').value = item.content || item.summary;

    // Tags
    const tagsWrap = document.getElementById('drawerTagsContainer');
    tagsWrap.innerHTML = (item.tags || []).map(t => `<span class="memo-tag-item">#${t}</span>`).join(' ');

    // Windows / Samsung Notes Badge in Drawer
    const winBadge = document.getElementById('drawerWindowsBadge');
    const winIcon = document.getElementById('drawerWindowsIcon');
    const winText = document.getElementById('drawerWindowsSourceText');
    if (winBadge) {
      if (item.source === 'sticky-notes') {
        winBadge.style.display = 'flex';
        if (winIcon) winIcon.innerText = '🪟';
        if (winText) winText.innerText = `Windows 스티커 메모 (테마: ${item.theme || 'Blue'})`;
      } else if (item.source === 'samsung-notes') {
        winBadge.style.display = 'flex';
        if (winIcon) winIcon.innerText = '📱';
        if (winText) winText.innerText = '삼성 갤럭시 노트 (.sdocx 연동)';
      } else {
        winBadge.style.display = 'none';
      }
    }

    // Native macOS Deep Link to Apple Notes
    const appleBtn = document.getElementById('btnOpenInAppleNotes');
    if (appleBtn) {
      if (item.appleId || item.source === 'apple-notes') {
        appleBtn.style.display = 'flex';
        appleBtn.onclick = () => this.openInAppleNotes(item);
      } else {
        appleBtn.style.display = 'none';
      }
    }
  },

  async openInAppleNotes(item) {
    try {
      const res = await fetch('/api/apple-notes/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appleId: item.appleId, title: item.title })
      });
      const data = await res.json();
      if (data && data.success) {
        this.showToast('🍏 맥 메모 앱을 활성화하여 해당 메모를 열었습니다!');
      } else {
        this.showToast('메모 앱에서 열지 못했습니다.');
      }
    } catch (e) {
      this.showToast('맥 메모 연동 통신 오류');
    }
  },

  closeDrawer() {
    document.getElementById('memoDrawer').classList.remove('open');
    MemoState.activeNodeId = null;
  },

  sendToPlanner() {
    const item = MemoState.items.find(i => i.id === MemoState.activeNodeId);
    if (!item) return;

    try {
      const PLANNER_KEY = 'setupod_planner_2026_data';
      let plannerData = {};
      const saved = localStorage.getItem(PLANNER_KEY);
      if (saved) plannerData = JSON.parse(saved);

      const today = new Date();
      const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      if (!plannerData[dateKey]) {
        plannerData[dateKey] = { priority: '', todos: [], notes: '' };
      }

      // Add to planner todos
      const todoText = `[MemoPod] ${item.title || item.summary}`;
      plannerData[dateKey].todos.push({
        id: 'todo-' + Date.now(),
        text: todoText,
        done: false
      });

      // Also append extracted action items
      (item.todos || []).forEach(t => {
        plannerData[dateKey].todos.push({
          id: 'todo-' + Date.now() + Math.random(),
          text: `[MemoPod Action] ${t.text}`,
          done: t.done
        });
      });

      localStorage.setItem(PLANNER_KEY, JSON.stringify(plannerData));
      this.showToast('🎯 2026 플래너 오늘의 To-Do에 등록되었습니다!');
    } catch (e) {
      this.showToast('플래너 저장 중 오류가 발생했습니다.');
    }
  },

  // ========================================================================
  // 8. Cmd + K Command Palette
  // ========================================================================
  openCmdPalette() {
    const modal = document.getElementById('cmdPaletteModal');
    modal.classList.add('open');
    const input = document.getElementById('cmdSearchInput');
    input.value = '';
    input.focus();
    this.filterCmdPalette('');
  },

  closeCmdPalette() {
    document.getElementById('cmdPaletteModal').classList.remove('open');
  },

  filterCmdPalette(query) {
    const container = document.getElementById('cmdResultsList');
    container.innerHTML = '';
    const q = query.toLowerCase().trim();

    const filtered = MemoState.items.filter(i => {
      return !q || 
        (i.title && i.title.toLowerCase().includes(q)) || 
        (i.summary && i.summary.toLowerCase().includes(q)) ||
        (i.tags && i.tags.some(t => t.includes(q))) ||
        (i.content && i.content.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div style="padding:16px; text-align:center; color:var(--text-muted); font-size:12px;">일치하는 메모가 없습니다.</div>`;
      return;
    }

    filtered.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = `cmd-result-item ${idx === 0 ? 'selected' : ''}`;
      row.innerHTML = `
        <div>
          <div class="cmd-result-title">${item.title || item.summary}</div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${item.summary.substring(0, 45)}...</div>
        </div>
        <span class="cmd-result-type">${item.type}</span>
      `;
      row.addEventListener('click', () => {
        this.closeCmdPalette();
        this.openDrawer(item.id);
      });
      container.appendChild(row);
    });
  },

  // ========================================================================
  // 9. Settings & Backup
  // ========================================================================
  openSettingsModal() {
    document.getElementById('settingGeminiKey').value = MemoState.geminiApiKey || '';
    document.getElementById('settingsModal').classList.add('open');
  },

  closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('open');
  },

  saveSettings() {
    const key = document.getElementById('settingGeminiKey').value.trim();
    localStorage.setItem('MEMOPOD_GEMINI_KEY', key);
    MemoState.geminiApiKey = key;
    this.closeSettingsModal();
    this.showToast('AI 설정이 저장되었습니다!');
  },

  exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(MemoState.items, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `memopod_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    this.showToast('📦 지식 데이터가 JSON 파일로 백업되었습니다.');
  },

  importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (Array.isArray(parsed)) {
          MemoState.items = parsed;
          this.saveItems();
          this.renderTagPills();
          if (MemoState.currentView === 'graph') this.rebuildGraph();
          else if (MemoState.currentView === 'cards') this.renderCardsGrid();
          this.showToast('✅ 데이터를 성공적으로 복원했습니다.');
        }
      } catch (err) {
        this.showToast('올바른 JSON 백업 파일이 아닙니다.');
      }
    };
    reader.readAsText(file);
  },

  showToast(message) {
    const toast = document.getElementById('toastBar');
    const text = document.getElementById('toastBarText');
    text.innerText = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  },

  // ========================================================================
  // 10. Universal Cross-Platform OS Notes Sync Integration
  // ========================================================================
  async openAppleSyncModal() {
    this.openUniversalSyncModal('mac');
  },

  async openUniversalSyncModal(initialTab = 'mac') {
    const modal = document.getElementById('appleSyncModal');
    if (!modal) return;
    modal.classList.add('open');

    this.switchModalOsTab(initialTab);

    if (initialTab === 'mac') {
      const totalCountEl = document.getElementById('appleTotalCount');
      const statusText = document.getElementById('appleSyncStatusText');
      if (statusText) {
        statusText.style.display = 'block';
        statusText.innerText = '맥 메모 폴더 목록을 조회하는 중...';
      }

      try {
        const res = await fetch('/api/apple-notes/folders');
        const data = await res.json();
        if (data && data.success) {
          const folders = data.folders || [];
          const total = folders.reduce((acc, f) => acc + (f.count || 0), 0);
          if (totalCountEl) totalCountEl.innerText = total.toLocaleString();
          this.renderFolderChecklist(folders);
          if (statusText) {
            statusText.innerText = `총 ${total}개의 메모(${folders.length}개 폴더)가 연결 대기 중입니다.`;
          }
        }
      } catch (err) {
        if (statusText) {
          statusText.innerText = '맥 메모 연결에 실패했습니다. server.py가 실행 중인지 확인하세요.';
        }
      }
    }
  },

  switchModalOsTab(os = 'mac') {
    const tabMac = document.getElementById('tabOsMac');
    const tabWin = document.getElementById('tabOsWin');
    const panelMac = document.getElementById('panelMacSync');
    const panelWin = document.getElementById('panelWinSync');

    if (tabMac) tabMac.classList.toggle('active', os === 'mac');
    if (tabWin) tabWin.classList.toggle('active', os === 'win');

    if (panelMac) panelMac.style.display = os === 'mac' ? 'block' : 'none';
    if (panelWin) panelWin.style.display = os === 'win' ? 'block' : 'none';
  },

  renderFolderChecklist(folders) {
    const container = document.getElementById('appleFoldersList');
    if (!container) return;
    container.innerHTML = '';

    folders.forEach(f => {
      const label = document.createElement('label');
      label.className = 'apple-folder-item';
      
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'apple-folder-cb';
      cb.value = f.name;
      // Pre-check high-value business/dev folders by default
      const isHighValue = !['Notes', 'Recently Deleted'].includes(f.name);
      cb.checked = isHighValue;
      cb.addEventListener('change', () => this.updateSelectedFoldersCount());

      const spanName = document.createElement('span');
      spanName.innerText = f.name;
      spanName.style.flex = '1';
      spanName.style.overflow = 'hidden';
      spanName.style.textOverflow = 'ellipsis';
      spanName.style.whiteSpace = 'nowrap';

      const spanCount = document.createElement('span');
      spanCount.innerText = f.count;
      spanCount.style.fontSize = '10px';
      spanCount.style.color = '#94a3b8';

      label.appendChild(cb);
      label.appendChild(spanName);
      label.appendChild(spanCount);
      container.appendChild(label);
    });

    this.updateSelectedFoldersCount();
  },

  updateSelectedFoldersCount() {
    const checked = document.querySelectorAll('.apple-folder-cb:checked');
    const countEl = document.getElementById('selectedFoldersCount');
    if (countEl) countEl.innerText = checked.length;
  },

  async startAppleSync() {
    const btn = document.getElementById('btnStartAppleSync');
    const btnText = document.getElementById('btnStartAppleSyncText');
    const statusText = document.getElementById('appleSyncStatusText');

    const activeModeBtn = document.querySelector('.sync-mode-btn.active');
    const mode = activeModeBtn ? activeModeBtn.dataset.mode : 'all';

    let payload = {};
    if (mode === 'all') {
      payload = { folders: null, total_limit: null };
    } else if (mode === 'recent') {
      payload = { total_limit: 30 };
    } else if (mode === 'folders') {
      const selected = Array.from(document.querySelectorAll('.apple-folder-cb:checked')).map(c => c.value);
      if (selected.length === 0) {
        this.showToast('가져올 폴더를 하나 이상 선택해주세요.');
        return;
      }
      payload = { folders: selected };
    }

    if (btn) btn.disabled = true;
    if (btnText) btnText.innerText = '추출 및 지식 변환 중...';
    if (statusText) {
      statusText.style.display = 'block';
      statusText.innerText = '🍏 맥 메모 앱에서 노트를 읽어와 AI 지식 노드로 변환하고 있습니다... (수 초 소요)';
    }

    try {
      const res = await fetch('/api/apple-notes/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result && result.success) {
        const newNotes = result.items || [];
        const existingIds = new Set(MemoState.items.map(i => i.id));
        const deduplicated = newNotes.filter(n => !existingIds.has(n.id));

        // Prepend new notes
        MemoState.items = [...deduplicated, ...MemoState.items];
        this.saveItems();
        this.renderTagPills();

        if (MemoState.currentView === 'graph') {
          this.rebuildGraph();
        } else if (MemoState.currentView === 'cards') {
          this.renderCardsGrid();
        }

        // Close modal
        document.getElementById('appleSyncModal')?.classList.remove('open');
        this.showToast(`🎉 애플 메모 ${newNotes.length}개가 지식 그래프에 성공적으로 등록되었습니다!`);
      } else {
        this.showToast('동기화 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error(err);
      this.showToast('동기화 통신 오류가 발생했습니다.');
    } finally {
      if (btn) btn.disabled = false;
      if (btnText) btnText.innerText = '지금 동기화 시작';
    }
  },

  async exportObsidianZip() {
    const btn = document.getElementById('btnExportObsidianZip');
    const oldText = btn ? btn.innerText : '';
    if (btn) btn.innerText = '📦 압축 생성 중...';

    try {
      const activeModeBtn = document.querySelector('.sync-mode-btn.active');
      const mode = activeModeBtn ? activeModeBtn.dataset.mode : 'all';
      let payload = { folders: null };
      if (mode === 'folders') {
        const selected = Array.from(document.querySelectorAll('.apple-folder-cb:checked')).map(c => c.value);
        if (selected.length > 0) payload.folders = selected;
      }

      const res = await fetch('/api/apple-notes/export-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AppleNotes_Obsidian_Vault_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      this.showToast('📦 옵시디언 마크다운 볼트(ZIP) 파일이 다운로드되었습니다!');
    } catch (err) {
      this.showToast('ZIP 추출 중 오류가 발생했습니다.');
    } finally {
      if (btn) btn.innerText = oldText;
    }
  },

  // ========================================================================
  // 10-1. Windows Sticky Notes & Samsung Notes Bridge Engine
  // ========================================================================
  async loadWindowsSampleNotes() {
    this.showToast('🧪 윈도우 스티커 메모 & 삼성노트 샘플 데이터를 불러오는 중...');
    try {
      const res = await fetch('/api/windows-notes/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sample: true })
      });
      const data = await res.json();
      if (data && data.success && data.items) {
        const newNotes = data.items;
        const existingIds = new Set(MemoState.items.map(i => i.id));
        const deduplicated = newNotes.filter(n => !existingIds.has(n.id));

        if (deduplicated.length > 0) {
          MemoState.items = [...deduplicated, ...MemoState.items];
          this.saveItems();
          this.renderTagPills();
          this.updateActionBadge();

          if (MemoState.currentView === 'graph') {
            this.rebuildGraph();
          } else if (MemoState.currentView === 'cards') {
            this.renderCardsGrid();
          } else if (MemoState.currentView === 'actions') {
            this.renderActionsView();
          }
        }

        // Close modal
        document.getElementById('appleSyncModal')?.classList.remove('open');
        this.showToast(`🎉 윈도우 스티커 메모 & 삼성 노트 ${newNotes.length}건이 지식 그래프와 액션 대시보드에 즉시 로드되었습니다!`);
      } else {
        this.showToast('샘플 데이터를 불러오지 못했습니다.');
      }
    } catch (err) {
      console.error(err);
      this.showToast('윈도우 브릿지 통신 오류가 발생했습니다.');
    }
  },

  async startWindowsSync(sourceType = 'all') {
    const label = sourceType === 'sticky' ? '윈도우 스티커 메모' : '삼성 갤럭시 노트';
    this.showToast(`🔍 ${label} 연동을 시작합니다...`);

    try {
      const res = await fetch('/api/windows-notes/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: sourceType, sample: false })
      });
      const data = await res.json();

      if (data && data.success && data.items && data.items.length > 0) {
        const newNotes = data.items;
        const existingIds = new Set(MemoState.items.map(i => i.id));
        const deduplicated = newNotes.filter(n => !existingIds.has(n.id));

        MemoState.items = [...deduplicated, ...MemoState.items];
        this.saveItems();
        this.renderTagPills();
        this.updateActionBadge();

        if (MemoState.currentView === 'graph') {
          this.rebuildGraph();
        } else if (MemoState.currentView === 'cards') {
          this.renderCardsGrid();
        } else if (MemoState.currentView === 'actions') {
          this.renderActionsView();
        }

        document.getElementById('appleSyncModal')?.classList.remove('open');
        this.showToast(`🎉 ${label} ${newNotes.length}개가 성공적으로 동기화되었습니다!`);
      } else {
        this.showToast(`ℹ️ 로컬 윈도우 기본 경로에서 파일을 찾지 못했습니다. 윈도우에서 복사한 plum.sqlite 또는 .sdocx 파일을 하단 파일 업로드 영역에 드래그하거나 [1초 샘플 체험]을 이용해보세요!`);
      }
    } catch (err) {
      console.error(err);
      this.showToast('윈도우 메모 연동 중 오류가 발생했습니다.');
    }
  },

  async handleWinFileUpload(file) {
    if (!file) return;
    this.showToast(`📁 "${file.name}" 파일 파싱 중...`);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64Data = e.target.result.split(',')[1];
        const res = await fetch('/api/windows-notes/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, data: base64Data })
        });
        const result = await res.json();

        if (result && result.success && result.items && result.items.length > 0) {
          const newNotes = result.items;
          const existingIds = new Set(MemoState.items.map(i => i.id));
          const deduplicated = newNotes.filter(n => !existingIds.has(n.id));

          MemoState.items = [...deduplicated, ...MemoState.items];
          this.saveItems();
          this.renderTagPills();
          this.updateActionBadge();

          if (MemoState.currentView === 'graph') {
            this.rebuildGraph();
          } else if (MemoState.currentView === 'cards') {
            this.renderCardsGrid();
          } else if (MemoState.currentView === 'actions') {
            this.renderActionsView();
          }

          document.getElementById('appleSyncModal')?.classList.remove('open');
          this.showToast(`🎉 "${file.name}"에서 ${newNotes.length}개의 메모를 추출하여 지식 그래프에 등록했습니다!`);
        } else {
          this.showToast(`⚠️ "${file.name}"에서 메모를 추출하지 못했습니다.`);
        }
      } catch (err) {
        console.error(err);
        this.showToast('파일 업로드 처리 중 오류가 발생했습니다.');
      }
    };
    reader.readAsDataURL(file);
  },

  // ========================================================================
  // 9. Real-Time Apple Notes Background Live Watcher
  // ========================================================================

  initLiveSyncWatcher() {
    const btn = document.getElementById('btnLiveSyncToggle');
    const modalToggle = document.getElementById('modalLiveSyncToggle');

    this.updateLiveSyncUI();

    if (btn) {
      btn.addEventListener('click', () => {
        this.toggleLiveSync();
      });
    }

    if (modalToggle) {
      modalToggle.checked = MemoState.liveSync.enabled;
      modalToggle.addEventListener('change', () => {
        this.setLiveSync(modalToggle.checked);
      });
    }

    if (MemoState.liveSync.enabled) {
      this.startLiveSyncTimer();
    }
  },

  updateLiveSyncUI() {
    const btn = document.getElementById('btnLiveSyncToggle');
    const modalToggle = document.getElementById('modalLiveSyncToggle');
    const isEnabled = MemoState.liveSync.enabled;

    if (btn) {
      if (isEnabled) {
        btn.classList.add('active');
        btn.classList.remove('paused');
        const textEl = btn.querySelector('.live-status-text');
        if (textEl) textEl.innerText = '실시간 감지 ON';
      } else {
        btn.classList.remove('active');
        btn.classList.add('paused');
        const textEl = btn.querySelector('.live-status-text');
        if (textEl) textEl.innerText = '실시간 감지 OFF';
      }
    }

    if (modalToggle) {
      modalToggle.checked = isEnabled;
    }
  },

  toggleLiveSync() {
    this.setLiveSync(!MemoState.liveSync.enabled);
  },

  setLiveSync(enabled) {
    MemoState.liveSync.enabled = enabled;
    localStorage.setItem('MEMOPOD_LIVE_SYNC', enabled ? 'true' : 'false');
    this.updateLiveSyncUI();

    if (enabled) {
      this.showToast('🟢 애플 메모 실시간 자동 감지가 활성화되었습니다.');
      this.startLiveSyncTimer();
      this.checkLiveNotesDelta();
    } else {
      this.showToast('⏸️ 실시간 감지가 일시정지되었습니다.');
      if (MemoState.liveSync.timer) {
        clearInterval(MemoState.liveSync.timer);
        MemoState.liveSync.timer = null;
      }
    }
  },

  startLiveSyncTimer() {
    if (MemoState.liveSync.timer) {
      clearInterval(MemoState.liveSync.timer);
    }
    // Check every 3.5 seconds
    MemoState.liveSync.timer = setInterval(() => {
      if (MemoState.liveSync.enabled) {
        this.checkLiveNotesDelta();
      }
    }, 3500);

    // Initial check
    this.checkLiveNotesDelta();
  },

  playLiveChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      // Audio autoplay restriction silent fallback
    }
  },

  async checkLiveNotesDelta() {
    if (MemoState.liveSync.isChecking) return;
    MemoState.liveSync.isChecking = true;

    try {
      const url = `/api/apple-notes/live-status?since_mtime=${MemoState.liveSync.lastMtime}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();

      if (data && data.success) {
        if (!data.has_changes) {
          MemoState.liveSync.lastMtime = data.mtime;
          return;
        }

        const isFirstRun = MemoState.liveSync.lastMtime === 0;
        MemoState.liveSync.lastMtime = data.mtime;

        const recentNotes = data.recent_notes || [];
        if (recentNotes.length === 0) return;

        // On first connection, initialize baseline without interrupting with toasts
        if (isFirstRun) {
          return;
        }

        const existingMap = new Map();
        MemoState.items.forEach(item => {
          if (item.appleId) existingMap.set(item.appleId, item);
          existingMap.set(item.id, item);
        });

        let addedCount = 0;
        let lastAddedNote = null;

        recentNotes.forEach(rNote => {
          const match = existingMap.get(rNote.appleId) || existingMap.get(rNote.id);
          if (!match) {
            // New Note
            rNote.livePulse = 60;
            MemoState.items.unshift(rNote);
            existingMap.set(rNote.appleId, rNote);
            existingMap.set(rNote.id, rNote);
            addedCount++;
            lastAddedNote = rNote;
          } else {
            // Updated Note
            if (match.content !== rNote.content || match.title !== rNote.title) {
              match.title = rNote.title;
              match.summary = rNote.summary;
              match.content = rNote.content;
              match.todos = rNote.todos;
              match.tags = Array.from(new Set([...match.tags, ...rNote.tags]));
              match.livePulse = 45;
              lastAddedNote = match;
            }
          }
        });

        if (addedCount > 0 || lastAddedNote) {
          this.saveItems();
          this.renderTagPills();

          if (MemoState.currentView === 'graph') {
            this.rebuildGraph();
          } else if (MemoState.currentView === 'cards') {
            this.renderCardsGrid();
          }

          this.playLiveChime();

          if (addedCount > 0) {
            const titleSnippet = lastAddedNote.title.length > 25 ? lastAddedNote.title.substring(0, 25) + '...' : lastAddedNote.title;
            this.showToast(`🍏 [실시간 감지] 애플 메모 새 글: "${titleSnippet}"`);
          } else if (lastAddedNote) {
            const titleSnippet = lastAddedNote.title.length > 25 ? lastAddedNote.title.substring(0, 25) + '...' : lastAddedNote.title;
            this.showToast(`🍏 [실시간 감지] 애플 메모 업데이트: "${titleSnippet}"`);
          }
        }
      }
    } catch (err) {
      // Background poll caught silently
    } finally {
      MemoState.liveSync.isChecking = false;
    }
  },

  // ========================================================================
  // 10. Action Dashboard & AI Executive Briefing Controller
  // ========================================================================
  actionFilter: 'all',
  actionSearchQuery: '',

  initActionDashboard() {
    this.updateActionBadge();

    // Filter pills
    document.querySelectorAll('#actionFilterPills .action-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#actionFilterPills .action-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.actionFilter = btn.dataset.filter;
        this.renderActionList();
      });
    });

    // Search input
    const searchInput = document.getElementById('actionSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.actionSearchQuery = e.target.value.trim().toLowerCase();
        this.renderActionList();
      });
    }

    // Refresh briefing button
    const btnRefresh = document.getElementById('btnRefreshBriefing');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => {
        this.renderActionDashboard();
        this.showToast('✨ AI 데일리 액션 브리핑이 최신 메모 기준으로 갱신되었습니다.');
      });
    }

    // Bulk send to planner
    const btnBulk = document.getElementById('btnBulkSendPlanner');
    if (btnBulk) {
      btnBulk.addEventListener('click', () => {
        this.bulkSendPendingTodosToPlanner();
      });
    }

    // Partner Ecosystem Banner: Send Todos & Open Planner Calendar
    const btnPartner = document.getElementById('btnPartnerTransfer');
    if (btnPartner) {
      btnPartner.addEventListener('click', () => {
        this.bulkSendPendingTodosToPlanner();
        this.showToast('🚀 2026 플래너로 전송 완료! 플래너 캘린더 페이지를 엽니다...');
        setTimeout(() => {
          window.open('http://localhost:4174', '_blank');
        }, 600);
      });
    }
  },

  getAllTodos() {
    const list = [];
    MemoState.items.forEach(item => {
      (item.todos || []).forEach((t, idx) => {
        list.push({
          itemId: item.id,
          itemTitle: item.title || '제목 없는 메모',
          itemType: item.type || 'note',
          itemFolder: item.folder || 'Notes',
          itemDate: item.createdAt || '',
          appleId: item.appleId || null,
          itemSource: item.source || (item.appleId ? 'apple-notes' : 'local'),
          itemTheme: item.theme || null,
          todoIdx: idx,
          text: t.text,
          done: !!t.done
        });
      });
    });
    return list;
  },

  updateActionBadge() {
    const todos = this.getAllTodos();
    const pendingCount = todos.filter(t => !t.done).length;
    const badge = document.getElementById('gnbTodoCountBadge');
    if (badge) {
      badge.innerText = pendingCount;
      badge.style.display = pendingCount > 0 ? 'inline-flex' : 'none';
    }
  },

  renderActionDashboard() {
    const todos = this.getAllTodos();
    const totalNotes = MemoState.items.length;
    const totalTodos = todos.length;
    const completedTodos = todos.filter(t => t.done).length;
    const pendingTodos = totalTodos - completedTodos;
    const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

    // Update Metrics
    const elTotalNotes = document.getElementById('metricTotalNotes');
    const elPending = document.getElementById('metricPendingTodos');
    const elCompleted = document.getElementById('metricCompletedTodos');
    const elRate = document.getElementById('metricCompletionRate');
    const elFill = document.getElementById('metricProgressFill');

    if (elTotalNotes) elTotalNotes.innerText = totalNotes.toLocaleString();
    if (elPending) elPending.innerText = pendingTodos.toLocaleString();
    if (elCompleted) elCompleted.innerText = completedTodos.toLocaleString();
    if (elRate) elRate.innerText = `${completionRate}%`;
    if (elFill) elFill.style.width = `${completionRate}%`;

    // Update filter counts
    const countAll = document.getElementById('countPillAll');
    const countPending = document.getElementById('countPillPending');
    const countCompleted = document.getElementById('countPillCompleted');
    if (countAll) countAll.innerText = totalTodos;
    if (countPending) countPending.innerText = pendingTodos;
    if (countCompleted) countCompleted.innerText = completedTodos;

    this.updateActionBadge();
    this.renderAiBriefing(todos, pendingTodos);
    this.renderActionList();
  },

  renderAiBriefing(todos, pendingCount) {
    const box = document.getElementById('briefingInsightBox');
    if (!box) return;

    if (todos.length === 0) {
      box.innerHTML = `
        <div class="briefing-headline">✨ 등록된 할 일 항목이 아직 없습니다.</div>
        <p style="margin: 0; color: #94a3b8;">
          상단 브레인 덤프에 <code>- [ ] 할 일 내용</code>을 적거나, <strong>[🍏 맥 메모 연동]</strong>을 통해 체크리스트가 포함된 메모를 불러오면 AI가 즉시 실행 과제로 분석합니다.
        </p>
      `;
      return;
    }

    const pendingList = todos.filter(t => !t.done);
    const urgentItems = pendingList.filter(t => t.itemType === 'business' || t.itemType === 'tech').slice(0, 3);
    const focusItems = urgentItems.length > 0 ? urgentItems : pendingList.slice(0, 3);

    let bulletsHtml = focusItems.map(item => `
      <li><strong>[${item.itemType.toUpperCase()}]</strong> ${item.text} <span style="color: #64748b; font-size: 11px;">(출처: ${item.itemTitle})</span></li>
    `).join('');

    box.innerHTML = `
      <div class="briefing-headline">
        <span>⚡ AI 경영/실행 진단 브리핑</span>
        <span style="font-size: 11px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 8px; border-radius: 9999px;">미완료 ${pendingCount}건</span>
      </div>
      <p style="margin-bottom: 10px; color: #e2e8f0;">
        대표님, 총 <strong>${MemoState.items.length.toLocaleString()}개</strong>의 메모에서 추출된 <strong>${todos.length}개</strong>의 액션 아이템 중 현재 <strong>${pendingCount}개</strong>가 미완료 상태입니다. 오늘 가장 먼저 집중할 핵심 실행 과제 3선:
      </p>
      <ul class="briefing-bullets">
        ${bulletsHtml}
      </ul>
    `;
  },

  renderActionList() {
    const container = document.getElementById('actionItemsList');
    if (!container) return;

    let todos = this.getAllTodos();

    // 1. Filter
    if (this.actionFilter === 'pending') {
      todos = todos.filter(t => !t.done);
    } else if (this.actionFilter === 'completed') {
      todos = todos.filter(t => t.done);
    } else if (['business', 'tech', 'idea'].includes(this.actionFilter)) {
      todos = todos.filter(t => t.itemType === this.actionFilter);
    }

    // 2. Search
    if (this.actionSearchQuery) {
      todos = todos.filter(t => 
        t.text.toLowerCase().includes(this.actionSearchQuery) || 
        t.itemTitle.toLowerCase().includes(this.actionSearchQuery)
      );
    }

    if (todos.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #64748b; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px dashed var(--border-subtle);">
          선택한 필터 조건에 해당하는 할 일 항목이 없습니다.
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    todos.forEach(t => {
      const card = document.createElement('div');
      card.className = `action-card ${t.done ? 'completed' : ''}`;

      const left = document.createElement('div');
      left.className = 'action-card-left';

      const cb = document.createElement('button');
      cb.type = 'button';
      cb.className = `action-card-checkbox ${t.done ? 'checked' : ''}`;
      cb.innerHTML = t.done ? '✓' : '';
      cb.addEventListener('click', () => {
        this.toggleTodoItem(t.itemId, t.todoIdx);
      });

      const content = document.createElement('div');
      content.className = 'action-card-content';

      const text = document.createElement('div');
      text.className = 'action-card-text';
      text.innerText = t.text;

      const meta = document.createElement('div');
      meta.className = 'action-card-meta';
      meta.innerHTML = `
        <span class="type-pill ${t.itemType}" style="font-size: 9px; padding: 2px 6px;">${t.itemType.toUpperCase()}</span>
        <span class="action-note-link" title="해당 메모 서랍 열기">📝 ${t.itemTitle}</span>
        ${t.itemDate ? `<span>· ${t.itemDate.split('T')[0]}</span>` : ''}
      `;

      meta.querySelector('.action-note-link').addEventListener('click', () => {
        this.openDrawer(t.itemId);
      });

      content.appendChild(text);
      content.appendChild(meta);

      left.appendChild(cb);
      left.appendChild(content);

      // Actions
      const actions = document.createElement('div');
      actions.className = 'action-card-actions';

      if (t.appleId) {
        const btnApple = document.createElement('button');
        btnApple.type = 'button';
        btnApple.className = 'action-btn-sm';
        btnApple.title = '맥 메모 앱에서 이 메모 열기';
        btnApple.innerHTML = `<span>🍏</span><span>맥 메모</span>`;
        btnApple.addEventListener('click', () => {
          fetch('/api/apple-notes/open', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appleId: t.appleId, title: t.itemTitle })
          });
          this.showToast(`🍏 애플 메모 앱에서 "${t.itemTitle}" 메모를 열었습니다.`);
        });
        actions.appendChild(btnApple);
      } else if (t.itemSource === 'sticky-notes') {
        const badgeWin = document.createElement('span');
        badgeWin.className = 'source-tag-win';
        badgeWin.style.fontSize = '10px';
        badgeWin.style.padding = '3px 7px';
        badgeWin.style.borderRadius = '6px';
        badgeWin.style.fontWeight = '700';
        badgeWin.innerHTML = `<span>🪟 스티커</span>`;
        actions.appendChild(badgeWin);
      } else if (t.itemSource === 'samsung-notes') {
        const badgeSamsung = document.createElement('span');
        badgeSamsung.className = 'source-tag-samsung';
        badgeSamsung.style.fontSize = '10px';
        badgeSamsung.style.padding = '3px 7px';
        badgeSamsung.style.borderRadius = '6px';
        badgeSamsung.style.fontWeight = '700';
        badgeSamsung.innerHTML = `<span>📱 삼성노트</span>`;
        actions.appendChild(badgeSamsung);
      }

      const btnPlanner = document.createElement('button');
      btnPlanner.type = 'button';
      btnPlanner.className = 'action-btn-sm';
      btnPlanner.title = '2026 플래너 오늘의 To-Do로 전송';
      btnPlanner.innerHTML = `<span>📅</span><span>플래너 전송</span>`;
      btnPlanner.addEventListener('click', () => {
        this.sendSingleTodoToPlanner(t.text, t.itemTitle);
      });
      actions.appendChild(btnPlanner);

      card.appendChild(left);
      card.appendChild(actions);
      container.appendChild(card);
    });
  },

  toggleTodoItem(itemId, todoIdx) {
    const item = MemoState.items.find(i => i.id === itemId);
    if (!item || !item.todos || !item.todos[todoIdx]) return;

    item.todos[todoIdx].done = !item.todos[todoIdx].done;
    this.saveItems();
    this.playLiveChime();
    this.renderActionDashboard();
  },

  sendSingleTodoToPlanner(taskText, originTitle) {
    try {
      const PLANNER_KEY = 'setupod_planner_2026_data';
      const existingRaw = localStorage.getItem(PLANNER_KEY);
      let plannerData = existingRaw ? JSON.parse(existingRaw) : { todos: [], events: [], notes: [] };

      const newTodo = {
        id: 'plan_todo_' + Date.now(),
        text: `[MemoPod] ${taskText}`,
        origin: originTitle,
        category: 'work',
        priority: 'high',
        completed: false,
        createdAt: new Date().toISOString()
      };

      if (!Array.isArray(plannerData.todos)) plannerData.todos = [];
      plannerData.todos.unshift(newTodo);
      localStorage.setItem(PLANNER_KEY, JSON.stringify(plannerData));

      this.showToast(`📅 2026 플래너의 오늘의 To-Do에 등록되었습니다: "${taskText.substring(0, 20)}..."`);
    } catch (e) {
      console.error(e);
      this.showToast('플래너 전송 중 오류가 발생했습니다.');
    }
  },

  bulkSendPendingTodosToPlanner() {
    const todos = this.getAllTodos().filter(t => !t.done);
    if (todos.length === 0) {
      this.showToast('전송할 미완료 할 일이 없습니다.');
      return;
    }

    try {
      const PLANNER_KEY = 'setupod_planner_2026_data';
      const existingRaw = localStorage.getItem(PLANNER_KEY);
      let plannerData = existingRaw ? JSON.parse(existingRaw) : { todos: [], events: [], notes: [] };

      if (!Array.isArray(plannerData.todos)) plannerData.todos = [];

      todos.forEach(t => {
        plannerData.todos.unshift({
          id: 'plan_todo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          text: `[MemoPod] ${t.text}`,
          origin: t.itemTitle,
          category: t.itemType === 'business' ? 'business' : 'work',
          priority: 'high',
          completed: false,
          createdAt: new Date().toISOString()
        });
      });

      localStorage.setItem(PLANNER_KEY, JSON.stringify(plannerData));
      this.showToast(`🎉 미완료 할 일 ${todos.length}개가 2026 플래너로 일괄 전송되었습니다!`);
    } catch (e) {
      console.error(e);
      this.showToast('일괄 전송 중 오류가 발생했습니다.');
    }
  }
};

window.addEventListener('DOMContentLoaded', () => {
  MemoApp.init();
});
