import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { User, Role } from '../types';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

export function AdminStaff() {
  const [staffList, setStaffList] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

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

    const newUser: User = {
      id: 'u_' + crypto.randomUUID().slice(0, 8),
      username: username.trim(),
      password: password.trim() || 'password',
      name: name.trim(),
      fullName: name.trim(),
      role,
      email: email.trim() || `${username.trim()}@school.org`,
      phone: phone.trim() || '555-0100',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.saveUser(newUser);
    toast.success(`${role === 'admin' ? 'Administrator' : 'Staff member'} added to Firebase`);
    
    // Reset
    setName('');
    setUsername('');
    setPassword('');
    setEmail('');
    setPhone('');
    setRole('staff');
    setShowAddForm(false);
  };

  const deleteStaff = async (id: string, userName: string) => {
    if (confirm(`Are you sure you want to remove ${userName}?`)) {
      await db.deleteUser(id);
      toast.success('Account removed from Firebase');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-[#4a4a48]">Manage Staff & Admins</h1>
          <p className="text-[#8c8a86] mt-1 text-sm">Real-time user authorization accounts stored in Firestore.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#82937f] hover:opacity-90 text-white font-bold rounded-2xl transition-all shadow-sm text-sm"
        >
          <UserPlus size={18} />
          {showAddForm ? 'Close Form' : 'Add Staff Member'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-[32px] border border-[#e5e1da] shadow-sm animate-in fade-in slide-in-from-top-2">
          <h2 className="text-lg font-serif font-semibold mb-4 text-[#4a4a48]">Add New User Account</h2>
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
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Username</label>
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
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#82937f] text-[#3c3c3b]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as Role)}
                className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#82937f] text-[#3c3c3b]"
              >
                <option value="staff">Staff (Check In / Out)</option>
                <option value="admin">Administrator (Full Access)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. rachel@school.org"
                className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#82937f] text-[#3c3c3b]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 555-0155"
                className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#82937f] text-[#3c3c3b]"
              />
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-[#82937f] hover:opacity-90 text-white font-bold rounded-2xl transition-colors"
              >
                Save Account
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
                    {s.name}
                    {s.email && <span className="block text-xs text-[#8c8a86] font-normal">{s.email}</span>}
                  </td>
                  <td className="px-8 py-4 text-[#8c8a86] font-mono">{s.username}</td>
                  <td className="px-8 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${s.role === 'admin' ? 'bg-[#82937f15] text-[#82937f] border border-[#82937f30]' : 'bg-[#f8f6f3] text-[#8c8a86] border border-[#edeae6]'}`}>
                      {s.role}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-[#8c8a86]">{s.phone || '-'}</td>
                  <td className="px-8 py-4 text-right">
                    <button 
                      onClick={() => deleteStaff(s.id, s.name)} 
                      className="text-[#d98466] hover:opacity-80 font-bold uppercase tracking-wider text-[10px]"
                    >
                      Delete
                    </button>
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
