// ====== Setup âm thanh ======
window.winSound    = window.winSound    || new Audio('https://luuchihoa.github.io/sound/win.mp3');
window.selectSound = window.selectSound || new Audio('https://luuchihoa.github.io/sound/click.mp3');
window.hoverSound  = window.hoverSound  || new Audio('https://luuchihoa.github.io/sound/hover.mp3');
window.wrongSound  = window.wrongSound  || new Audio('https://luuchihoa.github.io/sound/buzzer.mp3');
window.correctSound= window.correctSound|| new Audio('https://luuchihoa.github.io/sound/ding.mp3');
window.tickSound1   = window.tickSound1   || new Audio('https://luuchihoa.github.io/sound/tick.wav');
window.tickSound2   = window.tickSound2   || new Audio('https://luuchihoa.github.io/sound/tick.wav');

tickSound1.volume = 0.7;
tickSound2.volume = 0.7;
winSound.volume = 0.35;
selectSound.volume = 0.4;
wrongSound.volume = 0.4;

// ====================== BIẾN =========================
window.questions = [];
window.quizQuestions = [];
window.root=null;

window.current = 0;
window.scoreChoice = 0;
window.totalTime = 0;

window.quizEnded = false;
window.timerRAF = null;
window.questionLocked = false;
window.lastSecond = null;
// ====================== Init-Quiz =========================
window.initQuiz = async function (type) {
  // ===== Lấy root =====
  root = document.getElementById("quiz-root");
  if (!root) {
    console.error("❌ Không tìm thấy quiz-root — DOM chưa load");
    return;
  }

  // ===== Cache DOM =====
  window.quizBox = root.querySelector('.quiz-box');
  window.quizBox1 = root.querySelector('.quiz-box1');
  window.fractionEl = root.querySelector('#fraction');
  window.questionTextEl = root.querySelector('#question-text');
  window.optionsArea = root.querySelector('#options-area');
  window.finishArea = root.querySelector('#finish-area');
  window.skipBtn = root.querySelector('#skip-btn');
  window.finishBtn = root.querySelector('#finish-btn');

  // ===== Load dữ liệu =====
  try {
    await loadData().then(()=>{
      if(questions.length<config.mcqCount) {
        error();
        return;
      }
      // ===== Setup UI ban đầu =====
      document.getElementById('loading-box')?.classList?.add('hidden');
      document.getElementById('start-box')?.classList?.remove('hidden');
    });
  } catch (e) {
    console.error("❌ loadData thất bại", e);
    return;
  }


  const titleEl = document.getElementById('quiz-title');
  if (titleEl) titleEl.textContent = config.title;
};
// ====================== LOAD DATA =========================
async function loadData() {
  document.title = config.title;
  document.body.classList.add("overflow-hidden");
  document.getElementById('start-box')?.classList?.add('hidden');
  document.querySelector('.header-text')?.classList?.remove('hidden');
  document.getElementById('thanhgia')?.classList?.add('hidden');
  document.querySelectorAll('.title-quiz, #quiz-title').forEach(el=>{
    if(el) el.textContent = config.title;
  });

  try {
    const res = await fetch(config.api);
    const data = await res.json();
    // expecting data.mcq array; each item: { text, choices: {A:..}, correct: "A", image: "/path" (optional) }
    questions = data || [];
  } catch (err) {
    console.error(err);
    error();
    throw err;
  }
};

window.audioUnlocked = false;
function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  [winSound, selectSound, hoverSound, wrongSound, correctSound, tickSound1, tickSound2]
    .forEach(a => {
      const s = a.cloneNode();
      s.volume = 0;
      s.play().then(() => s.pause()).catch(()=>{});
    });
}
// ====================== ÂM THANH 3S CUỐI =========================
function playFinalRush() {
  playSound(tickSound1, 1.6)

  setTimeout(() => {
    playSound(tickSound2, 1.8)
  }, 350);
}

function onTimeUp() {
  if (questionLocked) return;
  questionLocked = true;
  handleAnswer();
}

function playSound(audio, rate = 1) {
  if (!audio) return;
  try {
    audio.pause();
    audio.currentTime = 0;
    audio.playbackRate = rate;
    audio.play().catch(()=>{});
  } catch {}
}

function stopTimer() {
  if (timerRAF !== null) {
    cancelAnimationFrame(timerRAF);
    timerRAF = null;
  }
}
window.stopTimer=stopTimer;

function lockOptions() {
  document.querySelectorAll('.option:not(.wrong):not(.correct)').forEach(o => {
    o.classList.add('pointer-events-none', 'opacity-70');
  });
}

function lockSkip(ms = 900) {
  skipBtn.classList.add('pointer-events-none', 'opacity-50');
  finishBtn.classList.add('pointer-events-none', 'opacity-50');

  setTimeout(() => {
    skipBtn.classList.remove('pointer-events-none', 'opacity-50');
    finishBtn.classList.remove('pointer-events-none', 'opacity-50');
  }, ms);
}

function startTimerSmooth() {
  const bar = document.getElementById('time-bar');
  const durationMs = 30000;
  const start = performance.now();
  let warned = false;

  // ✅ reset trạng thái
  bar.style.width = "0%";
  bar.classList.remove('time-warning', 'time-danger');
  bar.classList.add('time-normal');

  function animate(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / durationMs, 1);
    bar.style.width = (progress * 100) + "%";

    const remaining = durationMs - elapsed;

    if (remaining <= 3000 && !warned) {
      warned = true;
      bar.classList.remove('time-normal');
      bar.classList.add('time-warning', 'time-danger');
    }
    if (remaining <= 3000) {
      const sec = Math.ceil(remaining / 1000); // 3,2,1,0
      if (sec !== lastSecond) {
        lastSecond = sec;
        if(sec>0){
          playFinalRush();
        }
      }
    }

    if (progress < 1) {
      timerRAF = requestAnimationFrame(animate);
    } else {
      bar.classList.remove('time-warning');
      timerRAF = null;
      onTimeUp();
    }
  }

  timerRAF = requestAnimationFrame(animate);
}

// ====================== CẤU HÌNH BÀI THI =========================
window.examConfig = {
  'dovui': {
    title: 'ĐỐ VUI GIÁO LÝ',
    api: 'https://script.google.com/macros/s/AKfycbzouvhKjvjxsOKv2xAm74bmvwFVhM8M9FWe0eiOMiuYv1hRItRzsyz7eokfz5Oz8lI/exec',
    time: 15 * 60,
    mcqCount: 5,
  },
  '1tiet': {
    title: 'ÔN TẬP 1 TIẾT',
    api: 'https://script.google.com/macros/s/AKfycbwOuqPMsL1VjVy78FpeTEAMaYjWMkp6UqTBe9KSjaqu-f16F8RyO5iNc3xYqluEB9LyyA/exec',
    time: 45 * 60,
    mcqCount: 10,
  },
};

function getExamType() {
  const params = new URLSearchParams(window.location.search);
  return params.get('type') || 'dovui';
}
window.examType = getExamType();
window.config = examConfig[examType] || examConfig['dovui'];
totalTime = config.time;

// ====================== RANDOM =========================
function getRandomItems(arr, n) {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
}

function randomQuestion() {
  const need = Math.min(config.mcqCount, questions.length);
  quizQuestions = getRandomItems(questions, need);
}

// called when per-question time runs out
function handleTimeout() {
  // playSound(wrongSound);
  wrongSound.play();
  wrongSound.currentTime = 0;
  pushUnansweredAndNext();
}

// ====================== LOAD CÂU HỎI =========================
function loadQuestion() {
  questionLocked = false;
  
  if (!quizQuestions || quizQuestions.length === 0) {
    quizContentFallback();
    return;
  }

  const q = quizQuestions[current];
  document.querySelector('.ques-box').textContent = `Câu ${current+1}/${quizQuestions.length}`;
  questionTextEl.textContent = `${q.text}` || '(Không có nội dung câu hỏi)';
  // build options
  const choices = q.choices || {};
  optionsArea.innerHTML = Object.entries(choices)
    .map(([k, v]) => {
      return `
      <div class="option text-base" data-key="${k}">
        <span class="option-circle ">${k}</span>
        <span class="option-text">${v}</span>
      </div>`;
    })
    .join('');
  // attach events
  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
  document.querySelectorAll('.option').forEach(opt => {
    if (!isMobile) {
      opt.addEventListener('mouseenter', () => {
        playSound(hoverSound);
      });
    }

    opt.addEventListener('click', () => {
      if (questionLocked) return; // ✅ chặn click trễ
      questionLocked = true;
      handleAnswer(opt.dataset.key);
    });
  });
  // skip handler
  skipBtn.onclick = () => {
    handleAnswer();
  };
  finishBtn.onclick = () => {
    stopTimer();
    showResults();
  }
  // start per-question timer
  startTimerSmooth();
}


// ====================== CHECK ĐÁP ÁN =========================
function handleAnswer(selectedKey=null) {
  const q = quizQuestions[current];

  document.querySelectorAll('.option').forEach(btn => {
    btn.style.pointerEvents = 'none';
    if (btn.dataset.key === q.correct)
      btn.classList.add('correct');
    else if (btn.dataset.key === selectedKey)
      btn.classList.add('wrong');
  });

  if (selectedKey === q.correct) {
    scoreChoice++;
    playSound(correctSound);
  } else {
    playSound(wrongSound);
  }
  lockOptions();
  lockSkip();
  stopTimer();
  setTimeout(nextQuestion, 1200);
}

// ====================== NEXT QUESTION =========================
function nextQuestion() {
  current++;
  if (current < quizQuestions.length) {
    loadQuestion();
  } else {
    showResults();
  }
}

// ====================== KẾT QUẢ =========================
function showResults() {
  if (quizEnded) return;   // ⛔ CHỐT
  quizEnded = true;
  playSound(winSound);
  
  quizBox?.classList.add("hidden");
  quizBox1?.classList.remove("hidden");
  const score = ((scoreChoice / quizQuestions.length) * 10).toFixed(1);
  finishArea.innerHTML = `
    <h2 class="text-3xl text-center text-green-600 font-bold mb-4">Hoàn thành bài thi!</h2>
    <p class="text-center text-xl font-bold !text-red-600">Tổng điểm: ${score}/10</p>
    <div class="text-center mt-4">
      <button id="retry-btn" class="px-6 py-2 bg-gray-400 text-white rounded-xl">Làm lại</button>
    </div>
  `;
  document.getElementById('retry-btn').onclick = () => {
    startQuiz();
  };
}

// fallback if no data
function quizContentFallback() {
  optionsArea.innerHTML = '<p class="text-center text-red-500">Không có câu hỏi để hiển thị.</p>';
}

// ====================== START =========================
function startQuiz() {
  unlockAudio();
  document.getElementById('start-box').style.display = 'none';
  document.getElementById('loading-box').style.display = 'none';
  document.getElementById('thanhgia')?.classList?.remove('hidden');
  quizBox?.classList.remove("hidden");
  quizBox1?.classList.add("hidden");
  
  quizEnded = false; // ✅ reset cờ
  totalTime = config.time;
  current = 0;
  scoreChoice = 0;
  randomQuestion();
  loadQuestion();
}

window.startQuiz = startQuiz;

openExitModal.onclick = openExitModal;

function cleanupQuizDOM() {
  quizBox =
  quizBox1 =
  fractionEl =
  questionTextEl =
  optionsArea =
  skipBtn =
  finishBtn = null;
}

function reload() {
  initQuiz(examType);
  document.getElementById("loading-box")?.classList?.remove("hidden");
  document.querySelector(".error-box")?.classList?.add("hidden");
}
function error() {
  setTimeout(() => {
    document.getElementById("loading-box")?.classList?.add("hidden");
    document.querySelector(".error-box")?.classList?.remove("hidden");
  }, 3000);
}
