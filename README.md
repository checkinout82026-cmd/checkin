# ABC Community School Check-In System

MVP student check-in/check-out system built with Vite, React, TypeScript, Tailwind CSS, and Firebase Firestore.

## Handover Documentation

The complete handover pack is in [docs/](./docs/README.md).

Start here:

1. [Overview](./docs/01-overview.md)
2. [Architecture](./docs/02-architecture.md)
3. [Data Model and Schema](./docs/03-data-model-and-schema.md)
4. [User Flows](./docs/04-user-flows.md)
5. [Operations and Deployment](./docs/05-operations-and-deployment.md)
6. [Security and Production Readiness](./docs/06-security-and-production-readiness.md)
7. [Handover Checklist](./docs/07-handover-checklist.md)
8. [Tech Stack and Dependencies](./docs/08-tech-stack-and-dependencies.md)

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

This project currently uses client-side MVP authentication, open Firestore rules, plaintext demo passwords, and simulated SMS delivery. Do not use real student data until the production hardening items in [Security and Production Readiness](./docs/06-security-and-production-readiness.md) are complete.
