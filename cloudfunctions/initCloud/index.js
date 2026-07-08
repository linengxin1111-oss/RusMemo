const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

const COLLECTIONS = ["user", "word", "word_progress", "study_log"];

async function ensureCollection(name) {
  try {
    await db.createCollection(name);
    return {
      name,
      created: true,
    };
  } catch (error) {
    const message = error && error.message ? error.message : "";
    const errMsg = error && error.errMsg ? error.errMsg : "";

    if (message.includes("collection exists") || errMsg.includes("collection exists")) {
      return {
        name,
        created: false,
      };
    }

    throw error;
  }
}

exports.main = async () => {
  const wxContext = cloud.getWXContext();
  const collections = [];

  for (const name of COLLECTIONS) {
    collections.push(await ensureCollection(name));
  }

  return {
    success: true,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    collections,
  };
};
