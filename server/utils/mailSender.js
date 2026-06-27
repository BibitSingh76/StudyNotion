const nodemailer = require("nodemailer");

const parseSender = (from) => {
    const fallbackEmail = process.env.MAIL_USER || 'no-reply@example.com';
    const sender = from || `StudyNotion <${fallbackEmail}>`;
    const match = sender.match(/^(.*)<(.+)>$/);

    if (!match) {
        return { name: 'StudyNotion', email: sender.trim() };
    }

    return {
        name: match[1].trim() || 'StudyNotion',
        email: match[2].trim(),
    };
};

const sendWithBrevoApi = async (email, title, body) => {
    const sender = parseSender(process.env.MAIL_FROM);
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            sender,
            to: [{ email }],
            subject: title,
            htmlContent: body,
        }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const message = data.message || data.code || `Brevo API failed with status ${response.status}`;
        throw new Error(message);
    }

    console.log('Mail sent with Brevo API:', data.messageId);
    return data;
};

const sendWithSmtp = async (email, title, body) => {
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT, 10) : 587,
        secure: process.env.MAIL_SECURE === 'true',
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    const info = await transporter.sendMail({
        from: process.env.MAIL_FROM || `StudyNotion <${process.env.MAIL_USER || 'no-reply@example.com'}>`,
        to: email,
        subject: title,
        html: body,
    });

    console.log('Mail sent with SMTP:', info.messageId);
    return info;
};

// mailSender function
const mailSender = async (email, title, body) => {
    try {
        if (process.env.BREVO_API_KEY) {
            try {
                return await sendWithBrevoApi(email, title, body);
            } catch (brevoError) {
                console.warn('Brevo mail send failed, falling back to SMTP:', brevoError.message);
            }
        }

        if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
            throw new Error('Mail service is not configured');
        }

        return await sendWithSmtp(email, title, body);
    } catch (error) {
        console.log('mailSender error:', error.message);
        throw error;
    }
};

module.exports = mailSender;
