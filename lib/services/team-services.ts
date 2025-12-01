
import { getSession, organization } from "@/lib/auth-client";
import { TeamMember } from '@/lib/types';

export const teamService = {



    async isUserOrganizationOwner(orgId: string, userId: string): Promise<boolean> {
    const { data, error } = await organization.listMembers({
      query: {
        organizationId: orgId,
       
    },
    });

  
    
    if (error) throw new Error(error.message);
    
    const userMember = data?.members.find(member => member.userId === userId);
    return userMember?.role === 'owner';
  },


    async getCurrentUserRole(orgId: string): Promise<'owner' | 'member'> {
   
    const session = await getSession();
    const currentUserId = session?.data?.user?.id;
    
    if (!currentUserId) return 'member';
    
    const { data: members } = await organization.listMembers({
       query: {
        organizationId: orgId,
       
    },
    });
    
    const currentUserMember = members?.members.find(member => member.userId === currentUserId);
    return currentUserMember?.role as 'owner' | 'member' || 'member';
  },



 
  async getTeamMembers(orgId: string): Promise<TeamMember[]> {
    const { data, error } = await organization.listMembers({
        query: {
        organizationId: orgId,
       
    },
    });

    if (error) throw new Error(error.message);

    return data.members.map((m: any) => ({
      id: m.user.id,
      memberId: m.id,
      email: m.user.email,
      name: m.user.name || undefined,
      role: m.role as "owner" | "member",
      avatar: m.user.image || undefined,
      joinedAt: new Date(m.createdAt),
      status: m.user.emailVerified ? "active" : "pending",
    }));
  },


  async inviteMember(
    orgId: string,
    email: string,
  ): Promise<void> {
    const { error } = await organization.inviteMember({
      organizationId: orgId,
      email,
      role: "member",
    resend: true,
    });

    if (error) throw new Error(error.message);
  },

 
  async revokeMembership(orgId: string, memberId: string): Promise<void> {
    const { error } = await organization.removeMember({
      organizationId: orgId,
      memberIdOrEmail:memberId, 
    });

    if (error) throw new Error(error.message);
  },

    async acceptInvitation(invitationId: string) {
        
    const { data, error } = await organization.acceptInvitation({
      invitationId: invitationId,
    });
    
    if (error) throw new Error(error.message);
    return data;
  },


};