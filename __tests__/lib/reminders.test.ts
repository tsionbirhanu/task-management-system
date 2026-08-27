import { describe, expect, it } from "vitest";

import {
  getReminderTasks,
  isTaskOverdue,
  parseDueDate,
  summarizeReminders,
} from "@/lib/reminders";
import type { Task } from "@/lib/types";

const now = new Date("2026-08-27T09:00:00.000Z");

function task(overrides: Partial<Task>): Task {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    user_id: "user_1",
    ticket_no: 1,
    title: "Ticket",
    description: null,
    status: "todo",
    priority: "medium",
    due_date: null,
    position: 0,
    created_at: "2026-08-27T08:00:00.000Z",
    updated_at: "2026-08-27T08:00:00.000Z",
    ...overrides,
  };
}

describe("reminders", () => {
  it("separates overdue and due-soon open tasks", () => {
    const result = getReminderTasks(
      [
        task({
          id: "00000000-0000-0000-0000-000000000001",
          due_date: "2026-08-27T08:00:00.000Z",
        }),
        task({
          id: "00000000-0000-0000-0000-000000000002",
          due_date: "2026-08-27T12:00:00.000Z",
        }),
        task({
          id: "00000000-0000-0000-0000-000000000003",
          due_date: "2026-08-29T12:00:00.000Z",
        }),
      ],
      now,
    );

    expect(result.overdue).toHaveLength(1);
    expect(result.dueSoon).toHaveLength(1);
  });

  it("does not count done tasks as reminders", () => {
    expect(
      summarizeReminders([
        task({ status: "done", due_date: "2026-08-27T08:00:00.000Z" }),
        task({ status: "done", due_date: "2026-08-27T12:00:00.000Z" }),
      ]),
    ).toEqual({ overdue: 0, dueSoon: 0 });
  });

  it("ignores invalid and missing due dates", () => {
    expect(parseDueDate("not-a-date")).toBeNull();
    expect(parseDueDate(null)).toBeNull();

    expect(
      summarizeReminders([
        task({ due_date: null }),
        task({ due_date: "not-a-date" }),
      ]),
    ).toEqual({ overdue: 0, dueSoon: 0 });
  });

  it("treats a task due exactly now as due soon, not overdue", () => {
    const dueNow = task({ due_date: now.toISOString() });

    expect(isTaskOverdue(dueNow, now)).toBe(false);
    expect(getReminderTasks([dueNow], now)).toMatchObject({
      overdue: [],
      dueSoon: [dueNow],
    });
  });
});
