const { words } = require("../../data/mock");

Page({
  data: {
    tabs: ["全部", "系统词库", "我的单词"],
    activeTab: 0,
    words,
    visibleWords: words,
  },

  switchTab(event) {
    const activeTab = Number(event.currentTarget.dataset.index);
    const visibleWords = words.filter((word) => {
      if (activeTab === 1) return word.type === "system";
      if (activeTab === 2) return word.type === "user";
      return true;
    });

    this.setData({
      activeTab,
      visibleWords,
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
