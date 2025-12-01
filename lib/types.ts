import { z } from "zod";

export interface TeamMember  {
  id: string;
  email: string;
  name?: string;
  role: "owner" | "member";
  joinedAt: Date;
  status: "active" | "pending";
};



export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  createdAt?: Date;
  updatedAt?: Date;

}

export interface OrganizationMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'member';
  status: 'active' | 'pending';
  joinedAt: Date;
}

export interface InvitationData {
  id: string;
  organization: {
    id: string;
    name?: string;
    slug?: string;
    logo?: string;
  };
  inviter: {
    user: {
      name?: string;
      email?: string;
      image?: string;
      id?: string;
    };
  };
  email: string;
  role: 'owner' | 'member';
  status:string;
  createdAt?: Date;
  expiresAt?: Date;
}


export const outlineSchema = z.object({
  id: z.string(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Outline = z.infer<typeof outlineSchema>;

export interface OutlinesResponse {
  outlines: Outline[];
  error?: string;
}

