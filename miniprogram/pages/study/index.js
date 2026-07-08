const questions = [
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

Page({
  data: {
    currentIndex: 0,
    total: questions.length,
    question: questions[0],
    selectedKey: "",
    inputValue: "",
    checked: false,
    isCorrect: false,
    feedback: "",
    progress: 33,
  },

  onLoad() {
    this.renderQuestion(0);
  },

  goBack() {
    wx.switchTab({
      url: "/pages/index/index",
    });
  },

  selectChoice(event) {
    if (this.data.checked) return;
    const selectedKey = event.currentTarget.dataset.key;
    this.setData({
      selectedKey,
    });
  },

  onAnswerInput(event) {
    this.setData({
      inputValue: event.detail.value,
    });
  },

  checkAnswer() {
    const { question, selectedKey, inputValue } = this.data;
    let isCorrect = false;

    if (question.type === "choice") {
      if (!selectedKey) {
        wx.showToast({
          title: "请选择答案",
          icon: "none",
        });
        return;
      }
      isCorrect = selectedKey === question.answer;
    } else {
      const normalizedInput = inputValue.trim().toLowerCase();
      if (!normalizedInput) {
        wx.showToast({
          title: "请输入答案",
          icon: "none",
        });
        return;
      }
      isCorrect = normalizedInput === question.answer.toLowerCase();
    }

    this.setData({
      checked: true,
      isCorrect,
      feedback: isCorrect
        ? "回答正确，太棒了，继续加油！"
        : `回答错误，正确答案：${question.answer}`,
    });
  },

  markUnknown() {
    const { question } = this.data;
    this.setData({
      checked: true,
      isCorrect: false,
      feedback: `先记一下，正确答案：${question.answer}`,
    });
  },

  nextQuestion() {
    const nextIndex = this.data.currentIndex + 1;
    if (nextIndex >= questions.length) {
      wx.showToast({
        title: "今天已经完成啦",
        icon: "none",
      });
      this.renderQuestion(0);
      return;
    }

    this.renderQuestion(nextIndex);
  },

  renderQuestion(index) {
    this.setData({
      currentIndex: index,
      question: questions[index],
      selectedKey: "",
      inputValue: "",
      checked: false,
      isCorrect: false,
      feedback: "",
      progress: Math.round(((index + 1) / questions.length) * 100),
    });
  },
});
