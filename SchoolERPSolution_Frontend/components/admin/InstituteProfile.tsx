
import React, { useState } from 'react';
import { SchoolProfile } from '../../types';
import { SCHOOL_DATA } from '../../constants';

interface InstituteProfileProps {
  onBack: () => void;
  activeSchoolId: string;
  onSchoolChange: (id: string) => void;
}

export const InstituteProfile: React.FC<InstituteProfileProps> = ({ onBack, activeSchoolId, onSchoolChange }) => {
  // We use local state for editing to avoid constant re-renders on every keystroke in global state
  // But we sync with props when activeSchoolId changes
  const [profile, setProfile] = useState<SchoolProfile>(SCHOOL_DATA[activeSchoolId]);
  const [previewMode, setPreviewMode] = useState<'id_card' | 'login_screen' | 'report_header'>('id_card');
  const [isEditing, setIsEditing] = useState(false);

  // Sync local profile when parent switches school
  React.useEffect(() => {
    setProfile(SCHOOL_DATA[activeSchoolId]);
    setIsEditing(false);
  }, [activeSchoolId]);

  // --- Handlers ---
  const handleSchoolSwitch = (id: string) => {
    onSchoolChange(id); // Inform parent to change global state
  };

  const handleUpdate = (field: keyof SchoolProfile | string, value: string) => {
    if (field.startsWith('theme.')) {
      const themeKey = field.split('.')[1] as keyof typeof profile.theme;
      setProfile(prev => ({
        ...prev,
        theme: { ...prev.theme, [themeKey]: value }
      }));
    } else {
      setProfile(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = () => {
      // In a real app, this would make an API call.
      // For this demo, we'll update the global constant (mock persistence)
      SCHOOL_DATA[activeSchoolId] = profile; 
      onSchoolChange(activeSchoolId); // Trigger re-render in App
      setIsEditing(false);
  };

  // --- Previews ---
  const renderIDCardPreview = () => (
    <div className="w-full max-w-xs mx-auto aspect-[1.586/1] bg-white rounded-xl shadow-2xl overflow-hidden relative flex flex-col transition-all duration-500 border border-gray-200" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header Pattern */}
      <div 
        className="h-24 relative overflow-hidden flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${profile.theme.primaryColor}, ${profile.theme.secondaryColor})` }}
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 10%, transparent 10%)', backgroundSize: '10px 10px' }}></div>
        <img src={profile.logoUrl} alt="Logo" className="h-16 w-16 bg-white rounded-full p-1 shadow-lg relative z-10 object-contain" />
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4 flex flex-col items-center text-center">
        <h3 className="font-bold text-lg text-gray-800 leading-tight mb-1">{profile.name}</h3>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-4">Student Identity Card</p>
        
        <div className="flex items-start w-full gap-3 text-left">
          <div className="w-16 h-20 bg-gray-200 rounded border border-gray-300 flex items-center justify-center text-xs text-gray-400">
            Photo
          </div>
          <div className="flex-1 space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-bold text-gray-800">John Doe</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Class:</span> <span className="font-bold text-gray-800">10-A</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Roll:</span> <span className="font-bold text-gray-800">042</span></div>
            <div className="flex justify-between"><span className="text-gray-500">DOB:</span> <span className="font-bold text-gray-800">12 Aug 2008</span></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div 
        className="h-8 flex items-center justify-between px-4 text-[8px] text-white font-medium"
        style={{ backgroundColor: profile.theme.secondaryColor }}
      >
        <span>{profile.contactPhone}</span>
        <span style={{ color: profile.theme.accentColor }}>{profile.affiliationNumber.split('/')[0]}</span>
      </div>
    </div>
  );

  const renderLoginPreview = () => (
    <div className="w-full max-w-sm mx-auto bg-gray-100 rounded-xl shadow-inner border border-gray-300 overflow-hidden relative h-64 flex">
      <div 
        className="w-1/2 h-full p-4 flex flex-col justify-center text-white relative overflow-hidden"
        style={{ backgroundColor: profile.theme.primaryColor }}
      >
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <img src={profile.logoUrl} alt="Logo" className="w-12 h-12 mb-3 bg-white/20 rounded p-1 backdrop-blur-sm" />
        <h4 className="font-bold text-sm leading-tight">Welcome to {profile.name}</h4>
        <p className="text-[10px] opacity-80 mt-1">Portal v2.0</p>
      </div>
      <div className="w-1/2 h-full bg-white p-4 flex flex-col justify-center space-y-2">
        <div className="h-2 w-12 bg-gray-200 rounded"></div>
        <div className="h-8 w-full border border-gray-200 rounded bg-gray-50"></div>
        <div className="h-8 w-full border border-gray-200 rounded bg-gray-50"></div>
        <div 
          className="h-8 w-full rounded mt-2 shadow-sm"
          style={{ backgroundColor: profile.theme.primaryColor }}
        ></div>
      </div>
    </div>
  );

  const renderReportPreview = () => (
    <div className="w-full max-w-md mx-auto bg-white rounded shadow-lg border border-gray-200 p-6 min-h-[16rem]">
      <div className="flex gap-4 border-b-2 pb-4" style={{ borderColor: profile.theme.primaryColor }}>
        <img src={profile.logoUrl} className="w-16 h-16 object-contain" />
        <div className="flex-1 text-center">
          <h2 className="text-xl font-serif font-bold" style={{ color: profile.theme.primaryColor }}>{profile.name}</h2>
          <p className="text-xs text-gray-500">{profile.address}</p>
          <p className="text-xs font-bold mt-1" style={{ color: profile.theme.secondaryColor }}>Affiliation No: {profile.affiliationNumber}</p>
        </div>
      </div>
      <div className="mt-4 text-center">
        <span className="px-4 py-1 text-xs font-bold uppercase tracking-widest bg-gray-100 rounded-full text-gray-600">Report Card</span>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-2 bg-gray-100 rounded w-full"></div>
        <div className="h-2 bg-gray-100 rounded w-3/4"></div>
        <div className="h-2 bg-gray-100 rounded w-5/6"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-10">
      {/* Navigation Header */}
      <div className="sticky top-0 z-20 bg-card-light dark:bg-card-dark border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <span className="material-icons-outlined text-gray-600 dark:text-gray-300">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">Institute Profile</h1>
            <p className="text-xs text-text-sub-light dark:text-text-sub-dark">Manage identity, branding, and school details.</p>
          </div>
        </div>
        
        {/* Tenant Switcher (Simulation) */}
        <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <span className="px-2 text-xs font-bold text-gray-500 uppercase">Context:</span>
          {Object.keys(SCHOOL_DATA).map(key => (
            <button
              key={key}
              onClick={() => handleSchoolSwitch(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeSchoolId === key 
                  ? 'bg-white dark:bg-card-dark shadow text-primary' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {SCHOOL_DATA[key].name}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Configuration Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Basic Details Card */}
          <div className="bg-card-light dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-300`} style={{ backgroundColor: profile.theme.primaryColor }}></div>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark flex items-center gap-2">
                <span className="material-icons-outlined text-gray-400">school</span> School Details
              </h3>
              <div className="flex gap-2">
                {isEditing ? (
                    <>
                        <button 
                            onClick={() => { setIsEditing(false); setProfile(SCHOOL_DATA[activeSchoolId]); }}
                            className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 text-gray-600"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white flex items-center gap-1 shadow-sm hover:bg-blue-600"
                        >
                            <span className="material-icons-outlined text-sm">save</span>
                            Save
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 flex items-center gap-1"
                    >
                        <span className="material-icons-outlined text-sm">edit</span>
                        Edit Details
                    </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Institute Name</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={profile.name}
                  onChange={(e) => handleUpdate('name', e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-bold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary outline-none disabled:bg-transparent disabled:border-transparent disabled:p-0 disabled:text-lg"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Affiliation Number</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={profile.affiliationNumber}
                  onChange={(e) => handleUpdate('affiliationNumber', e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none disabled:bg-gray-50/50 disabled:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Principal Name</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={profile.principalName}
                  onChange={(e) => handleUpdate('principalName', e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none disabled:bg-gray-50/50 disabled:text-gray-600"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                <textarea 
                  rows={2}
                  disabled={!isEditing}
                  value={profile.address}
                  onChange={(e) => handleUpdate('address', e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none disabled:bg-gray-50/50 disabled:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Contact Email</label>
                <input 
                  type="email" 
                  disabled={!isEditing}
                  value={profile.contactEmail}
                  onChange={(e) => handleUpdate('contactEmail', e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none disabled:bg-gray-50/50 disabled:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Website</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={profile.website}
                  onChange={(e) => handleUpdate('website', e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none disabled:bg-gray-50/50 disabled:text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Branding Configuration */}
          <div className="bg-card-light dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-6 flex items-center gap-2">
              <span className="material-icons-outlined text-gray-400">palette</span> Branding & Assets
            </h3>

            <div className="space-y-6">
              {/* Logo Section */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-800 relative group cursor-pointer hover:border-primary transition-colors">
                  <img src={profile.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                    <span className="material-icons-outlined text-white">upload</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-text-main-light dark:text-text-main-dark">Institute Logo</h4>
                  <p className="text-xs text-gray-500 mb-2">Recommended: PNG, 512x512px, Transparent BG.</p>
                  <button className="text-xs text-primary font-medium hover:underline">Upload New</button>
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-700"></div>

              {/* Color Palette */}
              <div>
                <h4 className="font-bold text-sm text-text-main-light dark:text-text-main-dark mb-4">Theme Colors</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Primary (Brand)</label>
                    <div className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <input 
                        type="color" 
                        value={profile.theme.primaryColor} 
                        onChange={(e) => handleUpdate('theme.primaryColor', e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-none bg-transparent" 
                      />
                      <span className="text-xs font-mono uppercase">{profile.theme.primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Secondary (Dark)</label>
                    <div className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <input 
                        type="color" 
                        value={profile.theme.secondaryColor} 
                        onChange={(e) => handleUpdate('theme.secondaryColor', e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-none bg-transparent" 
                      />
                      <span className="text-xs font-mono uppercase">{profile.theme.secondaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Accent (Highlight)</label>
                    <div className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <input 
                        type="color" 
                        value={profile.theme.accentColor} 
                        onChange={(e) => handleUpdate('theme.accentColor', e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-none bg-transparent" 
                      />
                      <span className="text-xs font-mono uppercase">{profile.theme.accentColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <div className="bg-card-light dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-sm text-text-main-light dark:text-text-main-dark flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live Preview
                </h3>
                <div className="flex bg-white dark:bg-gray-700 rounded-lg p-0.5 border border-gray-200 dark:border-gray-600">
                  <button 
                    onClick={() => setPreviewMode('id_card')} 
                    className={`p-1.5 rounded transition-all ${previewMode === 'id_card' ? 'bg-gray-100 dark:bg-gray-600 text-primary' : 'text-gray-400'}`}
                    title="ID Card"
                  >
                    <span className="material-icons-outlined text-sm">badge</span>
                  </button>
                  <button 
                    onClick={() => setPreviewMode('login_screen')} 
                    className={`p-1.5 rounded transition-all ${previewMode === 'login_screen' ? 'bg-gray-100 dark:bg-gray-600 text-primary' : 'text-gray-400'}`}
                    title="Login Screen"
                  >
                    <span className="material-icons-outlined text-sm">login</span>
                  </button>
                  <button 
                    onClick={() => setPreviewMode('report_header')} 
                    className={`p-1.5 rounded transition-all ${previewMode === 'report_header' ? 'bg-gray-100 dark:bg-gray-600 text-primary' : 'text-gray-400'}`}
                    title="Document Header"
                  >
                    <span className="material-icons-outlined text-sm">description</span>
                  </button>
                </div>
              </div>
              
              <div className="p-8 bg-gray-100 dark:bg-gray-900/50 flex items-center justify-center min-h-[400px]">
                {previewMode === 'id_card' && renderIDCardPreview()}
                {previewMode === 'login_screen' && renderLoginPreview()}
                {previewMode === 'report_header' && renderReportPreview()}
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-900/30">
                  <span className="material-icons-outlined text-blue-500">info</span>
                  Changes reflect immediately across Mobile App, Web Portal, and Printed Docs.
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
