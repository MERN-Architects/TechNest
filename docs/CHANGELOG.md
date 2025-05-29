# Changelog

## [2.0.0] - 2025-05-29

### Removed
- Course management system
  - Removed course creation and management
  - Removed course enrollment functionality
  - Removed certificate generation system
  - Removed course progress tracking
  - Removed all course-related APIs and endpoints

### Changed
- Updated analytics to remove course-related metrics
- Simplified notification system by removing course notifications
- Updated user model to remove course-related fields
- Updated documentation to reflect removal of course features

### Migration Guide
If you're upgrading from v1.x to v2.0.0:

1. Run the cleanup script to remove course-related data:
```bash
cd server
node scripts/cleanupCourses.js
```

2. Update your frontend to remove any course-related features
3. Remove any course-related environment variables
4. Update your analytics tracking to exclude course-related events

For users who need course management features, please continue using v1.x releases or consider using a dedicated Learning Management System (LMS) alongside TechNest.
