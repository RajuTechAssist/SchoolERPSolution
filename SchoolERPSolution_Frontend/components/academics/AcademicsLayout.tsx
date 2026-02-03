import React, { useState } from 'react';
import { AcademicsView } from '../../types';
import { AcademicSetup } from './AcademicSetup';
import { TimetableManager } from './TimetableManager';
import { AttendanceManager } from './AttendanceManager';
import { LessonPlanner } from './LessonPlanner';
import { AssignmentManager } from './AssignmentManager';
import { QuestionBankManager } from './QuestionBankManager';
import { GradebookManager } from './GradebookManager';
import { ExamManager } from './ExamManager';
import { ReportsAnalytics } from './ReportsAnalytics';
import { AcademicSettings } from './AcademicSettings';

interface AcademicsLayoutProps {
  onBack: () => void;
}

interface NavItem {
  id: AcademicsView;
  label: string;
  icon: string;
  category?: 'core' | 'teaching' | 'assessments' | 'admin';
}

const NAV_ITEMS: NavItem[] = [
  // Core
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', category: 'core' },
  { id: 'timetable', label: 'Timetable', icon: 'schedule', category: 'core' },
  { id: 'attendance', label: 'Attendance', icon: 'fact_check', category: 'core' },
  
  // Teaching
  { id: 'lessons', label: 'Lesson Plans', icon: 'import_contacts', category: 'teaching' },
  { id: 'assignments', label: 'Assignments', icon: 'assignment', category: 'teaching' },
  { id: 'qbank', label: 'Q-Bank', icon: 'quiz', category: 'teaching' },
  
  // Assessments
  { id: 'gradebook', label: 'Gradebook', icon: 'bar_chart', category: 'assessments' },
  { id: 'exams', label: 'Exams', icon: 'history_edu', category: 'assessments' },
  
  // Admin
  { id: 'setup', label: 'Setup', icon: 'domain', category: 'admin' },
  { id: 'reports', label: 'Reports', icon: 'analytics', category: 'admin' },
  { id: 'settings', label: 'Settings', icon: 'settings', category: 'admin' },
];

export const AcademicsLayout: React.FC<AcademicsLayoutProps> = ({ onBack }) => {
  const [activeView, setActiveView] = useState<AcademicsView>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Group items for desktop sidebar
  const groupedItems = {
    core: NAV_ITEMS.filter(i => i.category === 'core'),
    teaching: NAV_ITEMS.filter(i => i.category === 'teaching'),
    assessments: NAV_ITEMS.filter(i => i.category === 'assessments'),
    admin: NAV_ITEMS.filter(i => i.category === 'admin'),
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <AcademicsDashboard setActiveView={setActiveView} />;
      case 'setup':
        return <AcademicSetup />;
      case 'timetable':
        return <TimetableManager />;
      case 'attendance':
        return <AttendanceManager />;
      case 'lessons':
        return <LessonPlanner />;
      case 'assignments':
        return <AssignmentManager />;
      case 'qbank':
        return <QuestionBankManager />;
      case 'gradebook':
        return <GradebookManager />;
      case 'exams':
        return <ExamManager />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'settings':
        return <AcademicSettings />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full mb-4">
              <span className="material-icons-outlined text-4xl text-blue-500">{NAV_ITEMS.find(n => n.id === activeView)?.icon}</span>
            </div>
            <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark mb-2">
              {NAV_ITEMS.find(n => n.id === activeView)?.label} Module
            </h2>
            <p className="text-text-sub-light dark:text-text-sub-dark max-w-md">
              This module is currently under active development. Features for {NAV_ITEMS.find(n => n.id === activeView)?.label} will be available in the next release.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-background-light dark:bg-background-dark">
      {/* Desktop/Tablet Sidebar - HIDDEN ON PRINT */}
      <aside className="print:hidden hidden md:flex w-64 flex-col border-r border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
           <button onClick={onBack} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-text-sub-light dark:text-text-sub-dark">
             <span className="material-icons-outlined text-xl">arrow_back</span>
           </button>
           <h2 className="font-bold text-text-main-light dark:text-text-main-dark">Academics Hub</h2>
        </div>

        <div className="flex-1 py-4 space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="px-3">
              <h3 className="px-3 mb-2 text-xs font-semibold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider">
                {category}
              </h3>
              <div className="space-y-1">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${activeView === item.id 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-text-sub-light dark:text-text-sub-dark hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-text-main-light dark:hover:text-text-main-dark'
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

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        {/* Mobile Header - HIDDEN ON PRINT */}
        <div className="print:hidden md:hidden flex items-center gap-3 mb-6">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <span className="material-icons-outlined text-text-main-light dark:text-text-main-dark">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">Academics</h1>
        </div>

        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation - HIDDEN ON PRINT */}
      <div className="print:hidden md:hidden fixed bottom-0 left-0 right-0 bg-card-light dark:bg-card-dark border-t border-gray-200 dark:border-gray-700 flex justify-between px-6 py-2 z-40 safe-area-bottom">
        {NAV_ITEMS.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
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
          <div className="absolute right-0 top-0 bottom-0 w-3/4 bg-card-light dark:bg-card-dark p-6 overflow-y-auto shadow-xl animate-slide-in">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">Academics Menu</h2>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <span className="material-icons-outlined text-text-main-light dark:text-text-main-dark">close</span>
              </button>
            </div>
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category}>
                  <h3 className="mb-3 text-xs font-semibold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveView(item.id);
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

const AcademicsDashboard: React.FC<{ setActiveView: (v: AcademicsView) => void }> = ({ setActiveView }) => {
  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Attendance', value: '94%', sub: 'Today', icon: 'how_to_reg', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Conflicts', value: '3', sub: 'Timetable', icon: 'warning', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Pending', value: '12', sub: 'Grades', icon: 'pending_actions', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { label: 'Classes', value: '6', sub: 'My Schedule', icon: 'class', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        ].map((stat, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-card-light dark:bg-card-dark shadow-sm">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${stat.bg}`}>
              <span className={`material-icons-outlined text-lg ${stat.color}`}>{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">{stat.value}</p>
            <p className="text-xs text-text-sub-light dark:text-text-sub-dark">{stat.label} <span className="opacity-60">• {stat.sub}</span></p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[
            { label: 'Create Class', icon: 'add_home_work', action: 'setup' },
            { label: 'Mark Attendance', icon: 'checklist', action: 'attendance' },
            { label: 'New Plan', icon: 'import_contacts', action: 'lessons' },
            { label: 'New Assignment', icon: 'post_add', action: 'assignments' },
            { label: 'Exam Schedule', icon: 'calendar_today', action: 'timetable' },
            { label: 'Add Result', icon: 'grade', action: 'gradebook' },
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={() => setActiveView(action.action as AcademicsView)}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
            >
              <span className="material-icons-outlined text-2xl text-text-sub-light dark:text-text-sub-dark group-hover:text-primary mb-2 transition-colors">{action.icon}</span>
              <span className="text-sm font-medium text-text-main-light dark:text-text-main-dark">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-card-light dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Activity Feed</h3>
          <button className="text-sm text-primary font-medium hover:underline">View All</button>
        </div>
        <div className="space-y-6">
          {[
            { title: 'Physics Mid-Term Grades Published', user: 'Sarah Connor', time: '2 hours ago', icon: 'publish', color: 'bg-green-100 text-green-600' },
            { title: 'Timetable Conflict Detected: 10A', user: 'System', time: '5 hours ago', icon: 'error_outline', color: 'bg-red-100 text-red-600' },
            { title: 'Lesson Plan Approved: Biology W4', user: 'Dr. Anderson', time: '1 day ago', icon: 'check_circle', color: 'bg-blue-100 text-blue-600' },
          ].map((item, idx) => (
            <div key={idx} className="flex gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.color} dark:bg-opacity-20`}>
                <span className="material-icons-outlined text-lg">{item.icon}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-text-main-light dark:text-text-main-dark">{item.title}</p>
                <p className="text-xs text-text-sub-light dark:text-text-sub-dark mt-0.5">
                  <span className="font-semibold">{item.user}</span> • {item.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
