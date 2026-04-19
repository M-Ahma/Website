-- SQL Server version of lgv_db hall_blocked_dates table

IF OBJECT_ID('dbo.hall_blocked_dates', 'U') IS NOT NULL DROP TABLE dbo.hall_blocked_dates;

CREATE TABLE dbo.hall_blocked_dates (
    date DATE NOT NULL,
    blocked TINYINT DEFAULT 1,
    note NVARCHAR(255) NULL,
    updated_at DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (date)
);

INSERT INTO dbo.hall_blocked_dates (date, blocked, note, updated_at) VALUES
('2026-02-21',1,NULL,'2026-04-19 03:11:44'),
('2026-02-22',1,NULL,'2026-04-19 03:11:44'),
('2026-04-07',1,NULL,'2026-04-19 03:11:44'),
('2026-04-19',1,NULL,'2026-04-19 03:11:44'),
('2026-04-24',1,NULL,'2026-04-19 03:11:44'),
('2026-04-28',1,NULL,'2026-04-19 03:11:44'),
('2026-04-30',1,NULL,'2026-04-19 03:11:44'),
('2026-05-05',1,NULL,'2026-04-19 03:11:44'),
('2026-05-08',1,NULL,'2026-04-19 03:11:44'),
('2026-05-13',1,NULL,'2026-04-19 03:11:44'),
('2026-06-13',1,NULL,'2026-04-19 03:11:44'),
('2026-06-14',1,NULL,'2026-04-19 03:11:44'),
('2026-07-19',1,NULL,'2026-04-19 03:11:44'),
('2026-07-20',1,NULL,'2026-04-19 03:11:44'),
('2026-09-11',1,NULL,'2026-04-19 03:11:44'),
('2026-09-12',1,NULL,'2026-04-19 03:11:44');
