// ═══════════════════════════════════════════════════════════
// VenueVerse — Admin: Hall Owner Management Routes
// File: lgv-backend/src/routes/admin_hallowner.js
// Mount in server.js as: app.use('/api/admin', require('./src/routes/admin_hallowner'));
// ═══════════════════════════════════════════════════════════

const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const bcrypt  = require('bcryptjs');

// ── MIDDLEWARE: Admin Only ──
const adminOnly = require('../middleware/adminOnly');
router.use(adminOnly);

// ══════════════════════════════════════════
// HALL OWNERS CRUD
// ══════════════════════════════════════════

// GET /api/admin/hall-owners — list all
router.get('/hall-owners', async (req, res) => {
    try {
        const [owners] = await db.query(`
            SELECT TOP 1000 ho.id,ho.full_name,ho.username,ho.email,ho.phone,ho.business_name,ho.is_active,ho.created_at,
                   s.plan_name, s.end_date as sub_end, s.status as sub_status,
                   DATEDIFF(DAY,CAST(GETDATE() AS DATE),s.end_date) as days_remaining,
                   (SELECT COUNT(*) FROM hall_owner_venues WHERE hall_owner_id=ho.id) as venue_count
            FROM hall_owners ho
            LEFT JOIN hall_owner_subscriptions s ON s.hall_owner_id = ho.id
                AND s.id = (SELECT TOP 1 id FROM hall_owner_subscriptions WHERE hall_owner_id=ho.id ORDER BY end_date DESC)
            ORDER BY ho.created_at DESC
        `);
        res.json(owners);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/hall-owners — create new hall owner
router.post('/hall-owners', async (req, res) => {
    try {
        const { full_name, email, username, password, phone, business_name } = req.body;
        if (!full_name || !email || !username || !password)
            return res.status(400).json({ error: 'full_name, email, username, password are required' });

        const hash = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            `INSERT INTO hall_owners (full_name, email, username, password_hash, phone, business_name, created_by)
             VALUES (?,?,?,?,?,?,?)`,
            [full_name, email, username, hash, phone || null, business_name || null, req.user?.id || null]
        );
        res.json({ message: 'Hall owner created', id: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email or username already exists' });
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/hall-owners/:id — update (name, phone, business_name, is_active)
router.put('/hall-owners/:id', async (req, res) => {
    try {
        const { full_name, phone, business_name, is_active, password } = req.body;
        let query = `UPDATE hall_owners SET full_name=?, phone=?, business_name=?, is_active=? WHERE id=?`;
        let params = [full_name, phone, business_name, is_active, req.params.id];

        if (password && password.trim()) {
            const hash = await bcrypt.hash(password, 10);
            query = `UPDATE hall_owners SET full_name=?, phone=?, business_name=?, is_active=?, password_hash=? WHERE id=?`;
            params = [full_name, phone, business_name, is_active, hash, req.params.id];
        }

        await db.query(query, params);
        res.json({ message: 'Hall owner updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/hall-owners/:id
router.delete('/hall-owners/:id', async (req, res) => {
    try {
        await db.query(`DELETE FROM hall_owners WHERE id=?`, [req.params.id]);
        res.json({ message: 'Hall owner deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ══════════════════════════════════════════
// VENUE ASSIGNMENT
// ══════════════════════════════════════════

// GET /api/admin/hall-owners/:id/venues
router.get('/hall-owners/:id/venues', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT v.id, v.name, v.location, hov.assigned_at
            FROM hall_owner_venues hov
            INNER JOIN venues v ON v.id = hov.venue_id
            WHERE hov.hall_owner_id=?`,
            [req.params.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/hall-owners/:id/venues — assign a venue
router.post('/hall-owners/:id/venues', async (req, res) => {
    try {
        const { venue_id } = req.body;
        await db.query(
            `INSERT INTO hall_owner_venues (hall_owner_id, venue_id, assigned_by) VALUES (?,?,?)`,
            [req.params.id, venue_id, req.user?.id || null]
        );
        res.json({ message: 'Venue assigned' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/hall-owners/:id/venues/:venueId
router.delete('/hall-owners/:id/venues/:venueId', async (req, res) => {
    try {
        await db.query(
            `DELETE FROM hall_owner_venues WHERE hall_owner_id=? AND venue_id=?`,
            [req.params.id, req.params.venueId]
        );
        res.json({ message: 'Venue unassigned' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ══════════════════════════════════════════
// SUBSCRIPTIONS
// ══════════════════════════════════════════

// GET /api/admin/hall-owners/:id/subscriptions
router.get('/hall-owners/:id/subscriptions', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT *, DATEDIFF(end_date, CURDATE()) as days_remaining
             FROM hall_owner_subscriptions WHERE hall_owner_id=? ORDER BY created_at DESC`,
            [req.params.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/hall-owners/:id/subscriptions — add subscription / record payment
router.post('/hall-owners/:id/subscriptions', async (req, res) => {
    try {
        const { plan_name, amount_paid, currency, payment_method, payment_ref, start_date, end_date, notes } = req.body;
        const [result] = await db.query(
            `INSERT INTO hall_owner_subscriptions
             (hall_owner_id, plan_name, amount_paid, currency, payment_method, payment_ref, start_date, end_date, status, notes)
             VALUES (?,?,?,?,?,?,?,?,'active',?)`,
            [req.params.id, plan_name||'Basic', amount_paid, currency||'PKR',
             payment_method, payment_ref, start_date, end_date, notes||null]
        );
        res.json({ message: 'Subscription added', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/subscriptions/revenue — total revenue summary
router.get('/subscriptions/revenue', async (req, res) => {
    try {
        const [[total]] = await db.query(
            `SELECT COALESCE(SUM(amount_paid),0) as total_revenue,
             COUNT(*) as total_subscriptions,
             SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as active_count
             FROM hall_owner_subscriptions`
        );
        const [byPlan] = await db.query(
            `SELECT plan_name, SUM(amount_paid) as revenue, COUNT(*) as count
             FROM hall_owner_subscriptions GROUP BY plan_name`
        );
        res.json({ ...total, by_plan: byPlan });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ══════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════

// GET /api/admin/notifications
router.get('/notifications', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT TOP 100 n.*, ho.full_name as owner_name, ho.business_name, v.name as venue_name
            FROM admin_notifications n
            LEFT JOIN hall_owners ho ON ho.id = n.hall_owner_id
            LEFT JOIN venues v       ON v.id  = n.venue_id
            ORDER BY n.created_at DESC
        `);
        const [[{ unread }]] = await db.query(`SELECT COUNT(*) as unread FROM admin_notifications WHERE is_read=0`);
        res.json({ notifications: rows, unread_count: unread });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/notifications/mark-all-read
router.put('/notifications/mark-all-read', async (req, res) => {
    try {
        await db.query(`UPDATE admin_notifications SET is_read=1`);
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/notifications/:id
router.delete('/notifications/:id', async (req, res) => {
    try {
        await db.query(`DELETE FROM admin_notifications WHERE id=?`, [req.params.id]);
        res.json({ message: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;