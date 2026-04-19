const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { sendContactAck } = require('../utils/sendEmail');

// POST — Save contact form message
// Only uses columns that exist: name, email, message
router.post('/', async (req, res) => {
    try {
        const { name, email, wedding_date, guest_count, region, budget, message } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required.' });
        }

        // Build a combined message if extra fields are provided
        let fullMessage = message || '';
        if (wedding_date) fullMessage += `\nWedding Date: ${wedding_date}`;
        if (guest_count)  fullMessage += `\nGuests: ${guest_count}`;
        if (region)       fullMessage += `\nRegion: ${region}`;
        if (budget)       fullMessage += `\nBudget: ${budget}`;

        // Insert only into columns that exist in the contacts table
        await db.query(
            `INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)`,
            [name, email, fullMessage.trim()]
        );

        // Send acknowledgement email (non-blocking — won't crash if email fails)
        sendContactAck({ name, email }).catch(err =>
            console.error('Contact email error (non-fatal):', err.message)
        );

        res.status(201).json({ message: 'Message sent successfully!' });

    } catch (error) {
        console.error('Contact Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET — Fetch all messages (for admin)
router.get('/', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM contacts ORDER BY created_at DESC');
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE — Remove a contact message
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM contacts WHERE id = ?', [req.params.id]);
        res.json({ message: 'Message deleted.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
