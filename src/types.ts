export type Role = 'staff' | 'admin' | 'student';

export type AttendanceStatus = 'checked_in' | 'checked_out' | 'absent' | 'excused';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: Role;
  name: string;
  fullName?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Parent {
  name: string;
  phone: string;
  email?: string;
}

export interface AuthorizedPickupPerson {
  id?: string;
  studentId?: string;
  name: string;
  relationship?: string;
  phone?: string;
  isPrimary?: boolean;
  photoUrl?: string;
  createdAt?: string;
}

export interface Student {
  id: string; // The ID # used for check-in (e.g. "1001")
  userId?: string;
  name: string;
  fullName?: string;
  gradeLevel?: string;
  parent: Parent;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  authorizedPickups: string[]; // List of names or descriptions
  authorizedPickupDetails?: AuthorizedPickupPerson[];
  notes?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName?: string;
  date: string; // YYYY-MM-DD
  status?: AttendanceStatus;
  checkInTime: string | null; // ISO string
  checkInStaffId?: string;
  checkInStaffName?: string;
  checkInMethod?: 'kiosk' | 'staff_manual' | 'student_self';
  checkOutTime: string | null; // ISO string
  checkOutStaffId?: string;
  checkOutStaffName?: string;
  pickupPersonId?: string;
  pickupPerson?: string;
  pickupPersonName?: string;
  smsNotificationSent?: boolean;
  smsSentAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
