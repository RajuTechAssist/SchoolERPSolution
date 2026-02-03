
import React, { useState } from 'react';
import { StudentDashboard } from './students/StudentDashboard';
import { StudentDirectory } from './students/StudentDirectory';
import { StudentProfile } from './students/StudentProfile';
import { StudentDocs } from './students/StudentDocs';
import { StudentHealth } from './students/StudentHealth';
import { StudentFamily } from './students/StudentFamily';
import { IDCardGenerator } from './students/IDCardGenerator';
import { StudentPromotion } from './students/StudentPromotion';
import { StudentAlumni } from './students/StudentAlumni';
import { StudentReports } from './students/StudentReports';
import { StudentSettings } from './students/StudentSettings';
import { StudentAudit } from './students/StudentAudit';

interface StudentLayoutProps {
  onBack: () => void;
}

type StudentView = 
  | 'dashboard'
  | 'directory'
  | 'profile'
  | 'documents'
  | 'health'
  | 'id-cards'
  | 'family'
  | 'promotion'
  | 'alumni'
  | 'reports'
  | 'settings'
  | 'audit';

const NAV_ITEMS: { id: StudentView; label: string; icon: string; category?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', category: 'Overview' },
  { id: 'directory', label: 'Student Directory', icon: 'perm_contact_calendar', category: 'Management' },
  { id: 'documents', label: 'Document Repository', icon: 'folder_shared', category: 'Management' },
  { id: 'health', label: 'Health & Medical', icon: 'medical_services', category: 'Management' },
  { id: 'family', label: 'Siblings & Family', icon: 'family_restroom', category: 'Management' },
  { id: 'id-cards', label: 'ID Card Generator', icon: 'badge', category: 'Operations' },
  { id: 'promotion', label: 'Promote Cohort', icon: 'upgrade', category: 'Operations' },
  { id: 'alumni', label: 'Alumni Archive', icon: 'school', category: 'Operations' },
  { id: 'reports', label: 'Reports & Analytics', icon: 'analytics', category: 'Admin' },
  { id: 'settings', label: 'Settings & Privacy', icon: 'settings', category: 'Admin' },
  { id: 'audit', label: 'Audit Logs', icon: 'policy', category: 'Admin' },
];

export const StudentLayout: React.FC<StudentLayoutProps> = ({ onBack }) => {
  const [activeView, setActiveView] = useState<StudentView>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigateToProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveView('profile');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <StudentDashboard onViewChange={setActiveView} />;
      case 'directory':
        return <StudentDirectory onSelectStudent={handleNavigateToProfile} />;
      case 'profile':
        return <StudentProfile studentId={selectedStudentId || 'STU2025-001'} onBack={() => setActiveView('directory')} />;
      case 'documents':
        return <StudentDocs />;
      case 'health':
        return <StudentHealth />;
      case 'family':
        return <StudentFamily />;
      case 'id-cards':
        return <IDCardGenerator />;
      case 'promotion':
        return <StudentPromotion />;
      case 'alumni':
        return <StudentAlumni />;
      case 'reports':
        return <StudentReports />;
      case 'settings':
        return <StudentSettings />;
      case 'audit':
        return <StudentAudit />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full mb-4">
              <span className="material-icons-outlined text-4xl text-blue-500">{NAV_ITEMS.find(n => n.id === activeView)?.icon}</span>
            </div>
            <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark mb-2">
              {NAV_ITEMS.find(n => n.id === activeView)?.label}
            </h2>
            <p className="text-text-sub-light dark:text-text-sub-dark max-w-md">
              This module is currently being configured. Features for {NAV_ITEMS.find(n => n.id === activeView)?.label} will be available in the next sprint.
            </p>
          </div>
        );
    }
  };

  // Group items
  const groupedItems = NAV_ITEMS.reduce((acc, item) => {
    const cat = item.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, typeof NAV_ITEMS>);

  const categoryOrder = ['Overview', 'Management', 'Operations', 'Admin'];

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-background-light dark:bg-background-dark">
      {/* Sidebar */}
      <aside className="print:hidden hidden md:flex w-64 flex-col border-r border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
           <button onClick={onBack} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-text-sub-light dark:text-text-sub-dark">
             <span className="material-icons-outlined text-xl">arrow_back</span>
           </button>
           <div>
             <h2 className="font-bold text-text-main-light dark:text-text-main-dark text-sm">Student Info</h2>
             <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 rounded uppercase font-bold">Admin</span>
           </div>
        </div>

        <div className="flex-1 py-4 space-y-6">
          {categoryOrder.map((category) => (
            <div key={category} className="px-3">
              <h3 className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {category}
              </h3>
              <div className="space-y-1">
                {groupedItems[category]?.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveView(item.id); setSelectedStudentId(null); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${activeView === item.id 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <span className="material-icons-outlined text-lg">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        <div className="print:hidden md:hidden flex items-center gap-3 mb-6">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <span className="material-icons-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold">Student Info System</h1>
        </div>
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation - HIDDEN ON PRINT */}
      <div className="print:hidden md:hidden fixed bottom-0 left-0 right-0 bg-card-light dark:bg-card-dark border-t border-gray-200 dark:border-gray-700 flex justify-between px-6 py-2 z-40 safe-area-bottom">
        {NAV_ITEMS.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveView(item.id); setSelectedStudentId(null); }}
            className={`flex flex-col items-center gap-1 p-1 rounded-lg ${activeView === item.id ? 'text-primary' : 'text-text-sub-light dark:text-text-sub-dark'}`}
          >
            <span className="material-icons-outlined">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 p-1 text-text-sub-light dark:text-text-sub-dark"
        >
          <span className="material-icons-outlined">menu</span>
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>

      {/* Mobile Menu Drawer (Overlay) - HIDDEN ON PRINT */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden print:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-3/4 bg-card-light dark:bg-card-dark p-6 overflow-y-auto shadow-xl animate-slide-in-right">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">Student Menu</h2>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <span className="material-icons-outlined text-text-main-light dark:text-text-main-dark">close</span>
              </button>
            </div>
            <div className="space-y-6">
              {categoryOrder.map((category) => (
                <div key={category}>
                  <h3 className="mb-3 text-xs font-semibold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {groupedItems[category]?.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveView(item.id);
                          setSelectedStudentId(null);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border ${
                          activeView === item.id 
                            ? 'bg-primary/5 border-primary/20 text-primary' 
                            : 'bg-gray-50 dark:bg-gray-800/50 border-transparent text-text-main-light dark:text-text-main-dark'
                        }`}
                      >
                        <span className="material-icons-outlined">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
