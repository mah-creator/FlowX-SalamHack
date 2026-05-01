import type { LocalAccountShortcut } from "@/features/auth/types";

export const localAccountShortcuts = [
  {
    email: "admin@flowx.demo",
    password: "admin123",
    role: "admin",
    name: "Admin User",
  },
  {
    email: "user@flowx.demo",
    password: "user123",
    role: "user",
    name: "FlowX User",
  },
] satisfies LocalAccountShortcut[];

export default localAccountShortcuts;
