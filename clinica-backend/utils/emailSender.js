import nodemailer from 'nodemailer';
import config from '../config/config.js';

export const sendEmail = async (options) => {
    // Configuración del transportador (ejemplo con Gmail o Mailtrap)
    // Deberías configurar estas variables en tu .env
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
        port: process.env.EMAIL_PORT || 2525,
        auth: {
            user: process.env.EMAIL_USER || '',
            pass: process.env.EMAIL_PASS || '',
        },
    });

    const mailOptions = {
        from: `"Sistema Clínica" <noreply@clinica.com>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    await transporter.sendMail(mailOptions);
};
