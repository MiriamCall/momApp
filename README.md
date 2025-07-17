Markdown

# Mommy Time App

Welcome to Mommy Time, your dedicated companion designed to support new mothers through the beautiful and often challenging journey of parenthood. This application provides practical tools and comforting resources to help you track important milestones, manage feeding sessions, and find moments of peace in your busy day.

## ✨ Features

- **User Authentication:** Secure user accounts powered by Supabase for personalized experiences.

- **Nursing Timer:** A dedicated timer to track current feeding sessions, including start/stop and side selection.

- **Feeding Records:** Comprehensive logging and management of all your baby's feeding history.

- **Journaling:** A private space to record thoughts, milestones, and daily reflections.

- **Curated Resources:**

  - **Tips of the Day:** Daily wisdom and advice for parenting.

  - **Soothing Music:** Calming audio tracks for both baby and parent.

  - **Helpful Videos:** Visual guides and relaxing content.

  - **Recommended Books:** A curated list of essential reads for new parents.

- **Responsive Design:** Built with Tailwind CSS for a seamless experience across all devices.

## 🛠️ Technologies Used

- **Astro:** The web framework powering the site's structure and content delivery.

- **Supabase:** Provides the backend services, including user authentication and database for storing feeding records and journal entries.

- **Tailwind CSS:** For rapid and responsive UI development.

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
├── public/
│   └── scripts/             # Client-side JavaScript for interactive features
├── src/
│   ├── components/         # Reusable Astro components (e.g., NavBar, NursingTimer)
│   ├── layouts/            # Astro layouts for consistent page structure (e.g., Layout.astro)
│   ├── lib/                # Utility functions, e.g., Supabase client initialization
│   │   └── supabase.ts
│   ├── pages/              # Astro pages, defining routes (e.g., index.astro, feeding_timer.astro)
│   │   └── api/            # API routes for backend interactions (e.g., auth, nursing_sessions)
│   └── styles/             # Global CSS styles
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json

src/pages/: Contains your Astro pages, which are exposed as routes based on their file names.

src/components/: Houses reusable UI components built with Astro.

src/lib/: Stores shared utility functions, notably the Supabase client setup.

src/pages/api/: Defines API endpoints for server-side operations (e.g., authentication, database interactions).

public/: Contains static assets like images and client-side JavaScript files.

🧞 Commands
All commands are run from the root of the project, from a terminal:

Command	Action
npm install	Installs project dependencies
astro dev	Starts local development server at localhost:4321
npm run build	Builds your production site to ./dist/
npm run preview	Previews your build locally, before deploying
npm run astro ...	Run CLI commands like astro add, astro check
npm run astro -- --help	Get help using the Astro CLI
```
