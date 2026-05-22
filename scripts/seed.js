require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const dbMongo = require('../db-mongo');

const DB_PATH = path.join(__dirname, '..', 'db.json');

async function seed() {
  console.log('🏁 Starting migration script...');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in your .env file.');
    console.log('Please set MONGODB_URI to your MongoDB Atlas connection string before running this script.');
    process.exit(1);
  }

  // Connect to DB
  await dbMongo.initConnection();

  let localData;
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    localData = JSON.parse(raw);
    console.log('📖 Successfully read local db.json.');
  } catch (err) {
    console.error('❌ Could not read db.json file at: ', DB_PATH, err.message);
    process.exit(1);
  }

  try {
    // 1. PersonalInfo
    if (localData.personalInfo) {
      console.log('Seeding Personal Info...');
      await dbMongo.PersonalInfo.deleteMany({});
      await dbMongo.PersonalInfo.create(localData.personalInfo);
    }

    // 2. Skills
    if (Array.isArray(localData.skills)) {
      console.log(`Seeding ${localData.skills.length} skills...`);
      await dbMongo.Skill.deleteMany({});
      if (localData.skills.length > 0) {
        await dbMongo.Skill.insertMany(localData.skills);
      }
    }

    // 3. Languages
    if (Array.isArray(localData.languages)) {
      console.log(`Seeding ${localData.languages.length} languages...`);
      await dbMongo.Language.deleteMany({});
      if (localData.languages.length > 0) {
        await dbMongo.Language.insertMany(localData.languages);
      }
    }

    // 4. Timeline
    if (Array.isArray(localData.timeline)) {
      console.log(`Seeding ${localData.timeline.length} timeline events...`);
      await dbMongo.Timeline.deleteMany({});
      if (localData.timeline.length > 0) {
        await dbMongo.Timeline.insertMany(localData.timeline);
      }
    }

    // 5. Achievements
    if (Array.isArray(localData.achievements)) {
      console.log(`Seeding ${localData.achievements.length} achievements...`);
      await dbMongo.Achievement.deleteMany({});
      if (localData.achievements.length > 0) {
        await dbMongo.Achievement.insertMany(localData.achievements);
      }
    }

    // 6. Testimonials
    if (Array.isArray(localData.testimonials)) {
      console.log(`Seeding ${localData.testimonials.length} testimonials...`);
      await dbMongo.Testimonial.deleteMany({});
      if (localData.testimonials.length > 0) {
        await dbMongo.Testimonial.insertMany(localData.testimonials);
      }
    }

    // 7. Certificates
    if (Array.isArray(localData.certificates)) {
      console.log(`Seeding ${localData.certificates.length} certificates...`);
      await dbMongo.Certificate.deleteMany({});
      if (localData.certificates.length > 0) {
        await dbMongo.Certificate.insertMany(localData.certificates);
      }
    }

    // 8. YoutubeVideos
    if (Array.isArray(localData.youtubeVideos)) {
      console.log(`Seeding ${localData.youtubeVideos.length} YouTube videos...`);
      await dbMongo.YoutubeVideo.deleteMany({});
      if (localData.youtubeVideos.length > 0) {
        await dbMongo.YoutubeVideo.insertMany(localData.youtubeVideos);
      }
    }

    // 9. Projects
    if (Array.isArray(localData.projects)) {
      console.log(`Seeding ${localData.projects.length} projects...`);
      await dbMongo.Project.deleteMany({});
      if (localData.projects.length > 0) {
        await dbMongo.Project.insertMany(localData.projects);
      }
    }

    // 10. Messages
    if (Array.isArray(localData.messages)) {
      console.log(`Seeding ${localData.messages.length} messages...`);
      await dbMongo.Message.deleteMany({});
      if (localData.messages.length > 0) {
        await dbMongo.Message.insertMany(localData.messages);
      }
    }

    console.log('✅ Migration complete! All data successfully uploaded to MongoDB Atlas.');
    process.exit(0);

  } catch (seedErr) {
    console.error('❌ An error occurred during database seeding:', seedErr);
    process.exit(1);
  }
}

seed();
