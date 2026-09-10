export type EmailResult = {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
};

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

function getEmailConfig() {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim() || 'symatechsolutions@gmail.com';
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || 'Syma Tech Solutions';

  if (!apiKey) {
    return null;
  }

  return { apiKey, senderEmail, senderName };
}

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendEmailInput): Promise<EmailResult> {
  const trimmedTo = to?.trim();
  if (!trimmedTo || !trimmedTo.includes('@')) {
    console.error('Email provider request failed. Provider: Brevo. Reason: Invalid or missing recipient email address.');
    return {
      success: false,
      error: 'Invalid recipient email address.',
    };
  }

  const config = getEmailConfig();

  if (!config) {
    console.warn('Email skipped. Provider: Brevo. Reason: BREVO_API_KEY is not configured in environment.');
    return {
      success: false,
      skipped: true,
      error: 'Email service is not configured.',
    };
  }

  const payload: {
    sender: { name: string; email: string };
    to: { email: string }[];
    subject: string;
    htmlContent: string;
    textContent: string;
    replyTo?: { email: string };
  } = {
    sender: {
      name: config.senderName,
      email: config.senderEmail,
    },
    to: [
      {
        email: trimmedTo,
      },
    ],
    subject,
    htmlContent: html,
    textContent: text,
  };

  const trimmedReplyTo = replyTo?.trim();
  if (trimmedReplyTo) {
    payload.replyTo = {
      email: trimmedReplyTo,
    };
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': config.apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    let data: Record<string, unknown> = {};
    const rawText = await response.text();
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      data = { message: rawText || `HTTP ${response.status} ${response.statusText}` };
    }

    if (!response.ok) {
      const reason = typeof data?.message === 'string' ? data.message : `HTTP ${response.status} ${response.statusText}`;
      console.error(`Email provider request failed. Provider: Brevo. Status: ${response.status}. Reason: ${reason}`);
      return {
        success: false,
        error: reason,
      };
    }

    const messageId = typeof data?.messageId === 'string' ? data.messageId : undefined;
    console.log(`Email accepted by provider. Provider: Brevo. MessageId: ${messageId || 'acknowledged'}`);

    return {
      success: true,
      messageId,
    };
  } catch (err) {
    const error = err as Error;
    console.error(`Email provider request failed. Provider: Brevo. Reason: ${error.message || 'Network failure'}`);
    return {
      success: false,
      error: error.message || 'Network failure contacting email provider.',
    };
  }
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
      <p>Hi ${name},</p>
      <p>Thank you for applying to Syma Tech Solutions.</p>
      <p>We have received your application for <strong>${program}</strong>.</p>
      <p>Our team will review your submission and follow up with the next steps.</p>
      <p>Syma Tech Solutions</p>
    `,
    text: `Hi ${input.fullName},\n\nThank you for applying to Syma Tech Solutions. We have received your application for ${input.program}.\n\nOur team will review your submission and follow up with the next steps.\n\nSyma Tech Solutions`,
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
      <p>Hi ${name},</p>
      <p>Thank you for requesting a consultation with Syma Tech Solutions.</p>
      <p>We have received your request for <strong>${consultationType}</strong>. Our team will review your details and contact you with the next step.</p>
      <p>Syma Tech Solutions</p>
    `,
    text: `Hi ${input.fullName},\n\nThank you for requesting a consultation with Syma Tech Solutions. We have received your request for ${input.consultationType}. Our team will review your details and contact you with the next step.\n\nSyma Tech Solutions`,
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
      <p>Hi ${name},</p>
      <p>Thank you for contacting Syma Tech Solutions.</p>
      <p>We have received your message about <strong>${subject}</strong>. Our team will reply as soon as possible.</p>
      <p>Syma Tech Solutions</p>
    `,
    text: `Hi ${input.name},\n\nThank you for contacting Syma Tech Solutions. We have received your message about ${input.subject}. Our team will reply as soon as possible.\n\nSyma Tech Solutions`,
    replyTo: process.env.SYMA_REPLY_TO_EMAIL,
  });
}
