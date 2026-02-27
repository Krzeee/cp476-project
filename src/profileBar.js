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
