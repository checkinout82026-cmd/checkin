import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Student } from '../types';
import toast from 'react-hot-toast';

export function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isEditing, setIsEditing] = useState<Student | null>(null);

  // Form State
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [pickups, setPickups] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Initial sync and real-time subscription to Firebase Firestore
    const unsubscribe = db.subscribeStudents((updated) => {
      setStudents(updated);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const authorizedPickups = pickups.split(',').map(s => s.trim()).filter(s => s !== '');
    
    const studentData: Student = {
      id: id.trim(),
      name: name.trim(),
      fullName: name.trim(),
      gradeLevel: gradeLevel.trim(),
      parent: { 
        name: parentName.trim(), 
        phone: parentPhone.trim(), 
        email: parentEmail.trim() 
      },
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail.trim(),
      authorizedPickups,
      authorizedPickupDetails: authorizedPickups.map(p => ({
        name: p,
        relationship: 'Authorized Pickup',
        phone: parentPhone.trim(),
        isPrimary: false
      })),
      notes: notes.trim(),
      isActive: true,
      createdAt: isEditing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isEditing) {
      await db.saveStudent(studentData);
      toast.success('Student updated in Firebase');
    } else {
      if (students.find(s => s.id === id.trim())) {
        toast.error('Student ID already exists');
        return;
      }
      await db.saveStudent(studentData);
      toast.success('Student added to Firebase');
    }
    
    resetForm();
  };

  const editStudent = (student: Student) => {
    setIsEditing(student);
    setId(student.id);
    setName(student.name);
    setGradeLevel(student.gradeLevel || '');
    setParentName(student.parent.name || student.parentName || '');
    setParentPhone(student.parent.phone || student.parentPhone || '');
    setParentEmail(student.parent.email || student.parentEmail || '');
    setPickups(student.authorizedPickups.join(', '));
    setNotes(student.notes || '');
  };

  const deleteStudent = async (studentId: string) => {
    if (confirm('Are you sure you want to delete this student from the database?')) {
      await db.deleteStudent(studentId);
      toast.success('Student deleted from Firebase');
    }
  };

  const resetForm = () => {
    setIsEditing(null);
    setId('');
    setName('');
    setGradeLevel('');
    setParentName('');
    setParentPhone('');
    setParentEmail('');
    setPickups('');
    setNotes('');
  };

  const handleResetTo10 = async () => {
    if (confirm('This will reset the student roster to the 10 default students and remove all other student records in Firebase. Continue?')) {
      const loadingToast = toast.loading('Syncing 10 students to Firebase...');
      await db.resetTo10Students();
      toast.dismiss(loadingToast);
      toast.success('Roster successfully updated to 10 students');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-semibold text-[#4a4a48]">Manage Students</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-[#82937f]/15 text-[#5e705b] rounded-full">
              {students.length} Students
            </span>
          </div>
          <p className="text-[#8c8a86] mt-1 text-sm">Add, edit, or remove student records with real-time Firebase synchronization.</p>
        </div>
        <button
          type="button"
          onClick={handleResetTo10}
          className="self-start sm:self-auto px-4 py-2.5 bg-[#f2efe9] hover:bg-[#edeae6] text-[#6b6966] font-medium text-xs rounded-xl transition-colors border border-[#e5e1da]"
        >
          Reset to 10 Students
        </button>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-[#e5e1da] shadow-sm">
        <h2 className="text-lg font-serif font-semibold mb-4 text-[#4a4a48]">{isEditing ? 'Edit Student' : 'Add New Student'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Student ID #</label>
            <input 
              type="text" 
              required 
              value={id} 
              onChange={e => setId(e.target.value)} 
              disabled={!!isEditing} 
              placeholder="e.g. 1004"
              className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#82937f] disabled:opacity-50 text-[#3c3c3b]" 
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Student Full Name</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Liam Parker"
              className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#82937f] text-[#3c3c3b]" 
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Grade / Class</label>
            <input 
              type="text" 
              value={gradeLevel} 
              onChange={e => setGradeLevel(e.target.value)} 
              placeholder="e.g. Grade 3 / Room 102"
              className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#82937f] text-[#3c3c3b]" 
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Parent / Guardian Name</label>
            <input 
              type="text" 
              required 
              value={parentName} 
              onChange={e => setParentName(e.target.value)} 
              placeholder="e.g. Robert Parker"
              className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#82937f] text-[#3c3c3b]" 
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Parent Phone (for Check-out SMS)</label>
            <input 
              type="text" 
              required 
              value={parentPhone} 
              onChange={e => setParentPhone(e.target.value)} 
              placeholder="e.g. 555-0144"
              className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#82937f] text-[#3c3c3b]" 
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Parent Email</label>
            <input 
              type="email" 
              value={parentEmail} 
              onChange={e => setParentEmail(e.target.value)} 
              placeholder="e.g. robert.p@example.com"
              className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#82937f] text-[#3c3c3b]" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Authorized Pickups (comma separated)</label>
            <input 
              type="text" 
              value={pickups} 
              onChange={e => setPickups(e.target.value)} 
              placeholder="e.g. Robert Parker, Elena Parker (Grandmother), Mark Davis (Uncle)" 
              className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#82937f] text-[#3c3c3b]" 
            />
          </div>
          <div className="md:col-span-2 flex gap-3 pt-2">
            <button 
              type="submit" 
              className="px-6 py-3 bg-[#82937f] hover:opacity-90 text-white font-bold rounded-2xl transition-colors"
            >
              {isEditing ? 'Update Student' : 'Add Student'}
            </button>
            {isEditing && (
              <button 
                type="button" 
                onClick={resetForm} 
                className="px-6 py-3 bg-[#f2efe9] hover:bg-[#edeae6] text-[#8c8a86] font-bold rounded-2xl transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-[32px] border border-[#e5e1da] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfaf7] text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold border-b border-[#f2efe9]">
              <tr>
                <th className="px-8 py-5">ID</th>
                <th className="px-8 py-5">Name & Grade</th>
                <th className="px-8 py-5">Parent & Contact</th>
                <th className="px-8 py-5">Authorized Pickups</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2efe9] text-sm">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-8 text-center text-[#8c8a86]">No student records found in database.</td>
                </tr>
              ) : students.map(s => (
                <tr key={s.id} className="hover:bg-[#fdfcfb] transition-colors text-[#3c3c3b]">
                  <td className="px-8 py-4 text-[#8c8a86] font-mono font-semibold">{s.id}</td>
                  <td className="px-8 py-4 font-medium">
                    {s.name}
                    {s.gradeLevel && <span className="block text-xs text-[#8c8a86] font-normal">{s.gradeLevel}</span>}
                  </td>
                  <td className="px-8 py-4">
                    {s.parent.name}
                    <div className="text-xs text-[#8c8a86] mt-0.5">{s.parent.phone}</div>
                    {s.parent.email && <div className="text-xs text-[#a8a6a1]">{s.parent.email}</div>}
                  </td>
                  <td className="px-8 py-4">
                    <div className="max-w-xs truncate text-xs" title={s.authorizedPickups.join(', ')}>
                      {s.authorizedPickups.length > 0 ? s.authorizedPickups.join(', ') : '-'}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right space-x-4">
                    <button onClick={() => editStudent(s)} className="text-[#82937f] hover:opacity-80 font-bold uppercase tracking-wider text-[10px]">Edit</button>
                    <button onClick={() => deleteStudent(s.id)} className="text-[#d98466] hover:opacity-80 font-bold uppercase tracking-wider text-[10px]">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
