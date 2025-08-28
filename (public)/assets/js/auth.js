import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, setDoc, doc, googleProvider, signInWithPopup } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const googleSignupBtn = document.getElementById('google-signup-btn');

    // Handle Email/Password Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;

            try {
                await signInWithEmailAndPassword(auth, email, password);
                window.location.href = '/dashboard';
            } catch (error) {
                console.error("Login failed:", error);
                alert(error.message);
            }
        });
    }

    // Handle Email/Password Signup
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = signupForm.email.value;
            const password = signupForm.password.value;

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    isSubscribed: false,
                    createdAt: new Date(),
                });

                window.location.href = '/pricing'; // Redirect to pricing after signup
            } catch (error) {
                console.error("Signup failed:", error);
                alert(error.message);
            }
        });
    }

    // Handle Google Login
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await signInWithPopup(auth, googleProvider);
                window.location.href = '/dashboard';
            } catch (error) {
                console.error("Google login failed:", error);
                alert(error.message);
            }
        });
    }

    // Handle Google Signup
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const userCredential = await signInWithPopup(auth, googleProvider);
                const user = userCredential.user;
                
                const userDocRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDocRef);
                if (!docSnap.exists()) {
                    await setDoc(userDocRef, {
                        email: user.email,
                        isSubscribed: false,
                        createdAt: new Date(),
                    });
                }
                window.location.href = '/pricing'; // Redirect to pricing after signup
            } catch (error) {
                console.error("Google signup failed:", error);
                alert(error.message);
            }
        });
    }
});