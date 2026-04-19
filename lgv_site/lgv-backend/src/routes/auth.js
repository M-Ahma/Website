const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../config/db');

// 1. REGISTER
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ message: 'Name, email and password are required.' });

        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0)
            return res.status(400).json({ message: 'Email already registered. Please login.' });

        const hash = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, hash, 'client']
        );

        const [newUser] = await db.query('SELECT id, full_name, email, role FROM users WHERE email = ?', [email]);
        const user = newUser[0];
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

        res.status(201).json({
            message: 'Account created successfully!',
            token,
            user: { id: user.id, name: user.full_name, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: err.message });
    }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password are required.' });

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0)
            return res.status(400).json({ message: 'Invalid email or password.' });

        const user = users[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match)
            return res.status(400).json({ message: 'Invalid email or password.' });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.full_name, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message });
    }
});

// 3. GET ALL USERS (admin clients tab)
router.get('/users', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, full_name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. DELETE USER
router.delete('/users/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. GET PROFILE
router.get('/profile/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ?',
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ message: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. UPDATE PROFILE
router.put('/profile/:id', async (req, res) => {
    try {
        const { full_name, phone } = req.body;
        await db.query('UPDATE users SET full_name = ?, phone = ? WHERE id = ?', [full_name, phone || null, req.params.id]);
        res.json({ message: 'Profile updated!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
