# ERP Platform

A B2B ERP web application built as an end-of-study engineering project (PFE).

## Tech Stack

- **Frontend:** Next.js + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT + Role-Based Access Control

## Modules

- Authentication & Authorization
- HR / Employees & Departments
- Projects & Team Assignments
- TimeCard (log hours, approvals)
- Leave Management *(coming soon)*
- Finance / Expenses *(coming soon)*

## Architecture

Three-tier architecture deployed on a private OpenStack cloud with:
- CI/CD via GitHub Actions
- Blue/Green deployment via Nginx
- Secure overlay networking via ZeroTier
- Artifact storage via OpenStack Swift

## Getting Started

### Prerequisites
- Node.js v20+
- PostgreSQL
- npm

### Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```