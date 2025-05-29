const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupCourseData() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Drop collections related to courses
        const collections = ['courses', 'enrollments', 'certificates'];
        for (const collection of collections) {
            try {
                await mongoose.connection.db.dropCollection(collection);
                console.log(`Dropped collection: ${collection}`);
            } catch (err) {
                if (err.code === 26) {
                    console.log(`Collection ${collection} doesn't exist, skipping...`);
                } else {
                    console.error(`Error dropping ${collection}:`, err);
                }
            }
        }

        // Remove course references from users
        const db = mongoose.connection.db;
        await db.collection('users').updateMany(
            {},
            { 
                $unset: { 
                    'enrolledCourses': "",
                    'teachingCourses': "",
                    'courseProgress': ""
                }
            }
        );
        console.log('Removed course references from users');

        // Remove course-related notifications
        await db.collection('notifications').deleteMany({
            type: { 
                $in: [
                    'course_update',
                    'course_reminder',
                    'certificate_ready',
                    'course_enrollment'
                ]
            }
        });
        console.log('Removed course-related notifications');

        console.log('Course data cleanup completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
}

cleanupCourseData();
