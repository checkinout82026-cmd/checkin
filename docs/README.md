# MVP Documentation

This folder is the documentation for the ABC Community School check-in system MVP.

Read these files in order:

1. [Overview](./01-overview.md) - product scope, users, capabilities, and known MVP boundaries.
2. [Architecture](./02-architecture.md) - frontend structure, Firebase integration, state flow, and diagrams.
3. [Data Model and Schema](./03-data-model-and-schema.md) - Firestore collections, TypeScript models, sample records, and ERD.
4. [User Flows](./04-user-flows.md) - student, staff, and admin workflows with sequence diagrams.
5. [Operations and Deployment](./05-operations-and-deployment.md) - local setup, build, Firebase setup, seed data, and troubleshooting.
6. [Security and Production Readiness](./06-security-and-production-readiness.md) - current risks, required hardening, and production path.
7. [Tech Stack and Dependencies](./07-tech-stack-and-dependencies.md) - libraries, scripts, build output, and dependency notes.
8. [Credentials](./08-credentials.md) - Firebase credentials, environment variables, and access control.

## Current MVP Summary

The app is a Vite + React + TypeScript single page app using Firebase Firestore as the shared data store. It supports:

- Student self-service check-in and check-out by student ID.
- Staff-assisted student lookup, check-in, check-out, and pickup-person capture.
- Admin attendance review, manual record creation, corrections, and deletion.
- Admin student management.
- Admin staff/admin account management.
- Realtime updates through Firestore `onSnapshot` listeners.
- Local browser fallback/cache through `localStorage`.

Important: authentication, authorization, Firestore rules, and SMS delivery are MVP-level only. See [Security and Production Readiness](./06-security-and-production-readiness.md) before production use.
