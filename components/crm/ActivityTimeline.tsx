import React from 'react';
import { Phone, Mail, Calendar, FileText, CheckSquare, ArrowRight, UserPlus } from 'lucide-react';
import { CRMActivity, CRMContact } from '../../types';

interface Props {
  activities: CRMActivity[];
  contacts?: CRMContact[];
  showContactName?: boolean;
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  note: { icon: <FileText size={14} />, color: 'bg-slate-100 text-slate-600' },
  call: { icon: <Phone size={14} />, color: 'bg-blue-100 text-blue-600' },
  email: { icon: <Mail size={14} />, color: 'bg-amber-100 text-amber-600' },
  meeting: { icon: <Calendar size={14} />, color: 'bg-purple-100 text-purple-600' },
  task: { icon: <CheckSquare size={14} />, color: 'bg-emerald-100 text-emerald-600' },
  deal_moved: { icon: <ArrowRight size={14} />, color: 'bg-indigo-100 text-indigo-600' },
  contact_created: { icon: <UserPlus size={14} />, color: 'bg-green-100 text-green-600' },
};

const ActivityTimeline: React.FC<Props> = ({ activities, contacts, showContactName }) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        No activities yet
      </div>
    );
  }

  const getContactName = (contactId: string) => {
    if (!contacts) return '';
    const c = contacts.find(c => c.id === contactId);
    return c ? `${c.firstName} ${c.lastName}` : '';
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-3">
      {activities.map(activity => {
        const config = TYPE_CONFIG[activity.type] || TYPE_CONFIG.note;
        return (
          <div key={activity.id} className="flex gap-3 group">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-slate-900 truncate">{activity.title}</span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider shrink-0">{activity.type.replace('_', ' ')}</span>
              </div>
              {showContactName && (
                <p className="text-xs text-purple-600 font-medium">{getContactName(activity.contactId)}</p>
              )}
              {activity.description && (
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{activity.description}</p>
              )}
              <p className="text-[10px] text-slate-400 mt-1">{formatDate(activity.createdAt)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityTimeline;
