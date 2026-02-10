import React, { useState, useEffect } from 'react';
import { X, Mail, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Opportunity, EmailSequence, Proposal, OnePager, AssetType, OutreachAsset } from '../types';
import { generateEmailSequence, generateProposal, generateOnePager } from '../services/outreachService';
import { saveOutreachAsset, getOutreachAssets, updateOutreachAsset } from '../services/supabaseService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import EditableAsset from './EditableAsset';

type TabId = 'email_sequence' | 'proposal' | 'one_pager';

interface OutreachPanelProps {
  opportunity: Opportunity;
  onClose: () => void;
}

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'email_sequence', label: 'Email Sequence', icon: <Mail size={18} /> },
  { id: 'proposal', label: 'Proposal', icon: <FileText size={18} /> },
  { id: 'one_pager', label: 'One-Pager', icon: <FileSpreadsheet size={18} /> },
];

const OutreachPanel: React.FC<OutreachPanelProps> = ({ opportunity, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('email_sequence');
  const [loading, setLoading] = useState<Record<TabId, boolean>>({
    email_sequence: false,
    proposal: false,
    one_pager: false,
  });
  const [content, setContent] = useState<Record<TabId, any>>({
    email_sequence: null,
    proposal: null,
    one_pager: null,
  });
  const [assetIds, setAssetIds] = useState<Record<TabId, string | null>>({
    email_sequence: null,
    proposal: null,
    one_pager: null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExistingAssets();
  }, [opportunity.id]);

  const loadExistingAssets = async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const assets = await getOutreachAssets(opportunity.id);
      const newContent: Record<TabId, any> = { email_sequence: null, proposal: null, one_pager: null };
      const newIds: Record<TabId, string | null> = { email_sequence: null, proposal: null, one_pager: null };
      assets.forEach((asset: OutreachAsset) => {
        const tab = asset.assetType as TabId;
        newContent[tab] = asset.content;
        newIds[tab] = asset.id;
      });
      setContent(newContent);
      setAssetIds(newIds);
    } catch (e) {
      // Silently fail - user can still generate new content
    }
  };

  const handleGenerate = async (tab: TabId) => {
    setLoading(prev => ({ ...prev, [tab]: true }));
    setError(null);
    try {
      let result: any;
      switch (tab) {
        case 'email_sequence':
          result = await generateEmailSequence(opportunity);
          break;
        case 'proposal':
          result = await generateProposal(opportunity);
          break;
        case 'one_pager':
          result = await generateOnePager(opportunity);
          break;
      }
      setContent(prev => ({ ...prev, [tab]: result }));

      // Auto-save to Supabase
      if (isSupabaseConfigured()) {
        const saved = await saveOutreachAsset(opportunity.id, tab, result);
        if (saved) {
          setAssetIds(prev => ({ ...prev, [tab]: saved.id }));
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed. Check your API key.');
    } finally {
      setLoading(prev => ({ ...prev, [tab]: false }));
    }
  };

  const handleSaveEdit = async (tab: TabId, updated: any) => {
    setContent(prev => ({ ...prev, [tab]: updated }));
    const existingId = assetIds[tab];
    if (isSupabaseConfigured() && existingId) {
      await updateOutreachAsset(existingId, updated);
    }
  };

  const currentContent = content[activeTab];
  const isLoading = loading[activeTab];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-3xl w-full max-w-3xl relative shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Outreach Assets</h2>
              <p className="text-xs text-slate-500">Project: {opportunity.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 size={32} className="text-blue-600 animate-spin" />
              <p className="text-slate-500 font-medium text-center">
                Generating {activeTab === 'email_sequence' ? 'email sequence' : activeTab === 'proposal' ? 'proposal' : 'one-pager'}...
              </p>
            </div>
          ) : currentContent ? (
            <EditableAsset
              content={currentContent}
              assetType={activeTab}
              onSave={(updated) => handleSaveEdit(activeTab, updated)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                {TABS.find(t => t.id === activeTab)?.icon}
              </div>
              <p className="text-slate-500 text-center">
                No {activeTab === 'email_sequence' ? 'email sequence' : activeTab === 'proposal' ? 'proposal' : 'one-pager'} generated yet.
              </p>
              <button
                onClick={() => handleGenerate(activeTab)}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
              >
                Generate with AI
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            {currentContent && 'Content generated. Use Edit to customize, Copy to clipboard, or Export to file.'}
          </div>
          <div className="flex gap-3">
            {currentContent && (
              <button
                onClick={() => handleGenerate(activeTab)}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                Regenerate
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutreachPanel;
