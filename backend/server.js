// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs'); // อาจจะใช้หรือไม่ใช้ตรงนี้ก็ได้ เพราะส่งไปให้ route แล้ว

// นำเข้า Routes ที่แยกออกมา
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ====================================================================
// Database Connections
// ====================================================================

// เชื่อมต่อ Users Database
const usersDbPath = path.resolve(__dirname, 'data', 'users.db');
const usersDb = new sqlite3.Database(usersDbPath, (err) => {
    if (err) {
        console.error('Error connecting to users database:', err.message);
    } else {
        console.log('Connected to the Users SQLite database.');
        usersDb.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL UNIQUE,
            address TEXT NOT NULL,
            password TEXT NOT NULL,
            history TEXT DEFAULT '[]' -- กำหนดค่า default เป็น JSON array ว่างเปล่า
        )`, (err) => {
            if (err) {
                console.error('Error creating users table:', err.message);
            } else {
                console.log('Users table checked/created.');
            }
        });
    }
});

// เชื่อมต่อ Products Database
const productsDbPath = path.resolve(__dirname, 'data', 'products.db');
const productsDb = new sqlite3.Database(productsDbPath, (err) => {
    if (err) {
        console.error('Error connecting to product database:', err.message);
    } else {
        console.log('Connected to the Products SQLite database.');
        productsDb.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            discount REAL,
            quantity INTEGER NOT NULL,
            category TEXT NOT NULL,
            img TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating products table:', err.message);
            } else {
                console.log('Products table checked/created.');
                // ตัวอย่างการใส่ข้อมูลเริ่มต้น (รันแค่ครั้งเดียวหรือเมื่อ db ว่าง)
                // productsDb.run(`INSERT INTO products (name, price, discount, quantity, category, img) VALUES
                // ('Banana', 2.99, 0.50, 100, 'Fruits', 'banana.jpg'),
                // ('Apple', 1.50, 0.25, 150, 'Fruits', 'apple.jpg')`);
            }
        });
    }
});


// ====================================================================
// Use Routes
// ====================================================================
// กำหนด prefix สำหรับแต่ละ route
app.use('/api/auth', authRoutes(usersDb));      // สำหรับ Register, Login
app.use('/api/users', userRoutes(usersDb));     // สำหรับ User Profile (ใช้ usersDb)
app.use('/api/products', productRoutes(productsDb)); // สำหรับ Products (ใช้ productsDb)
app.use('/api/cart', cartRoutes(usersDb));      // สำหรับ Cart (ยังคงเก็บใน history ของ usersDb)


// Start the server
app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});

// ปิด database connection เมื่อ server ถูกปิด (เช่น Ctrl+C)
process.on('SIGINT', () => {
    usersDb.close((err) => {
        if (err) {
            console.error('Error closing users DB:', err.message);
        } else {
            console.log('Users Database connection closed.');
        }
    });
    productsDb.close((err) => {
        if (err) {
            console.error('Error closing products DB:', err.message);
        } else {
            console.log('Products Database connection closed.');
        }
    });
    process.exit(0);
});