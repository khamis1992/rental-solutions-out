
import { lazy } from "react";

import { Shell } from "@/components/shells";

export const routes = [
  {
    path: "/email-test",
    element: lazy(() => import("@/pages/EmailTest")),
    name: "Email Test",
  },
] as const;

export const publicRoutes = [];
