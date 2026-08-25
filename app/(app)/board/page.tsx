import type { Metadata } from "next";

import { TaskBoard } from "@/components/tasks/TaskBoard";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Board | Workbench",
};

export default function BoardPage() {
  return (
    <main className="bg-blueprint flex-1">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Board
            </h1>
            <p className="mt-1 font-body text-sm text-slate">
              Every task is a numbered work order. Move it right as the work
              moves forward.
            </p>
          </div>
          <Button variant="primary" size="md">
            New ticket
          </Button>
        </div>

        {/* Scaffold: no data layer yet, so all three columns render empty. */}
        <TaskBoard tasks={[]} />
      </div>
    </main>
  );
}
