const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;
const wordCollection = db.collection("word");
const progressCollection = db.collection("word_progress");

function isToday(value, now) {
  if (!value) return false;

  const date = new Date(value);
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function isDue(value, now) {
  if (!value) return true;
  return new Date(value).getTime() <= now.getTime();
}

function buildEntries(summary) {
  const progressText = summary.todayTarget
    ? `${summary.todayStudied}/${summary.todayTarget}`
    : "开始";

  return [
    {
      title: "今日进度",
      desc: `${summary.todayStudied} 个已完成`,
      meta: progressText,
      tone: "primary",
      url: "/pages/study/index",
    },
    {
      title: "错词本",
      desc: `需要复习 ${summary.wrongCount} 个`,
      meta: "去复习",
      tone: "error",
      url: "/pages/wrongWords/index",
    },
    {
      title: "单词本",
      desc: `已收录 ${summary.totalWords} 个`,
      meta: "查看",
      tone: "success",
      url: "/pages/words/index",
    },
  ];
}

exports.main = async () => {
  const wxContext = cloud.getWXContext();
  const now = new Date();

  const [wordResult, progressResult] = await Promise.all([
    wordCollection
      .where(
        _.or([
          {
            source: "system",
            is_deleted: false,
          },
          {
            _openid: wxContext.OPENID,
            source: "user",
            is_deleted: false,
          },
        ])
      )
      .limit(200)
      .get(),
    progressCollection
      .where({
        _openid: wxContext.OPENID,
      })
      .limit(200)
      .get(),
  ]);

  const words = wordResult.data.filter((word) => word.russian_word && word.chinese_meaning);
  const progressList = progressResult.data;
  const wordIds = words.reduce((set, word) => {
    set[word._id] = true;
    return set;
  }, {});
  const validProgress = progressList.filter((progress) => wordIds[progress.word_id]);
  const learnedWordIds = validProgress.reduce((set, progress) => {
    set[progress.word_id] = true;
    return set;
  }, {});

  const dueReviewCount = validProgress.filter((progress) =>
    isDue(progress.next_review_at, now)
  ).length;
  const newWordCount = words.filter((word) => !learnedWordIds[word._id]).length;
  const masteredCount = validProgress.filter((progress) => Number(progress.level || 0) >= 4).length;
  const wrongCount = validProgress.filter((progress) => Number(progress.wrong_count || 0) > 0).length;
  const todayStudied = validProgress.filter((progress) =>
    isToday(progress.last_studied_at, now)
  ).length;
  const todayTarget = Math.min(Math.max(dueReviewCount + Math.min(newWordCount, 10), 10), 20);
  const completionRate = todayTarget
    ? Math.min(Math.round((todayStudied / todayTarget) * 100), 100)
    : 0;

  const stats = [
    { label: "待复习", value: dueReviewCount },
    { label: "新词", value: newWordCount },
    { label: "已掌握", value: masteredCount },
  ];
  const summary = {
    totalWords: words.length,
    learnedCount: Object.keys(learnedWordIds).length,
    dueReviewCount,
    newWordCount,
    masteredCount,
    wrongCount,
    todayStudied,
    todayTarget,
    completionRate,
  };

  return {
    success: true,
    stats,
    entries: buildEntries(summary),
    summary,
  };
};
