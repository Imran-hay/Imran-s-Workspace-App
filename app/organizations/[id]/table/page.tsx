"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { DataTable } from "@/components/data-table";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { outlineService } from "@/lib/services/outline-services";
import { teamService } from "@/lib/services/team-services";
import { organizationService } from "@/lib/services/organization-services";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/protected-route";

 function TablePageContent() {
  const params = useParams();
  const organizationId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();


  const {
    data: outlinesData,
    isLoading: isLoadingOutlines,
    isError: isErrorOutlines
  } = useQuery({
    queryKey: ['outlines', organizationId],
    queryFn: () => outlineService.getOutlines(organizationId),
    enabled: !!organizationId,
  });


    const {
    data: organizationData,
    isLoading: isLoadingOrganization,
    isError: isErrorOrganization
  } = useQuery({
    queryKey: ['organizations', organizationId],
    queryFn: () => organizationService.getOrganization(organizationId),
    enabled: !!organizationId,
  });


  // Fetch team members
  const {
    data: teamMembers = [],
    isLoading: isLoadingTeamMembers,
    isError: isErrorTeamMembers
  } = useQuery({
    queryKey: ['teamMembers', organizationId],
    queryFn: () => teamService.getTeamMembers(organizationId),
    enabled: !!organizationId,
  });


  const outlines = outlinesData?.outlines || [];

  const createOutlineMutation = useMutation({
    mutationFn: (outlineData: {
      header: string;
      sectionType: string;
      status: string;
      target: number;
      limit: number;
      reviewer: string;
    }) => outlineService.createOutline(organizationId, outlineData),
    onMutate: () => {
      setLoading(true);
       toast.info("Creating outline ....");
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['outlines'] });
      toast.success("Outline created successfully");
      setLoading(false);
    },
    onError: (error: any) => {
      console.error('Error creating outline:', error);
      toast.error('Failed to create outline');
      setLoading(false);
    }
  });

  const handleOutlineCreated = async (outlineData: {
    header: string;
    sectionType: string;
    status: string;
    target: number;
    limit: number;
    reviewer: string;
  }) => {
    await createOutlineMutation.mutateAsync(outlineData);
  };

  useEffect(() => {
    if (isErrorOutlines) {
      toast.error("Failed to load outlines");
    }
    if (isErrorTeamMembers) {
      toast.error("Failed to load team members");
    }
  }, [isErrorOutlines, isErrorTeamMembers]);

  if (isLoadingOutlines || isLoadingTeamMembers) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error && outlines.length === 0) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-destructive mb-2">Failed to load data</p>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

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
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <DataTable 
                data={outlines} 
                onOutlineCreated={handleOutlineCreated}
                organizationId={organizationId} 
              
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function TablePage() {
  return (
    <ProtectedRoute>
      <TablePageContent />
    </ProtectedRoute>
  );
}