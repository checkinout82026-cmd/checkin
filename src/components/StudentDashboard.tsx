import { useEffect, useState, useRef } from 'react';
import { db } from '../lib/db';
import { AttendanceRecord, Student, User } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { CheckCircle2, Clock, UserCheck, UserMinus, ArrowLeft, RotateCcw } from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  onComplete?: () => void;
}

export function StudentDashboard({ user, onComplete }: StudentDashboardProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [status, setStatus] = useState<'checked-in' | 'checked-out' | 'none'>('none');
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pickupPerson, setPickupPerson] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let currentStudents = db.getStudents();
    let currentAttendance = db.getAttendance();

    const refreshData = () => {
      const found = currentStudents.find(s => s.id === user.id);
      if (found) {
        setStudent(found);
        const today = format(new Date(), 'yyyy-MM-dd');
        const record = currentAttendance.find(r => r.studentId === user.id && r.date === today);
        if (record) {
          setTodayRecord(record);
          setStatus(record.checkOutTime ? 'checked-out' : 'checked-in');
        } else {
          setTodayRecord(null);
          setStatus('none');
        }
        
        // Default pickup person
        const defaultPickup = found.parent?.name || found.parentName || found.authorizedPickups?.[0] || 'Self / Parent';
        setPickupPerson(defaultPickup);
      }
    };

    refreshData();

    const unsubStudents = db.subscribeStudents((stus) => {
      currentStudents = stus;
      refreshData();
    });

    const unsubAttendance = db.subscribeAttendance((atts) => {
      currentAttendance = atts;
      refreshData();
    });

    return () => {
      if (typeof unsubStudents === 'function') unsubStudents();
      if (typeof unsubAttendance === 'function') unsubAttendance();
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [user.id]);

  // Handle automatic return to check-in screen
  const triggerAutoReturn = () => {
    setRedirectCountdown(3);
    
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      setRedirectCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 1000);

    countdownTimerRef.current = interval as unknown as NodeJS.Timeout;
  };

  const handleCheckIn = async () => {
    if (!student || isProcessing) return;
    setIsProcessing(true);
    try {
      const now = new Date().toISOString();
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const newRecord: AttendanceRecord = {
        id: todayRecord?.id || crypto.randomUUID(),
        studentId: student.id,
        studentName: student.name,
        date: today,
        status: 'checked_in',
        checkInTime: now,
        checkInMethod: 'student_self',
        checkOutTime: null,
        smsNotificationSent: false,
        createdAt: todayRecord?.createdAt || now,
        updatedAt: now
      };

      await db.saveAttendanceRecord(newRecord);
      setTodayRecord(newRecord);
      setStatus('checked-in');
      toast.success(`Check-in recorded! Welcome, ${student.name}.`, { duration: 3000 });
      triggerAutoReturn();
    } catch (err) {
      console.error(err);
      toast.error('Could not complete check-in');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    if (!student || isProcessing) return;
    setIsProcessing(true);
    try {
      const now = new Date().toISOString();
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const updatedRecord: AttendanceRecord = {
        id: todayRecord?.id || crypto.randomUUID(),
        studentId: student.id,
        studentName: student.name,
        date: today,
        status: 'checked_out',
        checkInTime: todayRecord?.checkInTime || now,
        checkInMethod: todayRecord?.checkInMethod || 'student_self',
        checkOutTime: now,
        pickupPerson: pickupPerson || student.parent?.name || 'Self',
        pickupPersonName: pickupPerson || student.parent?.name || 'Self',
        smsNotificationSent: true,
        smsSentAt: now,
        createdAt: todayRecord?.createdAt || now,
        updatedAt: now
      };

      await db.saveAttendanceRecord(updatedRecord);
      setTodayRecord(updatedRecord);
      setStatus('checked-out');
      toast.success(`Check-out recorded! Goodbye, ${student.name}.`, { duration: 3000 });
      triggerAutoReturn();
    } catch (err) {
      console.error(err);
      toast.error('Could not complete check-out');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImmediateBack = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (onComplete) onComplete();
  };

  if (!student) return (
    <div className="text-center p-12 text-[#8c8a86] bg-white rounded-3xl border border-[#e5e1da]">
      <p>Student profile {user.id} not found in database.</p>
      {onComplete && (
        <button
          onClick={onComplete}
          className="mt-4 px-6 py-2.5 bg-[#82937f] text-white font-bold rounded-xl text-sm"
        >
          Back to Check-In Terminal
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 mt-4">
      <div className="flex items-center justify-between">
        <button
          onClick={handleImmediateBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#8c8a86] hover:text-[#4a4a48] px-3 py-2 rounded-xl hover:bg-[#f2efe9] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Kiosk
        </button>
        <span className="text-xs font-medium text-[#8c8a86] bg-[#f8f6f3] px-3 py-1.5 rounded-full border border-[#edeae6]">
          Student Self-Service Terminal
        </span>
      </div>

      <div className="bg-[#fcfaf7] p-8 sm:p-10 rounded-[32px] border border-[#edeae6] text-center shadow-sm relative overflow-hidden">
        {/* Countdown banner when action completed */}
        {redirectCountdown !== null && (
          <div className="mb-6 p-4 bg-[#82937f15] border border-[#82937f30] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#4a4a48] animate-in fade-in">
            <div className="flex items-center gap-2">
              <RotateCcw size={16} className="text-[#82937f] animate-spin" />
              <span>Returning to kiosk for next student in <strong>{redirectCountdown}s</strong>...</span>
            </div>
            <button
              onClick={handleImmediateBack}
              className="px-4 py-1.5 bg-[#82937f] hover:opacity-90 text-white font-bold text-xs rounded-xl transition-all shadow-sm shrink-0"
            >
              Next Student Now
            </button>
          </div>
        )}

        <div className="w-24 h-24 bg-[#e5e1da] rounded-full flex items-center justify-center text-[#8c8a86] font-bold text-3xl mx-auto mb-5 shadow-inner">
          {student.name.split(' ').map(n => n[0]).join('')}
        </div>
        
        <h2 className="text-2xl font-serif font-semibold text-[#4a4a48]">{student.name}</h2>
        <p className="font-mono text-sm text-[#8c8a86] mb-1">Student ID: {student.id}</p>
        {student.gradeLevel && <p className="text-xs text-[#8c8a86] mb-2">{student.gradeLevel}</p>}

        {/* Parent / Guardian Information */}
        <div className="max-w-md mx-auto mb-6 p-3 bg-white rounded-2xl border border-[#edeae6] text-xs text-[#8c8a86] flex items-center justify-between">
          <div>
            <span className="font-bold text-[#4a4a48]">Parent/Guardian:</span> {student.parent?.name || student.parentName || 'N/A'}
          </div>
          <div>
            <span className="font-bold text-[#4a4a48]">Phone:</span> {student.parent?.phone || student.parentPhone || 'N/A'}
          </div>
        </div>

        {/* Current status display badge */}
        <div className="mb-6 flex justify-center">
          {status === 'none' && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f8f6f3] text-[#8c8a86] border border-[#edeae6] rounded-full text-xs uppercase font-bold tracking-widest">
              Not Checked In Today
            </span>
          )}
          {status === 'checked-in' && (
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#82937f15] text-[#82937f] border border-[#82937f30] rounded-full text-xs uppercase font-bold tracking-widest">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#82937f] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#82937f]"></span>
              </span>
              Currently Checked In ({todayRecord?.checkInTime ? format(new Date(todayRecord.checkInTime), 'h:mm a') : 'Today'})
            </span>
          )}
          {status === 'checked-out' && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#d9846615] text-[#d98466] border border-[#d9846630] rounded-full text-xs uppercase font-bold tracking-widest">
              <CheckCircle2 size={16} />
              Checked Out Today ({todayRecord?.checkOutTime ? format(new Date(todayRecord.checkOutTime), 'h:mm a') : 'Completed'})
            </span>
          )}
        </div>

        {/* Check-Out SMS Dispatch Notification */}
        {status === 'checked-out' && todayRecord?.smsNotificationSent && (
          <div className="max-w-md mx-auto mb-6 p-4 bg-[#82937f10] border border-[#82937f30] rounded-2xl text-left animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-[#82937f] uppercase tracking-wider mb-1.5">
              <span>📱 SMS Notification Dispatched</span>
            </div>
            <p className="text-xs text-[#4a4a48] font-mono bg-white/80 p-2.5 rounded-xl border border-[#82937f20]">
              "{student.name} was checked out from ABC Community School at {todayRecord.checkOutTime ? format(new Date(todayRecord.checkOutTime), 'h:mm a') : 'now'}."
            </p>
            <p className="text-[11px] text-[#8c8a86] mt-1.5">
              Sent to {student.parent?.name || student.parentName} ({student.parent?.phone || student.parentPhone})
            </p>
          </div>
        )}

        {/* Action Buttons: Both Check-In and Check-Out available */}
        <div className="space-y-4 max-w-md mx-auto">
          {/* Pickup person selector for check-out */}
          {student.authorizedPickups && student.authorizedPickups.length > 0 && (
            <div className="text-left bg-white p-4 rounded-2xl border border-[#edeae6] mb-4">
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1.5">
                Authorized Pickup Person (for Check-Out)
              </label>
              <select
                value={pickupPerson}
                onChange={(e) => setPickupPerson(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#d98466] text-[#3c3c3b]"
              >
                {student.authorizedPickups.map((p, idx) => (
                  <option key={idx} value={p}>{p}</option>
                ))}
                <option value="Self Departure">Self Departure</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Check In Button */}
            <button
              onClick={handleCheckIn}
              disabled={isProcessing || status === 'checked-in'}
              className={`w-full py-4 px-6 font-bold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 text-base ${
                status === 'checked-in'
                  ? 'bg-[#f2efe9] text-[#8c8a86] cursor-not-allowed opacity-60'
                  : 'bg-[#82937f] hover:opacity-90 text-white'
              }`}
            >
              <UserCheck size={20} />
              {isProcessing && status !== 'checked-in' ? 'Recording...' : 'Check In'}
            </button>

            {/* Check Out Button */}
            <button
              onClick={handleCheckOut}
              disabled={isProcessing || status === 'checked-out'}
              className={`w-full py-4 px-6 font-bold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 text-base ${
                status === 'checked-out'
                  ? 'bg-[#f2efe9] text-[#8c8a86] cursor-not-allowed opacity-60'
                  : 'bg-[#d98466] hover:opacity-90 text-white'
              }`}
            >
              <UserMinus size={20} />
              {isProcessing && status === 'checked-in' ? 'Recording...' : 'Check Out'}
            </button>
          </div>

          <p className="text-xs text-[#8c8a86] pt-2">
            Select your activity above. The terminal will automatically reset for the next student.
          </p>
        </div>
      </div>
    </div>
  );
}

