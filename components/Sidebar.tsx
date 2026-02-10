
import React from 'react';
import { LayoutDashboard, Search, Bookmark, Settings, Building2, FileText, Users, Mail } from 'lucide-react';
import { ViewMode } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems = [
    { id: ViewMode.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
    { id: ViewMode.SEARCH, icon: Search, label: 'Lead Finder' },
    { id: ViewMode.PROPOSALS, icon: FileText, label: 'Proposal Generator' },
    { id: ViewMode.CRM, icon: Users, label: 'CRM' },
    { id: ViewMode.EMAIL_SEQUENCES, icon: Mail, label: 'Email Sequences' },
    { id: ViewMode.SAVED, icon: Bookmark, label: 'Watchlist' },
    { id: ViewMode.SETTINGS, icon: Settings, label: 'Preferences' },
  ];

  return (
    <aside className="w-64 bg-slate-900 h-screen flex flex-col fixed left-0 top-0 text-white z-20">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Building2 size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">QS Marketing Hub</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 p-4 rounded-xl">
          <p className="text-xs text-slate-400 mb-2">PRO PLAN</p>
          <p className="text-sm font-semibold mb-3">Unlimited Searches</p>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-3/4"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
