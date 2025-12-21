const API_URL = 'https://script.google.com/macros/s/AKfycbxGHSrh9HCFcKxfPqDnmYuMRxRHeoIeztowkZ6km8SKiJikm0AXioNWek97vhUlO6A/exec';

window.login = async function () {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const message = document.getElementById('message');
  if (!username || !password) {
    message.textContent = 'Vui lòng nhập đầy đủ thông tin!';
    return;
  }

  message.textContent = 'Đang kiểm tra...';

  const res = await fetch(
    `${API_URL}?action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
  );
  const result = await res.json();
  if (result.success) {
    message.textContent = 'Đăng nhập thành công ✔';
    localStorage.setItem('username', username);
    loadUser();
    setTimeout(() => {
      // Ẩn modal login
      toggleModal(false);
    }, 700);
    // Cập nhật tabbar thành thông tin cá nhân
    updateLoginTab();
  } else {
    message.textContent = 'Sai tài khoản hoặc mật khẩu ❌';
  }
};
window.updateLoginTab = function () {
  const tabLogin = document.getElementById('tab-login');
  const username = localStorage.getItem("username");

  if (!tabLogin) return;

  if (username) {
    tabLogin.innerHTML = `<span class="icon">👤</span><span class="label">Profile</span>`;
    tabLogin.onclick = () => toggleUserModal(true);
  } else {
    tabLogin.innerHTML = `<span class="icon">🔐</span><span class="label">Login</span>`;
    tabLogin.onclick = () => toggleModal(true);
  }
};

window.logout = function () {
  localStorage.removeItem('username');
  updateLoginTab();
  toggleUserModal(false); // ẩn modal user nếu đang mở
};
//         <!-- Chọn Avatar -->
window.selectAvatar = function() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toastWarning("Chỉ chọn ảnh");
      return;
    }

    showAvatarLoading(true);

    try {
      // 1️⃣ Resize ảnh
      const resizedBlob = await resizeImage(file, 300);

      // 2️⃣ Preview ngay bằng Blob URL
      const imgUrl = URL.createObjectURL(resizedBlob);
      const avatarImg = document.getElementById("avatarImg");
      avatarImg.src = imgUrl;

      avatarImg.onload = () => {
        URL.revokeObjectURL(imgUrl); // tránh leak RAM
      };

      // 🔥 CHUYỂN SANG BASE64
      const base64 = await blobToBase64(resizedBlob);
      // 3️⃣ Upload ảnh đã resize
      await uploadAvatar(base64);

    } catch (err) {
      console.error(err);
      toastError("Resize ảnh thất bại");
    } finally {
      showAvatarLoading(false);
    }
  };

  input.click();
}

//         <!-- Đặt lại kích thước ảnh -->
function resizeImage(file, maxSize = 300, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result;
    };

    img.onload = () => {
      let { width, height } = img;

      // giữ tỉ lệ
      if (width > height) {
        if (width > maxSize) {
          height = height * (maxSize / width);
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = width * (maxSize / height);
          height = maxSize;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) reject("Resize failed");
          resolve(blob);
        },
        "image/jpeg",
        quality
      );
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // base64 string
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function uploadAvatar(base64) {
  const username = localStorage.getItem("username"); // lấy từ session/login thực tế

  // bỏ phần header "data:image/png;base64,"
  const pureBase64 = base64.split(",")[1];

  try {
    const res = await fetch("https://script.google.com/macros/s/AKfycbxGHSrh9HCFcKxfPqDnmYuMRxRHeoIeztowkZ6km8SKiJikm0AXioNWek97vhUlO6A/exec", {
      method: "POST",
      body: JSON.stringify({
        action: "updateAvatar",
        username,
        avatar: pureBase64
      })
    });

    const data = await res.json();

    if (data.success) {
      // ✅ đổi sang avatar thật từ Drive
      document.getElementById("avatarImg").src = data.avatar;
    } else {
      toastError(data.error || "Lỗi cập nhật avatar");
    }
  } catch (err) {
    console.error(err);
    toastError("Không thể upload avatar");
  }
}
function showAvatarLoading(show) {
  const img = document.getElementById("avatarImg");
  img.classList.toggle("opacity-50", show);
}
// LOAD PROFILE
let userDraft = null;
window.loadUser = async function() {
  const username = localStorage.getItem("username");
  if (!username) return;

  const res = await fetch(`${API_URL}?action=getUser&username=${username}`);

  const data = await res.json();

  userDraft = {...data};

  renderUser(userDraft);

  
  localStorage.setItem('hoTen', data.hoTen);
  localStorage.setItem('tenThanh', data.tenThanh);
  localStorage.setItem('ngaySinh', transferDateForView(data.ngaySinh));
  localStorage.setItem('ngayRuaToi', transferDateForView(data.ngayRuaToi));
  localStorage.setItem('ngayThemSuc', transferDateForView(data.ngayThemSuc));
  localStorage.setItem('ngayRuocLe', transferDateForView(data.ngayRuocLe));
  localStorage.setItem('tenCha', data.tenCha);
  localStorage.setItem('tenMe', data.tenMe);
  localStorage.setItem('sdt', data.sdt);
  localStorage.setItem('giaoXom', data.giaoXom);
  localStorage.setItem('gioiTinh', data.gioiTinh);
  localStorage.setItem('avatar', data.avatar);

  if(data.gioiTinh === 'Nam'){
    document.querySelector(".gen-icon").textContent = '👦🏻';
  } else {
    document.querySelector(".gen-icon").textContent = '👧🏻';
  }
}
function renderUser(data) {
  document.getElementById("hoTenText").textContent = data.hoTen;
  document.getElementById("tenThanhText").textContent = data.tenThanh;
  document.getElementById("ngaySinhText").textContent = transferDateForView(data.ngaySinh);
  document.getElementById("ngayRuaToiText").textContent = transferDateForView(data.ngayRuaToi);
  document.getElementById("ngayThemSucText").textContent = transferDateForView(data.ngayThemSuc);
  document.getElementById("ngayRuocLeText").textContent = transferDateForView(data.ngayRuocLe);
  document.getElementById("tenChaText").textContent = data.tenCha;
  document.getElementById("tenMeText").textContent = data.tenMe;
  document.getElementById("sdtText").textContent = data.sdt;
  document.getElementById("giaoXomText").textContent = data.giaoXom;
  document.getElementById("gioiTinhText").textContent = data.gioiTinh;
  document.getElementById("usernameText").textContent = data.username;
  document.getElementById("avatarImg").src = data.avatar||'https://lh3.googleusercontent.com/d/147OrvzPCi6r0aSk0ydi4HxS04G9ZZDEA';
console.log('run1');
}
// Format Date to View
function transferDateForView(value) {
  if (!value) return "";
  const dateObj = new Date(value);
  const day = String(dateObj.getDate()).padStart(2,"0");
  const month = String(dateObj.getMonth()+1).padStart(2,"0");
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
}

// UPDATE PROFI
window.editField = function (field) {
  const fieldConfig = {
    hoTen: { type: "text", label: "Họ và tên" },
    tenThanh: { type: "text", label: "Tên thánh" },
    ngaySinh: { type: "date", label: "Ngày sinh" },
    ngayRuaToi: { type: "date", label: "Ngày rửa tội" },
    ngayRuocLe: { type: "date", label: "Ngày rước lễ lần đầu" },
    ngayThemSuc: { type: "date", label: "Ngày thêm sức" },
    tenCha: { type: "text", label: "Tên Cha" },
    tenMe: { type: "text", label: "Tên Mẹ" },
    sdt: { type: "tel", label: "Sdt" },
    giaoXom: { type: "text", label: "Giáo Xóm" },
    gioiTinh: {
      type: "radio",
      label: "Giới tính",
      options: ["Nam", "Nữ"]
    }
  };
  if (!fieldConfig[field]) return;

  const curId = `${field}Text`;

  const textEl = document.getElementById(curId);
  const oldValue = textEl.textContent.trim();

  // Ngày Tháng Năm
  if(fieldConfig[field].type==="date") {
    const input = document.createElement("input");
    input.type = "date";
    input.className = "border rounded px-2 py-1 w-full";
    input.value = formatDateForInput(oldValue);

    textEl.replaceWith(input);
    input.focus();

    let saved = false;
    const save = () => {
      if (saved) return;
      saved = true;
      saveDate(input, oldValue, curId);
      if(transferDateForView(input.value)!==oldValue) {
        // Set để gọi hàm confirmSave Lưu thông tin user
        isSaveHidden = false;
      }
    };

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") save();
      if (e.key === "Escape") cancelEdit(oldValue, input, curId);
    });

    input.addEventListener("blur", save);
    function formatDateForInput(text) {
      if (!text) return "";
      const [d, m, y] = text.split("/");
      if (!d || !m || !y) return "";
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    function formatDateForView(value) {
      if (!value) return "";
      const [y, m, d] = value.split("-");
      if (!d || !m || !y) return "";
      return `${d}/${m}/${y}`;
    }
    function saveDate(input, oldValue, curId) {
      const raw = input.value; // yyyy-mm-dd
      const formatted = raw ? transferDateForView(raw) : oldValue;

      const text = document.createElement("div");
      text.id = curId;
      text.className = "text-lg font-semibold text-gray-800";
      text.textContent = formatted;

      input.replaceWith(text);
    }

    return;
  }

  // GIỚI TÍNH
  if(field==='gioiTinh'){
    textEl?.classList?.add('hidden');

    const select = document.createElement("select");
    select.className = "border rounded px-2 py-1";
    ["Nam", "Nữ"].forEach(gt => {
      const opt = document.createElement("option");
      opt.value = gt;
      opt.textContent = gt;
      select.appendChild(opt);
    });

    select.value = oldValue;

    // Gắn select vào DOM (đúng vị trí text)
    textEl.parentNode.appendChild(select);
    let closed = false;

    function closeSelect() {
      if (closed) return;
      closed = true;

      textEl.classList.remove("hidden");
      select.remove();
    }
    // SAVE khi change
    select.addEventListener("change", () => {
      const value = select.value;

      textEl.textContent = value;
      closeSelect();

      // Set để gọi hàm confirmSave Lưu thông tin user
      isSaveHidden = false;
    });

    // Blur chỉ để đóng UI (không save)
    select.addEventListener("blur", closeSelect);

    select.focus();
    return;
  }

  // Tạo input
  const input = document.createElement("input");
  input.type = "text";
  input.value = oldValue;
  input.className =
    "border rounded-lg px-3 py-1 text-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-400";

  // Thay text bằng input
  textEl.replaceWith(input);
  input.focus();

  // Lưu khi nhấn Enter
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      input.removeEventListener("blur", blurHandler);
      saveData(input.value, oldValue, input, curId);
    }
    if (e.key === "Escape") cancelEdit(oldValue, input, curId);
  });
  const blurHandler = () => {
    saveData(input.value, oldValue, input, curId);
  };
  // Mất focus thì lưu
  input.addEventListener("blur", blurHandler);
}
function saveData(newValue, oldValue, inputEl, curId) {
  const value = newValue.trim();
  if (!value) {
    toastWarning("Tên không được để trống");
    inputEl.focus();
    return;
  }

  // Set để gọi hàm confirmSave Lưu thông tin user
  if(newValue!==oldValue)
  isSaveHidden = false;

  const text = document.createElement("div");
  text.id = curId;
  text.className = "text-lg font-semibold text-gray-800";
  text.textContent = value;

  inputEl.replaceWith(text);
}

function cancelEdit(oldValue, inputEl, curId) {
  const text = document.createElement("div");
  text.id = curId;
  text.className = "text-lg font-semibold text-gray-800";
  text.textContent = oldValue;

  inputEl.replaceWith(text);
}
let isChangePasswordOpen = false;
window.isUserModalOpen = false;
window.openChangePassword = function () {
  const modal = document.getElementById("modal-change-password");
  modal.classList.remove("hidden");
  isChangePasswordOpen = true;
}
window.closeChangePassword = function () {
  const modal = document.getElementById("modal-change-password");
  modal.classList.add("hidden");
  isChangePasswordOpen = false;
}
document.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") return;

  // Ưu tiên đóng modal con
  if (isChangePasswordOpen) {
    closeChangePassword();
    return;
  }

  // Sau đó mới tới modal cha
  if (isUserModalOpen) {
    toggleUserModal(!isUserModalOpen);
  }
});

window.submitChangePassword = async function () {
  const oldPass = document.getElementById("oldPassword").value.trim();
  const newPass = document.getElementById("newPassword").value.trim();
  const confirmPass = document.getElementById("confirmPassword").value.trim();
  const username = localStorage.getItem("username");

  if (!oldPass || !newPass || !confirmPass)
    return toastWarning("Vui lòng nhập đầy đủ thông tin");

  if (newPass.length < 8)
    return toastWarning("Mật khẩu mới phải ≥ 8 ký tự");

  if (newPass !== confirmPass)
    return toastWarning("Mật khẩu mới không khớp");

  setSaveLoading(true);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "changePassword",
        username,
        oldPassword: oldPass,
        newPassword: newPass
      })
    });

    const data = await res.json();

    if (!data.success) {
      toastError("Đổi mật khẩu thất bại");
      return;
    }
    toastSuccess("✅ Đổi mật khẩu thành công");
    setSaveLoading(false);
    closeChangePassword();

  } catch (err) {
    toastError("❌ Lỗi kết nối server");
    console.error(err);
  }
}
function changePassword(username, oldPassword, newPassword) {
  const sheet = getSheet();
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === username) {
      const oldHash = Utilities.computeDigest(
        Utilities.DigestAlgorithm.SHA_256,
        oldPassword
      ).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');

      if (oldHash !== rows[i][1]) {
        return json({ success: false, error: "Mật khẩu cũ không đúng" });
      }

      const newHash = Utilities.computeDigest(
        Utilities.DigestAlgorithm.SHA_256,
        newPassword
      ).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');

      sheet.getRange(i + 1, 2).setValue(newHash);
      return json({ success: true });
    }
  }
  return json({ success: false, error: "User không tồn tại" });
}
window.togglePasswordView = function (inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const isHidden = input.type === "password";

  input.type = isHidden ? "text" : "password";
  btn.textContent = isHidden ? "🙈" : "👁️";
}
function setSaveLoading(isLoading) {
  const btn = document.getElementById("savePasswordBtn");
  const spinner = document.getElementById("saveSpinner");
  const text = document.getElementById("saveBtnText");

  if (isLoading) {
    btn.disabled = true;
    spinner.classList.remove("hidden");
    text.textContent = "Đang lưu...";
  } else {
    btn.disabled = false;
    spinner.classList.add("hidden");
    text.textContent = "Lưu thay đổi";
  }
}
window.openConfirmSave = function() {
  document.getElementById("confirm-save")?.classList?.remove("hidden");
}
window.confirmSave = async function() {
  // đổi tiêu đề + nội dung
  document.getElementById("confirm-title").textContent = "⏳ Đang xử lý";
  document.getElementById("saveDataText").classList.add("hidden");
  // hiện loading
  document.getElementById("save-loading").classList.remove("hidden");

  // disable nút
  document.getElementById("btn-confirm-save").disabled = true;
  document.getElementById("btn-confirm-save").classList.add("opacity-50");
  document.getElementById("btn-cancel-save").disabled = true;

  // hiệu ứng nhẹ cho box
  const box = document.getElementById("confirm-save-box");
  box.classList.add("scale-95");
  
  const username = localStorage.getItem("username");
  const tenThanh = document.getElementById("tenThanhText").textContent;
  const hoTen = document.getElementById("hoTenText").textContent;
  const ngaySinh = document.getElementById("ngaySinhText").textContent;
  const ngayRuaToi = document.getElementById("ngayRuaToiText").textContent;
  const ngayRuocLe = document.getElementById("ngayRuocLeText").textContent;
  const ngayThemSuc = document.getElementById("ngayThemSucText").textContent;
  const tenCha = document.getElementById("tenChaText").textContent;
  const tenMe = document.getElementById("tenMeText").textContent;
  const sdt = document.getElementById("sdtText").textContent;
  const giaoXom = document.getElementById("giaoXomText").textContent;
  const gioiTinh = document.getElementById("gioiTinhText").textContent;
  const data = {
    username,
    tenThanh,
    hoTen,
    ngaySinh,
    ngayRuaToi,
    ngayRuocLe,
    ngayThemSuc,
    tenCha,
    tenMe,
    sdt,
    giaoXom,
    gioiTinh
  };

  try {
    const res = await fetch(
      `${API_URL}?action=updateprofile&data=${encodeURIComponent(
        JSON.stringify(data)
      )}`
    );
    const result = await res.json();

    if (!result.success) {
      toastError(result.error || "Lưu dữ liệu thất bại");
      return;
    }

    toastSuccess();
    closeChangePassword();

  } catch (err) {
    toastError("❌ Lỗi kết nối server");
    console.error(err);
  }
  document.getElementById("confirm-save")?.classList?.add("hidden");
  loadUser();
  isSaveHidden = true;
  toggleUserModal(false);
  //Reset UI
  resetConfirmSave();
}
window.closeConfirmSave = function() {
  document.getElementById("confirm-save")?.classList?.add("hidden");
}
let toastTimer = null;

function showToast(message = "Lưu dữ liệu thành công",bg) {
  const toast = document.getElementById("toast-id");
  const toastText = document.getElementById("toast-text");
  if (!toast) return;

  toastText?.classList?.add(bg);

  // đổi nội dung nếu cần
  toast.querySelector("span:last-child").textContent = message;

  toast.classList.remove("hidden");
  toast.classList.add("animate-fade-in");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

window.toastError = function(msg) {
  showToast(msg, 'bg-red-500');
}
window.toastSuccess = function(msg) {
  showToast(msg, 'bg-green-500');
}
window.toastWarning = function(msg) {
  showToast(msg, 'bg-yellow-500');
}
function resetConfirmSave() {
  document.getElementById("confirm-title").textContent = "Lưu thay đổi";
  document.getElementById("saveDataText").classList.remove("hidden");
  document.getElementById("save-loading").classList.add("hidden");

  const btnSave = document.getElementById("btn-confirm-save");
  const btnCancel = document.getElementById("btn-cancel-save");

  btnSave.disabled = false;
  btnCancel.disabled = false;
  btnSave.classList.remove("opacity-50");

  document.getElementById("confirm-save-box").classList.remove("scale-95");
}

window.confirmExitModal = function() {
  isSaveHidden = true;
  setProfileDefaut();
  closeExitModal();
  toggleUserModal(false);
}
