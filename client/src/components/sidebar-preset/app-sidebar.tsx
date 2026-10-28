"use client";

import { useMemo } from "react";
import { ChevronRight } from "@/components/icons";
import { BrandMark } from "@/components/brand/brand-mark";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  useSidebar,
  type SidebarProps,
} from "@/components/ui/sidebar";
import { navViewFor, type Resource } from "@/catalog";
import { countLabel, countResources } from "@/lib/library-counts";
import { fontWeights } from "@/lib/font-weight";
import { useIcons } from "@/lib/icon-context";
import type { LibraryMoodboard } from "@/lib/library-types";
import { cn } from "@/lib/utils";
import { NAV_SECTIONS } from "@/components/sidebar-preset/nav-data";

/** A count is metadata, so it keeps one weight on every row; the colour marks
 *  the selected row and the pointer, and the numbers never outweigh a name. */
const countStyle = { fontVariationSettings: fontWeights.normal };

export interface AppSidebarProps
  extends Omit<SidebarProps, "children" | "onSelect"> {
  /** The view the library is showing: a collection id, `Moodboard`, a moodboard id or `Favorites`. */
  selected: string;
  onSelect: (view: string) => void;
  onNewMoodboard: () => void;
  /** The account's own moodboards, listed by name under the Library heading. */
  moodboards: LibraryMoodboard[];
  /** Every resource in the library, so each row can carry the size of its set. */
  resources: Resource[];
}

export function AppSidebar({
  selected,
  onSelect,
  onNewMoodboard,
  moodboards,
  resources,
  ...props
}: AppSidebarProps) {
  const { isMobile } = useSidebar();
  const icons = useIcons();
  /** A tag page marks the shelf it lives on rather than a row of its own. */
  const activeView = navViewFor(selected);

  // The count beside a row is the size of the set it opens, never what the
  // current search leaves of it: a shelf should read the same whether or not
  // the field above is full.
  const counts = useMemo(() => countResources(resources, moodboards), [resources, moodboards]);

  // Below md the column is not a drawer: the top bar's menu carries the same
  // destinations, so the page keeps the full width for the cards.
  if (isMobile) return null;

  return (
    <Sidebar className="app-sidebar" rail={false} bordered={false} {...props}>
      <SidebarHeader className="app-sidebar-header">
        <div className="app-sidebar-brand-row">
          <a
            className="brand app-sidebar-brand"
            href="#home"
            aria-label="desgnix home"
            onClick={(event) => {
              event.preventDefault();
              onSelect("All resources");
            }}
          >
            <BrandMark />
            <span className="app-sidebar-wordmark">desgnix<span className="brand-period">.</span></span>
          </a>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {NAV_SECTIONS.map((section) => (
          <SidebarGroup key={section.label} className="app-sidebar-group">
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarMenu>
              {section.items.map((item) => {
                const count = counts.get(item.view) ?? 0;
                return (
                  <SidebarMenuItem key={item.view}>
                    <SidebarMenuButton
                      icon={icons[item.icon]}
                      isActive={item.view === activeView}
                      onClick={() => onSelect(item.view)}
                    >
                      {item.label}
                      <span className="sr-only">{`, ${countLabel(count)}`}</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge className="app-sidebar-count" style={countStyle} aria-hidden="true">
                      {count}
                    </SidebarMenuBadge>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}

        {/* The second group is the account's own work, so it is built from
            state rather than the catalogue. Its heading row opens the shelf of
            every moodboard, each moodboard follows it by the name its owner
            gave it, and the last row creates the next one. */}
        <SidebarGroup className="app-sidebar-group">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                icon={icons["folder-open"]}
                isActive={selected === "Moodboard"}
                onClick={() => onSelect("Moodboard")}
              >
                <span className="app-sidebar-heading">Moodboards</span>
                <ChevronRight
                  size={16}
                  aria-hidden="true"
                  className={cn(
                    "ml-auto shrink-0 transition-colors",
                    selected === "Moodboard"
                      ? "text-foreground"
                      : "text-muted-foreground group-hover/menu-item:text-foreground group-focus-within/menu-item:text-foreground",
                  )}
                />
              </SidebarMenuButton>
            </SidebarMenuItem>
            {moodboards.map((moodboard) => {
              const count = counts.get(moodboard.id) ?? 0;
              return (
                <SidebarMenuItem key={moodboard.id}>
                  <SidebarMenuButton
                    icon={icons.folder}
                    isActive={moodboard.id === selected}
                    onClick={() => onSelect(moodboard.id)}
                  >
                    {moodboard.name}
                    <span className="sr-only">{`, ${countLabel(count)}`}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge className="app-sidebar-count" style={countStyle} aria-hidden="true">
                    {count}
                  </SidebarMenuBadge>
                </SidebarMenuItem>
              );
            })}
            <SidebarMenuItem>
              <SidebarMenuButton icon={icons.plus} onClick={onNewMoodboard}>
                Create moodboard
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="app-sidebar-footer">
        <div className="app-sidebar-footer-row">
          <span className="app-sidebar-copyright">© 2026</span>
          <span className="app-sidebar-info">Info</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
