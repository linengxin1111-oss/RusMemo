Page({
  data: {
    tabs: ["全部", "系统词库", "我的单词"],
    words: [
      { russian: "добрый", meaning: "善良的", tag: "A1 基础词", mine: false },
      { russian: "спасибо", meaning: "谢谢", tag: "A1 基础词", mine: false },
      { russian: "пожалуйста", meaning: "不客气；请", tag: "A1 基础词", mine: false },
      { russian: "извините", meaning: "对不起；打扰了", tag: "A1 基础词", mine: false },
      { russian: "метро", meaning: "地铁", tag: "我的单词", mine: true },
    ],
  },

  addWord() {
    wx.navigateTo({
      url: "/pages/addWord/index",
    });
  },

  editWord(event) {
    if (!event.currentTarget.dataset.mine) return;
    wx.navigateTo({
      url: "/pages/editWord/index",
    });
  },
});
