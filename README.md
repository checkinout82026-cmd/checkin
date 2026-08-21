# ABC Community School Check-In System

MVP student check-in/check-out system built with Vite, React, TypeScript, Tailwind CSS, and Firebase Firestore.

## Documentation

The complete documentation is in [docs/](./docs/README.md).

Start here:

1. [Overview](./docs/01-overview.md)
2. [Architecture](./docs/02-architecture.md)
3. [Data Model and Schema](./docs/03-data-model-and-schema.md)
4. [User Flows](./docs/04-user-flows.md)
5. [Operations and Deployment](./docs/05-operations-and-deployment.md)
6. [Security and Production Readiness](./docs/06-security-and-production-readiness.md)
7. [Tech Stack and Dependencies](./docs/07-tech-stack-and-dependencies.md)
8. [Credentials](./docs/08-CREDENTIALS.md)

## Run Locally

Prerequisite: Node.js.

```bash
npm install
npm run dev
```

The app runs on:

```text
http://localhost:3000
```

## Build and Check

```bash
npm run lint
npm run build
```

## Important MVP Warning

This project now includes Firebase Auth for staff/admin sign-in with Firestore-backed app profiles, but it still keeps MVP fallbacks, open Firestore rules, plaintext demo/fallback passwords, and simulated SMS delivery. Student direct check-out requires staff/admin approval via the Staff Password / Security PIN modal. Do not use real student data until the production hardening items in [Security and Production Readiness](./docs/06-security-and-production-readiness.md) are complete.
