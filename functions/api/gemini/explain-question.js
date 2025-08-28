const functions = require("firebase-functions");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");

const API_KEY = functions.config().gemini.api_key;
const genAI = new GoogleGenerativeAI(API_KEY);

exports.explainQuestion = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated and has a subscription
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to get an explanation.");
  }

  const userId = context.auth.uid;
  const userDoc = await admin.firestore().collection("users").doc(userId).get();

  if (!userDoc.exists || !userDoc.data().isSubscribed) {
    throw new functions.https.HttpsError("permission-denied", "You must have an active subscription to use this feature.");
  }

  const { questionText, subject } = data;

  if (!questionText || !subject) {
    throw new functions.https.HttpsError("invalid-argument", "Question text and subject are required.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `You are an expert CSEC tutor. Provide a detailed, step-by-step explanation for the following CSEC ${subject} question.
    Ensure your explanation is clear, easy to understand, and includes relevant concepts from the syllabus.
    
    Question: "${questionText}"
    
    Please provide the explanation in a simple text format.`;

    const result = await model.generateContent(prompt);
    const explanation = result.response.text();

    return { explanation };
  } catch (error) {
    console.error("Error explaining question:", error);
    throw new functions.https.HttpsError("internal", "An error occurred while getting the explanation.");
  }
});