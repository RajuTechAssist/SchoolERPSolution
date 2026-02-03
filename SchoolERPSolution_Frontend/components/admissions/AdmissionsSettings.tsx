
import React, { useState } from 'react';

// --- Types ---
type SettingsTab = 'form' | 'intake' | 'docs' | 'automation' | 'permissions' | 'sources';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'file' | 'number';
  section: 'Student' | 'Parent' | 'Other';
  isVisible: boolean;
  isRequired: boolean;
  isSystem: boolean; // Cannot be deleted
  options?: string; // Comma separated for select
}

interface ClassRule {
  classId: string;
  capacity: number;
  minAge: number;
  maxAge: number;
  isOpen: boolean;
}

interface LeadSource {
  id: string;
  name: string;
  utmParam?: string;
  isActive: boolean;
}

interface DocRule {
  id: string;
  name: string;
  appliedTo: string; // 'All' or specific class
  formats: string[]; // ['PDF', 'JPG']
  isMandatory: boolean;
}

// --- Mock Data ---
const INITIAL_FIELDS: FormField[] = [
  { id: 'f1', label: 'Applicant Name', type: 'text', section: 'Student', isVisible: true, isRequired: true, isSystem: true },
  { id: 'f2', label: 'Date of Birth', type: 'date', section: 'Student', isVisible: true, isRequired: true, isSystem: true },
  { id: 'f3', label: 'Gender', type: 'select', section: 'Student', isVisible: true, isRequired: true, isSystem: true, options: 'Male,Female,Other' },
  { id: 'f4', label: 'Blood Group', type: 'text', section: 'Student', isVisible: true, isRequired: false, isSystem: false },
  { id: 'f5', label: 'Father Name', type: 'text', section: 'Parent', isVisible: true, isRequired: true, isSystem: true },
  { id: 'f6', label: 'Mother Name', type: 'text', section: 'Parent', isVisible: true, isRequired: true, isSystem: true },
  { id: 'f7', label: 'Annual Income', type: 'number', section: 'Parent', isVisible: true, isRequired: false, isSystem: false },
  { id: 'f8', label: 'Transport Needed', type: 'select', section: 'Other', isVisible: true, isRequired: true, isSystem: false, options: 'Yes,No' },
];

const INITIAL_RULES: ClassRule[] = [
  { classId: 'Class 1', capacity: 40, minAge: 5, maxAge: 7, isOpen: true },
  { classId: 'Class 2', capacity: 40, minAge: 6, maxAge: 8, isOpen: true },
  { classId: 'Class 5', capacity: 35, minAge: 9, maxAge: 11, isOpen: false },
];

const INITIAL_DOC_RULES: DocRule[] = [
  { id: 'd1', name: 'Birth Certificate', appliedTo: 'All', formats: ['PDF', 'JPG'], isMandatory: true },
  { id: 'd2', name: 'Passport Size Photo', appliedTo: 'All', formats: ['JPG', 'PNG'], isMandatory: true },
  { id: 'd3', name: 'Transfer Certificate', appliedTo: 'Class 2+', formats: ['PDF'], isMandatory: true },
  { id: 'd4', name: 'Aadhar Card', appliedTo: 'All', formats: ['PDF', 'JPG'], isMandatory: false },
];

const INITIAL_SOURCES: LeadSource[] = [
  { id: 's1', name: 'Website Enquiry', utmParam: 'web_organic', isActive: true },
  { id: 's2', name: 'Walk-in', isActive: true },
  { id: 's3', name: 'Social Media', utmParam: 'fb_ads', isActive: true },
  { id: 's4', name: 'Referral', isActive: true },
];

export const AdmissionsSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('form');
  
  // Data State
  const [fields, setFields] = useState<FormField[]>(INITIAL_FIELDS);
  const [classRules, setClassRules] = useState<ClassRule[]>(INITIAL_RULES);
  const [docRules, setDocRules] = useState<DocRule[]>(INITIAL_DOC_RULES);
  const [sources, setSources] = useState<LeadSource[]>(INITIAL_SOURCES);
  const [academicYear, setAcademicYear] = useState('2025-2026');
  
  // Automation State
  const [autoAck, setAutoAck] = useState(true);
  const [autoReminder, setAutoReminder] = useState(true);

  // Modals State
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [newField, setNewField] = useState<Partial<FormField>>({ label: '', type: 'text', section: 'Other', isVisible: true, isRequired: false });
  
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [newDoc, setNewDoc] = useState<Partial<DocRule>>({ name: '', appliedTo: 'All', formats: ['PDF'], isMandatory: true });

  // --- Handlers: Form Builder ---
  const toggleField = (id: string, prop: 'isVisible' | 'isRequired') => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, [prop]: !f[prop] } : f));
  };

  const handleAddField = () => {
    if (!newField.label) return;
    const field: FormField = {
      id: `custom_${Date.now()}`,
      label: newField.label!,
      type: newField.type as any,
      section: newField.section as any,
      isVisible: true,
      isRequired: newField.isRequired || false,
      isSystem: false,
      options: newField.options
    };
    setFields([...fields, field]);
    setIsFieldModalOpen(false);
    setNewField({ label: '', type: 'text', section: 'Other', isVisible: true, isRequired: false });
  };

  const handleDeleteField = (id: string) => {
    if (confirm('Delete this custom field?')) {
      setFields(prev => prev.filter(f => f.id !== id));
    }
  };

  // --- Handlers: Intake & Docs ---
  const handleRuleChange = (classId: string, field: keyof ClassRule, value: any) => {
    setClassRules(prev => prev.map(r => r.classId === classId ? { ...r, [field]: value } : r));
  };

  const handleAddDoc = () => {
    if (!newDoc.name) return;
    const doc: DocRule = {
      id: `doc_${Date.now()}`,
      name: newDoc.name!,
      appliedTo: newDoc.appliedTo || 'All',
      formats: newDoc.formats || ['PDF'],
      isMandatory: newDoc.isMandatory || false
    };
    setDocRules([...docRules, doc]);
    setIsDocModalOpen(false);
    setNewDoc({ name: '', appliedTo: 'All', formats: ['PDF'], isMandatory: true });
  };

  const handleDeleteDoc = (id: string) => {
    if (confirm('Remove this document rule?')) {
      setDocRules(prev => prev.filter(d => d.id !== id));
    }
  };

  const toggleDocMandatory = (id: string) => {
    setDocRules(prev => prev.map(d => d.id === id ? { ...d, isMandatory: !d.isMandatory } : d));
  };

  // --- Renderers ---

  const renderFormBuilder = () => (
    <div className="space-y-6 animate-fade-in relative">
        <div className="flex justify-between items-center">
            <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Application Form Fields</h3>
                <p className="text-sm text-gray-500">Configure what data is collected from applicants.</p>
            </div>
            <button 
              onClick={() => setIsFieldModalOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 shadow-sm flex items-center gap-2"
            >
                <span className="material-icons-outlined text-sm">add</span> Add Custom Field
            </button>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase">
                <div className="col-span-5">Field Label</div>
                <div className="col-span-3">Section</div>
                <div className="col-span-2 text-center">Visible</div>
                <div className="col-span-2 text-center">Required</div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {fields.map(field => (
                    <div key={field.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                        <div className="col-span-5 flex items-center gap-3">
                            <span className="material-icons-outlined text-gray-300 cursor-grab">drag_indicator</span>
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2">
                                  {field.label}
                                  {!field.isSystem && (
                                    <button 
                                      onClick={() => handleDeleteField(field.id)}
                                      className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Delete Field"
                                    >
                                      <span className="material-icons-outlined text-sm">delete</span>
                                    </button>
                                  )}
                                </p>
                                <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 rounded border border-gray-200 dark:border-gray-700">{field.type}</span>
                            </div>
                        </div>
                        <div className="col-span-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            field.section === 'Student' ? 'bg-blue-50 text-blue-700' :
                            field.section === 'Parent' ? 'bg-purple-50 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {field.section}
                          </span>
                        </div>
                        <div className="col-span-2 flex justify-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={field.isVisible} onChange={() => toggleField(field.id, 'isVisible')} className="sr-only peer" />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="col-span-2 flex justify-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={field.isRequired} onChange={() => toggleField(field.id, 'isRequired')} disabled={!field.isVisible} className="sr-only peer disabled:opacity-50" />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
                            </label>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Add Field Modal */}
        {isFieldModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsFieldModalOpen(false)}></div>
            <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-md p-6 animate-slide-in-down">
              <h3 className="font-bold text-lg mb-4 text-text-main-light dark:text-text-main-dark">Add Custom Field</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Field Label</label>
                  <input 
                    type="text" 
                    value={newField.label} 
                    onChange={e => setNewField({...newField, label: e.target.value})} 
                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. Allergy Information"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Input Type</label>
                    <select 
                      value={newField.type} 
                      onChange={e => setNewField({...newField, type: e.target.value as any})}
                      className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm outline-none"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="select">Dropdown</option>
                      <option value="file">File Upload</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Section</label>
                    <select 
                      value={newField.section} 
                      onChange={e => setNewField({...newField, section: e.target.value as any})}
                      className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm outline-none"
                    >
                      <option value="Student">Student</option>
                      <option value="Parent">Parent</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                {newField.type === 'select' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Options (Comma separated)</label>
                    <input 
                      type="text" 
                      value={newField.options || ''} 
                      onChange={e => setNewField({...newField, options: e.target.value})} 
                      className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm outline-none"
                      placeholder="Option 1, Option 2, Option 3"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="req_new" 
                    checked={newField.isRequired} 
                    onChange={e => setNewField({...newField, isRequired: e.target.checked})}
                    className="rounded text-primary focus:ring-primary" 
                  />
                  <label htmlFor="req_new" className="text-sm">Mark as Required</label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button onClick={() => setIsFieldModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm">Cancel</button>
                <button onClick={handleAddField} className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-600 text-sm shadow-sm">Add Field</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );

  const renderDocs = () => (
    <div className="space-y-6 animate-fade-in relative">
        <div className="flex justify-between items-center">
            <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Document Verification Rules</h3>
                <p className="text-sm text-gray-500">Manage required proofs for admission eligibility.</p>
            </div>
            <button 
              onClick={() => setIsDocModalOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 shadow-sm flex items-center gap-2"
            >
                <span className="material-icons-outlined text-sm">note_add</span> Add Document Rule
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {docRules.map(doc => (
             <div key={doc.id} className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col group relative">
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                         <span className="material-icons-outlined text-gray-500">description</span>
                      </div>
                      <div>
                         <h4 className="font-bold text-text-main-light dark:text-text-main-dark text-sm">{doc.name}</h4>
                         <p className="text-xs text-gray-500">Applies to: {doc.appliedTo}</p>
                      </div>
                   </div>
                   <button 
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                      <span className="material-icons-outlined text-sm">delete</span>
                   </button>
                </div>
                
                <div className="flex gap-2 mb-4">
                   {doc.formats.map(f => (
                      <span key={f} className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">{f}</span>
                   ))}
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                   <span className="text-xs text-gray-500">Requirement</span>
                   <label className="flex items-center gap-2 cursor-pointer">
                      <span className={`text-xs font-bold ${doc.isMandatory ? 'text-red-500' : 'text-green-500'}`}>
                         {doc.isMandatory ? 'Mandatory' : 'Optional'}
                      </span>
                      <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={doc.isMandatory} onChange={() => toggleDocMandatory(doc.id)} className="sr-only peer" />
                          <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-red-500"></div>
                      </div>
                   </label>
                </div>
             </div>
           ))}
        </div>

        {/* Add Doc Modal */}
        {isDocModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDocModalOpen(false)}></div>
            <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-sm p-6 animate-slide-in-down">
              <h3 className="font-bold text-lg mb-4 text-text-main-light dark:text-text-main-dark">Add Document Rule</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Document Name</label>
                  <input 
                    type="text" 
                    value={newDoc.name} 
                    onChange={e => setNewDoc({...newDoc, name: e.target.value})} 
                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. Migration Certificate"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Applies To</label>
                  <select 
                    value={newDoc.appliedTo} 
                    onChange={e => setNewDoc({...newDoc, appliedTo: e.target.value})} 
                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm outline-none"
                  >
                    <option value="All">All Applicants</option>
                    <option value="Class 1">Class 1</option>
                    <option value="Class 2+">Class 2 and above</option>
                    <option value="International">International Students</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Accepted Formats</label>
                  <div className="flex gap-2">
                     {['PDF', 'JPG', 'PNG'].map(fmt => (
                        <button
                           key={fmt}
                           onClick={() => {
                              const formats = newDoc.formats?.includes(fmt) 
                                 ? newDoc.formats.filter(f => f !== fmt) 
                                 : [...(newDoc.formats || []), fmt];
                              setNewDoc({...newDoc, formats});
                           }}
                           className={`px-3 py-1 rounded text-xs border ${newDoc.formats?.includes(fmt) ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'}`}
                        >
                           {fmt}
                        </button>
                     ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="req_doc" 
                    checked={newDoc.isMandatory} 
                    onChange={e => setNewDoc({...newDoc, isMandatory: e.target.checked})}
                    className="rounded text-red-500 focus:ring-red-500" 
                  />
                  <label htmlFor="req_doc" className="text-sm font-medium">Mark as Mandatory</label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button onClick={() => setIsDocModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm">Cancel</button>
                <button onClick={handleAddDoc} className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-600 text-sm shadow-sm">Save Rule</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );

  const renderIntake = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Intake & Criteria</h3>
                    <p className="text-sm text-gray-500">Define capacity and age rules for <span className="font-bold text-primary">{academicYear}</span>.</p>
                </div>
                <select 
                    value={academicYear} 
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none"
                >
                    <option>2024-2025</option>
                    <option>2025-2026</option>
                </select>
            </div>

            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <th className="px-4 py-3">Class</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 w-32">Total Seats</th>
                        <th className="px-4 py-3 w-24">Min Age</th>
                        <th className="px-4 py-3 w-24">Max Age</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {classRules.map(rule => (
                        <tr key={rule.classId} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                            <td className="px-4 py-3 font-bold text-gray-800 dark:text-gray-200">{rule.classId}</td>
                            <td className="px-4 py-3">
                                <button 
                                    onClick={() => handleRuleChange(rule.classId, 'isOpen', !rule.isOpen)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${rule.isOpen ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}
                                >
                                    {rule.isOpen ? 'Open' : 'Closed'}
                                </button>
                            </td>
                            <td className="px-4 py-3">
                                <input 
                                    type="number" 
                                    value={rule.capacity} 
                                    onChange={(e) => handleRuleChange(rule.classId, 'capacity', Number(e.target.value))}
                                    className="w-full p-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-center"
                                />
                            </td>
                            <td className="px-4 py-3">
                                <input 
                                    type="number" 
                                    value={rule.minAge} 
                                    onChange={(e) => handleRuleChange(rule.classId, 'minAge', Number(e.target.value))}
                                    className="w-full p-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-center"
                                />
                            </td>
                            <td className="px-4 py-3">
                                <input 
                                    type="number" 
                                    value={rule.maxAge} 
                                    onChange={(e) => handleRuleChange(rule.classId, 'maxAge', Number(e.target.value))}
                                    className="w-full p-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-center"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderAutomation = () => (
    <div className="max-w-4xl space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-6">Automation Rules</h3>
            
            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Auto-Acknowledgement</h4>
                        <p className="text-xs text-gray-500 mt-1">Send an email/SMS immediately when an application is submitted.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={autoAck} onChange={() => setAutoAck(!autoAck)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                </div>
                {autoAck && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 ml-4 animate-fade-in">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Template</label>
                        <textarea className="w-full p-3 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm" rows={3} defaultValue="Dear {ParentName}, thank you for applying to Springfield Academy for {StudentName}. Your App ID is {AppID}."></textarea>
                    </div>
                )}

                <div className="h-px bg-gray-100 dark:bg-gray-700"></div>

                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Pending Documents Reminder</h4>
                        <p className="text-xs text-gray-500 mt-1">Automatically remind parents 3 days after submission if docs are missing.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={autoReminder} onChange={() => setAutoReminder(!autoReminder)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                </div>
            </div>
        </div>
    </div>
  );

  const renderPermissions = () => (
    <div className="animate-fade-in">
        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Role Permissions</h3>
                <p className="text-sm text-gray-500">Control who can perform sensitive admission actions.</p>
            </div>
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <th className="px-6 py-4">Action</th>
                        <th className="px-6 py-4 text-center">Admission Officer</th>
                        <th className="px-6 py-4 text-center">Clerk</th>
                        <th className="px-6 py-4 text-center">Principal</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {[
                        { action: 'View Applications', roles: [true, true, true] },
                        { action: 'Verify Documents', roles: [true, true, false] },
                        { action: 'Schedule Interview', roles: [true, false, true] },
                        { action: 'Send Offer Letter', roles: [false, false, true] },
                        { action: 'Reject Application', roles: [false, false, true] },
                        { action: 'Override Age Limit', roles: [false, false, true] },
                    ].map((perm, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                            <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{perm.action}</td>
                            {perm.roles.map((enabled, i) => (
                                <td key={i} className="px-6 py-4 text-center">
                                    <input type="checkbox" defaultChecked={enabled} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderSources = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Lead Sources</h3>
                <p className="text-sm text-gray-500">Manage channels for incoming enquiries.</p>
            </div>
            <button className="px-4 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm">
                + Add Source
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map(source => (
                <div key={source.id} className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-text-main-light dark:text-text-main-dark">{source.name}</h4>
                        {source.utmParam && <p className="text-xs text-blue-500 font-mono mt-1">utm_source={source.utmParam}</p>}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={source.isActive} onChange={() => {}} className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-full gap-6">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
        {[
            { id: 'form', label: 'Form Builder', icon: 'list_alt' },
            { id: 'intake', label: 'Intake & Criteria', icon: 'meeting_room' },
            { id: 'docs', label: 'Documents', icon: 'folder_shared' },
            { id: 'automation', label: 'Automation', icon: 'smart_toy' },
            { id: 'permissions', label: 'Permissions', icon: 'lock_person' },
            { id: 'sources', label: 'Lead Sources', icon: 'filter_alt' },
        ].map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3
                    ${activeTab === tab.id 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'bg-white dark:bg-card-dark text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
                <span className="material-icons-outlined text-lg">{tab.icon}</span>
                {tab.label}
            </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-6">
         {activeTab === 'form' && renderFormBuilder()}
         {activeTab === 'intake' && renderIntake()}
         {activeTab === 'docs' && renderDocs()}
         {activeTab === 'automation' && renderAutomation()}
         {activeTab === 'permissions' && renderPermissions()}
         {activeTab === 'sources' && renderSources()}
      </div>
    </div>
  );
};
