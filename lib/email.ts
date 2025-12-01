import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrganizationInvitation({
  email,
  invitedByUsername,
  invitedByEmail,
  teamName,
  inviteLink,
}: {
  email: string;
  invitedByUsername: string;
  invitedByEmail: string;
  teamName: string;
  inviteLink: string;
}) {
  const { error } = await resend.emails.send({
    from: "Workspace <info@minatechnologies.com>", 
    to: email,
    subject: `You've been invited to join ${teamName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #111827;">You're invited to join <strong>${teamName}</strong></h2>
        <p style="color: #374151; font-size: 16px;">
          ${invitedByUsername} <span style="color: #6b7280;">(${invitedByEmail})</span> has invited you to collaborate on <strong>${teamName}</strong>.
        </p>
        <div style="margin: 32px 0; text-align: center;">
          <a href="${inviteLink}" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; font-weight: bold;">
            View Invitation
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          If you weren't expecting this invitation, you can safely ignore this email.
        </p>
        <hr style="margin: 32px 0; border: 0; border-top: 1px solid #e5e7eb;" />
        <p style="color: #9ca3af; font-size: 12px;">
          This invitation was sent from Imran's Workspace App.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error("Failed to send invitation email");
  }
}