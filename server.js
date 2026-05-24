require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dbMongo = require('./db-mongo');
const mailer = require('./mailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Database masking for logs
if (process.env.MONGODB_URI) {
    const masked = process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@');
    console.log(`📡 MONGODB_URI detected: ${masked}`);
} else {
    console.log('📡 MONGODB_URI not found. Using local JSON fallback.');
}

// Initialize Database Connection and ensure it waits
async function ensureDB() {
    if (!dbMongo.getIsConnected()) {
        await dbMongo.initConnection();
    }
}
ensureDB();

// Middleware to ensure DB is connected before any request
app.use(async(req, res, next) => {
    await ensureDB();
    next();
});

// ── Security Middleware ────────────────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: false, // Turn off CSP headers if they interfere with custom CDNs or media embeds
}));

// CORS Configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000'
];
app.use(cors({
    origin: function(origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }

        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }

        // Default to allowing same-origin if origin matches host
        return callback(null, true);
    }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Rate Limiter for contact form submissions
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: { error: 'Too many messages sent from this IP, please try again after 15 minutes.' }
});

// ── Auth Helper ────────────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
    const tokenSecret = process.env.ADMIN_TOKEN_SECRET || 'sterling-secure-admin-token-2026';
    if (req.headers['authorization'] === `Bearer ${tokenSecret}`) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const u = process.env.ADMIN_USER || 'admin';
    const p = process.env.ADMIN_PASS || 'admin';
    const tokenSecret = process.env.ADMIN_TOKEN_SECRET || 'sterling-secure-admin-token-2026';

    if (username === u && password === p) {
        res.json({ success: true, token: tokenSecret });
    } else {
        res.status(400).json({ success: false, error: 'Invalid credentials' });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// SETTINGS (personal info + arrays)
// ══════════════════════════════════════════════════════════════════════════════
app.get('/api/settings', async(req, res) => {
    try {
        const db = await dbMongo.readDB();
        res.json({
            personalInfo: db.personalInfo,
            skills: db.skills || [],
            languages: db.languages || [],
            timeline: db.timeline || [],
            achievements: db.achievements || [],
            testimonials: db.testimonials || [],
            certificates: db.certificates || [],
            youtubeVideos: db.youtubeVideos || []
        });
    } catch (err) {
        console.error('❌ Error in GET /api/settings:', err.message);
        res.status(500).json({ error: 'Failed to load settings' });
    }
});

app.post('/api/settings', requireAuth, async(req, res) => {
    try {
        const db = await dbMongo.readDB();
        const info = db.personalInfo;
        const newInfo = {
            name: req.body.name || info.name,
            name_ar: req.body.name_ar !== undefined ? req.body.name_ar : (info.name_ar || ''),
            title: req.body.title || info.title,
            title_ar: req.body.title_ar !== undefined ? req.body.title_ar : (info.title_ar || ''),
            bio: req.body.bio !== undefined ? req.body.bio : info.bio,
            bio_ar: req.body.bio_ar !== undefined ? req.body.bio_ar : (info.bio_ar || ''),
            avatar: req.body.avatar || info.avatar,
            resumeUrl: req.body.resumeUrl || info.resumeUrl,
            location: req.body.location || info.location,
            location_ar: req.body.location_ar !== undefined ? req.body.location_ar : (info.location_ar || ''),
            email: req.body.email || info.email,
            whatsapp: req.body.whatsapp || info.whatsapp || '',
            githubUrl: req.body.githubUrl || info.githubUrl || '',
            linkedinUrl: req.body.linkedinUrl || info.linkedinUrl || '',
            youtubeUrl: req.body.youtubeUrl || info.youtubeUrl || '',
            facebookUrl: req.body.facebookUrl || info.facebookUrl || '',
            instagramUrl: req.body.instagramUrl || info.instagramUrl || '',
            telegramUrl: req.body.telegramUrl || info.telegramUrl || '',
            twitterUrl: req.body.twitterUrl || info.twitterUrl || '',
            stats: req.body.stats || info.stats || { students: '100K+', tutorials: '150+', views: '5M+' },
            youtube: req.body.youtube || info.youtube || {
                title: 'YouTube Content Creator',
                title_ar: 'صانع محتوى يوتيوب',
                description: 'Educating developers worldwide through structured programming tutorials, full-stack walkthroughs, and software engineering deep-dives.',
                description_ar: 'تعليم المطورين حول العالم من خلال شروحات برمجية منظمة، وشرح شامل للمشاريع الكاملة، واستعراض عميق لهندسة البرمجيات.',
                badgeImage: '/zero_to_code_badge.png'
            }
        };
        const updated = await dbMongo.updatePersonalInfo(newInfo);
        res.json(updated);
    } catch (err) {
        console.error('❌ Error in POST /api/settings:', err.message);
        res.status(500).json({ error: 'Internal Server Error: ' + err.message });
    }
});

// ── Array Settings ─────────────────────────────────────────────────────────────
app.post('/api/settings/skills', requireAuth, async(req, res) => {
    const list = Array.isArray(req.body.skills) ? req.body.skills : [];
    await dbMongo.saveArrayField('skills', list);
    res.json({ success: true, skills: list });
});

app.post('/api/settings/languages', requireAuth, async(req, res) => {
    const list = Array.isArray(req.body.languages) ? req.body.languages : [];
    await dbMongo.saveArrayField('languages', list);
    res.json({ success: true, languages: list });
});

app.post('/api/settings/timeline', requireAuth, async(req, res) => {
    const list = Array.isArray(req.body.timeline) ? req.body.timeline : [];
    await dbMongo.saveArrayField('timeline', list);
    res.json({ success: true, timeline: list });
});

app.post('/api/settings/achievements', requireAuth, async(req, res) => {
    const list = Array.isArray(req.body.achievements) ? req.body.achievements : [];
    await dbMongo.saveArrayField('achievements', list);
    res.json({ success: true, achievements: list });
});

app.post('/api/settings/testimonials', requireAuth, async(req, res) => {
    const list = Array.isArray(req.body.testimonials) ? req.body.testimonials : [];
    await dbMongo.saveArrayField('testimonials', list);
    res.json({ success: true, testimonials: list });
});

// ── Certificates ────────────────────────────────────────────────────────────────
app.get('/api/certificates', async(req, res) => {
    const list = await dbMongo.getCertificates();
    res.json(list);
});

app.post('/api/certificates', requireAuth, async(req, res) => {
    const cert = {
        id: 'c_' + Date.now(),
        title: req.body.title || 'Untitled Certificate',
        title_ar: req.body.title_ar || '',
        issuer: req.body.issuer || '',
        issuer_ar: req.body.issuer_ar || '',
        year: req.body.year || new Date().getFullYear().toString(),
        image: req.body.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300',
        description: req.body.description || '',
        description_ar: req.body.description_ar || ''
    };
    const created = await dbMongo.addCertificate(cert);
    res.status(201).json(created);
});

app.put('/api/certificates/:id', requireAuth, async(req, res) => {
    const updateData = {
        title: req.body.title,
        title_ar: req.body.title_ar,
        issuer: req.body.issuer,
        issuer_ar: req.body.issuer_ar,
        year: req.body.year,
        image: req.body.image,
        description: req.body.description,
        description_ar: req.body.description_ar
    };
    // Remove undefined properties to avoid overwriting existing properties with undefined/null
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updated = await dbMongo.updateCertificate(req.params.id, updateData);
    if (!updated) return res.status(404).json({ error: 'Certificate not found' });
    res.json(updated);
});

app.delete('/api/certificates/:id', requireAuth, async(req, res) => {
    const deleted = await dbMongo.deleteCertificate(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
});

// ── YouTube Videos ──────────────────────────────────────────────────────────────
app.get('/api/youtube', async(req, res) => {
    const list = await dbMongo.getYoutubeVideos();
    res.json(list);
});

app.post('/api/youtube', requireAuth, async(req, res) => {
    const vid = {
        id: 'y_' + Date.now(),
        title: req.body.title || 'Untitled Tutorial',
        title_ar: req.body.title_ar || '',
        url: req.body.url || 'https://youtube.com',
        thumbnail: req.body.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300',
        views: req.body.views || '0 Views',
        category: req.body.category || 'General',
        description: req.body.description || '',
        description_ar: req.body.description_ar || ''
    };
    const created = await dbMongo.addYoutubeVideo(vid);
    res.status(201).json(created);
});

app.put('/api/youtube/:id', requireAuth, async(req, res) => {
    const updateData = {
        title: req.body.title,
        title_ar: req.body.title_ar,
        url: req.body.url,
        thumbnail: req.body.thumbnail,
        views: req.body.views,
        category: req.body.category,
        description: req.body.description,
        description_ar: req.body.description_ar
    };
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updated = await dbMongo.updateYoutubeVideo(req.params.id, updateData);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
});

app.delete('/api/youtube/:id', requireAuth, async(req, res) => {
    const deleted = await dbMongo.deleteYoutubeVideo(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
});

// ══════════════════════════════════════════════════════════════════════════════
// PROJECTS (Full CRUD)
// ══════════════════════════════════════════════════════════════════════════════
app.get('/api/projects', async(req, res) => {
    const list = await dbMongo.getProjects();
    res.json(list);
});

app.post('/api/projects', requireAuth, async(req, res) => {
    const p = {
        id: 'p_' + Date.now(),
        title: req.body.title || 'Untitled',
        title_ar: req.body.title_ar || '',
        description: req.body.description || '',
        description_ar: req.body.description_ar || '',
        longDescription: req.body.longDescription || '',
        longDescription_ar: req.body.longDescription_ar || '',
        category: req.body.category || 'fullstack',
        image: req.body.image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
        tags: Array.isArray(req.body.tags) ? req.body.tags : [],
        features: Array.isArray(req.body.features) ? req.body.features : [],
        features_ar: Array.isArray(req.body.features_ar) ? req.body.features_ar : [],
        demoUrl: req.body.demoUrl || '#',
        githubUrl: req.body.githubUrl || '#',
        featured: req.body.featured === true
    };
    const created = await dbMongo.addProject(p);
    res.status(201).json(created);
});

app.put('/api/projects/:id', requireAuth, async(req, res) => {
    const updateData = {
        title: req.body.title,
        title_ar: req.body.title_ar,
        description: req.body.description,
        description_ar: req.body.description_ar,
        longDescription: req.body.longDescription,
        longDescription_ar: req.body.longDescription_ar,
        category: req.body.category,
        image: req.body.image,
        tags: req.body.tags,
        features: req.body.features,
        features_ar: req.body.features_ar,
        demoUrl: req.body.demoUrl,
        githubUrl: req.body.githubUrl,
        featured: req.body.featured
    };
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updated = await dbMongo.updateProject(req.params.id, updateData);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
});

app.delete('/api/projects/:id', requireAuth, async(req, res) => {
    const deleted = await dbMongo.deleteProject(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
});

// ══════════════════════════════════════════════════════════════════════════════
// CONTACT MESSAGES
// ══════════════════════════════════════════════════════════════════════════════
app.post('/api/contact', contactLimiter, async(req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Missing required fields (name, email, message)' });
    }
    const msg = {
        id: 'msg_' + Date.now(),
        name,
        email,
        subject: subject || 'General Inquiry',
        message,
        timestamp: new Date().toISOString(),
        read: false
    };
    await dbMongo.addMessage(msg);

    // Send email notification (Wait for it to finish on serverless environments like Vercel)
    try {
        await mailer.sendContactEmail(msg);
    } catch (err) {
        console.error('Email sending failed:', err);
    }

    res.status(201).json({ success: true });
});

app.get('/api/contact/messages', requireAuth, async(req, res) => {
    const messages = await dbMongo.getMessages();
    res.json(messages || []);
});

app.put('/api/contact/messages/:id/read', requireAuth, async(req, res) => {
    const updated = await dbMongo.markMessageRead(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
});

app.delete('/api/contact/messages/:id', requireAuth, async(req, res) => {
    const deleted = await dbMongo.deleteMessage(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
});

// ══════════════════════════════════════════════════════════════════════════════
// GITHUB PROXY (mock with realistic data for Ahmed)
// ══════════════════════════════════════════════════════════════════════════════
app.get('/api/github', async(req, res) => {
    res.json([
        { name: 'CodeCamp-LMS', stars: 214, language: 'React', description: 'Full-stack e-learning platform with live code execution, progress analytics, and automated grading.', url: 'https://github.com' },
        { name: 'ObsidianUI-Kit', stars: 156, language: 'CSS/JS', description: 'Premium dark glassmorphism component library for fast dashboard prototyping.', url: 'https://github.com' },
        { name: 'HeliosRouter', stars: 89, language: 'Node.js', description: 'Trie-based serverless router optimized for Cloudflare Workers and AWS Lambda cold starts.', url: 'https://github.com' },
        { name: 'AKA-DevKit', stars: 67, language: 'JavaScript', description: 'Developer utilities and CLI tools for accelerating full-stack project scaffolding.', url: 'https://github.com' }
    ]);
});

// ── SPA Fallback ───────────────────────────────────────────────────────────────
app.use((req, res) => {
    const url = req.path;

    // Return 404 for any unmatched /api/* route
    if (url.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }

    // Return 404 for requests that look like static files (have an extension)
    // e.g. /missing.css, /nonexistent.js, /broken.png
    if (/\.[a-zA-Z0-9]+$/.test(url)) {
        return res.status(404).send('Not found');
    }

    // For all other paths (SPA navigation), serve index.html
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export the app for Vercel
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log('═════════════════════════════════════════════════');
        console.log('  ✔  AHMED KHALED ANWAR — PORTFOLIO SERVER');
        console.log(`  ✔  http://localhost:${PORT}`);
        console.log('  ✔  Database layer initialized.');
        console.log('═════════════════════════════════════════════════');
    });
}