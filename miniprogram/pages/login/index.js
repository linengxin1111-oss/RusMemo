Page({
  data: {
    loading: false,
  },

  goHome() {
    if (this.data.loading) return;

    this.setData({
      loading: true,
    });

    setTimeout(() => {
      wx.switchTab({
        url: "/pages/index/index",
      });
    }, 350);
  },
});
