const { homeStats, homeEntries } = require("../../data/mock");

Page({
  data: {
    loading: true,
    loadError: "",
    stats: homeStats,
    entries: homeEntries,
    summary: {
      todayStudied: 0,
      todayTarget: 10,
      completionRate: 0,
    },
    ringDegrees: 0,
  },

  onShow() {
    this.loadHomeSummary();
  },

  loadHomeSummary() {
    this.setData({
      loading: true,
      loadError: "",
    });

    wx.cloud.callFunction({
      name: "getHomeSummary",
      success: (res) => {
        const result = res.result || {};

        if (!result.success) {
          this.useFallbackSummary("首页数据暂时不可用，已显示示例数据");
          return;
        }

        const summary = result.summary || {};
        this.setData({
          loading: false,
          loadError: "",
          stats: Array.isArray(result.stats) ? result.stats : homeStats,
          entries: Array.isArray(result.entries) ? result.entries : homeEntries,
          summary,
          ringDegrees: Math.round(Number(summary.completionRate || 0) * 3.6),
        });
      },
      fail: () => {
        this.useFallbackSummary("首页数据暂时不可用，已显示示例数据");
      },
    });
  },

  useFallbackSummary(message) {
    this.setData({
      loading: false,
      loadError: message,
      stats: homeStats,
      entries: homeEntries,
      summary: {
        todayStudied: 32,
        todayTarget: 50,
        completionRate: 64,
      },
      ringDegrees: 230,
    });
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
