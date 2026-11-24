export function sum(items, selector) {
  return items.reduce((total, item) => total + selector(item), 0);
}

export function costOf(sale) {
  return Number(sale.cost || 0);
}

export function customerBalance(data, customer) {
  const sales = data.sales.filter(x => x.customerId === customer.id);
  const returns = data.sales_returns.filter(x => x.customerId === customer.id);
  const total = sum(sales, x => Number(x.total || 0)) - sum(returns, x => Number(x.amount || 0));
  const paid = sum(sales, x => Number(x.paid || 0))
    + sum(data.payments.filter(x => x.customerId === customer.id), x => Number(x.amount || 0))
    - sum(returns, x => Number(x.refundPaid || 0));
  return { sales, total, paid, balance: total - paid };
}

export function supplierBalance(data, supplier) {
  const purchases = data.purchases.filter(x => x.supplierId === supplier.id);
  const total = sum(purchases, x => Number(x.total || 0));
  const paid = sum(data.supplier_payments.filter(x => x.supplierId === supplier.id), x => Number(x.amount || 0));
  return { purchases, total, paid, balance: total - paid };
}

export function groupSalesByInvoice(sales, returns = []) {
  const groups = new Map();
  for (const sale of sales) {
    const key = sale.invoiceNo || sale.id;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(sale);
  }
  return [...groups.values()].map(items => {
    const ids = new Set(items.map(x => x.id));
    const linked = returns.filter(x => ids.has(x.saleId));
    const returned = sum(linked, x => Number(x.amount || 0));
    const restoredCost = sum(linked.filter(x => x.restocked), x => Number(x.cost || 0));
    return {
      id: items[0].id,
      invoiceNo: items[0].invoiceNo || ("INV-" + String(items[0].id).slice(-8).toUpperCase()),
      date: items[0].date,
      createdAt: Math.max(...items.map(x => Number(x.createdAt || 0))),
      customerName: items[0].customerName || "Walk-in customer",
      items,
      total: sum(items, x => Number(x.total || 0)) - returned,
      profit: sum(items, x => Number(x.profit ?? (Number(x.total || 0) - costOf(x)))) - returned + restoredCost,
      paid: sum(items, x => Number(x.paid || 0))
    };
  });
}

export function profitSummary({ sales = [], returns = [], expenses = [], adjustments = [] }) {
  const revenue = sum(sales, x => Number(x.total || 0)) - sum(returns, x => Number(x.amount || 0));
  const cogs = sum(sales, costOf) - sum(returns.filter(x => x.restocked), x => Number(x.cost || 0));
  const expenseTotal = sum(expenses, x => Number(x.amount || 0));
  const stockLoss = sum(adjustments.filter(x => Number(x.delta) < 0), x => Number(x.lossValue || 0));
  const gross = revenue - cogs;
  return { revenue, cogs, expenses: expenseTotal, stockLoss, gross, net: gross - expenseTotal - stockLoss };
}


export function buildAccountingCsv(data) {
  const rows = [["Type","Date","Reference","Party","Item / Details","Quantity","Unit Rate","Amount","Cost","Profit","Cash Refunded","Stock Restocked","Notes"]];
  for (const sale of data.sales || []) rows.push(["Sale",sale.date,sale.invoiceNo||"",sale.customerName||"",sale.productName||"",sale.qty??"",sale.rate??"",sale.total??"",sale.cost??"",sale.profit??"","","",""]);
  for (const purchase of data.purchases || []) rows.push(["Purchase",purchase.date,purchase.batchNo||"",purchase.supplierName||"",purchase.productName||"",purchase.qty??"",purchase.cost??"",purchase.total??"",purchase.total??"","","","",[purchase.batchNo?"Batch: "+purchase.batchNo:"",purchase.expiryDate?"Expiry: "+purchase.expiryDate:""].filter(Boolean).join("; ")]);
  for (const expense of data.expenses || []) rows.push(["Expense",expense.date,"",expense.category||"",expense.note||"","","",expense.amount??"","","","","",""]);
  for (const payment of data.payments || []) rows.push(["Customer payment",payment.date,"",payment.customerName||"","Account payment","","",payment.amount??"","","","","",payment.note||""]);
  for (const adjustment of data.stock_adjustments || []) rows.push(["Stock adjustment",adjustment.date,"","",adjustment.productName||"",adjustment.delta??"","",adjustment.lossValue??0,adjustment.lossValue??0,"","","",adjustment.reason||""]);
  for (const returned of data.sales_returns || []) rows.push(["Sales return",returned.date,returned.invoiceNo||"",returned.customerName||"",returned.productName||"",returned.qty??"",returned.rate??"",returned.amount??"",returned.cost??0,-(Number(returned.amount||0)-Number(returned.restocked?returned.cost||0:0)),returned.refundPaid??0,returned.restocked?"Yes":"No",returned.reason||""]);
  for (const payment of data.supplier_payments || []) rows.push(["Supplier payment",payment.date,"",payment.supplierName||"","Account payment","","",payment.amount??"","","","","",payment.note||""]);
  const safeCell = value => {
    let cell = String(value ?? "");
    if (typeof value === "string" && /^[\s]*[=+@-]/.test(cell)) cell = "'" + cell;
    return '"' + cell.replace(/"/g,'""') + '"';
  };
  return rows.map(row => row.map(safeCell).join(",")).join("\n");
}
