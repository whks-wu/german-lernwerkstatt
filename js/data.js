/*
  题库编辑说明：
  - dragFill 有两种题型，一个 lesson 只能选一种：
      1. 句子填空：写 sentences 数组，每个 sentence 是 { before, answer, after }。
      2. 图片配对：写 items 数组代替 sentences，每个 item 是 { image, answer }。
         image 可以是一个 emoji（如 "🐕"），也可以是图片文件名（先把图片放进
         images 文件夹，再写 "images/hund.jpg" 这样的相对路径）。
  - words 是词库（可含重复词和干扰项），只要包含每道题的 answer 即可，顺序不重要。
  - matching 每个 pair 是 { left, right }，同一题内 right 文本不要重复，否则连线时无法区分。
  - typeFill 与 dragFill 的句子填空结构相同：{ before, answer, after }。
  照着已有的写法复制粘贴、替换文字即可新增练习。
*/

const GERMAN_DATA = {
  dragFill: [
    {
      id: "sein-konjugation",
      title: "sein 动词变位",
      hint: "把词库中的词拖到正确的空格里，注意人称对应的动词形式。",
      words: ["bin", "bist", "ist", "sind", "sind", "seid", "war"],
      sentences: [
        { before: "Ich ", answer: "bin", after: " Studentin." },
        { before: "Du ", answer: "bist", after: " sehr nett." },
        { before: "Er ", answer: "ist", after: " Lehrer." },
        { before: "Wir ", answer: "sind", after: " zu Hause." },
        { before: "Ihr ", answer: "seid", after: " spät dran." },
        { before: "Sie (Pl.) ", answer: "sind", after: " gute Freunde." }
      ]
    },
    {
      id: "bestimmte-artikel",
      title: "定冠词 der / die / das",
      hint: "根据名词的性别，把正确的冠词拖到空格里。",
      words: ["der", "der", "die", "die", "das", "das", "dem"],
      sentences: [
        { before: "", answer: "der", after: " Mann trinkt Kaffee." },
        { before: "", answer: "die", after: " Frau liest ein Buch." },
        { before: "", answer: "das", after: " Kind spielt im Garten." },
        { before: "", answer: "der", after: " Tisch ist neu." },
        { before: "", answer: "die", after: " Lampe ist kaputt." },
        { before: "", answer: "das", after: " Auto ist rot." }
      ]
    },
    {
      id: "tiere-bilder",
      title: "动物图片配对",
      hint: "把词库中正确的德语单词拖到对应的图片下面。",
      words: ["der Hund", "die Katze", "der Vogel", "die Maus", "das Pferd", "der Fisch"],
      items: [
        { image: "🐕", answer: "der Hund" },
        { image: "🐈", answer: "die Katze" },
        { image: "🐦", answer: "der Vogel" },
        { image: "🐁", answer: "die Maus" },
        { image: "🐴", answer: "das Pferd" },
        { image: "🐟", answer: "der Fisch" }
      ]
    }
  ],

  matching: [
    {
      id: "grundwortschatz",
      title: "基础词汇配对",
      hint: "点击左侧的德语单词，再点击右侧对应的中文意思，或者直接从圆点拖一条线过去。",
      pairs: [
        { left: "der Hund", right: "狗" },
        { left: "die Katze", right: "猫" },
        { left: "das Buch", right: "书" },
        { left: "das Haus", right: "房子" },
        { left: "der Apfel", right: "苹果" },
        { left: "das Wasser", right: "水" },
        { left: "der Freund", right: "朋友" },
        { left: "die Schule", right: "学校" }
      ]
    },
    {
      id: "antonyme",
      title: "反义词配对",
      hint: "把左边的德语形容词和右边的反义词连起来。",
      pairs: [
        { left: "groß", right: "klein" },
        { left: "heiß", right: "kalt" },
        { left: "alt", right: "neu" },
        { left: "schnell", right: "langsam" },
        { left: "gut", right: "schlecht" },
        { left: "viel", right: "wenig" }
      ]
    }
  ],

  typeFill: [
    {
      id: "sein-eingabe",
      title: "sein 动词变位（打字输入）",
      hint: "在空格中输入 sein 的正确变位形式，大小写不敏感。",
      sentences: [
        { before: "Ich ", answer: "bin", after: " glücklich." },
        { before: "Du ", answer: "bist", after: " mein Freund." },
        { before: "Er ", answer: "ist", after: " Arzt." },
        { before: "Wir ", answer: "sind", after: " in Berlin." },
        { before: "Ihr ", answer: "seid", after: " willkommen." },
        { before: "Sie (formell) ", answer: "sind", after: " sehr nett." }
      ]
    },
    {
      id: "plural-formen",
      title: "名词复数形式",
      hint: "根据单数名词，输入对应的复数形式（不用输入冠词）。",
      sentences: [
        { before: "das Kind → die ", answer: "Kinder", after: "" },
        { before: "der Mann → die ", answer: "Männer", after: "" },
        { before: "die Frau → die ", answer: "Frauen", after: "" },
        { before: "das Buch → die ", answer: "Bücher", after: "" },
        { before: "der Tisch → die ", answer: "Tische", after: "" },
        { before: "die Blume → die ", answer: "Blumen", after: "" }
      ]
    }
  ]
};
