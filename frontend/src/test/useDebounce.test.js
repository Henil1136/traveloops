/**
 * useDebounce.test.js
 * Tests the debounce hook in isolation using Vitest fake timers.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../hooks/useDebounce";

describe("useDebounce", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("does NOT update before the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } }
    );
    rerender({ value: "ab" });
    // Only 100ms have passed
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe("a"); // still old value
  });

  it("updates after the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } }
    );
    rerender({ value: "ab" });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("ab");
  });

  it("resets the timer on rapid input (batches to final value)", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "" } }
    );
    // Simulate fast typing
    rerender({ value: "P" });
    act(() => vi.advanceTimersByTime(100));
    rerender({ value: "Pa" });
    act(() => vi.advanceTimersByTime(100));
    rerender({ value: "Par" });
    act(() => vi.advanceTimersByTime(100));
    rerender({ value: "Pari" });
    act(() => vi.advanceTimersByTime(100));
    rerender({ value: "Paris" });

    // Still haven't waited full 300ms after last change
    expect(result.current).toBe("");

    // Now wait the full delay
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("Paris");
  });
});
