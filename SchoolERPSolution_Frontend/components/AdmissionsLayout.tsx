
import React, { useState } from 'react';
import { AdmissionsDashboard } from './admissions/AdmissionsDashboard';
import { LeadsPipeline } from './admissions/LeadsPipeline';
import { ApplicationManager } from './admissions/ApplicationManager';
import { Scheduler } from './admissions/Scheduler';
import { DocumentVerification } from './admissions/DocumentVerification';
import { FeeCollection } from './admissions/FeeCollection';
import { EnrollmentWizard } from './admissions/EnrollmentWizard';
import { AdmissionsSettings } from './admissions/AdmissionsSettings';
import { AdmissionsReports } from './admissions/AdmissionsReports';
import { AdmissionsAuditLogs } from './admissions/AdmissionsAuditLogs';

interface AdmissionsLayoutProps {
  onBack: () => void;
}

type AdmissionsView = 
  | 'dashboard'
  | 'leads'
  | 'applications'
  | 'scheduler'
  | 'documents'
  | 'payments'
  | 'enroll'
  | 'settings'
  | 'reports'
  | 'audit';

const NAV_ITEMS: { id: AdmissionsView; label: string; icon: string; category?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', category: 'Overview' },
  { id: 'leads', label: 'Enquiries / Leads', icon: 'filter_alt', category: 'Pipeline' },
  { id: 'applications', label: 'Applications', icon: 'assignment_ind', category: 'Pipeline' },
  { id: 'scheduler', label: 'Interviews', icon: 'event', category: 'Processing' },
  { id: 'documents', label: 'Docs & Verify', icon: 'verified', category: 'Processing' },
  { id: 'payments', label: 'Fee Collection', icon: 'payments', category: 'Processing' },
  { id: 'enroll', label: 'Quick Enrol', icon: 'how_to_reg', category: 'Actions' },
  { id: 'reports', label: 'Reports', icon: 'analytics', category: 'Management' },
  { id: 'settings', label: 'Settings', icon: 'settings', category: 'Management' },
  { id: 'audit', label: 'Audit Logs', icon: 'history_edu', category: 'Management' },
];

export const AdmissionsLayout: React.FC<AdmissionsLayoutProps> = ({ onBack }) => {
  const [activeView, setActiveView] = useState<AdmissionsView>('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <AdmissionsDashboard onViewChange={setActiveView} />;
      case 'leads':
        return <LeadsPipeline />;
      case 'applications':
        return <ApplicationManager />;
      case 'scheduler':
        return <Scheduler />;
      case 'documents':
        return <DocumentVerification />;
      case 'payments':
        return <FeeCollection />;
      case 'enroll':
        return <EnrollmentWizard />;
      case 'settings':
        return <AdmissionsSettings />;
      case 'reports':
        return <AdmissionsReports />;
      case 'audit':
        return <AdmissionsAuditLogs />;
      default:
        return <AdmissionsDashboard onViewChange={setActiveView} />;
    }
  };

  // Group items for sidebar
  const groupedItems = NAV_ITEMS.reduce((acc, item) => {
    const cat = item.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, typeof NAV_ITEMS>);

  const categoryOrder = ['Overview', 'Pipeline', 'Processing', 'Actions', 'Management'];

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-background-light dark:bg-background-dark">
      {/* Sidebar */}
      <aside className="print:hidden hidden md:flex w-64 flex-col border-r border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
           <button onClick={onBack} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-text-sub-light dark:text-text-sub-dark">
             <span className="material-icons-outlined text-xl">arrow_back</span>
           </button>
           <div>
             <h2 className="font-bold text-text-main-light dark:text-text-main-dark text-sm">Admissions</h2>
             <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 rounded uppercase font-bold">2025-26</span>
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
          <h1 className="text-xl font-bold">Admissions</h1>
        </div>
        {renderContent()}
      </main>
    </div>
  );
};
