// BrewOak 4:6 Method Drip Timer Engine v1.0
(function () {
  'use strict';

  // 4:6 Method Logic
  // Total water split into 5 equal pours (40% for taste balance, 60% for strength)
  // Each pour is separated by 45 seconds (Total 3m 30s)
  const STAGES = [
    { id: 1, name: "1차 푸어 (뜸들이기 & 산미)", time: 0, duration: 45, ratioPct: 20, desc: "원두 전체를 고르게 적셔 이산화탄소를 배출하고 밝은 산미를 형성합니다." },
    { id: 2, name: "2차 푸어 (단맛 밸런스)", time: 45, duration: 45, ratioPct: 20, desc: "가운데에서 바깥으로 나선을 그리며 단맛과 밸런스를 잡습니다." },
    { id: 3, name: "3차 푸어 (농도 조절 1)", time: 90, duration: 45, ratioPct: 20, desc: "본격적인 바디감을 형성하는 60% 구간의 첫 번째 주입입니다." },
    { id: 4, name: "4차 푸어 (농도 조절 2)", time: 135, duration: 45, ratioPct: 20, desc: "풍부한 마우스필과 텍스처를 완성합니다." },
    { id: 5, name: "5차 푸어 (최종 마무리)", time: 180, duration: 30, ratioPct: 20, desc: "마지막 물을 주입하고 물이 모두 서버로 완전히 떨어질 때까지 기다립니다." }
  ];

  let coffeeWeight = 20;
  let totalWater = 300; // 1:15 default
  let timerInterval = null;
  let currentSeconds = 0;
  let isRunning = false;
  let audioCtx = null;

  // DOM
  const elCoffee = document.getElementById('timerCoffee');
  const elWater = document.getElementById('timerWater');
  const elDisplay = document.getElementById('bigTimerDisplay');
  const elStart = document.getElementById('btnStartTimer');
  const elReset = document.getElementById('btnResetTimer');
  const elStageName = document.getElementById('activeStageName');
  const elStageDesc = document.getElementById('activeStageDesc');
  const elStageTarget = document.getElementById('activeStageTarget');
  const elSoundToggle = document.getElementById('toggleSound');

  // Simple Web Audio API Beep
  function playBeep(freq = 600, duration = 0.15) {
    if (!elSoundToggle.checked) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  const isEn = document.documentElement.lang === 'en';

  const STAGES_EN = [
    { id: 1, name: "Stage 1 (Bloom & Acidity)", time: 0, duration: 45, ratioPct: 20, desc: "Saturate grounds completely to release CO2 and establish vibrant acidity." },
    { id: 2, name: "Stage 2 (Sweetness Balance)", time: 45, duration: 45, ratioPct: 20, desc: "Pour in slow spirals from center outward to capture sweetness and balance." },
    { id: 3, name: "Stage 3 (Strength Build 1)", time: 90, duration: 45, ratioPct: 20, desc: "The first pour of the 60% phase to begin building body and mouthfeel." },
    { id: 4, name: "Stage 4 (Strength Build 2)", time: 135, duration: 45, ratioPct: 20, desc: "Develops rich texture, round viscosity, and lingering sweetness." },
    { id: 5, name: "Stage 5 (Final Drawdown)", time: 180, duration: 30, ratioPct: 20, desc: "Final pour volume; allow brew bed to drain fully into the carafe." }
  ];

  function getStages() {
    return isEn ? STAGES_EN : STAGES;
  }

  function calculatePours() {
    coffeeWeight = parseFloat(elCoffee.value) || 20;
    totalWater = Math.round(coffeeWeight * 15);
    if (elWater) elWater.textContent = `${totalWater} ml`;

    const singlePour = Math.round(totalWater / 5);
    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById(`pourTarget${i}`);
      const cumEl = document.getElementById(`pourCum${i}`);
      if (el) el.textContent = `+${singlePour} ml`;
      if (cumEl) cumEl.textContent = isEn ? `(Cum. ${singlePour * i} ml)` : `(누적 ${singlePour * i} ml)`;
    }
  }

  function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  function updateActiveStage() {
    const currentStages = getStages();
    let currentStage = currentStages[0];
    for (let i = currentStages.length - 1; i >= 0; i--) {
      if (currentSeconds >= currentStages[i].time) {
        currentStage = currentStages[i];
        break;
      }
    }

    if (currentSeconds >= 210) {
      elStageName.textContent = isEn ? "🎉 Extraction Complete!" : "🎉 추출 완료!";
      elStageDesc.textContent = isEn 
        ? "Remove dripper, swirl your carafe gently, and savor your cup."
        : "드리퍼를 치우고 서버를 가볍게 스월링하여 향미를 즐기세요.";
      elStageTarget.textContent = isEn 
        ? `Total Yield ~${totalWater - Math.round(coffeeWeight * 2)} ml`
        : `총 추출량 ~${totalWater - Math.round(coffeeWeight * 2)} ml`;
      return;
    }

    elStageName.textContent = currentStage.name;
    elStageDesc.textContent = currentStage.desc;
    const singlePour = Math.round(totalWater / 5);
    elStageTarget.textContent = isEn 
      ? `Target Cumulative: ${singlePour * currentStage.id} ml`
      : `목표 누적수: ${singlePour * currentStage.id} ml`;

    // Highlight timeline card
    document.querySelectorAll('.timer-stage-card').forEach((card, idx) => {
      card.classList.toggle('active', idx + 1 === currentStage.id);
    });

    // Check beep times
    if (currentStages.some(st => st.time === currentSeconds)) {
      playBeep(880, 0.25); // Higher pitch for new stage
    } else if (currentSeconds > 0 && (currentSeconds + 3) % 45 === 0) {
      playBeep(520, 0.1); // Countdown tick
    }
  }

  function startTimer() {
    if (!isRunning) {
      isRunning = true;
      elStart.innerHTML = isEn ? "⏸ Pause" : "⏸ 일시정지";
      elStart.classList.add('running');
      elStart.classList.remove('primary');
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      playBeep(880, 0.2);

      timerInterval = setInterval(() => {
        currentSeconds++;
        elDisplay.textContent = formatTime(currentSeconds);
        updateActiveStage();
        if (currentSeconds >= 220) {
          clearInterval(timerInterval);
          isRunning = false;
          elStart.innerHTML = isEn ? "▶ Start" : "▶ 시작";
          elStart.classList.remove('running');
          elStart.classList.add('primary');
        }
      }, 1000);
    } else {
      isRunning = false;
      elStart.innerHTML = isEn ? "▶ Resume" : "▶ 계속하기";
      elStart.classList.remove('running');
      elStart.classList.add('primary');
      clearInterval(timerInterval);
    }
  }

  function resetTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    currentSeconds = 0;
    elDisplay.textContent = "00:00";
    elStart.innerHTML = isEn ? "▶ Start" : "▶ 시작";
    elStart.classList.remove('running');
    elStart.classList.add('primary');
    elStageName.textContent = isEn ? "Ready" : "대기 중";
    elStageDesc.textContent = isEn 
      ? "Press Start to begin Stage 1 (Bloom pour)."
      : "시작 버튼을 누르면 1차 푸어(뜸들이기)가 시작됩니다.";
    elStageTarget.textContent = isEn 
      ? `Target Cumulative: ${Math.round(totalWater / 5)} ml`
      : `목표 누적수: ${Math.round(totalWater / 5)} ml`;
    document.querySelectorAll('.timer-stage-card').forEach((card, idx) => {
      card.classList.toggle('active', idx === 0);
    });
  }

  function init() {
    elCoffee.addEventListener('input', calculatePours);
    document.querySelectorAll('[data-timer-coffee]').forEach(btn => {
      btn.addEventListener('click', () => {
        elCoffee.value = btn.dataset.timerCoffee;
        calculatePours();
      });
    });
    elStart.addEventListener('click', startTimer);
    elReset.addEventListener('click', resetTimer);
    calculatePours();
    resetTimer();
  }

  init();
})();
