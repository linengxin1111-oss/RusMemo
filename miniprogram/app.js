App({
  globalData: {
    // Fill this with your CloudBase environment ID after creating the cloud environment.
    env: "cloud1-d3gk689dk6dc1c4dc",
    user: null,
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error("Please use base library 2.2.3 or above to enable cloud capabilities.");
      return;
    }

    const cloudConfig = {
      traceUser: true,
    };

    if (this.globalData.env) {
      cloudConfig.env = this.globalData.env;
    }

    wx.cloud.init(cloudConfig);
  },
});
