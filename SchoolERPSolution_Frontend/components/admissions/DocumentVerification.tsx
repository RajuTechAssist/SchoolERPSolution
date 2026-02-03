
import React, { useState } from 'react';

// --- Types ---
type DocStatus = 'Pending' | 'Verified' | 'Rejected';
type DocType = 'Birth Certificate' | 'Photo' | 'Transfer Certificate' | 'Address Proof' | 'Parent ID';

interface AdmissionDocument {
  id: string;
  applicantId: string;
  applicantName: string;
  parentName: string;
  parentPhone: string; // For SMS
  type: DocType;
  url: string; // Mock URL
  uploadDate: string;
  status: DocStatus;
  size: string;
  ocrMatch?: boolean; // Mock OCR result
  ocrData?: string;   // Mock extracted text
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

// --- Mock Data ---
const MOCK_DOCS: AdmissionDocument[] = [
  {
    id: 'd1',
    applicantId: 'APP-001',
    applicantName: 'Aarav Patel',
    parentName: 'Suresh Patel',
    parentPhone: '+91 9876543210',
    type: 'Birth Certificate',
    url: 'https://via.placeholder.com/600x800.png?text=Birth+Certificate+Scan',
    uploadDate: '2024-10-24',
    status: 'Pending',
    size: '1.2 MB',
    ocrMatch: true,
    ocrData: 'DOB: 15-05-2019 (Matches Application)'
  },
  {
    id: 'd2',
    applicantId: 'APP-002',
    applicantName: 'Zara Khan',
    parentName: 'Farhan Khan',
    parentPhone: '+91 9988776655',
    type: 'Transfer Certificate',
    url: 'https://via.placeholder.com/600x800.png?text=Transfer+Certificate+Scan',
    uploadDate: '2024-10-25',
    status: 'Pending',
    size: '0.8 MB',
    ocrMatch: false,
    ocrData: 'School: City Public School (Mismatch: Form says "St. Marys")'
  },
  {
    id: 'd3',
    applicantId: 'APP-003',
    applicantName: 'Ishaan Gupta',
    parentName: 'Meera Gupta',
    parentPhone: '+91 9123456789',
    type: 'Photo',
    url: 'https://ui-avatars.com/api/?name=Ishaan+Gupta&background=random&size=512',
    uploadDate: '2024-10-23',
    status: 'Verified',
    size: '45 KB',
    verifiedBy: 'Admin',
    verifiedAt: '2024-10-24'
  },
  {
    id: 'd4',
    applicantId: 'APP-001',
    applicantName: 'Aarav Patel',
    parentName: 'Suresh Patel',
    parentPhone: '+91 9876543210',
    type: 'Address Proof',
    url: 'https://via.placeholder.com/600x400.png?text=Address+Proof',
    uploadDate: '2024-10-24',
    status: 'Rejected',
    size: '2.5 MB',
    rejectionReason: 'Blurry image, cannot read address.',
    verifiedBy: 'Admin',
    verifiedAt: '2024-10-25'
  }
];

// --- Templates ---
const TEMPLATES = {
  verificationNote: (doc: AdmissionDocument, adminName: string) => 
    `Document ${doc.type} verified by ${adminName} on ${new Date().toLocaleDateString()}.`,
  
  reuploadRequest: (doc: AdmissionDocument) => 
    `Dear ${doc.parentName}, We could not verify the ${doc.type} uploaded for ${doc.applicantName}. Please reupload a clear scanned copy or original at the admissions office.`
};

export const DocumentVerification: React.FC = () => {
  const [documents, setDocuments] = useState<AdmissionDocument[]>(MOCK_DOCS);
  const [filterStatus, setFilterStatus] = useState<DocStatus | 'All'>('Pending');
  const [selectedDoc, setSelectedDoc] = useState<AdmissionDocument | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Stats
  const stats = {
    pending: documents.filter(d => d.status === 'Pending').length,
    verified: documents.filter(d => d.status === 'Verified').length,
    rejected: documents.filter(d => d.status === 'Rejected').length
  };

  const filteredDocs = documents.filter(d => filterStatus === 'All' || d.status === filterStatus);

  // --- Handlers ---

  const handleVerify = () => {
    if (!selectedDoc) return;
    const note = TEMPLATES.verificationNote(selectedDoc, 'Principal Anderson');
    
    setDocuments(prev => prev.map(d => 
      d.id === selectedDoc.id 
        ? { ...d, status: 'Verified', verifiedBy: 'Principal Anderson', verifiedAt: new Date().toISOString().split('T')[0] } 
        : d
    ));
    alert(`Document Verified. Audit Log: "${note}"`);
    setSelectedDoc(null);
  };

  const handleReject = () => {
    if (!selectedDoc || !rejectionReason) return;
    const message = TEMPLATES.reuploadRequest(selectedDoc);
    
    setDocuments(prev => prev.map(d => 
        d.id === selectedDoc.id 
          ? { ...d, status: 'Rejected', rejectionReason, verifiedBy: 'Principal Anderson', verifiedAt: new Date().toISOString().split('T')[0] } 
          : d
      ));
    
    alert(`Document Rejected. Notification queued for parent:\n\n"${message}"`);
    setRejectionReason('');
    setSelectedDoc(null);
  };

  // --- Renderers ---

  return (
    <div className="space-y-6 h-full flex flex-col relative animate-fade-in">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm md:col-span-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
               <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Document Verification</h2>
               <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Review uploaded certificates and identity proofs.</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg">
                  <span className="material-icons-outlined">pending</span>
                  <span className="font-bold">{stats.pending}</span> <span className="text-xs">Pending</span>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
                  <span className="material-icons-outlined">check_circle</span>
                  <span className="font-bold">{stats.verified}</span> <span className="text-xs">Verified</span>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
                  <span className="material-icons-outlined">cancel</span>
                  <span className="font-bold">{stats.rejected}</span> <span className="text-xs">Rejected</span>
               </div>
            </div>
         </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
         {['Pending', 'Verified', 'Rejected', 'All'].map(status => (
            <button
               key={status}
               onClick={() => setFilterStatus(status as DocStatus | 'All')}
               className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${filterStatus === status ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
               {status}
            </button>
         ))}
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4">
         {filteredDocs.map(doc => (
            <div 
               key={doc.id} 
               onClick={() => setSelectedDoc(doc)}
               className="group bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col"
            >
               {/* Thumbnail Preview */}
               <div className="h-40 bg-gray-100 dark:bg-gray-800 relative flex items-center justify-center overflow-hidden">
                  {doc.type === 'Photo' ? (
                     <img src={doc.url} alt="Doc" className="w-full h-full object-cover" />
                  ) : (
                     <div className="text-center p-4">
                        <span className="material-icons-outlined text-4xl text-gray-400 mb-2">description</span>
                        <p className="text-xs text-gray-500 font-mono">PDF • {doc.size}</p>
                     </div>
                  )}
                  {/* Status Overlay */}
                  <div className="absolute top-2 right-2">
                     <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm ${
                        doc.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        doc.status === 'Verified' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                     }`}>
                        {doc.status}
                     </span>
                  </div>
                  {/* Hover Action */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="bg-white text-gray-800 px-4 py-2 rounded-full text-xs font-bold shadow-lg transform scale-95 group-hover:scale-100 transition-transform">
                        Review
                     </button>
                  </div>
               </div>

               {/* Metadata */}
               <div className="p-4 flex-1 flex flex-col">
                  <h4 className="font-bold text-text-main-light dark:text-text-main-dark text-sm mb-1 truncate" title={doc.type}>{doc.type}</h4>
                  <p className="text-xs text-text-sub-light dark:text-text-sub-dark mb-2">{doc.applicantName}</p>
                  
                  {doc.ocrMatch !== undefined && (
                     <div className={`mt-auto text-[10px] px-2 py-1 rounded border flex items-center gap-1 ${doc.ocrMatch ? 'bg-green-50 border-green-200 text-green-700' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
                        <span className="material-icons-outlined text-[10px]">{doc.ocrMatch ? 'check_circle' : 'warning'}</span>
                        {doc.ocrMatch ? 'OCR Match' : 'OCR Mismatch'}
                     </div>
                  )}
               </div>
            </div>
         ))}
         {filteredDocs.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400">
               <span className="material-icons-outlined text-4xl mb-2">folder_off</span>
               <p>No documents found in {filterStatus} state.</p>
            </div>
         )}
      </div>

      {/* Review Modal */}
      {selectedDoc && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedDoc(null)}></div>
            <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex overflow-hidden animate-slide-in-down">
               
               {/* Left: Document Viewer */}
               <div className="w-2/3 bg-gray-900 flex items-center justify-center relative group">
                  {selectedDoc.type === 'Photo' ? (
                     <img src={selectedDoc.url} alt="Doc Preview" className="max-w-full max-h-full object-contain" />
                  ) : (
                     <div className="text-center text-gray-400">
                        <span className="material-icons-outlined text-6xl mb-4">picture_as_pdf</span>
                        <p>PDF Preview Placeholder</p>
                        <button className="mt-4 px-4 py-2 border border-gray-600 rounded hover:bg-gray-800 text-sm">Download to View</button>
                     </div>
                  )}
                  <div className="absolute top-4 left-4 text-white text-xs bg-black/50 px-2 py-1 rounded">
                     {selectedDoc.url.split('/').pop()?.substring(0, 20)}...
                  </div>
               </div>

               {/* Right: Controls */}
               <div className="w-1/3 flex flex-col border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
                     <div>
                        <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">{selectedDoc.type}</h3>
                        <p className="text-sm text-gray-500 mt-1">Applicant: <span className="font-medium text-gray-800 dark:text-gray-200">{selectedDoc.applicantName}</span></p>
                     </div>
                     <button onClick={() => setSelectedDoc(null)} className="text-gray-400 hover:text-gray-600"><span className="material-icons-outlined">close</span></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                     {/* OCR Analysis */}
                     <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-lg">
                        <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase mb-2 flex items-center gap-1">
                           <span className="material-icons-outlined text-sm">smart_toy</span> AI Analysis
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{selectedDoc.ocrData || 'No text extracted.'}</p>
                        {selectedDoc.ocrMatch !== undefined && (
                           <div className={`text-xs font-bold ${selectedDoc.ocrMatch ? 'text-green-600' : 'text-red-500'}`}>
                              Result: {selectedDoc.ocrMatch ? 'Data Matches Application' : 'Potential Mismatch Detected'}
                           </div>
                        )}
                     </div>

                     {/* Details */}
                     <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between"><span>Uploaded:</span> <span className="font-medium text-gray-800 dark:text-gray-200">{selectedDoc.uploadDate}</span></div>
                        <div className="flex justify-between"><span>Size:</span> <span className="font-medium text-gray-800 dark:text-gray-200">{selectedDoc.size}</span></div>
                        <div className="flex justify-between"><span>ID:</span> <span className="font-mono text-xs">{selectedDoc.id}</span></div>
                     </div>

                     {/* Previous Status Info */}
                     {selectedDoc.status !== 'Pending' && (
                        <div className={`p-4 rounded-lg border ${selectedDoc.status === 'Verified' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                           <p className={`text-sm font-bold ${selectedDoc.status === 'Verified' ? 'text-green-800' : 'text-red-800'}`}>
                              Current Status: {selectedDoc.status}
                           </p>
                           <p className="text-xs text-gray-600 mt-1">
                              By {selectedDoc.verifiedBy} on {selectedDoc.verifiedAt}
                           </p>
                           {selectedDoc.rejectionReason && (
                              <p className="text-xs text-red-600 mt-2 italic">Reason: "{selectedDoc.rejectionReason}"</p>
                           )}
                        </div>
                     )}

                     {/* Rejection Reason Input */}
                     {selectedDoc.status === 'Pending' && (
                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Rejection Reason (If applicable)</label>
                           <textarea 
                              rows={3}
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="e.g. Image too blurry, wrong document type..."
                              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-red-500/50"
                           ></textarea>
                        </div>
                     )}
                  </div>

                  {/* Footer Actions */}
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                     {selectedDoc.status === 'Pending' ? (
                        <div className="flex gap-3">
                           <button 
                              onClick={handleReject}
                              disabled={!rejectionReason}
                              className="flex-1 py-2.5 bg-white dark:bg-card-dark border border-red-200 dark:border-red-800 text-red-600 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                           >
                              Reject & Request Re-upload
                           </button>
                           <button 
                              onClick={handleVerify}
                              className="flex-1 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-sm transition-colors"
                           >
                              Verify Document
                           </button>
                        </div>
                     ) : (
                        <button disabled className="w-full py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-lg font-medium cursor-not-allowed">
                           Action Completed
                        </button>
                     )}
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
