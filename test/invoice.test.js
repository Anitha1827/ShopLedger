const test = require('node:test');
const assert = require('node:assert/strict');

const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function figures(order) {
  return {
    invoice: invoice.computeInvoiceFigures(order),
    checkout: pricing.computeTotals(order.items, order.coupon)
  };
}

test('CURRENT BEHAVIOUR: order #1001 invoices 5% and 12% lines without a coupon', function () {
  const order = {
    id: 1001,
    coupon: '',
    items: [
      { name: 'Rice', sku: 'GRN-001', hsn: '1006', price: 100, qty: 2, gstRate: 5 },
      { name: 'Ghee', sku: 'DRY-001', hsn: '0405', price: 150, qty: 2, gstRate: 12 }
    ]
  };
  const result = figures(order);

  assert.deepEqual(result.invoice, {
    subtotal: 500,
    discount: 0,
    tax: 46,
    cgst: 23,
    sgst: 23,
    total: 546,
    rows: [
      { name: 'Rice', sku: 'GRN-001', hsn: '1006', qty: 2, price: 100, gstPercent: 5, line: 200, lineTax: 10 },
      { name: 'Ghee', sku: 'DRY-001', hsn: '0405', qty: 2, price: 150, gstPercent: 12, line: 300, lineTax: 36 }
    ]
  });
  assert.deepEqual(
    { subtotal: result.checkout.subtotal, discount: result.checkout.discount, tax: result.checkout.tax, total: result.checkout.total },
    { subtotal: 500, discount: 0, tax: 46, total: 546 }
  );
});

test('CURRENT BEHAVIOUR: order #1002 SAVE10 applies its subtotal discount before tax', function () {
  const order = {
    id: 1002,
    coupon: 'SAVE10',
    items: [{ name: 'Tea', sku: 'BEV-001', hsn: '0902', price: 1000, qty: 1, gstRate: 18 }]
  };
  const result = figures(order);

  assert.deepEqual(result.invoice, {
    subtotal: 1000,
    discount: 100,
    tax: 162,
    cgst: 81,
    sgst: 81,
    total: 1062,
    rows: [
      { name: 'Tea', sku: 'BEV-001', hsn: '0902', qty: 1, price: 1000, gstPercent: 18, line: 1000, lineTax: 162 }
    ]
  });
  assert.deepEqual(
    { subtotal: result.checkout.subtotal, discount: result.checkout.discount, tax: result.checkout.tax, total: result.checkout.total },
    { subtotal: 1000, discount: 100, tax: 162, total: 1062 }
  );
});

test('CURRENT BEHAVIOUR: order #1004 SAVE10 applies the ₹150 cap before tax on ₹2,240', function () {
  const order = {
    id: 1004,
    coupon: 'SAVE10',
    items: [
      { name: 'Rice', sku: 'GRN-001', hsn: '1006', price: 1400, qty: 1, gstRate: 5 },
      { name: 'Ghee', sku: 'DRY-001', hsn: '0405', price: 840, qty: 1, gstRate: 12 }
    ]
  };
  const result = figures(order);

  assert.deepEqual(result.invoice, {
    subtotal: 2240,
    discount: 150,
    tax: 159.36,
    cgst: 79.68,
    sgst: 79.68,
    total: 2249.36,
    rows: [
      { name: 'Rice', sku: 'GRN-001', hsn: '1006', qty: 1, price: 1400, gstPercent: 5, line: 1400, lineTax: 65.31 },
      { name: 'Ghee', sku: 'DRY-001', hsn: '0405', qty: 1, price: 840, gstPercent: 12, line: 840, lineTax: 94.05 }
    ]
  });
  assert.deepEqual(
    { subtotal: result.checkout.subtotal, discount: result.checkout.discount, tax: result.checkout.tax, total: result.checkout.total },
    { subtotal: 2240, discount: 150, tax: 159.36, total: 2249.36 }
  );
});

test('CURRENT BEHAVIOUR: order #1008 with all 18% lines and no coupon has matching totals', function () {
  const order = {
    id: 1008,
    coupon: '',
    items: [
      { name: 'Tea', sku: 'BEV-001', hsn: '0902', price: 100, qty: 1, gstRate: 18 },
      { name: 'Coffee', sku: 'BEV-002', hsn: '0901', price: 200, qty: 1, gstRate: 18 }
    ]
  };
  const result = figures(order);

  assert.deepEqual(result.invoice, {
    subtotal: 300,
    discount: 0,
    tax: 54,
    cgst: 27,
    sgst: 27,
    total: 354,
    rows: [
      { name: 'Tea', sku: 'BEV-001', hsn: '0902', qty: 1, price: 100, gstPercent: 18, line: 100, lineTax: 18 },
      { name: 'Coffee', sku: 'BEV-002', hsn: '0901', qty: 1, price: 200, gstPercent: 18, line: 200, lineTax: 36 }
    ]
  });
  assert.deepEqual(
    { subtotal: result.checkout.subtotal, discount: result.checkout.discount, tax: result.checkout.tax, total: result.checkout.total },
    { subtotal: 300, discount: 0, tax: 54, total: 354 }
  );
});

test('Invoice matches checkout for HSN slabs and capped coupon discount before tax', function () {
  const order = {
    id: 1004,
    coupon: 'SAVE10',
    items: [
      { name: 'Rice', sku: 'GRN-001', hsn: '1006', price: 1400, qty: 1, gstRate: 5 },
      { name: 'Ghee', sku: 'DRY-001', hsn: '0405', price: 840, qty: 1, gstRate: 12 }
    ]
  };
  const checkout = pricing.computeTotals(order.items, order.coupon);
  const invoiceFigures = invoice.computeInvoiceFigures(order);

  assert.deepEqual(invoiceFigures, {
    subtotal: 2240,
    discount: 150,
    tax: 159.36,
    cgst: 79.68,
    sgst: 79.68,
    total: 2249.36,
    rows: [
      { name: 'Rice', sku: 'GRN-001', hsn: '1006', qty: 1, price: 1400, gstPercent: 5, line: 1400, lineTax: 65.31 },
      { name: 'Ghee', sku: 'DRY-001', hsn: '0405', qty: 1, price: 840, gstPercent: 12, line: 840, lineTax: 94.05 }
    ]
  });
  assert.deepEqual(
    { subtotal: invoiceFigures.subtotal, discount: invoiceFigures.discount, tax: invoiceFigures.tax, cgst: invoiceFigures.cgst, sgst: invoiceFigures.sgst, total: invoiceFigures.total },
    { subtotal: checkout.subtotal, discount: checkout.discount, tax: checkout.tax, cgst: checkout.cgst, sgst: checkout.sgst, total: checkout.total }
  );
});
