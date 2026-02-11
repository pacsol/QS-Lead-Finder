import React, { useState, useMemo } from 'react';
import { Search, Plus, Building2, Globe, MapPin, Phone } from 'lucide-react';
import { CRMCompany, CRMContact } from '../../types';

interface Props {
  companies: CRMCompany[];
  contacts: CRMContact[];
  onSelect: (company: CRMCompany) => void;
  onCreate: () => void;
}

const CompanyList: React.FC<Props> = ({ companies, contacts, onSelect, onCreate }) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return companies.filter(c =>
      c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q)
    );
  }, [companies, search]);

  const contactCount = (companyId: string) =>
    contacts.filter(c => c.companyId === companyId).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
          />
        </div>
        <button onClick={onCreate} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-colors shadow-sm">
          <Plus size={16} /> Add Company
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
            <Building2 size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{companies.length === 0 ? 'No companies yet' : 'No matches'}</h3>
          <p className="text-slate-500 text-sm mt-1">{companies.length === 0 ? 'Add your first company to get started.' : 'Try adjusting your search.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(company => (
            <button
              key={company.id}
              onClick={() => onSelect(company)}
              className="bg-white rounded-2xl border border-slate-200 p-5 text-left hover:border-purple-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
                  {company.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-slate-900 truncate group-hover:text-purple-700 transition-colors">{company.name}</h4>
                  {company.industry && <p className="text-xs text-slate-500">{company.industry}</p>}
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {company.website && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500"><Globe size={10} /> <span className="truncate">{company.website}</span></div>
                )}
                {company.address && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500"><MapPin size={10} /> <span className="truncate">{company.address}</span></div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500"><Phone size={10} /> {company.phone}</div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{contactCount(company.id)} contact{contactCount(company.id) !== 1 ? 's' : ''}</span>
                <span className="text-[10px] text-slate-400">{new Date(company.createdAt).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyList;
