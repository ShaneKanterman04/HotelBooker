const express = require('express');
const db = require('./db.js');
require('dotenv').config();
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// Register - expects { username, email, password }
app.post('/register', async (req, res) => {
	const { username, email, password } = req.body;
	if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });

	try {
		const hashed_password = await bcrypt.hash(password, 10);
		await db.query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [username, email, hashed_password]);
		return res.json({ message: 'User registered' });
	} 
  catch (err) {
		if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already registered' });
		console.error('Register error', err);
		return res.status(500).json({ error: 'Failed to register' });
	}
});

// Login - expects { email, password }
app.post('/login', async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

	try {
		const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
		if (!rows || rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });
		const user = rows[0];
		const ok = await bcrypt.compare(password, user.password_hash);

		if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
		return res.json({ message: 'Login successful' });
	} 
  catch (err) {
		console.error('Login error', err);
		return res.status(500).json({ error: 'Login failed' });
	}
});

// Serve pages (static middleware already serves files in /public)
app.get('/', (req, res) => res.sendFile(path.join(publicDir, 'main.html')));
app.get('/login', (req, res) => res.sendFile(path.join(publicDir, 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(publicDir, 'register.html')));
app.get('/success', (req, res) => res.sendFile(path.join(publicDir, 'success.html')));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Hotel Booker server running on port ${port}`));
