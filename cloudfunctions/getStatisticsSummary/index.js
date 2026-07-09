const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;
const wordCollection = db.collection("word");
const progressCollection = db.collection("word_progress");

function getDayKey(value) {
  if (!value) return "";
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

function buildTrend(progressList) {
  const dayMap = progressList.reduce((map, progress) => {
    const key = getDayKey(progress.last_studied_at);
    if (!key) return map;

    if (!map[key]) {
      map[key] = {
        correct: 0,
        wrong: 0,
      };
    }

    map[key].correct += Number(progress.correct_count || 0);
    map[key].wrong += Number(progress.wrong_count || 0);
    return map;
  }, {});

  return Object.keys(dayMap)
    .sort()
    .slice(-6)
    .map((date) => {
      const item = dayMap[date];
      const total = item.correct + item.wrong;
      const accuracy = total ? Math.round((item.correct / total) * 100) : 0;
      return {
        date: date.slice(5).replace("-", "/"),
        accuracy,
      };
    });
}

exports.main = async () => {
  const wxContext = cloud.getWXContext();

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
  const wordIds = words.reduce((set, word) => {
    set[word._id] = true;
    return set;
  }, {});
  const progressList = progressResult.data.filter((progress) => wordIds[progress.word_id]);

  const learnedCount = progressList.length;
  const masteredCount = progressList.filter((progress) => Number(progress.level || 0) >= 4).length;
  const learningCount = progressList.filter((progress) => Number(progress.level || 0) < 4).length;
  const unlearnedCount = Math.max(words.length - learnedCount, 0);
  const correctCount = progressList.reduce(
    (total, progress) => total + Number(progress.correct_count || 0),
    0
  );
  const wrongCount = progressList.reduce(
    (total, progress) => total + Number(progress.wrong_count || 0),
    0
  );
  const answerCount = correctCount + wrongCount;
  const accuracy = answerCount ? Math.round((correctCount / answerCount) * 100) : 0;
  const studiedDays = new Set(
    progressList.map((progress) => getDayKey(progress.last_studied_at)).filter(Boolean)
  ).size;
  const masteredRate = words.length ? Math.round((masteredCount / words.length) * 100) : 0;

  return {
    success: true,
    stats: [
      { label: "学习词汇", value: String(learnedCount) },
      { label: "学习天数", value: `${studiedDays} 天` },
      { label: "正确率", value: formatPercent(accuracy) },
    ],
    legend: [
      { label: "掌握", value: masteredCount, color: "success" },
      { label: "学习中", value: learningCount, color: "purple" },
      { label: "未学习", value: unlearnedCount, color: "muted" },
    ],
    summary: {
      totalWords: words.length,
      learnedCount,
      masteredCount,
      learningCount,
      unlearnedCount,
      correctCount,
      wrongCount,
      accuracy,
      studiedDays,
      masteredRate,
    },
    trend: buildTrend(progressList),
  };
};
