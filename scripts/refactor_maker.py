import re

with open('maker.html', 'r', encoding='utf-8') as f:
    content = f.read()

# I will find the #panelSingle div and its contents.
panel_single_start = content.find('<div id="panelSingle"')
if panel_single_start == -1:
    print("Error: panelSingle not found")
    exit(1)

# Let's just use CSS and JS to do the wizard to avoid massive HTML diffs.
# We will inject the Wizard Progress Bar right before #panelSingle
wizard_html = """
      <!-- Wizard Progress (Single Mode) -->
      <div id="wizardProgress" class="wizard-progress-container" style="display:none; margin-bottom: 20px;">
        <div class="wizard-steps-nav">
          <div class="wizard-step-indicator active" onclick="goToWizardStep(1)">1. 기본 정보</div>
          <div class="wizard-step-indicator" onclick="goToWizardStep(2)">2. 연락처/링크</div>
          <div class="wizard-step-indicator" onclick="goToWizardStep(3)">3. 디자인/연출</div>
        </div>
        <div class="wizard-progress-bar">
          <div class="wizard-progress-fill" id="wizardProgressFill" style="width: 33.33%;"></div>
        </div>
      </div>
"""

content = content.replace('<div id="panelSingle" style="display:flex;flex-direction:column;gap:28px;">', 
                         wizard_html + '\n      <div id="panelSingle" style="display:flex;flex-direction:column;gap:28px;">')

# Inject CSS for wizard
css = """
    /* Wizard UI */
    .wizard-progress-container {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 16px;
    }
    .wizard-steps-nav {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .wizard-step-indicator {
      font-size: 13px;
      font-weight: 600;
      color: rgba(255,255,255,0.4);
      cursor: pointer;
      transition: all 0.2s;
    }
    .wizard-step-indicator.active {
      color: #a855f7;
    }
    .wizard-step-indicator.completed {
      color: #fff;
    }
    .wizard-progress-bar {
      height: 6px;
      background: rgba(255,255,255,0.1);
      border-radius: 99px;
      overflow: hidden;
    }
    .wizard-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #c084fc, #a855f7);
      transition: width 0.3s ease;
    }
    .wizard-nav-buttons {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
      gap: 12px;
    }
    .btn-wizard {
      flex: 1;
      padding: 14px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-wizard-prev {
      background: rgba(255,255,255,0.08);
      color: white;
    }
    .btn-wizard-next {
      background: #a855f7;
      color: white;
    }
"""
content = content.replace('/* Mobile Fix */', css + '\n    /* Mobile Fix */')

# Inject JS for wizard logic
js = """
    // Wizard Logic
    let currentWizardStep = 1;
    let isWizardMode = true; // Set to true by default for single mode

    function initWizard() {
      const panel = document.getElementById('panelSingle');
      if (!panel) return;
      
      const sections = Array.from(panel.children).filter(child => child.tagName === 'DIV' && !child.classList.contains('wizard-nav-buttons'));
      // Indexes: 
      // 0: Load Preset
      // 1: Layout
      // 2: Theme
      // 3: Basic Info
      // 4: Logo/Profile
      // 5: Tags
      // 6: Contact/Action
      
      // We will assign data-step attributes to these sections
      if(sections.length >= 7) {
        sections[0].setAttribute('data-step', '1'); // Preset
        sections[3].setAttribute('data-step', '1'); // Basic info
        sections[5].setAttribute('data-step', '1'); // Tags
        
        sections[6].setAttribute('data-step', '2'); // Contact
        
        sections[1].setAttribute('data-step', '3'); // Layout
        sections[2].setAttribute('data-step', '3'); // Theme
        sections[4].setAttribute('data-step', '3'); // Logo
      }

      document.getElementById('wizardProgress').style.display = 'block';
      
      // Add Nav Buttons if not exist
      if (!document.getElementById('wizardNavButtons')) {
        const navDiv = document.createElement('div');
        navDiv.id = 'wizardNavButtons';
        navDiv.className = 'wizard-nav-buttons';
        navDiv.innerHTML = `
          <button class="btn-wizard btn-wizard-prev" id="btnWizardPrev" onclick="goToWizardStep(currentWizardStep - 1)">이전 단계</button>
          <button class="btn-wizard btn-wizard-next" id="btnWizardNext" onclick="goToWizardStep(currentWizardStep + 1)">다음 단계로</button>
        `;
        panel.appendChild(navDiv);
      }
      
      goToWizardStep(1);
    }

    function goToWizardStep(step) {
      if (step < 1 || step > 3) {
        // If they click next on step 3, maybe we scroll to "Save" or show a toast
        if (step > 3) {
           showToast("모든 작성이 완료되었습니다. 우측(또는 하단) 미리보기를 확인 후 저장하세요!");
           // Highlight the publish button
           const pubBtn = document.querySelector('.btn-publish');
           if(pubBtn) {
             pubBtn.style.transform = 'scale(1.05)';
             setTimeout(() => pubBtn.style.transform = 'none', 300);
           }
        }
        return;
      }
      
      currentWizardStep = step;
      
      // Update UI
      const panel = document.getElementById('panelSingle');
      const sections = Array.from(panel.children);
      
      sections.forEach(sec => {
        if (sec.hasAttribute('data-step')) {
          if (sec.getAttribute('data-step') == step) {
            sec.style.display = 'block';
            sec.style.animation = 'fadeInUp 0.3s ease';
          } else {
            sec.style.display = 'none';
          }
        }
      });
      
      // Update Progress Bar
      const indicators = document.querySelectorAll('.wizard-step-indicator');
      indicators.forEach((ind, idx) => {
        if (idx + 1 === step) {
          ind.classList.add('active');
          ind.classList.remove('completed');
        } else if (idx + 1 < step) {
          ind.classList.add('completed');
          ind.classList.remove('active');
        } else {
          ind.classList.remove('active', 'completed');
        }
      });
      
      document.getElementById('wizardProgressFill').style.width = `${(step / 3) * 100}%`;
      
      // Update Buttons
      document.getElementById('btnWizardPrev').style.visibility = step === 1 ? 'hidden' : 'visible';
      document.getElementById('btnWizardNext').innerText = step === 3 ? '🎉 작성 완료' : '다음 단계로';
      
      // Scroll to top of editor panel on mobile
      if (window.innerWidth <= 980) {
        document.querySelector('.editor-panel').scrollIntoView({ behavior: 'smooth' });
      }
    }
"""
content = content.replace('// --- URL 파라미터 복원 ---', js + '\n    // --- URL 파라미터 복원 ---')

# Trigger initWizard when Single mode is active
content = content.replace("document.getElementById('panelSingle').style.display = 'flex';", "document.getElementById('panelSingle').style.display = 'flex';\n      if(mode === 'single') initWizard();")

# Inject initWizard to window.onload logic
content = content.replace("restoreFromUrl();", "restoreFromUrl();\n      setTimeout(initWizard, 100);")

with open('maker.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Refactored maker.html for Wizard UI")
