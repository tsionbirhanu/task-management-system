import { describe, expect, it } from "vitest";

import { taskUpdateValues } from "@/lib/api/tasks";
import { createTaskSchema, updateTaskSchema } from "@/lib/validation/task";

describe("task validation", () => {
  it("keeps create defaults for new tasks", () => {
    expect(createTaskSchema.parse({ title: "New ticket" })).toMatchObject({
      title: "New ticket",
      status: "todo",
      priority: "medium",
    });
  });

  it("does not inject create defaults into partial updates", () => {
    expect(updateTaskSchema.parse({ title: "Renamed ticket" })).toEqual({
      title: "Renamed ticket",
    });
  });

  it("keeps explicit status and priority updates", () => {
    expect(
      updateTaskSchema.parse({ status: "done", priority: "high" }),
    ).toEqual({
      status: "done",
      priority: "high",
    });
  });

  it("maps explicit nullable fields to database values", () => {
    expect(
      taskUpdateValues({
        description: null,
        due_date: null,
      }),
    ).toEqual({
      description: null,
      due_date: null,
    });
  });

  it("rejects empty updates", () => {
    expect(updateTaskSchema.safeParse({}).success).toBe(false);
  });
});
