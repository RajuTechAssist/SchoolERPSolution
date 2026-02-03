
import React, { useState, useEffect, useRef } from 'react';

// --- Types ---
type ThreadStatus = 'Open' | 'Pending' | 'Resolved';
type Priority = 'Low' | 'Medium' | 'High';
type Channel = 'App' | 'SMS' | 'Email' | 'WhatsApp';
type UserRole = 'Parent' | 'Student' | 'Staff' | 'Teacher';

interface Message {
  id: string;
  sender: 'User' | 'Staff';
  author?: string; // Specific staff name
  text: string;
  timestamp: string;
  attachments?: string[];
  isInternal?: boolean; // For notes
}

interface ThreadActivity {
  id: string;
  type: 'Reply' | 'Status' | 'Assign' | 'Note' | 'Escalate' | 'Create';
  actor: string;
  details: string;
  timestamp: string;
}

interface Thread {
  id: number;
  user: string;
  role: UserRole; // Updated type
  contactInfo: string; // Phone/Email
  avatar: string; // Initial
  subject: string;
  channel: Channel;
  lastMessage: string;
  lastUpdated: string;
  status: ThreadStatus;
  priority: Priority;
  assignedTo?: string; // Staff ID/Name
  slaDue: number; // Timestamp
  unreadCount: number;
  isFlagged: boolean;
  tags: string[];
  messages: Message[];
  activityLog: ThreadActivity[];
}

// --- Mock Data ---
const STAFF_MEMBERS = ['Admin', 'Principal', 'Mrs. Verma', 'Mr. David', 'Front Desk', 'Counselor'];

const MOCK_THREADS: Thread[] = [
  { 
    id: 1, 
    user: 'Mrs. Sharma', 
    role: 'Parent',
    contactInfo: '+91 98765 43210',
    avatar: 'S', 
    subject: 'Fee Payment Issue', 
    channel: 'WhatsApp',
    lastMessage: 'I have already paid the fees yesterday via bank transfer. Please check...', 
    lastUpdated: '10:30 AM', 
    status: 'Open', 
    priority: 'High', 
    assignedTo: 'Front Desk', 
    slaDue: Date.now() + 3600000, // Due in 1 hour
    unreadCount: 1,
    isFlagged: false,
    tags: ['Fees', 'Finance'],
    messages: [
        { id: 'm1', sender: 'User', text: 'Hi, I paid fees yesterday but portal shows pending.', timestamp: '10:00 AM' },
        { id: 'm2', sender: 'Staff', author: 'Front Desk', text: 'Can you share the transaction ID?', timestamp: '10:15 AM' },
        { id: 'm3', sender: 'User', text: 'I have already paid the fees yesterday via bank transfer. Please check...', timestamp: '10:30 AM' }
    ],
    activityLog: [
        { id: 'a1', type: 'Assign', actor: 'System', details: 'Ticket assigned to Front Desk', timestamp: '10:00 AM' },
        { id: 'a2', type: 'Reply', actor: 'Front Desk', details: 'Replied to user', timestamp: '10:15 AM' },
        { id: 'a3', type: 'Status', actor: 'Front Desk', details: 'Changed priority to High', timestamp: '10:16 AM' }
    ]
  },
  { 
    id: 2, 
    user: 'Rahul Gupta', 
    role: 'Student', 
    contactInfo: 'rahul.g@school.edu',
    avatar: 'R', 
    subject: 'Homework Query - Physics', 
    channel: 'App',
    lastMessage: 'Is the physics assignment due tomorrow or Monday?', 
    lastUpdated: 'Yesterday', 
    status: 'Pending', 
    priority: 'Medium', 
    assignedTo: 'Mrs. Verma', 
    slaDue: Date.now() - 7200000, // Overdue by 2 hours
    unreadCount: 0,
    isFlagged: false,
    tags: ['Academic', 'Physics'],
    messages: [
        { id: 'm4', sender: 'User', text: 'Is the physics assignment due tomorrow or Monday?', timestamp: 'Yesterday, 4:00 PM' }
    ],
    activityLog: [
        { id: 'a4', type: 'Assign', actor: 'System', details: 'Routed to Physics Dept', timestamp: 'Yesterday, 4:00 PM' },
        { id: 'a5', type: 'Assign', actor: 'Mrs. Verma', details: 'Self-assigned', timestamp: 'Yesterday, 5:00 PM' }
    ]
  },
  { 
    id: 3, 
    user: 'Mr. Verma', 
    role: 'Teacher', 
    contactInfo: 't.verma@school.edu',
    avatar: 'V', 
    subject: 'Leave Application', 
    channel: 'Email',
    lastMessage: 'Approved. Take care.', 
    lastUpdated: 'Oct 12', 
    status: 'Resolved', 
    priority: 'Low', 
    assignedTo: 'Principal', 
    slaDue: Date.now() + 86400000, 
    unreadCount: 0,
    isFlagged: false,
    tags: ['HR', 'Leave'],
    messages: [
        { id: 'm5', sender: 'User', text: 'Urgent: I need to take leave tomorrow.', timestamp: 'Oct 12, 8:00 AM' },
        { id: 'm6', sender: 'Staff', author: 'Principal Anderson', text: 'Approved. Take care.', timestamp: 'Oct 12, 9:00 AM' }
    ],
    activityLog: [
        { id: 'a6', type: 'Reply', actor: 'Principal Anderson', details: 'Replied to request', timestamp: 'Oct 12, 9:00 AM' },
        { id: 'a7', type: 'Status', actor: 'Principal Anderson', details: 'Marked as Resolved', timestamp: 'Oct 12, 9:01 AM' }
    ]
  },
  {
    id: 4,
    user: 'Anonymous (Student)',
    role: 'Student',
    contactInfo: 'Hidden',
    avatar: '?',
    subject: 'Bullying Report',
    channel: 'App',
    lastMessage: 'I am scared to come to school because of the older boys near the gym.',
    lastUpdated: '10 mins ago',
    status: 'Open',
    priority: 'High',
    assignedTo: 'Counselor',
    slaDue: Date.now() + 1800000, // 30 mins
    unreadCount: 1,
    isFlagged: true,
    tags: ['Safety', 'Urgent'],
    messages: [
       { id: 'm7', sender: 'User', text: 'I am scared to come to school because of the older boys near the gym.', timestamp: '10 mins ago' }
    ],
    activityLog: [
       { id: 'a8', type: 'Escalate', actor: 'System', details: 'Auto-flagged due to keywords: "scared", "boys"', timestamp: '10 mins ago' }
    ]
  },
  {
    id: 5,
    user: 'Admin Maintenance',
    role: 'Staff',
    contactInfo: 'IT Dept',
    avatar: 'M',
    subject: 'Server Downtime Notification',
    channel: 'Email',
    lastMessage: 'Scheduled maintenance completed.',
    lastUpdated: '2 days ago',
    status: 'Resolved',
    priority: 'Low',
    assignedTo: 'Admin',
    slaDue: Date.now() - 10000000,
    unreadCount: 0,
    isFlagged: false,
    tags: ['IT'],
    messages: [{ id: 'm8', sender: 'User', text: 'Maintenance done.', timestamp: '2 days ago'}],
    activityLog: []
  }
];

const CANNED_RESPONSES = [
    { label: 'Receipt Acknowledged', text: 'We have received your query and are looking into it. Expect a response shortly.' },
    { label: 'Meeting Request', text: 'Please visit the school office tomorrow between 9 AM and 11 AM.' },
    { label: 'Fees Info', text: 'You can pay pending fees via the parent portal under the "Payments" tab.' },
    { label: 'Resolution', text: 'This issue has been resolved. Please let us know if you face further difficulties.' }
];

export const Inbox: React.FC<{ targetThreadId?: number | null; roleFilter?: string }> = ({ targetThreadId, roleFilter }) => {
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [threads, setThreads] = useState<Thread[]>(MOCK_THREADS);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Open' | 'Resolved'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [activeThreadTab, setActiveThreadTab] = useState<'conversation' | 'history'>('conversation');
  
  // Create Thread State
  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false);
  const [newThreadData, setNewThreadData] = useState({ user: '', subject: '', message: '', channel: 'SMS' as Channel });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedThreadId) {
        setActiveThreadTab('conversation');
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [selectedThreadId]);

  useEffect(() => {
    if (targetThreadId) {
      setSelectedThreadId(targetThreadId);
    } else if (threads.length > 0 && !selectedThreadId && !roleFilter) {
        // Optional: auto-select first if nothing selected
    }
  }, [targetThreadId, roleFilter]);

  // --- Helpers ---
  const selectedThread = threads.find(t => t.id === selectedThreadId);

  const getSlaStatus = (due: number, status: ThreadStatus) => {
    if (status === 'Resolved') return null;
    const now = Date.now();
    const diff = due - now;
    
    if (diff < 0) {
        return <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">Overdue</span>;
    } else if (diff < 7200000) { // < 2 hours
        return <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md">Due Soon</span>;
    }
    return <span className="text-[10px] text-gray-400 font-medium">Due {new Date(due).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>;
  };

  const getChannelIcon = (channel: Channel) => {
      switch(channel) {
          case 'SMS': return 'sms';
          case 'Email': return 'email';
          case 'WhatsApp': return 'chat';
          case 'App': return 'smartphone';
          default: return 'chat';
      }
  };

  const getChannelColorIcon = (channel: Channel) => {
      switch(channel) {
          case 'SMS': return 'text-blue-500';
          case 'Email': return 'text-purple-500';
          case 'WhatsApp': return 'text-green-500';
          case 'App': return 'text-orange-500';
      }
  };

  const updateThread = (id: number, updates: Partial<Thread>) => {
    setThreads(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleSendMessage = () => {
    if (!replyText.trim() || !selectedThread) return;
    
    const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'Staff',
        author: 'Me',
        text: replyText,
        timestamp: 'Just now'
    };

    const newActivity: ThreadActivity = {
        id: Date.now().toString(),
        type: 'Reply',
        actor: 'Me',
        details: 'Sent a reply',
        timestamp: 'Just now'
    };

    updateThread(selectedThread.id, {
        messages: [...selectedThread.messages, newMessage],
        activityLog: [...selectedThread.activityLog, newActivity],
        lastMessage: `You: ${replyText}`,
        lastUpdated: 'Just now',
        status: 'Pending' 
    });
    setReplyText('');
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleEscalate = () => {
      if(!selectedThread) return;
      if(confirm('Escalate this thread to Principal? This will flag it as High Priority.')) {
          const newActivity: ThreadActivity = {
              id: Date.now().toString(),
              type: 'Escalate',
              actor: 'Me',
              details: 'Escalated to Principal due to sensitive nature',
              timestamp: 'Just now'
          };
          updateThread(selectedThread.id, {
              priority: 'High',
              assignedTo: 'Principal',
              isFlagged: true,
              activityLog: [...selectedThread.activityLog, newActivity]
          });
      }
  };

  const handleCreateThread = () => {
      if(!newThreadData.user || !newThreadData.message) return;
      
      const newId = Math.max(...threads.map(t => t.id)) + 1;
      const newThread: Thread = {
          id: newId,
          user: newThreadData.user,
          role: 'Parent', // Default for mock
          contactInfo: 'Manual Entry',
          avatar: newThreadData.user.charAt(0),
          subject: newThreadData.subject || 'New Conversation',
          channel: newThreadData.channel,
          lastMessage: `You: ${newThreadData.message}`,
          lastUpdated: 'Just now',
          status: 'Open',
          priority: 'Medium',
          assignedTo: 'Me',
          slaDue: Date.now() + 86400000,
          unreadCount: 0,
          isFlagged: false,
          tags: ['Manual'],
          messages: [{
              id: Date.now().toString(),
              sender: 'Staff',
              author: 'Me',
              text: newThreadData.message,
              timestamp: 'Just now'
          }],
          activityLog: [{
              id: Date.now().toString(),
              type: 'Create',
              actor: 'Me',
              details: 'Started new thread',
              timestamp: 'Just now'
          }]
      };
      
      setThreads([newThread, ...threads]);
      setSelectedThreadId(newId);
      setIsNewThreadOpen(false);
      setNewThreadData({ user: '', subject: '', message: '', channel: 'SMS' });
  };

  const filteredThreads = threads.filter(t => {
    const matchesFilter = filterStatus === 'All' || t.status === filterStatus;
    const matchesRole = roleFilter ? t.role === roleFilter : true;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = t.user.toLowerCase().includes(searchLower) || 
                          t.subject.toLowerCase().includes(searchLower) ||
                          t.contactInfo.toLowerCase().includes(searchLower) ||
                          t.messages.some(m => m.text.toLowerCase().includes(searchLower));
    return matchesFilter && matchesSearch && matchesRole;
  });

  const getActivityIcon = (type: ThreadActivity['type']) => {
      switch(type) {
          case 'Reply': return 'reply';
          case 'Status': return 'sync';
          case 'Assign': return 'person_add';
          case 'Escalate': return 'warning';
          case 'Create': return 'add_comment';
          case 'Note': return 'sticky_note_2';
          default: return 'circle';
      }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden animate-fade-in relative">
      
      {/* LEFT PANEL: Thread List */}
      <div className={`${selectedThreadId ? 'hidden lg:flex' : 'flex'} w-full lg:w-96 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark z-10`}>
        {/* Search & Filter Header */}
        <div className="p-4 space-y-4 border-b border-gray-100 dark:border-gray-800">
           <div className="flex justify-between items-center">
               <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                 {roleFilter ? `${roleFilter} Messages` : 'Inbox'}
               </h2>
               <button 
                 onClick={() => setIsNewThreadOpen(true)}
                 className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors" title="New Message"
               >
                   <span className="material-icons-outlined text-xl">edit_square</span>
               </button>
           </div>
           <div className="relative group">
             <span className="material-icons-outlined absolute left-3 top-2.5 text-gray-400 group-focus-within:text-primary transition-colors">search</span>
             <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..." 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder-gray-400 font-medium" 
             />
           </div>
           <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              {['All', 'Open', 'Resolved'].map(filter => (
                  <button 
                    key={filter}
                    onClick={() => setFilterStatus(filter as any)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${filterStatus === filter ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-gray-100' : 'text-gray-500 hover:text-gray-600'}`}
                  >
                    {filter}
                  </button>
              ))}
           </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
           {filteredThreads.length === 0 ? (
             <div className="text-center py-10 text-gray-400">
               <span className="material-icons-outlined text-3xl mb-2">inbox</span>
               <p className="text-sm">No {roleFilter || ''} messages found.</p>
             </div>
           ) : (
             filteredThreads.map(thread => (
             <div 
                key={thread.id} 
                onClick={() => setSelectedThreadId(thread.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all border border-transparent ${selectedThreadId === thread.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
             >
                <div className="flex justify-between items-start mb-1">
                   <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ${thread.priority === 'High' ? 'bg-gradient-to-br from-red-400 to-red-600' : 'bg-gradient-to-br from-gray-400 to-gray-600'}`}>
                            {thread.avatar}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-card-dark rounded-full flex items-center justify-center shadow-sm`}>
                            <span className={`material-icons-outlined text-[12px] ${getChannelColorIcon(thread.channel)}`}>{getChannelIcon(thread.channel)}</span>
                        </div>
                      </div>
                      <div className="min-w-0">
                          <h4 className={`text-sm font-bold text-gray-800 dark:text-gray-100 truncate ${thread.unreadCount > 0 ? 'text-black dark:text-white' : ''}`}>{thread.user}</h4>
                          <p className="text-[11px] text-gray-500 font-medium truncate">{thread.role}</p>
                      </div>
                   </div>
                   <div className="text-right shrink-0">
                       <span className={`text-[10px] font-medium block ${thread.unreadCount > 0 ? 'text-blue-600' : 'text-gray-400'}`}>{thread.lastUpdated}</span>
                   </div>
                </div>
                
                <div className="mt-2 pl-[52px]">
                    <p className={`text-xs line-clamp-1 mb-1 ${thread.unreadCount > 0 ? 'font-bold text-gray-800 dark:text-gray-200' : 'font-medium text-gray-600 dark:text-gray-400'}`}>
                        {thread.subject}
                    </p>
                    <p className="text-[11px] text-gray-400 line-clamp-1 mb-2">{thread.lastMessage}</p>
                    
                    <div className="flex gap-2 items-center">
                        {thread.isFlagged && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[9px] font-bold rounded uppercase tracking-wide">Flagged</span>}
                        {getSlaStatus(thread.slaDue, thread.status)}
                        {thread.status === 'Resolved' && <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">Resolved</span>}
                    </div>
                </div>
             </div>
           )))}
        </div>
      </div>

      {/* RIGHT PANEL: Chat View */}
      <div className={`${!selectedThreadId ? 'hidden lg:flex' : 'flex'} flex-1 flex-col bg-gray-50/50 dark:bg-black/20 relative`}>
         {selectedThread ? (
           <>
             {/* Header */}
             <div className="h-20 px-6 flex items-center justify-between bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-700 shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedThreadId(null)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500"><span className="material-icons-outlined">arrow_back</span></button>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {selectedThread.subject}
                            {selectedThread.isFlagged && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" title="Flagged"></span>}
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{selectedThread.user}</span>
                            <span>•</span>
                            <span>{selectedThread.contactInfo}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[10px] font-medium"><span className="material-icons-outlined text-[10px]">support_agent</span> {selectedThread.assignedTo || 'Unassigned'}</span>
                        </div>
                    </div>
                </div>
                
                {/* Controls & Tabs */}
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button 
                            onClick={() => setActiveThreadTab('conversation')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeThreadTab === 'conversation' ? 'bg-white dark:bg-card-dark shadow text-gray-800 dark:text-white' : 'text-gray-500'}`}
                        >
                            Chat
                        </button>
                        <button 
                            onClick={() => setActiveThreadTab('history')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeThreadTab === 'history' ? 'bg-white dark:bg-card-dark shadow text-gray-800 dark:text-white' : 'text-gray-500'}`}
                        >
                            History
                        </button>
                    </div>

                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>

                    <select 
                        value={selectedThread.status}
                        onChange={(e) => updateThread(selectedThread.id, { status: e.target.value as ThreadStatus })}
                        className={`text-xs font-bold py-1.5 px-3 rounded-lg border outline-none cursor-pointer appearance-none ${
                            selectedThread.status === 'Open' ? 'bg-green-50 text-green-700 border-green-200' :
                            selectedThread.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                    >
                        <option value="Open">Open</option>
                        <option value="Pending">Pending</option>
                        <option value="Resolved">Resolved</option>
                    </select>

                    <button 
                        onClick={handleEscalate}
                        title="Escalate to Principal"
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors border border-transparent hover:border-red-200 hover:bg-red-50 rounded-lg"
                    >
                        <span className="material-icons-outlined">warning_amber</span>
                    </button>
                </div>
             </div>

             {/* Content Area */}
             <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-900/50 scroll-smooth">
                {activeThreadTab === 'conversation' ? (
                    <>
                        <div className="flex justify-center"><span className="text-[10px] text-gray-400 font-medium bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">Thread Started {selectedThread.messages[0].timestamp}</span></div>
                        
                        {selectedThread.messages.map(msg => (
                            <div key={msg.id} className={`flex gap-3 ${msg.sender === 'Staff' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm ${msg.sender === 'Staff' ? 'bg-blue-600' : 'bg-gray-400'}`}>
                                    {msg.sender === 'Staff' ? (msg.author ? msg.author.charAt(0) : 'M') : selectedThread.avatar}
                                </div>
                                <div className={`max-w-[80%] md:max-w-[70%]`}>
                                    {/* Author Label for Staff */}
                                    {msg.sender === 'Staff' && msg.author && (
                                        <div className="text-[10px] text-gray-500 dark:text-gray-400 text-right mb-1 mr-1 font-medium">
                                            {msg.author}
                                        </div>
                                    )}
                                    <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                                        msg.sender === 'Staff' 
                                            ? 'bg-blue-600 text-white rounded-tr-sm' 
                                            : 'bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                                    }`}>
                                        {msg.text}
                                    </div>
                                    <span className={`text-[10px] text-gray-400 font-medium block mt-1.5 ${msg.sender === 'Staff' ? 'text-right' : 'text-left'}`}>
                                        {msg.timestamp}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                ) : (
                    <div className="max-w-xl mx-auto py-4">
                        <div className="mb-8 flex items-center gap-4">
                            <div className="p-3 bg-white dark:bg-card-dark rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
                                <span className="material-icons-outlined text-gray-400">history</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-100">Audit Log</h4>
                                <p className="text-xs text-gray-500">Internal timeline of actions.</p>
                            </div>
                        </div>
                        <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-8 pb-10">
                            {selectedThread.activityLog.map((log, index) => (
                                <div key={log.id} className="ml-8 relative group">
                                    <div className={`absolute -left-[41px] top-0 w-8 h-8 rounded-full border-4 border-gray-50 dark:border-gray-900 flex items-center justify-center text-white text-xs shadow-sm z-10
                                        ${log.type === 'Reply' ? 'bg-blue-500' : 
                                          log.type === 'Status' ? 'bg-orange-500' : 
                                          log.type === 'Escalate' ? 'bg-red-500' :
                                          log.type === 'Create' ? 'bg-green-500' :
                                          log.type === 'Assign' ? 'bg-purple-500' : 'bg-gray-500'}`}>
                                        <span className="material-icons-outlined text-[14px]">{getActivityIcon(log.type)}</span>
                                    </div>
                                    <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{log.actor}</span>
                                            <span className="text-[10px] text-gray-400 font-medium">{log.timestamp}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{log.details}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
             </div>

             {/* Composer (Only visible in Conversation view) */}
             {activeThreadTab === 'conversation' && (
                 <div className="p-4 bg-white dark:bg-card-dark border-t border-gray-200 dark:border-gray-700 z-20">
                    {selectedThread.status === 'Resolved' && (
                        <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-medium text-center rounded-lg border border-green-100 dark:border-green-800">
                            This thread is marked as resolved. Replying will reopen it.
                        </div>
                    )}
                    <div className="relative">
                       <textarea 
                            rows={1}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                            placeholder="Type a reply..." 
                            className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-2xl pl-4 pr-12 py-3.5 focus:ring-2 focus:ring-primary/20 text-sm outline-none resize-none max-h-32 shadow-inner transition-shadow" 
                            style={{minHeight: '48px'}}
                        />
                        <div className="absolute right-2 bottom-2 flex items-center gap-1">
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                                <span className="material-icons-outlined text-lg">attach_file</span>
                            </button>
                            <button 
                                onClick={handleSendMessage}
                                disabled={!replyText.trim()}
                                className="bg-primary text-white p-2 rounded-full w-9 h-9 flex items-center justify-center shadow-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                            >
                                <span className="material-icons-outlined text-lg ml-0.5">send</span>
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
                        {/* Canned Responses */}
                        {CANNED_RESPONSES.map(resp => (
                            <button 
                                key={resp.label} 
                                onClick={() => setReplyText(resp.text)}
                                className="text-[10px] font-medium px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 transition-colors text-gray-600 dark:text-gray-300 whitespace-nowrap shadow-sm"
                            >
                                {resp.label}
                            </button>
                        ))}
                    </div>
                 </div>
             )}
           </>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-900/30">
              <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm mb-4">
                  <span className="material-icons-outlined text-5xl text-gray-300 dark:text-gray-600">forum</span>
              </div>
              <h3 className="text-lg font-bold text-gray-600 dark:text-gray-300">Select a conversation</h3>
              <p className="text-sm text-gray-500">Choose a thread from the list to view details.</p>
           </div>
         )}
      </div>

      {/* New Thread Modal */}
      {isNewThreadOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white dark:bg-card-dark rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-in-down">
                  <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                      <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">New Conversation</h3>
                      <button onClick={() => setIsNewThreadOpen(false)} className="hover:bg-gray-200 rounded-full p-1 transition-colors"><span className="material-icons-outlined text-gray-500">close</span></button>
                  </div>
                  <div className="p-6 space-y-5">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">To (Parent/Student)</label>
                          <input 
                            type="text" 
                            placeholder="Search name..." 
                            value={newThreadData.user}
                            onChange={(e) => setNewThreadData({...newThreadData, user: e.target.value})}
                            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Channel</label>
                              <div className="relative">
                                <select 
                                    value={newThreadData.channel}
                                    onChange={(e) => setNewThreadData({...newThreadData, channel: e.target.value as Channel})}
                                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none text-sm appearance-none"
                                >
                                    <option value="SMS">SMS</option>
                                    <option value="Email">Email</option>
                                    <option value="App">App Notification</option>
                                    <option value="WhatsApp">WhatsApp</option>
                                </select>
                                <span className="material-icons-outlined absolute right-3 top-3.5 text-gray-400 pointer-events-none text-sm">expand_more</span>
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Subject</label>
                              <input 
                                type="text" 
                                placeholder="Topic..." 
                                value={newThreadData.subject}
                                onChange={(e) => setNewThreadData({...newThreadData, subject: e.target.value})}
                                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Message</label>
                          <textarea 
                            rows={4}
                            value={newThreadData.message}
                            onChange={(e) => setNewThreadData({...newThreadData, message: e.target.value})}
                            placeholder="Type your message..."
                            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all resize-none"
                          ></textarea>
                      </div>
                  </div>
                  <div className="p-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                      <button onClick={() => setIsNewThreadOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancel</button>
                      <button onClick={handleCreateThread} className="px-6 py-2.5 text-sm font-medium bg-primary text-white rounded-xl hover:bg-blue-600 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">Send Message</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
