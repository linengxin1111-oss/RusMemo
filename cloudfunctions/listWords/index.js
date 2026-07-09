const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;
const wordCollection = db.collection("word");

function toClientWord(word) {
  const type = word.source === "user" ? "user" : "system";
  return {
    _id: word._id,
    russian: word.russian_word,
    meaning: word.chinese_meaning,
    part_of_speech: word.part_of_speech || "",
    example: word.example || "",
    example_translation: word.example_translation || "",
    tag: type === "user" ? "我的单词" : `${word.level || "A1"} 基础词`,
    type,
  };
}

exports.main = async () => {
  const wxContext = cloud.getWXContext();

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

  const words = result.data.map(toClientWord).sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "system" ? -1 : 1;
    }
    return a.russian.localeCompare(b.russian, "ru");
  });

  return {
    success: true,
    total: words.length,
    words,
  };
};
