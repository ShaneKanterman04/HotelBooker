CREATE DATABASE IF NOT EXISTS hotel_booker;
USE hotel_booker;

-- Create users tablesd
CREATE TABLE IF NOT EXISTS users (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    email          VARCHAR(255) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    user_type      ENUM('regular', 'owner') DEFAULT 'regular',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create hotels table
CREATE TABLE IF NOT EXISTS hotels (
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

    FOREIGN key (owner_id) REFERENCES users(id),
    UNIQUE (hotel_name, owner_id)
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
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
);


