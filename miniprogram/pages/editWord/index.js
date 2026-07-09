Page({
  data: {
    id: "",
    loading: true,
    saving: false,
    deleting: false,
    errors: {},
    form: {
      russian_word: "",
      chinese_meaning: "",
      part_of_speech: "",
      example: "",
      source: "",
    },
  },

  onLoad(options) {
    if (!options.id) {
      wx.showToast({
        title: "单词不存在",
        icon: "none",
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 500);
      return;
    }

    this.setData({
      id: options.id,
    });
    this.loadWord(options.id);
  },

  goBack() {
    wx.navigateBack();
  },

  async loadWord(id) {
    this.setData({
      loading: true,
    });

    try {
      const res = await wx.cloud.callFunction({
        name: "manageWord",
        data: {
          action: "get",
          id,
        },
      });
      const result = res.result || {};

      if (!result.success || !result.word) {
        throw new Error("word not found");
      }

      this.setData({
        form: {
          russian_word: result.word.russian_word || "",
          chinese_meaning: result.word.chinese_meaning || "",
          part_of_speech: result.word.part_of_speech || "",
          example: result.word.example || "",
          source: result.word.source || "",
        },
        loading: false,
      });
    } catch (error) {
      wx.showToast({
        title: "加载失败，请重试",
        icon: "none",
      });
      this.setData({
        loading: false,
      });
    }
  },

  onInput(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({
      [`form.${field}`]: event.detail.value,
      [`errors.${field}`]: "",
    });
  },

  async saveWord() {
    if (this.data.saving || this.data.loading) return;

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

    try {
      const res = await wx.cloud.callFunction({
        name: "manageWord",
        data: {
          action: "update",
          id: this.data.id,
          word: this.data.form,
        },
      });
      const result = res.result || {};

      if (!result.success) {
        this.setData({
          errors: result.errors || {},
        });
        throw new Error(result.message || "update word failed");
      }

      wx.showToast({
        title: "已保存",
        icon: "success",
      });
    } catch (error) {
      wx.showToast({
        title: "保存失败，请重试",
        icon: "none",
      });
    } finally {
      this.setData({
        saving: false,
      });
    }
  },

  deleteWord() {
    if (this.data.deleting || this.data.loading) return;

    wx.showModal({
      title: "删除单词？",
      content: "删除后将从你的单词本中移除，相关学习进度也会被清除。",
      confirmText: "删除",
      confirmColor: "#F28B85",
      success: async (res) => {
        if (!res.confirm) return;

        this.setData({
          deleting: true,
        });

        try {
          const deleteRes = await wx.cloud.callFunction({
            name: "manageWord",
            data: {
              action: "delete",
              id: this.data.id,
            },
          });
          const result = deleteRes.result || {};

          if (!result.success) {
            throw new Error(result.message || "delete word failed");
          }

          wx.showToast({
            title: "已删除",
            icon: "success",
          });
          setTimeout(() => {
            wx.navigateBack();
          }, 500);
        } catch (error) {
          wx.showToast({
            title: "删除失败，请稍后再试",
            icon: "none",
          });
        } finally {
          this.setData({
            deleting: false,
          });
        }
      },
    });
  },
});
