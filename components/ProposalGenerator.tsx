import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Trash2, Eye, ArrowLeft, Copy, Download,
  Loader2, CheckSquare, Square, Edit3, Save, Check
} from 'lucide-react';
import {
  Opportunity, SavedProposal, ProposalSectionKey, PROPOSAL_SECTIONS
} from '../types';
import { generateCustomProposal } from '../services/outreachService';
import {
  saveProposal, getProposals, updateProposal, deleteProposal
} from '../services/supabaseService';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface ProposalGeneratorProps {
  opportunities: Opportunity[];
  savedLeads: Opportunity[];
}

type ViewState = 'list' | 'create' | 'view';

const DEFAULT_SECTIONS: ProposalSectionKey[] = [
  'coverLetter', 'executiveSummary', 'scopeOfServices',
  'methodology', 'timeline', 'feeStructure',
];

const formatLabel = (key: ProposalSectionKey): string => {
  return PROPOSAL_SECTIONS.find(s => s.key === key)?.label || key;
};

const ProposalGenerator: React.FC<ProposalGeneratorProps> = ({ opportunities, savedLeads }) => {
  const [viewState, setViewState] = useState<ViewState>('list');
  const [proposals, setProposals] = useState<SavedProposal[]>([]);
  const [activeProposal, setActiveProposal] = useState<SavedProposal | null>(null);

  // Create form state
  const [selectedOppId, setSelectedOppId] = useState('');
  const [selectedSections, setSelectedSections] = useState<ProposalSectionKey[]>(DEFAULT_SECTIONS);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const allLeads = [...opportunities, ...savedLeads].filter(
    (opp, idx, arr) => arr.findIndex(o => o.id === opp.id) === idx
  );

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const data = await getProposals();
      if (data.length > 0) setProposals(data);
    } catch {
      // local state fallback
    }
  };

  const handleCreate = () => {
    setViewState('create');
    setSelectedOppId('');
    setSelectedSections([...DEFAULT_SECTIONS]);
    setError(null);
    setActiveProposal(null);
  };

  const toggleSection = (key: ProposalSectionKey) => {
    setSelectedSections(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const toggleAll = () => {
    if (selectedSections.length === PROPOSAL_SECTIONS.length) {
      setSelectedSections([]);
    } else {
      setSelectedSections(PROPOSAL_SECTIONS.map(s => s.key));
    }
  };

  const handleGenerate = async () => {
    const opp = allLeads.find(o => o.id === selectedOppId);
    if (!opp || selectedSections.length === 0) return;

    setGenerating(true);
    setError(null);
    try {
      const content = await generateCustomProposal(opp, selectedSections);
      const now = new Date().toISOString();
      const proposal: SavedProposal = {
        id: crypto.randomUUID(),
        opportunityId: opp.id,
        opportunityTitle: opp.title,
        sections: selectedSections,
        content: content as Record<ProposalSectionKey, string>,
        createdAt: now,
        updatedAt: now,
      };

      setProposals(prev => [proposal, ...prev]);
      setActiveProposal(proposal);
      setViewState('view');

      if (isSupabaseConfigured()) {
        await saveProposal(proposal);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed. Check your API key.');
    } finally {
      setGenerating(false);
    }
  };

  const handleView = (p: SavedProposal) => {
    setActiveProposal(p);
    setEditing(false);
    setViewState('view');
  };

  const handleDelete = async (id: string) => {
    setProposals(prev => prev.filter(p => p.id !== id));
    if (isSupabaseConfigured()) {
      await deleteProposal(id);
    }
    if (activeProposal?.id === id) {
      setActiveProposal(null);
      setViewState('list');
    }
  };

  const handleStartEdit = () => {
    if (!activeProposal) return;
    setEditContent({ ...activeProposal.content });
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!activeProposal) return;
    const updated: SavedProposal = {
      ...activeProposal,
      content: editContent as Record<ProposalSectionKey, string>,
      updatedAt: new Date().toISOString(),
    };
    setActiveProposal(updated);
    setProposals(prev => prev.map(p => p.id === updated.id ? updated : p));
    setEditing(false);

    if (isSupabaseConfigured()) {
      await updateProposal(updated.id, updated.content);
    }
  };

  const handleCopyAll = () => {
    if (!activeProposal) return;
    const text = activeProposal.sections
      .map(key => `## ${formatLabel(key)}\n\n${activeProposal.content[key] || ''}`)
      .join('\n\n---\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!activeProposal) return;
    const text = `PROPOSAL: ${activeProposal.opportunityTitle}\nGenerated: ${new Date(activeProposal.createdAt).toLocaleDateString()}\n${'='.repeat(60)}\n\n` +
      activeProposal.sections
        .map(key => `${formatLabel(key).toUpperCase()}\n${'-'.repeat(40)}\n\n${activeProposal.content[key] || ''}`)
        .join('\n\n\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposal-${activeProposal.opportunityTitle.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const backToList = () => {
    setViewState('list');
    setActiveProposal(null);
    setEditing(false);
    setError(null);
  };

  // --- RENDER: Proposal List ---
  if (viewState === 'list') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-slate-900">Your Proposals</h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
              {proposals.length}
            </span>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <Plus size={16} />
            New Proposal
          </button>
        </div>

        {proposals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-500">
              <FileText size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No proposals yet</h3>
            <p className="text-slate-500 mb-6 max-w-md text-center">
              Generate your first proposal by selecting a lead and choosing which sections to include.
            </p>
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
            >
              Generate Your First Proposal
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {proposals.map(p => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{p.opportunityTitle}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {p.sections.length} sections &middot; {new Date(p.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => handleView(p)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- RENDER: Create ---
  if (viewState === 'create') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <button
          onClick={backToList}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Proposals
        </button>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">New Proposal</h3>
            <p className="text-sm text-slate-500">Select a lead and choose which sections to include.</p>
          </div>

          {/* Lead selector */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Select Lead</label>
            <select
              value={selectedOppId}
              onChange={e => setSelectedOppId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="">Choose a lead...</option>
              {allLeads.map(opp => (
                <option key={opp.id} value={opp.id}>
                  {opp.title} — {opp.location}
                </option>
              ))}
            </select>
          </div>

          {/* Section picker */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-700">Proposal Sections</label>
              <button
                onClick={toggleAll}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {selectedSections.length === PROPOSAL_SECTIONS.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {PROPOSAL_SECTIONS.map(section => {
                const isSelected = selectedSections.includes(section.key);
                return (
                  <button
                    key={section.key}
                    onClick={() => toggleSection(section.key)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!selectedOppId || selectedSections.length === 0 || generating}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating Proposal...
              </>
            ) : (
              <>
                <FileText size={18} />
                Generate Proposal
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER: View / Edit ---
  if (viewState === 'view' && activeProposal) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex items-center justify-between">
          <button
            onClick={backToList}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Proposals
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy All'}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Download size={16} />
              Export .txt
            </button>
            {!editing ? (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <Edit3 size={16} />
                Edit
              </button>
            ) : (
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Save size={16} />
                Save
              </button>
            )}
            <button
              onClick={() => handleDelete(activeProposal.id)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xl font-bold text-slate-900">{activeProposal.opportunityTitle}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {activeProposal.sections.length} sections &middot; Generated {new Date(activeProposal.createdAt).toLocaleDateString()}
              {activeProposal.updatedAt !== activeProposal.createdAt &&
                ` &middot; Updated ${new Date(activeProposal.updatedAt).toLocaleDateString()}`}
            </p>
          </div>

          <div className="p-6 space-y-8">
            {activeProposal.sections.map(key => (
              <div key={key}>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
                  {formatLabel(key)}
                </h4>
                {editing ? (
                  <textarea
                    value={editContent[key] || ''}
                    onChange={e => setEditContent(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full min-h-[150px] p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 leading-relaxed outline-none focus:ring-2 focus:ring-blue-500/20 resize-y"
                  />
                ) : (
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {activeProposal.content[key] || ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ProposalGenerator;
