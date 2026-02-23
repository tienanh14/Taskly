Markdown
# Taskly - Smart Task Management

Taskly is a streamlined task management system designed to eliminate friction in productivity. By integrating deeply with Google Drive, Taskly automates the tedious parts of project organization, allowing you to focus on execution.


## 🚀 Key Features

- **Centralized Dashboard**: A global view of all tasks across multiple projects and spaces.
- **Smart Task Automation**: Automated state transitions (Assigned -> Processing -> Done/Expired) based on real-time deadline monitoring.
- **Focus Mode**: Dedicated "Block" mode for deep work with duration-based tracking.
- **Project Hierarchy**: Organize work efficiently using a Space -> Project -> Task structure.
- **Google Drive Integration**: Seamlessly connects tasks with cloud storage for automated resource management.
- **Automated Documentation**: Automatically creates dedicated Google Drive folders and task-related documents upon task initiation.
- **Cloud File Sync**: Direct file upload capability from the dashboard to specific Google Drive project folders.
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

## 📈 Future Roadmap
[ ] Integrated Web Push Notifications using Service Workers.

[ ] Detailed productivity analytics and charts.

[ ] Team collaboration and shared Spaces.

