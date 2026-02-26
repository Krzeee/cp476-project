CREATE TABLE Users (
	Username TINYTEXT PRIMARY KEY,
	PasswordHash TINYBLOB,
	PRIMARY KEY (Username)
)

CREATE TABLE Boards (
	Boardname TINYTEXT PRIMARY KEY,
)

CREATE TABLE Admins (
	Boardname TINYTEXT,
	Username TINYTEXT,
	PRIMARY KEY (Boardname, Username),
	FOREIGN KEY (Boardname) REFERENCES Boards(Boardname),
	FOREIGN KEY (Username) REFERENCES Users(Username)
)

CREATE TABLE Posts (
	PostID INT PRIMARY KEY AUTO_INCREMENT,
	Boardname TINYTEXT,
	Author TINYTEXT,
	Content TEXT,
	CreationDate DATE,
	FOREIGN KEY (Boardname) REFERENCES Boards(Boardname),
	FOREIGN KEY (Author) REFERENCES Users(Username)
)

CREATE TABLE Replies
	ReplyID INT PRIMARY KEY AUTO_INCREMENT,
	ParentID INT,
	Author TINYTEXT,
	Content TEXT,
	CreationDate DATE,
	FOREIGN KEY (ParentID) REFERENCES Posts(PostID),
	FOREIGN KEY (Author) REFERENCES Users(Username)
