import React from 'react';
import { ModuleData } from '../types';

interface ModuleCardProps {
  data: ModuleData;
  onClick?: () => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ data, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        block bg-card-light dark:bg-card-dark p-6 rounded-xl 
        border border-gray-200 dark:border-gray-700 
        group transition-all duration-200 ease-out
        hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-200 dark:hover:shadow-black/20
        ${data.styles.hoverBorder}
        cursor-pointer
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${data.styles.iconBg} ${data.styles.iconText}`}
        >
          <span className="material-icons-outlined text-2xl select-none">{data.icon}</span>
        </div>
        {data.badge && (
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${data.badge.className}`}>
            {data.badge.text}
          </span>
        )}
      </div>
      <h3
        className={`text-lg font-bold text-text-main-light dark:text-text-main-dark mb-1 transition-colors ${data.styles.hoverTitle}`}
      >
        {data.title}
      </h3>
      <p className="text-sm text-text-sub-light dark:text-text-sub-dark">
        {data.subtitle}
        {data.value && (
          <span className="font-semibold text-text-main-light dark:text-text-main-dark">
            {data.value}
          </span>
        )}
      </p>
    </div>
  );
};