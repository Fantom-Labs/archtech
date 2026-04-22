import { Resend } from "resend";

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("Defina RESEND_API_KEY");
  }
  return new Resend(key);
}

export async function sendWorkspaceInviteEmail(params: {
  to: string;
  workspaceName: string;
  inviteLink: string;
}): Promise<void> {
  const from = process.env.RESEND_FROM_EMAIL ?? "noreply@arqtech.app";
  const resend = getResend();
  await resend.emails.send({
    from,
    to: params.to,
    subject: `Convite para o workspace ${params.workspaceName} — ArqTech`,
    html: `
      <p>Você foi convidado para participar do workspace <strong>${params.workspaceName}</strong> no ArqTech.</p>
      <p><a href="${params.inviteLink}">Aceitar convite</a></p>
    `,
  });
}
