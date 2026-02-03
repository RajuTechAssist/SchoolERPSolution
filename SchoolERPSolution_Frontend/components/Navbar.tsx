
import React, { useState, useEffect, useRef } from 'react';
import { SchoolProfile } from '../types';
import { DASHBOARD_MODULES } from '../constants';

interface NavbarProps {
  schoolProfile?: SchoolProfile;
  onSearchNavigation?: (moduleTitle: string) => void;
  onMessageClick?: (threadId?: number) => void;
}

// Mock Data
const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'New Admission Inquiry', subtitle: 'John Doe (Grade 5)', time: '10 mins ago', type: 'info', read: false },
  { id: 2, title: 'Server Maintenance', subtitle: 'Scheduled for tonight 10 PM', time: '1 hour ago', type: 'warning', read: false },
  { id: 3, title: 'Staff Meeting', subtitle: 'Tomorrow at 9:00 AM', time: '3 hours ago', type: 'event', read: true },
  { id: 4, title: 'Fee Report Generated', subtitle: 'Download available', time: 'Yesterday', type: 'success', read: true },
];

const MOCK_NAV_MESSAGES = [
  { id: 1, sender: 'Mrs. Sharma', text: 'I have already paid the fees...', time: '10m', avatar: 'S', color: 'bg-blue-100 text-blue-600', count: 1 },
  { id: 4, sender: 'Anonymous', text: 'I am scared to come to school...', time: '1h', avatar: '?', color: 'bg-red-100 text-red-600', count: 1 },
  { id: 2, sender: 'Rahul Gupta', text: 'Is the physics assignment due...', time: '2h', avatar: 'R', color: 'bg-green-100 text-green-600', count: 0 },
];

const MOCK_PEOPLE_SEARCH = [
  { id: 'p1', name: 'Adrian Miller', role: 'Student', detail: 'Class 10-A', icon: 'school' },
  { id: 'p2', name: 'Mrs. Verma', role: 'Teacher', detail: 'Physics Dept', icon: 'person' },
  { id: 'p3', name: 'Bianca Ross', role: 'Student', detail: 'Class 10-A', icon: 'school' },
  { id: 'p4', name: 'Mr. David', role: 'Staff', detail: 'Math Dept', icon: 'person' },
];

export const Navbar: React.FC<NavbarProps> = ({ schoolProfile, onSearchNavigation, onMessageClick }) => {
  const [isDark, setIsDark] = useState(false);
  
  // Dropdown States
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Refs for click outside
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isDarkStored = localStorage.getItem('theme') === 'dark';
    const isSystemDark = !('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (isDarkStored || isSystemDark) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (messageRef.current && !messageRef.current.contains(event.target as Node)) {
        setShowMessages(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const getFilteredResults = () => {
    if (!searchQuery) return { modules: [], people: [] };
    
    const lowerQ = searchQuery.toLowerCase();
    
    const modules = DASHBOARD_MODULES.filter(m => 
      m.title.toLowerCase().includes(lowerQ) || m.subtitle.toLowerCase().includes(lowerQ)
    );
    
    const people = MOCK_PEOPLE_SEARCH.filter(p => 
      p.name.toLowerCase().includes(lowerQ) || p.detail.toLowerCase().includes(lowerQ)
    );

    return { modules, people };
  };

  const { modules, people } = getFilteredResults();
  const hasResults = modules.length > 0 || people.length > 0;

  return (
    <nav className="bg-card-light dark:bg-card-dark shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300">
      
      {/* Left: Branding & Search */}
      <div className="flex items-center gap-6 w-1/2">
        {schoolProfile && (
          <div className="flex items-center gap-3 pr-4 border-r border-gray-200 dark:border-gray-700 cursor-pointer" onClick={() => onSearchNavigation?.('Institute Profile')}>
             <img src={schoolProfile.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
             <div className="hidden md:block leading-tight">
               <h1 className="font-bold text-sm text-text-main-light dark:text-text-main-dark">{schoolProfile.name}</h1>
               <p className="text-[10px] text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider font-semibold" style={{ color: schoolProfile.theme.primaryColor }}>Admin Portal</p>
             </div>
          </div>
        )}
        
        {/* Global Search */}
        <div className="relative w-full max-w-sm hidden md:block" ref={searchRef}>
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="material-icons-outlined text-text-sub-light dark:text-text-sub-dark select-none">search</span>
          </span>
          <input
            className="w-full py-2 pl-10 pr-4 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark placeholder-gray-400 dark:placeholder-gray-500 shadow-sm outline-none transition-all"
            placeholder="Search modules, students..."
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
          />
          
          {/* Search Dropdown */}
          {showSearch && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-card-dark rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in max-h-96 overflow-y-auto">
              {hasResults ? (
                <>
                  {modules.length > 0 && (
                    <div className="p-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase px-3 py-1">Modules</h4>
                      {modules.map((m, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => { 
                            onSearchNavigation?.(m.title); 
                            setShowSearch(false); 
                            setSearchQuery(''); 
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.styles.iconBg} ${m.styles.iconText}`}>
                            <span className="material-icons-outlined text-lg">{m.icon}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-main-light dark:text-text-main-dark">{m.title}</p>
                            <p className="text-xs text-text-sub-light dark:text-text-sub-dark">{m.subtitle}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {people.length > 0 && (
                    <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                      <h4 className="text-xs font-bold text-gray-400 uppercase px-3 py-1">People</h4>
                      {people.map((p) => (
                        <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300">
                            <span className="material-icons-outlined text-sm">{p.icon}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-main-light dark:text-text-main-dark">{p.name}</p>
                            <p className="text-xs text-text-sub-light dark:text-text-sub-dark">{p.role} • {p.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <span className="material-icons-outlined text-3xl mb-2">search_off</span>
                  <p className="text-sm">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-6">
        
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-text-sub-light dark:text-text-sub-dark"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <span className="material-icons-outlined select-none">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-text-sub-light dark:text-text-sub-dark"
          >
            <span className="material-icons-outlined select-none">notifications</span>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-card-dark rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in z-50">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <h4 className="font-bold text-sm text-text-main-light dark:text-text-main-dark">Notifications</h4>
                <button className="text-xs text-primary hover:underline">Mark all read</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {MOCK_NOTIFICATIONS.map(n => (
                  <div key={n.id} className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!n.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                    <div className="flex gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        n.type === 'info' ? 'bg-blue-500' : 
                        n.type === 'warning' ? 'bg-orange-500' : 
                        n.type === 'success' ? 'bg-green-500' : 'bg-purple-500'
                      }`} />
                      <div className="flex-1">
                        <p className={`text-sm ${!n.read ? 'font-semibold' : 'font-medium'} text-text-main-light dark:text-text-main-dark`}>{n.title}</p>
                        <p className="text-xs text-text-sub-light dark:text-text-sub-dark mt-0.5">{n.subtitle}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 text-center bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                <button className="text-xs font-medium text-text-sub-light dark:text-text-sub-dark hover:text-primary">View All Notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Chat (Message Icon) - Updated with Dropdown */}
        <div className="relative" ref={messageRef}>
          <button 
            onClick={() => setShowMessages(!showMessages)}
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-text-sub-light dark:text-text-sub-dark"
          >
            <span className="material-icons-outlined select-none">chat</span>
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">3</span>
          </button>

          {showMessages && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-card-dark rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in z-50">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <h4 className="font-bold text-sm text-text-main-light dark:text-text-main-dark">Messages</h4>
                <button onClick={() => { setShowMessages(false); onMessageClick?.(); }} className="text-xs text-primary hover:underline">View All</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {MOCK_NAV_MESSAGES.map(msg => (
                  <div 
                    key={msg.id} 
                    onClick={() => { setShowMessages(false); onMessageClick?.(msg.id); }}
                    className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${msg.color}`}>
                        {msg.avatar}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-bold text-text-main-light dark:text-text-main-dark truncate">{msg.sender}</p>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{msg.time}</span>
                        </div>
                        <p className="text-xs text-text-sub-light dark:text-text-sub-dark mt-0.5 truncate">{msg.text}</p>
                      </div>
                      {msg.count > 0 && (
                        <div className="flex flex-col justify-center">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 text-center bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => { setShowMessages(false); onMessageClick?.(); }} className="text-xs font-medium text-text-sub-light dark:text-text-sub-dark hover:text-primary">
                  Go to Inbox
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative pl-4 border-l border-gray-200 dark:border-gray-700" ref={profileRef}>
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-1.5 rounded-lg transition-colors"
          >
            <img
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-600"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDcWsZ71IOQ8GScHlSVFsqbrDe1hPp5Wu8tHbJ2RY2CHCZemBhAwg7uLhsvUPHz8Es-3mpBs8QC7LaIdu0dxNSogHGJ4fZO90RAM0awjIcyB27NT26zfF5Ebanoq9PIfDIajJhvmPBKwAjIgiNRVu4H_OZNL3qsT_pag22_k6y2GIYXwCw2Kp-8DbXwovGWZ0qdxcJfkq0V1fcD9AXxG1VGhb9_I7vLExYAPt_a_wesjFcQZVrDekJ1FDgYvvas-7yBr-k1jD0eOs8"
            />
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-text-main-light dark:text-text-main-dark">Principal Anderson</p>
              <p className="text-xs text-text-sub-light dark:text-text-sub-dark">Super Admin</p>
            </div>
            <span className="material-icons-outlined text-gray-400 text-sm hidden md:block">expand_more</span>
          </button>

          {showProfile && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-card-dark rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in z-50">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-bold text-text-main-light dark:text-text-main-dark">Skinner Anderson</p>
                <p className="text-xs text-gray-500">principal@springfield.edu</p>
              </div>
              <div className="p-2">
                <button className="w-full text-left px-3 py-2 text-sm text-text-main-light dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-2">
                  <span className="material-icons-outlined text-gray-400">person</span> My Profile
                </button>
                <button 
                  onClick={() => { setShowProfile(false); onSearchNavigation?.('Institute Profile'); }}
                  className="w-full text-left px-3 py-2 text-sm text-text-main-light dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-2"
                >
                  <span className="material-icons-outlined text-gray-400">settings</span> Settings
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-text-main-light dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-2">
                  <span className="material-icons-outlined text-gray-400">help</span> Help & Support
                </button>
              </div>
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2">
                  <span className="material-icons-outlined">logout</span> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
