document.addEventListener("DOMContentLoaded", function () {


    // DETERMINE CURRENT CHANNEL FROM PAGE
    let currentChannel = document.getElementById("currentChannelTitle").innerText;
    let currentPost = null;

    // Load saved posts or initialize empty
    let channels = JSON.parse(localStorage.getItem("channels")) || {
        "Main Page": [],
        "Channel One": [],
        "Channel Two": [],
        "Channel Three": [],
        "Channel Four": [],
        "Channel Five": []
    };

    if (!channels[currentChannel]) {
        channels[currentChannel] = [];
        localStorage.setItem("channels", JSON.stringify(channels));
    }

    // Make sure channel exists
    if (!channels[currentChannel]) {
        channels[currentChannel] = [];
    }

    // SAVE TO LOCAL STORAGE --> for now connect to database
    function saveData() {
        localStorage.setItem("channels", JSON.stringify(channels));
    }

    // RENDER POSTS
    function renderPosts() {
        let container = document.getElementById("postsContainer");
        container.innerHTML = "";

        channels[currentChannel].forEach(post => {

            let postDiv = document.createElement("div");
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

            postDiv.addEventListener("click", function () {
                openViewModal(post);
            });

            container.appendChild(postDiv);
        });
    }

    // CREATE POST
    function openModal() {
        document.getElementById("modalOverlay").style.display = "flex";
    }

    function closeModal() {
        document.getElementById("modalOverlay").style.display = "none";
    }

    document.querySelector(".post-btn").addEventListener("click", openModal);

    document.getElementById("postForm").addEventListener("submit", function (event) {
        event.preventDefault();

        let title = document.getElementById("postTitle").value;
        let body = document.getElementById("postBody").value;

        let newPost = {
            title: title,
            body: body,
            hearts: 0,
            likes: 0,
            comments: []
        };

        channels[currentChannel].push(newPost);

        saveData();
        renderPosts();
        closeModal();
        this.reset();
    });

    // VIEW POST
    function openViewModal(post) {
        currentPost = post;

        document.getElementById("viewTitle").innerText = post.title;
        document.getElementById("viewBody").innerText = post.body;

        document.getElementById("heartCount").innerText = post.hearts;
        document.getElementById("likeCount").innerText = post.likes;

        let commentList = document.getElementById("commentList");
        commentList.innerHTML = "";

        post.comments.forEach(comment => {
            let p = document.createElement("p");
            p.innerText = comment;
            commentList.appendChild(p);
        });

        document.getElementById("viewModal").style.display = "flex";
    }

    function closeViewModal() {
        document.getElementById("viewModal").style.display = "none";
    }

    document.querySelector("#viewModal .cancel-btn")
        .addEventListener("click", closeViewModal);

    // REACTIONS
    document.getElementById("heartBtn").addEventListener("click", function () {
        if (!currentPost) return;
        currentPost.hearts++;
        saveData();
        openViewModal(currentPost);
        renderPosts();
    });

    document.getElementById("likeBtn").addEventListener("click", function () {
        if (!currentPost) return;
        currentPost.likes++;
        saveData();
        openViewModal(currentPost);
        renderPosts();
    });

    // ADD COMMENT
    document.getElementById("addCommentBtn").addEventListener("click", function () {

        if (!currentPost) return;

        let commentText = document.getElementById("newComment").value;

        if (commentText.trim() !== "") {
            currentPost.comments.push(commentText);
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
})