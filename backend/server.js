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

	} catch (err) {
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

app.post('/api/add-hotel', requireAuth, requireOwner, async (req, res) => {
	const { name, address, city, state, country, postal_code, description, star_rating, phone, email } = req.body;

	// Validate required fields
	if (!name || !address || !city || !state || !country || !postal_code || !description || !star_rating || !phone || !email) {
		return res.status(400).json({ error: 'Missing required fields' });
	}

	try {
		// Get user id from session (user already authenticated as owner by middleware)
		const owner_id = req.session.userId;

		// Insert new hotel into hotels table
		await db.query('INSERT INTO hotels (hotel_name, owner_id, address, city, state, country, postal_code, description, star_rating, phone_number, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
			[name, owner_id, address, city, state, country, postal_code, description, star_rating, phone, email]);
		return res.json({ message: 'Hotel added successfully' });

	} catch (err) {
		if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Hotel name already exists' });
		console.error('Failed to add hotel', err);
		return res.status(500).json({ error: 'Failed to add hotel' });
	}
});

app.post('/api/add-room', requireAuth, requireOwner, async (req, res) => {
	const { hotel_id, room_number, room_type, price, capacity, bed_type, amenities, description, is_available } = req.body;
	// Validate required fields
	if (!hotel_id || !room_number || !room_type || !price || !capacity || !bed_type || !amenities || !description || is_available === undefined) {
		return res.status(400).json({ error: 'Missing required fields' });
	}

	// send data to database
	try {
		await db.query('INSERT INTO rooms (hotel_id, room_number, room_type, price_per_night, capacity, bed_type, amenities, description, availability) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
			[hotel_id, room_number, room_type, price, capacity, bed_type, amenities, description, is_available]);
		return res.json({ message: 'Room added successfully' });

	} catch (err) {
		if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Room number already exists for this hotel' });
		console.error('Failed to add room', err);
		return res.status(500).json({ error: 'Failed to add room' });
	}
});

app.post('/api/delete-requests', requireAuth, requireOwner, async (req, res) => {
	const { hotelIds, roomIds } = req.body;
	
	if (!Array.isArray(hotelIds) || !Array.isArray(roomIds)) {
		return res.status(400).json({ success: false, message: 'Invalid request format' });
	}
	if (hotelIds.length === 0 && roomIds.length === 0) {
		return res.status(400).json({ success: false, message: 'No items selected for deletion' });
	}
	
	const userId = req.session.userId;
	
	try {
		let deletedHotels = 0;
		let deletedRooms = 0;
		
		// Delete hotels and their rooms
		if (hotelIds.length > 0) {
			for (const hotelId of hotelIds) {
				// Delete all rooms belonging to this hotel
				await db.query('DELETE FROM rooms WHERE hotel_id = ?', [hotelId]);
				
				// Delete the hotel itself
				const [result] = await db.query('DELETE FROM hotels WHERE id = ? AND owner_id = ?', [hotelId, userId]);
				deletedHotels += result.affectedRows;
			}
		}
		
		// Delete individual rooms
		if (roomIds.length > 0) {
			for (const roomId of roomIds) {
				// Check if room still exists (it may have been deleted with its hotel)
				const [roomCheck] = await db.query('SELECT id FROM rooms WHERE id = ?', [roomId]);
				
				if (roomCheck.length > 0) {
					// Room still exists, verify ownership through hotel and delete
					const [result] = await db.query(
						'DELETE rooms FROM rooms INNER JOIN hotels ON rooms.hotel_id = hotels.id WHERE rooms.id = ? AND hotels.owner_id = ?',
						[roomId, userId]
					);
					deletedRooms += result.affectedRows;
				}
			}
		}
		return res.json({ 
			success: true, 
			message: `Successfully deleted ${deletedHotels} hotel(s) and ${deletedRooms} room(s)`,
			deletedHotels,
			deletedRooms
		});
		
	} catch (err) {
		console.error('Bulk delete error:', err);
		return res.status(500).json({ success: false, message: 'Failed to delete items' });
	}
});

app.get('/api/owner-hotels', requireAuth, requireOwner, async (req, res) => {
	// Endpoint to get hotels owned by logged-in owner
	try {
		const owner_id = req.session.userId;
		const [hotels] = await db.query('SELECT * FROM hotels WHERE owner_id = ?', [owner_id]);

		// For each hotel, get its rooms and add it to the hotel object
		for (let hotel of hotels) {
			const [rooms] = await db.query('SELECT * FROM rooms WHERE hotel_id = ?', [hotel.id]);
			hotel.rooms = rooms;
		}
		res.json({ myHotels: hotels });

	} catch (err) {
		console.error('Failed to fetch owner hotels', err);
		return res.status(500).json({ error: 'Failed to fetch hotels' });
	}
});

app.get('/api/hotels', async (req, res) => {
	// Endpoint to get all hotels to display on main page
	try {
		const [hotels] = await db.query('SELECT * FROM hotels');
		res.json({ hotels: hotels });

	} catch (err) {
		console.error('Failed to fetch hotels', err);
		return res.status(500).json({ error: 'Failed to fetch hotels' });
	}
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