-- SQL Server version of lgv_db bookings table
-- NOTE: Run venues_sqlserver.sql and users_sqlserver.sql FIRST before this file

IF OBJECT_ID('dbo.bookings', 'U') IS NOT NULL DROP TABLE dbo.bookings;

CREATE TABLE dbo.bookings (
    id INT IDENTITY(1,1) NOT NULL,
    booking_ref NVARCHAR(20) NOT NULL,
    user_id INT NULL,
    venue_id INT NULL,
    client_name NVARCHAR(150) NOT NULL,
    client_email NVARCHAR(150) NOT NULL,
    client_phone NVARCHAR(30) NULL,
    wedding_date DATE NULL,
    guest_count INT DEFAULT 0,
    venue_price DECIMAL(10,2) DEFAULT 0.00,
    grand_total DECIMAL(10,2) DEFAULT 0.00,
    notes NVARCHAR(MAX) NULL,
    status NVARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (id),
    UNIQUE (booking_ref),
    FOREIGN KEY (user_id) REFERENCES dbo.users(id),
    FOREIGN KEY (venue_id) REFERENCES dbo.venues(id)
);

SET IDENTITY_INSERT dbo.bookings ON;

INSERT INTO dbo.bookings (id, booking_ref, user_id, venue_id, client_name, client_email, client_phone, wedding_date, guest_count, venue_price, grand_total, notes, status, created_at) VALUES
(1,'BK-20260001',NULL,1,'Zain Ahmed','zain@email.com',NULL,'2026-06-14',300,6500.00,1950000.00,NULL,'confirmed','2026-03-27 20:56:23'),
(2,'BK-20260002',NULL,2,'Sara Khan','sara@email.com',NULL,'2026-07-20',250,7000.00,1750000.00,NULL,'confirmed','2026-03-27 20:56:23'),
(4,'BK-20260004',NULL,3,'Ayesha Malik','ayesha@email.com',NULL,'2026-09-12',200,5000.00,1000000.00,NULL,'confirmed','2026-03-27 20:56:23'),
(9,'BK-2026-540676',NULL,1,'Burhan Asghar','burhanasghar12345@gmail.com',NULL,'2026-02-22',400,0.00,0.00,NULL,'confirmed','2026-03-30 21:52:20');

SET IDENTITY_INSERT dbo.bookings OFF;
