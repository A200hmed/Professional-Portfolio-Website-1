const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

// ── Schemas ─────────────────────────────────────────────────────────────
const PersonalInfoSchema = new mongoose.Schema({
    name: { type: String, default: 'Ahmed Khaled Anwar' },
    name_ar: { type: String, default: 'أحمد خالد أنور' },
    title: { type: String, default: 'Software Engineer & Educational Content Creator' },
    title_ar: { type: String, default: 'مهندس برمجيات وصانع محتوى تعليمي' },
    bio: { type: String, default: '' },
    bio_ar: { type: String, default: '' },
    avatar: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    location: { type: String, default: 'Cairo, Egypt' },
    location_ar: { type: String, default: 'القاهرة، مصر' },
    email: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    youtubeUrl: { type: String, default: '' },
    facebookUrl: { type: String, default: '' },
    instagramUrl: { type: String, default: '' },
    telegramUrl: { type: String, default: '' },
    twitterUrl: { type: String, default: '' },
    stats: {
        students: { type: String, default: '100K+' },
        tutorials: { type: String, default: '150+' },
        views: { type: String, default: '5M+' }
    },
    youtube: {
        title: { type: String, default: 'YouTube Content Creator' },
        title_ar: { type: String, default: 'صانع محتوى يوتيوب' },
        description: { type: String, default: 'Educating developers worldwide through tutorials.' },
        description_ar: { type: String, default: 'تعليم المطورين حول العالم.' },
        badgeImage: { type: String, default: '/zero_to_code_badge.png' }
    }
}, { minimize: false });

const SkillSchema = new mongoose.Schema({
    id: String,
    name: String,
    level: Number,
    category: String
});

const LanguageSchema = new mongoose.Schema({
    id: String,
    name: String,
    name_ar: String,
    level: Number,
    color: String,
    icon: String,
    category: String
});

const TimelineSchema = new mongoose.Schema({
    id: String,
    role: String,
    role_ar: String,
    company: String,
    company_ar: String,
    period: String,
    period_ar: String,
    description: String,
    description_ar: String,
    type: String
});

const AchievementSchema = new mongoose.Schema({
    id: String,
    title: String,
    title_ar: String,
    issuer: String,
    issuer_ar: String,
    year: String,
    icon: String
});

const TestimonialSchema = new mongoose.Schema({
    id: String,
    name: String,
    name_ar: String,
    role: String,
    role_ar: String,
    company: String,
    company_ar: String,
    avatar: String,
    message: String,
    message_ar: String
});

const CertificateSchema = new mongoose.Schema({
    id: String,
    title: String,
    title_ar: String,
    issuer: String,
    issuer_ar: String,
    year: String,
    image: String,
    description: String,
    description_ar: String
});

const YoutubeVideoSchema = new mongoose.Schema({
    id: String,
    title: String,
    title_ar: String,
    url: String,
    thumbnail: String,
    views: String,
    category: String,
    description: String,
    description_ar: String
});

const ProjectSchema = new mongoose.Schema({
    id: String,
    title: String,
    title_ar: String,
    description: String,
    description_ar: String,
    longDescription: String,
    longDescription_ar: String,
    category: String,
    image: String,
    tags: [String],
    features: [String],
    features_ar: [String],
    demoUrl: String,
    githubUrl: String,
    featured: Boolean
});

const MessageSchema = new mongoose.Schema({
    id: String,
    name: String,
    email: String,
    subject: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

// Models configuration
const PersonalInfo = mongoose.models.PersonalInfo || mongoose.model('PersonalInfo', PersonalInfoSchema);
const Skill = mongoose.models.Skill || mongoose.model('Skill', SkillSchema);
const Language = mongoose.models.Language || mongoose.model('Language', LanguageSchema);
const Timeline = mongoose.models.Timeline || mongoose.model('Timeline', TimelineSchema);
const Achievement = mongoose.models.Achievement || mongoose.model('Achievement', AchievementSchema);
const Testimonial = mongoose.models.Testimonial || mongoose.model('Testimonial', TestimonialSchema);
const Certificate = mongoose.models.Certificate || mongoose.model('Certificate', CertificateSchema);
const YoutubeVideo = mongoose.models.YoutubeVideo || mongoose.model('YoutubeVideo', YoutubeVideoSchema);
const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

// JSON default empty structure
const JSON_DEFAULT = {
    personalInfo: {
        name: 'Ahmed Khaled Anwar',
        title: 'Software Engineer & Educational Content Creator',
        bio: '',
        avatar: '',
        resumeUrl: '',
        location: 'Cairo, Egypt',
        email: '',
        whatsapp: '',
        githubUrl: '',
        linkedinUrl: '',
        youtubeUrl: '',
        facebookUrl: '',
        instagramUrl: '',
        telegramUrl: '',
        twitterUrl: ''
    },
    skills: [],
    languages: [],
    timeline: [],
    achievements: [],
    testimonials: [],
    certificates: [],
    youtubeVideos: [],
    messages: [],
    projects: []
};

// JSON Helper functions
async function readLocalJSON() {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch {
        // If on Vercel or local read fails, return defaults without trying to write
        return JSON_DEFAULT;
    }
}

async function writeLocalJSON(data) {
    // Never try to write to local filesystem on Vercel
    if (process.env.VERCEL) return;
    
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.warn('⚠️ Local DB write skipped.');
    }
}

// Global function to check connection status directly from Mongoose
function getIsConnected() {
    return mongoose.connection.readyState === 1;
}

// Global promise to cache the connection
let cachedPromise = null;

// Initialize connection (Standard & Optimized for Vercel)
async function initConnection() {
    if (mongoose.connection.readyState === 1) return true;
    
    if (!cachedPromise) {
        const uri = (process.env.MONGODB_URI || '').trim().replace(/^["'](.+)["']$/, '$1').replace(/[\r\n\t]/g, '');
        if (!uri) return false;

        cachedPromise = mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 1,
            bufferCommands: false,
            connectTimeoutMS: 10000
        }).catch(err => {
            cachedPromise = null;
            console.error('❌ MongoDB Connection Error:', err.message);
            return null;
        });
    }

    try {
        const conn = await cachedPromise;
        return !!conn;
    } catch (err) {
        return false;
    }
}

// ── CRUD Functions with fallback ───────────────────────────────────────
async function readDB() {
    await initConnection();
    if (getIsConnected()) {
        try {
            let info = await PersonalInfo.findOne();
            if (!info) {
                info = await PersonalInfo.create(JSON_DEFAULT.personalInfo);
            }
            const skills = await Skill.find();
            const languages = await Language.find();
            const timeline = await Timeline.find();
            const achievements = await Achievement.find();
            const testimonials = await Testimonial.find();
            const certificates = await Certificate.find();
            const youtubeVideos = await YoutubeVideo.find();
            const projects = await Project.find();
            const messages = await Message.find();

            return {
                personalInfo: info.toObject(),
                skills: skills.map(s => s.toObject()),
                languages: languages.map(l => l.toObject()),
                timeline: timeline.map(t => t.toObject()),
                achievements: achievements.map(a => a.toObject()),
                testimonials: testimonials.map(t => t.toObject()),
                certificates: certificates.map(c => c.toObject()),
                youtubeVideos: youtubeVideos.map(v => v.toObject()),
                projects: projects.map(p => p.toObject()),
                messages: messages.map(m => m.toObject())
            };
        } catch (err) {
            console.error('Failed to read from MongoDB. Falling back to local JSON.', err);
            return readLocalJSON();
        }
    } else {
        return readLocalJSON();
    }
}

async function updatePersonalInfo(infoData) {
    await initConnection();
    if (getIsConnected()) {
        try {
            let info = await PersonalInfo.findOne();
            if (!info) {
                info = new PersonalInfo(infoData);
            } else {
                // Use set() for top-level fields
                Object.keys(infoData).forEach(key => {
                    info.set(key, infoData[key]);
                });
                // Explicitly mark nested objects as modified so Mongoose detects the change
                if (infoData.stats) info.markModified('stats');
                if (infoData.youtube) info.markModified('youtube');
            }
            await info.save();
            console.log('✅ PersonalInfo updated successfully in MongoDB Atlas');
            return info.toObject();
        } catch (err) {
            console.error('❌ Failed to update PersonalInfo on MongoDB:', err.message);
            // Fall back gracefully instead of crashing
        }
    }

    const db = await readLocalJSON();
    db.personalInfo = {...db.personalInfo, ...infoData };
    await writeLocalJSON(db);
    return db.personalInfo;
}

async function saveArrayField(fieldName, arrayData) {
    await initConnection();
    if (getIsConnected()) {
        try {
            let Model;
            switch (fieldName) {
                case 'skills':
                    Model = Skill;
                    break;
                case 'languages':
                    Model = Language;
                    break;
                case 'timeline':
                    Model = Timeline;
                    break;
                case 'achievements':
                    Model = Achievement;
                    break;
                case 'testimonials':
                    Model = Testimonial;
                    break;
                default:
                    throw new Error('Unknown array field: ' + fieldName);
            }
            await Model.deleteMany({});
            if (arrayData && arrayData.length > 0) {
                // Strip Mongoose _id and __v fields to avoid immutable field errors on re-insert
                const cleanData = arrayData.map(item => {
                    const { _id, __v, ...rest } = (item.toObject ? item.toObject() : item);
                    return rest;
                });
                await Model.insertMany(cleanData);
            }
            console.log(`✅ Array field [${fieldName}] updated successfully in MongoDB Atlas (${arrayData.length} items)`);
            return true;
        } catch (err) {
            console.error(`❌ Failed to update ${fieldName} in MongoDB:`, err.message);
            // Fall back gracefully instead of crashing
        }
    }

    const db = await readLocalJSON();
    db[fieldName] = arrayData;
    await writeLocalJSON(db);
    return true;
}

// Certificates CRUD
async function getCertificates() {
    await initConnection();
    if (getIsConnected()) {
        try {
            return await Certificate.find();
        } catch (e) {
            console.error('❌ Error getting certificates from MongoDB:', e.message);
        }
    }
    return (await readLocalJSON()).certificates || [];
}

async function addCertificate(cert) {
    await initConnection();
    if (getIsConnected()) {
        try {
            const res = await Certificate.create(cert);
            console.log('✅ Certificate added to MongoDB');
            return res;
        } catch (e) {
            console.error('❌ Failed to add certificate to MongoDB:', e.message);
            throw e;
        }
    }
    const db = await readLocalJSON();
    if (!db.certificates) db.certificates = [];
    db.certificates.push(cert);
    await writeLocalJSON(db);
    return cert;
}

async function updateCertificate(id, updateData) {
    await initConnection();
    if (getIsConnected()) {
        try {
            const res = await Certificate.findOneAndUpdate({ id }, updateData, { new: true });
            console.log('✅ Certificate updated in MongoDB');
            return res;
        } catch (e) {
            console.error('❌ Failed to update certificate in MongoDB:', e.message);
            throw e;
        }
    }
    const db = await readLocalJSON();
    const idx = db.certificates.findIndex(c => c.id === id);
    if (idx !== -1) {
        db.certificates[idx] = {...db.certificates[idx], ...updateData };
        await writeLocalJSON(db);
        return db.certificates[idx];
    }
    return null;
}

async function deleteCertificate(id) {
    await initConnection();
    if (getIsConnected()) {
        try {
            const res = await Certificate.deleteOne({ id });
            console.log('✅ Certificate deleted from MongoDB');
            return res.deletedCount > 0;
        } catch (e) {
            console.error('❌ Failed to delete certificate from MongoDB:', e.message);
            throw e;
        }
    }
    const db = await readLocalJSON();
    const originalLen = db.certificates.length;
    db.certificates = db.certificates.filter(c => c.id !== id);
    await writeLocalJSON(db);
    return db.certificates.length !== originalLen;
}

// Youtube Videos CRUD
async function getYoutubeVideos() {
    await initConnection();
    if (getIsConnected()) {
        try {
            return await YoutubeVideo.find();
        } catch (e) {
            console.error('❌ Error getting videos from MongoDB:', e.message);
        }
    }
    return (await readLocalJSON()).youtubeVideos || [];
}

async function addYoutubeVideo(video) {
    await initConnection();
    if (getIsConnected()) {
        try {
            const res = await YoutubeVideo.create(video);
            console.log('✅ Video added to MongoDB');
            return res;
        } catch (e) {
            console.error('❌ Failed to add video to MongoDB:', e.message);
            throw e;
        }
    }
    const db = await readLocalJSON();
    if (!db.youtubeVideos) db.youtubeVideos = [];
    db.youtubeVideos.push(video);
    await writeLocalJSON(db);
    return video;
}

async function updateYoutubeVideo(id, updateData) {
    await initConnection();
    if (getIsConnected()) {
        try {
            const res = await YoutubeVideo.findOneAndUpdate({ id }, updateData, { new: true });
            console.log('✅ Video updated in MongoDB');
            return res;
        } catch (e) {
            console.error('❌ Failed to update video in MongoDB:', e.message);
            throw e;
        }
    }
    const db = await readLocalJSON();
    const idx = db.youtubeVideos.findIndex(v => v.id === id);
    if (idx !== -1) {
        db.youtubeVideos[idx] = {...db.youtubeVideos[idx], ...updateData };
        await writeLocalJSON(db);
        return db.youtubeVideos[idx];
    }
    return null;
}

async function deleteYoutubeVideo(id) {
    await initConnection();
    if (getIsConnected()) {
        try {
            const res = await YoutubeVideo.deleteOne({ id });
            console.log('✅ Video deleted from MongoDB');
            return res.deletedCount > 0;
        } catch (e) {
            console.error('❌ Failed to delete video from MongoDB:', e.message);
            throw e;
        }
    }
    const db = await readLocalJSON();
    const originalLen = db.youtubeVideos.length;
    db.youtubeVideos = db.youtubeVideos.filter(v => v.id !== id);
    await writeLocalJSON(db);
    return db.youtubeVideos.length !== originalLen;
}

// Projects CRUD
async function getProjects() {
    await initConnection();
    if (getIsConnected()) {
        try {
            return await Project.find();
        } catch (e) {
            console.error('❌ Error getting projects from MongoDB:', e.message);
        }
    }
    return (await readLocalJSON()).projects || [];
}

async function addProject(project) {
    await initConnection();
    if (getIsConnected()) {
        try {
            const res = await Project.create(project);
            console.log('✅ Project added to MongoDB');
            return res;
        } catch (e) {
            console.error('❌ Failed to add project to MongoDB:', e.message);
            throw e;
        }
    }
    const db = await readLocalJSON();
    if (!db.projects) db.projects = [];
    db.projects.push(project);
    await writeLocalJSON(db);
    return project;
}

async function updateProject(id, updateData) {
    await initConnection();
    if (getIsConnected()) {
        try {
            const res = await Project.findOneAndUpdate({ id }, updateData, { new: true });
            console.log('✅ Project updated in MongoDB');
            return res;
        } catch (e) {
            console.error('❌ Failed to update project in MongoDB:', e.message);
            throw e;
        }
    }
    const db = await readLocalJSON();
    const idx = db.projects.findIndex(p => p.id === id);
    if (idx !== -1) {
        db.projects[idx] = {...db.projects[idx], ...updateData };
        await writeLocalJSON(db);
        return db.projects[idx];
    }
    return null;
}

async function deleteProject(id) {
    await initConnection();
    if (getIsConnected()) {
        try {
            const res = await Project.deleteOne({ id });
            console.log('✅ Project deleted from MongoDB');
            return res.deletedCount > 0;
        } catch (e) {
            console.error('❌ Failed to delete project from MongoDB:', e.message);
            throw e;
        }
    }
    const db = await readLocalJSON();
    const originalLen = db.projects.length;
    db.projects = db.projects.filter(p => p.id !== id);
    await writeLocalJSON(db);
    return db.projects.length !== originalLen;
}

// Messages CRUD
async function addMessage(msg) {
    await initConnection();
    if (getIsConnected()) {
        try {
            const res = await Message.create(msg);
            console.log('✅ Message saved to MongoDB Atlas');
            return res;
        } catch (e) {
            console.error('❌ Failed to save message to MongoDB:', e.message);
        }
    }
    const db = await readLocalJSON();
    if (!db.messages) db.messages = [];
    db.messages.push(msg);
    await writeLocalJSON(db);
    return msg;
}

async function getMessages() {
    await initConnection();
    if (getIsConnected()) {
        try {
            return await Message.find().sort({ timestamp: -1 });
        } catch (e) {
            console.error('❌ Error getting messages from MongoDB:', e.message);
        }
    }
    return (await readLocalJSON()).messages || [];
}

async function markMessageRead(id) {
    await initConnection();
    if (getIsConnected()) {
        try {
            return await Message.findOneAndUpdate({ id }, { read: true }, { new: true });
        } catch (e) {
            console.error('❌ Failed to mark message as read in MongoDB:', e.message);
        }
    }
    const db = await readLocalJSON();
    const idx = db.messages.findIndex(m => m.id === id);
    if (idx !== -1) {
        db.messages[idx].read = true;
        await writeLocalJSON(db);
        return db.messages[idx];
    }
    return null;
}

async function deleteMessage(id) {
    await initConnection();
    if (getIsConnected()) {
        try {
            const res = await Message.deleteOne({ id });
            return res.deletedCount > 0;
        } catch (e) {
            console.error('❌ Failed to delete message from MongoDB:', e.message);
        }
    }
    const db = await readLocalJSON();
    const originalLen = db.messages.length;
    db.messages = db.messages.filter(m => m.id !== id);
    await writeLocalJSON(db);
    return db.messages.length !== originalLen;
}

module.exports = {
    initConnection,
    getIsConnected,
    getLastError,
    readDB,
    updatePersonalInfo,
    saveArrayField,
    getCertificates,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    getYoutubeVideos,
    addYoutubeVideo,
    updateYoutubeVideo,
    deleteYoutubeVideo,
    getProjects,
    addProject,
    updateProject,
    deleteProject,
    addMessage,
    getMessages,
    markMessageRead,
    deleteMessage,
    // Expose Mongoose Models for Seeding
    PersonalInfo,
    Skill,
    Language,
    Timeline,
    Achievement,
    Testimonial,
    Certificate,
    YoutubeVideo,
    Project,
    Message
};