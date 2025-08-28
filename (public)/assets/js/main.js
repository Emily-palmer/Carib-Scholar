import { auth, onAuthStateChanged, signOut, db, getDoc, httpsCallable } from './firebase.js';

let userDocData = null;

onAuthStateChanged(auth, async (user) => {
    const isProtectedPage = window.location.pathname.includes('/dashboard.html') || window.location.pathname.includes('/exam-loader.html');

    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            userDocData = docSnap.data();
        }

        if (isProtectedPage && !userDocData.isSubscribed) {
            alert('Please subscribe to access this content.');
            window.location.href = '/pricing.html';
        }
        
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await signOut(auth);
                window.location.href = '/index.html';
            });
        }
    } else {
        if (isProtectedPage) {
            window.location.href = '/login.html';
        }
    }
});

const createPaymentTokenAndSubscribe = httpsCallable(auth.functions, 'createPaymentTokenAndSubscribe');

async function setupPayPal() {
    if (window.paypal && document.getElementById('paypal-button-container')) {
        try {
            await paypal.Buttons({
                style: {
                    layout: 'vertical',
                    color: 'blue',
                    shape: 'rect',
                    label: 'subscribe'
                },
                createSubscription: function(data, actions) {
                    return actions.subscription.create({
                        plan_id: 'YOUR_PAYPAL_PLAN_ID_HERE',
                    });
                },
                onApprove: function(data, actions) {
                    const setupToken = data.subscriptionID;
                    createPaymentTokenAndSubscribe({ setupToken })
                        .then(result => {
                            console.log('Subscription created:', result.data);
                            alert('Subscription successful! Redirecting to dashboard.');
                            window.location.href = '/dashboard.html';
                        })
                        .catch(error => {
                            console.error('Subscription failed:', error.message);
                            alert('Subscription failed. Please try again.');
                        });
                },
                onError: function(err) {
                    console.error('PayPal error:', err);
                    alert('An error occurred with PayPal. Please try again.');
                }
            }).render('#paypal-button-container');
        } catch (error) {
            console.error('Failed to render PayPal buttons:', error);
        }
    }
}

if (window.location.pathname.includes('/pricing.html')) {
    setupPayPal();
}