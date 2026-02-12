# bepay money - Unified Global Payment Infrastructure

bepay money is a unified global payment infrastructure platform that enables users and merchants to transact seamlessly across fiat and crypto. 

**Note: This project has been migrated from Next.js/Prisma to a MERN stack (MongoDB, Express, React, Vite).**

## Project Structure

- **backend/**: Node.js (Express) + Mongoose + MongoDB
- **frontend/**: React (Vite) + Tailwind CSS + Shadcn/UI + React Router

## Features

- **Authentication**: User registration and login with JWT (Mongoose).
- **Organization**: Create organization, update profile, and submit KYC.
- **Beneficiaries**: Add and manage beneficiaries (integrated with Mesta API).
- **Payouts**: Initiate payouts to beneficiaries and track status.
- **Dashboard**: Overview of balance and recent activity.
- **Reconciliation**: Full transaction ledger and CSV export.

## Prerequisites

- Node.js (v20+)
- npm (v10+)
- MongoDB (Running locally or via cloud)

## Setup Instructions

1.  **Clone the repository**
    ```bash
    git clone <repo-url>
    cd bepay-platform
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    # Ensure .env file has correct DATABASE_URL (MongoDB)
    npm run dev
    ```
    Backend runs on `http://localhost:5000`.

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    Frontend runs on `http://localhost:5173`.

## start.bat

You can use the root `start.bat` to launch both servers and open the browser:
```bash
./start.bat
```

## API Documentation

- **POST /api/auth/register**: Register new user & organization
- **POST /api/auth/login**: Login
- **GET /api/payouts**: List payouts
- **POST /api/payouts**: Create payout
- **GET /api/payouts/reconciliation**: Get reconciliation data

## License

Private - bepay money
