
import React, { useState } from 'react';

// --- Types ---
type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Partial' | 'Void';
type PaymentMethod = 'Online' | 'Cash' | 'Cheque' | 'Bank Transfer';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string; // Cheque No or Transaction ID
  recordedBy: string;
}

interface Invoice {
  id: string;
  applicantId: string;
  applicantName: string;
  class: string;
  title: string; // e.g. "Admission Fee 2025"
  amount: number;
  discount: number;
  finalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: InvoiceStatus;
  transactions: Transaction[];
  generatedDate: string;
  paymentLink?: string;
}

// --- Mock Data ---
const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV-2025-001',
    applicantId: 'APP-001',
    applicantName: 'Aarav Patel',
    class: 'Class 1',
    title: 'Admission & Tuition Fee (Term 1)',
    amount: 50000,
    discount: 5000, // Sibling discount
    finalAmount: 45000,
    paidAmount: 45000,
    dueDate: '2024-10-30',
    status: 'Paid',
    generatedDate: '2024-10-15',
    transactions: [
        { id: 'tx_1', date: '2024-10-16', amount: 45000, method: 'Online', reference: 'PAY_123456', recordedBy: 'System' }
    ]
  },
  {
    id: 'INV-2025-002',
    applicantId: 'APP-002',
    applicantName: 'Zara Khan',
    class: 'Class 5',
    title: 'Admission Fee',
    amount: 35000,
    discount: 0,
    finalAmount: 35000,
    paidAmount: 0,
    dueDate: '2024-10-25',
    status: 'Overdue',
    generatedDate: '2024-10-10',
    paymentLink: 'https://school.pay/inv/2025-002',
    transactions: []
  },
  {
    id: 'INV-2025-003',
    applicantId: 'APP-003',
    applicantName: 'Ishaan Gupta',
    class: 'Class 1',
    title: 'Admission Fee',
    amount: 50000,
    discount: 0,
    finalAmount: 50000,
    paidAmount: 20000,
    dueDate: '2024-11-01',
    status: 'Partial',
    generatedDate: '2024-10-20',
    transactions: [
        { id: 'tx_2', date: '2024-10-21', amount: 20000, method: 'Cash', reference: 'Receipt #101', recordedBy: 'Admin' }
    ]
  }
];

// --- Templates ---
const TEMPLATES = {
  paymentRequest: (inv: Invoice) => 
    `Dear Parent, Please pay ₹${inv.finalAmount - inv.paidAmount} to confirm admission for ${inv.applicantName}. Pay link: ${inv.paymentLink || 'Unavailable'}. Thank you - Springfield Academy.`,
  
  receiptEmail: (inv: Invoice, tx: Transaction) => 
    `Payment received: Invoice ${inv.id} for ${inv.applicantName} of ₹${tx.amount} on ${tx.date}. Method: ${tx.method}. Receipt is attached.`
};

export const FeeCollection: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'detail'>('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  
  // Forms
  const [createForm, setCreateForm] = useState({ applicantName: '', amount: 50000, discount: 0, dueDate: '' });
  const [payForm, setPayForm] = useState({ amount: 0, method: 'Cash' as PaymentMethod, reference: '' });

  // --- Logic ---

  const getStats = () => {
    const total = invoices.reduce((sum, inv) => sum + inv.finalAmount, 0);
    const collected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const pending = total - collected;
    return { total, collected, pending };
  };

  const handleCreateInvoice = () => {
    const newInv: Invoice = {
      id: `INV-2025-00${invoices.length + 1}`,
      applicantId: `APP-NEW-${Date.now()}`,
      applicantName: createForm.applicantName,
      class: 'Class 1', // Mock default
      title: 'Admission Fee',
      amount: createForm.amount,
      discount: createForm.discount,
      finalAmount: createForm.amount - createForm.discount,
      paidAmount: 0,
      dueDate: createForm.dueDate,
      status: 'Pending',
      generatedDate: new Date().toISOString().split('T')[0],
      transactions: [],
      paymentLink: `https://school.pay/inv/${Date.now()}`
    };
    setInvoices([newInv, ...invoices]);
    setIsCreateOpen(false);
  };

  const handleRecordPayment = () => {
    if (!selectedInvoice) return;
    const amount = Number(payForm.amount);
    
    const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        amount: amount,
        method: payForm.method,
        reference: payForm.reference,
        recordedBy: 'Admin' // Current User
    };

    const newPaidAmount = selectedInvoice.paidAmount + amount;
    const newStatus = newPaidAmount >= selectedInvoice.finalAmount ? 'Paid' : 'Partial';

    const updatedInv = {
        ...selectedInvoice,
        paidAmount: newPaidAmount,
        status: newStatus,
        transactions: [newTx, ...selectedInvoice.transactions]
    };

    setInvoices(prev => prev.map(inv => inv.id === selectedInvoice.id ? updatedInv : inv));
    setSelectedInvoice(updatedInv);
    setIsPayOpen(false);
    
    if (newStatus === 'Paid') {
        alert(`Invoice Paid! Enrollment confirmation flow triggered for ${selectedInvoice.applicantName}.`);
    } else {
        alert('Partial payment recorded.');
    }
  };

  // --- Renderers ---

  const renderDashboard = () => {
    const stats = getStats();
    return (
      <div className="space-y-6 animate-fade-in">
         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
               <p className="text-sm text-gray-500">Total Collected</p>
               <h3 className="text-2xl font-bold text-green-600">₹{stats.collected.toLocaleString()}</h3>
               <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-2">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(stats.collected / stats.total) * 100}%` }}></div>
               </div>
            </div>
            <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
               <p className="text-sm text-gray-500">Pending Dues</p>
               <h3 className="text-2xl font-bold text-orange-500">₹{stats.pending.toLocaleString()}</h3>
               <p className="text-xs text-orange-400 mt-1">{invoices.filter(i => i.status === 'Overdue').length} Overdue Invoices</p>
            </div>
            <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center items-center">
               <button 
                 onClick={() => setIsCreateOpen(true)}
                 className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md transition-colors flex items-center gap-2"
               >
                 <span className="material-icons-outlined text-lg">add_card</span> Create Invoice
               </button>
            </div>
         </div>

         {/* Invoice List */}
         <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
               <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">Recent Invoices</h3>
               <div className="flex gap-2">
                  <input type="text" placeholder="Search invoice..." className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1 text-xs outline-none" />
               </div>
            </div>
            <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                  <tr>
                     <th className="px-6 py-3">Invoice #</th>
                     <th className="px-6 py-3">Applicant</th>
                     <th className="px-6 py-3">Amount</th>
                     <th className="px-6 py-3">Balance</th>
                     <th className="px-6 py-3">Due Date</th>
                     <th className="px-6 py-3">Status</th>
                     <th className="px-6 py-3 text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {invoices.map(inv => (
                     <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{inv.id}</td>
                        <td className="px-6 py-4 font-medium text-text-main-light dark:text-text-main-dark">
                           {inv.applicantName}
                           <div className="text-[10px] text-gray-400">{inv.class}</div>
                        </td>
                        <td className="px-6 py-4">₹{inv.finalAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">₹{(inv.finalAmount - inv.paidAmount).toLocaleString()}</td>
                        <td className="px-6 py-4 text-xs text-gray-500">{inv.dueDate}</td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                              inv.status === 'Paid' ? 'bg-green-100 text-green-700' :
                              inv.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                              inv.status === 'Partial' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                           }`}>
                              {inv.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button 
                              onClick={() => { setSelectedInvoice(inv); setView('detail'); }}
                              className="text-primary hover:underline text-xs font-medium"
                           >
                              Manage
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    );
  };

  const renderDetail = () => {
    if (!selectedInvoice) return null;
    const balance = selectedInvoice.finalAmount - selectedInvoice.paidAmount;

    return (
      <div className="h-full flex flex-col animate-slide-in-right">
         {/* Detail Header */}
         <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setView('dashboard')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500">
               <span className="material-icons-outlined">arrow_back</span>
            </button>
            <div>
               <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Invoice {selectedInvoice.id}</h2>
               <p className="text-sm text-gray-500">Issued to {selectedInvoice.applicantName} on {selectedInvoice.generatedDate}</p>
            </div>
            <div className="ml-auto flex gap-2">
               <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <span className="material-icons-outlined text-sm">print</span> Print
               </button>
               {balance > 0 && (
                  <button 
                     onClick={() => { setPayForm({ amount: balance, method: 'Cash', reference: '' }); setIsPayOpen(true); }}
                     className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm flex items-center gap-2"
                  >
                     <span className="material-icons-outlined text-sm">payments</span> Record Payment
                  </button>
               )}
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Invoice Visual */}
            <div className="lg:col-span-2 bg-white dark:bg-card-dark p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
               <div className="flex justify-between mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div>
                     <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100">INVOICE</h3>
                     <span className={`inline-block mt-2 px-3 py-1 rounded text-xs font-bold uppercase ${
                        selectedInvoice.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                        selectedInvoice.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                     }`}>
                        {selectedInvoice.status}
                     </span>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                     <p>Springfield Academy</p>
                     <p>Due Date: {selectedInvoice.dueDate}</p>
                  </div>
               </div>

               <div className="mb-8">
                  <p className="text-xs text-gray-400 uppercase font-bold mb-1">Bill To</p>
                  <p className="font-bold text-gray-800 dark:text-gray-200">{selectedInvoice.applicantName}</p>
                  <p className="text-sm text-gray-500">{selectedInvoice.class} • {selectedInvoice.applicantId}</p>
               </div>

               <table className="w-full text-sm mb-8">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                     <tr>
                        <th className="py-2 text-left pl-2">Description</th>
                        <th className="py-2 text-right pr-2">Amount</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                     <tr>
                        <td className="py-3 pl-2">{selectedInvoice.title}</td>
                        <td className="py-3 text-right pr-2">₹{selectedInvoice.amount.toLocaleString()}</td>
                     </tr>
                     {selectedInvoice.discount > 0 && (
                        <tr className="text-green-600">
                           <td className="py-3 pl-2">Discount (Sibling/Scholarship)</td>
                           <td className="py-3 text-right pr-2">- ₹{selectedInvoice.discount.toLocaleString()}</td>
                        </tr>
                     )}
                  </tbody>
                  <tfoot className="border-t border-gray-200 dark:border-gray-700 font-bold text-lg">
                     <tr>
                        <td className="py-4 pl-2">Total Due</td>
                        <td className="py-4 text-right pr-2">₹{selectedInvoice.finalAmount.toLocaleString()}</td>
                     </tr>
                  </tfoot>
               </table>

               <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <span className="text-sm text-gray-500">Amount Paid</span>
                  <span className="font-bold text-green-600">₹{selectedInvoice.paidAmount.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mt-2">
                  <span className="text-sm text-red-600 dark:text-red-400">Balance Pending</span>
                  <span className="font-bold text-red-600 dark:text-red-400">₹{balance.toLocaleString()}</span>
               </div>
            </div>

            {/* Right Column: Transactions & Comms */}
            <div className="space-y-6">
               <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Transactions</h4>
                  {selectedInvoice.transactions.length === 0 ? (
                     <p className="text-sm text-gray-400 italic">No payments recorded yet.</p>
                  ) : (
                     <div className="space-y-4">
                        {selectedInvoice.transactions.map(tx => (
                           <div key={tx.id} className="text-sm border-l-2 border-green-500 pl-3">
                              <p className="font-bold text-gray-800 dark:text-gray-200">₹{tx.amount.toLocaleString()}</p>
                              <p className="text-xs text-gray-500">{tx.date} • {tx.method}</p>
                              <p className="text-[10px] text-gray-400">Ref: {tx.reference || 'N/A'}</p>
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Communications</h4>
                  {balance > 0 && (
                     <div className="mb-4 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Payment Reminder</span>
                           <button onClick={() => navigator.clipboard.writeText(TEMPLATES.paymentRequest(selectedInvoice))} className="text-[10px] text-blue-600 hover:underline">Copy</button>
                        </div>
                        <p className="text-[10px] text-gray-600 dark:text-gray-400 font-mono leading-tight">
                           {TEMPLATES.paymentRequest(selectedInvoice)}
                        </p>
                        <button className="w-full mt-2 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">Send SMS Now</button>
                     </div>
                  )}
                  {selectedInvoice.transactions.length > 0 && (
                     <button className="w-full py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                        Resend Receipt Email
                     </button>
                  )}
               </div>
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col relative">
      {view === 'dashboard' ? renderDashboard() : renderDetail()}

      {/* Create Modal */}
      {isCreateOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)}></div>
            <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-md p-6 animate-slide-in-down">
               <h3 className="font-bold text-lg mb-4">Create New Invoice</h3>
               <div className="space-y-3">
                  <div>
                     <label className="block text-xs text-gray-500 mb-1">Applicant Name</label>
                     <input type="text" value={createForm.applicantName} onChange={e => setCreateForm({...createForm, applicantName: e.target.value})} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-600 text-sm" />
                  </div>
                  <div>
                     <label className="block text-xs text-gray-500 mb-1">Amount (₹)</label>
                     <input type="number" value={createForm.amount} onChange={e => setCreateForm({...createForm, amount: Number(e.target.value)})} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-600 text-sm" />
                  </div>
                  <div>
                     <label className="block text-xs text-gray-500 mb-1">Discount (₹)</label>
                     <input type="number" value={createForm.discount} onChange={e => setCreateForm({...createForm, discount: Number(e.target.value)})} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-600 text-sm" />
                  </div>
                  <div>
                     <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                     <input type="date" value={createForm.dueDate} onChange={e => setCreateForm({...createForm, dueDate: e.target.value})} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-600 text-sm" />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                     <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                     <button onClick={handleCreateInvoice} className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-blue-600">Create</button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Record Payment Modal */}
      {isPayOpen && selectedInvoice && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsPayOpen(false)}></div>
            <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-md p-6 animate-slide-in-down">
               <h3 className="font-bold text-lg mb-4">Record Payment</h3>
               <p className="text-sm text-gray-500 mb-4">Manually record offline payment for {selectedInvoice.applicantName}.</p>
               <div className="space-y-3">
                  <div>
                     <label className="block text-xs text-gray-500 mb-1">Amount Received (₹)</label>
                     <input type="number" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: Number(e.target.value)})} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-600 text-sm font-bold" />
                  </div>
                  <div>
                     <label className="block text-xs text-gray-500 mb-1">Payment Method</label>
                     <select value={payForm.method} onChange={e => setPayForm({...payForm, method: e.target.value as PaymentMethod})} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-600 text-sm">
                        <option>Cash</option>
                        <option>Cheque</option>
                        <option>Bank Transfer</option>
                        <option>POS/Card</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-xs text-gray-500 mb-1">Reference No / Cheque No</label>
                     <input type="text" value={payForm.reference} onChange={e => setPayForm({...payForm, reference: e.target.value})} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-600 text-sm" placeholder="Optional" />
                  </div>
                  
                  {/* Mock Upload */}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
                     <span className="material-icons-outlined text-gray-400">upload_file</span>
                     <p className="text-xs text-gray-500">Upload Receipt Scan (Optional)</p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                     <button onClick={() => setIsPayOpen(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                     <button onClick={handleRecordPayment} className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700">Record & Generate Receipt</button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
