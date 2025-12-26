const semesterSelect = document.getElementById("semesterSelect");

semesterSelect.addEventListener("change", () => {
  const semester = semesterSelect.value;
  loadSemesterData(semester);
});
async function fetchScores() {
  try {
    const res = await fetch('https://script.google.com/macros/s/AKfycbz9EIf1zX4_kA8TfGk6dao48y5CbjJpdYGjOEu_jrV-lpueeFnuYBKXnimawMW7pCSzpw/exec', {
      cache: "no-store" });
    if (!res.ok) throw new Error("Fetch failed");
    return await res.json(); // { HK1: [...], HK2: [...] }
  } catch (err) {
    console.error(err);
    return null;
  }
}
function getStudentFromLocal() {
  const str = localStorage.getItem("username");
  return {username: str};
}
let studentData=null;
let start;
window.loadSemesterData = async function (semester) {
  let studentLocal = getStudentFromLocal();
  if (!studentLocal?.username) {
    console.warn("❌ Không có student trong local");
    return;
  }

  if(!studentData) {
    const res = await fetchScores();
    if (!res || !res[semester]) {
      console.warn("❌ Không có dữ liệu học kỳ:", semester);
      return;
    }

    studentData = res;
  }

  const list = studentData[semester];
  // ✅ TÌM ĐÚNG HỌC SINH
  const student = list.find(
    sv => sv.username === studentLocal.username
  );
  if (!student) {
    console.warn("❌ Không tìm thấy học sinh:", studentLocal.username);
    return;
  }

  document.querySelectorAll("[data-field]").forEach(el => {
    const field = el.dataset.field;
    const value = student?.[field];
    el.textContent = value === 0 ? 0 : value ? value : "-";
  });
  document.querySelectorAll(".total-week").forEach(el => {
    el.textContent = student.attendance.length;
  });
  
  start = semester === "HK1"?new Date(2025, 8, 14):new Date(2026, 0, 25);
  
  renderAttendance(student.attendance);
  renderAttendanceMobile(student.attendance);

  if(student.hocLuc!=="-"&&student.hanhKiem!=="-") {

    setBadge("hocLuc", student.hocLuc);
    setBadge("hanhKiem", student.hanhKiem);

    document.getElementById("gl-comment").textContent =
    generateRandomGLComment(student.hocLuc, student.hanhKiem);
    document.getElementById("text-comment")?.classList.remove("hidden");
    document.getElementById("text-infor")?.classList.add("bg-blue-50", "border-blue-200", "text-blue-800");
    document.getElementById("text-infor").textContent = "ℹ️ Thông tin đã cập nhật đầy đủ!";
  } else {
    document.getElementById("text-comment")?.classList.add("hidden");
    document.getElementById("text-infor")?.classList.remove("bg-blue-50", "border-blue-200", "text-blue-800");
    document.getElementById("text-infor").textContent = "⚠ Thông tin điểm thi và điểm danh đang cập nhật thêm";
  }
}

function renderAttendance(attendanceArray) {
  const headRow = document.getElementById("attendance-head");
  const monthRow = document.getElementById("attendance-month");
  const bodyRow = document.getElementById("attendance-row");
  const totalCell = document.getElementById("attendance-total");

  // Xoá cột cũ (trừ cột đầu & cuối)
  headRow.querySelectorAll("th.week").forEach(e => e.remove());
  monthRow.querySelectorAll("th.week").forEach(e => e.remove());
  bodyRow.querySelectorAll("td.week").forEach(e => e.remove());

  attendanceArray.forEach((value, index) => {
    const week = index + 1;
    const sunday = new Date(start);
    sunday.setDate(start.getDate() + index * 7);

    /* ===== HEADER ===== */
    const th = document.createElement("th");
    th.textContent = `${sunday.getDate()}`;
    th.className = "week px-2 font-semibold text-gray-500 text-sm";
    headRow.insertBefore(th, headRow.lastElementChild);

    /* ===== HEADER ===== */
    const thm = document.createElement("th");
    thm.textContent = `${sunday.getMonth() + 1}`;
    thm.className = "week px-2 font-semibold text-gray-500 text-sm";
    monthRow.insertBefore(thm, monthRow.lastElementChild);

    /* ===== BODY ===== */
    const td = document.createElement("td");
    td.className = "week px-2";

    const dot = document.createElement("span");
    dot.className = "inline-block w-5 h-5 rounded";

    if (value === 0) {
      dot.classList.add("bg-green-500");
      dot.title = "Có học";
    } else if (value === 1) {
      dot.classList.add("bg-yellow-400");
      dot.title = "Nghỉ có phép";
    } else if (value === 2) {
      dot.classList.add("bg-red-500");
      dot.title = "Nghỉ không phép";
    } else if (value === 3) {
      dot.classList.add("bg-blue-300");
      dot.title = "Ngày Nghỉ Lễ";
    } else {
      dot.classList.add("bg-gray-300", "border", "border-dashed");
      dot.title = "Chưa có dữ liệu";
    }

    td.appendChild(dot);
    bodyRow.insertBefore(td, totalCell);
  });
}
function renderAttendanceMobile(attendanceArray) {
  const grid = document.getElementById("attendance-grid");

  grid.innerHTML = "";

  attendanceArray.forEach((value, index) => {
    const week = index + 1;

    const sunday = new Date(start);
    sunday.setDate(start.getDate() + index * 7);

    const item = document.createElement("div");
    item.className = "flex flex-col items-center gap-1";

    const dot = document.createElement("span");
    dot.className = "inline-block w-6 h-6 rounded";

    if (value === 0) {
      dot.classList.add("bg-green-500");
      dot.title = "Có học";
    } else if (value === 1) {
      dot.classList.add("bg-yellow-400");
      dot.title = "Nghỉ có phép";
    } else if (value === 2) {
      dot.classList.add("bg-red-500");
      dot.title = "Nghỉ không phép";
    } else if (value === 3) {
      dot.classList.add("bg-blue-300");
      dot.title = "Ngày Nghỉ Lễ";
    } else {
      dot.classList.add("bg-gray-300", "border", "border-dashed");
      dot.title = "Chưa có dữ liệu";
    }

    const label = document.createElement("span");
    label.className = "text-xs text-gray-500";
    label.textContent = `${sunday.getDate()}/${sunday.getMonth() + 1}`;

    item.appendChild(dot);
    item.appendChild(label);
    grid.appendChild(item);
  });
}
const RANK_COLORS = {
  hocLuc: {
    "Giỏi": "text-reen-500",
    "Khá": "text-blue-500",
    "Trung Bình": "text-yellow-400",
    "Yếu": "text-orange-500",
    "Kém": "text-red-600"
  },
  hanhKiem: {
    "Tốt": "text-reen-500",
    "Khá": "text-blue-500",
    "Trung Bình": "text-yellow-400",
    "Yếu": "text-red-600"
  }
};
function setBadge(field, value) {
  document.querySelectorAll(`[data-field="${field}"]`).forEach(el => {

    const color = RANK_COLORS[field]?.[value];
    if (color) el.classList.add(...color.split(" "));
  });
}
const GL_HOCLUC_COMMENTS = {
  "Giỏi": [
    "Em tiếp thu giáo lý rất tốt, hiểu bài nhanh và biết áp dụng giáo huấn vào đời sống.",
    "Em học giáo lý nghiêm túc, nắm vững nội dung và có tinh thần chia sẻ trong lớp.",
    "Em có khả năng hiểu sâu giáo lý và thể hiện đức tin qua hành vi cụ thể."
  ],
  "Khá": [
    "Em nắm được nội dung giáo lý và tham gia học tập khá đều đặn.",
    "Em có ý thức học giáo lý, cần mạnh dạn hơn khi phát biểu và chia sẻ.",
    "Em hiểu bài và có tinh thần hợp tác tốt trong các sinh hoạt lớp."
  ],
  "Trung Bình": [
    "Em hiểu được những nội dung giáo lý cơ bản, cần cố gắng hơn trong việc ôn bài.",
    "Em cần chú ý hơn trong giờ học để hiểu sâu và nhớ lâu giáo lý.",
    "Em nên dành thêm thời gian học bài để theo kịp chương trình."
  ],
  "Yếu": [
    "Em còn gặp khó khăn trong việc tiếp thu giáo lý, cần được quan tâm và nhắc nhở thêm.",
    "Em cần cố gắng hơn trong việc học và tham dự các buổi giáo lý.",
    "Em nên chủ động hơn trong việc học bài và hỏi khi chưa hiểu."
  ],
  "Kém": [
    "Em chưa theo kịp chương trình giáo lý, cần sự đồng hành của gia đình và giáo lý viên.",
    "Em cần được quan tâm nhiều hơn để cải thiện việc học giáo lý.",
    "Em cần sắp xếp thời gian học giáo lý nghiêm túc hơn."
  ]
};
const GL_HANHKIEM_COMMENTS = {
  "Tốt": [
    "Em ngoan ngoãn, lễ phép và tham dự tích cực các buổi học giáo lý.",
    "Em có tinh thần vâng lời và ý thức giữ kỷ luật tốt.",
    "Em sống chan hòa, biết tôn trọng bạn bè và giáo lý viên."
  ],
  "Khá": [
    "Em chấp hành nội quy lớp khá tốt, cần chủ động hơn trong sinh hoạt.",
    "Em có ý thức giữ kỷ luật, cần cố gắng duy trì sự đều đặn.",
    "Em cư xử đúng mực, cần phát huy tinh thần tự giác hơn."
  ],
  "Trung Bình": [
    "Em cần rèn luyện thêm tính tự giác và chú ý hơn trong giờ học.",
    "Em tham dự chưa đều, cần cố gắng sắp xếp thời gian tốt hơn.",
    "Em cần nghiêm túc hơn trong các sinh hoạt của lớp."
  ],
  "Yếu": [
    "Em tham dự chưa nghiêm túc, cần được nhắc nhở và đồng hành thêm.",
    "Em cần cố gắng hơn trong việc giữ kỷ luật và tham dự học giáo lý.",
    "Em cần sự phối hợp của gia đình để giúp em tiến bộ."
  ]
};
function generateRandomGLComment(hocLuc, hanhKiem) {
  if (!hocLuc || !hanhKiem) {
    return "Giáo lý viên đang theo dõi thêm quá trình học tập và tham dự của em.";
  }

  const hocLucText = pickRandom(GL_HOCLUC_COMMENTS[hocLuc] || []);
  const hanhKiemText = pickRandom(GL_HANHKIEM_COMMENTS[hanhKiem] || []);

  return `${hocLucText} ${hanhKiemText} Xin Chúa chúc lành và đồng hành cùng em trên hành trình đức tin.`;
}
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
