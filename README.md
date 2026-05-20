# StudyMate – AI Study Assistant Chatbot

An intelligent study companion powered by AI that helps students simplify notes, generate study guides, conduct viva questions, and have interactive study conversations.

## Features

✨ **AI-Powered Chat** — Ask questions and get concise, encouraging study assistance  
📝 **Note Simplification** — Convert lengthy notes into bullet-point summaries  
📚 **Study Guides** — Generate comprehensive study guides with key concepts and flashcard Q&A  
🎙️ **Viva Questions** — Get thought-provoking questions for oral exams  
📤 **File Upload** — Upload PDFs or text files for processing  
🔐 **Firebase Auth** — Secure login with Google and email  
⚡ **Rate Limiting** — 100 messages per day per user  

## Tech Stack

**Frontend**
- React 19 with Vite
- Firebase Auth
- React Markdown
- Phosphor Icons

**Backend**
- Node.js + Express.js
- Multiple AI APIs (Groq, Google Gemini, OpenRouter)
- Multer for file uploads
- PDF parsing

**Deployment**
- Frontend: Vercel
- Backend: Railway
- Authentication: Firebase

## Local Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/studymate-chatbot.git
   cd studymate-chatbot
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**

   **Backend** (`backend/.env`):
   ```bash
   GROQ_API_KEY=your_groq_api_key
   GEMINI_API_KEY=your_gemini_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   PORT=5000
   ```

   **Frontend** (`frontend/.env.local`):
   ```bash
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_BACKEND_URL=http://localhost:5000
   ```

### Running Locally

**Option 1: Run both concurrently**
```bash
npm run dev
```
This starts both frontend (http://localhost:5173) and backend (http://localhost:5000).

**Option 2: Run separately**

Backend:
```bash
cd backend
npm run dev
```

Frontend (in another terminal):
```bash
cd frontend
npm run dev
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Send a message and get AI response |
| `/api/viva` | POST | Get a viva question |
| `/api/simplify` | POST | Simplify text notes |
| `/api/simplify-file` | POST | Simplify uploaded file (PDF/TXT) |
| `/api/study-guide` | POST | Generate study guide from notes |
| `/api/study-guide-file` | POST | Generate study guide from file |

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

**Quick Summary:**
- **Frontend**: Deploy on Vercel (static build)
- **Backend**: Deploy on Railway (Node.js server)
- **Cost**: ~$5/month (Railway) + free Vercel tier

## Project Structure

```
studymate-chatbot/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── api.js          # API utility functions
│   │   ├── firebase.js      # Firebase config
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
├── backend/                  # Node.js + Express backend
│   ├── server.js            # Main Express server
│   ├── .env                 # Environment variables (don't commit)
│   └── package.json
├── DEPLOYMENT.md            # Deployment guide
├── README.md               # This file
└── package.json            # Root package for concurrent dev
```

## Environment Variables

### Backend (`backend/.env`)
See `backend/.env.example` for template.

### Frontend (`frontend/.env.local`)
See `frontend/.env.example` for template.

## Getting API Keys

1. **Groq API** — https://console.groq.com (free credits)
2. **Google Gemini** — https://makersuite.google.com/app/apikey
3. **OpenRouter** — https://openrouter.ai
4. **Firebase** — https://firebase.google.com

## Features in Detail

### Chat API
Ask StudyMate any study-related question and get helpful, concise responses with conversational history.

### Simplify Notes
Paste your notes and get a bullet-point summary highlighting key concepts.

### Study Guides
Generate comprehensive study guides with:
- Executive summary
- Key concepts & definitions
- Flashcard-style Q&A

### Viva Questions
Get thought-provoking questions to prepare for oral exams.

### File Processing
Upload PDFs or text files (max 5MB) for automatic processing and simplification.

## Rate Limiting

- **Limit**: 100 messages per day per IP address
- **Applies to**: All API endpoints
- **Response**: 429 error when limit exceeded

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Troubleshooting

**Frontend can't reach backend?**
- Verify `VITE_BACKEND_URL` is correct
- Check backend is running (`npm run dev` in backend folder)
- Check for CORS errors in browser console

**API keys not working?**
- Verify keys are correct in `.env` files
- Check API quota/billing on provider dashboards
- Restart backend after changing `.env`

**Firebase login not working?**
- Verify `VITE_FIREBASE_*` variables are set
- Check Firebase project settings

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production troubleshooting.

## Development

### Linting
```bash
cd frontend
npm run lint
```

### Building Frontend
```bash
cd frontend
npm run build
```

Output is in `frontend/dist/`.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

MIT License — see LICENSE file for details.

## Support

Have questions? Check:
- [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Backend logs: `npm run dev` in backend folder
- Frontend console: Press F12 in browser

## Future Enhancements

- [ ] Database integration for persistent chat history
- [ ] Spaced repetition for flashcards
- [ ] Mobile app
- [ ] Multi-language support
- [ ] Custom study plan generation
- [ ] Premium tier with higher rate limits

---

**Made with ❤️ for students. Happy studying!** 📚
