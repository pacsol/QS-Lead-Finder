import React, { useState, useMemo } from 'react';
import { Plus, Settings, DollarSign } from 'lucide-react';
import { PipelineStage, PipelineDeal, CRMContact, CRMCompany } from '../../types';
import PipelineDealCard from './PipelineDealCard';

const COLOR_DOT: Record<string, string> = {
  slate: 'bg-slate-500', blue: 'bg-blue-500', amber: 'bg-amber-500', purple: 'bg-purple-500',
  emerald: 'bg-emerald-500', red: 'bg-red-500', pink: 'bg-pink-500', cyan: 'bg-cyan-500',
  orange: 'bg-orange-500', indigo: 'bg-indigo-500',
};

const COLOR_BG: Record<string, string> = {
  slate: 'bg-slate-50', blue: 'bg-blue-50', amber: 'bg-amber-50', purple: 'bg-purple-50',
  emerald: 'bg-emerald-50', red: 'bg-red-50', pink: 'bg-pink-50', cyan: 'bg-cyan-50',
  orange: 'bg-orange-50', indigo: 'bg-indigo-50',
};

interface Props {
  stages: PipelineStage[];
  deals: PipelineDeal[];
  contacts: CRMContact[];
  companies: CRMCompany[];
  onAddDeal: (stageId: string) => void;
  onEditDeal: (deal: PipelineDeal) => void;
  onMoveDeal: (dealId: string, toStageId: string) => void;
  onManageStages: () => void;
}

const PipelineBoard: React.FC<Props> = ({
  stages, deals, contacts, companies, onAddDeal, onEditDeal, onMoveDeal, onManageStages,
}) => {
  const [dragDealId, setDragDealId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const dealsByStage = useMemo(() => {
    const map: Record<string, PipelineDeal[]> = {};
    stages.forEach(s => { map[s.id] = []; });
    deals.forEach(d => {
      if (map[d.stageId]) map[d.stageId].push(d);
    });
    return map;
  }, [stages, deals]);

  const stageValue = (stageId: string) => {
    const stageDeals = dealsByStage[stageId] || [];
    const total = stageDeals.reduce((sum, d) => {
      const num = parseFloat(d.value.replace(/[^0-9.]/g, ''));
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
    if (total === 0) return '';
    return total.toLocaleString();
  };

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDragDealId(dealId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => setDragOverStage(null);

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(null);
    if (dragDealId) {
      const deal = deals.find(d => d.id === dragDealId);
      if (deal && deal.stageId !== stageId) {
        onMoveDeal(dragDealId, stageId);
      }
    }
    setDragDealId(null);
  };

  if (stages.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 mb-4">No pipeline stages configured</p>
        <button onClick={onManageStages} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-colors">
          Set Up Pipeline
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={onManageStages} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
          <Settings size={14} /> Manage Stages
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
        {stages.map(stage => {
          const stageDeals = dealsByStage[stage.id] || [];
          const totalValue = stageValue(stage.id);
          const isOver = dragOverStage === stage.id;

          return (
            <div
              key={stage.id}
              onDragOver={e => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, stage.id)}
              className={`flex-shrink-0 w-72 flex flex-col rounded-2xl border transition-colors ${
                isOver ? 'border-purple-400 bg-purple-50/50' : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              {/* Column Header */}
              <div className={`p-4 rounded-t-2xl ${COLOR_BG[stage.color] || 'bg-slate-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${COLOR_DOT[stage.color] || 'bg-slate-500'}`} />
                    <h4 className="text-sm font-bold text-slate-900">{stage.name}</h4>
                    <span className="text-[10px] font-medium text-slate-400 bg-white px-1.5 py-0.5 rounded-md">{stageDeals.length}</span>
                  </div>
                </div>
                {totalValue && (
                  <div className="flex items-center gap-1 mt-1 text-xs font-medium text-slate-500">
                    <DollarSign size={10} /> {totalValue}
                  </div>
                )}
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {stageDeals.map(deal => (
                  <PipelineDealCard
                    key={deal.id}
                    deal={deal}
                    contacts={contacts}
                    companies={companies}
                    onEdit={onEditDeal}
                    onDragStart={handleDragStart}
                  />
                ))}
              </div>

              {/* Add Deal Button */}
              <div className="p-2">
                <button
                  onClick={() => onAddDeal(stage.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-slate-400 hover:text-purple-600 hover:bg-white rounded-xl border border-dashed border-slate-200 hover:border-purple-300 transition-all"
                >
                  <Plus size={12} /> Add Deal
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineBoard;
