import React from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Copy, Download } from 'lucide-react';
import { EmailStep } from '../../types';

interface Props {
  steps: EmailStep[];
  onChange: (steps: EmailStep[]) => void;
}

const DELAY_OPTIONS = ['Immediate', '1 day', '2 days', '3 days', '5 days', '1 week', '2 weeks'];

const EmailStepEditor: React.FC<Props> = ({ steps, onChange }) => {
  const updateStep = (index: number, field: keyof EmailStep, value: string) => {
    const updated = steps.map((s, i) => i === index ? { ...s, [field]: value } : s);
    onChange(updated);
  };

  const addStep = () => {
    onChange([...steps, { subject: '', body: '', sendDelay: '3 days', callToAction: '' }]);
  };

  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    onChange(steps.filter((_, i) => i !== index));
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= steps.length) return;
    const updated = [...steps];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  const stepsToText = () => {
    return steps.map((step, i) => (
      `--- Step ${i + 1} (${step.sendDelay}) ---\n` +
      `Subject: ${step.subject}\n\n` +
      `${step.body}\n\n` +
      `CTA: ${step.callToAction}`
    )).join('\n\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(stepsToText());
  };

  const handleExport = () => {
    const blob = new Blob([stepsToText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-campaign.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900">Email Steps ({steps.length})</h4>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Copy all steps">
            <Copy size={12} /> Copy
          </button>
          <button onClick={handleExport} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Export as .txt">
            <Download size={12} /> Export
          </button>
        </div>
      </div>

      {steps.map((step, index) => (
        <div key={index} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                {index + 1}
              </span>
              <select
                value={step.sendDelay}
                onChange={e => updateStep(index, 'sendDelay', e.target.value)}
                className="text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                {DELAY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => moveStep(index, -1)} disabled={index === 0} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30" title="Move up">
                <ChevronUp size={14} />
              </button>
              <button onClick={() => moveStep(index, 1)} disabled={index === steps.length - 1} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30" title="Move down">
                <ChevronDown size={14} />
              </button>
              <button onClick={() => removeStep(index)} disabled={steps.length <= 1} className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-30" title="Remove step">
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Subject</label>
            <input
              value={step.subject}
              onChange={e => updateStep(index, 'subject', e.target.value)}
              placeholder="Email subject line..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Body</label>
            <textarea
              value={step.body}
              onChange={e => updateStep(index, 'body', e.target.value)}
              placeholder="Email body content..."
              rows={4}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Call to Action</label>
            <input
              value={step.callToAction}
              onChange={e => updateStep(index, 'callToAction', e.target.value)}
              placeholder="e.g. Schedule a call, Reply to confirm..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
            />
          </div>
        </div>
      ))}

      <button
        onClick={addStep}
        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 font-medium hover:border-amber-300 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={16} /> Add Step
      </button>
    </div>
  );
};

export default EmailStepEditor;
