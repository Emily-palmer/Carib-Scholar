const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

const clientId = functions.config().paypal.client_id;
const clientSecret = functions.config().paypal.client_secret;
const paypalApiBase = functions.config().paypal.is_sandbox ? "https://api.sandbox.paypal.com" : "https://api.paypal.com";

const getAccessToken = async () => {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${paypalApiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Authorization": `Basic ${auth}` },
    body: "grant_type=client_credentials"
  });
  const data = await response.json();
  if (response.status !== 200) {
    throw new Error(`Failed to get PayPal access token: ${JSON.stringify(data)}`);
  }
  return data.access_token;
};

exports.createPaymentTokenAndSubscribe = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to subscribe.");
  }

  const userId = context.auth.uid;
  const { setupToken } = data;

  if (!setupToken) {
    throw new functions.https.HttpsError("invalid-argument", "Setup token is missing.");
  }

  const planId = functions.config().paypal.plan_id;

  try {
    const accessToken = await getAccessToken();

    // 1. Exchange the setup token for a permanent payment token
    const tokenCreationResponse = await fetch(`${paypalApiBase}/v3/vault/payment-tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
      body: JSON.stringify({
        payment_source: {
          token: { id: setupToken, type: "SETUP_TOKEN" }
        }
      })
    });
    
    if (!tokenCreationResponse.ok) {
        const errorText = await tokenCreationResponse.text();
        console.error("Error creating payment token:", errorText);
        throw new functions.https.HttpsError("internal", "Failed to create payment token.");
    }

    const paymentToken = await tokenCreationResponse.json();
    const paymentTokenId = paymentToken.id;

    // 2. Create the subscription using the permanent payment token
    const subscriptionPayload = {
      plan_id: planId,
      subscriber: {
        name: { given_name: context.auth.token.name || "User" },
        email_address: context.auth.token.email,
        payment_source: {
          token: { id: paymentTokenId, type: "PAYMENT_TOKEN" }
        }
      }
    };
    
    const subscriptionResponse = await fetch(`${paypalApiBase}/v1/billing/subscriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
      body: JSON.stringify(subscriptionPayload)
    });

    if (!subscriptionResponse.ok) {
        const errorText = await subscriptionResponse.text();
        console.error("Error creating subscription:", errorText);
        throw new functions.https.HttpsError("internal", "Failed to create PayPal subscription.");
    }
    
    const newSubscription = await subscriptionResponse.json();
    
    // Store subscription details in Firestore
    await admin.firestore().collection("users").doc(userId).set({
      paypalSubscriptionId: newSubscription.id,
      paypalPaymentTokenId: paymentTokenId,
      isSubscribed: true,
      subscriptionStatus: "active"
    }, { merge: true });

    return { success: true, subscriptionId: newSubscription.id };

  } catch (error) {
    console.error("Error in subscription process:", error);
    throw new functions.https.HttpsError("internal", "An error occurred during the subscription process.");
  }
});