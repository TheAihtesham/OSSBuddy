#  OSS Buddy — Open Source Discovery Platform

> Discover trending GitHub open-source projects by category, powered by GitHub API and Gemini AI.

 **Status: Ongoing — actively in development**

---

## 💡 What is OSS Buddy?

Finding good open-source projects to contribute to or learn from is harder than it should be. OSS Buddy solves that by letting you browse trending GitHub repositories filtered by category, bookmark projects you love, and get AI-powered insights — all from a personalized dashboard.

---

##  Features

-  **GitHub OAuth Login** — sign in with your GitHub account, secured with JWT
-  **Category-based Filtering** — browse projects by topic (AI, Web, DevTools, etc.)
-  **Bookmarking System** — save projects to your personal dashboard
-  **Gemini AI Integration** — AI-powered project summaries and recommendations
-  **Personalized Dashboard** — tailored experience per user

---

##  Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB |
| Auth | GitHub OAuth + JWT |
| APIs | GitHub API, Google Gemini AI |

---

##  Getting Started

```bash
# Clone the repo
git clone https://github.com/TheAihtesham/OSSBuddy.git
cd oss-buddy

# Backend
cd backend && npm install
# Add your .env (see below)
npx nodemon

# Frontend
cd frontend && npm install
npm run dev
```

### Environment Variables

**Backend `.env`:**
```env
MONGODB_URI=your_mongodb_uri
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

---

## 👤 Author

**Aihtesham** — [@TheAihtesham](https://github.com/TheAihtesham)

*This project is under active development — more features coming soon!*