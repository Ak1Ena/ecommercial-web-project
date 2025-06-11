const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database('../data/products.db');
const axios = require('axios');

router.post('/delete', (req, res) => {
    console.log("Delete Product request received");
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    const sql = `DELETE FROM products WHERE id = ?`;
    
    db.run(sql, [id], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (this.changes === 0) {
            console.log(`No product found with ID ${id}`);
            return res.status(404).json({ error: 'Product not found' });
        }
        console.log(`Product with ID ${id} deleted successfully`);
        res.status(200).json({ message: 'Product deleted successfully' });
    });
});

router.post('/quantity', (req, res) => {
    console.log("Update Product Quantity request received");
    const { id, quantity } = req.body;

    if (!id || quantity === undefined) {
        return res.status(400).json({ error: 'Product ID and quantity are required' });
    }

    const getSql = 'SELECT quantity FROM products WHERE id = ?';
    db.get(getSql, [id], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (!row) {
            console.log(`No product found with ID ${id}`);
            return res.status(404).json({ error: 'Product not found' });
        }
        const currentQuantity = row.quantity || 0;
        const newQuantity = currentQuantity - quantity;

        const updateSql = `UPDATE products SET quantity = ? WHERE id = ?`;
        db.run(updateSql, [newQuantity, id], function(err) {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            if (this.changes === 0) {
                console.log(`No product found with ID ${id}`);
                return res.status(404).json({ error: 'Product not found' });
            }
            console.log(`Product with ID ${id} updated successfully with new quantity ${newQuantity}`);
            res.status(200).json({ message: 'Product quantity updated successfully', newQuantity });
        });
    });
});

router.post('/update', (req, res) => {
    console.log("Update Product request received");
    const { id, name, price, discount, quantity, category, img } = req.body;
    if (!id || !name || !price || !quantity || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const sql = `UPDATE products SET name = ?, price = ?, discount = ?, quantity = ?, category = ?, img = ? WHERE id = ?`;
    const params = [name, price, discount || 0, quantity, category, img || '', id];
    db.run(sql, params, function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (this.changes === 0) {
            console.log(`No product found with ID ${id}`);
            return res.status(404).json({ error: 'Product not found' });
        }
        console.log(`Product with ID ${id} updated successfully`);
        res.status(200).json({ message: 'Product updated successfully' });
    });
});

router.post('/add', (req, res) => {
    console.log("Add Product request received");
    const { name, price, discount, quantity, category, img } = req.body;

    if (!name || !price || !quantity || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const sql = `INSERT INTO products (name, price, discount, quantity, category, img) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [name, price, discount || 0, quantity, category, img || ''];

    db.run(sql, params, function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        console.log(`Product added with ID ${this.lastID}`);
        res.status(201).json({ id: this.lastID });
    });
});

router.get('/get/:id', (req, res) => {
    const id = req.params.id;
    console.log(`Get Product request received for ID: ${id}`);
    
    const sql = 'SELECT * FROM products WHERE id = ?';
    
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (!row) {
            console.log(`No product found with ID ${id}`);
            return res.status(404).json({ error: 'Product not found' });
        }
        console.log(`Product retrieved: ${JSON.stringify(row)}`);
        res.json(row);
    });
});

router.get('/get', (req, res) => {
    const sql = 'SELECT * FROM products';
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        console.log(`Retrieved ${rows.length} products`);
        res.json(rows);
    });
});


router.get('/category/:category', (req, res) => {
    const category = req.params.category;
    console.log(`Get products by category: ${category}`);

    const sql = 'SELECT * FROM products WHERE category = ?';
    
    db.all(sql, [category], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        console.log(`Found ${rows.length} products in category "${category}"`);
        res.json(rows);
    });
});

router.get('/search', (req, res) => {
    const search = req.query.search || '';
    const sql = `SELECT * FROM products WHERE LOWER(name) LIKE LOWER(?)`;
    const searchPattern = `%${search}%`;

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
