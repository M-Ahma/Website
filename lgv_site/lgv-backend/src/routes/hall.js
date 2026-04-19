const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

// ── 1. GET ALL BLOCKED DATES ──
router.get('/booked-dates', async (req, res) => {
    try {
        const [bookingRows] = await db.query(
            `SELECT DATE_FORMAT(wedding_date, '%Y-%m-%d') AS date
             FROM bookings
             WHERE status IN ('confirmed','pending') AND wedding_date IS NOT NULL`
        );
        let manualRows = [];
        try {
            [manualRows] = await db.query(`SELECT date FROM hall_blocked_dates WHERE blocked = 1`);
        } catch(e) {}

        const allDates = [...new Set([
            ...bookingRows.map(r => r.date),
            ...manualRows.map(r => new Date(r.date).toISOString().split('T')[0])
        ])].filter(Boolean).sort();

        res.json({ bookedDates: allDates });
    } catch (error) {
        console.error('Hall booked-dates error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ── 2. CHECK SINGLE DATE ──
router.get('/check/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const [bookingRows] = await db.query(
            `SELECT id FROM bookings WHERE DATE(wedding_date) = ? AND status IN ('confirmed','pending') LIMIT 1`,
            [date]
        );
        let manualRows = [];
        try { [manualRows] = await db.query(`SELECT blocked FROM hall_blocked_dates WHERE date = ? LIMIT 1`, [date]); } catch(e) {}

        const isBooked  = bookingRows.length > 0;
        const isBlocked = manualRows.length > 0 && manualRows[0].blocked == 1;
        res.json({ date, available: !isBooked && !isBlocked });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── 3. ADMIN: SET DATE BLOCKED/AVAILABLE ──
router.post('/admin/set-date', async (req, res) => {
    try {
        const { date, blocked } = req.body;
        if (!date) return res.status(400).json({ error: 'date is required' });
        await db.query(
            `INSERT INTO hall_blocked_dates (date, blocked, updated_at) VALUES (?, ?, NOW())
             ON DUPLICATE KEY UPDATE blocked = VALUES(blocked), updated_at = NOW()`,
            [date, blocked ? 1 : 0]
        );
        res.json({ message: `Date ${date} marked as ${blocked ? 'BOOKED' : 'AVAILABLE'}`, date, blocked });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── 4. ADMIN: BULK UPDATE ──
router.post('/admin/bulk-update', async (req, res) => {
    try {
        const { dates } = req.body;
        if (!Array.isArray(dates)) return res.status(400).json({ error: 'dates must be array' });
        try { await db.query(`DELETE FROM hall_blocked_dates`); } catch(e) {}
        if (dates.length > 0) {
            await db.query(`INSERT INTO hall_blocked_dates (date, blocked) VALUES ?`, [dates.map(d => [d, 1])]);
        }
        res.json({ message: 'Updated', count: dates.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/test', (req, res) => res.json({ message: 'Hall route active' }));
module.exports = router;
