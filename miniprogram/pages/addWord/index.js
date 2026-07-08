Page({
  data: {
    form: {
      russian_word: "",
      chinese_meaning: "",
      part_of_speech: "",
      example: "",
      source: "",
    },
  },

  goBack() {
    wx.navigateBack();
  },

  onInput(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({
      [`form.${field}`]: event.detail.value,
    });
  },

  saveWord() {
    const { russian_word, chinese_meaning } = this.data.form;
    if (!russian_word.trim() || !chinese_meaning.trim()) {
      wx.showToast({
        title: "请填写俄语单词和中文含义",
        icon: "none",
      });
      return;
    }

    wx.showToast({
      title: "已添加",
      icon: "success",
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 500);
  },
});
