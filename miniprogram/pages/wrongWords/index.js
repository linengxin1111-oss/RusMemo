const { wrongWords } = require("../../data/mock");

Page({
  data: {
    loading: true,
    loadError: "",
    activeFilter: "all",
    tabs: [
      { label: "全部", value: "all" },
      { label: "今天", value: "today" },
      { label: "本周", value: "week" },
      { label: "本月", value: "month" },
    ],
    total: 0,
    words: [],
  },

  onShow() {
    this.loadWrongWords();
  },

  goBack() {
    wx.navigateBack();
  },

  switchFilter(event) {
    const activeFilter = event.currentTarget.dataset.value;
    if (activeFilter === this.data.activeFilter) return;

    this.setData({
      activeFilter,
    });
    this.loadWrongWords();
  },

  loadWrongWords() {
    this.setData({
      loading: true,
      loadError: "",
    });

    wx.cloud.callFunction({
      name: "listWrongWords",
      data: {
        period: this.data.activeFilter,
      },
      success: (res) => {
        const result = res.result || {};
        const words = Array.isArray(result.words) ? result.words : [];

        if (!result.success) {
          this.useFallbackWords("错词本暂时不可用，已显示示例数据");
          return;
        }

        this.setData({
          loading: false,
          loadError: "",
          total: Number(result.total || words.length),
          words,
        });
      },
      fail: () => {
        this.useFallbackWords("错词本暂时不可用，已显示示例数据");
      },
    });
  },

  useFallbackWords(message) {
    this.setData({
      loading: false,
      loadError: message,
      total: wrongWords.length,
      words: wrongWords,
    });
  },

  reviewAll() {
    if (!this.data.words.length) {
      wx.showToast({
        title: "暂无错词可复习",
        icon: "none",
      });
      return;
    }

    wx.setStorageSync("studyMode", "wrong");
    wx.switchTab({
      url: "/pages/study/index",
    });
  },
});
