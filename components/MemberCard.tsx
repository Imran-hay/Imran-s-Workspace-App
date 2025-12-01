
"use client";
import {  useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

import { toast } from "sonner";
import { 
  IconDotsVertical, 
  IconMail, 
  IconCalendar,
  IconCrown,
  IconUser,
  IconTrash
} from "@tabler/icons-react";
import { teamService } from "@/lib/services/team-services";


export function MemberCard({ 
  member, 
  organizationId, 
  currentUserRole,
  currentUserId 
}: { 
  member: any;
  organizationId: string;
  currentUserRole: 'owner' | 'member';
  currentUserId?: string;
}) {
  const queryClient = useQueryClient();

  const revokeMutation = useMutation({
    mutationFn: () => teamService.revokeMembership(organizationId, member.memberId),
     onMutate: () => {
       toast.info("Removing ....");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers', organizationId] });
      toast.success("Member removed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove member");
    }
  });

  const handleRevoke = () => {
    if (confirm(`Are you sure you want to remove ${member.name || member.email} from the team?`)) {
      revokeMutation.mutate();
    }
  };

 

  const isCurrentUser = member.id === currentUserId;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
           
            <div className="flex-1 space-y-1">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">
                  {member.name || member.email}
                  {isCurrentUser && " (You)"}
                </p>
                <div className="flex items-center space-x-2">
                  {member.role === 'owner' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <IconCrown className="h-3 w-3" />
                      Owner
                    </Badge>
                  )}
                  {member.role === 'member' && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <IconUser className="h-3 w-3" />
                      Member
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <IconMail className="h-3 w-3" />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <IconCalendar className="h-3 w-3" />
                  <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {currentUserRole === 'owner' && !isCurrentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={revokeMutation.isPending}>
                  <IconDotsVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={handleRevoke}
                  className="text-destructive"
                  disabled={revokeMutation.isPending}
                >
                  <IconTrash className="h-4 w-4 mr-2" />
                  {revokeMutation.isPending ? "Removing..." : "Remove from team"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
