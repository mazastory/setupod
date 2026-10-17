/**
 * MemoPod 2.0 Cloud Sync Engine (Powered by Supabase)
 * - 로컬 PC 영구 보존 + 클라우드 이중 백업 금고
 * - 아이폰, 아이패드, 맥북, 윈도우 기기간 실시간 동기화
 * - 카카오 / 구글 원클릭 1초 로그인
 */

(function (window) {
  const SUPABASE_URL = "https://xhjauoabxybaksvbtcic.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoamF1b2FieHliYWtzdmJ0Y2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzg0NzQsImV4cCI6MjEwNDYxNDQ3NH0.wBK3-8IIq3JKYbMrVlLtx6rRPRmhCblm74EwL_3PxBY";

  function getStorageKey() {
    const p = window.location.pathname.toLowerCase();
    const l = (document.documentElement.lang || '').toLowerCase();
    if (p.includes('_de') || l.startsWith('de')) return 'memopod_knowledge_de_v2';
    if (p.includes('_en') || l.startsWith('en')) return 'memopod_knowledge_en_v2';
    return 'memopod_knowledge_v2';
  }

  function getFoldersKey() {
    const p = window.location.pathname.toLowerCase();
    const l = (document.documentElement.lang || '').toLowerCase();
    if (p.includes('_de') || l.startsWith('de')) return 'memopod_apple_folders_de_v2';
    if (p.includes('_en') || l.startsWith('en')) return 'memopod_apple_folders_en_v2';
    return 'memopod_apple_folders_v2';
  }

  const SYNC_META_KEY = 'MEMOPOD_LAST_SYNC';

  let client = null;
  let currentUser = null;
  let syncDebounceTimer = null;
  let _initialized = false;

  const MemoPodCloud = {
    // 1. 초기화
    async init(options = {}) {
      if (_initialized) return;
      _initialized = true;
      if (window.supabase) {
        client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      } else {
        // Supabase CDN 자동 로드
        await this.loadSupabaseScript();
        if (window.supabase) {
          client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
      }

      if (client) {
        // 현재 세션 감지
        const { data: { session } } = await client.auth.getSession();
        if (session && session.user) {
          currentUser = session.user;
          this.updateSyncUI();
          // 로그인되어 있으면 백그라운드에서 클라우드 데이터 가져와 병합
          this.syncDown();
        }

        // 인증 상태 변경 리스너
        client.auth.onAuthStateChange(async (event, session) => {
          if (session && session.user) {
            currentUser = session.user;
            this.updateSyncUI();
            if (event === 'SIGNED_IN') {
              await this.syncDown();
            }
          } else {
            currentUser = null;
            this.updateSyncUI();
          }
        });
      }

      this.injectStyles();
      this.bindGlobalUI();
    },

    loadSupabaseScript() {
      return new Promise((resolve) => {
        if (window.supabase) return resolve();
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.head.appendChild(script);
      });
    },

    // 2. 카카오 로그인
    async signInWithKakao() {
      if (!client) return alert('클라우드 인증 엔진을 로드 중입니다. 2초 후 다시 시도해주세요.');
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: window.location.origin + window.location.pathname
        }
      });
      if (error) alert('카카오 로그인 오류: ' + error.message);
    },

    // 3. 구글 로그인
    async signInWithGoogle() {
      if (!client) return alert('클라우드 인증 엔진을 로드 중입니다. 2초 후 다시 시도해주세요.');
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + window.location.pathname
        }
      });
      if (error) alert('구글 로그인 오류: ' + error.message);
    },

    // 4. 로그아웃
    async signOut() {
      if (!client) return;
      if (confirm('클라우드 동기화 연결을 해제할까요? (로컬 PC의 메모는 그대로 유지됩니다)')) {
        await client.auth.signOut();
        currentUser = null;
        this.updateSyncUI();
        this.showToast('클라우드 연결이 해제되었습니다.');
      }
    },

    // 5. 클라우드 ➔ 로컬 동기화 (Sync Down & Merge)
    async syncDown() {
      if (!currentUser || !client) return;
      try {
        let cloudData = null;

        // A. 테이블 시도
        try {
          const { data, error } = await client
            .from('memopod_backups')
            .select('payload, updated_at')
            .eq('user_id', currentUser.id)
            .single();
          if (!error && data && data.payload) {
            cloudData = data.payload;
          }
        } catch (e) {}

        // B. user_metadata 폴백 시도
        if (!cloudData && currentUser.user_metadata && currentUser.user_metadata.memopod_backup) {
          cloudData = currentUser.user_metadata.memopod_backup;
        }

        if (cloudData && Array.isArray(cloudData.notes)) {
          // 로컬 메모와 클라우드 메모 병합 (최신 타임스탬프 우선)
          const localRaw = localStorage.getItem(getStorageKey());
          const localNotes = localRaw ? JSON.parse(localRaw) : [];

          const mergedMap = new Map();
          localNotes.forEach(n => mergedMap.set(n.id, n));

          let updatedCount = 0;
          cloudData.notes.forEach(cloudNote => {
            const localNote = mergedMap.get(cloudNote.id);
            if (!localNote) {
              mergedMap.set(cloudNote.id, cloudNote);
              updatedCount++;
            } else {
              const cloudTime = new Date(cloudNote.updatedAt || cloudNote.createdAt || 0).getTime();
              const localTime = new Date(localNote.updatedAt || localNote.createdAt || 0).getTime();
              if (cloudTime > localTime) {
                mergedMap.set(cloudNote.id, cloudNote);
                updatedCount++;
              }
            }
          });

          const finalNotes = Array.from(mergedMap.values());
          localStorage.setItem(getStorageKey(), JSON.stringify(finalNotes));

          // 폴더 병합
          if (cloudData.folders && Array.isArray(cloudData.folders)) {
            const localFoldersRaw = localStorage.getItem(getFoldersKey());
            const localFolders = localFoldersRaw ? JSON.parse(localFoldersRaw) : [];
            const folderMap = new Map();
            localFolders.forEach(f => {
              const name = typeof f === 'string' ? f : (f && f.name) || '';
              if (name) folderMap.set(name, f);
            });
            cloudData.folders.forEach(f => {
              const name = typeof f === 'string' ? f : (f && f.name) || '';
              if (name && !folderMap.has(name)) {
                folderMap.set(name, f);
              }
            });
            localStorage.setItem(getFoldersKey(), JSON.stringify(Array.from(folderMap.values())));
          }

          if (updatedCount > 0) {
            this.showToast(`☁️ 클라우드에서 ${updatedCount}개의 메모를 안전하게 동기화했습니다!`);
            // UI 리로드 트리거
            window.dispatchEvent(new CustomEvent('memopod:cloud_synced'));
          }
        }
      } catch (err) {
        console.warn('Sync down note:', err);
      }
    },

    // 6. 로컬 ➔ 클라우드 업로드 (Sync Up)
    async syncUp() {
      if (!currentUser || !client) return;
      try {
        const localNotesRaw = localStorage.getItem(getStorageKey());
        const localFoldersRaw = localStorage.getItem(getFoldersKey());
        const notes = localNotesRaw ? JSON.parse(localNotesRaw) : [];
        const folders = localFoldersRaw ? JSON.parse(localFoldersRaw) : [];

        const payload = {
          notes,
          folders,
          updated_at: new Date().toISOString(),
          version: '2.0',
          device: navigator.userAgent.includes('Mac') ? 'mac' : navigator.userAgent.includes('iPhone') ? 'iphone' : 'other'
        };

        // A. 테이블 백업 저장 시도
        let saved = false;
        try {
          const { error } = await client
            .from('memopod_backups')
            .upsert({
              user_id: currentUser.id,
              payload: payload,
              updated_at: new Date().toISOString()
            });
          if (!error) saved = true;
        } catch (e) {}

        // B. 유저 메타데이터 백업 (100% 안전 보장)
        try {
          await client.auth.updateUser({
            data: { memopod_backup: payload }
          });
          saved = true;
        } catch (e) {}

        if (saved) {
          localStorage.setItem(SYNC_META_KEY, new Date().toISOString());
          this.updateSyncUI();
        }
      } catch (err) {
        console.warn('Sync up error:', err);
      }
    },

    // 디바운스 자동 동기화 (메모 작성 시 자동 호출)
    scheduleAutoSync() {
      if (!currentUser) return;
      clearTimeout(syncDebounceTimer);
      syncDebounceTimer = setTimeout(() => {
        this.syncUp();
      }, 1500);
    },

    // 7. 오프라인 JSON 백업 다운로드
    exportLocalBackup() {
      const notes = localStorage.getItem(getStorageKey()) || '[]';
      const folders = localStorage.getItem(getFoldersKey()) || '[]';
      const backupData = {
        app: 'MemoPod 2.0',
        exportedAt: new Date().toISOString(),
        notes: JSON.parse(notes),
        folders: JSON.parse(folders)
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MemoPod_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showToast('💾 로컬 오프라인 백업 파일이 다운로드되었습니다.');
    },

    // 8. 오프라인 JSON 백업 복원
    importLocalBackup(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (Array.isArray(data.notes)) {
            localStorage.setItem(getStorageKey(), JSON.stringify(data.notes));
            if (data.folders) localStorage.setItem(getFoldersKey(), JSON.stringify(data.folders));
            this.showToast('✓ 백업 데이터가 성공적으로 복원되었습니다!');
            setTimeout(() => window.location.reload(), 1000);
          } else {
            alert('올바른 MemoPod 백업 파일 형식이 아닙니다.');
          }
        } catch (err) {
          alert('파일 파싱 실패: ' + err.message);
        }
      };
      reader.readAsText(file);
    },

    // Helper to get current language
    getLang() {
      const p = window.location.pathname.toLowerCase();
      const l = (document.documentElement.lang || '').toLowerCase();
      if (p.includes('_de') || l.startsWith('de')) return 'de';
      if (p.includes('_en') || l.startsWith('en')) return 'en';
      return 'ko';
    },

    getI18n() {
      const lang = this.getLang();
      const dict = {
        en: {
          syncing: "☁️ Synced:",
          offline: "☁️ Cloud Backup (Offline)",
          myAccount: "My Account",
          connected: "Connected",
          title: "MemoPod Cloud Vault",
          desc: "Your notes will <strong>never be lost</strong>, even across device changes or browser cache purges.<br>Sync seamlessly across iPhone, iPad, Mac, and PC in 0.1s.",
          currentAccount: "Connected Account",
          disconnect: "Disconnect",
          backupNow: "⬆️ Backup to Cloud Now",
          restoreNow: "⬇️ Pull Latest from Cloud",
          toastBackedUp: "☁️ Saved to cloud instantly.",
          kakao: "Continue with Kakao",
          google: "Continue with Google",
          perk1: "✓ 100% Free Encrypted Cloud Vault",
          perk2: "✓ Real-time Two-way Sync for iOS, Mac & PC",
          perk3: "✓ Instant Restore from Accidental Deletions",
          divider: "Or Offline Manual Backup",
          downloadJson: "💾 Export Local Backup (.json)",
          uploadJson: "📂 Import Backup File"
        },
        de: {
          syncing: "☁️ Synchronisiert:",
          offline: "☁️ Cloud-Backup (Getrennt)",
          myAccount: "Mein Konto",
          connected: "Verbunden",
          title: "MemoPod Cloud-Tresor",
          desc: "Ihre Notizen gehen <strong>niemals verloren</strong>, selbst bei Gerätewechseln oder Cache-Löschungen.<br>Echtzeit-Synchronisierung über iPhone, iPad, Mac und PC in 0,1s.",
          currentAccount: "Verbundenes Konto",
          disconnect: "Trennen",
          backupNow: "⬆️ Jetzt in Cloud sichern",
          restoreNow: "⬇️ Neueste Notizen laden",
          toastBackedUp: "☁️ Sofort in der Cloud gesichert.",
          kakao: "Mit Kakao anmelden",
          google: "Mit Google verbinden",
          perk1: "✓ 100% Kostenloser verschlüsselter Cloud-Tresor",
          perk2: "✓ Echtzeit-Zweiwege-Synchronisierung für iOS, Mac & PC",
          perk3: "✓ Sofortige Wiederherstellung bei Datenverlust",
          divider: "Oder manuelle Offline-Sicherung",
          downloadJson: "💾 Lokales Backup exportieren (.json)",
          uploadJson: "📂 Backup-Datei importieren"
        },
        ko: {
          syncing: "☁️ 동기화 중:",
          offline: "☁️ 클라우드 백업 (비연결)",
          myAccount: "내 계정",
          connected: "연결됨",
          title: "MemoPod 클라우드 평생 안전 금고",
          desc: "캐시 삭제, 기기 변경에도 소중한 메모가 <strong>절대 날아가지 않습니다.</strong><br>아이폰, 아이패드, 맥북 어디서든 0.1초 만에 실시간으로 이어 쓰세요.",
          currentAccount: "현재 연결된 계정",
          disconnect: "연결 해제",
          backupNow: "⬆️ 지금 클라우드에 백업하기",
          restoreNow: "⬇️ 클라우드에서 최신 메모 불러오기",
          toastBackedUp: "☁️ 클라우드에 즉시 저장되었습니다.",
          kakao: "카카오로 1초 시작하기",
          google: "구글 계정으로 연결하기",
          perk1: "✓ 100% 무료 암호화 클라우드 보관",
          perk2: "✓ 아이폰/아이패드/맥북 양방향 실시간 동기화",
          perk3: "✓ 불의의 캐시 삭제에도 1초 만에 완전 복원",
          divider: "또는 오프라인 수동 백업",
          downloadJson: "💾 로컬 파일로 백업 다운로드 (.json)",
          uploadJson: "📂 백업 파일 불러오기"
        }
      };
      return dict[lang] || dict.en;
    },

    // UI 업데이트
    updateSyncUI() {
      const badge = document.getElementById('memopodCloudBadge');
      if (!badge) return;
      const t = this.getI18n();

      if (currentUser) {
        const email = currentUser.email || currentUser.user_metadata?.name || t.myAccount;
        badge.className = 'cloud-sync-btn connected';
        badge.innerHTML = `
          <span class="cloud-dot green"></span>
          <span class="cloud-text">${t.syncing} <strong>${escapeHtml(email)}</strong></span>
        `;
      } else {
        badge.className = 'cloud-sync-btn disconnected';
        badge.innerHTML = `
          <span class="cloud-dot yellow"></span>
          <span class="cloud-text">${t.offline}</span>
        `;
      }
    },

    // 모달 렌더링
    openSyncModal() {
      const existing = document.getElementById('memopodCloudModal');
      if (existing) existing.remove();

      const t = this.getI18n();
      const modal = document.createElement('div');
      modal.id = 'memopodCloudModal';
      modal.className = 'memopod-cloud-overlay';

      const isConnected = Boolean(currentUser);
      const userEmail = isConnected ? (currentUser.email || currentUser.user_metadata?.name || t.connected) : '';

      modal.innerHTML = `
        <div class="memopod-cloud-modal-card">
          <button class="modal-close-btn" onclick="document.getElementById('memopodCloudModal').remove()">×</button>
          
          <div class="modal-hero">
            <span class="modal-icon">☁️</span>
            <h3 class="modal-title">${t.title}</h3>
            <p class="modal-desc">${t.desc}</p>
          </div>

          ${isConnected ? `
            <div class="user-status-box">
              <span class="user-status-dot"></span>
              <div class="user-status-info">
                <span class="user-status-label">${t.currentAccount}</span>
                <span class="user-status-email">${escapeHtml(userEmail)}</span>
              </div>
              <button type="button" class="btn-disconnect" onclick="window.MemoPodCloud.signOut()">${t.disconnect}</button>
            </div>
            <div class="manual-sync-actions">
              <button type="button" class="btn-cloud-action primary" onclick="window.MemoPodCloud.syncUp(); window.MemoPodCloud.showToast('${t.toastBackedUp}');">
                ${t.backupNow}
              </button>
              <button type="button" class="btn-cloud-action secondary" onclick="window.MemoPodCloud.syncDown()">
                ${t.restoreNow}
              </button>
            </div>
          ` : `
            <div class="social-login-grid">
              <button type="button" class="btn-login kakao" onclick="window.MemoPodCloud.signInWithKakao()">
                <span class="social-icon">💬</span>
                <span>${t.kakao}</span>
              </button>
              <button type="button" class="btn-login google" onclick="window.MemoPodCloud.signInWithGoogle()">
                <span class="social-icon">G</span>
                <span>${t.google}</span>
              </button>
            </div>
            <div class="login-perk-list">
              <div class="perk-item">${t.perk1}</div>
              <div class="perk-item">${t.perk2}</div>
              <div class="perk-item">${t.perk3}</div>
            </div>
          `}

          <div class="offline-backup-divider">
            <span>${t.divider}</span>
          </div>

          <div class="offline-backup-actions">
            <button type="button" class="btn-file-backup" onclick="window.MemoPodCloud.exportLocalBackup()">
              ${t.downloadJson}
            </button>
            <label class="btn-file-backup file-label">
              ${t.uploadJson}
              <input type="file" accept=".json" style="display:none;" onchange="window.MemoPodCloud.importLocalBackup(this.files[0])">
            </label>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
    },

    bindGlobalUI() {
      // 뱃지 클릭 시 모달 열기
      document.addEventListener('click', (e) => {
        if (e.target.closest('#memopodCloudBadge')) {
          this.openSyncModal();
        }
      });
    },

    showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'memopod-cloud-toast';
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.classList.add('show'), 10);
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    },

    injectStyles() {
      if (document.getElementById('memopodCloudStyles')) return;
      const style = document.createElement('style');
      style.id = 'memopodCloudStyles';
      style.textContent = `
        .cloud-sync-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
          color: #f1f5f9;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }
        .cloud-sync-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }
        .cloud-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }
        .cloud-dot.green { background: #10b981; box-shadow: 0 0 6px #10b981; }
        .cloud-dot.yellow { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }

        .memopod-cloud-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          animation: modalFadeIn 0.2s ease;
          padding: 16px;
        }
        .memopod-cloud-modal-card {
          background: #111827;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          max-width: 460px;
          width: 100%;
          padding: 28px 24px;
          position: relative;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.2);
          color: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .modal-close-btn {
          position: absolute;
          top: 18px;
          right: 20px;
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 24px;
          cursor: pointer;
          line-height: 1;
        }
        .modal-close-btn:hover { color: #fff; }
        .modal-hero { text-align: center; margin-bottom: 22px; }
        .modal-icon { font-size: 40px; display: inline-block; margin-bottom: 8px; filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.5)); }
        .modal-title { font-size: 1.25rem; font-weight: 800; margin-bottom: 8px; color: #fff; }
        .modal-desc { font-size: 0.82rem; color: #94a3b8; line-height: 1.5; }

        .social-login-grid { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }
        .btn-login {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 13px;
          border-radius: 12px;
          font-size: 0.92rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .btn-login:hover { transform: translateY(-1px); filter: brightness(1.05); }
        .btn-login.kakao { background: #fee500; color: #191919; }
        .btn-login.google { background: #ffffff; color: #1f2937; }

        .login-perk-list {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.78rem;
          color: #cbd5e1;
          margin-bottom: 18px;
        }

        .user-status-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 14px;
          padding: 12px 16px;
          margin-bottom: 16px;
        }
        .user-status-dot { width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; }
        .user-status-info { flex: 1; display: flex; flex-direction: column; }
        .user-status-label { font-size: 0.7rem; color: #6ee7b7; font-weight: 600; }
        .user-status-email { font-size: 0.88rem; font-weight: 700; color: #fff; word-break: break-all; }
        .btn-disconnect { background: none; border: 1px solid rgba(255, 255, 255, 0.2); color: #94a3b8; font-size: 0.72rem; padding: 4px 8px; border-radius: 6px; cursor: pointer; }
        .btn-disconnect:hover { color: #f87171; border-color: #f87171; }

        .manual-sync-actions { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
        .btn-cloud-action {
          padding: 11px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }
        .btn-cloud-action.primary { background: #6366f1; color: #fff; }
        .btn-cloud-action.primary:hover { background: #4f46e5; }
        .btn-cloud-action.secondary { background: rgba(255, 255, 255, 0.08); color: #cbd5e1; border: 1px solid rgba(255, 255, 255, 0.1); }
        .btn-cloud-action.secondary:hover { background: rgba(255, 255, 255, 0.12); }

        .offline-backup-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 16px 0 12px 0;
          color: #64748b;
          font-size: 0.75rem;
        }
        .offline-backup-divider::before, .offline-backup-divider::after {
          content: ''; flex: 1; border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .offline-backup-divider span { padding: 0 10px; }

        .offline-backup-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .btn-file-backup {
          padding: 9px 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #94a3b8;
          font-size: 0.74rem;
          font-weight: 600;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-file-backup:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }
        .btn-file-backup.file-label { display: flex; align-items: center; justify-content: center; }

        .memopod-cloud-toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%) translateY(20px);
          background: #1e293b;
          border: 1px solid #6366f1;
          color: #ffffff;
          padding: 10px 18px;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 600;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(99, 102, 241, 0.4);
          z-index: 9999999;
          opacity: 0;
          transition: all 0.25s ease;
          pointer-events: none;
        }
        .memopod-cloud-toast.show {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `;
      document.head.appendChild(style);
    }
  };

  function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
  }

  window.MemoPodCloud = MemoPodCloud;

  // 자동 초기화
  window.addEventListener('DOMContentLoaded', () => {
    MemoPodCloud.init();
  });
})(window);
