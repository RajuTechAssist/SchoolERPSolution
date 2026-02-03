
import React, { useState } from 'react';

interface Student {
  id: string;
  name: string;
  class: string;
  section: string;
  parent: string;
  phone: string;
  status: 'Active' | 'Inactive';
  docsComplete: boolean;
  medicalAlert: boolean;
}

const MOCK_STUDENTS: Student[] = [
  { id: 'STU2025-001', name: 'Aarav Patel', class: '1', section: 'A', parent: 'Suresh Patel', phone: '+91 9876543210', status: 'Active', docsComplete: true, medicalAlert: false },
  { id: 'STU2025-002', name: 'Zara Khan', class: '5', section: 'B', parent: 'Farhan Khan', phone: '+91 9988776655', status: 'Active', docsComplete: false, medicalAlert: true },
  { id: 'STU2025-003', name: 'Ishaan Gupta', class: '9', section: 'A', parent: 'Meera Gupta', phone: '+91 9123456789', status: 'Active', docsComplete: true, medicalAlert: false },
  { id: 'STU2025-004', name: 'Rohan Das', class: '10', section: 'C', parent: 'Amit Das', phone: '+91 8877665544', status: 'Inactive', docsComplete: true, medicalAlert: false },
  { id: 'STU2025-005', name: 'Sanya Mirza', class: '2', section: 'A', parent: 'Imran Mirza', phone: '+91 7766554433', status: 'Active', docsComplete: false, medicalAlert: false },
];

export const StudentDirectory: React.FC<{ onSelectStudent: (id: string) => void }> = ({ onSelectStudent }) => {
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  
  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ fullName: '', dob: '', class: 'Class 1' });

  const filtered = MOCK_STUDENTS.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
    const matchesClass = filterClass === 'All' || s.class === filterClass;
    return matchesSearch && matchesClass;
  });

  const handleCreateSubmit = () => {
    if(!newStudent.fullName || !newStudent.dob) return alert("Please fill details");
    setIsConfirmOpen(true);
  };

  const confirmCreate = () => {
    setIsConfirmOpen(false);
    setIsCreateOpen(false);
    alert("Student record created successfully!");
    setNewStudent({ fullName: '', dob: '', class: 'Class 1' });
  };

  return (
    <div className="space-y-4 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
         <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
               <span className="material-icons-outlined absolute left-3 top-2.5 text-gray-400 text-sm">search</span>
               <input 
                 type="text" 
                 placeholder="Search student..." 
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary"
               />
            </div>
            <select 
               value={filterClass}
               onChange={e => setFilterClass(e.target.value)}
               className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none"
            >
               <option value="All">All Classes</option>
               <option value="1">Class 1</option>
               <option value="5">Class 5</option>
               <option value="9">Class 9</option>
               <option value="10">Class 10</option>
            </select>
         </div>
         <div className="flex gap-2">
            <button 
               onClick={() => setIsCreateOpen(true)}
               className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 flex items-center gap-2 shadow-sm"
            >
               <span className="material-icons-outlined text-sm">add</span> Add Student
            </button>
            <button className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 flex items-center gap-1">
               <span className="material-icons-outlined text-sm">download</span> Export
            </button>
         </div>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
         <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
               <tr>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Class/Sec</th>
                  <th className="px-6 py-3">Parent Info</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-center">Docs</th>
                  <th className="px-6 py-3 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
               {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                              {s.name.charAt(0)}
                           </div>
                           <div>
                              <p className="font-bold text-gray-800 dark:text-gray-200">{s.name}</p>
                              <p className="text-xs text-gray-500">{s.id}</p>
                           </div>
                           {s.medicalAlert && <span className="material-icons-outlined text-red-500 text-sm" title="Medical Alert">medical_services</span>}
                        </div>
                     </td>
                     <td className="px-6 py-4 font-mono text-xs">{s.class}-{s.section}</td>
                     <td className="px-6 py-4">
                        <p className="text-gray-800 dark:text-gray-300">{s.parent}</p>
                        <p className="text-xs text-gray-500">{s.phone}</p>
                     </td>
                     <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                           {s.status}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-center">
                        {s.docsComplete ? (
                           <span className="text-green-500 material-icons-outlined text-sm">check_circle</span>
                        ) : (
                           <span className="text-orange-500 material-icons-outlined text-sm" title="Pending Docs">pending</span>
                        )}
                     </td>
                     <td className="px-6 py-4 text-right">
                        <button 
                           onClick={() => onSelectStudent(s.id)}
                           className="text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                        >
                           View Profile
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)}></div>
            <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-md p-6 animate-slide-in-down">
               <h3 className="font-bold text-lg mb-4 text-text-main-light dark:text-text-main-dark">New Student Record</h3>
               
               <div className="space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                     <input type="text" value={newStudent.fullName} onChange={e => setNewStudent({...newStudent, fullName: e.target.value})} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-600 outline-none" />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1">Date of Birth</label>
                     <input type="date" value={newStudent.dob} onChange={e => setNewStudent({...newStudent, dob: e.target.value})} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-600 outline-none" />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1">Class</label>
                     <select value={newStudent.class} onChange={e => setNewStudent({...newStudent, class: e.target.value})} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-600 outline-none">
                        <option>Class 1</option><option>Class 5</option><option>Class 10</option>
                     </select>
                  </div>
               </div>

               <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm">Cancel</button>
                  <button onClick={handleCreateSubmit} className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-600 text-sm font-medium">Create Record</button>
               </div>
            </div>
         </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-sm p-6 animate-zoom-in">
               <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">Confirm Creation</h3>
               <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                  Create student record for <strong>{newStudent.fullName}</strong> (DOB: {newStudent.dob})?
                  <br/><br/>
                  This will create an official student ID and create parent portal credentials. Proceed?
               </p>
               <div className="flex justify-end gap-3">
                  <button onClick={() => setIsConfirmOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm">Cancel</button>
                  <button onClick={confirmCreate} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium">Yes, Proceed</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
