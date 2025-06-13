// routes/productRoutes.js
const express = require('express');
const router = express.Router();

// ต้องรับ productDb object มาจาก server.js
module.exports = (productDb) => {

    // 1. Get All Products
    router.get('/', (req, res) => {
        const sql = `SELECT * FROM products`;
        productDb.all(sql, [], (err, rows) => {
            if (err) {
                console.error('Error fetching products:', err.message);
                return res.status(500).json({ message: 'Error fetching product data.' });
            }
            res.status(200).json(rows);
        });
    });

    // 2. Get Product by ID
    router.get('/:productId', (req, res) => {
        const productId = req.params.productId;
        const sql = `SELECT * FROM products WHERE id = ?`;
        productDb.get(sql, [productId], (err, row) => {
            if (err) {
                console.error('Error fetching product by ID:', err.message);
                return res.status(500).json({ message: 'Error fetching product data.' });
            }
            if (!row) {
                return res.status(404).json({ message: 'Product not found.' });
            }
            res.status(200).json(row);
        });
    });

    // (คุณสามารถเพิ่ม API สำหรับเพิ่ม/แก้ไข/ลบสินค้าได้ที่นี่ภายหลัง)

    return router;
};