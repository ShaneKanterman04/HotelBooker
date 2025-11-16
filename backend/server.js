import express from 'express';
import { db } from './db.js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const app = express();
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(process.cwd(), 'public')));

// Api Calls

// Register
app.post('/register', async (req, res) => {
  const { username, password, role = 'user' } = req.body;
  try {
    await db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, role]);
    res.json({ message: 'User registered', role });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await db.query('SELECT * FROM users WHERE username=? AND password=?', [username, password]);
  if (rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });
  res.json({ message: 'Login successful', role: rows[0].role });
});

// Fetch Users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, username, role FROM users');
    res.json({ users: rows });
  } catch (err) {
    console.error('Failed to fetch users', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Test
app.get('/', (req, res) => {
  res.send('Hotel Booker API running');
});


// Pages

// Login
app.get('/login', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'login.html'));
});

// Register
app.get('/register', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'register.html'));
});

// Successful login
app.get('/success', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'success.html'));
});

// Admin Page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'admin.html'));
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Hotel Booker server running on port ${port}`));
