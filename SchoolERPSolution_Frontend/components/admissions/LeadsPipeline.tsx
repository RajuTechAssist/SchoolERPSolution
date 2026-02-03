
import React, { useState, useRef, useEffect } from 'react';

// --- Types ---
type ViewMode = 'Kanban' | 'List';
type LeadStatus = 'New' | 'Contacted' | 'App Started' | 'Docs Pending' | 'Interview' | 'Offer' | 'Fee Paid' | 'Enrolled' | 'Dropped';

interface Lead {
  id: string;
  applicantName: string;
  parentName: string;
  phone: string;
  email: string;
  preferredClass: string;
  source: string;
  status: LeadStatus;
  assignedTo: string;
  createdAt: string;
  lastContact: string;
  notes: string; // Initial note
  history: { action: string, date: string, user: string }[];
  tasks: { id: string, text: string, done: boolean, due: string }[];
}

// --- Mock Data ---
const MOCK_LEADS: Lead[] = [
  { 
    id: 'L-101', applicantName: 'Rahul Kumar', parentName: 'Mr. Kumar', 
    phone: '+91 98765 43210', email: 'rahul.k@example.com', preferredClass: 'Class 5', 
    source: 'Walk-in', status: 'New', assignedTo: 'Mrs. Verma', 
    createdAt: '2024-10-20', lastContact: '2 hours ago', notes: 'Interested in sports facilities.',
    history: [{ action: 'Created', date: '2024-10-20', user: 'Admin' }],
    tasks: [{ id: 't1', text: 'Schedule Campus Tour', done: false, due: '2024-10-25' }]
  },
  { 
    id: 'L-102', applicantName: 'Simran Singh', parentName: 'Mrs. Singh', 
    phone: '+91 98765 12345', email: 'simran.s@example.com', preferredClass: 'Class 8', 
    source: 'Website', status: 'Contacted', assignedTo: 'Admin', 
    createdAt: '2024-10-18', lastContact: 'Yesterday', notes: 'Siblings in other schools.',
    history: [{ action: 'Created', date: '2024-10-18', user: 'System' }, { action: 'SMS Sent', date: '2024-10-19', user: 'Admin' }],
    tasks: []
  },
  { 
    id: 'L-103', applicantName: 'Arjun Das', parentName: 'Mr. Das', 
    phone: '+91 91234 56789', email: 'arjun.d@example.com', preferredClass: 'Class 1', 
    source: 'Referral', status: 'Interview', assignedTo: 'Mrs. Verma', 
    createdAt: '2024-10-15', lastContact: 'Today', notes: 'Referral from existing parent (Sharma).',
    history: [{ action: 'Created', date: '2024-10-15', user: 'Admin' }, { action: 'Interview Scheduled', date: '2024-10-22', user: 'Mrs. Verma' }],
    tasks: [{ id: 't2', text: 'Collect Marksheet', done: false, due: '2024-10-24' }]
  },
  { 
    id: 'L-104', applicantName: 'Kabir Khan', parentName: 'Mrs. Khan', 
    phone: '+91 99887 76655', email: 'kabir.k@example.com', preferredClass: 'Class 9', 
    source: 'Social', status: 'Offer', assignedTo: 'Mr. David', 
    createdAt: '2024-10-10', lastContact: '3 days ago', notes: 'Scholarship applicant.',
    history: [{ action: 'Offer Letter Sent', date: '2024-10-21', user: 'System' }],
    tasks: []
  },
];

const COLUMNS: LeadStatus[] = ['New', 'Contacted', 'App Started', 'Docs Pending', 'Interview', 'Offer', 'Fee Paid', 'Enrolled'];

// --- Helper Components ---

const AdminPromptCopy: React.FC<{ label: string, text: string }> = ({ label, text }) => (
  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-800 mb-2">
    <div className="flex justify-between items-center mb-1">
      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase">{label}</span>
      <button 
        onClick={() => { navigator.clipboard.writeText(text); alert('Copied to clipboard!'); }}
        className="text-[10px] text-primary hover:underline flex items-center gap-1"
      >
        <span className="material-icons-outlined text-[10px]">content_copy</span> Copy
      </button>
    </div>
    <p className="text-xs text-gray-600 dark:text-gray-400 font-mono bg-white dark:bg-gray-800 p-1.5 rounded border border-blue-100 dark:border-blue-900/50 break-words whitespace-pre-wrap">{text}</p>
  </div>
);

export const LeadsPipeline: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('Kanban');
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Slide-over State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [slideOverTab, setSlideOverTab] = useState<'info' | 'comm' | 'tasks'>('info');

  // New Lead Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<Lead | null>(null);
  const [newLeadForm, setNewLeadForm] = useState({
    applicantName: '',
    parentName: '',
    phone: '',
    email: '',
    preferredClass: 'Class 1',
    source: 'Walk-in',
    assignedTo: 'Admin',
    notes: ''
  });

  // DnD State
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // --- Handlers ---

  const handleDuplicateCheck = (phone: string) => {
    const exists = leads.find(l => l.phone === phone);
    setDuplicateWarning(exists || null);
  };

  const handleAddLead = () => {
    if (!newLeadForm.applicantName || !newLeadForm.phone || !newLeadForm.preferredClass || !newLeadForm.source) {
      alert('Please fill all required fields (*)');
      return;
    }

    const newLead: Lead = {
      id: `L-${100 + leads.length + 1}`,
      ...newLeadForm,
      status: 'New',
      createdAt: new Date().toISOString().split('T')[0],
      lastContact: 'Just now',
      history: [{ action: 'Lead Created', date: new Date().toISOString().split('T')[0], user: 'Admin' }],
      tasks: []
    };

    setLeads([newLead, ...leads]);
    setIsModalOpen(false);
    setNewLeadForm({ applicantName: '', parentName: '', phone: '', email: '', preferredClass: 'Class 1', source: 'Walk-in', assignedTo: 'Admin', notes: '' });
    setDuplicateWarning(null);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    if (!draggedLeadId) return;

    setLeads(prev => prev.map(l => {
      if (l.id === draggedLeadId && l.status !== status) {
        // Update history
        const historyEntry = { 
          action: `Moved to ${status}`, 
          date: new Date().toISOString().split('T')[0], 
          user: 'Admin' 
        };
        return { ...l, status, history: [historyEntry, ...l.history] };
      }
      return l;
    }));
    setDraggedLeadId(null);
  };

  const filteredLeads = leads.filter(l => 
    l.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.phone.includes(searchQuery) ||
    l.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Renderers ---

  const renderKanban = () => (
    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-220px)] snap-x">
      {COLUMNS.map(status => {
        const columnLeads = filteredLeads.filter(l => l.status === status);
        return (
          <div 
            key={status} 
            className="min-w-[280px] w-72 flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 h-full snap-start transition-colors"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-100 dark:bg-gray-800 rounded-t-xl sticky top-0 z-10">
              <h4 className="font-bold text-sm text-gray-700 dark:text-gray-200">{status}</h4>
              <span className="text-xs font-bold bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-500 border border-gray-200 dark:border-gray-600">
                {columnLeads.length}
              </span>
            </div>
            <div className="p-2 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
              {columnLeads.map(lead => (
                <div 
                  key={lead.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  onClick={() => setSelectedLead(lead)}
                  className="bg-white dark:bg-card-dark p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-grab active:cursor-grabbing group relative"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h5 className="font-bold text-sm text-text-main-light dark:text-text-main-dark truncate w-3/4">{lead.applicantName}</h5>
                    <span className="text-[10px] text-gray-400">{lead.lastContact}</span>
                  </div>
                  <div className="flex gap-2 mb-2">
                     <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">{lead.preferredClass}</span>
                     <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">{lead.source}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <span className="material-icons-outlined text-[10px]">person</span> {lead.assignedTo}
                    </span>
                    <button className="text-primary hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-icons-outlined text-sm">edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderList = () => (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="overflow-auto">
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
            <tr>
                <th className="px-6 py-3 whitespace-nowrap">Lead ID</th>
                <th className="px-6 py-3 whitespace-nowrap">Applicant Name</th>
                <th className="px-6 py-3 whitespace-nowrap">Phone</th>
                <th className="px-6 py-3 whitespace-nowrap">Class</th>
                <th className="px-6 py-3 whitespace-nowrap">Source</th>
                <th className="px-6 py-3 whitespace-nowrap">Status</th>
                <th className="px-6 py-3 whitespace-nowrap">Assigned To</th>
                <th className="px-6 py-3 whitespace-nowrap">Created</th>
                <th className="px-6 py-3 whitespace-nowrap text-right">Actions</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td className="px-6 py-3 font-mono text-xs text-gray-500">{lead.id}</td>
                <td className="px-6 py-3 font-medium text-text-main-light dark:text-text-main-dark">
                    {lead.applicantName}
                    <div className="text-xs text-gray-400 font-normal">{lead.parentName}</div>
                </td>
                <td className="px-6 py-3 font-mono text-xs">{lead.phone}</td>
                <td className="px-6 py-3">{lead.preferredClass}</td>
                <td className="px-6 py-3 text-gray-500">{lead.source}</td>
                <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                    ${lead.status === 'New' ? 'bg-blue-100 text-blue-700' :
                        lead.status === 'Enrolled' ? 'bg-green-100 text-green-700' :
                        lead.status === 'Offer' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>{lead.status}</span>
                </td>
                <td className="px-6 py-3 text-xs">{lead.assignedTo}</td>
                <td className="px-6 py-3 text-xs text-gray-500">{lead.createdAt}</td>
                <td className="px-6 py-3 text-right">
                    <button onClick={() => setSelectedLead(lead)} className="text-primary hover:underline text-xs font-medium">Details</button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="relative flex-1 md:w-72">
             <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
               <span className="material-icons-outlined text-lg">search</span>
             </span>
             <input 
               type="text" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder='Search by name, phone or ID (e.g. "Rahul")' 
               className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-1 focus:ring-primary"
             />
           </div>
           <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button onClick={() => setViewMode('Kanban')} className={`p-1.5 rounded ${viewMode === 'Kanban' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}><span className="material-icons-outlined">view_kanban</span></button>
              <button onClick={() => setViewMode('List')} className={`p-1.5 rounded ${viewMode === 'List' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}><span className="material-icons-outlined">table_rows</span></button>
           </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <span className="material-icons-outlined text-sm">person_add</span> New Enquiry
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'Kanban' ? renderKanban() : renderList()}
      </div>

      {/* Slide-over Detail Panel */}
      {selectedLead && (
        <div className="fixed inset-0 z-40 overflow-hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedLead(null)}></div>
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white dark:bg-card-dark shadow-2xl flex flex-col animate-slide-in-right">
             
             {/* Slide-over Header */}
             <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-start">
                <div>
                   <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">{selectedLead.applicantName}</h2>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">{selectedLead.id}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                      <span className="text-sm font-medium text-primary">{selectedLead.status}</span>
                   </div>
                </div>
                <button onClick={() => setSelectedLead(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500">
                   <span className="material-icons-outlined">close</span>
                </button>
             </div>

             {/* Slide-over Tabs */}
             <div className="flex border-b border-gray-200 dark:border-gray-700">
                {['info', 'comm', 'tasks'].map(tab => (
                   <button 
                      key={tab}
                      onClick={() => setSlideOverTab(tab as any)}
                      className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${slideOverTab === tab ? 'border-primary text-primary bg-blue-50/50 dark:bg-blue-900/10' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                   >
                      {tab === 'info' ? 'Overview' : tab === 'comm' ? 'Communication' : 'Tasks & Notes'}
                   </button>
                ))}
             </div>

             {/* Slide-over Content */}
             <div className="flex-1 overflow-y-auto p-5">
                {slideOverTab === 'info' && (
                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                            <span className="text-xs text-gray-500 block mb-1">Class</span>
                            <span className="font-bold text-gray-800 dark:text-gray-200">{selectedLead.preferredClass}</span>
                         </div>
                         <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                            <span className="text-xs text-gray-500 block mb-1">Source</span>
                            <span className="font-bold text-gray-800 dark:text-gray-200">{selectedLead.source}</span>
                         </div>
                      </div>

                      <div>
                         <h4 className="text-xs font-bold uppercase text-gray-400 mb-3">Contact Details</h4>
                         <div className="space-y-3">
                            <div className="flex items-center gap-3">
                               <span className="material-icons-outlined text-gray-400">person</span>
                               <div>
                                  <p className="text-sm font-medium">Parent: {selectedLead.parentName}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-3">
                               <span className="material-icons-outlined text-gray-400">phone</span>
                               <div>
                                  <p className="text-sm font-medium">{selectedLead.phone}</p>
                                  <div className="flex gap-2 mt-1">
                                     <button className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 flex items-center gap-1 hover:bg-green-100">
                                        <span className="material-icons-outlined text-[10px]">chat</span> WhatsApp
                                     </button>
                                     <button className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1 hover:bg-blue-100">
                                        <span className="material-icons-outlined text-[10px]">call</span> Call
                                     </button>
                                  </div>
                               </div>
                            </div>
                            <div className="flex items-center gap-3">
                               <span className="material-icons-outlined text-gray-400">email</span>
                               <p className="text-sm font-medium">{selectedLead.email || 'N/A'}</p>
                            </div>
                         </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                         <h4 className="text-xs font-bold uppercase text-gray-400 mb-3">System Info</h4>
                         <div className="text-xs text-gray-500 space-y-1">
                            <p>Assigned Officer: <span className="font-medium text-gray-700 dark:text-gray-300">{selectedLead.assignedTo}</span></p>
                            <p>Created At: {selectedLead.createdAt}</p>
                            <p>Last Activity: {selectedLead.lastContact}</p>
                         </div>
                      </div>
                   </div>
                )}

                {slideOverTab === 'comm' && (
                   <div className="space-y-4">
                      <AdminPromptCopy 
                        label="Follow-up Template (SMS/WhatsApp)" 
                        text={`Hello ${selectedLead.parentName}, this is Springfield Academy. We received your enquiry for admission to ${selectedLead.preferredClass}. Would you like to schedule a visit or a call? Reply YES to confirm.`} 
                      />
                      
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/30">
                         <textarea className="w-full bg-transparent border-none text-sm outline-none resize-none" rows={3} placeholder="Type internal note or log a call..."></textarea>
                         <div className="flex justify-between items-center mt-2">
                            <div className="flex gap-2">
                               <button className="p-1 hover:bg-gray-200 rounded text-gray-500"><span className="material-icons-outlined text-sm">attach_file</span></button>
                            </div>
                            <button className="px-3 py-1 bg-primary text-white text-xs rounded hover:bg-blue-600">Log Activity</button>
                         </div>
                      </div>

                      <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-6 pb-4">
                         {selectedLead.history.map((h, i) => (
                            <div key={i} className="ml-6 relative">
                               <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-gray-300 border-2 border-white dark:border-card-dark"></div>
                               <p className="text-sm font-medium">{h.action}</p>
                               <p className="text-xs text-gray-500">{h.date} • {h.user}</p>
                            </div>
                         ))}
                      </div>
                   </div>
                )}

                {slideOverTab === 'tasks' && (
                   <div className="space-y-4">
                      <div className="flex gap-2">
                         <input type="text" placeholder="Add a task..." className="flex-1 p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800" />
                         <input type="date" className="w-32 p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800" />
                         <button className="p-2 bg-primary text-white rounded-lg"><span className="material-icons-outlined text-sm">add</span></button>
                      </div>

                      <div className="space-y-2">
                         {selectedLead.tasks.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">No pending tasks.</p>
                         ) : (
                            selectedLead.tasks.map(task => (
                               <div key={task.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                                  <input type="checkbox" defaultChecked={task.done} className="rounded text-primary focus:ring-primary" />
                                  <div className="flex-1">
                                     <p className={`text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>{task.text}</p>
                                     <p className="text-[10px] text-red-500">Due: {task.due}</p>
                                  </div>
                               </div>
                            ))
                         )}
                      </div>

                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                         <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Notes</h4>
                         <p className="text-sm text-gray-600 dark:text-gray-300 italic">{selectedLead.notes || 'No initial notes.'}</p>
                      </div>
                   </div>
                )}
             </div>

             {/* Footer Actions */}
             <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark flex gap-2">
                <button 
                   onClick={() => alert('Application form pre-filled and launched!')}
                   className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 shadow-sm transition-colors"
                >
                   Convert to Application
                </button>
             </div>
          </div>
        </div>
      )}

      {/* New Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
           <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-in-down flex flex-col max-h-[90vh]">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                 <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">New Enquiry</h3>
                 <button onClick={() => setIsModalOpen(false)}><span className="material-icons-outlined text-gray-500">close</span></button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-4">
                 <AdminPromptCopy 
                    label="Quick Note Template" 
                    text={`Walk-in enquiry: ${newLeadForm.applicantName || '{child_name}'}, interested in ${newLeadForm.preferredClass} intake 2025. Contact: ${newLeadForm.phone || '{phone}'}. Next step: schedule call.`} 
                 />

                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Applicant Name <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={newLeadForm.applicantName} 
                            onChange={e => setNewLeadForm({...newLeadForm, applicantName: e.target.value})} 
                            className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary" 
                            placeholder="Full name" 
                        />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Parent Name</label>
                        <input 
                            type="text" 
                            value={newLeadForm.parentName} 
                            onChange={e => setNewLeadForm({...newLeadForm, parentName: e.target.value})} 
                            className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary" 
                            placeholder="Parent/Guardian" 
                        />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Primary Phone <span className="text-red-500">*</span></label>
                        <input 
                            type="tel" 
                            value={newLeadForm.phone} 
                            onChange={e => {
                                setNewLeadForm({...newLeadForm, phone: e.target.value});
                                handleDuplicateCheck(e.target.value);
                            }} 
                            className={`w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 ${duplicateWarning ? 'border-orange-500 focus:ring-orange-500' : 'border-gray-200 dark:border-gray-600 focus:ring-primary'}`} 
                            placeholder="+91..." 
                        />
                        {duplicateWarning && (
                            <p className="text-[10px] text-orange-500 mt-1 flex items-center gap-1">
                                <span className="material-icons-outlined text-[10px]">warning</span> 
                                Duplicate found: {duplicateWarning.applicantName} ({duplicateWarning.status})
                            </p>
                        )}
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                        <input 
                            type="email" 
                            value={newLeadForm.email} 
                            onChange={e => setNewLeadForm({...newLeadForm, email: e.target.value})} 
                            className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary" 
                            placeholder="Email address" 
                        />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Preferred Class <span className="text-red-500">*</span></label>
                       <select value={newLeadForm.preferredClass} onChange={e => setNewLeadForm({...newLeadForm, preferredClass: e.target.value})} className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none">
                          <option>Class 1</option><option>Class 5</option><option>Class 8</option><option>Class 9</option><option>Class 10</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Source <span className="text-red-500">*</span></label>
                       <select value={newLeadForm.source} onChange={e => setNewLeadForm({...newLeadForm, source: e.target.value})} className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none">
                          <option>Walk-in</option><option>Website</option><option>Referral</option><option>Social</option><option>Agent</option>
                       </select>
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assigned Officer</label>
                    <select value={newLeadForm.assignedTo} onChange={e => setNewLeadForm({...newLeadForm, assignedTo: e.target.value})} className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none">
                        <option>Admin</option><option>Mrs. Verma</option><option>Mr. David</option>
                    </select>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Initial Notes</label>
                    <textarea 
                        rows={2} 
                        value={newLeadForm.notes} 
                        onChange={e => setNewLeadForm({...newLeadForm, notes: e.target.value})} 
                        className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary" 
                        placeholder="e.g. Sibling in Class 8..."
                    ></textarea>
                 </div>
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800/50">
                 <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm">Cancel</button>
                 <button onClick={handleAddLead} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm text-sm">Create Lead</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
