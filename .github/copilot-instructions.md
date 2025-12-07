# Hotel Booker AI Instructions

## Project Overview
Full-stack hotel booking application.
- **Backend**: Node.js (v14+), Express, MySQL.
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (no frameworks).
- **Database**: MySQL with `mysql2` promise wrapper.

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
  - **Middleware**: `requireAuth` (protected routes) and `requireOwner` (owner-only).
  - **Session Data**: `req.session` stores `userId`, `email`, `name`, `userType`.
- **API Response**: 
  - Always return JSON: `{ message: "..." }` or `{ error: "..." }`.
  - Use standard status codes: 200, 400, 401, 403, 404, 500.

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
- **Schema**: Defined in `hotel_booker.sql`.
- **Setup**: Run `node setup_db.js` in `backend/` to reset and seed the database (WARNING: drops all tables).
- **Tables**: `users` (types: 'client', 'owner'), `hotels`, `rooms`, `bookings`.
- **Changes**: When modifying schema, update `hotel_booker.sql` and `setup_db.js`.

## Coding Conventions
- **Error Handling**: Wrap async route handlers in `try/catch`. Log errors to console but send clean JSON error messages to client.
- **Security**: Never store plain-text passwords. Always validate input fields before DB insertion.
- **Frontend**: Avoid inline event handlers; attach listeners in JS files.
- **Naming**: Snake_case for DB columns (`user_id`), camelCase for JS variables (`userId`).
