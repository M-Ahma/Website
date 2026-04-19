-- SQL Server version of lgv_db contacts table

IF OBJECT_ID('dbo.contacts', 'U') IS NOT NULL DROP TABLE dbo.contacts;

CREATE TABLE dbo.contacts (
    id INT IDENTITY(1,1) NOT NULL,
    name NVARCHAR(150) NOT NULL,
    email NVARCHAR(150) NOT NULL,
    wedding_date DATE NULL,
    guest_count NVARCHAR(20) NULL,
    region NVARCHAR(100) NULL,
    budget NVARCHAR(50) NULL,
    message NVARCHAR(MAX) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (id)
);

SET IDENTITY_INSERT dbo.contacts ON;

INSERT INTO dbo.contacts (id, name, email, wedding_date, guest_count, region, budget, message, created_at) VALUES
(4,'Ahmad mehmood arshad','ahmadmehmoodarshad1234@gmail.com','2026-04-24','100-200',NULL,NULL,NULL,'2026-03-31 16:37:11'),
(7,'Ahmad Sabir Ali','ahmadsabirali020@gmail.com','2026-03-22','100-200',NULL,NULL,NULL,'2026-03-31 19:42:11'),
(11,'Burhan Asghar','burhanasghar12345@gmail.com','2026-02-22','200+',NULL,NULL,NULL,'2026-04-01 19:51:26'),
(15,'Amina','aminaliaqat72@gmail.com','2026-04-22','60-100',NULL,NULL,NULL,'2026-04-10 12:04:00'),
(16,'Ifra','iframanzoor0327@gmail.com',NULL,'60-100',NULL,NULL,NULL,'2026-04-12 11:51:41'),
(26,'Burhan Asghar','burhanasghar12345@gmail.com','2026-04-30','100-200',NULL,NULL,NULL,'2026-04-18 21:22:18'),
(27,'Burhan Asghar','burhanasghar12345@gmail.com','2026-04-25','200+',NULL,NULL,NULL,'2026-04-18 22:16:32'),
(28,'Burhan Asghar','burhanasghar12345@gmail.com','2026-04-25','200+',NULL,NULL,NULL,'2026-04-18 22:19:55'),
(29,'Burhan Asghar','burhanasghar12345@gmail.com','2026-05-01','200+',NULL,NULL,NULL,'2026-04-18 22:25:06'),
(30,'Burhan Asghar','burhanasghar12345@gmail.com','2026-04-23','100-200',NULL,NULL,NULL,'2026-04-18 23:14:07'),
(31,'Burhan Asghar','burhanasghar12345@gmail.com',NULL,NULL,NULL,NULL,'Wedding Date: 2026-03-22 Guests: 100-200','2026-04-19 12:47:13');

SET IDENTITY_INSERT dbo.contacts OFF;
