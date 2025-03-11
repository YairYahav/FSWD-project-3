document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    let accounts = JSON.parse(localStorage.getItem("accounts")) || {};

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        if (accounts[username] && accounts[username].password === password) {
            alert("Login successful! Redirecting...");
            const token = btoa(`${username}:${Date.now()}`);
            sessionStorage.setItem('authToken', token);
            window.location.href = "home.html";
        } else {
            alert("Invalid username or password. Please try again.");
        }
    });
});