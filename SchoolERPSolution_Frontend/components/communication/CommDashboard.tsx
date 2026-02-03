import React from 'react';

export const CommDashboard: React.FC<{ onViewChange: (view: string) => void }> = ({ onViewChange }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Sent Today', value: '1,240', sub: 'SMS & Emails', icon: 'send', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Failed', value: '23', sub: 'Bounce/Invalid', icon: 'error_outline', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Open Rate', value: '42%', sub: 'Email Campaigns', icon: 'mark_email_read', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Inbox', value: '5', sub: 'Unread Threads', icon: 'chat', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-text-sub-light dark:text-text-sub-dark">{stat.label}</p>
              <h3 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark mt-1">{stat.value}</h3>
              <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
              <span className={`material-icons-outlined ${stat.color}`}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Broadcasts */}
        <div className="lg:col-span-2 bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h3 className="font-bold text-text-main-light dark:text-text-main-dark">Recent Broadcasts</h3>
            <button onClick={() => onViewChange('history')} className="text-xs text-primary hover:underline">View All</button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {[
              { title: 'School Closure - Heavy Rain', type: 'Emergency', date: 'Today, 08:30 AM', audience: 'All Parents', status: 'Sent', sent: 1200, failed: 15 },
              { title: 'Grade 10 PTM Reminder', type: 'Reminder', date: 'Yesterday, 04:00 PM', audience: 'Class 10 Parents', status: 'Delivered', sent: 45, failed: 0 },
              { title: 'Annual Sports Day Invite', type: 'Event', date: 'Oct 15, 10:00 AM', audience: 'All Staff & Students', status: 'Scheduled', sent: 0, failed: 0 },
            ].map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl
                    ${item.type === 'Emergency' ? 'bg-red-100 text-red-600' : item.type === 'Event' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    <span className="material-icons-outlined">{item.type === 'Emergency' ? 'warning' : item.type === 'Event' ? 'emoji_events' : 'notifications'}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text-main-light dark:text-text-main-dark">{item.title}</h4>
                    <p className="text-xs text-gray-500">{item.date} • {item.audience}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                    ${item.status === 'Sent' || item.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {item.status}
                  </span>
                  {item.status !== 'Scheduled' && (
                    <p className="text-[10px] text-gray-400 mt-1">{item.sent} sent, {item.failed} failed</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Status */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-text-main-light dark:text-text-main-dark mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => onViewChange('compose')} className="p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg flex flex-col items-center justify-center gap-2 transition-colors">
                <span className="material-icons-outlined">add_comment</span>
                <span className="text-xs font-bold">New Broadcast</span>
              </button>
              <button onClick={() => onViewChange('meetings')} className="p-3 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors">
                <span className="material-icons-outlined">video_call</span>
                <span className="text-xs font-bold">Schedule Meet</span>
              </button>
              <button onClick={() => onViewChange('templates')} className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors">
                <span className="material-icons-outlined">library_add</span>
                <span className="text-xs font-bold">Create Template</span>
              </button>
              <button onClick={() => onViewChange('reports')} className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors">
                <span className="material-icons-outlined">analytics</span>
                <span className="text-xs font-bold">View Reports</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-text-main-light dark:text-text-main-dark mb-4">Channel Health</h3>
            <div className="space-y-4">
              {[
                { name: 'SMS Gateway (Twilio)', status: 'Operational', quota: '45% used', color: 'green' },
                { name: 'Email (SendGrid)', status: 'Operational', quota: 'Unlimited', color: 'green' },
                { name: 'Push Notifications', status: 'Degraded', quota: 'Latency > 2s', color: 'yellow' },
              ].map((channel, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${channel.color === 'green' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className="text-gray-700 dark:text-gray-300">{channel.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{channel.quota}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
