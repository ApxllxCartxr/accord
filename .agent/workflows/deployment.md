---
description: Deploy the application to a single server using Docker Compose
---

# Deployment Workflow

This workflow describes how to deploy the Accord CRM application to a single server (VPS) using Docker Compose.

## Prerequisites

1.  A server (VPS) with Docker and Docker Compose installed.
2.  The project codebase available on the server (via Git or SCP).

## Steps

1.  **Prepare Environment Variables**:
    Ensure you have a `.env` file or set the environment variables in `docker-compose.yml`.
    *   `DATABASE_URL`: Connection string for the database (handled internally by Docker Compose as `postgresql://user:password@postgres:5432/accord_crm`).
    *   `NEXTAUTH_SECRET`: Generate a secure random string (e.g., `openssl rand -base64 32`).
    *   `NEXTAUTH_URL`: The URL of your deployed application (e.g., `https://crm.yourdomain.com`).

2.  **Build and Run**:
    Run the following command in the project root directory:
    ```bash
    docker-compose up -d --build
    ```
    This will:
    *   Start the PostgreSQL database.
    *   Start the Mailpit service (for email testing).
    *   Build the Next.js application Docker image.
    *   Start the Next.js application connected to the database.

3.  **Verify Deployment**:
    *   Access the application at `http://your-server-ip:3000`.
    *   Access Mailpit at `http://your-server-ip:8025`.

4.  **Database Migrations**:
    After the containers are running, you may need to push the database schema:
    ```bash
    docker-compose exec app npx prisma db push
    ```
    Or if you are using migrations:
    ```bash
    docker-compose exec app npx prisma migrate deploy
    ```

## Production Considerations

*   **Reverse Proxy**: Use Nginx or Caddy to handle SSL (HTTPS) and forward traffic from port 80/443 to port 3000.
*   **Security**: Ensure ports 5432 (Database) and 8025 (Mailpit UI) are firewall-protected and not exposed to the public internet if not necessary.
