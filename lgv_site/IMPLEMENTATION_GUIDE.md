# LGV Website — App Icon + AI Assistant Guide

---

## PART 1: Website ko App Icon se Open Karna (PWA)

### Step 1 — manifest.json copy karo
`manifest.json` file pehle se bani hui hai. Isko `lgv_site/` ke root mein rakh do.

### Step 2 — App Icon Images banana
`asserts/icons/` folder banao aur 2 icon files rakh do:
- `icon-192.png` — 192×192 pixels
- `icon-512.png` — 512×512 pixels

**Free icon banana:** https://www.canva.com ya https://favicon.io

### Step 3 — Har HTML file ke `<head>` mein yeh 4 lines add karo

```html
<!-- PWA Support -->
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#b8860b">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

**Ye files update karni hain:**
- index.html ✅
- booking.html ✅
- hall.html ✅
- browse.html ✅
- contact.html ✅
- login.html ✅
- profile.html ✅

### Step 4 — Service Worker register karo
`sw.js` file bhi root mein ready hai. Har HTML file ke `</body>` se pehle yeh add karo:

```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('SW registered'))
      .catch(err => console.log('SW error:', err));
  }
</script>
```

### Step 5 — HTTPS zaroor hona chahiye
PWA sirf HTTPS pe kaam karta hai. Deploy karte waqt:
- Netlify/Vercel: automatic HTTPS hota hai ✅
- cPanel hosting: SSL certificate enable karo ✅

### Step 6 — Phone pe install karna
1. Chrome mein website kholo
2. Menu (3 dots) → "Add to Home Screen"
3. Ya browser khud prompt karega "Install App"
4. Done — App icon home screen pe aa jaega!

---

## PART 2: AI Booking Assistant (Heatmap wali jagah)

### Step 1 — `ai_assistant_widget.html` ka content copy karo
Is file ka poora content copy karo.

### Step 2 — `booking.html` mein paste karo
`booking.html` ke `</body>` tag se PEHLE paste karo.

### Step 3 — API URL update karo
Widget mein yeh line dhundho:
```javascript
const API_BASE = 'http://localhost:5000/api';
```
Isko apni deployed server URL se badlo, jaise:
```javascript
const API_BASE = 'https://lgv-backend.onrender.com/api';
```

### Step 4 — Anthropic API Key
AI features ke liye Anthropic API key chahiye:
1. https://console.anthropic.com par account banao
2. API key generate karo
3. Ye key sirf backend pe rakho — frontend mein KABHI mat dalo

**Backend mein AI route add karo** (`lgv-backend/src/routes/ai.js`):

```javascript
const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post('/chat', async (req, res) => {
  const { message, bookedDates } = req.body;
  const today = new Date().toISOString().split('T')[0];
  
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: `Tu LGV booking assistant hai. Aaj: ${today}. Booked dates: ${JSON.stringify(bookedDates)}`,
    messages: [{ role: 'user', content: message }]
  });
  
  res.json({ reply: response.content[0].text });
});

module.exports = router;
```

**.env mein add karo:**
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

**server.js mein register karo:**
```javascript
const aiRoutes = require('./src/routes/ai');
app.use('/api/ai', aiRoutes);
```

---

## Summary — Kya kya tools use honge

| Feature | Tools | Naya Code |
|---------|-------|-----------|
| App Icon (PWA) | Koi naya tool nahi | `manifest.json`, `sw.js`, 4 HTML lines |
| AI Assistant | `@anthropic-ai/sdk` (npm) | Backend route + frontend widget |

## Install karo
```bash
cd lgv-backend
npm install @anthropic-ai/sdk
```
