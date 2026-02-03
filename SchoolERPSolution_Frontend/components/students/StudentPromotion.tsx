
import React, { useState, useMemo } from 'react';

// --- Types ---
type PromotionStatus = 'Eligible' | 'Retained' | 'Conditional' | 'Transfer';
type ResultStatus = 'Pass' | 'Fail' | 'Withheld';

interface StudentPromotionRecord {
  id: string;
  name: string;
  currentRoll: number;
  attendance: number; // Percentage
  academicScore: number; // Percentage or GPA
  result: ResultStatus;
  status: PromotionStatus;
  overrideReason?: string;
  overrideBy?: string;
  newRoll?: number;
  newSection?: string;
  isSelected: boolean; // For bulk action
}

interface ClassCapacity {
  id: string;
  name: string;
  capacity: number;
  enrolled: number;
}

// --- Mock Data ---
const MOCK_STUDENTS: StudentPromotionRecord[] = [
  { id: 'S1', name: 'Aarav Patel', currentRoll: 1, attendance: 92, academicScore: 85, result: 'Pass', status: 'Eligible', isSelected: true },
  { id: 'S2', name: 'Bianca Ross', currentRoll: 2, attendance: 88, academicScore: 78, result: 'Pass', status: 'Eligible', isSelected: true },
  { id: 'S3', name: 'Charles Dunn', currentRoll: 3, attendance: 65, academicScore: 45, result: 'Fail', status: 'Retained', isSelected: false },
  { id: 'S4', name: 'Diana Prince', currentRoll: 4, attendance: 95, academicScore: 92, result: 'Pass', status: 'Eligible', isSelected: true },
  { id: 'S5', name: 'Evan Wright', currentRoll: 5, attendance: 72, academicScore: 55, result: 'Pass', status: 'Retained', isSelected: false }, // Low attendance
  { id: 'S6', name: 'Fiona Gallagher', currentRoll: 6, attendance: 80, academicScore: 32, result: 'Fail', status: 'Retained', isSelected: false },
  { id: 'S7', name: 'George Martin', currentRoll: 7, attendance: 85, academicScore: 60, result: 'Pass', status: 'Eligible', isSelected: true },
];

const MOCK_CAPACITY: Record<string, ClassCapacity> = {
  'Class 6 - A': { id: 'c6a', name: 'Class 6 - A', capacity: 35, enrolled: 0 },
  'Class 6 - B': { id: 'c6b', name: 'Class 6 - B', capacity: 35, enrolled: 12 },
  'Alumni': { id: 'alum', name: 'Graduated / Alumni', capacity: 9999, enrolled: 500 },
};

export const StudentPromotion: React.FC = () => {
  // --- State ---
  const [step, setStep] = useState<1 | 2>(1);
  const [sourceClass, setSourceClass] = useState('Class 5 - A');
  const [targetClass, setTargetClass] = useState('Class 6 - A');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [nextAcademicYear, setNextAcademicYear] = useState('2025-2026');
  
  const [students, setStudents] = useState<StudentPromotionRecord[]>(MOCK_STUDENTS);
  const [overrideModalOpen, setOverrideModalOpen] = useState<string | null>(null); // Student ID
  const [overrideReason, setOverrideReason] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // --- Logic ---
  const targetCapacity = MOCK_CAPACITY[targetClass] || { capacity: 0, enrolled: 0 };
  const selectedCount = students.filter(s => s.isSelected).length;
  const projectedEnrolment = targetCapacity.enrolled + selectedCount;
  const isOverCapacity = projectedEnrolment > targetCapacity.capacity;

  const handleOverride = (id: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: 'Conditional',
          isSelected: true,
          overrideReason: overrideReason,
          overrideBy: 'Principal Anderson' // Mock Logged in User
        };
      }
      return s;
    }));
    setOverrideModalOpen(null);
    setOverrideReason('');
  };

  const toggleSelection = (id: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, isSelected: !s.isSelected } : s));
  };

  const handleBulkSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setStudents(prev => prev.map(s => s.status !== 'Retained' ? { ...s, isSelected: checked } : s));
  };

  const handlePromote = () => {
    alert(`Successfully promoted ${selectedCount} students to ${targetClass}. Records updated.`);
    setConfirmModalOpen(false);
    // Reset or redirect logic here
  };

  // --- Renderers ---

  const renderConfig = () => (
    <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm animate-fade-in">
        <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-6">Promotion Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative">
            {/* Source */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <span className="text-xs font-bold text-gray-500 uppercase mb-2 block">Source Cohort (Current)</span>
                <div className="space-y-3">
                    <select 
                        value={academicYear}
                        onChange={e => setAcademicYear(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-card-dark outline-none"
                    >
                        <option>2024-2025</option>
                    </select>
                    <select 
                        value={sourceClass}
                        onChange={e => setSourceClass(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-card-dark outline-none"
                    >
                        <option>Class 5 - A</option>
                        <option>Class 5 - B</option>
                        <option>Class 9 - C</option>
                        <option>Class 12 - A</option>
                    </select>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>Total Students:</span>
                    <span className="font-bold">{students.length}</span>
                </div>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center justify-center text-gray-400">
                <span className="material-icons-outlined text-4xl animate-pulse">double_arrow</span>
                <span className="text-xs font-bold uppercase mt-1">Promote To</span>
            </div>

            {/* Target */}
            <div className={`p-4 rounded-xl border transition-colors ${isOverCapacity ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'}`}>
                <span className={`text-xs font-bold uppercase mb-2 block ${isOverCapacity ? 'text-red-600' : 'text-blue-600'}`}>Target Class (Next Session)</span>
                <div className="space-y-3">
                    <select 
                        value={nextAcademicYear}
                        onChange={e => setNextAcademicYear(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-card-dark outline-none"
                    >
                        <option>2025-2026</option>
                    </select>
                    <select 
                        value={targetClass}
                        onChange={e => setTargetClass(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-card-dark outline-none"
                    >
                        <option>Class 6 - A</option>
                        <option>Class 6 - B</option>
                        <option>Alumni</option>
                    </select>
                </div>
                
                {/* Capacity Bar */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                        <span className={isOverCapacity ? 'text-red-600 font-bold' : 'text-blue-600'}>
                            {targetClass === 'Alumni' ? 'Unlimited' : `${projectedEnrolment} / ${targetCapacity.capacity}`}
                        </span>
                        <span className="text-gray-500">Projected Fill</span>
                    </div>
                    {targetClass !== 'Alumni' && (
                        <div className="w-full bg-white dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${isOverCapacity ? 'bg-red-500' : 'bg-blue-500'}`} 
                                style={{ width: `${Math.min((projectedEnrolment / targetCapacity.capacity) * 100, 100)}%` }}
                            ></div>
                        </div>
                    )}
                    {isOverCapacity && <p className="text-[10px] text-red-500 mt-1 font-bold">Warning: Capacity Exceeded!</p>}
                </div>
            </div>
        </div>
    </div>
  );

  const renderTable = () => (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-fade-in">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h3 className="font-bold text-gray-800 dark:text-gray-100">Review Eligibility</h3>
            <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Eligible</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Retained</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Conditional</div>
            </div>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase text-gray-500 font-bold">
                    <tr>
                        <th className="px-4 py-3 w-10">
                            <input type="checkbox" className="rounded text-primary focus:ring-primary" onChange={handleBulkSelect} checked={students.every(s => s.status === 'Retained' || s.isSelected) && students.some(s => s.isSelected)} />
                        </th>
                        <th className="px-4 py-3">Roll</th>
                        <th className="px-4 py-3">Student Name</th>
                        <th className="px-4 py-3 text-center">Attendance</th>
                        <th className="px-4 py-3 text-center">Result</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Proposed Action</th>
                        <th className="px-4 py-3 text-right">Overrides</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {students.map(student => (
                        <tr key={student.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${!student.isSelected ? 'opacity-60 bg-gray-50/50 dark:bg-gray-900/20' : ''}`}>
                            <td className="px-4 py-3">
                                <input 
                                    type="checkbox" 
                                    checked={student.isSelected} 
                                    onChange={() => toggleSelection(student.id)}
                                    className="rounded text-primary focus:ring-primary"
                                />
                            </td>
                            <td className="px-4 py-3 font-mono text-xs">{student.currentRoll}</td>
                            <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{student.name}</td>
                            <td className="px-4 py-3 text-center">
                                <span className={`font-bold ${student.attendance < 75 ? 'text-red-500' : 'text-green-600'}`}>{student.attendance}%</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${student.result === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {student.result}
                                </span>
                                <div className="text-[10px] text-gray-400 mt-0.5">{student.academicScore}% Avg</div>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit
                                    ${student.status === 'Eligible' ? 'bg-green-50 text-green-700 border-green-200' : 
                                      student.status === 'Retained' ? 'bg-red-50 text-red-700 border-red-200' : 
                                      'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                    {student.status === 'Conditional' && <span className="material-icons-outlined text-[10px]">info</span>}
                                    {student.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">
                                {student.isSelected ? `Promote to ${targetClass}` : 'Retain in Current Class'}
                            </td>
                            <td className="px-4 py-3 text-right">
                                {student.status === 'Retained' ? (
                                    <button 
                                        onClick={() => setOverrideModalOpen(student.id)}
                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors border border-blue-100"
                                    >
                                        Override
                                    </button>
                                ) : student.status === 'Conditional' ? (
                                    <div className="text-[10px] text-gray-400 italic" title={student.overrideReason}>
                                        Overridden by {student.overrideBy?.split(' ')[0]}
                                    </div>
                                ) : (
                                    <span className="text-gray-300">-</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-full flex flex-col relative pb-20">
      
      {renderConfig()}
      {renderTable()}

      {/* Action Footer */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white dark:bg-card-dark border-t border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-lg z-10 px-8">
         <div className="text-sm">
            <span className="text-gray-500">Summary:</span> <strong className="text-green-600">{selectedCount} Promoting</strong>, <strong className="text-red-500">{students.length - selectedCount} Retained</strong>
         </div>
         <button 
            onClick={() => setConfirmModalOpen(true)}
            disabled={isOverCapacity && targetClass !== 'Alumni'}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-md font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
         >
            <span className="material-icons-outlined">upgrade</span>
            Execute Promotion
         </button>
      </div>

      {/* Override Modal */}
      {overrideModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOverrideModalOpen(null)}></div>
              <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-md p-6 animate-slide-in-down">
                  <h3 className="font-bold text-lg mb-2 text-text-main-light dark:text-text-main-dark">Override Promotion Rule</h3>
                  <p className="text-sm text-gray-500 mb-4">
                      You are manually promoting <strong>{students.find(s => s.id === overrideModalOpen)?.name}</strong> despite ineligibility.
                  </p>
                  
                  <div className="mb-4">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Required Justification</label>
                      <textarea 
                          rows={3}
                          value={overrideReason}
                          onChange={(e) => setOverrideReason(e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary outline-none"
                          placeholder="e.g. Medical grounds, Principal approval..."
                      ></textarea>
                  </div>

                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 rounded-lg text-xs text-yellow-800 dark:text-yellow-200 mb-4">
                      <strong>Note:</strong> This action will be logged in the audit trail under your ID.
                  </div>

                  <div className="flex justify-end gap-2">
                      <button onClick={() => setOverrideModalOpen(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm">Cancel</button>
                      <button 
                        onClick={() => handleOverride(overrideModalOpen)} 
                        disabled={!overrideReason}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 shadow-sm text-sm disabled:opacity-50"
                      >
                          Confirm Override
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Confirmation Modal */}
      {confirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmModalOpen(false)}></div>
              <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-in-down">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                      <div className="flex items-center gap-3 text-blue-800 dark:text-blue-300 mb-2">
                          <span className="material-icons-outlined text-2xl">published_with_changes</span>
                          <h3 className="font-bold text-xl">Confirm Bulk Promotion</h3>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-200 opacity-90">
                          This action will move <strong>{selectedCount} students</strong> from {sourceClass} to {targetClass}.
                      </p>
                  </div>
                  
                  <div className="p-6 space-y-4">
                      <h4 className="font-bold text-sm text-gray-500 uppercase">System Side-Effects</h4>
                      <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                          <li className="flex gap-2">
                              <span className="material-icons-outlined text-gray-400 text-sm mt-0.5">badge</span>
                              <span>Class & Section fields will be updated for selected students.</span>
                          </li>
                          <li className="flex gap-2">
                              <span className="material-icons-outlined text-gray-400 text-sm mt-0.5">receipt_long</span>
                              <span>New Fee Structure for {nextAcademicYear} will be applied.</span>
                          </li>
                          <li className="flex gap-2">
                              <span className="material-icons-outlined text-gray-400 text-sm mt-0.5">history</span>
                              <span>Current academic records will be archived under {academicYear}.</span>
                          </li>
                          <li className="flex gap-2">
                              <span className="material-icons-outlined text-gray-400 text-sm mt-0.5">mail</span>
                              <span>Promotion letters will be generated and emailed to parents.</span>
                          </li>
                      </ul>

                      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg text-xs text-red-600 dark:text-red-300 mt-4">
                          <input type="checkbox" id="confirm_check" className="rounded text-red-600 focus:ring-red-500" />
                          <label htmlFor="confirm_check" className="font-bold cursor-pointer">I understand this action cannot be easily undone.</label>
                      </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                      <button onClick={() => setConfirmModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm">Cancel</button>
                      <button onClick={handlePromote} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md text-sm font-bold flex items-center gap-2">
                          <span className="material-icons-outlined text-sm">bolt</span> Execute
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
