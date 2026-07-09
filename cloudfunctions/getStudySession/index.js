const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;
const wordCollection = db.collection("word");

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
    prompt: "请输入俄语",
    chinese: word.meaning,
    hint: word.russian.slice(0, 1),
    answer: word.russian,
  };
}

function buildQuestions(words) {
  return shuffle(words)
    .slice(0, 10)
    .map((word, index) => {
      if (index % 3 === 1) {
        return buildInputQuestion(word);
      }
      return buildChoiceQuestion(word, words);
    });
}

exports.main = async (event = {}) => {
  const wxContext = cloud.getWXContext();
  const limit = Math.min(Math.max(Number(event.limit) || 10, 1), 20);

  const result = await wordCollection
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
    .get();

  const words = result.data
    .filter((word) => word.russian_word && word.chinese_meaning)
    .map(toStudyWord);

  const questions = buildQuestions(words).slice(0, limit);

  return {
    success: true,
    total: questions.length,
    questions,
  };
};
