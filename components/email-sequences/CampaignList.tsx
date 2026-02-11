import React, { useState, useMemo } from 'react';
import { Search, Plus, Mail, Users, Clock, FileText } from 'lucide-react';
import { EmailCampaign, CampaignStatus, Opportunity } from '../../types';

interface Props {
  campaigns: EmailCampaign[];
  opportunities: Opportunity[];
  onSelect: (campaign: EmailCampaign) => void;
  onCreate: () => void;
}

const STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
};

const CampaignList: React.FC<Props> = ({ campaigns, opportunities, onSelect, onCreate }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return campaigns.filter(c => {
      const matchesSearch = !q || c.name.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, search, statusFilter]);

  const getOppName = (id: string | null) => {
    if (!id) return '';
    return opportunities.find(o => o.id === id)?.title || '';
  };

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return iso; }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
          />
        </div>
        <select
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
        <button onClick={onCreate} className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 transition-colors shadow-sm">
          <Plus size={16} /> Create Campaign
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 text-amber-400">
            <Mail size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{campaigns.length === 0 ? 'No campaigns yet' : 'No matches'}</h3>
          <p className="text-slate-500 text-sm mt-1">{campaigns.length === 0 ? 'Create your first email campaign to get started.' : 'Try adjusting your search or filter.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(campaign => (
            <button
              key={campaign.id}
              onClick={() => onSelect(campaign)}
              className="bg-white rounded-2xl border border-slate-200 p-5 text-left hover:border-amber-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Mail size={18} />
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-widest ${STATUS_COLORS[campaign.status]}`}>
                  {campaign.status}
                </span>
              </div>
              <h4 className="font-semibold text-slate-900 truncate group-hover:text-amber-700 transition-colors">
                {campaign.name}
              </h4>
              {campaign.opportunityId && (
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  <FileText size={10} className="inline mr-1" />
                  {getOppName(campaign.opportunityId)}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Mail size={10} /> {campaign.steps.length} steps</span>
                <span className="flex items-center gap-1"><Users size={10} /> {campaign.linkedContactIds.length} contacts</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
                <Clock size={10} /> Updated {formatDate(campaign.updatedAt)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignList;
