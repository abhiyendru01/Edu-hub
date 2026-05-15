#EDU-HUB (AI-Gamified Learning Platform)

A full-stack quiz platform built using the MERN stack with authentication, quiz management, analytics, AI-powered learning features, and real-time multiplayer support.

## Features

* User Authentication with JWT and Google OAuth
* Role-based access (Admin, Premium Instructor, User)
* Quiz creation and management
* Bookmark quizzes
* Quiz analytics and performance tracking
* Adaptive and AI-generated quizzes
* Real-time multiplayer quiz rooms
* XP, badges, streaks, and gamification
* Study groups and social features
* AI Study Buddy and recommendations

## Tech Stack

### Frontend

* React.js
* Axios
* Framer Motion
* React Router DOM

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Passport.js
* Socket.IO

### Database & Cache

* MongoDB Atlas
* Redis

## Installation

### Clone Repository

```bash
git clone https://github.com/abhiyendru01/Edu-hub.git
cd Edu-hub
```

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=4000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/users/google/callback
FRONTEND_URL=http://localhost:5173
REDIS_URL=your_redis_url
GOOGLE_SECRET=your_session_secret
```

Run backend:

```bash
npm start
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Main API Routes

### Authentication

```http
POST /api/users/register
POST /api/users/login
POST /api/users/logout
```

### Quizzes

```http
GET    /api/quizzes
POST   /api/quizzes
GET    /api/quizzes/:id
DELETE /api/quizzes
```

### Users

```http
GET    /api/users/me
GET    /api/users/profile
PUT    /api/users/profile
```

## Project Structure

```bash
Edu-hub/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── server.js
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── App.jsx
│
└── README.md
```

## Deployment

Frontend:

* Vercel

Backend:

* Railway

Database:

* MongoDB Atlas

## Author

Rahul Raj
