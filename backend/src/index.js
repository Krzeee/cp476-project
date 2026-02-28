const express = require('express');
const mysql = require('mysql2/promise');
const {
  registerUser,
  addBoard,
  makePost,
  replyToPost,
  followBoard,
  updateUserProfile,
} = require('./db');

// --- Database connection pool ---
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'insecurepassword',
  database: 'forum',
  waitForConnections: true,
  connectionLimit: 10,
});

// --- Express app ---
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from Node.js server!');
});

app.post('/register', async (req, res) => {
  const { username, passwordHash } = req.body;
  try {
    const id = await registerUser(username, passwordHash, pool);
    res.json({ userID: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/boards', async (req, res) => {
  const { boardName } = req.body;
  try {
    const id = await addBoard(boardName, pool);
    res.json({ boardID: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/posts', async (req, res) => {
  const { boardID, authorID, content } = req.body;
  try {
    const id = await makePost(boardID, authorID, content, pool);
    res.json({ postID: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/posts/:postID/replies', async (req, res) => {
  const { postID } = req.params;
  const { authorID, content } = req.body;
  try {
    const id = await replyToPost(Number(postID), authorID, content, pool);
    res.json({ replyID: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/users/:userID/follow', async (req, res) => {
  const { userID } = req.params;
  const { boardID } = req.body;
  try {
    await followBoard(Number(userID), boardID, pool);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/users/:userID/profile', async (req, res) => {
  const { userID } = req.params;
  const { content = null, icon = null } = req.body;
  try {
    await updateUserProfile(Number(userID), content, icon, pool);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
