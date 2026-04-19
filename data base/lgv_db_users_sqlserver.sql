-- SQL Server version of lgv_db users table

IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;

CREATE TABLE dbo.users (
    id INT IDENTITY(1,1) NOT NULL,
    full_name NVARCHAR(150) NOT NULL,
    email NVARCHAR(150) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    phone NVARCHAR(30) NULL,
    role NVARCHAR(10) DEFAULT 'client' CHECK (role IN ('client', 'admin')),
    created_at DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (id),
    UNIQUE (email)
);

SET IDENTITY_INSERT dbo.users ON;

INSERT INTO dbo.users (id, full_name, email, password_hash, phone, role, created_at) VALUES
(1,'Admin User','admin@lgv.com','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',NULL,'admin','2026-03-27 18:50:19'),
(3,'Burhan Asghar','burhanasghar12345@gmail.com','$2a$10$SXF50hasjGAvRaLPhpufp.1eZxAqc0WgTIScz2cSw7.ueV3p7UMqC',NULL,'client','2026-03-28 22:06:45'),
(4,'Ahmad arshad','ahmad@gmail.com','$2a$10$LM1Br3cx5VbfNUYphhIVyeppA49A77ELDZEMOyAvj8y6btG9gY1/i',NULL,'client','2026-03-29 06:36:38'),
(6,'Amina khan','amina@gmaills.com','$2a$10$KvKoXwd5kj5YZpq8kGDjh.X9lvt34hJjiMt/am7/47Ue3N96F1oQ2',NULL,'client','2026-04-13 06:53:16'),
(7,'Awais Asghar','awais@gmail.com','$2a$10$wjmS0ycn1jxVphGJFXbIW.pnQaNxhGbHqvT/A5eiW8AbySDQ0uUoG',NULL,'client','2026-04-19 12:45:58');

SET IDENTITY_INSERT dbo.users OFF;
