import { describe, it, expect } from "vitest";
import { fmt, fmtD, days, slug, stars, makeCartId, priceRangeNum, debounce } from "../utils/helpers";

describe("fmt — currency formatting", () => {
  it("formats a number with $ and commas", () => {
    expect(fmt(1234)).toBe("$1,234");
  });

  it("handles null/undefined as $0", () => {
    expect(fmt(null)).toBe("$0");
    expect(fmt(undefined)).toBe("$0");
  });

  it("formats zero", () => {
    expect(fmt(0)).toBe("$0");
  });
});

describe("fmtD — date formatting", () => {
  it("formats a date string to short friendly form", () => {
    const result = fmtD("2024-06-15");
    expect(result).toMatch(/Jun 1[45], 2024/);
  });

  it("returns empty string for falsy input", () => {
    expect(fmtD("")).toBe("");
    expect(fmtD(null)).toBe("");
  });
});

describe("days — date difference", () => {
  it("returns at least 1 for same day", () => {
    expect(days("2024-06-15", "2024-06-15")).toBe(1);
  });

  it("calculates days between two dates", () => {
    expect(days("2024-06-10", "2024-06-15")).toBe(5);
  });
});

describe("slug — URL-friendly slug", () => {
  it("converts to lowercase hyphenated", () => {
    expect(slug("Hello World!")).toBe("hello-world");
  });

  it("returns empty string for falsy input", () => {
    expect(slug("")).toBe("");
    expect(slug(null)).toBe("");
  });

  it("removes special characters and trims hyphens", () => {
    expect(slug("Paris & London!")).toBe("paris-london");
  });
});

describe("stars — star rating display", () => {
  it("returns correct number of stars", () => {
    expect(stars(3)).toBe("★★★");
  });

  it("clamps to max 5", () => {
    expect(stars(7)).toBe("★★★★★");
  });

  it("clamps to min 0", () => {
    expect(stars(-1)).toBe("");
  });

  it("handles null/undefined as 0", () => {
    expect(stars(null)).toBe("");
  });
});

describe("makeCartId", () => {
  it("combines type and id with underscore", () => {
    expect(makeCartId("hotel", "abc123")).toBe("hotel_abc123");
  });
});

describe("priceRangeNum", () => {
  it("maps $ → 15", () =>     { expect(priceRangeNum("$")).toBe(15); });
  it("maps $$ → 40", () =>    { expect(priceRangeNum("$$")).toBe(40); });
  it("maps $$$ → 85", () =>   { expect(priceRangeNum("$$$")).toBe(85); });
  it("maps $$$$ → 160", () => { expect(priceRangeNum("$$$$")).toBe(160); });
  it("returns 0 for unknown", () => { expect(priceRangeNum("€")).toBe(0); });
  it("returns 0 for null", () => { expect(priceRangeNum(null)).toBe(0); });
});

describe("debounce", () => {
  it("delays execution", async () => {
    let called = false;
    const fn = debounce(() => { called = true; }, 50);
    fn();
    expect(called).toBe(false);
    await new Promise(r => setTimeout(r, 100));
    expect(called).toBe(true);
  });

  it("cancels previous pending call", async () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 50);
    fn();
    fn();
    fn();
    await new Promise(r => setTimeout(r, 100));
    expect(count).toBe(1);
  });
});
