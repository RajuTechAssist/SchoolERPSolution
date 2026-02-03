import React, { useState } from 'react';

// --- Types ---
type UserRole = 'Teacher' | 'Admin';
type Difficulty = 'Easy' | 'Medium' | 'Hard';
type QuestionType = 'MCQ' | 'Short' | 'Long' | 'Problem';
type PaperStatus = 'Draft' | 'Finalized' | 'Archived';

interface Question {
  id: string;
  text: string;
  subject: string;
  chapter: string;
  difficulty: Difficulty;
  type: QuestionType;
  marks: number;
  usageCount: number;
  lastUsed?: string;
  status?: 'Approved' | 'Pending' | 'Rejected'; // For admin moderation
}

interface QuestionPaper {
  id: string;
  title: string;
  subject: string;
  classId: string;
  totalMarks: number;
  durationMins: number;
  questions: Question[];
  status: PaperStatus;
  version: number;
  isSecure: boolean; // Limits download access
  createdAt: string;
  createdBy: string;
}

interface ContributorStats {
  id: string;
  name: string;
  subject: string;
  questionsAdded: number;
  papersCreated: number;
  lastActive: string;
}

// --- Mock Data ---
const MOCK_QUESTIONS: Question[] = [
  { id: 'q1', text: 'Define Newton\'s Second Law of Motion.', subject: 'Physics', chapter: 'Force', difficulty: 'Easy', type: 'Short', marks: 2, usageCount: 5, status: 'Approved' },
  { id: 'q2', text: 'Calculate the force required to accelerate a 2kg mass at 5m/s².', subject: 'Physics', chapter: 'Force', difficulty: 'Medium', type: 'Problem', marks: 3, usageCount: 2, status: 'Approved' },
  { id: 'q3', text: 'Explain the process of photosynthesis with a diagram.', subject: 'Biology', chapter: 'Plant Life', difficulty: 'Medium', type: 'Long', marks: 5, usageCount: 1, status: 'Approved' },
  { id: 'q4', text: 'What is the chemical formula of Sulphuric Acid?', subject: 'Chemistry', chapter: 'Acids', difficulty: 'Easy', type: 'MCQ', marks: 1, usageCount: 10, status: 'Approved' },
  { id: 'q5', text: 'Solve for x: 2x² + 5x - 3 = 0', subject: 'Mathematics', chapter: 'Quadratics', difficulty: 'Hard', type: 'Problem', marks: 4, usageCount: 3, status: 'Approved' },
  { id: 'q6', text: 'Describe the impact of World War I on the global economy.', subject: 'History', chapter: 'The Great Wars', difficulty: 'Hard', type: 'Long', marks: 10, usageCount: 0, status: 'Pending' },
  { id: 'q7', text: 'Which of the following is a noble gas?', subject: 'Chemistry', chapter: 'Periodic Table', difficulty: 'Easy', type: 'MCQ', marks: 1, usageCount: 8, status: 'Approved' },
  { id: 'q8', text: 'Differentiate between speed and velocity.', subject: 'Physics', chapter: 'Motion', difficulty: 'Medium', type: 'Short', marks: 3, usageCount: 4, status: 'Approved' },
  { id: 'q9', text: 'Integrate x * sin(x) dx.', subject: 'Mathematics', chapter: 'Calculus', difficulty: 'Hard', type: 'Problem', marks: 5, usageCount: 2, status: 'Approved' },
  { id: 'q10', text: 'Why is the sky blue?', subject: 'Physics', chapter: 'Optics', difficulty: 'Easy', type: 'Short', marks: 2, usageCount: 6, status: 'Approved' },
  { id: 'q11', text: 'Explain the causes of the French Revolution.', subject: 'History', chapter: 'French Revolution', difficulty: 'Medium', type: 'Long', marks: 5, usageCount: 0, status: 'Pending' },
];

const MOCK_PAPERS: QuestionPaper[] = [
  { 
    id: 'p1', title: 'Physics Mid-Term 2024', subject: 'Physics', classId: 'Class 10', 
    totalMarks: 50, durationMins: 90, questions: [], status: 'Finalized', version: 2, isSecure: true, 
    createdAt: '2024-09-01', createdBy: 'Mrs. Verma' 
  },
  { 
    id: 'p2', title: 'Math Pop Quiz', subject: 'Mathematics', classId: 'Class 10', 
    totalMarks: 20, durationMins: 30, questions: [], status: 'Draft', version: 1, isSecure: false, 
    createdAt: '2024-09-15', createdBy: 'Mr. David' 
  },
];

const MOCK_CONTRIBUTORS: ContributorStats[] = [
  { id: 't1', name: 'Mrs. Verma', subject: 'Physics', questionsAdded: 145, papersCreated: 12, lastActive: '2 mins ago' },
  { id: 't2', name: 'Mr. David', subject: 'Mathematics', questionsAdded: 89, papersCreated: 5, lastActive: '1 hour ago' },
  { id: 't3', name: 'Ms. Curie', subject: 'Chemistry', questionsAdded: 210, papersCreated: 8, lastActive: 'Yesterday' },
  { id: 't4', name: 'Mr. Stone', subject: 'History', questionsAdded: 45, papersCreated: 2, lastActive: '3 days ago' },
];

export const QuestionBankManager: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('Teacher');
  const [activeTab, setActiveTab] = useState<'bank' | 'builder' | 'vault' | 'monitor'>('bank');
  
  // Bank State
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);
  const [filters, setFilters] = useState({ subject: 'All', type: 'All', difficulty: 'All' });
  const [searchQuery, setSearchQuery] = useState('');

  // Add Question Modal State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [newQuestionForm, setNewQuestionForm] = useState<Partial<Question>>({
    text: '',
    subject: 'Physics',
    chapter: '',
    difficulty: 'Easy',
    type: 'Short',
    marks: 1,
    status: 'Approved'
  });

  // Builder State
  const [builderMode, setBuilderMode] = useState<'Manual' | 'Blueprint'>('Manual');
  const [paperConfig, setPaperConfig] = useState({
    title: '',
    subject: 'Physics',
    totalMarks: 50,
    totalQuestions: 10,
    difficultyDist: { easy: 30, medium: 50, hard: 20 } // Percentages
  });
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);

  // Vault State
  const [papers, setPapers] = useState<QuestionPaper[]>(MOCK_PAPERS);

  // --- Helpers ---
  const getDifficultyColor = (d: Difficulty) => {
    switch(d) {
      case 'Easy': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'Medium': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'Hard': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) || q.chapter.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filters.subject === 'All' || q.subject === filters.subject;
    const matchesType = filters.type === 'All' || q.type === filters.type;
    const matchesDiff = filters.difficulty === 'All' || q.difficulty === filters.difficulty;
    return matchesSearch && matchesSubject && matchesType && matchesDiff;
  });

  // --- Actions ---
  
  const handleAddToPaper = (q: Question) => {
    if (!selectedQuestions.find(sq => sq.id === q.id)) {
      setSelectedQuestions([...selectedQuestions, q]);
    }
  };

  const handleRemoveFromPaper = (id: string) => {
    setSelectedQuestions(selectedQuestions.filter(q => q.id !== id));
  };

  const handleAutoGenerate = () => {
    // Logic to select questions based on Blueprint weights
    const { totalQuestions, difficultyDist, subject } = paperConfig;
    
    // Calculate how many questions of each type we need
    const easyCount = Math.round((difficultyDist.easy / 100) * totalQuestions);
    const mediumCount = Math.round((difficultyDist.medium / 100) * totalQuestions);
    // Assign remainder to hard to ensure total count matches
    const hardCount = totalQuestions - easyCount - mediumCount;

    const subjectQs = questions.filter(q => q.subject === subject && q.status === 'Approved');
    
    // Simple shuffle function
    const shuffle = (array: Question[]) => array.sort(() => 0.5 - Math.random());

    const easyQs = shuffle(subjectQs.filter(q => q.difficulty === 'Easy')).slice(0, easyCount);
    const mediumQs = shuffle(subjectQs.filter(q => q.difficulty === 'Medium')).slice(0, mediumCount);
    const hardQs = shuffle(subjectQs.filter(q => q.difficulty === 'Hard')).slice(0, hardCount);

    const newSelection = [...easyQs, ...mediumQs, ...hardQs];
    
    setSelectedQuestions(newSelection);
  };

  const handleSavePaper = () => {
    const newPaper: QuestionPaper = {
      id: Date.now().toString(),
      title: paperConfig.title || 'Untitled Paper',
      subject: paperConfig.subject,
      classId: 'Class 10',
      totalMarks: selectedQuestions.reduce((sum, q) => sum + q.marks, 0),
      durationMins: 60,
      questions: selectedQuestions,
      status: 'Draft',
      version: 1,
      isSecure: false,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'You'
    };
    setPapers([newPaper, ...papers]);
    setActiveTab('vault');
    // Reset
    setSelectedQuestions([]);
    setPaperConfig({ ...paperConfig, title: '' });
  };

  const handleSaveNewQuestion = () => {
    const newQ: Question = {
      id: Date.now().toString(),
      usageCount: 0,
      text: newQuestionForm.text || '',
      subject: newQuestionForm.subject || 'Physics',
      chapter: newQuestionForm.chapter || '',
      difficulty: newQuestionForm.difficulty || 'Easy',
      type: newQuestionForm.type || 'Short',
      marks: newQuestionForm.marks || 1,
      status: newQuestionForm.status || 'Pending'
    };
    setQuestions([newQ, ...questions]);
    setIsQuestionModalOpen(false);
    // Reset form
    setNewQuestionForm({
      text: '', subject: 'Physics', chapter: '', difficulty: 'Easy', type: 'Short', marks: 1, status: 'Approved'
    });
  };

  const handleApproveQuestion = (id: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, status: 'Approved' } : q));
  };

  const handleRejectQuestion = (id: string) => {
     // For this demo, we can set status to Rejected or delete it. Let's set to Rejected.
     setQuestions(questions.map(q => q.id === id ? { ...q, status: 'Rejected' } : q));
  };

  // --- Render Views ---

  const renderMonitor = () => {
    const pendingQuestions = questions.filter(q => q.status === 'Pending');

    return (
    <div className="space-y-6 animate-fade-in">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <p className="text-sm text-gray-500">Total Items</p>
                <h3 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">{questions.length}</h3>
                <p className="text-xs text-green-500">+12 this week</p>
            </div>
            <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <p className="text-sm text-gray-500">Papers Generated</p>
                <h3 className="text-2xl font-bold text-blue-600">{papers.length}</h3>
                <p className="text-xs text-blue-400">Total Archive</p>
            </div>
            <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <p className="text-sm text-gray-500">Active Contributors</p>
                <h3 className="text-2xl font-bold text-purple-600">{MOCK_CONTRIBUTORS.length}</h3>
                <p className="text-xs text-purple-400">Teachers</p>
            </div>
            <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <p className="text-sm text-gray-500">Pending Review</p>
                <h3 className="text-2xl font-bold text-orange-500">{pendingQuestions.length}</h3>
                <p className="text-xs text-orange-400">Action Required</p>
            </div>
        </div>

        {/* Pending Review Queue */}
        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-orange-50 dark:bg-orange-900/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="material-icons-outlined text-orange-600">rate_review</span>
                    <h3 className="font-bold text-orange-900 dark:text-orange-200">Pending Approvals Queue</h3>
                </div>
                <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-1 rounded-full">{pendingQuestions.length} Items</span>
             </div>
             
             <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {pendingQuestions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <span className="material-icons-outlined text-4xl mb-2 text-green-500">check_circle</span>
                        <p>All questions have been reviewed! Good job.</p>
                    </div>
                ) : (
                    pendingQuestions.map(q => (
                        <div key={q.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{q.subject}</span>
                                    <span className="text-xs text-gray-500">{q.chapter}</span>
                                    <span className={`text-[10px] px-1.5 rounded border ${
                                        q.difficulty === 'Easy' ? 'border-green-200 text-green-600' :
                                        q.difficulty === 'Medium' ? 'border-orange-200 text-orange-600' :
                                        'border-red-200 text-red-600'
                                    }`}>{q.difficulty}</span>
                                    <span className="text-xs text-gray-400">({q.type})</span>
                                </div>
                                <p className="text-sm font-medium text-text-main-light dark:text-text-main-dark">{q.text}</p>
                                <p className="text-xs text-gray-400 mt-1">Suggested Marks: {q.marks}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleRejectQuestion(q.id)}
                                    className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
                                >
                                    <span className="material-icons-outlined text-sm">close</span> Reject
                                </button>
                                <button 
                                    onClick={() => handleApproveQuestion(q.id)}
                                    className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors flex items-center gap-1 shadow-sm"
                                >
                                    <span className="material-icons-outlined text-sm">check</span> Approve
                                </button>
                            </div>
                        </div>
                    ))
                )}
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contributor Leaderboard */}
            <div className="lg:col-span-2 bg-card-light dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-bold text-text-main-light dark:text-text-main-dark">Teacher Contributions</h3>
                    <button className="text-xs text-primary hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3">Teacher</th>
                                <th className="px-6 py-3">Subject</th>
                                <th className="px-6 py-3 text-center">Questions</th>
                                <th className="px-6 py-3 text-center">Papers</th>
                                <th className="px-6 py-3 text-right">Last Active</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {MOCK_CONTRIBUTORS.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                    <td className="px-6 py-3 font-medium text-text-main-light dark:text-text-main-dark">{t.name}</td>
                                    <td className="px-6 py-3 text-gray-500">{t.subject}</td>
                                    <td className="px-6 py-3 text-center font-bold text-green-600">{t.questionsAdded}</td>
                                    <td className="px-6 py-3 text-center font-bold text-blue-600">{t.papersCreated}</td>
                                    <td className="px-6 py-3 text-right text-xs text-gray-400">{t.lastActive}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Analytics / Alerts */}
            <div className="bg-card-light dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
                <h3 className="font-bold text-text-main-light dark:text-text-main-dark mb-4">Usage Analytics</h3>
                
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Subject Distribution</span>
                            <span className="font-bold">Physics Leading</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full flex overflow-hidden">
                            <div className="w-[40%] bg-blue-500 h-full" title="Physics"></div>
                            <div className="w-[30%] bg-green-500 h-full" title="Chemistry"></div>
                            <div className="w-[20%] bg-red-500 h-full" title="Math"></div>
                            <div className="w-[10%] bg-yellow-500 h-full" title="Others"></div>
                        </div>
                        <div className="flex gap-2 mt-2 text-[10px] text-gray-500">
                             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Phy</span>
                             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div>Chem</span>
                             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>Math</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Most Used Questions</h4>
                        <div className="space-y-2">
                             {questions.sort((a,b) => b.usageCount - a.usageCount).slice(0,3).map((q, i) => (
                                 <div key={q.id} className="flex gap-2 items-start">
                                     <span className="font-bold text-xs text-gray-300">#{i+1}</span>
                                     <div className="flex-1">
                                         <p className="text-xs font-medium line-clamp-1">{q.text}</p>
                                         <p className="text-[10px] text-gray-500">Used {q.usageCount} times</p>
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )};

  const renderBank = () => (
    <div className="flex flex-col h-full space-y-4 animate-fade-in">
      {/* Filters */}
      <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[200px]">
           <span className="absolute inset-y-0 left-0 flex items-center pl-3">
             <span className="material-icons-outlined text-gray-400">search</span>
           </span>
           <input 
             type="text" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search questions by text or chapter..."
             className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-1 focus:ring-primary"
           />
        </div>
        <div className="flex gap-2">
           <select value={filters.subject} onChange={e => setFilters({...filters, subject: e.target.value})} className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-sm outline-none">
              <option value="All">All Subjects</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Mathematics</option>
           </select>
           <select value={filters.difficulty} onChange={e => setFilters({...filters, difficulty: e.target.value})} className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-sm outline-none">
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
           </select>
        </div>
        <button 
            onClick={() => setIsQuestionModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
        >
           <span className="material-icons-outlined text-sm">add</span> Add Question
        </button>
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-4">
         {filteredQuestions.filter(q => q.status !== 'Rejected').map(q => (
           <div key={q.id} className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group relative">
              <div className="flex justify-between items-start mb-2">
                 <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getDifficultyColor(q.difficulty)}`}>{q.difficulty}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500">{q.type}</span>
                    <span className="text-[10px] text-gray-400">Used {q.usageCount} times</span>
                    {q.status === 'Pending' && <span className="px-2 py-0.5 rounded text-[10px] bg-orange-100 text-orange-600 border border-orange-200">Pending Review</span>}
                 </div>
                 <div className="font-bold text-lg text-primary">{q.marks} <span className="text-[10px] font-normal text-gray-400">marks</span></div>
              </div>
              <p className="text-sm font-medium text-text-main-light dark:text-text-main-dark mb-3 pr-8">{q.text}</p>
              <div className="flex justify-between items-end">
                 <div className="text-xs text-text-sub-light dark:text-text-sub-dark">
                    <span className="font-semibold">{q.subject}</span> • {q.chapter}
                 </div>
                 <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500"><span className="material-icons-outlined text-lg">edit</span></button>
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500"><span className="material-icons-outlined text-lg">delete</span></button>
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );

  const renderBuilder = () => (
    <div className="flex flex-col md:flex-row h-full gap-4 animate-fade-in">
      {/* Left Panel: Controls & Bank */}
      <div className="w-full md:w-5/12 flex flex-col gap-4">
         <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
             <h3 className="font-bold text-text-main-light dark:text-text-main-dark mb-3">Paper Configuration</h3>
             <div className="space-y-3">
                 <input 
                    type="text" 
                    placeholder="Paper Title (e.g., Physics Unit 1)" 
                    value={paperConfig.title}
                    onChange={(e) => setPaperConfig({...paperConfig, title: e.target.value})}
                    className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none"
                 />
                 <div className="flex gap-2">
                    <select 
                        value={paperConfig.subject}
                        onChange={(e) => setPaperConfig({...paperConfig, subject: e.target.value})}
                        className="flex-1 p-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none"
                    >
                        <option>Physics</option>
                        <option>Mathematics</option>
                        <option>Chemistry</option>
                    </select>
                    <input 
                        type="number" 
                        placeholder="Marks" 
                        value={paperConfig.totalMarks}
                        onChange={(e) => setPaperConfig({...paperConfig, totalMarks: parseInt(e.target.value)})}
                        className="w-20 p-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none"
                    />
                 </div>
                 
                 {/* Builder Mode Toggle */}
                 <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button 
                        onClick={() => setBuilderMode('Manual')}
                        className={`flex-1 py-1.5 text-xs font-medium rounded ${builderMode === 'Manual' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}
                    >
                        Manual Selection
                    </button>
                    <button 
                        onClick={() => setBuilderMode('Blueprint')}
                        className={`flex-1 py-1.5 text-xs font-medium rounded ${builderMode === 'Blueprint' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}
                    >
                        Auto-Blueprint
                    </button>
                 </div>
                 
                 {/* Blueprint Controls */}
                 {builderMode === 'Blueprint' && (
                     <div className="pt-2 space-y-2 border-t border-gray-200 dark:border-gray-700">
                         <div className="flex items-center justify-between gap-2 mb-2">
                            <label className="text-xs text-gray-500 font-medium">Total Questions:</label>
                            <input 
                                type="number" 
                                value={paperConfig.totalQuestions}
                                onChange={(e) => setPaperConfig({...paperConfig, totalQuestions: parseInt(e.target.value)})}
                                className="w-16 p-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-center"
                            />
                         </div>
                         <div className="flex justify-between text-xs text-gray-500">
                            <span>Easy ({paperConfig.difficultyDist.easy}%)</span>
                            <span>Medium ({paperConfig.difficultyDist.medium}%)</span>
                            <span>Hard ({paperConfig.difficultyDist.hard}%)</span>
                         </div>
                         <div className="h-2 rounded-full flex overflow-hidden">
                             <div className="bg-green-400 h-full" style={{width: `${paperConfig.difficultyDist.easy}%`}}></div>
                             <div className="bg-orange-400 h-full" style={{width: `${paperConfig.difficultyDist.medium}%`}}></div>
                             <div className="bg-red-400 h-full" style={{width: `${paperConfig.difficultyDist.hard}%`}}></div>
                         </div>
                         <div className="flex justify-between text-[10px] text-gray-400">
                            <span>{Math.round(paperConfig.totalQuestions * (paperConfig.difficultyDist.easy/100))} Qs</span>
                            <span>{Math.round(paperConfig.totalQuestions * (paperConfig.difficultyDist.medium/100))} Qs</span>
                            <span>{Math.round(paperConfig.totalQuestions * (paperConfig.difficultyDist.hard/100))} Qs</span>
                         </div>
                         <button 
                            onClick={handleAutoGenerate}
                            className="w-full py-2 bg-indigo-50 text-indigo-600 text-sm rounded-lg hover:bg-indigo-100 border border-indigo-200 mt-2 flex items-center justify-center gap-2"
                         >
                            <span className="material-icons-outlined text-sm">auto_awesome</span> Generate Selection
                         </button>
                     </div>
                 )}
             </div>
         </div>

         {/* Source Bank (Manual Mode) */}
         {builderMode === 'Manual' && (
             <div className="flex-1 bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                 <h4 className="font-bold text-xs uppercase text-gray-500 mb-2">Available Questions</h4>
                 <div className="overflow-y-auto space-y-2 flex-1 pr-1">
                     {filteredQuestions.filter(q => q.subject === paperConfig.subject && q.status === 'Approved').map(q => (
                         <div key={q.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center group">
                             <div className="flex-1">
                                 <p className="text-xs font-medium line-clamp-2">{q.text}</p>
                                 <div className="flex gap-2 mt-1">
                                     <span className={`text-[9px] px-1 rounded ${getDifficultyColor(q.difficulty)}`}>{q.difficulty}</span>
                                     <span className="text-[9px] text-gray-500">{q.marks}m</span>
                                 </div>
                             </div>
                             <button 
                                onClick={() => handleAddToPaper(q)}
                                disabled={selectedQuestions.some(sq => sq.id === q.id)}
                                className="ml-2 p-1.5 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 text-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                 <span className="material-icons-outlined text-lg">add</span>
                             </button>
                         </div>
                     ))}
                 </div>
             </div>
         )}
      </div>

      {/* Right Panel: Paper Preview */}
      <div className="flex-1 bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col overflow-hidden">
          {/* Paper Header */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-center">
              <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-100">{paperConfig.title || 'Untitled Paper'}</h1>
              <div className="flex justify-center gap-8 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>Subject: {paperConfig.subject}</span>
                  <span>Time: 60 Mins</span>
                  <span>Max Marks: {paperConfig.totalMarks}</span>
              </div>
          </div>
          
          {/* Selected Questions List */}
          <div className="flex-1 p-8 overflow-y-auto bg-white dark:bg-card-dark">
              {selectedQuestions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-600">
                      <span className="material-icons-outlined text-6xl mb-2">description</span>
                      <p>No questions added yet.</p>
                      <p className="text-sm">Use the panel on the left to build your paper.</p>
                  </div>
              ) : (
                  <div className="space-y-6">
                      {selectedQuestions.map((q, idx) => (
                          <div key={idx} className="flex gap-4 group">
                              <span className="font-bold text-gray-700 dark:text-gray-300">{idx + 1}.</span>
                              <div className="flex-1">
                                  <p className="text-gray-800 dark:text-gray-200">{q.text}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                  <span className="font-bold text-sm text-gray-600 dark:text-gray-400">[{q.marks}]</span>
                                  <button onClick={() => handleRemoveFromPaper(q.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <span className="material-icons-outlined text-sm">remove_circle</span>
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>

          {/* Footer Stats & Save */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="text-sm">
                  <span className="text-gray-500">Current Total:</span>{' '}
                  <span className={`font-bold ${selectedQuestions.reduce((a,b)=>a+b.marks,0) > paperConfig.totalMarks ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                      {selectedQuestions.reduce((a,b)=>a+b.marks,0)} / {paperConfig.totalMarks}
                  </span>
                  <span className="ml-4 text-gray-500">Questions:</span>{' '}
                  <span className="font-bold">{selectedQuestions.length}</span>
              </div>
              <button 
                disabled={selectedQuestions.length === 0}
                onClick={handleSavePaper}
                className="px-6 py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                  <span className="material-icons-outlined">save</span> Save to Vault
              </button>
          </div>
      </div>
    </div>
  );

  const renderVault = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {papers.map(paper => (
                <div key={paper.id} className="bg-card-light dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm group">
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase 
                                ${paper.status === 'Finalized' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {paper.status}
                            </span>
                            {paper.isSecure && (
                                <span className="material-icons-outlined text-red-500" title="Secure Paper - Limited Access">lock</span>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-1">{paper.title}</h3>
                        <p className="text-sm text-text-sub-light dark:text-text-sub-dark mb-4">{paper.subject} • {paper.classId}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-3">
                            <span className="flex items-center gap-1">
                                <span className="material-icons-outlined text-sm">schedule</span> {paper.durationMins}m
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="material-icons-outlined text-sm">emoji_events</span> {paper.totalMarks} Marks
                            </span>
                            <span className="flex items-center gap-1 ml-auto">
                                v{paper.version}
                            </span>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-3 flex justify-between items-center">
                        <span className="text-xs text-gray-400">Created by {paper.createdBy}</span>
                        <div className="flex gap-2">
                            <button className="text-gray-500 hover:text-primary"><span className="material-icons-outlined">visibility</span></button>
                            <button className="text-gray-500 hover:text-primary"><span className="material-icons-outlined">print</span></button>
                            <button className="text-gray-500 hover:text-primary"><span className="material-icons-outlined">download</span></button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
         <div>
            <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Question Bank & Tests</h2>
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark">
                {currentRole === 'Admin' ? 'Monitor quality, usage, and teacher contributions.' : 'Manage item bank, generate papers, and secure archives.'}
            </p>
         </div>
         
         {/* Role Switcher */}
         <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button 
              onClick={() => { setCurrentRole('Teacher'); setActiveTab('bank'); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${currentRole === 'Teacher' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}
            >
              Teacher Tools
            </button>
            <button 
              onClick={() => { setCurrentRole('Admin'); setActiveTab('monitor'); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${currentRole === 'Admin' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}
            >
              Admin Monitor
            </button>
         </div>
      </div>

      {/* Conditional Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
         {currentRole === 'Teacher' && (
             <>
                <button onClick={() => setActiveTab('bank')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'bank' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                    <span className="material-icons-outlined text-lg">list_alt</span> Item Bank
                </button>
                <button onClick={() => setActiveTab('builder')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'builder' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                    <span className="material-icons-outlined text-lg">build</span> Test Builder
                </button>
                <button onClick={() => setActiveTab('vault')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'vault' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                    <span className="material-icons-outlined text-lg">lock</span> Secure Vault
                </button>
             </>
         )}
         {currentRole === 'Admin' && (
             <button onClick={() => setActiveTab('monitor')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'monitor' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                 <span className="material-icons-outlined text-lg">dashboard</span> Monitoring Dashboard
             </button>
         )}
      </div>

      <div className="flex-1 overflow-hidden relative">
         {activeTab === 'monitor' && renderMonitor()}
         {activeTab === 'bank' && renderBank()}
         {activeTab === 'builder' && renderBuilder()}
         {activeTab === 'vault' && renderVault()}
      </div>

      {/* Add Question Modal */}
      {isQuestionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsQuestionModalOpen(false)}></div>
              <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-in-down">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">Add New Question</h3>
                      <button onClick={() => setIsQuestionModalOpen(false)}><span className="material-icons-outlined text-gray-500">close</span></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Question Text</label>
                          <textarea 
                              rows={3} 
                              value={newQuestionForm.text}
                              onChange={(e) => setNewQuestionForm({...newQuestionForm, text: e.target.value})}
                              className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm"
                              placeholder="Enter the question here..."
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
                              <select 
                                  value={newQuestionForm.subject}
                                  onChange={(e) => setNewQuestionForm({...newQuestionForm, subject: e.target.value})}
                                  className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm"
                              >
                                  <option>Physics</option>
                                  <option>Chemistry</option>
                                  <option>Mathematics</option>
                                  <option>History</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Chapter/Topic</label>
                              <input 
                                  type="text" 
                                  value={newQuestionForm.chapter}
                                  onChange={(e) => setNewQuestionForm({...newQuestionForm, chapter: e.target.value})}
                                  className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm"
                                  placeholder="e.g. Force"
                              />
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Difficulty</label>
                              <select 
                                  value={newQuestionForm.difficulty}
                                  onChange={(e) => setNewQuestionForm({...newQuestionForm, difficulty: e.target.value as Difficulty})}
                                  className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm"
                              >
                                  <option>Easy</option>
                                  <option>Medium</option>
                                  <option>Hard</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                              <select 
                                  value={newQuestionForm.type}
                                  onChange={(e) => setNewQuestionForm({...newQuestionForm, type: e.target.value as QuestionType})}
                                  className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm"
                              >
                                  <option>Short</option>
                                  <option>MCQ</option>
                                  <option>Long</option>
                                  <option>Problem</option>
                              </select>
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Marks</label>
                              <input 
                                  type="number" 
                                  value={newQuestionForm.marks}
                                  onChange={(e) => setNewQuestionForm({...newQuestionForm, marks: parseInt(e.target.value)})}
                                  className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm"
                              />
                           </div>
                           <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Admin Status</label>
                              <select 
                                  value={newQuestionForm.status}
                                  onChange={(e) => setNewQuestionForm({...newQuestionForm, status: e.target.value as any})}
                                  className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm"
                              >
                                  <option value="Approved">Approved</option>
                                  <option value="Pending">Pending Review</option>
                              </select>
                           </div>
                      </div>
                  </div>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800/50">
                      <button onClick={() => setIsQuestionModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
                      <button onClick={handleSaveNewQuestion} className="px-6 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm">Save Question</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
