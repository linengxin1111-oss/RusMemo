const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;
const wordCollection = db.collection("word");
const progressCollection = db.collection("word_progress");

const CHOICE_KEYS = ["A", "B", "C", "D"];

function shuffle(items) {
  const next = items.slice();
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function toStudyWord(word) {
  return {
    id: word._id,
    russian: word.russian_word,
    stress: word.stress_word || "",
    meaning: word.chinese_meaning,
    partOfSpeech: word.part_of_speech || "",
    level: word.level || "A1",
    type: word.source === "user" ? "user" : "system",
    studyStatus: word.studyStatus || "new",
    progressLevel: word.progressLevel || 0,
    wrongCount: word.wrongCount || 0,
  };
}

function buildMeta(word) {
  const parts = [];
  if (word.stress) parts.push(word.stress);
  if (word.partOfSpeech) parts.push(word.partOfSpeech);
  return parts.join(" · ") || `${word.level} 基础词`;
}

function buildChoiceQuestion(word, allWords) {
  const wrongChoices = shuffle(
    allWords.filter((item) => item.id !== word.id && item.meaning !== word.meaning)
  )
    .slice(0, 3)
    .map((item) => item.meaning);

  const choiceTexts = shuffle([word.meaning, ...wrongChoices]).slice(0, 4);
  const choices = choiceTexts.map((text, index) => ({
    key: CHOICE_KEYS[index],
    text,
  }));
  const answer = choices.find((choice) => choice.text === word.meaning);

  return {
    wordId: word.id,
    type: "choice",
    studyStatus: word.studyStatus,
    progressLevel: word.progressLevel,
    prompt: "请选择正确的中文意思",
    russian: word.russian,
    meta: buildMeta(word),
    answer: answer ? answer.key : "A",
    answerText: word.meaning,
    choices,
  };
}

function buildInputQuestion(word) {
  return {
    wordId: word.id,
    type: "input",
    studyStatus: word.studyStatus,
    progressLevel: word.progressLevel,
    prompt: "请输入俄语",
    chinese: word.meaning,
    hint: word.russian.slice(0, 1),
    answer: word.russian,
  };
}

function buildQuestions(words, limit) {
  return words
    .slice(0, limit)
    .map((word, index) => {
      if (index % 3 === 1) {
        return buildInputQuestion(word);
      }
      return buildChoiceQuestion(word, words);
    });
}

function sortDueProgress(a, b) {
  const aTime = a.nextReviewAt ? new Date(a.nextReviewAt).getTime() : 0;
  const bTime = b.nextReviewAt ? new Date(b.nextReviewAt).getTime() : 0;
  return aTime - bTime;
}

function isDueProgress(progress, now) {
  if (!progress.next_review_at) {
    return true;
  }

  return new Date(progress.next_review_at).getTime() <= now.getTime();
}

function pickStudyWords(words, progressList, limit, now) {
  const progressByWordId = progressList.reduce((map, progress) => {
    map[progress.word_id] = progress;
    return map;
  }, {});

  const dueWords = [];
  const newWords = [];
  const fallbackWords = [];

  words.forEach((word) => {
    const progress = progressByWordId[word._id];

    if (!progress) {
      newWords.push({
        ...word,
        studyStatus: "new",
        progressLevel: 0,
        wrongCount: 0,
      });
      return;
    }

    const decoratedWord = {
      ...word,
      progressLevel: Number(progress.level || 0),
      wrongCount: Number(progress.wrong_count || 0),
      nextReviewAt: progress.next_review_at,
    };

    if (isDueProgress(progress, now)) {
      dueWords.push({
        ...decoratedWord,
        studyStatus: "review",
      });
    } else {
      fallbackWords.push({
        ...decoratedWord,
        studyStatus: "practice",
      });
    }
  });

  const selected = [
    ...dueWords.sort(sortDueProgress),
    ...shuffle(newWords),
    ...shuffle(fallbackWords),
  ];

  return selected.slice(0, limit);
}

exports.main = async (event = {}) => {
  const wxContext = cloud.getWXContext();
  const limit = Math.min(Math.max(Number(event.limit) || 10, 1), 20);
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
      .limit(100)
      .get(),
    progressCollection
      .where({
        _openid: wxContext.OPENID,
      })
      .limit(100)
      .get(),
  ]);

  const words = wordResult.data.filter((word) => word.russian_word && word.chinese_meaning);

  const studyWords = pickStudyWords(words, progressResult.data, limit, now).map(toStudyWord);
  const questions = buildQuestions(studyWords, limit);

  return {
    success: true,
    total: questions.length,
    dueCount: studyWords.filter((word) => word.studyStatus === "review").length,
    newCount: studyWords.filter((word) => word.studyStatus === "new").length,
    practiceCount: studyWords.filter((word) => word.studyStatus === "practice").length,
    questions,
  };
};
