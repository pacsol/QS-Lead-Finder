import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CRMContact, CRMCompany } from '../../types';

interface Props {
  contact?: CRMContact | null;
  companies: CRMCompany[];
  onSave: (data: Omit<CRMContact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

const ContactForm: React.FC<Props> = ({ contact, companies, onSave, onClose }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (contact) {
      setFirstName(contact.firstName);
      setLastName(contact.lastName);
      setEmail(contact.email);
      setPhone(contact.phone);
      setCompanyId(contact.companyId);
      setJobTitle(contact.jobTitle);
      setTags(contact.tags.join(', '));
      setNotes(contact.notes);
    }
  }, [contact]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      companyId,
      jobTitle: jobTitle.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      notes,
      linkedOpportunityIds: contact?.linkedOpportunityIds || [],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">{contact ? 'Edit Contact' : 'New Contact'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
              <input required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
              <input required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
              <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
            <select value={companyId || ''} onChange={e => setCompanyId(e.target.value || null)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400">
              <option value="">No Company</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. VIP, Contractor, Architect" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-sm">
              {contact ? 'Update' : 'Create'} Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
