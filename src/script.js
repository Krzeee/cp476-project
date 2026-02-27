// script.js
document.addEventListener("DOMContentLoaded", () => {
  // -----------------------
  // AUTH & LOGOUT
  // -----------------------
  const loggedInUser = localStorage.getItem("loggedInUser");
  if (!loggedInUser) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  });

  // -----------------------
  // DOM ELEMENTS
  // -----------------------
  const myBoardsList = document.getElementById("myBoards");
  const availableBoardsList = document.getElementById("availableBoards");
  const createBoardBtn = document.getElementById("createBoardBtn");
  const postsContainer = document.getElementById("postsContainer");
  const joinLeaveBtn = document.getElementById("joinLeaveBtn");

  // -----------------------
  // LOAD BOARDS
  // -----------------------
  let boards = [];
  const stored = localStorage.getItem("boards");

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      boards = Array.isArray(parsed) ? parsed : [];
    } catch {
      boards = [];
    }
  }

  // Ensure "Main Page" exists and everyone follows it
  if (!boards.some((b) => b.name === "Main Page")) {
    boards.unshift({
      name: "Main Page",
      creator: "system",
      joinedUsers: [loggedInUser],
      posts: [],
    });
  } else {
    // Make sure current user is following Main Page
    const mainPage = boards.find((b) => b.name === "Main Page");
    if (!mainPage.joinedUsers) mainPage.joinedUsers = [];
    if (!mainPage.joinedUsers.includes(loggedInUser)) {
      mainPage.joinedUsers.push(loggedInUser);
    }
  }

  function saveBoards() {
    localStorage.setItem("boards", JSON.stringify(boards));
  }

  // -----------------------
  // CURRENT BOARD (for posts page)
  // -----------------------
  const currentBoardName = localStorage.getItem("currentBoard") || "Main Page";
  let currentBoard = boards.find((b) => b.name === currentBoardName);

  if (!currentBoard) {
    currentBoard = {
      name: currentBoardName,
      creator: loggedInUser,
      joinedUsers: [loggedInUser],
      posts: [],
    };
    boards.push(currentBoard);
    saveBoards();
  }

  if (!currentBoard.joinedUsers)
    currentBoard.joinedUsers = [currentBoard.creator];

  // -----------------------
  // SIDEBAR (Boards / Join a Board)
  // -----------------------
  if (myBoardsList && availableBoardsList) {
    function renderSidebar() {
      myBoardsList.innerHTML = "";
      availableBoardsList.innerHTML = "";

      boards.forEach((board, index) => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = "#";
        link.textContent = board.name;
        link.addEventListener("click", () => openBoard(board.name));

        // Boards the user has joined
        if (
          board.joinedUsers.includes(loggedInUser) ||
          board.creator === loggedInUser
        ) {
          li.appendChild(link);
          myBoardsList.appendChild(li);
        } else {
          // Boards user can join
          const joinLi = document.createElement("li");
          const joinLink = document.createElement("a");
          joinLink.href = "#";
          joinLink.textContent = `→ ${board.name}`;
          joinLink.addEventListener("click", () => openBoard(board.name));
          joinLi.appendChild(joinLink);
          availableBoardsList.appendChild(joinLi);
        }
      });
    }

    function createBoard() {
      const name = prompt("Enter new board name:");
      if (!name) return;

      if (boards.some((b) => b.name === name)) {
        alert("Board already exists!");
        return;
      }

      boards.push({
        name,
        creator: loggedInUser,
        joinedUsers: [loggedInUser],
        posts: [],
      });

      saveBoards();
      renderSidebar();
    }

    function joinBoard(index) {
      const board = boards[index];
      if (!board.joinedUsers.includes(loggedInUser)) {
        board.joinedUsers.push(loggedInUser);
        saveBoards();
        renderSidebar();
        // Update join/leave button if on this board
        if (board.name === currentBoardName && joinLeaveBtn) {
          updateJoinLeaveButtonText();
        }
      }
    }

    function openBoard(name) {
      localStorage.setItem("currentBoard", name);
      window.location.href = "index.html";
    }

    createBoardBtn?.addEventListener("click", createBoard);
    renderSidebar();
  }

  // -----------------------
  // POSTS (only if postsContainer exists)
  // -----------------------
  let currentPost = null;

  if (postsContainer) {
    document.getElementById("currentBoardTitle").textContent = currentBoardName;

    function renderPosts() {
      postsContainer.innerHTML = "";
      currentBoard.posts.forEach((post) => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");
        postDiv.innerHTML = `
          <div class="post-text">
            <h4>${post.title}</h4>
            <p>${post.body}</p>
          </div>
          <div class="post-meta">
            <span>💬 ${post.comments.length} comments</span>
            <span>👍 ${post.likes} likes</span>
          </div>
        `;
        postDiv.addEventListener("click", () => openViewModal(post));
        postsContainer.appendChild(postDiv);
      });
    }

    renderPosts();

    // -----------------------
    // POST MODAL
    // -----------------------
    const modalOverlay = document.getElementById("modalOverlay");
    const postForm = document.getElementById("postForm");

    function openModal() {
      modalOverlay.style.display = "flex";
    }
    function closeModal() {
      modalOverlay.style.display = "none";
    }

    document
      .querySelector("#modalOverlay .cancel-btn")
      ?.addEventListener("click", () => {
        closeModal();
        postForm.reset();
      });

    document.querySelector(".post-btn")?.addEventListener("click", openModal);

    postForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("postTitle").value;
      const body = document.getElementById("postBody").value;
      currentBoard.posts.push({
        title,
        body,
        hearts: 0,
        likes: 0,
        comments: [],
      });
      saveBoards();
      renderPosts();
      closeModal();
      postForm.reset();
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

    function openViewModal(post) {
      currentPost = post;
      viewTitle.innerText = post.title;
      viewBody.innerText = post.body;

      document.getElementById("heartCount").innerText = post.hearts;
      document.getElementById("likeCount").innerText = post.likes;

      commentList.innerHTML = "";
      post.comments.forEach((c) => {
        const p = document.createElement("p");
        p.innerText = c;
        commentList.appendChild(p);
      });

      viewModal.style.display = "flex";
    }

    function closeViewModal() {
      viewModal.style.display = "none";
    }

    document
      .querySelector("#viewModal .cancel-btn")
      ?.addEventListener("click", closeViewModal);

    // -----------------------
    // REACTIONS
    // -----------------------
    heartBtn?.addEventListener("click", () => {
      if (!currentPost) return;
      currentPost.hearts++;
      saveBoards();
      renderPosts();
      openViewModal(currentPost);
    });

    likeBtn?.addEventListener("click", () => {
      if (!currentPost) return;
      currentPost.likes++;
      saveBoards();
      renderPosts();
      openViewModal(currentPost);
    });

    // -----------------------
    // COMMENTS
    // -----------------------
    addCommentBtn?.addEventListener("click", () => {
      if (!currentPost) return;
      const comment = newComment.value.trim();
      if (!comment) return;
      currentPost.comments.push(comment);
      newComment.value = "";
      saveBoards();
      renderPosts();
      openViewModal(currentPost);
    });
  }

  // -----------------------
  // JOIN / LEAVE BUTTON
  // -----------------------
  if (joinLeaveBtn) {
    function updateJoinLeaveButtonText() {
      // Hide button if user is the creator or this is "Main Page"
      if (
        currentBoard.creator === loggedInUser ||
        currentBoard.name === "Main Page"
      ) {
        joinLeaveBtn.style.display = "none";
        return;
      }
      joinLeaveBtn.style.display = "inline-block";
      joinLeaveBtn.textContent = currentBoard.joinedUsers.includes(loggedInUser)
        ? "Leave Board"
        : "Join Board";
    }

    joinLeaveBtn.onclick = () => {
      if (currentBoard.joinedUsers.includes(loggedInUser)) {
        currentBoard.joinedUsers = currentBoard.joinedUsers.filter(
          (u) => u !== loggedInUser,
        );
      } else {
        currentBoard.joinedUsers.push(loggedInUser);
      }
      saveBoards();
      renderSidebar();
      updateJoinLeaveButtonText();
    };

    updateJoinLeaveButtonText();
  }
});
