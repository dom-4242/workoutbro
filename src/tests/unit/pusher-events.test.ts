import { describe, it, expect } from "vitest";
import { getSessionChannel, PUSHER_EVENTS } from "@/lib/pusher-events";

describe("getSessionChannel", () => {
  it("returns channel name with session prefix", () => {
    expect(getSessionChannel("abc123")).toBe("session-abc123");
  });

  it("works with UUID-style IDs", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    expect(getSessionChannel(id)).toBe(`session-${id}`);
  });

  it("works with numeric ID strings", () => {
    expect(getSessionChannel("42")).toBe("session-42");
  });
});

describe("PUSHER_EVENTS", () => {
  it("has a ROUND_RELEASED event", () => {
    expect(PUSHER_EVENTS.ROUND_RELEASED).toBeDefined();
  });

  it("has a ROUND_COMPLETED event", () => {
    expect(PUSHER_EVENTS.ROUND_COMPLETED).toBeDefined();
  });

  it("has a SESSION_COMPLETED event", () => {
    expect(PUSHER_EVENTS.SESSION_COMPLETED).toBeDefined();
  });

  it("has a SESSION_CANCELLED event", () => {
    expect(PUSHER_EVENTS.SESSION_CANCELLED).toBeDefined();
  });

  it("all event names are non-empty strings", () => {
    for (const [key, value] of Object.entries(PUSHER_EVENTS)) {
      expect(typeof value, `PUSHER_EVENTS.${key} should be a string`).toBe(
        "string",
      );
      expect(
        (value as string).length,
        `PUSHER_EVENTS.${key} should not be empty`,
      ).toBeGreaterThan(0);
    }
  });
});
