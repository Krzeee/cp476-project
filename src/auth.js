const API = 'http://localhost:3000';

document.addEventListener("DOMContentLoaded", function () {

  // ---------- REGISTER ----------
  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const username = document.getElementById("registerUsername").value.trim();
      const password = document.getElementById("registerPassword").value;

      try {
        const res = await fetch(`${API}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, passwordHash: password }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || 'Registration failed.');
          return;
        }

        alert('Account created! Please log in.');
        window.location.href = 'login.html';
      } catch (err) {
        alert('Could not connect to server.');
        console.error(err);
      }
    });
  }

  // ---------- LOGIN ----------
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value;

      try {
        const res = await fetch(`${API}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, passwordHash: password }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || 'Invalid login!');
          return;
        }

        // Store session info in localStorage (just IDs, no sensitive data)
        localStorage.setItem('loggedInUser', data.username);
        localStorage.setItem('loggedInUserID', data.userID);
        window.location.href = 'index.html';
      } catch (err) {
        alert('Could not connect to server.');
        console.error(err);
      }
    });
  }
});