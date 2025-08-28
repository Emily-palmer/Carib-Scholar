const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

const clientId = functions.config().paypal.client_id;
const clientSecret = functions.config().paypal.client_secret;
const webhookId = functions.config().paypal.webhook_id; // Your PayPal Webhook ID
const paypalApiBase = functions.config().paypal.is_sandbox ? "https://api.sandbox.paypal.com" : "https://api.paypal.com";

const getAccessToken = async () => {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${paypalApiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Authorization": `Basic ${auth}` },
    body: "grant_type=client_credentials"
  });
  const data = await response.json();
  return data.access_token;
};

const verifyWebhook = async (req, accessToken) => {
  const verificationPayload = {
    auth_algo: req.headers["paypal-auth-algo"],
    cert_url: req.headers["paypal-cert-url"],
    transmission_id: req.headers["paypal-transmission-id"],
    transmission_sig: req.headers["paypal-transmission-sig"],
    transmission_time: req.headers["paypal-transmission-time"],
    webhook_id: webhookId,
    webhook_event: req.body
  };
  
  const response = await fetch(`${paypalApiBase}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(verificationPayload)
  });
  
  const data = await response.json();
  return data.verification_status === "SUCCESS";
};

exports.paypalWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const accessToken = await getAccessToken();
  const isVerified = await verifyWebhook(req, accessToken);

  if (!isVerified) {
    console.error("Webhook signature verification failed.");
    return res.status(403).send("Forbidden");
  }

  const event = req.body;
  const subscriptionId = event.resource.id;

  try {
    const usersRef = admin.firestore().collection("users");
    const snapshot = await usersRef.where("paypalSubscriptionId", "==", subscriptionId).get();

    if (snapshot.empty) {
      console.error(`No user found for subscription ID: ${subscriptionId}`);
      return res.status(404).send("User not found");
    }

    const userDoc = snapshot.docs[0];
    const userRef = usersRef.doc(userDoc.id);

    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
      case "BILLING.SUBSCRIPTION.RENEWED":
        await userRef.set({
          isSubscribed: true,
          subscriptionStatus: "active"
        }, { merge: true });
        console.log(`Subscription activated for user: ${userDoc.id}`);
        break;

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.SUSPENDED":
        await userRef.set({
          isSubscribed: false,
          subscriptionStatus: "inactive"
        }, { merge: true });
        console.log(`Subscription canceled/suspended for user: ${userDoc.id}`);
        break;

      default:
        console.log(`Unhandled PayPal event type: ${event.event_type}`);
    }

    res.status(200).end();
  } catch (error) {
    console.error("Error processing PayPal webhook:", error);
    res.status(500).send("Internal Server Error");
  }
});