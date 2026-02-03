
export interface ModuleData {
  title: string;
  subtitle: string;
  value?: string;
  icon: string;
  badge?: {
    text: string;
    className: string;
  };
  styles: {
    iconBg: string;
    iconText: string;
    hoverBorder: string;
    hoverTitle: string;
  };
}

export type AcademicsView = 
  | 'dashboard'
  | 'setup'
  | 'timetable'
  | 'attendance'
  | 'lessons'
  | 'assignments'
  | 'gradebook'
  | 'exams'
  | 'qbank'
  | 'reports'
  | 'settings'
  | 'communication'
  | 'help';

export interface SchoolProfile {
  id: string;
  name: string;
  affiliationNumber: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  logoUrl: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  foundedYear: string;
  principalName: string;
}
