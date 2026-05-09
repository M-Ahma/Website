// ═══════════════════════════════════════════════════════════
// VenueVerse — Hall Owner Routes
// File: lgv-backend/src/routes/hallowner.js
// ═══════════════════════════════════════════════════════════

const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'venueverse_secret_2025';

// ── MIDDLEWARE: Verify Hall Owner Token ──
function authHallOwner(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'No token provided' });
    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'hallowner') return res.status(403).json({ error: 'Access denied' });
        req.hallOwner = decoded;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// ══════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════

// POST /api/hallowner/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

        const [rows] = await db.query(
            `SELECT * FROM hall_owners WHERE (username=? OR email=?) AND is_active=1`,
            [username, username]
        );
        if (!rows.length) return res.status(401).json({ error: 'Invalid credentials or account disabled' });

        const owner = rows[0];
        const match = await bcrypt.compare(password, owner.password_hash);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });

        // Update last login
        await db.query(`UPDATE hall_owners SET last_login=GETDATE() WHERE id=?`, [owner.id]);

        const token = jwt.sign(
            { id: owner.id, username: owner.username, role: 'hallowner', business_name: owner.business_name },
            JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.json({
            token,
            owner: {
                id: owner.id,
                full_name: owner.full_name,
                username: owner.username,
                email: owner.email,
                business_name: owner.business_name
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ══════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════

// GET /api/hallowner/dashboard
router.get('/dashboard', authHallOwner, async (req, res) => {
    try {
        const ownerId = req.hallOwner.id;

        // Get owned venues
        const [venues] = await db.query(
            `SELECT v.id, v.name, v.location, v.capacity, v.price, v.image_url, v.badge
             FROM venues v
             INNER JOIN hall_owner_venues hov ON v.id = hov.venue_id
             WHERE hov.hall_owner_id = ?`,
            [ownerId]
        );

        // Booking counts per venue
        const venueIds = venues.map(v => v.id);
        let bookingStats = {};
        if (venueIds.length > 0) {
            const placeholders = venueIds.map(() => '?').join(',');
            const [bStats] = await db.query(
                `SELECT venue_id, COUNT(*) as total,
                 SUM(CASE WHEN status='confirmed' THEN 1 ELSE 0 END) as confirmed,
                 SUM(CASE WHEN status='pending'   THEN 1 ELSE 0 END) as pending
                 FROM bookings WHERE venue_id IN (${placeholders}) GROUP BY venue_id`,
                venueIds
            );
            bStats.forEach(s => { bookingStats[s.venue_id] = s; });
        }

        // Subscription info
        const [subs] = await db.query(
            `SELECT TOP 1 plan_name, start_date, end_date, status,
             DATEDIFF(DAY, CAST(GETDATE() AS DATE), end_date) as days_remaining
             FROM hall_owner_subscriptions
             WHERE hall_owner_id=? ORDER BY end_date DESC`,
            [ownerId]
        );

        res.json({
            venues: venues.map(v => ({ ...v, bookings: bookingStats[v.id] || { total: 0, confirmed: 0, pending: 0 } })),
            subscription: subs[0] || null
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ══════════════════════════════════════════
// VENUE DETAILS
// ══════════════════════════════════════════

// GET /api/hallowner/venue/:venueId/details
router.get('/venue/:venueId/details', authHallOwner, async (req, res) => {
    try {
        const { venueId } = req.params;
        if (!await ownsVenue(req.hallOwner.id, venueId)) return res.status(403).json({ error: 'Access denied' });

        const [base]    = await db.query(`SELECT * FROM venues WHERE id=?`, [venueId]);
        const [details] = await db.query(`SELECT * FROM venue_details WHERE venue_id=?`, [venueId]);
        const [images]  = await db.query(`SELECT * FROM venue_images WHERE venue_id=? ORDER BY sort_order, id`, [venueId]);

        res.json({
            base:    base[0]    || null,
            details: details[0] || null,
            images
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/hallowner/venue/:venueId/details — update venue details
router.put('/venue/:venueId/details', authHallOwner, async (req, res) => {
    try {
        const { venueId } = req.params;
        if (!await ownsVenue(req.hallOwner.id, venueId)) return res.status(403).json({ error: 'Access denied' });

        const {
            // Base venue fields
            name, location, description, capacity, price,
            // Detail fields
            capacity_seated, capacity_standing, price_per_head, price_flat, min_booking_amount,
            has_ac, has_parking, has_catering, has_decoration, has_photography,
            has_sound_system, has_generator, has_bridal_room, has_stage, has_valet,
            catering_info, parking_capacity, hall_size_sqft, no_of_halls,
            address_full, google_maps_link, contact_phone, contact_whatsapp, website_url,
            advance_booking_days, cancellation_policy, special_notes
        } = req.body;

        // Update base venue
        await db.query(
            `UPDATE venues SET name=?, location=?, description=?, capacity=?, price=? WHERE id=?`,
            [name, location, description, capacity, price, venueId]
        );

        // Upsert venue_details
        const [existing] = await db.query(`SELECT id FROM venue_details WHERE venue_id=?`, [venueId]);
        if (existing.length) {
            await db.query(
                `UPDATE venue_details SET
                 capacity_seated=?, capacity_standing=?, price_per_head=?, price_flat=?, min_booking_amount=?,
                 has_ac=?, has_parking=?, has_catering=?, has_decoration=?, has_photography=?,
                 has_sound_system=?, has_generator=?, has_bridal_room=?, has_stage=?, has_valet=?,
                 catering_info=?, parking_capacity=?, hall_size_sqft=?, no_of_halls=?,
                 address_full=?, google_maps_link=?, contact_phone=?, contact_whatsapp=?, website_url=?,
                 advance_booking_days=?, cancellation_policy=?, special_notes=?, last_updated=GETDATE()
                 WHERE venue_id=?`,
                [capacity_seated, capacity_standing, price_per_head, price_flat, min_booking_amount,
                 has_ac, has_parking, has_catering, has_decoration, has_photography,
                 has_sound_system, has_generator, has_bridal_room, has_stage, has_valet,
                 catering_info, parking_capacity, hall_size_sqft, no_of_halls,
                 address_full, google_maps_link, contact_phone, contact_whatsapp, website_url,
                 advance_booking_days, cancellation_policy, special_notes, venueId]
            );
        } else {
            await db.query(
                `INSERT INTO venue_details
                 (venue_id, capacity_seated, capacity_standing, price_per_head, price_flat, min_booking_amount,
                  has_ac, has_parking, has_catering, has_decoration, has_photography,
                  has_sound_system, has_generator, has_bridal_room, has_stage, has_valet,
                  catering_info, parking_capacity, hall_size_sqft, no_of_halls,
                  address_full, google_maps_link, contact_phone, contact_whatsapp, website_url,
                  advance_booking_days, cancellation_policy, special_notes)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [venueId, capacity_seated, capacity_standing, price_per_head, price_flat, min_booking_amount,
                 has_ac, has_parking, has_catering, has_decoration, has_photography,
                 has_sound_system, has_generator, has_bridal_room, has_stage, has_valet,
                 catering_info, parking_capacity, hall_size_sqft, no_of_halls,
                 address_full, google_maps_link, contact_phone, contact_whatsapp, website_url,
                 advance_booking_days, cancellation_policy, special_notes]
            );
        }

        // Notify admin
        await notifyAdmin(req.hallOwner.id, venueId, 'details_updated',
            `Hall owner "${req.hallOwner.business_name}" updated venue details for venue ID ${venueId}`);

        res.json({ message: 'Venue details updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ══════════════════════════════════════════
// IMAGES
// ══════════════════════════════════════════

// POST /api/hallowner/venue/:venueId/images — add image URL
router.post('/venue/:venueId/images', authHallOwner, async (req, res) => {
    try {
        const { venueId } = req.params;
        if (!await ownsVenue(req.hallOwner.id, venueId)) return res.status(403).json({ error: 'Access denied' });

        const { image_url, caption, is_primary } = req.body;
        if (!image_url) return res.status(400).json({ error: 'image_url is required' });

        // If setting as primary, unset others
        if (is_primary) {
            await db.query(`UPDATE venue_images SET is_primary=0 WHERE venue_id=?`, [venueId]);
        }

        const [result] = await db.query(
            `INSERT INTO venue_images (venue_id, image_url, caption, is_primary) VALUES (?,?,?,?)`,
            [venueId, image_url, caption || '', is_primary ? 1 : 0]
        );

        // If this is the first/primary image, update the main venues table too
        if (is_primary) {
            await db.query(`UPDATE venues SET image_url=? WHERE id=?`, [image_url, venueId]);
        }

        await notifyAdmin(req.hallOwner.id, venueId, 'images_added',
            `Hall owner "${req.hallOwner.business_name}" added a new photo to venue ID ${venueId}`);

        res.json({ message: 'Image added', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/hallowner/venue/:venueId/images/:imageId
router.delete('/venue/:venueId/images/:imageId', authHallOwner, async (req, res) => {
    try {
        const { venueId, imageId } = req.params;
        if (!await ownsVenue(req.hallOwner.id, venueId)) return res.status(403).json({ error: 'Access denied' });

        await db.query(`DELETE FROM venue_images WHERE id=? AND venue_id=?`, [imageId, venueId]);

        await notifyAdmin(req.hallOwner.id, venueId, 'image_deleted',
            `Hall owner "${req.hallOwner.business_name}" deleted a photo from venue ID ${venueId}`);

        res.json({ message: 'Image deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/hallowner/venue/:venueId/images/:imageId/set-primary
router.put('/venue/:venueId/images/:imageId/set-primary', authHallOwner, async (req, res) => {
    try {
        const { venueId, imageId } = req.params;
        if (!await ownsVenue(req.hallOwner.id, venueId)) return res.status(403).json({ error: 'Access denied' });

        await db.query(`UPDATE venue_images SET is_primary=0 WHERE venue_id=?`, [venueId]);
        await db.query(`UPDATE venue_images SET is_primary=1 WHERE id=? AND venue_id=?`, [imageId, venueId]);

        const [img] = await db.query(`SELECT image_url FROM venue_images WHERE id=?`, [imageId]);
        if (img.length) await db.query(`UPDATE venues SET image_url=? WHERE id=?`, [img[0].image_url, venueId]);

        res.json({ message: 'Primary image updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ══════════════════════════════════════════
// HEATMAP (Availability Calendar)
// ══════════════════════════════════════════

// GET /api/hallowner/venue/:venueId/heatmap
router.get('/venue/:venueId/heatmap', authHallOwner, async (req, res) => {
    try {
        const { venueId } = req.params;
        if (!await ownsVenue(req.hallOwner.id, venueId)) return res.status(403).json({ error: 'Access denied' });

        const [blocked] = await db.query(
            `SELECT CONVERT(varchar,blocked_date,23) as date, reason FROM venue_heatmap WHERE venue_id=?`,
            [venueId]
        );

        // Also get booking dates for this venue
        const [bookings] = await db.query(
            `SELECT CONVERT(varchar,wedding_date,23) as date FROM bookings
             WHERE venue_id=? AND status IN ('confirmed','pending') AND wedding_date IS NOT NULL`,
            [venueId]
        );

        res.json({ blockedDates: blocked, bookingDates: bookings.map(b => b.date) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/hallowner/venue/:venueId/heatmap/bulk — set all blocked dates at once
router.post('/venue/:venueId/heatmap/bulk', authHallOwner, async (req, res) => {
    try {
        const { venueId } = req.params;
        if (!await ownsVenue(req.hallOwner.id, venueId)) return res.status(403).json({ error: 'Access denied' });

        const { dates } = req.body; // array of { date: 'YYYY-MM-DD', reason: 'Booked' }
        if (!Array.isArray(dates)) return res.status(400).json({ error: 'dates must be an array' });

        // Delete old manual blocks for this venue (keep booking-based ones separate)
        await db.query(`DELETE FROM venue_heatmap WHERE venue_id=?`, [venueId]);

        if (dates.length > 0) {
            // SQL Server doesn't support bulk VALUES ?, insert one by one
            for (const d of dates) {
                await db.query(
                    `INSERT INTO venue_heatmap (venue_id, blocked_date, reason, blocked_by) VALUES (?,?,?,?)`,
                    [venueId, d.date, d.reason || 'Booked', req.hallOwner.id]
                );
            }
        }

        await notifyAdmin(req.hallOwner.id, venueId, 'heatmap_changed',
            `Hall owner "${req.hallOwner.business_name}" updated the availability calendar for venue ID ${venueId} — ${dates.length} dates blocked`);

        res.json({ message: 'Heatmap updated', blocked_count: dates.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ══════════════════════════════════════════
// BOOKINGS (view only — hall owner cannot modify)
// ══════════════════════════════════════════

// GET /api/hallowner/venue/:venueId/bookings
router.get('/venue/:venueId/bookings', authHallOwner, async (req, res) => {
    try {
        const { venueId } = req.params;
        if (!await ownsVenue(req.hallOwner.id, venueId)) return res.status(403).json({ error: 'Access denied' });

        const [bookings] = await db.query(
            `SELECT id, booking_ref, client_name, client_phone,
             CONVERT(varchar,wedding_date,23) as wedding_date,
             guest_count, grand_total, status, created_at
             FROM bookings WHERE venue_id=? ORDER BY wedding_date DESC`,
            [venueId]
        );

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ══════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════

async function ownsVenue(ownerId, venueId) {
    const [rows] = await db.query(
        `SELECT 1 FROM hall_owner_venues WHERE hall_owner_id=? AND venue_id=?`,
        [ownerId, venueId]
    );
    return rows.length > 0;
}

async function notifyAdmin(hallOwnerId, venueId, actionType, actionDetail) {
    try {
        await db.query(
            `INSERT INTO admin_notifications (hall_owner_id, venue_id, action_type, action_detail)
             VALUES (?,?,?,?)`,
            [hallOwnerId, venueId, actionType, actionDetail]
        );
    } catch (e) {
        console.error('Notification insert failed:', e.message);
    }
}

module.exports = router;