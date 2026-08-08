(function () {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const panels = {
    drag: document.getElementById("panel-drag"),
    match: document.getElementById("panel-match"),
    type: document.getElementById("panel-type")
  };

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      Object.values(panels).forEach((p) => p.classList.remove("is-active"));
      panels[btn.dataset.tab].classList.add("is-active");
    });
  });

  function fillSelect(selectEl, lessons) {
    selectEl.innerHTML = "";
    lessons.forEach((lesson, i) => {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = lesson.title;
      selectEl.appendChild(opt);
    });
  }

  // --- drag fill ---
  const dragSelect = document.getElementById("drag-lesson-select");
  const dragRoot = document.getElementById("drag-exercise-root");
  const dragScore = document.getElementById("drag-score");
  fillSelect(dragSelect, GERMAN_DATA.dragFill);
  dragSelect.addEventListener("change", () => {
    DragFillModule.init(GERMAN_DATA.dragFill[Number(dragSelect.value)], dragRoot, dragScore);
  });
  document.getElementById("drag-reset-btn").addEventListener("click", () => DragFillModule.reset());
  DragFillModule.init(GERMAN_DATA.dragFill[0], dragRoot, dragScore);

  // --- matching ---
  const matchSelect = document.getElementById("match-lesson-select");
  const matchRoot = document.getElementById("match-exercise-root");
  const matchScore = document.getElementById("match-score");
  fillSelect(matchSelect, GERMAN_DATA.matching);
  matchSelect.addEventListener("change", () => {
    MatchingModule.init(GERMAN_DATA.matching[Number(matchSelect.value)], matchRoot, matchScore);
  });
  document.getElementById("match-reset-btn").addEventListener("click", () => MatchingModule.reset());
  MatchingModule.init(GERMAN_DATA.matching[0], matchRoot, matchScore);

  // --- type fill ---
  const typeSelect = document.getElementById("type-lesson-select");
  const typeRoot = document.getElementById("type-exercise-root");
  const typeScore = document.getElementById("type-score");
  fillSelect(typeSelect, GERMAN_DATA.typeFill);
  typeSelect.addEventListener("change", () => {
    TypeFillModule.init(GERMAN_DATA.typeFill[Number(typeSelect.value)], typeRoot, typeScore);
  });
  document.getElementById("type-reset-btn").addEventListener("click", () => TypeFillModule.reset());
  document.getElementById("type-check-btn").addEventListener("click", () => TypeFillModule.checkAnswers());
  TypeFillModule.init(GERMAN_DATA.typeFill[0], typeRoot, typeScore);
})();
