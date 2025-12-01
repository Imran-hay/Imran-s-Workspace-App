
import { organization } from "@/lib/auth-client";

import { InvitationData } from "../types";

export const invitationService = {

  async getInvitation(inviteId: string): Promise<InvitationData> {
    const { data: invitations, error } = await organization.listUserInvitations();

    
    if (error) {
      throw new Error(`Failed to fetch invitations: ${error.message}`);
    }

    const invitation = invitations?.find(inv => inv.id === inviteId);
    
    
    if (invitation) {
      
      const { data: orgData } = await organization.getFullOrganization({
        query:{
        organizationId: invitation.organizationId
        }
 
    });

      let inviterData = { id: invitation.inviterId || 'Unknown' };
    

      return {
        id: invitation.id,
        organization: {
          id: invitation.organizationId,
          name: orgData?.name,
          slug: orgData?.slug,
          logo: orgData?.logo!,
        },
        inviter: {
          user: inviterData
        },
        email: invitation.email,
        role: invitation.role as 'owner' | 'member',
        status: invitation.status,
        createdAt: new Date(invitation.createdAt),
        expiresAt: invitation.expiresAt ? new Date(invitation.expiresAt) : undefined,
      };
    }

    throw new Error('Invitation not found or has expired');
  },

 
  async acceptInvitation(inviteId: string): Promise<{ organizationId: string }> {
    const { data, error } = await organization.acceptInvitation({
      invitationId: inviteId,
    });

    if (error) {
      throw new Error(`Failed to accept invitation: ${error.message}`);
    }

    return {
      organizationId: data?.member?.organizationId,
    };
  },

 
  async rejectInvitation(inviteId: string): Promise<void> {
    const { error } = await organization.rejectInvitation({
      invitationId: inviteId,
    });

    if (error) {
      throw new Error(`Failed to reject invitation: ${error.message}`);
    }
  },




  async revokeInvitation(inviteId: string): Promise<void> {
    const { error } = await organization.cancelInvitation({
      invitationId: inviteId,
    });

    if (error) {
      throw new Error(`Failed to revoke invitation: ${error.message}`);
    }
  },

 

};