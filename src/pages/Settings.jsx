import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../data/store';
import { Save, Building2, CreditCard, FileText } from 'lucide-react';

export default function Settings() {
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => { setForm(getSettings()); }, []);

  function handleSave() {
    saveSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function Field({ label, field, type = 'text', ph = '' }) {
    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{label}</label>
        <input type={type} value={form[field] || ''} onChange={e => setForm({ ...form, [field]: type === 'number' ? Number(e.target.value) : e.target.value })}
          placeholder={ph}
          style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
      </div>
    );
  }

  const Section = ({ title, icon: Icon, children }) => (
    <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f3f4f6' }}>
        <Icon size={17} color="#C98C32" />
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0F1E3C' }}>{title}</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>{children}</div>
    </div>
  );

  return (
    <div style={{ padding: '32px 36px', maxWidth: 750 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0F1E3C' }}>Settings</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>Company details appear on all invoices</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {saved && <span style={{ color: '#16a34a', fontSize: 13, fontWeight: 500 }}>✓ Saved</span>}
          <button onClick={handleSave} style={{ background: '#C98C32', border: 'none', borderRadius: 8, padding: '10px 20px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Save size={14} /> Save Settings
          </button>
        </div>
      </div>

      <Section title="Company Information" icon={Building2}>
        <div style={{ gridColumn: '1 / -1' }}><Field label="Company Name" field="companyName" /></div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Address</label>
          <textarea value={form.companyAddress || ''} onChange={e => setForm({ ...form, companyAddress: e.target.value })} rows={2}
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical', marginBottom: 16 }} />
        </div>
        <Field label="Phone" field="companyPhone" />
        <Field label="Email" field="companyEmail" type="email" />
        <div style={{ gridColumn: '1 / -1' }}><Field label="GSTIN" field="companyGSTIN" /></div>
      </Section>

      <Section title="Invoice Settings" icon={FileText}>
        <Field label="Invoice Prefix" field="invoicePrefix" ph="SC-INV" />
        <Field label="Next Invoice Number" field="nextInvoiceNumber" type="number" />
        <Field label="Default GST Rate (%)" field="taxRate" type="number" />
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Currency Symbol</label>
          <select value={form.currency || '₹'} onChange={e => setForm({ ...form, currency: e.target.value })}
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}>
            {['₹', '$', '€', '£', '¥'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </Section>

      <Section title="Bank Details" icon={CreditCard}>
        <Field label="Bank Name" field="bankName" />
        <Field label="Branch" field="bankBranch" />
        <Field label="Account Number" field="bankAccount" />
        <Field label="IFSC Code" field="bankIFSC" />
      </Section>
    </div>
  );
}
