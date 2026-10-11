// BrewOak Coffee Calculator Engine v1.0
(function () {
  'use strict';

  // --- Multi-language Strings ---
  const I18N = {
    ko: {
      brand: "BrewOak",
      tagline: "커피 추출 비율 & 수율 계산기",
      heroDesc: "원두와 물의 황금 비율, 완벽한 한 잔을 위한 1초 추출 공식",
      unitG: "g",
      unitMl: "ml",
      unitOz: "oz",
      unitFlOz: "fl oz",
      coffeeLabel: "원두 용량 (Coffee)",
      waterLabel: "총 물 양 (Water)",
      targetYield: "예상 추출 커피양",
      ratioLabel: "추출 비율 (Ratio 1 : X)",
      light: "연하게 (1:17)",
      balanced: "골든컵 (1:15~16)",
      rich: "진하게 (1:13~14)",
      stepsTitle: "단계별 푸어(Pour) 가이드",
      bloom: "1단계: 뜸들이기 (Bloom)",
      bloomDesc: "신선한 가스를 배출하고 원두 전체를 고르게 적십니다.",
      pour1: "2단계: 1차 푸어 (산미 & 단맛)",
      pour1Desc: "가운데에서 원을 그리며 천천히 부어줍니다.",
      pour2: "3단계: 2차 푸어 (바디감 & 농도)",
      pour2Desc: "남은 물을 부어 목표 수율을 완성합니다.",
      timerTitle: "드립 타이머",
      start: "시작",
      pause: "일시정지",
      reset: "초기화",
      speechDefault: "원두와 물 양을 넣으면 황금 비율을 찾아드려요!",
      speechSlider: "좋은 선택이에요! 이 비율은 밸런스가 뛰어나죠.",
      speechTimer: "타이머 시작! 천천히 원을 그리며 물을 부어주세요.",
      speechDone: "추출 완료! 갓 내린 커피의 향을 즐겨보세요 ☕"
    },
    en: {
      brand: "BrewOak",
      tagline: "Coffee Brew Ratio & Extraction Calculator",
      heroDesc: "The Golden Cup formula for perfect pour-overs and extractions",
      unitG: "g",
      unitMl: "ml",
      unitOz: "oz",
      unitFlOz: "fl oz",
      coffeeLabel: "Coffee Dose",
      waterLabel: "Total Water",
      targetYield: "Estimated Yield",
      ratioLabel: "Brew Ratio (1 : X)",
      light: "Light (1:17)",
      balanced: "Golden (1:15-16)",
      rich: "Rich (1:13-14)",
      stepsTitle: "Step-by-Step Pouring Guide",
      bloom: "Stage 1: The Bloom",
      bloomDesc: "Release trapped CO2 and evenly saturate coffee grounds.",
      pour1: "Stage 2: First Pour (Acidity & Sweetness)",
      pour1Desc: "Pour steadily in outward spirals from center.",
      pour2: "Stage 3: Final Pour (Body & Finish)",
      pour2Desc: "Complete target water volume and allow to drain.",
      timerTitle: "Drip Timer",
      start: "Start",
      pause: "Pause",
      reset: "Reset",
      speechDefault: "Adjust dose or water to calculate the Golden Ratio!",
      speechSlider: "Great ratio! Perfectly balanced extraction.",
      speechTimer: "Timer running! Pour gently in steady spirals.",
      speechDone: "Extraction complete! Enjoy your fresh artisanal cup ☕"
    }
  };

  // --- Presets Data ---
  const PRESETS = {
    pour_over: {
      nameKo: "핸드드립 / 푸어오버",
      nameEn: "Pour Over (V60)",
      defaultCoffee: 20,
      defaultRatio: 16,
      minRatio: 12,
      maxRatio: 18,
      temp: "92-94°C (198-201°F)",
      grindKo: "중간-가늘게 (Medium-Fine)",
      grindEn: "Medium-Fine",
      time: "2:30 ~ 3:00"
    },
    iced_drip: {
      nameKo: "아이스 드립",
      nameEn: "Iced Pour Over",
      defaultCoffee: 20,
      defaultRatio: 10,
      minRatio: 8,
      maxRatio: 12,
      temp: "93-95°C (200-203°F)",
      grindKo: "중간 (Medium, 얼음 100g 별도)",
      grindEn: "Medium (100g ice in server)",
      time: "2:00 ~ 2:30"
    },
    aeropress: {
      nameKo: "에어로프레스",
      nameEn: "AeroPress",
      defaultCoffee: 15,
      defaultRatio: 13,
      minRatio: 10,
      maxRatio: 16,
      temp: "85-88°C (185-190°F)",
      grindKo: "가늘게 (Fine-Medium)",
      grindEn: "Fine-Medium",
      time: "1:30 ~ 2:00"
    },
    french_press: {
      nameKo: "프렌치 프레스",
      nameEn: "French Press",
      defaultCoffee: 30,
      defaultRatio: 15,
      minRatio: 12,
      maxRatio: 18,
      temp: "94-96°C (201-205°F)",
      grindKo: "굵게 (Coarse)",
      grindEn: "Coarse",
      time: "4:00"
    },
    cold_brew: {
      nameKo: "콜드브루",
      nameEn: "Cold Brew",
      defaultCoffee: 60,
      defaultRatio: 8,
      minRatio: 6,
      maxRatio: 12,
      temp: "상온 / 냉수 (Cold)",
      grindKo: "매우 굵게 (Extra Coarse)",
      grindEn: "Extra Coarse",
      time: "12 ~ 18 hours"
    },
    moka_pot: {
      nameKo: "모카포트",
      nameEn: "Moka Pot",
      defaultCoffee: 18,
      defaultRatio: 7,
      minRatio: 5,
      maxRatio: 9,
      temp: "약불 가열",
      grindKo: "고운 분쇄 (Fine)",
      grindEn: "Fine",
      time: "2:00"
    }
  };

  // --- Character Expressions SVG Bodies ---
  const FACES = {
    idle: `<g class="bob"><use href="#barrel"/><use href="#lid"/>
      <ellipse cx="49" cy="77" rx="4.5" ry="6" fill="#2A211B"/><circle cx="50.5" cy="75" r="1.8" fill="#fff"/>
      <ellipse cx="71" cy="77" rx="4.5" ry="6" fill="#2A211B"/><circle cx="72.5" cy="75" r="1.8" fill="#fff"/>
      <path d="M55 86 Q60 90 65 86" stroke="#2A211B" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>`,
    excited: `<g class="bob"><use href="#barrel"/><use href="#lid"/>
      <ellipse cx="49" cy="76" rx="5" ry="6.5" fill="#2A211B"/><circle cx="50.8" cy="73.6" r="2" fill="#fff"/>
      <ellipse cx="71" cy="76" rx="5" ry="6.5" fill="#2A211B"/><circle cx="72.8" cy="73.6" r="2" fill="#fff"/>
      <path d="M52 84 Q60 93 68 84 Q60 88 52 84 Z" fill="#6B2E22" stroke="#2A211B" stroke-width="2" stroke-linejoin="round"/></g>
      <path d="M100 22 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 Z" fill="#F2C14E"/>
      <path d="M18 40 l1.5 3.5 l3.5 1.5 l-3.5 1.5 l-1.5 3.5 l-1.5 -3.5 l-3.5 -1.5 l3.5 -1.5 Z" fill="#F2C14E"/>`,
    brewing: `<g class="bob"><use href="#barrel"/><use href="#lid"/>
      <path d="M44 77 Q49 81 54 77 M66 77 Q71 81 76 77" stroke="#2A211B" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <ellipse cx="60" cy="88" rx="2.6" ry="2.2" fill="#2A211B"/></g>
      <circle class="bubble" cx="38" cy="22" r="6" fill="#FFF7E8" stroke="#C9B79C" stroke-width="1.5"/>
      <circle class="bubble" cx="50" cy="14" r="4" fill="#FFF7E8" stroke="#C9B79C" stroke-width="1.5"/>
      <circle class="bubble" cx="30" cy="10" r="3" fill="#FFF7E8" stroke="#C9B79C" stroke-width="1.5"/>`
  };

  // --- State Variables ---
  let currentLang = 'ko';
  let currentUnit = 'metric'; // 'metric' (g/ml) or 'imperial' (oz/fl oz)
  let currentMethod = 'pour_over';
  let coffeeVal = 20; // internal always in grams
  let ratioVal = 16;
  let timerInterval = null;
  let timerSeconds = 0;
  let timerRunning = false;

  // DOM Elements
  const elStage = document.getElementById('brewStage');
  const elSpeech = document.getElementById('speechBubble');
  const elCoffeeInput = document.getElementById('coffeeInput');
  const elWaterInput = document.getElementById('waterInput');
  const elRatioSlider = document.getElementById('ratioSlider');
  const elRatioValue = document.getElementById('ratioValue');
  const elSummaryRatio = document.getElementById('summaryRatio');
  const elSummaryWater = document.getElementById('summaryWater');
  const elSummaryYield = document.getElementById('summaryYield');
  const elSummaryTemp = document.getElementById('summaryTemp');
  const elSummaryGrind = document.getElementById('summaryGrind');
  const elStageBloomWater = document.getElementById('stageBloomWater');
  const elStage1Water = document.getElementById('stage1Water');
  const elStage2Water = document.getElementById('stage2Water');
  const elTimerDisplay = document.getElementById('timerDisplay');
  const elBtnTimerStart = document.getElementById('btnTimerStart');
  const elBtnTimerReset = document.getElementById('btnTimerReset');

  function setFace(faceKey) {
    if (elStage && FACES[faceKey]) {
      elStage.innerHTML = `<svg viewBox="0 0 120 130" role="img" aria-label="브루 마스코트">${FACES[faceKey]}</svg>`;
    }
  }

  function setSpeech(text) {
    if (elSpeech) elSpeech.textContent = text;
  }

  // --- Convert helpers ---
  // 1 oz = 28.3495 g
  // 1 fl oz = 29.5735 ml
  function formatCoffee(g) {
    if (currentUnit === 'imperial') {
      return (g / 28.3495).toFixed(1);
    }
    return Math.round(g * 10) / 10;
  }

  function formatWater(ml) {
    if (currentUnit === 'imperial') {
      return (ml / 29.5735).toFixed(1);
    }
    return Math.round(ml);
  }

  function parseCoffeeInput(val) {
    const num = parseFloat(val) || 0;
    if (currentUnit === 'imperial') {
      return num * 28.3495;
    }
    return num;
  }

  function parseWaterInput(val) {
    const num = parseFloat(val) || 0;
    if (currentUnit === 'imperial') {
      return num * 29.5735;
    }
    return num;
  }

  // --- Recalculate Logic ---
  function updateCalculations(triggeredBy) {
    const totalWater = coffeeVal * ratioVal;
    // Water absorbed by grounds is roughly 2x coffee weight
    const estimatedYield = Math.max(0, totalWater - (coffeeVal * 2.0));

    // Update Inputs
    if (triggeredBy !== 'coffeeInput') {
      elCoffeeInput.value = formatCoffee(coffeeVal);
    }
    if (triggeredBy !== 'waterInput') {
      elWaterInput.value = formatWater(totalWater);
    }

    // Update Slider & Labels
    elRatioSlider.value = ratioVal;
    elRatioValue.textContent = `1 : ${ratioVal}`;
    elSummaryRatio.textContent = `1 : ${ratioVal}`;
    
    const waterUnitStr = currentUnit === 'metric' ? 'ml' : 'fl oz';
    elSummaryWater.textContent = `${formatWater(totalWater)} ${waterUnitStr}`;
    elSummaryYield.textContent = `~${formatWater(estimatedYield)} ${waterUnitStr}`;

    const preset = PRESETS[currentMethod];
    elSummaryTemp.textContent = preset.temp;
    elSummaryGrind.textContent = currentLang === 'ko' ? preset.grindKo : preset.grindEn;

    // Steps calculation (Pour over / Drip models)
    const bloomWater = Math.round(coffeeVal * 2.5);
    const remainWater = totalWater - bloomWater;
    const stage1Water = Math.round(remainWater * 0.55);
    const stage2Water = Math.max(0, Math.round(totalWater - bloomWater - stage1Water));

    elStageBloomWater.textContent = `+${formatWater(bloomWater)} ${waterUnitStr} (누적 ${formatWater(bloomWater)})`;
    elStage1Water.textContent = `+${formatWater(stage1Water)} ${waterUnitStr} (누적 ${formatWater(bloomWater + stage1Water)})`;
    elStage2Water.textContent = `+${formatWater(stage2Water)} ${waterUnitStr} (누적 ${formatWater(totalWater)})`;
  }

  // --- Method Tab Switch ---
  function selectMethod(methodKey) {
    currentMethod = methodKey;
    const preset = PRESETS[methodKey];
    coffeeVal = preset.defaultCoffee;
    ratioVal = preset.defaultRatio;

    elRatioSlider.min = preset.minRatio;
    elRatioSlider.max = preset.maxRatio;

    document.querySelectorAll('.method-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.method === methodKey);
    });

    setFace('excited');
    setSpeech(`${preset[currentLang === 'ko' ? 'nameKo' : 'nameEn']} 모드가 선택되었어요!`);
    updateCalculations();
  }

  // --- Timer Engine ---
  function formatTimerDigits(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function toggleTimer() {
    if (!timerRunning) {
      // Start
      timerRunning = true;
      elBtnTimerStart.textContent = I18N[currentLang].pause;
      elBtnTimerStart.classList.add('primary');
      setFace('brewing');
      setSpeech(I18N[currentLang].speechTimer);

      timerInterval = setInterval(() => {
        timerSeconds++;
        elTimerDisplay.textContent = formatTimerDigits(timerSeconds);

        // Stage notices
        if (timerSeconds === 45) {
          setSpeech(currentLang === 'ko' ? "뜸들이기 끝! 1차 푸어를 시작하세요." : "Bloom complete! Begin 1st pour.");
        } else if (timerSeconds === 90) {
          setSpeech(currentLang === 'ko' ? "1차 완료! 마지막 2차 푸어로 채워주세요." : "Stage 1 done! Final pour now.");
        }
      }, 1000);
    } else {
      // Pause
      timerRunning = false;
      elBtnTimerStart.textContent = I18N[currentLang].start;
      clearInterval(timerInterval);
      setFace('idle');
    }
  }

  function resetTimer() {
    timerRunning = false;
    clearInterval(timerInterval);
    timerSeconds = 0;
    elTimerDisplay.textContent = "00:00";
    elBtnTimerStart.textContent = I18N[currentLang].start;
    setFace('idle');
    setSpeech(I18N[currentLang].speechDefault);
  }

  // --- Event Listeners Initialization ---
  function initEvents() {
    // Method tabs
    document.querySelectorAll('.method-tab').forEach(tab => {
      tab.addEventListener('click', () => selectMethod(tab.dataset.method));
    });

    // Coffee Input
    elCoffeeInput.addEventListener('input', () => {
      coffeeVal = Math.max(1, parseCoffeeInput(elCoffeeInput.value));
      setFace('excited');
      updateCalculations('coffeeInput');
    });

    // Water Input
    elWaterInput.addEventListener('input', () => {
      const inputWater = parseWaterInput(elWaterInput.value);
      if (inputWater > 0 && ratioVal > 0) {
        coffeeVal = Math.max(1, inputWater / ratioVal);
        setFace('excited');
        updateCalculations('waterInput');
      }
    });

    // Ratio Slider
    elRatioSlider.addEventListener('input', () => {
      ratioVal = parseFloat(elRatioSlider.value);
      setSpeech(I18N[currentLang].speechSlider);
      updateCalculations('slider');
    });

    // Stepper Buttons
    document.querySelectorAll('[data-step-coffee]').forEach(btn => {
      btn.addEventListener('click', () => {
        const delta = parseFloat(btn.dataset.stepCoffee);
        coffeeVal = Math.max(1, coffeeVal + delta);
        updateCalculations();
      });
    });

    document.querySelectorAll('[data-step-water]').forEach(btn => {
      btn.addEventListener('click', () => {
        const delta = parseFloat(btn.dataset.stepWater);
        const currentWater = coffeeVal * ratioVal;
        const newWater = Math.max(10, currentWater + delta);
        coffeeVal = Math.max(1, newWater / ratioVal);
        updateCalculations();
      });
    });

    // Timer buttons
    elBtnTimerStart.addEventListener('click', toggleTimer);
    elBtnTimerReset.addEventListener('click', resetTimer);

    // Language Toggle
    const btnLang = document.getElementById('btnLangToggle');
    if (btnLang) {
      btnLang.addEventListener('click', () => {
        currentLang = currentLang === 'ko' ? 'en' : 'ko';
        btnLang.textContent = currentLang === 'ko' ? 'EN' : 'KR';
        applyI18n();
      });
    }

    // Unit Toggle
    const btnUnit = document.getElementById('btnUnitToggle');
    if (btnUnit) {
      btnUnit.addEventListener('click', () => {
        currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
        btnUnit.textContent = currentUnit === 'metric' ? 'Metric (g/ml)' : 'Imperial (oz)';
        document.getElementById('coffeeUnitLabel').textContent = currentUnit === 'metric' ? 'g' : 'oz';
        document.getElementById('waterUnitLabel').textContent = currentUnit === 'metric' ? 'ml' : 'fl oz';
        updateCalculations();
      });
    }
  }

  function applyI18n() {
    const t = I18N[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (t[key]) el.textContent = t[key];
    });
    setSpeech(t.speechDefault);
    updateCalculations();
  }

  // --- Initial Bootstrap ---
  setFace('idle');
  setSpeech(I18N[currentLang].speechDefault);
  initEvents();
  updateCalculations();
})();
