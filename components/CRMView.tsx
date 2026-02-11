import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Users, Building2, BarChart3, Activity } from 'lucide-react';
import {
  Opportunity, CRMContact, CRMCompany, PipelineStage, PipelineDeal,
  CRMActivity, ActivityType, CRMSubView, DEFAULT_PIPELINE_STAGES,
} from '../types';
import { isSupabaseConfigured } from '../services/supabaseClient';
import * as crm from '../services/crmService';
import ContactList from './crm/ContactList';
import ContactDetail from './crm/ContactDetail';
import ContactForm from './crm/ContactForm';
import CompanyList from './crm/CompanyList';
import CompanyDetail from './crm/CompanyDetail';
import CompanyForm from './crm/CompanyForm';
import PipelineBoard from './crm/PipelineBoard';
import PipelineDealForm from './crm/PipelineDealForm';
import PipelineStageManager from './crm/PipelineStageManager';
import ActivityTimeline from './crm/ActivityTimeline';
import ActivityForm from './crm/ActivityForm';
import LinkOpportunityModal from './crm/LinkOpportunityModal';

interface Props {
  opportunities: Opportunity[];
  savedLeads: Opportunity[];
}

const TABS: { key: CRMSubView; label: string; icon: React.ReactNode }[] = [
  { key: 'contacts', label: 'Contacts', icon: <Users size={16} /> },
  { key: 'companies', label: 'Companies', icon: <Building2 size={16} /> },
  { key: 'pipeline', label: 'Pipeline', icon: <BarChart3 size={16} /> },
  { key: 'activities', label: 'Activities', icon: <Activity size={16} /> },
];

let idCounter = 0;
const localId = () => `local-${Date.now()}-${++idCounter}`;
const now = () => new Date().toISOString();

const CRMView: React.FC<Props> = ({ opportunities, savedLeads }) => {
  const [subView, setSubView] = useState<CRMSubView>('contacts');

  // Data state
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [companies, setCompanies] = useState<CRMCompany[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [deals, setDeals] = useState<PipelineDeal[]>([]);
  const [activities, setActivities] = useState<CRMActivity[]>([]);

  // UI state
  const [selectedContact, setSelectedContact] = useState<CRMContact | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CRMCompany | null>(null);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<CRMContact | null>(null);
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CRMCompany | null>(null);
  const [dealFormOpen, setDealFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<PipelineDeal | null>(null);
  const [defaultStageId, setDefaultStageId] = useState<string>('');
  const [stageManagerOpen, setStageManagerOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);

  const allOpportunities = useMemo(() => {
    const map = new Map<string, Opportunity>();
    [...opportunities, ...savedLeads].forEach(o => map.set(o.id, o));
    return Array.from(map.values());
  }, [opportunities, savedLeads]);

  // --- Load data ---
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    if (!isSupabaseConfigured()) {
      // Initialize default stages locally if empty
      if (stages.length === 0) {
        const defaults = DEFAULT_PIPELINE_STAGES.map((s, i) => ({
          ...s, id: localId(), createdAt: now(),
        }));
        setStages(defaults);
      }
      return;
    }
    const [c, co, s, d, a] = await Promise.all([
      crm.getContacts(), crm.getCompanies(), crm.getPipelineStages(),
      crm.getPipelineDeals(), crm.getAllActivities(),
    ]);
    setContacts(c);
    setCompanies(co);
    setDeals(d);
    setActivities(a);
    if (s.length === 0) {
      const defaults = await crm.initializeDefaultStages(DEFAULT_PIPELINE_STAGES);
      setStages(defaults.length > 0 ? defaults : DEFAULT_PIPELINE_STAGES.map((s, i) => ({
        ...s, id: localId(), createdAt: now(),
      })));
    } else {
      setStages(s);
    }
  };

  // --- Contact CRUD ---
  const handleCreateContact = async (data: Omit<CRMContact, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (isSupabaseConfigured()) {
      const created = await crm.createContact(data);
      if (created) {
        setContacts(prev => [created, ...prev]);
        // Auto-create activity
        const act = await crm.createActivity({
          contactId: created.id, dealId: null, type: 'contact_created',
          title: `${created.firstName} ${created.lastName} was added`, description: '',
        });
        if (act) setActivities(prev => [act, ...prev]);
      }
    } else {
      const id = localId();
      const ts = now();
      const newContact: CRMContact = { ...data, id, createdAt: ts, updatedAt: ts };
      setContacts(prev => [newContact, ...prev]);
      const act: CRMActivity = {
        id: localId(), contactId: id, dealId: null, type: 'contact_created',
        title: `${newContact.firstName} ${newContact.lastName} was added`, description: '', createdAt: ts,
      };
      setActivities(prev => [act, ...prev]);
    }
    setContactFormOpen(false);
    setEditingContact(null);
  };

  const handleUpdateContact = async (data: Omit<CRMContact, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingContact) return;
    const id = editingContact.id;
    if (isSupabaseConfigured()) {
      await crm.updateContact(id, data);
    }
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...data, updatedAt: now() } : c));
    if (selectedContact?.id === id) {
      setSelectedContact(prev => prev ? { ...prev, ...data, updatedAt: now() } : prev);
    }
    setContactFormOpen(false);
    setEditingContact(null);
  };

  const handleDeleteContact = async (id: string) => {
    if (isSupabaseConfigured()) await crm.deleteContact(id);
    setContacts(prev => prev.filter(c => c.id !== id));
    setDeals(prev => prev.filter(d => d.contactId !== id));
    setActivities(prev => prev.filter(a => a.contactId !== id));
    setSelectedContact(null);
  };

  // --- Company CRUD ---
  const handleCreateCompany = async (data: Omit<CRMCompany, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (isSupabaseConfigured()) {
      const created = await crm.createCompany(data);
      if (created) setCompanies(prev => [created, ...prev]);
    } else {
      const ts = now();
      setCompanies(prev => [{ ...data, id: localId(), createdAt: ts, updatedAt: ts }, ...prev]);
    }
    setCompanyFormOpen(false);
    setEditingCompany(null);
  };

  const handleUpdateCompany = async (data: Omit<CRMCompany, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingCompany) return;
    const id = editingCompany.id;
    if (isSupabaseConfigured()) await crm.updateCompany(id, data);
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...data, updatedAt: now() } : c));
    if (selectedCompany?.id === id) {
      setSelectedCompany(prev => prev ? { ...prev, ...data, updatedAt: now() } : prev);
    }
    setCompanyFormOpen(false);
    setEditingCompany(null);
  };

  const handleDeleteCompany = async (id: string) => {
    if (isSupabaseConfigured()) await crm.deleteCompany(id);
    setCompanies(prev => prev.filter(c => c.id !== id));
    // Unlink contacts
    setContacts(prev => prev.map(c => c.companyId === id ? { ...c, companyId: null } : c));
    setSelectedCompany(null);
  };

  // --- Deal CRUD ---
  const handleCreateDeal = async (data: Omit<PipelineDeal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (isSupabaseConfigured()) {
      const created = await crm.createPipelineDeal(data);
      if (created) setDeals(prev => [created, ...prev]);
    } else {
      const ts = now();
      setDeals(prev => [{ ...data, id: localId(), createdAt: ts, updatedAt: ts }, ...prev]);
    }
    setDealFormOpen(false);
    setEditingDeal(null);
    setDefaultStageId('');
  };

  const handleUpdateDeal = async (data: Omit<PipelineDeal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingDeal) return;
    const id = editingDeal.id;
    if (isSupabaseConfigured()) await crm.updatePipelineDeal(id, data);
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...data, updatedAt: now() } : d));
    setDealFormOpen(false);
    setEditingDeal(null);
  };

  const handleDeleteDeal = async (id: string) => {
    if (isSupabaseConfigured()) await crm.deletePipelineDeal(id);
    setDeals(prev => prev.filter(d => d.id !== id));
    setDealFormOpen(false);
    setEditingDeal(null);
  };

  const handleMoveDeal = async (dealId: string, toStageId: string) => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;
    const fromStage = stages.find(s => s.id === deal.stageId);
    const toStage = stages.find(s => s.id === toStageId);

    if (isSupabaseConfigured()) {
      await crm.moveDealToStage(dealId, toStageId);
      const act = await crm.createActivity({
        contactId: deal.contactId, dealId, type: 'deal_moved',
        title: `Deal "${deal.title}" moved to ${toStage?.name || 'unknown'}`,
        description: `From ${fromStage?.name || 'unknown'} to ${toStage?.name || 'unknown'}`,
      });
      if (act) setActivities(prev => [act, ...prev]);
    } else {
      const act: CRMActivity = {
        id: localId(), contactId: deal.contactId, dealId, type: 'deal_moved',
        title: `Deal "${deal.title}" moved to ${toStage?.name || 'unknown'}`,
        description: `From ${fromStage?.name || 'unknown'} to ${toStage?.name || 'unknown'}`,
        createdAt: now(),
      };
      setActivities(prev => [act, ...prev]);
    }
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stageId: toStageId, updatedAt: now() } : d));
  };

  // --- Stage Management ---
  const handleSaveStages = async (changes: {
    created: { name: string; color: string; position: number }[];
    updated: { id: string; name: string; color: string; position: number }[];
    deleted: string[];
  }) => {
    if (isSupabaseConfigured()) {
      for (const id of changes.deleted) await crm.deletePipelineStage(id);
      for (const s of changes.updated) await crm.updatePipelineStage(s.id, s);
      for (const s of changes.created) await crm.createPipelineStage(s);
      const freshStages = await crm.getPipelineStages();
      setStages(freshStages);
    } else {
      let newStages = [...stages];
      // Delete
      newStages = newStages.filter(s => !changes.deleted.includes(s.id));
      // Update
      for (const u of changes.updated) {
        newStages = newStages.map(s => s.id === u.id ? { ...s, name: u.name, color: u.color, position: u.position } : s);
      }
      // Create
      for (const c of changes.created) {
        newStages.push({ id: localId(), name: c.name, color: c.color, position: c.position, createdAt: now() });
      }
      newStages.sort((a, b) => a.position - b.position);
      setStages(newStages);
      // Remove deals for deleted stages
      setDeals(prev => prev.filter(d => !changes.deleted.includes(d.stageId)));
    }
    setStageManagerOpen(false);
  };

  // --- Activities ---
  const handleLogActivity = async (type: ActivityType, title: string, description: string) => {
    if (!selectedContact) return;
    if (isSupabaseConfigured()) {
      const act = await crm.createActivity({
        contactId: selectedContact.id, dealId: null, type, title, description,
      });
      if (act) setActivities(prev => [act, ...prev]);
    } else {
      const act: CRMActivity = {
        id: localId(), contactId: selectedContact.id, dealId: null,
        type, title, description, createdAt: now(),
      };
      setActivities(prev => [act, ...prev]);
    }
  };

  const handleGlobalLogActivity = async (type: ActivityType, title: string, description: string) => {
    // For global activity tab, we need a contact - skip if none exist
    if (contacts.length === 0) return;
    const contactId = contacts[0].id;
    if (isSupabaseConfigured()) {
      const act = await crm.createActivity({ contactId, dealId: null, type, title, description });
      if (act) setActivities(prev => [act, ...prev]);
    } else {
      const act: CRMActivity = {
        id: localId(), contactId, dealId: null, type, title, description, createdAt: now(),
      };
      setActivities(prev => [act, ...prev]);
    }
  };

  // --- Opportunity Linking ---
  const handleLinkOpportunities = async (ids: string[]) => {
    if (!selectedContact) return;
    const update = { linkedOpportunityIds: ids };
    if (isSupabaseConfigured()) await crm.updateContact(selectedContact.id, update);
    setContacts(prev => prev.map(c => c.id === selectedContact.id ? { ...c, ...update, updatedAt: now() } : c));
    setSelectedContact(prev => prev ? { ...prev, ...update, updatedAt: now() } : prev);
    setLinkModalOpen(false);
  };

  // --- Derived data ---
  const contactActivities = selectedContact
    ? activities.filter(a => a.contactId === selectedContact.id)
    : [];

  const contactDeals = selectedContact
    ? deals.filter(d => d.contactId === selectedContact.id)
    : [];

  const linkedOpps = selectedContact
    ? allOpportunities.filter(o => selectedContact.linkedOpportunityIds.includes(o.id))
    : [];

  const contactCompany = selectedContact?.companyId
    ? companies.find(c => c.id === selectedContact.companyId) || null
    : null;

  const dealCountByStage = useMemo(() => {
    const map: Record<string, number> = {};
    deals.forEach(d => { map[d.stageId] = (map[d.stageId] || 0) + 1; });
    return map;
  }, [deals]);

  // --- Render ---
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sub-nav tabs */}
      <div className="flex gap-1 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setSubView(tab.key);
              setSelectedContact(null);
              setSelectedCompany(null);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              subView === tab.key
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Contacts */}
      {subView === 'contacts' && !selectedContact && (
        <ContactList
          contacts={contacts}
          companies={companies}
          onSelect={setSelectedContact}
          onCreate={() => { setEditingContact(null); setContactFormOpen(true); }}
        />
      )}

      {subView === 'contacts' && selectedContact && (
        <ContactDetail
          contact={selectedContact}
          company={contactCompany}
          activities={contactActivities}
          deals={contactDeals}
          stages={stages}
          linkedOpportunities={linkedOpps}
          onBack={() => setSelectedContact(null)}
          onEdit={() => { setEditingContact(selectedContact); setContactFormOpen(true); }}
          onDelete={() => handleDeleteContact(selectedContact.id)}
          onLinkOpportunity={() => setLinkModalOpen(true)}
          onLogActivity={handleLogActivity}
        />
      )}

      {/* Companies */}
      {subView === 'companies' && !selectedCompany && (
        <CompanyList
          companies={companies}
          contacts={contacts}
          onSelect={setSelectedCompany}
          onCreate={() => { setEditingCompany(null); setCompanyFormOpen(true); }}
        />
      )}

      {subView === 'companies' && selectedCompany && (
        <CompanyDetail
          company={selectedCompany}
          contacts={contacts}
          deals={deals}
          stages={stages}
          onBack={() => setSelectedCompany(null)}
          onEdit={() => { setEditingCompany(selectedCompany); setCompanyFormOpen(true); }}
          onDelete={() => handleDeleteCompany(selectedCompany.id)}
          onSelectContact={(c) => { setSelectedContact(c); setSubView('contacts'); }}
        />
      )}

      {/* Pipeline */}
      {subView === 'pipeline' && (
        <PipelineBoard
          stages={stages}
          deals={deals}
          contacts={contacts}
          companies={companies}
          onAddDeal={(stageId) => { setEditingDeal(null); setDefaultStageId(stageId); setDealFormOpen(true); }}
          onEditDeal={(deal) => { setEditingDeal(deal); setDealFormOpen(true); }}
          onMoveDeal={handleMoveDeal}
          onManageStages={() => setStageManagerOpen(true)}
        />
      )}

      {/* Activities */}
      {subView === 'activities' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h4 className="text-sm font-bold text-slate-900 mb-4">All Activity</h4>
          {contacts.length > 0 && (
            <div className="mb-4">
              <ActivityForm onSubmit={handleGlobalLogActivity} />
            </div>
          )}
          <ActivityTimeline activities={activities} contacts={contacts} showContactName />
        </div>
      )}

      {/* Modals */}
      {contactFormOpen && (
        <ContactForm
          contact={editingContact}
          companies={companies}
          onSave={editingContact ? handleUpdateContact : handleCreateContact}
          onClose={() => { setContactFormOpen(false); setEditingContact(null); }}
        />
      )}

      {companyFormOpen && (
        <CompanyForm
          company={editingCompany}
          onSave={editingCompany ? handleUpdateCompany : handleCreateCompany}
          onClose={() => { setCompanyFormOpen(false); setEditingCompany(null); }}
        />
      )}

      {dealFormOpen && (
        <PipelineDealForm
          deal={editingDeal}
          stages={stages}
          contacts={contacts}
          companies={companies}
          opportunities={allOpportunities}
          defaultStageId={defaultStageId}
          onSave={editingDeal ? handleUpdateDeal : handleCreateDeal}
          onDelete={editingDeal ? handleDeleteDeal : undefined}
          onClose={() => { setDealFormOpen(false); setEditingDeal(null); setDefaultStageId(''); }}
        />
      )}

      {stageManagerOpen && (
        <PipelineStageManager
          stages={stages}
          dealCountByStage={dealCountByStage}
          onSave={handleSaveStages}
          onClose={() => setStageManagerOpen(false)}
        />
      )}

      {linkModalOpen && selectedContact && (
        <LinkOpportunityModal
          opportunities={allOpportunities}
          linkedIds={selectedContact.linkedOpportunityIds}
          onSave={handleLinkOpportunities}
          onClose={() => setLinkModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CRMView;
