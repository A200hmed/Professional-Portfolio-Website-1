# 🏆 Premium Modern Developer Portfolio Website & Administrative CRUD Suite

Welcome to the **Ahmed Khaled Anwar Developer Portfolio & Admin Workspace**. This application is an elite, high-performance, single-page visual showcase built with **standard Vanilla HTML, CSS, and Javascript** on the frontend, paired with a super-fast, **Node.js Express backend server** featuring dual-mode persistence (**MongoDB Atlas + Local JSON fallback**).

---

## 💎 Premium Design & Aesthetics

This portfolio was designed from the ground up to represent the absolute peak of modern web UI visual excellence:
- **Obsidian Dark Theme**: A deep, luxurious, low-fatigue dark background built with harmonized HSL color variables.
- **Glassmorphism Panels**: UI cards built with interactive backdrop blurring, translucent borders, and subtle dark glows.
- **Mesh Color Halo Gradients**: Floating, hardware-accelerated animated gradient backgrounds (`@keyframes`) that make the page feel responsive and alive.
- **Micro-Interactions & Transitions**: Glow-on-hover inputs, timeline dot transitions, filter-tag slide flows, and canvas layout details.
- **Simulated Compiler Console**: An interactive hero component that types compile-runs in real time.

---

## ⚙️ Core Technical Features

1. **Vanilla frontend SPA**: Maximum visual loading speed, zero heavy client-side frameworks, and fully responsive layouts.
2. **Dual-Persistence Database Layer**:
   - **Production Mode (MongoDB Atlas)**: Integrates Mongoose schemas for fully persistent CRUD operations, ready for cloud environments.
   - **Development Fallback Mode (Local JSON)**: Automatically falls back to reading/writing to `db.json` when `MONGODB_URI` is not set.
3. **Advanced Admin Dashboard (`/admin.html`)**:
   - **Overview & Telemetry**: Dynamic cards measuring total catalog items, skills trackers, total received messages, and unread metrics.
   - **Inquiries Inbox Manager**: Review secure form submissions, mark messages as read, or delete them instantly.
   - **Dynamic Projects CRUD Editor**: Fully featured form interface to add new systems, toggle featured elements, enter comma-separated competencies, list detailed specs, and upload custom images.
   - **Settings Array Workspace**: Edit biography summaries, social links, resume milestone timelines (work experience & education), and skills levels dynamically.
4. **Live GitHub Proxy**: Proxies and caches open-source repositories to provide dynamic star metrics without hitting API rate limits.
5. **Security Hardening**:
   - **Helmet.js** to secure Express headers (XSS, Sniffing, etc.)
   - **Rate Limiting** on contact submissions (5 requests per 15 mins).
   - Environment variables for admin credentials and tokens.

---

## 🚀 Getting Started

Ensure you have [Node.js](https://nodejs.org) (v18+) installed.

### 1. Installation
Install server dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):
```env
PORT=3000
ADMIN_USER=admin
ADMIN_PASS=admin
ADMIN_TOKEN_SECRET=sterling-secure-admin-token-2026
MONGODB_URI=your_mongodb_connection_string
```
*Note: If `MONGODB_URI` is left blank or commented out, the application will automatically run in local fallback mode using `db.json`.*

### 3. Migrate Local Data to MongoDB Atlas (Production Seeding)
To upload your existing local projects, skills, timeline data, etc. from `db.json` directly to your new MongoDB Atlas database:
```bash
node scripts/seed.js
```

### 4. Launch Application
Run the Express application:
```bash
npm start
```
For development with auto-reload:
```bash
npm run dev
```

---

## 📂 Structural Directory Index

```text
├── db.json                 # Persistent local JSON database (fallback)
├── db-mongo.js             # Mongoose connection & dual-persistence database layer
├── server.js               # Express API gateway, rate-limiting & security headers
├── package.json            # Node dependencies and npm startup script
├── Procfile                # Production process layout for Railway/Render
├── .gitignore              # Ignored folders/secrets (node_modules, .env)
├── .env.example            # Environment variables placeholder reference
├── scripts/
│   ├── seed.js             # Migration script from JSON to MongoDB Atlas
│   └── test-local.js       # Express verification script
├── public/                 # Static frontend assets
│   ├── css/
│   │   └── style.css       # Core styling & glassmorphism system
│   ├── js/
│   │   ├── main.js         # Frontend SPA dynamic logic & handlers
│   │   └── admin.js        # Auth locks, tabs manager & CRUD controller
│   ├── index.html          # Main Portfolio Landing Page
│   ├── admin.html          # Secured Sidebar Administrative Dashboard
│   └── admin-login.html    # Secured Key Authentication Login Card
└── README.md               # Operations & structural manual
```

---

## 🌐 Online Deployment Guide (Railway & Render)

1. Push this project to your private or public GitHub repository.
2. Link your repository to **Railway.app** or **Render.com**.
3. Under the service settings, add your Environment Variables matching `.env.example`:
   - `ADMIN_USER`, `ADMIN_PASS`, `ADMIN_TOKEN_SECRET`
   - `MONGODB_URI` (your MongoDB connection string)
4. Ensure the start command is `npm start`.
5. Once deployed, run the seed script locally or on one-off shell to populate the Atlas DB:
   ```bash
   node scripts/seed.js
   ```
6. ✅ Done! Your portfolio is fully functional online.
