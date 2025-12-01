import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import prisma from "./prisma";
import { resend } from "@/app/helpers/resend";
import { sendOrganizationInvitation } from "./email";




export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", 
  }),


   emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 20,
    requireEmailVerification: true, 
  },

   session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  organization: {
    enabled: true,
    roles: ["owner", "member"],
    defaultRole: "member",
  },

  emailVerification: {
    sendOnSignUp: true, 
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
      from: "Workspace <info@minatechnologies.com>",
        to: user.email, 
        subject: "Email Verification", 
        html: `Click the link to verify your email: ${url}`, 
      
      });
    },
  },






  plugins: [
    organization({

         async sendInvitationEmail(data) {
        const inviteLink = `${process.env.BETTER_AUTH_URL}/join-organization/${data.id}`;
        sendOrganizationInvitation({
          email: data.email,
          invitedByUsername: data.inviter.user.name,
          invitedByEmail: data.inviter.user.email,
          teamName: data.organization.name,
          inviteLink,
        });
      },

     
    
      inviteMember: {
        enabled: true,
     
      },
      allowUserToCreateOrganization: true,
      requireInviteToJoin: true,
    }),

  ],


});


export type Auth = typeof auth;
