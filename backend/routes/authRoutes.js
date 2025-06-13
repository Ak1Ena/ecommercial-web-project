// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // สำหรับเข้ารหัสรหัสผ่าน

// ต้องรับ db object (usersDb) มาจาก server.js
module.exports = (db) => {

    // 1. Register User
    router.post('/register', (req, res) => {
        const { firstName, lastName, username, email, phone, address, password } = req.body;
        const history = JSON.stringify([]); // ให้ default history เป็น array ว่างเปล่า

        if (!firstName || !lastName || !username || !email || !phone || !address || !password) {
            return res.status(400).json({ message: 'All required fields are missing.' });
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password:', err.message);
                return res.status(500).json({ message: 'Registration failed due to password processing error.' });
            }

            const sql = `
                INSERT INTO users (firstName, lastName, username, email, phone, address, password, history)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [firstName, lastName, username, email, phone, address, hashedPassword, history];

            db.run(sql, values, function (err) {
                if (err) {
                    console.error('Error saving data:', err.message);
                    if (err.message.includes('UNIQUE constraint failed')) {
                        let field = '';
                        if (err.message.includes('users.username')) field = 'Username';
                        else if (err.message.includes('users.email')) field = 'Email';
                        else if (err.message.includes('users.phone')) field = 'Phone number';
                        return res.status(409).json({ message: `${field} is already in use.` });
                    }
                    return res.status(500).json({ message: 'Registration failed due to a server error.' });
                }
                res.status(201).json({ message: 'Registration successful!', userId: this.lastID });
            });
        });
    });

    // 2. Login User
    router.post('/login', (req, res) => {
        const { username, password } = req.body; // รับ username หรือ email

        if (!username || !password) {
            return res.status(400).json({ message: 'Username/Email and password are required.' });
        }

        // ค้นหาผู้ใช้ด้วย username หรือ email
        const sql = `SELECT id, username, password FROM users WHERE username = ? OR email = ?`;
        db.get(sql, [username, username], (err, user) => {
            if (err) {
                console.error('Error during login query:', err.message);
                return res.status(500).json({ message: 'Login failed due to a server error.' });
            }

            if (!user) {
                // ไม่พบผู้ใช้
                return res.status(401).json({ message: 'Invalid username/email or password.' });
            }

            // เปรียบเทียบรหัสผ่านที่ส่งมากับรหัสผ่านที่ hash ไว้
            bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
                if (bcryptErr) {
                    console.error('Error comparing passwords:', bcryptErr.message);
                    return res.status(500).json({ message: 'Login failed due to password comparison error.' });
                }
                if (isMatch) {
                    // รหัสผ่านตรงกัน
                    res.status(200).json({
                        message: `Login successful! Welcome, ${user.username}!`,
                        userId: user.id,
                        username: user.username
                    });
                } else {
                    // รหัสผ่านไม่ตรงกัน
                    res.status(401).json({ message: 'Invalid username/email or password.' });
                }
            });
        });
    });

    return router;
};