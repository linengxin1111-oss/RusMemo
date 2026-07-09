const cloud = require("wx-server-sdk");
const words = require("./data/a1Words");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const wordCollection = db.collection("word");

function normalizeWord(rawWord) {
  return {
    russian_word: rawWord.russian_word.trim(),
    stress_word: (rawWord.stress_word || "").trim(),
    part_of_speech: (rawWord.part_of_speech || "").trim(),
    chinese_meaning: rawWord.chinese_meaning.trim(),
    example: (rawWord.example || "").trim(),
    example_translation: (rawWord.example_translation || "").trim(),
    source: "system",
    level: "A1",
    is_deleted: false,
  };
}

exports.main = async () => {
  const normalizedWords = words.map(normalizeWord);
  const now = db.serverDate();

  const existingResult = await wordCollection
    .where({
      source: "system",
      level: "A1",
    })
    .limit(1000)
    .get();

  const existingWords = new Set(existingResult.data.map((word) => word.russian_word));
  const wordsToInsert = normalizedWords.filter((word) => !existingWords.has(word.russian_word));

  const insertResults = await Promise.allSettled(
    wordsToInsert.map((word) =>
      wordCollection.add({
        data: {
          ...word,
          created_at: now,
          updated_at: now,
        },
      })
    )
  );

  const errors = insertResults
    .map((result, index) => ({
      result,
      word: wordsToInsert[index],
    }))
    .filter((item) => item.result.status === "rejected")
    .map((item) => ({
      russian_word: item.word.russian_word,
      message:
        item.result.reason && item.result.reason.message
          ? item.result.reason.message
          : String(item.result.reason),
    }));

  return {
    success: errors.length === 0,
    total: normalizedWords.length,
    inserted: insertResults.filter((result) => result.status === "fulfilled").length,
    skipped: normalizedWords.length - wordsToInsert.length,
    failed: errors.length,
    errors,
  };
};
