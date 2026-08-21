# User Flows

## Role-Based Navigation

```mermaid
flowchart TD
  Login[Login Screen] --> Mode{Login mode}
  Mode -->|Student| StudentId[Enter Student ID]
  Mode -->|Staff/Admin| Credentials[Enter username and password]

  StudentId --> MatchStudent{Student found?}
  MatchStudent -->|No| StudentError[Show error]
  MatchStudent -->|Yes| StudentDashboard[StudentDashboard]

  Credentials --> MatchUser{User credentials valid?}
  MatchUser -->|No| StaffError[Show error]
  MatchUser -->|Yes| Role{Role}

  Role -->|staff| StaffTabs[Staff dashboard]
  Role -->|admin| AdminTabs[Admin dashboard]
  Role -->|student| StudentDashboard

  StaffTabs --> StaffCheck[Check In / Out]
  StaffTabs --> StaffRoster[Checked-In List]

  AdminTabs --> AdminAttendance[Attendance Records]
  AdminTabs --> AdminStudents[Manage Students]
  AdminTabs --> AdminStaff[Manage Staff]
```

## Student Self-Service Check-In

```mermaid
sequenceDiagram
  participant Student
  participant Login
  participant App
  participant Dashboard as StudentDashboard
  participant DB as db.ts
  participant FS as Firestore

  Student->>Login: Enter student ID
  Login->>DB: subscribeStudents data already loaded
  Login-->>Student: Show matching profile preview
  Student->>Login: Continue
  Login->>App: onLogin(student user)
  App->>Dashboard: Render student view
  Dashboard->>DB: subscribeStudents + subscribeAttendance
  Student->>Dashboard: Click Check In
  Dashboard->>DB: saveAttendanceRecord(new checked_in record)
  DB->>FS: setDoc(attendance/{uuid})
  DB-->>Dashboard: Update state
  Dashboard-->>Student: Success toast and kiosk countdown
```

### Resulting Attendance Data

- `status`: `checked_in`
- `checkInMethod`: `student_self`
- `checkInTime`: current ISO time
- `checkOutTime`: `null`
- `smsNotificationSent`: `false`

## Student Self-Service Check-Out

```mermaid
sequenceDiagram
  participant Student
  participant Dashboard as StudentDashboard
  participant DB as db.ts
  participant FS as Firestore

  Student->>Dashboard: Select pickup person if available
  Student->>Dashboard: Click Check Out
  Dashboard->>DB: saveAttendanceRecord(updated/new checked_out record)
  DB->>FS: setDoc(attendance/{id})
  Dashboard-->>Student: Success toast
  Dashboard-->>Student: Show simulated SMS notification
  Dashboard-->>Student: Auto-return countdown
```

### Resulting Attendance Data

- `status`: `checked_out`
- `checkOutTime`: current ISO time
- `pickupPerson` and `pickupPersonName`: selected pickup or fallback
- `smsNotificationSent`: `true`
- `smsSentAt`: current ISO time

## Staff-Assisted Check-In

```mermaid
sequenceDiagram
  participant Staff
  participant Terminal as CheckInOut
  participant DB as db.ts
  participant FS as Firestore

  Staff->>Terminal: Type student ID or name
  Terminal-->>Staff: Show suggestions
  Staff->>Terminal: Select/lookup student
  Terminal->>DB: Find today's attendance in subscribed records
  Terminal-->>Staff: Show student profile and status
  Staff->>Terminal: Click Check In
  Terminal->>DB: saveAttendanceRecord(new record)
  DB->>FS: setDoc(attendance/{uuid})
  Terminal-->>Staff: Success toast
```

### Staff Check-In Audit Fields

- `checkInStaffId`: logged-in staff/admin user ID.
- `checkInStaffName`: logged-in staff/admin name.
- `checkInMethod`: `staff_manual`.

## Staff-Assisted Check-Out

```mermaid
sequenceDiagram
  participant Staff
  participant Terminal as CheckInOut
  participant DB as db.ts
  participant FS as Firestore

  Staff->>Terminal: Lookup checked-in student
  Terminal-->>Staff: Show authorized pickup selector
  Staff->>Terminal: Select pickup or enter custom pickup
  Staff->>Terminal: Complete Check-Out
  Terminal->>DB: saveAttendanceRecord(updated checked_out record)
  DB->>FS: setDoc(attendance/{id}, merge)
  Terminal-->>Staff: Show simulated SMS delivery preview
```

### Pickup Validation

The UI requires a pickup person string before completing staff-assisted check-out. The app does not validate custom pickup against a database-side policy.

## Admin Attendance Management

```mermaid
flowchart TD
  Attendance[Attendance Records Screen] --> Subscriptions[Subscribe to attendance, students, users]
  Subscriptions --> Table[Display searchable table]
  Table --> Filter[Filter by date/search]
  Table --> Add[Add Manual Record]
  Table --> Correct[Correct Record]
  Table --> Delete[Delete Record]

  Add --> SaveNew[saveAttendanceRecord with new UUID]
  Correct --> SaveExisting[saveAttendanceRecord existing ID]
  Delete --> DeleteDoc[deleteAttendanceRecord]

  SaveNew --> Firestore[(Firestore)]
  SaveExisting --> Firestore
  DeleteDoc --> Firestore
```

## Admin Student Management

```mermaid
flowchart TD
  ManageStudents[Manage Students] --> Subscribe[subscribeStudents]
  Subscribe --> List[Render student table]
  List --> AddStudent[Add form]
  List --> EditStudent[Edit existing]
  List --> DeleteStudent[Delete]
  AddStudent --> Validate{ID already exists?}
  Validate -->|Yes| Error[Show duplicate error]
  Validate -->|No| Save[saveStudent]
  EditStudent --> Save
  DeleteStudent --> Confirm{Confirm browser dialog}
  Confirm -->|Yes| Delete[deleteStudent]
  Save --> Firestore[(Firestore students)]
  Delete --> Firestore
```

## Admin Staff/Admin Management

```mermaid
flowchart TD
  ManageStaff[Manage Staff & Admins] --> Subscribe[subscribeUsers]
  Subscribe --> List[Render users except role=student]
  List --> AddUser[Add Staff Member form]
  AddUser --> ValidateUsername{Username taken?}
  ValidateUsername -->|Yes| Error[Show error]
  ValidateUsername -->|No| SaveUser[saveUser]
  List --> DeleteUser[Delete account]
  DeleteUser --> Confirm{Confirm browser dialog}
  Confirm -->|Yes| Remove[deleteUser]
  SaveUser --> Firestore[(Firestore users)]
  Remove --> Firestore
```

## Checked-In Roster

The staff checked-in roster filters attendance records where:

- `date` equals today's `yyyy-MM-dd`.
- `checkInTime` is not null.
- `checkOutTime` is falsy/null.

It joins each record to a student profile by `studentId` for display.

