-- ═══════════════════════════════════════
-- Smart Venue — Complete Database Schema
-- Converted for SQL Server (T-SQL)
-- Database: lgv_db
-- ═══════════════════════════════════════

USE lgv_db;
GO

-- ── USERS ──
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
CREATE TABLE users (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    full_name     NVARCHAR(120) NOT NULL,
    email         NVARCHAR(180) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    phone         NVARCHAR(40),
    role          NVARCHAR(10) DEFAULT 'client' CHECK (role IN ('client','admin')),
    created_at    DATETIME DEFAULT GETDATE()
);
GO

-- Default admin user (password: Admin@1234)
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@smartvenue.com')
INSERT INTO users (full_name, email, password_hash, role)
VALUES ('Admin', 'admin@smartvenue.com',
'$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin');
GO

-- ── VENUES ──
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='venues' AND xtype='U')
CREATE TABLE venues (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    name         NVARCHAR(150) NOT NULL,
    location     NVARCHAR(150),
    region       NVARCHAR(100),
    max_guests   INT DEFAULT 200,
    price        DECIMAL(12,2) DEFAULT 0,
    description  NVARCHAR(MAX),
    image_url    NVARCHAR(500),
    badge        NVARCHAR(50),
    active       TINYINT DEFAULT 1,
    created_at   DATETIME DEFAULT GETDATE()
);
GO

-- ── VENUE SEED DATA (Pakistani Venues) ──
SET IDENTITY_INSERT venues ON;

IF NOT EXISTS (SELECT 1 FROM venues WHERE id=1)
INSERT INTO venues (id, name, location, region, max_guests, price, description, image_url, badge, active) VALUES
(1,  'Pearl Continental Banquet', 'Gulberg, Lahore',           'Gulberg',        1500, 6500,  'Premier luxury banquet hall in the heart of Gulberg with world-class facilities and dedicated event management.', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80', 'Luxury',     1);

IF NOT EXISTS (SELECT 1 FROM venues WHERE id=2)
INSERT INTO venues (id, name, location, region, max_guests, price, description, image_url, badge, active) VALUES
(2,  'Serena Hotel Banquet',      'DHA Phase 2, Lahore',       'DHA',             1400, 7000,  'World-class banquet in a five-star environment with stunning decor, premium catering, and professional staff.',    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80', 'Luxury',     1);

IF NOT EXISTS (SELECT 1 FROM venues WHERE id=3)
INSERT INTO venues (id, name, location, region, max_guests, price, description, image_url, badge, active) VALUES
(3,  'Nishat Hotel Banquet',      'MM Alam Road, Lahore',      'Gulberg',         1000, 5000,  'Sophisticated venue with panoramic city views, exquisite interiors and personalised wedding packages.',             'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80', 'Premium',    1);

IF NOT EXISTS (SELECT 1 FROM venues WHERE id=4)
INSERT INTO venues (id, name, location, region, max_guests, price, description, image_url, badge, active) VALUES
(4,  'PC DHA Marquee',            'Defence Road, Lahore',      'DHA',             1200, 6500,  'Exclusive marquee in DHA with state-of-the-art facilities, elegant decor and ample parking for guests.',           'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80', 'Premium',    1);

IF NOT EXISTS (SELECT 1 FROM venues WHERE id=5)
INSERT INTO venues (id, name, location, region, max_guests, price, description, image_url, badge, active) VALUES
(5,  'Model Town Grand Marquee',  'Main Boulevard, Model Town','Model Town',      1100, 4000,  'Spacious marquee with lush garden views, beautiful floral arrangements and full wedding coordination services.',    'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80', 'Featured',   1);

IF NOT EXISTS (SELECT 1 FROM venues WHERE id=6)
INSERT INTO venues (id, name, location, region, max_guests, price, description, image_url, badge, active) VALUES
(6,  'Johar Grand Banquet',       'Main Johar Town Road',      'Johar Town',       900, 3200,  'Premium banquet hall with modern decor, full catering services, dedicated parking and professional event team.',    'https://images.unsplash.com/photo-1583939411023-c86c3c6a2ebe?w=600&q=80', 'Popular',    1);

IF NOT EXISTS (SELECT 1 FROM venues WHERE id=7)
INSERT INTO venues (id, name, location, region, max_guests, price, description, image_url, badge, active) VALUES
(7,  'Expo Centre Gulberg',       'Jail Road, Lahore',         'Gulberg',         2000, 3800,  'Lahore largest exhibition and event complex — perfect for grand weddings with thousands of guests.',                'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80', 'Mega Venue', 1);

IF NOT EXISTS (SELECT 1 FROM venues WHERE id=8)
INSERT INTO venues (id, name, location, region, max_guests, price, description, image_url, badge, active) VALUES
(8,  'Royal Marquee DHA',         'Phase 4, DHA Lahore',       'DHA',              900, 4200,  'Exclusive marquee with royal decor, professionally trained staff and outstanding culinary experience in DHA.',      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80', '',           1);

IF NOT EXISTS (SELECT 1 FROM venues WHERE id=9)
INSERT INTO venues (id, name, location, region, max_guests, price, description, image_url, badge, active) VALUES
(9,  'Green Park Marquee',        'Wahdat Road, Model Town',   'Model Town',       900, 3200,  'Beautiful garden marquee surrounded by greenery with both outdoor and indoor wedding event options available.',      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80', '',           1);

IF NOT EXISTS (SELECT 1 FROM venues WHERE id=10)
INSERT INTO venues (id, name, location, region, max_guests, price, description, image_url, badge, active) VALUES
(10, 'Gulshan Ravi Grand Marquee','Main Ravi Road, Lahore',    'Gulshan-e-Ravi',  1000, 2600,  'Elegant grand marquee ideal for large wedding receptions with great road access and affordable premium packages.',  'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80', '',           1);

IF NOT EXISTS (SELECT 1 FROM venues WHERE id=11)
INSERT INTO venues (id, name, location, region, max_guests, price, description, image_url, badge, active) VALUES
(11, 'Al-Hamra Cultural Complex', 'Mall Road, Lahore',         'Mall Road',        800, 2500,  'A historic cultural complex on Mall Road offering a unique and elegant setting for wedding ceremonies.',            'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80', 'Heritage',   1);

IF NOT EXISTS (SELECT 1 FROM venues WHERE id=12)
INSERT INTO venues (id, name, location, region, max_guests, price, description, image_url, badge, active) VALUES
(12, 'Avari Towers Banquet',      'Shahrah-e-Quaid-e-Azam',   'Mall Road',       1200, 5800,  'Five-star luxury banquet at Avari Towers with panoramic Lahore views, fine dining and world-class event services.', 'https://images.unsplash.com/photo-1583939411023-c86c3c6a2ebe?w=600&q=80', 'Luxury',     1);

SET IDENTITY_INSERT venues OFF;
GO

-- ── BOOKINGS ──
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='bookings' AND xtype='U')
CREATE TABLE bookings (
    id             INT IDENTITY(1,1) PRIMARY KEY,
    booking_ref    NVARCHAR(40) NOT NULL UNIQUE,
    user_id        INT,
    venue_id       INT,
    client_name    NVARCHAR(150) NOT NULL,
    client_email   NVARCHAR(180) NOT NULL,
    client_phone   NVARCHAR(40),
    wedding_date   DATE,
    guest_count    INT DEFAULT 0,
    venue_price    DECIMAL(12,2) DEFAULT 0,
    grand_total    DECIMAL(12,2) DEFAULT 0,
    notes          NVARCHAR(MAX),
    status         NVARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
    created_at     DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
GO

-- ── HALL BOOKINGS ──
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='hall_bookings' AND xtype='U')
CREATE TABLE hall_bookings (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    booking_ref  NVARCHAR(40) NOT NULL UNIQUE,
    user_id      INT,
    hall_id      INT DEFAULT 1,
    hall_name    NVARCHAR(100),
    client_name  NVARCHAR(150) NOT NULL,
    client_email NVARCHAR(180) NOT NULL,
    client_phone NVARCHAR(40),
    event_date   DATE,
    event_time   NVARCHAR(50),
    guest_count  INT DEFAULT 0,
    event_type   NVARCHAR(100),
    notes        NVARCHAR(MAX),
    status       NVARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
    created_at   DATETIME DEFAULT GETDATE()
);
GO

-- ── HALL BLOCKED DATES (Admin Manual Control) ──
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='hall_blocked_dates' AND xtype='U')
CREATE TABLE hall_blocked_dates (
    date         DATE PRIMARY KEY,
    blocked      TINYINT DEFAULT 1,
    note         NVARCHAR(255),
    updated_at   DATETIME DEFAULT GETDATE()
);
GO

-- Sample blocked dates
IF NOT EXISTS (SELECT 1 FROM hall_blocked_dates WHERE date = CAST(DATEADD(DAY, 5,  GETDATE()) AS DATE))
INSERT INTO hall_blocked_dates (date, note) VALUES (CAST(DATEADD(DAY, 5,  GETDATE()) AS DATE), 'Wedding booked');

IF NOT EXISTS (SELECT 1 FROM hall_blocked_dates WHERE date = CAST(DATEADD(DAY, 8,  GETDATE()) AS DATE))
INSERT INTO hall_blocked_dates (date, note) VALUES (CAST(DATEADD(DAY, 8,  GETDATE()) AS DATE), 'Private event');

IF NOT EXISTS (SELECT 1 FROM hall_blocked_dates WHERE date = CAST(DATEADD(DAY, 14, GETDATE()) AS DATE))
INSERT INTO hall_blocked_dates (date, note) VALUES (CAST(DATEADD(DAY, 14, GETDATE()) AS DATE), 'Wedding booked');

IF NOT EXISTS (SELECT 1 FROM hall_blocked_dates WHERE date = CAST(DATEADD(DAY, 19, GETDATE()) AS DATE))
INSERT INTO hall_blocked_dates (date, note) VALUES (CAST(DATEADD(DAY, 19, GETDATE()) AS DATE), 'Wedding booked');

IF NOT EXISTS (SELECT 1 FROM hall_blocked_dates WHERE date = CAST(DATEADD(DAY, 22, GETDATE()) AS DATE))
INSERT INTO hall_blocked_dates (date, note) VALUES (CAST(DATEADD(DAY, 22, GETDATE()) AS DATE), 'Wedding booked');

IF NOT EXISTS (SELECT 1 FROM hall_blocked_dates WHERE date = CAST(DATEADD(DAY, 27, GETDATE()) AS DATE))
INSERT INTO hall_blocked_dates (date, note) VALUES (CAST(DATEADD(DAY, 27, GETDATE()) AS DATE), 'Wedding booked');
GO

-- ── CONTACTS ──
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='contacts' AND xtype='U')
CREATE TABLE contacts (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    name       NVARCHAR(150),
    email      NVARCHAR(180),
    message    NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE()
);
GO
