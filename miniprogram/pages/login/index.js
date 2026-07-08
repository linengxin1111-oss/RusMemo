const app = getApp();

Page({
  data: {
    loading: false,
    agreed: true,
  },

  onLoad() {
    const user = wx.getStorageSync("rusmemo_user");
    if (user && user._openid) {
      app.globalData.user = user;
      wx.switchTab({
        url: "/pages/index/index",
      });
    }
  },

  toggleAgreement() {
    this.setData({
      agreed: !this.data.agreed,
    });
  },

  async goHome() {
    if (this.data.loading) return;

    if (!this.data.agreed) {
      wx.showToast({
        title: "请先同意用户协议",
        icon: "none",
      });
      return;
    }

    if (!wx.cloud) {
      wx.showToast({
        title: "当前版本不支持云开发",
        icon: "none",
      });
      return;
    }

    this.setData({
      loading: true,
    });

    try {
      const res = await wx.cloud.callFunction({
        name: "login",
      });
      const result = res.result || {};

      if (!result.success || !result.user) {
        throw new Error("login failed");
      }

      app.globalData.user = result.user;
      wx.setStorageSync("rusmemo_user", result.user);

      wx.switchTab({
        url: "/pages/index/index",
      });
    } catch (error) {
      wx.showToast({
        title: "登录失败，请重试",
        icon: "none",
      });
      this.setData({
        loading: false,
      });
    }
  },
});
