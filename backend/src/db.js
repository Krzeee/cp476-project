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

module.exports = {
    registerUser,
    addBoard,
    makePost,
    replyToPost,
    followBoard,
    updateUserProfile,
};
