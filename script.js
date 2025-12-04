window.switchTab = function (e) {
  const btn = e.currentTarget;
  const target = btn.dataset.target;
  if (!target) return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(target);
  if (el) el.classList.add('active');

  document
    .querySelectorAll('.tab-item')
    .forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
};
function loadPage(id, file) {
  fetch(file)
    .then(res => res.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;
    });
}

window.openDetail = function (name) {
  // Ẩn tất cả page
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  if (name === 'Khối Kinh Thánh') {
    loadPage('kinhthanh', 'kinhthanh/kinhthanh.html');
    document.getElementById('kinhthanh').classList.add('active');
  } else if (name === 'Khối Phụng Vụ') {
    loadPage('phungvu', 'phungvu/phungvu.html');
    document.getElementById('phungvu').classList.add('active');
  } else if (name === 'Khối Thêm Sức') {
    loadPage('themsuc', 'themsuc/themsuc.html');
    document.getElementById('themsuc').classList.add('active');
  }
};

window.toggleModal = function (show) {
  const m = document.getElementById('modal');
  if (show) {
    m.classList.add('show');
    m.setAttribute('aria-hidden', 'false');
    setTimeout(() => document.getElementById('username').focus(), 80);
  } else {
    document.activeElement.blur();
    m.classList.remove('show');
    m.setAttribute('aria-hidden', 'true');
  }
};
window.toggleUserModal = function (show) {
  const m = document.getElementById('modal-user');

  if (show) {
    m.classList.add('show');
    m.removeAttribute('inert');
    m.setAttribute('aria-hidden', 'false');

    // Hiển thị thông tin người dùng
    const fullname = localStorage.getItem('fullname') || 'Người dùng';
    const username = localStorage.getItem('username') || '';
    document.getElementById(
      'user-fullname'
    ).textContent = `Họ và tên: ${fullname}`;
    document.getElementById(
      'user-username'
    ).textContent = `Tên đăng nhập: ${username}`;

    // focus an toàn
    setTimeout(() => document.querySelector('#modal-user .btn')?.focus(), 80);
  } else {
    // Blur focus trước khi ẩn
    document.activeElement.blur();

    m.classList.remove('show');
    m.setAttribute('inert', '');
    m.setAttribute('aria-hidden', 'true');
  }
};

function setTheme(cls) {
  document.body.className = cls || '';
  localStorage.setItem('demo-theme', cls || '');
}
window.setTheme = setTheme;

function setFont(level) {
  let size = 16;
  if (level === 'small') size = 14;
  if (level === 'medium') size = 16;
  if (level === 'large') size = 20;

  localStorage.setItem('font-size', size);
  applyFont();
}
window.setFont = setFont;

function applyFont() {
  const size = parseInt(localStorage.getItem('font-size') || 16);
  document.body.style.fontSize = size + 'px';
  document.querySelectorAll('h1,h2,h3').forEach(el => {
    el.style.fontSize = size + 6 + 'px';
  });
  document.querySelectorAll('input, button, .tab-item').forEach(el => {
    el.style.fontSize = size + 'px';
  });
}

function autoFont() {
  const width = window.innerWidth;
  let base = width < 480 ? 15 : width < 900 ? 16 : 18;
  localStorage.setItem('font-size', base);
  applyFont();
}
window.autoFont = autoFont;
applyFont();

const modals = [
  { id: 'modal', toggle: toggleModal },
  { id: 'modal-user', toggle: toggleUserModal },
];

modals.forEach(({ id, toggle }) => {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener('click', e => {
    if (e.target.id === id) {
      toggle(false);
    }
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    toggleUserModal(false);
    toggleModal(false);
  }
});

(function () {
  const saved = localStorage.getItem('demo-theme') || '';
  if (saved) setTheme(saved);
  const savedName = localStorage.getItem('fullname');

  updateLoginTab(savedName);
})();
let lastScrollY = 0;
const tabbar = document.querySelector('.tabbar');

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;

  if (currentScroll > lastScrollY) {
    // Cuộn xuống => Ẩn tabbar
    tabbar.classList.add('hide');
  } else {
    // Cuộn lên => Hiện tabbar
    tabbar.classList.remove('hide');
  }

  lastScrollY = currentScroll;
});

