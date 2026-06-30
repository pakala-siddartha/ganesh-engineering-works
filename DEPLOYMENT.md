# Ganesh Engineering Works — Deployment Guide

This guide details how to deploy the **Ganesh Engineering Works Operations Dashboard**, including the database, backend server, and frontend web application.

---

## 1. System Architecture

The application is built on a split Client-Server architecture:
*   **Database**: Supabase (PostgreSQL)
*   **Backend**: Node.js / Express Server (connects to Supabase)
*   **Frontend**: React (Vite) / Tailwind CSS

```
┌─────────────────────────────────────────┐
│              Browser Client             │
└────────────────────┬────────────────────┘
                     │
                     ▼ (Vercel / Netlify)
┌─────────────────────────────────────────┐
│          React Vite Frontend            │
└────────────────────┬────────────────────┘
                     │
                     ▼ (API Requests)
┌─────────────────────────────────────────┐
│           Express API Server            │
└────────────────────┬────────────────────┘
                     │
                     ▼ (Database Queries)
┌─────────────────────────────────────────┐
│         Supabase PostgreSQL DB          │
└─────────────────────────────────────────┘
```

---

## 2. Step 1: Database Setup (Supabase)

Create a free account and database project at [Supabase](https://supabase.com/). Once your project is created, open the **SQL Editor** in the Supabase Dashboard and run the following script to create the required tables:

```sql
-- 1. Regular Production Entries
CREATE TABLE IF NOT EXISTS production_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_quantity INTEGER NOT NULL DEFAULT 0,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 2. GHMC Production Entries
CREATE TABLE IF NOT EXISTS ghmc_production_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_quantity INTEGER NOT NULL DEFAULT 0,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 3. Regular Sales Entries
CREATE TABLE IF NOT EXISTS sales_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    customer_name VARCHAR(255) NOT NULL,
    area VARCHAR(255) NOT NULL,
    vehicle VARCHAR(255) NOT NULL,
    total_quantity INTEGER NOT NULL DEFAULT 0,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 4. GHMC Sales Entries
CREATE TABLE IF NOT EXISTS ghmc_sales_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    customer_name VARCHAR(255) NOT NULL,
    area VARCHAR(255) NOT NULL,
    vehicle VARCHAR(255) NOT NULL,
    total_quantity INTEGER NOT NULL DEFAULT 0,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 5. Regular Cement Movements
CREATE TABLE IF NOT EXISTS cement_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    quantity INTEGER NOT NULL DEFAULT 0,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('in', 'out')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 6. GHMC Cement Movements
CREATE TABLE IF NOT EXISTS ghmc_cement_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    quantity INTEGER NOT NULL DEFAULT 0,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('in', 'out')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

### Get Supabase API Credentials
Navigate to your Supabase project's **Project Settings** → **API**:
1. Copy your **Project URL** (needed for `SUPABASE_URL`).
2. Copy your service role secret key **`service_role`** key (needed for `SUPABASE_SERVICE_KEY`). 
   > **Note:** Do NOT share or commit the service role key to git. It bypasses Row Level Security (RLS) and is only for server-side use.

---

## 3. Step 2: Deploy Backend Server

The backend runs a standard Node.js Express server. You can deploy it easily on platform providers like **Render** (free tier available) or **Railway**.

### Option A: Deploying on Render (render.com)
1. Sign in to Render and click **New** → **Web Service**.
2. Connect your Git repository.
3. In the settings, configure the following:
   *   **Name**: `ganesh-backend` (or any custom name)
   *   **Root Directory**: `server`
   *   **Language**: `Node`
   *   **Build Command**: `npm install`
   *   **Start Command**: `npm start`
4. Expand **Advanced** to add environment variables (see below).

### Backend Environment Variables (`.env`)
Add these environment variables in your deployment dashboard:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `SUPABASE_URL` | Your Supabase project URL | `https://yourproj.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Your Supabase `service_role` secret API key | `eyJhbGciOi...` |
| `CLIENT_URL` | Allowed frontend domains for CORS (comma-separated) | `https://ganesh-dashboard.vercel.app` |
| `PORT` | Server listening port | `3001` (Auto-managed by Render) |

---

## 4. Step 3: Deploy Frontend Client

The frontend is a Vite-based React project, which is pre-configured with a `vercel.json` file for **Vercel** deployment.

### Deploying on Vercel (vercel.com)
1. Sign in to Vercel and click **Add New** → **Project**.
2. Connect your Git repository.
3. Configure the project:
   *   **Framework Preset**: `Vite`
   *   **Root Directory**: `client`
   *   **Build Command**: `npm run build`
   *   **Output Directory**: `dist`
4. Expand the **Environment Variables** section and add:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | The URL of your deployed Express backend | `https://ganesh-backend.onrender.com` |

5. Click **Deploy**. Vercel will build the frontend and provide a public URL.

> **Tip:** Once you receive your frontend's public Vercel URL, go back to your **Backend Deployment (Render/Railway)** and update the `CLIENT_URL` environment variable with that exact URL. This will ensure CORS requests are accepted.
