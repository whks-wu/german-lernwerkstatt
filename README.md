# 跑鹅德语 · German Lernwerkstatt

一个轻量、免费、零依赖的德语课堂练习工具，支持拖拽选词填空（含图片配对）、连线题、打字填空三种题型，自带可视化题库编辑后台，手机和电脑都能用。

A lightweight, free, zero-dependency German classroom exercise tool with three exercise types — drag-and-drop fill-in-the-blank (including picture matching), line matching, and typed fill-in-the-blank — plus a visual editor for managing the question bank. Works on both desktop and mobile.

在线体验 / Live demo: **https://runner-german-lernwerkstatt.vercel.app**

![logo](images/logo-studio.png)

## 功能 / Features

- **选词填空 Drag-and-drop fill-in-the-blank**：把词库中的词拖到句子空格里，也支持把德语单词拖到对应的图片（emoji 或自定义图片）上。
  Drag words from the word bank into sentence blanks, or drag them onto matching pictures (emoji or your own image files).
- **连线题 Matching**：点击或拖拽连线，将德语单词与对应的中文/反义词等配对。
  Tap-to-connect or drag-to-connect pairing between German words and their translations, antonyms, etc.
- **打字填空 Typed fill-in-the-blank**：直接输入答案，大小写不敏感自动判分。
  Type the answer directly; checking is case-insensitive.
- **题库管理后台 Admin editor**（`admin.html`）：表单化增删改题目，本地自动保存草稿，一键导出 `data.js`。
  A form-based admin page to add/edit/delete lessons, with automatic local draft saving and one-click export to `data.js`.
- **移动端适配 Mobile-friendly**：三种题型在手机屏幕上都经过测试，触控拖拽体验良好。
  All three exercise types are tested and touch-friendly on mobile screens.

## 快速开始 / Quick start

**本地打开 / Run locally**

直接双击 [index.html](index.html) 用浏览器打开即可，无需安装任何东西。
Just double-click [index.html](index.html) and open it in your browser — no install required.

如果双击打开后功能异常（部分浏览器对本地文件有限制），可以起一个本地服务器：
If double-clicking doesn't work fully (some browsers restrict local `file://` access), serve it locally instead:

```bash
python3 -m http.server 8420 --directory german-lernwerkstatt
```

然后访问 `http://localhost:8420`。
Then open `http://localhost:8420`.

## 更新题库 / Updating the question bank

1. 打开网站右上角的"题库管理"链接，进入 `admin.html`。
   Open the "题库管理" (Admin) link in the top-right corner of the site to go to `admin.html`.
2. 在页面里增删改三种题型的练习内容，改动会自动保存草稿在浏览器本地。
   Add, edit, or delete lessons for all three exercise types; changes autosave as a local draft in your browser.
3. 点击"导出 data.js 文件"下载，替换项目里的 [js/data.js](js/data.js)。
   Click "导出 data.js 文件" (Export data.js) to download it, then replace [js/data.js](js/data.js) in the project.
4. 重新部署（见下方）使改动生效。
   Redeploy (see below) to make the changes live.

题库格式说明写在 [js/data.js](js/data.js) 文件开头的注释里。
The question-bank data format is documented in the comment at the top of [js/data.js](js/data.js).

## 部署 / Deployment

项目部署在 [Vercel](https://vercel.com) 免费套餐上，静态站点零配置。
The project is deployed on [Vercel](https://vercel.com)'s free tier as a zero-config static site.

```bash
npx vercel --prod --yes
```

## 项目结构 / Project structure

```
german-lernwerkstatt/
├── index.html          # 练习页面 / exercise page
├── admin.html           # 题库管理后台 / admin editor
├── css/
│   ├── style.css         # 主站样式 / main site styles
│   └── admin.css         # 后台样式 / admin editor styles
├── js/
│   ├── data.js            # 题库数据 / question bank data
│   ├── app.js              # 主站页面逻辑（标签切换等）/ main page logic (tabs, etc.)
│   ├── dragFill.js          # 选词填空逻辑 / drag-fill exercise logic
│   ├── matching.js           # 连线题逻辑 / matching exercise logic
│   ├── typeFill.js            # 打字填空逻辑 / typed fill-in logic
│   └── admin.js                # 后台编辑逻辑 / admin editor logic
└── images/               # logo、favicon、题库图片 / logo, favicon, exercise images
```

## 技术栈 / Tech stack

纯 HTML / CSS / JavaScript，无框架、无构建步骤、无第三方依赖。
Plain HTML / CSS / JavaScript — no framework, no build step, no third-party dependencies.
