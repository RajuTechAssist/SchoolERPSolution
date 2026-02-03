
import React, { useState } from 'react';

// --- Types ---
type ViewTab = 'registry' | 'rules';

interface FamilyUnit {
  id: string;
  primaryGuardian: string;
  relation: string; // e.g. Father
  secondaryGuardian?: string;
  phone: string;
  email: string;
  address: string;
  portalStatus: 'Active' | 'Invited' | 'Inactive';
  children: {
    id: string;
    name: string;
    class: string;
    photo: string;
    feeStatus: 'Paid' | 'Due';
  }[];
  financials: {
    totalDue: number;
    discountApplied: boolean;
    discountRule?: string;
  };
}

interface DiscountRule {
  id: string;
  name: string;
  type: 'Percentage' | 'Flat Amount';
  value: number;
  appliedTo: 'Tuition Fee' | 'Transport Fee' | 'Total';
  criteria: '2nd Child' | '3rd Child' | 'All Siblings';
  isActive: boolean;
}

// --- Mock Data ---
const MOCK_FAMILIES: FamilyUnit[] = [
  {
    id: 'fam_1',
    primaryGuardian: 'Suresh Patel',
    relation: 'Father',
    secondaryGuardian: 'Priya Patel',
    phone: '+91 98765 43210',
    email: 'suresh.p@example.com',
    address: '123 Green Avenue, Springfield',
    portalStatus: 'Active',
    children: [
      { id: 's1', name: 'Aarav Patel', class: 'Class 1-A', photo: 'https://ui-avatars.com/api/?name=Aarav+Patel&background=random', feeStatus: 'Paid' },
      { id: 's2', name: 'Riya Patel', class: 'Class 5-B', photo: 'https://ui-avatars.com/api/?name=Riya+Patel&background=random', feeStatus: 'Due' }
    ],
    financials: {
      totalDue: 12500,
      discountApplied: true,
      discountRule: 'Sibling Discount (10%)'
    }
  },
  {
    id: 'fam_2',
    primaryGuardian: 'David Ross',
    relation: 'Father',
    phone: '+1 555-0102',
    email: 'david.r@example.com',
    address: '45 West St, Springfield',
    portalStatus: 'Inactive',
    children: [
      { id: 's3', name: 'Bianca Ross', class: 'Class 10-A', photo: 'https://ui-avatars.com/api/?name=Bianca+Ross&background=random', feeStatus: 'Paid' }
    ],
    financials: {
      totalDue: 0,
      discountApplied: false
    }
  }
];

const MOCK_RULES: DiscountRule[] = [
  { id: 'r1', name: 'Standard Sibling Benefit', type: 'Percentage', value: 10, appliedTo: 'Tuition Fee', criteria: '2nd Child', isActive: true },
  { id: 'r2', name: 'Large Family Support', type: 'Flat Amount', value: 5000, appliedTo: 'Total', criteria: '3rd Child', isActive: false },
];

export const StudentFamily: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewTab>('registry');
  const [searchQuery, setSearchQuery] = useState('');
  const [families, setFamilies] = useState<FamilyUnit[]>(MOCK_FAMILIES);
  const [rules, setRules] = useState<DiscountRule[]>(MOCK_RULES);

  // Linker Modal State
  const [isLinkerOpen, setIsLinkerOpen] = useState(false);
  const [linkStep, setLinkStep] = useState<1 | 2>(1);
  const [studentA, setStudentA] = useState('');
  const [studentB, setStudentB] = useState('');
  const [mergedGuardian, setMergedGuardian] = useState('');

  // --- Handlers ---

  const handleLinkSubmit = () => {
    // In a real app, this would perform the merge logic
    const confirmMsg = `Link ${studentA} and ${studentB} as siblings under guardian ${mergedGuardian}? This will apply sibling discount rules on future invoices.`;
    
    if (window.confirm(confirmMsg)) {
        alert('Siblings linked successfully! Family unit updated.');
        setIsLinkerOpen(false);
        setLinkStep(1);
        setStudentA('');
        setStudentB('');
    }
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const filteredFamilies = families.filter(f => 
    f.primaryGuardian.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.children.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // --- Renderers ---

  const renderRegistry = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFamilies.map(fam => (
                <div key={fam.id} className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                {fam.primaryGuardian.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-text-main-light dark:text-text-main-dark text-sm">{fam.primaryGuardian}</h4>
                                <p className="text-xs text-gray-500">{fam.relation} • {fam.children.length} Children</p>
                            </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${fam.portalStatus === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            Portal: {fam.portalStatus}
                        </span>
                    </div>

                    <div className="space-y-3 mb-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg flex-1">
                        {fam.children.map(child => (
                            <div key={child.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <img src={child.photo} alt={child.name} className="w-6 h-6 rounded-full bg-gray-200" />
                                    <div className="text-xs">
                                        <p className="font-medium text-gray-800 dark:text-gray-200">{child.name}</p>
                                        <p className="text-gray-500 scale-90 origin-left">{child.class}</p>
                                    </div>
                                </div>
                                <button className="text-[10px] text-red-400 hover:text-red-600 hover:underline">Unlink</button>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                        <div className="flex justify-between items-center text-xs mb-2">
                            <span className="text-gray-500">Combined Dues:</span>
                            <span className={`font-bold ${fam.financials.totalDue > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                ₹{fam.financials.totalDue.toLocaleString()}
                            </span>
                        </div>
                        {fam.financials.discountApplied && (
                            <div className="flex justify-between items-center text-[10px] text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                                <span className="flex items-center gap-1"><span className="material-icons-outlined text-[10px]">discount</span> Applied</span>
                                <span>{fam.financials.discountRule}</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <button className="py-1.5 border border-gray-200 dark:border-gray-600 rounded text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
                            Edit Details
                        </button>
                        <button className="py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded text-xs font-medium hover:bg-blue-100 transition-colors">
                            {fam.portalStatus === 'Active' ? 'Reset Password' : 'Invite Parent'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  const renderRules = () => (
    <div className="max-w-4xl space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Sibling Discount Rules</h3>
                <button className="text-xs bg-primary text-white px-3 py-1.5 rounded hover:bg-blue-600 shadow-sm flex items-center gap-1">
                    <span className="material-icons-outlined text-sm">add</span> New Rule
                </button>
            </div>
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <th className="px-6 py-3">Rule Name</th>
                        <th className="px-6 py-3">Benefit</th>
                        <th className="px-6 py-3">Criteria</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {rules.map(rule => (
                        <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                            <td className="px-6 py-4 font-medium text-text-main-light dark:text-text-main-dark">{rule.name}</td>
                            <td className="px-6 py-4">
                                <span className="font-bold text-green-600">
                                    {rule.type === 'Percentage' ? `${rule.value}% Off` : `₹${rule.value} Off`}
                                </span>
                                <span className="text-xs text-gray-500 ml-1">on {rule.appliedTo}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{rule.criteria}</td>
                            <td className="px-6 py-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={rule.isActive} onChange={() => toggleRule(rule.id)} className="sr-only peer" />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                </label>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-gray-400 hover:text-primary"><span className="material-icons-outlined text-lg">edit</span></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border-t border-yellow-100 dark:border-yellow-900/30 text-xs text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                <span className="material-icons-outlined text-sm">info</span>
                Rules are automatically applied when generating monthly invoices for linked accounts.
            </div>
        </div>
    </div>
  );

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
         <div>
            <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Family & Sibling Linker</h2>
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Manage student relationships, shared guardians, and family discounts.</p>
         </div>
         
         <div className="flex gap-3">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button onClick={() => setActiveTab('registry')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'registry' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}>Registry</button>
                <button onClick={() => setActiveTab('rules')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'rules' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}>Discount Rules</button>
            </div>
            <button 
                onClick={() => setIsLinkerOpen(true)}
                className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition-colors"
            >
                <span className="material-icons-outlined text-sm">link</span> Link Siblings
            </button>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
         {activeTab === 'registry' && (
             <div className="space-y-4">
                 <div className="relative max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><span className="material-icons-outlined">search</span></span>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search family by parent or child name..." 
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                 </div>
                 {renderRegistry()}
             </div>
         )}
         {activeTab === 'rules' && renderRules()}
      </div>

      {/* Linker Modal */}
      {isLinkerOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsLinkerOpen(false)}></div>
            <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-lg p-6 animate-slide-in-down">
                <h3 className="font-bold text-lg mb-4 text-text-main-light dark:text-text-main-dark">
                    {linkStep === 1 ? 'Link Siblings - Step 1' : 'Confirm Link - Step 2'}
                </h3>
                
                {linkStep === 1 && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/50 text-xs text-blue-700 dark:text-blue-300">
                            Search and select two students to link. They will be merged under a single Primary Guardian account.
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Student A (Primary)</label>
                            <input type="text" value={studentA} onChange={e => setStudentA(e.target.value)} placeholder="Search name or ID..." className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Student B (Sibling)</label>
                            <input type="text" value={studentB} onChange={e => setStudentB(e.target.value)} placeholder="Search name or ID..." className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none" />
                        </div>
                    </div>
                )}

                {linkStep === 2 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/30">
                            <div className="text-center">
                                <span className="block text-xs text-gray-500">Student A</span>
                                <span className="font-bold">{studentA}</span>
                                <div className="text-xs text-gray-400 mt-1">Current: Parent X</div>
                            </div>
                            <div className="text-center border-l border-gray-200 dark:border-gray-700">
                                <span className="block text-xs text-gray-500">Student B</span>
                                <span className="font-bold">{studentB}</span>
                                <div className="text-xs text-gray-400 mt-1">Current: Parent Y</div>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Primary Guardian for Family Unit</label>
                            <select 
                                value={mergedGuardian} 
                                onChange={e => setMergedGuardian(e.target.value)}
                                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-card-dark text-sm outline-none"
                            >
                                <option value="">-- Choose Guardian to Keep --</option>
                                <option value="Parent A">Parent of {studentA} (Parent X)</option>
                                <option value="Parent B">Parent of {studentB} (Parent Y)</option>
                            </select>
                            <p className="text-[10px] text-red-500 mt-1">Warning: The unselected guardian profile may be archived if no other students are linked.</p>
                        </div>
                    </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                    <button onClick={() => setIsLinkerOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm">Cancel</button>
                    {linkStep === 1 ? (
                        <button 
                            onClick={() => { if(studentA && studentB) setLinkStep(2); else alert('Enter both names'); }} 
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm text-sm"
                        >
                            Next: Verify Guardian
                        </button>
                    ) : (
                        <button 
                            onClick={handleLinkSubmit}
                            disabled={!mergedGuardian}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Confirm Link
                        </button>
                    )}
                </div>
            </div>
         </div>
      )}
    </div>
  );
};
