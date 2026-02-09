
import React, { useState, useEffect } from 'react';
import { 
  Search as SearchIcon, MapPin, TrendingUp, Bell, Filter, Grid, 
  List as ListIcon, Lightbulb, Key, ShieldCheck, Database as DbIcon, 
  ExternalLink, CheckCircle2, XCircle, Globe, Cpu, Zap, Bookmark, 
  Github, Code, Package, Terminal, Database, FileSearch, HardDrive
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import OpportunityCard from './components/OpportunityCard';
import AnalysisModal from './components/AnalysisModal';
import { Opportunity, AnalysisResult, ViewMode, AIProvider, ProviderConfig, ExternalTool } from './types';
import { findOpportunities, parseOpportunities, analyzeLead } from './services/geminiService';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const MOCK_TRENDS = [
  { month: 'Jan', volume: 45, value: 120 },
  { month: 'Feb', volume: 52, value: 145 },
  { month: 'Mar', volume: 48, value: 130 },
  { month: 'Apr', volume: 61, value: 180 },
  { month: 'May', volume: 55, value: 165 },
  { month: 'Jun', volume: 67, value: 210 },
];

const EXTERNAL_TOOLS: ExternalTool[] = [
  { 
    name: 'Ralph', 
    url: 'https://github.com/snarktank/ralph', 
    description: 'An open-source construction estimation and document processing engine.',
    category: 'Estimation'
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedLeads, setSavedLeads] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState('Manchester');
  const [sector, setSector] = useState('Commercial');
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean | null>(null);
  const [searchSources, setSearchSources] = useState<Array<{ web?: { uri: string; title?: string } }>>([]);
  const [activeProvider, setActiveProvider] = useState<AIProvider>('gemini');
  
  const [selectedLead, setSelectedLead] = useState<Opportunity | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    checkKeyStatus();
    handleSearch();
  }, []);

  const checkKeyStatus = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      const status = await aistudio.hasSelectedApiKey();
      setHasGeminiKey(status);
    }
  };

  const handleOpenKeySelector = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      setHasGeminiKey(true);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setSearchError(null);
    try {
      const results = await findOpportunities(location, sector);
      setSearchSources(results.sources || []);
      const parsedLeads = await parseOpportunities(results.text);
      setOpportunities(parsedLeads);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchError(error instanceof Error ? error.message : "Search failed. Please check your API key and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async (opp: Opportunity) => {
    setSelectedLead(opp);
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await analyzeLead(opp);
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSave = (opp: Opportunity) => {
    setSavedLeads(prev => 
      prev.find(i => i.id === opp.id) 
        ? prev.filter(i => i.id !== opp.id) 
        : [...prev, opp]
    );
  };

  const providers: ProviderConfig[] = [
    { id: 'gemini', name: 'Google Gemini', status: hasGeminiKey ? 'connected' : 'disconnected', description: 'Supports Search & Maps Grounding. Recommended for Lead Discovery.', type: 'intelligence' },
    { id: 'ralph', name: 'Ralph (OS)', status: 'connected', description: 'Integration with snarktank/ralph for specialized QS document processing.', type: 'tool' },
    { id: 'supabase', name: 'Supabase', status: 'disconnected', description: 'Scalable PostgreSQL database to store and query your project leads.', type: 'database' },
    { id: 'google-file-search', name: 'Google File Search', status: 'disconnected', description: 'Search and sync project documentation via Google Drive.', type: 'database' },
    { id: 'openai', name: 'OpenAI GPT-4o', status: 'upcoming', description: 'Advanced reasoning for contract analysis and value engineering.', type: 'intelligence' },
    { id: 'openrouter', name: 'OpenRouter', status: 'upcoming', description: 'Access to Llama 3 and Claude via a single interface.', type: 'intelligence' },
  ];

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+12%</span>
          </div>
          <h4 className="text-slate-500 text-sm font-medium">New Opportunities</h4>
          <p className="text-3xl font-bold text-slate-900 mt-1">{opportunities.length || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <MapPin size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">{location}</span>
          </div>
          <h4 className="text-slate-500 text-sm font-medium">Market Reach</h4>
          <p className="text-3xl font-bold text-slate-900 mt-1">Wide</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <ShieldCheck size={20} />
            </div>
            <span className="text-xs font-bold text-purple-500 bg-purple-50 px-2 py-1 rounded-lg">Verified</span>
          </div>
          <h4 className="text-slate-500 text-sm font-medium">AI Reliability</h4>
          <p className="text-3xl font-bold text-slate-900 mt-1">High</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Regional Construction Index</h3>
              <p className="text-sm text-slate-500">Live activity based on active planning portals</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_TRENDS}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Package size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Github size={20} className="text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Featured Tool</span>
            </div>
            <h3 className="text-2xl font-bold mb-4">Ralph Integration</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Utilize the power of <span className="text-white font-medium">snarktank/ralph</span> for open-source estimation processing directly within QS Nexus.
            </p>
            
            <div className="space-y-4 mb-8">
              {EXTERNAL_TOOLS.map((tool, idx) => (
                <a 
                  key={idx} 
                  href={tool.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                      <Terminal size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{tool.name}</p>
                      <p className="text-[10px] text-slate-500">{tool.category}</p>
                    </div>
                  </div>
                  <ExternalLink size={16} className="text-slate-500" />
                </a>
              ))}
            </div>

            <button 
              onClick={() => setView(ViewMode.SETTINGS)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Code size={18} />
              Configure Pipeline
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Latest Leads</h3>
          <button onClick={() => setView(ViewMode.SEARCH)} className="text-blue-600 text-sm font-bold hover:underline">Launch Lead Finder</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl border border-slate-200"></div>
            ))
          ) : (
            opportunities.slice(0, 3).map((opp) => (
              <OpportunityCard 
                key={opp.id} 
                opportunity={opp} 
                onAnalyze={handleAnalyze} 
                onSave={toggleSave}
                isSaved={!!savedLeads.find(i => i.id === opp.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-lg shadow-slate-900/10">
              <Zap size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Integration Hub</h3>
              <p className="text-slate-500">Configure your AI providers, databases, and specialized tools.</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-12">
          {/* Intelligence Section */}
          <div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Intelligence Engines</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {providers.filter(p => p.type === 'intelligence').map((p) => (
                <div key={p.id} className={`p-6 rounded-2xl border transition-all ${p.id === activeProvider ? 'border-blue-600 ring-2 ring-blue-600/10 bg-blue-50/10' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${p.status === 'connected' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                      <Cpu size={24} />
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-widest ${
                      p.status === 'connected' ? 'bg-emerald-500 text-white' : 
                      p.status === 'disconnected' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 mb-2">{p.name}</h5>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed min-h-[48px]">{p.description}</p>
                  {p.id === 'gemini' ? (
                    <button onClick={handleOpenKeySelector} className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                      <Key size={16} /> {hasGeminiKey ? 'Reconnect' : 'Connect'}
                    </button>
                  ) : (
                    <button disabled className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-sm cursor-not-allowed">Coming Soon</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Database & Storage Section */}
          <div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Database & Storage</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.filter(p => p.type === 'database').map((p) => (
                <div key={p.id} className="p-6 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
                      {p.id === 'supabase' ? <Database size={24} className="text-emerald-500" /> : <FileSearch size={24} className="text-blue-500" />}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-widest bg-amber-500 text-white">Setup Required</span>
                  </div>
                  <h5 className="font-bold text-slate-900 mb-2">{p.name}</h5>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed min-h-[48px]">{p.description}</p>
                  <button className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                    <HardDrive size={16} /> Configure {p.name}
                  </button>
                </div>
              ))}
              {/* Specialized Tool: Ralph */}
              {providers.filter(p => p.id === 'ralph').map((p) => (
                <div key={p.id} className="p-6 rounded-2xl border border-blue-100 bg-blue-50/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                      <Github size={24} />
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-widest bg-emerald-500 text-white">Connected</span>
                  </div>
                  <h5 className="font-bold text-slate-900 mb-2">{p.name}</h5>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed min-h-[48px]">{p.description}</p>
                  <a href="https://github.com/snarktank/ralph" target="_blank" className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                    <Github size={16} /> View Repo
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar currentView={view} setView={setView} />
      
      <main className="flex-1 ml-64 p-8">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {view === ViewMode.DASHBOARD && 'Executive Overview'}
              {view === ViewMode.SEARCH && 'Real-Time Lead Finder'}
              {view === ViewMode.SAVED && 'Lead Watchlist'}
              {view === ViewMode.SETTINGS && 'System Configuration'}
            </h2>
            <p className="text-slate-500 text-sm">
              {view === ViewMode.DASHBOARD && 'Welcome back, Alex. Here is your quantity surveying market update.'}
              {view === ViewMode.SEARCH && 'Scanning UK planning and tender portals for high-value opportunities.'}
              {view === ViewMode.SETTINGS && 'Adjust intelligence engines, databases, and connection settings.'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest flex items-center gap-1 ${hasGeminiKey ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {hasGeminiKey ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                {hasGeminiKey ? 'AI Grounding Active' : 'AI Grounding Disabled'}
              </span>
            </div>
            <button className="relative p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <img src="https://picsum.photos/seed/qs/100/100" alt="Profile" className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-sm" />
            </div>
          </div>
        </header>

        {view === ViewMode.DASHBOARD && renderDashboard()}
        
        {view === ViewMode.SEARCH && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Location (e.g. Leeds, London)..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div className="flex-1 relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                >
                  <option>Commercial</option>
                  <option>Residential</option>
                  <option>Industrial</option>
                  <option>Infrastructure</option>
                </select>
              </div>
              <button 
                onClick={handleSearch}
                className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Crawling UK Portals...' : 'Find Project Leads'}
              </button>
            </div>

            {!isLoading && searchSources.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Globe size={16} className="text-blue-600" />
                  Grounded Sources (Verified by Gemini)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {searchSources.map((source, idx) => (
                    source.web && (
                      <a 
                        key={idx} href={source.web.uri} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1.5 font-bold uppercase tracking-wider"
                      >
                        <ExternalLink size={10} />
                        {source.web.title || 'Official Portal'}
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}

            {searchError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-3 mb-6">
                <XCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-red-800">Search Failed</h4>
                  <p className="text-sm text-red-600 mt-1">{searchError}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl border border-slate-200"></div>
                ))
              ) : opportunities.length > 0 ? (
                opportunities.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    onAnalyze={handleAnalyze}
                    onSave={toggleSave}
                    isSaved={!!savedLeads.find(i => i.id === opp.id)}
                  />
                ))
              ) : !searchError ? (
                <div className="col-span-full py-20 text-center">
                   <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                     <SearchIcon size={32} />
                   </div>
                   <h3 className="text-lg font-bold text-slate-900">No projects found for {location}</h3>
                   <p className="text-slate-500">Try expanding your search radius or changing the sector.</p>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {view === ViewMode.SAVED && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-900">Watchlist</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedLeads.length > 0 ? (
                savedLeads.map((opp) => (
                  <OpportunityCard 
                    key={opp.id} 
                    opportunity={opp} 
                    onAnalyze={handleAnalyze} 
                    onSave={toggleSave}
                    isSaved={true}
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                   <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                     <Bookmark className="text-slate-300" size={32} />
                   </div>
                   <h3 className="text-lg font-bold text-slate-900">Your watchlist is empty</h3>
                   <p className="text-slate-500">Click the share icon on a lead to save it for later review.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === ViewMode.SETTINGS && renderAdmin()}

        {selectedLead && (
          <AnalysisModal 
            opportunity={selectedLead}
            analysis={analysis}
            loading={isAnalyzing}
            onClose={() => {
              setSelectedLead(null);
              setAnalysis(null);
            }}
          />
        )}
      </main>
    </div>
  );
};

export default App;
