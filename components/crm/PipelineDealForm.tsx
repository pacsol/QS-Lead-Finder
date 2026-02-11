import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { PipelineDeal, PipelineStage, CRMContact, CRMCompany, Opportunity } from '../../types';

interface Props {
  deal?: PipelineDeal | null;
  stages: PipelineStage[];
  contacts: CRMContact[];
  companies: CRMCompany[];
  opportunities: Opportunity[];
  defaultStageId?: string;
  onSave: (data: Omit<PipelineDeal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const PipelineDealForm: React.FC<Props> = ({ deal, stages, contacts, companies, opportunities, defaultStageId, onSave, onDelete, onClose }) => {
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [contactId, setContactId] = useState('');
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [stageId, setStageId] = useState('');
  const [opportunityId, setOpportunityId] = useState<string | null>(null);
  const [probability, setProbability] = useState(0);
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (deal) {
      setTitle(deal.title); setValue(deal.value); setContactId(deal.contactId);
      setCompanyId(deal.companyId); setStageId(deal.stageId);
      setOpportunityId(deal.opportunityId); setProbability(deal.probability);
      setExpectedCloseDate(deal.expectedCloseDate); setNotes(deal.notes);
    } else if (defaultStageId) {
      setStageId(defaultStageId);
    }
  }, [deal, defaultStageId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactId || !stageId) return;
    onSave({
      title: title.trim(), value: value.trim(), contactId, companyId,
      stageId, opportunityId, probability, expectedCloseDate, notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">{deal ? 'Edit Deal' : 'New Deal'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deal Title *</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Value</label>
              <input value={value} onChange={e => setValue(e.target.value)} placeholder="e.g. 50,000" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Probability (%)</label>
              <input type="number" min={0} max={100} value={probability} onChange={e => setProbability(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contact *</label>
            <select required value={contactId} onChange={e => setContactId(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400">
              <option value="">Select contact...</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stage *</label>
              <select required value={stageId} onChange={e => setStageId(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400">
                <option value="">Select stage...</option>
                {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
              <select value={companyId || ''} onChange={e => setCompanyId(e.target.value || null)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400">
                <option value="">None</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Expected Close</label>
              <input type="date" value={expectedCloseDate} onChange={e => setExpectedCloseDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Linked Opportunity</label>
              <select value={opportunityId || ''} onChange={e => setOpportunityId(e.target.value || null)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400">
                <option value="">None</option>
                {opportunities.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 resize-none" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div>
              {deal && onDelete && (
                <button type="button" onClick={() => onDelete(deal.id)} className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">Delete Deal</button>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-sm">
                {deal ? 'Update' : 'Create'} Deal
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PipelineDealForm;
