export function auditDataIntegrity(data = {}) {
  const products = new Set((data.products || []).map(x => x.id));
  const customers = new Set((data.customers || []).map(x => x.id));
  const suppliers = new Set((data.suppliers || []).map(x => x.id));
  const sales = new Set((data.sales || []).map(x => x.id));
  const issues = [];
  const check = (rows, relation, target, label, optional = false) => {
    for (const row of rows || []) {
      const id = row[relation];
      if ((id === undefined || id === null || id === "") && optional) continue;
      if (typeof id !== "string" || !target.has(id)) {
        issues.push({
          type: label,
          recordId: row.id || "",
          referenceId: id ?? "",
          description: label + " record has a missing linked record"
        });
      }
    }
  };
  check(data.sales, "productId", products, "Sale → product");
  check(data.purchases, "productId", products, "Purchase → product");
  check(data.purchases, "supplierId", suppliers, "Purchase → supplier", true);
  check(data.sales_returns, "saleId", sales, "Return → original sale");
  check(data.payments, "customerId", customers, "Customer payment → customer");
  check(data.supplier_payments, "supplierId", suppliers, "Supplier payment → supplier");
  check(data.inventory_batches, "productId", products, "Batch → product");
  check(data.stock_adjustments, "productId", products, "Stock adjustment → product");
  return {
    issues,
    counts: {
      sales: (data.sales || []).length,
      purchases: (data.purchases || []).length,
      returns: (data.sales_returns || []).length,
      customerPayments: (data.payments || []).length,
      supplierPayments: (data.supplier_payments || []).length,
      batches: (data.inventory_batches || []).length,
      adjustments: (data.stock_adjustments || []).length
    }
  };
}
