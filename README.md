# 🎓 University Lost & Found Platform

A secure, real-time platform for university students, staff, and security office to report and recover lost items.

## 🚀 Tech Stack

- **Monorepo:** Turborepo + pnpm
- **Backend:** Node + TypeScript + Express + Prisma + MySQL + Redis
- **Frontend:** React + Vite + TypeScript + TanStack Query + Tailwind
- **Realtime:** Socket.io
- **Storage:** Cloudinary
- **Infra:** Docker + GitHub Actions

## 📁 Structure

- `apps/api` — Backend API
- `apps/web` — Student/Staff app
- `apps/admin` — Admin panel
- `packages/types` — Shared types
- `packages/validators` — Zod schemas
- `packages/ui` — Shared UI components
- `packages/config` — Shared configs

## 🛠️ Setup

```bash
pnpm install
pnpm db:up        # Start MySQL + Redis via Docker
pnpm dev          # Start all apps