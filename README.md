Markdown
# Taskly - Smart Task Management System

Taskly is a modern, high-performance task management application built with **Next.js 14**, **Supabase**, and **Tailwind CSS**. It’s designed to help users streamline their workflow through smart automation, real-time tracking, and a focus-driven UI.



## 🚀 Key Features

- **Centralized Dashboard**: A global view of all tasks across multiple projects and spaces.
- **Smart Task Automation**: Automated state transitions (Assigned -> Processing -> Done/Expired) based on real-time deadline monitoring.
- **Focus Mode**: Dedicated "Block" mode for deep work with duration-based tracking.
- **Project Hierarchy**: Organize work efficiently using a Space -> Project -> Task structure.
- **Responsive Design**: Fully optimized for both Light and Dark modes with a sleek, glassmorphism UI.
- **Web Push Notifications**: (In Development) Real-time browser alerts to ensure you never miss a deadline.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Hooks (useCallback, useMemo, useEffect)
- **Deployment**: [Vercel](https://vercel.com/)
- **Icons**: Google Material Symbols

## 🏗️ Architecture

Taskly utilizes a serverless architecture on Vercel, leveraging Next.js API Routes for backend logic and Supabase for real-time data persistence.



## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/tienanh14/Taskly.git](https://github.com/tienanh14/Taskly.git)
   cd taskly-app

Install dependencies:

```Bash
npm install
Environment Variables:
Create a .env.local file and add your Supabase credentials:

Code
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
Run the development server:

Bash
npm run dev

📈 Future Roadmap
[ ] Integrated Web Push Notifications using Service Workers.
[ ] Detailed productivity analytics and charts.
[ ] Team collaboration and shared Spaces.
