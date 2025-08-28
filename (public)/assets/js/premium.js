import { auth, db, doc, setDoc, httpsCallable, onAuthStateChanged } from './firebase.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Check if the user is authenticated
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);

            // Fetch the user's subscription status from Firestore
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists() && docSnap.data().isSubscribed) {
                // If the user is already subscribed, hide the pricing plan
                document.getElementById('pricing-plan').innerHTML = '<p>You are already subscribed! Enjoy full access.</p>';
            } else {
                // If not subscribed, render the PayPal button
                renderPayPalButton(user.uid);
            }
        } else {
            // If the user is not logged in, redirect to the login page
            alert('Please log in to view pricing plans.');
            window.location.href = '/login';
        }
    });
});

function renderPayPalButton(userId) {
    paypal.Buttons({
        style: {
            shape: 'pill',
            color: 'blue',
            layout: 'vertical',
            label: 'subscribe'
        },
        createSubscription: function(data, actions) {
            // This is where you call a backend function to create the subscription plan.
            // For now, this is a placeholder. You'll need to implement a Firebase Cloud Function.
            const createSubscription = httpsCallable(functions, 'createSubscription');
            return createSubscription().then(result => {
                const subscriptionId = result.data.subscriptionId;
                return actions.subscription.create({
                    plan_id: 'P-YOURPLANID', // Replace with your actual PayPal Plan ID
                    custom_id: userId // Pass the user's ID to the subscription
                });
            }).catch(error => {
                console.error("Error creating subscription:", error);
                alert("An error occurred. Please try again later.");
            });
        },
        onApprove: function(data, actions) {
            // This is the function that runs when the user approves the subscription.
            const userDocRef = doc(db, 'users', userId);
            setDoc(userDocRef, { isSubscribed: true }, { merge: true })
                .then(() => {
                    alert('Subscription successful!');
                    window.location.href = '/dashboard';
                })
                .catch(error => {
                    console.error("Error updating user subscription status:", error);
                    alert("Subscription approved, but an error occurred updating your account. Please contact support.");
                });
        },
        onError: function(err) {
            console.error('PayPal error:', err);
            alert('An error occurred with PayPal. Please try again.');
        }
    }).render('#paypal-button-container');
}