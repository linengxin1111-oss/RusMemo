const { statisticCards, masteryLegend } = require("../../data/mock");

Page({
  data: {
    loading: true,
    loadError: "",
    stats: statisticCards,
    legend: masteryLegend,
    summary: {
      masteredRate: 26,
    },
    masteredDegrees: 94,
    learningDegrees: 230,
    trend: [],
  },

  onShow() {
    this.loadStatistics();
  },

  loadStatistics() {
    this.setData({
      loading: true,
      loadError: "",
    });

    wx.cloud.callFunction({
      name: "getStatisticsSummary",
      success: (res) => {
        const result = res.result || {};

        if (!result.success) {
          this.useFallbackStatistics("统计数据暂时不可用，已显示示例数据");
          return;
        }

        const summary = result.summary || {};
        const masteredRate = Number(summary.masteredRate || 0);
        const learningItem = (result.legend || []).find((item) => item.label === "学习中") || {};
        const totalWords = Number(summary.totalWords || 0);
        const learningRate = totalWords
          ? Math.round((Number(learningItem.value || 0) / totalWords) * 100)
          : 0;
        const masteredDegrees = Math.round(masteredRate * 3.6);
        const learningDegrees = Math.min(masteredDegrees + Math.round(learningRate * 3.6), 360);

        this.setData({
          loading: false,
          loadError: "",
          stats: Array.isArray(result.stats) ? result.stats : statisticCards,
          legend: Array.isArray(result.legend) ? result.legend : masteryLegend,
          summary,
          masteredDegrees,
          learningDegrees,
          trend: Array.isArray(result.trend) ? result.trend : [],
        });
      },
      fail: () => {
        this.useFallbackStatistics("统计数据暂时不可用，已显示示例数据");
      },
    });
  },

  useFallbackStatistics(message) {
    this.setData({
      loading: false,
      loadError: message,
      stats: statisticCards,
      legend: masteryLegend,
      summary: {
        masteredRate: 26,
      },
      masteredDegrees: 94,
      learningDegrees: 230,
      trend: [
        { date: "05/13", accuracy: 62 },
        { date: "05/14", accuracy: 76 },
        { date: "05/15", accuracy: 68 },
        { date: "05/16", accuracy: 82 },
        { date: "05/17", accuracy: 78 },
        { date: "05/18", accuracy: 91 },
      ],
    });
  },
});
