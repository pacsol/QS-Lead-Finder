
import React from 'react';
import { MapPin, Calendar, ExternalLink, ShieldCheck, ChevronRight } from 'lucide-react';
import { Opportunity } from '../types';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onAnalyze: (opp: Opportunity) => void;
  onSave: (opp: Opportunity) => void;
  isSaved?: boolean;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, onAnalyze, onSave, isSaved }) => {
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Planning': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Tender': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Construction': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xl transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStageColor(opportunity.stage)}`}>
            {opportunity.stage.toUpperCase()}
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-2 group-hover:text-blue-600 transition-colors">
            {opportunity.title}
          </h3>
        </div>
        <button 
          onClick={() => onSave(opportunity)}
          className={`p-2 rounded-full border transition-colors ${isSaved ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-400 hover:text-blue-600'}`}
        >
          <ExternalLink size={18} />
        </button>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <MapPin size={16} />
          <span>{opportunity.location}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <Calendar size={16} />
          <span>Discovered: {new Date(opportunity.timestamp).toLocaleDateString()}</span>
        </div>
        {opportunity.estimatedValue && (
          <div className="text-blue-700 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded-lg inline-block">
            Est. Value: {opportunity.estimatedValue}
          </div>
        )}
      </div>

      <p className="text-slate-500 text-sm line-clamp-2 mb-6">
        {opportunity.description}
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => onAnalyze(opportunity)}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors"
        >
          <ShieldCheck size={18} />
          AI Analysis
        </button>
        <button
          className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          onClick={() => window.open(opportunity.url || '#', '_blank')}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default OpportunityCard;
