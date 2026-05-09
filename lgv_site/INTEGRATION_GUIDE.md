# ═══════════════════════════════════════════════════════════
# VenueVerse — Hall Owner System: Integration Guide
# ═══════════════════════════════════════════════════════════

## FILES TO ADD TO YOUR PROJECT

1. hallowner_tables.sql        → Run in SQL Server (adds 6 new tables)
2. hallowner.js                → Copy to: lgv-backend/src/routes/hallowner.js
3. admin_hallowner.js          → Copy to: lgv-backend/src/routes/admin_hallowner.js
4. hallowner_portal.html       → Copy to: lgv_site/ (same folder as admin.html)

---

## STEP 1 — Run the new SQL tables

Open SQL Server Management Studio (SSMS) and run:
   hallowner_tables.sql

This creates these 6 new tables:
  - hall_owners
  - hall_owner_subscriptions
  - hall_owner_venues
  - venue_details
  - venue_images
  - venue_heatmap
  - admin_notifications

---

## STEP 2 — Add routes to server.js

Open lgv-backend/server.js and add these 2 lines
inside the try block where your other routes are:

    app.use('/api/hallowner', require('./src/routes/hallowner'));
    app.use('/api/admin',     require('./src/routes/admin_hallowner'));

The full try block should look like this:

    try {
        app.use('/api/auth',      require('./src/routes/auth'));
        app.use('/api/venues',    require('./src/routes/venues'));
        app.use('/api/bookings',  require('./src/routes/bookings'));
        app.use('/api/contact',   require('./src/routes/contact'));
        app.use('/api/hall',      require('./src/routes/hall'));
        app.use('/api/admin',     require('./src/routes/admin'));
        app.use('/api/hallowner', require('./src/routes/hallowner'));      // NEW
        app.use('/api/admin',     require('./src/routes/admin_hallowner')); // NEW
    } catch (err) {
        console.error('❌ ROUTE LOADING ERROR:', err.message);
    }

---

## STEP 3 — Add Hall Owner section to Admin Portal

In admin.html, add this to the sidebar nav:

    <li><a onclick="switchAdmin('aHallOwners')" id="anHallOwners">
        <span class="aicon">🏛️</span> Hall Owners
    </a></li>

And add a new panel for managing hall owners (create owners, assign venues,
record subscriptions, view notifications).

---

## STEP 4 — Add Hall Owner Portal link to your website

In index.html navigation, add:
    <a href="hallowner_portal.html">Hall Owner Login</a>

---

## HOW THE SYSTEM WORKS

### Admin Workflow:
1. Admin goes to Admin Portal → Hall Owners section
2. Creates a hall owner account (sets username + password)
3. Assigns one or more venues to that hall owner
4. Records subscription payment (plan, amount, dates)
5. Admin sees notifications whenever hall owner makes changes

### Hall Owner Workflow:
1. Hall owner opens hallowner_portal.html
2. Logs in with username/password given by admin
3. Dashboard shows their venues, booking counts, subscription status
4. Can update: Venue Details, Photos/Gallery, Availability Calendar
5. Every update automatically notifies admin

### User (Client) Workflow:
- Users see updated venue details, photos on browse.html / hall.html
- Availability calendar blocks dates the hall owner has marked

---

## DEFAULT TEST CREDENTIALS

Hall Owner:
  Username: pearl_owner
  Password: Owner@1234

Admin:
  Email: admin@smartvenue.com
  Password: Admin@1234

---

## API ENDPOINTS SUMMARY

Hall Owner (requires hall owner JWT token):
  POST   /api/hallowner/login
  GET    /api/hallowner/dashboard
  GET    /api/hallowner/venue/:id/details
  PUT    /api/hallowner/venue/:id/details
  POST   /api/hallowner/venue/:id/images
  DELETE /api/hallowner/venue/:id/images/:imgId
  PUT    /api/hallowner/venue/:id/images/:imgId/set-primary
  GET    /api/hallowner/venue/:id/heatmap
  POST   /api/hallowner/venue/:id/heatmap/bulk
  GET    /api/hallowner/venue/:id/bookings

Admin (requires admin JWT token):
  GET    /api/admin/hall-owners
  POST   /api/admin/hall-owners
  PUT    /api/admin/hall-owners/:id
  DELETE /api/admin/hall-owners/:id
  GET    /api/admin/hall-owners/:id/venues
  POST   /api/admin/hall-owners/:id/venues
  DELETE /api/admin/hall-owners/:id/venues/:venueId
  GET    /api/admin/hall-owners/:id/subscriptions
  POST   /api/admin/hall-owners/:id/subscriptions
  GET    /api/admin/subscriptions/revenue
  GET    /api/admin/notifications
  PUT    /api/admin/notifications/mark-all-read
  DELETE /api/admin/notifications/:id
