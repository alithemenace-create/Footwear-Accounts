import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export function generateInvoicePDF(invoice, customer, settings) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297;
  const margin = 15;
  const navy = [15, 30, 60];
  const amber = [201, 140, 50];
  const lightGray = [245, 245, 247];
  const textDark = [20, 20, 35];
  const textMid = [90, 90, 105];

  // Header background
  doc.setFillColor(...navy);
  doc.rect(0, 0, W, 45, 'F');

  // Amber accent strip
  doc.setFillColor(...amber);
  doc.rect(0, 45, W, 3, 'F');

  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(settings.companyName, margin, 18);

  // Company sub-details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 190, 210);
  doc.text(settings.companyAddress, margin, 25);
  doc.text(`Ph: ${settings.companyPhone}  |  Email: ${settings.companyEmail}`, margin, 30);
  doc.text(`GSTIN: ${settings.companyGSTIN}`, margin, 35);

  // INVOICE label
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('INVOICE', W - margin, 20, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(180, 190, 210);
  doc.text(`#${invoice.invoiceNumber}`, W - margin, 28, { align: 'right' });

  // Meta block (invoice date, due date, status)
  let y = 55;
  const col2 = W / 2 + 5;

  // Bill To
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, y, W / 2 - margin - 5, 52, 2, 2, 'F');

  doc.setTextColor(...navy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('BILL TO', margin + 5, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...textDark);
  doc.text(customer.name, margin + 5, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textMid);
  const addrLines = doc.splitTextToSize(customer.address, W / 2 - margin - 15);
  doc.text(addrLines, margin + 5, y + 22);
  doc.text(`Contact: ${customer.contact}`, margin + 5, y + 22 + addrLines.length * 4.5);
  doc.text(`GSTIN: ${customer.gstin || 'N/A'}`, margin + 5, y + 28 + addrLines.length * 4.5);

  // Invoice Details
  doc.setFillColor(...lightGray);
  doc.roundedRect(col2, y, W - col2 - margin, 52, 2, 2, 'F');

  const details = [
    ['Invoice Date', format(new Date(invoice.invoiceDate), 'dd MMM yyyy')],
    ['Due Date', format(new Date(invoice.dueDate), 'dd MMM yyyy')],
    ['Payment Terms', customer.paymentTerms || 'Net 30'],
    ['Status', invoice.status.toUpperCase()],
  ];

  details.forEach(([label, val], i) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...navy);
    doc.text(label, col2 + 5, y + 10 + i * 11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textDark);
    doc.setFontSize(9);
    if (label === 'Status') {
      const statusColor = invoice.status === 'paid' ? [34, 130, 80] : invoice.status === 'overdue' ? [200, 50, 50] : [180, 120, 20];
      doc.setTextColor(...statusColor);
      doc.setFont('helvetica', 'bold');
    }
    doc.text(val, col2 + 5, y + 16 + i * 11);
  });

  // Items table
  y += 60;

  const tableData = invoice.items.map((item, idx) => [
    idx + 1,
    item.sku || '',
    item.name,
    item.description || '',
    item.qty,
    `${settings.currency}${Number(item.price).toLocaleString('en-IN')}`,
    `${settings.currency}${(item.qty * item.price).toLocaleString('en-IN')}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'SKU', 'Product', 'Description', 'Qty', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: navy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
    },
    bodyStyles: {
      fontSize: 8,
      textColor: textDark,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
    },
    alternateRowStyles: { fillColor: [250, 250, 253] },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 22 },
      2: { cellWidth: 38 },
      3: { cellWidth: 45 },
      4: { cellWidth: 12, halign: 'center' },
      5: { cellWidth: 28, halign: 'right' },
      6: { cellWidth: 28, halign: 'right' },
    },
    margin: { left: margin, right: margin },
  });

  // Totals
  const afterTable = doc.lastAutoTable.finalY + 8;
  const totalsX = W - margin - 75;

  const subtotal = invoice.items.reduce((s, i) => s + i.qty * i.price, 0);
  const taxAmt = (subtotal * (invoice.taxRate || 18)) / 100;
  const discount = invoice.discount || 0;
  const total = subtotal + taxAmt - discount;

  const rows = [
    ['Subtotal', subtotal],
    [`GST (${invoice.taxRate || 18}%)`, taxAmt],
    discount > 0 ? ['Discount', -discount] : null,
    ['TOTAL', total],
  ].filter(Boolean);

  rows.forEach(([label, amt], i) => {
    const isTotal = label === 'TOTAL';
    const rowY = afterTable + i * 9;

    if (isTotal) {
      doc.setFillColor(...navy);
      doc.rect(totalsX - 5, rowY - 5, 80, 11, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
    } else {
      doc.setTextColor(...textMid);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
    }

    doc.text(label, totalsX, rowY);
    const amtStr = `${settings.currency}${Math.abs(amt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    doc.text(amt < 0 ? `-${amtStr}` : amtStr, W - margin, rowY, { align: 'right' });
  });

  // Notes & Bank Details
  const notesY = afterTable + rows.length * 9 + 15;

  if (invoice.notes) {
    doc.setFillColor(...lightGray);
    doc.roundedRect(margin, notesY, W / 2 - margin - 5, 30, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...navy);
    doc.text('NOTES', margin + 5, notesY + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textMid);
    const noteLines = doc.splitTextToSize(invoice.notes, W / 2 - margin - 20);
    doc.text(noteLines, margin + 5, notesY + 13);
  }

  // Bank details
  doc.setFillColor(...lightGray);
  doc.roundedRect(col2, notesY, W - col2 - margin, 30, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...navy);
  doc.text('BANK DETAILS', col2 + 5, notesY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textMid);
  doc.text(`Bank: ${settings.bankName}`, col2 + 5, notesY + 13);
  doc.text(`A/C No: ${settings.bankAccount}`, col2 + 5, notesY + 18);
  doc.text(`IFSC: ${settings.bankIFSC}  |  Branch: ${settings.bankBranch}`, col2 + 5, notesY + 23);

  // Footer
  doc.setFillColor(...navy);
  doc.rect(0, H - 15, W, 15, 'F');
  doc.setTextColor(150, 165, 195);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Thank you for your business!', W / 2, H - 8, { align: 'center' });
  doc.text(`${settings.companyName}  ·  ${settings.companyEmail}  ·  ${settings.companyPhone}`, W / 2, H - 4, { align: 'center' });

  return doc;
}
