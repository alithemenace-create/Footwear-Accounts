import { useState, useEffect } from 'react';
import { getCustomers, saveCustomers, getProducts } from '../data/store';
import { Plus, Search, Edit2, Trash2, X, FileText, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const empty = {
  name: '', contact: '', email: '', phone: '',
  address: '', gstin: '', paymentTerms: 'Net 30',
  creditLimit: '', preferredProducts: [], notes: '',
};

export default function Customers({ onNavigate }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | customer obj
  const [form, setForm] = useState(empty);
  const [selected, setSelected] = useState(null);

  useEffect(() => { setCustomers(getCustomers()); setProducts(getProducts()); }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.contact || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() { setForm({ ...empty }); setModal('add'); }
  function openEdit(c) { setForm({ ...c }); setModal(c); }

  function save() {
    if (!form.name.trim()) return;
    let updated;
    if (modal === 'add') {
      updated = [...customers, { ...form, id: uuidv4(), createdAt: new Date().toISOString() }];
    } else {
      updated = customers.map(c => c.id === modal.id ? { ...form, id: modal.id } : c);
      if (selected?.id === modal.id) setSelected({ ...form, id: modal.id });
    }
    setCustomers(updated);
    saveCustomers(updated);
    setModal(null);
  }

  function del(id) {
    if (!confirm('Delete this customer?')) return;
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    saveCustomers(updated);
    if (selected?.id === id) setSelected(null);
  }

  function togglePref(pid) {
    const prefs = form.preferredProducts || [];
    setForm({ ...form, preferredProducts: prefs.includes(pid) ? prefs.filter(x => x !== pid) : [...prefs, pid] });
  }

  const inp = (field, label, type = 'text', ph = '') => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{label}</label>
      <input
        type={type} value={form[field] || ''}
        onChange={e => setForm({ ...form, [field]: e.target.value })}
        placeholder={ph}
        style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#0F1E3C' }}
      />
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* List panel */}
      <div style={{ width: 340, borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', background: '#fff' }}>
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F1E3C' }}>Customers</h2>
            <button onClick={openAdd} style={{ background: '#C98C32', border: 'none', borderRadius: 8, padding: '7px 12px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
              <Plus size={14} /> Add
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search customers..."
              style={{ width: '100%', padding: '8px 12px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.map(c => (
            <div
              key={c.id}
              onClick={() => setSelected(c)}
              style={{
                padding: '14px 20px', cursor: 'pointer', borderBottom: '1px solid #f9fafb',
                background: selected?.id === c.id ? '#FFF8EE' : 'transparent',
                borderLeft: selected?.id === c.id ? '3px solid #C98C32' : '3px solid transparent',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0F1E3C', fontSize: 13 }}>{c.name}</div>
                  <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>{c.contact}</div>
                  <div style={{ color: '#9ca3af', fontSize: 11, marginTop: 2 }}>{c.paymentTerms}</div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={e => { e.stopPropagation(); openEdit(c); }} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 5, padding: '4px 6px', cursor: 'pointer', color: '#6b7280' }}><Edit2 size={11} /></button>
                  <button onClick={e => { e.stopPropagation(); del(c.id); }} style={{ background: 'none', border: '1px solid #fee2e2', borderRadius: 5, padding: '4px 6px', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={11} /></button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No customers found</div>}
        </div>
      </div>

      {/* Detail panel */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#F5F6FA', padding: 32 }}>
        {!selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>Select a customer to view details</div>
            <button onClick={openAdd} style={{ marginTop: 16, background: '#C98C32', border: 'none', borderRadius: 8, padding: '10px 20px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Add First Customer</button>
          </div>
        ) : (
          <div style={{ maxWidth: 700 }}>
            {/* Header */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0F1E3C' }}>{selected.name}</h2>
                  <div style={{ color: '#6b7280', marginTop: 4, fontSize: 13 }}>{selected.contact}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => onNavigate('create-invoice', { invoiceId: null, customerId: selected.id })}
                    style={{ background: '#C98C32', border: 'none', borderRadius: 8, padding: '9px 16px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText size={14} /> New Invoice
                  </button>
                  <button onClick={() => openEdit(selected)} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 14px', cursor: 'pointer', color: '#374151', fontSize: 13 }}>
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
                {[
                  { icon: Mail, val: selected.email },
                  { icon: Phone, val: selected.phone },
                  { icon: MapPin, val: selected.address },
                  { icon: CreditCard, val: `GSTIN: ${selected.gstin || 'N/A'}` },
                ].map(({ icon: Icon, val }, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#f9fafb', borderRadius: 8, padding: '10px 12px' }}>
                    <Icon size={14} color="#C98C32" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#374151' }}>{val || '—'}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                {[
                  { label: 'Payment Terms', val: selected.paymentTerms },
                  { label: 'Credit Limit', val: selected.creditLimit ? `₹${Number(selected.creditLimit).toLocaleString('en-IN')}` : '—' },
                ].map(({ label, val }) => (
                  <div key={label} style={{ flex: 1, background: '#f9fafb', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0F1E3C', marginTop: 2 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferred products */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#0F1E3C' }}>Preferred Products</h3>
              {(selected.preferredProducts || []).length === 0 ? (
                <div style={{ color: '#9ca3af', fontSize: 13 }}>No preferred products set. <button onClick={() => openEdit(selected)} style={{ color: '#C98C32', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Edit to add →</button></div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(selected.preferredProducts || []).map(pid => {
                    const p = products.find(x => x.id === pid);
                    return p ? (
                      <span key={pid} style={{ background: '#FFF8EE', border: '1px solid #C98C32', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#854d0e', fontWeight: 500 }}>
                        {p.name} — {p.sku}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {selected.notes && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600, color: '#0F1E3C' }}>Notes</h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: 13, lineHeight: 1.6 }}>{selected.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, width: 560, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F1E3C' }}>
                {modal === 'add' ? 'Add Customer' : 'Edit Customer'}
              </h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>{inp('name', 'Company / Customer Name *', 'text', 'e.g. Metro Shoes Pvt Ltd')}</div>
                {inp('contact', 'Contact Person', 'text', 'e.g. Rahul Sharma')}
                {inp('phone', 'Phone', 'tel', '+91 98765 43210')}
                <div style={{ gridColumn: '1 / -1' }}>{inp('email', 'Email', 'email', 'accounts@example.com')}</div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Address</label>
                  <textarea value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })}
                    rows={2} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                {inp('gstin', 'GSTIN')}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Payment Terms</label>
                  <select value={form.paymentTerms || 'Net 30'} onChange={e => setForm({ ...form, paymentTerms: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}>
                    {['Immediate', 'Net 15', 'Net 30', 'Net 45', 'Net 60'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                {inp('creditLimit', 'Credit Limit (₹)', 'number', '500000')}
              </div>

              {/* Preferred products */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Preferred Products</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {products.map(p => {
                    const sel = (form.preferredProducts || []).includes(p.id);
                    return (
                      <button key={p.id} onClick={() => togglePref(p.id)} style={{
                        padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', fontWeight: 500,
                        background: sel ? '#C98C32' : '#f3f4f6', color: sel ? '#fff' : '#374151', border: 'none',
                      }}>{p.name}</button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Notes</label>
                <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={2} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ padding: '9px 18px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button onClick={save} style={{ padding: '9px 20px', background: '#C98C32', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                {modal === 'add' ? 'Add Customer' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
