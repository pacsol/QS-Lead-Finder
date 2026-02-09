
import React from 'react';
import { X, ShieldCheck, AlertCircle, Users, Lightbulb } from 'lucide-react';
import { Opportunity, AnalysisResult } from '../types';

interface AnalysisModalProps {
  opportunity: Opportunity;
  analysis: AnalysisResult | null;
  loading: boolean;
  onClose: () => void;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ opportunity, analysis, loading, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-3xl w-full max-w-2xl relative shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Expert Analysis</h2>
              <p className="text-xs text-slate-500">Project: {opportunity.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium animate-pulse text-center">
                Gemini 3 Pro is generating detailed feasibility insights...<br/>
                <span className="text-xs">Evaluating market risks and competitor trends</span>
              </p>
            </div>
          ) : analysis ? (
            <div className="space-y-8">
              <section className="flex gap-4">
                <div className="mt-1 bg-emerald-100 text-emerald-600 p-2 rounded-full h-fit">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Feasibility</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{analysis.feasibility}</p>
                </div>
              </section>

              <section className="flex gap-4">
                <div className="mt-1 bg-amber-100 text-amber-600 p-2 rounded-full h-fit">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Risk Assessment</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{analysis.riskAssessment}</p>
                </div>
              </section>

              <section className="flex gap-4">
                <div className="mt-1 bg-blue-100 text-blue-600 p-2 rounded-full h-fit">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Competitor Insights</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{analysis.competitorInsights}</p>
                </div>
              </section>

              <div className="bg-slate-900 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="text-yellow-400" size={20} />
                  <h3 className="font-bold text-white">Recommended Action</h3>
                </div>
                <p className="text-slate-300 text-sm italic leading-relaxed">
                  "{analysis.recommendedAction}"
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              Failed to load analysis. Please try again.
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;
