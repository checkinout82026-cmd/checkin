# Credentials and Service Access

## Deployed Link

- URL: https://checkin-out2026.netlify.app/

### Demo App Credentials

Use these demo accounts for MVP testing only.

#### Admin

- Email: `smith.admin@school.com`
- Password: `AdminSmith#2026`

#### Staff

- Email: `adams.staff@school.com`
- Password: `StaffAdams#2026`


## GitHub Repository

- URL: https://github.com/checkinout82026-cmd/checkin/
- Documentation: https://github.com/checkinout82026-cmd/checkin/blob/master/docs/


## GitHub Access

- Credentials: Google login.

## Vercel Access

- Credentials: google login.

## Firebase Access

- Credentials: Google login.
- App config source: `firebase-applet-config.json`.
- Initialization source: `src/lib/firebase.ts`.
- Auth helper source: `src/lib/auth.ts`.

Firebase services currently used:

| Service | Current usage |
| --- | --- |
| Firebase Auth | Staff/admin email/password sign-in and auth-state restore; Google sign-in and password reset are not completed |
| Cloud Firestore | `users`, `students`, `attendance`, and `authorized_pickups` data |
| Firestore Rules | `firestore.rules`; currently MVP/open and must be hardened before production |


