import { describe, expect, it } from "vitest";
import { TimeEntry } from "../features/schedule/domain/entities/time-entry.entity";
import { LocationVO } from "../features/schedule/domain/value-objects/location.vo";

const schedule = new TimeEntry({
  id: "schedule-1",
  date: "2026-02-19",
  sehri: "04:30",
  iftar: "18:15",
  location: " Dhaka ",
});

describe("TimeEntry", () => {
  it("normalizes its location and preserves stored values", () => {
    expect(schedule.toDTO()).toEqual({
      id: "schedule-1",
      date: "2026-02-19",
      sehri: "04:30",
      iftar: "18:15",
      location: "Dhaka",
    });
  });

  it("formats stored times for display", () => {
    expect(schedule.toFormattedDTO()).toMatchObject({
      sehri: "4:30 AM",
      iftar: "6:15 PM",
    });
  });

  it("evaluates Sehri and Iftar boundaries", () => {
    expect(schedule.isSehriPassed(new Date(2026, 1, 19, 4, 29))).toBe(false);
    expect(schedule.isSehriPassed(new Date(2026, 1, 19, 4, 30))).toBe(true);
    expect(schedule.isIftarPassed(new Date(2026, 1, 19, 18, 14))).toBe(false);
    expect(schedule.isIftarPassed(new Date(2026, 1, 19, 18, 15))).toBe(true);
  });
});

describe("LocationVO", () => {
  it("represents an empty location as all locations", () => {
    const location = LocationVO.create("   ");

    expect(location.isEmpty()).toBe(true);
    expect(location.displayName).toBe("All Locations");
    expect(location.toJSON()).toBeNull();
  });

  it("compares normalized location values", () => {
    const location = LocationVO.create("Rangpur");

    expect(location.matches(" Rangpur ")).toBe(true);
    expect(location.equals(LocationVO.create("Rangpur"))).toBe(true);
  });
});
