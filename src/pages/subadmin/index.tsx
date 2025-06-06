import React, { useState } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  Inbox,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Menu,
  LucideIcon,
} from "lucide-react";
import ComplaintPage from "./complaintpage";
import Graph from "./graph";

// Type definitions
type MenuItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

type ActiveView = "dashboard" | "complaints" | "graphs";

function MainContent() {
  const [activeView, setActiveView] = useState<ActiveView>("complaints");
  const { open, setOpen, openMobile, setOpenMobile, isMobile } = useSidebar();

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "complaints", label: "Complaints", icon: Inbox },
    { id: "graphs", label: "Analytics", icon: BarChart2 },
  ];

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">
              Dashboard Overview
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Quick Stats
                </h3>
                <p className="text-gray-600">Overview of system performance</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Recent Activity
                </h3>
                <p className="text-gray-600">Latest system activities</p>
              </div>
            </div>
          </div>
        );
      case "complaints":
        return <ComplaintPage />;
      case "graphs":
        return <Graph />;
      default:
        return <ComplaintPage />;
    }
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      {/* Enhanced Sidebar with Shadcn Components */}
      <Sidebar
        collapsible="icon"
        className="border-r border-gray-200 transition-all duration-300 ease-in-out group/sidebar"
      >
        <SidebarHeader className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg text-gray-800 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-all duration-300 overflow-hidden whitespace-nowrap">
              Admin Panel
            </h2>
            <SidebarTrigger className="ml-auto p-1 hover:bg-gray-100 rounded transition-colors duration-200 flex-shrink-0">
              <div className="group-data-[collapsible=icon]:hidden">
                <ChevronLeft size={18} />
              </div>
              <div className="group-data-[collapsible=icon]:block hidden">
                <ChevronRight size={18} />
              </div>
            </SidebarTrigger>
          </div>
        </SidebarHeader>

        <SidebarContent className="p-2">
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:h-0 transition-all duration-300 overflow-hidden px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        className={`w-full group relative ${
                          isActive
                            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                            : ""
                        }`}
                        data-tooltip={item.label}
                      >
                        <button
                          onClick={() => setActiveView(item.id as ActiveView)}
                          className="flex items-center gap-3 p-3 rounded-md transition-all duration-200 hover:bg-gray-100 w-full text-left"
                        >
                          <Icon size={18} className="flex-shrink-0" />
                          <span className="group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-all duration-300 overflow-hidden whitespace-nowrap">
                            {item.label}
                          </span>

                          {/* Enhanced Tooltip for collapsed state */}
                          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 group-data-[collapsible=icon]:block group-data-[collapsible=false]:hidden transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            {item.label}
                          </div>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-2 border-t border-gray-200">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="w-full group relative">
                <button className="flex items-center gap-3 p-3 rounded-md transition-all duration-200 hover:bg-gray-100 w-full text-left">
                  <Settings size={18} className="flex-shrink-0" />
                  <span className="group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-all duration-300 overflow-hidden whitespace-nowrap">
                    Settings
                  </span>

                  {/* Enhanced Tooltip for collapsed state */}
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 group-data-[collapsible=icon]:block group-data-[collapsible=false]:hidden transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    Settings
                  </div>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Enhanced Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
          <SidebarTrigger className="lg:hidden p-2 hover:bg-gray-100 rounded-md transition-colors duration-200">
            <Menu size={18} />
          </SidebarTrigger>
          <h1 className="text-xl font-semibold text-gray-800 capitalize">
            {activeView === "graphs" ? "Analytics" : activeView}
          </h1>
        </div>

        {/* Content Area with Enhanced Transitions */}
        <div className="transition-all duration-300 ease-in-out min-h-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default function SubadminHome() {
  return (
    <SidebarProvider defaultOpen={true}>
      <MainContent />
    </SidebarProvider>
  );
}
