import { supabase, isSupabaseConfigured } from './supabaseClient';
import { EmailCampaign, EmailStep, Opportunity } from '../types';
import { generateEmailSequence } from './outreachService';

// --- Row Mapper ---

const mapCampaign = (row: any): EmailCampaign => ({
  id: row.id,
  name: row.name,
  status: row.status,
  opportunityId: row.opportunity_id || null,
  linkedContactIds: row.linked_contact_ids || [],
  steps: row.steps || [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// --- CRUD ---

export const getCampaigns = async (): Promise<EmailCampaign[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('email_campaigns').select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapCampaign);
  } catch (e) { console.error('Failed to fetch campaigns:', e); return []; }
};

export const getCampaign = async (id: string): Promise<EmailCampaign | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('email_campaigns').select('*').eq('id', id).single();
    if (error) throw error;
    return mapCampaign(data);
  } catch (e) { console.error('Failed to fetch campaign:', e); return null; }
};

export const createCampaign = async (
  campaign: Omit<EmailCampaign, 'id' | 'createdAt' | 'updatedAt'>
): Promise<EmailCampaign | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('email_campaigns').insert({
        name: campaign.name,
        status: campaign.status,
        opportunity_id: campaign.opportunityId,
        linked_contact_ids: campaign.linkedContactIds,
        steps: campaign.steps,
      }).select().single();
    if (error) throw error;
    return mapCampaign(data);
  } catch (e) { console.error('Failed to create campaign:', e); return null; }
};

export const updateCampaign = async (id: string, updates: Partial<EmailCampaign>): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    const row: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) row.name = updates.name;
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.opportunityId !== undefined) row.opportunity_id = updates.opportunityId;
    if (updates.linkedContactIds !== undefined) row.linked_contact_ids = updates.linkedContactIds;
    if (updates.steps !== undefined) row.steps = updates.steps;
    await supabase.from('email_campaigns').update(row).eq('id', id);
  } catch (e) { console.error('Failed to update campaign:', e); }
};

export const deleteCampaign = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('email_campaigns').delete().eq('id', id);
  } catch (e) { console.error('Failed to delete campaign:', e); }
};

export const duplicateCampaign = async (campaign: EmailCampaign): Promise<EmailCampaign | null> => {
  const newCampaign = {
    name: `${campaign.name} (Copy)`,
    status: 'draft' as const,
    opportunityId: campaign.opportunityId,
    linkedContactIds: [...campaign.linkedContactIds],
    steps: campaign.steps.map(s => ({ ...s })),
  };
  return createCampaign(newCampaign);
};

export const generateCampaignSteps = async (opp: Opportunity): Promise<EmailStep[]> => {
  const sequence = await generateEmailSequence(opp);
  return sequence.steps;
};
