
import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ModuleCard } from './components/ModuleCard';
import { Footer } from './components/Footer';
import { AcademicsLayout } from './components/academics/AcademicsLayout';
import { CommunicationLayout } from './components/CommunicationLayout';
import { AdmissionsLayout } from './components/AdmissionsLayout';
import { StudentLayout } from './components/StudentLayout';
import { InstituteProfile } from './components/admin/InstituteProfile';
import { DASHBOARD_MODULES, SCHOOL_DATA } from './constants';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  // Lifted state for global branding
  const [activeSchoolId, setActiveSchoolId] = useState<string>('springfield');
  // State for navigating directly to specific thread in inbox
  const [commOpenThreadId, setCommOpenThreadId] = useState<number | null>(null);

  const handleModuleClick = (moduleTitle: string) => {
    if (moduleTitle === 'Academics') {
      setActiveModule('academics');
    } else if (moduleTitle === 'Communication') {
      setActiveModule('communication');
      setCommOpenThreadId(null); // Reset to default view
    } else if (moduleTitle === 'Admission') {
      setActiveModule('admission');
    } else if (moduleTitle === 'Student Info') {
      setActiveModule('students');
    } else if (moduleTitle === 'Institute Profile') { 
      setActiveModule('settings');
    } else {
      // Placeholder for other modules or generic handling
      console.log(`Clicked ${moduleTitle}`);
    }
  };

  const handleMessageClick = (threadId?: number) => {
    setActiveModule('communication');
    if (threadId) {
        setCommOpenThreadId(threadId);
    } else {
        setCommOpenThreadId(null); // Just open inbox default
    }
  };

  const currentSchoolProfile = SCHOOL_DATA[activeSchoolId];

  // Common props for Navbar
  const navbarProps = {
    schoolProfile: currentSchoolProfile,
    onSearchNavigation: handleModuleClick,
    onMessageClick: handleMessageClick
  };

  if (activeModule === 'academics') {
    return (
      <>
        <Navbar {...navbarProps} />
        <AcademicsLayout onBack={() => setActiveModule(null)} />
      </>
    );
  }

  if (activeModule === 'communication') {
    return (
      <>
        <Navbar {...navbarProps} />
        <CommunicationLayout 
          onBack={() => { setActiveModule(null); setCommOpenThreadId(null); }} 
          initialThreadId={commOpenThreadId} 
        />
      </>
    );
  }

  if (activeModule === 'admission') {
    return (
      <>
        <Navbar {...navbarProps} />
        <AdmissionsLayout onBack={() => setActiveModule(null)} />
      </>
    );
  }

  if (activeModule === 'students') {
    return (
      <>
        <Navbar {...navbarProps} />
        <StudentLayout onBack={() => setActiveModule(null)} />
      </>
    );
  }

  if (activeModule === 'settings') {
    return (
      <>
        <Navbar {...navbarProps} />
        <InstituteProfile 
          onBack={() => setActiveModule(null)} 
          activeSchoolId={activeSchoolId}
          onSchoolChange={setActiveSchoolId}
        />
      </>
    );
  }

  return (
    <>
      <Navbar {...navbarProps} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Hero />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {DASHBOARD_MODULES.map((module, index) => (
            <ModuleCard 
              key={index} 
              data={module} 
              onClick={() => handleModuleClick(module.title)}
            />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default App;
