import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { signInWithEmail, signInWithGoogle, sendPasswordReset } from '../lib/auth';
import { User, Student } from '../types';
import toast from 'react-hot-toast';
import { Database, Shield, GraduationCap, Lock, Mail, KeyRound, ArrowLeft, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<'student' | 'staff'>('student');
  const [staffAuthMode, setStaffAuthMode] = useState<'signin' | 'forgot'>('signin');
  
  // Input fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    // Subscribe to Firestore for real-time credentials and student search
    const unsubStudents = db.subscribeStudents((list) => {
      setStudents(list);
    });

    return () => {
      if (typeof unsubStudents === 'function') unsubStudents();
    };
  }, []);

  // Handle Student Kiosk Login (by ID)
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  // Handle Staff/Admin Firebase Email/Password Sign In
  const handleStaffSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await signInWithEmail(email || username, password);
      toast.success(`Welcome back, ${user.name} (${user.role})`);
      onLogin(user);
    } catch (err: any) {
      console.error('Sign in notice:', err);
      let errorMsg = err?.message || 'Invalid email or password';
      if (err.code === 'auth/invalid-email') errorMsg = 'Invalid email address format';
      if (err.code === 'auth/wrong-password') errorMsg = 'Incorrect password';
      if (err.code === 'auth/user-not-found') errorMsg = 'No account found with this email';
      if (err.code === 'auth/too-many-requests') errorMsg = 'Too many attempts. Please wait or reset password';
      if (err.code === 'auth/operation-not-allowed') errorMsg = 'Email/Password sign-in provider is not enabled in Firebase Console. Authenticating with school registry...';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-In with Firebase Popup
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogle('staff');
      toast.success(`Signed in with Google as ${user.name}`);
      onLogin(user);
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Google sign-in was canceled or failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset Email
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !username) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordReset(email || username);
      toast.success('Password reset link sent to your email!');
      setStaffAuthMode('signin');
    } catch (err: any) {
      console.error('Password reset error:', err);
      toast.error('Could not send reset email. Verify the email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb] text-[#3c3c3b] font-sans p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-[32px] shadow-sm border border-[#e5e1da]">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#82937f] rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-sm">
            A
          </div>
          <h1 className="text-3xl font-serif font-medium tracking-tight text-[#4a4a48]">ABC Community School</h1>
          <p className="text-[#8c8a86] mt-1.5 text-sm">Attendance & Student Management System</p>
          
        </div>

        {/* Top Role Selector */}
        <div className="flex bg-[#f8f6f3] p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setMode('student'); setStaffAuthMode('signin'); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'student' ? 'bg-white shadow-sm text-[#4a4a48]' : 'text-[#8c8a86] hover:text-[#4a4a48]'
            }`}
          >
            <GraduationCap size={16} />
            Student Check-In
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

        {/* STUDENT MODE */}
        {mode === 'student' && (
          <form onSubmit={handleStudentSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">
                Student ID #
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-3.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl focus:ring-2 focus:ring-[#82937f] focus:border-[#82937f] outline-none transition-all text-[#3c3c3b] font-mono text-lg"
                placeholder="e.g. 1001"
                autoFocus
                required
              />

              {/* Student Lookup Preview */}
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
                        <div><span className="font-semibold text-[#4a4a48]">Grade:</span> {matchedStudent.gradeLevel || 'N/A'}</div>
                        <div><span className="font-semibold text-[#4a4a48]">Parent/Guardian:</span> {matchedStudent.parent?.name || matchedStudent.parentName || 'N/A'}</div>
                      </div>
                    </div>
                  );
                }
                const partialMatches = students.filter(s => s.id.includes(username.trim()) || s.name.toLowerCase().includes(username.trim().toLowerCase())).slice(0, 3);
                if (partialMatches.length > 0) {
                  return (
                    <div className="mt-2 text-xs text-[#8c8a86]">
                      <span className="font-semibold">Quick select: </span>
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

            <button
              type="submit"
              className="w-full bg-[#82937f] hover:opacity-90 text-white font-bold py-4 rounded-2xl transition-all mt-4 flex items-center justify-center gap-2 cursor-pointer"
            >
              <GraduationCap size={18} />
              Continue to Student Dashboard
            </button>
          </form>
        )}

        {/* STAFF & ADMIN AUTH MODES */}
        {mode === 'staff' && (
          <div>
            {/* FORGOT PASSWORD FORM */}
            {staffAuthMode === 'forgot' ? (
              <form onSubmit={handleForgotPassword} className="space-y-4 animate-in fade-in">
                <button
                  type="button"
                  onClick={() => setStaffAuthMode('signin')}
                  className="inline-flex items-center gap-1.5 text-xs text-[#8c8a86] hover:text-[#4a4a48] font-bold mb-2 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
                <h2 className="text-base font-serif font-semibold text-[#4a4a48]">Reset Staff / Admin Password</h2>
                <p className="text-xs text-[#8c8a86]">
                  Enter your registered email address to receive an official Firebase password reset link.
                </p>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="smith.admin@school.com"
                      className="w-full px-5 py-3.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl focus:ring-2 focus:ring-[#82937f] outline-none text-[#3c3c3b]"
                    />
                    <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c8a86]" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#82937f] hover:opacity-90 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
                  Send Password Reset Link
                </button>
              </form>
            ) : (
              /* SIGN IN FORM (NO PUBLIC CREATE ACCOUNT) */
              <form onSubmit={handleStaffSignIn} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Email Address</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={email || username}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setUsername(e.target.value);
                      }}
                      className="w-full px-5 py-3.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl focus:ring-2 focus:ring-[#82937f] focus:border-[#82937f] outline-none transition-all text-[#3c3c3b]"
                      placeholder="smith.admin@school.com"
                      required
                    />
                    <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c8a86]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold">Password</label>
                    <button
                      type="button"
                      onClick={() => setStaffAuthMode('forgot')}
                      className="text-xs text-[#82937f] hover:underline font-medium cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#82937f] hover:opacity-90 text-white font-bold py-4 rounded-2xl transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                  Sign In with Firebase Auth
                </button>

                {/* Google Sign-In */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#e5e1da]"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-[#8c8a86] font-medium">Or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-[#f8f6f3] hover:bg-[#f2efe9] text-[#4a4a48] font-bold py-3 rounded-2xl border border-[#e5e1da] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Sign In with Google
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
