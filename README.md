# Hackathon Starter - Express.js + React Monorepo

A full-stack monorepo template with Express.js backend and React frontend, optimized for beginners to get started in minutes.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed (check with: `node --version`)
- Docker Desktop installed and running

### Setup Steps

**1️⃣ Clone and install:**
```bash
git clone <your-repo>
cd hackathon-starter
npm install
```

**2️⃣ Start the database:**
```bash
docker run --name hackathon-db -e POSTGRES_PASSWORD=hackathon123 -e POSTGRES_DB=myapp -p 5432:5432 -d postgres:15
```

Check it's running:
```bash
docker ps
```

**3️⃣ Setup backend environment:**
```bash
cd backend
cp .env.example .env
```

Your `.env` should have:
```env
DATABASE_URL="postgresql://postgres:hackathon123@localhost:5432/myapp"
JWT_SECRET="your-super-secret-key-change-this"
PORT=3001
```

**4️⃣ Setup database:**
```bash
cd ..
npm run db:push
npm run db:seed
```

**5️⃣ Setup frontend environment:**
```bash
cd frontend
cp .env.example .env
```

Your `.env` should have:
```env
VITE_API_URL=http://localhost:3001
```

**6️⃣ Start everything:**

From the root folder:
```bash
cd ..
npm run dev
```

This starts both backend (http://localhost:3001) and frontend (http://localhost:5173)

**✅ You're ready to code!**

---

## 🗄️ Database Setup

### Using Docker (Recommended)

**Start PostgreSQL:**
```bash
docker run --name hackathon-db -e POSTGRES_PASSWORD=hackathon123 -e POSTGRES_DB=myapp -p 5432:5432 -d postgres:15
```

**Your database URL:**
```
postgresql://postgres:hackathon123@localhost:5432/myapp
```

Copy this into `backend/.env` as `DATABASE_URL`

**Useful Docker commands:**
- Stop database: `docker stop hackathon-db`
- Start again: `docker start hackathon-db`
- Remove completely: `docker rm hackathon-db`
- View logs: `docker logs hackathon-db`

**First time database setup:**
```bash
# From root folder
npm run db:push    # Creates tables
npm run db:studio  # Opens visual editor (optional)
npm run db:seed    # Adds sample data
```

### Troubleshooting
- **Port 5432 already in use?** → Change to `-p 5433:5432` and update DATABASE_URL to use port 5433
- **Can't connect to database?** → Make sure Docker is running: `docker ps`
- **Docker not found?** → Install from https://docker.com/products/docker-desktop

---

## ⚙️ Environment Variables

### Backend (.env)

```env
# Database (Required)
DATABASE_URL="postgresql://postgres:hackathon123@localhost:5432/myapp"
# ↑ Get this from your Docker setup

# JWT Secret (Required)
JWT_SECRET="change-this-to-something-random"
# ↑ Generate one: openssl rand -base64 32

# Server Port (Optional)
PORT=3001

# Frontend URL (Optional)
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)

```env
# API URL (Required)
VITE_API_URL=http://localhost:3001
# ↑ Your backend server URL
```

---

## 📁 Project Structure

```
hackathon-starter/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── routes/      # API endpoints (e.g., /api/users)
│   │   ├── controllers/ # Business logic
│   │   ├── middleware/  # Auth, error handling
│   │   ├── lib/         # Database & utilities
│   │   └── types/       # TypeScript types
│   └── prisma/          # Database schema & seeds
│
├── frontend/             # React web app
│   ├── src/
│   │   ├── components/  # Reusable UI (Button, Card, etc.)
│   │   ├── pages/       # Routes (Home, Login, Dashboard)
│   │   ├── lib/         # API calls (axios setup)
│   │   ├── context/     # Auth state management
│   │   └── types/       # TypeScript types
│   └── public/          # Static assets
│
└── package.json         # Workspace config (runs both apps)
```

---

## 🛠️ Essential Commands

### Development

**Start both frontend and backend:**
```bash
npm run dev
```

**Start only backend:**
```bash
npm run dev:backend
```

**Start only frontend:**
```bash
npm run dev:frontend
```

### Database

**Update database with schema changes:**
```bash
npm run db:push
```

**Open visual database editor:**
```bash
npm run db:studio
```

**Add sample data:**
```bash
npm run db:seed
```

### URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Database Studio: http://localhost:5555 (when running db:studio)

---

## ❗ Common Issues & Quick Fixes

**"Port 3001 already in use"**
```bash
npx kill-port 3001
```

**"Port 5173 already in use"**
```bash
npx kill-port 5173
```

**"Can't connect to database"**
- Check Docker is running: `docker ps`
- Make sure you see `hackathon-db` in the list
- Check DATABASE_URL in `backend/.env` matches your Docker setup

**"CORS error in browser"**
- Make sure backend is running on port 3001
- Check VITE_API_URL in `frontend/.env` is correct
- Backend CORS is configured for http://localhost:5173

**"Module not found" errors**
- Delete `node_modules` in root, backend, and frontend
- Run `npm install` from root folder again

**"Docker command not found"**
- Install Docker Desktop: https://docker.com/products/docker-desktop
- Make sure Docker Desktop is running (check system tray)

---

## 📦 What's Included

### Backend Features
✅ User authentication (register/login) with JWT
✅ Protected API routes example
✅ Database setup with Prisma
✅ Error handling middleware
✅ CORS configured for frontend
✅ TypeScript support
✅ Sample CRUD endpoints

### Frontend Features
✅ Login & Register pages
✅ Protected routes
✅ Auth context (global state)
✅ API client setup
✅ Responsive navigation
✅ Tailwind CSS styling
✅ TypeScript support
✅ Basic UI components (Button, Input, Card)

### Database
✅ PostgreSQL with Docker
✅ Prisma ORM
✅ User model included
✅ Seed script with sample data

---

## 🔐 Sample Credentials

After running `npm run db:seed`, you can login with:

- **Email:** demo@example.com
- **Password:** password123

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Create a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users` - Get all users (protected)
- `GET /api/users/:id` - Get user by ID (protected)

---

## 🎨 Tech Stack

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client

---

## 🚢 Deployment

### Backend
1. Build: `cd backend && npm run build`
2. Deploy `dist` folder to your hosting service
3. Set environment variables in your hosting dashboard
4. Run: `npm start`

### Frontend
1. Build: `cd frontend && npm run build`
2. Deploy `dist` folder to Vercel, Netlify, or similar
3. Set VITE_API_URL to your backend URL

---

## 📝 Adding New Features

### Add a new API endpoint

1. Create controller in `backend/src/controllers/`
2. Create route in `backend/src/routes/`
3. Register route in `backend/src/index.ts`

### Add a new page

1. Create page in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Add navigation link in `frontend/src/components/Navbar.tsx`

### Modify database schema

1. Edit `backend/prisma/schema.prisma`
2. Run `npm run db:push`
3. Update TypeScript types if needed

---

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

---

## 📄 License

MIT

---

## 💡 Tips for Hackathons

- **Focus on features, not perfection** - The starter handles auth and setup
- **Use the seed data** - Test quickly without manual user creation
- **Prisma Studio is your friend** - Visual database editor at `npm run db:studio`
- **Check the browser console** - Most errors will show up there
- **API first, UI second** - Test endpoints with Postman/Thunder Client before building UI

---

**Happy Hacking! 🎉**
