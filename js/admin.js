(function () {
  const DRAFT_KEY = "glw_draft_v1";
  let state = null;

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function newId(prefix) {
    return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function looksLikeImageFile(str) {
    return /\.(png|jpe?g|gif|svg|webp)$/i.test(str || "") || (str || "").startsWith("images/") || (str || "").startsWith("http");
  }

  function loadState() {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        /* fall through to fresh copy */
      }
    }
    return clone(GERMAN_DATA);
  }

  function saveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
    const statusEl = document.getElementById("admin-status");
    const now = new Date();
    statusEl.textContent = `草稿已自动保存 · ${now.toLocaleTimeString("zh-CN", { hour12: false })}`;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function labeledField(labelText, helpText) {
    const wrap = document.createElement("div");
    const label = el("label", "field-label", labelText);
    wrap.appendChild(label);
    if (helpText) wrap.appendChild(el("p", "hint-help", helpText));
    return wrap;
  }

  // ---------- drag fill ----------

  function renderDragSection() {
    const container = document.getElementById("admin-drag-lessons");
    container.innerHTML = "";
    state.dragFill.forEach((lesson, li) => container.appendChild(buildDragLessonCard(lesson, li)));
  }

  function buildDragLessonCard(lesson, li) {
    const isImage = Boolean(lesson.items);
    const card = el("div", "lesson-card");

    const head = el("div", "lesson-head");
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.value = lesson.title;
    titleInput.addEventListener("input", () => {
      lesson.title = titleInput.value;
      saveDraft();
    });
    head.appendChild(titleInput);
    head.appendChild(el("span", "mode-badge", isImage ? "图片配对" : "句子填空"));
    const delLessonBtn = el("button", "btn-secondary delete-lesson-btn", "删除本练习");
    delLessonBtn.addEventListener("click", () => {
      if (!confirm(`确定删除练习「${lesson.title}」吗？`)) return;
      state.dragFill.splice(li, 1);
      saveDraft();
      renderDragSection();
    });
    head.appendChild(delLessonBtn);
    card.appendChild(head);

    const hintField = labeledField("提示语（显示在题目上方）");
    const hintInput = document.createElement("input");
    hintInput.type = "text";
    hintInput.value = lesson.hint || "";
    hintInput.addEventListener("input", () => {
      lesson.hint = hintInput.value;
      saveDraft();
    });
    hintField.appendChild(hintInput);
    card.appendChild(hintField);

    const wordsField = labeledField("词库（每行一个词，可以重复出现，也可以加干扰项）");
    const wordsArea = document.createElement("textarea");
    wordsArea.className = "words-textarea";
    wordsArea.value = (lesson.words || []).join("\n");
    wordsArea.addEventListener("input", () => {
      lesson.words = wordsArea.value.split("\n").map((w) => w.trim()).filter(Boolean);
      saveDraft();
    });
    wordsField.appendChild(wordsArea);
    card.appendChild(wordsField);

    if (isImage) {
      card.appendChild(labeledField("图片题目", "image 一栏可以填 emoji（如 🐕），也可以填图片文件名，比如先把图片放进 images 文件夹，再填 images/hund.jpg"));
      const itemsWrap = el("div");
      lesson.items.forEach((item, ii) => itemsWrap.appendChild(buildImageItemRow(lesson, item, ii, () => renderDragSection())));
      card.appendChild(itemsWrap);

      const addBtn = el("button", "btn-secondary add-item-btn", "+ 添加图片题");
      addBtn.addEventListener("click", () => {
        lesson.items.push({ image: "", answer: "" });
        saveDraft();
        renderDragSection();
      });
      card.appendChild(addBtn);
    } else {
      card.appendChild(labeledField("句子（before + 答案 + after，答案就是要拖进空格的词）"));
      const itemsWrap = el("div");
      lesson.sentences.forEach((s, si) => itemsWrap.appendChild(buildSentenceRow(lesson.sentences, s, si, () => renderDragSection())));
      card.appendChild(itemsWrap);

      const addBtn = el("button", "btn-secondary add-item-btn", "+ 添加句子");
      addBtn.addEventListener("click", () => {
        lesson.sentences.push({ before: "", answer: "", after: "" });
        saveDraft();
        renderDragSection();
      });
      card.appendChild(addBtn);
    }

    return card;
  }

  function buildSentenceRow(list, s, i, onRemove) {
    const row = el("div", "item-row");

    const before = document.createElement("input");
    before.type = "text";
    before.className = "field-before";
    before.placeholder = "空格前的文字";
    before.value = s.before;
    before.addEventListener("input", () => {
      s.before = before.value;
      saveDraft();
    });

    const answer = document.createElement("input");
    answer.type = "text";
    answer.className = "field-answer";
    answer.placeholder = "答案";
    answer.value = s.answer;
    answer.addEventListener("input", () => {
      s.answer = answer.value;
      saveDraft();
    });

    const after = document.createElement("input");
    after.type = "text";
    after.className = "field-after";
    after.placeholder = "空格后的文字";
    after.value = s.after;
    after.addEventListener("input", () => {
      s.after = after.value;
      saveDraft();
    });

    const del = el("button", "icon-btn", "×");
    del.title = "删除这一行";
    del.addEventListener("click", () => {
      list.splice(i, 1);
      saveDraft();
      onRemove();
    });

    row.appendChild(before);
    row.appendChild(answer);
    row.appendChild(after);
    row.appendChild(del);
    return row;
  }

  function updateMiniPreview(previewEl, value) {
    previewEl.innerHTML = "";
    if (!value) return;
    if (looksLikeImageFile(value)) {
      const img = document.createElement("img");
      img.src = value;
      img.alt = "";
      previewEl.appendChild(img);
    } else {
      previewEl.textContent = value;
    }
  }

  function buildImageItemRow(lesson, item, i, onRemove) {
    const row = el("div", "item-row");

    const preview = el("span", "mini-preview");
    updateMiniPreview(preview, item.image);

    const imageInput = document.createElement("input");
    imageInput.type = "text";
    imageInput.placeholder = "emoji 或 images/xxx.jpg";
    imageInput.value = item.image;
    imageInput.addEventListener("input", () => {
      item.image = imageInput.value;
      updateMiniPreview(preview, item.image);
      saveDraft();
    });

    const answer = document.createElement("input");
    answer.type = "text";
    answer.className = "field-answer";
    answer.placeholder = "答案（德语词）";
    answer.value = item.answer;
    answer.addEventListener("input", () => {
      item.answer = answer.value;
      saveDraft();
    });

    const del = el("button", "icon-btn", "×");
    del.title = "删除这一行";
    del.addEventListener("click", () => {
      lesson.items.splice(i, 1);
      saveDraft();
      onRemove();
    });

    row.appendChild(preview);
    row.appendChild(imageInput);
    row.appendChild(answer);
    row.appendChild(del);
    return row;
  }

  // ---------- matching ----------

  function renderMatchSection() {
    const container = document.getElementById("admin-match-lessons");
    container.innerHTML = "";
    state.matching.forEach((lesson, li) => container.appendChild(buildMatchLessonCard(lesson, li)));
  }

  function buildMatchLessonCard(lesson, li) {
    const card = el("div", "lesson-card");

    const head = el("div", "lesson-head");
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.value = lesson.title;
    titleInput.addEventListener("input", () => {
      lesson.title = titleInput.value;
      saveDraft();
    });
    head.appendChild(titleInput);
    const delLessonBtn = el("button", "btn-secondary delete-lesson-btn", "删除本练习");
    delLessonBtn.addEventListener("click", () => {
      if (!confirm(`确定删除练习「${lesson.title}」吗？`)) return;
      state.matching.splice(li, 1);
      saveDraft();
      renderMatchSection();
    });
    head.appendChild(delLessonBtn);
    card.appendChild(head);

    const hintField = labeledField("提示语");
    const hintInput = document.createElement("input");
    hintInput.type = "text";
    hintInput.value = lesson.hint || "";
    hintInput.addEventListener("input", () => {
      lesson.hint = hintInput.value;
      saveDraft();
    });
    hintField.appendChild(hintInput);
    card.appendChild(hintField);

    card.appendChild(labeledField("配对（左边德语，右边中文/反义词等，右边文字在同一题里不要重复）"));
    const itemsWrap = el("div");
    lesson.pairs.forEach((p, pi) => itemsWrap.appendChild(buildPairRow(lesson.pairs, p, pi, () => renderMatchSection())));
    card.appendChild(itemsWrap);

    const addBtn = el("button", "btn-secondary add-item-btn", "+ 添加配对");
    addBtn.addEventListener("click", () => {
      lesson.pairs.push({ left: "", right: "" });
      saveDraft();
      renderMatchSection();
    });
    card.appendChild(addBtn);

    return card;
  }

  function buildPairRow(list, p, i, onRemove) {
    const row = el("div", "item-row");

    const left = document.createElement("input");
    left.type = "text";
    left.className = "field-left";
    left.placeholder = "左边（德语）";
    left.value = p.left;
    left.addEventListener("input", () => {
      p.left = left.value;
      saveDraft();
    });

    const right = document.createElement("input");
    right.type = "text";
    right.className = "field-right";
    right.placeholder = "右边（对应内容）";
    right.value = p.right;
    right.addEventListener("input", () => {
      p.right = right.value;
      saveDraft();
    });

    const del = el("button", "icon-btn", "×");
    del.title = "删除这一行";
    del.addEventListener("click", () => {
      list.splice(i, 1);
      saveDraft();
      onRemove();
    });

    row.appendChild(left);
    row.appendChild(right);
    row.appendChild(del);
    return row;
  }

  // ---------- type fill ----------

  function renderTypeSection() {
    const container = document.getElementById("admin-type-lessons");
    container.innerHTML = "";
    state.typeFill.forEach((lesson, li) => container.appendChild(buildTypeLessonCard(lesson, li)));
  }

  function buildTypeLessonCard(lesson, li) {
    const card = el("div", "lesson-card");

    const head = el("div", "lesson-head");
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.value = lesson.title;
    titleInput.addEventListener("input", () => {
      lesson.title = titleInput.value;
      saveDraft();
    });
    head.appendChild(titleInput);
    const delLessonBtn = el("button", "btn-secondary delete-lesson-btn", "删除本练习");
    delLessonBtn.addEventListener("click", () => {
      if (!confirm(`确定删除练习「${lesson.title}」吗？`)) return;
      state.typeFill.splice(li, 1);
      saveDraft();
      renderTypeSection();
    });
    head.appendChild(delLessonBtn);
    card.appendChild(head);

    const hintField = labeledField("提示语");
    const hintInput = document.createElement("input");
    hintInput.type = "text";
    hintInput.value = lesson.hint || "";
    hintInput.addEventListener("input", () => {
      lesson.hint = hintInput.value;
      saveDraft();
    });
    hintField.appendChild(hintInput);
    card.appendChild(hintField);

    card.appendChild(labeledField("句子（before + 答案 + after，答案是学生要打字输入的内容）"));
    const itemsWrap = el("div");
    lesson.sentences.forEach((s, si) => itemsWrap.appendChild(buildSentenceRow(lesson.sentences, s, si, () => renderTypeSection())));
    card.appendChild(itemsWrap);

    const addBtn = el("button", "btn-secondary add-item-btn", "+ 添加句子");
    addBtn.addEventListener("click", () => {
      lesson.sentences.push({ before: "", answer: "", after: "" });
      saveDraft();
      renderTypeSection();
    });
    card.appendChild(addBtn);

    return card;
  }

  // ---------- global controls ----------

  function renderAll() {
    renderDragSection();
    renderMatchSection();
    renderTypeSection();
  }

  function setupTabs() {
    const buttons = document.querySelectorAll(".tab-btn");
    const panels = {
      drag: document.getElementById("admin-panel-drag"),
      match: document.getElementById("admin-panel-match"),
      type: document.getElementById("admin-panel-type")
    };
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        Object.values(panels).forEach((p) => p.classList.remove("is-active"));
        panels[btn.dataset.tab].classList.add("is-active");
      });
    });
  }

  function setupGlobalButtons() {
    document.getElementById("add-drag-sentence-lesson").addEventListener("click", () => {
      state.dragFill.push({
        id: newId("drag"),
        title: "新的句子填空练习",
        hint: "",
        words: [],
        sentences: [{ before: "", answer: "", after: "" }]
      });
      saveDraft();
      renderDragSection();
    });

    document.getElementById("add-drag-image-lesson").addEventListener("click", () => {
      state.dragFill.push({
        id: newId("drag"),
        title: "新的图片配对练习",
        hint: "",
        words: [],
        items: [{ image: "", answer: "" }]
      });
      saveDraft();
      renderDragSection();
    });

    document.getElementById("add-match-lesson").addEventListener("click", () => {
      state.matching.push({
        id: newId("match"),
        title: "新的连线练习",
        hint: "",
        pairs: [{ left: "", right: "" }]
      });
      saveDraft();
      renderMatchSection();
    });

    document.getElementById("add-type-lesson").addEventListener("click", () => {
      state.typeFill.push({
        id: newId("type"),
        title: "新的打字填空练习",
        hint: "",
        sentences: [{ before: "", answer: "", after: "" }]
      });
      saveDraft();
      renderTypeSection();
    });

    document.getElementById("reset-btn").addEventListener("click", () => {
      if (!confirm("确定放弃当前所有未导出的修改，重新从 data.js 加载吗？")) return;
      localStorage.removeItem(DRAFT_KEY);
      state = clone(GERMAN_DATA);
      renderAll();
      document.getElementById("admin-status").textContent = "已重新从 data.js 加载";
    });

    document.getElementById("export-btn").addEventListener("click", () => {
      const content = "const GERMAN_DATA = " + JSON.stringify(state, null, 2) + ";\n";
      const blob = new Blob([content], { type: "text/javascript" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data.js";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      document.getElementById("admin-status").textContent = "已导出 data.js，请用它替换项目里 js/data.js 文件，再重新部署";
    });
  }

  state = loadState();
  setupTabs();
  setupGlobalButtons();
  renderAll();
  if (localStorage.getItem(DRAFT_KEY)) {
    document.getElementById("admin-status").textContent = "已恢复上次未导出的草稿";
  }
})();
