document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signup-form");

    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const username = document.getElementById("signup-username").value;
        const password = document.getElementById("signup-password").value;
        const email = document.getElementById("signup-email").value;

        // Use FXMLHttpRequest directly
        const xhr = new FXMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === FXMLHttpRequest.DONE) {
                const response = JSON.parse(xhr.responseText);
                
                if (xhr.status >= 200 && xhr.status < 300) {
                    alert("Account created successfully! Redirecting to login...");
                    window.location.href = "login.html";
                } else {
                    alert(`Registration failed: ${response.message || "Username already exists"}`);
                }
            }
        };
        
        xhr.open('POST', '/register');
        xhr.send(JSON.stringify({ username, password, email }));
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