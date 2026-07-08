const words = [
  { russian: "добрый", meaning: "善良的", tag: "A1 基础词", type: "system" },
  { russian: "спасибо", meaning: "谢谢", tag: "A1 基础词", type: "system" },
  { russian: "пожалуйста", meaning: "不客气；请", tag: "A1 基础词", type: "system" },
  { russian: "извините", meaning: "对不起；打扰了", tag: "A1 基础词", type: "system" },
  { russian: "метро", meaning: "地铁", tag: "我的单词", type: "user" },
];

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
