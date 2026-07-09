const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const wordCollection = db.collection("word");
const progressCollection = db.collection("word_progress");

const REVIEW_INTERVAL_DAYS = {
  1: 1,
  2: 3,
  3: 7,
  4: 15,
};

function clampLevel(level) {
  return Math.min(Math.max(Number(level) || 0, 0), 4);
}

function getNextReviewAt(level, isCorrect) {
  const now = new Date();

  if (!isCorrect) {
    return new Date(now.getTime() + 5 * 60 * 1000);
  }

  const days = REVIEW_INTERVAL_DAYS[level] || 0;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

async function ensureReadableWord(wordId, openid) {
  if (!wordId) {
    throw new Error("missing word id");
  }

  const result = await wordCollection.doc(wordId).get();
  const word = result.data;

  if (!word || word.is_deleted) {
    throw new Error("word not found");
  }

  if (word.source === "system") {
    return word;
  }

  if (word.source === "user" && word._openid === openid) {
    return word;
  }

  throw new Error("word not found");
}

function toClientProgress(progress) {
  return {
    word_id: progress.word_id,
    level: progress.level,
    wrong_count: progress.wrong_count,
    correct_count: progress.correct_count,
    next_review_at: progress.next_review_at,
  };
}

exports.main = async (event = {}) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const wordId = event.wordId;
  const isCorrect = Boolean(event.isCorrect);
  const now = new Date();

  try {
    await ensureReadableWord(wordId, openid);

    const existing = await progressCollection
      .where({
        _openid: openid,
        word_id: wordId,
      })
      .limit(1)
      .get();

    const current = existing.data[0] || {
      level: 0,
      wrong_count: 0,
      correct_count: 0,
    };

    const currentLevel = clampLevel(current.level);
    const nextLevel = isCorrect
      ? clampLevel(currentLevel + 1)
      : clampLevel(currentLevel - 1);

    const progressUpdate = {
      level: nextLevel,
      wrong_count: Number(current.wrong_count || 0) + (isCorrect ? 0 : 1),
      correct_count: Number(current.correct_count || 0) + (isCorrect ? 1 : 0),
      last_studied_at: now,
      next_review_at: getNextReviewAt(nextLevel, isCorrect),
      last_result: isCorrect ? "correct" : "wrong",
      updated_at: now,
    };

    if (existing.data.length) {
      await progressCollection.doc(existing.data[0]._id).update({
        data: progressUpdate,
      });
    } else {
      await progressCollection.add({
        data: {
          _openid: openid,
          word_id: wordId,
          ...progressUpdate,
          created_at: now,
        },
      });
    }

    return {
      success: true,
      progress: toClientProgress({
        word_id: wordId,
        ...progressUpdate,
      }),
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "record answer failed",
    };
  }
};
