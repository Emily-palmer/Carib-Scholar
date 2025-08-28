import { auth, signOut, onAuthStateChanged } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');

    // Handle Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await signOut(auth);
                window.location.href = '/'; // Redirect to home page
            } catch (error) {
                console.error("Logout failed:", error);
                alert("An error occurred during logout.");
            }
        });
    }
});