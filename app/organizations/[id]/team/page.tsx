"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  IconDotsVertical, 
  IconMail, 
  IconUserPlus, 
  IconCalendar,
  IconCrown,
  IconUser,
  IconTrash
} from "@tabler/icons-react";
import { teamService } from "@/lib/services/team-services";
import { getSession } from "@/lib/auth-client";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { organizationService } from "@/lib/services/organization-services";
import { ProtectedRoute } from "@/components/protected-route";
import { TeamPageContent } from "@/components/TeamPageContent";




function TeamPageWrapper() {
  const params = useParams();
  const organizationId = params.id as string;

  const { data: organizationData } = useQuery({
    queryKey: ['organizations', organizationId],
    queryFn: () => organizationService.getOrganization(organizationId),
    enabled: !!organizationId,
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers', organizationId],
    queryFn: () => teamService.getTeamMembers(organizationId),
    enabled: !!organizationId,
  });

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar 
        variant="inset" 
        teamMembers={teamMembers} 
        organizationId={organizationData?.name}
      />
      <TeamPageContent organizationId={organizationId} />
    </SidebarProvider>
  );
}

export default function TeamPage() {
  return (
    <ProtectedRoute>
      <TeamPageWrapper />
    </ProtectedRoute>
  );
}