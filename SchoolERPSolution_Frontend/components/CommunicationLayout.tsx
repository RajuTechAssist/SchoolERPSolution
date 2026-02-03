
import React, { useState, useEffect } from 'react';
import { CommDashboard } from './communication/CommDashboard';
import { ComposeBroadcast } from './communication/ComposeBroadcast';
import { Inbox } from './communication/Inbox';
import { MeetingScheduler } from './communication/MeetingScheduler';
import { Templates } from './communication/Templates';
import { AudienceManager } from './communication/AudienceManager';
import { CommunicationHistory } from './communication/CommunicationHistory';
import { ChannelsConfig } from './communication/ChannelsConfig';
import { AnalyticsReports } from './communication/AnalyticsReports';
import { AuditCompliance } from './communication/AuditCompliance';
import { CommSettings } from './communication/CommSettings';
import { StudentDirectory } from './communication/StudentDirectory';

interface CommunicationLayoutProps {
  onBack: () => void;
  initialThreadId?: number | null;
}

const NAV_ITEMS = [
  // Overview
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', category: 'Overview' },
  
  // External Communication
  { id: 'ext-parents', label: 'Parents', icon: 'family_restroom', category: 'External Communication' },
  { id: 'ext-students', label: 'Students', icon: 'school', category: 'External Communication' },

  // Internal Communication
  { id: 'int-teachers', label: 'Teachers', icon: 'cast_for_education', category: 'Internal Communication' },
  { id: 'int-staff', label: 'Staff', icon: 'badge', category: 'Internal Communication' },
  { id: 'int-dept', label: 'Department Groups', icon: 'groups', category: 'Internal Communication' },

  // Operations
  { id: 'compose', label: 'Compose Broadcast', icon: 'send', category: 'Operations' },
  { id: 'inbox', label: 'All Messages', icon: 'forum', category: 'Operations' },
  { id: 'meetings', label: 'Meetings', icon: 'video_call', category: 'Operations' },

  // Management & Config
  { id: 'history', label: 'History & Logs', icon: 'history', category: 'Management' },
  { id: 'audience', label: 'Audience Lists', icon: 'people_alt', category: 'Management' },
  { id: 'templates', label: 'Templates', icon: 'library_books', category: 'Management' },
  { id: 'channels', label: 'Channels', icon: 'settings_input_antenna', category: 'Config' },
  { id: 'reports', label: 'Analytics', icon: 'analytics', category: 'Config' },
  { id: 'settings', label: 'Settings', icon: 'tune', category: 'Config' },
];

export const CommunicationLayout: React.FC<CommunicationLayoutProps> = ({ onBack, initialThreadId }) => {
  const [activeView, setActiveView] = useState<string>('dashboard');

  useEffect(() => {
    if (initialThreadId) {
      setActiveView('inbox');
    }
  }, [initialThreadId]);

  const renderContent = () => {
    switch (activeView) {
      // Overview
      case 'dashboard':
        return <CommDashboard onViewChange={(v) => setActiveView(v)} />;
      
      // External Communication (Filtered Inboxes)
      case 'ext-parents':
        return <Inbox roleFilter="Parent" />;
      case 'ext-students':
        return <StudentDirectory />;
      
      // Internal Communication (Filtered Inboxes & Groups)
      case 'int-teachers':
        return <Inbox roleFilter="Teacher" />;
      case 'int-staff':
        return <Inbox roleFilter="Staff" />;
      case 'int-dept':
        return <AudienceManager />; // Assuming 'Groups' maps to Audience Manager

      // Operations
      case 'compose':
        return <ComposeBroadcast />;
      case 'inbox':
        return <Inbox targetThreadId={initialThreadId} />;
      case 'meetings':
        return <MeetingScheduler />;
      
      // Management
      case 'templates':
        return <Templates />;
      case 'audience':
        return <AudienceManager />;
      case 'history':
        return <CommunicationHistory />;
      
      // Config
      case 'channels':
        return <ChannelsConfig />;
      case 'reports':
        return <AnalyticsReports />;
      case 'audit':
        return <AuditCompliance />;
      case 'settings':
        return <CommSettings />;
      
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
              This module component is under development as part of the Communication Suite update.
            </p>
          </div>
        );
    }
  };

  // Group items for sidebar rendering
  const groupedItems = NAV_ITEMS.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof NAV_ITEMS>);

  // Define sort order for categories
  const categoryOrder = ['Overview', 'External Communication', 'Internal Communication', 'Operations', 'Management', 'Config'];

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-background-light dark:bg-background-dark">
      {/* Sidebar */}
      <aside className="print:hidden hidden md:flex w-64 flex-col border-r border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
           <button onClick={onBack} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-text-sub-light dark:text-text-sub-dark">
             <span className="material-icons-outlined text-xl">arrow_back</span>
           </button>
           <div>
             <h2 className="font-bold text-text-main-light dark:text-text-main-dark text-sm">Communication</h2>
             <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded uppercase font-bold">Admin</span>
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
                    onClick={() => setActiveView(item.id)}
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
          <h1 className="text-xl font-bold">Communication</h1>
        </div>
        {renderContent()}
      </main>
    </div>
  );
};
