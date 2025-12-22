// ====== Setup âm thanh ======
window.winSound    = window.winSound    || new Audio('./sound/win.mp3');
window.selectSound = window.selectSound || new Audio('./sound/click.mp3');
window.hoverSound  = window.hoverSound  || new Audio('./sound/hover.mp3');
window.wrongSound  = window.wrongSound  || new Audio('./sound/buzzer.mp3');
window.correctSound= window.correctSound|| new Audio('./sound/ding.mp3');
window.tickSound   = window.tickSound   || new Audio('./sound/tick.wav');

tickSound.volume = 0.7;
winSound.volume = 0.35;
selectSound.volume = 0.4;
wrongSound.volume = 0.4;
// ====================== DỮ LIỆU =========================
window.questions = [];
window.essayQuestions = [];

window.current = 0;
window.scoreChoice = 0;
window.totalTime = 0;
window.globalTimer=0;
window.userAnswers = [];

window.quizQuestions = [];
window.essayQuizQuestions = [];

window.hasRun = false;

// ====================== CẤU HÌNH BÀI THI =========================
window.examConfig = {
  "15phut-hk12": {
    title: "ÔN TẬP 15 PHÚT",
    api: "https://script.google.com/macros/s/AKfycbzs823Exjgop4XQHd90PVcjSMD3INg2j4V0Iy3uN0zAhZfvwHZIonpIEW0HdD8YOE4Y/exec",
    time: 900,
    mcqCount: 10,
    essayCount: 2
  },
  "15phut-hk1": {
    title: "ÔN TẬP 15 PHÚT",
    api: "https://script.google.com/macros/s/AKfycbzs823Exjgop4XQHd90PVcjSMD3INg2j4V0Iy3uN0zAhZfvwHZIonpIEW0HdD8YOE4Y/exec",
    time: 900,
    mcqCount: 10,
    essayCount: 2
  },
  "1tiet-hk1": {
    title: "ÔN TẬP 1 TIẾT",
    api: "https://script.google.com/macros/s/AKfycbwOuqPMsL1VjVy78FpeTEAMaYjWMkp6UqTBe9KSjaqu-f16F8RyO5iNc3xYqluEB9LyyA/exec",
    time: 2700,
    mcqCount: 20,
    essayCount: 3
  },
  "hocky1": {
    title: "ÔN TẬP HỌC KỲ I",
    api: "https://script.google.com/macros/s/AKfycbxgznZnvG0OhZr7p8nFxLAdoXhKMYpZNISmRhAnONoIW3SxYwDDP65olJEB7jN_pCGu/exec",
    time: 2700,
    mcqCount: 20,
    essayCount: 3
  },
  "15phut-hk2": {
    title: "ÔN TẬP 15 PHÚT",
    api: "https://script.google.com/macros/s/AKfycbyZLxxsneEBeuNuAybHV4lT9vRXu2fhAusQKSA8pS2AAZLbo_wqFo1OC0DS-2kQRy0orw/exec",
    time: 900,
    mcqCount: 10,
    essayCount: 2
  },
  "1tiet-hk2": {
    title: "ÔN TẬP 1 TIẾT",
    api: "https://script.google.com/macros/s/AKfycbwdT_yb2wPsgGetQOcTkogPaVB3JQQ73AJijeVTGSQ6O-lX5m8weIqyl8ItL2yS519ukA/exec",
    time: 2700,
    mcqCount: 20,
    essayCount: 3
  },
  "hocky2": {
    title: "ÔN TẬP HỌC KỲ II",
    api: "https://script.google.com/macros/s/AKfycby6EZi44bGG2cQvR_YvdeuAIaKrit6u_KOjxLExzMbsjARTJ6mrZ1eqzQQqnzk_eEme/exec",
    time: 2700,
    mcqCount: 20,
    essayCount: 3
  },
};

// ====================== Âm thanh =========================
function playSoundSafe(audio) {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
  audio.play();
}

// ====================== KHỞI TẠO (gọi từ ngoài sau khi innerHTML) =========================
window.initQuiz = function (type) {
  window.examType = type;
  window.config = examConfig[type];

  if (!config) {
    console.error("initQuiz: exam type không hợp lệ:", type);
    return;
  }

  // reset state mỗi lần init (an toàn khi quay lại)
  resetQuizState();

  // Lấy DOM SAU KHI HTML đã inner vào container
  quizContent = document.getElementById("quiz-content");
  timeDisplay = document.getElementById("time");

  totalTime = config.time;

  // Bắt đầu lần đầu tải dữ liệu
  runOnce();
};

// ====================== RESET STATE (có thể gọi từ index trước khi unload) =========================
window.resetQuizState = function () {
  questions = [];
  essayQuestions = [];
  quizQuestions = [];
  essayQuizQuestions = [];
  current = 0;
  scoreChoice = 0;
  userAnswers = [];
  hasRun = false;
  if (globalTimer) {
    clearInterval(globalTimer);
    globalTimer = null;
  }
  // remove transient UI elements if any
  document.querySelectorAll(".firefly, .firework").forEach(el => el.remove());
};

// ====================== RUN ONCE (KHÔNG TỰ ĐỘNG GỌI ngoài initQuiz) =========================
function runOnce() {
  if (!hasRun) {
    loadData()
    .then(() => {
      if(questions.length<config.mcqCount||essayQuestions.length<config.essayCount) {
        error();
        return;
      }
      // hide/ show UI an toàn (kiểm tra tồn tại)
      document.getElementById("loading-box")?.classList?.add("hidden");
      document.getElementById("start-box")?.classList?.remove("hidden");
      document.querySelector(".title-quiz")?.textContent && (document.querySelector(".title-quiz").textContent = config.title);
      hasRun = true;
    })
    .catch((e) => {
      console.error("runOnce loadData error:", e);
    });
  }
}

// ====================== LOAD DATA =========================
async function loadData() {
  document.title = config.title;
  document.body.classList.add("overflow-hidden");
  try {
    const res = await fetch(config.api);
    const data = await res.json();
    questions = data.mcq || [];
    essayQuestions = data.essay || [];
  } catch (err) {
    console.error("Lỗi load JSON:", err);
    error();
    throw err;
  }
};

// ====================== TIỆN ÍCH =========================
function getRandomItems(arr, n) {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
}

function randomQuestion() {
  quizQuestions = getRandomItems(questions, config.mcqCount || 0);
  essayQuizQuestions = getRandomItems(essayQuestions, config.essayCount || 0);
}

// ====================== THỜI GIAN =========================
function formatTime(sec) {
  let m = Math.floor(sec / 60), s = sec % 60;
  return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
}

function startGlobalTimer() {
  if (!timeDisplay) return;
  if (globalTimer) clearInterval(globalTimer);
  timeDisplay.textContent = formatTime(totalTime);
  globalTimer = setInterval(() => {
    totalTime--;
    timeDisplay.textContent = formatTime(totalTime);
    if (totalTime <= 0) {
      clearInterval(globalTimer);
      autoSubmit();
    }
  }, 1000);
}

// ====================== HIỆU ỨNG NHẸ (không bắt buộc) =========================
function createFirefly(x, y) {
  const firefly = document.createElement("div");
  firefly.classList.add("firefly", "w-2", "h-2", "bg-yellow-400", "rounded-full", "absolute", "pointer-events-none");
  firefly.style.left = x + "px";
  firefly.style.top = y + "px";
  const dx = (Math.random() - 0.5) * 150;
  const dy = (Math.random() - 0.5) * 150;
  firefly.animate([{ transform: `translate(0,0)`, opacity: 1 }, { transform: `translate(${dx}px,${dy}px)`, opacity: 0 }], { duration: 2000 + Math.random() * 1000, easing: "ease-out" });
  document.body.appendChild(firefly);
  setTimeout(() => firefly.remove(), 1200);
}

function createFirework(x, y) {
  const particles = 16;
  const radius = 100;
  for (let i = 0; i < particles; i++) {
    const angle = (Math.PI * 2 * i) / particles;
    const fx = x + Math.cos(angle) * radius;
    const fy = y + Math.sin(angle) * radius;
    const spark = document.createElement("div");
    spark.classList.add("firework", "w-2", "h-2", "rounded-full", "absolute");
    spark.style.background = `hsl(${Math.random() * 360}, 90%, 60%)`;
    spark.style.left = x + "px";
    spark.style.top = y + "px";
    spark.animate([{ transform: `translate(0,0) scale(1)`, opacity: 1 }, { transform: `translate(${fx - x}px, ${fy - y}px) scale(0.3)`, opacity: 0 }], { duration: 400, easing: "ease-out" });
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 900);
    setTimeout(() => { createFirefly(fx, fy); createFirefly(fx, fy); }, 0);
  }
}

// ====================== TRẮC NGHIỆM =========================
function loadQuestion() {
  if (!quizContent) return;

  const q = quizQuestions[current];
  if (!q) {

    quizContent.innerHTML = `<p class="text-gray-500 text-center">Không có câu hỏi</p>`;
    return;
  }

  quizContent.innerHTML = `
    <h5 class="text-xl md:text-2xl font-bold text-gray-800 mb-4">Câu ${current + 1}: ${q.text}</h5>
    <div class="space-y-3">
      ${Object.entries(q.choices || {}).map(([k, v]) => `
        <div class="option text-base" data-key="${k}">
          <span class="option-circle ">${k}</span>
          <span class="option-text">${v}</span>
        </div>`).join("")}
    </div>
    <button class="skipBtn mt-4 w-full py-3 bg-gray-200 rounded-xl hover:bg-gray-300 font-bold transition">Câu tiếp theo</button>
  `;

  quizContent.querySelectorAll(".option").forEach(opt => {
    opt.addEventListener("mouseenter", () => {    
      playSoundSafe(hoverSound);
    });
    opt.addEventListener("click", () => {
      const selectedKey = opt.dataset.key;
      playSoundSafe(selectSound);
      handleAnswer(selectedKey);
    });
  });

  window.skipBtn = document.querySelector(".skipBtn");
  skipBtn?.addEventListener("click", () => {
    userAnswers.push({ question: q.text, selected: "Không trả lời", correct: q.correct });
    playSoundSafe(selectSound);
    handleAnswer();
  });
}

function handleAnswer(selectedKey) {
  const q = quizQuestions[current];
  if (!q) return;

  userAnswers.push({ question: q.text, selected: selectedKey, correct: q.correct });

  const allChoices = document.querySelectorAll(".option");
  allChoices.forEach(btn => {
    btn.style.pointerEvents = "none";
    if (btn.dataset.key === q.correct) btn.classList.add("correct");
    else if (btn.dataset.key === selectedKey) btn.classList.add("wrong");
  });

  const correctEl = [...allChoices].find(btn => btn.dataset.key === q.correct);
  if (selectedKey === q.correct) {
    scoreChoice++;
    if (correctEl) {
      const rect = correctEl.getBoundingClientRect();
      createFirework(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    playSoundSafe(correctSound);
  } else playSoundSafe(wrongSound);
  lockSkip();
  setTimeout(() => nextQuestion(), 1500);
}

function nextQuestion() {
  current++;
  if (current < quizQuestions.length) loadQuestion();
  else showEssayPart();
}

// ====================== TỰ LUẬN =========================
function showEssayPart() {

  let html = "";
  essayQuizQuestions.forEach((q, i) => {
    html += `<h5 class="mt-3 text-lg font-semibold">${i + 1}. ${q.text}</h5>
      <textarea id="essay${i}" class="w-full p-3 border border-gray-300 rounded-xl mt-2" rows="4" placeholder="Nhập câu trả lời của bạn..."></textarea>`;
  });

  quizContent.innerHTML = `${html}<button id="submitEssay" class="mt-4 w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition">Nộp bài</button>`;
  document.getElementById("submitEssay")?.addEventListener("click", checkEssay);
}

function checkEssay() {
  document.querySelector(".section-title")?.classList?.add("hidden");
  document.querySelector(".header-quiz")?.classList?.add("hidden");
  document.querySelector(".digital-clock")?.classList?.add("hidden");

  let totalEssayScore = 0;
  essayQuizQuestions.forEach((q, i) => {
    const ansRaw = document.getElementById(`essay${i}`)?.value || "";
    const ans = ansRaw.toLowerCase();
    let score = 0;
    (q.keywords || []).forEach(item => {
      const keyLower = (item.word || []).map(w => w.toLowerCase());
      if (keyLower.every(w => ans.includes(w))) score += (5.0 / (config.essayCount || 1) / (q.keywords.length || 1));
    });
    totalEssayScore += score;
  });

  const avgEssayScore = totalEssayScore.toFixed(2);
  const avgMcqScore = ((scoreChoice / (quizQuestions.length || 1)) * 5).toFixed(2);

  showResults(avgMcqScore, avgEssayScore, (parseFloat(avgMcqScore) + parseFloat(avgEssayScore)).toFixed(2));
}

// ====================== AUTO SUBMIT =========================
function autoSubmit() {
  if (globalTimer) { clearInterval(globalTimer); globalTimer = null; }
  for (let i = current; i < (quizQuestions.length || 0); i++) {
    userAnswers.push({ question: quizQuestions[i].text, selected: "Không trả lời", correct: quizQuestions[i].correct });
  }
  checkEssay();
}

// ====================== KẾT QUẢ =========================
function showResults(choiceScore, essayScore, total) {
  document.querySelector(".title-quiz")?.classList?.add("hidden");
  document.querySelector(".section-title")?.classList?.add("hidden");
  document.querySelector(".timer")?.classList?.add("hidden");

  let mcqReview = (quizQuestions || []).map((q, i) => {
    const ua = userAnswers[i];
    const selected = ua ? ua.selected : null;
    const selectedText = selected && selected !== "Không trả lời" ? q.choices[selected] : (selected === "Không trả lời" ? "Không trả lời" : "Chưa trả lời");
    const correctText = q.choices[q.correct];
    let statusClass = "text-gray-500";
    if (selected === q.correct) statusClass = "text-green-600 font-bold";
    else if (selected === "Không trả lời") statusClass = "text-gray-400";
    else statusClass = "text-red-600 font-bold";

    return `<div class="p-3 mb-3 border rounded-xl bg-gray-50">
      <p><strong>Câu ${i + 1}. ${q.text}</strong></p>
      <p>Đáp án của bạn: <span class="${statusClass}">${selectedText}</span></p>
      <p>Đáp án đúng: <strong class="text-green-700">${correctText}</strong></p>
    </div>`;
  }).join("");

  const essayReview = (essayQuizQuestions || []).map((q, i) => {
    const ans = document.getElementById(`essay${i}`)?.value || "Không trả lời";
    return `<div class="p-3 mb-3 border rounded-xl bg-gray-50">
      <div><strong>Câu ${i + 1}. ${q.text}</strong><br><span class="text-green-600">${(q.sample || "").replace(/\n/g, "<br>")}</span></div>
      <div><strong>Câu trả lời của bạn:</strong><br><span>${ans}</span></div>
    </div>`;
  }).join("");

  quizContent.innerHTML = `
    <h1 class="text-3xl text-center text-green-600 mb-3 font-bold">Hoàn thành bài kiểm tra!</h1>
    <p class="text-center text-lg">Điểm trắc nghiệm: ${choiceScore}/5</p>
    <p class="text-center text-lg">Điểm tự luận: ${essayScore}/5</p>
    <hr class="my-4">
    <p class="text-center text-xl font-bold text-red-600">Tổng điểm: ${total}/10</p>
    <h4 class="mt-4 text-lg font-semibold">Xem lại phần trắc nghiệm:</h4>
    ${mcqReview}
    <h4 class="mt-4 text-lg font-semibold">Xem lại phần tự luận:</h4>
    ${essayReview}
    <div class="text-center mt-3">
      <button class="py-2 px-6 bg-gray-400 text-white rounded-xl hover:bg-gray-500 transition" onclick="startQuiz()">Làm lại</button>
    </div>
  `;

  // Send data safely (non-blocking)
  try { sendData(localStorage.username, total); } catch (e) { /* ignore */ }
  winSound && winSound.play();
}

// ====================== START QUIZ =========================
function startQuiz() {
  document.getElementById("start-box")?.classList?.add("hidden");
  document.querySelector(".quiz-box")?.classList?.remove("hidden");
  document.querySelector(".digital-clock")?.classList?.remove("hidden");
  document.querySelector(".section-title")?.classList?.remove("hidden");
  document.querySelector(".header-quiz")?.classList?.remove("hidden");
  totalTime = config.time || totalTime;
  randomQuestion();
  current = 0;
  scoreChoice = 0;
  userAnswers = [];
  loadQuestion();
  startGlobalTimer();
}

// ====================== SEND DATA =========================
async function sendData(username, value) {
  const data = { user: username, value: value };
  const API_URL = "https://script.google.com/macros/s/AKfycbxi7H5MhkxM478EnIX-shg1NMxg4ljIyCcokmODv55zBnNLyTBtkKTGG-brJcSmf5Q/exec";
  try {
    await fetch(API_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });
  } catch (e) { /* ignore errors from no-cors */ }
}

function lockSkip(ms = 1500) {
  skipBtn.classList.add('pointer-events-none', 'opacity-50');

  setTimeout(() => {
    skipBtn.classList.remove('pointer-events-none', 'opacity-50');
  }, ms);
}
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
