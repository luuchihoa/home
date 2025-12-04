// ====================== ÂM THANH =========================
const winSound = new Audio('../sound/win.mp3');
const selectSound = new Audio('../sound/click.mp3');
const hoverSound = new Audio('../sound/hover.mp3');
const wrongSound = new Audio('../sound/buzzer.mp3');
const correctSound = new Audio('../sound/ding.mp3');

winSound.volume = 0.35;
selectSound.volume = 0.4;
wrongSound.volume = 0.4;

// ====================== DỮ LIỆU TỪ JSON =========================
let questions = [];
let essayQuestions = [];

// ====================== BIẾN =========================
let current = 0,
  scoreChoice = 0,
  totalTime = 45 * 60,
  globalTimer,
  userAnswers = [];

const quizContent = document.getElementById('quiz-content');
const timeDisplay = document.getElementById('time');

let quizQuestions = [];
let essayQuizQuestions = [];

const examConfig = {
  '15phut': {
    title: ' ÔN TẬP 15 PHÚT',
    api: 'https://script.google.com/macros/s/AKfycbzs823Exjgop4XQHd90PVcjSMD3INg2j4V0Iy3uN0zAhZfvwHZIonpIEW0HdD8YOE4Y/exec',
    time: 15 * 60,
  },
  '1tiet': {
    title: ' ÔN TẬP 1 TIẾT',
    api: 'https://script.google.com/macros/s/AKfycbwOuqPMsL1VjVy78FpeTEAMaYjWMkp6UqTBe9KSjaqu-f16F8RyO5iNc3xYqluEB9LyyA/exec',
    time: 45 * 60,
  },
  hocky1: {
    title: ' ÔN TẬP HỌC KỲ I',
    api: 'https://script.google.com/macros/s/AKfycbxgznZnvG0OhZr7p8nFxLAdoXhKMYpZNISmRhAnONoIW3SxYwDDP65olJEB7jN_pCGu/exec',
    time: 45 * 60,
  },
};

// ====================== Lấy loại bài từ URL =========================
function getExamType() {
  const params = new URLSearchParams(window.location.search);
  return params.get('type'); // ví dụ -> "1tiet"
}
const examType = getExamType();
// ====================== HÀM LOAD JSON =========================
window.loadData = async function () {
  document.querySelector('.header-text').style.display = 'block';

  const config = examConfig[examType];

  // Nếu không có type → báo lỗi
  if (!config) {
    document.querySelector('.title-quiz').textContent =
      'Không xác định loại bài thi!';
    return;
  }

  // Đặt tiêu đề bài thi
  document.querySelector('.title-quiz').textContent = config.title;

  // Đặt thời gian
  totalTime = config.time;

  try {
    const res = await fetch(config.api);
    const data = await res.json();
    questions = data.mcq;
    essayQuestions = data.essay;
  } catch (err) {
    console.error('Lỗi load JSON:', err);
    quizContent.innerHTML = `<p class="text-red-500 text-center">Không thể tải dữ liệu câu hỏi!</p>`;
  }
};
function randomQuestion() {
  quizQuestions = getRandomItems(questions, 2);
  essayQuizQuestions = getRandomItems(essayQuestions, 2);
}
// ====================== ĐỒNG HỒ =========================
function formatTime(sec) {
  let m = Math.floor(sec / 60),
    s = sec % 60;
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

function startGlobalTimer() {
  clearInterval(globalTimer);
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

// ====================== RANDOM =========================
function getRandomItems(arr, n) {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
}

// ====================== HIỆU ỨNG =========================
function createFirefly(x, y) {
  const firefly = document.createElement('div');
  firefly.classList.add(
    'firefly',
    'w-2',
    'h-2',
    'bg-yellow-400',
    'rounded-full',
    'absolute',
    'pointer-events-none'
  );
  firefly.style.left = x + 'px';
  firefly.style.top = y + 'px';

  const dx = (Math.random() - 0.5) * 150;
  const dy = (Math.random() - 0.5) * 150;

  firefly.animate(
    [
      { transform: `translate(0,0)`, opacity: 1 },
      { transform: `translate(${dx}px,${dy}px)`, opacity: 0 },
    ],
    { duration: 2000 + Math.random() * 1000, easing: 'ease-out' }
  );

  document.body.appendChild(firefly);
  setTimeout(() => firefly.remove(), 1200);
}

// ====================== PHÁO HOA =========================
function createFirework(x, y) {
  const particles = 16;
  const radius = 100;

  for (let i = 0; i < particles; i++) {
    const angle = (Math.PI * 2 * i) / particles;
    const fx = x + Math.cos(angle) * radius;
    const fy = y + Math.sin(angle) * radius;

    const spark = document.createElement('div');
    spark.classList.add('firework', 'w-2', 'h-2', 'rounded-full', 'absolute');
    spark.style.background = `hsl(${Math.random() * 360}, 90%, 60%)`;
    spark.style.left = x + 'px';
    spark.style.top = y + 'px';

    spark.animate(
      [
        { transform: `translate(0,0) scale(1)`, opacity: 1 },
        {
          transform: `translate(${fx - x}px, ${fy - y}px) scale(0.3)`,
          opacity: 0,
        },
      ],
      { duration: 400, easing: 'ease-out' }
    );

    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 900);
    setTimeout(() => {
      createFirefly(fx, fy);
      createFirefly(fx, fy);
    }, 0);
  }
}

// ====================== LOAD TRẮC NGHIỆM =========================
function loadQuestion() {
  const title = document.querySelector('.section-title');
  title.textContent = 'PHẦN I: TRẮC NGHIỆM';
  title.style.display = 'block';
  const q = quizQuestions[current];

  quizContent.innerHTML = `
    <h5 class="text-xl md:text-2xl font-bold text-gray-800 mb-4">Câu ${
      current + 1
    }: ${q.text}</h5>
    <div class="space-y-3">
      ${Object.entries(q.choices)
        .map(
          ([k, v]) => `
          <div class="option flex items-center p-3 rounded-xl border border-gray-300 cursor-pointer hover:scale-105 hover:bg-gradient-to-r hover:from-red-400 hover:to-yellow-400 transition" data-key="${k}">
            <span class="w-6 h-6 flex items-center justify-center rounded-full border border-gray-500 mr-3 font-bold">${k}</span>
            <span class="option-text">${v}</span>
          </div>`
        )
        .join('')}
    </div>
    <button id="skipBtn" class="mt-4 w-full py-3 bg-gray-200 rounded-xl hover:bg-gray-300 font-bold transition">Câu tiếp theo</button>
  `;

  document.querySelectorAll('.option').forEach(opt => {
    opt.addEventListener('mouseenter', () => {
      hoverSound.currentTime = 0;
      hoverSound.play();
    });

    opt.addEventListener('click', () => {
      const selectedKey = opt.dataset.key;
      selectSound.currentTime = 0;
      selectSound.play();
      handleAnswer(selectedKey);
    });
  });

  document.getElementById('skipBtn').addEventListener('click', () => {
    userAnswers.push({
      question: q.text,
      selected: 'Không trả lời',
      correct: q.correct,
    });
    selectSound.currentTime = 0;
    selectSound.play();
    nextQuestion();
  });
}
// ====================== Handle Answer =========================
function handleAnswer(selectedKey) {
  const q = quizQuestions[current];
  userAnswers.push({
    question: q.text,
    selected: selectedKey,
    correct: q.correct,
  });

  const allChoices = document.querySelectorAll('.option');
  allChoices.forEach(btn => {
    btn.style.pointerEvents = 'none';
    if (btn.dataset.key === q.correct)
      btn.classList.add('border-green-500', 'bg-green-200');
    else if (btn.dataset.key === selectedKey)
      btn.classList.add('border-red-500', 'bg-red-200');
  });

  const correctEl = [...allChoices].find(btn => btn.dataset.key === q.correct);
  if (selectedKey === q.correct) {
    scoreChoice++;
    const rect = correctEl.getBoundingClientRect();
    createFirework(rect.left + rect.width / 2, rect.top + rect.height / 2);
    correctSound.play();
  } else wrongSound.play();

  // Chuyển câu sau 1.5s
  setTimeout(() => {
    nextQuestion();
  }, 1500);
}

// ====================== NEXT QUESTION =========================
function nextQuestion() {
  current++; // tăng current trước

  if (current < quizQuestions.length) {
    loadQuestion(); // vẫn còn câu trắc nghiệm
  } else {
    showEssayPart(); // hết trắc nghiệm → chuyển sang tự luận
  }
}

// ====================== PHẦN TỰ LUẬN =========================
function showEssayPart() {
  const title = document.querySelector('.section-title');
  title.textContent = 'PHẦN II: TỰ LUẬN';
  title.style.display = 'block';

  let html = '';
  essayQuizQuestions.forEach((q, i) => {
    html += `
      <h5 class="mt-3 text-lg font-semibold">${i + 1}. ${q.text}</h5>
      <textarea id="essay${i}" class="w-full p-3 border border-gray-300 rounded-xl mt-2" rows="4" placeholder="Nhập câu trả lời của bạn..."></textarea>`;
  });

  quizContent.innerHTML = `${html}<button id="submitEssay" class="mt-4 w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition">Nộp bài</button>`;

  document.getElementById('submitEssay').addEventListener('click', checkEssay);
}

// ====================== CHẤM TỰ LUẬN =========================
function checkEssay() {
  document.querySelector('.section-title').style.display = 'none';
  document.querySelector('.header-text').style.display = 'none';

  let totalEssayScore = 0;

  essayQuizQuestions.forEach((q, i) => {
    const ansRaw = document.getElementById(`essay${i}`)?.value || '';
    const ans = ansRaw.toLowerCase();
    let score = 0;

    q.keywords.forEach(item => {
      const keyLower = item.word.map(w => w.toLowerCase());
      if (keyLower.every(w => ans.includes(w))) score += item.point;
    });
    if (score > 2.5) score = 2.5;
    totalEssayScore += score;
  });

  const avgEssayScore = totalEssayScore.toFixed(2);
  const choiceScoreFixed = ((scoreChoice / quizQuestions.length) * 5).toFixed(
    2
  );

  showResults(
    choiceScoreFixed,
    avgEssayScore,
    (parseFloat(choiceScoreFixed) + parseFloat(avgEssayScore)).toFixed(1)
  );
}

// ====================== AUTO SUBMIT =========================
function autoSubmit() {
  clearInterval(globalTimer);
  for (let i = current; i < quizQuestions.length; i++) {
    userAnswers.push({
      question: quizQuestions[i].text,
      selected: 'Không trả lời',
      correct: quizQuestions[i].correct,
    });
  }
  checkEssay();
}

// ====================== HIỂN THỊ KẾT QUẢ =========================
function showResults(choiceScore, essayScore, total) {
  const titleQuizEl = document.querySelector('.title-quiz');
  if (titleQuizEl) titleQuizEl.style.display = 'none';

  const sectionTitleEl = document.querySelector('.section-title');
  if (sectionTitleEl) sectionTitleEl.style.display = 'none';

  const timerEl = document.querySelector('.timer');
  if (timerEl) timerEl.style.display = 'none';

  let mcqReview = quizQuestions
    .map((q, i) => {
      const ua = userAnswers[i];
      const selected = ua ? ua.selected : null;
      const selectedText =
        selected && selected !== 'Không trả lời'
          ? q.choices[selected]
          : selected === 'Không trả lời'
          ? 'Không trả lời'
          : 'Chưa trả lời';
      const correctText = q.choices[q.correct];

      let statusClass = 'text-gray-500';
      if (selected === q.correct) statusClass = 'text-green-600 font-bold';
      else if (selected === 'Không trả lời') statusClass = 'text-gray-400';
      else statusClass = 'text-red-600 font-bold';

      return `
      <div class="p-3 mb-3 border rounded-xl bg-gray-50">
        <p><strong>Câu ${i + 1}. ${q.text}</strong></p>
        <p>Đáp án của bạn: <span class="${statusClass}">${selectedText}</span></p>
        <p>Đáp án đúng: <strong class="text-green-700">${correctText}</strong></p>
      </div>`;
    })
    .join('');

  const essayReview = essayQuizQuestions
    .map((q, i) => {
      const ans =
        document.getElementById(`essay${i}`)?.value || 'Không trả lời';
      return `
      <div class="p-3 mb-3 border rounded-xl bg-gray-50">
        <div><strong>Câu ${i + 1}. ${
        q.text
      }</strong><br><span class="text-green-600">${q.sample.replace(
        /\n/g,
        '<br>'
      )}</span></div>
        <div><strong>Câu trả lời của bạn:</strong><br><span>${ans}</span></div>
      </div>
    `;
    })
    .join('');

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

  sendData(localStorage.username, total);
  winSound.play();
}

// ====================== START QUIZ =========================
function startQuiz() {
  // Ẩn box start
  document.getElementById('start-box').style.display = 'none';
  // Hiển thị quiz
  document.querySelector('.quiz-box').style.display = 'block';
  randomQuestion();
  current = 0;
  scoreChoice = 0;
  userAnswers = [];
  loadQuestion();
  startGlobalTimer();
}
window.startQuiz = startQuiz;
// ====================== Nạp dữ liệu lên Sheet =========================
async function sendData(username, value) {
  const data = { user: username, value: value };
  const API_URL =
    'https://script.google.com/macros/s/AKfycbxi7H5MhkxM478EnIX-shg1NMxg4ljIyCcokmODv55zBnNLyTBtkKTGG-brJcSmf5Q/exec';
  await fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify(data),
  });
}

// ====================== Nút đóng =========================
window.closeQuiz = function () {
  window.location.assign('index.html');
};

// ====================== BẮT ĐẦU =========================
let hasRun = false;
function runOnce() {
  if (!hasRun) {
    loadData().then(() => {
      document.getElementById('loading-box').style.display = 'none'; // ẩn loading
      document.getElementById('start-box').style.display = 'flex'; // hiện box bắt đầu
    });
    hasRun = true;
  }
}
runOnce();
