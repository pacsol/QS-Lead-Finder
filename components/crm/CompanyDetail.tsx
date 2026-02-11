import React from 'react';
import { ArrowLeft, Edit3, Trash2, Building2, Globe, MapPin, Phone, User, DollarSign } from 'lucide-react';
import { CRMCompany, CRMContact, PipelineDeal, PipelineStage } from '../../types';

interface Props {
  company: CRMCompany;
  contacts: CRMContact[];
  deals: PipelineDeal[];
  stages: PipelineStage[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSelectContact: (contact: CRMContact) => void;
}

const CompanyDetail: React.FC<Props> = ({
  company, contacts, deals, stages, onBack, onEdit, onDelete, onSelectContact,
}) => {
  const companyContacts = contacts.filter(c => c.companyId === company.id);
  const companyDeals = deals.filter(d => d.companyId === company.id);
  const getStageName = (id: string) => stages.find(s => s.id === id)?.name || '';

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-purple-600 transition-colors">
        <ArrowLeft size={16} /> Back to Companies
      </button>

      <div className="grid grid-cols-12 gap-6">
        {/* Company Info */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold mx-auto">
                {company.name.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-3">{company.name}</h3>
              {company.industry && <p className="text-sm text-slate-500">{company.industry}</p>}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              {company.website && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Globe size={14} className="text-slate-400 shrink-0" />
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="truncate text-blue-600 hover:underline">{company.website}</a>
                </div>
              )}
              {company.address && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">{company.address}</span>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone size={14} className="text-slate-400 shrink-0" />
                  {company.phone}
                </div>
              )}
            </div>

            {company.notes && (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500 leading-relaxed">{company.notes}</p>
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

        {/* Contacts */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h4 className="text-sm font-bold text-slate-900 mb-4">Contacts ({companyContacts.length})</h4>
            {companyContacts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No contacts linked to this company</p>
            ) : (
              <div className="space-y-2">
                {companyContacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => onSelectContact(contact)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {contact.firstName[0]}{contact.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{contact.firstName} {contact.lastName}</p>
                      {contact.jobTitle && <p className="text-xs text-slate-500">{contact.jobTitle}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Deals */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h4 className="text-sm font-bold text-slate-900 mb-4">Deals ({companyDeals.length})</h4>
            {companyDeals.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No deals for this company</p>
            ) : (
              <div className="space-y-2">
                {companyDeals.map(deal => (
                  <div key={deal.id} className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-sm font-medium text-slate-900 truncate">{deal.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      {deal.value && (
                        <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
                          <DollarSign size={10} />{deal.value}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">{getStageName(deal.stageId)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
