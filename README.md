<!-- prettier-ignore -->
# StudyMate — AI Study Assistant

StudyMate is a lightweight AI-powered chatbot that helps students learn faster by
converting notes into concise summaries, generating study guides and flashcards,
providing viva-style questions, and enabling interactive study conversations.

Quick, friendly, and built for students.

---

## Table of Contents
- [Features](#features)
- [Quick Start](#quick-start)
- [Environment](#environment)
- [Run Locally](#run-locally)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License & Support](#license--support)

---

## Features

- AI-powered chat with context-aware replies
- Note simplification → bullet summaries and highlights
- Study guide generation with definitions and Q&A
- Viva / oral-exam question generator
- File upload (PDF / TXT) for content extraction
- Firebase authentication (Google / email)
- Simple rate limiting for fair usage

## Quick Start

1. Clone the repo

```bash
git clone https://github.com/your-username/studymate-chatbot.git
cd studymate-chatbot
```

2. Install dependencies (root script installs both apps)

```bash
npm run install:all
```

3. Copy example env files and fill values

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# then edit the files with your API keys and URLs
```

4. Start both apps (concurrent dev)

```bash
npm run dev
```

Open the frontend at http://localhost:5173 and the backend at http://localhost:5000 by default.

## Environment

- Backend env: `backend/.env` — see `backend/.env.example` for required keys
- Frontend env: `frontend/.env.local` — see `frontend/.env.example`

Common variables you will need to set:

- `GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY` (backend AI providers)
- `VITE_FIREBASE_*` values (frontend Firebase config)
- `VITE_BACKEND_URL` (frontend → backend base URL)

## Run Locally

Backend (development):

```bash
cd backend
npm run dev
```

Frontend (development):

```bash
cd frontend
npm run dev
```

Build frontend for production:

```bash
cd frontend
npm run build
```

## API Endpoints (high level)

- `POST /api/chat` — chat messages ↔ AI responses
- `POST /api/simplify` — simplify plain text
- `POST /api/simplify-file` — simplify uploaded file (PDF/TXT)
- `POST /api/study-guide` — generate study guide from text
- `POST /api/viva` — generate viva-style questions

Check backend route definitions in [backend/server.js](backend/server.js) for details.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step deployment guidance.

Short summary:

- Frontend: static build (Vercel / Netlify)
- Backend: Node.js server (Railway / Render / Heroku)
- Auth: Firebase

## Project Structure

```
├── frontend/      # React + Vite app
├── backend/       # Node + Express API
├── DEPLOYMENT.md  # Deployment notes
├── README.md      # This file
└── package.json   # Root scripts (dev, install:all, etc.)
```

## Contributing

1. Fork → branch (`feature/`) → open PR
2. Keep changes focused and add tests for new behavior
3. Use `npm run lint` in `frontend` before committing

For major changes, open an issue first to discuss the design.

## License & Support

MIT — see the `LICENSE` file.

For deployment help and troubleshooting, see [DEPLOYMENT.md](DEPLOYMENT.md).

---

Made with ❤️ for students — happy studying! 📚

---

## Visuals

- Demo GIF / screenshot (replace with actual file in `frontend/public`):

![app-screenshot](./frontend/public/screenshot-placeholder.png)

---

If you'd like, I can add real screenshots or a demo GIF to the README — tell me which you'd prefer.
