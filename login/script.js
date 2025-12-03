window.login = async function () {
  const API_URL =
    'https://script.google.com/macros/s/AKfycbzm_Hs__uPiFxcrm5LsnoIia1lE6BsdFfe_V1MGvxOWEXLJIZ4GFY23wqnPl8P244o/exec'; // Dán URL Apps Script vào đây
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const message = document.getElementById('message');
  if (!username || !password) {
    message.textContent = 'Vui lòng nhập đầy đủ thông tin!';
    return;
  }

  message.textContent = 'Đang kiểm tra...';
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (result.success) {
      // lưu tên đầy đủ lại
      localStorage.setItem('fullname', result.fullname);
      localStorage.setItem('username', username);

      message.textContent = 'Đăng nhập thành công ✔';
      setTimeout(() => {
        // Ẩn modal login
        toggleModal(false);
      }, 700);
      // Cập nhật tabbar thành thông tin cá nhân
      updateLoginTab(result.fullname);
    } else {
      message.textContent = 'Sai tài khoản hoặc mật khẩu ❌';
    }
  } catch (error) {
    message.textContent = 'Lỗi kết nối!';
  }
};
window.updateLoginTab = function (fullname) {
  const displayName = fullname.trim().split(' ').slice(-2).join(' ');
  const tabLogin = document.getElementById('tab-login');
  if (tabLogin) {
    tabLogin.innerHTML = `<span class="icon">👤</span><span class="label">${displayName}</span>`;
    tabLogin.onclick = () => toggleUserModal(true); // mở modal user
  }
};
window.logout = function () {
  localStorage.removeItem('fullname');
  localStorage.removeItem('username');
  const tabLogin = document.getElementById('tab-login');
  if (tabLogin) {
    tabLogin.innerHTML = `<span class="icon">🔐</span><span class="label">Login</span>`;
    tabLogin.onclick = () => toggleModal(true);
  }
  toggleUserModal(false); // ẩn modal user nếu đang mở
};
