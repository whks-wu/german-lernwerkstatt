const DragFillModule = (function () {
  let state = null;
  let rootEl = null;
  let scoreEl = null;
  let ghostEl = null;

  function init(lesson, root, score) {
    rootEl = root;
    scoreEl = score;
    state = {
      lesson,
      chips: lesson.words.map((text, i) => ({ id: i, text, placedAt: null }))
    };
    render();
  }

  function getEntries(lesson) {
    return lesson.items || lesson.sentences;
  }

  function isImageMode(lesson) {
    return Boolean(lesson.items);
  }

  function looksLikeImageFile(str) {
    return /\.(png|jpe?g|gif|svg|webp)$/i.test(str) || str.startsWith("images/") || str.startsWith("http");
  }

  function chipAt(entryIndex) {
    return state.chips.find((c) => c.placedAt === entryIndex) || null;
  }

  function updateScore() {
    const entries = getEntries(state.lesson);
    const total = entries.length;
    let correct = 0;
    entries.forEach((entry, i) => {
      const chip = chipAt(i);
      if (chip && chip.text === entry.answer) correct++;
    });
    scoreEl.textContent = `${correct} / ${total} 正确`;
  }

  function render() {
    rootEl.innerHTML = "";

    const title = document.createElement("h2");
    title.className = "exercise-title";
    title.textContent = state.lesson.title;
    const hint = document.createElement("p");
    hint.className = "exercise-hint";
    hint.textContent = state.lesson.hint;

    const bank = document.createElement("div");
    bank.className = "word-bank";
    state.chips
      .filter((c) => c.placedAt === null)
      .forEach((chip) => bank.appendChild(makeChipEl(chip)));

    const entries = getEntries(state.lesson);
    const list = document.createElement("div");

    if (isImageMode(state.lesson)) {
      list.className = "image-grid";
      entries.forEach((entry, i) => {
        list.appendChild(makeImageCard(entry, i));
      });
    } else {
      list.className = "sentence-list";
      entries.forEach((s, i) => {
        list.appendChild(makeSentenceRow(s, i));
      });
    }

    rootEl.appendChild(title);
    rootEl.appendChild(hint);
    rootEl.appendChild(bank);
    rootEl.appendChild(list);

    updateScore();
  }

  function makeBlankSlot(entry, index) {
    const slot = document.createElement("span");
    slot.className = "blank-slot";
    slot.dataset.sentenceIndex = String(index);

    const placed = chipAt(index);
    if (placed) {
      slot.appendChild(makeChipEl(placed, true));
      slot.classList.add(placed.text === entry.answer ? "is-correct" : "is-incorrect");
    }
    return slot;
  }

  function makeSentenceRow(s, i) {
    const row = document.createElement("div");
    row.className = "sentence-row";

    const num = document.createElement("span");
    num.className = "sentence-num";
    num.textContent = `${i + 1}.`;
    row.appendChild(num);

    row.appendChild(document.createTextNode(s.before));
    row.appendChild(makeBlankSlot(s, i));
    row.appendChild(document.createTextNode(s.after));
    return row;
  }

  function makeImageCard(entry, i) {
    const card = document.createElement("div");
    card.className = "image-card";

    const visual = document.createElement("div");
    visual.className = "image-visual";
    if (looksLikeImageFile(entry.image)) {
      const img = document.createElement("img");
      img.src = entry.image;
      img.alt = "";
      visual.appendChild(img);
    } else {
      visual.textContent = entry.image;
    }
    card.appendChild(visual);
    card.appendChild(makeBlankSlot(entry, i));
    return card;
  }

  function makeChipEl(chip, placedStyle) {
    const el = document.createElement("span");
    el.className = placedStyle ? "word-chip placed-chip" : "word-chip";
    el.textContent = chip.text;
    el.dataset.chipId = String(chip.id);
    el.addEventListener("pointerdown", (e) => onPointerDown(e, chip.id));
    return el;
  }

  function onPointerDown(e, chipId) {
    e.preventDefault();
    const chip = state.chips.find((c) => c.id === chipId);
    if (!chip) return;

    const sourceEl = e.currentTarget;
    sourceEl.classList.add("is-dragging");

    ghostEl = document.createElement("div");
    ghostEl.className = "drag-ghost";
    ghostEl.textContent = chip.text;
    document.body.appendChild(ghostEl);
    moveGhost(e.clientX, e.clientY);

    const onMove = (ev) => {
      moveGhost(ev.clientX, ev.clientY);
      clearOverStates();
      const target = findSlotUnder(ev.clientX, ev.clientY);
      if (target) target.classList.add("is-over");
    };

    const onUp = (ev) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      sourceEl.classList.remove("is-dragging");
      clearOverStates();
      if (ghostEl) {
        ghostEl.remove();
        ghostEl = null;
      }

      const target = findSlotUnder(ev.clientX, ev.clientY);
      if (target) {
        const targetIndex = Number(target.dataset.sentenceIndex);
        placeChip(chipId, targetIndex);
      } else {
        returnChipToBank(chipId);
      }
      render();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function findSlotUnder(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    return el.closest(".blank-slot");
  }

  function clearOverStates() {
    rootEl.querySelectorAll(".blank-slot.is-over").forEach((el) => el.classList.remove("is-over"));
  }

  function moveGhost(x, y) {
    if (!ghostEl) return;
    ghostEl.style.left = x + "px";
    ghostEl.style.top = y + "px";
  }

  function placeChip(chipId, targetIndex) {
    const chip = state.chips.find((c) => c.id === chipId);
    if (!chip) return;
    if (chip.placedAt === targetIndex) return;

    const occupant = chipAt(targetIndex);
    if (occupant && occupant.id !== chipId) {
      occupant.placedAt = null;
    }
    chip.placedAt = targetIndex;
  }

  function returnChipToBank(chipId) {
    const chip = state.chips.find((c) => c.id === chipId);
    if (chip) chip.placedAt = null;
  }

  function reset() {
    if (state) init(state.lesson, rootEl, scoreEl);
  }

  return { init, reset };
})();
