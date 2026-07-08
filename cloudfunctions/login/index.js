const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const userCollection = db.collection("user");

function toClientUser(user) {
  return {
    _id: user._id,
    _openid: user._openid,
    appid: user.appid,
    unionid: user.unionid || "",
    study_days: user.study_days || 0,
    learned_count: user.learned_count || 0,
    mastered_count: user.mastered_count || 0,
  };
}

exports.main = async () => {
  const wxContext = cloud.getWXContext();
  const now = db.serverDate();

  const baseUser = {
    _openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID || "",
    last_login_at: now,
    updated_at: now,
  };

  const existing = await userCollection
    .where({
      _openid: wxContext.OPENID,
    })
    .limit(1)
    .get();

  if (existing.data.length) {
    const user = existing.data[0];
    await userCollection.doc(user._id).update({
      data: {
        appid: wxContext.APPID,
        unionid: wxContext.UNIONID || user.unionid || "",
        last_login_at: now,
        updated_at: now,
      },
    });

    return {
      success: true,
      is_new_user: false,
      user: toClientUser({
        ...user,
        _openid: wxContext.OPENID,
        appid: wxContext.APPID,
        unionid: wxContext.UNIONID || user.unionid || "",
      }),
    };
  }

  const newUser = {
    ...baseUser,
    created_at: now,
    study_days: 0,
    learned_count: 0,
    mastered_count: 0,
  };

  const addResult = await userCollection.add({
    data: newUser,
  });

  return {
    success: true,
    is_new_user: true,
    user: toClientUser({
      _id: addResult._id,
      ...newUser,
    }),
  };
};
