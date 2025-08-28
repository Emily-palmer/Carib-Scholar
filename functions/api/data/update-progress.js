const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.updateProgress = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to update your progress.");
  }

  const userId = context.auth.uid;
  const { subject, score, date } = data;

  if (!subject || score == null) {
    throw new functions.https.HttpsError("invalid-argument", "Subject and score are required.");
  }

  try {
    await admin.firestore().collection("users").doc(userId).collection("progress").add({
      subject,
      score,
      date: date || new Date()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating progress:", error);
    throw new functions.https.HttpsError("internal", "An error occurred while updating progress.");
  }
});