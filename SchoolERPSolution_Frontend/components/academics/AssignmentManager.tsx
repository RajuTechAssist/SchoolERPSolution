import React, { useState, useEffect, useCallback } from 'react';

// --- Types ---
type UserRole = 'Teacher' | 'Admin';
type SubmissionType = 'Online Text' | 'File Upload' | 'Handwritten/Physical';
type AssignmentStatus = 'Active' | 'Draft' | 'Closed';
type StudentSubmissionStatus = 'Submitted' | 'Late' | 'Missing' | 'Graded' | 'Pending';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  classId: string;
  teacher: string;
  dueDate: string;
  maxMarks: number;
  type: SubmissionType;
  status: AssignmentStatus;
  isGraded: boolean; // vs Practice
  attachmentCount: number;
  stats: {
    total: number;
    submitted: number;
    graded: number;
  };
}

interface StudentSubmission {
  studentId: string;
  name: string;
  rollNo: number;
  status: StudentSubmissionStatus;
  submissionDate?: string;
  fileUrl?: string;
  marks?: number;
  feedback?: string;
  attachments?: string[]; // Teacher attachments for feedback
}

interface TeacherStats {
  id: string;
  name: string;
  assignmentsPosted: number;
  submissionRate: number; // Percentage
  gradingCompletion: number; // Percentage
  overdueCount: number;
}

// --- Mock Data ---
const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'a1',
    title: 'Newton Laws Reflection',
    subject: 'Physics',
    classId: 'Class 10 - A',
    teacher: 'Mrs. Verma',
    dueDate: '2024-08-15',
    maxMarks: 20,
    type: 'File Upload',
    status: 'Active',
    isGraded: true,
    attachmentCount: 1,
    stats: { total: 30, submitted: 25, graded: 10 }
  },
  {
    id: 'a2',
    title: 'Algebra Practice Set 4',
    subject: 'Mathematics',
    classId: 'Class 10 - A',
    teacher: 'Mrs. Verma',
    dueDate: '2024-08-18',
    maxMarks: 0,
    type: 'Handwritten/Physical',
    status: 'Draft',
    isGraded: false, // Practice
    attachmentCount: 0,
    stats: { total: 30, submitted: 0, graded: 0 }
  },
  {
    id: 'a3',
    title: 'Organic Chemistry Lab Report',
    subject: 'Chemistry',
    classId: 'Class 11 - B',
    teacher: 'Ms. Curie',
    dueDate: '2024-08-10',
    maxMarks: 50,
    type: 'File Upload',
    status: 'Closed',
    isGraded: true,
    attachmentCount: 2,
    stats: { total: 28, submitted: 28, graded: 28 }
  }
];

const MOCK_SUBMISSIONS: StudentSubmission[] = [
  { studentId: 's1', name: 'Adrian Miller', rollNo: 1, status: 'Graded', submissionDate: '2024-08-14', marks: 18, feedback: 'Excellent work. See attached notes.', attachments: ['correction_key.pdf'] },
  { studentId: 's2', name: 'Bianca Ross', rollNo: 2, status: 'Submitted', submissionDate: '2024-08-15' },
  { studentId: 's3', name: 'Charles Dunn', rollNo: 3, status: 'Late', submissionDate: '2024-08-16' },
  { studentId: 's4', name: 'Diana Prince', rollNo: 4, status: 'Missing' },
  { studentId: 's5', name: 'Evan Wright', rollNo: 5, status: 'Submitted', submissionDate: '2024-08-14' },
];

const MOCK_TEACHER_STATS: TeacherStats[] = [
  { id: 't1', name: 'Mrs. Verma', assignmentsPosted: 12, submissionRate: 85, gradingCompletion: 60, overdueCount: 2 },
  { id: 't2', name: 'Mr. Singh', assignmentsPosted: 8, submissionRate: 92, gradingCompletion: 100, overdueCount: 0 },
  { id: 't3', name: 'Ms. Curie', assignmentsPosted: 15, submissionRate: 78, gradingCompletion: 45, overdueCount: 5 },
];

export const AssignmentManager: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('Teacher');
  const [view, setView] = useState<'list' | 'create' | 'grading' | 'monitor'>('list');
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  
  // Grading State
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(MOCK_SUBMISSIONS);
  const [gradingStatus, setGradingStatus] = useState<'Saved' | 'Saving...' | ''>('Saved');
  
  // Feedback Modal State
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<string | null>(null); // studentId

  // Draft Creation State
  const [draftForm, setDraftForm] = useState<Partial<Assignment>>({
      title: '',
      subject: 'Physics',
      classId: 'Class 10 - A',
      dueDate: '',
      type: 'File Upload',
      maxMarks: 10,
      isGraded: true
  });
  const [draftStatus, setDraftStatus] = useState<'Saved' | 'Saving...' | 'Unsaved'>('Saved');

  // --- Auto-Save Helpers ---
  const triggerAutoSave = (setter: React.Dispatch<React.SetStateAction<string>>) => {
      setter('Saving...');
      // Simulate API call delay
      setTimeout(() => {
          setter('Saved');
      }, 1000);
  };

  // --- Actions ---

  const handleCreateDraftChange = (field: string, value: any) => {
    setDraftForm(prev => ({ ...prev, [field]: value }));
    triggerAutoSave(setDraftStatus as any);
  };

  const handleCreate = () => {
    const newAssignment: Assignment = {
      id: Date.now().toString(),
      teacher: 'Mrs. Verma',
      status: 'Active',
      attachmentCount: 0,
      stats: { total: 30, submitted: 0, graded: 0 },
      ...draftForm as any
    };
    setAssignments([newAssignment, ...assignments]);
    setView('list');
    // Reset draft
    setDraftForm({ title: '', subject: 'Physics', classId: 'Class 10 - A', dueDate: '', type: 'File Upload', maxMarks: 10, isGraded: true });
  };

  const handleGrade = (studentId: string, updates: Partial<StudentSubmission>) => {
    setSubmissions(prev => prev.map(s => 
      s.studentId === studentId 
        ? { ...s, status: 'Graded', ...updates } 
        : s
    ));
    triggerAutoSave(setGradingStatus as any);
  };

  const selectedAssignment = assignments.find(a => a.id === selectedAssignmentId);

  // --- Components ---

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
      <div>
        <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Assignments & Homework</h2>
        <p className="text-sm text-text-sub-light dark:text-text-sub-dark">
          {currentRole === 'Teacher' ? 'Manage, track, and grade your class assignments.' : 'Monitor assignment compliance and performance.'}
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Role Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button 
            onClick={() => { setCurrentRole('Teacher'); setView('list'); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${currentRole === 'Teacher' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}
          >
            Teacher
          </button>
          <button 
            onClick={() => { setCurrentRole('Admin'); setView('monitor'); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${currentRole === 'Admin' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}
          >
            Admin
          </button>
        </div>

        {currentRole === 'Teacher' && view === 'list' && (
           <button 
             onClick={() => setView('create')}
             className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm text-sm font-medium"
           >
             <span className="material-icons-outlined text-sm">add</span>
             Create Assignment
           </button>
        )}
      </div>
    </div>
  );

  const renderTeacherList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assignments.filter(a => a.teacher === 'Mrs. Verma').map(assignment => (
        <div key={assignment.id} onClick={() => { setSelectedAssignmentId(assignment.id); setView('grading'); }} className="group bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-1 h-full ${assignment.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <div className="flex justify-between items-start mb-3">
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${assignment.subject === 'Physics' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              {assignment.subject}
            </span>
            <span className={`text-[10px] font-bold ${assignment.status === 'Active' ? 'text-green-600' : 'text-gray-400'}`}>
              {assignment.status}
            </span>
          </div>
          <h3 className="font-bold text-text-main-light dark:text-text-main-dark mb-1 group-hover:text-primary transition-colors">{assignment.title}</h3>
          <p className="text-xs text-text-sub-light dark:text-text-sub-dark mb-4">{assignment.classId} • Due {assignment.dueDate}</p>
          
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
             <div className="text-center">
               <span className="block font-bold text-text-main-light dark:text-text-main-dark">{assignment.stats.submitted}</span>
               <span className="text-[10px]">Submitted</span>
             </div>
             <div className="h-6 w-px bg-gray-200 dark:border-gray-600"></div>
             <div className="text-center">
               <span className="block font-bold text-text-main-light dark:text-text-main-dark">{assignment.stats.graded}</span>
               <span className="text-[10px]">Graded</span>
             </div>
             <div className="h-6 w-px bg-gray-200 dark:border-gray-600"></div>
             <div className="text-center">
               <span className="block font-bold text-text-main-light dark:text-text-main-dark">{assignment.stats.total - assignment.stats.submitted}</span>
               <span className="text-[10px]">Missing</span>
             </div>
          </div>

          <div className="flex items-center gap-2">
            {!assignment.isGraded && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Practice</span>}
            {assignment.type === 'File Upload' && <span className="material-icons-outlined text-gray-400 text-sm">cloud_upload</span>}
            <span className="ml-auto text-xs font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Grade Now <span className="material-icons-outlined text-sm">arrow_forward</span>
            </span>
          </div>
        </div>
      ))}
      
      {/* Empty State / New Card */}
      <button onClick={() => setView('create')} className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all min-h-[200px]">
        <span className="material-icons-outlined text-4xl mb-2">post_add</span>
        <span className="font-medium">Create New Assignment</span>
      </button>
    </div>
  );

  const renderCreateForm = () => (
    <div className="max-w-3xl mx-auto bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
        <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">Create Assignment</h3>
        <div className="flex items-center gap-4">
            <span className={`text-xs font-medium transition-colors ${draftStatus === 'Saved' ? 'text-green-500' : 'text-orange-500'}`}>
                {draftStatus === 'Saving...' ? 'Auto-saving...' : draftStatus === 'Saved' ? 'Draft Saved' : ''}
            </span>
            <button onClick={() => setView('list')} className="text-gray-500 hover:text-gray-700"><span className="material-icons-outlined">close</span></button>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assignment Title</label>
             <input 
                type="text" 
                value={draftForm.title}
                onChange={(e) => handleCreateDraftChange('title', e.target.value)}
                placeholder="e.g. Chapter 4 Review Questions" 
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary" 
             />
          </div>
          
          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
             <select 
                value={draftForm.subject}
                onChange={(e) => handleCreateDraftChange('subject', e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none"
             >
               <option>Physics</option>
               <option>Mathematics</option>
               <option>English</option>
             </select>
          </div>
          
          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class & Section</label>
             <select 
                value={draftForm.classId}
                onChange={(e) => handleCreateDraftChange('classId', e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none"
             >
               <option>Class 10 - A</option>
               <option>Class 11 - B</option>
             </select>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
             <input 
                type="date" 
                value={draftForm.dueDate}
                onChange={(e) => handleCreateDraftChange('dueDate', e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary" 
             />
          </div>

          <div>
             <label className="block text-sm font-medium text-text-sub-light dark:text-text-sub-dark mb-1">Submission Type</label>
             <select 
                value={draftForm.type}
                onChange={(e) => handleCreateDraftChange('type', e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none"
             >
               <option>File Upload (PDF/Img)</option>
               <option>Online Text Entry</option>
               <option>Handwritten / Physical</option>
             </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
               <div>
                 <span className="block text-sm font-medium">Graded Assignment</span>
                 <span className="text-xs text-gray-500">Includes marks and gradebook entry</span>
               </div>
               <div className="relative inline-flex items-center cursor-pointer">
                 <input 
                    type="checkbox" 
                    checked={draftForm.isGraded}
                    onChange={(e) => handleCreateDraftChange('isGraded', e.target.checked)}
                    className="sr-only peer" 
                 />
                 <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
               </div>
            </label>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="flex-1">
                <label className="block text-sm font-medium text-text-sub-light dark:text-text-sub-dark mb-1">Max Marks</label>
                <input 
                    type="number" 
                    value={draftForm.maxMarks}
                    onChange={(e) => handleCreateDraftChange('maxMarks', Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none" 
                />
             </div>
             <button className="mt-6 flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors">
               <span className="material-icons-outlined text-sm">quiz</span>
               Question Bank
             </button>
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-text-sub-light dark:text-text-sub-dark mb-2">Instructions & Attachments</label>
           <textarea rows={4} placeholder="Detailed instructions for students..." className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none mb-2"></textarea>
           <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center text-gray-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <span className="material-icons-outlined">attach_file</span>
              <span className="text-sm ml-2">Click to attach reference files</span>
           </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
        <button onClick={() => setView('list')} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
        <button onClick={handleCreate} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm">Post Assignment</button>
      </div>
    </div>
  );

  const FeedbackEditor: React.FC<{ studentId: string }> = ({ studentId }) => {
    const sub = submissions.find(s => s.studentId === studentId);
    const [text, setText] = useState(sub?.feedback || '');
    const [attachments, setAttachments] = useState<string[]>(sub?.attachments || []);
    
    // Auto-save logic local to this modal could be added, but we'll save on blur/close or specific action
    // For now, let's just use the main save action
    const save = () => {
        handleGrade(studentId, { feedback: text, attachments });
        setFeedbackModalOpen(null);
    };

    const addAttachment = () => {
        const file = prompt("Enter mock file name:");
        if (file) setAttachments([...attachments, file]);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFeedbackModalOpen(null)}></div>
            <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-in-down">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-bold text-text-main-light dark:text-text-main-dark">Feedback: {sub?.name}</h3>
                    <button onClick={() => setFeedbackModalOpen(null)}><span className="material-icons-outlined text-gray-500">close</span></button>
                </div>
                
                <div className="p-4 space-y-4">
                    {/* Rich Text Toolbar */}
                    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <button className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-300 font-bold" title="Bold">B</button>
                        <button className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-300 italic" title="Italic">I</button>
                        <button className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-300 underline" title="Underline">U</button>
                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                        <button className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-300" title="Link">
                            <span className="material-icons-outlined text-sm">link</span>
                        </button>
                        <button onClick={addAttachment} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-300" title="Attach File">
                            <span className="material-icons-outlined text-sm">attach_file</span>
                        </button>
                    </div>

                    <textarea 
                        rows={6} 
                        value={text} 
                        onChange={(e) => setText(e.target.value)}
                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        placeholder="Write constructive feedback here..."
                    />

                    {/* Attachments List */}
                    {attachments.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-2">Attached Resources:</p>
                            <div className="flex flex-wrap gap-2">
                                {attachments.map((file, i) => (
                                    <div key={i} className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs border border-blue-100 dark:border-blue-800">
                                        <span className="material-icons-outlined text-sm">description</span>
                                        {file}
                                        <button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="ml-1 hover:text-red-500">
                                            <span className="material-icons-outlined text-sm">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800/50">
                    <button onClick={() => setFeedbackModalOpen(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
                    <button onClick={save} className="px-6 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm">Save Feedback</button>
                </div>
            </div>
        </div>
    );
  };

  const renderGradingView = () => {
    if (!selectedAssignment) return null;
    
    return (
      <div className="h-full flex flex-col animate-slide-in-right">
         {/* Grading Header */}
         <div className="flex items-center justify-between mb-4">
            <button onClick={() => setView('list')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary">
               <span className="material-icons-outlined text-sm">arrow_back</span> Back to List
            </button>
            <div className="flex gap-2">
               <span className={`flex items-center text-xs font-medium mr-2 transition-colors ${gradingStatus === 'Saved' ? 'text-green-600' : 'text-orange-500'}`}>
                   <span className="material-icons-outlined text-sm mr-1">{gradingStatus === 'Saved' ? 'cloud_done' : 'sync'}</span>
                   {gradingStatus === 'Saving...' ? 'Saving...' : 'All changes saved'}
               </span>
               <button className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50">
                  <span className="material-icons-outlined text-sm">notifications</span> Notify Missing
               </button>
               <button className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50">
                  <span className="material-icons-outlined text-sm">download</span> Export Grades
               </button>
            </div>
         </div>

         <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
               <div>
                  <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">{selectedAssignment.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                     <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Max Marks: {selectedAssignment.maxMarks}</span>
                     <span>Due: {selectedAssignment.dueDate}</span>
                     <span>Class: {selectedAssignment.classId}</span>
                  </div>
               </div>
               <div className="text-right">
                  <span className="block text-2xl font-bold text-primary">{submissions.filter(s => s.status === 'Graded').length}/{submissions.length}</span>
                  <span className="text-xs text-gray-500">Graded</span>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto">
               <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                     <tr>
                        <th className="px-6 py-3">Student</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Submitted File</th>
                        <th className="px-6 py-3">Marks</th>
                        <th className="px-6 py-3">Feedback</th>
                        <th className="px-6 py-3 text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                     {submissions.map(sub => (
                        <tr key={sub.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                           <td className="px-6 py-4 font-medium">
                              <div className="flex items-center gap-2">
                                 <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">{sub.rollNo}</span>
                                 {sub.name}
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                 ${sub.status === 'Graded' ? 'bg-green-100 text-green-700' : 
                                   sub.status === 'Submitted' ? 'bg-blue-100 text-blue-700' :
                                   sub.status === 'Late' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                 {sub.status}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                              {sub.status !== 'Missing' ? (
                                 <button className="flex items-center gap-1 text-blue-600 hover:underline">
                                    <span className="material-icons-outlined text-sm">description</span> View File
                                 </button>
                              ) : <span className="text-gray-400">-</span>}
                           </td>
                           <td className="px-6 py-4">
                              <input 
                                 type="number" 
                                 defaultValue={sub.marks} 
                                 placeholder="-"
                                 onBlur={(e) => handleGrade(sub.studentId, { marks: Number(e.target.value) })}
                                 className="w-16 p-1 border border-gray-300 dark:border-gray-600 rounded text-center"
                              />
                              <span className="text-gray-400 text-xs ml-1">/ {selectedAssignment.maxMarks}</span>
                           </td>
                           <td className="px-6 py-4">
                              <div 
                                onClick={() => setFeedbackModalOpen(sub.studentId)}
                                className="cursor-pointer group flex items-center justify-between border border-transparent hover:border-gray-300 dark:hover:border-gray-600 rounded px-2 py-1 -ml-2"
                              >
                                <div className="truncate max-w-[150px] text-gray-600 dark:text-gray-400">
                                    {sub.feedback ? sub.feedback : <span className="italic opacity-50">Add feedback...</span>}
                                </div>
                                <span className="material-icons-outlined text-sm opacity-0 group-hover:opacity-100 text-gray-400">edit</span>
                              </div>
                              {sub.attachments && sub.attachments.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                    {sub.attachments.map((a, i) => (
                                        <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded border border-blue-100 flex items-center gap-0.5">
                                            <span className="material-icons-outlined text-[10px]">attach_file</span>
                                            File
                                        </span>
                                    ))}
                                </div>
                              )}
                           </td>
                           <td className="px-6 py-4 text-right">
                              <button className="text-gray-400 hover:text-primary"><span className="material-icons-outlined">save</span></button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
         {feedbackModalOpen && <FeedbackEditor studentId={feedbackModalOpen} />}
      </div>
    );
  };

  const renderAdminMonitor = () => (
    <div className="space-y-6 animate-fade-in">
       {/* Overview Cards */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
             <p className="text-sm text-gray-500">Active Assignments</p>
             <h3 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">142</h3>
          </div>
          <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
             <p className="text-sm text-gray-500">Avg Submission Rate</p>
             <h3 className="text-2xl font-bold text-blue-600">89%</h3>
          </div>
          <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
             <p className="text-sm text-gray-500">Pending Grading</p>
             <h3 className="text-2xl font-bold text-orange-500">45</h3>
          </div>
          <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
             <p className="text-sm text-gray-500">Plagiarism Flags</p>
             <h3 className="text-2xl font-bold text-red-500">3</h3>
          </div>
       </div>

       {/* Teacher Grid */}
       <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
             <h3 className="font-bold text-text-main-light dark:text-text-main-dark">Teacher Performance Monitor</h3>
             <div className="flex gap-2">
                <select className="text-xs p-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-card-dark">
                   <option>All Classes</option>
                   <option>Class 10</option>
                   <option>Class 11</option>
                </select>
                <button className="text-xs flex items-center gap-1 px-2 py-1.5 bg-white dark:bg-card-dark border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50">
                   <span className="material-icons-outlined text-sm">filter_list</span> Filter
                </button>
             </div>
          </div>
          
          <table className="w-full text-sm text-left">
             <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                   <th className="px-6 py-3">Teacher</th>
                   <th className="px-6 py-3 text-center">Assignments Posted</th>
                   <th className="px-6 py-3 text-center">Submission Rate</th>
                   <th className="px-6 py-3 text-center">Grading Completion</th>
                   <th className="px-6 py-3 text-center">Overdue</th>
                   <th className="px-6 py-3 text-right">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {MOCK_TEACHER_STATS.map(stat => (
                   <tr key={stat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-6 py-4 font-medium text-text-main-light dark:text-text-main-dark">{stat.name}</td>
                      <td className="px-6 py-4 text-center">{stat.assignmentsPosted}</td>
                      <td className="px-6 py-4 text-center">
                         <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                               <div className="bg-blue-500 h-full" style={{ width: `${stat.submissionRate}%` }}></div>
                            </div>
                            <span className="text-xs">{stat.submissionRate}%</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                               <div className={`h-full ${stat.gradingCompletion < 50 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${stat.gradingCompletion}%` }}></div>
                            </div>
                            <span className="text-xs">{stat.gradingCompletion}%</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                         {stat.overdueCount > 0 ? (
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs font-bold">{stat.overdueCount}</span>
                         ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button className="text-primary hover:underline text-xs">View Details</button>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {renderHeader()}
      <div className="flex-1">
        {view === 'list' && renderTeacherList()}
        {view === 'create' && renderCreateForm()}
        {view === 'grading' && renderGradingView()}
        {view === 'monitor' && renderAdminMonitor()}
      </div>
    </div>
  );
};
