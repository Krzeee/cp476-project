# cp476-project
Group 12 CP476 project

Online Discussion Board / Forum

A simplified discussion platform.

Core features:
- Create discussion topics
- Post replies
- Edit or delete posts
Why this works well:
- Classic web application pattern
- Strong CRUD and relational design
- Easy to demonstrate moderation or permission

## Frontend
Run website with Python via Terminal/Command prompt and navigate to directory
`cd src`

Run `python -m http.server 8000`

Open `http://localhost:8000`

## Backend
Run database via the compose.yaml file in the backend/mysql directory

`cd backend/mysql`
`docker compose up -d`

Run the API endpoint server via `node backend/src/index.js`

## Contributions
Derek: Profile page, local storage setup, board object creation

Trenton: Database and back-end setup

Nanditha: Front-end setup, account register and login, stylesheet
