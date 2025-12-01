"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { invitationService } from "@/lib/services/invitation-services";
import { getSession } from "@/lib/auth-client";
import { REDIRECT_STORAGE_KEY } from "@/lib/constants";

function JoinOrganizationContent({ inviteId }: { inviteId: string }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: () => getSession(),
  });

  useEffect(() => {
    if (!sessionLoading && !session?.data?.user) {
      const redirectUrl = `/join-organization/${inviteId}`;
      localStorage.setItem(REDIRECT_STORAGE_KEY, redirectUrl);
      router.push(`/sign-in?redirect=${encodeURIComponent(redirectUrl)}`);
    }
  }, [session, sessionLoading, router, inviteId]);

  const { data: invitation, isLoading: invitationLoading, error } = useQuery({
    queryKey: ['invitation', inviteId],
    queryFn: () => invitationService.getInvitation(inviteId),
    enabled: !!inviteId && !!session?.data?.user,
  });

  const acceptInvitationMutation = useMutation({
    mutationFn: () => invitationService.acceptInvitation(inviteId),
    onSuccess: (data) => {
      toast.success("Joined organization!");
      router.push(`/organizations/${data.organizationId}/table`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to accept");
      setIsProcessing(false);
    },
  });

  const rejectInvitationMutation = useMutation({
    mutationFn: () => invitationService.rejectInvitation(inviteId),
    onSuccess: () => {
      toast.success("Invitation declined");
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to decline");
    },
  });

  const handleAccept = () => acceptInvitationMutation.mutate();
  const handleReject = () => rejectInvitationMutation.mutate();

  if (sessionLoading || invitationLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.data?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Redirecting to sign up</CardTitle>
            <CardDescription>
              Please sign in to continue
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation is invalid or expired
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  const isExpired = new Date(invitation?.expiresAt!) < new Date();
  if (invitation.status !== 'pending' || isExpired) {
    let message = "";
    if (invitation.status === 'accepted') {
      message = `You already joined ${invitation.organization.name}`;
    } else if (isExpired) {
      message = "This invitation has expired";
    } else {
      message = "This invitation is no longer available";
    }

    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Cannot Join</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Join Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={handleAccept}
              disabled={acceptInvitationMutation.isPending}
            >
              {acceptInvitationMutation.isPending ? "Joining..." : "Accept Invitation"}
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={handleReject}
              disabled={rejectInvitationMutation.isPending}
            >
              {rejectInvitationMutation.isPending ? "Declining..." : "Decline"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function JoinOrganizationPage() {
  const params = useParams();
  const inviteId = params.inviteId as string;
  return <JoinOrganizationContent inviteId={inviteId} />;
}