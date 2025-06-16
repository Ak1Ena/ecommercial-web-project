const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path')
const bcrypt = require('bcrypt');
const db = new sqlite3.Database('../data/users.db');
const productDB = new sqlite3.Database('../data/products.db');

const saltRounds = 10;

db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      history TEXT,
      cart TEXT
    )
  `)
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], async (err, user) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
                // อย่าใส่ password กลับไป
            }
        });
    });
});

router.post('/register', async(req, res) => {
    const { FirstName, LastName, Email, PhoneNumber, Address, Password } = req.body;

    if (!FirstName || !LastName || !Email || !PhoneNumber || !Address || !Password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    const sql = `INSERT INTO users (email, password, firstName, lastName, phone, address) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [Email, hashedPassword, FirstName, LastName, PhoneNumber, Address], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(201).json({ message: 'User registered successfully', id: this.lastID });
    });
});
router.post('/cart/update', (req, res) => {
    const { id, cart } = req.body;

    if (!id || !cart) {
        return res.status(400).json({ error: 'Missing id or cart data' });
    }

    // แปลง cart เป็น JSON string เพื่อเก็บใน DB
    const cartJSON = JSON.stringify(cart);

    const sql = 'UPDATE users SET cart = ? WHERE id = ?';
    db.run(sql, [cartJSON, id], function(err) {
        if (err) {
            console.error('Failed to update cart:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // ตรวจสอบว่ามีแถวถูกอัปเดตไหม
        if (this.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, message: 'Cart updated successfully' });
    });
});

router.post('/cart/clear', (req, res) => {
    const { id } = req.body;
    const sql = `UPDATE users SET cart = ? WHERE id = ?`;
    const emptyCart = JSON.stringify([]);
    db.run(sql, [emptyCart, id], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to clear cart' });
        }
        res.json({ message: 'Cart cleared' });
    });
});
router.post('/cart/get', (req,res)=>{
    const { id } = req.body;
    const sql = 'SELECT cart FROM users WHERE id = ?'
    db.get(sql,[id], (err, user)=>{
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
         if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // แปลง string เป็น object ก่อนส่ง
        let cartData;
        try {
            cartData = JSON.parse(user.cart);
        } catch (e) {
            return res.status(500).json({ error: 'Invalid cart JSON format' });
        }

        res.status(200).json({
            message: 'Cart retrieved successfully',
            cart: cartData // ส่งไป frontend ในรูปแบบ object/array
        });
    })
})

router.post('/checkout', (req, res) => {
    const { products, id } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'Invalid or empty products array' });
    }

    if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    db.get(`SELECT history FROM users WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Internal Server Error' });
        if (!row) return res.status(404).json({ error: 'User not found' });

        let history = row.history ? JSON.parse(row.history) : [];
        history.push(...products);

        db.run(`UPDATE users SET history = ? WHERE id = ?`, [JSON.stringify(history), id], (err) => {
            if (err) return res.status(500).json({ error: 'Failed to update user history' });

            // เริ่มลดสต็อก
            let updatedCount = 0;
            let failed = false;

            products.forEach((product, index) => {
                const productId = product.productId || product.id;
                const qtyToReduce = product.quantity;
                console.log(`Product being processed:`, product);
                productDB.get(`SELECT quantity FROM products WHERE id = ?`, [productId], (err, row) => {
                    if (failed) return;
                    if (err || !row) {
                        failed = true;
                        return res.status(400).json({ error: `Product with ID ${productId} not found` });
                    }

                    const newQty = row.quantity - qtyToReduce;
                    if (newQty < 0) {
                        failed = true;
                        return res.status(400).json({ error: `Insufficient stock for product ID ${productId}` });
                    }

                    productDB.run(`UPDATE products SET quantity = ? WHERE id = ?`, [newQty, productId], (err) => {
                        if (err) {
                            failed = true;
                            return res.status(500).json({ error: `Failed to update product ID ${productId}` });
                        }

                        updatedCount++;

                        // ตรวจสอบว่าอัปเดตครบทุกชิ้น
                        if (updatedCount === products.length && !failed) {
                            res.json({ message: 'Checkout successful', updatedCount });
                        }
                    });
                });
            });
        });
    });
});


module.exports = router;