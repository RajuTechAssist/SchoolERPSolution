import React, { useState } from 'react';

// --- Types ---
type MeetingType = 'TownHall' | 'Roundtable' | '1-on-1 Slots';
type AudienceType = 'Teachers' | 'Students' | 'Parents' | 'Staff';
type MeetingMode = 'Online' | 'In-Person' | 'Hybrid';

interface Meeting {
  id: string;
  title: string;
  agenda: string;
  date: string;
  time: string;
  duration: number;
  type: MeetingType;
  mode: MeetingMode;
  audienceSummary: string;
  audienceTags: { type: AudienceType; label: string }[];
  host: string;
  status: 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';
  link?: string; // For online
  room?: string; // For offline
}

// --- Mock Data ---
const UPCOMING_MEETINGS: Meeting[] = [
  {
    id: 'm1',
    title: 'Emergency Staff Briefing',
    agenda: 'Discussing new safety protocols.',
    date: new Date().toISOString().split('T')[0],
    time: '08:30',
    duration: 30,
    type: 'TownHall',
    mode: 'In-Person',
    audienceSummary: 'All Teaching Staff',
    audienceTags: [{ type: 'Teachers', label: 'All' }],
    host: 'Principal Anderson',
    status: 'Scheduled',
    room: 'Conference Hall A'
  },
  {
    id: 'm2',
    title: 'Class 10-A Performance Review',
    agenda: 'Addressing the drop in Math scores.',
    date: '2024-10-25',
    time: '14:00',
    duration: 60,
    type: 'Roundtable',
    mode: 'Hybrid',
    audienceSummary: 'Class 10-A Teachers & Parents',
    audienceTags: [{ type: 'Teachers', label: 'Class 10-A' }, { type: 'Parents', label: 'Class 10-A' }],
    host: 'Principal Anderson',
    status: 'Scheduled',
    link: 'meet.google.com/abc-xyz',
    room: 'Meeting Room 2'
  }
];

export const CommunicationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [meetings, setMeetings] = useState<Meeting[]>(UPCOMING_MEETINGS);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  // Creator State
  const [newMeeting, setNewMeeting] = useState<Partial<Meeting>>({
    title: '',
    agenda: '',
    type: 'Roundtable',
    mode: 'Online',
    duration: 45
  });
  
  // Smart Cohort Builder State
  const [selectedGroups, setSelectedGroups] = useState<AudienceType[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('All'); // e.g. "Class 10-A", "At-Risk"

  // --- Handlers ---

  const toggleGroup = (group: AudienceType) => {
    setSelectedGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const handleCreate = () => {
    const audienceTags = selectedGroups.map(g => ({ type: g, label: selectedFilter }));
    const summary = `${selectedGroups.join(' & ')} (${selectedFilter})`;

    const meeting: Meeting = {
      id: Date.now().toString(),
      title: newMeeting.title || 'Untitled Meeting',
      agenda: newMeeting.agenda || 'No agenda provided',
      date: newMeeting.date || new Date().toISOString().split('T')[0],
      time: newMeeting.time || '10:00',
      duration: newMeeting.duration || 60,
      type: newMeeting.type || 'Roundtable',
      mode: newMeeting.mode || 'Online',
      audienceSummary: summary,
      audienceTags: audienceTags,
      host: 'Principal Anderson',
      status: 'Scheduled',
      link: newMeeting.mode !== 'In-Person' ? `meet.school.edu/${Date.now()}` : undefined,
      room: newMeeting.mode !== 'Online' ? 'Main Office' : undefined
    };

    setMeetings([...meetings, meeting]);
    setIsCreatorOpen(false);
    // Reset
    setSelectedGroups([]);
    setSelectedFilter('All');
    setNewMeeting({ title: '', agenda: '', type: 'Roundtable', mode: 'Online', duration: 45 });
  };

  // --- Renderers ---

  const renderCreatorModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCreatorOpen(false)}></div>
      <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row animate-slide-in-down h-[80vh] md:h-auto">
        
        {/* Left: Configuration */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-4">Schedule Meeting</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
              <input 
                type="text" 
                value={newMeeting.title}
                onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                placeholder="e.g. Disciplinary Hearing: John Doe"
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none"
                  />
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Time</label>
                  <input 
                    type="time" 
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Format</label>
                  <select 
                    value={newMeeting.type}
                    onChange={(e) => setNewMeeting({...newMeeting, type: e.target.value as MeetingType})}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none"
                  >
                    <option value="Roundtable">Roundtable (Interactive)</option>
                    <option value="TownHall">Town Hall (Broadcast)</option>
                    <option value="1-on-1 Slots">1-on-1 Slots</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Mode</label>
                  <select 
                    value={newMeeting.mode}
                    onChange={(e) => setNewMeeting({...newMeeting, mode: e.target.value as MeetingMode})}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none"
                  >
                    <option value="Online">Online (Video)</option>
                    <option value="In-Person">In-Person</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
               </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Agenda & Notes</label>
              <textarea 
                rows={3}
                value={newMeeting.agenda}
                onChange={(e) => setNewMeeting({...newMeeting, agenda: e.target.value})}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none"
                placeholder="Key discussion points..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* Right: Smart Audience Selector */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 p-6 border-l border-gray-200 dark:border-gray-700 flex flex-col">
           <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-2">Build Audience Cohort</h3>
           <p className="text-sm text-gray-500 mb-6">Select who should attend. The system will auto-notify relevant parties.</p>

           <div className="space-y-6 flex-1">
              {/* Step 1: Broad Category */}
              <div>
                 <span className="text-xs font-bold uppercase text-gray-400 block mb-2">1. Select Groups (Intersect)</span>
                 <div className="flex flex-wrap gap-2">
                    {(['Teachers', 'Students', 'Parents', 'Staff'] as AudienceType[]).map(type => (
                       <button
                          key={type}
                          onClick={() => toggleGroup(type)}
                          className={`px-4 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-2
                             ${selectedGroups.includes(type) 
                                ? 'bg-primary text-white border-primary shadow-md' 
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary'}`}
                       >
                          <span className="material-icons-outlined text-sm">
                             {type === 'Teachers' ? 'school' : type === 'Parents' ? 'family_restroom' : type === 'Students' ? 'backpack' : 'badge'}
                          </span>
                          {type}
                       </button>
                    ))}
                 </div>
              </div>

              {/* Step 2: Context Filter */}
              <div>
                 <span className="text-xs font-bold uppercase text-gray-400 block mb-2">2. Apply Context Filter</span>
                 <select 
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm outline-none text-sm"
                 >
                    <option value="All">Entire School (Broadcast)</option>
                    <optgroup label="Academic Cohorts">
                       <option value="Class 10-A">Class 10-A Specific</option>
                       <option value="Class 10-B">Class 10-B Specific</option>
                       <option value="Science Dept">Science Department</option>
                    </optgroup>
                    <optgroup label="Smart Filters (Auto-Generated)">
                       <option value="At-Risk Attendance">Students with &lt; 75% Attendance</option>
                       <option value="Top Performers">Top 10% GPA</option>
                       <option value="Fee Defaulters">Outstanding Fee Balance</option>
                    </optgroup>
                 </select>
              </div>

              {/* Visual Summary */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                 <span className="text-xs text-gray-400 uppercase font-bold">Projected Audience</span>
                 <div className="mt-2 flex items-center flex-wrap gap-2">
                    {selectedGroups.length === 0 ? (
                       <span className="text-sm text-gray-500 italic">Select at least one group above.</span>
                    ) : (
                       selectedGroups.map(g => (
                          <div key={g} className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg text-sm border border-blue-100 dark:border-blue-800">
                             <span>{g}</span>
                             <span className="text-blue-300 dark:text-blue-600 mx-1">•</span>
                             <span className="font-bold">{selectedFilter}</span>
                          </div>
                       ))
                    )}
                 </div>
                 {selectedGroups.length > 0 && (
                    <div className="mt-3 text-xs text-green-600 flex items-center gap-1">
                       <span className="material-icons-outlined text-sm">check_circle</span>
                       Est. {Math.floor(Math.random() * 50) + 5} recipients
                    </div>
                 )}
              </div>
           </div>

           <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => setIsCreatorOpen(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm">Cancel</button>
              <button 
                 onClick={handleCreate}
                 disabled={selectedGroups.length === 0}
                 className="px-6 py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                 <span className="material-icons-outlined text-sm">send</span>
                 Schedule & Notify
              </button>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Communication Hub</h2>
          <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Orchestrate meetings with Students, Parents, and Teachers.</p>
        </div>
        <button 
          onClick={() => setIsCreatorOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg transition-colors shadow-md font-medium"
        >
          <span className="material-icons-outlined">add_call</span>
          Schedule Meeting
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
         <button onClick={() => setActiveTab('upcoming')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'upcoming' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Upcoming</button>
         <button onClick={() => setActiveTab('past')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'past' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Past & Minutes</button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
         {meetings.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
               <span className="material-icons-outlined text-5xl mb-2 opacity-50">event_busy</span>
               <p>No meetings scheduled.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {meetings.map(meeting => (
                  <div key={meeting.id} className="bg-card-light dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
                     <div className="p-5 flex-1">
                        <div className="flex justify-between items-start mb-3">
                           <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider
                              ${meeting.type === 'TownHall' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                meeting.type === '1-on-1 Slots' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                              {meeting.type}
                           </span>
                           {meeting.status === 'Scheduled' && (
                              <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Scheduled
                              </span>
                           )}
                        </div>
                        
                        <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-1 leading-tight">{meeting.title}</h3>
                        <p className="text-xs text-text-sub-light dark:text-text-sub-dark mb-4 line-clamp-2">{meeting.agenda}</p>
                        
                        <div className="space-y-2">
                           <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <span className="material-icons-outlined text-primary text-lg">event</span>
                              <span>{meeting.date} at {meeting.time}</span>
                           </div>
                           <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <span className="material-icons-outlined text-primary text-lg">
                                 {meeting.mode === 'Online' ? 'videocam' : meeting.mode === 'Hybrid' ? 'switch_video' : 'room'}
                              </span>
                              <span>{meeting.mode} {meeting.room ? `• ${meeting.room}` : ''}</span>
                           </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                           <p className="text-xs font-bold text-gray-400 uppercase mb-2">Audience Cohort</p>
                           <div className="flex flex-wrap gap-1">
                              {meeting.audienceTags.map((tag, i) => (
                                 <span key={i} className="inline-flex items-center px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-600 dark:text-gray-300">
                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 
                                       ${tag.type === 'Parents' ? 'bg-green-500' : tag.type === 'Teachers' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                    </span>
                                    {tag.type}: {tag.label}
                                 </span>
                              ))}
                           </div>
                        </div>
                     </div>
                     
                     <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                        <div className="flex -space-x-2">
                           {[1,2,3].map(i => (
                              <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                 {String.fromCharCode(64+i)}
                              </div>
                           ))}
                           <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">+12</div>
                        </div>
                        <button className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                           Start <span className="material-icons-outlined text-sm">arrow_forward</span>
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>

      {isCreatorOpen && renderCreatorModal()}
    </div>
  );
};
