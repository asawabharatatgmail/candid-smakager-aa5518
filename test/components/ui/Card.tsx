import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div
    className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;
