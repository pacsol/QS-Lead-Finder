import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { EmailCampaign, CampaignStatus, Opportunity, EmailStep } from '../../types';
import { generateCampaignSteps } from '../../services/emailCampaignService';

interface Props {
  campaign?: EmailCampaign | null;
  opportunities: Opportunity[];
  onSave: (data: { name: string; status: CampaignStatus; opportunityId: string | null; steps: EmailStep[] }) => void;
  onClose: () => void;
}

const CampaignForm: React.FC<Props> = ({ campaign, opportunities, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<CampaignStatus>('draft');
  const [opportunityId, setOpportunityId] = useState<string | null>(null);
  const [steps, setSteps] = useState<EmailStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => {
    if (campaign) {
      setName(campaign.name);
      setStatus(campaign.status);
      setOpportunityId(campaign.opportunityId);
      setSteps(campaign.steps);
    }
  }, [campaign]);

  const handleGenerate = async () => {
    if (!opportunityId) return;
    const opp = opportunities.find(o => o.id === opportunityId);
    if (!opp) return;
    setIsGenerating(true);
    setGenError(null);
    try {
      const generated = await generateCampaignSteps(opp);
      setSteps(generated);
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Failed to generate steps');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name: name.trim(), status, opportunityId, steps });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">{campaign ? 'Edit Campaign' : 'New Campaign'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Name *</label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Manchester Office Follow-up"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as CampaignStatus)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Linked Opportunity</label>
            <select
              value={opportunityId || ''}
              onChange={e => setOpportunityId(e.target.value || null)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
            >
              <option value="">None</option>
              {opportunities.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
            </select>
          </div>

          {opportunityId && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <><Loader2 size={16} className="animate-spin" /> Generating with AI...</>
              ) : (
                <><Sparkles size={16} /> Generate Steps with AI</>
              )}
            </button>
          )}

          {genError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{genError}</p>
          )}

          {steps.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <p className="text-sm text-emerald-700 font-medium">{steps.length} email step(s) ready</p>
              <p className="text-xs text-emerald-600 mt-0.5">You can edit these after creating the campaign.</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-sm">
              {campaign ? 'Update' : 'Create'} Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignForm;
