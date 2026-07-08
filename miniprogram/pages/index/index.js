Page({
  data: {
    stats: [
      { label: "待复习", value: 18 },
      { label: "新词", value: 12 },
      { label: "已掌握", value: 156 },
    ],
    entries: [
      { title: "今日进度", desc: "A1 俄语基础", meta: "26%", tone: "primary", url: "/pages/study/index" },
      { title: "错词本", desc: "需要复习 24 个", meta: "去复习", tone: "error", url: "/pages/wrongWords/index" },
      { title: "单词本", desc: "已收录 200 个", meta: "查看", tone: "success", url: "/pages/words/index" },
    ],
  },

  goStudy() {
    wx.switchTab({
      url: "/pages/study/index",
    });
  },

  openEntry(event) {
    const { url } = event.currentTarget.dataset;
    if (!url) return;

    if (url === "/pages/study/index" || url === "/pages/words/index") {
      wx.switchTab({ url });
      return;
    }

    wx.navigateTo({ url });
  },
});
