document.addEventListener("DOMContentLoaded", function () {

    // ---------- REGISTER ----------
    let registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();

            let username = document.getElementById("registerUsername").value;
            let password = document.getElementById("registerPassword").value;

            let users = JSON.parse(localStorage.getItem("users")) || {};

            if (users[username]) {
                alert("Username already exists!");
                return;
            }

            users[username] = password;
            localStorage.setItem("users", JSON.stringify(users));

            alert("Account created! Please log in.");
            window.location.href = "login.html";
        });
    }

    // ---------- LOGIN ----------
    let loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            let username = document.getElementById("loginUsername").value;
            let password = document.getElementById("loginPassword").value;

            let users = JSON.parse(localStorage.getItem("users")) || {};

            if (users[username] && users[username] === password) {

                localStorage.setItem("loggedInUser", username);
                window.location.href = "index.html";

            } else {
                alert("Invalid login!");
            }
        });
    }

});