import React, { useState, useMemo } from 'react';
import { X, Search, MapPin, Check } from 'lucide-react';
import { Opportunity } from '../../types';

interface Props {
  opportunities: Opportunity[];
  linkedIds: string[];
  onSave: (ids: string[]) => void;
  onClose: () => void;
}

const LinkOpportunityModal: React.FC<Props> = ({ opportunities, linkedIds, onSave, onClose }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set(linkedIds));

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return opportunities.filter(o =>
      o.title.toLowerCase().includes(q) || o.location.toLowerCase().includes(q)
    );
  }, [opportunities, search]);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Link Opportunities</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={18} /></button>
        </div>
        <div className="px-6 pt-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search opportunities..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {filtered.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No opportunities found</p>
          )}
          {filtered.map(opp => (
            <button
              key={opp.id}
              onClick={() => toggle(opp.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                selected.has(opp.id) ? 'border-purple-300 bg-purple-50' : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                selected.has(opp.id) ? 'border-purple-600 bg-purple-600' : 'border-slate-300'
              }`}>
                {selected.has(opp.id) && <Check size={12} className="text-white" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{opp.title}</p>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin size={10} /> {opp.location}
                  {opp.estimatedValue && <span className="ml-2 font-medium text-emerald-600">{opp.estimatedValue}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="p-6 border-t border-slate-100 flex justify-between items-center">
          <span className="text-xs text-slate-400">{selected.size} selected</span>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={() => onSave(Array.from(selected))} className="px-6 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors">Save Links</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkOpportunityModal;
