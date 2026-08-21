import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { registerStaffOrAdmin, sendPasswordReset } from '../lib/auth';
import { User, Role } from '../types';
import toast from 'react-hot-toast';
import { UserPlus, KeyRound, Shield, Trash2, Mail, Loader2, CheckCircle2 } from 'lucide-react';

export function AdminStaff() {
  const [staffList, setStaffList] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('staff');

  useEffect(() => {
    const unsubscribe = db.subscribeUsers((users) => {
      setStaffList(users);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (staffList.find(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
      toast.error('Username already taken');
      return;
    }

    const cleanEmail = email.trim() || `${username.trim().toLowerCase()}@school.org`;
    const cleanPassword = password.trim() || 'password';

    setLoading(true);
    try {
      // Create user in Firebase Auth & Firestore
      await registerStaffOrAdmin(
        cleanEmail,
        cleanPassword,
        name.trim(),
        role,
        phone.trim(),
        username.trim()
      );
      toast.success(`${role === 'admin' ? 'Administrator' : 'Staff member'} registered in Firebase Auth!`);
      
      // Reset
      setName('');
      setUsername('');
      setPassword('');
      setEmail('');
      setPhone('');
      setRole('staff');
      setShowAddForm(false);
    } catch (err: any) {
      console.warn('Firebase Auth user creation notice:', err);
      // Fallback to Firestore saving if auth creation has specific client restrictions
      const newUser: User = {
        id: 'u_' + crypto.randomUUID().slice(0, 8),
        username: username.trim(),
        password: cleanPassword,
        name: name.trim(),
        fullName: name.trim(),
        role,
        email: cleanEmail,
        phone: phone.trim() || '555-0100',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await db.saveUser(newUser);
      toast.success(`Account saved in Firestore users collection`);
      setShowAddForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReset = async (userEmail: string, userName: string) => {
    if (!userEmail) {
      toast.error('No email specified for this user');
      return;
    }
    try {
      await sendPasswordReset(userEmail);
      toast.success(`Password reset email sent to ${userName} (${userEmail})`);
    } catch (err: any) {
      console.error('Reset password error:', err);
      toast.error('Could not send password reset email');
    }
  };

  const deleteStaff = async (id: string, userName: string) => {
    if (confirm(`Are you sure you want to remove ${userName}?`)) {
      await db.deleteUser(id);
      toast.success('Account removed from Firestore');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-semibold text-[#4a4a48]">Manage Staff & Admins</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-[#82937f]/15 text-[#5e705b] rounded-full">
              {staffList.filter(u => u.role !== 'student').length} Accounts
            </span>
          </div>
          <p className="text-[#8c8a86] mt-1 text-sm">
            Firebase Authentication and Firestore role permissions for administrators and check-in staff.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#82937f] hover:opacity-90 text-white font-bold rounded-2xl transition-all shadow-sm text-sm"
        >
          <UserPlus size={18} />
          {showAddForm ? 'Close Form' : 'Register New Account'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-[32px] border border-[#e5e1da] shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={20} className="text-[#82937f]" />
            <h2 className="text-lg font-serif font-semibold text-[#4a4a48]">Register New Firebase User</h2>
          </div>
          <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Rachel Adams"
                className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#82937f] text-[#3c3c3b]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Email Address (Firebase Login)</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="rachel@school.org"
                className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#82937f] text-[#3c3c3b]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Username / Handle</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. rachel.staff"
                className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#82937f] text-[#3c3c3b]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Initial Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#82937f] text-[#3c3c3b]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Access Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as Role)}
                className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#82937f] text-[#3c3c3b]"
              >
                <option value="staff">Staff (Daily Check In / Out)</option>
                <option value="admin">Administrator (Full Access & Reports)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="555-0155"
                className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#82937f] text-[#3c3c3b]"
              />
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#82937f] hover:opacity-90 text-white font-bold rounded-2xl transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Save & Register
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 bg-[#f2efe9] hover:bg-[#edeae6] text-[#8c8a86] font-bold rounded-2xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[32px] border border-[#e5e1da] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfaf7] text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold border-b border-[#f2efe9]">
              <tr>
                <th className="px-8 py-5">Name & Email</th>
                <th className="px-8 py-5">Username</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5">Phone</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2efe9] text-sm">
              {staffList.filter(u => u.role !== 'student').map(s => (
                <tr key={s.id} className="hover:bg-[#fdfcfb] transition-colors text-[#3c3c3b]">
                  <td className="px-8 py-4 font-medium">
                    <div className="flex items-center gap-2">
                      <span>{s.name}</span>
                    </div>
                    {s.email && (
                      <span className="block text-xs text-[#8c8a86] font-normal flex items-center gap-1 mt-0.5">
                        <Mail size={12} className="text-[#8c8a86]" />
                        {s.email}
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-4 text-[#8c8a86] font-mono">{s.username}</td>
                  <td className="px-8 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${s.role === 'admin' ? 'bg-[#82937f15] text-[#82937f] border border-[#82937f30]' : 'bg-[#f8f6f3] text-[#8c8a86] border border-[#edeae6]'}`}>
                      {s.role}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-[#8c8a86]">{s.phone || '-'}</td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {s.email && (
                        <button 
                          onClick={() => handleSendReset(s.email!, s.name)} 
                          title="Send Firebase Password Reset Email"
                          className="text-[#82937f] hover:underline font-bold text-xs flex items-center gap-1"
                        >
                          <KeyRound size={13} />
                          Reset Password
                        </button>
                      )}
                      <button 
                        onClick={() => deleteStaff(s.id, s.name)} 
                        title="Remove Account"
                        className="text-[#d98466] hover:opacity-80 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
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
