const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const { markPaper } = require("./api/gemini/mark-paper");
const { explainQuestion } = require("./api/gemini/explain-question");
const { fetchPastPapers } = require("./api/data/fetch-past-papers");
const { updateProgress } = require("./api/data/update-progress");
const { createPaymentTokenAndSubscribe } = require("./api/paypal/create-payment-token-and-subscribe");
const { paypalWebhook } = require("./api/paypal/webhook");

// Export all callable and HTTP functions
exports.markPaper = markPaper;
exports.explainQuestion = explainQuestion;
exports.fetchPastPapers = fetchPastPapers;
exports.updateProgress = updateProgress;
exports.createPaymentTokenAndSubscribe = createPaymentTokenAndSubscribe;
exports.paypalWebhook = paypalWebhook;