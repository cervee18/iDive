# iDive Frontend

React + Vite dashboard app for iDive operations (clients, visits, logs, staffing, and trips).

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create an env file:
   ```bash
   cp .env.example .env
   ```
3. Fill in Supabase credentials in `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run lint` - ESLint checks
- `npm run preview` - preview production build
