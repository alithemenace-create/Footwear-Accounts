import { useState, useEffect } from 'react';
import { getCustomers, getProducts, getInvoices, saveInvoices, getSettings, getNextInvoiceNumber } from '../data/store';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { format, addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Search, Plus, Trash2, Download, Save, ChevronLeft, User, Package } from 'lucide-react';

export default function CreateInvoice({ invoiceId, prefillCustomerId, onNavigate }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({});
  const [saved, setSaved] = useState(false);

  // Form state
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDrop, setShowCustomerDrop] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [status, setStatus] = useState('pending');
  const [items, setItems] = useState([{ id: uuidv4(), productId: '', sku: '', name: '', description: '', qty: 1, price: 0 }]);
  const [taxRate, setTaxRate] = useState(18);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showProductDrop, setShowProductDrop] = useState(null); // item index

  useEffect(() => {
    const c = getCustomers();
    const p = getProducts();
    const s = getSettings();
    setCustomers(c);
    setProducts(p);
    setSettings(s);
    setTaxRate(s.taxRate || 18);

    if (invoiceId) {
      // Load existing invoice
      const invoices = getInvoices();
      const inv = invoices.find(i => i.id === invoiceId);
      if (inv) {
        setInvoiceNumber(inv.invoiceNumber);
        setInvoiceDate(inv.invoiceDate);
        setDueDate(inv.dueDate);
        setStatus(inv.status);
        setItems(inv.items || []);
        setTaxRate(inv.taxRate || 18);
        setDiscount(inv.discount || 0);
        setNotes(inv.notes || '');
        if (inv.customerId) {
          const cust = c.find(x => x.id === inv.customerId);
          if (cust) { setSelectedCustomer(cust); setCustomerSearch(cust.name); }
        }
        return;
      }
    }

    // New invoice
    setInvoiceNumber(getNextInvoiceNumber());

    if (prefillCustomerId) {
      const cust = c.find(x => x.id === prefillCustomerId);
      if (cust) {
        setSelectedCustomer(cust);
        setCustomerSearch(cust.name);
        autoFillFromCustomer(cust, p);
      }
    }
  }, [invoiceId, prefillCustomerId]);

  function autoFillFromCustomer(cust, prods) {
    if (!cust.preferredProducts?.length) return;
    const prefItems = cust.preferredProducts.map(pid => {
      const p = prods.find(x => x.id === pid);
      if (!p) return null;
      return { id: uuidv4(), productId: p.id, sku: p.sku, name: p.name, description: p.description, qty: 1, price: Number(p.price) };
    }).filter(Boolean);
    if (prefItems.length) setItems(prefItems);
  }

  function selectCustomer(c) {
    setSelectedCustomer(c);
    setCustomerSearch(c.name);
    setShowCustomerDrop(false);
    // Update due date based on payment terms
    const termDays = { 'Immediate': 0, 'Net 15': 15, 'Net 30': 30, 'Net 45': 45, 'Net 60': 60 };
    const days = termDays[c.paymentTerms] ?? 30;
    setDueDate(format(addDays(new Date(invoiceDate), days), 'yyyy-MM-dd'));
    // Autofill preferred products
    autoFillFromCustomer(c, products);
  }

  function selectProduct(idx, p) {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], productId: p.id, sku: p.sku, name: p.name, description: p.description, price: Number(p.price) };
    setItems(newItems);
    setShowProductDrop(null);
    setProductSearch('');
  }

  function updateItem(idx, field, value) {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setItems(newItems);
  }

  function addItem() {
    setItems([...items, { id: uuidv4(), productId: '', sku: '', name: '', description: '', qty: 1, price: 0 }]);
  }

  function removeItem(idx) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  }

  const subtotal = items.reduce((s, i) => s + (Number(i.qty) * Number(i.price)), 0);
  const taxAmt = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmt - Number(discount || 0);

  function saveInvoice(newStatus) {
    if (!selectedCustomer) { alert('Please select a customer.'); return; }
    if (!items.some(i => i.name)) { alert('Add at least one product.'); return; }

    const invoiceData = {
      id: invoiceId || uuidv4(),
      invoiceNumber, invoiceDate, dueDate,
      status: newStatus || status,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      items: items.filter(i => i.name),
      taxRate: Number(taxRate),
      discount: Number(discount || 0),
      subtotal, taxAmt, total,
      notes,
      createdAt: new Date().toISOString(),
    };

    const invoices = getInvoices();
    let updated;
    if (invoiceId) {
      updated = invoices.map(i => i.id === invoiceId ? invoiceData : i);
    } else {
      updated = [...invoices, invoiceData];
    }
    saveInvoices(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    return invoiceData;
  }

  function downloadPDF() {
    const inv = saveInvoice();
    if (!inv) return;
    const doc = generateInvoicePDF(inv, selectedCustomer, settings);
    doc.save(`${invoiceNumber}.pdf`);
  }

  const cur = settings.currency || '₹';
  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()));
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F5F6FA' }}>
      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => onNavigate('invoices')} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
            <ChevronLeft size={15} /> Back
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F1E3C' }}>{invoiceId ? 'Edit Invoice' : 'New Invoice'}</h2>
            <div style={{ color: '#9ca3af', fontSize: 12 }}>{invoiceNumber}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {saved && <span style={{ color: '#16a34a', fontSize: 13, fontWeight: 500 }}>✓ Saved</span>}
          <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}>
            {['draft', 'pending', 'paid', 'overdue'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <button onClick={() => saveInvoice()} style={{ padding: '9px 18px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, color: '#374151' }}>
            <Save size={14} /> Save
          </button>
          <button onClick={downloadPDF} style={{ padding: '9px 18px', background: '#C98C32', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 950, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {/* Customer selector */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <User size={15} color="#C98C32" />
              <label style={{ fontSize: 13, fontWeight: 600, color: '#0F1E3C' }}>Bill To *</label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                value={customerSearch}
                onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDrop(true); setSelectedCustomer(null); }}
                onFocus={() => setShowCustomerDrop(true)}
                placeholder="Search or select customer..."
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', outline: 'none' }}
              />
              {showCustomerDrop && filteredCustomers.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 20, maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
                  {filteredCustomers.map(c => (
                    <div key={c.id} onClick={() => selectCustomer(c)} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f9fafb' }}
                      onMouseOver={e => e.currentTarget.style.background = '#FFF8EE'}
                      onMouseOut={e => e.currentTarget.style.background = '#fff'}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#0F1E3C' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{c.contact} · {c.paymentTerms}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedCustomer && (
              <div style={{ marginTop: 12, padding: '12px 14px', background: '#FFF8EE', borderRadius: 8, border: '1px solid #f0d090' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0F1E3C' }}>{selectedCustomer.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>{selectedCustomer.address}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>GSTIN: {selectedCustomer.gstin || 'N/A'}</div>
                {selectedCustomer.preferredProducts?.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => autoFillFromCustomer(selectedCustomer, products)} style={{ background: '#C98C32', border: 'none', borderRadius: 6, padding: '4px 10px', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                      ↑ Auto-fill preferred products
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Invoice meta */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Invoice Number', value: invoiceNumber, setter: setInvoiceNumber, readOnly: false },
              ].map(({ label, value, setter, readOnly }) => (
                <div key={label} style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{label}</label>
                  <input value={value} onChange={e => setter(e.target.value)} readOnly={readOnly}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: readOnly ? '#f9fafb' : '#fff' }} />
                </div>
              ))}
              {[
                { label: 'Invoice Date', value: invoiceDate, setter: setInvoiceDate },
                { label: 'Due Date', value: dueDate, setter: setDueDate },
              ].map(({ label, value, setter }) => (
                <div key={label}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{label}</label>
                  <input type="date" value={value} onChange={e => setter(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Line items */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Package size={15} color="#C98C32" />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0F1E3C' }}>Line Items</h3>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Product', 'SKU', 'Description', 'Qty', 'Unit Price', 'Amount', ''].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} style={{ borderTop: idx > 0 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '8px 6px', minWidth: 160, position: 'relative' }}>
                    <input
                      value={item.name}
                      onChange={e => { updateItem(idx, 'name', e.target.value); setShowProductDrop(idx); setProductSearch(e.target.value); }}
                      onFocus={() => { setShowProductDrop(idx); setProductSearch(item.name); }}
                      placeholder="Select or type..."
                      style={{ width: '100%', padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                    />
                    {showProductDrop === idx && (
                      <div style={{ position: 'absolute', top: '100%', left: 6, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 30, maxHeight: 180, overflowY: 'auto', minWidth: 240 }}>
                        <div style={{ padding: '8px 10px', borderBottom: '1px solid #f3f4f6' }}>
                          <input value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Search products..." autoFocus
                            style={{ width: '100%', padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        {filteredProducts.map(p => (
                          <div key={p.id} onClick={() => selectProduct(idx, p)} style={{ padding: '9px 12px', cursor: 'pointer', borderBottom: '1px solid #f9fafb' }}
                            onMouseOver={e => e.currentTarget.style.background = '#FFF8EE'}
                            onMouseOut={e => e.currentTarget.style.background = '#fff'}>
                            <div style={{ fontWeight: 600, fontSize: 12, color: '#0F1E3C' }}>{p.name} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({p.sku})</span></div>
                            <div style={{ fontSize: 11, color: '#C98C32', fontWeight: 600 }}>{cur}{Number(p.price).toLocaleString('en-IN')} / {p.unit}</div>
                          </div>
                        ))}
                        <div onClick={() => setShowProductDrop(null)} style={{ padding: '8px 12px', cursor: 'pointer', color: '#9ca3af', fontSize: 11, textAlign: 'center', borderTop: '1px solid #f3f4f6' }}>Close</div>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '8px 6px' }}>
                    <input value={item.sku || ''} onChange={e => updateItem(idx, 'sku', e.target.value)} placeholder="SKU"
                      style={{ width: 80, padding: '7px 8px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none' }} />
                  </td>
                  <td style={{ padding: '8px 6px' }}>
                    <input value={item.description || ''} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="Description"
                      style={{ width: '100%', padding: '7px 8px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none', minWidth: 120 }} />
                  </td>
                  <td style={{ padding: '8px 6px' }}>
                    <input type="number" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} min={1}
                      style={{ width: 60, padding: '7px 8px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none', textAlign: 'center' }} />
                  </td>
                  <td style={{ padding: '8px 6px' }}>
                    <input type="number" value={item.price} onChange={e => updateItem(idx, 'price', e.target.value)}
                      style={{ width: 90, padding: '7px 8px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none', textAlign: 'right' }} />
                  </td>
                  <td style={{ padding: '8px 6px', fontWeight: 700, color: '#0F1E3C', fontSize: 13, whiteSpace: 'nowrap' }}>
                    {cur}{(Number(item.qty) * Number(item.price)).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '8px 6px' }}>
                    <button onClick={() => removeItem(idx)} style={{ background: 'none', border: '1px solid #fee2e2', borderRadius: 5, padding: '4px 6px', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={11} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={addItem} style={{ marginTop: 12, background: 'none', border: '1px dashed #e5e7eb', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', color: '#9ca3af', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={13} /> Add Line Item
          </button>
        </div>

        {/* Totals & notes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0F1E3C', marginBottom: 8 }}>Notes / Payment Instructions</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder="e.g. Please make payment to the above bank account within the due date."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical', color: '#374151' }} />
          </div>

          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: '#6b7280', fontSize: 13 }}>Subtotal</span>
              <span style={{ fontWeight: 600, color: '#0F1E3C', fontSize: 13 }}>{cur}{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ color: '#6b7280', fontSize: 13 }}>GST %</span>
              <input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} style={{ width: 60, padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, textAlign: 'right', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: '#6b7280', fontSize: 13 }}>Tax Amount</span>
              <span style={{ color: '#6b7280', fontSize: 13 }}>{cur}{taxAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#6b7280', fontSize: 13 }}>Discount ({cur})</span>
              <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} style={{ width: 90, padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, textAlign: 'right', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#0F1E3C', borderRadius: 8, padding: '12px 14px' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>TOTAL</span>
              <span style={{ color: '#F0B040', fontWeight: 800, fontSize: 16 }}>{cur}{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
