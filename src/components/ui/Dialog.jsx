/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';

export const DialogContent = ({ children, className = '' }) => (
  <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}>
    <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
    <div className="relative bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
      {children}
    </div>
  </div>
);

export const DialogHeader = ({ className = '', ...props }) => (
  <div className={`flex flex-col space-y-1.5 mb-4 ${className}`} {...props} />
);

export const DialogTitle = ({ className = '', ...props }) => (
  <h2 className={`text-lg font-semibold ${className}`} {...props} />
);

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  
  return (
    <div onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  );
};