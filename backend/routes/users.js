const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path')
const db = new sqlite3.Database('../data/users.db');



router.post('/checkout', (req, res) => {
    const {products , id } = req.body;
    if (!products || !Array.isArray(products)) {
        return res.status(400).json({ error: 'Invalid request body' });
    }
    
    db.get(`SELECT history FROM users WHERE id = ?`, [id], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'User not found !' });
        }
        let history = row.history ? JSON.parse(row.history) : [];
        products.forEach(products =>{
            history.push(products);
        })
        const UpdatedHistory = JSON.stringify(history);

        db.run(`UPDATE users SET history = ? WHERE id = ?`,[UpdatedHistory,id] , function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        console.log(`Updated history for product ID ${id}`);
        res.json({ message: 'Checkout successful', changes: this.changes });
    });
    });    
});

module.exports = router;