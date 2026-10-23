"use client";

import { useState } from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupActions,
  SidebarGroupAction,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  type SidebarProps,
} from "src/components/ui/sidebar";
import { Tooltip } from "src/components/ui/tooltip";
import { DropdownMenu, DropdownTrigger, DropdownContent } from "src/components/ui/dropdown";
import { MenuItem } from "src/components/ui/menu-item";
import { useIcons } from "src/lib/icon-context";
import { SidebarUserFooter } from "src/components/sidebar-app/user-footer";
import { SidebarSearchField } from "src/components/sidebar-app/search-field";
import { Card, CardMedia, CardHeader, CardTitle, CardDescription, CardGroup } from "src/components/ui/card";
import { surfaceClasses, surfaceHoverClasses } from "src/lib/surface-classes";
import { useSurface } from "src/lib/surface-context";
import { AnimatePresence, motion as m } from "motion/react";
import { spring } from "src/lib/springs";
import { NAV_SECTIONS } from "src/components/sidebar-preset/nav-data";

const CALLOUTS = [
  { id: 1, title: "Aurora 2 is here", desc: "Longer context, faster agents" },
  { id: 2, title: "New workspace roles", desc: "Owner, editor, viewer" },
  { id: 3, title: "Dark mode shipped", desc: "Follows your system" },
];

export function AppSidebar(props: Omit<SidebarProps, "children">) {
  const [active, setActive] = useState("Home");
  const [callouts, setCallouts] = useState(CALLOUTS);
  const dismiss = (id: number) => setCallouts((c) => c.filter((x) => x.id !== id));
  // The callout rests one surface step above the rail.
  const level = Math.min(useSurface() + 1, 8);
  const [expanded, setExpanded] = useState(false);
  // Front card's measured height — never an animated "auto".
  const [cardH, setCardH] = useState(64);
  const collapsedH = cardH + Math.min(callouts.length - 1, 2) * 12;
  const expandedH = callouts.length * cardH + (callouts.length - 1) * 4;
  const icons = useIcons();
  const PlusIcon = icons.plus;
  const UserIcon = icons.user;
  const SettingsIcon = icons.settings;
  const ArrowLeftIcon = icons["arrow-left"];
  const FooterSettingsIcon = icons.settings;
  const CalloutIcon = icons["panel-left"];

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {/* search + action rows are ONE block on the menu rows' rhythm */}
        <div className="flex flex-col gap-0.5">
          <SidebarSearchField />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {NAV_SECTIONS.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupActions>
              <Tooltip content="Add item" side="top">
                <SidebarGroupAction aria-label="Add item">
                  <PlusIcon />
                </SidebarGroupAction>
              </Tooltip>
            </SidebarGroupActions>
            <SidebarMenu>
              {section.items.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    icon={icons[item.icon]}
                    isActive={item.label === active}
                    onClick={() => setActive(item.label)}
                  >
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        {/* sonner-style pile: cards peek 12px apiece behind the front one,
            scaling 0.05 a step, two peeks max; hover fans it out */}
        <m.div className="relative"
          animate={{ height: expanded ? expandedH : collapsedH }}
          transition={{ ...spring.moderate, bounce: 0 }}
          onMouseEnter={() => setExpanded(true)} onMouseLeave={() => setExpanded(false)}
        >
          <AnimatePresence initial={false}>
            {callouts.map((c, i) => (
              <m.div key={c.id} className="absolute inset-x-0 bottom-0"
                style={{ transformOrigin: "bottom center", zIndex: 100 - i }}
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={expanded
                  ? { y: -i * (cardH + 4), scale: 1, opacity: 1 }
                  : { y: -Math.min(i, 2) * 12, scale: 1 - Math.min(i, 2) * 0.05,
                      opacity: i <= 2 ? 1 : 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
                transition={spring.moderate}
                ref={i === 0 ? (el) => { if (el) setCardH(el.offsetHeight); } : undefined}
              >
                <CardGroup orientation="inline" fluidHover={false}>
                  <Card size="compact" dismissible onDismiss={() => dismiss(c.id)}
                  label="Aurora 2 is here — longer context, faster agents"
                  className={`rounded-xl overflow-hidden min-h-0 transition-[background-color,box-shadow]
                    duration-80 ${surfaceClasses(level, 2)} ${surfaceHoverClasses(level + 1, 3)}
                    shadow-[var(--shadow-2-inset)] hover:shadow-[var(--shadow-3-inset)] pl-2.5`}
                  >
                  <CardMedia icon={CalloutIcon} size={18} className="[&_svg]:text-[#6B97FF]" />
                  <CardHeader className="gap-[2px] py-3">
                    <CardTitle className="truncate">{c.title}</CardTitle>
                    <CardDescription className="truncate text-[length:var(--fs-caption,12px)] leading-[var(--lh-caption,16px)]">{c.desc}</CardDescription>
                  </CardHeader>
                  </Card>
                </CardGroup>
              </m.div>
            ))}
          </AnimatePresence>
        </m.div>
        {/* vertical: actions stack above the user row */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton icon={FooterSettingsIcon}>Settings</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarUserFooter
          name="Jane Doe"
          avatar={
            <span className="flex size-5 items-center justify-center rounded-full bg-muted-foreground text-[10px] text-background">
              J
            </span>
          }
          menu={
            <>
              <MenuItem index={0} icon={UserIcon} label="Profile" onSelect={() => {}} />
              <MenuItem index={1} icon={SettingsIcon} label="Settings" onSelect={() => {}} />
              <MenuItem index={2} icon={ArrowLeftIcon} label="Log out" onSelect={() => {}} />
            </>
          }
        />
      </SidebarFooter>
    </Sidebar>
  );
}
