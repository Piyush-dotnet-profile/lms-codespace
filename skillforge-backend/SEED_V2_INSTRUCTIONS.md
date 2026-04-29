# Seed V2 Instructions

This repository now includes a separate v2 seed workflow.

## What was added

- `src/models/CourseV2.js`
- `src/models/UserV2.js`
- `src/seeds-v2.js`
- `npm run seed:v2`

## How to run

```bash
cd /workspaces/codespaces-blank/lms-react/lms-codespace/skillforge-backend
npm run seed:v2
```

## Notes

- This does not modify the existing `Course` or `User` schema.
- It creates new collections: `courses_v2` and `users_v2`.
- The seed script removes existing documents in these v2 collections before inserting fresh sample data.
- Use this for testing new schema compatibility without affecting the old dataset.
