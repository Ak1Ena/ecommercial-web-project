const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path')
const db = new sqlite3.Database('../data/products.db');



router.get('/search', (req, res) => {
    const search = req.query.search || '';
    const sql = `SELECT * FROM products WHERE LOWER(name) LIKE LOWER(?)`;
    const searchPattern = `${search}`; 

    db.all(sql, [searchPattern], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        console.log(`Search query: ${searchPattern}`);
        console.log(`Found ${rows.length} products matching "${search}"`);
        res.json(rows);
    });
});

module.exports = router;