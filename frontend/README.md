# 🎓 Learnato Forum - Real-time Discussion Platform

A modern, real-time discussion forum built with React, Node.js, Socket.IO, and MongoDB. Features live updates, voting, replies, and solved status tracking.

![Forum Preview](https://img.shields.io/badge/Status-Production%20Ready-success)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🔴 **Real-time Updates** - See new posts, replies, and votes instantly
- 👍 **Voting System** - Upvote helpful questions and answers
- 💬 **Nested Replies** - Comment and reply to discussions
- ✅ **Solved Tracking** - Mark questions as answered
- 🔍 **Search & Filter** - Find posts by keywords and sort by votes/date
- 📊 **Live Statistics** - Track total, solved, and open questions
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS

## 🏗️ Tech Stack

### Frontend
- React 18
- Socket.IO Client
- Tailwind CSS
- Lucide Icons
- Vite

### Backend
- Node.js & Express
- Socket.IO
- MongoDB & Mongoose
- CORS

### DevOps
- Docker & Docker Compose
- Nginx (Production)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB** (v7.0 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Docker** (Optional, for containerized deployment) - [Download here](https://www.docker.com/products/docker-desktop)

## 🚀 Quick Start

### Option 1: Local Development (Without Docker)

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/learnato-forum.git
cd learnato-forum
```

#### 2. Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/learnato_forum
FRONTEND_URL=http://localhost:5173
SOCKET_ORIGIN=http://localhost:5173
EOF

# Start MongoDB (in a separate terminal)
mongod

# Start the backend server
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📡 Environment: development
✅ MongoDB Connected: localhost
```

#### 3. Setup Frontend

```bash
# Navigate to frontend folder (from project root)
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
EOF

# Start the development server
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

#### 4. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/posts

### Option 2: Docker Deployment (Recommended for Production)

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/learnato-forum.git
cd learnato-forum
```

#### 2. Project Structure
Ensure your project structure looks like this:
```
learnato-forum/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   └── postController.js
│   │   ├── models/
│   │   │   └── Post.js
│   │   ├── routes/
│   │   │   └── postRoutes.js
│   │   ├── middleware/
│   │   │   └── errorMiddleware.js
│   │   └── socket/
│   │       └── socketHandler.js
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── DiscussionForum.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
└── docker-compose.yml
```

#### 3. Build and Run with Docker

```bash
# Build and start all services
docker compose up --build

# Or run in detached mode (background)
docker compose up -d --build
```

#### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api/posts
- **MongoDB**: mongodb://localhost:27017

#### 5. Verify Everything is Running

```bash
# Check running containers
docker ps

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove volumes (fresh start)
docker compose down -v
```

## 🧪 Testing Real-time Features

1. **Open TWO browser windows** side by side
2. Navigate to http://localhost:3000 (or 5173 for dev) in both
3. **Create a post** in Window 1
4. **Watch it appear instantly** in Window 2! 🎉
5. Try these actions and watch live updates:
   - Add replies
   - Upvote posts
   - Mark posts as solved
   - Delete posts

## 📁 Environment Variables

### Backend (.env)
```env
NODE_ENV=development              # development | production
PORT=5000                         # Server port
MONGODB_URI=mongodb://localhost:27017/learnato_forum
FRONTEND_URL=http://localhost:5173
SOCKET_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Docker Production (.env)
```env
# Backend
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/forum?authSource=admin
FRONTEND_URL=http://localhost:3000
SOCKET_ORIGIN=http://localhost:3000

# Frontend
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

## 📦 Project Structure Explained

### Backend Structure
```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   └── postController.js    # Business logic
│   ├── models/
│   │   └── Post.js              # MongoDB schema
│   ├── routes/
│   │   └── postRoutes.js        # API endpoints
│   ├── middleware/
│   │   └── errorMiddleware.js   # Error handling
│   └── socket/
│       └── socketHandler.js     # WebSocket events
├── server.js                    # Entry point
└── package.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   └── DiscussionForum.jsx  # Main component
│   ├── App.jsx                  # Root component
│   └── main.jsx                 # Entry point
├── public/
└── package.json
```

## 🔧 Available Scripts

### Backend
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests (if configured)
```

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Docker
```bash
docker compose up              # Start all services
docker compose up -d           # Start in background
docker compose down            # Stop all services
docker compose down -v         # Stop and remove volumes
docker compose logs -f         # View logs
docker compose restart backend # Restart a service
```

## 🐛 Troubleshooting

### Port Already in Use
**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Windows - Find and kill the process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Socket Connection Failed
**Error**: `WebSocket connection failed` or `ERR_CONNECTION_REFUSED`

**Solution**:
1. Ensure backend is running
2. Check CORS settings in `server.js`
3. Verify `SOCKET_URL` matches backend address
4. Check browser console for errors

### MongoDB Connection Error
**Error**: `MongoNetworkError: connect ECONNREFUSED`

**Solution**:
1. Ensure MongoDB is running: `mongod`
2. Check connection string in `.env`
3. Verify MongoDB is accessible on port 27017
4. For Docker: Ensure containers are on same network

### Frontend Not Loading
**Error**: Blank page or build errors

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite

# Rebuild
npm run build
```

## 🔒 Security Best Practices

### For Production Deployment:

1. **Environment Variables**: Never commit `.env` files
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.production
   ```

2. **MongoDB Authentication**: Use strong credentials
   ```env
   MONGODB_URI=mongodb://username:strongpassword@host:port/database
   ```

3. **CORS**: Restrict origins
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     credentials: true
   }));
   ```

4. **Rate Limiting**: Add rate limiting middleware
   ```bash
   npm install express-rate-limit
   ```

5. **HTTPS**: Use SSL certificates in production
   - Let's Encrypt (free)
   - Cloudflare
   - AWS Certificate Manager

## 🚢 Production Deployment

### Deploy to Cloud Platforms

#### Heroku (Backend + Frontend)
```bash
# Install Heroku CLI
heroku login

# Create app
heroku create learnato-forum

# Add MongoDB
heroku addons:create mongolab

# Deploy
git push heroku main
```

#### Vercel (Frontend Only)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

#### DigitalOcean (Full Stack with Docker)
```bash
# SSH into droplet
ssh root@your-server-ip

# Clone repo
git clone your-repo-url
cd learnato-forum

# Run with Docker
docker compose up -d
```

## 📊 API Endpoints

### Posts
```
GET    /api/posts              # Get all posts
GET    /api/posts/:id          # Get single post
POST   /api/posts              # Create post
POST   /api/posts/:id/reply    # Add reply
POST   /api/posts/:id/upvote   # Upvote post
POST   /api/posts/:id/answered # Mark as answered
DELETE /api/posts/:id          # Delete post
```

### Query Parameters
```
GET /api/posts?sortBy=votes    # Sort by votes
GET /api/posts?sortBy=date     # Sort by date
GET /api/posts?search=keyword  # Search posts
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - [GitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- MongoDB for database
- React & Vite for frontend
- Tailwind CSS for styling
- Lucide for icons

## 📞 Support

For support, email support@learnato.com or open an issue on GitHub.

---

**Made with ❤️ by the Learnato Team**