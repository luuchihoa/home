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
window.switchTabOnProfile = function switchTabOnProfile(tab) {
  const tabProfile = document.getElementById('tabProfile');
  const tabAchievement = document.getElementById('tabAchievement');

  // reset style
  [tabProfile, tabAchievement].forEach(btn => {
    btn.classList.remove('bg-white', 'text-orange-600', 'shadow');
    btn.classList.add('text-gray-500');
  });

  if (tab === 'profile') {
    tabProfile.classList.add('bg-white', 'text-orange-600', 'shadow');
    document.getElementById('profile')?.classList?.remove("hidden");
    document.getElementById('achievement')?.classList?.add("hidden");
  }

  if (tab === 'achievement') {
    tabAchievement.classList.add('bg-white', 'text-orange-600', 'shadow');
    document.getElementById('profile')?.classList?.add("hidden");
    document.getElementById('achievement')?.classList?.remove("hidden");
  }
};
window.openDetail = function (name) {
  // Ẩn tất cả page
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  if (name === 'Khối Kinh Thánh') {
    loadPage('kinhthanh', './kinhthanh/kinhthanh.html');
    document.getElementById('kinhthanh').classList.add('active');
  } else if (name === 'Khối Phụng Vụ') {
    loadPage('phungvu', './phungvu/phungvu.html');
    document.getElementById('phungvu').classList.add('active');
  } else if (name === 'Khối Thêm Sức') {
    loadPage('themsuc', './themsuc/themsuc.html');
    document.getElementById('themsuc').classList.add('active');
  }
};

window.toggleModal = function (show) {
  message.textContent = "";
  const m = document.getElementById('modal');
  if (show) {
    document.getElementById("modal").addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault(); // tránh submit ngầm
        login();
      }
    });

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
  isUserModalOpen = true;
  const m = document.getElementById('modal-user');
  if (!m) return;

  if (show) {
    isSaveHidden = true;
    m.classList.add('show');
    m.removeAttribute('inert');
    m.setAttribute('aria-hidden', 'false');
    lockBodyScroll();

    setTimeout(() => {
      const focusTarget =
        m.querySelector('button, [tabindex], input, select');
      focusTarget?.focus();
    }, 50);

  } else {
    isUserModalOpen = false;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if(!isSaveHidden){
      // mở confirm box
      openExitModal();
    }
    else {
      // sau đó mới đóng modal m
      m.classList.remove("show");
      m.setAttribute('inert', '');
      m.setAttribute('aria-hidden', 'true');
      unlockBodyScroll();
    }
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
    toggleModal(false);
  }
});

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

(function autoBackground() {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const today = new Date();

  const backgrounds = [
    {
      name: "noel",
      from: "12-1",
      to:   "1-15",
      pc:   "./photo/background/chrismax_pc.jpg",
      mobile: "./photo/background/chrismax_mobile.jpg"
    },
    {
      name: "phucsinh",
      from: "03-22",
      to:   "04-30",
      pc:   "./photo/background/phucsinh_pc.jpg",
      mobile: "./photo/background/phucsinh_mobile.jpg"
    }
  ];

  function inRange(from, to) {
    const year = today.getFullYear();
    const start = new Date(`${year}-${from}`);
    const end   = new Date(`${year}-${to}`);
    return today >= start && today <= end;
  }

  let bg = null;
  for (const b of backgrounds) {
    if (inRange(b.from, b.to)) {
      bg = isMobile ? b.mobile : b.pc;
      break;
    }
  }

  if (!bg) {
    bg = isMobile
      ? "./photo/background/bg_mobile.jpg"
      : "./photo/background/bg_pc.jpg";
  }

  document.body.style.background = `
    linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.25)),
    url('${bg}') center / cover no-repeat fixed
  `;
})();

window.setProfileDefaut = function() {
  document.getElementById("hoTenText").textContent = localStorage.hoTen;
  document.getElementById("tenThanhText").textContent = localStorage.tenThanh;
  document.getElementById("ngaySinhText").textContent = (localStorage.ngaySinh);
  document.getElementById("ngayRuaToiText").textContent = (localStorage.ngayRuaToi);
  document.getElementById("ngayThemSucText").textContent = (localStorage.ngayThemSuc);
  document.getElementById("ngayRuocLeText").textContent = (localStorage.ngayRuocLe);
  document.getElementById("tenChaText").textContent = localStorage.tenCha;
  document.getElementById("tenMeText").textContent = localStorage.tenMe;
  document.getElementById("sdtText").textContent = localStorage.sdt;
  document.getElementById("giaoXomText").textContent = localStorage.giaoXom;
  document.getElementById("gioiTinhText").textContent = localStorage.gioiTinh;
  document.getElementById("usernameText").textContent = localStorage.username;
  document.getElementById("avatarImg").src = localStorage.avatar;
}
if(localStorage.getItem('username')){
  setProfileDefaut();
  updateLoginTab();
}
function loadPage(id, file, callback) {
  fetch(file)
    .then(res => res.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;
      
      // chạy callback nếu có
      if (typeof callback === "function") {
        callback();
      }
    });
}

function lockBodyScroll() {
  document.body.classList.add("overflow-hidden");
}

function unlockBodyScroll() {
  document.body.classList.remove("overflow-hidden");
}
