# Movie Catalog

Fullstack movie catalog application built with `React + TypeScript` on the frontend and `Express + TypeScript + Prisma + PostgreSQL` on the backend.

It includes:

- authentication with individual user accounts
- movie catalog with cover, synopsis, and average rating
- comments and ratings per movie
- user panel with personal activity and preferences
- admin panel to manage movies and moderate reviews

## Stack

- Frontend: `React`, `Vite`, `TypeScript`, `React Router`
- Backend: `Express`, `TypeScript`, `Prisma`
- Database: `PostgreSQL`
- Local infrastructure: `Docker Compose`

## Project structure

- `frontend/`: client application
- `backend/`: API, data model, and seed
- `docker-compose.yml`: local PostgreSQL service
- `scripts/dev.sh`: integrated startup for database, migrations, seed, and apps

## Requirements

- `npm`
- `Docker` with the daemon running

## Configuration

### Backend

1. Copy the environment file:

```bash
cp backend/.env.example backend/.env
```

2. Review the variables if you want to change ports, credentials, or secrets:

```env
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/movie_catalog?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
CORS_ORIGIN="http://localhost:5173"
ADMIN_EMAIL="admin@moviecatalog.dev"
ADMIN_PASSWORD="Admin123!"
DEMO_EMAIL="demo@moviecatalog.dev"
DEMO_PASSWORD="Demo123!"
```

### Frontend

1. Copy the environment file:

```bash
cp frontend/.env.example frontend/.env
```

2. Default value:

```env
VITE_API_URL="http://localhost:4000"
```

## Quick start

From the project root:

```bash
npm install
npm run dev
```

That command:

- creates `backend/.env` and `frontend/.env` if they are missing
- starts PostgreSQL with Docker
- generates the Prisma client
- applies migrations
- runs the seed
- starts backend and frontend

## Local URLs

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:4000](http://localhost:4000)
- Health check: [http://localhost:4000/health](http://localhost:4000/health)

## Demo credentials

### Admin

- email: `admin@moviecatalog.dev`
- password: `Admin123!`

### Demo user

- email: `demo@moviecatalog.dev`
- password: `Demo123!`

## Panels

### User panel

Available after signing in.

Route:

- `/profile`

Includes:

- personal activity
- comments list
- ratings list
- edit and delete for the user's own comments
- basic account preferences

### Admin panel

Available to users with the `ADMIN` role.

Routes:

- `/admin/movies`
- `/admin/reviews`

Includes:

- movie CRUD
- search and sorting
- comment moderation
- `hide`, `unhide`, `flag`, `unflag`, and delete actions

## Useful commands

### Development

```bash
npm run dev
npm run dev:backend
npm run dev:frontend
```

### Database

```bash
npm run db:migrate
npm run db:seed
```

### Quality and build

```bash
npm run lint
npm run build
```

## Manual startup

If you prefer to start each part separately:

1. Start PostgreSQL:

```bash
docker compose up -d postgres
```

2. Configure environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Generate Prisma and apply migrations:

```bash
npm run prisma:generate -w backend
cd backend && npx prisma migrate deploy --schema prisma/schema.prisma
```

4. Run the seed:

```bash
npm run seed -w backend
```

5. Start backend and frontend in separate terminals:

```bash
npm run dev -w backend
npm run dev -w frontend
```

## Seeded data

The seed loads:

- `admin` and `demo` users
- initial movie catalog
- sample ratings
- sample comments

## Notes

- The backend expects PostgreSQL on `localhost:5432` by default.
- The frontend consumes the API from `VITE_API_URL`.
- The development script checks that ports `4000` and `5173` are free before starting.
