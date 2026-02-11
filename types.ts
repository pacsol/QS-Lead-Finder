
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
  PROPOSALS = 'proposals',
  CRM = 'crm',
  EMAIL_SEQUENCES = 'email_sequences',
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

export type ProposalSectionKey =
  | 'executiveSummary' | 'scopeOfServices' | 'methodology'
  | 'timeline' | 'feeStructure' | 'qualifications'
  | 'coverLetter' | 'termsAndConditions' | 'caseStudies' | 'teamBios';

export interface SavedProposal {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  sections: ProposalSectionKey[];
  content: Record<ProposalSectionKey, string>;
  createdAt: string;
  updatedAt: string;
}

export const PROPOSAL_SECTIONS: { key: ProposalSectionKey; label: string }[] = [
  { key: 'coverLetter', label: 'Cover Letter' },
  { key: 'executiveSummary', label: 'Executive Summary' },
  { key: 'scopeOfServices', label: 'Scope of Services' },
  { key: 'methodology', label: 'Methodology' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'feeStructure', label: 'Fee Structure' },
  { key: 'qualifications', label: 'Qualifications' },
  { key: 'caseStudies', label: 'Case Studies' },
  { key: 'teamBios', label: 'Team Bios' },
  { key: 'termsAndConditions', label: 'Terms & Conditions' },
];

// --- CRM Types ---

export interface CRMContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyId: string | null;
  jobTitle: string;
  tags: string[];
  notes: string;
  linkedOpportunityIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CRMCompany {
  id: string;
  name: string;
  industry: string;
  website: string;
  address: string;
  phone: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  position: number;
  createdAt: string;
}

export interface PipelineDeal {
  id: string;
  title: string;
  value: string;
  contactId: string;
  companyId: string | null;
  stageId: string;
  opportunityId: string | null;
  probability: number;
  expectedCloseDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CRMActivity {
  id: string;
  contactId: string;
  dealId: string | null;
  type: ActivityType;
  title: string;
  description: string;
  createdAt: string;
}

export type ActivityType = 'note' | 'call' | 'email' | 'meeting' | 'task' | 'deal_moved' | 'contact_created';
export type CRMSubView = 'contacts' | 'companies' | 'pipeline' | 'activities';

// --- Email Campaign Types ---

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

export interface EmailCampaign {
  id: string;
  name: string;
  status: CampaignStatus;
  opportunityId: string | null;
  linkedContactIds: string[];
  steps: EmailStep[];
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_PIPELINE_STAGES: Omit<PipelineStage, 'id' | 'createdAt'>[] = [
  { name: 'Lead', color: 'slate', position: 0 },
  { name: 'Qualified', color: 'blue', position: 1 },
  { name: 'Proposal Sent', color: 'amber', position: 2 },
  { name: 'Negotiation', color: 'purple', position: 3 },
  { name: 'Won', color: 'emerald', position: 4 },
  { name: 'Lost', color: 'red', position: 5 },
];
