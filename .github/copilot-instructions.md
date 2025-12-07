# Hotel Booker AI Instructions

## Project Overview
Full-stack hotel booking application using Node.js, Express, MySQL, and vanilla HTML/CSS/JS.
- **Backend**: Node.js/Express API serving static frontend files.
- **Database**: MySQL accessed via `mysql2` with promise support.
- **Frontend**: Vanilla JavaScript, HTML5, CSS3 (no frameworks).

## Architecture & Patterns

### Backend (`backend/`)
- **Entry Point**: `server.js` handles all routing, middleware, and server startup.
- **Database**: 
  - Connection pool defined in `db.js`.
  - Use `async/await` for all DB operations.
  - **Pattern**: Destructure query results: `const [rows] = await db.query(...)`.
  - **Pattern**: Use parameterized queries `?` to prevent SQL injection.
- **Authentication**:
  - `bcrypt` for password hashing.
  - `express-session` for session management (cookie-based).
  - Middleware `requireAuth` and `requireOwner` protects routes.
- **API Response**: Always return JSON with `message` for success or `error` for failures.

### Frontend (`public/`)
- **Structure**: Static files served by Express from root `/`.
- **Logic**: 
  - `js/main.js` handles global auth state and navigation.
  - Page-specific logic in `js/client.js`, `js/portal.js`, etc.
- **Communication**: Use `fetch` API for backend requests.
- **State**: Check auth status on page load via `/api/check-auth`.

## Critical Workflows

### Development
- **Start Server**: `cd backend && npm start` (runs on port defined in `server.js`, usually 3000).
- **Environment**: Requires `backend/.env` with `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `SESSION_SECRET`.

### Database
- Schema defined in `hotel_booker.sql`.
- Users table includes `user_type` ('client', 'owner') for role-based access.

## Coding Conventions
- **Error Handling**: Wrap async route handlers in `try/catch`. Log errors to console but send clean JSON error messages to client.
- **Security**: Never store plain-text passwords. Always validate input fields before DB insertion.
- **Frontend**: Avoid inline event handlers; attach listeners in JS files.
