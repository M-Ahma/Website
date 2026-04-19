╔══════════════════════════════════════════════════════╗
║         SMART VENUES — FILES TO REPLACE              ║
╚══════════════════════════════════════════════════════╝

STEP 1 — SET YOUR MYSQL PASSWORD
═════════════════════════════════
Open: lgv-backend/.env
Find: DB_PASSWORD=
Add your MySQL root password after the = sign.

Example: DB_PASSWORD=mypassword123
If no password: DB_PASSWORD=   (leave blank)

Your error in image was:
"Access denied for user 'root'@'localhost' (using password: NO)"
This means MySQL has a password set but .env has none.


STEP 2 — REPLACE THESE FILES
══════════════════════════════
Copy each file to its matching location in your project:

  lgv-backend/.env
      → lgv-backend/.env

  lgv-backend/src/config/db.js
      → lgv-backend/src/config/db.js

  lgv-backend/src/routes/venues.js
      → lgv-backend/src/routes/venues.js

  lgv-backend/src/routes/contact.js
      → lgv-backend/src/routes/contact.js

  lgv-backend/src/utils/sendEmail.js
      → lgv-backend/src/utils/sendEmail.js

  admin.html
      → admin.html (root of project)


STEP 3 — RESTART SERVER
═════════════════════════
In VS Code terminal:
  Ctrl+C  (stop current server)
  node server.js  (restart)

You should see:
  ✅  MySQL connected successfully to database: lgv_db


WHAT WAS FIXED
══════════════
✓ venues.js   — Was using 'max_guests' but DB has 'capacity'. Fixed.
               Was filtering 'active=1' but DB has no active column. Fixed.
✓ contact.js  — Was inserting wedding_date/region columns that don't exist. Fixed.
✓ db.js       — Now shows clear success/fail message on startup.
✓ admin.html  — Venue table now shows correct 'capacity' column from DB.
✓ .env        — Set your DB_PASSWORD here.

NODEMAILER STATUS
═════════════════
Nodemailer is connected and working in code.
If emails fail, it's silent (won't crash the site).
Make sure EMAIL_USER and EMAIL_PASS in .env are correct Gmail App Password.
