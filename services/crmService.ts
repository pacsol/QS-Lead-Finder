import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  CRMCompany, CRMContact, PipelineStage, PipelineDeal, CRMActivity, ActivityType,
} from '../types';

// --- Companies ---

export const getCompanies = async (): Promise<CRMCompany[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('crm_companies').select('*').order('name');
    if (error) throw error;
    return (data || []).map(mapCompany);
  } catch (e) { console.error('Failed to fetch companies:', e); return []; }
};

export const getCompany = async (id: string): Promise<CRMCompany | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('crm_companies').select('*').eq('id', id).single();
    if (error) throw error;
    return mapCompany(data);
  } catch (e) { console.error('Failed to fetch company:', e); return null; }
};

export const createCompany = async (company: Omit<CRMCompany, 'id' | 'createdAt' | 'updatedAt'>): Promise<CRMCompany | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('crm_companies').insert({
        name: company.name, industry: company.industry, website: company.website,
        address: company.address, phone: company.phone, notes: company.notes,
      }).select().single();
    if (error) throw error;
    return mapCompany(data);
  } catch (e) { console.error('Failed to create company:', e); return null; }
};

export const updateCompany = async (id: string, updates: Partial<CRMCompany>): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    const row: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) row.name = updates.name;
    if (updates.industry !== undefined) row.industry = updates.industry;
    if (updates.website !== undefined) row.website = updates.website;
    if (updates.address !== undefined) row.address = updates.address;
    if (updates.phone !== undefined) row.phone = updates.phone;
    if (updates.notes !== undefined) row.notes = updates.notes;
    await supabase.from('crm_companies').update(row).eq('id', id);
  } catch (e) { console.error('Failed to update company:', e); }
};

export const deleteCompany = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('crm_companies').delete().eq('id', id);
  } catch (e) { console.error('Failed to delete company:', e); }
};

// --- Contacts ---

export const getContacts = async (): Promise<CRMContact[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('crm_contacts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapContact);
  } catch (e) { console.error('Failed to fetch contacts:', e); return []; }
};

export const getContact = async (id: string): Promise<CRMContact | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('crm_contacts').select('*').eq('id', id).single();
    if (error) throw error;
    return mapContact(data);
  } catch (e) { console.error('Failed to fetch contact:', e); return null; }
};

export const getContactsByCompany = async (companyId: string): Promise<CRMContact[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('crm_contacts').select('*').eq('company_id', companyId).order('last_name');
    if (error) throw error;
    return (data || []).map(mapContact);
  } catch (e) { console.error('Failed to fetch contacts by company:', e); return []; }
};

export const createContact = async (contact: Omit<CRMContact, 'id' | 'createdAt' | 'updatedAt'>): Promise<CRMContact | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('crm_contacts').insert({
        first_name: contact.firstName, last_name: contact.lastName,
        email: contact.email, phone: contact.phone,
        company_id: contact.companyId, job_title: contact.jobTitle,
        tags: contact.tags, notes: contact.notes,
        linked_opportunity_ids: contact.linkedOpportunityIds,
      }).select().single();
    if (error) throw error;
    return mapContact(data);
  } catch (e) { console.error('Failed to create contact:', e); return null; }
};

export const updateContact = async (id: string, updates: Partial<CRMContact>): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    const row: any = { updated_at: new Date().toISOString() };
    if (updates.firstName !== undefined) row.first_name = updates.firstName;
    if (updates.lastName !== undefined) row.last_name = updates.lastName;
    if (updates.email !== undefined) row.email = updates.email;
    if (updates.phone !== undefined) row.phone = updates.phone;
    if (updates.companyId !== undefined) row.company_id = updates.companyId;
    if (updates.jobTitle !== undefined) row.job_title = updates.jobTitle;
    if (updates.tags !== undefined) row.tags = updates.tags;
    if (updates.notes !== undefined) row.notes = updates.notes;
    if (updates.linkedOpportunityIds !== undefined) row.linked_opportunity_ids = updates.linkedOpportunityIds;
    await supabase.from('crm_contacts').update(row).eq('id', id);
  } catch (e) { console.error('Failed to update contact:', e); }
};

export const deleteContact = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('crm_contacts').delete().eq('id', id);
  } catch (e) { console.error('Failed to delete contact:', e); }
};

// --- Pipeline Stages ---

export const getPipelineStages = async (): Promise<PipelineStage[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('pipeline_stages').select('*').order('position');
    if (error) throw error;
    return (data || []).map(mapStage);
  } catch (e) { console.error('Failed to fetch pipeline stages:', e); return []; }
};

export const createPipelineStage = async (stage: Omit<PipelineStage, 'id' | 'createdAt'>): Promise<PipelineStage | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('pipeline_stages').insert({
        name: stage.name, color: stage.color, position: stage.position,
      }).select().single();
    if (error) throw error;
    return mapStage(data);
  } catch (e) { console.error('Failed to create pipeline stage:', e); return null; }
};

export const updatePipelineStage = async (id: string, updates: Partial<PipelineStage>): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    const row: any = {};
    if (updates.name !== undefined) row.name = updates.name;
    if (updates.color !== undefined) row.color = updates.color;
    if (updates.position !== undefined) row.position = updates.position;
    await supabase.from('pipeline_stages').update(row).eq('id', id);
  } catch (e) { console.error('Failed to update pipeline stage:', e); }
};

export const deletePipelineStage = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('pipeline_stages').delete().eq('id', id);
  } catch (e) { console.error('Failed to delete pipeline stage:', e); }
};

export const reorderPipelineStages = async (stages: { id: string; position: number }[]): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    for (const s of stages) {
      await supabase.from('pipeline_stages').update({ position: s.position }).eq('id', s.id);
    }
  } catch (e) { console.error('Failed to reorder stages:', e); }
};

export const initializeDefaultStages = async (defaults: Omit<PipelineStage, 'id' | 'createdAt'>[]): Promise<PipelineStage[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('pipeline_stages').insert(
        defaults.map(s => ({ name: s.name, color: s.color, position: s.position }))
      ).select();
    if (error) throw error;
    return (data || []).map(mapStage);
  } catch (e) { console.error('Failed to initialize default stages:', e); return []; }
};

// --- Pipeline Deals ---

export const getPipelineDeals = async (): Promise<PipelineDeal[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('pipeline_deals').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapDeal);
  } catch (e) { console.error('Failed to fetch pipeline deals:', e); return []; }
};

export const getDealsByStage = async (stageId: string): Promise<PipelineDeal[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('pipeline_deals').select('*').eq('stage_id', stageId).order('created_at');
    if (error) throw error;
    return (data || []).map(mapDeal);
  } catch (e) { console.error('Failed to fetch deals by stage:', e); return []; }
};

export const createPipelineDeal = async (deal: Omit<PipelineDeal, 'id' | 'createdAt' | 'updatedAt'>): Promise<PipelineDeal | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('pipeline_deals').insert({
        title: deal.title, value: deal.value, contact_id: deal.contactId,
        company_id: deal.companyId, stage_id: deal.stageId,
        opportunity_id: deal.opportunityId, probability: deal.probability,
        expected_close_date: deal.expectedCloseDate, notes: deal.notes,
      }).select().single();
    if (error) throw error;
    return mapDeal(data);
  } catch (e) { console.error('Failed to create deal:', e); return null; }
};

export const updatePipelineDeal = async (id: string, updates: Partial<PipelineDeal>): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    const row: any = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) row.title = updates.title;
    if (updates.value !== undefined) row.value = updates.value;
    if (updates.contactId !== undefined) row.contact_id = updates.contactId;
    if (updates.companyId !== undefined) row.company_id = updates.companyId;
    if (updates.stageId !== undefined) row.stage_id = updates.stageId;
    if (updates.opportunityId !== undefined) row.opportunity_id = updates.opportunityId;
    if (updates.probability !== undefined) row.probability = updates.probability;
    if (updates.expectedCloseDate !== undefined) row.expected_close_date = updates.expectedCloseDate;
    if (updates.notes !== undefined) row.notes = updates.notes;
    await supabase.from('pipeline_deals').update(row).eq('id', id);
  } catch (e) { console.error('Failed to update deal:', e); }
};

export const deletePipelineDeal = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('pipeline_deals').delete().eq('id', id);
  } catch (e) { console.error('Failed to delete deal:', e); }
};

export const moveDealToStage = async (dealId: string, stageId: string): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('pipeline_deals').update({
      stage_id: stageId, updated_at: new Date().toISOString(),
    }).eq('id', dealId);
  } catch (e) { console.error('Failed to move deal:', e); }
};

// --- Activities ---

export const getActivitiesByContact = async (contactId: string): Promise<CRMActivity[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('crm_activities').select('*').eq('contact_id', contactId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapActivity);
  } catch (e) { console.error('Failed to fetch activities:', e); return []; }
};

export const getActivitiesByDeal = async (dealId: string): Promise<CRMActivity[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('crm_activities').select('*').eq('deal_id', dealId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapActivity);
  } catch (e) { console.error('Failed to fetch activities by deal:', e); return []; }
};

export const getAllActivities = async (): Promise<CRMActivity[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('crm_activities').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    return (data || []).map(mapActivity);
  } catch (e) { console.error('Failed to fetch all activities:', e); return []; }
};

export const createActivity = async (activity: Omit<CRMActivity, 'id' | 'createdAt'>): Promise<CRMActivity | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('crm_activities').insert({
        contact_id: activity.contactId, deal_id: activity.dealId,
        type: activity.type, title: activity.title, description: activity.description,
      }).select().single();
    if (error) throw error;
    return mapActivity(data);
  } catch (e) { console.error('Failed to create activity:', e); return null; }
};

export const deleteActivity = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('crm_activities').delete().eq('id', id);
  } catch (e) { console.error('Failed to delete activity:', e); }
};

// --- Row Mappers ---

const mapCompany = (row: any): CRMCompany => ({
  id: row.id, name: row.name, industry: row.industry || '',
  website: row.website || '', address: row.address || '',
  phone: row.phone || '', notes: row.notes || '',
  createdAt: row.created_at, updatedAt: row.updated_at,
});

const mapContact = (row: any): CRMContact => ({
  id: row.id, firstName: row.first_name, lastName: row.last_name,
  email: row.email || '', phone: row.phone || '',
  companyId: row.company_id, jobTitle: row.job_title || '',
  tags: row.tags || [], notes: row.notes || '',
  linkedOpportunityIds: row.linked_opportunity_ids || [],
  createdAt: row.created_at, updatedAt: row.updated_at,
});

const mapStage = (row: any): PipelineStage => ({
  id: row.id, name: row.name, color: row.color,
  position: row.position, createdAt: row.created_at,
});

const mapDeal = (row: any): PipelineDeal => ({
  id: row.id, title: row.title, value: row.value || '',
  contactId: row.contact_id, companyId: row.company_id,
  stageId: row.stage_id, opportunityId: row.opportunity_id,
  probability: row.probability || 0, expectedCloseDate: row.expected_close_date || '',
  notes: row.notes || '', createdAt: row.created_at, updatedAt: row.updated_at,
});

const mapActivity = (row: any): CRMActivity => ({
  id: row.id, contactId: row.contact_id, dealId: row.deal_id,
  type: row.type as CRMActivity['type'], title: row.title,
  description: row.description || '', createdAt: row.created_at,
});
