# .env setup for EasyNote

Your app needs two values from Supabase so it can talk to your project (login, save sessions, upload recordings). They go in a file named **`.env`** in the **same folder as `package.json`** (the project root).

---

## Step 1: Get the values from Supabase

1. Go to **[supabase.com/dashboard](https://supabase.com/dashboard)** and open your project.
2. In the **left sidebar**, click the **gear icon** → **Project Settings**.
3. In the left menu, click **API**.
4. On that page you’ll see:
   - **Project URL** — something like `https://abcdefghijk.supabase.co`
   - **Project API keys** — a table with keys. Use the one labeled **anon** / **public** (the long string starting with `eyJ...`).

Copy both: the **Project URL** and the **anon public** key.

---

## Step 2: Create the `.env` file

1. In your project root (same folder as `package.json`), create a new file named exactly **`.env`** (no .txt, no .example).
2. Paste this into it and replace the placeholders with your real values:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR-LONG-KEY-HERE
```

Example (fake values):

```env
VITE_SUPABASE_URL=https://xyzcompanyabc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnlhYmMiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMDAwMDAwMCwiZXhwIjoxOTQ1NTc2MDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. Save the file.

---

## Step 3: Restart the app

- Stop the dev server (Ctrl+C) and run **`npm run dev`** again so it picks up the new `.env`.
- For **Vercel**: add the same two variables in the project’s **Settings → Environment Variables**, then redeploy.

---

## Important

- The file **must** be named **`.env`** (starts with a dot).
- The names **must** be **`VITE_SUPABASE_URL`** and **`VITE_SUPABASE_ANON_KEY`** (Vite only exposes env vars that start with `VITE_`).
- **Do not** commit `.env` to Git (it’s in `.gitignore`). Only commit `.env.example` with placeholder values.

Once this is done, sign up / sign in and saving sessions should work.
