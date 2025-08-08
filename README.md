## Pulseboard Life Tracker

Live app: https://pulseboard-life-tracker.netlify.app/

### Overview
Pulseboard is a life tracking app (tasks, finances, investments) built with React + TypeScript. The frontend is public, while the backend lives in a separate private repository.

### Tech Stack
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, React Hook Form + Zod, @tanstack/react-query, date-fns
- Backend (separate, private): AWS Lambda, API Gateway, DynamoDB, Cognito, AWS CDK (TypeScript)
- Hosting: Netlify (frontend)

### Repositories
- Frontend (this repo): Public
- Backend (private): https://github.com/LuckyGit101/pulseboard-backend.git

### Getting Started (Frontend)
Prerequisites: Node.js 18+
```bash
npm install
npm run dev
```

### Environment Variables (Frontend)
Create `.env.local` in the frontend with:
```env
VITE_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/dev
VITE_USER_POOL_ID=us-east-1_XXXX
VITE_CLIENT_ID=xxxxxxxx
VITE_REGION=us-east-1
```

### Deployment (Frontend)
- Hosted on Netlify at https://pulseboard-life-tracker.netlify.app/
- `netlify.toml` handles build (`npm run build`), headers, and SPA redirects.

### Authentication (Current)
- Mocked on the frontend via localStorage until Cognito integration is wired through the API service layer.

### Backend (Private Repo)
- AWS Serverless with single-table DynamoDB, Cognito auth, and API Gateway.
- Deploy from the private repo. Frontend uses env vars to point to API + Cognito.

### Scripts
- `npm run dev` – start local dev server
- `npm run build` – build for production
- `npm run preview` – preview production build
- `npm run lint` – lint code

### Notes
- The `backend/` directory was moved to a private repo and is ignored in this repo via `.gitignore`.
