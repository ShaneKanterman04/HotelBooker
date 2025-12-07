const db = require('./db');
const bcrypt = require('bcrypt');

async function setupDatabase() {
    try {
        console.log('Starting database setup...');

        // Drop existing tables in reverse order of dependencies
        console.log('Dropping existing tables...');
        await db.query('DROP TABLE IF EXISTS bookings');
        await db.query('DROP TABLE IF EXISTS rooms');
        await db.query('DROP TABLE IF EXISTS favorites');
        await db.query('DROP TABLE IF EXISTS hotels');
        await db.query('DROP TABLE IF EXISTS users');

        // Create users table
        console.log('Creating users table...');
        await db.query(`
            CREATE TABLE users (
                id             INT AUTO_INCREMENT PRIMARY KEY,
                name           VARCHAR(100) NOT NULL,
                email          VARCHAR(255) NOT NULL UNIQUE,
                password_hash  VARCHAR(255) NOT NULL,
                user_type      ENUM('regular', 'owner') DEFAULT 'regular',
                created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create hotels table
        console.log('Creating hotels table...');
        await db.query(`
            CREATE TABLE hotels (
                id              INT AUTO_INCREMENT PRIMARY KEY,
                hotel_name      VARCHAR(225) NOT NULL,
                owner_id        INT,
                address         VARCHAR(255) NOT NULL,
                city            VARCHAR(100) NOT NULL,
                state           VARCHAR(100) NOT NULL,
                country         VARCHAR(100) NOT NULL,
                postal_code     VARCHAR(20) NOT NULL,
                description     TEXT,
                star_rating     INT CHECK (star_rating BETWEEN 1 AND 5),
                phone_number    VARCHAR(20),
                email           VARCHAR(100),
                FOREIGN KEY (owner_id) REFERENCES users(id),
                UNIQUE (hotel_name, owner_id)
            )
        `);

        // Create rooms table
        console.log('Creating rooms table...');
        await db.query(`
            CREATE TABLE rooms (
                id              INT AUTO_INCREMENT PRIMARY KEY,
                hotel_id        INT,
                room_number     VARCHAR(50) NOT NULL,
                room_type       VARCHAR(100) NOT NULL,
                price_per_night DECIMAL(10, 2) NOT NULL,
                capacity        INT NOT NULL,
                bed_type        ENUM('twin', 'single', 'double', 'queen', 'king') NOT NULL,
                amenities       TEXT,
                description     TEXT,
                availability    BOOLEAN DEFAULT TRUE,
                FOREIGN KEY (hotel_id) REFERENCES hotels(id),
                UNIQUE (hotel_id, room_number)
            )
        `);

        // Create bookings table
        console.log('Creating bookings table...');
        await db.query(`
            CREATE TABLE bookings (
                id              INT AUTO_INCREMENT PRIMARY KEY,
                user_id         INT NOT NULL,
                room_id         INT NOT NULL,
                check_in_date   DATE NOT NULL,
                check_out_date  DATE NOT NULL,
                status          ENUM('confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
                total_price     DECIMAL(10, 2),
                created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (room_id) REFERENCES rooms(id)
            )
        `);

        // Create favorites table
        console.log('Creating favorites table...');
        await db.query(`
            CREATE TABLE favorites (
                user_id INT NOT NULL,
                hotel_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, hotel_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
            )
        `);

        // Insert dummy data
        console.log('Inserting dummy data...');
        
        // Create an owner
        const hashedPassword = await bcrypt.hash('password123', 10);
        const [userResult] = await db.query(
            'INSERT INTO users (name, email, password_hash, user_type) VALUES (?, ?, ?, ?)',
            ['Hotel Owner', 'owner@example.com', hashedPassword, 'owner']
        );
        const ownerId = userResult.insertId;

        // Create 5 hotels
        const hotels = [
            ['Grand Plaza Hotel', '123 Main St', 'New York', 'NY', 'USA', '10001', 'Luxury hotel in downtown', 5, '555-0101', 'grand@example.com'],
            ['Seaside Resort', '456 Beach Blvd', 'Miami', 'FL', 'USA', '33101', 'Beautiful beachfront resort', 4, '555-0102', 'seaside@example.com'],
            ['Mountain View Lodge', '789 Alpine Way', 'Denver', 'CO', 'USA', '80201', 'Cozy lodge in the mountains', 3, '555-0103', 'mountain@example.com'],
            ['Urban Boutique', '321 City Center', 'Chicago', 'IL', 'USA', '60601', 'Modern boutique hotel', 4, '555-0104', 'urban@example.com'],
            ['Lakeside Inn', '654 Lake Dr', 'Seattle', 'WA', 'USA', '98101', 'Peaceful inn by the lake', 3, '555-0105', 'lakeside@example.com']
        ];

        for (const hotel of hotels) {
            const [hotelResult] = await db.query(
                'INSERT INTO hotels (hotel_name, address, city, state, country, postal_code, description, star_rating, phone_number, email, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [...hotel, ownerId]
            );
            const hotelId = hotelResult.insertId;

            // Insert rooms for this hotel
            const rooms = [
                ['101', 'Standard Single', 100.00, 1, 'single', 'WiFi, TV', 'Cozy single room'],
                ['102', 'Standard Double', 150.00, 2, 'double', 'WiFi, TV, Mini-bar', 'Comfortable double room'],
                ['201', 'Deluxe Queen', 200.00, 2, 'queen', 'WiFi, TV, Mini-bar, Balcony', 'Spacious room with queen bed'],
                ['202', 'Executive King', 300.00, 2, 'king', 'WiFi, TV, Mini-bar, Balcony, Jacuzzi', 'Luxury suite with king bed']
            ];

            for (const room of rooms) {
                await db.query(
                    'INSERT INTO rooms (hotel_id, room_number, room_type, price_per_night, capacity, bed_type, amenities, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [hotelId, ...room]
                );
            }
        }

        console.log('Database setup completed successfully!');
        console.log('Database setup completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error setting up database:', err);
        process.exit(1);
    }
}

setupDatabase();
