import React from 'react';

export const Hero: React.FC = () => {
  return (
    <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 mb-10 text-white shadow-lg relative overflow-hidden select-none">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500 opacity-20 rounded-full blur-2xl pointer-events-none"></div>
      <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-2">Good Morning, Principal Anderson.</h1>
        <p className="text-blue-100 text-lg opacity-90">
          System Status: <span className="font-semibold text-green-300">Optimal</span>. All servers running smoothly.
        </p>
      </div>
    </div>
  );
};