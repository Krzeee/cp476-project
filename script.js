// --------------------
// OPEN / CLOSE CREATE POST MODAL
// --------------------

function openModal() {
    document.getElementById("modalOverlay").style.display = "flex";
}

function closeModal() {
    document.getElementById("modalOverlay").style.display = "none";
}


// --------------------
// CREATE NEW POST
// --------------------

document.getElementById("postForm").addEventListener("submit", function(event) {
    event.preventDefault();

    let title = document.getElementById("postTitle").value;
    let body = document.getElementById("postBody").value;

    let newPost = document.createElement("div");
    newPost.classList.add("post");

    // Each post gets its own data object
    newPost.postData = {
        title: title,
        body: body,
        hearts: 0,
        likes: 0,
        comments: []
    };

    newPost.innerHTML = `
        <div class="post-text">
            <h4>${title}</h4>
            <p>${body}</p>
        </div>
        <div class="post-meta">
            <span class="comment-preview">💬 0 comments</span>
            <span class="like-preview">👍 0 likes</span>
        </div>
    `;

    // Click post to open view modal
    newPost.addEventListener("click", function() {
        openViewModal(newPost);
    });

    document.querySelector(".main-content").appendChild(newPost);

    closeModal();
    this.reset();
});


// --------------------
// VIEW POST MODAL
// --------------------

let currentPost = null;

function openViewModal(postElement) {

    currentPost = postElement;
    let data = postElement.postData;

    document.getElementById("viewTitle").innerText = data.title;
    document.getElementById("viewBody").innerText = data.body;

    document.getElementById("heartCount").innerText = data.hearts;
    document.getElementById("likeCount").innerText = data.likes;

    // Load comments
    let commentList = document.getElementById("commentList");
    commentList.innerHTML = "";

    data.comments.forEach(comment => {
        let p = document.createElement("p");
        p.innerText = comment;
        commentList.appendChild(p);
    });

    document.getElementById("viewModal").style.display = "flex";
}

function closeViewModal() {
    document.getElementById("viewModal").style.display = "none";
}


// --------------------
// REACTIONS
// --------------------

document.getElementById("heartBtn").addEventListener("click", function() {

    currentPost.postData.hearts++;

    document.getElementById("heartCount").innerText = currentPost.postData.hearts;

    updatePreviewCounts();
});

document.getElementById("likeBtn").addEventListener("click", function() {

    currentPost.postData.likes++;

    document.getElementById("likeCount").innerText = currentPost.postData.likes;

    updatePreviewCounts();
});


// --------------------
// ADD COMMENT
// --------------------

document.getElementById("addCommentBtn").addEventListener("click", function() {

    let commentText = document.getElementById("newComment").value;

    if (commentText.trim() !== "") {

        currentPost.postData.comments.push(commentText);

        let p = document.createElement("p");
        p.innerText = commentText;
        document.getElementById("commentList").appendChild(p);

        document.getElementById("newComment").value = "";

        updatePreviewCounts();
    }
});


// --------------------
// UPDATE PREVIEW COUNTS (Post Card)
// --------------------

function updatePreviewCounts() {

    let commentPreview = currentPost.querySelector(".comment-preview");
    let likePreview = currentPost.querySelector(".like-preview");

    commentPreview.innerText = `💬 ${currentPost.postData.comments.length} comments`;
    likePreview.innerText = `👍 ${currentPost.postData.likes} likes`;
}