
import React, { useState, useEffect } from 'react';

type AudienceGroup = 'Teachers' | 'Students' | 'Parents' | 'Staff';

export const ComposeBroadcast: React.FC = () => {
  const [step, setStep] = useState(1);
  const [channels, setChannels] = useState<string[]>(['SMS']);
  
  // Smart Cohort State
  const [selectedGroups, setSelectedGroups] = useState<AudienceGroup[]>([]);
  const [contextFilter, setContextFilter] = useState<string>('All');
  const [estimatedCount, setEstimatedCount] = useState<number>(0);

  // Message Content State
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);

  // Test Send State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testContact, setTestContact] = useState('');

  // Update estimated count based on selection
  useEffect(() => {
    if (selectedGroups.length === 0) {
      setEstimatedCount(0);
      return;
    }
    // Mock logic for estimation
    let baseCount = 0;
    if (selectedGroups.includes('Students')) baseCount += 1200;
    if (selectedGroups.includes('Parents')) baseCount += 1100;
    if (selectedGroups.includes('Teachers')) baseCount += 80;
    if (selectedGroups.includes('Staff')) baseCount += 40;

    // Apply filter reduction
    if (contextFilter.includes('Class')) baseCount = Math.floor(baseCount * 0.03); // ~30-40 per class
    if (contextFilter === 'Science Dept') baseCount = Math.floor(baseCount * 0.1);
    if (contextFilter === 'Fee Defaulters') baseCount = Math.floor(baseCount * 0.05);
    if (contextFilter === 'At-Risk Attendance') baseCount = Math.floor(baseCount * 0.08);

    setEstimatedCount(baseCount);
  }, [selectedGroups, contextFilter]);

  const toggleChannel = (c: string) => {
    setChannels(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const toggleGroup = (group: AudienceGroup) => {
    setSelectedGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const handleSend = () => {
    alert(`Broadcast queued for ${estimatedCount} recipients!`);
    // Reset or redirect logic here
  };

  const handleTestSend = () => {
    if(!testContact) return alert("Please enter a contact number/email");
    alert(`Test message sent to ${testContact}`);
    setIsTestModalOpen(false);
  };

  const getCohortDescription = () => {
    if (selectedGroups.length === 0) return 'Select at least one group.';
    const groups = selectedGroups.join(' & ');
    if (contextFilter === 'All') return `All ${groups} in the school.`;
    return `${groups} associated with ${contextFilter}.`;
  };

  // SMS Stats Calculation
  const getSmsStats = (text: string) => {
    // Basic detection for characters outside standard GSM charset range (simplified)
    const isUnicode = /[^\u0020-\u007E\n\r]/.test(text); 
    const length = text.length;
    
    let limit = 160;
    let concatLimit = 153;
    
    if (isUnicode) {
        limit = 70;
        concatLimit = 67;
    }

    let segments = 1;
    if (length > limit) {
        segments = Math.ceil(length / concatLimit);
    }

    return { length, segments, isUnicode, remainingInSegment: (segments * concatLimit) - length };
  };

  const smsStats = getSmsStats(message);

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-[calc(100vh-140px)] animate-slide-in-right relative">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Compose Broadcast</h2>
          <p className="text-xs text-gray-500">Step {step} of 3: {step === 1 ? 'Audience & Channel' : step === 2 ? 'Content' : 'Review & Schedule'}</p>
        </div>
        <div className="flex gap-2">
           <button className="text-gray-500 hover:text-red-500 text-sm px-3 py-1 rounded">Cancel</button>
           <button className="text-primary hover:bg-blue-50 text-sm px-3 py-1 rounded">Save Draft</button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* STEP 1: CONFIG */}
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            {/* Channel Selector */}
            <div>
              <h3 className="text-sm font-bold uppercase text-gray-400 mb-3">1. Select Channels</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { id: 'SMS', icon: 'sms', label: 'SMS' },
                  { id: 'Email', icon: 'email', label: 'Email' },
                  { id: 'Push', icon: 'notifications_active', label: 'App Push' },
                  { id: 'WhatsApp', icon: 'chat', label: 'WhatsApp' },
                ].map((c) => (
                  <div 
                    key={c.id} 
                    onClick={() => toggleChannel(c.id)}
                    className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center gap-2 transition-all
                      ${channels.includes(c.id) 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-blue-300'}`}
                  >
                    <span className="material-icons-outlined text-2xl">{c.icon}</span>
                    <span className="font-medium text-sm">{c.label}</span>
                    {channels.includes(c.id) && <span className="material-icons-outlined text-blue-500 absolute top-2 right-2 text-xs">check_circle</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Cohort Builder */}
            <div>
              <h3 className="text-sm font-bold uppercase text-gray-400 mb-3">2. Build Audience Cohort</h3>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700 space-y-5">
                
                {/* Group Selection */}
                <div>
                   <label className="block text-xs font-semibold text-gray-500 mb-2">Target Groups (Select multiple)</label>
                   <div className="flex flex-wrap gap-3">
                      {(['Parents', 'Students', 'Teachers', 'Staff'] as AudienceGroup[]).map(group => (
                        <button
                          key={group}
                          onClick={() => toggleGroup(group)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border
                            ${selectedGroups.includes(group)
                              ? 'bg-primary text-white border-primary shadow-md transform scale-105'
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary hover:text-primary'
                            }`}
                        >
                          <span className="material-icons-outlined text-sm">
                            {group === 'Parents' ? 'family_restroom' : group === 'Students' ? 'school' : group === 'Teachers' ? 'history_edu' : 'badge'}
                          </span>
                          {group}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Context Filter */}
                <div>
                   <label className="block text-xs font-semibold text-gray-500 mb-2">Apply Context Filter</label>
                   <div className="relative">
                     <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                       <span className="material-icons-outlined text-lg">filter_alt</span>
                     </span>
                     <select 
                        value={contextFilter}
                        onChange={(e) => setContextFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
                     >
                        <option value="All">Entire School (No Filter)</option>
                        <optgroup label="Academic Classes">
                           <option value="Class 10-A">Class 10-A</option>
                           <option value="Class 10-B">Class 10-B</option>
                           <option value="Class 11-A">Class 11-A</option>
                           <option value="Class 12-Science">Class 12-Science</option>
                        </optgroup>
                        <optgroup label="Departments">
                           <option value="Science Dept">Science Department</option>
                           <option value="Math Dept">Math Department</option>
                           <option value="Admin Staff">Admin Staff</option>
                        </optgroup>
                        <optgroup label="Smart Filters (Auto-Generated)">
                           <option value="Fee Defaulters">Fee Defaulters (Outstanding &gt; $500)</option>
                           <option value="At-Risk Attendance">At-Risk Attendance (&lt; 75%)</option>
                           <option value="Top Performers">Top Performers (GPA &gt; 3.8)</option>
                        </optgroup>
                     </select>
                   </div>
                </div>

                {/* Visual Summary */}
                <div className="bg-white dark:bg-card-dark p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 flex items-start gap-4 shadow-sm">
                   <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-300">
                      <span className="material-icons-outlined text-xl">groups</span>
                   </div>
                   <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Audience Projection</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {getCohortDescription()}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                         <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <span className="material-icons-outlined text-sm">person_search</span>
                            ~{estimatedCount} Recipients
                         </span>
                         {selectedGroups.length > 0 && contextFilter !== 'All' && (
                           <span className="text-[10px] text-gray-400 italic">Filter applied to selection</span>
                         )}
                      </div>
                   </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CONTENT */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
               <h3 className="text-sm font-bold uppercase text-gray-400">Message Content</h3>
               <button className="text-xs text-primary flex items-center gap-1 hover:underline">
                 <span className="material-icons-outlined text-sm">library_books</span> Load Template
               </button>
            </div>

            {channels.includes('Email') && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary mb-4"
                  placeholder="e.g. Important Notice: School Timing Change"
                />
              </div>
            )}

            <div className="relative">
              <textarea 
                rows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                placeholder="Type your message here... Use {{student_name}} for personalization."
              ></textarea>
              
              {/* Enhanced Character Counter */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                 {channels.includes('SMS') && (
                    <div className={`text-[10px] px-2 py-1 rounded border flex items-center gap-2 transition-colors
                        ${smsStats.segments > 1 ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'}`}>
                        {smsStats.isUnicode && <span className="font-bold text-xs" title="Unicode Detected (Reduces segment length)">U</span>}
                        <span>{smsStats.length} chars</span>
                        <span className="w-px h-3 bg-gray-300 dark:bg-gray-500"></span>
                        <span className="font-bold">{smsStats.segments} SMS</span>
                    </div>
                 )}
                 {!channels.includes('SMS') && (
                    <div className="text-xs text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                        {message.length} characters
                    </div>
                 )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-500 self-center mr-2">Insert Token:</span>
              {['{{student_name}}', '{{parent_name}}', '{{class}}', '{{due_amount}}'].map(token => (
                <button 
                  key={token}
                  onClick={() => setMessage(prev => prev + token)}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 transition-colors"
                >
                  {token}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
               <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                 <span className="material-icons-outlined">attach_file</span> Attach File / Image
               </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
               <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2">Summary</h3>
               <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                 <li className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                    <span>Channels:</span> 
                    <span className="font-medium">{channels.join(', ')}</span>
                 </li>
                 <li className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                    <span>Audience:</span>
                    <span className="font-medium text-right max-w-[60%]">{getCohortDescription()}</span>
                 </li>
                 <li className="flex justify-between items-center pt-1">
                    <span>Estimated Reach:</span>
                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-md">
                        {estimatedCount} recipients
                    </span>
                 </li>
                 <li className="flex justify-between items-center text-xs text-gray-500">
                    <span>Est. Cost (SMS):</span>
                    <span>${ (estimatedCount * smsStats.segments * 0.01).toFixed(2) }</span>
                 </li>
               </ul>
            </div>

            <div className="border p-4 rounded-lg bg-white dark:bg-card-dark relative shadow-sm">
               <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                   <span className="text-xs text-gray-500 font-bold uppercase">Message Preview</span>
                   <button 
                      onClick={() => setIsTestModalOpen(true)}
                      className="text-xs flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                   >
                      <span className="material-icons-outlined text-sm">send_to_mobile</span>
                      Send Test
                   </button>
               </div>
               {channels.includes('Email') && subject && <div className="font-bold mb-2 text-sm">{subject}</div>}
               <div className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">{message || '(No content)'}</div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
               <label className="flex items-center justify-between cursor-pointer p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div>
                    <span className="block font-medium text-sm">Schedule for later</span>
                    <span className="text-xs text-gray-500">Send automatically at a specific time</span>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isScheduled} onChange={(e) => setIsScheduled(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
               </label>

               {isScheduled && (
                 <div className="grid grid-cols-2 gap-4 animate-fade-in">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Date</label>
                      <input type="date" className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Time</label>
                      <input type="time" className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-sm" />
                    </div>
                 </div>
               )}

               <label className="flex items-center gap-2 text-sm text-red-500 font-medium">
                  <input type="checkbox" className="rounded text-red-600 focus:ring-red-500" />
                  High Priority / Emergency (Override DND)
               </label>
            </div>
          </div>
        )}

      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark flex justify-between rounded-b-xl">
        <button 
          onClick={() => setStep(s => Math.max(1, s - 1))}
          disabled={step === 1}
          className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          Back
        </button>
        {step < 3 ? (
          <button 
            onClick={() => setStep(s => s + 1)}
            disabled={step === 1 && selectedGroups.length === 0}
            className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-blue-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next Step
          </button>
        ) : (
          <button 
            onClick={handleSend}
            className="px-8 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm font-bold flex items-center gap-2 transition-colors"
          >
            <span className="material-icons-outlined">send</span>
            {isScheduled ? 'Schedule' : 'Send Broadcast'}
          </button>
        )}
      </div>

      {/* Test Send Modal */}
      {isTestModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl" onClick={() => setIsTestModalOpen(false)}></div>
            <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-sm p-5 animate-slide-in-down">
                <h3 className="font-bold text-lg mb-4 text-text-main-light dark:text-text-main-dark">Send Test Message</h3>
                <p className="text-xs text-gray-500 mb-4">Send a preview to yourself or a specific number to verify formatting.</p>
                
                <label className="block text-xs font-medium text-gray-500 mb-1">Recipient (Phone/Email)</label>
                <input 
                    type="text" 
                    value={testContact}
                    onChange={(e) => setTestContact(e.target.value)}
                    placeholder="+1 555 000 0000"
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none"
                />
                
                <div className="flex justify-end gap-2">
                    <button onClick={() => setIsTestModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
                    <button onClick={handleTestSend} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Send Test</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
