
export interface Opportunity {
  id: string;
  title: string;
  location: string;
  description: string;
  estimatedValue?: string;
  stage: 'Planning' | 'Tender' | 'Construction';
  source: string;
  url?: string;
  timestamp: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AnalysisResult {
  feasibility: string;
  riskAssessment: string;
  competitorInsights: string;
  recommendedAction: string;
}

export enum ViewMode {
  DASHBOARD = 'dashboard',
  SEARCH = 'search',
  SAVED = 'saved',
  SETTINGS = 'settings'
}

export type AIProvider = 'gemini' | 'openai' | 'openrouter' | 'ralph' | 'supabase' | 'google-file-search';

export interface ProviderConfig {
  id: AIProvider;
  name: string;
  status: 'connected' | 'disconnected' | 'upcoming';
  description: string;
  type: 'intelligence' | 'tool' | 'database';
}

export interface ExternalTool {
  name: string;
  url: string;
  description: string;
  category: string;
}

export interface EmailStep {
  subject: string;
  body: string;
  sendDelay: string;
  callToAction: string;
}

export interface EmailSequence {
  steps: EmailStep[];
  opportunityId: string;
}

export interface Proposal {
  executiveSummary: string;
  scopeOfServices: string;
  methodology: string;
  timeline: string;
  feeStructure: string;
  qualifications: string;
}

export interface OnePager {
  headline: string;
  servicesList: string;
  differentiators: string;
  recentProjects: string;
  contactCTA: string;
}

export type AssetType = 'email_sequence' | 'proposal' | 'one_pager';

export interface OutreachAsset {
  id: string;
  opportunityId: string;
  assetType: AssetType;
  content: EmailSequence | Proposal | OnePager;
  createdAt: string;
  updatedAt: string;
}
