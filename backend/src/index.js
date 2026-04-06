const express = require('express');
const mysql = require('mysql2/promise');
const {
  registerUser,
  addBoard,
  makePost,
  replyToPost,
  followBoard,
  likePost,
  heartPost,
  updateUserProfile,
  getBoards,
  getPostsInBoard,
  getRepliesForPost,
  getUserProfile,
  getUserFollowedBoards,
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

// --- Ensure "Main Page" board always exists ---
async function ensureMainPage() {
  const [rows] = await pool.query('SELECT boardID FROM boards WHERE boardName = ?', ['Main Page']);
  if (rows.length === 0) {
    await pool.query('INSERT INTO boards (boardName, creatorID) VALUES (?, NULL)', ['Main Page']);
    console.log('Created default "Main Page" board.');
  }
}

// --- Express app ---
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/', (req, res) => {
  res.send('Hello from Node.js server!');
});

// --- Auth ---

app.post('/register', async (req, res) => {
  const { username, passwordHash } = req.body;
  try {
    const id = await registerUser(username, passwordHash, pool);
    // Auto-follow Main Page for every new user
    const [rows] = await pool.query('SELECT boardID FROM boards WHERE boardName = ?', ['Main Page']);
    if (rows.length > 0) {
      await followBoard(id, rows[0].boardID, pool);
    }
    res.json({ userID: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/login', async (req, res) => {
  const { username, passwordHash } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT userID, username, passwordHash FROM users WHERE username = ?',
      [username]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const user = rows[0];
    if (user.passwordHash !== passwordHash) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    // Ensure user follows Main Page (handles accounts created before this fix)
    const [mainRows] = await pool.query('SELECT boardID FROM boards WHERE boardName = ?', ['Main Page']);
    if (mainRows.length > 0) {
      await followBoard(user.userID, mainRows[0].boardID, pool);
    }
    res.json({ userID: user.userID, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Boards ---

app.get('/boards', async (req, res) => {
  try {
    const boards = await getBoards(pool);
    res.json(boards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/boards', async (req, res) => {
  const { boardName, creatorID } = req.body;
  try {
    const id = await addBoard(boardName, creatorID, pool);
    await followBoard(creatorID, id, pool);
    res.json({ boardID: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/boards/:boardID/posts', async (req, res) => {
  const { boardID } = req.params;
  try {
    const posts = await getPostsInBoard(Number(boardID), pool);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Posts ---

app.post('/posts', async (req, res) => {
  const { boardID, authorID, title, content } = req.body;
  try {
    const id = await makePost(boardID, authorID, title, content, pool);
    res.json({ postID: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/posts/:postID/like', async (req, res) => {
  const { postID } = req.params;
  try {
    await likePost(Number(postID), pool);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/posts/:postID/heart', async (req, res) => {
  const { postID } = req.params;
  try {
    await heartPost(Number(postID), pool);
    res.json({ success: true });
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

app.get('/posts/:postID/replies', async (req, res) => {
  const { postID } = req.params;
  try {
    const replies = await getRepliesForPost(Number(postID), pool);
    res.json(replies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Users ---

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

// Leaving a board — Main Page is protected, can never be left
app.delete('/users/:userID/follow', async (req, res) => {
  const { userID } = req.params;
  const { boardID } = req.body;
  try {
    const [rows] = await pool.query('SELECT boardName FROM boards WHERE boardID = ?', [boardID]);
    if (rows.length > 0 && rows[0].boardName === 'Main Page') {
      return res.status(400).json({ error: 'You cannot leave the Main Page board.' });
    }
    await pool.query(
      'DELETE FROM boardFollow WHERE userID = ? AND boardID = ?',
      [Number(userID), boardID]
    );
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

app.get('/users/:userID/profile', async (req, res) => {
  const { userID } = req.params;
  try {
    const profile = await getUserProfile(Number(userID), pool);
    if (!profile) return res.status(404).json({ error: 'User not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/users/:userID/boards', async (req, res) => {
  const { userID } = req.params;
  try {
    const boards = await getUserFollowedBoards(Number(userID), pool);
    res.json(boards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Start server ---
const port = 3000;
app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  try {
    await ensureMainPage();
  } catch (err) {
    console.error('Warning: could not ensure Main Page board:', err.message);
  }
});