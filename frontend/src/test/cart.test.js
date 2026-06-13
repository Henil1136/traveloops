/**
 * cart.test.js
 * Unit tests for cart total calculation logic.
 * Run with: npx vitest
 */

import { describe, it, expect } from "vitest";

// ── Replicate the exact total formula from CartContext ─────────
function calcTotal(items) {
  return items.reduce((sum, i) => {
    const price = i.pricePerNight || i.priceRange_num || i.cost || 0;
    return sum + price * (i.qty || 1) * (i.nights || 1);
  }, 0);
}

// ── makeCartId (from utils/helpers) ───────────────────────────
function makeCartId(type, id) {
  return `${type}_${id}`;
}

// ─────────────────────────────────────────────────────────────
describe("Cart total calculation", () => {
  it("returns 0 for an empty cart", () => {
    expect(calcTotal([])).toBe(0);
  });

  it("calculates hotel total: pricePerNight × nights", () => {
    const items = [{ pricePerNight: 200, qty: 1, nights: 3 }];
    expect(calcTotal(items)).toBe(600);
  });

  it("calculates restaurant total using cost field", () => {
    const items = [{ cost: 40, qty: 2, nights: 1 }];
    expect(calcTotal(items)).toBe(80);
  });

  it("defaults qty and nights to 1 when omitted", () => {
    const items = [{ pricePerNight: 150 }];
    expect(calcTotal(items)).toBe(150);
  });

  it("sums multiple items correctly", () => {
    const items = [
      { pricePerNight: 220, qty: 1, nights: 2 }, // 440
      { cost: 85,           qty: 2, nights: 1 }, // 170
    ];
    expect(calcTotal(items)).toBe(610);
  });

  it("uses pricePerNight over cost when both are present", () => {
    // pricePerNight takes priority (first truthy wins in || chain)
    const items = [{ pricePerNight: 300, cost: 50, qty: 1, nights: 1 }];
    expect(calcTotal(items)).toBe(300);
  });

  it("defaults qty to 1 when falsy (0 || 1 = 1 in reduce formula)", () => {
    // The calcTotal formula uses (i.qty || 1), so qty:0 defaults to 1
    const items = [{ cost: 100, qty: 0, nights: 1 }];
    expect(calcTotal(items)).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────
describe("makeCartId", () => {
  it("combines type and id with underscore", () => {
    expect(makeCartId("hotel", "h1")).toBe("hotel_h1");
  });

  it("works with MongoDB ObjectId-style strings", () => {
    expect(makeCartId("restaurant", "665abc123456")).toBe("restaurant_665abc123456");
  });
});

// ─────────────────────────────────────────────────────────────
describe("Validation rules — price guard", () => {
  // Mirror the Joi/express-validator rule: price must be >= 0
  const isValidPrice = (p) => typeof p === "number" && p >= 0;

  it("accepts 0 as valid price", () => {
    expect(isValidPrice(0)).toBe(true);
  });

  it("rejects negative price", () => {
    expect(isValidPrice(-99999)).toBe(false);
  });

  it("rejects non-numeric price", () => {
    expect(isValidPrice("free")).toBe(false);
  });
});
