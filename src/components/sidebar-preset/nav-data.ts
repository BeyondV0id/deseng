import { type IconName } from "src/lib/icon-context";

export interface NavItem {
  label: string;
  /** Key into the icon context (lucide by default). */
  icon: IconName;
  badge?: string;
  active?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Platform",
    items: [
    { label: "Home", icon: "star", active: true },
    { label: "Inbox", icon: "users" },
    { label: "Calendar", icon: "settings" },
    ],
  },
  {
    label: "Workspace",
    items: [
    { label: "Notifications", icon: "moon" },
    { label: "Members", icon: "user" },
    ],
  },
];
