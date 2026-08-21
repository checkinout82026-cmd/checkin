import { Student } from '../types';

export const TEN_STUDENTS: Student[] = [
  {
    id: '1001',
    name: 'Liam Smith',
    fullName: 'Liam Smith',
    gradeLevel: 'Kindergarten',
    parent: {
      name: 'Olivia Smith',
      phone: '555-0101',
      email: 'olivia.smith@example.com'
    },
    parentName: 'Olivia Smith',
    parentPhone: '555-0101',
    parentEmail: 'olivia.smith@example.com',
    authorizedPickups: ['Olivia Smith', 'James Smith', 'Emma Miller (Aunt)'],
    authorizedPickupDetails: [
      { name: 'Olivia Smith', relationship: 'Mother', phone: '555-0101', isPrimary: true },
      { name: 'James Smith', relationship: 'Father', phone: '555-0102', isPrimary: false },
      { name: 'Emma Miller', relationship: 'Aunt', phone: '555-0103', isPrimary: false }
    ],
    notes: 'Allergic to peanuts. Requires EpiPen on hand.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '1002',
    name: 'Noah Johnson',
    fullName: 'Noah Johnson',
    gradeLevel: 'Grade 1',
    parent: {
      name: 'Sophia Johnson',
      phone: '555-0104',
      email: 'sophia.johnson@example.com'
    },
    parentName: 'Sophia Johnson',
    parentPhone: '555-0104',
    parentEmail: 'sophia.johnson@example.com',
    authorizedPickups: ['Sophia Johnson', 'Lucas Johnson', 'Charlotte Davis (Grandmother)'],
    authorizedPickupDetails: [
      { name: 'Sophia Johnson', relationship: 'Mother', phone: '555-0104', isPrimary: true },
      { name: 'Lucas Johnson', relationship: 'Father', phone: '555-0105', isPrimary: false },
      { name: 'Charlotte Davis', relationship: 'Grandmother', phone: '555-0106', isPrimary: false }
    ],
    notes: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '1003',
    name: 'Emma Williams',
    fullName: 'Emma Williams',
    gradeLevel: 'Grade 2',
    parent: {
      name: 'Henry Williams',
      phone: '555-0107',
      email: 'henry.williams@example.com'
    },
    parentName: 'Henry Williams',
    parentPhone: '555-0107',
    parentEmail: 'henry.williams@example.com',
    authorizedPickups: ['Henry Williams', 'Isabella Williams', 'Evelyn Taylor (Aunt)'],
    authorizedPickupDetails: [
      { name: 'Henry Williams', relationship: 'Father', phone: '555-0107', isPrimary: true },
      { name: 'Isabella Williams', relationship: 'Mother', phone: '555-0108', isPrimary: false },
      { name: 'Evelyn Taylor', relationship: 'Aunt', phone: '555-0109', isPrimary: false }
    ],
    notes: 'Asthma inhaler in nurse office.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '1004',
    name: 'Oliver Brown',
    fullName: 'Oliver Brown',
    gradeLevel: 'Grade 3',
    parent: {
      name: 'Harper Brown',
      phone: '555-0110',
      email: 'harper.brown@example.com'
    },
    parentName: 'Harper Brown',
    parentPhone: '555-0110',
    parentEmail: 'harper.brown@example.com',
    authorizedPickups: ['Harper Brown', 'Theodore Brown', 'Benjamin Brown (Uncle)'],
    authorizedPickupDetails: [
      { name: 'Harper Brown', relationship: 'Mother', phone: '555-0110', isPrimary: true },
      { name: 'Theodore Brown', relationship: 'Father', phone: '555-0111', isPrimary: false },
      { name: 'Benjamin Brown', relationship: 'Uncle', phone: '555-0112', isPrimary: false }
    ],
    notes: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '1005',
    name: 'Amelia Jones',
    fullName: 'Amelia Jones',
    gradeLevel: 'Grade 4',
    parent: {
      name: 'Elijah Jones',
      phone: '555-0113',
      email: 'elijah.jones@example.com'
    },
    parentName: 'Elijah Jones',
    parentPhone: '555-0113',
    parentEmail: 'elijah.jones@example.com',
    authorizedPickups: ['Elijah Jones', 'Camila Jones', 'Gianna White (Grandmother)'],
    authorizedPickupDetails: [
      { name: 'Elijah Jones', relationship: 'Father', phone: '555-0113', isPrimary: true },
      { name: 'Camila Jones', relationship: 'Mother', phone: '555-0114', isPrimary: false },
      { name: 'Gianna White', relationship: 'Grandmother', phone: '555-0115', isPrimary: false }
    ],
    notes: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '1006',
    name: 'Lucas Garcia',
    fullName: 'Lucas Garcia',
    gradeLevel: 'Grade 5',
    parent: {
      name: 'Mateo Garcia',
      phone: '555-0116',
      email: 'mateo.garcia@example.com'
    },
    parentName: 'Mateo Garcia',
    parentPhone: '555-0116',
    parentEmail: 'mateo.garcia@example.com',
    authorizedPickups: ['Mateo Garcia', 'Elena Garcia', 'Carlos Garcia (Uncle)'],
    authorizedPickupDetails: [
      { name: 'Mateo Garcia', relationship: 'Father', phone: '555-0116', isPrimary: true },
      { name: 'Elena Garcia', relationship: 'Mother', phone: '555-0117', isPrimary: false },
      { name: 'Carlos Garcia', relationship: 'Uncle', phone: '555-0118', isPrimary: false }
    ],
    notes: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '1007',
    name: 'Mia Miller',
    fullName: 'Mia Miller',
    gradeLevel: 'Grade 6',
    parent: {
      name: 'Abigail Miller',
      phone: '555-0119',
      email: 'abigail.miller@example.com'
    },
    parentName: 'Abigail Miller',
    parentPhone: '555-0119',
    parentEmail: 'abigail.miller@example.com',
    authorizedPickups: ['Abigail Miller', 'David Miller', 'Grace Clark (Aunt)'],
    authorizedPickupDetails: [
      { name: 'Abigail Miller', relationship: 'Mother', phone: '555-0119', isPrimary: true },
      { name: 'David Miller', relationship: 'Father', phone: '555-0120', isPrimary: false },
      { name: 'Grace Clark', relationship: 'Aunt', phone: '555-0121', isPrimary: false }
    ],
    notes: 'Lactose intolerant.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '1008',
    name: 'Evelyn Davis',
    fullName: 'Evelyn Davis',
    gradeLevel: 'Grade 7',
    parent: {
      name: 'Alexander Davis',
      phone: '555-0122',
      email: 'alexander.davis@example.com'
    },
    parentName: 'Alexander Davis',
    parentPhone: '555-0122',
    parentEmail: 'alexander.davis@example.com',
    authorizedPickups: ['Alexander Davis', 'Chloe Davis', 'Owen Davis (Brother)'],
    authorizedPickupDetails: [
      { name: 'Alexander Davis', relationship: 'Father', phone: '555-0122', isPrimary: true },
      { name: 'Chloe Davis', relationship: 'Mother', phone: '555-0123', isPrimary: false },
      { name: 'Owen Davis', relationship: 'Brother', phone: '555-0124', isPrimary: false }
    ],
    notes: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '1009',
    name: 'James Rodriguez',
    fullName: 'James Rodriguez',
    gradeLevel: 'Grade 8',
    parent: {
      name: 'Layla Rodriguez',
      phone: '555-0125',
      email: 'layla.rodriguez@example.com'
    },
    parentName: 'Layla Rodriguez',
    parentPhone: '555-0125',
    parentEmail: 'layla.rodriguez@example.com',
    authorizedPickups: ['Layla Rodriguez', 'Samuel Rodriguez', 'Ethan Martinez (Family Friend)'],
    authorizedPickupDetails: [
      { name: 'Layla Rodriguez', relationship: 'Mother', phone: '555-0125', isPrimary: true },
      { name: 'Samuel Rodriguez', relationship: 'Father', phone: '555-0126', isPrimary: false },
      { name: 'Ethan Martinez', relationship: 'Family Friend', phone: '555-0127', isPrimary: false }
    ],
    notes: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '1010',
    name: 'Sophia Martinez',
    fullName: 'Sophia Martinez',
    gradeLevel: 'Grade 2',
    parent: {
      name: 'Daniel Martinez',
      phone: '555-0128',
      email: 'daniel.martinez@example.com'
    },
    parentName: 'Daniel Martinez',
    parentPhone: '555-0128',
    parentEmail: 'daniel.martinez@example.com',
    authorizedPickups: ['Daniel Martinez', 'Lily Martinez', 'Jack Wilson (Uncle)'],
    authorizedPickupDetails: [
      { name: 'Daniel Martinez', relationship: 'Father', phone: '555-0128', isPrimary: true },
      { name: 'Lily Martinez', relationship: 'Mother', phone: '555-0129', isPrimary: false },
      { name: 'Jack Wilson', relationship: 'Uncle', phone: '555-0130', isPrimary: false }
    ],
    notes: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function generate10Students(): Student[] {
  return TEN_STUDENTS;
}

// Backwards compatibility alias
export function generate150Students(): Student[] {
  return TEN_STUDENTS;
}

