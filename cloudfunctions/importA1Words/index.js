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
  const now = db.serverDate();
  const result = {
    success: true,
    total: words.length,
    inserted: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  for (const rawWord of words) {
    const word = normalizeWord(rawWord);

    try {
      const existing = await wordCollection
        .where({
          russian_word: word.russian_word,
          source: "system",
          level: "A1",
        })
        .limit(1)
        .get();

      if (existing.data.length) {
        result.skipped += 1;
        continue;
      }

      await wordCollection.add({
        data: {
          ...word,
          created_at: now,
          updated_at: now,
        },
      });

      result.inserted += 1;
    } catch (error) {
      result.failed += 1;
      result.errors.push({
        russian_word: word.russian_word,
        message: error && error.message ? error.message : String(error),
      });
    }
  }

  result.success = result.failed === 0;
  return result;
};
