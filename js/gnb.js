(function() {
  // GNB HTML 구조 정의
  const gnbHtml = `
  <nav>
    <a href="index.html" class="nav-brand">
      <div class="nav-logo-symbol">
        <img src="assets/setupod.gif" alt="SETUPOD" class="nav-logo-gif">
      </div>
      <div class="nav-logo-text-wrap">
        <div class="nav-logo-row">
          <span class="nav-logo-text"><span class="part-setup">SETUP</span><span class="part-od">OD</span></span>
          <span class="logo-ko-tag">세럽팟</span>
        </div>
        <span class="nav-logo-tagline">1초 만에 셋업하는 비즈니스 팟</span>
      </div>
    </a>

    <!-- 데스크톱 메뉴 -->
    <div class="nav-links">
      <div class="nav-dropdown">
        <span class="nav-link" style="cursor:default;">🧠 Think</span>
        <div class="nav-dropdown-menu">
          <a href="memopod.html">MemoPod (메모/지식)</a>
          <a href="planner.html">2026 플래너</a>
        </div>
      </div>
      <div class="nav-dropdown">
        <span class="nav-link" style="cursor:default;">🎨 Create</span>
        <div class="nav-dropdown-menu">
          <a href="10k_studio.html">시네마틱 10K 스튜디오</a>
          <a href="maker.html">3D 명함 스튜디오</a>
          <a href="link.html">멀티링크 허브</a>
          <a href="profile_studio.html">프로필 리터처</a>
        </div>
      </div>
      <div class="nav-dropdown">
        <span class="nav-link" style="cursor:default;">💼 Sell</span>
        <div class="nav-dropdown-menu">
          <a href="proposal.html">스마트 제안서</a>
          <a href="proof.html">고객 후기 증명</a>
          <a href="scorecard.html">비즈니스 진단</a>
          <a href="detail_studio.html">AI 상세페이지 설계</a>
        </div>
      </div>
      <a href="maker.html" class="btn-create-nav">
        <i data-lucide="sparkles" style="width:14px;height:14px;"></i>
        <span>무료로 시작하기</span>
      </a>
    </div>

    <!-- 모바일 전용 네비 컨트롤 -->
    <div class="mobile-nav-controls">
      <a href="maker.html" class="btn-mobile-maker">
        <i data-lucide="sparkles" style="width:13px;height:13px;"></i>
        <span>1초 셋업</span>
      </a>
      <button class="btn-mobile-hamburger" onclick="window.toggleMobileMenu()" aria-label="메뉴 열기">
        <i data-lucide="menu" style="width:20px;height:20px;"></i>
      </button>
    </div>
  </nav>

  <!-- 모바일 드로어 메뉴 오버레이 -->
  <div class="mobile-menu-overlay" id="mobileMenuOverlay" onclick="window.closeMobileMenu()">
    <div class="mobile-menu-drawer" onclick="event.stopPropagation()">
      <div class="mobile-menu-header">
        <div class="mobile-menu-brand">
          <img src="assets/setupod.gif" class="nav-logo-gif" style="width:28px;height:28px;border-radius:8px;">
          <span style="font-weight:900;font-size:16px;">SETUPOD</span>
        </div>
        <button class="mobile-menu-close" onclick="window.closeMobileMenu()" aria-label="메뉴 닫기">
          <i data-lucide="x" style="width:18px;height:18px;"></i>
        </button>
      </div>
      <div class="mobile-menu-list">
        <a href="planner.html" class="mobile-menu-item highlight" onclick="window.closeMobileMenu()">
          <div class="menu-item-left">
            <i data-lucide="compass" style="width:18px;height:18px;color:#c084fc;"></i>
            <span>2026 비즈니스 플래너</span>
          </div>
          <span class="menu-badge-new">NEW</span>
        </a>
        <a href="proposal_maker.html" class="mobile-menu-item" onclick="window.closeMobileMenu()">
          <div class="menu-item-left">
            <i data-lucide="file-spreadsheet" style="width:18px;height:18px;color:#38bdf8;"></i>
            <span>스마트 제안서 & 견적</span>
          </div>
          <span class="menu-badge-new" style="background:#06b6d4;">HOT</span>
        </a>
        <a href="proof_maker.html" class="mobile-menu-item" onclick="window.closeMobileMenu()">
          <div class="menu-item-left">
            <i data-lucide="shield-check" style="width:18px;height:18px;color:#fae100;"></i>
            <span>고객 후기 증명 월</span>
          </div>
          <span class="menu-badge-new" style="background:#fae100;color:#261601;">HOT</span>
        </a>
        <a href="10k_studio.html" class="mobile-menu-item" onclick="window.closeMobileMenu()">
          <div class="menu-item-left">
            <i data-lucide="monitor-play" style="width:18px;height:18px;color:#c084fc;"></i>
            <span>시네마틱 10K 스튜디오</span>
          </div>
          <span class="menu-badge-new" style="background:#8b5cf6;">AI</span>
        </a>
        <a href="profile_studio.html" class="mobile-menu-item" onclick="window.closeMobileMenu()">
          <div class="menu-item-left">
            <i data-lucide="sparkles" style="width:18px;height:18px;color:#c084fc;"></i>
            <span>AI 프로필 리터처</span>
          </div>
          <span class="menu-badge-new" style="background:#8b5cf6;">AI</span>
        </a>
        <a href="detail_studio.html" class="mobile-menu-item" onclick="window.closeMobileMenu()">
          <div class="menu-item-left">
            <i data-lucide="layout-template" style="width:18px;height:18px;color:#f472b6;"></i>
            <span>AI 상세페이지 마법사</span>
          </div>
          <span class="menu-badge-new" style="background:#ec4899;">AI</span>
        </a>
        <a href="index.html#marketing-tools" class="mobile-menu-item" onclick="window.closeMobileMenu()">
          <div class="menu-item-left">
            <i data-lucide="wrench" style="width:18px;height:18px;color:#38bdf8;"></i>
            <span>마케팅 툴킷</span>
          </div>
        </a>
        <a href="index.html#growth-systems" class="mobile-menu-item" onclick="window.closeMobileMenu()">
          <div class="menu-item-left">
            <i data-lucide="trending-up" style="width:18px;height:18px;color:#34d399;"></i>
            <span>세일즈 시스템</span>
          </div>
        </a>
        <a href="index.html#pricing" class="mobile-menu-item" onclick="window.closeMobileMenu()">
          <div class="menu-item-left">
            <i data-lucide="credit-card" style="width:18px;height:18px;color:#fbbf24;"></i>
            <span>가격 안내</span>
          </div>
        </a>
        <a href="link.html" class="mobile-menu-item" target="_blank" onclick="window.closeMobileMenu()">
          <div class="menu-item-left">
            <i data-lucide="link" style="width:18px;height:18px;color:#a78bfa;"></i>
            <span>인스타 멀티링크</span>
          </div>
        </a>
      </div>
      <div class="mobile-menu-footer">
        <a href="maker.html" class="btn-create-nav" style="width:100%;height:46px;justify-content:center;font-size:14.5px;border-radius:12px;">
          <i data-lucide="sparkles" style="width:16px;height:16px;"></i>
          <span>내 팟(Pod) 만들기</span>
        </a>
      </div>
    </div>
  </div>
  `;

  // body 최상단에 GNB 주입
  document.body.insertAdjacentHTML('afterbegin', gnbHtml);

  // 모바일 메뉴 제어 함수 전역 등록
  window.toggleMobileMenu = function() {
    const overlay = document.getElementById('mobileMenuOverlay');
    if (!overlay) return;
    overlay.classList.toggle('active');
    if (overlay.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // 동적으로 아이콘 렌더링
    if (window.lucide) {
      window.lucide.createIcons();
    }
  };

  window.closeMobileMenu = function() {
    const overlay = document.getElementById('mobileMenuOverlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // 렌더링 후 lucide 아이콘 적용
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, 100);

  // Auth 상태 체크 및 GNB 버튼 업데이트
  setTimeout(async () => {
    if (typeof window.getCurrentUser === 'function') {
      const user = await window.getCurrentUser();
      const btnCreateNav = document.querySelector('.btn-create-nav');
      
      if (user && btnCreateNav) {
        // 로그인 상태: 계정 버튼으로 변경
        const avatarUrl = user.user_metadata?.avatar_url || 'assets/sample_avatar.png';
        btnCreateNav.innerHTML = `<img src="${avatarUrl}" style="width:20px;height:20px;border-radius:50%;object-fit:cover;"><span>내 계정</span>`;
        btnCreateNav.href = "#";
        btnCreateNav.title = "클릭하여 로그아웃";
        btnCreateNav.onclick = (e) => {
          e.preventDefault();
          if (confirm('로그아웃 하시겠습니까?')) {
            if (typeof signOutUser === 'function') signOutUser();
          }
        };
      } else if (!user && btnCreateNav) {
        // 비로그인 상태: 무료로 시작하기 버튼 클릭 시 로그인 모달 호출
        btnCreateNav.href = "#";
        btnCreateNav.onclick = (e) => {
          e.preventDefault();
          if (typeof window.requireAuth === 'function') {
            window.requireAuth(() => {
              window.location.href = 'maker.html';
            });
          } else {
            window.location.href = 'maker.html';
          }
        };
      }
    }
  }, 300);
})();

  // App Mode 로고 클릭 시 드로어 메뉴 열기
  document.addEventListener('click', function(e) {
    const brand = e.target.closest('.nav-brand');
    if (brand && document.body.classList.contains('app-mode')) {
      e.preventDefault();
      window.toggleMobileMenu();
    }
  });
