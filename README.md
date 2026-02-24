# CityClarity

A web application for reporting and acting upon public infrastructure issues faced by civilians. Citizens can submit reports about broken roads, faulty streetlights, damaged sidewalks, and other civic problems — then track their resolution through a transparent status pipeline.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the App](#running-the-app)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [License](#license)

## Features

- **Report Infrastructure Issues** — submit reports with title, description, address, photos, and map location
- **Interactive Map** — browse and place reports on a Leaflet map
- **Voting System** — upvote/downvote reports to surface the most critical issues
- **Status Tracking** — reports flow through `Pending` → `Sent` → `Finished`
- **Comments & Subscriptions** — discuss reports and subscribe to status updates
- **Notifications** — get notified when subscribed reports change status
- **Institution Portal** — institutions can view and manage reports assigned to them
- **Admin Dashboard** — full admin control over users, reports, institutions, and categories
- **User-Admin Messaging** — conversations between users and administrators
- **Contact Form** — public contact form for general inquiries
- **Authentication** — JWT-based auth with registration, login, and password reset

## Tech Stack

| Layer      | Technology                                                     |
| ---------- | -------------------------------------------------------------- |
| Frontend   | React 19, Vite 7, Tailwind CSS v4, shadcn/ui, Lucide icons    |
| Backend    | Express 5, Node.js (ESM)                                       |
| Database   | SQLite via Prisma ORM                                          |
| Auth       | JSON Web Tokens (jsonwebtoken + bcrypt)                        |
| Maps       | Leaflet / react-leaflet                                        |
| Forms      | React Hook Form + Zod validation                               |
| Data       | TanStack React Query, Axios                                    |
| Charts     | Recharts                                                       |
| Testing    | Vitest, Supertest, React Testing Library                       |

## Project Structure

```
ProjectHackaton/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js            # Seed script
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── db/                # Prisma client
│   │   ├── middleware/        # Auth, admin, institution guards
│   │   ├── routes/            # Express route definitions
│   │   ├── utils/             # Hashing helpers
│   │   └── index.js           # App entry point
│   ├── uploads/               # Uploaded images (git-ignored)
│   ├── .env                   # Backend environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route pages
│   │   ├── services/          # API client (Axios)
│   │   ├── context/           # React context (Auth)
│   │   └── lib/               # Utilities
│   ├── public/
│   ├── .env.local             # Frontend environment variables
│   └── package.json
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** >= 18 (LTS recommended)
- **npm** >= 9

That's it — the database is SQLite so no external database server is required.

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ProjectHackaton
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

### Environment Variables

#### Backend (`backend/.env`)

Create a `.env` file in the `backend/` directory:

```env
# Server
NODE_ENV=development
PORT=5000

# Database — SQLite, no external setup needed
DATABASE_URL="file:./prisma/dev.db"

# JWT — change this to a long random string in production
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Admin — required in the request body when registering an admin account
ADMIN_REGISTER_KEY=admin-secret-key-2024

# CORS — must match the URL where the frontend runs
CORS_ORIGIN=http://localhost:5173

# Password Reset
RESET_TOKEN_TTL_MINUTES=60
EXPOSE_RESET_TOKEN=true

# Upload provider (local or s3)
UPLOAD_PROVIDER=local
```

#### Frontend (`frontend/.env.local`)

Create a `.env.local` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Database Setup

From the `backend/` directory, generate the Prisma client and create the database:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

This creates the SQLite database file automatically. To seed it with sample data:

```bash
npm run seed
```

To inspect the database visually:

```bash
npx prisma studio
```

### Running the App

You need two terminal windows — one for the backend and one for the frontend.

**Terminal 1 — Backend** (runs on `http://localhost:5000`):

```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend** (runs on `http://localhost:5173`):

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

## Available Scripts

### Backend (`backend/`)

| Command                    | Description                          |
| -------------------------- | ------------------------------------ |
| `npm run dev`              | Start dev server with nodemon        |
| `npm run seed`             | Seed the database with sample data   |
| `npm test`                 | Run backend tests with Vitest        |
| `npx prisma migrate dev`  | Create and apply database migrations |
| `npx prisma studio`       | Open Prisma Studio (DB browser)      |
| `npx prisma generate`     | Regenerate the Prisma client         |

### Frontend (`frontend/`)

| Command             | Description                       |
| ------------------- | --------------------------------- |
| `npm run dev`       | Start Vite dev server             |
| `npm run build`     | Build for production              |
| `npm run preview`   | Preview the production build      |
| `npm run lint`      | Lint with ESLint                  |
| `npm test`          | Run frontend tests with Vitest    |

## API Endpoints

All backend routes are under `/api`:

| Route                | Description                          |
| -------------------- | ------------------------------------ |
| `/api/auth`          | Login, register, password reset      |
| `/api/reports`       | Report CRUD, comments, subscriptions |
| `/api/votes`         | Upvote / downvote reports            |
| `/api/admin`         | Admin operations                     |
| `/api/institutions`  | Institution management               |
| `/api/categories`    | Category management                  |
| `/api/contact`       | Contact form submissions             |
| `/api/upload`        | File uploads                         |
| `/api/conversations` | User-admin messaging                 |
| `/api/notifications` | User notifications                   |
| `/api/users`         | User management                      |
| `/api/institution`   | Institution portal                   |

Uploaded images are served statically from `/uploads`.

## Testing

### Backend

```bash
cd backend
npm test
```

Uses Vitest + Supertest. Tests cover authentication, middleware, reports, and voting.

### Frontend

```bash
cd frontend
npm test
```

Uses Vitest + React Testing Library + jsdom. Tests cover AuthContext, ProtectedRoute, and the Login page.

## License

This project is licensed under the **GNU General Public License v3.0** — see the [LICENSE](LICENSE) file for details.
