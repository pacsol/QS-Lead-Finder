import React from 'react';
import {
  ArrowLeft, Edit3, Copy, Download, Trash2, Users, FileText,
  Clock, Mail, MapPin,
} from 'lucide-react';
import { EmailCampaign, CampaignStatus, Opportunity, CRMContact, CRMCompany } from '../../types';
import EmailStepEditor from './EmailStepEditor';

interface Props {
  campaign: EmailCampaign;
  opportunities: Opportunity[];
  contacts: CRMContact[];
  companies: CRMCompany[];
  onBack: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onChangeStatus: (status: CampaignStatus) => void;
  onUpdateSteps: (steps: EmailCampaign['steps']) => void;
  onLinkContacts: () => void;
}

const STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
};

const STATUS_FLOW: CampaignStatus[] = ['draft', 'active', 'paused', 'completed'];

const CampaignDetail: React.FC<Props> = ({
  campaign, opportunities, contacts, companies,
  onBack, onEdit, onDuplicate, onDelete,
  onChangeStatus, onUpdateSteps, onLinkContacts,
}) => {
  const linkedOpp = campaign.opportunityId
    ? opportunities.find(o => o.id === campaign.opportunityId)
    : null;

  const linkedContacts = contacts.filter(c => campaign.linkedContactIds.includes(c.id));

  const getCompanyName = (id: string | null) => {
    if (!id) return '';
    return companies.find(c => c.id === id)?.name || '';
  };

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return iso; }
  };

  const handleExport = () => {
    const text = campaign.steps.map((step, i) => (
      `--- Step ${i + 1} (${step.sendDelay}) ---\n` +
      `Subject: ${step.subject}\n\n` +
      `${step.body}\n\n` +
      `CTA: ${step.callToAction}`
    )).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${campaign.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-slate-900">{campaign.name}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-widest ${STATUS_COLORS[campaign.status]}`}>
                {campaign.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
              <Clock size={12} /> Updated {formatDate(campaign.updatedAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <Edit3 size={14} /> Edit
          </button>
          <button onClick={onDuplicate} className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <Copy size={14} /> Duplicate
          </button>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export
          </button>
          <button onClick={onDelete} className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Status Toggles */}
      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1.5">
        {STATUS_FLOW.map(s => (
          <button
            key={s}
            onClick={() => onChangeStatus(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              campaign.status === s
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Steps Editor — left */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
            <EmailStepEditor steps={campaign.steps} onChange={onUpdateSteps} />
          </div>
        </div>

        {/* Sidebar — right */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Linked Opportunity */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText size={14} /> Linked Opportunity
            </h4>
            {linkedOpp ? (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-sm font-medium text-slate-900">{linkedOpp.title}</p>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <MapPin size={10} /> {linkedOpp.location}
                </div>
                {linkedOpp.estimatedValue && (
                  <p className="text-xs font-medium text-emerald-600 mt-1">{linkedOpp.estimatedValue}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No opportunity linked</p>
            )}
          </div>

          {/* Linked Contacts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users size={14} /> Linked Contacts ({linkedContacts.length})
              </h4>
              <button onClick={onLinkContacts} className="text-xs font-medium text-amber-600 hover:text-amber-700">
                {linkedContacts.length > 0 ? 'Edit' : 'Link Contacts'}
              </button>
            </div>
            {linkedContacts.length > 0 ? (
              <div className="space-y-2">
                {linkedContacts.map(contact => (
                  <div key={contact.id} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-sm font-medium text-slate-900">{contact.firstName} {contact.lastName}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      {contact.email && <span className="flex items-center gap-0.5"><Mail size={10} /> {contact.email}</span>}
                      {contact.companyId && <span>{getCompanyName(contact.companyId)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No contacts linked yet</p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h4 className="text-sm font-bold text-slate-900 mb-3">Campaign Stats</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Email Steps</span>
                <span className="font-medium text-slate-900">{campaign.steps.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Linked Contacts</span>
                <span className="font-medium text-slate-900">{campaign.linkedContactIds.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Created</span>
                <span className="font-medium text-slate-900">{formatDate(campaign.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
