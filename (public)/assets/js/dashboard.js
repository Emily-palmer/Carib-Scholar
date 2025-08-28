import { auth, onAuthStateChanged, signOut } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in. Update the dashboard view.
            console.log("User is logged in:", user.email);
            // Example: Display the user's email
            document.getElementById('welcome-message').textContent = `Welcome, ${user.email}!`;
        } else {
            // User is signed out. Redirect to the index page.
            console.log("User is logged out. Redirecting to login.");
            window.location.href = '/login';
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault(); // Prevent the default # behavior
            try {
                await signOut(auth);
                // The onAuthStateChanged listener will handle the redirect
            } catch (error) {
                console.error("Logout failed:", error);
                alert("Logout failed. Please try again.");
            }
        });
    }
});