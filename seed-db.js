require('dotenv').config();
const dbMongo = require('./db-mongo');
const fs = require('fs').promises;
const path = require('path');

async function seed() {
    console.log('🚀 Starting Database Sync (Local JSON -> MongoDB Atlas)...');
    
    try {
        const connected = await dbMongo.initConnection();
        if (!connected) {
            console.error('❌ Could not connect to MongoDB. Check your MONGODB_URI in .env');
            process.exit(1);
        }

        const dataPath = path.join(__dirname, 'db.json');
        const fileContent = await fs.readFile(dataPath, 'utf8');
        const localData = JSON.parse(fileContent);

        console.log('📦 Local data loaded. Preparing migration...');

        // 1. Personal Info
        if (localData.personalInfo) {
            await dbMongo.updatePersonalInfo(localData.personalInfo);
            console.log('✅ Personal Info synced.');
        }

        // 2. Arrays (Skills, Languages, Timeline, Achievements, Testimonials)
        const arrayFields = ['skills', 'languages', 'timeline', 'achievements', 'testimonials'];
        for (const field of arrayFields) {
            if (localData[field] && localData[field].length > 0) {
                await dbMongo.saveArrayField(field, localData[field]);
                console.log(`✅ ${field} synced (${localData[field].length} items).`);
            }
        }

        // 3. Special Collections (Projects, Certificates, YoutubeVideos)
        if (localData.projects) {
            await dbMongo.Project.deleteMany({});
            await dbMongo.Project.insertMany(localData.projects);
            console.log(`✅ Projects synced (${localData.projects.length} items).`);
        }

        if (localData.certificates) {
            await dbMongo.Certificate.deleteMany({});
            await dbMongo.Certificate.insertMany(localData.certificates);
            console.log(`✅ Certificates synced (${localData.certificates.length} items).`);
        }

        if (localData.youtubeVideos) {
            await dbMongo.YoutubeVideo.deleteMany({});
            await dbMongo.YoutubeVideo.insertMany(localData.youtubeVideos);
            console.log(`✅ YouTube Videos synced (${localData.youtubeVideos.length} items).`);
        }

        console.log('\n✨ Database sync completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Sync failed:', err.message);
        process.exit(1);
    }
}

seed();
