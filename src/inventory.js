export function reconcileInventory(products = [], batches = []) {
  const productIds = new Set(products.map(product => product.id));
  const batchTotals = new Map();
  const invalidBatches = [];
  const orphan = [];

  for (const batch of batches) {
    const remaining = Number(batch.remaining);
    if (!Number.isFinite(remaining) || remaining < 0) {
      invalidBatches.push({
        batch,
        reason: !Number.isFinite(remaining) ? "Non-numeric remaining quantity" : "Negative remaining quantity"
      });
      continue;
    }
    if (remaining <= 0) continue;
    if (!productIds.has(batch.productId)) {
      orphan.push(batch);
      continue;
    }
    batchTotals.set(batch.productId, (batchTotals.get(batch.productId) || 0) + remaining);
  }

  const rows = products.map(product => {
    const rawStock = product.stock === undefined || product.stock === null || product.stock === "" ? 0 : Number(product.stock);
    const invalidStock = !Number.isFinite(rawStock) || rawStock < 0;
    const stock = invalidStock ? 0 : rawStock;
    const batchQty = batchTotals.get(product.id) || 0;
    return {
      product,
      stock,
      batchQty,
      difference: stock - batchQty,
      invalidStock
    };
  });

  const invalidProducts = rows.filter(row => row.invalidStock);
  const validRows = rows.filter(row => !row.invalidStock);
  return {
    rows,
    over: validRows.filter(row => row.difference < -0.000001),
    untracked: validRows.filter(row => row.difference > 0.000001),
    orphan,
    invalidBatches,
    invalidProducts
  };
}
