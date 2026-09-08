# Fantasy Bets

Casual betting application for Liga MX featuring Hexagonal Architecture (Ports and Adapters) on the backend and Vue 3 on the frontend.
[Open Fantasy Bets](https://fantasy-bets-8a009.web.app/)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Running the Application](#running-the-application)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [License](#license)

---

## Overview

**Fantasy Bets** is a full-stack platform for friendly sports betting pools focused on Liga MX. It allows users to register, create or join prediction rooms via unique invite codes, submit match predictions across round-robin fixtures, simulate match outcomes, and compute member scores dynamically on a leaderboard.

### Key Features
- **Authentication**: User registration and JWT-based authentication with bcrypt password hashing.
- **Room Management**: Create rooms, generate shareable 6-character room codes, enforce participant limits, and manage membership.
- **Match Generation & Predictions**: Automated round-robin fixture generation for Liga MX teams and match prediction tracking.
- **Simulation & Settlement**: Atomic match simulation and automated score calculation.
- **Real-time Leaderboard**: Ranked standings based on prediction accuracy.

---

## Tech Stack

- **Language & Runtime**: JavaScript (ES Modules, Node.js)
- **Backend Framework**: Express 4.x
- **Frontend Framework**: Vue 3 (Composition API) with Vue Router
- **Build Tool & Bundler**: Vite
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Database**: SQLite (via `better-sqlite3`)
- **Package Manager**: npm

---

## Requirements

- **Node.js**: `v18.0.0` or later (tested on Node.js v20+)
- **npm**: `v9.0.0` or later

---

## Environment Variables

Create a `.env` file in the project root to configure the following environment variables. If not set, sensible defaults are used.

| Variable | Description | Default Value | Required |
| --- | --- | --- | --- |
| `PORT` | HTTP port for the Express backend server | `3000` | No |
| `JWT_SECRET` | Secret key used for signing and verifying JWT tokens | Internal default secret | Recommended in production |
| `DB_PATH` | File path to the SQLite database | `./fantasy_bets.db` | No |

### Example `.env`
```env
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_here
DB_PATH=./fantasy_bets.db
```

---

## Project Structure

The project follows Hexagonal Architecture (Ports and Adapters) for backend modules and a standard modular layout for the Vue 3 frontend:

```text
fantasy_bets/
├── package.json              # Project metadata, scripts, and dependencies
├── vite.config.js            # Vite configuration & API proxy setup
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── index.html                # Single Page Application entry HTML
├── server/                   # Backend application (Hexagonal Architecture)
│   ├── src/
│   │   ├── app.js            # Express app setup and server entry point
│   │   ├── modules/          # Domain modules
│   │   │   ├── bets/         # Bets & simulation (domain, app, infra)
│   │   │   ├── rooms/        # Rooms & matches (domain, app, infra)
│   │   │   └── users/        # User auth & tokens (domain, app, infra)
│   │   └── shared/           # Shared infrastructure (DB connection, init, HTTP)
│   └── tests/                # Automated backend test suites
│       ├── auth.test.js      # Authentication tests
│       ├── rooms.test.js     # Room & match tests
│       └── e2e.test.js       # End-to-end integration test suite
└── src/                      # Frontend application (Vue 3 + Tailwind CSS)
    ├── main.js               # Frontend entry point
    ├── App.vue               # Root Vue component
    ├── router/               # Vue Router configuration & route guards
    ├── views/                # Page components (AuthView, DashboardView, RoomDetailView)
    └── index.css             # Tailwind CSS entry styles
```

---

## Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd fantasy_bets
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Initialize the SQLite database**:
   ```bash
   npm run init-db
   ```
   *(Note: The database is also auto-initialized on server startup if not already created).*

---

## Running the Application

To run both the backend API and the frontend development server:

### 1. Start Backend Server
```bash
npm run server
```
The server will start on `http://localhost:3000`.

### 2. Start Frontend Dev Server (in another terminal)
```bash
npm run dev
```
The Vite development server will start on `http://localhost:5173` with proxying configured to route `/api` requests to `http://localhost:3000`.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run server` | Starts the Express backend server (`server/src/app.js`) |
| `npm run dev` | Starts the Vite development server for the Vue 3 frontend |
| `npm run init-db` | Initializes the SQLite database schema (`fantasy_bets.db`) |
| `npm run build` | Builds the Vue 3 frontend application for production into `dist/` |
| `npm run preview` | Locally previews the production build created by Vite |
| `npm test` | Runs the full end-to-end (E2E) integration test suite |

---

## Testing

Run the test suite using:

```bash
npm test
```

The test runner executes `node server/tests/e2e.test.js`, validating:
- User registration, duplicate validation, and JWT authentication.
- Room creation, unique invite code generation, membership limits, and round-robin match fixtures.
- Betting prediction submission, validation, atomic match simulation, settlement, and leaderboard calculation.

---

## License

- [ ] TODO: Specify project license (e.g., MIT, Apache 2.0, or Proprietary).
