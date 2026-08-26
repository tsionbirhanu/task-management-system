import type { Metadata } from "next";

import { TaskBoardClient } from "@/components/tasks/TaskBoardClient";
import { getCurrentUser, isAuthConfigured } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Board | Workbench",
};

export default async function BoardPage() {
  const user = isAuthConfigured() ? await getCurrentUser() : null;

  return <TaskBoardClient email={user?.email ?? null} />;
}
