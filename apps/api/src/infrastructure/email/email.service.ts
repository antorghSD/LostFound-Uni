import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!env.SMTP_USER || !env.SMTP_PASS) {
    logger.warn('SMTP credentials missing — email disabled');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return transporter;
};

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async ({ to, subject, html, text }: SendEmailOptions) => {
  const t = getTransporter();

  if (!t) {
    logger.warn({ to, subject }, 'Email skipped — no transporter');
    return { success: false, error: 'Email not configured' };
  }

  try {
    const info = await t.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
    });

    logger.info({ messageId: info.messageId, to, subject }, 'Email sent');
    return { success: true, messageId: info.messageId };
  } catch (e: any) {
    logger.error({ err: e.message, to, subject }, 'Email send failed');
    return { success: false, error: e.message };
  }
};

export const verifyEmailConnection = async () => {
  const t = getTransporter();
  if (!t) {
    logger.warn('⚠️  Email not configured — skipping verification');
    return;
  }

  try {
    await t.verify();
    logger.info('✅ SMTP connection verified');
  } catch (e: any) {
    logger.error({ err: e.message }, '❌ SMTP verification failed');
  }
};