// routes/cartRoutes.js
const express = require('express');
const router = express.Router();

module.exports = (db) => { // รับ db object (ซึ่งคือ users.db)

    // 4. Add Product to Cart (หรือ Update User's History)
    router.post('/add', (req, res) => {
        const { userId, productId, productName, price, quantity, imageUrl } = req.body;

        if (!userId || !productId || !productName || !price || !quantity) {
            return res.status(400).json({ message: 'Missing required product information or userId.' });
        }

        db.get('SELECT history FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) {
                console.error('Error fetching user history:', err.message);
                return res.status(500).json({ message: 'Failed to retrieve user history.' });
            }
            if (!row) {
                return res.status(404).json({ message: 'User not found.' });
            }

            let history = [];
            if (row.history) {
                try {
                    history = JSON.parse(row.history);
                    if (!Array.isArray(history)) {
                        history = [];
                    }
                } catch (e) {
                    console.error('Error parsing existing history:', e);
                    history = [];
                }
            }

            const existingItemIndex = history.findIndex(item => item.productId === productId);

            if (existingItemIndex > -1) {
                history[existingItemIndex].quantity += quantity;
                history[existingItemIndex].price = price;
                history[existingItemIndex].productName = productName;
                history[existingItemIndex].imageUrl = imageUrl;

            } else {
                history.push({
                    productId: productId,
                    productName: productName,
                    price: price,
                    quantity: quantity,
                    imageUrl: imageUrl,
                    addedAt: new Date().toISOString()
                });
            }

            const updatedHistory = JSON.stringify(history);
            db.run('UPDATE users SET history = ? WHERE id = ?', [updatedHistory, userId], function(updateErr) {
                if (updateErr) {
                    console.error('Error updating user history:', updateErr.message);
                    return res.status(500).json({ message: 'Failed to update user cart.' });
                }
                res.status(200).json({ message: 'Product added/updated in cart successfully!', cart: history });
            });
        });
    });

    // 5. Get User Cart (ดึงข้อมูลตะกร้าสินค้าทั้งหมด)
    router.get('/:userId', (req, res) => {
        const userId = req.params.userId;

        db.get('SELECT history FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) {
                console.error('Error fetching user cart:', err.message);
                return res.status(500).json({ message: 'Failed to retrieve user cart.' });
            }
            if (!row) {
                return res.status(404).json({ message: 'User not found.' });
            }

            let cart = [];
            if (row.history) {
                try {
                    cart = JSON.parse(row.history);
                    if (!Array.isArray(cart)) {
                        cart = [];
                    }
                } catch (e) {
                    console.error('Error parsing cart history:', e);
                    cart = [];
                }
            }
            res.status(200).json({ cart: cart });
        });
    });

    // 6. Remove Product from Cart (ถ้าต้องการ)
    router.post('/remove', (req, res) => {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({ message: 'Missing userId or productId.' });
        }

        db.get('SELECT history FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) {
                console.error('Error fetching user history for removal:', err.message);
                return res.status(500).json({ message: 'Failed to retrieve user history.' });
            }
            if (!row) {
                return res.status(404).json({ message: 'User not found.' });
            }

            let history = [];
            if (row.history) {
                try {
                    history = JSON.parse(row.history);
                    if (!Array.isArray(history)) {
                        history = [];
                    }
                } catch (e) {
                    console.error('Error parsing existing history for removal:', e);
                    history = [];
                }
            }

            const initialLength = history.length;
            history = history.filter(item => item.productId !== productId);

            if (history.length === initialLength) {
                return res.status(404).json({ message: 'Product not found in cart.' });
            }

            const updatedHistory = JSON.stringify(history);
            db.run('UPDATE users SET history = ? WHERE id = ?', [updatedHistory, userId], function(updateErr) {
                if (updateErr) {
                    console.error('Error updating user history after removal:', updateErr.message);
                    return res.status(500).json({ message: 'Failed to remove product from cart.' });
                }
                res.status(200).json({ message: 'Product removed from cart successfully!', cart: history });
            });
        });
    });

    return router;
};