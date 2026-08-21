# Credentials and Service Access

## Deployed Link

- URL: https://checkin-out2026.netlify.app/

## Demo App Credentials

Use these demo accounts for MVP testing only.

### Admin

- Email: `smith.admin@school.com`
- Password / security PIN: `AdminSmith#2026`

### Staff

- Email: `adams.staff@school.com`
- Password / security PIN: `StaffAdams#2026`

## Student Direct Check-Out Approval

When a student logs in by student ID and clicks **Check Out**, the app does not immediately release the student. It opens the **Staff Authorization** modal.

Required approval steps:

1. Select an authorizing staff/admin account.
2. Enter that staff/admin account's password or security PIN.
3. Click **Approve & Release**.

After approval, the attendance record is saved with:

- `status: checked_out`
- `checkOutTime`
- `checkOutStaffId`
- `checkOutStaffName`
- selected `pickupPerson` / `pickupPersonName`
- simulated SMS fields

MVP note: this staff PIN check currently runs in the browser. Before production use, enforce staff approval through Firebase Auth custom claims, Firestore rules, Cloud Functions, or another backend-controlled workflow.

## GitHub Repository

- URL: https://github.com/checkinout82026-cmd/checkin/
- Documentation: https://github.com/checkinout82026-cmd/checkin/blob/master/docs/

## Google Account

- Access method: school/project Google account, if provided by the receiving team.

## GitHub Access

- Credentials: Google login / organization-managed access.

## Netlify Access

- Credentials: GitHub login / organization-managed access.

## Firebase Access

- Credentials: Google login / Firebase project access.
- App config source: `firebase-applet-config.json`.
- Initialization source: `src/lib/firebase.ts`.
- Auth helper source: `src/lib/auth.ts`.

Firebase services currently used:

| Service | Current usage |
| --- | --- |
| Firebase Auth | Staff/admin email/password sign-in and auth-state restore; Google sign-in and password reset are not completed |
| Cloud Firestore | `users`, `students`, `attendance`, and `authorized_pickups` data |
| Firestore Rules | `firestore.rules`; currently MVP/open and must be hardened before production |

Firebase Console checklist for handoff:

1. Confirm the receiving team has owner/editor access to the Firebase project.
2. Enable Email/Password sign-in under **Authentication > Sign-in method**.
3. Add the Netlify domain and local development host to Firebase Auth authorized domains.
4. Verify the Firestore database ID matches `firestoreDatabaseId` in `firebase-applet-config.json`.
5. Replace open Firestore rules before using real student data.
6. Remove plaintext fallback passwords from Firestore `users` before production.
7. Complete and test Google sign-in/password reset separately if those features are required.
