# CSE(AIML) Student Monitoring System

A comprehensive full-stack student monitoring platform with LeetCode daily challenges, hackathon/internship/course tracking, impositions, notifications, and AI-powered analytics.

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- PostgreSQL (via Supabase)
- Gmail account (for OTP/imposition email)
- Groq API key
- GitHub OAuth App (for GitHub linking)

### 1️⃣ Clone & Install

```bash
git clone <your-repo-url>
cd cse-aiml-student-monitoring
2️⃣ Backend Setup
cd backend
npm install
3️⃣ Configure Environment
Copy .env.example to .env and fill in all values:

cp .env.example .env
Variable	Where to get it
DATABASE_URL	Supabase dashboard → Project Settings → Database → Connection string
SMTP_PASS	Google Account → Security → App Passwords
GROQ_API_KEY	console.groq.com
GITHUB_CLIENT_ID/SECRET	GitHub → Settings → Developer Settings → OAuth Apps
4️⃣ Supabase Database
Create a new project on supabase.com
Get the Postgres connection string
Add it to .env as DATABASE_URL
Run migrations:
npx prisma migrate dev --name init
5️⃣ Seed Default Admin
npm run seed
Default admin credentials (from your .env):

Email: admin@cseaiml.edu
Password: Admin@123
6️⃣ Frontend Setup
cd ../frontend
npm install
Copy frontend .env.example to .env:

cp .env.example .env
7️⃣ Run the Application
Backend:

cd backend
npm run dev
Frontend (new terminal):

cd frontend
npm run dev
Open http://localhost:5173 🎉

🔑 Google Auth (OTP) Configuration
. Enable 2-Step Verification on your Google account. 2. Go to Google Account → Security → App Passwords. 3. Create a new app password for Mail. 4. Use that password as SMTP_PASS in .env.

🔗 GitHub OAuth Configuration
Go to GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App.
Set:
Homepage URL: http://localhost:5173
Callback URL: http://localhost:5000/api/v1/auth/github/callback
Copy Client ID and Client Secret into .env.
📊 Groq AI Features
Daily LeetCode verification
PPT report generation with insights
Automatic preview image detection for hackathon/internship/course links
📁 Project Structure (Summary)
backend/    → Express API + Prisma + Services
frontend/   → React + Vite + Tailwind CSS
🧪 Available Scripts
Script (Backend)	Description
npm run dev	Start backend with nodemon
npm start	Start production server
npm run prisma:migrate	Run Prisma migrations
npm run seed	Create default admin
📦 API End (Major)
Method	Endpoint	Description
POST	/api/v1/auth/send-otp	Send OTP to email
POST	/api/v1/auth/verify-otp	Verify OTP and login
POST	/api/v1/daily-challenge	Admin creates daily challenge
POST	/api/v1/daily-challenge/complete	Student marks complete (verified via LeetCode)
GET	/api/v1/hackathons	Get active hackathons
POST	/api/v1/hackathons/:id/register	Register for hackathon
GET	/api/v1/students/me	Get student profile
POST	/api/v1/students/me	Update student profile
GET	/api/v1/export/excel	Download student data as Excel
GET	/api/v1/export/ppt	Download AI-generated PPT
🛟 Troubleshooting
OTP emails not arriving?

Check SMTP_PASS is a valid App Password
Check spam folder
Verify MAIL_FROM uses the same Gmail address
GitHub linking fails?

Ensure GITHUB_CALLBACK_URL matches exactly in GitHub OAuth settings
LeetCode verification shows "not completed"?

Make sure your LeetCode username is public
Only accepted submissions after challenge start time count
Check you solved the specific problem number