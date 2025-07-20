const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

exports.updateLikeCount = onDocumentWritten("likes/{likeId}", async (event) => {
  const likeId = event.params.likeId;
  const parts = likeId.split("_");
  if (parts.length !== 2) {
    console.warn("likes 文件ID 格式錯誤:", likeId);
    return null;
  }
  const clubCode = parts[1];
  const clubRef = db.collection("clubs").doc(clubCode);

  const beforeExists = event.data?.before?.exists || false;
  const afterExists = event.data?.after?.exists || false;

  let incrementValue = 0;
  if (!beforeExists && afterExists) {
    incrementValue = 1;
  } else if (beforeExists && !afterExists) {
    incrementValue = -1;
  } else {
    return null;
  }

  await clubRef.set(
    {
      likeCount: FieldValue.increment(incrementValue),
    },
    { merge: true }
  );

  console.log(`clubs/${clubCode} likeCount 已更新，變化量：${incrementValue}`);

  return null;
});
