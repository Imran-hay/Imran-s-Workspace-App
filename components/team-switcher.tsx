"use client"

import * as React from "react"
import { ChevronsUpDown, Crown, Users } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
    members?: Array<{
      name: string
      role: string
      isOwner: boolean
    }>
  }[]
}) {
  const { isMobile } = useSidebar()
  const activeTeam = teams[0]
 if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <activeTeam.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Organization
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="gap-2 p-2 cursor-default"
              onSelect={(e) => e.preventDefault()}
            >
              <div className="flex size-6 items-center justify-center rounded-md border">
                <activeTeam.logo className="size-3.5 shrink-0" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{activeTeam?.name}</div>
                <div className="text-xs text-muted-foreground">{activeTeam.plan}</div>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel className="text-muted-foreground text-xs flex items-center gap-2">
              <Users className="h-3 w-3" />
              Members ({activeTeam.members?.length || 0})
            </DropdownMenuLabel>
            
            {activeTeam.members && activeTeam.members.length > 0 ? (
              activeTeam.members.map((member, index) => (
                <DropdownMenuItem
                  key={index}
                  className="gap-2 p-2 text-xs"
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="truncate flex-1">
                      {member.name}
                    </span>
                    {member.isOwner && (
                      <Crown className="h-3 w-3 text-amber-500 shrink-0" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem 
                className="text-xs text-muted-foreground p-2"
                onSelect={(e) => e.preventDefault()}
              >
                No members
              </DropdownMenuItem>
            )}
            
          
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}