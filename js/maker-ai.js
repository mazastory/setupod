// SETUPOD AI Card Scanner Integration

async function scanBusinessCard(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Image = e.target.result;
      
      try {
        const response = await fetch('https://xhjauoabxybaksvbtcic.supabase.co/functions/v1/parse-card', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageBase64: base64Image })
        });
        
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to scan card');
        }
        
        const json = await response.json();
        resolve(json.data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

function handleAiScanUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Show loading state
  showToast("🔍 AI가 종이 명함을 읽고 있습니다... (약 3~5초 소요)");
  
  // Create full-screen loading overlay if it doesn't exist
  let loader = document.getElementById('aiLoaderOverlay');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'aiLoaderOverlay';
    loader.innerHTML = `
      <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
        <i data-lucide="scan-line" style="width: 48px; height: 48px; color: #a855f7; animation: pulse 2s infinite;"></i>
        <div style="margin-top: 24px; font-size: 18px; font-weight: 700; color: white;">AI가 명함을 분석하고 있습니다</div>
        <div style="margin-top: 8px; font-size: 13px; color: rgba(255,255,255,0.6);">이름, 직급, 전화번호, 이메일을 추출 중...</div>
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
      </style>
    `;
    document.body.appendChild(loader);
    lucide.createIcons();
  }
  loader.style.display = 'flex';

  scanBusinessCard(file)
    .then(data => {
      loader.style.display = 'none';
      if (!data) throw new Error("데이터를 읽지 못했습니다.");
      
      showToast("✨ AI 자동 완성이 완료되었습니다!");
      
      // Populate fields
      if (data.name && document.getElementById('inputName')) document.getElementById('inputName').value = data.name;
      if (data.role && document.getElementById('inputRole')) document.getElementById('inputRole').value = data.role;
      if (data.company && document.getElementById('inputCompany')) document.getElementById('inputCompany').value = data.company;
      if (data.phone && document.getElementById('inputPhone')) document.getElementById('inputPhone').value = data.phone;
      if (data.email && document.getElementById('inputEmail')) document.getElementById('inputEmail').value = data.email;
      if (data.slogan && document.getElementById('inputSlogan')) document.getElementById('inputSlogan').value = data.slogan;
      if (data.tagline && document.getElementById('inputTagline')) document.getElementById('inputTagline').value = data.tagline;
      if (data.website && document.getElementById('inputWebsiteUrl')) document.getElementById('inputWebsiteUrl').value = data.website;
      
      // Auto-generate slug from name if empty
      const slugInput = document.getElementById('inputSlug');
      if (slugInput && !slugInput.value && data.name) {
        if (data.email) {
          slugInput.value = data.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        }
      }
      
      // Trigger live update to reflect changes in 3D card
      if (typeof liveUpdate === 'function') liveUpdate();
      
      // If we are in the intro screen, move to the editor
      const introOverlay = document.getElementById('makerIntroOverlay');
      if (introOverlay) {
        introOverlay.style.display = 'none';
      }
      
    })
    .catch(err => {
      loader.style.display = 'none';
      console.error(err);
      showToast("❌ 명함 분석 중 오류가 발생했습니다. 직접 입력해주세요.");
      const introOverlay = document.getElementById('makerIntroOverlay');
      if (introOverlay) {
        introOverlay.style.display = 'none';
      }
    });
}
