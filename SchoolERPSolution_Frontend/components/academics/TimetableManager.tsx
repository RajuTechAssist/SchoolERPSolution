import React, { useState } from 'react';

interface ScheduleItem {
  id: string;
  subject: string;
  code: string;
  teacher: string;
  room: string;
  color: 'blue' | 'orange' | 'purple' | 'green' | 'pink' | 'cyan' | 'yellow';
}

interface TimeSlot {
  id: string;
  time: string;
  label?: string;
  type: 'class' | 'break' | 'lunch';
  duration?: string;
}

interface Teacher {
  id: string;
  name: string;
  load: number;
  maxLoad: number;
  status: 'Available' | 'Full' | 'Busy';
  initials: string;
  color: string;
}

const WEEK_DAYS = [
  { day: 'Mon', date: '12', active: false },
  { day: 'Tue', date: '13', active: true },
  { day: 'Wed', date: '14', active: false },
  { day: 'Thu', date: '15', active: false },
  { day: 'Fri', date: '16', active: false },
  { day: 'Sat', date: '17', active: false },
];

const INITIAL_TIME_SLOTS: TimeSlot[] = [
  { id: 'ts1', time: '08:00', type: 'class' },
  { id: 'ts2', time: '09:00', type: 'class' },
  { id: 'ts3', time: '10:00', type: 'break', label: 'MORNING BREAK', duration: '10:00 - 10:15' },
  { id: 'ts4', time: '10:15', type: 'class' },
  { id: 'ts5', time: '11:15', type: 'lunch', label: 'LUNCH BREAK', duration: '11:15 - 12:00' },
  { id: 'ts6', time: '12:00', type: 'class' },
];

// Mock Teachers Data for Assignment
const MOCK_TEACHERS: Teacher[] = [
  { id: 't1', name: 'Mrs. Verma', load: 12, maxLoad: 30, status: 'Available', initials: 'MV', color: 'bg-indigo-100 text-indigo-600' },
  { id: 't2', name: 'Mr. Singh', load: 30, maxLoad: 30, status: 'Full', initials: 'MS', color: 'bg-gray-100 text-gray-600' },
  { id: 't3', name: 'Ms. Sarah', load: 18, maxLoad: 25, status: 'Available', initials: 'SA', color: 'bg-pink-100 text-pink-600' },
  { id: 't4', name: 'Mr. David', load: 22, maxLoad: 28, status: 'Available', initials: 'MD', color: 'bg-blue-100 text-blue-600' },
];

// Mock External Schedule for Conflict Detection
// This simulates a database of bookings for other classes
const EXTERNAL_SCHEDULE_CONFLICTS = [
  { day: 1, time: 0, teacher: 'Mr. David', room: 'Rm 204', className: 'Class 11 - B' }, // Tue 08:00
  { day: 0, time: 1, teacher: 'Mrs. Verma', room: 'Lab 1', className: 'Class 12 - A' }, // Mon 09:00
  { day: 3, time: 3, teacher: 'Ms. Sarah', room: 'Rm 101', className: 'Class 9 - A' },  // Thu 10:15
];

// Initial Data
const INITIAL_SCHEDULE: Record<string, ScheduleItem> = {
  '0-0': { id: '1', subject: 'English Lit.', code: 'Eng', teacher: 'Ms. Sarah', room: 'Rm 101', color: 'orange' },
  '0-1': { id: '2', subject: 'Chemistry', code: 'Sci', teacher: 'Ms. Curie', room: 'Lab 1', color: 'purple' },
  '0-3': { id: '3', subject: 'Phys. Ed', code: 'PE', teacher: 'Mr. Bolt', room: 'Gym', color: 'pink' },
  '1-0': { id: '4', subject: 'Mathematics', code: 'Math', teacher: 'Mr. David', room: 'Rm 204', color: 'blue' },
  '1-3': { id: '5', subject: 'Computer Sci', code: 'CS', teacher: 'Mr. Gates', room: 'Lab 3', color: 'cyan' },
  '1-5': { id: '6', subject: 'World History', code: 'Hist', teacher: 'Mrs. Clark', room: 'Rm 105', color: 'yellow' },
  '2-0': { id: '7', subject: 'Physics', code: 'Sci', teacher: 'Dr. Albert', room: 'Lab 2', color: 'purple' },
  '2-1': { id: '8', subject: 'Mathematics', code: 'Math', teacher: 'Mr. David', room: 'Rm 204', color: 'blue' },
  '2-5': { id: '9', subject: 'Phys. Ed', code: 'PE', teacher: 'Mr. Bolt', room: 'Gym', color: 'pink' },
  '3-1': { id: '10', subject: 'Grammar', code: 'Eng', teacher: 'Ms. Sarah', room: 'Rm 101', color: 'orange' },
  '3-3': { id: '11', subject: 'Biology', code: 'Sci', teacher: 'Ms. Rose', room: 'Lab 2', color: 'purple' },
  '3-5': { id: '12', subject: 'Computer Sci', code: 'CS', teacher: 'Mr. Gates', room: 'Lab 3', color: 'cyan' },
  '4-0': { id: '13', subject: 'World History', code: 'Hist', teacher: 'Mrs. Clark', room: 'Rm 105', color: 'yellow' },
  '4-1': { id: '14', subject: 'Geography', code: 'Geo', teacher: 'Mr. Stone', room: 'Rm 106', color: 'green' },
  '4-3': { id: '15', subject: 'Mathematics', code: 'Math', teacher: 'Mr. David', room: 'Rm 204', color: 'blue' },
  '4-5': { id: '16', subject: 'Music Theory', code: 'Mus', teacher: 'Ms. Melody', room: 'Rm 301', color: 'purple' },
  '5-1': { id: '17', subject: 'Visual Arts', code: 'Art', teacher: 'Ms. Paint', room: 'Studio', color: 'pink' },
};

const COLOR_MAP: Record<string, string> = {
  orange: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
  blue: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
  purple: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
  pink: 'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
  green: 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
};

const BADGE_COLOR_MAP: Record<string, string> = {
  orange: 'bg-orange-100 dark:bg-orange-900/50',
  blue: 'bg-blue-100 dark:bg-blue-900/50',
  purple: 'bg-purple-100 dark:bg-purple-900/50',
  pink: 'bg-pink-100 dark:bg-pink-900/50',
  cyan: 'bg-cyan-100 dark:bg-cyan-900/50',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/50',
  green: 'bg-green-100 dark:bg-green-900/50',
};

export const TimetableManager: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('Class 10 - A');
  const [scheduleData, setScheduleData] = useState<Record<string, ScheduleItem>>(INITIAL_SCHEDULE);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(INITIAL_TIME_SLOTS);
  
  const [draggedItem, setDraggedItem] = useState<{ id: string, sourceKey: string } | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [highlightedConflict, setHighlightedConflict] = useState<string | null>(null);

  // Assign/Edit Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetSlot, setTargetSlot] = useState<{ dayIndex: number, timeIndex: number, slotKey: string } | null>(null);
  const [assignForm, setAssignForm] = useState({ subject: '', teacherId: '', room: '' });

  // Timeline Config Modal State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // --- Logic: Conflict Detection ---
  const triggerConflict = (msg: string, slotKey?: string) => {
    setConflictError(msg);
    if (slotKey) setHighlightedConflict(slotKey);
    
    // Clear error after 5 seconds
    setTimeout(() => {
      setConflictError(null);
      setHighlightedConflict(null);
    }, 5000);
  };

  const checkForConflict = (day: number, time: number, teacher: string, room: string): string | null => {
    // 1. Check against other classes (External Conflicts)
    const externalConflict = EXTERNAL_SCHEDULE_CONFLICTS.find(
      c => c.day === day && c.time === time && (c.teacher === teacher || c.room === room)
    );

    if (externalConflict) {
      if (externalConflict.teacher === teacher) {
        return `Conflict: ${teacher} is already assigned to ${externalConflict.className} at this time.`;
      }
      return `Conflict: Room ${room} is occupied by ${externalConflict.className} at this time.`;
    }

    return null;
  };

  // --- Logic: Drag & Drop ---

  const handleDragStart = (e: React.DragEvent, key: string, item: ScheduleItem) => {
    setDraggedItem({ id: item.id, sourceKey: key });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    setDragOverKey(key);
  };

  const handleDragLeave = () => {
    setDragOverKey(null);
  };

  const handleDrop = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    setDragOverKey(null);

    if (!draggedItem || draggedItem.sourceKey === targetKey) return;

    const targetItem = scheduleData[targetKey];
    const sourceItem = scheduleData[draggedItem.sourceKey];

    // 1. Visual Conflict: Slot Occupied
    if (targetItem) {
      triggerConflict(`Conflict: Slot occupied by ${targetItem.subject}. Move or delete it first.`, targetKey);
      return;
    }

    // Parse target slot
    const [dayStr, timeStr] = targetKey.split('-');
    const dayIndex = parseInt(dayStr);
    const timeIndex = parseInt(timeStr);

    // 2. Logic Conflict: External Schedule
    const conflictMsg = checkForConflict(dayIndex, timeIndex, sourceItem.teacher, sourceItem.room);
    if (conflictMsg) {
      triggerConflict(conflictMsg, targetKey);
      return;
    }

    // Execute Move
    const newSchedule = { ...scheduleData };
    delete newSchedule[draggedItem.sourceKey];
    newSchedule[targetKey] = sourceItem;
    setScheduleData(newSchedule);
    setDraggedItem(null);
  };

  // --- Logic: Assignment ---

  const handleSlotClick = (dayIndex: number, timeIndex: number) => {
    const slotKey = `${dayIndex}-${timeIndex}`;
    const existingItem = scheduleData[slotKey];
    setTargetSlot({ dayIndex, timeIndex, slotKey });
    
    if (existingItem) {
      const teacher = MOCK_TEACHERS.find(t => t.name === existingItem.teacher);
      setAssignForm({
        subject: existingItem.subject,
        teacherId: teacher ? teacher.id : '',
        room: existingItem.room
      });
    } else {
      setAssignForm({ subject: 'Physics', teacherId: '', room: 'Lab 1' });
    }
    
    setIsAssignModalOpen(true);
  };

  const handleAllocate = () => {
    if (!targetSlot || !assignForm.teacherId) return;

    const teacher = MOCK_TEACHERS.find(t => t.id === assignForm.teacherId);
    if (!teacher) return;

    // 1. Conflict Check: External Schedule
    const conflictMsg = checkForConflict(targetSlot.dayIndex, targetSlot.timeIndex, teacher.name, assignForm.room);
    if (conflictMsg) {
      // Close modal to show the conflict clearly
      setIsAssignModalOpen(false);
      triggerConflict(conflictMsg, targetSlot.slotKey);
      return;
    }

    // 2. Teacher Load Check (Warning only)
    if (teacher.status === 'Full') {
      if (!window.confirm(`${teacher.name} is already at full load (${teacher.load}/${teacher.maxLoad}). Assign anyway?`)) {
        return;
      }
    }

    const newItem: ScheduleItem = {
      id: Date.now().toString(),
      subject: assignForm.subject,
      code: assignForm.subject.substring(0, 3).toUpperCase(),
      teacher: teacher.name,
      room: assignForm.room,
      color: 'blue'
    };

    setScheduleData(prev => ({
      ...prev,
      [targetSlot.slotKey]: newItem
    }));
    setIsAssignModalOpen(false);
  };

  const handleDeleteSlot = () => {
    if (targetSlot) {
      const newSchedule = { ...scheduleData };
      delete newSchedule[targetSlot.slotKey];
      setScheduleData(newSchedule);
      setIsAssignModalOpen(false);
    }
  };

  // --- Logic: Timeline Config ---

  const handleTimeSlotUpdate = (index: number, field: keyof TimeSlot, value: string) => {
    const newSlots = [...timeSlots];
    (newSlots[index] as any)[field] = value;
    setTimeSlots(newSlots);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      {/* Toast Notification */}
      {conflictError && (
        <div className="fixed top-20 right-4 z-50 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg animate-bounce flex items-center gap-3">
          <span className="material-icons-outlined text-2xl">error_outline</span>
          <div>
             <p className="font-bold">Schedule Conflict</p>
             <p className="text-sm">{conflictError}</p>
          </div>
          <button onClick={() => setConflictError(null)} className="ml-2 hover:bg-red-200 rounded-full p-1">
             <span className="material-icons-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Header Controls */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Weekly Class Scheduler</h2>
          <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Admin Mode: Assign teachers & configure timeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-sm text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary outline-none min-w-[150px]"
          >
            <option>Class 10 - A</option>
            <option>Class 10 - B</option>
            <option>Class 11 - A</option>
          </select>
          
          <button 
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-text-main-light dark:text-text-main-dark px-4 py-2 rounded-lg transition-colors shadow-sm text-sm font-medium"
          >
            <span className="material-icons-outlined text-sm">settings</span>
            Adjust Breaks
          </button>

          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-text-main-light dark:text-text-main-dark px-4 py-2 rounded-lg transition-colors shadow-sm text-sm font-medium"
          >
            <span className="material-icons-outlined text-sm">print</span>
            Print
          </button>

          <button className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm text-sm font-medium">
            <span className="material-icons-outlined text-sm">auto_fix_high</span>
            Auto-Generate
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div id="timetable-print-area" className="flex-1 overflow-auto bg-card-light dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm print:shadow-none print:border-none">
        
        {/* Print Only Header */}
        <div className="hidden print:block p-4 mb-4 text-center border-b border-gray-200">
           <h1 className="text-2xl font-bold">{selectedClass} - Weekly Timetable</h1>
           <p className="text-sm text-gray-500">Academic Year 2024-2025</p>
        </div>

        <div className="min-w-[1000px] print:min-w-full grid grid-cols-[100px_repeat(6,_1fr)] divide-x divide-gray-200 dark:divide-gray-700 h-full">
          
          {/* Header Row: Corner Cell */}
          <div className="sticky top-0 z-20 bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-center">
            <span className="text-xs font-semibold text-text-sub-light dark:text-text-sub-dark uppercase">Time</span>
          </div>

          {/* Header Row: Days */}
          {WEEK_DAYS.map((day) => (
            <div key={day.day} className="sticky top-0 z-20 bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-700 p-3 text-center">
              <div className={`inline-flex flex-col items-center justify-center w-12 h-12 rounded-full ${day.active ? 'bg-blue-100 text-primary dark:bg-blue-900/30' : 'text-text-sub-light dark:text-text-sub-dark'}`}>
                <span className="text-[10px] font-medium uppercase">{day.day}</span>
                <span className={`text-lg font-bold ${day.active ? 'text-primary' : 'text-text-main-light dark:text-text-main-dark'}`}>{day.date}</span>
              </div>
            </div>
          ))}

          {/* Body Rows */}
          {timeSlots.map((slot, timeIndex) => {
            if (slot.type === 'break' || slot.type === 'lunch') {
               return (
                  <React.Fragment key={timeIndex}>
                     {/* Time Cell for Break */}
                     <div className="bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-700 p-4 text-xs font-medium text-text-sub-light dark:text-text-sub-dark text-center flex flex-col justify-center">
                        <span>{slot.duration?.split(' - ')[0]}</span>
                        <span className="opacity-50">-</span>
                        <span>{slot.duration?.split(' - ')[1]}</span>
                     </div>
                     {/* Break Banner Spanning All Days */}
                     <div className="col-span-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 text-sm font-medium text-text-sub-light dark:text-text-sub-dark uppercase tracking-widest print:bg-gray-100">
                        <span className="material-icons-outlined text-lg">{slot.type === 'lunch' ? 'restaurant' : 'local_cafe'}</span>
                        {slot.label}
                     </div>
                  </React.Fragment>
               );
            }

            return (
               <React.Fragment key={timeIndex}>
                 {/* Time Column */}
                 <div className="bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-700 p-4 text-xs font-medium text-text-sub-light dark:text-text-sub-dark text-center relative group">
                    <span className="relative z-10 bg-white dark:bg-card-dark px-1">{slot.time}</span>
                    <div className="absolute top-0 right-0 bottom-0 border-r-2 border-dashed border-gray-100 dark:border-gray-700 w-1/2 -z-0"></div>
                 </div>

                 {/* Day Columns for this Time Slot */}
                 {WEEK_DAYS.map((day, dayIndex) => {
                    const slotKey = `${dayIndex}-${timeIndex}`;
                    const item = scheduleData[slotKey];
                    const isDragOver = dragOverKey === slotKey;
                    const isConflict = highlightedConflict === slotKey;

                    return (
                       <div 
                        key={slotKey} 
                        onDragOver={(e) => handleDragOver(e, slotKey)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, slotKey)}
                        onClick={() => handleSlotClick(dayIndex, timeIndex)} // Click to Assign
                        className={`
                          bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-700 p-2 relative group 
                          hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all cursor-pointer duration-200
                          ${isDragOver ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-inset ring-primary' : ''}
                          ${isConflict ? 'bg-red-50 dark:bg-red-900/30 ring-2 ring-inset ring-red-500 z-10' : ''}
                        `}
                       >
                          {item ? (
                             <div 
                              draggable
                              onDragStart={(e) => handleDragStart(e, slotKey, item)}
                              className={`
                                h-full w-full rounded-lg border-l-4 p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing flex flex-col justify-between gap-2 
                                ${COLOR_MAP[item.color]}
                              `}
                             >
                                <div className="flex items-start justify-between">
                                   <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${BADGE_COLOR_MAP[item.color]}`}>
                                      {item.code}
                                   </span>
                                   <div className="flex items-center">
                                     <button 
                                      className="opacity-0 group-hover:opacity-100 text-current hover:bg-black/5 rounded p-0.5 transition-all print:hidden"
                                     >
                                        <span className="material-icons-outlined text-[16px]">edit</span>
                                     </button>
                                   </div>
                                </div>
                                <div>
                                   <h4 className="text-sm font-bold truncate leading-tight">{item.subject}</h4>
                                   <div className="flex flex-col gap-0.5 mt-1.5">
                                      <div className="flex items-center gap-1.5 text-xs opacity-90">
                                         <span className="material-icons-outlined text-[14px]">person</span>
                                         <span className="truncate">{item.teacher}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-xs opacity-90">
                                         <span className="material-icons-outlined text-[14px]">room</span>
                                         <span className="truncate">{item.room}</span>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          ) : (
                             // Empty Slot Placeholder
                             <div className="h-full w-full rounded-lg border-2 border-dashed border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                <span className="material-icons-outlined text-gray-400">add</span>
                             </div>
                          )}
                       </div>
                    );
                 })}
               </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Timeline Configuration Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsConfigModalOpen(false)}></div>
          <div className="relative bg-card-light dark:bg-card-dark rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">Adjust Timetable Structure</h3>
               <button onClick={() => setIsConfigModalOpen(false)}><span className="material-icons-outlined text-gray-500">close</span></button>
             </div>
             
             <div className="space-y-4">
               {timeSlots.map((slot, index) => (
                 <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <span className="text-sm font-mono text-gray-500 w-6">{index+1}.</span>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                       <div>
                         <label className="text-[10px] text-gray-500 uppercase">Start Time</label>
                         <input 
                           type="time" 
                           value={slot.time}
                           onChange={(e) => handleTimeSlotUpdate(index, 'time', e.target.value)}
                           className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
                         />
                       </div>
                       <div>
                         <label className="text-[10px] text-gray-500 uppercase">Type</label>
                         <select 
                            value={slot.type}
                            onChange={(e) => handleTimeSlotUpdate(index, 'type', e.target.value)}
                            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
                         >
                            <option value="class">Class Session</option>
                            <option value="break">Short Break</option>
                            <option value="lunch">Lunch Break</option>
                         </select>
                       </div>
                       {slot.type !== 'class' && (
                         <div className="col-span-2">
                            <label className="text-[10px] text-gray-500 uppercase">Break Label</label>
                            <input 
                              type="text" 
                              value={slot.label || ''}
                              onChange={(e) => handleTimeSlotUpdate(index, 'label', e.target.value)}
                              placeholder="e.g. MORNING BREAK"
                              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
                            />
                            <label className="text-[10px] text-gray-500 uppercase mt-1 block">Duration Text</label>
                            <input 
                              type="text" 
                              value={slot.duration || ''}
                              onChange={(e) => handleTimeSlotUpdate(index, 'duration', e.target.value)}
                              placeholder="e.g. 10:00 - 10:15"
                              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
                            />
                         </div>
                       )}
                    </div>
                 </div>
               ))}
             </div>

             <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => setIsConfigModalOpen(false)} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-600">
                  Save Changes
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsAssignModalOpen(false)}></div>
          <div className="relative bg-card-light dark:bg-card-dark rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
               <div>
                  <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Assign Subject Teacher</h3>
                  <p className="text-xs text-text-sub-light dark:text-text-sub-dark">Academic Year 2024-2025</p>
               </div>
               <button onClick={() => setIsAssignModalOpen(false)}><span className="material-icons-outlined text-gray-500">close</span></button>
             </div>
             
             <div className="p-6 space-y-4">
                {/* Class & Subject */}
                <div className="grid grid-cols-1 gap-4">
                   <div>
                      <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">Class & Section</label>
                      <select 
                        disabled 
                        className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-500 cursor-not-allowed"
                      >
                         <option>{selectedClass}</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">Subject</label>
                      <select 
                         value={assignForm.subject}
                         onChange={(e) => setAssignForm({...assignForm, subject: e.target.value})}
                         className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none text-sm focus:ring-2 focus:ring-primary"
                      >
                         <option>Mathematics</option>
                         <option>Physics</option>
                         <option>Chemistry</option>
                         <option>English Lit.</option>
                         <option>Computer Sci</option>
                         <option>World History</option>
                      </select>
                   </div>
                </div>

                {/* Teacher Selection */}
                <div>
                   <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">Select Teacher (Smart Suggestion)</label>
                   <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="flex items-center px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                         <span className="material-icons-outlined text-gray-400 text-lg">search</span>
                         <input 
                           type="text" 
                           placeholder="Search teacher..." 
                           className="w-full bg-transparent border-none focus:ring-0 text-sm ml-2 outline-none"
                         />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                         {MOCK_TEACHERS.map((teacher) => (
                            <button
                               key={teacher.id}
                               onClick={() => setAssignForm({...assignForm, teacherId: teacher.id})}
                               className={`w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0
                                  ${assignForm.teacherId === teacher.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                               `}
                            >
                               <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${teacher.color}`}>
                                     {teacher.initials}
                                  </div>
                                  <div className="text-left">
                                     <p className="text-sm font-medium text-text-main-light dark:text-text-main-dark">{teacher.name}</p>
                                     <p className={`text-[10px] ${teacher.status === 'Full' ? 'text-red-500' : 'text-green-500'}`}>
                                        Load: {teacher.load}/{teacher.maxLoad} - {teacher.status}
                                     </p>
                                  </div>
                               </div>
                               <div className={`w-2.5 h-2.5 rounded-full ${teacher.status === 'Available' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            </button>
                         ))}
                      </div>
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">Room</label>
                   <input 
                      type="text" 
                      value={assignForm.room}
                      onChange={(e) => setAssignForm({...assignForm, room: e.target.value})}
                      className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none text-sm focus:ring-2 focus:ring-primary"
                   />
                </div>
             </div>

             <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={handleDeleteSlot}
                  className="text-red-500 text-sm hover:underline"
                >
                   Clear Slot
                </button>
                <div className="flex gap-2">
                   <button 
                      onClick={() => setIsAssignModalOpen(false)}
                      className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                   >
                      Cancel
                   </button>
                   <button 
                      onClick={handleAllocate}
                      disabled={!assignForm.teacherId}
                      className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                   >
                      <span className="material-icons-outlined text-sm">check</span>
                      Allocate
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          @page { size: landscape; margin: 1cm; }
          body { background-color: white !important; }
        }
      `}</style>
    </div>
  );
};
