document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signup-form");

    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const username = document.getElementById("signup-username").value;
        const password = document.getElementById("signup-password").value;
        const email = document.getElementById("signup-email").value;

        // Check if ajax function is available
        if (typeof window.ajax === 'undefined') {
            // Fallback to the older implementation
            if (handleSignupLegacy(username, password, email)) {
                alert("Account created successfully! Redirecting to login...");
                window.location.href = "login.html";
            }
            return;
        }

        // Use callback-based ajax instead of Promises
        window.ajax('POST', '/register', { username, password, email },
            // Success callback
            () => {
                alert("Account created successfully! Redirecting to login...");
                window.location.href = "login.html";
            },
            // Error callback
            (error) => {
                alert(`Registration failed: ${error.message || "Username already exists"}`);
            }
        );
    });

    // Legacy signup handler for backward compatibility
    function handleSignupLegacy(username, password, email) {
        let accounts = JSON.parse(localStorage.getItem("accounts")) || {};

        if (accounts[username]) {
            alert("Username already exists. Please choose another.");
            return false;
        } 
        
        accounts[username] = { password, email };
        localStorage.setItem("accounts", JSON.stringify(accounts));
        return true;
    }
});