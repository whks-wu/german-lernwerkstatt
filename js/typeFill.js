const TypeFillModule = (function () {
  let state = null;
  let rootEl = null;
  let scoreEl = null;

  function init(lesson, root, score) {
    rootEl = root;
    scoreEl = score;
    state = { lesson };
    render();
  }

  function render() {
    rootEl.innerHTML = "";

    const title = document.createElement("h2");
    title.className = "exercise-title";
    title.textContent = state.lesson.title;
    const hint = document.createElement("p");
    hint.className = "exercise-hint";
    hint.textContent = state.lesson.hint;

    rootEl.appendChild(title);
    rootEl.appendChild(hint);

    state.lesson.sentences.forEach((s, i) => {
      const item = document.createElement("div");
      item.className = "type-item";

      const num = document.createElement("span");
      num.className = "sentence-num";
      num.textContent = `${i + 1}. `;
      item.appendChild(num);

      item.appendChild(document.createTextNode(s.before));

      const input = document.createElement("input");
      input.type = "text";
      input.autocomplete = "off";
      input.spellcheck = false;
      input.dataset.index = String(i);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") checkAnswers();
      });
      input.addEventListener("input", () => {
        input.classList.remove("is-correct", "is-incorrect");
        const reveal = item.querySelector(".answer-reveal");
        if (reveal) reveal.remove();
      });
      item.appendChild(input);

      item.appendChild(document.createTextNode(s.after));
      rootEl.appendChild(item);
    });

    scoreEl.textContent = "";
  }

  function checkAnswers() {
    const inputs = rootEl.querySelectorAll(".type-item input");
    let correct = 0;
    inputs.forEach((input) => {
      const i = Number(input.dataset.index);
      const answer = state.lesson.sentences[i].answer;
      const given = input.value.trim().toLowerCase();
      const item = input.closest(".type-item");
      const oldReveal = item.querySelector(".answer-reveal");
      if (oldReveal) oldReveal.remove();

      if (given && given === answer.toLowerCase()) {
        input.classList.remove("is-incorrect");
        input.classList.add("is-correct");
        correct++;
      } else {
        input.classList.remove("is-correct");
        input.classList.add("is-incorrect");
        const reveal = document.createElement("span");
        reveal.className = "answer-reveal";
        reveal.textContent = `正确答案：${answer}`;
        item.appendChild(reveal);
      }
    });
    scoreEl.textContent = `${correct} / ${inputs.length} 正确`;
  }

  function reset() {
    if (state) init(state.lesson, rootEl, scoreEl);
  }

  return { init, reset, checkAnswers };
})();
