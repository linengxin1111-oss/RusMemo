const { wrongWords } = require("../../data/mock");

Page({
  data: {
    words: wrongWords,
  },

  goBack() {
    wx.navigateBack();
  },

  reviewAll() {
    wx.switchTab({
      url: "/pages/study/index",
    });
  },
});
