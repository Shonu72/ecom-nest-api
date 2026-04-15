# Project Setup Guide: NestJS + Prisma + Postgres

Welcome to your new NestJS project! This guide will help you get everything set up and running smoothly.

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed:
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **PostgreSQL** (Optional if using the Neon database provided in `.env`)

### 2. Install Dependencies
Run the following command in your terminal to install all required packages:
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (one already exists in this project). It should contain your `DATABASE_URL`.
Example for Neon (Serverless Postgres):
```env
DATABASE_URL="postgresql://user:password@hostname/databasename?sslmode=require"
```

### 4. Database Setup (Prisma)
Prisma is your ORM (Object-Relational Mapper). It handles communication between your code and Postgres.

#### **Generate Prisma Client**
This command creates the code used to interact with your database:
```bash
npx prisma generate
```

#### **Run Migrations**
This command synchronizes your database schema with your `schema.prisma` file:
```bash
npx prisma migrate dev --name init
```

#### **Prisma Studio (Visual Database Viewer)**
You can view and edit your data in a beautiful UI by running:
```bash
npx prisma studio
```

### 5. Running the Application

#### **Development Mode** (with hot-reload)
```bash
npm run start:dev
```
Your API will usually be available at `http://localhost:3000`.

---

## 🛠 Useful Commands

| Command | Description |
| :--- | :--- |
| `npm run build` | Compile the project |
| `npx prisma format` | Format your `schema.prisma` file |
| `npx prisma db pull` | Update your schema from an existing database |
| `npx prisma db push` | Push schema changes without tracking migrations (use carefully) |

## 📖 Key Directories
- `src/`: Your application source code.
- `prisma/`: Database schema and migrations.
- `test/`: End-to-end tests.

---
> [!TIP]
> If you are new to NestJS, check out the [Official Documentation](https://docs.nestjs.com/) for a great introduction to Modules, Controllers, and Services.
