# StudyNotion

Clean deployment structure:

```text
study-notion/
  README.md
  client/   # React app for Vercel
  server/   # Express API for Render
```

There is no root `package.json` and no `render.yaml`. Deploy each app from its own folder.

## Local Setup

Install client dependencies:

```bash
cd client
npm install
```

Install server dependencies:

```bash
cd server
npm install
```

Create local env files:

```bash
copy client\.env.example client\.env
copy server\.env.example server\.env
```

Run the client:

```bash
cd client
npm start
```

Run the server in another terminal:

```bash
cd server
npm run dev
```

Client: `http://localhost:3000`  
Server: `http://localhost:4000`

## Deploy Backend To Render

Create a Render Web Service from this GitHub repo.

Use these settings:

```text
Root Directory: server
Runtime: Node
Build Command: npm ci && npm run build
Start Command: npm run start
Health Check Path: /
Node Version: 22
```

Set these environment variables in Render:

```text
MONGO_URI
JWT_SECRET
CLIENT_URLS
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
FOLDER_NAME
MAIL_HOST
MAIL_PORT
MAIL_SECURE
MAIL_USER
MAIL_PASS
MAIL_FROM
RAZORPAY_KEY
RAZORPAY_SECRET
```

Example:

```text
CLIENT_URLS=https://your-vercel-app.vercel.app
```

After changing dependencies or environment variables, use Render's "Clear build cache & deploy".

## Deploy Frontend To Vercel

Import this GitHub repo into Vercel.

Use these settings:

```text
Framework Preset: Create React App
Root Directory: client
Install Command: npm ci
Build Command: npm run build
Output Directory: build
```

Set these environment variables in Vercel:

```text
REACT_APP_BASE_URL=https://your-render-service.onrender.com/api/v1
REACT_APP_RAZORPAY_KEY=rzp_test_your_publishable_key
```

After Vercel gives you the frontend URL, add that URL to Render's `CLIENT_URLS`, then redeploy the backend.

## Deploy Order

1. Push this repo to GitHub.
2. Deploy `server/` to Render.
3. Copy the Render backend URL.
4. Deploy `client/` to Vercel with `REACT_APP_BASE_URL` pointing to Render.
5. Copy the Vercel frontend URL.
6. Add the Vercel URL to Render `CLIENT_URLS`.
7. Redeploy Render.

## Gitignore Layout

- `client/.gitignore` ignores frontend dependencies, build output, and client env files.
- `server/.gitignore` ignores backend dependencies, logs, temporary files, and server env files.
- Root `.gitignore` only keeps root-level OS/log noise out of Git.

## Important Notes

- Do not commit real `.env` files.
- Client variables must start with `REACT_APP_`.
- Server secrets belong only in Render environment variables or `server/.env` locally.
- The frontend API base URL must include `/api/v1`.
