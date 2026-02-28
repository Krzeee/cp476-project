async function registerUser(username, passwordHash, db) {
    const [result] = await db.query(
        'INSERT INTO users (username, passwordHash) VALUES (?, ?)',
        [username, passwordHash]
    );
    return result.insertId;
}

async function addBoard(boardName, db) {
    const [result] = await db.query(
        'INSERT INTO boards (boardName) VALUES (?)',
        [boardName]
    );
    return result.insertId;
}

async function makePost(boardID, authorID, content, db) {
    const [result] = await db.query(
        'INSERT INTO posts (boardID, author, content) VALUES (?, ?, ?)',
        [boardID, authorID, content]
    );
    return result.insertId;
}

async function replyToPost(postID, authorID, content, db) {
    const [result] = await db.query(
        'INSERT INTO replies (postID, author, content) VALUES (?, ?, ?)',
        [postID, authorID, content]
    );
    return result.insertId;
}

async function followBoard(userID, boardID, db) {
    await db.query(
        'INSERT IGNORE INTO boardFollow (userID, boardID) VALUES (?, ?)',
        [userID, boardID]
    );
}

async function updateUserProfile(userID, content, icon, db) {
    await db.query(
        `INSERT INTO profiles (userID, content, icon)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           content = COALESCE(VALUES(content), content),
           icon    = COALESCE(VALUES(icon),    icon)`,
        [userID, content, icon]
    );
}

// --- Read functions ---

async function getBoards(db) {
    const [rows] = await db.query(
        'SELECT boardID, boardName FROM boards ORDER BY boardName'
    );
    return rows;
}

async function getPostsInBoard(boardID, db) {
    const [rows] = await db.query(
        `SELECT p.postID, p.boardID, p.author AS authorID, u.username AS authorName,
                p.content, p.creationDate
         FROM posts p
         JOIN users u ON u.userID = p.author
         WHERE p.boardID = ?
         ORDER BY p.creationDate DESC`,
        [boardID]
    );
    return rows;
}

async function getRepliesForPost(postID, db) {
    const [rows] = await db.query(
        `SELECT r.replyID, r.postID, r.authorID, u.username AS authorName,
                r.content, r.creationDate
         FROM replies r
         JOIN users u ON u.userID = r.authorID
         WHERE r.postID = ?
         ORDER BY r.creationDate ASC`,
        [postID]
    );
    return rows;
}

async function getUserProfile(userID, db) {
    const [rows] = await db.query(
        `SELECT u.userID, u.username, p.content, p.icon
         FROM users u
         LEFT JOIN profiles p ON p.userID = u.userID
         WHERE u.userID = ?`,
        [userID]
    );
    return rows[0] ?? null;
}

async function getUserFollowedBoards(userID, db) {
    const [rows] = await db.query(
        `SELECT b.boardID, b.boardName
         FROM boardFollow bf
         JOIN boards b ON b.boardID = bf.boardID
         WHERE bf.userID = ?
         ORDER BY b.boardName`,
        [userID]
    );
    return rows;
}

module.exports = {
    registerUser,
    addBoard,
    makePost,
    replyToPost,
    followBoard,
    updateUserProfile,
    getBoards,
    getPostsInBoard,
    getRepliesForPost,
    getUserProfile,
    getUserFollowedBoards,
};

