import { Student } from '../types';

const firstNames = [
  'Liam', 'Olivia', 'Noah', 'Emma', 'Oliver', 'Charlotte', 'James', 'Amelia', 'Elijah', 'Sophia',
  'William', 'Isabella', 'Henry', 'Mia', 'Lucas', 'Evelyn', 'Benjamin', 'Harper', 'Theodore', 'Camila',
  'Mateo', 'Gianna', 'Levi', 'Abigail', 'Sebastian', 'Luna', 'Daniel', 'Ella', 'Jack', 'Emily',
  'Alexander', 'Aria', 'Owen', 'Chloe', 'Asher', 'Penelope', 'Samuel', 'Layla', 'Ethan', 'Mila',
  'Leo', 'Nora', 'Jackson', 'Hazel', 'Mason', 'Madison', 'Ezra', 'Ellie', 'John', 'Lily',
  'Hudson', 'Nova', 'Luca', 'Isla', 'Aiden', 'Grace', 'David', 'Violet', 'Jacob', 'Aurora',
  'Logan', 'Riley', 'Luke', 'Zoey', 'Julian', 'Willow', 'Gabriel', 'Emilia', 'Grayson', 'Stella',
  'Wyatt', 'Everly', 'Matthew', 'Hannah', 'Maverick', 'Leah', 'Carter', 'Eliana', 'Isaac', 'Ivy',
  'Jayden', 'Kinsley', 'Anthony', 'Paisley', 'Dylan', 'Addison', 'Lincoln', 'Eleanor', 'Thomas', 'Victoria'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const grades = [
  'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'
];

const adultRelationships = [
  'Mother', 'Father', 'Grandmother', 'Grandfather', 'Aunt', 'Uncle', 'Family Friend'
];

export function generate150Students(): Student[] {
  const students: Student[] = [];
  const baseDate = new Date().toISOString();

  for (let i = 0; i < 150; i++) {
    const id = (1001 + i).toString();
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const studentName = `${firstName} ${lastName}`;
    const grade = grades[i % grades.length];

    const parentFirstName = firstNames[(i + 15) % firstNames.length];
    const parentName = `${parentFirstName} ${lastName}`;
    const parentPhone = `555-${String(1000 + (i * 7) % 9000).padStart(4, '0')}`;
    const parentEmail = `${parentFirstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

    const pickup2Name = `${firstNames[(i + 30) % firstNames.length]} ${lastName}`;
    const pickup3Name = `${firstNames[(i + 45) % firstNames.length]} ${lastNames[(i + 10) % lastNames.length]} (${adultRelationships[i % adultRelationships.length]})`;

    const authorizedPickups = [parentName, pickup2Name, pickup3Name];
    const authorizedPickupDetails = [
      { name: parentName, relationship: 'Primary Guardian', phone: parentPhone, isPrimary: true },
      { name: pickup2Name, relationship: 'Secondary Guardian', phone: `555-${String(2000 + (i * 7) % 8000).padStart(4, '0')}`, isPrimary: false },
      { name: pickup3Name, relationship: adultRelationships[i % adultRelationships.length], phone: `555-${String(3000 + (i * 7) % 7000).padStart(4, '0')}`, isPrimary: false }
    ];

    students.push({
      id,
      name: studentName,
      fullName: studentName,
      gradeLevel: grade,
      parent: {
        name: parentName,
        phone: parentPhone,
        email: parentEmail
      },
      parentName,
      parentPhone,
      parentEmail,
      authorizedPickups,
      authorizedPickupDetails,
      notes: i % 5 === 0 ? 'Allergic to peanuts' : '',
      isActive: true,
      createdAt: baseDate,
      updatedAt: baseDate
    });
  }

  return students;
}
