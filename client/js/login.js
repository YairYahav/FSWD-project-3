document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        // Use FXMLHttpRequest directly
        const xhr = new FXMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === FXMLHttpRequest.DONE) {
                const response = JSON.parse(xhr.responseText);
                
                if (xhr.status >= 200 && xhr.status < 300) {
                    // Save user data
                    localStorage.setItem('currentUser', username);
                    
                    if (response.data && response.data.token) {
                        sessionStorage.setItem('authToken', response.data.token);
                    }
                    
                    alert("Login successful! Redirecting...");
                    window.location.href = "home.html";
                } else {
                    alert(`Login failed: ${response.message || "Invalid username or password"}`);
                }
            }
        };
        
        xhr.open('POST', '/login');
        xhr.send(JSON.stringify({ username, password }));
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