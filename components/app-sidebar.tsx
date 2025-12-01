"use client"
import * as React from "react"
import { useParams, usePathname} from "next/navigation"
import {
  Bot,
  SquareTerminal,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { TeamMember } from "@/lib/types"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  teamMembers?: TeamMember[];
  organizationId?: string;
}

export function AppSidebar({ teamMembers = [], organizationId, ...props }: AppSidebarProps) {
  const params = useParams()
  const pathname = usePathname()
  const orgId = params.id as string
  const navItems = [
    {
      title: "Table",
      url: `/organizations/${orgId}/table`,
      icon: SquareTerminal,
      isActive: pathname === `/organizations/${orgId}/table`,
    },
    {
      title: "Team Info / Setup",
      url: `/organizations/${orgId}/team`,
      icon: Bot,
      isActive: pathname === `/organizations/${orgId}/team`,
    },
  ]

  const teamsData = [
    {
      name: `${organizationId || ""} Organization`,
      logo: Users,
      plan: "Team workspace",
      members: teamMembers.map(member => ({
        name: member.name || "",
        role: member.role,
        isOwner: member.role === 'owner'
      }))
    }
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teamsData} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  )
}