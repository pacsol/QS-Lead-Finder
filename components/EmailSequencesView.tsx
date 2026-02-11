import React, { useState, useEffect, useMemo } from 'react';
import {
  Opportunity, EmailCampaign, CampaignStatus, EmailStep,
  CRMContact, CRMCompany,
} from '../types';
import { isSupabaseConfigured } from '../services/supabaseClient';
import * as svc from '../services/emailCampaignService';
import * as crm from '../services/crmService';
import CampaignList from './email-sequences/CampaignList';
import CampaignDetail from './email-sequences/CampaignDetail';
import CampaignForm from './email-sequences/CampaignForm';
import LinkContactsModal from './email-sequences/LinkContactsModal';

interface Props {
  opportunities: Opportunity[];
  savedLeads: Opportunity[];
}

let idCounter = 0;
const localId = () => `local-${Date.now()}-${++idCounter}`;
const now = () => new Date().toISOString();

const EmailSequencesView: React.FC<Props> = ({ opportunities, savedLeads }) => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [companies, setCompanies] = useState<CRMCompany[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);

  const allOpportunities = useMemo(() => {
    const map = new Map<string, Opportunity>();
    [...opportunities, ...savedLeads].forEach(o => map.set(o.id, o));
    return Array.from(map.values());
  }, [opportunities, savedLeads]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!isSupabaseConfigured()) return;
    const [c, co, cp] = await Promise.all([
      svc.getCampaigns(),
      crm.getContacts(),
      crm.getCompanies(),
    ]);
    setCampaigns(c);
    setContacts(co);
    setCompanies(cp);
  };

  // --- Campaign CRUD ---

  const handleCreateCampaign = async (data: { name: string; status: CampaignStatus; opportunityId: string | null; steps: EmailStep[] }) => {
    const campaignData = {
      name: data.name,
      status: data.status,
      opportunityId: data.opportunityId,
      linkedContactIds: [] as string[],
      steps: data.steps,
    };
    if (isSupabaseConfigured()) {
      const created = await svc.createCampaign(campaignData);
      if (created) setCampaigns(prev => [created, ...prev]);
    } else {
      const ts = now();
      const newCampaign: EmailCampaign = { ...campaignData, id: localId(), createdAt: ts, updatedAt: ts };
      setCampaigns(prev => [newCampaign, ...prev]);
    }
    setFormOpen(false);
    setEditingCampaign(null);
  };

  const handleUpdateCampaign = async (data: { name: string; status: CampaignStatus; opportunityId: string | null; steps: EmailStep[] }) => {
    if (!editingCampaign) return;
    const id = editingCampaign.id;
    if (isSupabaseConfigured()) {
      await svc.updateCampaign(id, data);
    }
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...data, updatedAt: now() } : c));
    if (selectedCampaign?.id === id) {
      setSelectedCampaign(prev => prev ? { ...prev, ...data, updatedAt: now() } : prev);
    }
    setFormOpen(false);
    setEditingCampaign(null);
  };

  const handleDeleteCampaign = async () => {
    if (!selectedCampaign) return;
    const id = selectedCampaign.id;
    if (isSupabaseConfigured()) await svc.deleteCampaign(id);
    setCampaigns(prev => prev.filter(c => c.id !== id));
    setSelectedCampaign(null);
  };

  const handleDuplicate = async () => {
    if (!selectedCampaign) return;
    if (isSupabaseConfigured()) {
      const dup = await svc.duplicateCampaign(selectedCampaign);
      if (dup) setCampaigns(prev => [dup, ...prev]);
    } else {
      const ts = now();
      const dup: EmailCampaign = {
        ...selectedCampaign,
        id: localId(),
        name: `${selectedCampaign.name} (Copy)`,
        status: 'draft',
        steps: selectedCampaign.steps.map(s => ({ ...s })),
        linkedContactIds: [...selectedCampaign.linkedContactIds],
        createdAt: ts,
        updatedAt: ts,
      };
      setCampaigns(prev => [dup, ...prev]);
    }
  };

  const handleChangeStatus = async (status: CampaignStatus) => {
    if (!selectedCampaign) return;
    const id = selectedCampaign.id;
    if (isSupabaseConfigured()) await svc.updateCampaign(id, { status });
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status, updatedAt: now() } : c));
    setSelectedCampaign(prev => prev ? { ...prev, status, updatedAt: now() } : prev);
  };

  const handleUpdateSteps = async (steps: EmailStep[]) => {
    if (!selectedCampaign) return;
    const id = selectedCampaign.id;
    if (isSupabaseConfigured()) await svc.updateCampaign(id, { steps });
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, steps, updatedAt: now() } : c));
    setSelectedCampaign(prev => prev ? { ...prev, steps, updatedAt: now() } : prev);
  };

  const handleLinkContacts = async (ids: string[]) => {
    if (!selectedCampaign) return;
    const id = selectedCampaign.id;
    if (isSupabaseConfigured()) await svc.updateCampaign(id, { linkedContactIds: ids });
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, linkedContactIds: ids, updatedAt: now() } : c));
    setSelectedCampaign(prev => prev ? { ...prev, linkedContactIds: ids, updatedAt: now() } : prev);
    setLinkModalOpen(false);
  };

  // --- Render ---

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!selectedCampaign && (
        <CampaignList
          campaigns={campaigns}
          opportunities={allOpportunities}
          onSelect={setSelectedCampaign}
          onCreate={() => { setEditingCampaign(null); setFormOpen(true); }}
        />
      )}

      {selectedCampaign && (
        <CampaignDetail
          campaign={selectedCampaign}
          opportunities={allOpportunities}
          contacts={contacts}
          companies={companies}
          onBack={() => setSelectedCampaign(null)}
          onEdit={() => { setEditingCampaign(selectedCampaign); setFormOpen(true); }}
          onDuplicate={handleDuplicate}
          onDelete={handleDeleteCampaign}
          onChangeStatus={handleChangeStatus}
          onUpdateSteps={handleUpdateSteps}
          onLinkContacts={() => setLinkModalOpen(true)}
        />
      )}

      {formOpen && (
        <CampaignForm
          campaign={editingCampaign}
          opportunities={allOpportunities}
          onSave={editingCampaign ? handleUpdateCampaign : handleCreateCampaign}
          onClose={() => { setFormOpen(false); setEditingCampaign(null); }}
        />
      )}

      {linkModalOpen && selectedCampaign && (
        <LinkContactsModal
          contacts={contacts}
          companies={companies}
          linkedIds={selectedCampaign.linkedContactIds}
          onSave={handleLinkContacts}
          onClose={() => setLinkModalOpen(false)}
        />
      )}
    </div>
  );
};

export default EmailSequencesView;
