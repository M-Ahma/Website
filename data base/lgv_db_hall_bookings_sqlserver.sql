-- SQL Server version of lgv_db hall_bookings table

IF OBJECT_ID('dbo.hall_bookings', 'U') IS NOT NULL DROP TABLE dbo.hall_bookings;

CREATE TABLE dbo.hall_bookings (
    id INT IDENTITY(1,1) NOT NULL,
    hall_id INT NOT NULL DEFAULT 1,
    hall_name NVARCHAR(100) NOT NULL,
    client_name NVARCHAR(150) NOT NULL,
    client_email NVARCHAR(150) NOT NULL,
    client_phone NVARCHAR(30) NULL,
    event_date DATE NULL,
    event_time NVARCHAR(50) NULL,
    guest_count INT DEFAULT 0,
    event_type NVARCHAR(100) NULL,
    notes NVARCHAR(MAX) NULL,
    status NVARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (id)
);

SET IDENTITY_INSERT dbo.hall_bookings ON;

INSERT INTO dbo.hall_bookings (id, hall_id, hall_name, client_name, client_email, client_phone, event_date, event_time, guest_count, event_type, notes, status, created_at) VALUES
(1,1,'Grand Ballroom','Amad','burhanasghar12345@gmail.com',NULL,'2026-03-23','Morning (9am-12pm)',0,'Wedding Reception',NULL,'pending','2026-03-28 22:29:03'),
(2,2,'Garden Pavilion','Amad','burhanasghar12345@gmail.com',NULL,'2026-03-27','Evening (6pm-12am)',300,'Barat',NULL,'pending','2026-03-30 23:00:53');

SET IDENTITY_INSERT dbo.hall_bookings OFF;
