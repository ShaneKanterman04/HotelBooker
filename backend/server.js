const express = require('express');
const session = require('express-session');
const db = require('./db.js');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: __dirname + '/.env' });
const app = express();
const publicDir = path.join(__dirname, '..', 'public');

// ════════════════════════════════════════════
// GLOBAL MIDDLEWARE, before all endpoints
// ════════════════════════════════════════════
app.use(express.static(publicDir));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/**
 * SESSION MIDDLEWARE CONFIGURATION
 * - secret: Is added to the session ID for security (prevents tampering)
 * - resave: false = Only save session if modified, not on every request
 * - saveUninitialized: false = Don't create session until data is stored (only logged-in users get sessions)
 * - cookie.secure: false = Allow cookies over HTTP not HTTPS
 * - cookie.httpOnly: true = JavaScript cannot access cookie (prevents XSS attacks)
 * - cookie.maxAge: Session expires 24 hours after creation
 */
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: false,
		httpOnly: true,
		maxAge: 24 * 60 * 60 * 1000
	}
}));

// ════════════════════════════════════════════
// ENPOINTS
// ════════════════════════════════════════════
app.post('/register', async (req, res) => {
	// Register endpoint expects { username, email, password, user_type }
	const { username, email, password, user_type } = req.body;
	if (!username || !email || !password || !user_type) return res.status(400).json({ error: 'Missing fields' });

	try {
		const hashed_password = await bcrypt.hash(password, 10);
		await db.query('INSERT INTO users (name, email, password_hash, user_type) VALUES (?, ?, ?, ?)', [username, email, hashed_password, user_type]);
		return res.json({ message: 'User registered' });
	} 
    catch (err) {
		if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already registered' });
		console.error('Register error', err);
		return res.status(500).json({ error: 'Failed to register' });
	}
});

app.post('/login', async (req, res) => {
	// Login endpoint expects { email, password }
	const { email, password } = req.body;
	if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

	try {
		// Get the user from the database
		const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

		// Check if user exists
		if (!rows || rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });
		const user = rows[0];

		// Verify password matches
		const valid_password = await bcrypt.compare(password, user.password_hash);
		if (!valid_password) return res.status(400).json({ error: 'Invalid credentials' });
		
		// Create session, store user info in session.
		req.session.userId = user.id;
		req.session.email = user.email;
		req.session.name = user.name;
		req.session.userType = user.user_type;
		
		return res.json({ message: 'Login successful' });
	} 
  	catch (err) {
		console.error('Login error', err);
		return res.status(500).json({ error: 'Login failed' });
	}
});

app.post('/logout', (req, res) => {
	// Logout endpoint, deletes session data from the session object in memory and invalidates sessionID
	req.session.destroy((err) => {
		if (err) return res.status(500).json({ error: 'Logout failed' });
		res.json({ message: 'Logged out successfully' });
	});
});

app.get('/api/check-auth', (req, res) => {
	// API endpoint to check login status
	if (req.session.userId) {
		return res.json({
			loggedIn: true,
			user: {
				id: req.session.userId,
				name: req.session.name,
				email: req.session.email,
				userType: req.session.userType
			}
		});
	}
	res.json({ loggedIn: false });
});

app.get('/', (req, res) => res.sendFile(path.join(publicDir, 'main.html')));
app.get('/login', (req, res) => res.sendFile(path.join(publicDir, 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(publicDir, 'register.html')));


// ════════════════════════════════════════════
// MIDDLEWARE FUNCTIONS
// ════════════════════════════════════════════
function requireAuth(req, res, next) {
	// Middleware function to check if user is logged in
	if (!req.session.userId) {
		if (req.path.startsWith('/api/')) { // API requests get JSON error
			return res.status(401).json({ error: 'Not authenticated' });
		}
		return res.redirect('/login'); // Page requests get redirected to login
	}
	next(); 
}

function requireOwner(req, res, next) {
	// Middleware to check if user is a Hotel Owner
  if (req.session.userType !== 'owner') {
    return res.status(403).json({ error: 'Owners only' });
  }
  next(); // Continue the next middleware/handler
}

const port = 3000;
app.listen(port, () => console.log(`Hotel Booker server running on port ${port}`));