const OPTIONAL_STORES = ["stock_adjustments","sales_returns","suppliers","supplier_payments","business_profile","inventory_batches","sms_messages"];

export function validateBackupPayload(payload, storeNames) {
  if (!payload || payload.app !== "Karobaar Manager" || !payload.data ||
      typeof payload.data !== "object" || Array.isArray(payload.data) ||
      !Array.isArray(storeNames) || !storeNames.length) {
    throw new Error("This is not a valid Karobaar backup");
  }
  const normalized = { ...payload, data: { ...payload.data } };
  for (const name of storeNames) {
    const rows = normalized.data[name];
    if (!Array.isArray(rows)) {
      if (OPTIONAL_STORES.includes(name) && rows === undefined) {
        normalized.data[name] = [];
        continue;
      }
      throw new Error("This is not a valid Karobaar backup");
    }
    const seen = new Set();
    for (const row of rows) {
      if (!row || typeof row !== "object" || Array.isArray(row) ||
          typeof row.id !== "string" || !row.id.trim()) {
        throw new Error("Backup contains an invalid " + name + " record");
      }
      if (seen.has(row.id)) {
        throw new Error("Backup contains duplicate IDs in " + name + ". Nothing has been changed.");
      }
      seen.add(row.id);
    }
  }
  return normalized;
}
