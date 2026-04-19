const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { sendBookingConfirmation, sendStatusUpdate } = require('../utils/sendEmail');

// ── 1. GET ALL BOOKINGS (Admin Dashboard) ──
router.get('/', async (req, res) => {
    try {
        const [results] = await db.query(
            `SELECT id, booking_ref, user_id, venue_id, client_name, client_email, 
             client_phone, wedding_date, guest_count, venue_price, grand_total, 
             notes, status, created_at 
             FROM bookings ORDER BY id DESC`
        );
        res.json(results);
    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ── 2. CREATE A NEW BOOKING ──
router.post('/create', async (req, res) => {
    try {
        const {
            user_id, venue_id, client_name, client_email, client_phone,
            wedding_date, guest_count, venue_price, grand_total, notes
        } = req.body;

        if (!client_name || !client_email) {
            return res.status(400).json({ error: 'Client name and email are required.' });
        }

        const booking_ref = 'BK-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-6);

        const [result] = await db.query(
            `INSERT INTO bookings 
             (booking_ref, user_id, venue_id, client_name, client_email, client_phone,
              wedding_date, guest_count, venue_price, grand_total, notes, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [booking_ref, user_id || null, venue_id || null, client_name, client_email,
             client_phone || null, wedding_date || null, guest_count || 0,
             venue_price || 0, grand_total || 0, notes || null]
        );

        // Send confirmation email (non-blocking)
        sendBookingConfirmation({
            booking_ref, client_name, client_email,
            wedding_date, guest_count
        }).catch(err => console.error('Email error:', err));

        res.status(201).json({
            message: 'Booking request submitted successfully!',
            bookingReference: booking_ref,
            bookingId: result.insertId
        });

    } catch (error) {
        console.error('Create Booking Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ── 3. UPDATE BOOKING STATUS (Admin) ──
router.patch('/:id/status', async (req, res) => {
    try {
        const { id }     = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Use: pending, confirmed, cancelled' });
        }

        // Get booking details for email
        const [bookings] = await db.query('SELECT * FROM bookings WHERE id = ?', [id]);
        if (!bookings.length) return res.status(404).json({ error: 'Booking not found' });

        await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

        // Send status update email
        sendStatusUpdate(bookings[0], status).catch(err => console.error('Email error:', err));

        res.json({ message: `Booking status updated to ${status}`, booking_ref: bookings[0].booking_ref });

    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ── 4. GET BOOKED DATES FOR A VENUE (Availability Calendar) ──
router.get('/availability/:venue_id', async (req, res) => {
    try {
        const { venue_id } = req.params;
        const [results] = await db.query(
            `SELECT wedding_date, status FROM bookings 
             WHERE venue_id = ? AND status != 'cancelled' AND wedding_date IS NOT NULL
             ORDER BY wedding_date ASC`,
            [venue_id]
        );
        const bookedDates = results.map(r => ({
            date:   r.wedding_date ? r.wedding_date.toISOString().split('T')[0] : null,
            status: r.status
        }));
        res.json(bookedDates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── 5. GET ALL BOOKED DATES (for general calendar) ──
router.get('/booked-dates', async (req, res) => {
    try {
        const [results] = await db.query(
            `SELECT wedding_date, status, venue_id FROM bookings 
             WHERE status != 'cancelled' AND wedding_date IS NOT NULL`
        );
        res.json(results.map(r => ({
            date:     r.wedding_date ? r.wedding_date.toISOString().split('T')[0] : null,
            status:   r.status,
            venue_id: r.venue_id
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── 6. DELETE A BOOKING ──
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM bookings WHERE id = ?', [id]);
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
