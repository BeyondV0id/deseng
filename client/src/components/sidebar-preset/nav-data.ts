import { collections } from "@/catalog";
import { type IconName } from "@/lib/icon-context";

export interface NavItem {
  label: string;
  /** The view this row selects in the library. */
  view: string;
  /** Key into the icon context, supplied by the app's IconProvider. */
  icon: IconName;
  badge?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

/**
 * The shelves. A shelf comes from the catalogue, so a new collection appears
 * here without a second list to keep in step.
 *
 * The order follows the work: observe, read, create, build, then the
 * components, assets, tools and the desk they run on.
 *
 * The Library group is not here: its rows are the moodboards this account has
 * created, so it is built from state in the sidebar itself.
 */
const collectionIcons: Record<string, IconName> = {
  Observe: "eye",
  Read: "book",
  Create: "paintbrush",
  Build: "rocket",
  Components: "square-library",
  Assets: "image",
  Tools: "settings",
  Desk: "monitor",
};

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Browse",
    items: [
      { label: "All resources", view: "All resources", icon: "home" },
      ...collections.map((collection) => ({
        label: collection.label,
        view: collection.id,
        icon: collectionIcons[collection.id] ?? "folder",
      })),
    ],
  },
];
