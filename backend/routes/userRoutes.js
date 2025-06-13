// routes/userRoutes.js
const express = require('express');
const router = express.Router();

module.exports = (db) => { // รับ db object (usersDb)

    // GET User Profile by ID (e.g., /api/users/123)
    router.get('/:userId', (req, res) => {
        const userId = req.params.userId;

        // ตรวจสอบว่า userId เป็นตัวเลขที่ถูกต้องหรือไม่
        if (isNaN(userId) || parseInt(userId) <= 0) {
            return res.status(400).json({ message: 'Invalid User ID format.' });
        }

        const sql = `SELECT id, firstName, lastName, username, email, phone, address, history FROM users WHERE id = ?`;
        db.get(sql, [userId], (err, row) => {
            if (err) {
                console.error('Error fetching user profile:', err.message);
                return res.status(500).json({ message: 'Error fetching profile data.' });
            }
            if (!row) {
                return res.status(404).json({ message: 'User not found.' });
            }
            
            // แปลง history string เป็น JSON array
            if (row.history) {
                try {
                    row.history = JSON.parse(row.history);
                    if (!Array.isArray(row.history)) {
                        row.history = []; // หาก parse ได้แต่ไม่ใช่ Array
                    }
                } catch (e) {
                    console.error("Error parsing history JSON in userRoutes:", e);
                    row.history = []; // หาก parse ไม่ได้
                }
            } else {
                row.history = []; // หากไม่มี history เลย
            }
            res.status(200).json(row);
        });
    });

    return router;
};