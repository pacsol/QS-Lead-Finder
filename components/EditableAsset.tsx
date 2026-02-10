import React, { useState } from 'react';
import { Pencil, Eye, Copy, Download, Check } from 'lucide-react';
import { EmailSequence, Proposal, OnePager, AssetType } from '../types';

interface EditableAssetProps {
  content: EmailSequence | Proposal | OnePager;
  assetType: AssetType;
  onSave: (updated: any) => void;
}

const EditableAsset: React.FC<EditableAssetProps> = ({ content, assetType, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = contentToText(editContent, assetType);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const text = contentToText(editContent, assetType);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assetType}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    onSave(editContent);
  };

  const updateField = (field: string, value: string) => {
    setEditContent(prev => ({ ...prev, [field]: value }));
  };

  const updateEmailStep = (index: number, field: string, value: string) => {
    const seq = editContent as EmailSequence;
    const newSteps = [...seq.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setEditContent({ ...seq, steps: newSteps });
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          {isEditing ? <><Check size={14} /> Save</> : <><Pencil size={14} /> Edit</>}
        </button>
        {isEditing && (
          <button
            onClick={() => { setIsEditing(false); setEditContent(content); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors bg-white border-slate-200 text-slate-400 hover:text-slate-600"
          >
            <Eye size={14} /> Cancel
          </button>
        )}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          {copied ? <><Check size={14} className="text-emerald-500" /> Copied!</> : <><Copy size={14} /> Copy</>}
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <Download size={14} /> Export
        </button>
      </div>

      {assetType === 'email_sequence' && renderEmailSequence(editContent as EmailSequence, isEditing, updateEmailStep)}
      {assetType === 'proposal' && renderProposal(editContent as Proposal, isEditing, updateField)}
      {assetType === 'one_pager' && renderOnePager(editContent as OnePager, isEditing, updateField)}
    </div>
  );
};

function renderEmailSequence(
  seq: EmailSequence,
  editing: boolean,
  onUpdate: (index: number, field: string, value: string) => void
) {
  return (
    <div className="space-y-6">
      {seq.steps.map((step, i) => (
        <div key={i} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{i + 1}</span>
            <span className="text-xs text-slate-400 font-medium">Send: {step.sendDelay}</span>
          </div>
          {editing ? (
            <div className="space-y-3">
              <input
                value={step.subject}
                onChange={(e) => onUpdate(i, 'subject', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <textarea
                value={step.body}
                onChange={(e) => onUpdate(i, 'body', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
              <input
                value={step.callToAction}
                onChange={(e) => onUpdate(i, 'callToAction', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-blue-600 outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Call to action..."
              />
            </div>
          ) : (
            <>
              <h4 className="font-bold text-slate-900 mb-2">Subject: {step.subject}</h4>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed mb-3">{step.body}</p>
              <p className="text-sm font-medium text-blue-600">CTA: {step.callToAction}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function renderProposal(
  proposal: Proposal,
  editing: boolean,
  onUpdate: (field: string, value: string) => void
) {
  const sections: { key: keyof Proposal; label: string }[] = [
    { key: 'executiveSummary', label: 'Executive Summary' },
    { key: 'scopeOfServices', label: 'Scope of Services' },
    { key: 'methodology', label: 'Methodology' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'feeStructure', label: 'Fee Structure' },
    { key: 'qualifications', label: 'Qualifications' },
  ];

  return (
    <div className="space-y-6">
      {sections.map(({ key, label }) => (
        <div key={key}>
          <h4 className="font-bold text-slate-900 mb-2">{label}</h4>
          {editing ? (
            <textarea
              value={proposal[key]}
              onChange={(e) => onUpdate(key, e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          ) : (
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 rounded-xl p-4">{proposal[key]}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function renderOnePager(
  onePager: OnePager,
  editing: boolean,
  onUpdate: (field: string, value: string) => void
) {
  const sections: { key: keyof OnePager; label: string }[] = [
    { key: 'headline', label: 'Headline' },
    { key: 'servicesList', label: 'Services' },
    { key: 'differentiators', label: 'Differentiators' },
    { key: 'recentProjects', label: 'Recent Projects' },
    { key: 'contactCTA', label: 'Contact / CTA' },
  ];

  return (
    <div className="space-y-6">
      {sections.map(({ key, label }) => (
        <div key={key}>
          <h4 className="font-bold text-slate-900 mb-2">{label}</h4>
          {editing ? (
            <textarea
              value={onePager[key]}
              onChange={(e) => onUpdate(key, e.target.value)}
              rows={key === 'headline' ? 2 : 4}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          ) : (
            key === 'headline' ? (
              <p className="text-xl font-bold text-blue-600 bg-blue-50 rounded-xl p-4">{onePager[key]}</p>
            ) : (
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 rounded-xl p-4">{onePager[key]}</p>
            )
          )}
        </div>
      ))}
    </div>
  );
}

function contentToText(content: any, assetType: AssetType): string {
  if (assetType === 'email_sequence') {
    const seq = content as EmailSequence;
    return seq.steps.map((step, i) =>
      `--- Email ${i + 1} (${step.sendDelay}) ---\nSubject: ${step.subject}\n\n${step.body}\n\nCTA: ${step.callToAction}`
    ).join('\n\n');
  }
  if (assetType === 'proposal') {
    const p = content as Proposal;
    return [
      `EXECUTIVE SUMMARY\n${p.executiveSummary}`,
      `SCOPE OF SERVICES\n${p.scopeOfServices}`,
      `METHODOLOGY\n${p.methodology}`,
      `TIMELINE\n${p.timeline}`,
      `FEE STRUCTURE\n${p.feeStructure}`,
      `QUALIFICATIONS\n${p.qualifications}`,
    ].join('\n\n');
  }
  const op = content as OnePager;
  return [
    op.headline,
    `SERVICES\n${op.servicesList}`,
    `DIFFERENTIATORS\n${op.differentiators}`,
    `RECENT PROJECTS\n${op.recentProjects}`,
    `CONTACT\n${op.contactCTA}`,
  ].join('\n\n');
}

export default EditableAsset;
