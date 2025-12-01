"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/protected-route";
import { getSession, organization } from "@/lib/auth-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationService } from "@/lib/services/organization-services";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
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
  IconTrash, 
  IconSettings,
  IconAlertTriangle
} from "@tabler/icons-react";
import { teamService } from "@/lib/services/team-services";

import { Organization } from "@/lib/types";

function DeleteOrganizationDialog({ 
  organization, 
 
}: { 
  organization: Organization;

}) {
  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => organizationService.deleteOrganization(organization.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success("Organization deleted successfully");
      setOpen(false);
      setConfirmName("");

    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete organization");
    }
  });

  const handleDelete = () => {
    if (confirmName !== organization.name) {
      toast.error("Organization name does not match");
      return;
    }
    deleteMutation.mutate();
  };

  const isConfirmed = confirmName === organization.name;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem 
          onSelect={(e) => e.preventDefault()}
          className="text-destructive focus:text-destructive"
        >
          <IconTrash className="w-4 h-4 mr-2" />
          Delete Organization
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconAlertTriangle className="h-5 w-5 text-destructive" />
            Delete Organization
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the organization 
            <strong> "{organization.name}"</strong> and all associated data including outlines, team members, and settings.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirmName">
              Type <span className="font-mono font-semibold">{organization.name}</span> to confirm:
            </Label>
            <Input
              id="confirmName"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder="Enter organization name"
              disabled={deleteMutation.isPending}
            />
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Deleting...
              </>
            ) : (
              "Delete Organization"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OrganizationCard({ organization }: { organization: Organization }) {
  const router = useRouter();
  const queryClient = useQueryClient();





  

    const { data: session } = useQuery({
      queryKey: ['session'],
      queryFn: () => getSession(),
      staleTime: 1000 * 60 * 30, // 30 minutes
    });

    const { data: canManageTeam, isLoading: canManageLoading } = useQuery({
      queryKey: ['canManageTeam', organization.id, session?.data?.user?.id],
      queryFn: () => teamService.isUserOrganizationOwner(organization.id, session?.data?.user?.id!),
      enabled: !!session?.data?.user?.id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  

  return (
    <Card 
      key={organization.id} 
      className="cursor-pointer hover:shadow-lg transition-shadow group relative"
  
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl">{organization.name}</CardTitle>
            <CardDescription>
              {organization.slug}
            </CardDescription>
          </div>
          {
            canManageTeam && !canManageLoading && (
                 <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <IconDotsVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
          
            
              <DeleteOrganizationDialog 
                organization={organization} 
           
              />
            </DropdownMenuContent>
          </DropdownMenu>

            )
          }
       
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Created {new Date(organization?.createdAt!).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2">
        
            <Button variant="outline" size="sm" onClick={() =>  router.push(`/organizations/${organization.id}/table`)}>
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: organizations = [],
    isLoading,
    isError,
    error: queryError
  } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const data = await organizationService.getUserOrganizations();
      
      if (!data) {
        throw new Error("Failed to load organizations");
      }
      
      return data || [];
    },
    retry: 1,
  });



  const handleCreateOrganization = () => {
    router.push("/create-organization");
  };

  useEffect(() => {
    if (isError && queryError) {
      setError(queryError instanceof Error ? queryError.message : "Failed to load organizations");
    }
  }, [isError, queryError]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your organizations and outlines</p>
          </div>
          <Button onClick={handleCreateOrganization}>
            + Create Organization
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Organizations Grid */}
        {organizations.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">No organizations yet</h3>
                <p className="text-gray-500 mt-2 mb-6">
                  Create your first organization to start managing outlines
                </p>
                <Button onClick={handleCreateOrganization}>
                  Create Your First Organization
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                {organizations.length} organization{organizations.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.map((org) => (
                <OrganizationCard key={org.id} organization={org} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}