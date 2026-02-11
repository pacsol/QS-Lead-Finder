import React from 'react';
import { GripVertical, DollarSign, User, Calendar } from 'lucide-react';
import { PipelineDeal, CRMContact, CRMCompany } from '../../types';

interface Props {
  deal: PipelineDeal;
  contacts: CRMContact[];
  companies: CRMCompany[];
  onEdit: (deal: PipelineDeal) => void;
  onDragStart: (e: React.DragEvent, dealId: string) => void;
}

const PipelineDealCard: React.FC<Props> = ({ deal, contacts, companies, onEdit, onDragStart }) => {
  const contact = contacts.find(c => c.id === deal.contactId);
  const company = companies.find(c => c.id === deal.companyId);

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, deal.id)}
      onClick={() => onEdit(deal)}
      className="bg-white rounded-xl border border-slate-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-purple-200 transition-all group"
    >
      <div className="flex items-start gap-2">
        <div className="text-slate-300 group-hover:text-slate-400 mt-0.5">
          <GripVertical size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 truncate">{deal.title}</h4>
          {contact && (
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
              <User size={10} />
              <span className="truncate">{contact.firstName} {contact.lastName}</span>
            </div>
          )}
          {company && (
            <p className="text-[10px] text-slate-400 truncate">{company.name}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            {deal.value && (
              <span className="flex items-center gap-0.5 text-xs font-bold text-emerald-600">
                <DollarSign size={10} />{deal.value}
              </span>
            )}
            {deal.expectedCloseDate && (
              <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                <Calendar size={10} />{deal.expectedCloseDate}
              </span>
            )}
          </div>
          {deal.probability > 0 && (
            <div className="mt-2">
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${deal.probability}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{deal.probability}% probability</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PipelineDealCard;
