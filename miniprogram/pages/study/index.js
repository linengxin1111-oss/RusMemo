const { studyQuestions } = require("../../data/mock");

Page({
  data: {
    loading: true,
    loadError: "",
    questions: [],
    currentIndex: 0,
    displayIndex: 0,
    total: 0,
    question: null,
    selectedKey: "",
    inputValue: "",
    checked: false,
    answerSaving: false,
    isCorrect: false,
    feedback: "",
    progress: 0,
  },

  onLoad() {
    this.loadStudySession();
  },

  goBack() {
    wx.switchTab({
      url: "/pages/index/index",
    });
  },

  loadStudySession() {
    const mode = wx.getStorageSync("studyMode") || "normal";
    wx.removeStorageSync("studyMode");

    this.setData({
      loading: true,
      loadError: "",
    });

    wx.cloud.callFunction({
      name: "getStudySession",
      data: {
        limit: 10,
        mode,
      },
      success: (res) => {
        const result = res.result || {};
        const questions = Array.isArray(result.questions) ? result.questions : [];

        if (!result.success || !questions.length) {
          if (mode === "wrong") {
            this.setData({
              loading: false,
              loadError: "",
              questions: [],
              total: 0,
            });
            this.renderQuestion(0);
            wx.showToast({
              title: "暂无错词可复习",
              icon: "none",
            });
            return;
          }

          this.useFallbackQuestions("还没有可学习的单词，先用示例题练一下");
          return;
        }

        this.setData({
          loading: false,
          loadError: "",
          questions,
          total: questions.length,
        });
        this.renderQuestion(0);
      },
      fail: () => {
        this.useFallbackQuestions("云端题目暂时不可用，已切换到示例题");
      },
    });
  },

  useFallbackQuestions(message) {
    this.setData({
      loading: false,
      loadError: message,
      questions: studyQuestions,
      total: studyQuestions.length,
    });
    this.renderQuestion(0);
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
    const { question, selectedKey, inputValue, answerSaving } = this.data;
    if (answerSaving) return;
    if (!question) return;
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
      answerSaving: Boolean(question.wordId),
      isCorrect,
      feedback: isCorrect
        ? "回答正确，太棒了，继续加油！"
        : `回答错误，正确答案：${question.answerText || question.answer}`,
    });

    this.recordAnswerResult(isCorrect);
  },

  markUnknown() {
    const { question, answerSaving } = this.data;
    if (answerSaving) return;
    if (!question) return;
    this.setData({
      checked: true,
      answerSaving: Boolean(question.wordId),
      isCorrect: false,
      feedback: `先记一下，正确答案：${question.answerText || question.answer}`,
    });
    this.recordAnswerResult(false);
  },

  recordAnswerResult(isCorrect) {
    const { question } = this.data;

    if (!question || !question.wordId) {
      this.setData({
        answerSaving: false,
      });
      return;
    }

    wx.cloud.callFunction({
      name: "recordStudyAnswer",
      data: {
        wordId: question.wordId,
        isCorrect,
        questionType: question.type,
      },
      success: (res) => {
        const result = res.result || {};
        if (!result.success) {
          wx.showToast({
            title: "学习记录保存失败",
            icon: "none",
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: "学习记录保存失败",
          icon: "none",
        });
      },
      complete: () => {
        this.setData({
          answerSaving: false,
        });
      },
    });
  },

  nextQuestion() {
    if (this.data.answerSaving) {
      wx.showToast({
        title: "正在保存学习记录",
        icon: "none",
      });
      return;
    }

    const { questions } = this.data;
    const nextIndex = this.data.currentIndex + 1;
    if (nextIndex >= questions.length) {
      wx.showToast({
        title: "今天已经完成啦",
        icon: "none",
      });
      wx.switchTab({
        url: "/pages/index/index",
      });
      return;
    }

    this.renderQuestion(nextIndex);
  },

  renderQuestion(index) {
    const { questions } = this.data;
    if (!questions.length) {
      this.setData({
        currentIndex: 0,
        displayIndex: 0,
        total: 0,
        question: null,
        progress: 0,
      });
      return;
    }

    this.setData({
      currentIndex: index,
      displayIndex: index + 1,
      question: questions[index],
      selectedKey: "",
      inputValue: "",
      checked: false,
      answerSaving: false,
      isCorrect: false,
      feedback: "",
      progress: Math.round(((index + 1) / questions.length) * 100),
    });
  },
});
