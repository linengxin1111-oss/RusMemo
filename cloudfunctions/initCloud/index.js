const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

const COLLECTIONS = [
  { name: "user", description: "用户信息" },
  { name: "word", description: "系统词库和用户自定义词" },
  { name: "word_progress", description: "用户单词学习进度" },
  { name: "study_log", description: "每日学习记录" },
];

async function ensureCollection(collection) {
  try {
    await db.createCollection(collection.name);
    return {
      ...collection,
      created: true,
    };
  } catch (error) {
    const message = error && error.message ? error.message : "";
    const errMsg = error && error.errMsg ? error.errMsg : "";

    if (message.includes("collection exists") || errMsg.includes("collection exists")) {
      return {
        ...collection,
        created: false,
      };
    }

    throw error;
  }
}

exports.main = async () => {
  const wxContext = cloud.getWXContext();
  const collections = [];

  for (const collection of COLLECTIONS) {
    collections.push(await ensureCollection(collection));
  }

  return {
    success: true,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    collections,
  };
};
