const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

// ── DASHBOARD STATS ──
router.get('/stats', async (req, res) => {
    try {
        const [[{ total }]]    = await db.query(`SELECT COUNT(*) as total FROM bookings`);
        const [[{ revenue }]]  = await db.query(`SELECT COALESCE(SUM(grand_total),0) as revenue FROM bookings WHERE status='confirmed'`);
        const [[{ pending }]]  = await db.query(`SELECT COUNT(*) as pending FROM bookings WHERE status='pending'`);
        const [[{ venues }]]   = await db.query(`SELECT COUNT(*) as venues FROM venues`).catch(() => [[{ venues: 12 }]]);
        res.json({ totalBookings: total, totalRevenue: revenue, pendingBookings: pending, activeVenues: venues });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── ALL BOOKINGS ──
router.get('/bookings', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT id, booking_ref, client_name, client_email, venue_id,
             DATE_FORMAT(wedding_date,'%Y-%m-%d') as wedding_date,
             guest_count, grand_total, status, created_at
             FROM bookings ORDER BY id DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── UPDATE BOOKING STATUS ──
router.patch('/bookings/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending','confirmed','cancelled'].includes(status))
            return res.status(400).json({ error: 'Invalid status' });
        await db.query(`UPDATE bookings SET status=? WHERE id=?`, [status, req.params.id]);
        res.json({ message: 'Status updated', status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── DELETE BOOKING ──
router.delete('/bookings/:id', async (req, res) => {
    try {
        await db.query(`DELETE FROM bookings WHERE id=?`, [req.params.id]);
        res.json({ message: 'Booking deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET ALL BLOCKED DATES ──
router.get('/blocked-dates', async (req, res) => {
    try {
        let manualDates = [];
        try {
            const [rows] = await db.query(`SELECT DATE_FORMAT(date,'%Y-%m-%d') as date FROM hall_blocked_dates WHERE blocked=1 ORDER BY date`);
            manualDates = rows.map(r => r.date);
        } catch(e) {}

        const [bookingRows] = await db.query(
            `SELECT DATE_FORMAT(wedding_date,'%Y-%m-%d') as date FROM bookings
             WHERE status IN ('confirmed','pending') AND wedding_date IS NOT NULL`
        );

        const all = [...new Set([...manualDates, ...bookingRows.map(r => r.date)])].filter(Boolean).sort();
        res.json({ bookedDates: all, manualDates, bookingDates: bookingRows.map(r => r.date) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── ADMIN: TOGGLE / BULK SET BLOCKED DATES ──
router.post('/blocked-dates/bulk', async (req, res) => {
    try {
        const { dates } = req.body; // array of YYYY-MM-DD that should be BLOCKED
        if (!Array.isArray(dates)) return res.status(400).json({ error: 'dates must be array' });

        // Ensure table exists
        await db.query(`
            CREATE TABLE IF NOT EXISTS hall_blocked_dates (
                date DATE PRIMARY KEY,
                blocked TINYINT(1) DEFAULT 1,
                updated_at DATETIME DEFAULT NOW()
            )
        `).catch(() => {});

        await db.query(`DELETE FROM hall_blocked_dates`);
        if (dates.length > 0) {
            await db.query(`INSERT INTO hall_blocked_dates (date, blocked) VALUES ?`, [dates.map(d => [d, 1])]);
        }
        res.json({ message: 'Blocked dates saved', count: dates.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/test', (req, res) => res.json({ message: 'Admin route active' }));
module.exports = router;
