import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  customers: 'fw_customers',
  products: 'fw_products',
  invoices: 'fw_invoices',
  settings: 'fw_settings',
};

const defaultProducts = [
  { id: uuidv4(), sku: 'SP-001', name: 'Classic Oxford', category: 'Formal', price: 1850, unit: 'pair', description: 'Full-grain leather oxford' },
  { id: uuidv4(), sku: 'SP-002', name: 'Derby Brogue', category: 'Formal', price: 2100, unit: 'pair', description: 'Wingtip brogue in tan leather' },
  { id: uuidv4(), sku: 'SP-003', name: 'Loafer Moc', category: 'Casual', price: 1650, unit: 'pair', description: 'Slip-on penny loafer' },
  { id: uuidv4(), sku: 'SP-004', name: 'Chelsea Boot', category: 'Boots', price: 2450, unit: 'pair', description: 'Elastic-sided Chelsea boot' },
  { id: uuidv4(), sku: 'SP-005', name: 'Running Trainer', category: 'Sports', price: 1200, unit: 'pair', description: 'Mesh upper running shoe' },
  { id: uuidv4(), sku: 'SP-006', name: 'Sandal Classic', category: 'Casual', price: 850, unit: 'pair', description: 'Leather strap sandal' },
];

const defaultCustomers = [
  {
    id: uuidv4(),
    name: 'Metro Shoes Pvt Ltd',
    contact: 'Rahul Sharma',
    email: 'rahul@metroshoes.in',
    phone: '+91 98765 43210',
    address: '14, Commercial Complex, Linking Road, Bandra West, Mumbai - 400050',
    gstin: '27AABCM1234A1Z5',
    paymentTerms: 'Net 30',
    creditLimit: 500000,
    preferredProducts: [],
    notes: 'Key retail chain, prompt payer',
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Footwear World',
    contact: 'Priya Patel',
    email: 'priya@footwearworld.com',
    phone: '+91 99887 76655',
    address: '7, Ring Road Market, Connaught Place, New Delhi - 110001',
    gstin: '07AABCF5678B1Z2',
    paymentTerms: 'Net 45',
    creditLimit: 750000,
    preferredProducts: [],
    notes: 'Bulk buyer, seasonal orders',
    createdAt: new Date().toISOString(),
  },
];

const defaultSettings = {
  companyName: 'StrideCraft Footwear',
  companyAddress: 'Plot 42, MIDC Industrial Area, Andheri East, Mumbai - 400093',
  companyPhone: '+91 22 4567 8900',
  companyEmail: 'accounts@stridecraft.in',
  companyGSTIN: '27AABCS9999C1Z1',
  invoicePrefix: 'SC-INV',
  nextInvoiceNumber: 1001,
  taxRate: 18,
  currency: '₹',
  bankName: 'HDFC Bank',
  bankAccount: '50200012345678',
  bankIFSC: 'HDFC0001234',
  bankBranch: 'Andheri East',
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getCustomers() { return load(STORAGE_KEYS.customers, defaultCustomers); }
export function saveCustomers(data) { save(STORAGE_KEYS.customers, data); }

export function getProducts() { return load(STORAGE_KEYS.products, defaultProducts); }
export function saveProducts(data) { save(STORAGE_KEYS.products, data); }

export function getInvoices() { return load(STORAGE_KEYS.invoices, []); }
export function saveInvoices(data) { save(STORAGE_KEYS.invoices, data); }

export function getSettings() { return load(STORAGE_KEYS.settings, defaultSettings); }
export function saveSettings(data) { save(STORAGE_KEYS.settings, data); }

export function getNextInvoiceNumber() {
  const s = getSettings();
  const num = s.nextInvoiceNumber;
  saveSettings({ ...s, nextInvoiceNumber: num + 1 });
  return `${s.invoicePrefix}-${num}`;
}
