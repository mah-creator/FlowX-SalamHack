import { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  active?: boolean;
}

export type AccountType = "Individual" | "Business";

export interface User {
  fullName: string;
  email: string;
  accountType: AccountType;
  verified: boolean;
}
