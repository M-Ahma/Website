const express  = require('express');
const cors     = require('cors');
const path     = require('path');
require('dotenv').config();

const app = express();

// ── 1. MIDDLEWARE ──
app.use(cors({
    origin: '*',   // allow all origins (frontend on same machine)
    methods: ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json());

// ── 2. SERVE FRONTEND STATIC FILES ──
// This makes http://localhost:5000 open the website directly
const frontendPath = path.join(__dirname, '..');
app.use(express.static(frontendPath));

// ── 3. API ROUTES ──
try {
    app.use('/api/auth',     require('./src/routes/auth'));
    app.use('/api/venues',   require('./src/routes/venues'));
    app.use('/api/bookings', require('./src/routes/bookings'));
    app.use('/api/contact',  require('./src/routes/contact'));
    app.use('/api/hall',     require('./src/routes/hall'));
    app.use('/api/admin',    require('./src/routes/admin'));
} catch (err) {
    console.error('❌ ROUTE LOADING ERROR:', err.message);
}

// ── 4. HEALTH CHECK ──
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Smart Venues Server is running!' });
});

// ── 5. FALLBACK — serve index.html for all non-API routes ──
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(frontendPath, 'index.html'));
    }
});

// ── 6. START SERVER ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('');
    console.log('🚀  Smart Venues Server Started');
    console.log(`🌐  Website:  http://localhost:${PORT}`);
    console.log(`🔌  API Base: http://localhost:${PORT}/api`);
    console.log(`💚  Health:   http://localhost:${PORT}/api/health`);
    console.log('');
});
