
import React, { useState, useMemo } from 'react';

// --- Types ---
type ViewMode = 'Calendar' | 'List';
type InterviewMode = 'In-Person' | 'Video' | 'Phone';
type InterviewStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';

interface Counselor {
  id: string;
  name: string;
  color: string; // Tailwind class for background
}

interface Interview {
  id: string;
  applicantName: string;
  applicationId: string;
  applicantClass: string;
  parentName: string;
  counselorId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  mode: InterviewMode;
  locationOrLink: string;
  status: InterviewStatus;
  notes?: string;
  remindersSet: boolean;
}

// --- Mock Data ---
const COUNSELORS: Counselor[] = [
  { id: 'c1', name: 'Mrs. Verma', color: 'bg-purple-100 text-purple-700' },
  { id: 'c2', name: 'Mr. David', color: 'bg-blue-100 text-blue-700' },
  { id: 'c3', name: 'Principal Anderson', color: 'bg-red-100 text-red-700' },
];

const MOCK_INTERVIEWS: Interview[] = [
  {
    id: 'int_1',
    applicantName: 'Aarav Patel',
    applicationId: 'APP-001',
    applicantClass: 'Class 1',
    parentName: 'Suresh Patel',
    counselorId: 'c1',
    date: new Date().toISOString().split('T')[0], // Today
    startTime: '10:00',
    endTime: '10:30',
    mode: 'In-Person',
    locationOrLink: 'Room 101',
    status: 'Scheduled',
    remindersSet: true,
  },
  {
    id: 'int_2',
    applicantName: 'Zara Khan',
    applicationId: 'APP-002',
    applicantClass: 'Class 5',
    parentName: 'Farhan Khan',
    counselorId: 'c2',
    date: new Date().toISOString().split('T')[0], // Today
    startTime: '14:00',
    endTime: '14:45',
    mode: 'Video',
    locationOrLink: 'meet.google.com/abc-xyz',
    status: 'Scheduled',
    remindersSet: true,
  },
  {
    id: 'int_3',
    applicantName: 'Ishaan Gupta',
    applicationId: 'APP-003',
    applicantClass: 'Class 9',
    parentName: 'Meera Gupta',
    counselorId: 'c1',
    date: '2024-10-28',
    startTime: '11:00',
    endTime: '11:30',
    mode: 'Phone',
    locationOrLink: '+91 9876543210',
    status: 'Completed',
    remindersSet: false,
  }
];

// --- Templates ---
const TEMPLATES = {
  inviteSMS: (data: Partial<Interview>) => 
    `Hello ${data.parentName || '[Parent]'}, your interview for ${data.applicantName || '[Applicant]'} (Class ${data.applicantClass || '[Class]'}) is scheduled on ${data.date} at ${data.startTime} at ${data.locationOrLink}. Please carry original documents.`,
  
  reminderEmail: (data: Partial<Interview>) => 
    `Reminder: Interview tomorrow at ${data.startTime} for ${data.applicantName}. ${data.mode === 'Video' ? `Link: ${data.locationOrLink}` : `Location: ${data.locationOrLink}`}`
};

export const Scheduler: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('Calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [interviews, setInterviews] = useState<Interview[]>(MOCK_INTERVIEWS);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Interview>>({
    mode: 'In-Person',
    startTime: '09:00',
    endTime: '09:30',
    date: new Date().toISOString().split('T')[0],
    remindersSet: true
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // --- Logic ---

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const checkConflicts = (newInt: Partial<Interview>): string[] => {
    const errors: string[] = [];
    
    // 1. Interviewer Conflict
    const counselorConflict = interviews.find(i => 
      i.counselorId === newInt.counselorId &&
      i.date === newInt.date &&
      i.status !== 'Cancelled' &&
      ((newInt.startTime! >= i.startTime && newInt.startTime! < i.endTime) || 
       (newInt.endTime! > i.startTime && newInt.endTime! <= i.endTime))
    );

    if (counselorConflict) {
      const cName = COUNSELORS.find(c => c.id === counselorConflict.counselorId)?.name;
      errors.push(`Conflict: ${cName} is busy from ${counselorConflict.startTime} to ${counselorConflict.endTime}.`);
    }

    // 2. Applicant Double Booking (Simulated by name check for now)
    const applicantConflict = interviews.find(i => 
      i.applicantName.toLowerCase() === newInt.applicantName?.toLowerCase() &&
      i.status !== 'Cancelled' &&
      i.status !== 'Completed'
    );

    if (applicantConflict) {
      errors.push(`Warning: ${newInt.applicantName} already has a scheduled interview on ${applicantConflict.date}.`);
    }

    return errors;
  };

  const handleSave = () => {
    // Basic Validation
    if (!formData.applicantName || !formData.counselorId || !formData.date || !formData.startTime || !formData.endTime) {
      setFormErrors(['Please fill in all required fields.']);
      return;
    }

    const conflicts = checkConflicts(formData);
    if (conflicts.length > 0) {
      // If only warnings, maybe allow bypass? For now, block on counselor conflict.
      if (conflicts.some(e => e.startsWith('Conflict'))) {
        setFormErrors(conflicts);
        return;
      } else {
        if (!confirm(`${conflicts[0]} Continue anyway?`)) return;
      }
    }

    const newInterview: Interview = {
      id: Date.now().toString(),
      applicantName: formData.applicantName!,
      applicationId: formData.applicationId || 'APP-NEW',
      applicantClass: formData.applicantClass || 'N/A',
      parentName: formData.parentName || 'Parent',
      counselorId: formData.counselorId!,
      date: formData.date!,
      startTime: formData.startTime!,
      endTime: formData.endTime!,
      mode: formData.mode as InterviewMode,
      locationOrLink: formData.locationOrLink || (formData.mode === 'Video' ? 'Pending Link' : 'Main Office'),
      status: 'Scheduled',
      remindersSet: formData.remindersSet || false,
      notes: formData.notes
    };

    setInterviews([...interviews, newInterview]);
    setIsModalOpen(false);
    setFormErrors([]);
    setFormData({ mode: 'In-Person', startTime: '09:00', endTime: '09:30', date: new Date().toISOString().split('T')[0], remindersSet: true });
    alert('Interview Scheduled & Invite Queued!');
  };

  const filteredInterviews = interviews.sort((a,b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

  // --- Renderers ---

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = Array.from({ length: 42 }, (_, i) => {
      const dayNum = i - firstDay + 1;
      return (dayNum > 0 && dayNum <= daysInMonth) ? dayNum : null;
    });

    return (
      <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-1">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><span className="material-icons-outlined text-gray-500">chevron_left</span></button>
              <button onClick={() => setCurrentDate(new Date())} className="text-xs font-medium text-primary hover:underline px-2">Today</button>
              <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><span className="material-icons-outlined text-gray-500">chevron_right</span></button>
            </div>
          </div>
          <div className="flex gap-2">
             {COUNSELORS.map(c => (
                <div key={c.id} className="flex items-center gap-1 text-[10px]">
                   <span className={`w-2 h-2 rounded-full ${c.color.split(' ')[0]}`}></span>
                   <span className="text-gray-500">{c.name}</span>
                </div>
             ))}
          </div>
        </div>
        
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="p-2 text-center text-xs font-bold text-gray-500 uppercase">{d}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 flex-1 auto-rows-fr divide-x divide-y divide-gray-200 dark:divide-gray-700">
          {days.map((day, idx) => {
            if (!day) return <div key={idx} className="bg-gray-50/30 dark:bg-gray-900/30 min-h-[80px]"></div>;
            
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayInterviews = interviews.filter(i => i.date === dateStr);
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            return (
              <div key={idx} className={`p-2 min-h-[100px] relative hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer`} onClick={() => {}}>
                <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white' : 'text-gray-500'}`}>{day}</span>
                <div className="mt-1 space-y-1">
                  {dayInterviews.map(int => {
                    const counselor = COUNSELORS.find(c => c.id === int.counselorId);
                    return (
                      <div 
                        key={int.id} 
                        onClick={(e) => { e.stopPropagation(); setSelectedInterview(int); }}
                        className={`text-[9px] px-1.5 py-0.5 rounded truncate border cursor-pointer hover:opacity-80 ${counselor?.color || 'bg-gray-100 text-gray-600'}`}
                      >
                        {int.startTime} {int.applicantName}
                      </div>
                    );
                  })}
                </div>
                <button 
                    className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-primary transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        setFormData({...formData, date: dateStr});
                        setIsModalOpen(true);
                    }}
                >
                    <span className="material-icons-outlined text-sm">add_circle</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderList = () => (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden h-full flex flex-col">
       <div className="overflow-auto">
          <table className="w-full text-sm text-left">
             <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <tr>
                   <th className="px-6 py-3">Date & Time</th>
                   <th className="px-6 py-3">Applicant</th>
                   <th className="px-6 py-3">Interviewer</th>
                   <th className="px-6 py-3">Mode</th>
                   <th className="px-6 py-3">Location/Link</th>
                   <th className="px-6 py-3">Status</th>
                   <th className="px-6 py-3 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredInterviews.map(int => {
                   const counselor = COUNSELORS.find(c => c.id === int.counselorId);
                   return (
                      <tr key={int.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                         <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-text-main-light dark:text-text-main-dark">{int.date}</div>
                            <div className="text-xs text-gray-500">{int.startTime} - {int.endTime}</div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="font-bold text-text-main-light dark:text-text-main-dark">{int.applicantName}</div>
                            <div className="text-xs text-gray-500">{int.applicantClass}</div>
                         </td>
                         <td className="px-6 py-4">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${counselor?.color}`}>
                               {counselor?.name}
                            </span>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                               <span className="material-icons-outlined text-sm">
                                  {int.mode === 'Video' ? 'videocam' : int.mode === 'Phone' ? 'call' : 'room'}
                               </span>
                               {int.mode}
                            </div>
                         </td>
                         <td className="px-6 py-4 text-xs text-blue-600 truncate max-w-[150px]">
                            {int.locationOrLink}
                         </td>
                         <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                               ${int.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                                 int.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                 'bg-red-100 text-red-700'}`}>
                               {int.status}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button onClick={() => setSelectedInterview(int)} className="text-primary hover:underline text-xs font-medium">Details</button>
                         </td>
                      </tr>
                   );
                })}
             </tbody>
          </table>
       </div>
    </div>
  );

  return (
    <div className="space-y-6 h-full flex flex-col relative animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
         <div>
            <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Interview Scheduler</h2>
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Manage interviews, counselling sessions, and automated invites.</p>
         </div>
         <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
               <button onClick={() => setViewMode('Calendar')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${viewMode === 'Calendar' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}>
                  <span className="material-icons-outlined text-sm">calendar_month</span> Calendar
               </button>
               <button onClick={() => setViewMode('List')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${viewMode === 'List' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}>
                  <span className="material-icons-outlined text-sm">list</span> List
               </button>
            </div>
            <button 
               onClick={() => setIsModalOpen(true)}
               className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition-colors"
            >
               <span className="material-icons-outlined text-sm">add</span> Schedule
            </button>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
         {viewMode === 'Calendar' ? renderCalendar() : renderList()}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-in-down flex flex-col max-h-[90vh]">
               <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                  <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">Schedule Interview</h3>
                  <button onClick={() => setIsModalOpen(false)}><span className="material-icons-outlined text-gray-500">close</span></button>
               </div>
               
               <div className="p-6 overflow-y-auto space-y-4">
                  {formErrors.length > 0 && (
                     <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 p-3 rounded-lg text-xs">
                        {formErrors.map((err, i) => <p key={i}>• {err}</p>)}
                     </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Applicant Name</label>
                        <input type="text" value={formData.applicantName || ''} onChange={e => setFormData({...formData, applicantName: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Parent Name</label>
                        <input type="text" value={formData.parentName || ''} onChange={e => setFormData({...formData, parentName: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none" />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Class</label>
                        <select value={formData.applicantClass || ''} onChange={e => setFormData({...formData, applicantClass: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none">
                           <option value="">Select</option>
                           <option>Class 1</option>
                           <option>Class 5</option>
                           <option>Class 9</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Interviewer</label>
                        <select value={formData.counselorId || ''} onChange={e => setFormData({...formData, counselorId: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none">
                           <option value="">Select Counselor</option>
                           {COUNSELORS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                        <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start</label>
                        <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End</label>
                        <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none" />
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mode & Location</label>
                     <div className="flex gap-2 mb-2">
                        {['In-Person', 'Video', 'Phone'].map(m => (
                           <button 
                              key={m} 
                              onClick={() => setFormData({...formData, mode: m as InterviewMode})}
                              className={`flex-1 py-1 text-xs border rounded ${formData.mode === m ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'}`}
                           >
                              {m}
                           </button>
                        ))}
                     </div>
                     <input 
                        type="text" 
                        value={formData.locationOrLink || ''} 
                        onChange={e => setFormData({...formData, locationOrLink: e.target.value})} 
                        placeholder={formData.mode === 'Video' ? 'Meeting Link' : 'Room Number'} 
                        className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none" 
                     />
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                     <input type="checkbox" checked={formData.remindersSet} onChange={e => setFormData({...formData, remindersSet: e.target.checked})} className="rounded text-primary focus:ring-primary" />
                     <div className="text-xs">
                        <p className="font-bold text-blue-700 dark:text-blue-300">Auto-Send Reminders</p>
                        <p className="text-blue-600 dark:text-blue-400">Send SMS/Email 24h and 1h before.</p>
                     </div>
                  </div>
               </div>

               <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800/50">
                  <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm">Cancel</button>
                  <button onClick={handleSave} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm text-sm">Schedule</button>
               </div>
            </div>
         </div>
      )}

      {/* Detail Slide-Over */}
      {selectedInterview && (
         <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedInterview(null)}></div>
            <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-white dark:bg-card-dark shadow-2xl flex flex-col animate-slide-in-right">
               <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-start">
                  <div>
                     <h2 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">{selectedInterview.applicantName}</h2>
                     <p className="text-xs text-gray-500">{selectedInterview.applicationId} • {selectedInterview.applicantClass}</p>
                  </div>
                  <button onClick={() => setSelectedInterview(null)}><span className="material-icons-outlined text-gray-500">close</span></button>
               </div>
               
               <div className="p-5 space-y-6 overflow-y-auto flex-1">
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><span className="material-icons-outlined text-lg">event</span></div>
                        <div>
                           <p className="font-bold text-gray-700 dark:text-gray-200">{selectedInterview.date}</p>
                           <p className="text-xs text-gray-500">{selectedInterview.startTime} - {selectedInterview.endTime}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600"><span className="material-icons-outlined text-lg">person</span></div>
                        <div>
                           <p className="font-bold text-gray-700 dark:text-gray-200">{COUNSELORS.find(c => c.id === selectedInterview.counselorId)?.name}</p>
                           <p className="text-xs text-gray-500">Interviewer</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600"><span className="material-icons-outlined text-lg">videocam</span></div>
                        <div>
                           <p className="font-bold text-gray-700 dark:text-gray-200">{selectedInterview.mode}</p>
                           <p className="text-xs text-blue-600 break-all">{selectedInterview.locationOrLink}</p>
                        </div>
                     </div>
                  </div>

                  {/* Templates Preview */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                     <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Automated Communications</h4>
                     <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-xs text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 mb-2">
                        <span className="block font-bold text-gray-500 mb-1">Invite SMS:</span>
                        {TEMPLATES.inviteSMS(selectedInterview)}
                     </div>
                     <button className="text-xs text-primary hover:underline flex items-center gap-1">
                        <span className="material-icons-outlined text-xs">content_copy</span> Copy Invite
                     </button>
                  </div>
               </div>

               <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2 bg-gray-50 dark:bg-gray-800/50">
                  <button className="flex-1 py-2 text-sm text-red-600 border border-red-200 bg-white rounded-lg hover:bg-red-50">Cancel</button>
                  <button className="flex-1 py-2 text-sm text-white bg-primary rounded-lg hover:bg-blue-600">Reschedule</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
