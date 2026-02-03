import React, { useState, useEffect } from 'react';

// --- Types ---
type SetupTab = 'classes' | 'sections' | 'subjects' | 'years';

interface AcademicYear {
  id: string;
  name: string;
  status: 'Active' | 'Past' | 'Upcoming';
  start: string;
  end: string;
}

interface ClassEntity {
  id: string;
  yearId: string;
  name: string;
  code: string;
  capacity: number;
}

interface SectionEntity {
  id: string;
  classId: string; // Link to Class
  name: string;
  teacher: string;
  room: string;
  students: number;
}

interface SubjectEntity {
  id: string;
  yearId: string;
  name: string;
  code: string;
  type: 'Theory' | 'Lab' | 'Practical' | 'Both';
  group: string;
  isElective: boolean;
  linkedClassIds: string[]; // Link to multiple Classes
}

// --- Initial Mock Data ---
const INITIAL_YEARS: AcademicYear[] = [
  { id: 'y1', name: '2024-2025', status: 'Active', start: '2024-04-01', end: '2025-03-31' },
  { id: 'y2', name: '2023-2024', status: 'Past', start: '2023-04-01', end: '2024-03-31' },
];

const INITIAL_CLASSES: ClassEntity[] = [
  { id: 'c1', yearId: 'y1', name: 'Grade 10', code: 'G10', capacity: 120 },
  { id: 'c2', yearId: 'y1', name: 'Grade 11', code: 'G11', capacity: 100 },
  { id: 'c3', yearId: 'y2', name: 'Grade 10', code: 'G10', capacity: 110 }, // Past year data
];

const INITIAL_SECTIONS: SectionEntity[] = [
  { id: 's1', classId: 'c1', name: 'Section A', teacher: 'Mr. Anderson', room: '101', students: 30 },
  { id: 's2', classId: 'c1', name: 'Section B', teacher: 'Mrs. Smith', room: '102', students: 28 },
  { id: 's3', classId: 'c2', name: 'Science A', teacher: 'Dr. Brown', room: 'Lab 1', students: 25 },
];

const INITIAL_SUBJECTS: SubjectEntity[] = [
  { id: 'sub1', yearId: 'y1', name: 'Mathematics', code: 'MATH10', type: 'Theory', group: 'Core', isElective: false, linkedClassIds: ['c1'] },
  { id: 'sub2', yearId: 'y1', name: 'Physics', code: 'PHY11', type: 'Both', group: 'Science', isElective: false, linkedClassIds: ['c2'] },
];

export const AcademicSetup: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<SetupTab>('classes');
  const [activeYearId, setActiveYearId] = useState<string>('y1');
  
  const [years, setYears] = useState<AcademicYear[]>(INITIAL_YEARS);
  const [classes, setClasses] = useState<ClassEntity[]>(INITIAL_CLASSES);
  const [sections, setSections] = useState<SectionEntity[]>(INITIAL_SECTIONS);
  const [subjects, setSubjects] = useState<SubjectEntity[]>(INITIAL_SUBJECTS);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // --- Helpers ---
  const activeYear = years.find(y => y.id === activeYearId);
  const filteredClasses = classes.filter(c => c.yearId === activeYearId);
  // Filter sections based on visible classes
  const filteredSections = sections.filter(s => filteredClasses.some(c => c.id === s.classId));
  const filteredSubjects = subjects.filter(s => s.yearId === activeYearId);

  // --- Handlers ---
  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, type: SetupTab) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    switch (type) {
      case 'years': setYears(prev => prev.filter(i => i.id !== id)); break;
      case 'classes': setClasses(prev => prev.filter(i => i.id !== id)); break;
      case 'sections': setSections(prev => prev.filter(i => i.id !== id)); break;
      case 'subjects': setSubjects(prev => prev.filter(i => i.id !== id)); break;
    }
  };

  const handleSave = (formData: any) => {
    const isNew = !editingItem;
    const id = isNew ? Date.now().toString() : editingItem.id;

    switch (activeTab) {
      case 'years':
        const newYear: AcademicYear = { ...formData, id };
        setYears(prev => isNew ? [...prev, newYear] : prev.map(i => i.id === id ? newYear : i));
        break;
      case 'classes':
        const newClass: ClassEntity = { ...formData, id, yearId: activeYearId };
        setClasses(prev => isNew ? [...prev, newClass] : prev.map(i => i.id === id ? newClass : i));
        break;
      case 'sections':
        const newSection: SectionEntity = { ...formData, id };
        setSections(prev => isNew ? [...prev, newSection] : prev.map(i => i.id === id ? newSection : i));
        break;
      case 'subjects':
        const newSubject: SubjectEntity = { ...formData, id, yearId: activeYearId };
        setSubjects(prev => isNew ? [...prev, newSubject] : prev.map(i => i.id === id ? newSubject : i));
        break;
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const tabs: { id: SetupTab; label: string; icon: string }[] = [
    { id: 'classes', label: 'Classes', icon: 'class' },
    { id: 'sections', label: 'Sections', icon: 'view_column' },
    { id: 'subjects', label: 'Subjects', icon: 'menu_book' },
    { id: 'years', label: 'Academic Years', icon: 'date_range' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Context Selector */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Academic Setup</h2>
          <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Manage structure for: <span className="font-semibold text-primary">{activeYear?.name}</span></p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Year Context Switcher */}
          <div className="relative">
             <select 
               value={activeYearId}
               onChange={(e) => setActiveYearId(e.target.value)}
               className="appearance-none bg-white dark:bg-card-dark border border-gray-300 dark:border-gray-600 text-text-main-light dark:text-text-main-dark py-2 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
             >
               {years.map(y => (
                 <option key={y.id} value={y.id}>{y.name} ({y.status})</option>
               ))}
             </select>
             <span className="absolute right-3 top-2.5 pointer-events-none material-icons-outlined text-gray-500 text-sm">expand_more</span>
          </div>

          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <span className="material-icons-outlined text-sm">add</span>
            <span className="text-sm font-medium">
              Add {tabs.find(t => t.id === activeTab)?.label.slice(0, -1)}
            </span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
              ${activeTab === tab.id 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-sub-light dark:text-text-sub-dark hover:text-text-main-light dark:hover:text-text-main-dark hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
          >
            <span className="material-icons-outlined text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-card-light dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm min-h-[400px]">
        {activeTab === 'classes' && (
          <ClassesManager 
            data={filteredClasses} 
            sections={sections} // Pass all sections to count
            onEdit={handleEdit} 
            onDelete={(id) => handleDelete(id, 'classes')} 
          />
        )}
        {activeTab === 'sections' && (
          <SectionsManager 
            data={filteredSections} 
            classes={filteredClasses} // For referencing class names
            onEdit={handleEdit} 
            onDelete={(id) => handleDelete(id, 'sections')} 
          />
        )}
        {activeTab === 'subjects' && (
          <SubjectsManager 
            data={filteredSubjects} 
            classes={filteredClasses} // For resolving linked class names
            onEdit={handleEdit} 
            onDelete={(id) => handleDelete(id, 'subjects')} 
          />
        )}
        {activeTab === 'years' && (
          <YearsManager 
            data={years} 
            onEdit={handleEdit} 
            onDelete={(id) => handleDelete(id, 'years')} 
          />
        )}
      </div>

      {/* Global Modal */}
      {isModalOpen && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
          title={`${editingItem ? 'Edit' : 'Add'} ${tabs.find(t => t.id === activeTab)?.label.slice(0, -1)}`}
        >
          {activeTab === 'classes' && (
             <ClassForm initialData={editingItem} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
          )}
          {activeTab === 'sections' && (
             <SectionForm initialData={editingItem} classes={filteredClasses} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
          )}
          {activeTab === 'subjects' && (
             <SubjectForm initialData={editingItem} classes={filteredClasses} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
          )}
          {activeTab === 'years' && (
             <YearForm initialData={editingItem} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
          )}
        </Modal>
      )}
    </div>
  );
};

// --- Sub-Components (Lists) ---

const ClassesManager: React.FC<{ data: ClassEntity[], sections: SectionEntity[], onEdit: (i: any) => void, onDelete: (id: string) => void }> = ({ data, sections, onEdit, onDelete }) => {
  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-text-sub-light dark:text-text-sub-dark uppercase bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 rounded-l-lg">Class Name</th>
              <th className="px-6 py-3">Code</th>
              <th className="px-6 py-3">Sections</th>
              <th className="px-6 py-3">Capacity</th>
              <th className="px-6 py-3 rounded-r-lg text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-text-sub-light dark:text-text-sub-dark">No classes found for this year.</td></tr>
            ) : (
              data.map((cls) => {
                const sectionCount = sections.filter(s => s.classId === cls.id).length;
                return (
                  <tr key={cls.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-main-light dark:text-text-main-dark">{cls.name}</td>
                    <td className="px-6 py-4 text-text-sub-light dark:text-text-sub-dark">{cls.code}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {sectionCount} Sections
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-sub-light dark:text-text-sub-dark">{cls.capacity}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => onEdit(cls)} className="text-text-sub-light dark:text-text-sub-dark hover:text-primary transition-colors">
                          <span className="material-icons-outlined text-lg">edit</span>
                        </button>
                        <button onClick={() => onDelete(cls.id)} className="text-text-sub-light dark:text-text-sub-dark hover:text-red-500 transition-colors">
                          <span className="material-icons-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SectionsManager: React.FC<{ data: SectionEntity[], classes: ClassEntity[], onEdit: (i: any) => void, onDelete: (id: string) => void }> = ({ data, classes, onEdit, onDelete }) => {
  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-text-sub-light dark:text-text-sub-dark uppercase bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 rounded-l-lg">Section Name</th>
              <th className="px-6 py-3">Class</th>
              <th className="px-6 py-3">Teacher</th>
              <th className="px-6 py-3">Room</th>
              <th className="px-6 py-3">Students</th>
              <th className="px-6 py-3 rounded-r-lg text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.length === 0 ? (
               <tr><td colSpan={6} className="px-6 py-8 text-center text-text-sub-light dark:text-text-sub-dark">No sections found. Add a class first.</td></tr>
            ) : (
              data.map((sec) => {
                const className = classes.find(c => c.id === sec.classId)?.name || 'Unknown Class';
                return (
                  <tr key={sec.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-main-light dark:text-text-main-dark">{sec.name}</td>
                    <td className="px-6 py-4 text-text-sub-light dark:text-text-sub-dark">{className}</td>
                    <td className="px-6 py-4">{sec.teacher}</td>
                    <td className="px-6 py-4 text-text-sub-light dark:text-text-sub-dark">{sec.room}</td>
                    <td className="px-6 py-4 text-text-sub-light dark:text-text-sub-dark">{sec.students}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => onEdit(sec)} className="text-text-sub-light dark:text-text-sub-dark hover:text-primary transition-colors">
                          <span className="material-icons-outlined text-lg">edit</span>
                        </button>
                        <button onClick={() => onDelete(sec.id)} className="text-text-sub-light dark:text-text-sub-dark hover:text-red-500 transition-colors">
                          <span className="material-icons-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SubjectsManager: React.FC<{ data: SubjectEntity[], classes: ClassEntity[], onEdit: (i: any) => void, onDelete: (id: string) => void }> = ({ data, classes, onEdit, onDelete }) => {
  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-text-sub-light dark:text-text-sub-dark uppercase bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 rounded-l-lg">Subject</th>
              <th className="px-6 py-3">Attributes</th>
              <th className="px-6 py-3">Group</th>
              <th className="px-6 py-3">Linked To</th>
              <th className="px-6 py-3 rounded-r-lg text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
             {data.length === 0 ? (
               <tr><td colSpan={5} className="px-6 py-8 text-center text-text-sub-light dark:text-text-sub-dark">No subjects found.</td></tr>
            ) : (
              data.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-main-light dark:text-text-main-dark">{sub.name}</div>
                    <div className="text-xs text-text-sub-light dark:text-text-sub-dark font-mono">{sub.code}</div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col gap-1 items-start">
                      <span className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 dark:text-gray-300">{sub.type}</span>
                      {sub.isElective && <span className="text-xs text-amber-600 dark:text-amber-400">★ Elective</span>}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-text-sub-light dark:text-text-sub-dark">{sub.group}</td>
                  <td className="px-6 py-4">
                       <div className="flex flex-wrap gap-1 max-w-xs">
                          {sub.linkedClassIds.map(cid => {
                             const cName = classes.find(c => c.id === cid)?.name;
                             return cName ? (
                               <span key={cid} className="px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800">
                                 {cName}
                               </span>
                             ) : null;
                          })}
                          {sub.linkedClassIds.length === 0 && <span className="text-xs italic text-gray-400">No classes linked</span>}
                       </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button onClick={() => onEdit(sub)} className="text-text-sub-light dark:text-text-sub-dark hover:text-primary transition-colors">
                          <span className="material-icons-outlined text-lg">edit</span>
                        </button>
                        <button onClick={() => onDelete(sub.id)} className="text-text-sub-light dark:text-text-sub-dark hover:text-red-500 transition-colors">
                          <span className="material-icons-outlined text-lg">delete</span>
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const YearsManager: React.FC<{ data: AcademicYear[], onEdit: (i: any) => void, onDelete: (id: string) => void }> = ({ data, onEdit, onDelete }) => {
  return (
    <div className="p-6 grid gap-4">
      {data.map((year) => (
        <div key={year.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-start gap-4">
             <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
               <span className="material-icons-outlined text-2xl">calendar_today</span>
             </div>
             <div>
               <h3 className="font-bold text-text-main-light dark:text-text-main-dark flex items-center gap-2">
                 {year.name} 
                 <span className={`px-2 py-0.5 rounded text-xs ${year.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                   {year.status}
                 </span>
               </h3>
               <p className="text-sm text-text-sub-light dark:text-text-sub-dark mt-1">
                 {year.start} — {year.end}
               </p>
             </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => onEdit(year)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-text-sub-light dark:text-text-sub-dark"><span className="material-icons-outlined">edit</span></button>
             <button onClick={() => onDelete(year.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500"><span className="material-icons-outlined">delete</span></button>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Forms ---

const Modal: React.FC<{ isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-card-light dark:bg-card-dark rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">{title}</h3>
          <button onClick={onClose}><span className="material-icons-outlined text-gray-500">close</span></button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const ClassForm: React.FC<{ initialData?: any, onSave: (data: any) => void, onClose: () => void }> = ({ initialData, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    capacity: initialData?.capacity || 30
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">Class Name</label>
        <input 
          type="text" 
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
          className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none"
          placeholder="e.g. Grade 10"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">Class Code</label>
          <input 
            type="text" 
            value={formData.code}
            onChange={e => setFormData({...formData, code: e.target.value})}
            className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none"
            placeholder="e.g. G10"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">Capacity</label>
          <input 
            type="number" 
            value={formData.capacity}
            onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
            className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
        <button onClick={() => onSave(formData)} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-600">Save Class</button>
      </div>
    </div>
  );
};

const SectionForm: React.FC<{ initialData?: any, classes: ClassEntity[], onSave: (data: any) => void, onClose: () => void }> = ({ initialData, classes, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    classId: initialData?.classId || (classes[0]?.id || ''),
    teacher: initialData?.teacher || '',
    room: initialData?.room || '',
    students: initialData?.students || 0
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">Section Name</label>
          <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none" placeholder="e.g. Section A" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">Parent Class</label>
          <select value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none">
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <div>
         <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">Class Teacher</label>
         <input type="text" value={formData.teacher} onChange={e => setFormData({...formData, teacher: e.target.value})} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none" placeholder="Teacher Name" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">Room No.</label>
          <input type="text" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">Current Students</label>
          <input type="number" value={formData.students} onChange={e => setFormData({...formData, students: parseInt(e.target.value)})} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none" />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
        <button onClick={() => onSave(formData)} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-600">Save Section</button>
      </div>
    </div>
  );
};

const SubjectForm: React.FC<{ initialData?: any, classes: ClassEntity[], onSave: (data: any) => void, onClose: () => void }> = ({ initialData, classes, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    type: initialData?.type || 'Theory',
    group: initialData?.group || 'Core',
    isElective: initialData?.isElective || false,
    linkedClassIds: initialData?.linkedClassIds || []
  });

  const toggleClass = (id: string) => {
    setFormData(prev => ({
      ...prev,
      linkedClassIds: prev.linkedClassIds.includes(id) 
        ? prev.linkedClassIds.filter((cid: string) => cid !== id)
        : [...prev.linkedClassIds, id]
    }));
  };

  const handleSelectAll = () => {
     setFormData(prev => ({ ...prev, linkedClassIds: classes.map(c => c.id) }));
  };

  const handleClearAll = () => {
     setFormData(prev => ({ ...prev, linkedClassIds: [] }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">Subject Name</label>
           <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none" />
        </div>
        <div>
           <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">Subject Code</label>
           <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">Type</label>
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none">
            <option>Theory</option><option>Lab</option><option>Practical</option><option>Both</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">Group</label>
          <select value={formData.group} onChange={e => setFormData({...formData, group: e.target.value})} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none">
            <option>Core</option><option>Science</option><option>Commerce</option><option>Arts</option><option>Languages</option><option>Sports</option>
          </select>
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={formData.isElective} onChange={e => setFormData({...formData, isElective: e.target.checked})} className="rounded text-primary focus:ring-primary" />
          <span className="text-sm">Mark as Elective Subject</span>
        </label>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark">Assign to Classes</label>
            <div className="flex gap-2">
                <button type="button" onClick={handleSelectAll} className="text-[10px] text-primary hover:underline">Select All</button>
                <button type="button" onClick={handleClearAll} className="text-[10px] text-text-sub-light dark:text-text-sub-dark hover:underline">Clear</button>
            </div>
        </div>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
          {classes.length === 0 && <span className="text-xs text-gray-400">No classes available for this academic year.</span>}
          {classes.map(c => {
             const isSelected = formData.linkedClassIds.includes(c.id);
             return (
                <button 
                  key={c.id} 
                  type="button"
                  onClick={() => toggleClass(c.id)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all duration-200
                    ${isSelected 
                      ? 'bg-primary/10 border-primary text-primary font-medium ring-1 ring-primary/20' 
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-text-sub-light dark:text-text-sub-dark hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <span className={`material-icons-outlined text-[14px] ${isSelected ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>check</span>
                  {c.name}
                </button>
             );
          })}
        </div>
        <p className="text-[10px] text-text-sub-light dark:text-text-sub-dark mt-1">
            Subjects linked to classes will automatically appear in those classes' curriculum and exam schedules.
        </p>
      </div>
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
        <button onClick={() => onSave(formData)} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-600">Save Subject</button>
      </div>
    </div>
  );
};

const YearForm: React.FC<{ initialData?: any, onSave: (data: any) => void, onClose: () => void }> = ({ initialData, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    status: initialData?.status || 'Upcoming',
    start: initialData?.start || '',
    end: initialData?.end || ''
  });

  return (
    <div className="space-y-4">
      <div>
         <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">Year Name</label>
         <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none" placeholder="e.g. 2025-2026" />
      </div>
      <div>
         <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">Status</label>
         <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none">
           <option>Active</option><option>Past</option><option>Upcoming</option>
         </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">Start Date</label>
          <input type="date" value={formData.start} onChange={e => setFormData({...formData, start: e.target.value})} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-sub-light dark:text-text-sub-dark mb-1">End Date</label>
          <input type="date" value={formData.end} onChange={e => setFormData({...formData, end: e.target.value})} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none" />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
        <button onClick={() => onSave(formData)} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-600">Save Year</button>
      </div>
    </div>
  );
};
