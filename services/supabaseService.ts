import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Opportunity, OutreachAsset, AssetType, SavedProposal } from '../types';

// --- Opportunities ---

export const saveOpportunities = async (opps: Opportunity[]): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    const rows = opps.map(opp => ({
      id: opp.id,
      title: opp.title,
      location: opp.location,
      description: opp.description,
      estimated_value: opp.estimatedValue,
      stage: opp.stage,
      source: opp.source,
      url: opp.url,
      discovered_at: opp.timestamp,
    }));
    await supabase.from('opportunities').upsert(rows, { onConflict: 'id' });
  } catch (e) {
    console.error('Failed to save opportunities to Supabase:', e);
  }
};

export const getOpportunities = async (): Promise<Opportunity[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(row => ({
      id: row.id,
      title: row.title,
      location: row.location,
      description: row.description,
      estimatedValue: row.estimated_value,
      stage: row.stage,
      source: row.source,
      url: row.url,
      timestamp: row.discovered_at,
    }));
  } catch (e) {
    console.error('Failed to fetch opportunities from Supabase:', e);
    return [];
  }
};

// --- Watchlist ---

export const addToWatchlist = async (opportunityId: string): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase
      .from('watchlist_items')
      .upsert({ opportunity_id: opportunityId }, { onConflict: 'opportunity_id' });
  } catch (e) {
    console.error('Failed to add to watchlist:', e);
  }
};

export const removeFromWatchlist = async (opportunityId: string): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase
      .from('watchlist_items')
      .delete()
      .eq('opportunity_id', opportunityId);
  } catch (e) {
    console.error('Failed to remove from watchlist:', e);
  }
};

export const getWatchlist = async (): Promise<Opportunity[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('watchlist_items')
      .select('opportunity_id, opportunities(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => {
      const opp = row.opportunities;
      return {
        id: opp.id,
        title: opp.title,
        location: opp.location,
        description: opp.description,
        estimatedValue: opp.estimated_value,
        stage: opp.stage,
        source: opp.source,
        url: opp.url,
        timestamp: opp.discovered_at,
      };
    });
  } catch (e) {
    console.error('Failed to fetch watchlist from Supabase:', e);
    return [];
  }
};

// --- Outreach Assets ---

export const saveOutreachAsset = async (
  opportunityId: string,
  assetType: AssetType,
  content: any
): Promise<OutreachAsset | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('outreach_assets')
      .insert({
        opportunity_id: opportunityId,
        asset_type: assetType,
        content,
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      opportunityId: data.opportunity_id,
      assetType: data.asset_type,
      content: data.content,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (e) {
    console.error('Failed to save outreach asset:', e);
    return null;
  }
};

export const getOutreachAssets = async (opportunityId: string): Promise<OutreachAsset[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('outreach_assets')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(row => ({
      id: row.id,
      opportunityId: row.opportunity_id,
      assetType: row.asset_type,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (e) {
    console.error('Failed to fetch outreach assets:', e);
    return [];
  }
};

export const updateOutreachAsset = async (assetId: string, content: any): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase
      .from('outreach_assets')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', assetId);
  } catch (e) {
    console.error('Failed to update outreach asset:', e);
  }
};

export const deleteOutreachAsset = async (assetId: string): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase
      .from('outreach_assets')
      .delete()
      .eq('id', assetId);
  } catch (e) {
    console.error('Failed to delete outreach asset:', e);
  }
};

// --- Proposals ---

export const saveProposal = async (proposal: SavedProposal): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('proposals').upsert({
      id: proposal.id,
      opportunity_id: proposal.opportunityId,
      opportunity_title: proposal.opportunityTitle,
      sections: proposal.sections,
      content: proposal.content,
      created_at: proposal.createdAt,
      updated_at: proposal.updatedAt,
    }, { onConflict: 'id' });
  } catch (e) {
    console.error('Failed to save proposal:', e);
  }
};

export const getProposals = async (): Promise<SavedProposal[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(row => ({
      id: row.id,
      opportunityId: row.opportunity_id,
      opportunityTitle: row.opportunity_title,
      sections: row.sections,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (e) {
    console.error('Failed to fetch proposals:', e);
    return [];
  }
};

export const updateProposal = async (id: string, content: any): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase
      .from('proposals')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id);
  } catch (e) {
    console.error('Failed to update proposal:', e);
  }
};

export const deleteProposal = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase
      .from('proposals')
      .delete()
      .eq('id', id);
  } catch (e) {
    console.error('Failed to delete proposal:', e);
  }
};
