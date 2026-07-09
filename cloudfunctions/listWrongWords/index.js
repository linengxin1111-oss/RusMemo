const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;
const wordCollection = db.collection("word");
const progressCollection = db.collection("word_progress");

function getPeriodStart(period) {
  const now = new Date();
  const start = new Date(now);

  if (period === "today") {
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (period === "week") {
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (period === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  return null;
}

function getTime(progressDate) {
  if (!progressDate) return 0;
  return new Date(progressDate).getTime();
}

function toClientWord(word, progress) {
  const wrongCount = Number(progress.wrong_count || 0);
  return {
    _id: word._id,
    russian: word.russian_word,
    meaning: word.chinese_meaning,
    part_of_speech: word.part_of_speech || "",
    level: Number(progress.level || 0),
    wrong_count: wrongCount,
    count: `累计错 ${wrongCount} 次`,
    last_result: progress.last_result || "",
    last_studied_at: progress.last_studied_at || null,
    next_review_at: progress.next_review_at || null,
    type: word.source === "user" ? "user" : "system",
  };
}

exports.main = async (event = {}) => {
  const wxContext = cloud.getWXContext();
  const period = event.period || "all";
  const periodStart = getPeriodStart(period);

  const progressResult = await progressCollection
    .where({
      _openid: wxContext.OPENID,
    })
    .limit(100)
    .get();

  const progressList = progressResult.data
    .filter((progress) => Number(progress.wrong_count || 0) > 0)
    .filter((progress) => {
      if (!periodStart) return true;
      return getTime(progress.last_studied_at) >= periodStart.getTime();
    })
    .sort((a, b) => {
      const wrongDiff = Number(b.wrong_count || 0) - Number(a.wrong_count || 0);
      if (wrongDiff) return wrongDiff;
      return getTime(b.last_studied_at) - getTime(a.last_studied_at);
    });

  const wordIds = progressList.map((progress) => progress.word_id).filter(Boolean);

  if (!wordIds.length) {
    return {
      success: true,
      total: 0,
      words: [],
    };
  }

  const wordResult = await wordCollection
    .where({
      _id: _.in(wordIds),
      is_deleted: false,
    })
    .limit(100)
    .get();

  const wordById = wordResult.data.reduce((map, word) => {
    const canRead = word.source === "system" || word._openid === wxContext.OPENID;
    if (canRead) {
      map[word._id] = word;
    }
    return map;
  }, {});

  const words = progressList
    .filter((progress) => wordById[progress.word_id])
    .map((progress) => toClientWord(wordById[progress.word_id], progress));

  return {
    success: true,
    total: words.length,
    words,
  };
};
