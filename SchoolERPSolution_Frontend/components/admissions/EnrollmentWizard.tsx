
import React, { useState, useEffect } from 'react';

// --- Types ---
type EnrollmentSource = 'Application' | 'Lead' | 'Manual';
type Step = 1 | 2 | 3 | 4 | 5;

interface Candidate {
  id: string;
  name: string;
  sourceType: EnrollmentSource;
  class: string;
  parent: string;
  phone: string;
  status: string;
  avatar: string;
}

interface ClassSection {
  id: string;
  name: string;
  capacity: number;
  enrolled: number;
  classTeacher: string;
}

interface EnrollmentForm {
  studentName: string;
  dob: string;
  gender: string;
  address: string;
  
  academicYear: string;
  classId: string;
  sectionId: string;
  rollNo: string;
  admissionNo: string;
  
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  createUser: boolean;
  
  docsVerified: boolean;
  docOverride: boolean;
  docOverrideReason: string;
  
  feeRecordId: string; // "Paid", "Pending", or Invoice ID
}

// --- Mock Data ---
const MOCK_CANDIDATES: Candidate[] = [
  { id: 'APP-2025-001', name: 'Aarav Patel', sourceType: 'Application', class: 'Class 1', parent: 'Suresh Patel', phone: '+91 9876543210', status: 'Offer Accepted', avatar: 'AP' },
  { id: 'APP-2025-003', name: 'Ishaan Gupta', sourceType: 'Application', class: 'Class 1', parent: 'Meera Gupta', phone: '+91 9123456789', status: 'Offer Accepted', avatar: 'IG' },
  { id: 'L-103', name: 'Arjun Das', sourceType: 'Lead', class: 'Class 1', parent: 'Mr. Das', phone: '+91 9988776655', status: 'Walk-in', avatar: 'AD' },
];

const MOCK_SECTIONS: Record<string, ClassSection[]> = {
  'Class 1': [
    { id: 'sec_a', name: 'Section A', capacity: 30, enrolled: 28, classTeacher: 'Mrs. Verma' },
    { id: 'sec_b', name: 'Section B', capacity: 30, enrolled: 15, classTeacher: 'Ms. Sarah' },
  ],
  'Class 5': [
    { id: 'sec_a', name: 'Section A', capacity: 35, enrolled: 35, classTeacher: 'Mr. Singh' }, // Full
  ]
};

const TEMPLATES = {
  welcome: (studentName: string, parentName: string, cls: string, sec: string, studentId: string) => 
    `Welcome ${parentName} — ${studentName} is now enrolled in ${cls} ${sec}. Student ID: ${studentId}. Login details have been sent to your email/phone.`,
};

export const EnrollmentWizard: React.FC = () => {
  const [step, setStep] = useState<Step>(1);
  const [sourceType, setSourceType] = useState<EnrollmentSource>('Application');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<EnrollmentForm>({
    studentName: '', dob: '', gender: 'Male', address: '',
    academicYear: '2025-2026', classId: 'Class 1', sectionId: '', rollNo: '', admissionNo: `ADM-${new Date().getFullYear()}-${Math.floor(Math.random()*1000)}`,
    parentName: '', parentPhone: '', parentEmail: '', createUser: true,
    docsVerified: false, docOverride: false, docOverrideReason: '',
    feeRecordId: 'Paid'
  });

  // UI State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedId, setGeneratedId] = useState('');

  // --- Handlers ---

  const handleSelectCandidate = (c: Candidate) => {
    setSelectedCandidate(c);
    setFormData(prev => ({
      ...prev,
      studentName: c.name,
      classId: c.class,
      parentName: c.parent,
      parentPhone: c.phone,
      // Reset section when candidate changes
      sectionId: ''
    }));
  };

  const handleNext = () => {
    if (step === 1 && !selectedCandidate && sourceType !== 'Manual') return alert('Please select a candidate.');
    if (step === 3 && !formData.sectionId) return alert('Please assign a section.');
    if (step === 4 && !formData.docsVerified && !formData.docOverride) return alert('Please verify documents or provide an override justification.');
    
    setStep(prev => Math.min(5, prev + 1) as Step);
  };

  const handleBack = () => setStep(prev => Math.max(1, prev - 1) as Step);

  const handleFinalize = () => {
    // Generate ID
    const studentId = `ST-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedId(studentId);
    
    // Simulate API Call
    setTimeout(() => {
        setIsConfirmModalOpen(false);
        setIsSuccess(true);
    }, 1000);
  };

  // --- Render Steps ---

  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {['Application', 'Lead', 'Manual'].map(type => (
            <button
              key={type}
              onClick={() => { setSourceType(type as EnrollmentSource); setSelectedCandidate(null); }}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${sourceType === type ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {sourceType === 'Manual' ? (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <span className="material-icons-outlined text-4xl text-gray-400 mb-2">edit_note</span>
          <p className="text-gray-600 dark:text-gray-400 mb-4">You are creating a student record from scratch.</p>
          <button onClick={() => setStep(2)} className="px-6 py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-blue-600">Start Manual Entry</button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
             <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><span className="material-icons-outlined">search</span></span>
             <input 
               type="text" 
               placeholder={`Search ${sourceType} ID or Name...`}
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-4 py-3 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary"
             />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {MOCK_CANDIDATES.filter(c => c.sourceType === sourceType && c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                <div 
                  key={c.id} 
                  onClick={() => handleSelectCandidate(c)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${selectedCandidate?.id === c.id ? 'border-primary bg-blue-50 dark:bg-blue-900/20 ring-1 ring-primary' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark hover:border-primary/50'}`}
                >
                   <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">{c.avatar}</div>
                   <div className="flex-1">
                      <h4 className="font-bold text-text-main-light dark:text-text-main-dark">{c.name}</h4>
                      <p className="text-xs text-gray-500">{c.id} • {c.class}</p>
                   </div>
                   <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">{c.status}</span>
                </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="animate-fade-in bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
       <h3 className="font-bold text-lg mb-6 border-b border-gray-100 dark:border-gray-700 pb-2">Student Particulars</h3>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Student Name <span className="text-red-500">*</span></label>
             <input type="text" value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm" />
          </div>
          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Academic Year</label>
             <input type="text" value={formData.academicYear} disabled className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 text-sm" />
          </div>
          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date of Birth</label>
             <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm" />
          </div>
          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gender</label>
             <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm">
                <option>Male</option><option>Female</option><option>Other</option>
             </select>
          </div>
          <div className="col-span-2">
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Residential Address</label>
             <textarea rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm"></textarea>
          </div>
       </div>
    </div>
  );

  const renderStep3 = () => {
    const sections = MOCK_SECTIONS[formData.classId] || [];
    
    return (
      <div className="animate-fade-in space-y-6">
         <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-text-main-light dark:text-text-main-dark">Academic Assignment</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Class</label>
                  <select value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value, sectionId: ''})} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm">
                     <option>Class 1</option><option>Class 5</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admission Number</label>
                  <input type="text" value={formData.admissionNo} onChange={e => setFormData({...formData, admissionNo: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm font-mono" />
               </div>
            </div>

            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Section</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {sections.map(sec => {
                  const isFull = sec.enrolled >= sec.capacity;
                  const isSelected = formData.sectionId === sec.id;
                  
                  return (
                     <div 
                        key={sec.id}
                        onClick={() => !isFull && setFormData({...formData, sectionId: sec.id})}
                        className={`p-4 rounded-xl border relative transition-all ${
                           isFull ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 opacity-70 cursor-not-allowed' : 
                           isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-primary ring-1 ring-primary cursor-pointer' : 
                           'bg-white dark:bg-card-dark border-gray-200 dark:border-gray-700 hover:border-primary/50 cursor-pointer'
                        }`}
                     >
                        <div className="flex justify-between items-center mb-2">
                           <h4 className="font-bold text-sm">{sec.name}</h4>
                           <span className="text-xs text-gray-500">{sec.classTeacher}</span>
                        </div>
                        
                        <div className="flex justify-between items-end text-xs mb-1">
                           <span className={isFull ? 'text-red-500 font-bold' : 'text-gray-500'}>
                              {isFull ? 'Full' : `${sec.capacity - sec.enrolled} Seats Left`}
                           </span>
                           <span className="font-mono">{sec.enrolled}/{sec.capacity}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                           <div className={`h-full rounded-full ${isFull ? 'bg-red-500' : sec.enrolled > sec.capacity * 0.8 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${(sec.enrolled / sec.capacity) * 100}%` }}></div>
                        </div>
                        
                        {isSelected && <div className="absolute top-2 right-2 text-primary"><span className="material-icons-outlined">check_circle</span></div>}
                     </div>
                  );
               })}
            </div>
            {sections.length === 0 && <p className="text-sm text-gray-500 italic mt-2">No sections configured for this class.</p>}
         </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-6 animate-fade-in">
       <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-text-main-light dark:text-text-main-dark">Parent & Guardian</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Parent Name</label>
                <input type="text" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm" />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile Number</label>
                <input type="tel" value={formData.parentPhone} onChange={e => setFormData({...formData, parentPhone: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm" />
             </div>
             <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                <input type="email" value={formData.parentEmail} onChange={e => setFormData({...formData, parentEmail: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm" />
             </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
             <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.createUser} onChange={e => setFormData({...formData, createUser: e.target.checked})} className="rounded text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Create Parent Portal User Account automatically</span>
             </label>
          </div>
       </div>

       <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-text-main-light dark:text-text-main-dark">Document Compliance</h3>
          
          <div className="space-y-3 mb-4">
             {['Birth Certificate', 'Transfer Certificate', 'Address Proof'].map(doc => (
                <div key={doc} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                   <span className="text-sm">{doc}</span>
                   <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                      <span className="material-icons-outlined text-sm">verified</span> Verified
                   </span>
                </div>
             ))}
          </div>

          <div className="flex items-center gap-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 rounded-lg">
             <input type="checkbox" checked={formData.docsVerified} onChange={e => setFormData({...formData, docsVerified: e.target.checked})} className="rounded text-yellow-600 focus:ring-yellow-500" />
             <span className="text-sm text-yellow-800 dark:text-yellow-200">I confirm all mandatory physical documents have been verified.</span>
          </div>

          {!formData.docsVerified && (
             <div className="mt-3">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                   <input type="checkbox" checked={formData.docOverride} onChange={e => setFormData({...formData, docOverride: e.target.checked})} className="rounded text-red-500 focus:ring-red-500" />
                   <span className="text-sm font-medium text-red-600 dark:text-red-400">Override Missing Documents (Admin Only)</span>
                </label>
                {formData.docOverride && (
                   <textarea 
                      placeholder="Reason for override (e.g., Undertaking signed by parent)..." 
                      value={formData.docOverrideReason}
                      onChange={e => setFormData({...formData, docOverrideReason: e.target.value})}
                      className="w-full p-2 border border-red-200 dark:border-red-900 rounded bg-red-50 dark:bg-red-900/10 text-sm outline-none"
                   ></textarea>
                )}
             </div>
          )}
       </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="animate-fade-in space-y-6">
       <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-text-main-light dark:text-text-main-dark">Final Review</h3>
          
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
             <div><span className="text-gray-500 block text-xs">Student</span><span className="font-bold">{formData.studentName}</span></div>
             <div><span className="text-gray-500 block text-xs">Class</span><span className="font-bold">{formData.classId} - {MOCK_SECTIONS[formData.classId]?.find(s => s.id === formData.sectionId)?.name}</span></div>
             <div><span className="text-gray-500 block text-xs">Parent</span><span className="font-bold">{formData.parentName}</span></div>
             <div><span className="text-gray-500 block text-xs">Fees</span><span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">{formData.feeRecordId}</span></div>
             <div><span className="text-gray-500 block text-xs">Admission No</span><span className="font-mono">{formData.admissionNo}</span></div>
             <div><span className="text-gray-500 block text-xs">Academic Year</span><span>{formData.academicYear}</span></div>
          </div>
       </div>

       <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl flex items-start gap-3">
          <span className="material-icons-outlined text-blue-600">info</span>
          <div>
             <h4 className="font-bold text-sm text-blue-800 dark:text-blue-300">Action Summary</h4>
             <ul className="text-xs text-blue-700 dark:text-blue-200 mt-1 space-y-1 list-disc pl-4">
                <li>Create Student Record in Academics Module.</li>
                {formData.createUser && <li>Create Parent User account and send credentials via SMS/Email.</li>}
                <li>Update Class Section headcount.</li>
                <li>Archive Admission Application.</li>
             </ul>
          </div>
       </div>
    </div>
  );

  // --- Success View ---
  if (isSuccess) {
    return (
        <div className="h-full flex flex-col items-center justify-center animate-fade-in space-y-6 p-8">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                <span className="material-icons-outlined text-5xl">check_circle</span>
            </div>
            <h2 className="text-3xl font-bold text-text-main-light dark:text-text-main-dark">Enrollment Complete!</h2>
            <p className="text-gray-500 max-w-md text-center">
                {formData.studentName} has been successfully enrolled in Class {formData.classId}.
            </p>
            
            <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-md space-y-4">
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                    <span className="text-gray-500">Student ID</span>
                    <span className="font-mono font-bold text-lg">{generatedId}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                    <span className="text-gray-500">Admission No</span>
                    <span className="font-mono font-bold">{formData.admissionNo}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Section Assigned</span>
                    <span className="font-bold">{MOCK_SECTIONS[formData.classId]?.find(s => s.id === formData.sectionId)?.name}</span>
                </div>
            </div>

            <div className="flex gap-4">
                <button 
                    onClick={() => {
                        // Reset all state
                        setStep(1); setIsSuccess(false); setFormData({...formData, studentName: '', sectionId: ''});
                    }} 
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                    Enroll Another
                </button>
                <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm flex items-center gap-2">
                    <span className="material-icons-outlined text-sm">print</span> Print Admission Slip
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Stepper Header */}
      <div className="px-4 py-6 bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-700 mb-6">
         <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center relative">
               {/* Progress Bar Background */}
               <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-0 -translate-y-1/2"></div>
               {/* Progress Bar Active */}
               <div className="absolute left-0 top-1/2 h-1 bg-primary -z-0 -translate-y-1/2 transition-all duration-300" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>

               {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                        ${step >= s ? 'bg-primary text-white shadow-md scale-110' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                        {s}
                     </div>
                     <span className={`text-[10px] font-medium uppercase ${step === s ? 'text-primary' : 'text-gray-400'}`}>
                        {['Source', 'Details', 'Academic', 'Guardian', 'Finalize'][s-1]}
                     </span>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full px-4 pb-20">
         {step === 1 && renderStep1()}
         {step === 2 && renderStep2()}
         {step === 3 && renderStep3()}
         {step === 4 && renderStep4()}
         {step === 5 && renderStep5()}
      </div>

      {/* Footer Controls */}
      <div className="fixed bottom-0 left-64 right-0 p-4 bg-white dark:bg-card-dark border-t border-gray-200 dark:border-gray-700 flex justify-between items-center z-10 lg:pl-8">
         <button 
            onClick={handleBack}
            disabled={step === 1}
            className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
         >
            Back
         </button>
         
         {step < 5 ? (
            <button 
                onClick={handleNext}
                className="px-8 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-lg transition-transform active:scale-95"
            >
                Next Step
            </button>
         ) : (
            <button 
                onClick={() => setIsConfirmModalOpen(true)}
                className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-lg transition-transform active:scale-95 flex items-center gap-2"
            >
                <span className="material-icons-outlined text-sm">check_circle</span> Confirm Enrollment
            </button>
         )}
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsConfirmModalOpen(false)}></div>
            <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-in-down">
               <div className="p-6">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                     <span className="material-icons-outlined text-2xl">person_add</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-2">Confirm Enrollment</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                     You are about to enroll <span className="font-bold text-gray-900 dark:text-white">{formData.studentName}</span> into <span className="font-bold text-gray-900 dark:text-white">{formData.classId}</span> - Section <span className="font-bold text-gray-900 dark:text-white">{MOCK_SECTIONS[formData.classId]?.find(s => s.id === formData.sectionId)?.name}</span>.
                     <br/><br/>
                     This will create a permanent student record in Academics and send login credentials to <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">{formData.parentPhone}</span>.
                     <br/><br/>
                     Proceed?
                  </p>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-xs text-gray-500 mb-6 border border-gray-200 dark:border-gray-700">
                     <span className="font-bold uppercase block mb-1">Auto-Sent Message Preview:</span>
                     {TEMPLATES.welcome(formData.studentName, formData.parentName, formData.classId, 'Sec A', 'ST-2025...')}
                  </div>

                  <div className="flex justify-end gap-3">
                     <button onClick={() => setIsConfirmModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                     <button onClick={handleFinalize} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md">Yes, Enroll Student</button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
