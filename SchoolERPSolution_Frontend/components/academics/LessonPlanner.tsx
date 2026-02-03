import React, { useState } from 'react';

// --- Types ---
type UserRole = 'Teacher' | 'Admin';
type PlanStatus = 'Draft' | 'Pending Review' | 'Approved' | 'Changes Requested';

interface Comment {
  id: string;
  author: string;
  role: UserRole;
  text: string;
  timestamp: string;
}

interface PlanHistoryEvent {
  id: string;
  timestamp: string;
  user: string;
  action: string; // e.g., "Created", "Submitted", "Approved", "Requested Changes", "Edited"
  details?: string;
}

interface LessonPlan {
  id: string;
  weekStart: string;
  classId: string;
  subject: string;
  teacher: string;
  topic: string;
  objectives: string;
  resources: string[]; // Mock file names
  status: PlanStatus;
  isCovered: boolean;
  isPublished: boolean;
  comments: Comment[];
  history: PlanHistoryEvent[];
  lastUpdated: string;
}

// --- Mock Data ---
const MOCK_PLANS: LessonPlan[] = [
  {
    id: 'lp1',
    weekStart: '2024-08-12',
    classId: 'Class 10 - A',
    subject: 'Physics',
    teacher: 'Mrs. Verma',
    topic: 'Laws of Motion',
    objectives: '1. Understand Newton\'s First Law.\n2. Real-world applications of inertia.',
    resources: ['Motion_Slides.pptx', 'Lab_Safety_Guide.pdf'],
    status: 'Approved',
    isCovered: true,
    isPublished: true,
    comments: [
      { id: 'c1', author: 'Mr. Principal', role: 'Admin', text: 'Great focus on lab safety.', timestamp: '2024-08-10 10:30 AM' }
    ],
    history: [
      { id: 'h1', timestamp: '2024-08-08 09:00 AM', user: 'Mrs. Verma', action: 'Created Draft' },
      { id: 'h2', timestamp: '2024-08-09 02:15 PM', user: 'Mrs. Verma', action: 'Submitted for Review' },
      { id: 'h3', timestamp: '2024-08-10 10:30 AM', user: 'Mr. Principal', action: 'Approved', details: 'Plan looks good.' }
    ],
    lastUpdated: '2024-08-10'
  },
  {
    id: 'lp2',
    weekStart: '2024-08-19',
    classId: 'Class 10 - A',
    subject: 'Physics',
    teacher: 'Mrs. Verma',
    topic: 'Force and Acceleration',
    objectives: 'Derive F=ma. Solve numerical problems.',
    resources: ['Worksheet_2.pdf'],
    status: 'Changes Requested',
    isCovered: false,
    isPublished: false,
    comments: [
      { id: 'c2', author: 'Mr. Principal', role: 'Admin', text: 'Please add more numerical examples for practice.', timestamp: '2024-08-15 02:00 PM' }
    ],
    history: [
      { id: 'h4', timestamp: '2024-08-14 11:00 AM', user: 'Mrs. Verma', action: 'Submitted for Review' },
      { id: 'h5', timestamp: '2024-08-15 02:00 PM', user: 'Mr. Principal', action: 'Requested Changes', details: 'Need more practice problems.' }
    ],
    lastUpdated: '2024-08-15'
  },
  {
    id: 'lp3',
    weekStart: '2024-08-26',
    classId: 'Class 11 - B',
    subject: 'Chemistry',
    teacher: 'Ms. Curie',
    topic: 'Chemical Bonding',
    objectives: 'Introduction to Ionic and Covalent bonds.',
    resources: [],
    status: 'Pending Review',
    isCovered: false,
    isPublished: false,
    comments: [],
    history: [
      { id: 'h6', timestamp: '2024-08-20 04:30 PM', user: 'Ms. Curie', action: 'Submitted for Review' }
    ],
    lastUpdated: '2024-08-20'
  }
];

export const LessonPlanner: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('Teacher');
  const [plans, setPlans] = useState<LessonPlan[]>(MOCK_PLANS);
  const [activeTab, setActiveTab] = useState<'planner' | 'repository'>('planner');
  
  // Modal / Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);
  const [detailInitialTab, setDetailInitialTab] = useState<'content' | 'history'>('content');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterClass, setFilterClass] = useState('All');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [filterCoveredStatus, setFilterCoveredStatus] = useState<'All' | 'Covered' | 'Pending'>('All');

  // --- Actions ---

  const handleSavePlan = (planData: Partial<LessonPlan>) => {
    const timestamp = new Date().toLocaleString();
    
    if (selectedPlan) {
      // Edit
      setPlans(prev => prev.map(p => {
         if (p.id === selectedPlan.id) {
             const newHistory = [...p.history, { 
                 id: Date.now().toString(), 
                 timestamp, 
                 user: currentRole === 'Teacher' ? 'Mrs. Verma' : 'Admin', 
                 action: 'Edited Plan' 
             }];
             return { 
                 ...p, 
                 ...planData, 
                 history: newHistory,
                 lastUpdated: new Date().toISOString().split('T')[0] 
             } as LessonPlan;
         }
         return p;
      }));
    } else {
      // Create
      const newPlan: LessonPlan = {
        id: Date.now().toString(),
        teacher: 'Mrs. Verma', // Mock current user
        status: 'Draft',
        isCovered: false,
        isPublished: false,
        comments: [],
        history: [{ id: Date.now().toString(), timestamp, user: 'Mrs. Verma', action: 'Created Draft' }],
        lastUpdated: new Date().toISOString().split('T')[0],
        resources: [],
        ...planData as any
      };
      setPlans(prev => [newPlan, ...prev]);
    }
    setIsEditorOpen(false);
    setSelectedPlan(null);
  };

  const handleSubmitForReview = (id: string) => {
    setPlans(prev => prev.map(p => {
        if (p.id !== id) return p;
        return {
            ...p,
            status: 'Pending Review',
            history: [...p.history, { 
                id: Date.now().toString(), 
                timestamp: new Date().toLocaleString(), 
                user: 'Mrs. Verma', 
                action: 'Submitted for Review' 
            }]
        };
    }));
  };

  const handleReviewAction = (id: string, action: 'Approve' | 'Request Changes', commentText?: string) => {
    setPlans(prev => prev.map(p => {
      if (p.id !== id) return p;
      const newStatus = action === 'Approve' ? 'Approved' : 'Changes Requested';
      const timestamp = new Date().toLocaleString();
      
      const newComments = commentText ? [...p.comments, {
        id: Date.now().toString(),
        author: 'Principal Anderson',
        role: 'Admin',
        text: commentText,
        timestamp
      }] : p.comments;

      const newHistory = [...p.history, {
          id: Date.now().toString(),
          timestamp,
          user: 'Principal Anderson',
          action: action === 'Approve' ? 'Approved' : 'Requested Changes',
          details: commentText
      }];

      return { ...p, status: newStatus, comments: newComments, history: newHistory };
    }));
    setIsDetailOpen(false);
  };

  const toggleCovered = (id: string) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, isCovered: !p.isCovered } : p));
  };

  const togglePublished = (id: string) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, isPublished: !p.isPublished } : p));
  };

  // --- Filtering Logic ---
  const filteredPlans = plans.filter(p => {
    // 1. Basic Search
    const matchesSearch = p.topic.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.teacher.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Tab Specific Logic
    let matchesTab = false;
    if (activeTab === 'planner') {
      if (currentRole === 'Teacher') matchesTab = p.teacher === 'Mrs. Verma'; 
      if (currentRole === 'Admin') matchesTab = p.status === 'Pending Review';
    } else {
      // Repository: Show approved plans
      // For demo purposes, if search is empty show approved, otherwise search all
      matchesTab = p.status === 'Approved' || searchQuery.length > 0; 
    }

    // 3. Advanced Filters (Active in repository)
    const matchesSubject = filterSubject === 'All' || p.subject === filterSubject;
    const matchesClass = filterClass === 'All' || p.classId === filterClass;
    
    // Date Range
    let matchesDate = true;
    if (filterDateStart) matchesDate = matchesDate && p.weekStart >= filterDateStart;
    if (filterDateEnd) matchesDate = matchesDate && p.weekStart <= filterDateEnd;

    // Covered Status
    let matchesCovered = true;
    if (filterCoveredStatus === 'Covered') matchesCovered = p.isCovered;
    if (filterCoveredStatus === 'Pending') matchesCovered = !p.isCovered;

    return matchesTab && matchesSearch && matchesSubject && matchesClass && matchesDate && matchesCovered;
  });

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      {/* Header & Role Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Lesson Planning</h2>
          <p className="text-sm text-text-sub-light dark:text-text-sub-dark">
            {currentRole === 'Teacher' ? 'Manage your weekly instructional plans.' : 'Review and approve teacher submissions.'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Role Toggle for Demo */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button 
              onClick={() => { setCurrentRole('Teacher'); setActiveTab('planner'); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${currentRole === 'Teacher' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}
            >
              Teacher View
            </button>
            <button 
              onClick={() => { setCurrentRole('Admin'); setActiveTab('planner'); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${currentRole === 'Admin' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}
            >
              Admin View
            </button>
          </div>

          {currentRole === 'Teacher' && (
             <button 
               onClick={() => { setSelectedPlan(null); setIsEditorOpen(true); }}
               className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm text-sm font-medium"
             >
               <span className="material-icons-outlined text-sm">add</span>
               New Plan
             </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('planner')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'planner' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <span className="material-icons-outlined text-lg">{currentRole === 'Teacher' ? 'My Plans' : 'Review Queue'}</span>
          {currentRole === 'Admin' && (
            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {plans.filter(p => p.status === 'Pending Review').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('repository')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'repository' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <span className="material-icons-outlined text-lg">Repository</span>
        </button>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative col-span-1 md:col-span-1">
           <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
             <span className="material-icons-outlined">search</span>
           </span>
           <input 
             type="text" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search topic or teacher..."
             className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-primary outline-none"
           />
        </div>

        {activeTab === 'repository' && (
          <>
            <select 
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="All">All Subjects</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Mathematics</option>
            </select>
            
            <select 
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="All">All Classes</option>
              <option value="Class 10 - A">Class 10 - A</option>
              <option value="Class 11 - B">Class 11 - B</option>
            </select>

            <select 
              value={filterCoveredStatus}
              onChange={(e) => setFilterCoveredStatus(e.target.value as any)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="All">Status: All</option>
              <option value="Covered">Covered</option>
              <option value="Pending">Pending Coverage</option>
            </select>
            
            {/* Date Range */}
            <div className="col-span-1 md:col-span-4 flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500 font-medium">Filter by Week:</span>
                <input 
                  type="date" 
                  value={filterDateStart} 
                  onChange={e => setFilterDateStart(e.target.value)}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-xs outline-none" 
                />
                <span className="text-gray-400">-</span>
                <input 
                  type="date" 
                  value={filterDateEnd} 
                  onChange={e => setFilterDateEnd(e.target.value)}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-xs outline-none" 
                />
                <button 
                  onClick={() => { setFilterDateStart(''); setFilterDateEnd(''); setFilterSubject('All'); setFilterClass('All'); setFilterCoveredStatus('All'); setSearchQuery(''); }}
                  className="ml-auto text-xs text-red-500 hover:underline"
                >
                  Clear Filters
                </button>
            </div>
          </>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-4">
        {filteredPlans.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-card-dark rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
             <span className="material-icons-outlined text-4xl text-gray-300 mb-2">folder_open</span>
             <p className="text-gray-500">No plans found matching your criteria.</p>
          </div>
        ) : (
          filteredPlans.map(plan => (
            <div key={plan.id} className="bg-white dark:bg-card-dark p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6">
               {/* Left: Metadata */}
               <div className="md:w-1/4 space-y-3 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 pb-4 md:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                     <span className={`w-2 h-2 rounded-full 
                        ${plan.status === 'Approved' ? 'bg-green-500' : 
                          plan.status === 'Pending Review' ? 'bg-orange-500' : 
                          plan.status === 'Changes Requested' ? 'bg-red-500' : 'bg-gray-400'}`} 
                     />
                     <span className="text-xs font-bold uppercase tracking-wider text-text-sub-light dark:text-text-sub-dark">{plan.status}</span>
                  </div>
                  <div>
                     <p className="text-xs text-gray-400">Week Starting</p>
                     <p className="font-medium text-text-main-light dark:text-text-main-dark">{plan.weekStart}</p>
                  </div>
                  <div>
                     <p className="text-xs text-gray-400">Class & Subject</p>
                     <p className="font-medium text-text-main-light dark:text-text-main-dark">{plan.classId} • {plan.subject}</p>
                  </div>
                  <div>
                     <p className="text-xs text-gray-400">Teacher</p>
                     <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                           {plan.teacher.charAt(0)}
                        </div>
                        <span className="text-sm">{plan.teacher}</span>
                     </div>
                  </div>
               </div>

               {/* Center: Content Preview */}
               <div className="flex-1 space-y-4">
                  <div>
                     <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">{plan.topic}</h3>
                     <p className="text-sm text-text-sub-light dark:text-text-sub-dark mt-1 line-clamp-2">{plan.objectives}</p>
                  </div>
                  
                  {/* Resources */}
                  {plan.resources.length > 0 && (
                     <div className="flex flex-wrap gap-2">
                        {plan.resources.map((res, idx) => (
                           <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                              <span className="material-icons-outlined text-[14px]">attachment</span>
                              {res}
                           </span>
                        ))}
                     </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center gap-3 pt-2 flex-wrap">
                     <button 
                        onClick={() => { setSelectedPlan(plan); setDetailInitialTab('content'); setIsDetailOpen(true); }}
                        className="text-sm text-primary hover:underline font-medium"
                     >
                        View Details
                     </button>
                     
                     {/* Version History Button - Specific for Approved/Changes Requested */}
                     {(plan.status === 'Approved' || plan.status === 'Changes Requested') && (
                        <>
                           <span className="text-gray-300">|</span>
                           <button 
                              onClick={() => { setSelectedPlan(plan); setDetailInitialTab('history'); setIsDetailOpen(true); }}
                              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                              title="View Version History"
                           >
                              <span className="material-icons-outlined text-[16px]">history</span>
                              History
                           </button>
                        </>
                     )}

                     {/* Action: Teacher Edit */}
                     {currentRole === 'Teacher' && plan.status !== 'Approved' && plan.status !== 'Pending Review' && activeTab === 'planner' && (
                        <>
                           <span className="text-gray-300">|</span>
                           <button onClick={() => { setSelectedPlan(plan); setIsEditorOpen(true); }} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Edit</button>
                           <span className="text-gray-300">|</span>
                           <button onClick={() => handleSubmitForReview(plan.id)} className="text-sm text-orange-600 hover:text-orange-700 font-medium">Submit for Review</button>
                        </>
                     )}

                     {/* Action: Admin Review */}
                     {currentRole === 'Admin' && plan.status === 'Pending Review' && activeTab === 'planner' && (
                         <button onClick={() => { setSelectedPlan(plan); setDetailInitialTab('content'); setIsDetailOpen(true); }} className="ml-auto px-4 py-1.5 bg-primary text-white text-xs rounded shadow-sm hover:bg-blue-600">
                            Review Now
                         </button>
                     )}
                  </div>
               </div>

               {/* Right: Controls (Repository Only or Approved Plans in list) */}
               {(activeTab === 'repository' || plan.status === 'Approved') && (
                  <div className="md:w-1/6 flex flex-col items-end justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 pt-4 md:pt-0 pl-4">
                     {/* Mark as Covered Toggle */}
                     <label className="flex items-center gap-2 cursor-pointer group" title="Toggle coverage status">
                        <span className={`text-xs ${plan.isCovered ? 'text-green-600 font-bold' : 'text-gray-500'}`}>Covered</span>
                        <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${plan.isCovered ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} onClick={() => toggleCovered(plan.id)}>
                           <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${plan.isCovered ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                     </label>

                     {/* Publish Toggle */}
                     <label className="flex items-center gap-2 cursor-pointer group" title="Make visible to students">
                        <span className={`text-xs ${plan.isPublished ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>Published</span>
                        <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${plan.isPublished ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} onClick={() => togglePublished(plan.id)}>
                           <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${plan.isPublished ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                     </label>
                  </div>
               )}
            </div>
          ))
        )}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <PlanEditor 
           plan={selectedPlan} 
           onClose={() => setIsEditorOpen(false)} 
           onSave={handleSavePlan} 
        />
      )}

      {/* Detail/Review Modal */}
      {isDetailOpen && selectedPlan && (
        <PlanDetail 
           plan={selectedPlan} 
           currentUserRole={currentRole}
           initialTab={detailInitialTab}
           onClose={() => setIsDetailOpen(false)}
           onReviewAction={handleReviewAction}
           onTogglePublish={() => togglePublished(selectedPlan.id)}
        />
      )}
    </div>
  );
};

// --- Sub-components ---

const PlanEditor: React.FC<{ plan: LessonPlan | null, onClose: () => void, onSave: (data: Partial<LessonPlan>) => void }> = ({ plan, onClose, onSave }) => {
   const [formData, setFormData] = useState({
      weekStart: plan?.weekStart || '',
      classId: plan?.classId || 'Class 10 - A',
      subject: plan?.subject || 'Physics',
      topic: plan?.topic || '',
      objectives: plan?.objectives || '',
      isPublished: plan?.isPublished || false
   });

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
         <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-slide-in-down">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
               <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">{plan ? 'Edit Weekly Plan' : 'New Weekly Plan'}</h3>
               <button onClick={onClose}><span className="material-icons-outlined">close</span></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-medium text-gray-500 mb-1">Week Start Date</label>
                     <input type="date" value={formData.weekStart} onChange={e => setFormData({...formData, weekStart: e.target.value})} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm" />
                  </div>
                  <div>
                     <label className="block text-xs font-medium text-gray-500 mb-1">Class</label>
                     <select value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm">
                        <option>Class 10 - A</option>
                        <option>Class 11 - B</option>
                     </select>
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
                  <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm">
                        <option>Physics</option>
                        <option>Chemistry</option>
                        <option>Mathematics</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Main Topic</label>
                  <input type="text" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} placeholder="e.g. Laws of Motion" className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm" />
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Learning Objectives & Plan</label>
                  <textarea rows={5} value={formData.objectives} onChange={e => setFormData({...formData, objectives: e.target.value})} placeholder="List objectives, activities, and key questions..." className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm"></textarea>
               </div>
               
               <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.isPublished} onChange={e => setFormData({...formData, isPublished: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Publish to Students immediately on approval</span>
                  </label>
               </div>

               {/* File Upload Simulation */}
               <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                  <span className="material-icons-outlined text-gray-400 mb-1">cloud_upload</span>
                  <p className="text-xs text-gray-500">Drag & drop resources (PDF, PPT)</p>
               </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800/50">
               <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
               <button onClick={() => onSave(formData)} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-600">Save Draft</button>
            </div>
         </div>
      </div>
   );
};

const PlanDetail: React.FC<{ 
   plan: LessonPlan, 
   currentUserRole: UserRole,
   initialTab?: 'content' | 'history',
   onClose: () => void,
   onReviewAction: (id: string, action: 'Approve' | 'Request Changes', comment?: string) => void,
   onTogglePublish: () => void
}> = ({ plan, currentUserRole, initialTab = 'content', onClose, onReviewAction, onTogglePublish }) => {
   const [reviewComment, setReviewComment] = useState('');
   const [detailTab, setDetailTab] = useState<'content' | 'history'>(initialTab);

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
         <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-slide-in-down flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-card-dark z-10">
               <div className="flex gap-4 items-center">
                   <div>
                      <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Plan Details</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${plan.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{plan.status}</span>
                   </div>
                   {/* Detail Tabs */}
                   <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 ml-4">
                      <button 
                         onClick={() => setDetailTab('content')}
                         className={`px-3 py-1 text-xs font-medium rounded-md ${detailTab === 'content' ? 'bg-white dark:bg-card-dark shadow' : 'text-gray-500'}`}
                      >
                         Content
                      </button>
                      <button 
                         onClick={() => setDetailTab('history')}
                         className={`px-3 py-1 text-xs font-medium rounded-md ${detailTab === 'history' ? 'bg-white dark:bg-card-dark shadow' : 'text-gray-500'}`}
                      >
                         History
                      </button>
                   </div>
               </div>
               <button onClick={onClose}><span className="material-icons-outlined">close</span></button>
            </div>
            
            <div className="p-6 flex-1 space-y-6 overflow-y-auto">
               {detailTab === 'content' ? (
                 <>
                    {/* Publishing Control (Top Right of Content) */}
                    <div className="flex justify-end mb-2">
                       <label className="flex items-center gap-2 cursor-pointer">
                          <span className="text-xs text-gray-500">Published to Students</span>
                          <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${plan.isPublished ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} onClick={onTogglePublish}>
                             <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${plan.isPublished ? 'translate-x-5' : 'translate-x-0'}`}></div>
                          </div>
                       </label>
                    </div>

                    {/* Plan Content */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-gray-500 block text-xs">Teacher</span> <span className="font-medium">{plan.teacher}</span></div>
                        <div><span className="text-gray-500 block text-xs">Week Of</span> <span className="font-medium">{plan.weekStart}</span></div>
                        <div><span className="text-gray-500 block text-xs">Class</span> <span className="font-medium">{plan.classId}</span></div>
                        <div><span className="text-gray-500 block text-xs">Subject</span> <span className="font-medium">{plan.subject}</span></div>
                    </div>

                    <div>
                        <h4 className="font-bold text-sm mb-2 border-b border-gray-100 dark:border-gray-700 pb-1">Topic: {plan.topic}</h4>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-sm whitespace-pre-line text-text-main-light dark:text-text-main-dark">
                          {plan.objectives}
                        </div>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-bold text-sm mb-2">Resources</h4>
                        <div className="flex flex-wrap gap-2">
                          {plan.resources.length > 0 ? plan.resources.map((r, i) => (
                              <div key={i} className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                <span className="material-icons-outlined text-red-500">picture_as_pdf</span>
                                <span className="text-sm">{r}</span>
                              </div>
                          )) : <span className="text-sm text-gray-400 italic">No attachments.</span>}
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                          <span className="material-icons-outlined text-gray-400">comment</span> 
                          Discussion History
                        </h4>
                        <div className="space-y-4">
                          {plan.comments.length === 0 ? (
                              <p className="text-sm text-gray-400 italic text-center py-2">No comments yet.</p>
                          ) : (
                              plan.comments.map(comment => (
                                <div key={comment.id} className={`flex gap-3 ${comment.role === 'Admin' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${comment.role === 'Admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                      {comment.author.charAt(0)}
                                    </div>
                                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${comment.role === 'Admin' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-200' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                      <div className="flex justify-between items-center gap-4 mb-1">
                                          <span className="font-bold text-xs">{comment.author}</span>
                                          <span className="text-[10px] opacity-70">{comment.timestamp}</span>
                                      </div>
                                      <p>{comment.text}</p>
                                    </div>
                                </div>
                              ))
                          )}
                        </div>
                    </div>
                 </>
               ) : (
                 // History Tab Content
                 <div className="space-y-4">
                    <h4 className="font-bold text-sm mb-4">Version History & Audit Log</h4>
                    <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-6">
                       {plan.history.map((event, idx) => (
                          <div key={event.id} className="ml-6 relative">
                             <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-card-dark"></div>
                             <div>
                                <p className="text-sm font-bold text-text-main-light dark:text-text-main-dark">{event.action}</p>
                                <p className="text-xs text-gray-500 mb-1">{event.timestamp} • by {event.user}</p>
                                {event.details && (
                                   <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs text-gray-600 dark:text-gray-300 italic">
                                      "{event.details}"
                                   </div>
                                )}
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
               )}
            </div>

            {/* Admin Actions Footer */}
            {currentUserRole === 'Admin' && plan.status === 'Pending Review' && detailTab === 'content' && (
               <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 sticky bottom-0">
                  <div className="mb-3">
                     <input 
                        type="text" 
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Add a comment (required for changes request)..."
                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-primary outline-none"
                     />
                  </div>
                  <div className="flex justify-end gap-3">
                     <button 
                        onClick={() => {
                           if (!reviewComment) return alert('Please add a comment explaining the required changes.');
                           onReviewAction(plan.id, 'Request Changes', reviewComment);
                        }}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                     >
                        Request Changes
                     </button>
                     <button 
                        onClick={() => onReviewAction(plan.id, 'Approve', reviewComment)}
                        className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 shadow-sm"
                     >
                        Approve Plan
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};