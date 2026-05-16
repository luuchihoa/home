
// ======================== LOAD QUIZ PAGE =========================
function loadQuizPage(type) {
  const pageName = type === 'dovui' ? 'dovui' : 'test';
  // if (type === 'dovui') {
  //   pageName = 'dovui';
  // } else pageName = 'test';
  const container = document.getElementById("quiz-root");
  window.stopTimer=null;

  // Clear DOM cũ
  container.innerHTML = "";

  // Load HTML mới
  fetch(`./${pageName}/index.html`)
      .then(res => res.text())
      .then(html => {
          container.innerHTML = html;

          loadQuizCSS(`./${pageName}/style.css`); // ⬅️ load CSS
          // Load script quiz
          loadQuizScript(pageName,() => {
              if (typeof window.initQuiz === "function") {
                  window.initQuiz(type);
              } else {
                  console.error("initQuiz() NOT FOUND!");
              }
          });
      })
      .catch(err => console.error("Load HTML error:", err));
  console.log(pageName);
}

// ======================== LOAD SCRIPT =========================
function loadQuizScript(pageName, callback) {
    const s = document.createElement("script");
    s.src = `./${pageName}/script.js?t=` + Date.now(); // chống cache
    s.dataset.dynamic = "quiz";
    s.onload = callback;
    s.onerror = () => console.error("Không load được script.js");
    document.body.appendChild(s);
}

// ======================== UNLOAD SCRIPT =========================
function unloadQuizScript() {
  document.querySelectorAll("script[data-dynamic=quiz]").forEach(s => s.remove());
}
// ======================== load css =========================
function loadQuizCSS(src, data = 'quiz') {
    if (document.querySelector(`link[data-dynamic='${data}']`)) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = src;
    link.dataset.dynamic = "quiz";
    document.head.appendChild(link);
}
window.loadQuizCSS = loadQuizCSS;
// ======================== Unload css =========================
function unloadQuizCSS(data='quiz') {
    document.querySelectorAll(`link[data-dynamic='${data}']`).forEach(l => l.remove());
}
window.unloadQuizCSS = unloadQuizCSS;

window.openPVDetail = function (name) {
  document.getElementById('app')?.classList?.add('hidden');
  unloadQuizCSS();
  if (name === '15 Phút - HK1') {
    loadQuizPage('15phut-hk1');
  } else if (name === '1 Tiết - HK1') {
    loadQuizPage('1tiet-hk1');
  } else if (name === 'Kỳ I') {
    loadQuizPage('hocky1');
  } else if (name === 'Đố Vui') {
    loadQuizPage('dovui');
  } else if (name === '15 Phút - HK2') {
    loadQuizPage('15phut-hk2');
  } else if (name === '1 Tiết - HK2') {
    loadQuizPage('1tiet-hk2');
  } else if (name === 'Kỳ II') {
    loadQuizPage('hocky2');
  }
};
// Lưu các script đã load
window.loadedScripts = new Set();

window.loadScript = function(src, callback) {
  if (window.loadedScripts.has(src)) {
    callback?.();
    return;
  }

  const s = document.createElement("script");
  s.src = src;
  s.dataset.dynamic = 'quiz';   // 🔥 đánh dấu script thuộc page nào
  s.onload = callback;
  document.body.appendChild(s);

  window.loadedScripts.add(src);
}

// Load Style.css
loadQuizCSS('style.css');
