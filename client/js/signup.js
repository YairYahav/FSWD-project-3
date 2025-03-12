document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signup-form");
    let accounts = JSON.parse(localStorage.getItem("accounts")) || {};

    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const username = document.getElementById("signup-username").value;
        const password = document.getElementById("signup-password").value;
        const email = document.getElementById("signup-email").value;

        if (accounts[username]) {
            alert("Username already exists. Please choose another.");
        } else {
            accounts[username] = { password, email };
            localStorage.setItem("accounts", JSON.stringify(accounts));
            alert("Account created successfully! Please log in.");
            signupForm.reset();
            window.location.href = "login.html";
        }
    });
});