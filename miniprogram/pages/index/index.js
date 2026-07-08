const { homeStats, homeEntries } = require("../../data/mock");

Page({
  data: {
    stats: homeStats,
    entries: homeEntries,
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
