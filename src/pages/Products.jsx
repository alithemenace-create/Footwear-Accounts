import { useState, useEffect } from 'react';
import { getProducts, saveProducts } from '../data/store';
import { Plus, Search, Edit2, Trash2, X, Package } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const CATEGORIES = ['Formal', 'Casual', 'Boots', 'Sports', 'Sandals', 'Kids', 'Other'];
const empty = { sku: '', name: '', category: 'Formal', price: '', unit: 'pair', description: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);

  useEffect(() => { setProducts(getProducts()); }, []);

  const filtered = products.filter(p =>
    (category === 'All' || p.category === category) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  function openAdd() { setForm({ ...empty }); setModal('add'); }
  function openEdit(p) { setForm({ ...p }); setModal(p); }

  function save() {
    if (!form.name.trim() || !form.price) return;
    let updated;
    if (modal === 'add') {
      updated = [...products, { ...form, id: uuidv4() }];
    } else {
      updated = products.map(p => p.id === modal.id ? { ...form, id: modal.id } : p);
    }
    setProducts(updated);
    saveProducts(updated);
    setModal(null);
  }

  function del(id) {
    if (!confirm('Delete this product?')) return;
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveProducts(updated);
  }

  const catColors = { Formal: '#3b82f6', Casual: '#10b981', Boots: '#8b5cf6', Sports: '#f59e0b', Sandals: '#ec4899', Kids: '#06b6d4', Other: '#6b7280' };

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0F1E3C' }}>Product Catalog</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>{products.length} products in catalog</p>
        </div>
        <button onClick={openAdd} style={{ background: '#C98C32', border: 'none', borderRadius: 8, padding: '10px 18px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={15} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or SKU..."
            style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', outline: 'none', background: '#fff' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['All', ...CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: 12, fontWeight: 500,
              background: category === cat ? '#0F1E3C' : '#fff', color: category === cat ? '#fff' : '#374151',
            }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'relative', borderTop: `3px solid ${catColors[p.category] || '#6b7280'}` }}>
            <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 4 }}>
              <button onClick={() => openEdit(p)} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 5, padding: '4px 6px', cursor: 'pointer', color: '#6b7280' }}><Edit2 size={11} /></button>
              <button onClick={() => del(p.id)} style={{ background: '#fff5f5', border: '1px solid #fee2e2', borderRadius: 5, padding: '4px 6px', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={11} /></button>
            </div>
            <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 12px', marginBottom: 12, display: 'inline-block' }}>
              <Package size={20} color={catColors[p.category] || '#6b7280'} />
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: catColors[p.category] || '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{p.category} · {p.sku}</div>
            <div style={{ fontWeight: 700, color: '#0F1E3C', fontSize: 15, marginBottom: 4 }}>{p.name}</div>
            <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 10, minHeight: 32 }}>{p.description}</div>
            <div style={{ fontWeight: 700, color: '#C98C32', fontSize: 18 }}>₹{Number(p.price).toLocaleString('en-IN')} <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>/ {p.unit}</span></div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: 60, textAlign: 'center', color: '#9ca3af' }}>
            <Package size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
            <div style={{ fontSize: 14 }}>No products found</div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, width: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F1E3C' }}>{modal === 'add' ? 'Add Product' : 'Edit Product'}</h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                {[['name', 'Product Name *'], ['sku', 'SKU / Code']].map(([f, l]) => (
                  <div key={f} style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{l}</label>
                    <input value={form[f] || ''} onChange={e => setForm({ ...form, [f]: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Unit</label>
                  <select value={form.unit || 'pair'} onChange={e => setForm({ ...form, unit: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}>
                    {['pair', 'piece', 'dozen', 'box', 'carton'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1', marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Price (₹) *</label>
                  <input type="number" value={form.price || ''} onChange={e => setForm({ ...form, price: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Description</label>
                  <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={2} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ padding: '9px 18px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button onClick={save} style={{ padding: '9px 20px', background: '#C98C32', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                {modal === 'add' ? 'Add Product' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
