import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { User, Student } from '../types';
import toast from 'react-hot-toast';
import { Database, Shield, GraduationCap, Lock, UserCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<'student' | 'staff'>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Subscribe to Firestore for real-time credentials
    const unsubStudents = db.subscribeStudents((list) => {
      setStudents(list);
    });
    const unsubUsers = db.subscribeUsers((list) => {
      setUsers(list);
    });

    return () => {
      if (typeof unsubStudents === 'function') unsubStudents();
      if (typeof unsubUsers === 'function') unsubUsers();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'student') {
      const student = students.find(s => s.id.toLowerCase() === username.trim().toLowerCase());
      if (student) {
        onLogin({ 
          id: student.id, 
          username: student.id, 
          role: 'student', 
          name: student.name,
          fullName: student.name
        });
        toast.success(`Welcome, ${student.name}`);
      } else {
        toast.error('Student ID not found in database');
      }
    } else {
      const trimmedUser = username.trim().toLowerCase();
      const user = users.find(u => u.username.toLowerCase() === trimmedUser && (u.password === password || (!u.password && password === 'password')));
      if (user) {
        onLogin(user);
        toast.success(`Welcome back, ${user.name}`);
      } else {
        toast.error('Invalid credentials');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb] text-[#3c3c3b] font-sans p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-[32px] shadow-sm border border-[#e5e1da]">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#82937f] rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">A</div>
          <h1 className="text-3xl font-serif font-medium tracking-tight text-[#4a4a48]">ABC Community School</h1>
          <p className="text-[#8c8a86] mt-1.5 text-sm">Attendance & Student Management System</p>
        </div>

        <div className="flex bg-[#f8f6f3] p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setMode('student')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'student' ? 'bg-white shadow-sm text-[#4a4a48]' : 'text-[#8c8a86] hover:text-[#4a4a48]'
            }`}
          >
            <GraduationCap size={16} />
            Student Check-In / Out
          </button>
          <button
            type="button"
            onClick={() => setMode('staff')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'staff' ? 'bg-white shadow-sm text-[#4a4a48]' : 'text-[#8c8a86] hover:text-[#4a4a48]'
            }`}
          >
            <Shield size={16} />
            Staff / Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'student' ? (
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Student ID #</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-3.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl focus:ring-2 focus:ring-[#82937f] focus:border-[#82937f] outline-none transition-all text-[#3c3c3b] font-mono text-lg"
                  placeholder="e.g. 1001"
                  autoFocus
                  required
                />
              </div>

              {/* Real-time Student Lookup Preview */}
              {username.trim() && (() => {
                const matchedStudent = students.find(s => s.id.toLowerCase() === username.trim().toLowerCase());
                if (matchedStudent) {
                  return (
                    <div className="mt-3 p-3.5 bg-[#82937f10] border border-[#82937f30] rounded-2xl animate-in fade-in slide-in-from-top-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#82937f] uppercase tracking-wider">Student Found</span>
                        <span className="text-[11px] font-mono font-bold text-[#8c8a86]">ID: {matchedStudent.id}</span>
                      </div>
                      <div className="text-base font-serif font-bold text-[#4a4a48] mt-0.5">{matchedStudent.name}</div>
                      <div className="text-xs text-[#8c8a86] mt-1 space-y-0.5">
                        <div><span className="font-semibold text-[#4a4a48]">Parent/Guardian:</span> {matchedStudent.parent?.name || matchedStudent.parentName || 'N/A'}</div>
                        <div><span className="font-semibold text-[#4a4a48]">Contact Phone:</span> {matchedStudent.parent?.phone || matchedStudent.parentPhone || 'N/A'}</div>
                      </div>
                    </div>
                  );
                }
                const partialMatches = students.filter(s => s.id.includes(username.trim()) || s.name.toLowerCase().includes(username.trim().toLowerCase())).slice(0, 3);
                if (partialMatches.length > 0) {
                  return (
                    <div className="mt-2 text-xs text-[#8c8a86]">
                      <span className="font-semibold">Matching IDs: </span>
                      {partialMatches.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setUsername(s.id)}
                          className="mr-2 underline hover:text-[#82937f] font-mono"
                        >
                          {s.id} ({s.name})
                        </button>
                      ))}
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-3.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl focus:ring-2 focus:ring-[#82937f] focus:border-[#82937f] outline-none transition-all text-[#3c3c3b]"
                  placeholder="e.g. admin1 or staff1"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl focus:ring-2 focus:ring-[#82937f] focus:border-[#82937f] outline-none transition-all text-[#3c3c3b]"
                    placeholder="••••••••"
                    required
                  />
                  <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c8a86]" />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-[#82937f] hover:opacity-90 text-white font-bold py-4 rounded-2xl transition-all mt-4 flex items-center justify-center gap-2"
          >
            <UserCheck size={18} />
            {mode === 'student' ? 'Continue to Check In / Out' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
