function loadPage(id, file) {
  fetch(file)
    .then(res => res.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;
    });
}

window.openPVDetail = function (name) {
  // Ẩn tất cả page
  document
    .querySelectorAll('.subpage')
    .forEach(p => p.classList.remove('active'));

  if (name === '15 Phút') {
    window.location.href = './test/index.html?type=15phut';
  } else if (name === '1 Tiết') {
    window.location.href = './test/index.html?type=1tiet';
  } else if (name === 'Kỳ I') {
    window.location.href = './test/index.html?type=hocky1';
  }
};
