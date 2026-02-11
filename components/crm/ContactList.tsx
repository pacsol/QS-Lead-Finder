import React, { useState, useMemo } from 'react';
import { Search, Plus, User, Building2, Tag, Mail, Phone } from 'lucide-react';
import { CRMContact, CRMCompany } from '../../types';

interface Props {
  contacts: CRMContact[];
  companies: CRMCompany[];
  onSelect: (contact: CRMContact) => void;
  onCreate: () => void;
}

const ContactList: React.FC<Props> = ({ contacts, companies, onSelect, onCreate }) => {
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('');

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    contacts.forEach(c => c.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [contacts]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return contacts.filter(c => {
      const matchesSearch = !q ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.jobTitle.toLowerCase().includes(q);
      const matchesTag = !tagFilter || c.tags.includes(tagFilter);
      return matchesSearch && matchesTag;
    });
  }, [contacts, search, tagFilter]);

  const getCompanyName = (id: string | null) => {
    if (!id) return '';
    return companies.find(c => c.id === id)?.name || '';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
          />
        </div>
        {allTags.length > 0 && (
          <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20">
            <option value="">All Tags</option>
            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
        <button onClick={onCreate} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-colors shadow-sm">
          <Plus size={16} /> Add Contact
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
            <User size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{contacts.length === 0 ? 'No contacts yet' : 'No matches'}</h3>
          <p className="text-slate-500 text-sm mt-1">{contacts.length === 0 ? 'Add your first contact to get started.' : 'Try adjusting your search.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(contact => (
            <button
              key={contact.id}
              onClick={() => onSelect(contact)}
              className="bg-white rounded-2xl border border-slate-200 p-5 text-left hover:border-purple-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold shrink-0">
                  {contact.firstName[0]}{contact.lastName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-slate-900 truncate group-hover:text-purple-700 transition-colors">
                    {contact.firstName} {contact.lastName}
                  </h4>
                  {contact.jobTitle && <p className="text-xs text-slate-500 truncate">{contact.jobTitle}</p>}
                  {contact.companyId && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                      <Building2 size={10} /> {getCompanyName(contact.companyId)}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {contact.email && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500"><Mail size={10} /> <span className="truncate">{contact.email}</span></div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500"><Phone size={10} /> {contact.phone}</div>
                )}
              </div>
              {contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {contact.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-[10px] font-medium">
                      <Tag size={8} /> {tag}
                    </span>
                  ))}
                  {contact.tags.length > 3 && (
                    <span className="px-2 py-0.5 text-[10px] text-slate-400">+{contact.tags.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactList;
