document.addEventListener("DOMContentLoaded", () => {
  const usernameDisplay = document.getElementById("usernameDisplay");
  const bioText = document.getElementById("bioText");
  const logoutBtn = document.querySelector(".logout");

  const loggedInUser = localStorage.getItem("loggedInUser");

  if (!loggedInUser) {
    window.location.href = "login.html";
    return;
  }

  usernameDisplay.textContent = "@" + loggedInUser;

  const bioKey = `bio_${loggedInUser}`;
  const savedBio = localStorage.getItem(bioKey);
  if (savedBio) {
    bioText.textContent = savedBio;
  }

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  });

  // ---------- Edit Profile Modal ----------
  const editIcon = document.querySelector(".edit-icon");
  const overlay = document.getElementById("editProfileOverlay");
  const saveBtn = document.getElementById("saveProfileBtn");
  const cancelBtn = document.getElementById("cancelProfileBtn");

  const editBioInput = document.getElementById("editBioInput");
  const profilePicInput = document.getElementById("profilePicInput");
  const profilePic = document.querySelector(".profile-pic");
  const picKey = `pic_${loggedInUser}`;

  // Open modal
  editIcon.addEventListener("click", () => {
    editBioInput.value = bioText.textContent;
    overlay.style.display = "flex";
  });

  // Cancel
  cancelBtn.addEventListener("click", () => {
    overlay.style.display = "none";
  });

  // Save
  saveBtn.addEventListener("click", () => {
    // Save bio
    localStorage.setItem(bioKey, editBioInput.value);
    bioText.textContent = editBioInput.value;

    // Save profile picture
    const file = profilePicInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        localStorage.setItem(picKey, reader.result);
        profilePic.src = reader.result;
      };
      reader.readAsDataURL(file);
    }

    overlay.style.display = "none";
  });

  // Load saved profile pic on page load
  const savedPic = localStorage.getItem(picKey);
  if (savedPic) {
    profilePic.src = savedPic;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const loggedInUser = localStorage.getItem("loggedInUser");
  if (!loggedInUser) return; // no user logged in

  const topProfilePic = document.getElementById("topProfilePic");
  const picKey = `pic_${loggedInUser}`;

  const savedPic = localStorage.getItem(picKey);
  if (savedPic) {
    topProfilePic.src = savedPic;
  }
});
