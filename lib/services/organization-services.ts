
import { organization } from "@/lib/auth-client";
import { Organization } from "../types";

export interface OrganizationInvitation {
  id: string;
  email: string;
  role: 'owner' | 'member';
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  invitedBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt?: Date;
  expiresAt?: Date;
}

export const organizationService = {
 
  async getOrganization(orgId: string): Promise<Organization> {
    const { data, error } = await organization.getFullOrganization({
      query:{
        organizationId: orgId
      }
    });

    if (error) {
      throw new Error(`Failed to fetch organization: ${error.message}`);
    }

    if (!data) {
      throw new Error('Organization not found');
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      logo: data.logo || undefined,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    };
  },


  async getUserOrganizations(): Promise<Organization[]> {
    const { data, error } = await organization.list();

    if (error) {
      throw new Error(`Failed to fetch organizations: ${error.message}`);
    }

    return (data || []).map(org => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      logo: org.logo || undefined,
      createdAt: org.createdAt ? new Date(org.createdAt) : undefined,
      metadata: org.metadata
    }));
  },


  async createOrganization(data: {
    name: string;
    slug: string;
  }): Promise<Organization> {
    const { data: org, error } = await organization.create(data);

    if (error) {
      throw new Error(`Failed to create organization: ${error.message}`);
    }

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      logo: org.logo || undefined,
      createdAt: org.createdAt ? new Date(org.createdAt) : undefined,
    };
  },

  

  async deleteOrganization(orgId: string): Promise<void> {
    const { error } = await organization.delete({
      organizationId: orgId
    });

    if (error) {
      throw new Error(`Failed to delete organization: ${error.message}`);
    }
  },

  
};

