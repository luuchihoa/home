// ======================== BASE PATH (GitHub Pages SAFE) ========================
const BASE_PATH = location.pathname.replace(/\/[^/]*$/, '');
// VD:
// local:      /index.html        -> ""
// github:     /phungvu/index.html -> /phungvu

// ======================== LOAD HTML CHUNG ========================
function loadPage(id, file, callback) {
  fetch(file)
    .then(res => {
      if (!res.ok) throw new Error(res.status);
      return res.text();
    })
    .then(html => {
      document.getElementById(id).innerHTML = html;
      callback?.();
    })
    .catch(err => console.error("Load page error:", err));
}
window.loadPage = loadPage;

// ======================== LOAD QUIZ PAGE ========================
function loadQuizPage(type) {
  const pageName = type; // dùng trực tiếp tên folder
  const container = document.getElementById("quiz-root");

  if (!container) {
    console.error("#quiz-root NOT FOUND");
    return;
  }

  window.stopTimer = null;

  // clear cũ
  container.innerHTML = "";
  unloadQuizCSS();
  unloadQuizScript();

  const htmlPath = `${BASE_PATH}/${pageName}/index.html`;
  const cssPath  = `${BASE_PATH}/${pageName}/style.css`;
  const jsPath   = `${BASE_PATH}/${pageName}/script.js`;

  fetch(htmlPath)
    .then(res => {
      if (!res.ok) throw new Error(res.status);
      return res.text();
    })
    .then(html => {
      container.innerHTML = html;

      // load CSS
      loadQuizCSS(cssPath);

      // load JS
      loadQuizScript(jsPath, () => {
        if (typeof window.initQuiz === "function") {
          window.initQuiz(type);
        } else {
          console.error("❌ initQuiz() NOT FOUND in", jsPath);
        }
      });
    })
    .catch(err => console.error("Load quiz error:", err));
}
window.loadQuizPage = loadQuizPage;

// ======================== LOAD SCRIPT ========================
function loadQuizScript(src, callback) {
  const s = document.createElement("script");
  s.src = src + "?t=" + Date.now(); // chống cache
  s.dataset.dynamic = "quiz";
  s.onload = callback;
  s.onerror = () => console.error("❌ Cannot load script:", src);
  document.body.appendChild(s);
}

// ======================== UNLOAD SCRIPT ========================
function unloadQuizScript() {
  document
    .querySelectorAll("script[data-dynamic='quiz']")
    .forEach(s => s.remove());
}

// ======================== LOAD CSS ========================
function loadQuizCSS(src, key = "quiz") {
  if (document.querySelector(`link[data-dynamic='${key}']`)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = src + "?t=" + Date.now();
  link.dataset.dynamic = key;
  document.head.appendChild(link);
}
window.loadQuizCSS = loadQuizCSS;

// ======================== UNLOAD CSS ========================
function unloadQuizCSS(key = "quiz") {
  document
    .querySelectorAll(`link[data-dynamic='${key}']`)
    .forEach(l => l.remove());
}
window.unloadQuizCSS = unloadQuizCSS;

// ======================== OPEN QUIZ ========================
window.openPVDetail = function (name) {
  document.getElementById("app").style.display = "none";

  const map = {
    "15 Phút - HK1": "15phut-hk1",
    "1 Tiết - HK1": "1tiet-hk1",
    "Kỳ I": "hocky1",
    "Đố Vui": "dovui",
    "15 Phút - HK2": "15phut-hk2",
    "1 Tiết - HK2": "1tiet-hk2",
    "Kỳ II": "hocky2",
  };

  const page = map[name];
  if (!page) {
    console.error("❌ Quiz not found:", name);
    return;
  }

  loadQuizPage(page);
};

// ======================== LOAD GLOBAL STYLE ========================
loadQuizCSS(`${BASE_PATH}/style.css`, "global");
