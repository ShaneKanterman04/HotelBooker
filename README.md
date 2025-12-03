# Hotel Booker 🏨
 
A full-stack hotel booking application with secure user authentication. Built with Node.js, Express, and MySQL.
 
## Features
 
- User Registration with secure password hashing (bcrypt)
- User Login with session management
 
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
│   ├── main.html          # Main hotel listing page
│   ├── portal.html        # Owner portal for hotel management
│   ├── booking.html       # Room booking page
│   ├── css/
│   │   ├── main.css           # Main page styles
│   │   ├── portal.css         # Owner portal styles
│   │   ├── booking.css        # Booking page styles
│   │   └── register-login.css # Auth pages styles
│   └── js/
│       ├── client.js      # Client-side form handling (auth)
│       ├── main.js        # Main page logic (hotel display, sorting)
│       ├── portal.js      # Owner portal logic (add/delete hotels/rooms)
│       └── booking.js     # Booking page logic (room selection, price calculation)
├── hotel_booker.sql       # Database schema (users, hotels, rooms, bookings)
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
 
4. **Verify the database was created:**
   ```bash
   mysql -u root -p -e "USE hotel_booker; SHOW TABLES;"
   ```
 
### Step 3: Configure Environment Variables
 
1. **Navigate to the backend folder:**
   ```bash
   cd backend
   ```
 
2. **Create a `.env` file:**
   ```bash
   touch .env
   ```
 
3. **Add your database credentials**:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_mysql_password_here
   DB_NAME=hotel_booker
   PORT=3000
   ```
 
### Step 4: Install Dependencies in the backend directory
 
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
node server.js
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
