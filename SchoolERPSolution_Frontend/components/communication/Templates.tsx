
import React, { useState } from 'react';

// --- Types ---
type Channel = 'SMS' | 'Email' | 'Push' | 'WhatsApp';
type Category = 'Academic' | 'Financial' | 'Emergency' | 'Events' | 'General' | 'Admissions';

interface Template {
  id: string;
  title: string;
  category: Category;
  channels: Channel[];
  subject?: string; // For Email
  body: string;
  lastEdited: string;
  variables: string[];
}

// --- Mock Data ---
const MOCK_TEMPLATES: Template[] = [
  {
    id: 't1',
    title: 'Fee Reminder (First Warning)',
    category: 'Financial',
    channels: ['SMS', 'WhatsApp'],
    body: 'Dear Parent, the fee of {{amount}} for {{student_name}} is due on {{date}}. Please pay via the portal to avoid late fees.',
    lastEdited: '2024-10-01',
    variables: ['amount', 'student_name', 'date']
  },
  {
    id: 't2',
    title: 'Exam Schedule Announcement',
    category: 'Academic',
    channels: ['Email', 'Push'],
    subject: 'Mid-Term Exam Schedule Released',
    body: 'Dear Parent/Student, the schedule for the upcoming {{exam_name}} has been published. Exams start from {{start_date}}. Check the portal for details.',
    lastEdited: '2024-09-15',
    variables: ['exam_name', 'start_date']
  },
  {
    id: 't3',
    title: 'Emergency School Closure',
    category: 'Emergency',
    channels: ['SMS', 'Push', 'Email'],
    subject: 'URGENT: School Closed Tomorrow',
    body: 'Due to {{reason}}, school will remain closed on {{date}}. Online classes will be held as per schedule.',
    lastEdited: '2024-08-20',
    variables: ['reason', 'date']
  },
  {
    id: 't4',
    title: 'PTM Invitation',
    category: 'Events',
    channels: ['Email', 'WhatsApp'],
    subject: 'Invitation: Parent Teacher Meeting',
    body: 'We invite you to the PTM for {{student_name}} on {{date}} at {{time}}. Your slot is {{slot}}. Please be on time.',
    lastEdited: '2024-10-05',
    variables: ['student_name', 'date', 'time', 'slot']
  },
  // --- New Admissions Templates ---
  {
    id: 'adm_1',
    title: 'Enquiry Acknowledgement',
    category: 'Admissions',
    channels: ['SMS'],
    body: 'Hello {{parent_name}}, thank you for contacting {{school_name}} about admission for {{applicant_name}} to Class {{class}}. We will contact you shortly to schedule a visit. - Admissions Team',
    lastEdited: '2024-10-26',
    variables: ['parent_name', 'school_name', 'applicant_name', 'class']
  },
  {
    id: 'adm_2',
    title: 'Application Received',
    category: 'Admissions',
    channels: ['Email'],
    subject: 'Application Received — {{school_name}}',
    body: 'Dear {{parent_name}}, We have received the application for {{applicant_name}} for Class {{class}}. Your application ID is {{application_id}}. Please upload the required documents: {{doc_list}}. For queries call {{phone}}.',
    lastEdited: '2024-10-26',
    variables: ['parent_name', 'applicant_name', 'class', 'application_id', 'doc_list', 'phone']
  },
  {
    id: 'adm_3',
    title: 'Interview Invite',
    category: 'Admissions',
    channels: ['SMS'],
    body: 'Your interview for {{applicant_name}} is scheduled on {{date}} at {{time}} in {{location}}. Please carry original documents.',
    lastEdited: '2024-10-26',
    variables: ['applicant_name', 'date', 'time', 'location']
  },
  {
    id: 'adm_4',
    title: 'Offer Letter',
    category: 'Admissions',
    channels: ['Email'],
    subject: 'Offer of Admission — {{school_name}}',
    body: 'Dear {{parent_name}}, We are pleased to offer admission to {{applicant_name}} for Class {{class}} for session {{year}}. Please complete payment of ₹{{fee_amount}} by {{due_date}} to confirm the seat. Click: {{payment_link}}.',
    lastEdited: '2024-10-26',
    variables: ['parent_name', 'applicant_name', 'class', 'year', 'fee_amount', 'due_date', 'payment_link']
  },
  {
    id: 'adm_5',
    title: 'Payment Receipt',
    category: 'Admissions',
    channels: ['Email'],
    subject: 'Payment Receipt - {{invoice_id}}',
    body: 'Payment received for {{applicant_name}} — Invoice {{invoice_id}} — Amount: ₹{{amount}} — Date: {{paid_at}}.',
    lastEdited: '2024-10-26',
    variables: ['applicant_name', 'invoice_id', 'amount', 'paid_at']
  },
  {
    id: 'adm_6',
    title: 'Enrollment Confirmation',
    category: 'Admissions',
    channels: ['SMS', 'Email'],
    subject: 'Welcome to {{school_name}}!',
    body: 'Welcome {{parent_name}}! {{applicant_name}} is enrolled in Class {{class}} Section {{section}}. Student ID: {{student_id}}. Login details sent to your email.',
    lastEdited: '2024-10-26',
    variables: ['parent_name', 'applicant_name', 'class', 'section', 'student_id']
  },
  {
    id: 'adm_7',
    title: 'Missing Documents Reminder',
    category: 'Admissions',
    channels: ['SMS'],
    body: 'Reminder: Documents missing for {{applicant_name}}: {{doc_list}}. Please upload or bring originals to the office within 7 days.',
    lastEdited: '2024-10-26',
    variables: ['applicant_name', 'doc_list']
  },
  {
    id: 'adm_8',
    title: 'Rejection Notification',
    category: 'Admissions',
    channels: ['Email'],
    subject: 'Application Status — {{school_name}}',
    body: 'Dear {{parent_name}}, We regret to inform you that we are unable to offer admission at this time. Reason: {{reason}}. For feedback, contact admissions.',
    lastEdited: '2024-10-26',
    variables: ['parent_name', 'reason']
  }
];

const AVAILABLE_TOKENS = [
  { label: 'Student Name', value: '{{student_name}}' },
  { label: 'Parent Name', value: '{{parent_name}}' },
  { label: 'Class/Section', value: '{{class}}' },
  { label: 'Fee Amount', value: '{{amount}}' },
  { label: 'Date', value: '{{date}}' },
  { label: 'Time', value: '{{time}}' },
  { label: 'Exam Name', value: '{{exam_name}}' },
  { label: 'Applicant Name', value: '{{applicant_name}}' },
  { label: 'School Name', value: '{{school_name}}' },
];

export const Templates: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<Template>>({
    title: '',
    category: 'General',
    channels: ['SMS'],
    body: '',
    subject: ''
  });

  // --- Handlers ---

  const handleSave = () => {
    if (!editingTemplate.title || !editingTemplate.body) return alert('Title and Body are required');
    
    const newTemplate: Template = {
      id: editingTemplate.id || Date.now().toString(),
      title: editingTemplate.title!,
      category: editingTemplate.category as Category,
      channels: editingTemplate.channels as Channel[],
      subject: editingTemplate.subject,
      body: editingTemplate.body!,
      lastEdited: new Date().toISOString().split('T')[0],
      variables: [] // In real app, parse body to find regex matches
    };

    if (editingTemplate.id) {
      setTemplates(prev => prev.map(t => t.id === newTemplate.id ? newTemplate : t));
    } else {
      setTemplates(prev => [newTemplate, ...prev]);
    }
    setIsEditorOpen(false);
  };

  const deleteTemplate = (id: string) => {
    if (confirm('Delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const insertToken = (token: string) => {
    setEditingTemplate(prev => ({
      ...prev,
      body: (prev.body || '') + token
    }));
  };

  const toggleChannel = (channel: Channel) => {
    setEditingTemplate(prev => {
      const channels = prev.channels || [];
      if (channels.includes(channel)) {
        return { ...prev, channels: channels.filter(c => c !== channel) };
      }
      return { ...prev, channels: [...channels, channel] };
    });
  };

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Message Templates</h2>
          <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Manage reusable content for broadcasts and automated alerts.</p>
        </div>
        <button 
          onClick={() => {
            setEditingTemplate({ title: '', category: 'General', channels: ['SMS'], body: '', subject: '' });
            setIsEditorOpen(true);
          }}
          className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <span className="material-icons-outlined text-sm">add</span>
          Create Template
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
        
        {/* Sidebar Categories */}
        <div className="w-full md:w-64 flex flex-col gap-2 shrink-0 overflow-y-auto">
          {['All', 'Academic', 'Admissions', 'Financial', 'Emergency', 'Events', 'General'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as any)}
              className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex justify-between items-center
                ${activeCategory === cat 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'bg-white dark:bg-card-dark text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              {cat}
              {cat !== 'All' && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory === cat ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  {templates.filter(t => t.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="material-icons-outlined text-gray-400">search</span>
            </span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..." 
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4">
            {filteredTemplates.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center text-gray-400 h-64">
                <span className="material-icons-outlined text-5xl mb-2">folder_open</span>
                <p>No templates found.</p>
              </div>
            ) : (
              filteredTemplates.map(template => (
                <div key={template.id} className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2 mb-1">
                      {template.channels.map(c => (
                        <span key={c} className="px-2 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 uppercase font-bold border border-gray-200 dark:border-gray-600">
                          {c}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingTemplate(template); setIsEditorOpen(true); }}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500"
                      >
                        <span className="material-icons-outlined text-lg">edit</span>
                      </button>
                      <button 
                        onClick={() => deleteTemplate(template.id)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500"
                      >
                        <span className="material-icons-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-text-main-light dark:text-text-main-dark mb-1">{template.title}</h3>
                  {template.subject && <p className="text-xs text-text-sub-light dark:text-text-sub-dark mb-2 font-medium">Subject: {template.subject}</p>}
                  
                  <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-sm text-gray-600 dark:text-gray-300 font-mono overflow-hidden relative mb-3">
                    <p className="line-clamp-3">{template.body}</p>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-400 mt-auto">
                    <span>Modified: {template.lastEdited}</span>
                    <button className="text-primary hover:underline">Use Template</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsEditorOpen(false)}></div>
          <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-in-down">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">
                {editingTemplate.id ? 'Edit Template' : 'New Template'}
              </h3>
              <button onClick={() => setIsEditorOpen(false)}><span className="material-icons-outlined text-gray-500">close</span></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Template Name</label>
                  <input 
                    type="text" 
                    value={editingTemplate.title}
                    onChange={(e) => setEditingTemplate({...editingTemplate, title: e.target.value})}
                    className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm"
                    placeholder="e.g. Fee Reminder"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                  <select 
                    value={editingTemplate.category}
                    onChange={(e) => setEditingTemplate({...editingTemplate, category: e.target.value as Category})}
                    className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm"
                  >
                    {['Academic', 'Admissions', 'Financial', 'Emergency', 'Events', 'General'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Allowed Channels</label>
                <div className="flex gap-3">
                  {['SMS', 'Email', 'WhatsApp', 'Push'].map((ch) => (
                    <button 
                      key={ch}
                      onClick={() => toggleChannel(ch as Channel)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1
                        ${editingTemplate.channels?.includes(ch as Channel) 
                          ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300' 
                          : 'bg-white border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700'}`}
                    >
                      {editingTemplate.channels?.includes(ch as Channel) && <span className="material-icons-outlined text-xs">check</span>}
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              {editingTemplate.channels?.includes('Email') && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email Subject</label>
                  <input 
                    type="text" 
                    value={editingTemplate.subject}
                    onChange={(e) => setEditingTemplate({...editingTemplate, subject: e.target.value})}
                    className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm"
                    placeholder="Subject line..."
                  />
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-gray-500">Message Body</label>
                  <span className="text-[10px] text-gray-400">{editingTemplate.body?.length || 0} chars</span>
                </div>
                <textarea 
                  rows={6}
                  value={editingTemplate.body}
                  onChange={(e) => setEditingTemplate({...editingTemplate, body: e.target.value})}
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none text-sm font-mono"
                  placeholder="Type message content..."
                ></textarea>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2">Insert Variable Token:</p>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TOKENS.map(token => (
                    <button 
                      key={token.value}
                      onClick={() => insertToken(token.value)}
                      className="px-2 py-1 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                      title={token.label}
                    >
                      {token.value}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
              <button onClick={() => setIsEditorOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm text-sm">Save Template</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
