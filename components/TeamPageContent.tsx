
"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { 
IconUser,
} from "@tabler/icons-react";
import { teamService } from "@/lib/services/team-services";
import { getSession } from "@/lib/auth-client";
import { SidebarInset } from "@/components/ui/sidebar";
import { organizationService } from "@/lib/services/organization-services";
import { InviteMemberDialog } from "./InviteMember";
import { MemberCard } from "./MemberCard";

export function TeamPageContent({ organizationId }: { organizationId: string }) {
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: () => getSession(),
    staleTime: 1000 * 60 * 30,
  });

  const { data: organization, isLoading: orgLoading, error: orgError } = useQuery({
    queryKey: ['organization', organizationId],
    queryFn: () => organizationService.getOrganization(organizationId),
  });

  const { data: teamMembers, isLoading: membersLoading } = useQuery({
    queryKey: ['teamMembers', organizationId],
    queryFn: () => teamService.getTeamMembers(organizationId),
  });

  const { data: currentUserRole, isLoading: roleLoading } = useQuery({
    queryKey: ['currentUserRole', organizationId],
    queryFn: () => teamService.getCurrentUserRole(organizationId),
    enabled: !!organizationId && !!session?.data?.user?.id,
  });

  const { data: canManageTeam } = useQuery({
    queryKey: ['canManageTeam', organizationId, session?.data?.user?.id],
    queryFn: () => teamService.isUserOrganizationOwner(organizationId, session?.data?.user?.id!),
    enabled: !!organizationId && !!session?.data?.user?.id,
  });

  if (orgLoading || membersLoading || roleLoading) {
    return (
      <SidebarInset>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </SidebarInset>
    );
  }

  if (orgError) {
    return (
      <SidebarInset>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-destructive">Error loading organization</p>
              <p className="text-sm text-muted-foreground mt-2">{orgError.message}</p>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    );
  }

  if (!organization) {
    return (
      <SidebarInset>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Organization not found</p>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{organization.name} Organization</h1>
            {canManageTeam && (
              <p className="text-muted-foreground">
                Manage your organization members and their permissions
              </p>
            )}
          </div>
          {canManageTeam && <InviteMemberDialog organizationId={organizationId} />}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              {teamMembers?.length || 0} member{teamMembers?.length !== 1 ? 's' : ''} in this organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers && teamMembers.length > 0 ? (
                teamMembers.map((member: any) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    organizationId={organizationId}
                    currentUserRole={currentUserRole || 'member'}
                    currentUserId={session?.data?.user?.id}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <IconUser className="h-12 w-12  mx-auto mb-4" />
                  <p className="text-muted-foreground">No team members yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  );
}