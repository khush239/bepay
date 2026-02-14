# Bepay Money Platform

Bepay Money is a unified global payment infrastructure platform that enables users and merchants to transact seamlessly. This project is a MERN stack implementation (MongoDB, Express, React, Node.js) designed to demonstrate core features like user authentication, organization management, beneficiary handling, and payout processing with real-time updates.

## Features

-   **Authentication**: Secure user registration and login using JWT.
-   **Organization Management**: Create and manage organization profiles with KYC integration.
-   **Beneficiary Management**: Add, view, and *edit* beneficiaries. Integrated with Mesta API for validation.
-   **Payouts**: Initiate payouts to beneficiaries (External) or internal transfers.
-   **Real-time Updates**: Status updates for transactions via polling and webhook simulation.
-   **Dashboard**: Real-time overview of balances, recent activity, and quick actions.
-   **Reconciliation**: detailed transaction ledger with CSV export.
-   **Mesta Integration**: Fully configured to use Mesta Sandbox APIs for realistic payout processing.

## Tech Stack

-   **Frontend**: React (Vite), Tailwind CSS, Shadcn/UI, React Router, Axios.
-   **Backend**: Node.js, Express.js, Mongoose.
-   **Database**: MongoDB.
-   **Containerization**: Docker, Docker Compose.

## Prerequisites

-   **Node.js** (v18+)
-   **npm** (v9+)
-   **MongoDB** (running locally or via Docker)
-   **Docker Desktop** (optional, for containerized run)

## Setup Instructions

### Option 1: Docker (Recommended)

Run the entire application stack (Frontend + Backend + MongoDB) with a single command:

1.  **Clone the repository**
    ```bash
    git clone <repo-url>
    cd bepay-platform-main
    ```

2.  **Start with Docker Compose**
    ```bash
    docker-compose up --build
    ```

3.  **Access the App**
    *   Frontend: [http://localhost:5173](http://localhost:5173)
    *   Backend: [http://localhost:5000](http://localhost:5000)

### Option 2: Manual Setup

1.  **Backend Setup**
    ```bash
    cd backend
    npm install
    # Ensure MongoDB is running locally
    # Create a .env file based on the example below
    npm run dev
    ```

2.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## Environment Variables

### Backend (`backend/.env`)

```ini
PORT=5000
DATABASE_URL="mongodb://127.0.0.1:27017/bepay"
JWT_SECRET="your_jwt_secret"
MESTA_API_URL="https://api.stg.mesta.xyz/v1"
MESTA_API_KEY="your_api_key"
MESTA_API_SECRET="your_api_secret"
```

## Architecture Notes

*   **Monorepo Structure**: The customized project structure keeps `frontend` and `backend` separate but in the same repository for easier development and deployment coordination.
*   **Controller-Service Pattern**: The backend logic is separated into Controllers (REQ/RES handling) and Services (Business logic/External API calls) to maintain clean code.
*   **Component-Based UI**: The frontend uses small, reusable components (built on Radix UI/Shadcn) to ensure consistency and speed up development.
*   **Optimistic UI & Polling**: To simulate real-time banking delays without complex WebSocket infrastructure, the app uses polling (every 5s) to check for transaction status updates.

## Design Tradeoffs

1.  **MongoDB vs SQL**:
    *   *Decision*: Used MongoDB for this MVP.
    *   *Tradeoff*: While SQL (PostgreSQL) is traditionally preferred for strict financial ledgers due to ACID compliance and relational integrity, MongoDB allows for faster iteration on schema design for the diverse data types (Beneficiaries, Payouts, Webhooks) in this prototype phase.

2.  **Polling vs WebSockets**:
    *   *Decision*: Implemented short-interval polling (5s) + Polling Hooks in React.
    *   *Tradeoff*: WebSockets provide true real-time push events but introduce significant complexity (connection state, auth, scaling). Polling is simpler to implement and sufficient for the expected user load of a dashboard, though it causes more server load.

3.  **Client-Side Filtering**:
    *   *Decision*: Filtering beneficiaries and transactions is done client-side.
    *   *Tradeoff*: This provides instant UI feedback for small datasets (<1000 items) but will not scale well. Server-side pagination and filtering would be required for production loads.

4.  **Simulation vs Verified Webhooks**:
    *   *Decision*: Added a "Demo Mode" that auto-completes payouts effectively simulating a webhook callback.
    *   *Tradeoff*: Real webhooks require a public URL (e.g., ngrok) which complicates local dev. The simulation allows developers to see the "Pending -> Completed" flow without external dependencies.
