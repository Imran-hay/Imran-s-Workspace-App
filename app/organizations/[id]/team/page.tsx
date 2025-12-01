"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { teamService } from "@/lib/services/team-services";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
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