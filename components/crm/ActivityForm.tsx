import React, { useState } from 'react';
import { Plus, Phone, Mail, Calendar, FileText, CheckSquare } from 'lucide-react';
import { ActivityType } from '../../types';

interface Props {
  onSubmit: (type: ActivityType, title: string, description: string) => void;
}

const ACTIVITY_TYPES: { type: ActivityType; label: string; icon: React.ReactNode }[] = [
  { type: 'note', label: 'Note', icon: <FileText size={14} /> },
  { type: 'call', label: 'Call', icon: <Phone size={14} /> },
  { type: 'email', label: 'Email', icon: <Mail size={14} /> },
  { type: 'meeting', label: 'Meeting', icon: <Calendar size={14} /> },
  { type: 'task', label: 'Task', icon: <CheckSquare size={14} /> },
];

const ActivityForm: React.FC<Props> = ({ onSubmit }) => {
  const [type, setType] = useState<ActivityType>('note');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(type, title.trim(), description.trim());
    setTitle('');
    setDescription('');
    setExpanded(false);
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl border border-dashed border-slate-200 hover:border-purple-300 transition-all"
      >
        <Plus size={16} /> Log Activity
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
      <div className="flex gap-1">
        {ACTIVITY_TYPES.map(at => (
          <button
            key={at.type} type="button"
            onClick={() => setType(at.type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              type === at.type ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {at.icon} {at.label}
          </button>
        ))}
      </div>
      <input
        value={title} onChange={e => setTitle(e.target.value)}
        placeholder="Activity title..."
        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
      />
      <textarea
        value={description} onChange={e => setDescription(e.target.value)}
        placeholder="Details (optional)..."
        rows={2}
        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
      />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => setExpanded(false)} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
        <button type="submit" className="px-4 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">Save</button>
      </div>
    </form>
  );
};

export default ActivityForm;
