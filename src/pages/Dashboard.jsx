import { useState, useEffect } from 'react';
import { getInvoices, getCustomers, getSettings } from '../data/store';
import { format } from 'date-fns';
import { TrendingUp, FileText, Users, AlertCircle, Plus, ArrowRight } from 'lucide-react';

function StatCard({ label, value, sub, color, icon: Icon }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: `3px solid ${color}`,
      flex: 1, minWidth: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#0F1E3C', letterSpacing: '-0.02em' }}>{value}</div>
          {sub && <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{ background: color + '18', padding: 10, borderRadius: 10 }}>
          <Icon size={22} color={color} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    setInvoices(getInvoices());
    setCustomers(getCustomers());
    setSettings(getSettings());
  }, []);

  const cur = settings.currency || '₹';
  const paid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0);
  const pending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + (i.total || 0), 0);
  const overdue = invoices.filter(i => i.status === 'overdue');
  const recent = [...invoices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

  const statusStyle = (s) => ({
    paid: { bg: '#dcfce7', color: '#166534' },
    pending: { bg: '#fef9c3', color: '#854d0e' },
    overdue: { bg: '#fee2e2', color: '#991b1b' },
    draft: { bg: '#f3f4f6', color: '#374151' },
  }[s] || { bg: '#f3f4f6', color: '#374151' });

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1200 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F1E3C', margin: 0 }}>
          {settings.companyName || 'Dashboard'}
        </h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: 14 }}>
          {format(new Date(), "EEEE, d MMMM yyyy")}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <StatCard label="Total Revenue" value={`${cur}${paid.toLocaleString('en-IN')}`} sub="Paid invoices" color="#C98C32" icon={TrendingUp} />
        <StatCard label="Pending" value={`${cur}${pending.toLocaleString('en-IN')}`} sub="Awaiting payment" color="#3b82f6" icon={FileText} />
        <StatCard label="Overdue" value={overdue.length} sub="Require attention" color="#ef4444" icon={AlertCircle} />
        <StatCard label="Customers" value={customers.length} sub="Active accounts" color="#8b5cf6" icon={Users} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Recent Invoices */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0F1E3C' }}>Recent Invoices</h2>
            <button onClick={() => onNavigate('invoices')} style={{ background: 'none', border: 'none', color: '#C98C32', cursor: 'pointer', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={13} />
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                {['Invoice', 'Customer', 'Date', 'Amount', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                  No invoices yet. <button onClick={() => onNavigate('create-invoice', { invoiceId: null })} style={{ color: '#C98C32', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Create one →</button>
                </td></tr>
              )}
              {recent.map((inv, i) => {
                const st = statusStyle(inv.status);
                return (
                  <tr key={inv.id} style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0F1E3C', fontSize: 13 }}>{inv.invoiceNumber}</td>
                    <td style={{ padding: '12px 16px', color: '#374151', fontSize: 13 }}>{inv.customerName}</td>
                    <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 12 }}>{format(new Date(inv.invoiceDate), 'dd MMM yy')}</td>
                    <td style={{ padding: '12px 16px', color: '#0F1E3C', fontWeight: 600, fontSize: 13 }}>{cur}{(inv.total || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: st.bg, color: st.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>{inv.status}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => onNavigate('create-invoice', { invoiceId: inv.id })} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', color: '#374151' }}>View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick actions */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#0F1E3C' }}>Quick Actions</h3>
            {[
              { label: 'New Invoice', sub: 'Create & send instantly', action: () => onNavigate('create-invoice', { invoiceId: null }), color: '#C98C32' },
              { label: 'Add Customer', sub: 'Save account details', action: () => onNavigate('customers'), color: '#3b82f6' },
              { label: 'Add Product', sub: 'Update your catalog', action: () => onNavigate('products'), color: '#8b5cf6' },
            ].map(({ label, sub, action, color }) => (
              <button key={label} onClick={action} style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                background: '#fafafa', border: '1px solid #f3f4f6', borderRadius: 8,
                padding: '11px 14px', marginBottom: 8, cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0F1E3C' }}>{label}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{sub}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Overdue alerts */}
          {overdue.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '3px solid #ef4444' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={15} /> Overdue ({overdue.length})
              </h3>
              {overdue.slice(0, 4).map(inv => (
                <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, padding: '8px 10px', background: '#fff5f5', borderRadius: 6 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#0F1E3C' }}>{inv.invoiceNumber}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{inv.customerName}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>₹{(inv.total || 0).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
