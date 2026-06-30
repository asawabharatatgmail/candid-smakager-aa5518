import React from 'react';

interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  accent?: 'indigo' | 'violet' | 'emerald' | 'cyan' | 'pink' | 'orange' | 'amber';
}

const palette: Record<string, { icon: string; text: string; border: string }> = {
  indigo:  { icon: 'bg-indigo-100 text-indigo-600',  text: 'text-indigo-600',  border: 'hover:border-indigo-300' },
  violet:  { icon: 'bg-violet-100 text-violet-600',  text: 'text-violet-600',  border: 'hover:border-violet-300' },
  emerald: { icon: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-600', border: 'hover:border-emerald-300' },
  cyan:    { icon: 'bg-cyan-100 text-cyan-600',       text: 'text-cyan-600',    border: 'hover:border-cyan-300' },
  pink:    { icon: 'bg-pink-100 text-pink-600',       text: 'text-pink-600',    border: 'hover:border-pink-300' },
  orange:  { icon: 'bg-orange-100 text-orange-600',   text: 'text-orange-600',  border: 'hover:border-orange-300' },
  amber:   { icon: 'bg-amber-100 text-amber-600',     text: 'text-amber-600',   border: 'hover:border-amber-300' },
};

const DashboardCard: React.FC<DashboardCardProps> = ({ icon, title, description, onClick, accent = 'indigo' }) => {
  const p = palette[accent] ?? palette.indigo;

  return (
    <div
      onClick={onClick}
      className={`group bg-white rounded-2xl border border-slate-200 shadow-sm p-5 cursor-pointer
        transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${p.border}`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${p.icon}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 leading-snug mb-1 truncate">{title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
