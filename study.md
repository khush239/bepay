# BePay Platform - Project Study Guide

## 1. Project Overview
**BePay** is a unified payment infrastructure designed to streamline B2B and B2C financial operations. It serves as a dashboard for organizations to manage funds, execute payouts, track transactions, and manage beneficiaries.

**Core Value Proposition:**
- Simplified money movement (Internal transfers vs External payouts).
- Real-time balance tracking.
- Seamless beneficiary management.
- Detailed, filterable transaction history.

## 2. Technology Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI (Component Library)
- **State Management:** React Hooks (`useState`, `useEffect`) + URL Search Params (for filtering)
- **Icons:** Lucide React
- **Validation:** Zod + React Hook Form
- **HTTP Client:** Axios (Custom instance in `@/lib/api`)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database ORM:** Prisma
- **Database:** SQLite (Development) / PostgreSQL (Production ready in `.env`)
- **Authentication:** JWT (JSON Web Tokens) with custom middleware

### Infrastructure
- **Package Manager:** NPM
- **Version Control:** Git

## 3. Database Schema (Prisma)

The application relies on a relational schema connecting Users, Organizations, and Financial Records.

- **User**: The authenticated entity (Login credential, Email, Name).
- **Organization**: Linked 1:1 with User. Holds the **Balance** (Float).
- **Payout (Transaction)**:
    - **Type**: `INTERNAL` (Wallet-to-Wallet) or `EXTERNAL` (Payout to Beneficiary).
    - **Status**: `COMPLETED`, `PENDING`, `FAILED`.
    - **Direction**: Determined by `senderId` vs `receiverId`.
- **Beneficiary**: Saved recipients for external payouts (Name, Email, Account Details).

## 4. Key Features & Implementation Details

### A. Authentication
- **Flow**: Traditional Email/Password login.
- **Security**: Passwords hashed (bcrypt), Access via JWT in HTTP-only cookies (or headers depending on implementation).
- **Middleware**: `authenticate` middleware protects `/api/payouts`, `/api/internal`, etc.

### B. Dashboard
- **Location**: `/dashboard`
- **Function**: Aggregates total balance, recent activity, and quick actions (Deposit, Transfer).
- **Structure**: Uses a Sidebar Layout strategy (`layout.tsx`) to persist navigation across pages.

### C. Deposits (Add Money)
- **Route**: `/dashboard/deposit`
- **Logic**:
    - Frontend sends request to `POST /api/internal/deposit`.
    - Backend increments `Organization.balance`.
    - Creates a `Payout` record of type `INTERNAL` (Source: System, Receiver: User) to track the inflow.

### D. Payouts (Send Money)
- **Tabs**: Payout History, External Transfer, Internal Payout.
- **Logic**:
    - **External**: deducts balance, creates logic record linked to a `Beneficiary`.
    - **Internal**: deducts sender balance, increments receiver balance (atomic transaction using Prisma).

### E. Beneficiaries
- **Route**: `/dashboard/beneficiaries`
- **UI**: Copperx-inspired table design.
- **Features**:
    - **Add**: Modal with Zod validation.
    - **Quick Pay**: "Pay via Bank/Email" buttons directly open a transfer modal pre-filled with the beneficiary's data.
    - **Search**: Real-time client-side filtering.

### F. Transactions History
- **Route**: `/dashboard/transactions`
- **Polish**:
    - Visual indicators for Money In (Green + Arrow Down) vs Money Out (Red + Arrow Up).
    - Status badges (Completed/Pending).
    - "Type" column distinguishing Internal vs External moves.

## 5. Potential Interview Questions

**Q: Why use Next.js App Router?**
*A: For its server-side rendering capabilities, simplified routing (file-system based), and ability to easily mix server and client components.*

**Q: How do you handle database consistency during money transfers?**
*A: (Ideal answer) We use Prisma transactions (`prisma.$transaction`) to ensure that deducting from one user and adding to another happens atomically—either both succeed or both fail, preventing money duplication or loss.*

**Q: How is the "Deposit" feature secured?**
*A: Currently, it's a simulated internal endpoint. In a real-world scenario, this would be a webhook listener connected to a payment gateway (Stripe/Razorpay) that verifies a signature before updating the balance.*

**Q: Why separate "Payouts" and "Transactions"?**
*A: "Payouts" functionality is often focused on the *action* of sending money and managing recipients, while "Transactions" is the strict, immutable ledger of all historical movements for accounting purposes.*
