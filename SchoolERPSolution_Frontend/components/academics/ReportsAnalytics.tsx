import React, { useState } from 'react';

// --- Types ---
type ReportType = 'attendance' | 'marks' | 'workload' | 'compliance';
type Tab = 'dashboard' | 'standard' | 'builder' | 'scheduled';

interface ReportTemplate {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  icon: string;
  color: string;
}

interface ScheduledReport {
  id: string;
  name: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  recipients: string[];
  nextRun: string;
  status: 'Active' | 'Paused';
}

interface AtRiskStudent {
  id: string;
  name: string;
  class: string;
  riskFactor: 'Attendance' | 'Academic' | 'Behavior';
  value: string;
  trend: 'down' | 'stable' | 'up';
}

// --- Mock Data ---
const STANDARD_REPORTS: ReportTemplate[] = [
  { id: 'r1', name: 'Attendance Summary', type: 'attendance', description: 'Monthly class-wise attendance aggregation.', icon: 'fact_check', color: 'bg-green-100 text-green-600' },
  { id: 'r2', name: 'Marks Distribution', type: 'marks', description: 'Grade analysis and bell curve distribution.', icon: 'bar_chart', color: 'bg-blue-100 text-blue-600' },
  { id: 'r3', name: 'Teacher Workload', type: 'workload', description: 'Class hours and assignment load per teacher.', icon: 'people', color: 'bg-purple-100 text-purple-600' },
  { id: 'r4', name: 'Assignment Compliance', type: 'compliance', description: 'Submission rates and missing homework report.', icon: 'assignment_late', color: 'bg-orange-100 text-orange-600' },
];

const MOCK_SCHEDULED: ScheduledReport[] = [
  { id: 's1', name: 'Weekly Attendance Report', frequency: 'Weekly', recipients: ['principal@school.edu', 'vp@school.edu'], nextRun: '2024-10-21', status: 'Active' },
  { id: 's2', name: 'Monthly Gradebook Audit', frequency: 'Monthly', recipients: ['exams@school.edu'], nextRun: '2024-11-01', status: 'Active' },
];

const AT_RISK_DATA: AtRiskStudent[] = [
  { id: 'st1', name: 'Charles Dunn', class: '10-A', riskFactor: 'Attendance', value: '62%', trend: 'down' },
  { id: 'st2', name: 'Evan Wright', class: '10-A', riskFactor: 'Academic', value: '38% Avg', trend: 'down' },
  { id: 'st3', name: 'Sarah Connor', class: '11-B', riskFactor: 'Behavior', value: '3 Incidents', trend: 'stable' },
  { id: 'st4', name: 'John Doe', class: '12-A', riskFactor: 'Attendance', value: '70%', trend: 'down' },
  { id: 'st5', name: 'Jane Smith', class: '9-C', riskFactor: 'Academic', value: '41% Avg', trend: 'stable' },
  { id: 'st6', name: 'Mike Ross', class: '11-A', riskFactor: 'Attendance', value: '65%', trend: 'down' },
  { id: 'st7', name: 'Rachel Zane', class: '10-B', riskFactor: 'Academic', value: '35% Avg', trend: 'down' },
  { id: 'st8', name: 'Harvey Specter', class: '12-B', riskFactor: 'Behavior', value: 'Suspension', trend: 'up' },
];

export const ReportsAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // Dashboard State
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string | null>(null);

  // Builder State
  const [builderFields, setBuilderFields] = useState<string[]>([]);
  const [builderName, setBuilderName] = useState('');
  
  // Standard Report View State
  const [selectedReport, setSelectedReport] = useState<ReportTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<any[] | null>(null);

  // Scheduler State
  const [scheduledReports, setScheduledReports] = useState(MOCK_SCHEDULED);

  // --- Helpers ---
  const toggleField = (field: string) => {
    if (builderFields.includes(field)) {
      setBuilderFields(builderFields.filter(f => f !== field));
    } else {
      setBuilderFields([...builderFields, field]);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // Mock Data Generation based on report type
      setGeneratedData(Array(5).fill(0).map((_, i) => ({
        id: i,
        col1: `Sample Data ${i + 1}`,
        col2: Math.floor(Math.random() * 100),
        col3: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        col4: 'View Details'
      })));
    }, 1500);
  };

  // --- Renderers ---

  const renderDashboard = () => {
    // Calculate counts
    const counts = {
        Attendance: AT_RISK_DATA.filter(s => s.riskFactor === 'Attendance').length,
        Academic: AT_RISK_DATA.filter(s => s.riskFactor === 'Academic').length,
        Behavior: AT_RISK_DATA.filter(s => s.riskFactor === 'Behavior').length,
    };
    const maxCount = Math.max(...Object.values(counts));

    const filteredStudents = selectedRiskFilter 
      ? AT_RISK_DATA.filter(s => s.riskFactor === selectedRiskFilter)
      : AT_RISK_DATA;

    return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500">Avg Attendance</p>
          <h3 className="text-2xl font-bold text-green-600">92.4%</h3>
          <div className="w-full bg-gray-200 h-1 mt-2 rounded-full"><div className="bg-green-500 h-1 w-[92%] rounded-full"></div></div>
        </div>
        <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500">School GPA</p>
          <h3 className="text-2xl font-bold text-blue-600">3.8</h3>
          <p className="text-xs text-blue-400">Out of 4.0</p>
        </div>
        <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500">Pending Grades</p>
          <h3 className="text-2xl font-bold text-orange-500">145</h3>
          <p className="text-xs text-gray-400">Assignments</p>
        </div>
        <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500">At-Risk Students</p>
          <h3 className="text-2xl font-bold text-red-600">{AT_RISK_DATA.length}</h3>
          <p className="text-xs text-red-400">Requires Intervention</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* At-Risk Analysis Panel */}
        <div className="lg:col-span-1 bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-[520px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">At-Risk Analysis</h3>
            {selectedRiskFilter && (
                <button onClick={() => setSelectedRiskFilter(null)} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <span className="material-icons-outlined text-xs">filter_alt_off</span> Clear Filter
                </button>
            )}
          </div>
          
          {/* Bar Chart Visualization */}
          <div className="flex items-end justify-around h-32 mb-6 border-b border-gray-100 dark:border-gray-700 pb-2 px-2">
                {Object.entries(counts).map(([key, count]) => {
                   const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                   const isSelected = selectedRiskFilter === key;
                   const colorClass = key === 'Attendance' ? 'bg-orange-400' : key === 'Academic' ? 'bg-red-400' : 'bg-purple-400';
                   const ringClass = key === 'Attendance' ? 'ring-orange-200' : key === 'Academic' ? 'ring-red-200' : 'ring-purple-200';
                   
                   return (
                     <div 
                        key={key} 
                        onClick={() => setSelectedRiskFilter(isSelected ? null : key)}
                        className={`flex flex-col items-center gap-1 cursor-pointer group w-1/4`}
                        title={`Click to filter by ${key}`}
                     >
                        <div className={`text-xs font-bold transition-colors ${isSelected ? 'text-text-main-light dark:text-text-main-dark scale-110' : 'text-gray-400'}`}>{count}</div>
                        <div 
                          className={`w-full rounded-t-md transition-all duration-300 ${colorClass} ${isSelected ? `opacity-100 ring-4 ${ringClass}` : 'opacity-70 group-hover:opacity-90'}`}
                          style={{ height: `${Math.max(height, 5)}%` }} // Ensure min height for visibility
                        ></div>
                        <div className={`text-[10px] font-medium uppercase truncate w-full text-center ${isSelected ? 'text-text-main-light dark:text-text-main-dark' : 'text-gray-400'}`}>{key}</div>
                     </div>
                   );
                })}
          </div>

          {/* Student List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filteredStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                    <span className="material-icons-outlined text-2xl mb-1">check_circle</span>
                    <p className="text-xs">No students found.</p>
                </div>
            ) : (
                filteredStudents.map(student => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900 transition-colors cursor-default">
                    <div>
                    <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{student.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{student.class}</span>
                        <span>•</span>
                        <span className={`font-medium ${
                            student.riskFactor === 'Attendance' ? 'text-orange-500' : 
                            student.riskFactor === 'Academic' ? 'text-red-500' : 
                            'text-purple-500'
                        }`}>
                            {student.riskFactor}
                        </span>
                    </div>
                    </div>
                    <div className="text-right">
                    <p className="font-bold text-red-600 text-sm">{student.value}</p>
                    <div className="flex items-center justify-end gap-1 text-[10px] text-gray-400">
                        <span>Trend</span>
                        <span className={`material-icons-outlined text-[10px] ${
                            student.trend === 'down' ? 'text-red-500' : 
                            student.trend === 'up' ? 'text-green-500' : 
                            'text-yellow-500'
                        }`}>
                            {student.trend === 'down' ? 'trending_down' : student.trend === 'up' ? 'trending_up' : 'trending_flat'}
                        </span>
                    </div>
                    </div>
                </div>
                ))
            )}
          </div>
          
          <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-700">
            <button className="w-full py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 shadow-sm flex items-center justify-center gap-2 transition-colors">
                <span className="material-icons-outlined text-sm">notifications_active</span>
                Alert Cohort ({filteredStudents.length})
            </button>
          </div>
        </div>

        {/* Visual Analytics */}
        <div className="lg:col-span-2 bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">Performance Trends (Yearly)</h3>
             <select className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-1">
                <option>All Classes</option>
                <option>Grade 10</option>
                <option>Grade 11</option>
             </select>
          </div>
          <div className="h-80 flex items-end justify-between gap-3 px-4 pb-2 border-b border-gray-200 dark:border-gray-700 relative">
            {/* Y-Axis Grid Lines (Visual only) */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 opacity-10">
                <div className="border-t border-gray-900 w-full"></div>
                <div className="border-t border-gray-900 w-full"></div>
                <div className="border-t border-gray-900 w-full"></div>
                <div className="border-t border-gray-900 w-full"></div>
                <div className="border-t border-gray-900 w-full"></div>
            </div>

            {[65, 70, 68, 72, 75, 80, 78, 82, 85, 84, 88, 92].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end group h-full relative z-10">
                <div 
                  className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-sm relative transition-all duration-500 hover:bg-blue-200 dark:hover:bg-blue-800/40"
                  style={{ height: `${h}%` }}
                >
                    <div 
                        className="absolute bottom-0 w-full bg-blue-500 rounded-t-sm transition-all duration-500 group-hover:bg-blue-600 shadow-sm"
                        style={{ height: '100%' }}
                    ></div>
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 whitespace-nowrap shadow-lg z-20">
                        <span className="font-bold">{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}</span>: {h}%
                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 px-4 pt-3">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                <span key={m}>{m}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )};

  const renderStandardReports = () => (
    <div className="space-y-6 animate-fade-in">
      {!selectedReport ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STANDARD_REPORTS.map(report => (
            <div 
              key={report.id} 
              onClick={() => setSelectedReport(report)}
              className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${report.color}`}>
                <span className="material-icons-outlined text-2xl">{report.icon}</span>
              </div>
              <h3 className="font-bold text-text-main-light dark:text-text-main-dark mb-1 group-hover:text-primary transition-colors">{report.name}</h3>
              <p className="text-xs text-text-sub-light dark:text-text-sub-dark">{report.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <button onClick={() => { setSelectedReport(null); setGeneratedData(null); }} className="hover:bg-gray-200 rounded-full p-1 transition-colors">
                <span className="material-icons-outlined text-gray-500">arrow_back</span>
              </button>
              <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">{selectedReport.name}</h3>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:bg-gray-50">
                <span className="material-icons-outlined text-sm">schedule</span> Schedule
              </button>
              <button className="flex items-center gap-1 text-xs px-3 py-1.5 bg-primary text-white rounded hover:bg-blue-600 shadow-sm">
                <span className="material-icons-outlined text-sm">download</span> Export PDF
              </button>
            </div>
          </div>

          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date Range</label>
              <div className="flex items-center gap-2">
                <input type="date" className="p-2 text-sm border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800" />
                <span className="text-gray-400">-</span>
                <input type="date" className="p-2 text-sm border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Class Filter</label>
              <select className="p-2 text-sm border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 min-w-[150px]">
                <option>All Classes</option>
                <option>Class 10</option>
                <option>Class 11</option>
              </select>
            </div>
            <button 
              onClick={handleGenerate}
              className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 shadow-sm"
            >
              Generate Report
            </button>
          </div>

          <div className="flex-1 p-6 overflow-auto">
            {isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <span className="material-icons-outlined text-4xl animate-spin mb-2">refresh</span>
                <p>Processing Data...</p>
              </div>
            ) : generatedData ? (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Name/Entity</th>
                    <th className="px-6 py-3">Value</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {generatedData.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-6 py-3 font-mono text-xs">{row.id}</td>
                      <td className="px-6 py-3 font-medium">{row.col1}</td>
                      <td className="px-6 py-3">{row.col2}</td>
                      <td className="px-6 py-3"><span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs">{row.col3}</span></td>
                      <td className="px-6 py-3 text-blue-500 hover:underline cursor-pointer">{row.col4}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <span className="material-icons-outlined text-6xl mb-2 opacity-20">table_chart</span>
                <p>Select filters and click Generate to view data.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderBuilder = () => {
    const availableFields = [
      'Student Name', 'Roll No', 'Class', 'Attendance %', 'GPA', 
      'Behavior Incidents', 'Fee Status', 'Parent Contact', 'Last Login',
      'Assignments Submitted', 'Avg Test Score'
    ];

    return (
      <div className="flex flex-col md:flex-row h-full gap-6 animate-fade-in">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">Data Fields</h3>
          <div className="flex-1 overflow-y-auto space-y-2">
            {availableFields.map(field => (
              <button 
                key={field}
                onClick={() => toggleField(field)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors border ${
                  builderFields.includes(field) 
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300' 
                    : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {field}
                {builderFields.includes(field) && <span className="material-icons-outlined text-sm">check</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex flex-col bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
            <input 
              type="text" 
              placeholder="Enter Custom Report Name..." 
              value={builderName}
              onChange={(e) => setBuilderName(e.target.value)}
              className="bg-transparent border-none text-lg font-bold placeholder-gray-400 focus:ring-0 outline-none w-1/2"
            />
            <div className="flex gap-2">
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm">Preview</button>
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm text-sm">Save Template</button>
            </div>
          </div>

          <div className="flex-1 p-8 bg-gray-50/50 dark:bg-gray-900/20 overflow-auto">
            {builderFields.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-gray-400">
                <span className="material-icons-outlined text-4xl mb-2">drag_indicator</span>
                <p>Select fields from the sidebar to build your report.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-card-dark shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase text-gray-500">
                      <tr>
                        {builderFields.map(f => <th key={f} className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">{f}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Fake Rows */}
                      {[1, 2, 3].map(row => (
                        <tr key={row} className="border-b border-gray-100 dark:border-gray-700">
                          {builderFields.map(f => (
                            <td key={f} className="px-6 py-3 text-gray-400 italic">
                              [Sample {f}]
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderScheduler = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">Scheduled Jobs</h3>
          <p className="text-sm text-gray-500">Automated email delivery of reports.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 shadow-sm">
          <span className="material-icons-outlined text-sm">add_alarm</span> New Schedule
        </button>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3">Report Name</th>
              <th className="px-6 py-3">Frequency</th>
              <th className="px-6 py-3">Recipients</th>
              <th className="px-6 py-3">Next Run</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {scheduledReports.map(job => (
              <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td className="px-6 py-4 font-medium">{job.name}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs">{job.frequency}</span></td>
                <td className="px-6 py-4 text-gray-500">{job.recipients.length} recipients</td>
                <td className="px-6 py-4">{job.nextRun}</td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1 text-xs font-bold ${job.status === 'Active' ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${job.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-primary mx-1"><span className="material-icons-outlined text-lg">edit</span></button>
                  <button className="text-gray-400 hover:text-red-500 mx-1"><span className="material-icons-outlined text-lg">delete</span></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Reports & Analytics</h2>
          <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Insights, performance tracking, and data exports.</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
            { id: 'standard', label: 'Standard Reports', icon: 'description' },
            { id: 'builder', label: 'Custom Builder', icon: 'build' },
            { id: 'scheduled', label: 'Scheduled', icon: 'event_repeat' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-all ${
                activeTab === tab.id 
                  ? 'bg-white dark:bg-card-dark shadow text-primary' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="material-icons-outlined text-sm">{tab.icon}</span>
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'standard' && renderStandardReports()}
        {activeTab === 'builder' && renderBuilder()}
        {activeTab === 'scheduled' && renderScheduler()}
      </div>
    </div>
  );
};
