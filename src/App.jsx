import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Invoices from './pages/Invoices';
import CreateInvoice from './pages/CreateInvoice';
import Settings from './pages/Settings';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [editInvoiceId, setEditInvoiceId] = useState(null);
  const [prefillCustomerId, setPrefillCustomerId] = useState(null);

  function navigate(p, opts = {}) {
    setPage(p);
    if (opts.invoiceId !== undefined) setEditInvoiceId(opts.invoiceId);
    if (opts.customerId !== undefined) setPrefillCustomerId(opts.customerId);
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F5F6FA', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <Sidebar current={page} onNavigate={navigate} />
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        {page === 'dashboard' && <Dashboard onNavigate={navigate} />}
        {page === 'customers' && <Customers onNavigate={navigate} />}
        {page === 'products' && <Products />}
        {page === 'invoices' && <Invoices onNavigate={navigate} />}
        {page === 'create-invoice' && (
          <CreateInvoice
            invoiceId={editInvoiceId}
            prefillCustomerId={prefillCustomerId}
            onNavigate={navigate}
          />
        )}
        {page === 'settings' && <Settings />}
      </main>
    </div>
  );
}
