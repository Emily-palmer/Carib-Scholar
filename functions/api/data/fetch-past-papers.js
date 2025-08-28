const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.fetchPastPapers = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to access this resource.");
  }
  
  const papersRef = admin.firestore().collection("past-papers");
  const snapshot = await papersRef.get();

  const papers = snapshot.docs.map(doc => {
    const { subject, year, paperNumber } = doc.data();
    return {
      id: doc.id,
      subject,
      year,
      paperNumber
    };
  });

  return papers;
});