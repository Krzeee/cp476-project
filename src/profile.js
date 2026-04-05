const API = 'http://localhost:3000';

document.addEventListener("DOMContentLoaded", async () => {
  const usernameDisplay = document.getElementById("usernameDisplay");
  const bioText = document.getElementById("bioText");
  const logoutBtn = document.querySelector(".logout");
  const profilePic = document.querySelector(".profile-pic");

  const loggedInUser = localStorage.getItem("loggedInUser");
  const loggedInUserID = Number(localStorage.getItem("loggedInUserID"));

  if (!loggedInUser || !loggedInUserID) {
    window.location.href = "login.html";
    return;
  }

  usernameDisplay.textContent = "@" + loggedInUser;

  // -----------------------
  // LOAD PROFILE FROM API
  // -----------------------
  try {
    const res = await fetch(`${API}/users/${loggedInUserID}/profile`);
    if (res.ok) {
      const profile = await res.json();
      if (profile.content) bioText.textContent = profile.content;
      if (profile.icon) profilePic.src = profile.icon;
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
  const editIcon = document.querySelector(".edit-icon");
  const overlay = document.getElementById("editProfileOverlay");
  const saveBtn = document.getElementById("saveProfileBtn");
  const cancelBtn = document.getElementById("cancelProfileBtn");
  const editBioInput = document.getElementById("editBioInput");
  const profilePicInput = document.getElementById("profilePicInput");

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

    // Convert profile pic to base64 if a new one was chosen
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

      // Update displayed values
      bioText.textContent = newBio;
      if (iconData) profilePic.src = iconData;
    } catch (err) {
      alert('Could not connect to server.');
      console.error(err);
    }

    overlay.style.display = "none";
  });

  // -----------------------
  // LOAD BOARDS IN SIDEBAR
  // -----------------------
  const myBoardsList = document.getElementById("myBoards");
  const availableBoardsList = document.getElementById("availableBoards");

  if (myBoardsList && availableBoardsList) {
    try {
      const [allRes, myRes] = await Promise.all([
        fetch(`${API}/boards`),
        fetch(`${API}/users/${loggedInUserID}/boards`),
      ]);
      const allBoards = await allRes.json();
      const myBoards = await myRes.json();
      const myBoardIDs = new Set(myBoards.map(b => b.boardID));

      allBoards.forEach(board => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = "#";
        link.textContent = board.boardName;
        link.addEventListener("click", () => {
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
          joinLink.addEventListener("click", () => {
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
  }

  // -----------------------
  // TOP BAR PROFILE PIC
  // -----------------------
  const topProfilePic = document.getElementById("topProfilePic");
  if (topProfilePic) {
    try {
      const res = await fetch(`${API}/users/${loggedInUserID}/profile`);
      if (res.ok) {
        const profile = await res.json();
        if (profile.icon) topProfilePic.src = profile.icon;
      }
    } catch (err) {
      console.error('Failed to load top profile pic:', err);
    }
  }
});