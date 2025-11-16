# Hotel Booker 🏨

A full-stack hotel booking application with secure user authentication. Built with Node.js, Express, and MySQL.

## Features

- ✅ User Registration with secure password hashing (bcrypt)
- ✅ User Login with session management
- ✅ MySQL database integration
- ✅ Responsive UI design
- ✅ RESTful API endpoints
- ✅ Form validation and error handling

## Tech Stack

**Frontend:**
- HTML5
- CSS3
- Vanilla JavaScript

**Backend:**
- Node.js
- Express.js (CommonJS)
- bcrypt (password hashing)
- express-session (session management)
- dotenv (environment variables)

**Database:**
- MySQL / MariaDB

## Project Structure

```
HotelBooker/
├── backend/
│   ├── db.js              # Database connection pool
│   ├── server.js          # Express server and API endpoints
│   ├── package.json       # Node.js dependencies
│   └── .env               # Environment variables (not in repo)
├── public/
│   ├── login.html         # Login page
│   ├── register.html      # Registration page
│   ├── main.html          # Landing page
│   ├── success.html       # Success page after login
│   ├── css/               # Stylesheets
│   └── js/
│       └── client.js      # Client-side form handling
├── hotel_booker.sql       # Database schema
└── README.md
```

## Local Setup Instructions

### Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MySQL](https://dev.mysql.com/downloads/) or [MySQL Workbench](https://www.mysql.com/products/workbench/)
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/ShaneKanterman04/HotelBooker.git
cd HotelBooker
```

### Step 2: Set Up the Database

1. **Start your MySQL server** (make sure MySQL is running)

2. **Open MySQL Workbench** or use the MySQL command line

3. **Run the SQL schema:**

   **Option A - Using MySQL Workbench:**
   - Open MySQL Workbench
   - Connect to your local MySQL server
   - Open the `hotel_booker.sql` file
   - Execute the SQL script

   **Option B - Using Terminal:**
   ```bash
   mysql -u root -p < hotel_booker.sql
   ```
   Enter your MySQL root password when prompted.

4. **Verify the database was created:**
   ```bash
   mysql -u root -p -e "USE hotel_booker; SHOW TABLES;"
   ```
   You should see the `users` table.

### Step 3: Configure Environment Variables

1. **Navigate to the backend folder:**
   ```bash
   cd backend
   ```

2. **Create a `.env` file:**
   ```bash
   touch .env
   ```

3. **Add your database credentials** (replace with your actual MySQL password):
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_mysql_password_here
   DB_NAME=hotel_booker
   PORT=3000
   ```

   ⚠️ **Important:** Replace `your_mysql_password_here` with your actual MySQL root password.

### Step 4: Install Dependencies

```bash
npm install
```

This will install all required packages:
- express
- mysql2
- bcrypt
- dotenv
- express-session

### Step 5: Start the Server

```bash
npm start
```

You should see:
```
Hotel Booker server running on port 3000
```

### Step 6: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

1. **Register a new account** - Click "Register" and create an account with username, email, and password
2. **Login** - Use your email and password to log in
3. **Success** - After successful login, you'll be redirected to the success page

## API Endpoints

| Method | Endpoint     | Description           | Request Body                          |
|--------|-------------|-----------------------|---------------------------------------|
| POST   | `/register` | Register a new user   | `{ username, email, password }`      |
| POST   | `/login`    | Login existing user   | `{ email, password }`                |
| GET    | `/`         | Landing page          | -                                     |
| GET    | `/login`    | Login page            | -                                     |
| GET    | `/register` | Registration page     | -                                     |
| GET    | `/success`  | Success page          | -                                     |

## Security Features

- Passwords are hashed using bcrypt with 10 salt rounds
- Environment variables protect sensitive database credentials
- Session-based authentication
- SQL injection prevention with parameterized queries
- Duplicate email validation

## Troubleshooting

### "Cannot connect to database"
- Verify MySQL server is running
- Check your `.env` file has correct credentials
- Ensure the `hotel_booker` database exists

### "Port 3000 already in use"
- Change the PORT value in your `.env` file
- Or stop the process using port 3000

### "ER_DUP_ENTRY" error
- Email already exists in database
- Try registering with a different email

## Future Features

- [ ] Hotel search and browsing
- [ ] Hotel booking functionality
- [ ] User dashboard
- [ ] Booking history
- [ ] Payment integration
- [ ] Admin panel

## Contributing

This is a student project. Feel free to fork and experiment!

## License

ISC

## Authors

- Shane Kanterman - [@ShaneKanterman04](https://github.com/ShaneKanterman04)
- Erick Gonzalez

---

Made with ❤️ for learning full-stack development
