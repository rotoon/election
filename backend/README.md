# Election System Backend

Express.js + Prisma backend for the Election System.

## Tech Stack

- **Express.js** - Web framework
- **Prisma** - ORM
- **PostgreSQL** - Database (Supabase)
- **JWT** - Authentication
- **Zod** - Validation

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma     # Database schema
├── src/
│   ├── index.ts          # Express entry point
│   ├── routes/           # API route handlers
│   │   ├── auth.routes.ts
│   │   ├── admin.routes.ts
│   │   ├── ec.routes.ts
│   │   ├── voter.routes.ts
│   │   └── public.routes.ts
│   ├── services/         # Business logic
│   │   ├── auth.service.ts
│   │   ├── constituency.service.ts
│   │   ├── party.service.ts
│   │   ├── candidate.service.ts
│   │   ├── vote.service.ts
│   │   ├── result.service.ts
│   │   └── user.service.ts
│   ├── repositories/     # Database access
│   │   ├── profile.repository.ts
│   │   ├── constituency.repository.ts
│   │   ├── party.repository.ts
│   │   ├── candidate.repository.ts
│   │   └── vote.repository.ts
│   ├── middleware/       # Express middleware
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   └── utils/            # Utilities
│       ├── prisma.ts
│       └── jwt.ts
└── package.json
```

## Getting Started

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update `DATABASE_URL` with your Supabase connection string.

### 3. Generate Prisma client

```bash
npm run db:generate
```

### 4. Push schema to database (optional)

```bash
npm run db:push
```

### 5. Start development server

```bash
npm run dev
```

Server will start at `http://localhost:4000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Admin (requires admin role)

- `GET /api/admin/constituencies` - List constituencies
- `POST /api/admin/constituencies` - Create constituency
- `DELETE /api/admin/constituencies/:id` - Delete constituency
- `GET /api/admin/users` - List users
- `PATCH /api/admin/users/:id/role` - Update user role

### EC (requires ec or admin role)

- `GET /api/ec/parties` - List parties
- `POST /api/ec/parties` - Create party
- `PUT /api/ec/parties/:id` - Update party
- `DELETE /api/ec/parties/:id` - Delete party
- `GET /api/ec/candidates` - List candidates
- `POST /api/ec/candidates` - Create candidate
- `DELETE /api/ec/candidates/:id` - Delete candidate
- `POST /api/ec/control/open-all` - Open all polls
- `POST /api/ec/control/close-all` - Close all polls
- `PATCH /api/ec/control/:id` - Toggle poll status

### Voter (requires authentication)

- `GET /api/voter/constituency` - Get user's constituency
- `GET /api/voter/candidates` - Get candidates in constituency
- `GET /api/voter/my-vote` - Get current vote
- `POST /api/voter/vote` - Cast vote
- `PUT /api/voter/vote` - Change vote

### Public (no authentication)

- `GET /api/public/results` - Get election results
- `GET /api/public/parties` - Get party stats
- `GET /api/public/constituencies` - List constituencies
