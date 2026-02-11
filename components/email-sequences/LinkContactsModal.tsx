import React, { useState, useMemo } from 'react';
import { X, Search, Check, Building2 } from 'lucide-react';
import { CRMContact, CRMCompany } from '../../types';

interface Props {
  contacts: CRMContact[];
  companies: CRMCompany[];
  linkedIds: string[];
  onSave: (ids: string[]) => void;
  onClose: () => void;
}

const LinkContactsModal: React.FC<Props> = ({ contacts, companies, linkedIds, onSave, onClose }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set(linkedIds));

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return contacts.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.jobTitle.toLowerCase().includes(q)
    );
  }, [contacts, search]);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const getCompanyName = (id: string | null) => {
    if (!id) return '';
    return companies.find(c => c.id === id)?.name || '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Link Contacts</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={18} /></button>
        </div>
        <div className="px-6 pt-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search contacts..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {filtered.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No contacts found</p>
          )}
          {filtered.map(contact => (
            <button
              key={contact.id}
              onClick={() => toggle(contact.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                selected.has(contact.id) ? 'border-amber-300 bg-amber-50' : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                selected.has(contact.id) ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
              }`}>
                {selected.has(contact.id) && <Check size={12} className="text-white" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {contact.firstName} {contact.lastName}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  {contact.email && <span>{contact.email}</span>}
                  {contact.companyId && (
                    <span className="flex items-center gap-0.5">
                      <Building2 size={10} /> {getCompanyName(contact.companyId)}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="p-6 border-t border-slate-100 flex justify-between items-center">
          <span className="text-xs text-slate-400">{selected.size} selected</span>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={() => onSave(Array.from(selected))} className="px-6 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors">Save Links</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkContactsModal;
