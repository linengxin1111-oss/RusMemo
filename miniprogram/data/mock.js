const homeStats = [
  { label: "待复习", value: 18 },
  { label: "新词", value: 12 },
  { label: "已掌握", value: 156 },
];

const homeEntries = [
  { title: "今日进度", desc: "A1 俄语基础", meta: "26%", tone: "primary", url: "/pages/study/index" },
  { title: "错词本", desc: "需要复习 24 个", meta: "去复习", tone: "error", url: "/pages/wrongWords/index" },
  { title: "单词本", desc: "已收录 200 个", meta: "查看", tone: "success", url: "/pages/words/index" },
];

const studyQuestions = [
  {
    type: "choice",
    prompt: "请选择正确的中文意思",
    russian: "добрый",
    meta: "[daˈbrij] · 形容词",
    answer: "B",
    choices: [
      { key: "A", text: "快乐的" },
      { key: "B", text: "善良的" },
      { key: "C", text: "忙碌的" },
      { key: "D", text: "大的" },
    ],
  },
  {
    type: "input",
    prompt: "请输入俄语",
    chinese: "谢谢",
    hint: "спасибо",
    answer: "спасибо",
  },
  {
    type: "choice",
    prompt: "请选择正确的中文意思",
    russian: "пожалуйста",
    meta: "副词 · 礼貌用语",
    answer: "C",
    choices: [
      { key: "A", text: "早上好" },
      { key: "B", text: "没关系" },
      { key: "C", text: "请；不客气" },
      { key: "D", text: "再见" },
    ],
  },
];

const words = [
  { russian: "добрый", meaning: "善良的", tag: "A1 基础词", type: "system" },
  { russian: "спасибо", meaning: "谢谢", tag: "A1 基础词", type: "system" },
  { russian: "пожалуйста", meaning: "不客气；请", tag: "A1 基础词", type: "system" },
  { russian: "извините", meaning: "对不起；打扰了", tag: "A1 基础词", type: "system" },
  { russian: "метро", meaning: "地铁", tag: "我的单词", type: "user" },
];

const wrongWords = [
  { russian: "время", meaning: "时间", count: "今日错 2 次" },
  { russian: "дорога", meaning: "道路；路", count: "今日错 1 次" },
  { russian: "нужный", meaning: "需要的；必要的", count: "本周错 2 次" },
  { russian: "говорить", meaning: "说话；交谈", count: "本周错 1 次" },
  { russian: "помогать", meaning: "帮助", count: "本周错 1 次" },
];

const statisticCards = [
  { label: "学习词汇", value: "128" },
  { label: "学习时长", value: "22 分钟" },
  { label: "正确率", value: "85%" },
];

const masteryLegend = [
  { label: "掌握", value: 208, color: "success" },
  { label: "学习中", value: 302, color: "purple" },
  { label: "未学习", value: 200, color: "muted" },
];

module.exports = {
  homeStats,
  homeEntries,
  studyQuestions,
  words,
  wrongWords,
  statisticCards,
  masteryLegend,
};
