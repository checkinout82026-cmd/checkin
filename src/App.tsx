import { useEffect, useState } from 'react';
import { db } from './lib/db';
import { User } from './types';
import { Toaster } from 'react-hot-toast';

import { Login } from './components/Login';
import { DashboardLayout } from './components/DashboardLayout';
import { CheckInOut } from './components/CheckInOut';
import { CheckedInList } from './components/CheckedInList';
import { AdminStudents } from './components/AdminStudents';
import { AdminStaff } from './components/AdminStaff';
import { AdminAttendance } from './components/AdminAttendance';
import { StudentDashboard } from './components/StudentDashboard';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('checkin');

  useEffect(() => {
    // Initialize DB with seed data if empty
    db.init();
    
    // Check local storage for persistent session during development
    const storedUser = localStorage.getItem('activeUser');
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      setActiveTab(u.role === 'admin' ? 'attendance' : u.role === 'student' ? 'student_dashboard' : 'checkin');
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('activeUser', JSON.stringify(loggedInUser));
    setActiveTab(loggedInUser.role === 'admin' ? 'attendance' : loggedInUser.role === 'student' ? 'student_dashboard' : 'checkin');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('activeUser');
  };

  if (!user) {
    return (
      <>
        <Toaster position="top-center" />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  const renderContent = () => {
    if (user.role === 'student') {
      return <StudentDashboard user={user} onComplete={handleLogout} />;
    } else if (user.role === 'staff') {
      switch (activeTab) {
        case 'checkin': return <CheckInOut user={user} />;
        case 'checkedin': return <CheckedInList />;
        default: return <CheckInOut user={user} />;
      }
    } else {
      switch (activeTab) {
        case 'attendance': return <AdminAttendance />;
        case 'students': return <AdminStudents />;
        case 'staff': return <AdminStaff />;
        default: return <AdminAttendance />;
      }
    }
  };

  if (user.role === 'student') {
    return (
      <div className="min-h-screen bg-[#fdfcfb] p-4 sm:p-8 flex flex-col justify-center">
        <Toaster position="top-center" />
        <StudentDashboard user={user} onComplete={handleLogout} />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <DashboardLayout user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </DashboardLayout>
    </>
  );
}

