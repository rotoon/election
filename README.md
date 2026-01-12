# Election System

A full-stack online election system with separate frontend and backend.

## Project Structure

```
election/
├── frontend/          # Next.js frontend
│   ├── app/           # Pages (App Router)
│   ├── components/    # React components
│   ├── lib/           # Utilities
│   ├── store/         # Zustand state
│   └── types/         # TypeScript types
│
├── backend/           # Express + Prisma backend
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Database access
│   │   └── middleware/    # Auth & errors
│   └── prisma/        # Database schema
│
└── .toh/              # Toh Framework config
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Backend

```bash
cd backend
npm install
npm run db:generate
npm run dev
```

API runs at [http://localhost:4000](http://localhost:4000)

## Tech Stack

**Frontend:**

- Next.js 14 (App Router)
- Tailwind CSS + shadcn/ui
- Zustand (State)
- React Hook Form + Zod

**Backend:**

- Express.js
- Prisma ORM
- PostgreSQL (Supabase)
- JWT Authentication

## Features

- 🗳️ Online voting system
- 👥 User roles: Admin, EC, Voter
- 🏛️ Party & candidate management
- 📊 Real-time results
- 🔒 Secure authentication
