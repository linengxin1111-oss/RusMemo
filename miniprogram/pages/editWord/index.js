Page({
  data: {
    form: {
      russian_word: "метро",
      chinese_meaning: "地铁",
      part_of_speech: "名词",
      example: "Где метро?",
      source: "旅行常用",
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
      title: "已保存",
      icon: "success",
    });
  },

  deleteWord() {
    wx.showModal({
      title: "删除单词？",
      content: "删除后将从你的单词本中移除，相关学习进度也会被清除。",
      confirmText: "删除",
      confirmColor: "#F28B85",
      success: (res) => {
        if (!res.confirm) return;
        wx.showToast({
          title: "已删除",
          icon: "success",
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 500);
      },
    });
  },
});
