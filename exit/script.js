// ====================== NÚT THOÁT =========================
window.isSaveHidden = true;
window.openExitModal = function() {
  if(!isSaveHidden) {
    document.getElementById("warning-text-before").textContent = "Nếu bạn thoát,";
    document.getElementById("warning-text-after").textContent = "thông tin chỉnh sửa sẽ không sao lưu";
  } else {
    document.getElementById("warning-text-before").textContent = "Bấm thoát";
    document.getElementById("warning-text-after").textContent = "để trở lại màn hình chính!";
    isSaveHidden=true;
  }
  const modal = document.getElementById('exit-modal');
  modal.classList.remove('hidden');
}

window.closeExitModal = function() {
  const modal = document.getElementById('exit-modal');
  modal.classList.add('hidden');
}
window.confirmExit = function() {
  unloadQuizCSS();
  loadQuizCSS('style.css');
  cleanupQuizDOM();
  // dừng timer nếu có
  stopTimer?.();
  document.getElementById('app').style.display='block';
  // Xóa HTML cũ
  document.getElementById("quiz-root").innerHTML = "";
}

window.history.pushState(null, '', location.href);

window.onpopstate = function() {
  openExitModal();
  window.history.pushState(null, '', location.href);
};
