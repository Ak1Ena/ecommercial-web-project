// server.js (รวมโค้ดทั้งหมดสำหรับ SQLite3)
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path'); // สำหรับจัดการ path ของไฟล์

const app = express();
const port = 3000; // เลือก port ที่คุณต้องการ

// Middleware
app.use(cors()); // อนุญาตให้ frontend ที่มาจาก origin อื่นๆ เข้าถึงได้
app.use(express.json()); // สำหรับ parse JSON body จาก request

// สร้าง Path ไปยังไฟล์ฐานข้อมูล
// ตรวจสอบให้แน่ใจว่า users.db อยู่ในโฟลเดอร์ 'data' ของโปรเจกต์ backend ของคุณ
const dbPath = path.resolve(__dirname, 'data', 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // สร้างตารางถ้ายังไม่มี (ปรับปรุงคอลัมน์ให้ตรงกับที่ Front ส่งมา)
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL UNIQUE,
            address TEXT NOT NULL,
            password TEXT NOT NULL,
            history TEXT /* เก็บเป็น JSON string */
        )`, (err) => {
            if (err) {
                console.error('Error creating users table:', err.message);
            } else {
                console.log('Users table checked/created.');
            }
        });
    }
});

// ====================================================================
// API Endpoints
// ====================================================================

// 1. Register User
app.post('/api/register', (req, res) => {
    const { firstName, lastName, username, email, phone, address, password } = req.body;
    const history = JSON.stringify([]); // เริ่มต้น history เป็น array ว่างๆ ในรูปแบบ JSON string

    if (!firstName || !lastName || !username || !email || !phone || !address || !password) {
        return res.status(400).json({ message: 'All required fields are missing.' });
    }

    // ใน Production: ควร Hash รหัสผ่านด้วย bcrypt.js ก่อนบันทึกลง DB
    const hashedPassword = password; // สำหรับตัวอย่างนี้เก็บเป็น plaintext

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

// 2. Login User
app.post('/api/login', (req, res) => {
    const {username , password } = req.body; // identifier สามารถเป็น username หรือ email

    if (!username || !password) {
        return res.status(400).json({ message: 'Username/Email and password are required.' });
    }

    const sql = `SELECT id, username, password FROM users WHERE username = ? OR email = ?`;
    db.get(sql, [username, username], (err, user) => {
        if (err) {
            console.error('Error during login query:', err.message);
            return res.status(500).json({ message: 'Login failed due to a server error.' });
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid username/email or password.' });
        }

        // *** สำคัญมาก: ส่วนนี้ควรเป็นการเปรียบเทียบรหัสผ่านที่ถูก Hash ***
        // ใน Production: ใช้ await bcrypt.compare(password, user.password)
        if (password === user.password) { // <-- ไม่ปลอดภัยสำหรับ Production!
            res.status(200).json({
                message: `Login successful! Welcome, ${user.username}!`,
                userId: user.id,
                username: user.username
            });
        } else {
            res.status(401).json({ message: 'Invalid username/email or password.' });
        }
    });
});

// 3. Get User Profile by ID
app.get('/api/profile/:userId', (req, res) => {
    const userId = req.params.userId;

    const sql = `SELECT id, firstName, lastName, username, email, phone, address, history FROM users WHERE id = ?`;
    db.get(sql, [userId], (err, row) => {
        if (err) {
            console.error('Error fetching user profile:', err.message);
            return res.status(500).json({ message: 'Error fetching profile data.' });
        }
        if (!row) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // แปลง history กลับเป็น object/array ก่อนส่งไป Frontend
        if (row.history) {
            try {
                row.history = JSON.parse(row.history);
            } catch (e) {
                console.error("Error parsing history JSON:", e);
                row.history = null; // หรือ []
            }
        }
        res.status(200).json(row);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});

// ปิด database connection เมื่อ server ถูกปิด (เช่น Ctrl+C)
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Database connection closed.');
        process.exit(0);
    });
});