
import React, { useState } from 'react';

interface StudentContact {
  id: string;
  name: string;
  rollNo: string;
  class: string;
  attendance: number; // percentage
  gpa: string;
  contact: string;
  parentName: string;
  parentContact: string;
  status: 'Active' | 'Inactive';
}

// Mock Data
const MOCK_STUDENTS: StudentContact[] = [
  { id: 's1', name: 'Adrian Miller', rollNo: '001', class: '10-A', attendance: 92, gpa: '3.8', contact: 'adrian.m@school.edu', parentName: 'David Miller', parentContact: '+1 555-0101', status: 'Active' },
  { id: 's2', name: 'Bianca Ross', rollNo: '002', class: '10-A', attendance: 85, gpa: '3.5', contact: 'bianca.r@school.edu', parentName: 'Maria Ross', parentContact: '+1 555-0102', status: 'Active' },
  { id: 's3', name: 'Charles Dunn', rollNo: '003', class: '10-A', attendance: 65, gpa: '2.4', contact: 'charles.d@school.edu', parentName: 'Peter Dunn', parentContact: '+1 555-0103', status: 'Active' },
  { id: 's4', name: 'Diana Prince', rollNo: '004', class: '10-B', attendance: 98, gpa: '4.0', contact: 'diana.p@school.edu', parentName: 'Hippolyta Prince', parentContact: '+1 555-0104', status: 'Active' },
  { id: 's5', name: 'Evan Wright', rollNo: '005', class: '10-B', attendance: 78, gpa: '3.1', contact: 'evan.w@school.edu', parentName: 'John Wright', parentContact: '+1 555-0105', status: 'Active' },
];

export const StudentDirectory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  
  // Message Modal State
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageTarget, setMessageTarget] = useState<{name: string, contact: string, type: 'Student' | 'Parent'} | null>(null);
  const [messageBody, setMessageBody] = useState('');

  const filteredStudents = MOCK_STUDENTS.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.rollNo.includes(searchQuery) ||
                          s.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === 'All' || s.class === classFilter;
    return matchesSearch && matchesClass;
  });

  const handleOpenMessage = (student: StudentContact, type: 'Student' | 'Parent') => {
    setMessageTarget({
        name: type === 'Student' ? student.name : student.parentName,
        contact: type === 'Student' ? student.contact : student.parentContact,
        type
    });
    setMessageBody('');
    setIsMessageModalOpen(true);
  };

  const handleSendMessage = () => {
    alert(`Message sent to ${messageTarget?.name} (${messageTarget?.contact}): ${messageBody}`);
    setIsMessageModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">Student Directory</h2>
            <p className="text-sm text-gray-500">Manage contact details and academic standing for communication.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <span className="material-icons-outlined">search</span>
                </span>
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search student, roll, or parent..." 
                    className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-1 focus:ring-primary"
                />
            </div>
            <select 
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-1 focus:ring-primary"
            >
                <option value="All">All Classes</option>
                <option value="10-A">Class 10-A</option>
                <option value="10-B">Class 10-B</option>
            </select>
        </div>
      </div>

      {/* Directory Grid/List */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
            {filteredStudents.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-400">
                    <span className="material-icons-outlined text-4xl mb-2">person_off</span>
                    <p>No students found matching filters.</p>
                </div>
            ) : (
                filteredStudents.map(student => (
                    <div key={student.id} className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                    {student.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-main-light dark:text-text-main-dark">{student.name}</h3>
                                    <p className="text-xs text-gray-500">Roll: {student.rollNo} • Class {student.class}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {student.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded border border-gray-100 dark:border-gray-700">
                                <span className="block text-xs text-gray-400">Attendance</span>
                                <span className={`font-bold ${student.attendance < 75 ? 'text-red-500' : 'text-green-600'}`}>{student.attendance}%</span>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded border border-gray-100 dark:border-gray-700">
                                <span className="block text-xs text-gray-400">GPA</span>
                                <span className="font-bold text-blue-600">{student.gpa}</span>
                            </div>
                        </div>

                        <div className="space-y-2 text-xs border-t border-gray-100 dark:border-gray-700 pt-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 flex items-center gap-1"><span className="material-icons-outlined text-sm">person</span> Parent:</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">{student.parentName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 flex items-center gap-1"><span className="material-icons-outlined text-sm">phone</span> Phone:</span>
                                <span className="font-mono text-gray-600 dark:text-gray-400">{student.parentContact}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleOpenMessage(student, 'Student')}
                                className="py-2 px-3 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center gap-1 transition-colors"
                            >
                                <span className="material-icons-outlined text-sm">chat</span> Student
                            </button>
                            <button 
                                onClick={() => handleOpenMessage(student, 'Parent')}
                                className="py-2 px-3 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg flex items-center justify-center gap-1 transition-colors"
                            >
                                <span className="material-icons-outlined text-sm">family_restroom</span> Parent
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Message Modal */}
      {isMessageModalOpen && messageTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMessageModalOpen(false)}></div>
            <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-md animate-slide-in-down overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-bold text-text-main-light dark:text-text-main-dark">Message {messageTarget.type}</h3>
                    <button onClick={() => setIsMessageModalOpen(false)}><span className="material-icons-outlined text-gray-500">close</span></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="text-sm">
                        <span className="text-gray-500 block text-xs mb-1">To:</span>
                        <div className="font-bold text-gray-800 dark:text-gray-200">{messageTarget.name}</div>
                        <div className="text-xs text-gray-500">{messageTarget.contact}</div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Channel</label>
                        <select className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg outline-none">
                            <option>SMS</option>
                            <option>Email</option>
                            <option>WhatsApp</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Message</label>
                        <textarea 
                            rows={4}
                            value={messageBody}
                            onChange={(e) => setMessageBody(e.target.value)}
                            placeholder="Type your message..."
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                        ></textarea>
                    </div>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800/50">
                    <button onClick={() => setIsMessageModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm">Cancel</button>
                    <button onClick={handleSendMessage} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm text-sm">Send</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
