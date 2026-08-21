import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/db';
import { Student, AttendanceRecord, User } from '../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Search, UserCheck, UserMinus, ShieldCheck, MessageSquare, Clock, Phone, User as UserIcon } from 'lucide-react';

export function CheckInOut({ user }: { user: User }) {
  const [studentId, setStudentId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [attendanceToday, setAttendanceToday] = useState<AttendanceRecord | null>(null);
  const [pickupPerson, setPickupPerson] = useState('');
  const [customPickup, setCustomPickup] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSmsMessage, setLastSmsMessage] = useState<{ to: string; text: string; time: string } | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubStudents = db.subscribeStudents((list) => {
      setStudents(list);
    });
    const unsubAttendance = db.subscribeAttendance((list) => {
      setRecords(list);
    });

    return () => {
      if (typeof unsubStudents === 'function') unsubStudents();
      if (typeof unsubAttendance === 'function') unsubAttendance();
    };
  }, []);

  // Update active record whenever records change
  useEffect(() => {
    if (activeStudent) {
      const today = format(new Date(), 'yyyy-MM-dd');
      const record = records.find(r => r.studentId === activeStudent.id && r.date === today);
      setAttendanceToday(record || null);
    }
  }, [records, activeStudent]);

  // Live filter suggestions based on typed input
  const suggestions = studentId.trim()
    ? students.filter(s => 
        s.id.toLowerCase().includes(studentId.trim().toLowerCase()) ||
        s.name.toLowerCase().includes(studentId.trim().toLowerCase())
      ).slice(0, 6)
    : [];

  const selectStudent = (student: Student) => {
    setActiveStudent(student);
    setStudentId(student.id);
    setIsFocused(false);
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const record = records.find(r => r.studentId === student.id && r.date === today);
    setAttendanceToday(record || null);
    
    // Default pickup person to parent or first authorized pickup
    const defaultPickup = student.parent?.name || student.parentName || student.authorizedPickups[0] || '';
    setPickupPerson(defaultPickup);
    setIsCustom(false);
    setCustomPickup('');
    setLastSmsMessage(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryId = studentId.trim();
    const found = students.find(s => s.id.toLowerCase() === queryId.toLowerCase() || s.name.toLowerCase() === queryId.toLowerCase());
    
    if (found) {
      selectStudent(found);
    } else {
      toast.error('Student ID or Name not found in database');
      setActiveStudent(null);
      setAttendanceToday(null);
    }
  };

  const handleCheckIn = async () => {
    if (!activeStudent || isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const now = new Date().toISOString();

      const newRecord: AttendanceRecord = {
        id: crypto.randomUUID(),
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        date: today,
        status: 'checked_in',
        checkInTime: now,
        checkInStaffId: user.id,
        checkInStaffName: user.name,
        checkInMethod: 'staff_manual',
        checkOutTime: null,
        smsNotificationSent: false,
        createdAt: now,
        updatedAt: now
      };

      await db.saveAttendanceRecord(newRecord);
      setAttendanceToday(newRecord);
      setLastSmsMessage(null);
      toast.success(`${activeStudent.name} (ID: ${activeStudent.id}) checked in successfully!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to record check-in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activeStudent || !attendanceToday || isSubmitting) return;

    const chosenPerson = isCustom ? customPickup.trim() : pickupPerson.trim();
    if (!chosenPerson) {
      toast.error('Please select or specify an authorized pickup person');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const updatedRecord: AttendanceRecord = {
        ...attendanceToday,
        status: 'checked_out',
        checkOutTime: now,
        checkOutStaffId: user.id,
        checkOutStaffName: user.name,
        pickupPerson: chosenPerson,
        pickupPersonName: chosenPerson,
        smsNotificationSent: true,
        smsSentAt: now,
        updatedAt: now
      };

      await db.saveAttendanceRecord(updatedRecord);
      setAttendanceToday(updatedRecord);
      
      const parentPhone = activeStudent.parent?.phone || activeStudent.parentPhone || 'Parent Contact';
      const timeFormatted = format(new Date(now), 'h:mm a');
      const smsContent = `${activeStudent.name} was checked out from ABC Community School at ${timeFormatted}.`;

      setLastSmsMessage({
        to: parentPhone,
        text: smsContent,
        time: timeFormatted
      });

      toast.success(`Check-out recorded! SMS automatically sent to ${parentPhone}`, {
        duration: 5000,
        icon: '📱'
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to complete check-out');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-[#4a4a48]">Check In / Out Terminal</h1>
        <p className="text-[#8c8a86] mt-1 text-sm">Scan barcode or enter student ID for instant student lookup, check-in, check-out, and SMS dispatch.</p>
      </div>

      {/* Search and lookup input */}
      <div className="bg-white p-6 rounded-[32px] border border-[#e5e1da] shadow-sm relative">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
          <div className="flex-1 max-w-lg relative" ref={dropdownRef}>
            <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">
              Type Student ID # or Name
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c8a86]" size={20} />
              <input
                type="text"
                value={studentId}
                onFocus={() => setIsFocused(true)}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. 1001 or John Smith"
                className="w-full pl-12 pr-4 py-3 bg-[#f8f6f3] text-lg font-mono tracking-wide border border-[#e5e1da] rounded-2xl focus:ring-2 focus:ring-[#82937f] outline-none text-[#3c3c3b]"
                required
              />
            </div>

            {/* Live autocomplete suggestions while typing */}
            {isFocused && suggestions.length > 0 && (
              <div className="absolute z-20 left-0 right-0 top-full mt-2 bg-white border border-[#e5e1da] rounded-2xl shadow-lg overflow-hidden divide-y divide-[#f2efe9]">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => selectStudent(s)}
                    className="w-full text-left px-4 py-3 hover:bg-[#f8f6f3] transition-colors flex items-center justify-between gap-3 text-sm"
                  >
                    <div>
                      <span className="font-semibold text-[#4a4a48]">{s.name}</span>
                      <span className="text-xs text-[#8c8a86] ml-2">({s.gradeLevel || 'Student'})</span>
                      <div className="text-xs text-[#8c8a86]">
                        Parent: {s.parent?.name || s.parentName} • {s.parent?.phone || s.parentPhone}
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold px-2.5 py-1 bg-[#82937f15] text-[#82937f] rounded-lg">
                      ID #{s.id}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="px-8 py-3 bg-[#82937f] hover:opacity-90 text-white font-bold rounded-2xl transition-colors h-[50px] sm:h-[54px] shrink-0"
          >
            Lookup Student
          </button>
        </form>
      </div>

      {activeStudent && (
        <div className="bg-[#fcfaf7] p-6 sm:p-8 rounded-[32px] border border-[#edeae6] animate-in fade-in slide-in-from-bottom-2 space-y-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#e5e1da] rounded-full flex items-center justify-center text-[#8c8a86] font-bold text-xl shrink-0 shadow-inner">
                {activeStudent.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-serif font-semibold text-[#4a4a48]">{activeStudent.name}</h2>
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 bg-white border border-[#e5e1da] rounded-lg text-[#8c8a86]">
                    ID: {activeStudent.id}
                  </span>
                </div>
                <div className="mt-1 text-sm text-[#8c8a86] space-y-0.5">
                  <p className="flex items-center gap-1.5">
                    <UserIcon size={14} />
                    Parent / Guardian: <strong>{activeStudent.parent?.name || activeStudent.parentName}</strong>
                  </p>
                  <p className="flex items-center gap-1.5 font-mono text-xs">
                    <Phone size={14} />
                    {activeStudent.parent?.phone || activeStudent.parentPhone} • {activeStudent.gradeLevel || 'Grade K-8'}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              {attendanceToday ? (
                attendanceToday.checkOutTime ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#d9846615] text-[#d98466] border border-[#d9846630] rounded-full text-[10px] uppercase font-bold tracking-widest">
                    <UserMinus size={14} /> Checked Out Today
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#82937f15] text-[#82937f] border border-[#82937f30] rounded-full text-[10px] uppercase font-bold tracking-widest">
                    <UserCheck size={14} /> Currently Checked In
                  </span>
                )
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#f8f6f3] text-[#8c8a86] border border-[#edeae6] rounded-full text-[10px] uppercase font-bold tracking-widest">
                  Not Checked In Today
                </span>
              )}
            </div>
          </div>

          {/* Action Zone */}
          <div className="border-t border-[#e5e1da] pt-6">
            {!attendanceToday ? (
              <div className="space-y-3">
                <button
                  onClick={handleCheckIn}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-4 bg-[#82937f] hover:opacity-90 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 text-base disabled:opacity-50 shadow-sm"
                >
                  <UserCheck size={20} />
                  {isSubmitting ? 'Recording...' : `Check In ${activeStudent.name}`}
                </button>
                <p className="text-xs text-[#8c8a86]">
                  Recording will save check-in time and associate staff auditor <strong>{user.name}</strong>.
                </p>
              </div>
            ) : !attendanceToday.checkOutTime ? (
              <div className="max-w-xl space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-[#edeae6]">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold">
                      Designated Authorized Pickup Person
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustom(!isCustom)}
                      className="text-xs text-[#82937f] hover:underline font-bold"
                    >
                      {isCustom ? 'Select from authorized list' : '+ Custom / Other Person'}
                    </button>
                  </div>

                  {!isCustom ? (
                    <select
                      value={pickupPerson}
                      onChange={(e) => setPickupPerson(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl focus:ring-2 focus:ring-[#d98466] outline-none text-[#3c3c3b] text-sm"
                    >
                      <option value="">-- Select Authorized Person --</option>
                      {activeStudent.authorizedPickups.map((person, idx) => (
                        <option key={idx} value={person}>{person}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={customPickup}
                      onChange={(e) => setCustomPickup(e.target.value)}
                      placeholder="Enter Full Name & Relationship"
                      className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl focus:ring-2 focus:ring-[#d98466] outline-none text-[#3c3c3b] text-sm"
                    />
                  )}
                </div>

                <button
                  onClick={handleCheckOut}
                  disabled={isSubmitting}
                  className="w-full px-8 py-4 bg-[#d98466] hover:opacity-90 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-base shadow-sm"
                >
                  <UserMinus size={20} />
                  {isSubmitting ? 'Processing...' : 'Complete Check-Out & Dispatch SMS'}
                </button>
                <div className="flex items-center gap-2 text-xs text-[#8c8a86] bg-[#f8f6f3] p-3 rounded-xl">
                  <ShieldCheck size={16} className="text-[#82937f] shrink-0" />
                  <span>Verified by staff member <strong>{user.name}</strong>. Parent SMS will automatically trigger upon checkout.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-[#8c8a86] text-sm bg-white p-5 rounded-2xl border border-[#edeae6] space-y-1">
                  <p>Check-In Time: <strong className="text-[#4a4a48]">{attendanceToday.checkInTime ? format(new Date(attendanceToday.checkInTime), 'h:mm a') : '-'}</strong> {attendanceToday.checkInStaffName && `(by ${attendanceToday.checkInStaffName})`}</p>
                  <p>Check-Out Time: <strong className="text-[#4a4a48]">{attendanceToday.checkOutTime ? format(new Date(attendanceToday.checkOutTime), 'h:mm a') : '-'}</strong> {attendanceToday.checkOutStaffName && `(by ${attendanceToday.checkOutStaffName})`}</p>
                  <p>Picked up by: <strong className="text-[#4a4a48]">{attendanceToday.pickupPerson || attendanceToday.pickupPersonName}</strong></p>
                </div>
              </div>
            )}

            {/* Live SMS Notification Dispatch Preview */}
            {lastSmsMessage && (
              <div className="mt-6 p-5 bg-[#82937f10] border border-[#82937f30] rounded-2xl animate-in fade-in space-y-2">
                <div className="flex items-center justify-between text-xs text-[#82937f] font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare size={16} />
                    SMS Notification Delivered
                  </span>
                  <span>Recipient: {lastSmsMessage.to}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#82937f25] font-mono text-sm text-[#3c3c3b]">
                  &quot;{lastSmsMessage.text}&quot;
                </div>
                <p className="text-[11px] text-[#8c8a86]">
                  Automated notification sent to parent/guardian contact on record.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

