CREATE DATABASE IF NOT EXISTS forum;
USE forum;

CREATE TABLE users (
  userID INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL
);

CREATE TABLE boards (
  boardID INT AUTO_INCREMENT PRIMARY KEY,
  boardName VARCHAR(50) NOT NULL UNIQUE,
  creatorID INT NULL,
  FOREIGN KEY (creatorID) REFERENCES users(userID)
);

-- Default system board, always exists
INSERT INTO boards (boardName, creatorID) VALUES ('Main Page', NULL);

CREATE TABLE posts (
  postID INT AUTO_INCREMENT PRIMARY KEY,
  boardID INT NOT NULL,
  author INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  likes INT DEFAULT 0,
  hearts INT DEFAULT 0,
  creationDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (boardID) REFERENCES boards(boardID),
  FOREIGN KEY (author) REFERENCES users(userID)
);

CREATE TABLE replies (
  replyID INT AUTO_INCREMENT PRIMARY KEY,
  postID INT NOT NULL,
  authorID INT NOT NULL,
  content TEXT NOT NULL,
  creationDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (postID) REFERENCES posts(postID),
  FOREIGN KEY (authorID) REFERENCES users(userID)
);

CREATE TABLE profiles (
  userID INT PRIMARY KEY,
  content TEXT,
  icon MEDIUMTEXT,
  FOREIGN KEY (userID) REFERENCES users(userID)
);

CREATE TABLE boardFollow (
  userID INT NOT NULL,
  boardID INT NOT NULL,
  PRIMARY KEY (userID, boardID),
  FOREIGN KEY (userID) REFERENCES users(userID),
  FOREIGN KEY (boardID) REFERENCES boards(boardID)
);