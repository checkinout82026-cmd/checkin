import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { User, Student } from '../types';
import toast from 'react-hot-toast';
import { ShieldCheck, Lock, X, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';

interface StaffApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  pickupPerson: string;
  onApproved: (staffUser: User) => void;
}

export function StaffApprovalModal({
  isOpen,
  onClose,
  student,
  pickupPerson,
  onApproved
}: StaffApprovalModalProps) {
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setStaffPassword('');
    setErrorMessage('');

    const applyUsers = (users: User[]) => {
      if (!isMounted) return;
      const approvers = users.filter(u => u.isActive !== false && (u.role === 'staff' || u.role === 'admin'));
      setStaffUsers(approvers);
      setSelectedStaffId(current => current && approvers.some(u => u.id === current) ? current : approvers[0]?.id || '');
    };

    applyUsers(db.getUsers());
    db.loadUsersFromFirestore().then(applyUsers);

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerifyAndApprove = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    const staff = staffUsers.find(u => u.id === selectedStaffId);
    if (!staff) {
      setErrorMessage('Please select an authorized staff member or administrator.');
      return;
    }

    setIsVerifying(true);

    // Verify staff credentials against stored password or default admin password
    const enteredPass = staffPassword.trim();
    const isMasterAdmin = staff.email?.toLowerCase() === 'smith.admin@school.com' || staff.username === 'smith.admin';
    const isPasswordValid = 
      (staff.password && staff.password === enteredPass) || 
      (isMasterAdmin && (enteredPass === 'AdminSmith#2026' || !staff.password)) ||
      (!staff.password && enteredPass.length >= 4); // If newly created without local pass

    if (!isPasswordValid) {
      setIsVerifying(false);
      setErrorMessage('Invalid staff password. Please try again.');
      return;
    }

    setIsVerifying(false);
    toast.success(`Check-out verified by ${staff.name} (${staff.role.toUpperCase()})`);
    onApproved(staff);
  };

  const selectedStaff = staffUsers.find(u => u.id === selectedStaffId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#e5e1da] relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#8c8a86] hover:text-[#4a4a48] p-2 rounded-full hover:bg-[#f8f6f3] transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#d98466]/15 text-[#d98466] flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-serif font-semibold text-[#4a4a48]">Staff Authorization</h2>
            <p className="text-xs text-[#8c8a86]">Required to release student from campus</p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-[#fcfaf7] border border-[#edeae6] rounded-2xl p-4 mb-5 text-sm space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#8c8a86]">Student:</span>
            <span className="font-bold text-[#4a4a48]">{student.name} (ID: {student.id})</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#8c8a86]">Authorized Pickup:</span>
            <span className="font-semibold text-[#82937f] bg-[#82937f]/10 px-2 py-0.5 rounded-md">{pickupPerson}</span>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 animate-in fade-in">
            <AlertTriangle size={15} className="shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleVerifyAndApprove} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1.5">
              Authorizing Staff / Admin
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => {
                setSelectedStaffId(e.target.value);
                setErrorMessage('');
              }}
              className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#82937f] text-[#3c3c3b]"
              required
            >
              {staffUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role === 'admin' ? 'Administrator' : 'Staff'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1.5">
              Staff Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                value={staffPassword}
                onChange={(e) => {
                  setStaffPassword(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Enter staff security password"
                className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#82937f] text-[#3c3c3b]"
              />
              <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c8a86]" />
            </div>
            <p className="text-[11px] text-[#8c8a86] mt-1.5">
              A staff member or administrator must enter their password to confirm dismissal.
            </p>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#f2efe9] hover:bg-[#edeae6] text-[#8c8a86] font-bold rounded-2xl transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying || !staffPassword.trim()}
              className="flex-1 py-3 bg-[#d98466] hover:opacity-90 text-white font-bold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              {isVerifying ? 'Verifying...' : 'Approve & Release'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
