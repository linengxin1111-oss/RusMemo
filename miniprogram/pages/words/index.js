const { words: mockWords } = require("../../data/mock");

Page({
  data: {
    tabs: ["全部", "系统词库", "我的单词"],
    activeTab: 0,
    words: [],
    visibleWords: [],
    loading: true,
    loadError: "",
    usingMock: false,
  },

  onShow() {
    this.loadWords();
  },

  onPullDownRefresh() {
    this.loadWords().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadWords() {
    this.setData({
      loading: true,
      loadError: "",
    });

    try {
      const res = await wx.cloud.callFunction({
        name: "listWords",
      });
      const result = res.result || {};

      if (!result.success || !Array.isArray(result.words)) {
        throw new Error("invalid listWords response");
      }

      this.setWords(result.words, false);
    } catch (error) {
      this.setWords(mockWords, true);
      wx.showToast({
        title: "词库加载失败，已显示示例数据",
        icon: "none",
      });
    }
  },

  setWords(words, usingMock) {
    const visibleWords = this.filterWords(words, this.data.activeTab);
    this.setData({
      words,
      visibleWords,
      loading: false,
      usingMock,
      loadError: usingMock ? "词库加载失败，当前为示例数据" : "",
    });
  },

  filterWords(words, activeTab) {
    return words.filter((word) => {
      if (activeTab === 1) return word.type === "system";
      if (activeTab === 2) return word.type === "user";
      return true;
    });
  },

  switchTab(event) {
    const activeTab = Number(event.currentTarget.dataset.index);
    this.setData({
      activeTab,
      visibleWords: this.filterWords(this.data.words, activeTab),
    });
  },

  addWord() {
    wx.navigateTo({
      url: "/pages/addWord/index",
    });
  },

  showSearchTip() {
    wx.showToast({
      title: "搜索会在后续版本加入",
      icon: "none",
    });
  },

  showMoreTip() {
    wx.showToast({
      title: "更多功能暂未开放",
      icon: "none",
    });
  },

  openWord(event) {
    const { type } = event.currentTarget.dataset;
    if (type !== "user") {
      wx.showToast({
        title: "系统词暂不可编辑",
        icon: "none",
      });
      return;
    }

    wx.navigateTo({
      url: "/pages/editWord/index",
    });
  },
});
