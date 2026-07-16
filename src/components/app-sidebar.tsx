import { Link, useRouterState } from "@tanstack/react-router";
import { FolderLock, Sparkles, Webhook } from "lucide-react";
import estudyMark from "@/assets/estudy-mark.png.asset.json";
import estudyWordmark from "@/assets/estudy-wordmark.png.asset.json";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const nav = [
  { title: "Document Repository", url: "/", icon: FolderLock },
  { title: "Course Generator", url: "/generator", icon: Sparkles },
  { title: "n8n Integration Settings", url: "/settings", icon: Webhook },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/60 py-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
            <img src={estudyMark.url} alt="eStudy" className="h-8 w-8 object-contain" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <img
                src={estudyWordmark.url}
                alt="eStudy South Africa"
                className="h-4 w-auto object-contain brightness-0 invert"
              />
              <p className="mt-1 text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
                Orchestrator
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 py-3">
        {!collapsed ? (
          <div className="px-2 text-[10px] leading-relaxed text-sidebar-foreground/60">
            Internal use only · POPIA / FSCA aligned
          </div>
        ) : (
          <div className="mx-auto h-2 w-2 rounded-full bg-sidebar-primary" />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}