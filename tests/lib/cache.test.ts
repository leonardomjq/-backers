import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cache } from "@/lib/cache";

describe("cache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    cache.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null for non-existent key", () => {
    expect(cache.get("nonexistent")).toBeNull();
  });

  it("returns the stored value after set", () => {
    cache.set("key", "value", 5000);
    expect(cache.get("key")).toBe("value");
  });

  it("returns null after TTL expires", () => {
    cache.set("key", "value", 5000);

    // Advance time past TTL
    vi.advanceTimersByTime(5001);

    expect(cache.get("key")).toBeNull();
  });

  it("removes all entries on clear", () => {
    cache.set("key1", "value1", 5000);
    cache.set("key2", "value2", 5000);

    cache.clear();

    expect(cache.get("key1")).toBeNull();
    expect(cache.get("key2")).toBeNull();
  });

  it("returns different types (object, array, string)", () => {
    const obj = { name: "test", count: 42 };
    const arr = [1, 2, 3];
    const str = "hello";

    cache.set("obj", obj, 5000);
    cache.set("arr", arr, 5000);
    cache.set("str", str, 5000);

    expect(cache.get("obj")).toEqual({ name: "test", count: 42 });
    expect(cache.get("arr")).toEqual([1, 2, 3]);
    expect(cache.get("str")).toBe("hello");
  });
});
