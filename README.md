# Accord CRM

A simplified, multi-tenant Customer Relations Manager for startups and freelancers.

## Features

- **Multi-tenancy**: Create and manage multiple organizations.
- **Authentication**: Magic Link authentication via Email.
- **RBAC**: Role-Based Access Control (Owner, Admin, Member).
- **Dashboard**: Overview of projects, clients, teams, and tasks.
- **Modern UI**: Built with Next.js 14+, Tailwind CSS, and shadcn/ui.

## Setup

1.  **Clone the repository**.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Create a `.env` file in the root directory with the following variables:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/accord_crm?schema=public"
    AUTH_SECRET="your-secret-key" # Generate with `npx auth secret`
    
    # Email Provider (SMTP)
    EMAIL_SERVER="smtp://user:pass@smtp.example.com:587"
    EMAIL_FROM="Accord CRM <noreply@example.com>"
    ```
4.  **Database Setup**:
    ```bash
    npx prisma generate
    npx prisma db push
    ```
5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Project Structure

- `src/app`: Next.js App Router pages and layouts.
- `src/components`: Reusable UI components (shadcn/ui).
- `src/lib`: Utilities and Prisma client.
- `prisma`: Database schema.

## Tech Stack

- **Framework**: Next.js
- **Database**: PostgreSQL + Prisma
- **Auth**: NextAuth.js (v5)
- **Styling**: Tailwind CSS + shadcn/ui
