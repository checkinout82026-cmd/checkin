import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  writeBatch
} from 'firebase/firestore';
import { firestore } from './firebase';
import { User, Student, AttendanceRecord, AuthorizedPickupPerson } from '../types';
import { generate150Students } from './seedData';

const USERS_KEY = 'checkin_users';
const STUDENTS_KEY = 'checkin_students';
const ATTENDANCE_KEY = 'checkin_attendance';

export const defaultUsers: User[] = [
  { 
    id: 'u1', 
    username: 'admin1', 
    password: 'password', 
    role: 'admin', 
    name: 'Alice Admin', 
    fullName: 'Alice Admin', 
    email: 'alice.admin@school.org', 
    phone: '555-0191', 
    isActive: true, 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  },
  { 
    id: 'u2', 
    username: 'admin2', 
    password: 'password', 
    role: 'admin', 
    name: 'Bob Admin', 
    fullName: 'Bob Admin', 
    email: 'bob.admin@school.org', 
    phone: '555-0192', 
    isActive: true, 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  },
  { 
    id: 'u3', 
    username: 'staff1', 
    password: 'password', 
    role: 'staff', 
    name: 'Charlie Staff', 
    fullName: 'Charlie Staff', 
    email: 'charlie.staff@school.org', 
    phone: '555-0193', 
    isActive: true, 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  },
  { 
    id: 'u4', 
    username: 'staff2', 
    password: 'password', 
    role: 'staff', 
    name: 'Diana Staff', 
    fullName: 'Diana Staff', 
    email: 'diana.staff@school.org', 
    phone: '555-0194', 
    isActive: true, 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  },
];

export const defaultStudents: Student[] = generate150Students();

// In-memory cache synced with Firestore and local fallback
let cachedUsers: User[] = defaultUsers;
let cachedStudents: Student[] = defaultStudents;
let cachedAttendance: AttendanceRecord[] = [];
let initialized = false;

export const db = {
  // Sync methods (reads from cache, writes to cache + Firestore)
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    if (data) {
      try {
        cachedUsers = JSON.parse(data);
      } catch (e) {
        console.error('Error parsing cached users', e);
      }
    }
    return cachedUsers;
  },

  saveUsers: async (users: User[]) => {
    cachedUsers = users;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    try {
      const batch = writeBatch(firestore);
      users.forEach(u => {
        const ref = doc(firestore, 'users', u.id);
        batch.set(ref, {
          id: u.id,
          username: u.username,
          password: u.password || 'password',
          name: u.name || u.fullName || '',
          fullName: u.fullName || u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          role: u.role,
          isActive: u.isActive !== undefined ? u.isActive : true,
          createdAt: u.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn('Firestore saveUsers error (using local state):', err);
    }
  },

  saveUser: async (user: User) => {
    const current = db.getUsers();
    const index = current.findIndex(u => u.id === user.id);
    let updated: User[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = user;
    } else {
      updated = [...current, user];
    }
    cachedUsers = updated;
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));

    try {
      const ref = doc(firestore, 'users', user.id);
      await setDoc(ref, {
        id: user.id,
        username: user.username,
        password: user.password || 'password',
        name: user.name || user.fullName || '',
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role,
        isActive: user.isActive !== undefined ? user.isActive : true,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore saveUser error:', err);
    }
  },

  deleteUser: async (id: string) => {
    const current = db.getUsers().filter(u => u.id !== id);
    cachedUsers = current;
    localStorage.setItem(USERS_KEY, JSON.stringify(current));
    try {
      await deleteDoc(doc(firestore, 'users', id));
    } catch (err) {
      console.warn('Firestore deleteUser error:', err);
    }
  },

  getStudents: (): Student[] => {
    const data = localStorage.getItem(STUDENTS_KEY);
    if (data) {
      try {
        cachedStudents = JSON.parse(data);
      } catch (e) {
        console.error('Error parsing cached students', e);
      }
    }
    return cachedStudents;
  },

  saveStudents: async (students: Student[]) => {
    cachedStudents = students;
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    try {
      const batch = writeBatch(firestore);
      students.forEach(s => {
        const ref = doc(firestore, 'students', s.id);
        batch.set(ref, {
          id: s.id,
          userId: s.userId || null,
          name: s.name || s.fullName || '',
          fullName: s.fullName || s.name || '',
          gradeLevel: s.gradeLevel || '',
          parentName: s.parentName || s.parent?.name || '',
          parentPhone: s.parentPhone || s.parent?.phone || '',
          parentEmail: s.parentEmail || s.parent?.email || '',
          parent: s.parent,
          authorizedPickups: s.authorizedPickups || [],
          authorizedPickupDetails: s.authorizedPickupDetails || [],
          notes: s.notes || '',
          isActive: s.isActive !== undefined ? s.isActive : true,
          createdAt: s.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn('Firestore saveStudents error:', err);
    }
  },

  saveStudent: async (student: Student) => {
    const current = db.getStudents();
    const index = current.findIndex(s => s.id === student.id);
    let updated: Student[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = student;
    } else {
      updated = [...current, student];
    }
    cachedStudents = updated;
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(updated));

    try {
      const ref = doc(firestore, 'students', student.id);
      await setDoc(ref, {
        id: student.id,
        userId: student.userId || null,
        name: student.name || student.fullName || '',
        fullName: student.fullName || student.name || '',
        gradeLevel: student.gradeLevel || '',
        parentName: student.parentName || student.parent?.name || '',
        parentPhone: student.parentPhone || student.parent?.phone || '',
        parentEmail: student.parentEmail || student.parent?.email || '',
        parent: student.parent,
        authorizedPickups: student.authorizedPickups || [],
        authorizedPickupDetails: student.authorizedPickupDetails || [],
        notes: student.notes || '',
        isActive: student.isActive !== undefined ? student.isActive : true,
        createdAt: student.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore saveStudent error:', err);
    }
  },

  deleteStudent: async (id: string) => {
    const current = db.getStudents().filter(s => s.id !== id);
    cachedStudents = current;
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(current));
    try {
      await deleteDoc(doc(firestore, 'students', id));
    } catch (err) {
      console.warn('Firestore deleteStudent error:', err);
    }
  },

  getAttendance: (): AttendanceRecord[] => {
    const data = localStorage.getItem(ATTENDANCE_KEY);
    if (data) {
      try {
        cachedAttendance = JSON.parse(data);
      } catch (e) {
        console.error('Error parsing cached attendance', e);
      }
    }
    return cachedAttendance;
  },

  saveAttendance: async (records: AttendanceRecord[]) => {
    cachedAttendance = records;
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
    try {
      const batch = writeBatch(firestore);
      records.forEach(r => {
        const ref = doc(firestore, 'attendance', r.id);
        batch.set(ref, {
          id: r.id,
          studentId: r.studentId,
          studentName: r.studentName || '',
          date: r.date,
          status: r.status || (r.checkOutTime ? 'checked_out' : 'checked_in'),
          checkInTime: r.checkInTime,
          checkInStaffId: r.checkInStaffId || null,
          checkInStaffName: r.checkInStaffName || null,
          checkInMethod: r.checkInMethod || 'kiosk',
          checkOutTime: r.checkOutTime || null,
          checkOutStaffId: r.checkOutStaffId || null,
          checkOutStaffName: r.checkOutStaffName || null,
          pickupPersonId: r.pickupPersonId || null,
          pickupPerson: r.pickupPerson || r.pickupPersonName || null,
          pickupPersonName: r.pickupPersonName || r.pickupPerson || null,
          smsNotificationSent: r.smsNotificationSent || false,
          smsSentAt: r.smsSentAt || null,
          notes: r.notes || '',
          createdAt: r.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn('Firestore saveAttendance error:', err);
    }
  },

  saveAttendanceRecord: async (record: AttendanceRecord) => {
    const current = db.getAttendance();
    const index = current.findIndex(r => r.id === record.id);
    let updated: AttendanceRecord[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = record;
    } else {
      updated = [...current, record];
    }
    cachedAttendance = updated;
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(updated));

    try {
      const ref = doc(firestore, 'attendance', record.id);
      await setDoc(ref, {
        id: record.id,
        studentId: record.studentId,
        studentName: record.studentName || '',
        date: record.date,
        status: record.status || (record.checkOutTime ? 'checked_out' : 'checked_in'),
        checkInTime: record.checkInTime,
        checkInStaffId: record.checkInStaffId || null,
        checkInStaffName: record.checkInStaffName || null,
        checkInMethod: record.checkInMethod || 'kiosk',
        checkOutTime: record.checkOutTime || null,
        checkOutStaffId: record.checkOutStaffId || null,
        checkOutStaffName: record.checkOutStaffName || null,
        pickupPersonId: record.pickupPersonId || null,
        pickupPerson: record.pickupPerson || record.pickupPersonName || null,
        pickupPersonName: record.pickupPersonName || record.pickupPerson || null,
        smsNotificationSent: record.smsNotificationSent || false,
        smsSentAt: record.smsSentAt || null,
        notes: record.notes || '',
        createdAt: record.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore saveAttendanceRecord error:', err);
    }
  },

  deleteAttendanceRecord: async (id: string) => {
    const current = db.getAttendance().filter(r => r.id !== id);
    cachedAttendance = current;
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(current));
    try {
      await deleteDoc(doc(firestore, 'attendance', id));
    } catch (err) {
      console.warn('Firestore deleteAttendanceRecord error:', err);
    }
  },

  seed150Students: async () => {
    const list = generate150Students();
    await db.saveStudents(list);
    return list;
  },

  // Listeners for real-time sync with Firebase
  subscribeUsers: (callback: (users: User[]) => void) => {
    try {
      const q = collection(firestore, 'users');
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: User[] = [];
          snapshot.forEach(docSnap => {
            list.push(docSnap.data() as User);
          });
          cachedUsers = list;
          localStorage.setItem(USERS_KEY, JSON.stringify(list));
          callback(list);
        } else {
          callback(db.getUsers());
        }
      }, (err) => {
        console.warn('Users onSnapshot error:', err);
        callback(db.getUsers());
      });
    } catch (e) {
      console.warn('Users subscribe failed:', e);
      callback(db.getUsers());
      return () => {};
    }
  },

  subscribeStudents: (callback: (students: Student[]) => void) => {
    try {
      const q = collection(firestore, 'students');
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: Student[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            list.push({
              id: data.id || docSnap.id,
              name: data.name || data.fullName || '',
              fullName: data.fullName || data.name || '',
              gradeLevel: data.gradeLevel || '',
              parent: data.parent || { name: data.parentName || '', phone: data.parentPhone || '', email: data.parentEmail || '' },
              parentName: data.parentName || data.parent?.name || '',
              parentPhone: data.parentPhone || data.parent?.phone || '',
              parentEmail: data.parentEmail || data.parent?.email || '',
              authorizedPickups: data.authorizedPickups || [],
              authorizedPickupDetails: data.authorizedPickupDetails || [],
              notes: data.notes || '',
              isActive: data.isActive !== undefined ? data.isActive : true,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt
            });
          });
          cachedStudents = list;
          localStorage.setItem(STUDENTS_KEY, JSON.stringify(list));
          callback(list);
        } else {
          callback(db.getStudents());
        }
      }, (err) => {
        console.warn('Students onSnapshot error:', err);
        callback(db.getStudents());
      });
    } catch (e) {
      console.warn('Students subscribe failed:', e);
      callback(db.getStudents());
      return () => {};
    }
  },

  subscribeAttendance: (callback: (records: AttendanceRecord[]) => void) => {
    try {
      const q = collection(firestore, 'attendance');
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: AttendanceRecord[] = [];
          snapshot.forEach(docSnap => {
            list.push(docSnap.data() as AttendanceRecord);
          });
          cachedAttendance = list;
          localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(list));
          callback(list);
        } else {
          callback(db.getAttendance());
        }
      }, (err) => {
        console.warn('Attendance onSnapshot error:', err);
        callback(db.getAttendance());
      });
    } catch (e) {
      console.warn('Attendance subscribe failed:', e);
      callback(db.getAttendance());
      return () => {};
    }
  },

  // Seed DB in Firestore if empty
  init: async () => {
    if (initialized) return;
    initialized = true;

    // Load local storage first for instant render
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      cachedUsers = defaultUsers;
    }
    if (!localStorage.getItem(STUDENTS_KEY)) {
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(defaultStudents));
      cachedStudents = defaultStudents;
    }
    if (!localStorage.getItem(ATTENDANCE_KEY)) {
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify([]));
      cachedAttendance = [];
    }

    // Check & seed Firestore collections
    try {
      const usersSnap = await getDocs(collection(firestore, 'users'));
      if (usersSnap.empty) {
        console.log('Seeding initial users to Firestore...');
        await db.saveUsers(defaultUsers);
      }

      const studentsSnap = await getDocs(collection(firestore, 'students'));
      if (studentsSnap.empty) {
        console.log('Seeding initial students to Firestore...');
        await db.saveStudents(defaultStudents);
      }

      // Also seed authorized_pickups collection for relational representation
      const pickupsSnap = await getDocs(collection(firestore, 'authorized_pickups'));
      if (pickupsSnap.empty) {
        const batch = writeBatch(firestore);
        defaultStudents.forEach(s => {
          (s.authorizedPickupDetails || []).forEach(p => {
            const pId = crypto.randomUUID();
            const pRef = doc(firestore, 'authorized_pickups', pId);
            batch.set(pRef, {
              id: pId,
              studentId: s.id,
              name: p.name,
              relationship: p.relationship || 'Guardian',
              phone: p.phone || s.parent.phone,
              isPrimary: p.isPrimary || false,
              createdAt: new Date().toISOString()
            });
          });
        });
        await batch.commit();
      }
    } catch (err) {
      console.warn('Firestore initialization seed notice:', err);
    }
  }
};
