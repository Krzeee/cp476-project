CREATE TABLE users {
  userID INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
}

CREATE TABLE board {
  boardID INT AUTO_INCREMENT PRIMARY KEY,
  boardName VARCHAR(50) NOT NULL UNIQUE
}

CREATE TABLE posts {
  postID INT AUTO_INCREMENT PRIMARY KEY,
  boardID INT NOT NULL,
  authorID INT NOT NULL,
  contentText TEXT NOT NULL,
  postDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (boardID) REFERENCES boards(boardID),
  FOREIGN KEY (authorID) REFERENCES users(userID),
}

CREATE TABLE replies {
  replyID INT AUTO_INCREMENT PRIMARY KEY,
  postID INT NOT NULL,
  authorID INT NOT NULL,
  contentText TEXT NOT NULL,
  replyDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (postID) REFERENCES posts(postID),
  FOREIGN KEY (authorID) REFERENCES users(userID)
}

CREATE TABLE profiles {
  username VARCHAR(50) PRIMARY KEY,
  profileBody TEXT,
  profileIcon VARCHAR(255), --URL/filepath to img
  FOREIGN KEY (username) REFERENCES users(username)
}

CREATE TABLE user_follows {
  followerID INT NOT NULL,
  followingID INT NOT NULL,
  PRIMARY KEY (followerID, followingID),
  FOREIGN KEY (followerID) REFERENCES users(userID),
  FOREIGN KEY (followingID) REFERENCE users(userID)
}

CREATE TABLE board_follows {
  userID INT NOT NULL,
  boardID INT NOT NULL,
  PRIMARY KEY (userID, boardID),
  FOREIGN KEY (userID) REFERENCES users(userID),
  FOREIGN KEY (boardID) REFERENCES boards(boardID)
}

CREATE TABLE attachments {
  attachmentID INT AUTO_INCREMENT PRIMARY KEY,
  fileType VARCHAR(50) NOT NULL,
  postID INT NOT NULL,
  fileURL VARCHAR(255) NOT NULL,
  FOREIGN KEY (postID) REFERENCES posts(postID)
}
