import React, { useState } from 'react';

// Reuse the logic from the previous CommunicationHub but styled to fit the new module structure
// This component focuses purely on the meeting scheduling aspect.

type MeetingType = 'TownHall' | 'Roundtable' | '1-on-1 Slots';
type MeetingMode = 'Online' | 'In-Person' | 'Hybrid';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  type: MeetingType;
  mode: MeetingMode;
  status: 'Scheduled' | 'Completed';
}

const UPCOMING_MEETINGS: Meeting[] = [
  { id: 'm1', title: 'Emergency Staff Briefing', date: new Date().toISOString().split('T')[0], time: '08:30', type: 'TownHall', mode: 'In-Person', status: 'Scheduled' },
  { id: 'm2', title: 'Class 10-A PTM', date: '2024-10-25', time: '14:00', type: 'Roundtable', mode: 'Hybrid', status: 'Scheduled' }
];

export const MeetingScheduler: React.FC = () => {
  const [meetings, setMeetings] = useState(UPCOMING_MEETINGS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">Meeting Scheduler</h2>
          <p className="text-sm text-gray-500">Organize virtual or physical meetings.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors">
          <span className="material-icons-outlined text-sm">add_call</span> Schedule Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings.map(m => (
          <div key={m.id} className="bg-white dark:bg-card-dark p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
             <div className="flex justify-between mb-2">
                <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded font-bold uppercase">{m.type}</span>
                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded font-bold">{m.status}</span>
             </div>
             <h3 className="font-bold text-lg mb-1">{m.title}</h3>
             <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                <span className="material-icons-outlined text-sm">event</span> {m.date} at {m.time}
             </div>
             <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <span className="text-xs text-gray-400">{m.mode}</span>
                <button className="text-sm text-primary hover:underline">Details</button>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
           <div className="relative bg-white dark:bg-card-dark p-6 rounded-xl shadow-xl max-w-md w-full animate-slide-in-down">
              <h3 className="text-lg font-bold mb-4">Schedule New Meeting</h3>
              <p className="text-gray-500 text-sm mb-4">Use the full broadcast tools to send invites after creating the schedule.</p>
              <div className="flex justify-end gap-2">
                 <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100">Cancel</button>
                 <button onClick={() => { setIsModalOpen(false); alert('Meeting created!'); }} className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-600">Create</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
