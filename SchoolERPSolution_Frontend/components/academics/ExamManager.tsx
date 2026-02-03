import React, { useState, useMemo } from 'react';

// --- Types ---
type UserRole = 'Teacher' | 'Admin';
type ExamType = 'Unit Test' | 'Midterm' | 'Final/Board' | 'Quiz';
type ExamStatus = 'Draft' | 'Scheduled' | 'Ongoing' | 'Grading' | 'Published';

interface ExamSchedule {
  id: string;
  title: string;
  type: ExamType;
  classId: string;
  subject: string;
  date: string;
  time: string;
  duration: number; // minutes
  room: string;
  supervisor: string;
  status: ExamStatus;
  maxMarks: number;
}

interface StudentExamRecord {
  studentId: string;
  name: string;
  rollNo: number;
  marksObtained?: number;
  status: 'Present' | 'Absent';
  remarks?: string;
}

interface ItemAnalysis {
  questionNo: number;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  correctResponseRate: number; // percentage
}

// --- Helper for Dynamic Mock Dates ---
const getRelativeDate = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

// --- Mock Data ---
const MOCK_EXAMS: ExamSchedule[] = [
  { 
    id: 'e1', 
    title: 'Physics Mid-Term', 
    type: 'Midterm', 
    classId: 'Class 10 - A', 
    subject: 'Physics', 
    date: getRelativeDate(0), // Today
    time: '09:00', 
    duration: 120, 
    room: 'Hall A', 
    supervisor: 'Mr. Singh', 
    status: 'Ongoing', 
    maxMarks: 50 
  },
  { 
    id: 'e2', 
    title: 'Math Unit Test 2', 
    type: 'Unit Test', 
    classId: 'Class 10 - A', 
    subject: 'Mathematics', 
    date: getRelativeDate(3), // 3 days from now
    time: '10:00', 
    duration: 60, 
    room: 'Rm 101', 
    supervisor: 'Ms. Sarah', 
    status: 'Scheduled', 
    maxMarks: 20 
  },
  { 
    id: 'e3', 
    title: 'English Finals', 
    type: 'Final/Board', 
    classId: 'Class 12 - B', 
    subject: 'English Lit', 
    date: getRelativeDate(14), // 2 weeks from now
    time: '09:00', 
    duration: 180, 
    room: 'Hall B', 
    supervisor: 'Mrs. Verma', 
    status: 'Draft', 
    maxMarks: 100 
  },
  { 
    id: 'e4', 
    title: 'Chemistry Quiz', 
    type: 'Quiz', 
    classId: 'Class 11 - A', 
    subject: 'Chemistry', 
    date: getRelativeDate(-2), // 2 days ago
    time: '14:00', 
    duration: 45, 
    room: 'Lab 2', 
    supervisor: 'Ms. Curie', 
    status: 'Grading', 
    maxMarks: 25 
  },
];

const MOCK_STUDENTS: StudentExamRecord[] = [
  { studentId: 's1', name: 'Adrian Miller', rollNo: 1, marksObtained: 42, status: 'Present' },
  { studentId: 's2', name: 'Bianca Ross', rollNo: 2, marksObtained: 45, status: 'Present' },
  { studentId: 's3', name: 'Charles Dunn', rollNo: 3, marksObtained: 0, status: 'Absent' },
  { studentId: 's4', name: 'Diana Prince', rollNo: 4, marksObtained: 48, status: 'Present' },
  { studentId: 's5', name: 'Evan Wright', rollNo: 5, marksObtained: 35, status: 'Present' },
];

const MOCK_ITEM_ANALYSIS: ItemAnalysis[] = [
  { questionNo: 1, topic: 'Newton Laws', difficulty: 'Easy', correctResponseRate: 85 },
  { questionNo: 2, topic: 'Kinematics', difficulty: 'Medium', correctResponseRate: 65 },
  { questionNo: 3, topic: 'Thermodynamics', difficulty: 'Hard', correctResponseRate: 32 },
  { questionNo: 4, topic: 'Optics', difficulty: 'Medium', correctResponseRate: 58 },
  { questionNo: 5, topic: 'Electromagnetism', difficulty: 'Hard', correctResponseRate: 25 },
];

export const ExamManager: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('Admin');
  const [activeTab, setActiveTab] = useState<'schedule' | 'logistics' | 'marks' | 'analytics'>('schedule');
  const [exams, setExams] = useState<ExamSchedule[]>(MOCK_EXAMS);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  
  // Schedule View State - Initialize with Current Date
  const [scheduleViewMode, setScheduleViewMode] = useState<'calendar' | 'list'>('calendar');
  const [calendarDate, setCalendarDate] = useState(new Date()); 
  const [selectedDayDetails, setSelectedDayDetails] = useState<Date | null>(null);
  const [filters, setFilters] = useState({
    subject: 'All',
    classId: 'All',
    status: 'All'
  });

  // Logistics State
  const [logisticsView, setLogisticsView] = useState<'seating' | 'admit'>('seating');
  
  // Marks Entry State
  const [examRecords, setExamRecords] = useState<StudentExamRecord[]>(MOCK_STUDENTS);
  const [marksStatus, setMarksStatus] = useState<'Draft' | 'Submitted'>('Draft');

  // Creation & Notification State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newExamForm, setNewExamForm] = useState<Partial<ExamSchedule>>({
    title: '', type: 'Unit Test', classId: 'Class 10 - A', subject: 'Physics',
    date: '', time: '', duration: 60, room: '', supervisor: '', maxMarks: 50
  });

  // --- Helpers ---
  const selectedExam = exams.find(e => e.id === selectedExamId) || exams[0];

  const getStatusColor = (status: ExamStatus) => {
    switch(status) {
      case 'Draft': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
      case 'Scheduled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Ongoing': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 animate-pulse';
      case 'Grading': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'Published': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleMarkUpdate = (id: string, val: string) => {
    const num = Math.min(Math.max(0, parseInt(val) || 0), selectedExam.maxMarks);
    setExamRecords(prev => prev.map(r => r.studentId === id ? { ...r, marksObtained: num } : r));
  };

  const handleCreateExam = () => {
    const newExam: ExamSchedule = {
        id: Date.now().toString(),
        title: newExamForm.title || 'Untitled Exam',
        type: newExamForm.type || 'Unit Test',
        classId: newExamForm.classId || 'Class 10 - A',
        subject: newExamForm.subject || 'General',
        date: newExamForm.date || new Date().toISOString().split('T')[0],
        time: newExamForm.time || '09:00',
        duration: newExamForm.duration || 60,
        room: newExamForm.room || 'TBD',
        supervisor: newExamForm.supervisor || 'TBD',
        status: 'Draft',
        maxMarks: newExamForm.maxMarks || 50
    };
    setExams([...exams, newExam]);
    setIsScheduleModalOpen(false);
    setSelectedDayDetails(null); // Close day details if open
    showToast('Exam created in Draft mode.');
  };

  const handlePublish = (id: string) => {
      setExams(prev => prev.map(e => e.id === id ? { ...e, status: 'Scheduled' } : e));
      showToast('Exam Published: Notification sent to Students & Parents via Portal/SMS.');
  };

  // --- Filtering Logic ---
  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      const matchesSubject = filters.subject === 'All' || exam.subject === filters.subject;
      const matchesClass = filters.classId === 'All' || exam.classId === filters.classId;
      const matchesStatus = filters.status === 'All' || exam.status === filters.status;
      return matchesSubject && matchesClass && matchesStatus;
    });
  }, [exams, filters]);

  // --- Calendar Logic ---
  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null); // Padding
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const changeMonth = (delta: number) => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + delta, 1));
  };

  // --- Renderers ---

  const renderSchedule = () => (
    <div className="space-y-6 animate-fade-in relative">
        {/* Toast Notification */}
        {toastMessage && (
            <div className="fixed top-24 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl animate-slide-in-down flex items-center gap-3">
                <span className="material-icons-outlined text-green-400">check_circle</span>
                <div>
                    <p className="text-sm font-medium">{toastMessage}</p>
                </div>
            </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full xl:w-auto">
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button 
                        onClick={() => setScheduleViewMode('calendar')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${scheduleViewMode === 'calendar' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}
                    >
                        <span className="material-icons-outlined text-sm">calendar_view_month</span> Calendar
                    </button>
                    <button 
                        onClick={() => setScheduleViewMode('list')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${scheduleViewMode === 'list' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}
                    >
                        <span className="material-icons-outlined text-sm">view_list</span> List
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
                    <select 
                        value={filters.classId}
                        onChange={(e) => setFilters({...filters, classId: e.target.value})}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs focus:ring-1 focus:ring-primary outline-none"
                    >
                        <option value="All">All Classes</option>
                        <option value="Class 10 - A">Class 10 - A</option>
                        <option value="Class 10 - B">Class 10 - B</option>
                        <option value="Class 11 - A">Class 11 - A</option>
                        <option value="Class 12 - B">Class 12 - B</option>
                    </select>
                    <select 
                        value={filters.subject}
                        onChange={(e) => setFilters({...filters, subject: e.target.value})}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs focus:ring-1 focus:ring-primary outline-none"
                    >
                        <option value="All">All Subjects</option>
                        <option value="Physics">Physics</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="English Lit">English Lit</option>
                    </select>
                    <select 
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs focus:ring-1 focus:ring-primary outline-none"
                    >
                        <option value="All">All Status</option>
                        <option value="Draft">Draft</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Published">Published</option>
                    </select>
                </div>
            </div>

            {currentRole === 'Admin' && (
                <button 
                    onClick={() => {
                        setNewExamForm(prev => ({...prev, date: new Date().toISOString().split('T')[0]}));
                        setIsScheduleModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm transition-colors text-sm font-medium w-full xl:w-auto justify-center"
                >
                    <span className="material-icons-outlined text-sm">add_circle</span> Schedule Exam
                </button>
            )}
        </div>

        {/* Content Views */}
        {scheduleViewMode === 'calendar' ? (
            <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                {/* Calendar Header */}
                <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">
                            {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex gap-1">
                            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><span className="material-icons-outlined text-gray-500">chevron_left</span></button>
                            <button onClick={() => setCalendarDate(new Date())} className="px-2 text-xs font-medium text-primary hover:underline">Today</button>
                            <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><span className="material-icons-outlined text-gray-500">chevron_right</span></button>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-2 text-center text-xs font-bold text-gray-500 uppercase">{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 auto-rows-[minmax(100px,_1fr)] divide-x divide-y divide-gray-200 dark:divide-gray-700">
                    {getCalendarDays(calendarDate).map((day, idx) => {
                        if (!day) return <div key={idx} className="bg-gray-50/30 dark:bg-gray-900/30"></div>;
                        
                        const dateStr = day.toISOString().split('T')[0];
                        const dayExams = filteredExams.filter(e => e.date === dateStr);
                        const isToday = dateStr === new Date().toISOString().split('T')[0];

                        return (
                            <div 
                                key={idx} 
                                onClick={() => setSelectedDayDetails(day)}
                                className={`p-2 hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer transition-colors relative group ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                            >
                                <span className={`text-xs font-medium ${isToday ? 'bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-500'}`}>
                                    {day.getDate()}
                                </span>
                                <div className="mt-2 space-y-1">
                                    {dayExams.map(exam => (
                                        <div key={exam.id} className={`text-[10px] px-1.5 py-0.5 rounded border truncate ${
                                            exam.status === 'Draft' ? 'bg-gray-100 border-gray-200 text-gray-600' :
                                            exam.status === 'Ongoing' ? 'bg-green-100 border-green-200 text-green-700' :
                                            exam.type === 'Final/Board' ? 'bg-red-100 border-red-200 text-red-700' :
                                            'bg-blue-100 border-blue-200 text-blue-700'
                                        }`}>
                                            {exam.time} {exam.subject}
                                        </div>
                                    ))}
                                    {dayExams.length > 3 && (
                                        <div className="text-[10px] text-gray-400 pl-1">+{dayExams.length - 3} more</div>
                                    )}
                                </div>
                                {/* Hover Add Button */}
                                {currentRole === 'Admin' && (
                                    <button 
                                        className="absolute bottom-2 right-2 p-1 bg-primary text-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setNewExamForm(prev => ({...prev, date: dateStr}));
                                            setIsScheduleModalOpen(true);
                                        }}
                                        title="Add Exam on this day"
                                    >
                                        <span className="material-icons-outlined text-sm block">add</span>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        ) : (
            // List View
            <div className="grid grid-cols-1 gap-4">
                {filteredExams.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-white dark:bg-card-dark rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <span className="material-icons-outlined text-4xl mb-2">event_busy</span>
                        <p>No exams found matching filters.</p>
                    </div>
                ) : (
                    filteredExams.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(exam => (
                        <div key={exam.id} className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-primary/50 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center justify-center w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <span className="text-xs font-bold text-red-500 uppercase">{new Date(exam.date).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="text-xl font-bold text-gray-800 dark:text-gray-200">{new Date(exam.date).getDate()}</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-text-main-light dark:text-text-main-dark">{exam.title}</h4>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(exam.status)}`}>
                                            {exam.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-sub-light dark:text-text-sub-dark">
                                        <span className="flex items-center gap-1"><span className="material-icons-outlined text-sm">class</span> {exam.classId}</span>
                                        <span className="flex items-center gap-1"><span className="material-icons-outlined text-sm">schedule</span> {exam.time} ({exam.duration}m)</span>
                                        <span className="flex items-center gap-1"><span className="material-icons-outlined text-sm">room</span> {exam.room}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 self-end md:self-auto">
                                {currentRole === 'Admin' && exam.status === 'Draft' && (
                                    <button 
                                        onClick={() => handlePublish(exam.id)}
                                        className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 shadow-sm flex items-center gap-1"
                                    >
                                        <span className="material-icons-outlined text-[14px]">campaign</span>
                                        Publish
                                    </button>
                                )}
                                <button 
                                    onClick={() => { setSelectedExamId(exam.id); setActiveTab('logistics'); }}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    Logistics
                                </button>
                                <button 
                                    onClick={() => { setSelectedExamId(exam.id); setActiveTab('marks'); }}
                                    className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100 rounded hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                                >
                                    Marks
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {/* Day Details Modal */}
        {selectedDayDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedDayDetails(null)}></div>
                <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase font-bold">{selectedDayDetails.toLocaleDateString('default', { weekday: 'long' })}</span>
                            <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">
                                {selectedDayDetails.toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </h3>
                        </div>
                        <button onClick={() => setSelectedDayDetails(null)}><span className="material-icons-outlined text-gray-500">close</span></button>
                    </div>
                    
                    <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
                        {exams.filter(e => e.date === selectedDayDetails.toISOString().split('T')[0]).length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <span className="material-icons-outlined text-4xl mb-2">event_available</span>
                                <p className="text-sm">No exams scheduled for this day.</p>
                            </div>
                        ) : (
                            exams.filter(e => e.date === selectedDayDetails.toISOString().split('T')[0]).map(exam => (
                                <div key={exam.id} className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-sm text-text-main-light dark:text-text-main-dark">{exam.title}</h4>
                                        <p className="text-xs text-gray-500">{exam.time} • {exam.classId}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(exam.status)}`}>
                                        {exam.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    {currentRole === 'Admin' && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <button 
                                onClick={() => {
                                    setNewExamForm(prev => ({...prev, date: selectedDayDetails.toISOString().split('T')[0]}));
                                    setIsScheduleModalOpen(true);
                                    setSelectedDayDetails(null);
                                }}
                                className="w-full py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-blue-600 text-sm font-medium flex items-center justify-center gap-2"
                            >
                                <span className="material-icons-outlined text-sm">add_circle</span> Schedule New Exam
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );

  const renderLogistics = () => {
    // Mock Seating Grid
    const rows = 5;
    const cols = 4;
    const seatingGrid = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const studentIdx = r * cols + c;
            seatingGrid.push({
                seat: `${String.fromCharCode(65+r)}${c+1}`,
                student: studentIdx < MOCK_STUDENTS.length ? MOCK_STUDENTS[studentIdx] : null
            });
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Sub-nav */}
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                    <button 
                        onClick={() => setLogisticsView('seating')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${logisticsView === 'seating' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}
                    >
                        Seating Plan
                    </button>
                    <button 
                        onClick={() => setLogisticsView('admit')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${logisticsView === 'admit' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}
                    >
                        Admit Cards
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Exam:</span>
                    <select 
                        value={selectedExamId || ''} 
                        onChange={(e) => setSelectedExamId(e.target.value)}
                        className="text-sm border-none bg-transparent font-bold outline-none text-text-main-light dark:text-text-main-dark"
                    >
                        {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                    </select>
                </div>
            </div>

            {logisticsView === 'seating' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm print:shadow-none print:border-none">
                        <div className="flex justify-between mb-6">
                            <h4 className="font-bold">Room Layout: {selectedExam.room}</h4>
                            <div className="flex gap-2 print:hidden">
                                <button className="text-xs text-primary hover:underline flex items-center gap-1">
                                    <span className="material-icons-outlined text-sm">autorenew</span> Auto-Allocate
                                </button>
                                <button onClick={() => window.print()} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                                    <span className="material-icons-outlined text-sm">print</span> Print
                                </button>
                            </div>
                        </div>
                        
                        {/* Room Grid */}
                        <div className="border-4 border-gray-300 dark:border-gray-600 rounded-lg p-8 relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-200 dark:bg-gray-700 px-4 py-1 rounded text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">
                                Instructor Desk / Board
                            </div>
                            <div className="grid grid-cols-4 gap-4 mt-4">
                                {seatingGrid.map((seat, idx) => (
                                    <div key={idx} className={`aspect-square rounded-lg border flex flex-col items-center justify-center p-2 text-center transition-all
                                        ${seat.student ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 border-dashed opacity-50'}`}>
                                        <span className="text-[10px] font-bold text-gray-400 absolute top-1 left-2">{seat.seat}</span>
                                        {seat.student ? (
                                            <>
                                                <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold mb-1">
                                                    {seat.student.rollNo}
                                                </div>
                                                <span className="text-[10px] font-medium leading-tight truncate w-full">{seat.student.name.split(' ')[0]}</span>
                                            </>
                                        ) : <span className="text-xs text-gray-400">Empty</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-fit">
                        <h4 className="font-bold mb-4 text-sm">Configuration</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Room Selection</label>
                                <select className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                                    <option>Hall A (Capacity: 50)</option>
                                    <option>Hall B (Capacity: 100)</option>
                                    <option>Room 101 (Capacity: 30)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Allocation Strategy</label>
                                <select className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                                    <option>Zig-Zag (Anti-Cheating)</option>
                                    <option>Sequential by Roll No</option>
                                    <option>Randomized</option>
                                </select>
                            </div>
                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-500">Capacity Used</span>
                                    <span className="font-bold">{MOCK_STUDENTS.length} / 20</span>
                                </div>
                                <div className="w-full bg-gray-200 h-1.5 rounded-full">
                                    <div className="bg-green-500 h-1.5 rounded-full" style={{width: '25%'}}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {logisticsView === 'admit' && (
                <div className="flex flex-col items-center">
                    <div className="w-full max-w-2xl bg-white text-gray-900 border border-gray-300 shadow-lg p-8 mb-6" id="printable-admit-card">
                        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs">LOGO</div>
                                <div>
                                    <h1 className="text-xl font-serif font-bold uppercase tracking-wider">Springfield Academy</h1>
                                    <p className="text-xs text-gray-600">Term II Examination - 2024</p>
                                    <h2 className="text-lg font-bold mt-1 border-2 border-gray-900 inline-block px-2">ADMIT CARD</h2>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="w-24 h-24 border border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-400 mb-1">
                                    Student Photo
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm mb-6">
                            <div className="flex border-b border-gray-200 py-1"><span className="w-32 font-bold text-gray-600">Student Name:</span> <span>Adrian Miller</span></div>
                            <div className="flex border-b border-gray-200 py-1"><span className="w-32 font-bold text-gray-600">Roll Number:</span> <span className="font-mono font-bold text-lg">001</span></div>
                            <div className="flex border-b border-gray-200 py-1"><span className="w-32 font-bold text-gray-600">Class:</span> <span>10 - A</span></div>
                            <div className="flex border-b border-gray-200 py-1"><span className="w-32 font-bold text-gray-600">Exam Center:</span> <span>Main Block, Hall A</span></div>
                        </div>

                        <table className="w-full text-sm border-collapse border border-gray-800 mb-8">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border border-gray-800 px-3 py-2 text-left">Date</th>
                                    <th className="border border-gray-800 px-3 py-2 text-left">Time</th>
                                    <th className="border border-gray-800 px-3 py-2 text-left">Subject</th>
                                    <th className="border border-gray-800 px-3 py-2 text-left">Invigilator Sign</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-800 px-3 py-2">{selectedExam.date}</td>
                                    <td className="border border-gray-800 px-3 py-2">{selectedExam.time}</td>
                                    <td className="border border-gray-800 px-3 py-2 font-bold">{selectedExam.subject}</td>
                                    <td className="border border-gray-800 px-3 py-2"></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-800 px-3 py-2">2024-10-18</td>
                                    <td className="border border-gray-800 px-3 py-2">10:00</td>
                                    <td className="border border-gray-800 px-3 py-2 font-bold">Mathematics</td>
                                    <td className="border border-gray-800 px-3 py-2"></td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="flex justify-between items-end pt-8">
                            <div className="text-center">
                                <div className="w-40 border-b border-gray-400 mb-1"></div>
                                <span className="text-xs text-gray-500">Controller of Exams</span>
                            </div>
                            <div className="text-center">
                                <div className="w-40 border-b border-gray-400 mb-1"></div>
                                <span className="text-xs text-gray-500">Student Signature</span>
                            </div>
                        </div>
                    </div>
                    
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-blue-600 print:hidden">
                        <span className="material-icons-outlined">print</span> Print All Admit Cards
                    </button>
                </div>
            )}
        </div>
    );
  };

  const renderMarksEntry = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div>
                <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">Marks Entry: {selectedExam.title}</h3>
                <p className="text-xs text-text-sub-light dark:text-text-sub-dark">Max Marks: {selectedExam.maxMarks} • Due Date: 2024-10-20</p>
            </div>
            <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${marksStatus === 'Submitted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    Status: {marksStatus}
                </span>
                {marksStatus === 'Draft' && (
                    <button 
                        onClick={() => setMarksStatus('Submitted')}
                        className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-600 shadow-sm"
                    >
                        Submit to Controller
                    </button>
                )}
            </div>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <th className="px-6 py-3">Roll</th>
                        <th className="px-6 py-3">Student Name</th>
                        <th className="px-6 py-3 text-center">Attendance</th>
                        <th className="px-6 py-3 text-center">Marks Obtained</th>
                        <th className="px-6 py-3">Remarks</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {examRecords.map(record => (
                        <tr key={record.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                            <td className="px-6 py-4 font-mono text-gray-500">{String(record.rollNo).padStart(2, '0')}</td>
                            <td className="px-6 py-4 font-medium">{record.name}</td>
                            <td className="px-6 py-4 text-center">
                                <button 
                                    className={`px-2 py-1 rounded text-xs font-bold ${record.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                >
                                    {record.status}
                                </button>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <input 
                                        type="number" 
                                        disabled={marksStatus === 'Submitted' || record.status === 'Absent'}
                                        value={record.marksObtained}
                                        onChange={(e) => handleMarkUpdate(record.studentId, e.target.value)}
                                        className="w-20 p-2 text-center border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none font-bold"
                                    />
                                    <span className="text-gray-400">/ {selectedExam.maxMarks}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <input 
                                    type="text" 
                                    disabled={marksStatus === 'Submitted'}
                                    placeholder="Add remark..."
                                    className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary outline-none text-xs"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6 animate-fade-in">
        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <p className="text-sm text-gray-500">Class Average</p>
                <h3 className="text-3xl font-bold text-blue-600">76.5%</h3>
                <p className="text-xs text-green-500">+4% from last term</p>
            </div>
            <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <p className="text-sm text-gray-500">Highest Score</p>
                <h3 className="text-3xl font-bold text-green-600">98%</h3>
                <p className="text-xs text-gray-400">Diana Prince</p>
            </div>
            <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <p className="text-sm text-gray-500">Pass Percentage</p>
                <h3 className="text-3xl font-bold text-purple-600">92%</h3>
                <p className="text-xs text-red-500">3 Failures</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Heatmap */}
            <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h4 className="font-bold mb-4 text-text-main-light dark:text-text-main-dark">Subject Performance Heatmap</h4>
                <div className="space-y-2">
                    {[
                        { subject: 'Physics', score: 85, color: 'bg-green-500' },
                        { subject: 'Math', score: 72, color: 'bg-yellow-500' },
                        { subject: 'Chemistry', score: 65, color: 'bg-orange-500' },
                        { subject: 'English', score: 90, color: 'bg-green-600' },
                        { subject: 'History', score: 78, color: 'bg-green-400' }
                    ].map(item => (
                        <div key={item.subject} className="flex items-center gap-4">
                            <span className="w-24 text-sm font-medium">{item.subject}</span>
                            <div className="flex-1 bg-gray-100 dark:bg-gray-800 h-8 rounded overflow-hidden relative">
                                <div className={`h-full ${item.color} flex items-center justify-end px-2 text-xs text-white font-bold`} style={{width: `${item.score}%`}}>
                                    {item.score}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Item Analysis */}
            <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h4 className="font-bold mb-4 text-text-main-light dark:text-text-main-dark">Question Item Analysis</h4>
                <p className="text-xs text-gray-500 mb-4">Identify tough topics based on student responses.</p>
                <div className="space-y-3">
                    {MOCK_ITEM_ANALYSIS.map(item => (
                        <div key={item.questionNo} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white
                                    ${item.difficulty === 'Hard' ? 'bg-red-500' : item.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                                    Q{item.questionNo}
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{item.topic}</p>
                                    <p className="text-[10px] text-gray-500 uppercase">{item.difficulty}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-lg font-bold text-gray-700 dark:text-gray-300">{item.correctResponseRate}%</span>
                                <span className="text-[10px] text-gray-400">Correct Rate</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm print:hidden">
         <div>
            <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Exams & Assessments</h2>
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark">
                {currentRole === 'Admin' ? 'Exam scheduling, hall tickets, and analytics.' : 'Marks entry and schedule viewing.'}
            </p>
         </div>
         
         {/* Role Switcher */}
         <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button 
              onClick={() => setCurrentRole('Teacher')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${currentRole === 'Teacher' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}
            >
              Teacher
            </button>
            <button 
              onClick={() => setCurrentRole('Admin')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${currentRole === 'Admin' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}
            >
              Exam Controller
            </button>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 print:hidden">
         <button onClick={() => setActiveTab('schedule')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'schedule' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            <span className="material-icons-outlined text-lg">calendar_today</span> Schedule
         </button>
         {currentRole === 'Admin' && (
             <button onClick={() => setActiveTab('logistics')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'logistics' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                <span className="material-icons-outlined text-lg">event_seat</span> Logistics
             </button>
         )}
         <button onClick={() => setActiveTab('marks')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'marks' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            <span className="material-icons-outlined text-lg">edit_note</span> Marks Entry
         </button>
         {currentRole === 'Admin' && (
             <button onClick={() => setActiveTab('analytics')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'analytics' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                <span className="material-icons-outlined text-lg">insights</span> Analytics
             </button>
         )}
      </div>

      <div className="flex-1 overflow-hidden relative">
         {activeTab === 'schedule' && renderSchedule()}
         {activeTab === 'logistics' && renderLogistics()}
         {activeTab === 'marks' && renderMarksEntry()}
         {activeTab === 'analytics' && renderAnalytics()}
      </div>

      {/* Schedule Exam Modal */}
      {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsScheduleModalOpen(false)}></div>
              <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-in-down">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                      <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">Schedule New Exam</h3>
                      <button onClick={() => setIsScheduleModalOpen(false)}><span className="material-icons-outlined text-gray-500">close</span></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Exam Title</label>
                          <input 
                              type="text" 
                              value={newExamForm.title}
                              onChange={(e) => setNewExamForm({...newExamForm, title: e.target.value})}
                              className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm"
                              placeholder="e.g. Physics Final Term I"
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                              <select 
                                  value={newExamForm.type}
                                  onChange={(e) => setNewExamForm({...newExamForm, type: e.target.value as ExamType})}
                                  className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm"
                              >
                                  <option>Unit Test</option>
                                  <option>Midterm</option>
                                  <option>Final/Board</option>
                                  <option>Quiz</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Class</label>
                              <select 
                                  value={newExamForm.classId}
                                  onChange={(e) => setNewExamForm({...newExamForm, classId: e.target.value})}
                                  className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm"
                              >
                                  <option>Class 10 - A</option>
                                  <option>Class 10 - B</option>
                                  <option>Class 11 - A</option>
                              </select>
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                              <input 
                                  type="date" 
                                  value={newExamForm.date}
                                  onChange={(e) => setNewExamForm({...newExamForm, date: e.target.value})}
                                  className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Time</label>
                              <input 
                                  type="time" 
                                  value={newExamForm.time}
                                  onChange={(e) => setNewExamForm({...newExamForm, time: e.target.value})}
                                  className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm"
                              />
                          </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                          <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Duration (m)</label>
                              <input 
                                  type="number" 
                                  value={newExamForm.duration}
                                  onChange={(e) => setNewExamForm({...newExamForm, duration: parseInt(e.target.value)})}
                                  className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Max Marks</label>
                              <input 
                                  type="number" 
                                  value={newExamForm.maxMarks}
                                  onChange={(e) => setNewExamForm({...newExamForm, maxMarks: parseInt(e.target.value)})}
                                  className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Room</label>
                              <input 
                                  type="text" 
                                  value={newExamForm.room}
                                  onChange={(e) => setNewExamForm({...newExamForm, room: e.target.value})}
                                  placeholder="e.g. Hall A"
                                  className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm"
                              />
                          </div>
                      </div>
                  </div>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800/50">
                      <button onClick={() => setIsScheduleModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
                      <button onClick={handleCreateExam} className="px-6 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm">Save Draft</button>
                  </div>
              </div>
          </div>
      )}

      <style>{`
        @media print {
            body * { visibility: hidden; }
            #printable-admit-card, #printable-admit-card * { visibility: visible; }
            #printable-admit-card { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 100%; 
                margin: 0;
            }
        }
      `}</style>
    </div>
  );
};
