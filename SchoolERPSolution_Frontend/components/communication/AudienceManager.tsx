
import React, { useState, useRef } from 'react';

// --- Types ---
type GroupType = 'Static' | 'Dynamic' | 'System' | 'Suppression';
type RecipientRole = 'Student' | 'Parent' | 'Teacher' | 'Staff';

interface AudienceGroup {
  id: string;
  name: string;
  description: string;
  type: GroupType;
  count: number;
  lastSync: string;
  rules?: Rule[]; // For dynamic groups
  tags: string[];
}

interface Recipient {
  id: string;
  name: string;
  role: RecipientRole;
  contact: string; // Email or Phone
  class?: string;
  status: 'Active' | 'Unsubscribed' | 'Bounced';
}

interface Rule {
  id: string;
  field: string;
  operator: string;
  value: string;
  logic: 'AND' | 'OR';
}

// --- Mock Data ---
const MOCK_GROUPS: AudienceGroup[] = [
  { id: 'g1', name: 'All Parents', description: 'Main parent contact list synced with SIS', type: 'System', count: 1240, lastSync: 'Just now', tags: ['Official', 'Sync'], rules: [] },
  { id: 'g2', name: 'Fee Defaulters (Q3)', description: 'Parents with outstanding balance > $500', type: 'Dynamic', count: 45, lastSync: '2 hours ago', tags: ['Finance', 'Alert'], rules: [{ id: 'r1', field: 'Fee Balance', operator: '>', value: '500', logic: 'AND' }] },
  { id: 'g3', name: 'Class 10-A Parents', description: 'Manual list for Class 10-A', type: 'Static', count: 32, lastSync: '1 day ago', tags: ['Academic'], rules: [] },
  { id: 'g4', name: 'Science Fair Volunteers', description: 'Imported from signup sheet', type: 'Static', count: 18, lastSync: '3 days ago', tags: ['Event', 'Volunteer'], rules: [] },
  { id: 'g5', name: 'Do Not Contact', description: 'Opt-outs and blocked numbers', type: 'Suppression', count: 12, lastSync: 'Auto', tags: ['Legal'], rules: [] },
  { id: 'g6', name: 'At-Risk Attendance', description: 'Students below 75% attendance', type: 'Dynamic', count: 28, lastSync: '1 hour ago', tags: ['Academic', 'Warning'], rules: [{ id: 'r2', field: 'Attendance', operator: '<', value: '75', logic: 'AND' }] },
];

const MOCK_RECIPIENTS: Recipient[] = [
  { id: 'r1', name: 'John Doe', role: 'Parent', contact: 'john@example.com', class: '10-A', status: 'Active' },
  { id: 'r2', name: 'Jane Smith', role: 'Parent', contact: 'jane@example.com', class: '10-B', status: 'Active' },
  { id: 'r3', name: 'Robert Brown', role: 'Parent', contact: '+1 555-0123', class: '9-C', status: 'Bounced' },
  { id: 'r4', name: 'Emily Davis', role: 'Student', contact: 'emily.d@school.edu', class: '11-A', status: 'Active' },
  { id: 'r5', name: 'Michael Wilson', role: 'Teacher', contact: 'm.wilson@school.edu', status: 'Active' },
];

export const AudienceManager: React.FC = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groups, setGroups] = useState<AudienceGroup[]>(MOCK_GROUPS);
  
  // Sidebar Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<GroupType | 'All'>('All');
  const [filterTag, setFilterTag] = useState('');

  // Detail View State
  const [recipientSearch, setRecipientSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'dynamic' | 'import' | 'manual'>('dynamic');
  
  // Builder State
  const [newGroupRules, setNewGroupRules] = useState<Rule[]>([{ id: '1', field: 'Class', operator: 'Equals', value: '', logic: 'AND' }]);
  const [newGroupName, setNewGroupName] = useState('');

  // Import State
  const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'complete'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Helpers ---
  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  const getGroupIcon = (type: GroupType) => {
    switch (type) {
      case 'System': return 'dns';
      case 'Dynamic': return 'auto_fix_high';
      case 'Static': return 'list';
      case 'Suppression': return 'block';
      default: return 'group';
    }
  };

  const getGroupColor = (type: GroupType) => {
    switch (type) {
      case 'System': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'Dynamic': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      case 'Static': return 'text-gray-600 bg-gray-50 dark:bg-gray-800';
      case 'Suppression': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-500';
    }
  };

  const handleAddRule = () => {
    setNewGroupRules([...newGroupRules, { id: Date.now().toString(), field: 'Class', operator: 'Equals', value: '', logic: 'AND' }]);
  };

  const removeRule = (id: string) => {
    setNewGroupRules(newGroupRules.filter(r => r.id !== id));
  };

  const updateRule = (id: string, field: keyof Rule, value: string) => {
    setNewGroupRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImportStatus('uploading');
      setTimeout(() => setImportStatus('analyzing'), 1000);
      setTimeout(() => setImportStatus('complete'), 2500);
    }
  };

  const handleCreateGroup = () => {
    const newGroup: AudienceGroup = {
      id: Date.now().toString(),
      name: newGroupName || 'New Audience Group',
      description: modalTab === 'dynamic' ? 'Custom Smart Cohort' : 'Imported List',
      type: modalTab === 'dynamic' ? 'Dynamic' : 'Static',
      count: Math.floor(Math.random() * 50) + 10,
      lastSync: 'Just now',
      tags: ['New'],
      rules: modalTab === 'dynamic' ? newGroupRules : []
    };
    setGroups([newGroup, ...groups]);
    setIsModalOpen(false);
    setSelectedGroupId(newGroup.id);
    // Reset
    setNewGroupName('');
    setNewGroupRules([{ id: '1', field: 'Class', operator: 'Equals', value: '', logic: 'AND' }]);
    setImportStatus('idle');
  };

  const filteredGroups = groups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || g.type === filterType;
    const matchesTag = filterTag ? g.tags.some(t => t.toLowerCase().includes(filterTag.toLowerCase())) : true;
    return matchesSearch && matchesType && matchesTag;
  });

  const filteredRecipients = MOCK_RECIPIENTS.filter(r => {
      // In a real app, this would filter based on the group's specific recipient list
      // For now, we mock filtering the global list
      return r.name.toLowerCase().includes(recipientSearch.toLowerCase()) || 
             r.contact.includes(recipientSearch) ||
             r.role.toLowerCase().includes(recipientSearch.toLowerCase());
  });

  // --- Renderers ---

  const renderDashboard = () => (
    <div className="p-6 space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-blue-100 text-sm font-medium mb-1">Total Reachable Audience</p>
                    <h2 className="text-3xl font-bold">2,485</h2>
                    <div className="mt-4 flex gap-2 text-xs bg-white/20 w-fit px-2 py-1 rounded">
                        <span>Parents: 1,200</span> • <span>Students: 1,150</span>
                    </div>
                </div>
                <span className="material-icons-outlined absolute -bottom-4 -right-4 text-9xl text-white/10">groups</span>
            </div>
            
            <div className="bg-white dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-sm">Suppressed / DND</p>
                    <span className="material-icons-outlined text-red-500 bg-red-50 p-1.5 rounded-full">block</span>
                </div>
                <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">12 <span className="text-sm font-normal text-gray-400">contacts</span></h2>
                <p className="text-xs text-red-500 mt-1">+2 from last week</p>
            </div>

            <div className="bg-white dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-sm">Active Dynamic Rules</p>
                    <span className="material-icons-outlined text-purple-500 bg-purple-50 p-1.5 rounded-full">auto_fix_high</span>
                </div>
                <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">8 <span className="text-sm font-normal text-gray-400">rules</span></h2>
                <p className="text-xs text-green-500 mt-1">Running optimally</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4 text-text-main-light dark:text-text-main-dark">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => { setModalTab('dynamic'); setIsModalOpen(true); }} className="p-4 border border-dashed border-purple-300 bg-purple-50 dark:bg-purple-900/10 dark:border-purple-800 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors flex flex-col items-center text-center gap-2">
                        <span className="material-icons-outlined text-purple-600 text-2xl">filter_list</span>
                        <span className="text-sm font-bold text-purple-800 dark:text-purple-300">Create Smart Filter</span>
                        <span className="text-xs text-purple-600/70 dark:text-purple-400">Target by Grade, Attendance, etc.</span>
                    </button>
                    <button onClick={() => { setModalTab('import'); setIsModalOpen(true); }} className="p-4 border border-dashed border-blue-300 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex flex-col items-center text-center gap-2">
                        <span className="material-icons-outlined text-blue-600 text-2xl">upload_file</span>
                        <span className="text-sm font-bold text-blue-800 dark:text-blue-300">Import CSV</span>
                        <span className="text-xs text-blue-600/70 dark:text-blue-400">Bulk upload external contacts</span>
                    </button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4 text-text-main-light dark:text-text-main-dark">System Sync Status</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <div>
                                <p className="text-sm font-medium text-text-main-light dark:text-text-main-dark">SIS Database</p>
                                <p className="text-xs text-gray-500">Last synced: 2 mins ago</p>
                            </div>
                        </div>
                        <button className="text-xs text-blue-600 hover:underline">Force Sync</button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <div>
                                <p className="text-sm font-medium text-text-main-light dark:text-text-main-dark">HR / Staff Directory</p>
                                <p className="text-xs text-gray-500">Last synced: 1 hour ago</p>
                            </div>
                        </div>
                        <button className="text-xs text-blue-600 hover:underline">Force Sync</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  const renderGroupDetail = () => {
    if (!selectedGroup) return null;

    return (
        <div className="flex flex-col h-full animate-fade-in">
            {/* Detail Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">{selectedGroup.name}</h2>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getGroupColor(selectedGroup.type)}`}>
                            {selectedGroup.type}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">{selectedGroup.description}</p>
                    <div className="flex gap-2 mt-3">
                        {selectedGroup.tags.map(tag => (
                            <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">#{tag}</span>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <span className="material-icons-outlined text-sm">refresh</span> Sync
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-card-dark hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <span className="material-icons-outlined text-sm">edit</span> Edit
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary text-white rounded hover:bg-blue-600 shadow-sm transition-colors">
                        <span className="material-icons-outlined text-sm">campaign</span> Broadcast
                    </button>
                </div>
            </div>

            {/* Rules Visualization (If Dynamic) */}
            {selectedGroup.type === 'Dynamic' && selectedGroup.rules && (
                <div className="px-6 py-4 bg-purple-50/50 dark:bg-purple-900/10 border-b border-purple-100 dark:border-purple-900/30">
                    <p className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase mb-2">Filter Logic</p>
                    <div className="flex flex-wrap gap-2 items-center">
                        {selectedGroup.rules.map((rule, idx) => (
                            <React.Fragment key={rule.id}>
                                {idx > 0 && <span className="text-xs font-bold text-gray-400 bg-white dark:bg-gray-800 px-1 rounded border border-gray-200 dark:border-gray-700">{rule.logic}</span>}
                                <div className="flex items-center text-xs bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 rounded-md px-2 py-1 shadow-sm text-purple-700 dark:text-purple-300">
                                    <span className="font-medium mr-1">{rule.field}</span>
                                    <span className="text-gray-400 mr-1">{rule.operator.toLowerCase()}</span>
                                    <span className="font-bold">"{rule.value}"</span>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            {/* Recipient Table */}
            <div className="flex-1 overflow-auto bg-white dark:bg-card-dark p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700 dark:text-gray-300">Preview Recipients ({filteredRecipients.length})</h3>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={recipientSearch}
                            onChange={(e) => setRecipientSearch(e.target.value)}
                            placeholder="Search within group..." 
                            className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 outline-none focus:ring-1 focus:ring-primary w-64" 
                        />
                        <span className="material-icons-outlined text-sm absolute left-2 top-1.5 text-gray-400">search</span>
                    </div>
                </div>
                
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Contact</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredRecipients.map(r => (
                            <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                <td className="px-4 py-3 font-medium text-text-main-light dark:text-text-main-dark">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                            {r.name.charAt(0)}
                                        </div>
                                        {r.name}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-500">{r.role}</td>
                                <td className="px-4 py-3 font-mono text-xs">{r.contact}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${r.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {r.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right text-gray-400">
                                    <button className="hover:text-red-500"><span className="material-icons-outlined text-sm">delete</span></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-fade-in">
      {/* Sidebar List */}
      <div className="w-full md:w-80 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
            <div className="relative">
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search groups..." 
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-1 focus:ring-primary shadow-sm"
                />
                <span className="material-icons-outlined text-lg absolute left-2.5 top-2 text-gray-400">search</span>
            </div>
            
            {/* Sidebar Filters */}
            <div className="flex gap-2">
                <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="w-1/2 p-1.5 text-xs bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-600 rounded-md outline-none"
                >
                    <option value="All">All Types</option>
                    <option value="Static">Static</option>
                    <option value="Dynamic">Dynamic</option>
                    <option value="System">System</option>
                    <option value="Suppression">Suppression</option>
                </select>
                <input 
                    type="text" 
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    placeholder="Tag..." 
                    className="w-1/2 p-1.5 text-xs bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-600 rounded-md outline-none"
                />
            </div>

            <div className="flex gap-2 pt-1">
                <button onClick={() => { setModalTab('dynamic'); setIsModalOpen(true); }} className="flex-1 py-1.5 text-xs font-medium bg-primary text-white rounded-md shadow-sm hover:bg-blue-600 transition-colors">
                    + Smart List
                </button>
                <button onClick={() => { setModalTab('import'); setIsModalOpen(true); }} className="flex-1 py-1.5 text-xs font-medium bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    Import CSV
                </button>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <button 
                onClick={() => setSelectedGroupId(null)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${selectedGroupId === null ? 'bg-white dark:bg-card-dark shadow-sm text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
                <span className="material-icons-outlined text-lg">dashboard</span>
                Dashboard
            </button>
            <div className="h-px bg-gray-200 dark:border-gray-700 my-2 mx-2"></div>
            {filteredGroups.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-400">No groups found</div>
            ) : (
                filteredGroups.map(group => (
                    <button
                        key={group.id}
                        onClick={() => setSelectedGroupId(group.id)}
                        className={`w-full text-left px-3 py-3 rounded-lg flex items-start gap-3 transition-colors group relative ${selectedGroupId === group.id ? 'bg-white dark:bg-card-dark shadow-md ring-1 ring-black/5' : 'hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm'}`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getGroupColor(group.type)}`}>
                            <span className="material-icons-outlined text-lg">{getGroupIcon(group.type)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-medium truncate ${selectedGroupId === group.id ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>{group.name}</h4>
                            <p className="text-xs text-gray-500 truncate">{group.description}</p>
                        </div>
                        <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                            {group.count}
                        </span>
                    </button>
                ))
            )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {selectedGroupId ? renderGroupDetail() : renderDashboard()}
      </div>

      {/* Create/Import Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-in-down flex flex-col max-h-[85vh]">
                {/* Modal Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">Create Audience Group</h3>
                    <button onClick={() => setIsModalOpen(false)}><span className="material-icons-outlined text-gray-500">close</span></button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    {[
                        { id: 'dynamic', label: 'Smart Filter', icon: 'auto_fix_high' },
                        { id: 'import', label: 'CSV Import', icon: 'upload_file' },
                        { id: 'manual', label: 'Manual Entry', icon: 'edit' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setModalTab(tab.id as any)}
                            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${modalTab === tab.id ? 'border-primary text-primary bg-blue-50 dark:bg-blue-900/10' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            <span className="material-icons-outlined text-lg">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Group Name</label>
                        <input 
                            type="text" 
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder={modalTab === 'dynamic' ? "e.g. High Performers Class 10" : "e.g. Science Fair Attendees"} 
                            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {modalTab === 'dynamic' && (
                        <div className="space-y-4">
                            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded-lg p-4">
                                <h4 className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
                                    <span className="material-icons-outlined text-sm">filter_alt</span> Define Rules
                                </h4>
                                <div className="space-y-3">
                                    {newGroupRules.map((rule, idx) => (
                                        <div key={rule.id} className="flex gap-2 items-center animate-fade-in">
                                            {idx > 0 ? (
                                                <select 
                                                    value={rule.logic}
                                                    onChange={(e) => updateRule(rule.id, 'logic', e.target.value)}
                                                    className="w-16 p-2 text-xs font-bold rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                                                >
                                                    <option>AND</option>
                                                    <option>OR</option>
                                                </select>
                                            ) : (
                                                <span className="w-16"></span> // Spacer for alignment
                                            )}
                                            <select 
                                                className="flex-1 p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                                                value={rule.field}
                                                onChange={(e) => updateRule(rule.id, 'field', e.target.value)}
                                            >
                                                <option>Class</option>
                                                <option>Attendance</option>
                                                <option>GPA</option>
                                                <option>Fee Balance</option>
                                            </select>
                                            <select 
                                                className="w-28 p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                                                value={rule.operator}
                                                onChange={(e) => updateRule(rule.id, 'operator', e.target.value)}
                                            >
                                                <option>Equals</option>
                                                <option>Contains</option>
                                                <option>Greater Than</option>
                                                <option>Less Than</option>
                                            </select>
                                            <input 
                                                type="text" 
                                                placeholder="Value" 
                                                value={rule.value}
                                                onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                                                className="flex-1 p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                                            />
                                            <button onClick={() => removeRule(rule.id)} className="text-gray-400 hover:text-red-500"><span className="material-icons-outlined">remove_circle</span></button>
                                        </div>
                                    ))}
                                    <button onClick={handleAddRule} className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 mt-2">
                                        <span className="material-icons-outlined text-sm">add</span> Add Another Rule
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                <span>Preview Match:</span>
                                <span className="font-bold text-green-600 flex items-center gap-1"><span className="material-icons-outlined text-sm">check_circle</span> 142 Recipients Found</span>
                            </div>
                        </div>
                    )}

                    {modalTab === 'import' && (
                        <div className="space-y-6 text-center">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all
                                    ${importStatus === 'idle' ? 'border-gray-300 hover:border-primary hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800' : 'border-blue-400 bg-blue-50 dark:bg-blue-900/10'}`}
                            >
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".csv" />
                                {importStatus === 'idle' && (
                                    <>
                                        <span className="material-icons-outlined text-4xl text-gray-400 mb-2">cloud_upload</span>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload CSV</p>
                                        <p className="text-xs text-gray-500 mt-1">Format: Name, Role, Phone, Email</p>
                                    </>
                                )}
                                {importStatus === 'uploading' && (
                                    <>
                                        <span className="material-icons-outlined text-4xl text-blue-500 animate-bounce mb-2">upload</span>
                                        <p className="text-sm font-medium text-blue-600">Uploading...</p>
                                    </>
                                )}
                                {importStatus === 'analyzing' && (
                                    <>
                                        <span className="material-icons-outlined text-4xl text-purple-500 animate-spin mb-2">settings_suggest</span>
                                        <p className="text-sm font-medium text-purple-600">Analyzing & Deduplicating...</p>
                                    </>
                                )}
                                {importStatus === 'complete' && (
                                    <>
                                        <span className="material-icons-outlined text-4xl text-green-500 mb-2">check_circle</span>
                                        <p className="text-sm font-medium text-green-600">Ready to Import</p>
                                        <p className="text-xs text-gray-500 mt-1">45 Valid Rows • 2 Duplicates Removed</p>
                                    </>
                                )}
                            </div>
                            <div className="text-left text-xs text-gray-500">
                                <p className="font-bold mb-1">Guidelines:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Ensure headers match exactly.</li>
                                    <li>Phone numbers should include country code.</li>
                                    <li>Duplicate emails will be merged automatically.</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {modalTab === 'manual' && (
                        <div className="text-center py-10 text-gray-400">
                            <span className="material-icons-outlined text-4xl mb-2">edit_note</span>
                            <p>Manual entry form would go here.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm">Cancel</button>
                    <button 
                        onClick={handleCreateGroup}
                        disabled={!newGroupName || (modalTab === 'import' && importStatus !== 'complete')}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {modalTab === 'import' ? 'Import & Create' : 'Create Group'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
