import nodemailer from 'nodemailer';
import config from '../config/config.js';

let transporter;

/** Transporter reutilizable (se crea una sola vez, de forma perezosa). */
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      auth: { user: config.email.user, pass: config.email.pass }
    });
  }
  return transporter;
};

/**
 * Envía un correo electrónico.
 * @param {{ email: string, subject: string, message: string, html?: string }} options
 */
export const sendEmail = async ({ email, subject, message, html }) => {
  await getTransporter().sendMail({
    from: config.email.from,
    to: email,
    subject,
    text: message,
    html
  });
};
