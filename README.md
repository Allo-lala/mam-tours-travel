# MAM Tours & Travel - Car Hire Management System

A complete car hire management system  with REST API, PostgreSQL database, and Next.js frontend.

## Features

- **Authentication**: JWT-based auth with access and refresh tokens
- **Vehicle Management**: Browse, search, and filter premium vehicles
- **Booking System**: Create bookings with availability checks and conflict prevention
- **Admin Dashboard**: Manage bookings, mark vehicles as hired/returned
- **Uganda-Specific**: Number plate validation for Ugandan formats
- **Timezone Support**: All timestamps in Africa/Kampala timezone
- **Role-Based Access**: User and Admin roles with different permissions

## Tech Stack

**Backend:**
- Node.js 20+ with TypeScript
- Express.js
- PostgreSQL with Prisma ORM
- JWT authentication (bcrypt + jsonwebtoken)
- Zod for validation
- Jest + Supertest for testing

**Frontend:**
- Next.js 15 with TypeScript
- React 19
- Tailwind CSS v4
- shadcn/ui components
- date-fns for timezone handling

## Quick Start with Docker

1. **setup:**
\
2. **Start all services:**
\`\`\`bash
docker-compose up
\`\`\`

This will start:
- PostgreSQL on port 5432
- Backend API on port 3001
- Frontend on port 3000

The database will be automatically migrated and seeded with sample data.

## Manual Setup

### Backend Setup

1. **Install dependencies:**
\`\`\`bash
cd backend
npm install
\`\`\`

2. **Configure environment:**
\`\`\`bash
cp .env.example .env
# Edit .env with your database credentials
\`\`\`

3. **Run migrations and seed:**
\`\`\`bash
npx prisma migrate dev
npx prisma db seed
\`\`\`

## Demo Credentials

**Admin Account:**
- Email: admin@mamtours.ug
- Password: admin123

**User Account:**
- Email: user@example.com
- Password: user123


## run the project by Starting the Backend Server
`cd ~/Downloads/mam-tours-travel/backend
npm run dev

## then in a new terminal
cd ~/Downloads/mam-tours-travel
npm run dev