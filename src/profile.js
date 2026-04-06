const API = 'http://localhost:3000';

document.addEventListener("DOMContentLoaded", async () => {

  const loggedInUser = localStorage.getItem("loggedInUser");
  const loggedInUserID = Number(localStorage.getItem("loggedInUserID"));

  if (!loggedInUser || !loggedInUserID) {
    window.location.href = "login.html";
    return;
  }

  // -----------------------
  // ELEMENTS
  // -----------------------
  const usernameDisplay = document.getElementById("usernameDisplay");
  const bioText = document.getElementById("bioText");
  const profilePicDisplay = document.getElementById("profilePicDisplay");
  const topProfilePic = document.getElementById("topProfilePic");
  const logoutBtn = document.getElementById("logoutBtn");
  const editIcon = document.getElementById("editIcon");
  const overlay = document.getElementById("editProfileOverlay");
  const saveBtn = document.getElementById("saveProfileBtn");
  const cancelBtn = document.getElementById("cancelProfileBtn");
  const editBioInput = document.getElementById("editBioInput");
  const profilePicInput = document.getElementById("profilePicInput");

  // -----------------------
  // SET USERNAME
  // -----------------------
  usernameDisplay.textContent = "@" + loggedInUser;

  // -----------------------
  // LOAD PROFILE
  // -----------------------
  try {
    const res = await fetch(`${API}/users/${loggedInUserID}/profile`);
    if (res.ok) {
      const profile = await res.json();
      if (profile.content) bioText.textContent = profile.content;
      if (profile.icon) {
        profilePicDisplay.src = profile.icon;
        if (topProfilePic) topProfilePic.src = profile.icon;
      }
    }
  } catch (err) {
    console.error('Failed to load profile:', err);
  }

  // -----------------------
  // LOGOUT
  // -----------------------
  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInUserID");
    window.location.href = "login.html";
  });

  // -----------------------
  // EDIT PROFILE MODAL
  // -----------------------
  editIcon?.addEventListener("click", () => {
    editBioInput.value = bioText.textContent;
    overlay.style.display = "flex";
  });

  cancelBtn?.addEventListener("click", () => {
    overlay.style.display = "none";
  });

  saveBtn?.addEventListener("click", async () => {
    const newBio = editBioInput.value;
    const file = profilePicInput.files[0];

    let iconData = null;
    if (file) {
      iconData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    try {
      const res = await fetch(`${API}/users/${loggedInUserID}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newBio || null,
          icon: iconData || null,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Failed to save profile');
        return;
      }

      bioText.textContent = newBio;
      if (iconData) {
        profilePicDisplay.src = iconData;
        if (topProfilePic) topProfilePic.src = iconData;
      }
    } catch (err) {
      alert('Could not connect to server.');
      console.error(err);
    }

    overlay.style.display = "none";
  });

  // -----------------------
  // THEME TOGGLE
  // -----------------------
  const toggleBtn = document.getElementById("themeToggle");
  if (toggleBtn) {
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark");
      toggleBtn.textContent = "🌙";
    }
    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      const isDark = document.body.classList.contains("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      toggleBtn.textContent = isDark ? "🌙" : "☀️";
    });
  }

  // -----------------------
  // SIDEBAR BOARDS
  // -----------------------
  const myBoardsList = document.getElementById("myBoards");
  const availableBoardsList = document.getElementById("availableBoards");

  try {
    const [allRes, myRes] = await Promise.all([
      fetch(`${API}/boards`),
      fetch(`${API}/users/${loggedInUserID}/boards`),
    ]);
    const allBoards = await allRes.json();
    const myBoards = await myRes.json();
    const myBoardIDs = new Set(myBoards.map(b => b.boardID));

    const mainPage = allBoards.find(b => b.boardName === 'Main Page');
    const otherBoards = allBoards.filter(b => b.boardName !== 'Main Page');

    // Always pin Main Page at top
    if (mainPage) {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = "Main Page";
      link.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.setItem("currentBoardID", mainPage.boardID);
        window.location.href = "index.html";
      });
      li.appendChild(link);
      myBoardsList.appendChild(li);
    }

    otherBoards.forEach(board => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = board.boardName;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.setItem("currentBoardID", board.boardID);
        window.location.href = "index.html";
      });
      li.appendChild(link);

      if (myBoardIDs.has(board.boardID)) {
        myBoardsList.appendChild(li);
      } else {
        const joinLi = document.createElement("li");
        const joinLink = document.createElement("a");
        joinLink.href = "#";
        joinLink.textContent = `→ ${board.boardName}`;
        joinLink.addEventListener("click", (e) => {
          e.preventDefault();
          localStorage.setItem("currentBoardID", board.boardID);
          window.location.href = "index.html";
        });
        joinLi.appendChild(joinLink);
        availableBoardsList.appendChild(joinLi);
      }
    });
  } catch (err) {
    console.error('Failed to load boards:', err);
  }
});