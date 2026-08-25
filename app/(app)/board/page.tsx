import type { Metadata } from "next";

import { TaskBoardClient } from "@/components/tasks/TaskBoardClient";

export const metadata: Metadata = {
  title: "Board | Workbench",
};

export default function BoardPage() {
  return <TaskBoardClient />;
}
