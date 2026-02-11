import React, { useState } from 'react';
import { X, GripVertical, Plus, Trash2 } from 'lucide-react';
import { PipelineStage } from '../../types';

const COLORS = ['slate', 'blue', 'amber', 'purple', 'emerald', 'red', 'pink', 'cyan', 'orange', 'indigo'];
const COLOR_MAP: Record<string, string> = {
  slate: 'bg-slate-500', blue: 'bg-blue-500', amber: 'bg-amber-500', purple: 'bg-purple-500',
  emerald: 'bg-emerald-500', red: 'bg-red-500', pink: 'bg-pink-500', cyan: 'bg-cyan-500',
  orange: 'bg-orange-500', indigo: 'bg-indigo-500',
};

interface EditableStage {
  id: string;
  name: string;
  color: string;
  isNew?: boolean;
}

interface Props {
  stages: PipelineStage[];
  dealCountByStage: Record<string, number>;
  onSave: (changes: {
    created: { name: string; color: string; position: number }[];
    updated: { id: string; name: string; color: string; position: number }[];
    deleted: string[];
  }) => void;
  onClose: () => void;
}

const PipelineStageManager: React.FC<Props> = ({ stages, dealCountByStage, onSave, onClose }) => {
  const [items, setItems] = useState<EditableStage[]>(
    stages.map(s => ({ id: s.id, name: s.name, color: s.color }))
  );
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const addStage = () => {
    setItems(prev => [...prev, { id: `new-${Date.now()}`, name: '', color: 'slate', isNew: true }]);
  };

  const updateItem = (idx: number, field: 'name' | 'color', value: string) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const removeItem = (idx: number) => {
    const item = items[idx];
    const count = dealCountByStage[item.id] || 0;
    if (count > 0 && !item.isNew) {
      setDeleteConfirm(item.id);
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const confirmDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setDeleteConfirm(null);
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= items.length) return;
    setItems(prev => {
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
  };

  const handleSave = () => {
    const originalIds = new Set(stages.map(s => s.id));
    const currentIds = new Set(items.map(i => i.id));
    const created = items.filter(i => i.isNew && i.name.trim()).map((i, idx) => ({
      name: i.name.trim(), color: i.color, position: idx,
    }));
    const updated = items.filter(i => !i.isNew && i.name.trim()).map((i, idx) => ({
      id: i.id, name: i.name.trim(), color: i.color, position: idx,
    }));
    const deleted = stages.filter(s => !currentIds.has(s.id)).map(s => s.id);
    onSave({ created, updated, deleted });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Manage Stages</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {items.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 group">
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveItem(idx, -1)} disabled={idx === 0} className="text-slate-300 hover:text-slate-500 disabled:opacity-30 text-[10px]">▲</button>
                <button onClick={() => moveItem(idx, 1)} disabled={idx === items.length - 1} className="text-slate-300 hover:text-slate-500 disabled:opacity-30 text-[10px]">▼</button>
              </div>
              <div className="flex gap-1">
                {COLORS.map(c => (
                  <button
                    key={c} onClick={() => updateItem(idx, 'color', c)}
                    className={`w-5 h-5 rounded-full ${COLOR_MAP[c]} ${item.color === c ? 'ring-2 ring-offset-1 ring-slate-400' : 'opacity-40 hover:opacity-70'} transition-all`}
                  />
                ))}
              </div>
              <input
                value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)}
                placeholder="Stage name..."
                className="flex-1 px-2 py-1 text-sm bg-transparent border-b border-transparent focus:border-purple-400 outline-none"
              />
              <span className="text-[10px] text-slate-400 w-4 text-center">{dealCountByStage[item.id] || 0}</span>
              <button onClick={() => removeItem(idx)} className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button onClick={addStage} className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl border border-dashed border-slate-200 hover:border-purple-300 transition-all">
            <Plus size={14} /> Add Stage
          </button>
        </div>
        {deleteConfirm && (
          <div className="mx-6 mb-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs text-red-700 mb-2">This stage has deals. Deleting it will remove those deals. Continue?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={() => confirmDelete(deleteConfirm)} className="px-3 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg">Delete</button>
            </div>
          </div>
        )}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default PipelineStageManager;
