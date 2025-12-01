"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProtectedRoute } from "@/components/protected-route";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { organizationService } from "@/lib/services/organization-services";

function CreateOrganizationContent() {
  const [organizationName, setOrganizationName] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

const generatedSlug = useMemo(() => {
  if (!organizationName.trim()) return "";
  
  return organizationName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') 
    .replace(/\s+/g, '-')         
   

}, [organizationName]);
  const finalSlug =generatedSlug;

  const createOrganizationMutation = useMutation({
    mutationFn: async (organizationData: { name: string; slug: string }) => {
      const data = await organizationService.createOrganization(organizationData);
      
      if (!data) {
        throw new Error("Failed to create organization");
      }
      
      return data;
    },
    onMutate: () => {
      toast.loading("Creating organization...");
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.dismiss();
      toast.success("Organization created successfully!");
      
      if (data?.id) {
        setTimeout(()=>{
                 router.push(`/organizations/${data.id}/table`);

        },2000)
      
 
  
      } else {
        router.push("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast.dismiss();
      toast.error(error.message || "Failed to create organization");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizationName.trim()) {
      toast.error("Organization name is required");
      return;
    }

    if (!finalSlug) {
      toast.error("Please enter a valid organization slug");
      return;
    }

    await createOrganizationMutation.mutateAsync({
      name: organizationName.trim(),
      slug: finalSlug,
    });
  };



  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Organization</CardTitle>
          <CardDescription>
            Create a new organization to start managing your outlines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name *</Label>
              <Input
                id="organizationName"
                type="text"
                placeholder="Enter organization name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                required
                minLength={2}
                maxLength={50}
                disabled={createOrganizationMutation.isPending}
              />
           
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={
                createOrganizationMutation.isPending || 
                !organizationName.trim() ||
                !finalSlug
              }
            >
              {createOrganizationMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Creating Organization...
                </>
              ) : (
                "Create Organization"
              )}
            </Button>

          
            {createOrganizationMutation.isError && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>
                  {createOrganizationMutation.error?.message}
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CreateOrganization() {
  return (
    <ProtectedRoute>
      <CreateOrganizationContent />
    </ProtectedRoute>
  );
}