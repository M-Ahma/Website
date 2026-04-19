-- SQL Server version of lgv_db venues table

IF OBJECT_ID('dbo.venues', 'U') IS NOT NULL DROP TABLE dbo.venues;

CREATE TABLE dbo.venues (
    id INT IDENTITY(1,1) NOT NULL,
    name NVARCHAR(200) NOT NULL,
    location NVARCHAR(200) NULL,
    region NVARCHAR(100) NULL,
    capacity INT DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0.00,
    description NVARCHAR(MAX) NULL,
    image_url NVARCHAR(500) NULL,
    badge NVARCHAR(50) NULL,
    is_active TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (id)
);

SET IDENTITY_INSERT dbo.venues ON;

INSERT INTO dbo.venues (id, name, location, region, capacity, price, description, image_url, badge, is_active, created_at) VALUES
(1,'Royal Palm Marquee','Canal Bank Road, Lahore','Gulberg',1300,6000.00,'Elegant venue with lush surroundings and premium services.',NULL,'Luxury',1,'2026-03-27 20:55:49'),
(2,'Grand Orchid Marquee','Ferozepur Road, Lahore','Model Town',1000,3500.00,'Beautiful floral themed marquee perfect for weddings.',NULL,'Featured',1,'2026-03-27 20:55:49'),
(3,'DHA Platinum Hall','Phase 6 DHA Lahore','DHA',1200,7200.00,'Modern banquet hall with premium ambiance and valet parking.',NULL,'Luxury',1,'2026-03-27 20:55:49'),
(4,'Faletti''s Banquet Hall','Egerton Road, Lahore','Mall Road',900,5500.00,'Historic hotel banquet with elegant interiors.',NULL,'Premium',1,'2026-03-27 20:55:49'),
(5,'Avari Garden Hall','Mall Road Lahore','Mall Road',1100,6800.00,'Luxury hotel venue with garden and indoor options.',NULL,'Luxury',1,'2026-03-27 20:55:49'),
(6,'Empire Marquee','Thokar Niaz Baig','Thokar',1500,3000.00,'Large capacity marquee ideal for grand events.',NULL,'Mega Venue',1,'2026-03-27 20:55:49'),
(7,'Al-Hamra Hall','Mall Road Lahore','Mall Road',800,2500.00,'Cultural hall for medium-sized events.',NULL,'Popular',1,'2026-03-27 20:55:49'),
(8,'Royal Castle Marquee','Johar Town Lahore','Johar Town',1000,3400.00,'Modern hall with elegant decor.',NULL,'Featured',1,'2026-03-27 20:55:49'),
(9,'Heaven Marquee','Canal Road Lahore','Canal Road',1400,3700.00,'Spacious venue with luxury seating.',NULL,'Premium',1,'2026-03-27 20:55:49'),
(10,'The Grand Palace','Gulberg Lahore','Gulberg',1200,6000.00,'Premium banquet with top-tier services.',NULL,'Luxury',1,'2026-03-27 20:55:49'),
(11,'Silver Star Marquee','Wapda Town Lahore','Wapda Town',900,2800.00,'Affordable yet elegant venue.',NULL,'Popular',1,'2026-03-27 20:55:49'),
(12,'Sunset Banquet','Bahria Town Lahore','Bahria Town',1000,3600.00,'Modern hall with sunset view ambiance.',NULL,'Featured',1,'2026-03-27 20:55:49'),
(13,'Crystal Marquee','Canal View Lahore','Canal View',1100,4000.00,'Stylish glass interior venue.',NULL,'Premium',1,'2026-03-27 20:55:49'),
(14,'Regal Banquet','DHA Phase 5 Lahore','DHA',1300,6500.00,'Royal themed banquet for grand events.',NULL,'Luxury',1,'2026-03-27 20:55:49'),
(15,'Event Hub Marquee','Raiwind Road Lahore','Raiwind Road',1500,2800.00,'Huge space for large gatherings.',NULL,'Mega Venue',1,'2026-03-27 20:55:49'),
(16,'Golden Crown Hall','Gulshan Ravi Lahore','Gulshan-e-Ravi',900,2600.00,'Affordable and elegant hall.',NULL,'Popular',1,'2026-03-27 20:55:49'),
(17,'Blue Moon Marquee','Iqbal Town Lahore','Iqbal Town',1000,3100.00,'Modern lighting and decor.',NULL,'Featured',1,'2026-03-27 20:55:49'),
(18,'Dream Palace','Johar Town Lahore','Johar Town',1200,4500.00,'Luxurious venue for weddings.',NULL,'Premium',1,'2026-03-27 20:55:49'),
(19,'Pearl Garden Marquee','Model Town Lahore','Model Town',1100,3900.00,'Garden style wedding venue.',NULL,'Featured',1,'2026-03-27 20:55:49'),
(20,'City View Banquet','MM Alam Road Lahore','Gulberg',800,5000.00,'City center banquet with premium service.',NULL,'Premium',1,'2026-03-27 20:55:49'),
(21,'Royal Garden Hall','Canal Bank Lahore','Canal Road',1000,3200.00,'Beautiful outdoor garden venue.',NULL,'Popular',1,'2026-03-27 20:55:49'),
(22,'Elite Marquee','DHA Phase 7 Lahore','DHA',1300,7000.00,'Elite venue with top facilities.',NULL,'Luxury',1,'2026-03-27 20:55:49'),
(23,'Star Event Complex','Ferozepur Road Lahore','Ferozepur Road',1500,3000.00,'Large venue with modern setup.',NULL,'Mega Venue',1,'2026-03-27 20:55:49'),
(24,'Orchid Banquet','Bahria Orchard Lahore','Bahria Town',900,3500.00,'Elegant floral themed hall.',NULL,'Featured',1,'2026-03-27 20:55:49'),
(25,'Royal Bliss Marquee','Thokar Lahore','Thokar',1200,3700.00,'Modern design with premium feel.',NULL,'Premium',1,'2026-03-27 20:55:49'),
(26,'Platinum Event Hall','DHA Phase 8 Lahore','DHA',1400,7500.00,'Ultra luxury wedding venue.',NULL,'Luxury',1,'2026-03-27 20:55:49'),
(27,'Gardenia Marquee','Wapda Town Lahore','Wapda Town',1000,3000.00,'Garden themed event space.',NULL,'Popular',1,'2026-03-27 20:55:49'),
(28,'Lahore Grande Hall','Gulberg Lahore','Gulberg',1100,5800.00,'Premium banquet in city center.',NULL,'Premium',1,'2026-03-27 20:55:49'),
(29,'Skyline Marquee','Johar Town Lahore','Johar Town',900,3300.00,'Modern skyline themed venue.',NULL,'Featured',1,'2026-03-27 20:55:49'),
(30,'Majestic Hall','Model Town Lahore','Model Town',1000,4200.00,'Classic elegant wedding hall.',NULL,'Premium',1,'2026-03-27 20:55:49'),
(31,'Event Palace Lahore','Canal Road Lahore','Canal Road',1500,3100.00,'Large scale wedding venue.',NULL,'Mega Venue',1,'2026-03-27 20:55:49'),
(32,'Grand Empire Hall','DHA Lahore','DHA',1200,6500.00,'Luxury wedding hall.',NULL,'Luxury',1,'2026-03-27 20:55:49'),
(33,'Royal Star Marquee','Faisal Town Lahore','Faisal Town',900,2800.00,'Affordable modern marquee.',NULL,'Popular',1,'2026-03-27 20:55:49'),
(34,'Blossom Banquet','Iqbal Town Lahore','Iqbal Town',1000,3000.00,'Floral design themed venue.',NULL,'Featured',1,'2026-03-27 20:55:49'),
(35,'Elegant Event Hall','Bahria Town Lahore','Bahria Town',1100,3800.00,'Stylish modern hall.',NULL,'Premium',1,'2026-03-27 20:55:49'),
(36,'Green Valley Marquee','Raiwind Road Lahore','Raiwind Road',1300,2900.00,'Nature inspired venue.',NULL,'Popular',1,'2026-03-27 20:55:49'),
(37,'Silver Palace Hall','Gulshan Ravi Lahore','Gulshan-e-Ravi',800,2500.00,'Budget friendly hall.',NULL,'Popular',1,'2026-03-27 20:55:49'),
(38,'Royal Event Space','Johar Town Lahore','Johar Town',1200,4000.00,'Premium event space.',NULL,'Premium',1,'2026-03-27 20:55:49'),
(39,'Dream Wedding Hall','Model Town Lahore','Model Town',1000,3500.00,'Perfect for weddings.',NULL,'Featured',1,'2026-03-27 20:55:49'),
(40,'Golden Palace Marquee','DHA Lahore','DHA',1400,7200.00,'Luxury grand venue.',NULL,'Luxury',1,'2026-03-27 20:55:49'),
(41,'Test Venue','Test Location','Gulberg',500,3000.00,NULL,NULL,NULL,0,'2026-03-28 23:13:50'),
(42,'Burhan','MM Alam road lahore','Gulberg',500,2300.00,'','','luxury',1,'2026-04-19 12:46:40');

SET IDENTITY_INSERT dbo.venues OFF;
