const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const wordCollection = db.collection("word");

function normalizeWordInput(input) {
  return {
    russian_word: (input.russian_word || "").trim(),
    stress_word: (input.stress_word || "").trim(),
    part_of_speech: (input.part_of_speech || "").trim(),
    chinese_meaning: (input.chinese_meaning || "").trim(),
    example: (input.example || "").trim(),
    example_translation: (input.example_translation || "").trim(),
    source: "user",
    level: "A1",
    is_deleted: false,
  };
}

function validateWord(word) {
  const errors = {};

  if (!word.russian_word) {
    errors.russian_word = "请填写俄语单词";
  }

  if (!word.chinese_meaning) {
    errors.chinese_meaning = "请填写中文含义";
  }

  return errors;
}

function toClientWord(word) {
  return {
    _id: word._id,
    russian_word: word.russian_word,
    stress_word: word.stress_word || "",
    part_of_speech: word.part_of_speech || "",
    chinese_meaning: word.chinese_meaning,
    example: word.example || "",
    example_translation: word.example_translation || "",
    source: word.source,
    level: word.level || "A1",
  };
}

async function getOwnUserWord(id, openid) {
  if (!id) {
    throw new Error("missing word id");
  }

  const result = await wordCollection.doc(id).get();
  const word = result.data;

  if (!word || word._openid !== openid || word.source !== "user" || word.is_deleted) {
    throw new Error("word not found");
  }

  return word;
}

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const action = event.action;
  const now = db.serverDate();

  if (action === "get") {
    const word = await getOwnUserWord(event.id, wxContext.OPENID);
    return {
      success: true,
      word: toClientWord(word),
    };
  }

  if (action === "add") {
    const word = normalizeWordInput(event.word || {});
    const errors = validateWord(word);

    if (Object.keys(errors).length) {
      return {
        success: false,
        errors,
      };
    }

    const result = await wordCollection.add({
      data: {
        ...word,
        created_at: now,
        updated_at: now,
      },
    });

    return {
      success: true,
      id: result._id,
    };
  }

  if (action === "update") {
    await getOwnUserWord(event.id, wxContext.OPENID);
    const word = normalizeWordInput(event.word || {});
    const errors = validateWord(word);

    if (Object.keys(errors).length) {
      return {
        success: false,
        errors,
      };
    }

    await wordCollection.doc(event.id).update({
      data: {
        russian_word: word.russian_word,
        stress_word: word.stress_word,
        part_of_speech: word.part_of_speech,
        chinese_meaning: word.chinese_meaning,
        example: word.example,
        example_translation: word.example_translation,
        updated_at: now,
      },
    });

    return {
      success: true,
      id: event.id,
    };
  }

  if (action === "delete") {
    await getOwnUserWord(event.id, wxContext.OPENID);
    await wordCollection.doc(event.id).update({
      data: {
        is_deleted: true,
        updated_at: now,
      },
    });

    return {
      success: true,
      id: event.id,
    };
  }

  return {
    success: false,
    message: "unknown action",
  };
};
