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
  continuationUrl?: string;
}) {
  const name = escapeHtml(input.fullName);
  const program = escapeHtml(input.program);
  const continuationUrl = input.continuationUrl ? escapeHtml(input.continuationUrl) : undefined;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.6;">
      <h2 style="color: #0f172a; margin-bottom: 16px;">Your Syma Tech application has been received</h2>
      <p>Hi ${name},</p>
      <p>Thank you for applying to Syma Tech Solutions.</p>
      <p>We have received your application for <strong>${program}</strong>.</p>
      ${
        continuationUrl
          ? `
      <p style="margin-top: 20px;">To continue your registration and create your student profile, use the button below:</p>
      <div style="margin: 28px 0;">
        <a href="${continuationUrl}" style="background-color: #0284c7; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px;">
          Continue Registration
        </a>
      </div>
      <p style="font-size: 13px; color: #64748b;">
        This link is unique to your application and will expire after 48 hours.<br />
        If you did not submit this application, you can safely ignore this email.
      </p>
      `
          : `<p>Our team will review your submission and follow up with the next steps.</p>`
      }
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0 20px;" />
      <p style="font-size: 13px; color: #94a3b8;">Syma Tech Solutions — Health &amp; Research Intelligence</p>
    </div>
  `;

  const text = continuationUrl
    ? `Hi ${input.fullName},\n\nThank you for applying to Syma Tech Solutions. We have received your application for ${input.program}.\n\nTo continue your registration and create your student profile, visit the link below:\n${input.continuationUrl}\n\nThis link is unique to your application and will expire after 48 hours. If you did not submit this application, you can safely ignore this email.\n\nSyma Tech Solutions`
    : `Hi ${input.fullName},\n\nThank you for applying to Syma Tech Solutions. We have received your application for ${input.program}.\n\nOur team will review your submission and follow up with the next steps.\n\nSyma Tech Solutions`;

  return sendTransactionalEmail({
    to: input.email,
    subject: 'Your Syma Tech application has been received',
    html,
    text,
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
