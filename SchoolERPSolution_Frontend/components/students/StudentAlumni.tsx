
import React, { useState } from 'react';

// --- Types ---
type AlumniStatus = 'Graduated' | 'Withdrawn' | 'Expelled' | 'Transfer';

interface Alumni {
  id: string;
  name: string;
  batchYear: string;
  lastClass: string;
  exitDate: string;
  status: AlumniStatus;
  finalGpa: string;
  contactEmail: string;
  phone: string;
  tags: string[]; // e.g. "Sports Captain", "Debate Team"
}

// --- Mock Data ---
const MOCK_ALUMNI: Alumni[] = [
  { 
    id: 'AL-2024-001', name: 'Rohan Mehta', batchYear: '2024', lastClass: 'Class 12 - Science', 
    exitDate: '2024-03-31', status: 'Graduated', finalGpa: '3.9', contactEmail: 'rohan.m@college.edu', 
    phone: '+91 98765 11111', tags: ['Valedictorian', 'Science Club'] 
  },
  { 
    id: 'AL-2024-002', name: 'Sarah Jenkins', batchYear: '2024', lastClass: 'Class 12 - Arts', 
    exitDate: '2024-03-31', status: 'Graduated', finalGpa: '3.7', contactEmail: 'sarah.j@uni.edu', 
    phone: '+91 98765 22222', tags: ['Student Council'] 
  },
  { 
    id: 'AL-2023-045', name: 'Vikram Singh', batchYear: '2023', lastClass: 'Class 10 - A', 
    exitDate: '2023-04-10', status: 'Transfer', finalGpa: '3.5', contactEmail: 'vikram.s@gmail.com', 
    phone: '+91 98765 33333', tags: [] 
  },
  { 
    id: 'AL-2022-012', name: 'Emily Blunt', batchYear: '2022', lastClass: 'Class 9 - B', 
    exitDate: '2022-11-15', status: 'Withdrawn', finalGpa: '3.0', contactEmail: 'emily.b@yahoo.com', 
    phone: '+91 98765 44444', tags: ['Medical Reason'] 
  },
];

export const StudentAlumni: React.FC = () => {
  const [alumniList, setAlumniList] = useState<Alumni[]>(MOCK_ALUMNI);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBatch, setFilterBatch] = useState('All');
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);
  
  // Bulk Archive State
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveTargetClass, setArchiveTargetClass] = useState('Class 12 - A');
  const [archiveYear, setArchiveYear] = useState('2024-2025');
  const [archiveCount, setArchiveCount] = useState(42); // Mock count

  // Reactivate State
  const [reactivateReason, setReactivateReason] = useState('');
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);

  // --- Logic ---

  const handleBulkArchive = () => {
    alert(`Successfully archived ${archiveCount} students from ${archiveTargetClass} to Alumni Batch ${archiveYear.split('-')[1]}. Records preserved.`);
    setIsArchiveModalOpen(false);
  };

  const handleReactivate = () => {
    if (!selectedAlumni || !reactivateReason) return;
    alert(`Student ${selectedAlumni.name} restored to Active status. Audit Log: "${reactivateReason}"`);
    setAlumniList(prev => prev.filter(a => a.id !== selectedAlumni.id));
    setIsReactivateModalOpen(false);
    setSelectedAlumni(null);
    setReactivateReason('');
  };

  const filteredList = alumniList.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBatch = filterBatch === 'All' || a.batchYear === filterBatch;
    return matchesSearch && matchesBatch;
  });

  // --- Renderers ---

  return (
    <div className="space-y-6 h-full flex flex-col relative animate-fade-in">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="md:col-span-3 flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div>
               <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Alumni Archive</h2>
               <p className="text-sm text-gray-500">Manage graduated, withdrawn, and transferred student records.</p>
            </div>
            <div className="flex gap-2">
               <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                  <span className="material-icons-outlined text-sm">download</span> Export List
               </button>
               <button 
                  onClick={() => setIsArchiveModalOpen(true)}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 shadow-sm flex items-center gap-2"
               >
                  <span className="material-icons-outlined text-sm">archive</span> Bulk Archive
               </button>
            </div>
         </div>
         <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center items-center">
            <span className="text-xs font-bold text-gray-500 uppercase">Total Alumni</span>
            <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">{alumniList.length}</span>
         </div>
      </div>

      {/* Filters & List */}
      <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 flex flex-col">
         <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center bg-gray-50 dark:bg-gray-800/50">
            <div className="relative flex-1 min-w-[200px]">
               <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <span className="material-icons-outlined text-lg">search</span>
               </span>
               <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search alumni by name or ID..."
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary"
               />
            </div>
            <select 
               value={filterBatch}
               onChange={(e) => setFilterBatch(e.target.value)}
               className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none"
            >
               <option value="All">All Batches</option>
               <option value="2024">Class of 2024</option>
               <option value="2023">Class of 2023</option>
               <option value="2022">Class of 2022</option>
            </select>
         </div>

         <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                  <tr>
                     <th className="px-6 py-3">Alumni Details</th>
                     <th className="px-6 py-3">Batch / Class</th>
                     <th className="px-6 py-3">Exit Info</th>
                     <th className="px-6 py-3">Status</th>
                     <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredList.map(alum => (
                     <tr key={alum.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                 {alum.name.charAt(0)}
                              </div>
                              <div>
                                 <p className="font-bold text-gray-800 dark:text-gray-200">{alum.name}</p>
                                 <p className="text-xs text-gray-500">{alum.contactEmail}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <p className="font-medium text-gray-700 dark:text-gray-300">Batch {alum.batchYear}</p>
                           <p className="text-xs text-gray-500">{alum.lastClass}</p>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-gray-600 dark:text-gray-400">{alum.exitDate}</p>
                           <p className="text-xs text-gray-500">Final GPA: {alum.finalGpa}</p>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                              alum.status === 'Graduated' ? 'bg-green-50 border-green-200 text-green-700' :
                              alum.status === 'Withdrawn' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                              'bg-red-50 border-red-200 text-red-700'
                           }`}>
                              {alum.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button 
                              onClick={() => setSelectedAlumni(alum)}
                              className="text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                           >
                              Profile
                           </button>
                        </td>
                     </tr>
                  ))}
                  {filteredList.length === 0 && (
                     <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No alumni records found.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Profile Slide-Over */}
      {selectedAlumni && (
         <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedAlumni(null)}></div>
            <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white dark:bg-card-dark shadow-2xl flex flex-col animate-slide-in-right">
               {/* Header */}
               <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-start">
                  <div>
                     <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">{selectedAlumni.name}</h2>
                     <p className="text-sm text-gray-500">Alumni ID: {selectedAlumni.id}</p>
                  </div>
                  <button onClick={() => setSelectedAlumni(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500">
                     <span className="material-icons-outlined">close</span>
                  </button>
               </div>

               {/* Content */}
               <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Status Banner */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-300 uppercase">Current Status</span>
                        <span className="text-sm font-bold text-blue-800 dark:text-blue-200">{selectedAlumni.status}</span>
                     </div>
                     <p className="text-xs text-blue-700 dark:text-blue-300">
                        Left on {selectedAlumni.exitDate} from {selectedAlumni.lastClass}.
                     </p>
                  </div>

                  {/* Academic Snapshot */}
                  <div>
                     <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Academic Snapshot</h4>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                           <span className="block text-xs text-gray-500">Final GPA</span>
                           <span className="text-lg font-bold text-gray-800 dark:text-gray-200">{selectedAlumni.finalGpa}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                           <span className="block text-xs text-gray-500">Batch</span>
                           <span className="text-lg font-bold text-gray-800 dark:text-gray-200">{selectedAlumni.batchYear}</span>
                        </div>
                     </div>
                  </div>

                  {/* Tags */}
                  <div>
                     <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Tags & Achievements</h4>
                     <div className="flex flex-wrap gap-2">
                        {selectedAlumni.tags.length > 0 ? selectedAlumni.tags.map((tag, i) => (
                           <span key={i} className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded-full border border-purple-100 dark:border-purple-800">
                              {tag}
                           </span>
                        )) : <span className="text-xs text-gray-400 italic">No tags recorded.</span>}
                        <button className="px-2 py-1 text-xs text-gray-400 border border-dashed border-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800">+</button>
                     </div>
                  </div>

                  {/* Contact */}
                  <div>
                     <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Last Known Contact</h4>
                     <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p className="flex items-center gap-2"><span className="material-icons-outlined text-sm">email</span> {selectedAlumni.contactEmail}</p>
                        <p className="flex items-center gap-2"><span className="material-icons-outlined text-sm">phone</span> {selectedAlumni.phone}</p>
                     </div>
                  </div>
               </div>

               {/* Footer Action: Restore */}
               <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <button 
                     onClick={() => setIsReactivateModalOpen(true)}
                     className="w-full py-2 bg-white dark:bg-card-dark border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                     <span className="material-icons-outlined text-sm">restore_page</span> Re-activate Student Profile
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Bulk Archive Modal */}
      {isArchiveModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsArchiveModalOpen(false)}></div>
            <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-lg p-6 animate-slide-in-down">
               <div className="flex items-center gap-3 mb-4 text-orange-600">
                  <span className="material-icons-outlined text-3xl">archive</span>
                  <h3 className="font-bold text-xl text-gray-800 dark:text-white">Bulk Archive Students</h3>
               </div>
               
               <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                  Archive <strong>{archiveCount}</strong> students from <strong>{archiveTargetClass}</strong> (Session {archiveYear}) to Alumni? 
                  <br/><br/>
                  This removes them from active roll lists but preserves records for reporting and potential re-activation.
               </p>

               <div className="space-y-4 mb-6">
                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Cohort</label>
                     <select 
                        value={archiveTargetClass}
                        onChange={(e) => setArchiveTargetClass(e.target.value)}
                        className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none"
                     >
                        <option>Class 12 - A</option>
                        <option>Class 12 - B</option>
                        <option>Class 10 - C (Early Exit)</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Set Status</label>
                     <select className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none">
                        <option>Graduated</option>
                        <option>Completed</option>
                     </select>
                  </div>
               </div>

               <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button onClick={() => setIsArchiveModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm">Cancel</button>
                  <button onClick={handleBulkArchive} className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 shadow-sm text-sm font-bold">Confirm Archive</button>
               </div>
            </div>
         </div>
      )}

      {/* Reactivate Modal */}
      {isReactivateModalOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsReactivateModalOpen(false)}></div>
            <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-md p-6 animate-zoom-in">
               <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">Confirm Restoration</h3>
               <p className="text-sm text-gray-500 mb-4">
                  You are about to move <strong>{selectedAlumni?.name}</strong> back to the Active Students list.
               </p>
               
               <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reason for Reactivation (Audit Log)</label>
                  <textarea 
                     rows={3}
                     value={reactivateReason}
                     onChange={(e) => setReactivateReason(e.target.value)}
                     className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary outline-none"
                     placeholder="e.g. Student re-enrolled for supplementary course..."
                  ></textarea>
               </div>

               <div className="flex justify-end gap-3">
                  <button onClick={() => setIsReactivateModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
                  <button 
                     onClick={handleReactivate}
                     disabled={!reactivateReason}
                     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm text-sm font-medium disabled:opacity-50"
                  >
                     Confirm Restore
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
