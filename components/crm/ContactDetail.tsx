import React from 'react';
import {
  ArrowLeft, Edit3, Trash2, Link2, Mail, Phone, Building2, Tag,
  MapPin, DollarSign, Briefcase
} from 'lucide-react';
import {
  CRMContact, CRMCompany, CRMActivity, PipelineDeal, PipelineStage, Opportunity, ActivityType
} from '../../types';
import ActivityTimeline from './ActivityTimeline';
import ActivityForm from './ActivityForm';

interface Props {
  contact: CRMContact;
  company: CRMCompany | null;
  activities: CRMActivity[];
  deals: PipelineDeal[];
  stages: PipelineStage[];
  linkedOpportunities: Opportunity[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onLinkOpportunity: () => void;
  onLogActivity: (type: ActivityType, title: string, description: string) => void;
}

const ContactDetail: React.FC<Props> = ({
  contact, company, activities, deals, stages, linkedOpportunities,
  onBack, onEdit, onDelete, onLinkOpportunity, onLogActivity,
}) => {
  const getStageName = (id: string) => stages.find(s => s.id === id)?.name || '';

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-purple-600 transition-colors">
        <ArrowLeft size={16} /> Back to Contacts
      </button>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Profile */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl font-bold mx-auto">
                {contact.firstName[0]}{contact.lastName[0]}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-3">{contact.firstName} {contact.lastName}</h3>
              {contact.jobTitle && <p className="text-sm text-slate-500">{contact.jobTitle}</p>}
              {company && (
                <div className="flex items-center justify-center gap-1 text-sm text-slate-400 mt-1">
                  <Building2 size={12} /> {company.name}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              {contact.email && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone size={14} className="text-slate-400 shrink-0" />
                  {contact.phone}
                </div>
              )}
            </div>

            {contact.tags.length > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <div className="flex flex-wrap gap-1">
                  {contact.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium">
                      <Tag size={10} /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {contact.notes && (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500 leading-relaxed">{contact.notes}</p>
              </div>
            )}

            <div className="border-t border-slate-100 pt-4 flex gap-2">
              <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                <Edit3 size={12} /> Edit
              </button>
              <button onClick={onDelete} className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        </div>

        {/* Center Panel - Activity */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h4 className="text-sm font-bold text-slate-900 mb-4">Activity Timeline</h4>
            <ActivityForm onSubmit={onLogActivity} />
            <div className="mt-4">
              <ActivityTimeline activities={activities} />
            </div>
          </div>
        </div>

        {/* Right Panel - Linked Items */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          {/* Linked Opportunities */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900">Opportunities</h4>
              <button onClick={onLinkOpportunity} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                <Link2 size={14} />
              </button>
            </div>
            {linkedOpportunities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No linked opportunities</p>
            ) : (
              <div className="space-y-2">
                {linkedOpportunities.map(opp => (
                  <div key={opp.id} className="p-2.5 bg-slate-50 rounded-xl">
                    <p className="text-xs font-medium text-slate-900 truncate">{opp.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                      <span className="flex items-center gap-0.5"><MapPin size={8} /> {opp.location}</span>
                      {opp.estimatedValue && <span className="text-emerald-600 font-medium">{opp.estimatedValue}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Deals */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h4 className="text-sm font-bold text-slate-900 mb-3">Active Deals</h4>
            {deals.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No active deals</p>
            ) : (
              <div className="space-y-2">
                {deals.map(deal => (
                  <div key={deal.id} className="p-2.5 bg-slate-50 rounded-xl">
                    <p className="text-xs font-medium text-slate-900 truncate">{deal.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      {deal.value && (
                        <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-600">
                          <DollarSign size={8} />{deal.value}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">{getStageName(deal.stageId)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h4 className="text-sm font-bold text-slate-900 mb-3">Quick Stats</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Activities</span>
                <span className="font-bold text-slate-900">{activities.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Deals</span>
                <span className="font-bold text-slate-900">{deals.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Opportunities</span>
                <span className="font-bold text-slate-900">{linkedOpportunities.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Created</span>
                <span className="font-medium text-slate-700">{new Date(contact.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetail;
