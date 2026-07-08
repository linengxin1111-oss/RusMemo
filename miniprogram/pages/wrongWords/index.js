Page({
  data: {
    words: [
      { russian: "время", meaning: "时间", count: "今日错 2 次" },
      { russian: "дорога", meaning: "道路；路", count: "今日错 1 次" },
      { russian: "нужный", meaning: "需要的；必要的", count: "本周错 2 次" },
      { russian: "говорить", meaning: "说话；交谈", count: "本周错 1 次" },
      { russian: "помогать", meaning: "帮助", count: "本周错 1 次" },
    ],
  },

  goBack() {
    wx.navigateBack();
  },
});
