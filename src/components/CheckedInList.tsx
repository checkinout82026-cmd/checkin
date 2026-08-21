import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import { AttendanceRecord, Student } from '../types';
import { format } from 'date-fns';
import { UserCheck } from 'lucide-react';

export function CheckedInList() {
  const [checkedIn, setCheckedIn] = useState<{ record: AttendanceRecord, student: Student }[]>([]);

  useEffect(() => {
    let records: AttendanceRecord[] = db.getAttendance();
    let students: Student[] = db.getStudents();

    const updateList = () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const list = records
        .filter(r => r.date === today && r.checkInTime !== null && !r.checkOutTime)
        .map(r => {
          const student = students.find(s => s.id === r.studentId);
          return {
            record: r,
            student: student || {
              id: r.studentId,
              name: r.studentName || `Student ${r.studentId}`,
              parent: { name: 'Guardian', phone: 'N/A' },
              authorizedPickups: []
            }
          };
        });
      setCheckedIn(list);
    };

    updateList();

    const unsubAttendance = db.subscribeAttendance((atts) => {
      records = atts;
      updateList();
    });

    const unsubStudents = db.subscribeStudents((stus) => {
      students = stus;
      updateList();
    });

    return () => {
      if (typeof unsubAttendance === 'function') unsubAttendance();
      if (typeof unsubStudents === 'function') unsubStudents();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-[#4a4a48]">Currently Checked-In</h1>
          <p className="text-[#8c8a86] mt-1 text-sm">Live roster of all students currently on premises.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#82937f15] text-[#82937f] border border-[#82937f30] rounded-2xl font-bold text-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#82937f] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#82937f]"></span>
          </span>
          {checkedIn.length} Active {checkedIn.length === 1 ? 'Student' : 'Students'}
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-[#e5e1da] shadow-sm overflow-hidden">
        {checkedIn.length === 0 ? (
          <div className="p-12 text-center text-[#8c8a86]">
            <div className="w-12 h-12 bg-[#f8f6f3] rounded-full flex items-center justify-center mx-auto mb-3 text-[#8c8a86]">
              <UserCheck size={24} />
            </div>
            <p className="font-medium text-base text-[#4a4a48]">No students are currently checked in.</p>
            <p className="text-xs text-[#8c8a86] mt-1">Check-in scans will update this list automatically in real-time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#fcfaf7] text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold border-b border-[#f2efe9]">
                <tr>
                  <th className="px-8 py-5">Student ID</th>
                  <th className="px-8 py-5">Student Name</th>
                  <th className="px-8 py-5">Check-In Time</th>
                  <th className="px-8 py-5">Parent / Contact</th>
                  <th className="px-8 py-5">Authorized Pickups</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2efe9]">
                {checkedIn.map((item) => (
                  <tr key={item.record.id} className="hover:bg-[#fdfcfb] transition-colors text-sm text-[#3c3c3b]">
                    <td className="px-8 py-4 text-[#8c8a86] font-mono font-semibold">{item.student.id}</td>
                    <td className="px-8 py-4 font-medium">
                      {item.student.name}
                      {item.student.gradeLevel && (
                        <span className="block text-xs text-[#8c8a86] font-normal">{item.student.gradeLevel}</span>
                      )}
                    </td>
                    <td className="px-8 py-4 text-[#8c8a86]">
                      <span className="w-2 h-2 rounded-full bg-[#82937f] inline-block mr-2"></span>
                      {item.record.checkInTime ? format(new Date(item.record.checkInTime), 'h:mm a') : 'N/A'}
                    </td>
                    <td className="px-8 py-4">
                      {item.student.parent?.name || item.student.parentName}
                      <span className="block text-xs text-[#8c8a86] mt-0.5">{item.student.parent?.phone || item.student.parentPhone}</span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="max-w-xs truncate text-xs text-[#8c8a86]">
                        {item.student.authorizedPickups?.length > 0 ? item.student.authorizedPickups.join(', ') : '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
