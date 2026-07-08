Page({
  data: {
    saving: false,
    errors: {},
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
      [`errors.${field}`]: "",
    });
  },

  saveWord() {
    if (this.data.saving) return;

    const { russian_word, chinese_meaning } = this.data.form;
    const errors = {};

    if (!russian_word.trim()) {
      errors.russian_word = "请填写俄语单词";
    }

    if (!chinese_meaning.trim()) {
      errors.chinese_meaning = "请填写中文含义";
    }

    if (Object.keys(errors).length) {
      this.setData({ errors });
      wx.showToast({
        title: "请填写俄语单词和中文含义",
        icon: "none",
      });
      return;
    }

    this.setData({
      saving: true,
    });

    wx.showToast({
      title: "已添加",
      icon: "success",
    });

    setTimeout(() => {
      this.setData({
        saving: false,
      });
      wx.navigateBack();
    }, 500);
  },
});
