import React, { useState, useMemo } from 'react';

// --- Types ---
type UserRole = 'Teacher' | 'Admin';
type GradebookStatus = 'Draft' | 'Submitted' | 'Approved' | 'Published';
type ResultStatus = 'Pass' | 'Fail' | 'Promoted' | 'Detained';

interface GradingScheme {
  rangeStart: number;
  rangeEnd: number;
  grade: string;
  gpa: number;
  color: string;
}

interface StudentMarks {
  studentId: string;
  name: string;
  rollNo: number;
  periodicTest: number; // Max 20
  midTerm: number;      // Max 30
  finalExam: number;    // Max 50
  total?: number;
  grade?: string;
  remarks?: string;
}

interface GradebookHistory {
  timestamp: string;
  action: string;
  user: string;
}

interface SubjectGradebook {
  id: string;
  classId: string;
  subject: string;
  teacher: string;
  status: GradebookStatus;
  students: StudentMarks[];
  history: GradebookHistory[];
}

// --- Mock Data ---

const DEFAULT_GRADING_SCHEME: GradingScheme[] = [
  { rangeStart: 91, rangeEnd: 100, grade: 'A1', gpa: 10.0, color: 'text-green-600' },
  { rangeStart: 81, rangeEnd: 90, grade: 'A2', gpa: 9.0, color: 'text-green-500' },
  { rangeStart: 71, rangeEnd: 80, grade: 'B1', gpa: 8.0, color: 'text-blue-600' },
  { rangeStart: 61, rangeEnd: 70, grade: 'B2', gpa: 7.0, color: 'text-blue-500' },
  { rangeStart: 51, rangeEnd: 60, grade: 'C1', gpa: 6.0, color: 'text-yellow-600' },
  { rangeStart: 41, rangeEnd: 50, grade: 'C2', gpa: 5.0, color: 'text-yellow-500' },
  { rangeStart: 33, rangeEnd: 40, grade: 'D', gpa: 4.0, color: 'text-orange-500' },
  { rangeStart: 0, rangeEnd: 32, grade: 'E', gpa: 0.0, color: 'text-red-600' },
];

const INITIAL_STUDENT_MARKS: StudentMarks[] = [
  { studentId: 's1', name: 'Adrian Miller', rollNo: 1, periodicTest: 18, midTerm: 25, finalExam: 42 },
  { studentId: 's2', name: 'Bianca Ross', rollNo: 2, periodicTest: 19, midTerm: 28, finalExam: 45 },
  { studentId: 's3', name: 'Charles Dunn', rollNo: 3, periodicTest: 12, midTerm: 15, finalExam: 28 },
  { studentId: 's4', name: 'Diana Prince', rollNo: 4, periodicTest: 20, midTerm: 29, finalExam: 48 },
  { studentId: 's5', name: 'Evan Wright', rollNo: 5, periodicTest: 15, midTerm: 20, finalExam: 35 },
];

const MOCK_GRADEBOOKS: SubjectGradebook[] = [
  {
    id: 'gb1',
    classId: 'Class 10 - A',
    subject: 'Physics',
    teacher: 'Mrs. Verma',
    status: 'Draft',
    students: JSON.parse(JSON.stringify(INITIAL_STUDENT_MARKS)),
    history: [
        { timestamp: '2024-03-10 10:00 AM', action: 'Created Draft', user: 'System' }
    ]
  },
  {
    id: 'gb2',
    classId: 'Class 10 - A',
    subject: 'Mathematics',
    teacher: 'Mr. David',
    status: 'Submitted',
    students: JSON.parse(JSON.stringify(INITIAL_STUDENT_MARKS)).map((s: StudentMarks) => ({...s, finalExam: s.finalExam - 5})),
    history: [
        { timestamp: '2024-03-12 09:30 AM', action: 'Submitted for Review', user: 'Mr. David' },
        { timestamp: '2024-03-10 11:00 AM', action: 'Created Draft', user: 'System' }
    ]
  },
  {
    id: 'gb3',
    classId: 'Class 10 - A',
    subject: 'English',
    teacher: 'Ms. Sarah',
    status: 'Published',
    students: JSON.parse(JSON.stringify(INITIAL_STUDENT_MARKS)).map((s: StudentMarks) => ({...s, finalExam: s.finalExam + 2})),
    history: [
        { timestamp: '2024-03-15 02:00 PM', action: 'Published', user: 'Principal Anderson' },
        { timestamp: '2024-03-14 10:00 AM', action: 'Approved', user: 'Principal Anderson' },
        { timestamp: '2024-03-13 04:00 PM', action: 'Submitted', user: 'Ms. Sarah' }
    ]
  }
];

export const GradebookManager: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('Teacher');
  const [activeTab, setActiveTab] = useState<'subject' | 'consolidated' | 'settings'>('subject');
  const [selectedClass, setSelectedClass] = useState('Class 10 - A');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('gb1');
  const [showHistory, setShowHistory] = useState(false);
  
  // Data State
  const [gradebooks, setGradebooks] = useState<SubjectGradebook[]>(MOCK_GRADEBOOKS);
  const [gradingScheme, setGradingScheme] = useState<GradingScheme[]>(DEFAULT_GRADING_SCHEME);
  const [reportCardStudent, setReportCardStudent] = useState<string | null>(null); // ID of student to show report card for

  // --- Helpers ---

  const calculateGrade = (total: number) => {
    const scheme = gradingScheme.find(s => total >= s.rangeStart && total <= s.rangeEnd);
    return scheme ? scheme : { grade: 'N/A', gpa: 0, color: 'text-gray-400' };
  };

  const currentGradebook = gradebooks.find(gb => gb.id === selectedSubjectId);

  // --- Actions ---

  const handleMarkChange = (studentId: string, field: keyof StudentMarks, value: string) => {
    if (!currentGradebook) return;
    const numValue = Math.min(Math.max(0, Number(value)), field === 'periodicTest' ? 20 : field === 'midTerm' ? 30 : 50);

    const updatedStudents = currentGradebook.students.map(s => {
      if (s.studentId === studentId) {
        return { ...s, [field]: numValue };
      }
      return s;
    });

    setGradebooks(prev => prev.map(gb => gb.id === selectedSubjectId ? { ...gb, students: updatedStudents } : gb));
  };

  const handleStatusChange = (newStatus: GradebookStatus) => {
    const user = currentRole === 'Teacher' ? 'Teacher' : 'Principal Anderson';
    const entry: GradebookHistory = {
        timestamp: new Date().toLocaleString(),
        action: `Changed status to ${newStatus}`,
        user: user
    };
    setGradebooks(prev => prev.map(gb => gb.id === selectedSubjectId ? { ...gb, status: newStatus, history: [entry, ...gb.history] } : gb));
  };

  // --- Render Views ---

  const renderSubjectGradebook = () => {
    if (!currentGradebook) return <div>Select a subject</div>;

    const isEditable = (currentRole === 'Teacher' && currentGradebook.status === 'Draft') || (currentRole === 'Admin' && currentGradebook.status !== 'Published');

    return (
      <div className="space-y-4 animate-fade-in h-full flex flex-col relative">
         {/* Controls Bar */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
             <div className="flex items-center gap-4">
                 <div>
                    <label className="text-xs text-gray-500 block">Subject</label>
                    <select 
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm rounded p-1 min-w-[150px]"
                    >
                        {gradebooks.map(gb => <option key={gb.id} value={gb.id}>{gb.subject}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-xs text-gray-500 block mb-1">Status</label>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase 
                            ${currentGradebook.status === 'Published' ? 'bg-green-100 text-green-700' : 
                            currentGradebook.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                            currentGradebook.status === 'Submitted' ? 'bg-orange-100 text-orange-700' : 
                            'bg-gray-200 text-gray-700'}`}>
                            {currentGradebook.status}
                        </span>
                        <button 
                            onClick={() => setShowHistory(!showHistory)}
                            className="text-gray-400 hover:text-primary transition-colors"
                            title="View Audit Log"
                        >
                            <span className="material-icons-outlined text-sm">history</span>
                        </button>
                    </div>
                 </div>
             </div>

             <div className="flex gap-2">
                 {currentRole === 'Teacher' && currentGradebook.status === 'Draft' && (
                     <button onClick={() => handleStatusChange('Submitted')} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-600 shadow-sm">
                         <span className="material-icons-outlined text-sm">send</span> Submit to HOD
                     </button>
                 )}
                 {currentRole === 'Admin' && currentGradebook.status === 'Submitted' && (
                     <>
                        <button onClick={() => handleStatusChange('Draft')} className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-100">
                            Reject
                        </button>
                        <button onClick={() => handleStatusChange('Approved')} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 shadow-sm">
                            Approve
                        </button>
                     </>
                 )}
                 {currentRole === 'Admin' && currentGradebook.status === 'Approved' && (
                     <button onClick={() => handleStatusChange('Published')} className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 shadow-sm flex items-center gap-2">
                        <span className="material-icons-outlined text-sm">public</span> Publish
                     </button>
                 )}
             </div>
         </div>

         {/* History Popover */}
         {showHistory && (
             <div className="absolute top-20 left-4 z-20 w-80 bg-white dark:bg-card-dark rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 animate-fade-in">
                 <div className="flex justify-between items-center mb-3">
                     <h4 className="font-bold text-sm text-text-main-light dark:text-text-main-dark">Status History</h4>
                     <button onClick={() => setShowHistory(false)}><span className="material-icons-outlined text-gray-400 text-sm">close</span></button>
                 </div>
                 <div className="space-y-3 relative border-l border-gray-200 dark:border-gray-700 ml-2">
                     {currentGradebook.history.map((event, idx) => (
                         <div key={idx} className="ml-4 relative">
                             <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-card-dark"></div>
                             <p className="text-xs font-medium text-text-main-light dark:text-text-main-dark">{event.action}</p>
                             <p className="text-[10px] text-gray-500">{event.timestamp} • {event.user}</p>
                         </div>
                     ))}
                 </div>
             </div>
         )}

         {/* Spreadsheet Table */}
         <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 flex flex-col">
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                     <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                         <tr>
                             <th className="px-6 py-3 w-16">Roll</th>
                             <th className="px-6 py-3">Student Name</th>
                             <th className="px-6 py-3 w-32 text-center">Periodic (20)</th>
                             <th className="px-6 py-3 w-32 text-center">Mid-Term (30)</th>
                             <th className="px-6 py-3 w-32 text-center">Final (50)</th>
                             <th className="px-6 py-3 w-24 text-center bg-gray-100 dark:bg-gray-700">Total (100)</th>
                             <th className="px-6 py-3 w-24 text-center bg-gray-100 dark:bg-gray-700">Grade</th>
                             <th className="px-6 py-3">Remarks</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                         {currentGradebook.students.map((student) => {
                             const total = student.periodicTest + student.midTerm + student.finalExam;
                             const gradeInfo = calculateGrade(total);
                             
                             return (
                                 <tr key={student.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                     <td className="px-6 py-3 font-mono text-gray-500">{String(student.rollNo).padStart(2, '0')}</td>
                                     <td className="px-6 py-3 font-medium text-text-main-light dark:text-text-main-dark">{student.name}</td>
                                     <td className="px-6 py-3 text-center">
                                         <input 
                                            type="number" 
                                            disabled={!isEditable}
                                            value={student.periodicTest}
                                            onChange={(e) => handleMarkChange(student.studentId, 'periodicTest', e.target.value)}
                                            className="w-16 p-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:text-gray-500"
                                         />
                                     </td>
                                     <td className="px-6 py-3 text-center">
                                         <input 
                                            type="number" 
                                            disabled={!isEditable}
                                            value={student.midTerm}
                                            onChange={(e) => handleMarkChange(student.studentId, 'midTerm', e.target.value)}
                                            className="w-16 p-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:text-gray-500"
                                         />
                                     </td>
                                     <td className="px-6 py-3 text-center">
                                         <input 
                                            type="number" 
                                            disabled={!isEditable}
                                            value={student.finalExam}
                                            onChange={(e) => handleMarkChange(student.studentId, 'finalExam', e.target.value)}
                                            className="w-16 p-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:text-gray-500"
                                         />
                                     </td>
                                     <td className="px-6 py-3 text-center font-bold text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/50">
                                         {total}
                                     </td>
                                     <td className={`px-6 py-3 text-center font-bold bg-gray-50 dark:bg-gray-800/50 ${gradeInfo.color}`}>
                                         {gradeInfo.grade}
                                     </td>
                                     <td className="px-6 py-3">
                                         <input 
                                            type="text" 
                                            disabled={!isEditable}
                                            placeholder="Optional..."
                                            className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary outline-none text-xs py-1"
                                         />
                                     </td>
                                 </tr>
                             );
                         })}
                     </tbody>
                 </table>
             </div>
             <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 flex justify-between">
                 <span>Showing {currentGradebook.students.length} students</span>
                 <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Passing &gt; 33%
                 </span>
             </div>
         </div>
      </div>
    );
  };

  const renderConsolidated = () => {
    // Determine subject columns based on available gradebooks
    const subjects = gradebooks.map(gb => gb.subject);
    
    // Pivot data to be student-centric
    const consolidatedData = INITIAL_STUDENT_MARKS.map(student => {
        const marks: Record<string, number> = {};
        let totalScore = 0;
        let subjectCount = 0;

        gradebooks.forEach(gb => {
            const sMarks = gb.students.find(s => s.studentId === student.studentId);
            if (sMarks) {
                const total = sMarks.periodicTest + sMarks.midTerm + sMarks.finalExam;
                marks[gb.subject] = total;
                totalScore += total;
                subjectCount++;
            }
        });

        const percentage = subjectCount > 0 ? Math.round(totalScore / subjectCount) : 0;
        const result: ResultStatus = percentage >= 33 ? 'Promoted' : 'Detained';

        return {
            ...student,
            marks,
            grandTotal: totalScore,
            percentage,
            result
        };
    });

    return (
        <div className="space-y-4 animate-fade-in">
             <div className="flex justify-between items-center bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                 <div>
                     <h3 className="font-bold text-text-main-light dark:text-text-main-dark">Annual Consolidated Result</h3>
                     <p className="text-xs text-gray-500">Academic Year 2024-2025 • {selectedClass}</p>
                 </div>
                 <div className="flex gap-2">
                     <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 text-sm">
                        <span className="material-icons-outlined text-sm">download</span> Export CSV
                     </button>
                     <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm text-sm">
                        <span className="material-icons-outlined text-sm">print</span> Print All
                     </button>
                 </div>
             </div>

             <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                 <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                         <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                             <tr>
                                 <th className="px-6 py-3 w-16">Roll</th>
                                 <th className="px-6 py-3">Student Name</th>
                                 {subjects.map(sub => (
                                     <th key={sub} className="px-6 py-3 text-center">{sub}</th>
                                 ))}
                                 <th className="px-6 py-3 text-center bg-gray-100 dark:bg-gray-700">Grand Total</th>
                                 <th className="px-6 py-3 text-center bg-gray-100 dark:bg-gray-700">%</th>
                                 <th className="px-6 py-3 text-center">Result</th>
                                 <th className="px-6 py-3 text-right">Actions</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                             {consolidatedData.map(student => (
                                 <tr key={student.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                     <td className="px-6 py-4 font-mono text-gray-500">{String(student.rollNo).padStart(2, '0')}</td>
                                     <td className="px-6 py-4 font-medium">{student.name}</td>
                                     {subjects.map(sub => {
                                         const mark = student.marks[sub];
                                         const gradeInfo = calculateGrade(mark);
                                         return (
                                            <td key={sub} className="px-6 py-4 text-center">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{mark}</span>
                                                    <span className={`text-[10px] ${gradeInfo.color}`}>{gradeInfo.grade}</span>
                                                </div>
                                            </td>
                                         );
                                     })}
                                     <td className="px-6 py-4 text-center font-bold bg-gray-50 dark:bg-gray-800/50">{student.grandTotal}</td>
                                     <td className="px-6 py-4 text-center font-bold bg-gray-50 dark:bg-gray-800/50">{student.percentage}%</td>
                                     <td className="px-6 py-4 text-center">
                                         <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${student.result === 'Promoted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {student.result}
                                         </span>
                                     </td>
                                     <td className="px-6 py-4 text-right">
                                         <button 
                                            onClick={() => setReportCardStudent(student.studentId)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline text-xs flex items-center justify-end gap-1"
                                         >
                                            <span className="material-icons-outlined text-sm">visibility</span> Card
                                         </button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </div>
        </div>
    );
  };

  const renderSettings = () => (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-4">Grading Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grading System</label>
                      <select className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 outline-none text-sm">
                          <option>Standard 8-Point Scale (A1 - E)</option>
                          <option>GPA System (4.0 Scale)</option>
                          <option>Percentage Only</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Passing Criteria (%)</label>
                      <input type="number" defaultValue={33} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 outline-none text-sm" />
                  </div>
              </div>

              <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Scheme Definition</h4>
              <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-4 text-xs font-medium text-gray-500 mb-2">
                      <div className="col-span-1">Range Start</div>
                      <div className="col-span-1">Range End</div>
                      <div className="col-span-1">Grade Label</div>
                      <div className="col-span-1">GPA Points</div>
                      <div className="col-span-1">Actions</div>
                  </div>
                  {gradingScheme.map((scheme, idx) => (
                      <div key={idx} className="grid grid-cols-5 gap-4 items-center">
                          <input type="number" defaultValue={scheme.rangeStart} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                          <input type="number" defaultValue={scheme.rangeEnd} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                          <input type="text" defaultValue={scheme.grade} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-bold" />
                          <input type="number" defaultValue={scheme.gpa} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                          <button className="text-red-500 hover:bg-red-50 p-1.5 rounded"><span className="material-icons-outlined text-lg">delete</span></button>
                      </div>
                  ))}
                  <button className="mt-2 text-primary text-sm font-medium hover:underline flex items-center gap-1">
                      <span className="material-icons-outlined text-sm">add</span> Add Range
                  </button>
              </div>

              <div className="mt-8 flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm">Save Configuration</button>
              </div>
          </div>
      </div>
  );

  const renderReportCardModal = () => {
    if (!reportCardStudent) return null;
    const student = INITIAL_STUDENT_MARKS.find(s => s.studentId === reportCardStudent);
    if (!student) return null;

    // Gather marks
    const marksData = gradebooks.map(gb => {
        const sMarks = gb.students.find(s => s.studentId === student.studentId);
        const total = sMarks ? sMarks.periodicTest + sMarks.midTerm + sMarks.finalExam : 0;
        return {
            subject: gb.subject,
            periodic: sMarks?.periodicTest || 0,
            mid: sMarks?.midTerm || 0,
            final: sMarks?.finalExam || 0,
            total,
            grade: calculateGrade(total)
        };
    });

    const grandTotal = marksData.reduce((acc, curr) => acc + curr.total, 0);
    const percentage = Math.round(grandTotal / marksData.length);
    const result = percentage >= 33 ? 'PASS' : 'FAIL';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setReportCardStudent(null)}></div>
            <div className="relative bg-white text-gray-900 rounded-xl shadow-2xl w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden animate-slide-in-down">
                {/* Modal Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center print:hidden">
                    <h3 className="font-bold">Report Card Preview</h3>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                            <span className="material-icons-outlined text-sm">print</span> Print
                        </button>
                        <button onClick={() => setReportCardStudent(null)} className="p-1.5 hover:bg-gray-200 rounded text-gray-500">
                            <span className="material-icons-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Printable Content */}
                <div className="flex-1 overflow-y-auto p-8" id="printable-report-card">
                    <div className="border-4 border-double border-gray-800 p-6 h-full">
                        {/* School Header */}
                        <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
                            <h1 className="text-3xl font-serif font-bold tracking-wide uppercase">Springfield Academy</h1>
                            <p className="text-sm tracking-widest mt-1">Excellence in Education</p>
                            <p className="text-xs mt-1">123 School Lane, Education City, CA 90210</p>
                        </div>

                        {/* Student Details */}
                        <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8 text-sm">
                            <div className="flex justify-between border-b border-gray-300 pb-1">
                                <span className="font-bold text-gray-600">Student Name:</span>
                                <span className="font-serif text-lg">{student.name}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-300 pb-1">
                                <span className="font-bold text-gray-600">Roll Number:</span>
                                <span className="font-mono text-lg">{String(student.rollNo).padStart(3, '0')}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-300 pb-1">
                                <span className="font-bold text-gray-600">Class & Section:</span>
                                <span>{selectedClass}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-300 pb-1">
                                <span className="font-bold text-gray-600">Academic Year:</span>
                                <span>2024-2025</span>
                            </div>
                        </div>

                        {/* Marks Table */}
                        <table className="w-full mb-8 border-collapse border border-gray-800 text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-800 px-3 py-2 text-left">Subject</th>
                                    <th className="border border-gray-800 px-3 py-2 text-center w-20">PT (20)</th>
                                    <th className="border border-gray-800 px-3 py-2 text-center w-20">Mid (30)</th>
                                    <th className="border border-gray-800 px-3 py-2 text-center w-20">Final (50)</th>
                                    <th className="border border-gray-800 px-3 py-2 text-center w-20">Total (100)</th>
                                    <th className="border border-gray-800 px-3 py-2 text-center w-20">Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {marksData.map((row, i) => (
                                    <tr key={i}>
                                        <td className="border border-gray-800 px-3 py-2 font-medium">{row.subject}</td>
                                        <td className="border border-gray-800 px-3 py-2 text-center text-gray-600">{row.periodic}</td>
                                        <td className="border border-gray-800 px-3 py-2 text-center text-gray-600">{row.mid}</td>
                                        <td className="border border-gray-800 px-3 py-2 text-center text-gray-600">{row.final}</td>
                                        <td className="border border-gray-800 px-3 py-2 text-center font-bold">{row.total}</td>
                                        <td className="border border-gray-800 px-3 py-2 text-center font-bold">{row.grade.grade}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer Summary */}
                        <div className="grid grid-cols-2 gap-8 mb-12">
                            <div className="border border-gray-800 p-4 rounded">
                                <h4 className="font-bold border-b border-gray-300 mb-2 pb-1">Result Summary</h4>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Grand Total:</span>
                                    <span className="font-bold">{grandTotal} / {marksData.length * 100}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Percentage:</span>
                                    <span className="font-bold">{percentage}%</span>
                                </div>
                                <div className="flex justify-between text-sm mt-3 pt-2 border-t border-gray-300">
                                    <span>Final Result:</span>
                                    <span className={`font-bold uppercase ${result === 'PASS' ? 'text-green-700' : 'text-red-700'}`}>
                                        {result} ({result === 'PASS' ? 'Promoted' : 'Detained'})
                                    </span>
                                </div>
                            </div>
                            <div className="border border-gray-800 p-4 rounded">
                                <h4 className="font-bold border-b border-gray-300 mb-2 pb-1">Remarks</h4>
                                <p className="text-sm italic text-gray-600 h-16">
                                    {percentage >= 90 ? "Outstanding performance! Keep it up." : 
                                     percentage >= 75 ? "Very good work. Consistent effort shown." : 
                                     "Satisfactory. Needs to focus more on core subjects."}
                                </p>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="flex justify-between items-end mt-auto pt-10">
                            <div className="text-center">
                                <div className="w-32 border-b border-gray-800 mb-1"></div>
                                <span className="text-xs font-bold uppercase">Class Teacher</span>
                            </div>
                            <div className="text-center">
                                <div className="w-32 border-b border-gray-800 mb-1"></div>
                                <span className="text-xs font-bold uppercase">Principal</span>
                            </div>
                            <div className="text-center">
                                <div className="w-32 border-b border-gray-800 mb-1"></div>
                                <span className="text-xs font-bold uppercase">Parent</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #printable-report-card, #printable-report-card * { visibility: visible; }
                    #printable-report-card { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%; 
                        height: 100%; 
                        padding: 0;
                        margin: 0;
                    }
                }
            `}</style>
        </div>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
         <div>
            <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Gradebook & Results</h2>
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark">
                {currentRole === 'Admin' ? 'Finalize results, approve grades, and publish report cards.' : 'Manage subject marks and submit for approval.'}
            </p>
         </div>
         
         <div className="flex items-center gap-3">
            <select 
               value={selectedClass}
               onChange={(e) => setSelectedClass(e.target.value)}
               className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
            >
               <option>Class 10 - A</option>
               <option>Class 10 - B</option>
            </select>

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
                 Admin
               </button>
            </div>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
         <button onClick={() => setActiveTab('subject')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'subject' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            <span className="material-icons-outlined text-lg">class</span> Subject Gradebook
         </button>
         <button onClick={() => setActiveTab('consolidated')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'consolidated' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            <span className="material-icons-outlined text-lg">assessment</span> Consolidated Result
         </button>
         {currentRole === 'Admin' && (
             <button onClick={() => setActiveTab('settings')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                <span className="material-icons-outlined text-lg">settings</span> Grade Settings
             </button>
         )}
      </div>

      <div className="flex-1 overflow-hidden relative">
         {activeTab === 'subject' && renderSubjectGradebook()}
         {activeTab === 'consolidated' && renderConsolidated()}
         {activeTab === 'settings' && renderSettings()}
      </div>

      {renderReportCardModal()}
    </div>
  );
};
