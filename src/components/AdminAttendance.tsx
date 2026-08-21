import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { AttendanceRecord, Student, User } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Clock, CheckCircle2, UserCheck, Edit3, Trash2, Plus, Search, MessageSquare, ShieldCheck, X } from 'lucide-react';

export function AdminAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal states
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for edit/create
  const [formStudentId, setFormStudentId] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formCheckInTime, setFormCheckInTime] = useState('');
  const [formCheckInStaffId, setFormCheckInStaffId] = useState('');
  const [formCheckOutTime, setFormCheckOutTime] = useState('');
  const [formCheckOutStaffId, setFormCheckOutStaffId] = useState('');
  const [formPickupPerson, setFormPickupPerson] = useState('');
  const [formSmsSent, setFormSmsSent] = useState(false);
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    const unsubAttendance = db.subscribeAttendance((atts) => {
      setRecords(atts);
    });
    const unsubStudents = db.subscribeStudents((stus) => {
      setStudents(stus);
    });
    const unsubUsers = db.subscribeUsers((uList) => {
      setUsers(uList);
    });

    return () => {
      if (typeof unsubAttendance === 'function') unsubAttendance();
      if (typeof unsubStudents === 'function') unsubStudents();
      if (typeof unsubUsers === 'function') unsubUsers();
    };
  }, []);

  // Helper to resolve staff member name
  const getStaffDisplay = (r: AttendanceRecord) => {
    const findUserName = (idOrUsername?: string) => {
      if (!idOrUsername) return '';
      const found = users.find(u => u.id === idOrUsername || u.username === idOrUsername);
      return found?.name || found?.fullName || idOrUsername;
    };

    const inStaff = r.checkInStaffName || findUserName(r.checkInStaffId);
    const outStaff = r.checkOutStaffName || findUserName(r.checkOutStaffId);

    if (r.checkInMethod === 'student_self' && !inStaff && !outStaff) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-[#8c8a86] bg-[#f8f6f3] px-2.5 py-1 rounded-lg border border-[#edeae6]">
          Self-Service Kiosk
        </span>
      );
    }

    if (inStaff && outStaff) {
      if (inStaff === outStaff) {
        return (
          <div className="text-xs">
            <span className="font-medium text-[#4a4a48]">{inStaff}</span>
            <span className="block text-[10px] text-[#8c8a86]">In & Out</span>
          </div>
        );
      }
      return (
        <div className="text-xs space-y-0.5">
          <div><span className="text-[10px] text-[#8c8a86] font-bold">IN:</span> <span className="font-medium text-[#4a4a48]">{inStaff}</span></div>
          <div><span className="text-[10px] text-[#8c8a86] font-bold">OUT:</span> <span className="font-medium text-[#4a4a48]">{outStaff}</span></div>
        </div>
      );
    }

    if (inStaff) {
      return (
        <div className="text-xs">
          <span className="font-medium text-[#4a4a48]">{inStaff}</span>
          <span className="block text-[10px] text-[#8c8a86]">Check-in staff</span>
        </div>
      );
    }

    if (outStaff) {
      return (
        <div className="text-xs">
          <span className="font-medium text-[#4a4a48]">{outStaff}</span>
          <span className="block text-[10px] text-[#8c8a86]">Check-out staff</span>
        </div>
      );
    }

    if (r.checkInMethod === 'student_self') {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-[#8c8a86] bg-[#f8f6f3] px-2.5 py-1 rounded-lg border border-[#edeae6]">
          Self-Service Kiosk
        </span>
      );
    }

    return <span className="text-xs text-[#8c8a86]">-</span>;
  };

  const openEditModal = (r: AttendanceRecord) => {
    setEditingRecord(r);
    setFormStudentId(r.studentId);
    setFormDate(r.date);
    setFormCheckInTime(r.checkInTime ? format(new Date(r.checkInTime), 'HH:mm') : '');
    setFormCheckInStaffId(r.checkInStaffId || '');
    setFormCheckOutTime(r.checkOutTime ? format(new Date(r.checkOutTime), 'HH:mm') : '');
    setFormCheckOutStaffId(r.checkOutStaffId || '');
    setFormPickupPerson(r.pickupPerson || r.pickupPersonName || '');
    setFormSmsSent(!!r.smsNotificationSent);
    setFormNotes(r.notes || '');
  };

  const openAddModal = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const nowTime = format(new Date(), 'HH:mm');
    setFormStudentId(students[0]?.id || '1001');
    setFormDate(today);
    setFormCheckInTime(nowTime);
    setFormCheckInStaffId(users[0]?.id || '');
    setFormCheckOutTime('');
    setFormCheckOutStaffId('');
    setFormPickupPerson('');
    setFormSmsSent(false);
    setFormNotes('');
    setShowAddModal(true);
  };

  const handleSaveCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const student = students.find(s => s.id === formStudentId);
    const studentName = student ? student.name : (editingRecord.studentName || `Student ${formStudentId}`);

    const inStaff = users.find(u => u.id === formCheckInStaffId || u.username === formCheckInStaffId);
    const outStaff = users.find(u => u.id === formCheckOutStaffId || u.username === formCheckOutStaffId);

    const checkInDateTime = formCheckInTime 
      ? new Date(`${formDate}T${formCheckInTime}:00`).toISOString()
      : null;

    const checkOutDateTime = formCheckOutTime 
      ? new Date(`${formDate}T${formCheckOutTime}:00`).toISOString()
      : null;

    const updated: AttendanceRecord = {
      ...editingRecord,
      studentId: formStudentId,
      studentName,
      date: formDate,
      checkInTime: checkInDateTime,
      checkInStaffId: formCheckInStaffId || null,
      checkInStaffName: inStaff ? inStaff.name : null,
      checkOutTime: checkOutDateTime,
      checkOutStaffId: formCheckOutStaffId || null,
      checkOutStaffName: outStaff ? outStaff.name : null,
      pickupPerson: formPickupPerson || null,
      pickupPersonName: formPickupPerson || null,
      status: checkOutDateTime ? 'checked_out' : 'checked_in',
      smsNotificationSent: formSmsSent,
      notes: formNotes,
      updatedAt: new Date().toISOString()
    };

    await db.saveAttendanceRecord(updated);
    toast.success('Attendance record corrected and synchronized');
    setEditingRecord(null);
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === formStudentId);
    if (!student) {
      toast.error('Please enter or select a valid student ID');
      return;
    }

    const inStaff = users.find(u => u.id === formCheckInStaffId || u.username === formCheckInStaffId);
    const outStaff = users.find(u => u.id === formCheckOutStaffId || u.username === formCheckOutStaffId);

    const checkInDateTime = formCheckInTime 
      ? new Date(`${formDate}T${formCheckInTime}:00`).toISOString()
      : new Date().toISOString();

    const checkOutDateTime = formCheckOutTime 
      ? new Date(`${formDate}T${formCheckOutTime}:00`).toISOString()
      : null;

    const newRecord: AttendanceRecord = {
      id: crypto.randomUUID(),
      studentId: formStudentId,
      studentName: student.name,
      date: formDate,
      checkInTime: checkInDateTime,
      checkInStaffId: formCheckInStaffId || null,
      checkInStaffName: inStaff ? inStaff.name : null,
      checkInMethod: 'staff_manual',
      checkOutTime: checkOutDateTime,
      checkOutStaffId: formCheckOutStaffId || null,
      checkOutStaffName: outStaff ? outStaff.name : null,
      pickupPerson: formPickupPerson || null,
      pickupPersonName: formPickupPerson || null,
      status: checkOutDateTime ? 'checked_out' : 'checked_in',
      smsNotificationSent: formSmsSent,
      notes: formNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.saveAttendanceRecord(newRecord);
    toast.success(`Attendance logged for ${student.name}`);
    setShowAddModal(false);
  };

  const handleDeleteRecord = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete this attendance record for ${name}?`)) {
      await db.deleteAttendanceRecord(id);
      toast.success('Attendance record deleted from database');
    }
  };

  // Filter and sort records descending
  const filtered = records
    .filter(r => (selectedDate ? r.date === selectedDate : true))
    .filter(r => {
      if (!searchTerm.trim()) return true;
      const query = searchTerm.toLowerCase();
      const student = students.find(s => s.id === r.studentId);
      const studentName = (student?.name || r.studentName || '').toLowerCase();
      const staffName = (r.checkInStaffName || r.checkOutStaffName || '').toLowerCase();
      const pickup = (r.pickupPerson || r.pickupPersonName || '').toLowerCase();
      return (
        r.studentId.toLowerCase().includes(query) ||
        studentName.includes(query) ||
        staffName.includes(query) ||
        pickup.includes(query)
      );
    })
    .sort((a, b) => {
      const aTime = a.checkInTime ? new Date(a.checkInTime).getTime() : 0;
      const bTime = b.checkInTime ? new Date(b.checkInTime).getTime() : 0;
      return bTime - aTime;
    });

  const totalCheckIns = filtered.length;
  const activeCheckIns = filtered.filter(r => !r.checkOutTime).length;
  const completedCheckOuts = filtered.filter(r => !!r.checkOutTime).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-[#4a4a48]">Attendance Records</h1>
          <p className="text-[#8c8a86] mt-1 text-sm">View, search, correct, or manually record student attendance records.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#82937f] hover:opacity-90 text-white font-bold rounded-2xl transition-all shadow-sm text-sm"
          >
            <Plus size={16} />
            Add Manual Record
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 bg-white border border-[#e5e1da] rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#82937f] text-[#3c3c3b]"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-xs text-[#8c8a86] hover:text-[#3c3c3b] underline font-bold"
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#e5e1da] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#f8f6f3] flex items-center justify-center text-[#82937f]">
            <UserCheck size={24} />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-[#4a4a48]">{totalCheckIns}</div>
            <div className="text-xs text-[#8c8a86] uppercase font-bold tracking-widest">Total Records</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#e5e1da] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#82937f15] flex items-center justify-center text-[#82937f]">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-[#82937f]">{activeCheckIns}</div>
            <div className="text-xs text-[#8c8a86] uppercase font-bold tracking-widest">Currently Checked In</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#e5e1da] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#d9846615] flex items-center justify-center text-[#d98466]">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-[#d98466]">{completedCheckOuts}</div>
            <div className="text-xs text-[#8c8a86] uppercase font-bold tracking-widest">Checked Out</div>
          </div>
        </div>
      </div>

      {/* Search filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5e1da] shadow-sm flex items-center gap-3">
        <Search size={18} className="text-[#8c8a86]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search records by student name, ID #, staff name, or pickup person..."
          className="w-full bg-transparent outline-none text-sm text-[#3c3c3b]"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-xs text-[#8c8a86] hover:text-[#3c3c3b] font-bold">
            Clear
          </button>
        )}
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-[32px] border border-[#e5e1da] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfaf7] text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold border-b border-[#f2efe9]">
              <tr>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Student</th>
                <th className="px-6 py-5">Check-In</th>
                <th className="px-6 py-5">Check-Out</th>
                <th className="px-6 py-5">Staff Member</th>
                <th className="px-6 py-5">Authorized Pickup</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2efe9] text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-8 text-center text-[#8c8a86]">
                    No attendance records found {selectedDate ? `for ${selectedDate}` : ''}.
                  </td>
                </tr>
              ) : filtered.map(r => {
                const student = students.find(s => s.id === r.studentId);
                const studentDisplayName = student ? student.name : (r.studentName || `ID: ${r.studentId}`);
                const pickupName = r.pickupPerson || r.pickupPersonName;
                return (
                  <tr key={r.id} className="hover:bg-[#fdfcfb] transition-colors text-[#3c3c3b]">
                    <td className="px-6 py-4 text-[#8c8a86] font-medium whitespace-nowrap">
                      {format(new Date(r.date + 'T12:00:00'), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {studentDisplayName}
                      <div className="text-xs text-[#8c8a86] font-mono">ID: {r.studentId}</div>
                    </td>
                    <td className="px-6 py-4 text-[#8c8a86] whitespace-nowrap">
                      {r.checkInTime ? format(new Date(r.checkInTime), 'h:mm a') : '-'}
                    </td>
                    <td className="px-6 py-4 text-[#8c8a86] whitespace-nowrap">
                      {r.checkOutTime ? format(new Date(r.checkOutTime), 'h:mm a') : (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#82937f15] text-[#82937f] border border-[#82937f30]">
                          Active On-Site
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStaffDisplay(r)}
                    </td>
                    <td className="px-6 py-4 text-[#8c8a86]">
                      {pickupName ? (
                        <div>
                          <span className="font-medium text-[#4a4a48]">{pickupName}</span>
                          {r.smsNotificationSent && (
                            <span className="block text-[10px] text-[#82937f] font-semibold flex items-center gap-1">
                              <MessageSquare size={10} /> SMS Sent
                            </span>
                          )}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        r.checkOutTime
                          ? 'bg-[#d9846615] text-[#d98466] border border-[#d9846630]'
                          : 'bg-[#82937f15] text-[#82937f] border border-[#82937f30]'
                      }`}>
                        {r.checkOutTime ? 'Checked Out' : 'Checked In'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                      <button 
                        onClick={() => openEditModal(r)}
                        className="inline-flex items-center gap-1 text-[#82937f] hover:opacity-80 font-bold uppercase tracking-wider text-[10px]"
                        title="Edit Record"
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteRecord(r.id, studentDisplayName)}
                        className="inline-flex items-center gap-1 text-[#d98466] hover:opacity-80 font-bold uppercase tracking-wider text-[10px]"
                        title="Delete Record"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Correct Attendance Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-[32px] p-6 sm:p-8 border border-[#e5e1da] shadow-2xl animate-in zoom-in-95 space-y-6">
            <div className="flex items-center justify-between border-b border-[#e5e1da] pb-4">
              <div>
                <h2 className="text-xl font-serif font-semibold text-[#4a4a48]">Correct Attendance Record</h2>
                <p className="text-xs text-[#8c8a86] mt-0.5">Admin adjustment for ID #{editingRecord.studentId} • {editingRecord.studentName}</p>
              </div>
              <button onClick={() => setEditingRecord(null)} className="text-[#8c8a86] hover:text-[#4a4a48]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCorrection} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Student ID #</label>
                  <input
                    type="text"
                    required
                    value={formStudentId}
                    onChange={e => setFormStudentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Check-In Time</label>
                  <input
                    type="time"
                    value={formCheckInTime}
                    onChange={e => setFormCheckInTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Check-In Staff</label>
                  <select
                    value={formCheckInStaffId}
                    onChange={e => setFormCheckInStaffId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                  >
                    <option value="">-- None / Kiosk --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Check-Out Time</label>
                  <input
                    type="time"
                    value={formCheckOutTime}
                    onChange={e => setFormCheckOutTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Check-Out Staff</label>
                  <select
                    value={formCheckOutStaffId}
                    onChange={e => setFormCheckOutStaffId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                  >
                    <option value="">-- None --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Authorized Pickup Person</label>
                <input
                  type="text"
                  value={formPickupPerson}
                  onChange={e => setFormPickupPerson(e.target.value)}
                  placeholder="e.g. Sarah Smith (Mother)"
                  className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formSmsSent"
                  checked={formSmsSent}
                  onChange={e => setFormSmsSent(e.target.checked)}
                  className="rounded text-[#82937f] focus:ring-[#82937f]"
                />
                <label htmlFor="formSmsSent" className="text-xs text-[#4a4a48] font-medium">
                  Parent SMS notification marked as dispatched
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#e5e1da]">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#82937f] hover:opacity-90 text-white font-bold rounded-xl transition-colors"
                >
                  Save Corrections
                </button>
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-6 py-3 bg-[#f2efe9] text-[#8c8a86] font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Attendance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-[32px] p-6 sm:p-8 border border-[#e5e1da] shadow-2xl animate-in zoom-in-95 space-y-6">
            <div className="flex items-center justify-between border-b border-[#e5e1da] pb-4">
              <div>
                <h2 className="text-xl font-serif font-semibold text-[#4a4a48]">Add Manual Attendance Log</h2>
                <p className="text-xs text-[#8c8a86] mt-0.5">Admin manual log for student attendance records</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-[#8c8a86] hover:text-[#4a4a48]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Select Student</label>
                  <select
                    value={formStudentId}
                    onChange={e => setFormStudentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (ID: {s.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Check-In Time</label>
                  <input
                    type="time"
                    required
                    value={formCheckInTime}
                    onChange={e => setFormCheckInTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Check-In Staff</label>
                  <select
                    value={formCheckInStaffId}
                    onChange={e => setFormCheckInStaffId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                  >
                    <option value="">-- None --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Check-Out Time (Optional)</label>
                  <input
                    type="time"
                    value={formCheckOutTime}
                    onChange={e => setFormCheckOutTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Check-Out Staff</label>
                  <select
                    value={formCheckOutStaffId}
                    onChange={e => setFormCheckOutStaffId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                  >
                    <option value="">-- None --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Authorized Pickup Person</label>
                <input
                  type="text"
                  value={formPickupPerson}
                  onChange={e => setFormPickupPerson(e.target.value)}
                  placeholder="e.g. Sarah Smith (Mother)"
                  className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#e5e1da]">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#82937f] hover:opacity-90 text-white font-bold rounded-xl transition-colors"
                >
                  Create Attendance Record
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 bg-[#f2efe9] text-[#8c8a86] font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

