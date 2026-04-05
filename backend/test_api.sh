#!/bin/bash

BASE_URL="http://localhost:3000"

echo "1. Registering user..."
curl -X POST "$BASE_URL/register" -H "Content-Type: application/json" -d '{"username": "testuser", "passwordHash": "hash"}'
echo -e "\n"

echo "2. Creating board with creatorID..."
curl -X POST "$BASE_URL/boards" -H "Content-Type: application/json" -d '{"boardName": "Test Board", "creatorID": 1}'
echo -e "\n"

echo "3. Creating post with title..."
curl -X POST "$BASE_URL/posts" -H "Content-Type: application/json" -d '{"boardID": 1, "authorID": 1, "title": "Test Title", "content": "Test Content"}'
echo -e "\n"

echo "4. Liked the post..."
curl -X POST "$BASE_URL/posts/1/like"
echo -e "\n"

echo "5. Hearted the post..."
curl -X POST "$BASE_URL/posts/1/heart"
echo -e "\n"

echo "6. Fetching posts in board..."
curl -X GET "$BASE_URL/boards/1/posts"
echo -e "\n"
