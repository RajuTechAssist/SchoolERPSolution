import React, { useState, useMemo, useRef } from 'react';

// --- Types ---

type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';
type ViewTab = 'register' | 'reports' | 'at-risk' | 'sync' | 'notifications';

interface Student {
  id: string;
  rollNo: number;
  name: string;
  avatarColor: string;
  status: AttendanceStatus;
  remarks?: string;
  // Extended stats for Reports/At-Risk
  totalDays: number;
  presentDays: number;
  consecutiveAbsences: number;
}

interface ReportConfig {
  type: 'history' | 'class-summary' | 'monthly';
  startDate: string;
  endDate: string;
}

interface NotificationTemplate {
  id: string;
  trigger: 'first_absence' | 'consecutive_absences' | 'late_arrival';
  subject: string;
  body: string;
}

interface SyncLog {
  id: string;
  timestamp: string;
  status: 'Success' | 'Error' | 'Warning';
  message: string;
}

// --- Mock Data ---

const INITIAL_STUDENTS: Student[] = [
  { id: 's1', rollNo: 1, name: 'Adrian Miller', avatarColor: 'bg-blue-100 text-blue-600', status: 'Present', totalDays: 45, presentDays: 42, consecutiveAbsences: 0 },
  { id: 's2', rollNo: 2, name: 'Bianca Ross', avatarColor: 'bg-pink-100 text-pink-600', status: 'Present', totalDays: 45, presentDays: 45, consecutiveAbsences: 0 },
  { id: 's3', rollNo: 3, name: 'Charles Dunn', avatarColor: 'bg-green-100 text-green-600', status: 'Absent', totalDays: 45, presentDays: 30, consecutiveAbsences: 3 },
  { id: 's4', rollNo: 4, name: 'Diana Prince', avatarColor: 'bg-purple-100 text-purple-600', status: 'Present', totalDays: 45, presentDays: 44, consecutiveAbsences: 0 },
  { id: 's5', rollNo: 5, name: 'Evan Wright', avatarColor: 'bg-yellow-100 text-yellow-600', status: 'Late', totalDays: 45, presentDays: 38, consecutiveAbsences: 0 },
  { id: 's6', rollNo: 6, name: 'Fiona Gallagher', avatarColor: 'bg-red-100 text-red-600', status: 'Present', totalDays: 45, presentDays: 35, consecutiveAbsences: 1 },
  { id: 's7', rollNo: 7, name: 'George Martin', avatarColor: 'bg-indigo-100 text-indigo-600', status: 'Present', totalDays: 45, presentDays: 40, consecutiveAbsences: 0 },
  { id: 's8', rollNo: 8, name: 'Hannah Montana', avatarColor: 'bg-teal-100 text-teal-600', status: 'Excused', totalDays: 45, presentDays: 41, consecutiveAbsences: 0 },
  { id: 's9', rollNo: 9, name: 'Ian Somerhalder', avatarColor: 'bg-orange-100 text-orange-600', status: 'Present', totalDays: 45, presentDays: 28, consecutiveAbsences: 0 },
  { id: 's10', rollNo: 10, name: 'Jack Dawson', avatarColor: 'bg-cyan-100 text-cyan-600', status: 'Absent', totalDays: 45, presentDays: 25, consecutiveAbsences: 5 },
];

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; icon: string; color: string; bg: string }> = {
  'Present': { label: 'P', icon: 'check_circle', color: 'text-green-600', bg: 'bg-green-50 hover:bg-green-100 border-green-200' },
  'Absent': { label: 'A', icon: 'cancel', color: 'text-red-600', bg: 'bg-red-50 hover:bg-red-100 border-red-200' },
  'Late': { label: 'L', icon: 'schedule', color: 'text-orange-600', bg: 'bg-orange-50 hover:bg-orange-100 border-orange-200' },
  'Excused': { label: 'E', icon: 'assignment_late', color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
};

const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  { id: 't1', trigger: 'first_absence', subject: 'Absence Alert', body: 'Dear Parent, {StudentName} was marked absent today ({Date}). Please provide a reason.' },
  { id: 't2', trigger: 'consecutive_absences', subject: 'Urgent: Repeated Absences', body: 'Dear Parent, {StudentName} has been absent for 3 consecutive days. Please contact the school office.' },
  { id: 't3', trigger: 'late_arrival', subject: 'Late Arrival Notice', body: '{StudentName} arrived late to class today at {Time}.' },
];

export const AttendanceManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewTab>('register');
  const [selectedClass, setSelectedClass] = useState('Class 10 - A');
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  
  // Register State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // At-Risk State
  const [riskThreshold, setRiskThreshold] = useState(75);

  // Sync State
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification State
  const [templates, setTemplates] = useState<NotificationTemplate[]>(DEFAULT_TEMPLATES);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Helpers
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const calculatePercentage = (s: Student) => Math.round((s.presentDays / s.totalDays) * 100);

  // --- TAB: DAILY REGISTER ---
  const renderRegister = () => {
    // Stats
    const total = students.length;
    const present = students.filter(s => s.status === 'Present').length;
    
    const stats = {
        total,
        present,
        absent: students.filter(s => s.status === 'Absent').length,
        late: students.filter(s => s.status === 'Late').length,
        excused: students.filter(s => s.status === 'Excused').length,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.rollNo.toString().includes(searchQuery)
    );

    const handleStatusChange = (id: string, status: AttendanceStatus) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    };
    
    const handleMarkAll = (status: AttendanceStatus) => {
        if (window.confirm(`Mark all filtered students as ${status}?`)) {
          setStudents(prev => prev.map(s => filteredStudents.find(fs => fs.id === s.id) ? { ...s, status } : s));
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
             {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Present</p>
                        <h3 className="text-2xl font-bold text-green-600">{stats.present}/{stats.total}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                        <span className="material-icons-outlined">check_circle</span>
                    </div>
                </div>
                <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Absent</p>
                        <h3 className="text-2xl font-bold text-red-600">{stats.absent}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600">
                        <span className="material-icons-outlined">cancel</span>
                    </div>
                </div>
                <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Late / Excused</p>
                        <h3 className="text-2xl font-bold text-orange-600">{stats.late + stats.excused}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                        <span className="material-icons-outlined">schedule</span>
                    </div>
                </div>
                <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Attendance Rate</p>
                        <h3 className="text-2xl font-bold text-blue-600">{stats.percentage}%</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                        <span className="material-icons-outlined">trending_up</span>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-card-light dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative w-full sm:w-64">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="material-icons-outlined text-gray-400">search</span>
                        </span>
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search student..."
                            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-text-sub-light dark:text-text-sub-dark font-medium mr-2">Mark All:</span>
                        <button onClick={() => handleMarkAll('Present')} className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">Present</button>
                        <button onClick={() => handleMarkAll('Absent')} className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-lg border border-red-200 transition-colors">Absent</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700 max-h-[500px]">
                    <div className="grid grid-cols-[60px_2fr_3fr_2fr] sm:grid-cols-[60px_2fr_300px_1fr] bg-gray-50 dark:bg-gray-800/50 p-3 text-xs font-semibold text-text-sub-light dark:text-text-sub-dark uppercase">
                        <div className="text-center">Roll</div>
                        <div>Student Name</div>
                        <div className="text-center">Attendance Status</div>
                        <div>Remarks</div>
                    </div>
                    {filteredStudents.map((student) => (
                        <div key={student.id} className="grid grid-cols-[60px_2fr_3fr_2fr] sm:grid-cols-[60px_2fr_300px_1fr] items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                             <div className="text-center font-mono text-text-sub-light dark:text-text-sub-dark text-sm">{String(student.rollNo).padStart(2, '0')}</div>
                             <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${student.avatarColor}`}>
                                   {student.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                                </div>
                                <p className="text-sm font-medium text-text-main-light dark:text-text-main-dark">{student.name}</p>
                             </div>
                             <div className="flex items-center justify-center gap-1 sm:gap-2">
                                {(['Present', 'Absent', 'Late', 'Excused'] as AttendanceStatus[]).map((status) => {
                                   const config = STATUS_CONFIG[status];
                                   const isActive = student.status === status;
                                   return (
                                      <button
                                         key={status}
                                         onClick={() => handleStatusChange(student.id, status)}
                                         className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center border transition-all duration-200
                                            ${isActive ? `${config.bg} ${config.color} border-current shadow-sm scale-110 font-bold` : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'}`}
                                      >
                                         <span className="text-xs sm:text-sm">{config.label}</span>
                                      </button>
                                   );
                                })}
                             </div>
                             <div>
                                <input type="text" placeholder="Add remark..." defaultValue={student.remarks} className="w-full bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-primary focus:ring-0 text-sm py-1 px-2 outline-none" />
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
  };

  // --- TAB: REPORTS ---
  const renderReports = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-4">Generate Attendance Report</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">Report Type</label>
                        <select className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none">
                            <option value="history">Student History</option>
                            <option value="class-summary">Class Summary</option>
                            <option value="monthly">Monthly Register</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">From Date</label>
                        <input type="date" className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">To Date</label>
                        <input type="date" className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none" />
                    </div>
                    <div className="flex items-end">
                        <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm transition-colors">
                            Generate Preview
                        </button>
                    </div>
                </div>

                {/* Preview Area (Mock) */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-6">
                    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <span className="text-sm font-medium">Preview: Class Summary (Aug 2024)</span>
                        <div className="flex gap-2">
                             <button onClick={() => showToast('Report downloaded as PDF')} className="text-xs flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded border border-red-200 hover:bg-red-100">
                                <span className="material-icons-outlined text-sm">picture_as_pdf</span> PDF
                             </button>
                             <button onClick={() => showToast('Report downloaded as CSV')} className="text-xs flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded border border-green-200 hover:bg-green-100">
                                <span className="material-icons-outlined text-sm">table_view</span> CSV
                             </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-text-sub-light dark:text-text-sub-dark bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-4 py-2">Student</th>
                                    <th className="px-4 py-2 text-center">Total Days</th>
                                    <th className="px-4 py-2 text-center">Present</th>
                                    <th className="px-4 py-2 text-center">Absent</th>
                                    <th className="px-4 py-2 text-center">%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.slice(0, 5).map(s => (
                                    <tr key={s.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-4 py-2">{s.name}</td>
                                        <td className="px-4 py-2 text-center">{s.totalDays}</td>
                                        <td className="px-4 py-2 text-center text-green-600">{s.presentDays}</td>
                                        <td className="px-4 py-2 text-center text-red-600">{s.totalDays - s.presentDays}</td>
                                        <td className="px-4 py-2 text-center font-bold">{calculatePercentage(s)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  // --- TAB: AT-RISK STUDENTS ---
  const renderAtRisk = () => {
    const atRiskStudents = students.filter(s => calculatePercentage(s) < riskThreshold);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Configuration */}
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg">
                        <span className="material-icons-outlined">warning</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-red-800 dark:text-red-300">At-Risk Monitoring</h3>
                        <p className="text-xs text-red-600 dark:text-red-400">Students falling below attendance threshold.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-text-sub-light dark:text-text-sub-dark">Alert Threshold:</label>
                    <div className="relative">
                        <input 
                            type="number" 
                            value={riskThreshold}
                            onChange={(e) => setRiskThreshold(Number(e.target.value))}
                            className="w-20 pl-3 pr-8 py-1.5 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-card-dark focus:ring-2 focus:ring-red-500 outline-none text-center font-bold"
                        />
                        <span className="absolute right-3 top-1.5 text-gray-400">%</span>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {atRiskStudents.length === 0 ? (
                    <div className="col-span-full p-8 text-center text-text-sub-light dark:text-text-sub-dark bg-card-light dark:bg-card-dark rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <span className="material-icons-outlined text-4xl text-green-500 mb-2">thumb_up</span>
                        <p>No students found below {riskThreshold}% attendance. Great job!</p>
                    </div>
                ) : (
                    atRiskStudents.map(student => {
                        const pct = calculatePercentage(student);
                        return (
                            <div key={student.id} className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${student.avatarColor}`}>
                                            {student.name.substring(0,2)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-text-main-light dark:text-text-main-dark">{student.name}</h4>
                                            <p className="text-xs text-text-sub-light dark:text-text-sub-dark">Roll: {student.rollNo}</p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-red-600">{pct}%</span>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mb-4 overflow-hidden">
                                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                                </div>

                                <div className="flex justify-between items-center text-xs text-text-sub-light dark:text-text-sub-dark mb-4">
                                    <span>Absent: <span className="font-bold text-text-main-light dark:text-text-main-dark">{student.totalDays - student.presentDays} days</span></span>
                                    <span>Consecutive: <span className="font-bold text-text-main-light dark:text-text-main-dark">{student.consecutiveAbsences}</span></span>
                                </div>

                                <button onClick={() => showToast(`Notification sent to ${student.name}'s parents`)} className="w-full py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 font-medium text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2">
                                    <span className="material-icons-outlined text-sm">notifications_active</span>
                                    Notify Parents
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
  };

  // --- TAB: BIOMETRIC SYNC ---
  const renderSync = () => {
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        // Simulate processing
        setTimeout(() => {
            setIsUploading(false);
            const newLogs: SyncLog[] = [
                { id: 'l1', timestamp: new Date().toLocaleTimeString(), status: 'Success', message: 'Processed 24 records successfully.' },
                { id: 'l2', timestamp: new Date().toLocaleTimeString(), status: 'Warning', message: 'Row 12: Duplicate entry for ID 1024 (Skipped).' },
                { id: 'l3', timestamp: new Date().toLocaleTimeString(), status: 'Error', message: 'Row 15: Invalid date format.' },
            ];
            setSyncLogs(prev => [...newLogs, ...prev]);
            showToast('Sync completed with warnings');
        }, 1500);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
             {/* Upload Area */}
             <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                 <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-4">Upload Attendance Data</h3>
                 <p className="text-sm text-text-sub-light dark:text-text-sub-dark mb-6">
                    Upload CSV files exported from biometric devices. Ensure columns match the template: 
                    <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">StudentID, Date, TimeIn, TimeOut</span>.
                 </p>
                 
                 <div 
                    className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
                        ${isUploading ? 'bg-blue-50 border-blue-300' : 'border-gray-300 hover:border-primary hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800'}`}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                 >
                    <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
                    {isUploading ? (
                        <div className="flex flex-col items-center">
                            <span className="material-icons-outlined animate-spin text-4xl text-primary mb-2">refresh</span>
                            <p className="text-sm font-medium text-primary">Processing records...</p>
                        </div>
                    ) : (
                        <>
                            <span className="material-icons-outlined text-4xl text-gray-400 mb-2">cloud_upload</span>
                            <p className="font-medium text-text-main-light dark:text-text-main-dark">Click to upload CSV</p>
                            <p className="text-xs text-text-sub-light dark:text-text-sub-dark mt-1">or drag and drop file here</p>
                        </>
                    )}
                 </div>
             </div>

             {/* Log Area */}
             <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-[400px]">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Sync Logs</h3>
                     <button onClick={() => setSyncLogs([])} className="text-xs text-red-500 hover:underline">Clear Logs</button>
                 </div>
                 <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                     {syncLogs.length === 0 ? (
                         <div className="h-full flex flex-col items-center justify-center text-gray-400">
                             <span className="material-icons-outlined text-3xl mb-2">history</span>
                             <p className="text-sm">No recent sync activity.</p>
                         </div>
                     ) : (
                         syncLogs.map(log => (
                             <div key={log.id} className="text-sm p-3 rounded-lg border bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                 <div className="flex items-center justify-between mb-1">
                                     <span className={`font-bold text-xs px-2 py-0.5 rounded-full 
                                        ${log.status === 'Success' ? 'bg-green-100 text-green-700' : 
                                          log.status === 'Warning' ? 'bg-orange-100 text-orange-700' : 
                                          'bg-red-100 text-red-700'}`}>
                                        {log.status}
                                     </span>
                                     <span className="text-xs text-gray-400">{log.timestamp}</span>
                                 </div>
                                 <p className="text-text-main-light dark:text-text-main-dark">{log.message}</p>
                             </div>
                         ))
                     )}
                 </div>
             </div>
        </div>
    );
  };

  // --- TAB: NOTIFICATIONS ---
  const renderNotifications = () => {
     const updateTemplate = (id: string, field: 'subject' | 'body', value: string) => {
         setTemplates(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
     };

     return (
         <div className="space-y-6 animate-fade-in">
             <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl">
                 <div className="flex items-start gap-3">
                     <span className="material-icons-outlined text-blue-600 mt-0.5">info</span>
                     <div>
                         <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">Template Variables</p>
                         <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                             Use <code className="bg-white dark:bg-black/20 px-1 rounded">{"{StudentName}"}</code>, <code className="bg-white dark:bg-black/20 px-1 rounded">{"{Date}"}</code>, <code className="bg-white dark:bg-black/20 px-1 rounded">{"{Time}"}</code> dynamically in your messages.
                         </p>
                     </div>
                 </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {templates.map(template => {
                     const isEditing = editingTemplateId === template.id;
                     return (
                         <div key={template.id} className={`p-5 rounded-xl border transition-all ${isEditing ? 'border-primary shadow-md bg-white dark:bg-gray-800' : 'border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark'}`}>
                             <div className="flex items-center justify-between mb-3">
                                 <h4 className="font-bold text-text-main-light dark:text-text-main-dark uppercase text-xs tracking-wider">
                                     {template.trigger.replace('_', ' ')}
                                 </h4>
                                 <button 
                                    onClick={() => {
                                        if(isEditing) {
                                            setEditingTemplateId(null);
                                            showToast('Template saved successfully');
                                        } else {
                                            setEditingTemplateId(template.id);
                                        }
                                    }} 
                                    className={`p-1.5 rounded-full transition-colors ${isEditing ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'}`}
                                >
                                     <span className="material-icons-outlined text-lg">{isEditing ? 'check' : 'edit'}</span>
                                 </button>
                             </div>
                             
                             <div className="space-y-3">
                                 <div>
                                     <label className="text-xs text-gray-400">Subject</label>
                                     <input 
                                        type="text" 
                                        value={template.subject}
                                        disabled={!isEditing}
                                        onChange={(e) => updateTemplate(template.id, 'subject', e.target.value)}
                                        className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 disabled:border-transparent py-1 text-sm font-medium focus:border-primary outline-none text-text-main-light dark:text-text-main-dark"
                                     />
                                 </div>
                                 <div>
                                     <label className="text-xs text-gray-400">Message Body</label>
                                     <textarea 
                                        rows={4}
                                        value={template.body}
                                        disabled={!isEditing}
                                        onChange={(e) => updateTemplate(template.id, 'body', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900/50 rounded p-2 text-sm border-none disabled:bg-transparent disabled:p-0 disabled:resize-none focus:ring-1 focus:ring-primary outline-none text-text-sub-light dark:text-text-sub-dark"
                                     />
                                 </div>
                             </div>
                         </div>
                     );
                 })}
             </div>
         </div>
     );
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative">
       {/* Global Toast */}
       {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg animate-slide-in-down duration-300 flex items-center gap-3">
          <span className="material-icons-outlined text-green-400">check_circle</span>
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Header & Navigation */}
      <div className="bg-card-light dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Attendance Manager</h2>
               <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Manage daily registers, reports, and policies.</p>
            </div>
            
            <div className="flex items-center gap-3">
               <input 
                 type="date" 
                 value={selectedDate}
                 onChange={(e) => setSelectedDate(e.target.value)}
                 className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
               />
               <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none min-w-[150px]"
              >
                <option>Class 10 - A</option>
                <option>Class 10 - B</option>
                <option>Class 11 - A</option>
              </select>
              {activeTab === 'register' && (
                  <button 
                    onClick={() => showToast('Attendance saved successfully')}
                    className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm text-sm font-medium"
                  >
                    <span className="material-icons-outlined text-sm">save</span>
                    Save
                  </button>
              )}
            </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto bg-gray-50/50 dark:bg-gray-800/30">
            {[
                { id: 'register', label: 'Daily Register', icon: 'list_alt' },
                { id: 'reports', label: 'Reports', icon: 'analytics' },
                { id: 'at-risk', label: 'At-Risk Monitoring', icon: 'warning' },
                { id: 'sync', label: 'Biometric Sync', icon: 'fingerprint' },
                { id: 'notifications', label: 'Notifications', icon: 'notifications_active' },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ViewTab)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                        ${activeTab === tab.id 
                            ? 'border-primary text-primary bg-primary/5' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                    <span className="material-icons-outlined text-lg">{tab.icon}</span>
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
          {activeTab === 'register' && renderRegister()}
          {activeTab === 'reports' && renderReports()}
          {activeTab === 'at-risk' && renderAtRisk()}
          {activeTab === 'sync' && renderSync()}
          {activeTab === 'notifications' && renderNotifications()}
      </div>
    </div>
  );
};