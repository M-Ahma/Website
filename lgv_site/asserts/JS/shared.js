// ═══════════ SHARED NAV + FOOTER INJECTOR ═══════════
// Injects the nav and footer into every page

document.addEventListener('DOMContentLoaded', function () {

    // ── Inject Nav ──
    const navEl = document.getElementById('mainNav');
    if (navEl) {
        navEl.innerHTML = `
      <a class="nav-logo" href="index.html">Smart <span>Venues</span></a>
      <ul class="nav-links">
        <li><a href="index.html"    data-p="home">Home</a></li>
        <li><a href="browse.html"   data-p="browse">Venues</a></li>
        <li><a href="services.html" data-p="services">Services</a></li>
        <li><a href="testimonials.html" data-p="testimonials">Testimonials</a></li>
        <li><a href="hall.html"     data-p="hall">Hall Booking</a></li>
        <li><a href="contact.html"  data-p="contact">Contact</a></li>
        <li><a href="budget.html"  data-p="Budget">Budget</a></li>

      </ul>
      <div class="nav-actions">
        <button class="nav-btn nav-btn-outline" onclick="window.location.href='booking.html'">Book Now</button>
        <button class="nav-btn nav-btn-fill"    id="navLoginBtn"   onclick="window.location.href='login.html'">Login / Sign Up</button>
        <button class="nav-btn nav-btn-fill"    id="navProfileBtn" onclick="window.location.href='profile.html'" style="display:none">My Profile</button>
        <button class="nav-btn nav-btn-outline" id="navLogoutBtn"  onclick="authLogout()" style="display:none;margin-left:4px">Logout</button>
        <button class="nav-btn nav-btn-outline" onclick="window.location.href='admin.html'" style="margin-left:4px">Admin ⚙</button>
      </div>
      <button class="hamburger" onclick="toggleMenu()">☰</button>
    `;
    }

    // ── Inject Mobile Menu ──
    const mobileMenuEl = document.getElementById('mobileMenu');
    if (mobileMenuEl) {
        mobileMenuEl.innerHTML = `
      <a href="index.html">Home</a>
      <a href="browse.html">Venues</a>
      <a href="services.html">Services</a>
      <a href="testimonials.html">Testimonials</a>
      <a href="hall.html">Hall Booking</a>
      <a href="contact.html">Contact</a>
      <a href="booking.html">Book Now</a>
      <a href="admin.html">Admin</a>
      <a href="budget.html">Budget</a>
    `;
    }

    // ── Inject Footer ──
    document.querySelectorAll('.page-footer').forEach(el => {
        el.innerHTML = `
      <footer>
        <div class="foot-grid">
          <div>
            <div class="foot-brand">Smart Venues</div>
            <p class="foot-desc">Lahore's most trusted wedding venue specialists, curating unforgettable celebrations since 2010.</p>
          </div>
          <div class="foot-col">
            <h4>Explore</h4>
            <ul>
              <li><a href="browse.html">All Venues</a></li>
              <li><a href="browse.html?filter=Gulberg">Gulberg</a></li>
              <li><a href="browse.html?filter=DHA">DHA</a></li>
              <li><a href="browse.html?filter=Bahria Town">Bahria Town</a></li>
            </ul>
          </div>
          <div class="foot-col">
            <h4>Services</h4>
            <ul>
              <li><a href="services.html">Photography</a></li>
              <li><a href="services.html">Floral Design</a></li>
              <li><a href="services.html">Catering</a></li>
              <li><a href="services.html">Full Planning</a></li>
            </ul>
          </div>
          <div class="foot-col">
            <h4>Company</h4>
            <ul>
              <li><a href="testimonials.html">Stories</a></li>
              <li><a href="hall.html">Hall Booking</a></li>
              <li><a href="contact.html">Contact</a></li>
              <li><a href="admin.html">Admin ⚙</a></li>
            </ul>
          </div>
        </div>
        <div class="foot-bottom">
          <span>© 2025 Smart Venues Weddings. All rights reserved.</span>
          <div class="foot-soc"><a href="#">◉</a><a href="#">▪</a><a href="#">◆</a></div>
        </div>
      </footer>
    `;
    });

    // ── Set active nav link based on current page ──
    const page = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    document.querySelectorAll('.nav-links a[data-p]').forEach(a => {
        const dp = a.getAttribute('data-p');
        if (dp === page || (page === 'index' && dp === 'home')) {
            a.classList.add('al');
        }
    });

    // ── Solid nav for non-home pages ──
    const nav = document.getElementById('mainNav');
    if (nav && page !== 'index') {
        nav.classList.add('solid');
    }

    // ── Auth UI update ──
    updateNavAuth();

    // ── Back to top button ──
    window.addEventListener('scroll', () => {
        const btn = document.getElementById('backTop');
        if (btn) btn.classList.toggle('vis', scrollY > 400);
        if (nav && page === 'index') {
            nav.classList.toggle('solid', scrollY > 60);
        }
    });
});

// ═══════════ MOBILE MENU ═══════════
function toggleMenu() {
    document.getElementById('mobileMenu').classList.toggle('open');
}

// ═══════════ LIGHTBOX ═══════════
function lb(src, cap) {
    const box = document.getElementById('lightbox');
    if (!box) return;
    document.getElementById('lbImg').src = src;
    document.getElementById('lbCap').textContent = cap || '';
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeLb() {
    const box = document.getElementById('lightbox');
    if (box) box.classList.remove('open');
    document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

// ═══════════ AUTH (shared across all pages) ═══════════
const SESSION_KEY = 'lgv_session';
const AUTH_KEY    = 'lgv_users';
const ADMIN_KEY   = 'lgv_admin_session';

function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}
function setSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    updateNavAuth();
}
function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    updateNavAuth();
}
function getUsers() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY)) || []; } catch { return []; }
}
function saveUsers(users) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(users));
}

function updateNavAuth() {
    const user = getSession();
    const loginBtn   = document.getElementById('navLoginBtn');
    const profileBtn = document.getElementById('navProfileBtn');
    const logoutBtn  = document.getElementById('navLogoutBtn');
    if (!loginBtn) return;
    if (user) {
        loginBtn.style.display   = 'none';
        profileBtn.style.display = '';
        logoutBtn.style.display  = '';
        profileBtn.textContent   = '👤 ' + user.first;
    } else {
        loginBtn.style.display   = '';
        profileBtn.style.display = 'none';
        logoutBtn.style.display  = 'none';
    }
}

function authLogout() {
    const user = getSession();
    clearSession();
    toast('👋 Goodbye' + (user ? ', ' + user.first : '') + '!');
    setTimeout(() => window.location.href = 'index.html', 800);
}

function isAdminLoggedIn() {
    return localStorage.getItem(ADMIN_KEY) === 'true';
}

// ═══════════ TOAST ═══════════
function toast(msg) {
    let t = document.getElementById('authToast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'authToast';
        t.className = 'auth-toast';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// ═══════════ HELPER ═══════════
function validateEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
}
function showMsg(id, text, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = 'auth-msg show ' + type;
}
function hideMsg(id) {
    const el = document.getElementById(id);
    if (el) el.className = 'auth-msg';
}
function togglePw(id, btn) {
    const inp = document.getElementById(id);
    if (!inp) return;
    const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    btn.style.opacity = show ? '0.9' : '0.5';
}
function toggleChip(el) {
    el.classList.toggle('sel');
}
