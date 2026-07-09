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
    emptyTitle: "",
    emptyDesc: "",
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
      if (!result.words.length) {
        wx.showToast({
          title: "词库为空，请先运行导入函数",
          icon: "none",
        });
      }
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
      ...this.getEmptyCopy(this.data.activeTab, words.length),
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
    const visibleWords = this.filterWords(this.data.words, activeTab);
    this.setData({
      activeTab,
      visibleWords,
      ...this.getEmptyCopy(activeTab, this.data.words.length),
    });
  },

  getEmptyCopy(activeTab, totalCount) {
    if (totalCount === 0) {
      return {
        emptyTitle: "词库还没有数据",
        emptyDesc: "请先上传并运行 importA1Words 云函数，然后下拉刷新单词本。",
      };
    }

    if (activeTab === 1) {
      return {
        emptyTitle: "还没有系统词",
        emptyDesc: "请先运行 importA1Words 云函数导入 A1 初始词库。",
      };
    }

    if (activeTab === 2) {
      return {
        emptyTitle: "还没有自己的单词",
        emptyDesc: "添加旅行中常用的俄语词，后面会一起复习。",
      };
    }

    return {
      emptyTitle: "这里还没有单词",
      emptyDesc: "导入系统词库或添加自己的单词后，会显示在这里。",
    };
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
    const { id, type } = event.currentTarget.dataset;
    if (type !== "user") {
      wx.showToast({
        title: "系统词暂不可编辑",
        icon: "none",
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/editWord/index?id=${id}`,
    });
  },
});
