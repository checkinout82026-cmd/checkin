# Architecture

## System Architecture

The current app is a browser-only SPA. It does not call an application backend. Staff/admin authentication uses Firebase Auth through the Firebase Web SDK, while app profiles and attendance data live in Firestore. Persistent reads/writes go directly from the browser to Firestore, and the data layer mirrors Firestore data into local component state and `localStorage`.

```mermaid
flowchart TB
  subgraph Client[Browser Client]
    Main[src/main.tsx]
    App[src/App.tsx]
    Login[Login]
    StudentDashboard[StudentDashboard]
    StaffApproval[StaffApprovalModal]
    StaffTerminal[CheckInOut]
    CheckedInList[CheckedInList]
    AdminAttendance[AdminAttendance]
    AdminStudents[AdminStudents]
    AdminStaff[AdminStaff]
    DB[src/lib/db.ts]
    AuthLib[src/lib/auth.ts]
    FirebaseInit[src/lib/firebase.ts]
    Local[(localStorage)]
  end

  subgraph Firebase[Firebase]
    Auth[(Firebase Auth)]
    Firestore[(Cloud Firestore)]
    Rules[firestore.rules]
  end

  Main --> App
  App --> Login
  App --> StudentDashboard
  StudentDashboard --> StaffApproval
  App --> StaffTerminal
  App --> CheckedInList
  App --> AdminAttendance
  App --> AdminStudents
  App --> AdminStaff

  Login --> AuthLib
  Login --> DB
  App --> AuthLib
  StudentDashboard --> DB
  StaffApproval --> DB
  StaffTerminal --> DB
  CheckedInList --> DB
  AdminAttendance --> DB
  AdminStudents --> DB
  AdminStaff --> DB

  AuthLib --> FirebaseInit
  AuthLib --> Auth
  AuthLib --> Firestore
  DB --> Local
  DB --> FirebaseInit
  FirebaseInit --> Auth
  FirebaseInit --> Firestore
  Rules -. applies to .-> Firestore
  DB <--> Firestore
```

## Frontend Composition

`App.tsx` is the top-level coordinator:

- Initializes the data layer through `db.init()`.
- Restores a cached session from `localStorage.activeUser`.
- Subscribes to Firebase Auth state through `subscribeToAuthState()`.
- Routes users to screens by `user.role`.
- Stores the active dashboard tab in component state.

```mermaid
flowchart TD
  Start[App mounted] --> Init[db.init]
  Init --> Restore{activeUser in localStorage?}
  Restore -->|No| LoginScreen[Render Login]
  Restore -->|Yes| Role{user.role}
  Init --> AuthState[Subscribe to Firebase Auth state]
  AuthState -->|Firebase user resolved| Role

  LoginScreen --> Submit[Login success]
  Submit --> Role

  Role -->|student| Student[StudentDashboard]
  Role -->|staff| StaffLayout[DashboardLayout: staff tabs]
  Role -->|admin| AdminLayout[DashboardLayout: admin tabs]

  StaffLayout --> CheckInOut[CheckInOut]
  StaffLayout --> CheckedIn[CheckedInList]

  AdminLayout --> Attendance[AdminAttendance]
  AdminLayout --> Students[AdminStudents]
  AdminLayout --> Staff[AdminStaff]
```

## Component Responsibilities

| Component | Responsibility | Reads | Writes |
| --- | --- | --- | --- |
| `Login` | Student ID login and staff/admin Firebase Auth email/password sign-in; Google sign-in and password reset are not completed | `students`, Firebase Auth, `users` fallback | `activeUser` through parent callback; may create/sync `users` profile |
| `StudentDashboard` | Self-service check-in/out; opens staff approval for direct check-out | `students`, `attendance` | `attendance` after approval |
| `StaffApprovalModal` | Requires staff/admin password or security PIN before releasing student from direct checkout | `users` | None directly; returns authorizing staff to `StudentDashboard` |
| `CheckInOut` | Staff-assisted check-in/out | `students`, `attendance` | `attendance` |
| `CheckedInList` | Current on-site roster | `students`, `attendance` | None |
| `AdminAttendance` | Attendance audit, create, correct, delete | `attendance`, `students`, `users` | `attendance` |
| `AdminStudents` | Student CRUD | `students` | `students` |
| `AdminStaff` | Staff/admin account management | `users` | `users` |
| `DashboardLayout` | Sidebar, tabs, logout | `activeTab`, `user` props | `activeTab`, logout callback |

## Data Access Layer

All app data access is centralized in `src/lib/db.ts`.

### Collections

- `users`
- `students`
- `attendance`
- `authorized_pickups`

### Cache Keys

| Key | Purpose |
| --- | --- |
| `checkin_users` | Local copy of user list |
| `checkin_students` | Local copy of student list |
| `checkin_attendance` | Local copy of attendance records |
| `activeUser` | Cached active app user/session |

### Read/Write Pattern

```mermaid
sequenceDiagram
  participant UI as React Component
  participant DB as db.ts
  participant LS as localStorage
  participant FS as Firestore

  UI->>DB: subscribeStudents(callback)
  DB->>FS: onSnapshot(students)
  FS-->>DB: snapshot data
  DB->>LS: cache JSON
  DB-->>UI: callback(list)

  UI->>DB: saveStudent(student)
  DB->>LS: update local cache first
  DB->>FS: setDoc(students/{id}, merge)
  FS-->>DB: success or error
  Note over DB,UI: On Firestore error, UI keeps local cached state
```

## Initialization and Seeding

`db.init()` runs once per browser session. It:

1. Seeds `localStorage` with default users, generated students, and an empty attendance array if the local keys do not exist.
2. Checks Firestore `users` and seeds default users if empty.
3. Checks Firestore `students` and seeds 150 generated demo students if empty.
4. Checks Firestore `authorized_pickups` and seeds pickup records from generated students if empty.

```mermaid
flowchart TD
  Init[db.init] --> Guard{initialized?}
  Guard -->|Yes| Stop[Return]
  Guard -->|No| LocalUsers{local users exist?}
  LocalUsers -->|No| SeedLocalUsers[Set default users]
  LocalUsers -->|Yes| LocalStudents
  SeedLocalUsers --> LocalStudents{local students exist?}
  LocalStudents -->|No| SeedLocalStudents[Set generated 150 students]
  LocalStudents -->|Yes| LocalAttendance
  SeedLocalStudents --> LocalAttendance{local attendance exists?}
  LocalAttendance -->|No| SeedLocalAttendance[Set empty attendance]
  LocalAttendance -->|Yes| FirestoreChecks
  SeedLocalAttendance --> FirestoreChecks[Check Firestore collections]
  FirestoreChecks --> UsersEmpty{users empty?}
  UsersEmpty -->|Yes| SaveUsers[Batch seed users]
  UsersEmpty -->|No| StudentsEmpty
  SaveUsers --> StudentsEmpty{students empty?}
  StudentsEmpty -->|Yes| SaveStudents[Batch seed students]
  StudentsEmpty -->|No| PickupsEmpty
  SaveStudents --> PickupsEmpty{authorized_pickups empty?}
  PickupsEmpty -->|Yes| SavePickups[Batch seed pickups]
  PickupsEmpty -->|No| Done[Done]
  SavePickups --> Done
```

## Dependency Overview

| Package | Used for |
| --- | --- |
| `react`, `react-dom` | App UI |
| `vite` | Dev server and production build |
| `typescript` | Type checking |
| `firebase` | Firebase Auth, Firestore connection, and realtime listeners |
| `date-fns` | Date formatting and `yyyy-MM-dd` current-day keys |
| `lucide-react` | UI icons |
| `react-hot-toast` | Toast notifications |
| `tailwindcss`, `@tailwindcss/vite` | Styling |
| `clsx`, `tailwind-merge` | Utility class merging through `src/lib/utils.ts` |
| `@google/genai`, `dotenv`, `express`, `motion`, `react-router-dom` | Present in dependencies but not materially used by current source code |

## State Management

There is no global state library. State is local to React components and synchronized by Firestore listeners.

| State | Owner |
| --- | --- |
| Active session user | `App.tsx`, persisted to `localStorage.activeUser` |
| Active admin/staff tab | `App.tsx` |
| Student/user/attendance lists | Component state populated by `db.subscribe*` |
| Data cache | Module-level arrays in `db.ts` plus `localStorage` |

## Routing

No URL routing is currently used. Although `react-router-dom` is installed, screens are switched through state in `App.tsx`.

