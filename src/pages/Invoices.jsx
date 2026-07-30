import { useState, useEffect } from 'react';
import { getInvoices, saveInvoices, getSettings } from '../data/store';
import { format } from 'date-fns';
import { Plus, Search, Download, Trash2, Edit2, Filter } from 'lucide-react';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { getCustomers } from '../data/store';

const STATUS = ['all', 'draft', 'pending', 'paid', 'overdue'];

export default function Invoices({ onNavigate }) {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [settings, setSettings] = useState({});

  useEffect(() => {
    setInvoices(getInvoices());
    setSettings(getSettings());
  }, []);

  const filtered = invoices.filter(inv =>
    (status === 'all' || inv.status === status) &&
    (inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName?.toLowerCase().includes(search.toLowerCase()))
  );

  const totals = {
    paid: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0),
    pending: invoices.filter(i => i.status === 'pending').reduce((s, i) => s + (i.total || 0), 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + (i.total || 0), 0),
  };

  function del(id) {
    if (!confirm('Delete this invoice?')) return;
    const updated = invoices.filter(i => i.id !== id);
    setInvoices(updated);
    saveInvoices(updated);
  }

  function updateStatus(id, newStatus) {
    const updated = invoices.map(i => i.id === id ? { ...i, status: newStatus } : i);
    setInvoices(updated);
    saveInvoices(updated);
  }

  function downloadPDF(inv) {
    const customers = getCustomers();
    const customer = customers.find(c => c.id === inv.customerId) || { name: inv.customerName, address: '', contact: '', gstin: '', paymentTerms: 'Net 30' };
    const doc = generateInvoicePDF(inv, customer, settings);
    doc.save(`${inv.invoiceNumber}.pdf`);
  }

  const cur = settings.currency || '₹';

  const statusStyle = {
    paid: { bg: '#dcfce7', color: '#166534' },
    pending: { bg: '#fef9c3', color: '#854d0e' },
    overdue: { bg: '#fee2e2', color: '#991b1b' },
    draft: { bg: '#f3f4f6', color: '#374151' },
  };

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0F1E3C' }}>Invoices</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>{invoices.length} total invoices</p>
        </div>
        <button onClick={() => onNavigate('create-invoice', { invoiceId: null })}
          style={{ background: '#C98C32', border: 'none', borderRadius: 8, padding: '10px 18px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={15} /> New Invoice
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Paid', value: totals.paid, color: '#16a34a' },
          { label: 'Pending', value: totals.pending, color: '#d97706' },
          { label: 'Overdue', value: totals.overdue, color: '#dc2626' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 10, padding: '14px 20px', flex: 1, minWidth: 140, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: `3px solid ${color}` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color, marginTop: 4 }}>{cur}{value.toLocaleString('en-IN')}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by invoice # or customer..."
            style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', outline: 'none', background: '#fff' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {STATUS.map(s => (
            <button key={s} onClick={() => setStatus(s)} style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: 12, fontWeight: 500, textTransform: 'capitalize',
              background: status === s ? '#0F1E3C' : '#fff', color: status === s ? '#fff' : '#374151',
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0F1E3C' }}>
              {['Invoice #', 'Customer', 'Date', 'Due', 'Amount', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#7a9bc8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>
                {invoices.length === 0 ? (
                  <div>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>📄</div>
                    <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>No invoices yet</div>
                    <button onClick={() => onNavigate('create-invoice', { invoiceId: null })} style={{ background: '#C98C32', border: 'none', borderRadius: 8, padding: '10px 18px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Create First Invoice</button>
                  </div>
                ) : 'No invoices match your filters'}
              </td></tr>
            )}
            {filtered.map((inv, i) => {
              const st = statusStyle[inv.status] || statusStyle.draft;
              return (
                <tr key={inv.id} style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '13px 16px', fontWeight: 700, color: '#0F1E3C', fontSize: 13 }}>{inv.invoiceNumber}</td>
                  <td style={{ padding: '13px 16px', color: '#374151', fontSize: 13 }}>{inv.customerName}</td>
                  <td style={{ padding: '13px 16px', color: '#6b7280', fontSize: 12 }}>{format(new Date(inv.invoiceDate), 'dd MMM yyyy')}</td>
                  <td style={{ padding: '13px 16px', color: '#6b7280', fontSize: 12 }}>{format(new Date(inv.dueDate), 'dd MMM yyyy')}</td>
                  <td style={{ padding: '13px 16px', color: '#0F1E3C', fontWeight: 700, fontSize: 13 }}>{cur}{(inv.total || 0).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <select value={inv.status} onChange={e => updateStatus(inv.id, e.target.value)}
                      style={{ background: st.bg, color: st.color, border: 'none', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
                      {['draft', 'pending', 'paid', 'overdue'].map(s => <option key={s} value={s} style={{ background: '#fff', color: '#000' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => onNavigate('create-invoice', { invoiceId: inv.id })} title="Edit" style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#6b7280' }}><Edit2 size={12} /></button>
                      <button onClick={() => downloadPDF(inv)} title="Download PDF" style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#C98C32' }}><Download size={12} /></button>
                      <button onClick={() => del(inv.id)} title="Delete" style={{ background: 'none', border: '1px solid #fee2e2', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
