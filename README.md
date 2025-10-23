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

4. **Start backend:**
\`\`\`bash
npm run dev
\`\`\`

Backend runs on http://localhost:3001

### Frontend Setup

1. **Install dependencies:**
\`\`\`bash
npm install
\`\`\`

2. **Configure environment:**
\`\`\`bash
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:3001
\`\`\`

3. **Start frontend:**
\`\`\`bash
npm run dev
\`\`\`

Frontend runs on http://localhost:3000

## Environment Variables

### Backend (.env)
\`\`\`
DATABASE_URL="postgresql://user:password@localhost:5432/mamtours?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
PORT=3001
NODE_ENV=development
\`\`\`

### Frontend (.env.local)
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:3001
\`\`\`

## Demo Credentials

**Admin Account:**
- Email: admin@mamtours.ug
- Password: admin123

**User Account:**
- Email: user@example.com
- Password: user123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Vehicles
- `GET /api/vehicles` - List all vehicles
- `GET /api/vehicles/:id` - Get vehicle details
- `POST /api/vehicles` - Add vehicle (admin only)
- `PUT /api/vehicles/:id` - Update vehicle (admin only)

### Bookings
- `GET /api/bookings` - Get user bookings (or all for admin)
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/mark-hired` - Mark as hired (admin)
- `PUT /api/bookings/:id/mark-returned` - Mark as returned (admin)
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Reports
- `GET /api/reports/usage` - Vehicle usage report (admin)

## Testing

### Run backend tests:
\`\`\`bash
cd backend
npm test
\`\`\`

### Test with curl:

**Register:**
\`\`\`bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
\`\`\`

**Login:**
\`\`\`bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}'
\`\`\`

**Create Booking:**
\`\`\`bash
curl -X POST http://localhost:3001/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "vehicleId": 1,
    "startAt": "2025-01-15T10:00:00Z",
    "endAt": "2025-01-17T10:00:00Z",
    "purpose": "SELF_DRIVE",
    "type": "DAILY"
  }'
\`\`\`

## Ugandan Number Plate Validation

The system validates two formats:

1. **Legacy Format**: `UAA 001A` (3 letters + 3 digits + 1 letter)
2. **Digital Format**: `UG 32 00042` (UG + 1-2 digits + 4-5 digits)

