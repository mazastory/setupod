// ==========================================================================
// Threads Autopilot Web Command Center - Dashboard Logic
// ==========================================================================

const FALLBACK_CAMPAIGN = {
  id: 'memopod_v2',
  name: 'MemoPod 2.0 Free Beta Viral Campaign',
  targetUrl: 'https://setupod.com/memopod',
  posts: [
    {
      part: 1,
      title: '런칭 & 무료 배포 (0.2MB 초경량 메모앱)',
      topic: '생산성',
      body: `노션이 너무 무거워서 제 입맛대로 만든 0.2MB 초경량 맥/윈도우 메모앱입니다 💻

회의나 작업 중에 기가 막힌 아이디어가 떠올라도,
무거운 툴 켜다가 로딩 기다리는 사이에 생각의 흐름이 끊기던 게 너무 답답했습니다.

그래서 딱 두 가지만 집중해서 만들었습니다:
1. 바탕화면에 띄워두고 0.2초 만에 단축키로 툭툭 적는 초경량 미니 메모장 (0.2MB)
2. 대충 적어둔 낙서들을 AI가 알아서 오늘 할 일(To-Do)로 뽑아주고 3D 지식 그래프로 엮어주는 웹 지휘소

혼자 쓰려고 만들었는데 주위 반응이 너무 좋아서, 우선 얼리액세스 무료 베타로 전체 공개합니다!

맥(macOS)과 윈도우(Windows) 둘 다 무료로 다운로드하실 수 있게 열어뒀습니다.
직접 써보시고 부족한 점 마구 혼내주세요! 피드백 주시면 바로 반영하겠습니다 🙌

🔗 무료 다운로드 링크는 아래 첫 번째 댓글에 남겨둘게요! 👇`,
      image: '/imgs/memopod/part1_notes.png',
      reply: `👉 MemoPod 2.0 무료 베타 다운로드:
https://setupod.com/memopod

(회원가입/광고 없이 무료로 즉시 사용 가능합니다. 피드백 언제든 환영합니다! 🚀)`
    },
    {
      part: 2,
      title: '카톡 "나에게 보내기" 공감 저격 (문제 해결형)',
      topic: '생산성',
      body: `카카오톡 '나에게 보내기'에 메모 500개 넘게 쌓여있는 사람들의 특징...

1. 나중에 봐야지 하고 링크랑 생각 마구 던져둠
2. 막상 필요할 땐 검색해도 어디 있는지 못 찾음
3. 결국 그 소중한 아이디어들은 영원히 잊혀짐 🥲 (제 이야기 맞습니다)

제가 이 고질병을 고치려고 'MemoPod 2.0'을 만들었습니다.

업무할 때 바탕화면 한구석에 애플 메모장 스타일 미니 패드 하나 띄워두고 0.2초 만에 툭 적으면,
로컬에 안전하게 영구 저장되고 웹에서 자동으로 태깅되어 분류됩니다.

이것만 바꿨는데 매일 아이디어 유실률이 0%가 됐습니다.

같은 고통 겪고 계신 분들 위해 무료로 배포 중입니다!
다운로드 링크는 첫 댓글에 남겨둘게요 👇`,
      image: '/imgs/memopod/part2_features.png',
      reply: `💡 카톡 대신 0.1초 단축키로 띄우는 미니 메모장 (무료 배포 중):
https://setupod.com/memopod`
    },
    {
      part: 3,
      title: '3D 지식 그래프 비주얼 쇼크 (비주얼 훅형)',
      topic: '옵시디언',
      body: `"폴더식 메모의 시대는 끝났습니다."

정보는 폴더 안에 갇혀 있을 때보다,
서로 연관된 태그와 생각들이 거미줄처럼 연결될 때 폭발적인 인사이트가 나옵니다.

옵시디언(Obsidian) 지식 그래프 철학을 가져오되,
세팅에 며칠씩 쓰지 않도록 '0초 세팅'으로 구현했습니다.

바탕화면 미니 메모장에 적기만 하면:
- AI가 핵심 키워드 자동 분석
- 생각의 연결고리를 3D 지식 그래프로 시각화
- 오늘 실행할 Action Plan 즉시 도출

현재 무료 테스터 모집 중입니다.
지식 관리에 진심이신 분들은 첫 댓글 링크에서 꼭 한번 써보세요! 👇`,
      image: '/imgs/memopod/part3_graph.png',
      reply: `💡 내 메모가 실시간으로 3D 성운이 되는 뷰어 체험하기:
https://setupod.com/memopod`
    },
    {
      part: 4,
      title: '베타 피드백 수렴 & 빌딩 인 퍼블릭',
      topic: '개발',
      body: `[MemoPod 2.0 베타 테스터 분들의 피드백을 받습니다 🍏🪟]

어제 공개한 0.2MB 초경량 메모장,
생각보다 많은 분들이 다운로드받아 주셔서 깜짝 놀랐습니다! (감사합니다 🙇‍♂️)

"정말 가볍고 단축키가 편하다"는 칭찬도 많았지만,
더 완벽한 생산성 도구로 업그레이드하기 위해 유저분들의 솔직한 의견이 필요합니다.

1. "이 기능은 꼭 추가해 주세요!" 하는 점
2. 쓰시면서 불편하셨던 점
3. "이것까지 되면 돈 내고 쓸 의향 있다" 하는 결정적인 기능

댓글로 편하게 말씀해주시면 다음 v2.1 업데이트에 바로 반영해 드리겠습니다!
아직 안 써보신 분들은 첫 댓글에서 무료로 받아보실 수 있습니다 👇`,
      image: '/imgs/memopod/part4_dashboard.png',
      reply: `💡 MemoPod 2.0 현재 무료 버전 다운로드 & 로드맵:
https://setupod.com/memopod`
    },
    {
      part: 5,
      title: '차기 업데이트 예고 & 얼리버드 혜택',
      topic: '인공지능',
      body: `[MemoPod 2.0 ➔ v2.1 로드맵 공개]

베타 유저분들이 주신 가장 뜨거운 요청:
"적어둔 메모를 주간/월간 업무 보고서 형태로 한 방에 요약해 줄 수 있나요?"

네, 다음 v2.1 업데이트에서 바로 들어갑니다 🚀
- 단축키 메모 ➔ 주간 보고서 원클릭 AI 변환
- 클라우드 실시간 동기화 옵션 지원
- 노션 / 옵시디언 양방향 내보내기

현재 무료 베타 기간 동안 설치하신 분들께는 향후 유료 기능 오픈 시 평생 무료/할인 혜택을 드릴 예정입니다.
지금 다운로드받아서 먼저 자리를 선점하세요! 👇`,
      image: '/imgs/memopod/part5_hero.png',
      reply: `💡 무료 베타 다운로드 & 얼리버드 등록:
https://setupod.com/memopod`
    }
  ]
};

let currentCampaign = FALLBACK_CAMPAIGN;
let selectedPart = 1;
let isRunning = false;

// DOM Elements
const currentCampaignNameEl = document.getElementById('currentCampaignName');
const targetLandingLinkEl = document.getElementById('targetLandingLink');
const partsTabsListEl = document.getElementById('partsTabsList');
const partBadgeCountEl = document.getElementById('partBadgeCount');

const postTopicInput = document.getElementById('postTopicInput');
const postBodyInput = document.getElementById('postBodyInput');
const postReplyInput = document.getElementById('postReplyInput');
const uploadImageCheck = document.getElementById('uploadImageCheck');
const currentImageNameEl = document.getElementById('currentImageName');
const feedInteractCheck = document.getElementById('feedInteractCheck');

const previewTopicChip = document.getElementById('previewTopicChip');
const previewBodyText = document.getElementById('previewBodyText');
const previewImageBox = document.getElementById('previewImageBox');
const previewImgElement = document.getElementById('previewImgElement');
const previewReplyCard = document.getElementById('previewReplyCard');
const previewReplyText = document.getElementById('previewReplyText');

const btnLaunchPost = document.getElementById('btnLaunchPost');
const btnResetDraft = document.getElementById('btnResetDraft');
const btnCopyBundle = document.getElementById('btnCopyBundle');
const copyBundleLabel = document.getElementById('copyBundleLabel');

const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

const terminalOutput = document.getElementById('terminalOutput');
const btnClearLogs = document.getElementById('btnClearLogs');
const sseConnectionStatus = document.getElementById('sseConnectionStatus');

// 1. Load Campaign Data (API with Fallback)
async function loadCampaign() {
  try {
    const res = await fetch('/api/campaign');
    if (res.ok) {
      currentCampaign = await res.json();
    }
  } catch (err) {
    console.log('Using standalone campaign fallback');
    currentCampaign = FALLBACK_CAMPAIGN;
  }

  currentCampaignNameEl.textContent = currentCampaign.name;
  targetLandingLinkEl.href = currentCampaign.targetUrl;
  targetLandingLinkEl.textContent = currentCampaign.targetUrl.replace('https://', '') + ' ↗';
  partBadgeCountEl.textContent = `${currentCampaign.posts.length} Parts`;

  renderTabs();
  selectPart(1);
}

// 2. Render Tabs (5 Column Grid)
function renderTabs() {
  partsTabsListEl.innerHTML = '';
  currentCampaign.posts.forEach((post) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `part-tab-btn ${post.part === selectedPart ? 'active' : ''}`;
    btn.id = `tab-part-${post.part}`;
    btn.innerHTML = `
      <span class="tab-badge">Part ${post.part}</span>
      <span class="tab-label" title="${escapeHtml(post.title)}">${escapeHtml(post.title)}</span>
    `;
    btn.addEventListener('click', () => selectPart(post.part));
    partsTabsListEl.appendChild(btn);
  });
}

// 3. Select Part
function selectPart(partNum) {
  selectedPart = partNum;
  document.querySelectorAll('.part-tab-btn').forEach((btn) => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`tab-part-${partNum}`);
  if (activeBtn) activeBtn.classList.add('active');

  const post = currentCampaign.posts.find((p) => p.part === partNum);
  if (!post) return;

  postTopicInput.value = post.topic || '';
  postBodyInput.value = post.body || '';
  postReplyInput.value = post.reply || '';

  const imageName = post.image ? post.image.split('/').pop() : '없음';
  currentImageNameEl.textContent = imageName;
  uploadImageCheck.checked = Boolean(post.image);

  if (post.image) {
    const imgSrc = post.image.startsWith('/imgs/') ? post.image : `imgs/memopod/${imageName}`;
    previewImgElement.src = imgSrc;
    previewImageBox.style.display = 'flex';
  } else {
    previewImageBox.style.display = 'none';
  }

  updateLivePreview();
}

// 4. Update Live Preview (WYSIWYG)
function updateLivePreview() {
  const topic = postTopicInput.value.trim();
  previewTopicChip.textContent = topic ? `#${topic}` : '#미분류';

  const body = postBodyInput.value.trim();
  previewBodyText.textContent = body || '(본문 내용을 입력해주세요)';

  const reply = postReplyInput.value.trim();
  if (reply) {
    previewReplyCard.style.display = 'flex';
    previewReplyText.innerHTML = linkify(escapeHtml(reply));
  } else {
    previewReplyCard.style.display = 'none';
  }

  previewImageBox.style.display = uploadImageCheck.checked ? 'flex' : 'none';
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" class="reply-inline-link">${url}</a>`);
}

// Event Listeners
postTopicInput.addEventListener('input', updateLivePreview);
postBodyInput.addEventListener('input', updateLivePreview);
postReplyInput.addEventListener('input', updateLivePreview);
uploadImageCheck.addEventListener('change', updateLivePreview);

btnResetDraft.addEventListener('click', () => {
  if (confirm('현재 편집 중인 내용을 원본 프리셋으로 초기화할까요?')) {
    selectPart(selectedPart);
  }
});

// Quick Copy Bundle for Mobile/Vercel
if (btnCopyBundle) {
  btnCopyBundle.addEventListener('click', async () => {
    const topic = postTopicInput.value.trim();
    const body = postBodyInput.value.trim();
    const reply = postReplyInput.value.trim();

    const formattedCopy = `${body}\n\n#${topic}\n\n---\n[첫 번째 댓글 링크]\n${reply}`;

    try {
      await navigator.clipboard.writeText(formattedCopy);
      btnCopyBundle.classList.add('copied');
      copyBundleLabel.textContent = '✓ 전체 복사 완료! (Threads 앱에 붙여넣기)';
      setTimeout(() => {
        btnCopyBundle.classList.remove('copied');
        copyBundleLabel.textContent = '카피북 전체 클립보드 복사 (모바일/웹 즉시 붙여넣기)';
      }, 2500);
    } catch (e) {
      alert('클립보드 복사 완료');
    }
  });
}

// 5. Launch Post Action (Local Bot Execution)
btnLaunchPost.addEventListener('click', async () => {
  if (isRunning) return;

  const topic = postTopicInput.value.trim();
  const body = postBodyInput.value.trim();
  const reply = postReplyInput.value.trim();
  const withImage = uploadImageCheck.checked;
  const feedInteract = feedInteractCheck.checked;

  if (!body) {
    alert('본문 내용을 입력해주세요!');
    return;
  }

  const post = currentCampaign.posts.find((p) => p.part === selectedPart);
  const imagePath = withImage && post ? post.image : '';

  const confirmMsg = `[Part ${selectedPart}] 게시글을 지금 Threads에 발행할까요?\n\n- 주제: #${topic}\n- 이미지: ${withImage ? '첨부' : '제외'}\n- 첫 댓글 링크: ${reply ? '등록' : '제외'}\n- 피드 소통: ${feedInteract ? '진행 후 작성' : '글만 즉시 작성'}`;

  if (!confirm(confirmMsg)) return;

  setRunningState(true);
  appendLog('action', `🚀 [Part ${selectedPart}] 원클릭 발행 요청을 전달했습니다.`);

  try {
    const res = await fetch('/api/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        body,
        reply,
        image: imagePath,
        uploadImage: withImage ? 1 : 0,
        feedInteract,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || '발행 실패');

    appendLog('ok', `작업 프로세스가 정상 기동되었습니다. (브라우저 관제 중)`);
  } catch (err) {
    appendLog('err', `발행 요청 오류 (Vercel 정적 환경에서는 [전체 복사] 기능을 이용하세요): ${err.message}`);
    setRunningState(false);
  }
});

function setRunningState(running) {
  isRunning = running;
  if (running) {
    statusDot.className = 'status-dot running';
    statusText.textContent = '발행 작업 진행 중...';
    btnLaunchPost.disabled = true;
    btnLaunchPost.querySelector('.btn-text').textContent = '자동화 실행 중...';
  } else {
    statusDot.className = 'status-dot idle';
    statusText.textContent = '대기 중 (Ready)';
    btnLaunchPost.disabled = false;
    btnLaunchPost.querySelector('.btn-text').textContent = 'Threads에 원클릭 발행하기';
  }
}

// 6. SSE Realtime Logs
function connectLogStream() {
  try {
    const eventSource = new EventSource('/api/logs');

    eventSource.onopen = () => {
      if (sseConnectionStatus) {
        sseConnectionStatus.textContent = '● 스트림 연결됨';
        sseConnectionStatus.style.color = 'var(--accent-emerald)';
      }
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        appendLog(data.level, data.message, data.timestamp);
        if (data.message && data.message.includes('게시 완료')) setRunningState(false);
        if (data.level === 'err') setRunningState(false);
      } catch (e) {
        appendLog('info', event.data);
      }
    };

    eventSource.onerror = () => {
      if (sseConnectionStatus) {
        sseConnectionStatus.textContent = '○ 로컬 봇 대기 중';
        sseConnectionStatus.style.color = 'var(--text-muted)';
      }
    };
  } catch (e) {
    // Standalone
  }
}

function appendLog(level = 'info', message = '', timestamp = null) {
  if (!terminalOutput) return;
  const time = timestamp || new Date().toLocaleTimeString('ko-KR', { hour12: false });
  const line = document.createElement('div');
  line.className = `log-line ${level}`;

  let tag = level.toUpperCase();
  if (level === 'section') tag = 'STEP';
  if (level === 'ok') tag = 'SUCCESS';
  if (level === 'err') tag = 'ERROR';
  if (level === 'warn') tag = 'WARN';

  line.innerHTML = `
    <span class="log-time">[${time}]</span>
    <span class="log-tag">${tag}</span>
    <span class="log-msg">${escapeHtml(message)}</span>
  `;

  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

if (btnClearLogs) {
  btnClearLogs.addEventListener('click', () => {
    terminalOutput.innerHTML = '';
    appendLog('info', '로그가 초기화되었습니다.');
  });
}

// Init
window.addEventListener('DOMContentLoaded', () => {
  loadCampaign();
  connectLogStream();
});
