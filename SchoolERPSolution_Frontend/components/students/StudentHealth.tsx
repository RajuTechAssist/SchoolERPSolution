
import React, { useState } from 'react';

// --- Types ---
type View = 'dashboard' | 'record';
type Severity = 'Low' | 'Medium' | 'Critical';

interface HealthLog {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  type: 'Visit' | 'Incident' | 'Medication' | 'Vaccination';
  issue: string;
  actionTaken: string;
  parentNotified: boolean;
  recordedBy: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  consentOnFile: boolean;
  startDate: string;
  endDate: string;
}

interface StudentHealthProfile {
  id: string;
  name: string;
  class: string;
  dob: string;
  bloodGroup: string;
  photo: string;
  allergies: string[];
  conditions: string[];
  physician: { name: string; phone: string };
  emergencyContact: { name: string; phone: string; relation: string };
  medications: Medication[];
  logs: HealthLog[];
}

// --- Mock Data ---
const MOCK_PROFILES: StudentHealthProfile[] = [
  {
    id: 'STU-001',
    name: 'Aarav Patel',
    class: 'Class 1 - A',
    dob: '2019-05-15',
    bloodGroup: 'B+',
    photo: 'https://ui-avatars.com/api/?name=Aarav+Patel&background=random',
    allergies: ['Peanuts', 'Penicillin'],
    conditions: ['Asthma'],
    physician: { name: 'Dr. A. Smith', phone: '+1 555-0123' },
    emergencyContact: { name: 'Suresh Patel', phone: '+91 98765 43210', relation: 'Father' },
    medications: [
      { id: 'm1', name: 'Albuterol Inhaler', dosage: '2 puffs', frequency: 'As needed', consentOnFile: true, startDate: '2024-01-01', endDate: 'Ongoing' }
    ],
    logs: [
      { id: 'l1', studentId: 'STU-001', studentName: 'Aarav Patel', date: '2024-10-24', time: '10:30 AM', type: 'Visit', issue: 'Shortness of breath after PE', actionTaken: 'Administered inhaler, rested in nurse office for 20 mins.', parentNotified: true, recordedBy: 'Nurse Sarah' },
      { id: 'l2', studentId: 'STU-001', studentName: 'Aarav Patel', date: '2024-09-15', time: '02:00 PM', type: 'Incident', issue: 'Scraped knee on playground', actionTaken: 'Cleaned wound, applied bandage.', parentNotified: false, recordedBy: 'Nurse Sarah' }
    ]
  },
  {
    id: 'STU-002',
    name: 'Zara Khan',
    class: 'Class 5 - B',
    dob: '2015-08-20',
    bloodGroup: 'O-',
    photo: 'https://ui-avatars.com/api/?name=Zara+Khan&background=random',
    allergies: [],
    conditions: [],
    physician: { name: 'Dr. B. Jones', phone: '+1 555-0124' },
    emergencyContact: { name: 'Farhan Khan', phone: '+91 99887 76655', relation: 'Father' },
    medications: [],
    logs: []
  },
  {
    id: 'STU-003',
    name: 'Ishaan Gupta',
    class: 'Class 9 - A',
    dob: '2011-11-05',
    bloodGroup: 'A+',
    photo: 'https://ui-avatars.com/api/?name=Ishaan+Gupta&background=random',
    allergies: ['Dust'],
    conditions: ['Type 1 Diabetes'],
    physician: { name: 'Dr. C. Ray', phone: '+1 555-0125' },
    emergencyContact: { name: 'Meera Gupta', phone: '+91 91234 56789', relation: 'Mother' },
    medications: [
      { id: 'm2', name: 'Insulin', dosage: 'Variable', frequency: 'Before Lunch', consentOnFile: true, startDate: '2023-06-01', endDate: 'Ongoing' }
    ],
    logs: [
      { id: 'l3', studentId: 'STU-003', studentName: 'Ishaan Gupta', date: '2024-10-25', time: '12:15 PM', type: 'Visit', issue: 'Routine blood sugar check', actionTaken: 'Level 110 mg/dL - Normal.', parentNotified: false, recordedBy: 'Nurse Sarah' }
    ]
  }
];

// --- Sub-Components ---

const StatCard: React.FC<{ title: string; value: string; icon: string; color: string; sub?: string }> = ({ title, value, icon, color, sub }) => (
  <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{value}</h3>
      {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
    </div>
    <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('600', '100').replace('500', '100')} ${color}`}>
      <span className="material-icons-outlined text-xl">{icon}</span>
    </div>
  </div>
);

export const StudentHealth: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Log Visit Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logForm, setLogForm] = useState({ issue: '', treatment: '', parentNotified: false, type: 'Visit' });

  // --- Logic ---
  const selectedStudent = MOCK_PROFILES.find(s => s.id === selectedStudentId);
  const filteredStudents = MOCK_PROFILES.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Flattened recent activity log for dashboard
  const allLogs = MOCK_PROFILES.flatMap(s => s.logs).sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());

  const handleLogSubmit = () => {
    if (!selectedStudent) return;
    const newLog: HealthLog = {
        id: `l_${Date.now()}`,
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: logForm.type as any,
        issue: logForm.issue,
        actionTaken: logForm.treatment,
        parentNotified: logForm.parentNotified,
        recordedBy: 'Nurse Admin'
    };
    
    // In a real app, updated via API. Here we mutate mock for demo (not persistent)
    selectedStudent.logs.unshift(newLog);
    setIsLogModalOpen(false);
    setLogForm({ issue: '', treatment: '', parentNotified: false, type: 'Visit' });
    alert('Medical record updated successfully.');
  };

  const handleSelectStudent = (id: string) => {
      setSelectedStudentId(id);
      setView('record');
  };

  // --- Renderers ---

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
        {/* Search Bar - Emergency Focus */}
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl opacity-30 group-focus-within:opacity-100 transition duration-500 blur"></div>
            <div className="relative bg-white dark:bg-card-dark rounded-xl flex items-center p-2">
                <span className="material-icons-outlined text-red-500 ml-3 mr-2 animate-pulse">medical_services</span>
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Emergency Lookup: Search Student Name or ID..." 
                    className="w-full bg-transparent outline-none text-gray-800 dark:text-white placeholder-gray-400 font-medium h-10"
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full mr-2">
                        <span className="material-icons-outlined text-gray-400">close</span>
                    </button>
                )}
            </div>
        </div>

        {/* If searching, show results list only */}
        {searchQuery ? (
            <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase">
                    Search Results
                </div>
                {filteredStudents.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No students found.</div>
                ) : (
                    filteredStudents.map(student => (
                        <div key={student.id} onClick={() => handleSelectStudent(student.id)} className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer transition-colors">
                            <div className="flex items-center gap-4">
                                <img src={student.photo} alt={student.name} className="w-10 h-10 rounded-full bg-gray-200" />
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200">{student.name}</h4>
                                    <p className="text-xs text-gray-500">{student.class} • Blood: {student.bloodGroup}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {student.allergies.length > 0 && <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">Allergy Alert</span>}
                                {student.conditions.length > 0 && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">{student.conditions[0]}</span>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        ) : (
            <>
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Medical Alerts" value="12" sub="Active conditions" icon="warning" color="text-red-600" />
                    <StatCard title="Visits Today" value="5" sub="Since 8:00 AM" icon="local_hospital" color="text-blue-600" />
                    <StatCard title="Meds Dispensed" value="3" sub="Requires Consent" icon="medication" color="text-green-600" />
                    <StatCard title="Vaccination Due" value="8" sub="This Month" icon="vaccines" color="text-orange-600" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activity Log */}
                    <div className="lg:col-span-2 bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">Nurse Station Log</h3>
                            <button className="text-xs text-primary hover:underline">View Full Log</button>
                        </div>
                        <div className="space-y-4">
                            {allLogs.map(log => (
                                <div key={log.id} className="flex gap-4 items-start border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${log.type === 'Incident' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{log.studentName}</h4>
                                            <span className="text-xs text-gray-400">{log.time}</span>
                                        </div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">{log.type}: {log.issue}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                            Action: {log.actionTaken}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {allLogs.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No activity recorded today.</p>}
                        </div>
                    </div>

                    {/* Quick Registry */}
                    <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex flex-col h-[500px]">
                        <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark mb-4">At-Risk Students</h3>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                            {MOCK_PROFILES.filter(s => s.allergies.length > 0 || s.conditions.length > 0).map(student => (
                                <div key={student.id} onClick={() => handleSelectStudent(student.id)} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                                    <img src={student.photo} className="w-8 h-8 rounded-full bg-red-200" />
                                    <div>
                                        <p className="text-sm font-bold text-red-900 dark:text-red-200">{student.name}</p>
                                        <p className="text-[10px] text-red-700 dark:text-red-300">
                                            {student.allergies.concat(student.conditions).join(', ')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        )}
    </div>
  );

  const renderRecord = () => {
    if (!selectedStudent) return null;
    const hasAlert = selectedStudent.allergies.length > 0 || selectedStudent.conditions.length > 0;

    return (
        <div className="flex flex-col h-full animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => { setView('dashboard'); setSearchQuery(''); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors">
                    <span className="material-icons-outlined">arrow_back</span>
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">{selectedStudent.name}</h2>
                    <p className="text-sm text-gray-500">Medical Record • {selectedStudent.id}</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <button 
                        onClick={() => setIsLogModalOpen(true)}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-600 flex items-center gap-2"
                    >
                        <span className="material-icons-outlined text-lg">edit_note</span> Log Visit
                    </button>
                </div>
            </div>

            {/* Alert Banner */}
            {hasAlert && (
                <div className="bg-red-600 text-white p-4 rounded-xl shadow-md mb-6 flex items-center gap-4 animate-pulse">
                    <span className="material-icons-outlined text-3xl">medical_services</span>
                    <div>
                        <h3 className="font-bold text-lg uppercase tracking-wide">Medical Alert</h3>
                        <p className="text-sm opacity-90">
                            {selectedStudent.conditions.length > 0 && `Condition: ${selectedStudent.conditions.join(', ')}. `}
                            {selectedStudent.allergies.length > 0 && `Allergic to: ${selectedStudent.allergies.join(', ')}.`}
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Col: Profile Summary */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                        <img src={selectedStudent.photo} alt={selectedStudent.name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-100 dark:border-gray-700" />
                        <div className="flex justify-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300">
                                Blood: {selectedStudent.bloodGroup}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300">
                                {selectedStudent.class}
                            </span>
                        </div>
                        <div className="text-left space-y-3 mt-6">
                            <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                                <p className="text-[10px] uppercase font-bold text-red-500 mb-1">Emergency Contact</p>
                                <p className="font-bold text-gray-800 dark:text-gray-100">{selectedStudent.emergencyContact.name} ({selectedStudent.emergencyContact.relation})</p>
                                <a href={`tel:${selectedStudent.emergencyContact.phone}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">
                                    <span className="material-icons-outlined text-sm">call</span> {selectedStudent.emergencyContact.phone}
                                </a>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Primary Physician</p>
                                <p className="font-bold text-gray-800 dark:text-gray-100">{selectedStudent.physician.name}</p>
                                <p className="text-xs text-gray-500">{selectedStudent.physician.phone}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h4 className="font-bold text-lg mb-4 text-text-main-light dark:text-text-main-dark">Medication Plan</h4>
                        {selectedStudent.medications.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No active medications.</p>
                        ) : (
                            <div className="space-y-3">
                                {selectedStudent.medications.map(med => (
                                    <div key={med.id} className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <h5 className="font-bold text-blue-800 dark:text-blue-200">{med.name}</h5>
                                            {med.consentOnFile && <span className="material-icons-outlined text-green-500 text-sm" title="Consent Verified">verified</span>}
                                        </div>
                                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{med.dosage} • {med.frequency}</p>
                                        <p className="text-[10px] text-blue-500 mt-2">Active: {med.startDate}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button className="w-full mt-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            + Add Medication
                        </button>
                    </div>
                </div>

                {/* Right Col: Timeline */}
                <div className="lg:col-span-2 bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h4 className="font-bold text-lg mb-6 text-text-main-light dark:text-text-main-dark">Medical Timeline</h4>
                    <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-8 pb-4">
                        {selectedStudent.logs.map((log, i) => (
                            <div key={i} className="ml-6 relative">
                                <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-card-dark ${log.type === 'Incident' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${log.type === 'Incident' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{log.type}</span>
                                        <span className="text-xs text-gray-400 ml-2">{log.date} at {log.time}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-400">By {log.recordedBy}</div>
                                </div>
                                <h5 className="font-bold text-sm text-gray-800 dark:text-gray-200 mt-1">{log.issue}</h5>
                                <div className="mt-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                                    <p className="mb-1"><span className="font-semibold">Action:</span> {log.actionTaken}</p>
                                    <p className="text-xs text-gray-500">Parent Notified: {log.parentNotified ? 'Yes' : 'No'}</p>
                                </div>
                            </div>
                        ))}
                        {selectedStudent.logs.length === 0 && (
                            <div className="ml-6 text-sm text-gray-400 italic">No medical history recorded.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="h-full flex flex-col relative">
        {view === 'dashboard' ? renderDashboard() : renderRecord()}

        {/* Log Visit Modal */}
        {isLogModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsLogModalOpen(false)}></div>
                <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-lg p-6 animate-slide-in-down">
                    <h3 className="font-bold text-lg mb-4 text-text-main-light dark:text-text-main-dark">Log Health Event</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                            <div className="flex gap-2">
                                {['Visit', 'Incident', 'Medication'].map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => setLogForm({...logForm, type: t})}
                                        className={`flex-1 py-2 text-sm rounded border ${logForm.type === t ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' : 'border-gray-200 dark:border-gray-600'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Issue / Reason</label>
                            <input 
                                type="text" 
                                value={logForm.issue}
                                onChange={(e) => setLogForm({...logForm, issue: e.target.value})}
                                className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                                placeholder="e.g. Headache, Fever, Scraped Knee"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Action Taken</label>
                            <textarea 
                                rows={3}
                                value={logForm.treatment}
                                onChange={(e) => setLogForm({...logForm, treatment: e.target.value})}
                                className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Treatment details..."
                            ></textarea>
                        </div>
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="notify" 
                                checked={logForm.parentNotified} 
                                onChange={(e) => setLogForm({...logForm, parentNotified: e.target.checked})}
                                className="rounded text-primary focus:ring-primary" 
                            />
                            <label htmlFor="notify" className="text-sm font-medium text-gray-700 dark:text-gray-300">Parent Notified</label>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button onClick={() => setIsLogModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm">Cancel</button>
                        <button onClick={handleLogSubmit} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm text-sm font-medium">Save Log</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
