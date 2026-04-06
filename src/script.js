// script.js
const API = 'http://localhost:3000';

document.addEventListener("DOMContentLoaded", async () => {

  // -----------------------
  // AUTH & SESSION
  // -----------------------
  const loggedInUser = localStorage.getItem("loggedInUser");
  const loggedInUserID = Number(localStorage.getItem("loggedInUserID"));

  if (!loggedInUser || !loggedInUserID) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInUserID");
    window.location.href = "login.html";
  });

  // If we're not on index.html (e.g. on profile.html), stop here.
  const createBoardBtn = document.getElementById("createBoardBtn");
  if (!createBoardBtn) return;

  // -----------------------
  // DOM ELEMENTS
  // -----------------------
  const myBoardsList = document.getElementById("myBoards");
  const availableBoardsList = document.getElementById("availableBoards");
  const postsContainer = document.getElementById("postsContainer");
  const joinLeaveBtn = document.getElementById("joinLeaveBtn");
  const createBoardOverlay = document.getElementById("createBoardOverlay");
  const createBoardForm = document.getElementById("createBoardForm");
  const boardNameInput = document.getElementById("boardNameInput");

  // -----------------------
  // STATE
  // -----------------------
  let allBoards = [];
  let myBoardIDs = new Set();
  let currentBoard = null;
  let currentPost = null;

  // -----------------------
  // LOAD BOARDS
  // -----------------------
  async function loadBoards() {
    const [allRes, myRes] = await Promise.all([
      fetch(`${API}/boards`),
      fetch(`${API}/users/${loggedInUserID}/boards`),
    ]);
    allBoards = await allRes.json();
    const myBoards = await myRes.json();
    myBoardIDs = new Set(myBoards.map(b => b.boardID));
  }

  // -----------------------
  // RESOLVE CURRENT BOARD
  // -----------------------
  function resolveCurrentBoard() {
    const mainPage = allBoards.find(b => b.boardName === 'Main Page');
    const storedBoardID = Number(localStorage.getItem("currentBoardID"));

    if (!storedBoardID) {
      currentBoard = mainPage || allBoards[0] || null;
    } else {
      currentBoard = allBoards.find(b => b.boardID === storedBoardID) || mainPage || allBoards[0] || null;
    }

    if (currentBoard) {
      localStorage.setItem("currentBoardID", currentBoard.boardID);
    }
  }

  // -----------------------
  // SIDEBAR
  // Renders Main Page pinned at the top always, then other joined boards,
  // then boards the user can join.
  // -----------------------
  function renderSidebar() {
    if (!myBoardsList || !availableBoardsList) return;

    myBoardsList.innerHTML = "";
    availableBoardsList.innerHTML = "";

    const mainPage = allBoards.find(b => b.boardName === 'Main Page');
    const otherBoards = allBoards.filter(b => b.boardName !== 'Main Page');

    // Always pin Main Page at the top of "Boards"
    if (mainPage) {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = "Main Page";
      link.addEventListener("click", (e) => {
        e.preventDefault();
        openBoard(mainPage.boardID);
      });
      li.appendChild(link);
      myBoardsList.appendChild(li);
    }

    // All other boards split into joined vs available
    otherBoards.forEach(board => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = board.boardName;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        openBoard(board.boardID);
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
          openBoard(board.boardID);
        });
        joinLi.appendChild(joinLink);
        availableBoardsList.appendChild(joinLi);
      }
    });
  }

  function openBoard(boardID) {
    localStorage.setItem("currentBoardID", boardID);
    window.location.href = "index.html";
  }

  // -----------------------
  // CREATE BOARD MODAL
  // -----------------------
  function openCreateBoardModal() {
    createBoardOverlay.style.display = "flex";
  }
  function closeCreateBoardModal() {
    createBoardOverlay.style.display = "none";
    createBoardForm?.reset();
  }

  createBoardBtn.addEventListener("click", openCreateBoardModal);
  createBoardOverlay?.querySelector(".cancel-btn")?.addEventListener("click", closeCreateBoardModal);

  createBoardForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = boardNameInput.value.trim();
    if (!name) return;

    try {
      const res = await fetch(`${API}/boards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardName: name, creatorID: loggedInUserID }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Failed to create board'); return; }

      await loadBoards();
      renderSidebar();
      closeCreateBoardModal();
    } catch (err) {
      alert('Could not connect to server.');
      console.error(err);
    }
  });

  // -----------------------
  // POSTS
  // -----------------------
  async function renderPosts() {
    if (!postsContainer || !currentBoard) return;

    const titleEl = document.getElementById("currentBoardTitle");
    if (titleEl) titleEl.textContent = currentBoard.boardName;

    try {
      const res = await fetch(`${API}/boards/${currentBoard.boardID}/posts`);
      const posts = await res.json();

      postsContainer.innerHTML = "";
      posts.forEach(post => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");
        postDiv.innerHTML = `
          <div class="post-text">
            <h4>${post.title}</h4>
            <p>${post.body}</p>
          </div>
          <div class="post-meta">
            <span>💬 ${post.commentCount} comments</span>
            <span>👍 ${post.likes} likes</span>
          </div>
        `;
        postDiv.addEventListener("click", () => openViewModal(post));
        postsContainer.appendChild(postDiv);
      });
    } catch (err) {
      console.error('Failed to load posts:', err);
    }
  }

  // -----------------------
  // CREATE POST MODAL
  // -----------------------
  const modalOverlay = document.getElementById("modalOverlay");
  const postForm = document.getElementById("postForm");

  document.querySelector(".post-btn")?.addEventListener("click", () => {
    modalOverlay.style.display = "flex";
  });

  document.querySelector("#modalOverlay .cancel-btn")?.addEventListener("click", () => {
    modalOverlay.style.display = "none";
    postForm?.reset();
  });

  postForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("postTitle").value;
    const body = document.getElementById("postBody").value;

    try {
      const res = await fetch(`${API}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardID: currentBoard.boardID,
          authorID: loggedInUserID,
          title,
          content: body,
        }),
      });
      if (!res.ok) { const d = await res.json(); alert(d.error); return; }

      modalOverlay.style.display = "none";
      postForm.reset();
      await renderPosts();
    } catch (err) {
      alert('Could not connect to server.');
      console.error(err);
    }
  });

  // -----------------------
  // VIEW POST MODAL
  // -----------------------
  const viewModal = document.getElementById("viewModal");
  const viewTitle = document.getElementById("viewTitle");
  const viewBody = document.getElementById("viewBody");
  const commentList = document.getElementById("commentList");
  const newComment = document.getElementById("newComment");
  const heartBtn = document.getElementById("heartBtn");
  const likeBtn = document.getElementById("likeBtn");
  const addCommentBtn = document.getElementById("addCommentBtn");

  async function openViewModal(post) {
    currentPost = post;
    viewTitle.innerText = post.title;
    viewBody.innerText = post.body;
    document.getElementById("heartCount").innerText = post.hearts;
    document.getElementById("likeCount").innerText = post.likes;

    try {
      const res = await fetch(`${API}/posts/${post.postID}/replies`);
      const replies = await res.json();
      commentList.innerHTML = "";
      replies.forEach(r => {
        const p = document.createElement("p");
        p.innerText = `${r.authorName}: ${r.content}`;
        commentList.appendChild(p);
      });
    } catch (err) {
      console.error('Failed to load replies:', err);
    }

    viewModal.style.display = "flex";
  }

  function closeViewModal() {
    viewModal.style.display = "none";
  }

  document.querySelector("#viewModal .cancel-btn")?.addEventListener("click", closeViewModal);
  window.closeViewModal = closeViewModal;

  // -----------------------
  // REACTIONS
  // -----------------------
  heartBtn?.addEventListener("click", async () => {
    if (!currentPost) return;
    await fetch(`${API}/posts/${currentPost.postID}/heart`, { method: 'POST' });
    currentPost.hearts++;
    document.getElementById("heartCount").innerText = currentPost.hearts;
    await renderPosts();
  });

  likeBtn?.addEventListener("click", async () => {
    if (!currentPost) return;
    await fetch(`${API}/posts/${currentPost.postID}/like`, { method: 'POST' });
    currentPost.likes++;
    document.getElementById("likeCount").innerText = currentPost.likes;
    await renderPosts();
  });

  // -----------------------
  // COMMENTS
  // -----------------------
  addCommentBtn?.addEventListener("click", async () => {
    if (!currentPost) return;
    const comment = newComment.value.trim();
    if (!comment) return;

    try {
      const res = await fetch(`${API}/posts/${currentPost.postID}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorID: loggedInUserID, content: comment }),
      });
      if (!res.ok) { const d = await res.json(); alert(d.error); return; }

      newComment.value = "";
      await openViewModal(currentPost);
      await renderPosts();
    } catch (err) {
      alert('Could not connect to server.');
      console.error(err);
    }
  });

  // -----------------------
  // JOIN / LEAVE BOARD
  // Main Page is always pinned — hide the button for it
  // -----------------------
  function updateJoinLeaveBtn() {
    if (!joinLeaveBtn || !currentBoard) return;

    if (currentBoard.boardName === 'Main Page') {
      joinLeaveBtn.style.display = "none";
      return;
    }

    joinLeaveBtn.style.display = "inline-block";
    joinLeaveBtn.textContent = myBoardIDs.has(currentBoard.boardID) ? "Leave Board" : "Join Board";
  }

  joinLeaveBtn?.addEventListener("click", async () => {
    if (!currentBoard || currentBoard.boardName === 'Main Page') return;
    const isFollowing = myBoardIDs.has(currentBoard.boardID);

    if (isFollowing) {
      const res = await fetch(`${API}/users/${loggedInUserID}/follow`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardID: currentBoard.boardID }),
      });
      if (!res.ok) { const d = await res.json(); alert(d.error); return; }
      myBoardIDs.delete(currentBoard.boardID);
      // Navigate back to Main Page after leaving
      const mainPage = allBoards.find(b => b.boardName === 'Main Page');
      if (mainPage) openBoard(mainPage.boardID);
    } else {
      await fetch(`${API}/users/${loggedInUserID}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardID: currentBoard.boardID }),
      });
      myBoardIDs.add(currentBoard.boardID);
    }

    renderSidebar();
    updateJoinLeaveBtn();
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
  // INIT
  // -----------------------
  await loadBoards();
  resolveCurrentBoard();
  renderSidebar();
  updateJoinLeaveBtn();
  await renderPosts();
});