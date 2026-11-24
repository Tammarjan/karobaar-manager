import test from "node:test";
import assert from "node:assert/strict";
import { customerBalance, supplierBalance, groupSalesByInvoice, profitSummary } from "../src/accounting.js";
import { validateBackupPayload } from "../src/backup.js";
import { reconcileInventory } from "../src/inventory.js";

test("multi-item invoice groups lines and combines returns without merging distinct invoices", () => {
  const sales = [
    { id: "s1", invoiceNo: "INV-1", total: 200, paid: 100, profit: 60, createdAt: 1 },
    { id: "s2", invoiceNo: "INV-1", total: 150, paid: 75, profit: 45, createdAt: 2 },
    { id: "s3", invoiceNo: "INV-2", total: 50, paid: 50, profit: 10, createdAt: 3 }
  ];
  const returns = [{ saleId: "s1", amount: 40, cost: 20, restocked: true }];
  const groups = groupSalesByInvoice(sales, returns);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].total, 310);
  assert.equal(groups[0].paid, 175);
  assert.equal(groups[0].profit, 85);
  assert.equal(groups[1].total, 50);
});

test("customer balance accounts for invoice payments, later payments, returns and cash refunds", () => {
  const customer = { id: "c1" };
  const result = customerBalance({
    sales: [{ id: "s1", customerId: "c1", total: 500, paid: 200 }],
    sales_returns: [{ saleId: "s1", customerId: "c1", amount: 100, refundPaid: 30 }],
    payments: [{ customerId: "c1", amount: 150 }]
  }, customer);
  assert.deepEqual({ total: result.total, paid: result.paid, balance: result.balance },
    { total: 400, paid: 320, balance: 80 });
});

test("supplier payable subtracts payments from assigned purchases only", () => {
  const supplier = { id: "v1" };
  const result = supplierBalance({
    purchases: [
      { supplierId: "v1", total: 700 },
      { supplierId: "", total: 90 }
    ],
    supplier_payments: [{ supplierId: "v1", amount: 250 }]
  }, supplier);
  assert.deepEqual({ total: result.total, paid: result.paid, balance: result.balance },
    { total: 700, paid: 250, balance: 450 });
});

test("profit reverses COGS only for restocked returns and subtracts stock losses", () => {
  const result = profitSummary({
    sales: [{ total: 1000, cost: 600 }],
    returns: [
      { amount: 200, cost: 120, restocked: true },
      { amount: 100, cost: 60, restocked: false }
    ],
    expenses: [{ amount: 50 }],
    adjustments: [{ delta: -2, lossValue: 30 }, { delta: 1, lossValue: 0 }]
  });
  assert.deepEqual(result, {
    revenue: 700, cogs: 480, expenses: 50, stockLoss: 30, gross: 220, net: 140
  });
});

test("legacy sales without optional numeric fields remain safe", () => {
  const result = profitSummary({ sales: [{}], returns: [{}], expenses: [{}], adjustments: [{}] });
  assert.deepEqual(result, { revenue: 0, cogs: 0, expenses: 0, stockLoss: 0, gross: 0, net: 0 });
});

test("invoice profit falls correctly for non-restocked returns and supports legacy lines without profit", () => { const groups = groupSalesByInvoice([{ id:"legacy-1", invoiceNo:"OLD-1", total:300, cost:180 },{ id:"legacy-2", invoiceNo:"OLD-1", total:200, cost:120 }],[{ saleId:"legacy-1", amount:50, cost:30, restocked:false },{ saleId:"legacy-2", amount:40, cost:24, restocked:true }]); assert.equal(groups[0].total,410); assert.equal(groups[0].profit,134); });
test("customer account remains balanced when a fully paid sale is fully returned and refunded", () => { const result=customerBalance({sales:[{id:"s1",customerId:"c1",total:100,paid:100}],sales_returns:[{saleId:"s1",customerId:"c1",amount:100,refundPaid:100}],payments:[]},{id:"c1"}); assert.deepEqual({total:result.total,paid:result.paid,balance:result.balance},{total:0,paid:0,balance:0}); });

test("backup validation accepts legacy files missing optional stores without mutating input", () => { const stores=["products","purchases","sales","customers","expenses","payments","sales_returns","inventory_batches"]; const input={app:"Karobaar Manager",data:{products:[{id:"p1"}],purchases:[],sales:[],customers:[],expenses:[],payments:[]}}; const result=validateBackupPayload(input,stores); assert.deepEqual(result.data.sales_returns,[]); assert.deepEqual(result.data.inventory_batches,[]); assert.equal(input.data.sales_returns,undefined); });
test("backup validation rejects duplicate IDs and malformed records before restore", () => { const stores=["products","purchases","sales","customers","expenses","payments"]; const base={app:"Karobaar Manager",data:{products:[{id:"p1"},{id:"p1"}],purchases:[],sales:[],customers:[],expenses:[],payments:[]}}; assert.throws(()=>validateBackupPayload(base,stores),/duplicate IDs/); const malformed={app:"Karobaar Manager",data:{products:[{id:" "}],purchases:[],sales:[],customers:[],expenses:[],payments:[]}}; assert.throws(()=>validateBackupPayload(malformed,stores),/invalid products record/); });

test("inventory reconciliation separates untracked stock, over-allocation and orphan batches", () => { const result=reconcileInventory([{id:"p1",name:"A",stock:8},{id:"p2",name:"B",stock:2}],[{id:"b1",productId:"p1",remaining:5},{id:"b2",productId:"p2",remaining:4},{id:"b3",productId:"missing",remaining:3}]); assert.equal(result.untracked[0].difference,3); assert.equal(result.over[0].difference,-2); assert.equal(result.orphan.length,1); });
test("inventory reconciliation flags invalid negative and non-numeric quantities", () => { const result=reconcileInventory([{id:"p1",name:"A",stock:-2},{id:"p2",name:"B",stock:4}],[{id:"b1",productId:"p2",remaining:-1},{id:"b2",productId:"p2",remaining:"bad"}]); assert.equal(result.invalidProducts.length,1); assert.equal(result.invalidBatches.length,2); assert.equal(result.untracked.length,1); assert.equal(result.untracked[0].batchQty,0); });
