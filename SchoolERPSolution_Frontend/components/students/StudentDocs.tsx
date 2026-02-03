
import React from 'react';

export const StudentDocs: React.FC = () => {
  return (
    <div className="space-y-6 p-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Document Repository</h2>
            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-blue-600 flex items-center gap-2">
                <span className="material-icons-outlined text-sm">upload</span> Upload New
            </button>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex gap-4">
                <input type="text" placeholder="Search document name or student..." className="flex-1 p-2 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-card-dark text-sm outline-none" />
                <select className="p-2 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-card-dark text-sm outline-none">
                    <option>All Types</option>
                    <option>Birth Certificate</option>
                    <option>Medical Record</option>
                </select>
            </div>
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <th className="px-6 py-3">Document Name</th>
                        <th className="px-6 py-3">Student</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {[
                        { name: 'Birth_Cert_Aarav.pdf', student: 'Aarav Patel', type: 'Birth Certificate', date: 'Oct 24, 2024' },
                        { name: 'Med_Report_Zara.jpg', student: 'Zara Khan', type: 'Medical', date: 'Oct 22, 2024' },
                        { name: 'TC_Ishaan.pdf', student: 'Ishaan Gupta', type: 'Transfer Cert', date: 'Oct 20, 2024' },
                    ].map((doc, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                            <td className="px-6 py-4 flex items-center gap-2 font-medium">
                                <span className="material-icons-outlined text-red-500 text-lg">picture_as_pdf</span> {doc.name}
                            </td>
                            <td className="px-6 py-4">{doc.student}</td>
                            <td className="px-6 py-4"><span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">{doc.type}</span></td>
                            <td className="px-6 py-4 text-gray-500">{doc.date}</td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-blue-600 hover:underline text-xs mr-2">View</button>
                                <button className="text-gray-500 hover:text-red-500"><span className="material-icons-outlined text-sm">delete</span></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};
