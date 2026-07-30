import { LayoutDashboard, Users, Package, FileText, Plus, Settings, Footprints } from 'lucide-react';

const nav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'products', label: 'Products', icon: Package },
];

export default function Sidebar({ current, onNavigate }) {
  return (
    <aside style={{
      width: 220, background: '#0F1E3C', display: 'flex', flexDirection: 'column',
      borderRight: '1px solid #1a2d50', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1a2d50' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, background: 'linear-gradient(135deg, #C98C32, #F0B040)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Footprints size={20} color="#fff" />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>StrideCraft</div>
            <div style={{ color: '#5a7ab0', fontSize: 10, letterSpacing: '0.04em' }}>ACCOUNTS</div>
          </div>
        </div>
      </div>

      {/* Quick action */}
      <div style={{ padding: '16px 16px 8px' }}>
        <button
          onClick={() => onNavigate('create-invoice', { invoiceId: null, customerId: null })}
          style={{
            width: '100%', background: 'linear-gradient(135deg, #C98C32, #E8A030)',
            border: 'none', borderRadius: 8, padding: '10px 14px',
            color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
            letterSpacing: '0.02em',
          }}
        >
          <Plus size={15} />
          New Invoice
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 12px' }}>
        {nav.map(({ id, label, icon: Icon }) => {
          const active = current === id || (id === 'invoices' && current === 'create-invoice');
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: 'none', cursor: 'pointer', marginBottom: 2,
                background: active ? 'rgba(201,140,50,0.15)' : 'transparent',
                color: active ? '#F0B040' : '#7a9bc8',
                fontSize: 13, fontWeight: active ? 600 : 400,
                transition: 'all 0.15s',
                textAlign: 'left',
              }}
            >
              <Icon size={17} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      <div style={{ padding: '12px 12px 20px', borderTop: '1px solid #1a2d50' }}>
        <button
          onClick={() => onNavigate('settings')}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            width: '100%', padding: '10px 12px', borderRadius: 8,
            border: 'none', cursor: 'pointer',
            background: current === 'settings' ? 'rgba(201,140,50,0.15)' : 'transparent',
            color: current === 'settings' ? '#F0B040' : '#7a9bc8',
            fontSize: 13, fontWeight: current === 'settings' ? 600 : 400,
            textAlign: 'left',
          }}
        >
          <Settings size={17} />
          Settings
        </button>
      </div>
    </aside>
  );
}
