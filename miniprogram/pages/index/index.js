const app = getApp();

Page({
  data: {
    env: "",
    loading: false,
    status: "pending",
    message: "请先在 app.js 中填写云环境 ID，然后上传 initCloud 云函数。",
    openid: "",
    collections: [],
  },

  onLoad() {
    this.setData({
      env: app.globalData.env,
      status: app.globalData.env ? "ready" : "pending",
      message: app.globalData.env
        ? "云环境已配置，可以开始验证。"
        : "请先在 app.js 中填写云环境 ID。",
    });
  },

  async initCloud() {
    if (!this.data.env) {
      this.setData({
        status: "error",
        message: "请先在 miniprogram/app.js 中填写 env。",
      });
      return;
    }

    this.setData({
      loading: true,
      message: "正在连接云开发环境...",
    });

    try {
      const res = await wx.cloud.callFunction({
        name: "initCloud",
      });

      const result = res.result || {};
      this.setData({
        loading: false,
        status: result.success ? "success" : "error",
        message: result.success ? "云开发验证成功，数据库集合已准备好。" : "云开发验证失败。",
        openid: result.openid || "",
        collections: result.collections || [],
      });
    } catch (error) {
      this.setData({
        loading: false,
        status: "error",
        message: this.getErrorMessage(error),
      });
    }
  },

  getErrorMessage(error) {
    const errMsg = error && error.errMsg ? error.errMsg : "";

    if (errMsg.includes("Environment not found")) {
      return "未找到云环境，请检查 app.js 中的 env 是否与微信开发者工具里的环境 ID 一致。";
    }

    if (errMsg.includes("FunctionName parameter could not be found")) {
      return "未找到 initCloud 云函数，请先右键 cloudfunctions/initCloud 并选择上传部署。";
    }

    return errMsg || "云开发调用失败，请检查开发者工具控制台。";
  },
});
