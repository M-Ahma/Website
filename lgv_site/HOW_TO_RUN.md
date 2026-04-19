# Smart Venues — How to Run

## Step 1: Setup Database
1. Open phpMyAdmin or MySQL Workbench
2. Run the file: `lgv-backend/database.sql`
   - This creates the database, all tables, and loads venue data automatically

## Step 2: Configure Database Password
Open `lgv-backend/.env` and set your MySQL password:
```
DB_PASSWORD=your_mysql_password_here
```
(Leave blank if no password set)

## Step 3: Install & Start Backend
```bash
cd lgv-backend
npm install
npm start
```

## Step 4: Open Website
Go to: http://localhost:5000

That's it! The backend serves the website automatically.

## Admin Login
- URL: http://localhost:5000/admin.html
- Email: admin@smartvenue.com
- Password: Admin@1234

## Email Setup (Optional)
The site sends confirmation emails via Gmail.
In `lgv-backend/.env`, set:
```
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```
Get App Password from: Google Account → Security → 2-Step Verification → App Passwords
