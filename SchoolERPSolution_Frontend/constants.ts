
import { ModuleData, SchoolProfile } from './types';

export const SCHOOL_DATA: Record<string, SchoolProfile> = {
  'springfield': {
    id: 'springfield',
    name: 'Springfield Academy',
    affiliationNumber: 'CBSE/AFF/2024/998877',
    address: '123 Education Lane, Springfield, IL',
    contactEmail: 'admin@springfield.edu',
    contactPhone: '+1 (555) 123-4567',
    website: 'www.springfield.edu',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/8074/8074800.png',
    theme: {
      primaryColor: '#3b82f6', // Blue-500
      secondaryColor: '#1e40af', // Blue-800
      accentColor: '#fbbf24', // Amber-400
    },
    foundedYear: '1985',
    principalName: 'Dr. Seymour Skinner'
  },
  'riverside': {
    id: 'riverside',
    name: 'Riverside High School',
    affiliationNumber: 'ICSE/2023/X/554422',
    address: '45 River Road, Brookside, NY',
    contactEmail: 'info@riversidehigh.org',
    contactPhone: '+1 (555) 987-6543',
    website: 'www.riversidehigh.org',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/5053/5053917.png',
    theme: {
      primaryColor: '#059669', // Emerald-600
      secondaryColor: '#064e3b', // Emerald-900
      accentColor: '#f472b6', // Pink-400
    },
    foundedYear: '1992',
    principalName: 'Mrs. Amanda Waller'
  }
};

export const DASHBOARD_MODULES: ModuleData[] = [
  {
    title: "Admission",
    subtitle: "New Enquiries: ",
    value: "18",
    icon: "person_add",
    badge: {
      text: "Active",
      className: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
    },
    styles: {
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      iconText: "text-blue-600 dark:text-blue-400",
      hoverBorder: "hover:border-blue-400 dark:hover:border-blue-500",
      hoverTitle: "group-hover:text-primary"
    }
  },
  {
    title: "Student Info",
    subtitle: "Total Students: ",
    value: "1,250",
    icon: "school",
    styles: {
      iconBg: "bg-teal-50 dark:bg-teal-900/20",
      iconText: "text-teal-600 dark:text-teal-400",
      hoverBorder: "hover:border-teal-400 dark:hover:border-teal-500",
      hoverTitle: "group-hover:text-teal-600 dark:group-hover:text-teal-400"
    }
  },
  {
    title: "Academics",
    subtitle: "Active Sessions",
    icon: "library_books",
    badge: {
      text: "85 Classes",
      className: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
    },
    styles: {
      iconBg: "bg-purple-50 dark:bg-purple-900/20",
      iconText: "text-purple-600 dark:text-purple-400",
      hoverBorder: "hover:border-purple-400 dark:hover:border-purple-500",
      hoverTitle: "group-hover:text-purple-600 dark:group-hover:text-purple-400"
    }
  },
  {
    title: "HR & Payroll",
    subtitle: "Present: ",
    value: "48/50",
    icon: "people",
    styles: {
      iconBg: "bg-indigo-50 dark:bg-indigo-900/20",
      iconText: "text-indigo-600 dark:text-indigo-400",
      hoverBorder: "hover:border-indigo-400 dark:hover:border-indigo-500",
      hoverTitle: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
    }
  },
  {
    title: "Finance",
    subtitle: "Collected: ",
    value: "$45k",
    icon: "attach_money",
    badge: {
      text: "+12%",
      className: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
    },
    styles: {
      iconBg: "bg-green-50 dark:bg-green-900/20",
      iconText: "text-green-600 dark:text-green-400",
      hoverBorder: "hover:border-green-400 dark:hover:border-green-500",
      hoverTitle: "group-hover:text-green-600 dark:group-hover:text-green-400"
    }
  },
  {
    title: "Examinations",
    subtitle: "Next: Mid-Term",
    icon: "assignment",
    badge: {
      text: "Upcoming",
      className: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
    },
    styles: {
      iconBg: "bg-orange-50 dark:bg-orange-900/20",
      iconText: "text-orange-600 dark:text-orange-400",
      hoverBorder: "hover:border-orange-400 dark:hover:border-orange-500",
      hoverTitle: "group-hover:text-orange-600 dark:group-hover:text-orange-400"
    }
  },
  {
    title: "Inventory",
    subtitle: "Low Stock: Lab Supplies",
    icon: "inventory_2",
    badge: {
      text: "Alert",
      className: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
    },
    styles: {
      iconBg: "bg-pink-50 dark:bg-pink-900/20",
      iconText: "text-pink-600 dark:text-pink-400",
      hoverBorder: "hover:border-pink-400 dark:hover:border-pink-500",
      hoverTitle: "group-hover:text-pink-600 dark:group-hover:text-pink-400"
    }
  },
  {
    title: "Transport",
    subtitle: "Active Routes: ",
    value: "12",
    icon: "directions_bus",
    styles: {
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      iconText: "text-blue-600 dark:text-blue-400",
      hoverBorder: "hover:border-blue-400 dark:hover:border-blue-500",
      hoverTitle: "group-hover:text-blue-600 dark:group-hover:text-blue-400"
    }
  },
  {
    title: "Communication",
    subtitle: "Unread Messages",
    icon: "forum",
    badge: {
      text: "5 New",
      className: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
    },
    styles: {
      iconBg: "bg-cyan-50 dark:bg-cyan-900/20",
      iconText: "text-cyan-600 dark:text-cyan-400",
      hoverBorder: "hover:border-cyan-400 dark:hover:border-cyan-500",
      hoverTitle: "group-hover:text-cyan-600 dark:group-hover:text-cyan-400"
    }
  },
  {
    title: "Hostel",
    subtitle: "Occupancy: ",
    value: "92%",
    icon: "apartment",
    styles: {
      iconBg: "bg-indigo-50 dark:bg-indigo-900/20",
      iconText: "text-indigo-600 dark:text-indigo-400",
      hoverBorder: "hover:border-indigo-400 dark:hover:border-indigo-500",
      hoverTitle: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
    }
  },
  {
    title: "Alumni",
    subtitle: "Recent Event: Reunion",
    icon: "school_outlined",
    styles: {
      iconBg: "bg-yellow-50 dark:bg-yellow-900/20",
      iconText: "text-yellow-600 dark:text-yellow-400",
      hoverBorder: "hover:border-yellow-400 dark:hover:border-yellow-500",
      hoverTitle: "group-hover:text-yellow-600 dark:group-hover:text-yellow-400"
    }
  },
  {
    title: "Institute Profile",
    subtitle: "Branding, Details & Config",
    icon: "domain",
    styles: {
      iconBg: "bg-gray-100 dark:bg-gray-800",
      iconText: "text-gray-600 dark:text-gray-400",
      hoverBorder: "hover:border-gray-400 dark:hover:border-gray-500",
      hoverTitle: "group-hover:text-gray-600 dark:group-hover:text-gray-300"
    }
  }
];
