document.addEventListener("DOMContentLoaded", async () => {
  const loggedInUserID = Number(localStorage.getItem("loggedInUserID"));
  if (!loggedInUserID) return;

  const topProfilePic = document.getElementById("topProfilePic");
  if (!topProfilePic) return;

  try {
    const res = await fetch(`http://localhost:3000/users/${loggedInUserID}/profile`);
    if (res.ok) {
      const profile = await res.json();
      if (profile.icon) topProfilePic.src = profile.icon;
    }
  } catch (err) {
    console.error('Failed to load profile pic:', err);
  }
});