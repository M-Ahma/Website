const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

// GET all active venues — uses actual DB column names (capacity, not max_guests)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM venues ORDER BY id ASC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// GET all venues — for admin panel
router.get('/all', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM venues ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// POST — add a new venue
router.post('/', async (req, res) => {
  try {
    const { name, location, region, capacity, price, description, image_url, badge } = req.body;
    if (!name) return res.status(400).json({ error: 'Venue name is required' });
    const [result] = await db.query(
      `INSERT INTO venues (name, location, region, capacity, price, description, image_url, badge)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, location || '', region || '', capacity || 500, price || 0, description || '', image_url || '', badge || '']
    );
    res.status(201).json({ message: 'Venue added successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// DELETE — remove a venue
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM venues WHERE id = ?', [req.params.id]);
    res.json({ message: 'Venue deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

module.exports = router;
