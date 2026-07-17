type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

const RESEND_API_URL = 'https://api.resend.com/emails';

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL || 'Syma Tech Solutions <onboarding@resend.dev>';

  if (!apiKey) {
    return null;
  }

  return { apiKey, from };
}

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendEmailInput) {
  const config = getEmailConfig();

  if (!config) {
    console.warn('Skipping email because RESEND_API_KEY is not configured.');
    return { skipped: true };
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.from,
      to,
      subject,
      html,
      text,
      reply_to: replyTo,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || 'Unable to send email.');
  }

  return payload;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendEnrollmentConfirmation(input: {
  fullName: string;
  email: string;
  program: string;
}) {
  const name = escapeHtml(input.fullName);
  const program = escapeHtml(input.program);

  return sendTransactionalEmail({
    to: input.email,
    subject: 'Your Syma Tech application has been received',
    html: `
      <p>Hello ${name},</p>
      <p>Thank you for applying to Syma Tech Solutions.</p>
      <p>We have received your application for <strong>${program}</strong>. If your selected program requires payment, you will be directed to complete payment securely through Paystack.</p>
      <p>Our team will review your submission and follow up with the next steps.</p>
      <p>Syma Tech Solutions</p>
    `,
    text: `Hello ${input.fullName},\n\nThank you for applying to Syma Tech Solutions. We have received your application for ${input.program}. If your selected program requires payment, you will be directed to complete payment securely through Paystack.\n\nOur team will review your submission and follow up with the next steps.\n\nSyma Tech Solutions`,
  });
}

export async function sendConsultationConfirmation(input: {
  fullName: string;
  email: string;
  consultationType: string;
}) {
  const name = escapeHtml(input.fullName);
  const consultationType = escapeHtml(input.consultationType);

  return sendTransactionalEmail({
    to: input.email,
    subject: 'Your Syma Tech consultation request has been received',
    html: `
      <p>Hello ${name},</p>
      <p>Thank you for requesting a consultation with Syma Tech Solutions.</p>
      <p>We have received your request for <strong>${consultationType}</strong>. Our team will review your details and contact you with the next step.</p>
      <p>Syma Tech Solutions</p>
    `,
    text: `Hello ${input.fullName},\n\nThank you for requesting a consultation with Syma Tech Solutions. We have received your request for ${input.consultationType}. Our team will review your details and contact you with the next step.\n\nSyma Tech Solutions`,
  });
}

export async function sendContactConfirmation(input: {
  name: string;
  email: string;
  subject: string;
}) {
  const name = escapeHtml(input.name);
  const subject = escapeHtml(input.subject);

  return sendTransactionalEmail({
    to: input.email,
    subject: 'Syma Tech Solutions received your message',
    html: `
      <p>Hello ${name},</p>
      <p>Thank you for contacting Syma Tech Solutions.</p>
      <p>We have received your message about <strong>${subject}</strong>. Our team will reply as soon as possible.</p>
      <p>Syma Tech Solutions</p>
    `,
    text: `Hello ${input.name},\n\nThank you for contacting Syma Tech Solutions. We have received your message about ${input.subject}. Our team will reply as soon as possible.\n\nSyma Tech Solutions`,
    replyTo: process.env.SYMA_REPLY_TO_EMAIL,
  });
}

