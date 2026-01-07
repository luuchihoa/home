
function loadDCM() {
  const API_URL = "https://script.google.com/macros/s/AKfycbzum9kVRG0GCqzTUNLls1WVyUt9fzpGRWZ3Rn7gWaueCNOeBOszVckEF_P9-2645gWm/exec"; // 🔴 đổi URL GAS

  const docList = document.getElementById("doc-list");
  const docLoading = document.getElementById("doc-loading");
  const docEmpty = document.getElementById("doc-empty");

  /* ================= LOAD DEFAULT ================= */
  loadDocuments("all"); // mặc định 15 phút
    
  /* ================= CACHED DOCUMENTS ================= */

  const DOC_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 tiếng (phải khớp server)

  function getDocCacheKey(cat) {
    return `DOCS_${cat || "all"}`;
  }

  function getCachedDocs(cat) {
    const key = getDocCacheKey(cat);
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
      const { data, time } = JSON.parse(raw);
      if (Date.now() - time > DOC_CACHE_TTL) {
        localStorage.removeItem(key);
        return null;
      }
      return data;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  }

  function setCachedDocs(cat, data) {
    const key = getDocCacheKey(cat);
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        time: Date.now()
      })
    );
  }

  /* ================= LOAD DOCUMENTS ================= */

  async function loadDocuments(cat) {
    docLoading.classList.remove("hidden");
    docList.classList.add("hidden");
    docEmpty.classList.add("hidden");
    // 🔥 1. Try cache first
    const cached = getCachedDocs(cat);
    if (cached) {
      console.log("cached");
      renderDocs(cached);
      docLoading.classList.add("hidden");
      docList.classList.remove("hidden");
      return;
    }
    try {
      const res = await fetch(`${API_URL}?path=DOCS&cat=${cat}`);
      const data = await res.json();
      // 🔥 2. Save cache
      if(cat==="all"){
        data.forEach(d=>setCachedDocs(d.cat,[d]));
      }
      setCachedDocs(cat, data);
      renderDocs(data);
    } catch (err) {
      console.error(err);
      docEmpty.classList.remove("hidden");
    } finally {
      docLoading.classList.add("hidden");
    }
  }
  window.loadDocuments=loadDocuments;
  /* ================= RENDER DOCUMENTS ================= */
  function renderDocs(items) {
    const list = document.getElementById("doc-list");
    const empty = document.getElementById("doc-empty");

    list.innerHTML = "";

    if (!items || items.length === 0) {
      list.classList.add("hidden");
      empty.classList.remove("hidden");
      return;
    }

    list.classList.remove("hidden");
    empty.classList.add("hidden");

    let html = "";

    items.forEach(doc => {
      const catText = mapCategory(doc.cat);
      const CAT_CLASS_MAP = {
        "15p_hk1": "text-emerald-600 bg-emerald-50",
        "1tiet_hk1":   "text-purple-600 bg-purple-50",
        "hk1": "text-red-600 bg-red-50",
        "15p_hk2": "text-emerald-600 bg-emerald-50",
        "1tiet_hk2":   "text-purple-600 bg-purple-50",
        "hk2": "text-red-600 bg-red-50",
      };
      const catClass = CAT_CLASS_MAP[doc.cat] || "text-neutral-600 bg-neutral-100";

      html += `
        <div class="doc-item bg-white rounded-xl border border-gray-100 overflow-hidden">
          
          <!-- HEADER -->
          <div class="doc-header group cursor-pointer flex justify-between gap-3 p-4"
               onclick="toggleDocument(this, ${doc.id})">

            <div class="flex flex-col gap-1 w-full">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[12px] font-bold px-1.5 py-0.5 rounded ${catClass}">
                  ${catText}
                </span>

              </div>

              <span class="text-lg font-medium text-gray-900 leading-snug
                           group-hover:text-indigo-600 transition-colors">
                ${doc.title}
              </span>

              <span class="text-sm text-gray-400">
                ${doc.description} · ${doc.updatedAt}
              </span>
            </div>

            <svg class="icon-chevron w-5 h-5 text-gray-400 transition-transform duration-200 mt-1 flex-shrink-0"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          <!-- CONTENT -->
          <div class="doc-content hidden border-t border-gray-50 p-4">
            <div class="text-sm text-gray-400">Đang tải nội dung...</div>
          </div>

        </div>
      `;
    });

    list.innerHTML = html;
  }
  window.toggleDocument = async function (headerEl, docId) {
    const content = headerEl.nextElementSibling;
    const icon = headerEl.querySelector(".icon-chevron");

    const isOpen = !content.classList.contains("hidden");

    // đóng
    if (isOpen) {
      content.classList.add("hidden");
      icon.classList.remove("rotate-180");
      return;
    }

    // mở
    content.classList.remove("hidden");
    icon.classList.add("rotate-180");

    // nếu đã load rồi → không load lại
    if (content.dataset.loaded) return;

    try {
      const res = await fetch(`${API_URL}?path=DOC_QUESTIONS&docId=${docId}`);
      const data = await res.json();
      const { mcq, essay } = data;

      content.innerHTML = renderExamContent(mcq, essay);
      content.dataset.loaded = "1";
    } catch (e) {
      content.innerHTML = `<p class="text-red-500 text-sm">Lỗi tải nội dung</p>`;
    }
  }

  function renderExamContent(mcq, essay) {
    let html = "";
    if (mcq?.length) {
      html += `
        <section class="mb-6">
          <!-- HEADER -->
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-base font-bold text-orange-700 flex items-center gap-2">
              📝 Trắc nghiệm
            </h4>
            <span class="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-semibold">
              ${mcq.length} câu
            </span>
          </div>

          <!-- QUESTIONS -->
          <div class="space-y-4">
            ${mcq.map((q, index) => `
              <div class="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm hover:shadow transition">
                
                <!-- QUESTION -->
                <p class="text-sm font-semibold text-neutral-800 mb-3">
                  Câu ${index + 1}. ${q.question}
                </p>

                <!-- OPTIONS -->
                <ul class="space-y-2 text-sm">
                  ${q.options.map((choice, i) => {
                    const letter = String.fromCharCode(65 + i);
                    const isCorrect = q.answer === letter;

                    return `
                      <li class="flex items-start gap-3 px-3 py-2 rounded-lg
                        ${isCorrect
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-neutral-50 text-neutral-600"}">
                        
                        <span class="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                          ${isCorrect
                            ? "bg-emerald-600 text-white"
                            : "bg-neutral-200 text-neutral-700"}">
                          ${letter}
                        </span>

                        <span class="flex-1">${choice}</span>

                        ${isCorrect ? `<span class="text-emerald-600 font-bold">✓</span>` : ``}
                      </li>
                    `;
                  }).join("")}
                </ul>
              </div>
            `).join("")}
          </div>
        </section>
      `;
    }

    if (essay?.length) {
      html += `
        <section class="mb-6">
          <!-- HEADER -->
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-base font-bold text-blue-700 flex items-center gap-2">
              ✍️ Tự luận
            </h4>
            <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
              ${essay.length} câu
            </span>
          </div>

          <!-- QUESTIONS -->
          <div class="space-y-4">
            ${essay.map((q, index) => `
              <div class="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm hover:shadow transition">
                
                <!-- QUESTION -->
                <p class="text-sm font-semibold text-neutral-800 mb-3">
                  Câu ${index + 1}. ${q.question}
                </p>

                <!-- ANSWER -->
                <div class="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800 leading-relaxed">
                  <span class="block text-xs font-semibold text-blue-600 mb-1">
                    Gợi ý / Đáp án:
                  </span>
                  <span class="pl-2 text-justify tracking-wide leading-relaxed whitespace-pre-line">${q.answer || "<i class='text-neutral-400'>Chưa có đáp án</i>"}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </section>
      `;
    }

    if (!html) {
      html = `<p class="text-sm text-gray-400">Bộ đề chưa có câu hỏi</p>`;
    }

    return html;
  }
  function mapCategory(cat) {
    switch (cat) {
      case "15p_hk1": return "15 Phút";
      case "1tiet_hk1": return "1 Tiết";
      case "hk1": return "Thi HK";
      case "15p_hk2": return "15 Phút";
      case "1tiet_hk2": return "1 Tiết";
      case "hk2": return "Thi HK";
      default: return cat.toUpperCase();
    }
  }
  /* ================= XỬ LÝ NÚT CHỌN ĐỀ ================= */
  function changeCategory(cat) {
    if (!cat) return;

    // sync UI
    setActiveButtons(cat);
    setActiveSelect(cat);

    // load dữ liệu
    loadDocuments(cat);
  }
  document.getElementById("cat-filters").addEventListener("click", e => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    changeCategory(btn.dataset.cat);
  });
  document.getElementById("cat-select").addEventListener("change", e => {
    changeCategory(e.target.value);
  });
  function setActiveButtons(cat) {
    document.querySelectorAll(".cat-filter").forEach(btn => {
      btn.classList.remove(
        "bg-neutral-900",
        "text-white",
        "shadow-sm",
        "bg-white",
        "border",
        "border-neutral-200",
        "text-neutral-600",
        "hover:bg-neutral-50"
      );

      if (btn.dataset.cat === cat) {
        btn.classList.add("bg-neutral-900", "text-white", "shadow-sm");
      } else {
        btn.classList.add(
          "bg-white",
          "border",
          "border-neutral-200",
          "text-neutral-600",
          "hover:bg-neutral-50"
        );
      }
    });
  }
  function setActiveSelect(cat) {
    const select = document.getElementById("cat-select");
    select.value = cat==="all"?"":cat;
  }

}
loadDCM();
