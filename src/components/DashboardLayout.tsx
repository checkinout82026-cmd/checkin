import React from 'react';
import { User } from '../types';
import { LogOut, LayoutDashboard, Users, Clock, ShieldCheck, Database } from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function DashboardLayout({ user, onLogout, children, activeTab, setActiveTab }: LayoutProps) {
  const isStaff = user.role === 'staff';
  const isAdmin = user.role === 'admin';
  const isStudent = user.role === 'student';

  return (
    <div className="min-h-screen bg-[#fdfcfb] flex flex-col md:flex-row text-[#3c3c3b] font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-[#e5e1da] text-[#8c8a86] flex flex-col shrink-0">
        <div className="p-6 border-b border-[#e5e1da] flex items-center gap-3">
          <div className="w-10 h-10 bg-[#82937f] rounded-xl flex items-center justify-center text-white font-bold text-xl">A</div>
          <div>
            <h2 className="text-xl font-serif font-medium tracking-tight text-[#4a4a48]">ABC School</h2>
            <div className="mt-1 text-[10px] uppercase font-bold tracking-widest px-2 py-1 bg-[#f8f6f3] border border-[#edeae6] rounded-md inline-flex items-center gap-2 text-[#8c8a86]">
              <span className="w-2 h-2 rounded-full bg-[#82937f]"></span>
              {user.name} ({user.role})
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {isStaff && (
            <>
              <NavItem 
                icon={<Clock size={18} />} 
                label="Check In / Out" 
                active={activeTab === 'checkin'} 
                onClick={() => setActiveTab('checkin')} 
              />
              <NavItem 
                icon={<Users size={18} />} 
                label="Checked-In List" 
                active={activeTab === 'checkedin'} 
                onClick={() => setActiveTab('checkedin')} 
              />
            </>
          )}
          {isAdmin && (
            <>
              <NavItem 
                icon={<LayoutDashboard size={18} />} 
                label="Attendance Records" 
                active={activeTab === 'attendance'} 
                onClick={() => setActiveTab('attendance')} 
              />
              <NavItem 
                icon={<Users size={18} />} 
                label="Manage Students" 
                active={activeTab === 'students'} 
                onClick={() => setActiveTab('students')} 
              />
              <NavItem 
                icon={<ShieldCheck size={18} />} 
                label="Manage Staff" 
                active={activeTab === 'staff'} 
                onClick={() => setActiveTab('staff')} 
              />
            </>
          )}
          {isStudent && (
            <>
              <NavItem 
                icon={<LayoutDashboard size={18} />} 
                label="Self-Service Check-In" 
                active={activeTab === 'student_dashboard'} 
                onClick={() => setActiveTab('student_dashboard')} 
              />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-[#e5e1da] space-y-3">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium rounded-lg text-[#d98466] hover:bg-[#f2efe9] transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
        active 
          ? 'bg-[#82937f] text-white' 
          : 'text-[#8c8a86] hover:bg-[#f8f6f3] hover:text-[#3c3c3b]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
