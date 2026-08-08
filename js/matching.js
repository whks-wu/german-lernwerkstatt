const MatchingModule = (function () {
  let state = null;
  let rootEl = null;
  let scoreEl = null;
  let boardEl = null;
  let svgEl = null;
  let tempLineEl = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function init(lesson, root, score) {
    rootEl = root;
    scoreEl = score;
    const order = shuffle(lesson.pairs.map((_, i) => i));
    state = {
      lesson,
      rightOrder: order,
      matched: new Set(),
      selectedLeftId: null
    };
    render();
  }

  function updateScore() {
    const total = state.lesson.pairs.length;
    scoreEl.textContent = `${state.matched.size} / ${total} 已连接`;
  }

  function render() {
    rootEl.innerHTML = "";

    const title = document.createElement("h2");
    title.className = "exercise-title";
    title.textContent = state.lesson.title;
    const hint = document.createElement("p");
    hint.className = "exercise-hint";
    hint.textContent = state.lesson.hint;

    boardEl = document.createElement("div");
    boardEl.className = "match-board";

    const leftCol = document.createElement("div");
    leftCol.className = "match-col left";
    state.lesson.pairs.forEach((pair, i) => {
      leftCol.appendChild(makeItem(pair.left, i, "left"));
    });

    const rightCol = document.createElement("div");
    rightCol.className = "match-col right";
    state.rightOrder.forEach((i) => {
      rightCol.appendChild(makeItem(state.lesson.pairs[i].right, i, "right"));
    });

    svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgEl.classList.add("match-svg");

    boardEl.appendChild(leftCol);
    boardEl.appendChild(svgEl);
    boardEl.appendChild(rightCol);

    rootEl.appendChild(title);
    rootEl.appendChild(hint);
    rootEl.appendChild(boardEl);

    updateScore();

    // redraw permanent lines for already-matched pairs (after re-render, e.g. window resize)
    requestAnimationFrame(() => {
      state.matched.forEach((pairId) => drawPermanentLine(pairId));
    });
  }

  function makeItem(text, pairId, side) {
    const el = document.createElement("div");
    el.className = "match-item";
    el.dataset.pairId = String(pairId);
    el.dataset.side = side;
    el.textContent = text;

    const anchor = document.createElement("span");
    anchor.className = "anchor";
    el.appendChild(anchor);

    if (state.matched.has(pairId)) el.classList.add("is-matched");

    if (side === "left") {
      el.addEventListener("pointerdown", (e) => onLeftPointerDown(e, el, pairId));
    } else {
      el.addEventListener("pointerdown", (e) => onRightPointerDown(e, el, pairId));
    }

    return el;
  }

  function boardPoint(clientX, clientY) {
    const r = boardEl.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  }

  function anchorPoint(itemEl) {
    const anchor = itemEl.querySelector(".anchor");
    const r = anchor.getBoundingClientRect();
    return boardPoint(r.left + r.width / 2, r.top + r.height / 2);
  }

  function findRightItemUnder(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const item = el.closest('.match-item[data-side="right"]');
    return item;
  }

  function drawTempLine(from, to) {
    if (!tempLineEl) {
      tempLineEl = document.createElementNS("http://www.w3.org/2000/svg", "line");
      tempLineEl.classList.add("match-line-temp");
      svgEl.appendChild(tempLineEl);
    }
    tempLineEl.setAttribute("x1", from.x);
    tempLineEl.setAttribute("y1", from.y);
    tempLineEl.setAttribute("x2", to.x);
    tempLineEl.setAttribute("y2", to.y);
  }

  function clearTempLine() {
    if (tempLineEl) {
      tempLineEl.remove();
      tempLineEl = null;
    }
  }

  function drawPermanentLine(pairId) {
    const leftItem = boardEl.querySelector(`.match-item[data-side="left"][data-pair-id="${pairId}"]`);
    const rightItem = boardEl.querySelector(`.match-item[data-side="right"][data-pair-id="${pairId}"]`);
    if (!leftItem || !rightItem) return;
    const from = anchorPoint(leftItem);
    const to = anchorPoint(rightItem);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.classList.add("match-line");
    line.setAttribute("x1", from.x);
    line.setAttribute("y1", from.y);
    line.setAttribute("x2", to.x);
    line.setAttribute("y2", to.y);
    svgEl.appendChild(line);
  }

  function flashWrong(...els) {
    els.forEach((el) => el && el.classList.add("is-wrong"));
    setTimeout(() => {
      els.forEach((el) => el && el.classList.remove("is-wrong"));
    }, 450);
  }

  function selectLeft(el, pairId) {
    clearSelection();
    state.selectedLeftId = pairId;
    el.classList.add("is-active");
  }

  function clearSelection() {
    if (state.selectedLeftId === null) return;
    const prev = boardEl.querySelector(`.match-item[data-side="left"][data-pair-id="${state.selectedLeftId}"]`);
    if (prev) prev.classList.remove("is-active");
    state.selectedLeftId = null;
  }

  function attemptMatch(leftPairId, rightEl, rightPairId) {
    const leftEl = boardEl.querySelector(`.match-item[data-side="left"][data-pair-id="${leftPairId}"]`);
    if (leftPairId === rightPairId) {
      state.matched.add(leftPairId);
      leftEl.classList.remove("is-active");
      leftEl.classList.add("is-matched");
      rightEl.classList.add("is-matched");
      drawPermanentLine(leftPairId);
      updateScore();
    } else {
      flashWrong(leftEl, rightEl);
    }
    clearSelection();
  }

  function onLeftPointerDown(e, leftEl, pairId) {
    if (state.matched.has(pairId)) return;
    e.preventDefault();
    const start = { x: e.clientX, y: e.clientY };
    let dragged = false;

    const onMove = (ev) => {
      const dist = Math.hypot(ev.clientX - start.x, ev.clientY - start.y);
      if (dist > 6) dragged = true;
      const from = anchorPoint(leftEl);
      const to = boardPoint(ev.clientX, ev.clientY);
      drawTempLine(from, to);
      boardEl.querySelectorAll('.match-item[data-side="right"]').forEach((r) => r.classList.remove("is-active"));
      const target = findRightItemUnder(ev.clientX, ev.clientY);
      if (target && !target.classList.contains("is-matched")) target.classList.add("is-active");
    };

    const onUp = (ev) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      clearTempLine();
      boardEl.querySelectorAll('.match-item[data-side="right"]').forEach((r) => r.classList.remove("is-active"));

      const target = findRightItemUnder(ev.clientX, ev.clientY);
      if (target && !target.classList.contains("is-matched")) {
        attemptMatch(pairId, target, Number(target.dataset.pairId));
      } else if (!dragged) {
        selectLeft(leftEl, pairId);
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function onRightPointerDown(e, rightEl, pairId) {
    if (rightEl.classList.contains("is-matched")) return;
    e.preventDefault();
    if (state.selectedLeftId !== null) {
      attemptMatch(state.selectedLeftId, rightEl, pairId);
    }
  }

  function reset() {
    if (state) init(state.lesson, rootEl, scoreEl);
  }

  return { init, reset };
})();
