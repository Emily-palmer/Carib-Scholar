const functions = require("firebase-functions");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");

// Get the API key from environment variables
const API_KEY = functions.config().gemini.api_key;
const genAI = new GoogleGenerativeAI(API_KEY);

exports.markPaper = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to mark a paper.");
  }

  const { paperId, userAnswers } = data;

  if (!paperId || !userAnswers) {
    throw new functions.https.HttpsError("invalid-argument", "Paper ID and user answers are required.");
  }

  const paperDoc = await admin.firestore().collection("past-papers").doc(paperId).get();

  if (!paperDoc.exists) {
    throw new functions.https.HttpsError("not-found", "The specified past paper does not exist.");
  }

  const paperData = paperDoc.data();
  const results = [];
  let totalScore = 0;

  for (const question of paperData.questions) {
    const userAnswerText = userAnswers[question.id] || "";
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Construct the prompt for Gemini
    const prompt = `You are a CSEC exam marker.
    Paper: ${paperData.subject} ${paperData.year}, Paper ${paperData.paperNumber}
    Question: ${question.text}
    Student Answer: ${userAnswerText}
    Correct Answer/Marking Scheme: ${question.markingScheme}
    
    Mark the student's answer and provide a score out of ${question.marks}.
    Provide a detailed explanation and feedback on the answer.
    The response must be a JSON object with the following fields:
    { "isCorrect": boolean, "score": number, "feedback": "string", "explanation": "string" }`;

    try {
      const result = await model.generateContent(prompt);
      const geminiResponseText = result.response.text();
      const parsedResponse = JSON.parse(geminiResponseText);

      results.push({
        questionNumber: question.questionNumber,
        ...parsedResponse
      });
      totalScore += parsedResponse.score;

    } catch (error) {
      console.error(`Error marking question ${question.questionNumber}:`, error);
      results.push({
        questionNumber: question.questionNumber,
        isCorrect: false,
        score: 0,
        feedback: "Could not mark this question due to an error.",
        explanation: ""
      });
    }
  }

  return {
    results,
    totalScore
  };
});