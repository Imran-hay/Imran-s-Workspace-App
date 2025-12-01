"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            {item.items ? (
              <SidebarMenuButton 
                tooltip={item.title} 
                asChild
                className={item.isActive ? "bg-accent" : ""}
              >
                <div className="flex items-center cursor-pointer hover:bg-accent/50 transition-colors">
                  {item.icon && <item.icon />}
                  <span className="flex-1">{item.title}</span>
                  <ChevronRight className="ml-auto" />
                </div>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton tooltip={item.title} asChild>
                <Link 
                  href={item.url} 
                  className={`flex items-center cursor-pointer hover:bg-accent/50 ${item.isActive ? "bg-accent pointer-events-none" : ""}`}
                  onClick={(e) => item.isActive && e.preventDefault()}
                >
                  {item.icon && <item.icon />}
                  <span className="flex-1">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            )}

            {item.items && (
              <SidebarMenuSub>
                {item.items.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton asChild>
                      <Link 
                        href={subItem.url}
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={(e) => item.isActive && e.preventDefault()}
                      >
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}