document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        // Check if ajax function is available
        if (typeof window.ajax === 'undefined') {
            // Fallback to the older implementation
            if (handleLoginLegacy(username, password)) {
                alert("Login successful! Redirecting...");
                window.location.href = "home.html";
            } else {
                alert("Invalid username or password. Please try again.");
            }
            return;
        }

        // Use callback-based ajax instead of Promises
        window.ajax('POST', '/login', { username, password }, 
            // Success callback
            (response) => {
                // Save user data
                localStorage.setItem('currentUser', username);
                
                if (response.data && response.data.token) {
                    sessionStorage.setItem('authToken', response.data.token);
                }
                
                alert("Login successful! Redirecting...");
                window.location.href = "home.html";
            },
            // Error callback
            (error) => {
                alert(`Login failed: ${error.message || "Invalid username or password"}`);
            }
        );
    });

    // Legacy login handler for backward compatibility
    function handleLoginLegacy(username, password) {
        const accounts = JSON.parse(localStorage.getItem("accounts")) || {};
        
        if (accounts[username] && accounts[username].password === password) {
            const token = btoa(`${username}:${Date.now()}`);
            sessionStorage.setItem('authToken', token);
            localStorage.setItem('currentUser', username);
            return true;
        }
        
        return false;
    }
});